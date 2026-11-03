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
  WorkedExample,
} from "@/components/concept/Treatments";
import { CenteringAnimation } from "@/components/widgets/CenteringAnimation";
import { CompressionControl } from "@/components/widgets/CompressionControl";
import { CoordinateChange } from "@/components/widgets/CoordinateChange";
import { CovarianceBuilder } from "@/components/widgets/CovarianceBuilder";
import { CurvedPattern } from "@/components/widgets/CurvedPattern";
import { LinkedMeasurements } from "@/components/widgets/LinkedMeasurements";
import { MeasurementCorrelations } from "@/components/widgets/MeasurementCorrelations";
import { OutlierInfluence } from "@/components/widgets/OutlierInfluence";
import { PcaPlayground } from "@/components/widgets/PcaPlayground";
import { PredictiveDirection } from "@/components/widgets/PredictiveDirection";
import { ProjectionExplorer } from "@/components/widgets/ProjectionExplorer";
import { RegressionVersusPca } from "@/components/widgets/RegressionVersusPca";
import { SignFlip } from "@/components/widgets/SignFlip";
import { StandardizedComparison } from "@/components/widgets/StandardizedComparison";
import { UnitToggle } from "@/components/widgets/UnitToggle";

export const metadata: Metadata = {
  title: "Principal Component Analysis · Perceptron Lab",
  description:
    "Measurements that vary together can repeat information. Principal component analysis finds directions that preserve the greatest variation, giving us a smaller set of coordinates with a measurable loss of detail.",
};

const link = "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function PcaPage() {
  return (
    <ConceptPage
      lessonId="pca"
      intuition={lessonIntuitions["pca"]}
      technicalStart="Part 3. Viewing the Cloud Along One Direction"
      openingTitle="Two Measurements, Much of the Same Information"
      playgroundTitle="Find the direction in which the observations vary most"
      playgroundIntro="Rotate the projection direction and compare the spread of the projected points. Then inspect the gap between each original point and its reconstruction."
      title="Principal Component Analysis"
      tagline={"Measurements that vary together can repeat information. Principal component analysis finds directions that preserve the greatest variation, giving us a smaller set of coordinates with a measurable loss of detail."}
      prerequisites={
        <>
          This page is where two primers cash their promises, the{" "}
          <Link href="/primers/statistics" className={link}>
            statistics primer
          </Link>
          &rsquo;s variance and covariance, and the{" "}
          <Link href="/primers/linear-algebra" className={link}>
            linear algebra primer
          </Link>
          &rsquo;s directions a matrix only stretches. Both are load-bearing
          here, though the page reaches the matrix late on purpose. Before
          any of that, you should be able to turn a direction through a
          cloud and watch the spread along it change.
        </>
      }

      playground={<PcaPlayground />}
      sections={[
        {
          title: "Part 1. Redundant Measurements",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Several measurements, shared information">
                <p>
                  Start with two features and eleven people. Shorter people
                  tend to be lighter, taller people heavier, and around that
                  overall relationship there is variation, someone heavy for
                  their height, someone light. Each feature has its own
                  number line, and the scatter is what you get by pairing
                  them.
                </p>
                <LinkedMeasurements />
                <p>
                  How much new information does weight add once we know height? In this group, the two measurements share a pattern: taller people tend to be heavier. A combined measure of size could describe much of that pattern. We would still need another measurement to describe differences such as being heavier or lighter than expected for one&apos;s height.
                </p>
                <p>As more measurements are recorded, several can share a pattern of variation while retaining differences of their own. A shorter representation is useful when it preserves the distinctions relevant to our question. The amount of retained variation gives us one way to evaluate that reduction.</p>
                <MeasurementCorrelations />
                <KeepInMind>
                  Two measured features can contain both shared information
                  and information unique to each. A dataset can have many
                  columns without having equally many independent directions
                  of variation, and the number of columns can exceed the
                  number of major patterns along which the observations
                  differ.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Features versus directions">
                <p>The original features give us a height axis and a weight axis. A direction is a weighted combination of those coordinates. One direction increases height and weight together; another increases height while decreasing weight. Rotate the arrow to try other combinations. Each unit direction defines a new axis along which we can measure the observations.</p>
                <ProjectionExplorer panels={[]} initialAngle={30} />
                <KeepInMind>
                  A direction through feature space combines several
                  original measurements into one new axis. The features are
                  the axes we were given; the directions are the axes we can
                  choose.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        { id: "part-2-centre-the-data",
          title: "Part 2. Center the Data",
          content: (
            <>
              <SubSection title="3. The mean point">
                <p>
                  The first move is to find the middle of the cloud. For two
                  features it is the pair of means, and for the four people
                  the page works by hand it is a clean number.
                </p>
                <Equation>{"mean point = (mean height, mean weight) = (170, 68)"}</Equation>
                <p>

                  Every person is then some horizontal distance and some
                  vertical distance from that point, which the next widget
                  draws as two dashed legs. The mean is the coordinate-wise
                  center of the observations, and it is the pivot everything
                  that follows turns about.
                </p>
              </SubSection>

              <SubSection title="4. Centering the cloud" id="4-centring-the-cloud">
                <p>
                  Subtract the mean point from every person and each one
                  becomes a deviation, the pair of legs with the pivot moved
                  to the origin.
                </p>
                <Equation>{"dᵢ = xᵢ − x̄"}</Equation>
                <NumberTable
                  headings={["person", "measured", "deviation"]}
                  rows={[
                    ["1", "(180, 78)", "(10, 10)"],
                    ["2", "(160, 58)", "(−10, −10)"],
                    ["3", "(175, 63)", "(5, −5)"],
                    ["4", "(165, 73)", "(−5, 5)"],
                  ]}
                />
                <CenteringAnimation />
                <p>

                  Why bother? Because the method is about to measure spread
                  along directions, and without centering, a direction can
                  look important just because the whole cloud sits far from
                  the origin. Untick the switch below and the scores along
                  the arrow stop being deviations and start being positions,
                  and the mean of their squares balloons from a measure of
                  spread into a measure of where the cloud is.
                </p>
                <ProjectionExplorer panels={["centre"]} initialAngle={45} people="worked" />
                <InAModel title="On the four height and weight measurements at 45 degrees">
                  <p>

                    Centered, the four scores have mean 0, the mean of their
                    squares is 100, and so is their variance. Uncentered, the
                    scores have mean 168.3, the mean of their squares is
                    28,422, and their variance about their own mean is still
                    100. The number that changed is location. The number the
                    method wants did not.
                  </p>
                </InAModel>
                <KeepInMind>

                  Centering relocates the cloud around the origin without
                  changing its shape, its orientation or any distance between
                  observations. Conventional PCA requires it, so that the
                  directions it finds describe how observations vary around
                  their average rather than how far they sit from an
                  arbitrary origin.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Viewing the Cloud Along One Direction",
          content: (
            <>
              <SubSection title="5. Projecting onto one direction">
                <p>

                  Choose a unit direction u. For each centered person, drop a
                  perpendicular onto the line through the origin in that
                  direction, mark where it lands, and read off the signed
                  distance of the landing point from the origin. That one
                  number is the person&rsquo;s score along u, and it is a
                  dot product.
                </p>
                <Equation>{"scoreᵢ = dᵢ · u"}</Equation>
                <ProjectionExplorer panels={["scores"]} initialAngle={30} people="worked" />
                <KeepInMind>
                  Projection replaces an observation&rsquo;s several
                  coordinates with its position along one chosen direction.
                  The number line under the cloud is the whole dataset seen
                  from that direction.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Measuring projected variance">
                <p>
                  Two things about the scores. First, u has to be a unit
                  vector. Let the arrow grow and every score grows with it,
                  so the apparent spread along a direction could be made as
                  large as you like by stretching the arrow rather than by
                  choosing a better direction. Fixing u · u = 1 makes the
                  comparison between directions a comparison between
                  directions.
                </p>
                <ProjectionExplorer panels={["length"]} initialAngle={45} people="worked" />
                <p>

                  Second, because the cloud is centered, the scores are
                  centered too, and their variance is simply the mean of
                  their squares.
                </p>
                <Equation>{"variance along u = mean of (dᵢ · u)²"}</Equation>
                <KeepInMind>
                  Restricting u to unit length ensures the method compares
                  directions rather than arbitrary vector scales, and every
                  candidate direction then produces a one-dimensional
                  dataset with its own amount of spread.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. Rotating through candidate directions">
                <p>Rotate the direction and watch the projected observations move closer together or farther apart. The curve beneath the cloud records their variance through a half turn. For these four observations, its peak and trough occur a quarter turn apart.</p>
                <ProjectionExplorer panels={["scores", "sweep"]} initialAngle={10} people="worked" />
                <KeepInMind>
                  For these observations, one axis gives the greatest projected variance. Reversing its arrow gives the same variance. Later we will consider tied directions, where more than one axis can be equally good.</KeepInMind>
              </SubSection>

              <SubSection title="8. The first principal component">
                <p>The first principal component is the unit direction along which the centered observations have the greatest variance. It is chosen from the observations, rather than being fixed to either original measurement axis. The activity shows that direction and lets us compare it with other orientations.</p>
                <KeepInMind>
                  The first principal component is the unit direction of
                  maximum projected variance. Nothing about a target, a
                  prediction or a meaning has entered yet, and nothing will.
                  PCA is unsupervised.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. What the First Component Represents",
          content: (
            <>
              <SubSection title="9. Component loadings and scores">
                <p>

                  At 45 degrees the direction is u₁ = (0.71, 0.71), and a
                  person&rsquo;s score along it is a weighted sum of their
                  centered features.
                </p>
                <Equation>{"score = 0.71 × centered height + 0.71 × centered weight"}</Equation>
                <p>

                  Both features contribute positively, and the equal
                  coefficients mean a unit of movement in either contributes
                  the same, after centering. The coefficients that define the
                  direction are called the loadings, and the widget builds
                  one person&rsquo;s score from them, the height part in
                  indigo, the weight part in amber, and their sum.
                </p>
                <ProjectionExplorer panels={["contribution"]} initialAngle={45} people="worked" />
                <WorkedExample title="Person 1 on the four height and weight measurements">
                  <>
                    <p>

                      The first person’s centered measurements are (10, 10). At
                      forty-five degrees, both direction coordinates equal the
                      reciprocal square root of two. Multiply each measurement by its
                      direction coordinate and add.
                    </p>
                    <Equation>{"height contribution = 10 / √2 ≈ 7.071\nweight contribution = 10 / √2 ≈ 7.071\nperson 1 score = 20 / √2 ≈ 14.142\n\nperson 3 score = 5 / √2 − 5 / √2 = 0"}</Equation>
                    <p>
                      Person 3 lies at (5, −5), so the two contributions cancel. They
                      have the same coordinate as the mean along this direction,
                      although they are separated from it along the perpendicular
                      direction.
                    </p>
                  </>
                </WorkedExample>
                <KeepInMind>
                  A component is a direction in feature space; a component
                  score is an observation&rsquo;s coordinate along it; the
                  loadings are how the original features contribute to that
                  coordinate. Three words for three different things.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Sign ambiguity">
                <p>
                  The direction (0.71, 0.71) and the direction
                  (−0.71, −0.71) describe the same axis, and the method has
                  no reason to prefer one. Flipping the sign reverses every
                  score numerically and changes nothing else. Not the
                  distances between projected people, not the variance, not
                  the reconstructions.
                </p>
                <SignFlip />
                <p>The first component resembles overall body size in this dataset, but PCA found a direction of variation rather than a named concept. We can inspect its loadings and use subject knowledge to decide whether that interpretation fits. Some components combine measurements without a useful everyday label. They can still be described precisely by their loadings.</p>
                <KeepInMind>
                  The sign of a principal component is conventional; the axis
                  is the same either way. And a component is a mathematical
                  combination first and a human interpretation only when the
                  evidence supports one.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. The Second and Later Components",
          content: (
            <>
              <SubSection title="11. Variation left behind">
                <p>
                  Project everyone onto the first component and each person
                  leaves a stub behind, the perpendicular from where they
                  are to where they landed. The green landing points are the
                  variation the first component keeps; the rose stubs are the
                  variation it does not, and the readouts total both.
                </p>
                <ProjectionExplorer panels={["residuals"]} initialAngle={42} />
                <KeepInMind>
                  Keeping one component preserves movement along its axis and
                  discards movement perpendicular to it. On the crowd the
                  stubs are short because almost all of the spread lies along
                  the first axis, 98.97 percent of it.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. The second and later components">
                <p>
                  The second component is chosen the same way with one extra
                  rule. It must be perpendicular to the first, and among the
                  perpendicular directions it must carry as much of the
                  remaining variance as possible. In two dimensions there is
                  only one perpendicular axis left, apart from its sign, so
                  the second component is forced. In higher dimensions the
                  search continues inside the space perpendicular to every
                  component found so far.
                </p>
                <p>
                  The components are ordered by their variances, largest
                  first, so the first captures the most, the second the most
                  of what remains, and so on down. Ties are possible. When
                  two eigenvalues are equal, any direction inside the plane
                  they span carries the same variance and the component
                  directions inside that plane are not uniquely determined.
                </p>
                <Equation>{"λ₁ ≥ λ₂ ≥ … ≥ λₚ"}</Equation>
                <KeepInMind>
                  Later components capture the largest remaining directions
                  of variation while staying perpendicular to earlier ones,
                  and they are ordered by how much they capture.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 5",
          quiz: [
            trueFalse(
              "Centering moves the cloud onto the origin without changing the distance between any two observations.",
              true,
              "Subtracting one fixed point from every observation slides the whole cloud and leaves its shape and orientation alone. On the four people the centered scores have mean 0 and mean square 100, while uncentered the mean square is 28,422; the variance about their own mean is 100 either way, so what centering removed was location rather than spread.",
            ),
            choice(
              "Why must the direction u be restricted to unit length?",
              [
                "Otherwise stretching the arrow raises every score, so a direction could look wide merely by being long",
                "Otherwise the dot product is undefined for vectors of different lengths",
                "Because the covariance matrix only acts on vectors of length one",
                "Because the scores would no longer be centered",
              ],
              0,
              "Each component score is a dot product with the proposed direction. A longer direction vector would multiply every score and inflate its variance without changing the axis. Restricting the vector to unit length removes that arbitrary multiplier, so the optimization compares orientations.",
            ),
            choice(
              "Person 1’s centered measurements are (10, 10) and the first direction at 45 degrees is (0.71, 0.71). What is their score along it?",
              [
                "14.14, the sum of a height contribution of 7.07 and a weight contribution of 7.07",
                "7.07, since each feature contributes 7.07",
                "20, the sum of the two deviations",
                "0, since the two contributions cancel as they do for person 3",
              ],
              0,
              "Multiply each centered measurement by the corresponding direction coordinate and add the products:\n\n```math\nscore = 10 / √2 + 10 / √2 ≈ 14.142\n```\n\nThe two contributions belong to one component score. Person 3 has centered measurements (5, −5), whose contributions cancel along this axis. That person has score zero here but a nonzero score along the perpendicular component.",
            ),
            trueFalse(
              "Replacing the first component (0.71, 0.71) with (−0.71, −0.71) changes the distances between the projected people.",
              false,
              "The two describe the same axis and the method has no reason to prefer either. Flipping the sign reverses every score numerically and changes nothing else, not the distances between projected people, not the variance, not the reconstructions.",
            ),
            several(
              "Which of these are required of the second principal component?",
              [
                "It is perpendicular to the first",
                "Among the perpendicular directions it carries as much of the remaining variance as possible",
                "Its variance is strictly smaller than the first component’s",
                "Once the first axis is chosen, the perpendicular second axis in two dimensions is fixed apart from its sign",
              ],
              [0, 1, 3],
              "The second component is chosen the same way as the first with one extra rule, perpendicularity, and among those directions it takes the most remaining variance. In two dimensions only one perpendicular axis is left, so it is forced. The ordering is λ₁ ≥ λ₂, not a strict inequality; ties are possible, and when two eigenvalues are equal the directions inside the plane they span are not uniquely determined.",
            ),
        ],
        },
        {
          title: "Part 6. The Covariance Matrix",
          content: (
            <>
              <SubSection title="13. Building the covariance matrix">
                <p>

                  Everything so far was done by rotating and measuring. The
                  covariance matrix is what lets the answer be found without
                  the rotation. For centered height and weight it holds three
                  quantities the statistics primer already defined, the
                  variance of each feature and the covariance of the pair,
                  arranged so that each feature&rsquo;s spread sits on the
                  diagonal and their paired movement sits off it. The matrix
                  is symmetric, because the covariance of height with weight
                  is the covariance of weight with height.
                </p>
                <Equation>{"C = [ Var(height)          Cov(height, weight) ]\n    [ Cov(height, weight)  Var(weight)         ]"}</Equation>
                <CovarianceBuilder />
                <KeepInMind>
                  The covariance matrix stores every feature&rsquo;s variance
                  and every feature pair&rsquo;s covariance in one object.
                  Nothing in it is new; the arrangement is.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. What the covariance matrix does to directions">
                <p>
                  A matrix is also something that acts on a direction. Pick
                  a unit vector u and compute Cu. For most directions Cu
                  points somewhere else, turned away from u. For a few
                  special directions Cu stays on the same axis as u, only
                  longer or shorter, and those directions satisfy the
                  eigenvector equation.
                </p>
                <Equation>{"C u = λ u"}</Equation>
                <ProjectionExplorer panels={["transform"]} initialAngle={0} people="worked" />
                <InAModel title="On the four height and weight measurements">
                  <>
                    <p>
                      At zero degrees, the covariance transformation changes the
                      direction of the input arrow. At forty-five degrees, it only
                      scales the arrow.
                    </p>
                    <Equation>{"at 0°:  u = (1, 0)\n        Cu = (62.5, 37.5)\n\nat 45°: u = (1/√2, 1/√2)\n        Cu = 100u ≈ (70.7, 70.7)"}</Equation>
                    <p>
                      Turn the slider and watch the transformed arrow line up with the
                      original at forty-five degrees. They also share an axis at 135
                      degrees, where the scaling factor is twenty-five.
                    </p>
                  </>
                </InAModel>
                <KeepInMind>
                  The covariance matrix&rsquo;s eigenvectors are the
                  directions it scales without turning, and the scaling
                  factor is the eigenvalue.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Eigenvectors as principal directions">
                <p>
                  Now the two halves meet. The direction the variance sweep
                  found by rotating, 45 degrees on the four height and weight measurements, is the
                  direction the covariance matrix scales without turning, and
                  the variance it reached, 100, is the scaling factor. That
                  is not a coincidence, and section 29 proves it. The
                  eigenvectors of C are the principal component directions,
                  their eigenvalues are the variances along them, and sorting
                  the eigenvalues sorts the components by explained variance.
                </p>
                <KeepInMind>
                  The geometric variance search and the covariance
                  matrix&rsquo;s eigenvectors identify the same directions.
                  One is a picture of the answer and the other is a way to
                  compute it.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Work the Four-Person Example",
          content: (
            <>
              <SubSection title="16. Project four height and weight measurements" id="16-the-four-person-worked-example">
                <p>
                  The mean is (170, 68) and the deviations are (10, 10),
                  (−10, −10), (5, −5) and (−5, 5), as the table in section 4
                  had them. Section 13&rsquo;s builder is the same four
                  people, and clicking a row there finds them in the plot.
                  From the deviations, build the three sums.
                </p>
                <Equation>{"Σ (height deviation)²                        = 100 + 100 + 25 + 25 = 250\nΣ (weight deviation)²                        = 100 + 100 + 25 + 25 = 250\nΣ (height deviation)(weight deviation)       = 100 + 100 − 25 − 25 = 150"}</Equation>
              </SubSection>

              <SubSection title="17. Scatter matrix versus covariance matrix">
                <p>
                  Arranged as a matrix, those sums are the scatter matrix,
                  which is the covariance totals before any divisor.
                </p>
                <Equation>{"S = [ 250  150 ]\n    [ 150  250 ]"}</Equation>
                <p>
                  Divide by the number of people, 4, for the population
                  covariance, or by 3 for the sample covariance. The choice
                  scales every eigenvalue by the same factor and changes
                  neither the eigenvectors nor the shares.
                </p>
                <Equation>{"C = [ 62.5  37.5 ]        C_sample = [ 83.33  50.00 ]\n    [ 37.5  62.5 ]                   [ 50.00  83.33 ]"}</Equation>
                <p>
                  Check the directions on the scatter matrix, where the
                  numbers stay whole, by feeding candidates through it.
                </p>
                <Equation>{"S (1, 1)  = (250 + 150,  150 + 250) = (400, 400)  = 400 · (1, 1)\nS (1, −1) = (250 − 150,  150 − 250) = (100, −100) = 100 · (1, −1)"}</Equation>
                <p>

                  Both come back unturned, so the components run along
                  (1, 1) and (1, −1), normalized to u₁ = (0.707, 0.707) and
                  u₂ = (0.707, −0.707), with scatter eigenvalues 400 and 100.
                  On the population covariance the same directions come back
                  with eigenvalues 100 and 25, which are actual variances,
                  and 100 is the number the sweep in section 7 peaked at.
                </p>
                <InAModel title="Which convention the readouts use">
                  <>
                    <p>
                      The playground reports sample variances, while the calculation
                      above describes population variances. With four people, changing
                      the divisor from four to three multiplies both variances by the
                      same factor.
                    </p>
                    <Equation>{"first sample variance = 100 × 4/3 ≈ 133.3\nsecond sample variance = 25 × 4/3 ≈ 33.3"}</Equation>
                    <p>
                      The directions and explained-variance shares stay the same.
                    </p>
                  </>
                </InAModel>
                <KeepInMind>
                  The direction is the same whether the scatter or the
                  covariance matrix is used, and the eigenvalue&rsquo;s scale
                  is the divisor&rsquo;s. Name the matrix you are using.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. Explained-variance ratios">
                <p>
                  Each component&rsquo;s share is its eigenvalue over the
                  total, and the divisor cancels in the ratio.
                </p>
                <Equation>{"share of component 1 = 400 / 500 = 100 / 125 = 0.8\nshare of component 2 = 100 / 500 =  25 / 125 = 0.2"}</Equation>
                <KeepInMind>
                  Changing the covariance divisor rescales every component variance by the same factor, leaving the variance shares unchanged. In this four-person example, the diagonal direction representing height and weight increasing together retains eighty percent of the total numerical variance.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 8. Component Scores",
          content: (
            <>
              <SubSection title="19. Transforming observations into component coordinates">
                <p>
                  Person 1 has deviation d = (10, 10). Their two scores are
                  two dot products.
                </p>
                <Equation>{"s₁ = d · u₁ = (10, 10) · (0.707, 0.707)  = 14.14\ns₂ = d · u₂ = (10, 10) · (0.707, −0.707) = 0"}</Equation>
                <p>

                  They lie entirely along the first component, and their
                  second coordinate is zero. Person 3, at (5, −5), scores 0
                  on the first and 7.07 on the second, the mirror case. The
                  transform does this for everyone at once. With the
                  centered rows stacked into a matrix X and the component
                  directions as the columns of W, the scores are one
                  product, and the widget writes it out for whichever person
                  is selected.
                </p>
                <Equation>{"Z = X W"}</Equation>
                <CoordinateChange />
                <KeepInMind>
                  PCA gives each observation coordinates along the principal-component directions. We apply those same projections to every row, allowing us to represent the data in the new coordinate system or keep a smaller set of components.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 9. Keeping Fewer Dimensions",
          content: (
            <>
              <SubSection title="20. Keeping fewer components">
                <p>Keep only the first score and each person is represented by one number instead of two. Representing observations with fewer coordinates is dimensionality reduction. It can reduce storage and later computation, provided the omitted directions are not needed for the task. Use the flatten toggle to see the one-component reconstruction.</p>
                <p>

                  One number per person is not the whole of what has to be
                  stored, though. To do anything with those numbers later
                  you also need the original feature means, the feature
                  scales if standardization was used, and the retained
                  component direction. The scores are meaningless without
                  the axis they are measured along.
                </p>
                <KeepInMind>
                  Dimensionality reduction represents each observation with
                  fewer component coordinates, and the fit that produced them
                  travels with them.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. Reconstructing approximate observations">
                <p>
                  Going back is two steps. Scale the retained direction by
                  the score, then add the mean back.
                </p>
                <Equation>{"d̂ = s₁ u₁\nx̂ = x̄ + d̂"}</Equation>
                <p>

                  On the playground the green dots are exactly this, each
                  person rebuilt from one number, with a dashed stub to
                  where they really were. If standardization was used, the
                  scaling is reversed as well, in the opposite order it was
                  applied.
                </p>
                <KeepInMind>
                  Reconstruction maps retained component scores back into an
                  approximation of the original feature space.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. Reconstruction error">
                <p>The perpendicular segment connects each observation to its reconstruction. PCA measures the loss using the squared length of that segment, in the feature coordinates chosen for the analysis.</p>
                <Equation>{"errorᵢ = ‖xᵢ − x̂ᵢ‖²           total = Σᵢ ‖xᵢ − x̂ᵢ‖²"}</Equation>
                <>
<p>

                  Now rotate the retained direction instead of accepting the first component, and watch the total. The widget in section 11 is the same instrument, and its discarded readout is this total. It is smallest at the first component, because for centered data the direction that keeps the most variance and the direction that leaves the smallest squared stubs are the same direction.
                </p>
                <p>
                  Pythagoras is why. Each person&rsquo;s squared distance from the mean splits into a squared score plus a squared stub, and the distances do not depend on the direction, so making the scores as large as possible makes the stubs as small as possible.
                </p>
</>
                <Equation>{"‖dᵢ‖² = (dᵢ · u)² + stubᵢ²"}</Equation>
                <InAModel title="On the four height and weight measurements">
                  <p>
                    The total squared deviation is 500. At 45 degrees the
                    squared scores total 400 and the squared stubs 100, and
                    the two together are 500 at every angle. Keeping the
                    first component retains the scatter eigenvalue 400 and
                    discards the eigenvalue 100, so the reconstruction error
                    is tied to the discarded eigenvalue under whichever
                    divisor is in use.
                  </p>
                </InAModel>
                <KeepInMind>

                  Maximizing retained projected variance and minimizing
                  squared reconstruction error lead to the same first
                  component, and the discarded components quantify exactly
                  the variation unavailable to a reconstruction from the
                  retained ones.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 10. Choosing How Many Components to Keep",
          content: (
            <>
              <SubSection title="23. Choosing the number of components">
                <p>
                  With two features the choice is one component or two. The
                  five-measurement dataset from section 1 makes it a real
                  decision. Each component&rsquo;s explained ratio is its
                  eigenvalue over the total, and the cumulative ratio through
                  m components is their running sum.
                </p>
                <Equation>{"rⱼ = λⱼ / Σₖ λₖ            Rₘ = Σⱼ₌₁ᵐ rⱼ"}</Equation>
                <CompressionControl />
                <p>

                  The first component alone carries 78.2 percent of the
                  standardized variance, two carry 87.2, three 94.4, four
                  99.0, and the reconstruction error falls from 65.3 to 38.5
                  to 16.8 to 2.9 to nothing. Keeping 95 percent is a common
                  rule of thumb and not a law. The right count depends on
                  what the reduced representation is for. A low-variance
                  direction may carry the information a downstream task
                  needs, and reconstruction quality and predictive
                  performance answer different questions.
                </p>
                <KeepInMind>
                  Cumulative explained variance reports how much total
                  variance survives a chosen number of components, and the
                  number should be chosen according to what the reduced
                  representation must preserve. PCA trades representation
                  size against the variation that can be reconstructed.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 11. Scale and Units",
          content: (
            <>
              <SubSection title="24. Covariance PCA versus standardized PCA" id="24-covariance-pca-versus-standardised-pca">
                <p>

                  The crowd&rsquo;s heights are in centimeters. Write them
                  in meters or in millimeters and nothing about the people
                  changes, but the numbers do, and the covariance matrix is
                  built from the numbers.
                </p>
                <UnitToggle />
                <p>In millimeters the height variance is 52,178, compared with weight variance of 431. The first component is (−0.996, −0.089), almost parallel to the height axis, and retains 99.97 percent of the total variance. In meters, height variance is 0.05 and the first component is (0.011, 1.000), almost parallel to the weight axis, retaining nearly all the variance. The people are unchanged, but the numerical scales change which direction retains the most variation.</p>
                <p>

                  The usual repair is to standardize each feature first,
                  dividing its deviations by its own standard deviation, so
                  every feature starts with variance one. PCA on
                  standardized features is PCA on the correlation matrix
                  rather than the covariance matrix, and the question it
                  answers changes from how the features vary together in
                  their units to how they vary together relative to their
                  own scales.
                </p>
                <Equation>{"zᵢⱼ = (xᵢⱼ − x̄ⱼ) / sⱼ"}</Equation>
                <StandardizedComparison />
                <p>

                  Whether to standardize is a modeling choice, not a rule.
                  Raw covariance PCA is the right instrument when the
                  features share comparable units, when absolute variance
                  means something, and when a feature that varies more
                  should count for more. Standardized PCA is the right one
                  when units differ, when relative variation is what matters,
                  and when no feature should dominate merely because of its
                  measurement scale.
                </p>
                <KeepInMind>

                  Choosing whether to standardize determines what kind of
                  variation PCA treats as important. Centering is required;
                  scaling is a decision.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 6 to 11",
          quiz: [
            choice(
              "What distinguishes the eigenvectors of the covariance matrix from other directions?",
              [
                "The matrix leaves them on the same axis and only scales them",
                "The matrix sends them to zero",
                "They are the original feature axes",
                "They are the directions along which the covariance is zero",
              ],
              0,
              "For most directions Cu points somewhere else, turned away from u. For a few the result stays on the same axis, longer or shorter, and the scaling factor is the eigenvalue. On the four people that happens at 45 degrees with factor 100 and at 135 degrees with factor twenty-five, which are the two component directions and the two variances.",
            ),
            trueFalse(
              "Dividing the scatter matrix by 4 rather than by 3 scales both eigenvalues by the same factor and leaves the first component’s direction and its share of 0.8 unchanged.",
              true,
              "Changing from population to sample covariance multiplies every eigenvalue by the same positive factor. The directions and variance shares stay the same. For these four observations:\n\n```math\npopulation variances: 400 / 4 = 100; 100 / 4 = 25\nsample variances: 400 / 3 ≈ 133.3; 100 / 3 ≈ 33.3\nfirst variance share: 400 / (400 + 100) = 0.8\n```\n\nState the divisor when comparing reported variances.",
            ),
            trueFalse(
              "For centered data, maximizing retained variance and minimizing squared perpendicular reconstruction error require a tradeoff between different directions.",
              false,
              "A centered observation decomposes into its projection on the chosen axis and a perpendicular residual. Their squared lengths add to the observation's fixed squared distance from the mean. Maximizing the sum of squared projections therefore minimizes the sum of squared residuals. For the four people, the best first axis retains a total of 400 and leaves reconstruction error 100.",
            ),
            trueFalse(
              "Writing the crowd’s heights in millimeters rather than meters changes which feature the first component is almost entirely made of.",
              true,
              "In millimeters the height variance is 52,178 against weight’s 431, and the first component is (−0.996, −0.089), almost pure height, claiming 99.97 percent. In meters the height variance is 0.05 and the first component is (0.011, 1.000), almost pure weight. Same people, different units, and the covariance matrix is built from the numbers.",
            ),
            several(
              "Which of these does the page say about choosing how many components to keep?",
              [
                "Keeping 95 percent of the variance is a rule of thumb rather than a law",
                "The right count depends on what the reduced representation is for",
                "On the five-measurement dataset the first component alone carries 95 percent of the standardized variance",
                "Reconstruction quality and predictive performance are the same question measured two ways",
              ],
              [0, 1],
              "On the five-measurement dataset the first component carries 78.2 percent of the standardized variance, two carry 87.2, three 94.4 and four 99.0, so a 95 percent rule would keep four, and the page is explicit that the rule is a convention and not a law. A low-variance direction may carry the information a downstream task needs, which is why reconstruction quality and predictive performance answer different questions rather than one question measured two ways.",
            ),
        ],
        },
        {
          title: "Part 12. What PCA Does Not Know",
          content: (
            <>
              <SubSection title="25. High variance versus predictive information">
                <p>
                  PCA never sees a target. It finds directions of greatest
                  variance, and those are not necessarily the directions
                  that matter for a prediction. Here is a cloud built to
                  make the point. Most of its spread runs along height, and
                  the first component follows it, as it must. The two groups
                  in it differ across the short axis, weight for a given
                  height, which is almost exactly what a one-component
                  reduction throws away.
                </p>
                <PredictiveDirection />
                <p>
                  The first component carries 98.5 percent of the variance
                  and the second 1.5 percent. Keep one component and the
                  fourteen people are placed on the first line, where the
                  two groups interleave; the line that separates them
                  cleanly is the one the reduction discarded as almost
                  nothing.
                </p>
                <KeepInMind>
                  The direction containing the most variation is not
                  necessarily the direction most useful for prediction, and
                  a low-variance direction can carry the information a task
                  depends on. PCA cannot know, because it was never told.
                </KeepInMind>
              </SubSection>

              <SubSection title="26. Outlier sensitivity">
                <p>PCA depends on means and squared deviations. An observation far from the others can make a large contribution to these quantities. Add the tall, light person in the widget and inspect how the mean, covariance and component directions change.</p>
                <OutlierInfluence />
                <p>Adding one person to the eleven moves the mean from (151.8, 53.4) to (155.4, 51.4), changes the height-weight covariance from 464 to 349, rotates the first component by 4.6 degrees and changes its share from 0.990 to 0.841. Its contribution to squared spread can be much larger than its fraction of the row count.</p>
                <KeepInMind>
                  Because PCA uses means, squared deviations and covariance,
                  distant observations can strongly influence its
                  components. Look at the cloud before trusting the axes.
                </KeepInMind>
              </SubSection>

              <SubSection title="27. Linear versus curved structure">
                <p>
                  PCA finds linear structure. Twelve people along a curve
                  have a one-dimensional pattern, their position along the
                  curve, and no straight axis follows it. The first component
                  does what it can, which is to lay a line across the curve
                  and fold the two ends onto the same stretch of it.
                </p>
                <CurvedPattern />
                <p>The first component retains 68 percent of the variance in this curved example, and its one-component reconstruction error is 3,316. The crowd example gives error 108. Raw error totals also depend on scale and observation count, so inspect the variance share and the projected picture rather than comparing those totals alone.</p>
                <p>
                  The{" "}
                  <Link href="/concepts/kernel-pca" className={link}>
                    kernel PCA page
                  </Link>{" "}
                  is one answer to a curved pattern. And one more caution
                  belongs here. A component can mix positive loadings,
                  negative loadings and measurements with different meanings,
                  and the mathematics does not care whether the mixture has a
                  name. The loadings show the combination; whether it has a
                  defensible interpretation is domain knowledge&rsquo;s job,
                  and a component can be useful for compression without ever
                  earning a simple real-world label.
                </p>
                <KeepInMind>
                  PCA detects low-dimensional linear structure and may miss
                  curved structure, and its components are not guaranteed to
                  be interpretable.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 13. PCA Versus Regression",
          content: (
            <>
              <SubSection title="28. PCA versus regression">
                <p>

                  The first component through a cloud looks like a
                  regression line and is not one. Regression chooses an
                  outcome, predicts it from the other feature, and minimizes
                  the vertical misses in the picture. PCA treats the features
                  symmetrically after preprocessing, finds a direction
                  through the cloud, and minimizes the perpendicular misses.
                  Different objectives, different lines.
                </p>
                <RegressionVersusPca />
                <p>

                  The third line makes the point twice. Predicting weight
                  from height gives a slope of 0.890; predicting height from
                  weight, drawn on the same axes, gives 0.928; the first
                  component sits between them at 0.907. Reversing which
                  feature is the outcome changes the regression line, because
                  it changes which misses are being minimized, and PCA is
                  not regression without a target. It is a different
                  geometric problem with its own answer.
                </p>
                <KeepInMind>
                  Regression predicts one designated outcome; PCA builds a
                  lower-dimensional representation of the feature cloud. On
                  the same data the two lines genuinely differ.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 14. Formal Derivation",
          content: (
            <>
              <SubSection title="29. Deriving the eigenvector solution">
                <p>We can derive the covariance eigenvector equation from the variance objective. Start by writing the squared projection of a centered observation d onto a unit direction u. Expanding that square exposes the variance and covariance terms.</p>
                <Equation>{"(d · u)² = (d₁u₁ + d₂u₂)² = d₁²u₁² + 2 d₁d₂ u₁u₂ + d₂²u₂²"}</Equation>
                <p>
                  Average over the people and the d sums become the
                  statistics primer&rsquo;s quantities, the two variances on
                  the squared terms and the covariance on the cross term,
                  which is the covariance matrix evaluated on u.
                </p>
                <Equation>{"variance along u = uᵀ C u"}</Equation>
                <p>We want to maximize this variance while keeping the direction vector at unit length. Introduce an auxiliary number, a Lagrange multiplier, to represent that constraint in the expression below. Differentiating gives the equations that a constrained maximum must satisfy.</p>
                <DerivationTable
                  expressionHeading="step"
                  reasonHeading="why"
                  rows={[
                    { expression: "maximise uᵀCu subject to uᵀu = 1", reason: "the constraint is what stops the arrow simply growing" },
                    { expression: "L(u, λ) = uᵀCu − λ(uᵀu − 1)", reason: "one multiplier for one constraint" },
                    { expression: "∂L/∂u = 2Cu − 2λu = 0", reason: "C is symmetric, so the derivative of uᵀCu is 2Cu" },
                    { expression: "Cu = λu", reason: "the eigenvector equation; the best direction is an eigenvector of C" },
                  ]}
                />
                <p>
                  Third, which eigenvector. Multiply the equation by uᵀ on
                  the left and the answer falls out.
                </p>
                <Equation>{"uᵀ C u = λ uᵀ u = λ"}</Equation>
                <p>For a unit-length direction that is an eigenvector of the covariance matrix, the variance of the projected data equals its eigenvalue. The largest eigenvalue therefore identifies a direction with the greatest variance. That direction is the first principal component.</p>
              <p>For the second component, maximize variance while requiring a direction perpendicular to the first. Otherwise we could rediscover the same projection. Continue with directions perpendicular to all those already chosen. A real symmetric covariance matrix admits an orthonormal eigenbasis, so we can choose perpendicular unit-length eigenvectors even when an eigenvalue is repeated.</p>
                <KeepInMind>

                  The constrained variance calculation gives the covariance eigenvector equation. A unit eigenvector has projected variance equal to its eigenvalue. Choosing the largest value gives the first component; restricting later choices to perpendicular directions gives the remaining components.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 15. Computing PCA in Practice",
          content: (
            <>
              <SubSection title="30. Covariance decomposition versus SVD">
                <p>

                  The route the derivation suggests is the one this page has
                  walked. Center the data matrix, optionally standardize its
                  columns, form the covariance matrix, find its eigenvectors
                  and eigenvalues, sort them by decreasing eigenvalue, keep
                  the ones you want, and transform. It matches the concept
                  step for step.
                </p>
                <p>

                  Practical implementations often skip the covariance matrix
                  and decompose the centered data matrix directly.
                </p>
                <Equation>{"X = U Σ Vᵀ"}</Equation>
                <p>
                  The columns of V are the principal directions, the squared
                  singular values give the explained variances up to the
                  divisor, and the scores are XV or, equivalently, UΣ. The
                  singular value decomposition avoids forming XᵀX
                  explicitly, which is better behaved numerically when the
                  features are nearly collinear, and the result is the same
                  PCA. The full derivation of that route belongs to another
                  page.
                </p>
                <KeepInMind>

                  PCA can be computed directly from the centered data matrix
                  without constructing the covariance matrix. The concept is
                  the eigenvector route; the computation is often the SVD.
                </KeepInMind>
              </SubSection>

              <SubSection title="31. Transforming new observations">
                <p>
                  A fitted PCA is a transformation, and a new person goes
                  through the same one the training data went through. Use
                  the training mean, the training standard deviations if
                  scaling was fitted, and the retained training directions.
                  Do not refit for each new observation, because then the
                  coordinates would mean something different every time.
                </p>
                <Equation>{"z_new = (x_new − x̄_training) W"}</Equation>
                <p>

                  The fit here keeps the means and, when it standardized,
                  the standardizer, and its transform matches features by
                  name, so a new observation with its columns in a different
                  order is fine and one with a column missing is refused.
                </p>
                <KeepInMind>
                  The fitted mean, scales and component directions are part
                  of the transformation applied to future observations, and
                  they travel with the scores.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 16. Preserving Component Order, Scaling and Sign Conventions" , id: "part-16-implementation-and-failure-contracts",
          content: (
            <>
              <SubSection title="32. Save the center, directions and projection convention" id="32-implementation-and-failure-contracts">
                <p>If two PCA fits disagree, first compare their preparation of the data. Did they center, scale or do both? Did the covariance use a population or sample divisor, and did the solver decompose that covariance or the data matrix itself?</p>
                <p>Next compare the requested component count, ordering, tolerances and treatment of tied or nearly tied eigenvalues. A sign convention is needed if the output must be deterministic. Report scores, components, reconstructions and explained variances with these choices so a numerical difference can be interpreted.</p>
                <p>
                  Some differences are conventions, while others change the
                  fitted geometry. Changing only the covariance divisor multiplies
                  every variance by the same factor. The component directions and
                  explained-variance shares stay the same, as Part 7 demonstrated.
                </p>
                <p>
                  A component and its negative also describe the same line.
                  Reversing its sign reverses the corresponding scores, but leaves
                  a consistently calculated reconstruction unchanged. This page keeps
                  the solver&rsquo;s returned sign, so negative loadings are not
                  evidence of a different geometric fit.
                </p>
                <p>

                  Feature scaling is different. Converting only one measurement&rsquo;s
                  units changes its influence on covariance and can rotate the
                  components, as the meter and millimeter examples showed. Compare
                  preprocessing first, then divisors, signs and other solver
                  conventions before deciding why two results disagree.
                </p>
                <DerivationTable
                  expressionHeading="Observations or feature condition"
                  reasonHeading="Which directions can be identified"
                  rows={[
                    { expression: "empty data, or a missing or non-finite value", reason: "refused at the boundary, by the same guard every feature here passes through." },
                    { expression: "one observation", reason: "refused by this implementation, which requires at least two observations. A sample covariance with divisor n − 1 is undefined for one observation." },
                    { expression: "one feature", reason: "a varying feature fits with one component retaining all its variance." },
                    { expression: "more components requested than features", reason: "refused because an orthonormal basis cannot contain more directions than the feature dimension." },
                    { expression: "a constant column, raw", reason: "fits; the column contributes a component of zero variance and zero share." },
                    { expression: "a constant column, standardized", reason: "refused, because its standard deviation is zero and there is nothing to divide by." },
                    { expression: "duplicate features, or rank-deficient data", reason: "fits; the redundant direction comes back with zero variance." },
                    { expression: "a negative eigenvalue from rounding", reason: "clamped at zero, since a covariance matrix cannot truly have one and the solver's −3e−17 is not a fact about the data." },
                    { expression: "new data with reordered columns", reason: "matched by name and accepted; a column missing or unknown is refused." },
                    { expression: "reordered or non-orthogonal components handed to the model", reason: "refused at construction, because both failures are silent otherwise." },
                  ]}
                />
                <InAModel title="The contracts on the crowd">
                  <p>The SDK reports invalid requests through named validation errors. Requesting three components from two input features exceeds the available coordinate count. It also requires at least two observations and, when transforming later inputs, the exact fitted feature names.</p>
                  <p>
                    The accepted edges are quieter. Height fitted beside an
                    exact copy of itself comes back with the first component
                    carrying every share and the second a variance of exactly
                    0.0, and a constant shoe size beside height does the same.
                    Both are correct, and both are exactly what a reader who
                    did not look at the shares would miss.
                  </p>
                </InAModel>
                <p>A constant feature has no variation after centering, so it contributes nothing to centered PCA. Standardizing that column would divide by zero unless we define a policy. The implementation here rejects it. Other applications may drop the column or use a declared scale of one; whichever policy we choose must be reused for later inputs.</p>
                <KeepInMind>
                  Separate unsupported inputs from harmless conventions. Sign reversals and covariance divisors can change printed values without changing the retained geometry. A zero-variance direction can be represented explicitly, while a standardized constant column requires a declared policy. Read the validation rule before interpreting an accepted or refused request.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 12 to 16",
          quiz: [
            trueFalse(
              "On the two-group cloud, the first component carries 98.5 percent of the variance and is therefore the direction that separates the groups.",
              false,
              "It is the opposite. The two groups differ across the short axis, which is the 1.5 percent direction, so keeping one component places the fourteen people on the first line where the groups interleave and discards the line that separates them cleanly. The direction with the most variation is not necessarily the one most useful for prediction, and PCA cannot know because it was never told.",
            ),
            choice(
              "What did adding one tall, light stranger to the crowd do?",
              [
                "Nothing measurable, since one person in twelve is a twelfth of the data",
                "It moved the mean, turned the first component by 4.6 degrees and cut its share from 0.990 to 0.841",
                "It left the components alone and changed only the explained-variance shares",
                "It raised the covariance of height and weight from 349 to 464",
              ],
              1,
              "A squared deviation grows with the square of the distance, so a distant observation contributes far more than its share of the rows. The mean moved from (151.8, 53.4) to (155.4, 51.4) and the covariance of height and weight fell from 464 to 349, which is the reverse of the claim that it rose from 349 to 464.",
            ),
            choice(
              "Predicting weight from height gives a slope of 0.890 and predicting height from weight gives 0.928. Why do the two differ?",
              [
                "Because each minimizes a different set of misses, the vertical ones for its own chosen outcome",
                "Because the two fits were run on different people",
                "Because one of the two fits has not converged",
                "Because regression requires the features to be standardized and PCA does not",
              ],
              0,
              "Each regression minimizes errors in its own target coordinate. Predicting height from weight gives height-per-weight units; predicting weight from height gives weight-per-height units, so the reported slopes cannot be compared directly. Rewriting the reverse regression as weight against height gives a slope of about 1.078. PCA instead minimizes perpendicular coordinate errors and has slope 0.907 here, between that line and the weight-on-height slope of 0.890. This geometry depends on the chosen input units.",
            ),
            several(
              "A fitted PCA is applied to a new observation. Which of these travel with the fit?",
              [
                "The training mean",
                "The training standard deviations, when scaling was fitted",
                "The retained training component directions",
                "A fresh covariance matrix computed from the new observation",
              ],
              [0, 1, 2],
              "The new observation goes through the same transformation the training data went through, so the mean, the scales when standardization was fitted, and the retained directions all travel with the scores. Refitting per observation would make the coordinates mean something different every time.",
            ),
            trueFalse(
              "A constant column is harmless to raw covariance PCA and a division by zero once the features are standardized.",
              true,
              "A constant column has zero centered variance, so raw covariance PCA can include it as a zero-variance direction. Dividing that column by its own standard deviation is undefined because the divisor is zero. This library rejects it when standardization is requested; other implementations may explicitly drop constant columns or apply another documented convention.",
            ),
        ],
        },
        {
          title: "Practice. Turning the Crowd Onto Its Own Axes With the Library",
          practice: [
            exercise("Work the four people with the library",["Fit PrincipalComponentAnalysis to the four height-weight pairs below. Print each component's direction, variance and share of total variance. Compare the library's sample variances with the population variances calculated earlier.", "Transform the same four people and print their two component scores. A solver may reverse a component direction and all its scores together; this represents the same axis, so account for that sign choice when comparing results."],`from oop_ml import Feature, PrincipalComponentAnalysis

people = [Feature("height", [180, 160, 175, 165]), Feature("weight", [78, 58, 63, 73])]

fitted = PrincipalComponentAnalysis().fit(people)
# For each component print its name, its direction rounded to three places,
# its variance and its share of the total. Then transform the four people and
# print each person's score along the first and the second component.`,`from oop_ml import Feature, PrincipalComponentAnalysis

people = [Feature("height", [180, 160, 175, 165]), Feature("weight", [78, 58, 63, 73])]

fitted = PrincipalComponentAnalysis().fit(people)
for component, share in zip(fitted.components, fitted.components.variance_shares):
    direction = [round(float(value), 3) for value in component.direction]
    print(f"{component.name}: direction {direction}, variance {component.variance:.2f}, share {share:.2f}")

first, second = fitted.transform(people)
for person in range(4):
    print(f"person {person + 1}: scores {first.values[person]:.2f} and {second.values[person]:.2f}")`,`component_1: direction [0.707, 0.707], variance 133.33, share 0.80
component_2: direction [-0.707, 0.707], variance 33.33, share 0.20
person 1: scores 14.14 and 0.00
person 2: scores -14.14 and 0.00
person 3: scores 0.00 and -7.07
person 4: scores 0.00 and 7.07`,{...{ hints: ["The fitted components can be iterated, and variance_shares on the same object answers one share per component in the same order, so zip pairs them.", "A component carries name, direction and variance as properties. The direction is an array, one entry per feature in the order they were fitted.", "transform answers one Feature per component, named component_1 and component_2, whose values are the scores of the four people in the order they went in."], check: numberCheck("What variance does the library report for the first component?", 133.33, 0.01, "Changing the common variance divisor changes reported component variances without changing their relative shares or directions. Component signs remain conventions, so compare equivalent projections with that sign freedom in mind.") },question:"Can the library recover the supplied principal directions and coordinates?"}),
            exercise("Flatten the crowd and the arc onto one axis",["Fit PCA separately to the eleven-person dataset and the curved dataset below. Print each first-component direction as an angle and its share of variance. Then fit each dataset with n_components=1, transform it and reconstruct it with inverse_transform. Sum the squared differences between each original coordinate and its reconstruction.", "Report angles modulo 180 degrees so opposite direction vectors describe the same axis. Print both component variances as well. Compare how much reconstruction error remains when each dataset is reduced to one straight axis."],`import math
from oop_ml import Feature, PrincipalComponentAnalysis

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]
crowd = [Feature("height", heights), Feature("weight", weights)]
arc = [Feature("height", [120, 128, 136, 144, 152, 160, 168, 176, 184, 192, 200, 156]), Feature("weight", [80, 62, 49, 40, 35, 33, 35, 40, 49, 62, 80, 33])]

for label, people in (("the crowd", crowd), ("the arc", arc)):
    whole = PrincipalComponentAnalysis().fit(people)
    # Print the first component's angle in degrees modulo 180, the two
    # variances, and the first share. Then fit with n_components=1, rebuild
    # the people from their one score, and print the total squared error.`,`import math
from oop_ml import Feature, PrincipalComponentAnalysis

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]
crowd = [Feature("height", heights), Feature("weight", weights)]
arc = [Feature("height", [120, 128, 136, 144, 152, 160, 168, 176, 184, 192, 200, 156]), Feature("weight", [80, 62, 49, 40, 35, 33, 35, 40, 49, 62, 80, 33])]

for label, people in (("the crowd", crowd), ("the arc", arc)):
    whole = PrincipalComponentAnalysis().fit(people)
    first, second = whole.components
    angle = math.degrees(math.atan2(first.direction[1], first.direction[0])) % 180
    print(f"{label}: first component at {angle:.1f} degrees, variances {first.variance:.2f} and {second.variance:.2f}, "
          f"first share {whole.components.variance_shares[0]:.4f}")
    flattened = PrincipalComponentAnalysis(n_components=1).fit(people)
    rebuilt = flattened.inverse_transform(flattened.transform(people))
    error = sum(
        (float(before) - float(after)) ** 2
        for original, copy in zip(people, rebuilt)
        for before, after in zip(original.values, copy.values)
    )
    print(f"  one-component reconstruction error {error:.2f}")`,`the crowd: first component at 42.2 degrees, variances 1037.41 and 10.81, first share 0.9897
  one-component reconstruction error 108.10
the arc: first component at 1.0 degrees, variances 641.44 and 301.50, first share 0.6803
  one-component reconstruction error 3316.45`,{...{ hints: ["Unpacking the fitted components into two names works because a two-feature fit has exactly two of them, in order of variance.", "atan2 of the direction's second entry over its first is the angle; taking it modulo 180 removes the sign the solver chose, since (−0.74, −0.67) and (0.74, 0.67) are one axis.", "inverse_transform takes what transform answered and hands back one Feature per original column, so the error is a double loop, over the two columns and over the people in each."], check: numberCheck("What variance does the crowd's second component carry?", 10.81, 0.01, "The one-dimensional reconstruction loses variation orthogonal to the retained direction. The arc has substantial variation outside one straight axis, so its reconstruction error is much larger than the elongated crowd's.") },question:"What information is lost when each cloud is reconstructed from one component?"}),
            exercise("Add one stranger to the crowd",["Fit PCA to the eleven people, then repeat after adding the person of 195 cm and 30 kg. Print the first component's angle and share of variance for each fit.", "Also print the second component's variance before and after adding the observation. Check how the additional person changes variation outside the first component."],`import math
from oop_ml import Feature, PrincipalComponentAnalysis

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]

for label, extra_height, extra_weight in (("the crowd", [], []), ("with the stranger", [195], [30])):
    people = [Feature("height", heights + extra_height), Feature("weight", weights + extra_weight)]
    # Fit the cloud, then print the label, the first component's angle in
    # degrees modulo 180, its share, and the second component's variance.`,`import math
from oop_ml import Feature, PrincipalComponentAnalysis

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]

for label, extra_height, extra_weight in (("the crowd", [], []), ("with the stranger", [195], [30])):
    people = [Feature("height", heights + extra_height), Feature("weight", weights + extra_weight)]
    fitted = PrincipalComponentAnalysis().fit(people)
    first, second = fitted.components
    angle = math.degrees(math.atan2(first.direction[1], first.direction[0])) % 180
    share = fitted.components.variance_shares[0]
    print(f"{label}: first component at {angle:.2f} degrees with share {share:.4f}, second component variance {second.variance:.2f}")`,`the crowd: first component at 42.21 degrees with share 0.9897, second component variance 10.81
with the stranger: first component at 37.62 degrees with share 0.8409, second component variance 183.55`,{...{ hints: ["The stranger is appended to both lists before the Features are built, so the second fit sees twelve people and the first sees eleven.", "The angle and the share are read exactly as in the previous problem. The turn is the difference between the two printed angles."], check: numberCheck("What share of the variance does the first component carry once the stranger is in?", 0.8409, 0.0005, "A distant observation contributes a large squared deviation and changes the fitted covariance. Here it increases the second component's variance and rotates the first direction; the result depends on that observation's position.") },question:"How much can one distant observation change the principal directions?"}),
            exercise("Write the heights in three units, then standardize",["Record height in millimeters, centimeters and meters while leaving weight in kilograms. For each unit, fit PCA both with and without standardize=True. Print the first component's direction and variance share for all six fits.", "Finally request three components from the two-feature dataset. Catch the library error raised during fit and print its class name and message."],`from oop_ml import Feature, MLLibError, PrincipalComponentAnalysis

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]

for unit, factor in (("millimetres", 10), ("centimetres", 1), ("metres", 0.01)):
    people = [Feature("height", [h * factor for h in heights]), Feature("weight", weights)]
    # Fit the cloud raw and with standardize=True, and for each print the
    # unit, which of the two it was, the first component's direction rounded
    # to three places, and its share to four.

# Try to fit a PrincipalComponentAnalysis with n_components=3 on the last
# cloud, catching the library's own error and printing its name and message.`,`from oop_ml import Feature, MLLibError, PrincipalComponentAnalysis

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]

for unit, factor in (("millimetres", 10), ("centimetres", 1), ("metres", 0.01)):
    people = [Feature("height", [h * factor for h in heights]), Feature("weight", weights)]
    for standardize in (False, True):
        fitted = PrincipalComponentAnalysis(standardize=standardize).fit(people)
        first = fitted.components["component_1"]
        direction = [round(float(value), 3) for value in first.direction]
        reading = "standardized" if standardize else "raw"
        print(f"{unit}, {reading}: direction {direction}, share {fitted.components.variance_shares[0]:.4f}")

try:
    PrincipalComponentAnalysis(n_components=3).fit(people)
except MLLibError as refusal:
    print(f"{type(refusal).__name__}: {refusal}")`,`millimetres, raw: direction [-0.996, -0.089], share 0.9997
millimetres, standardized: direction [0.707, 0.707], share 0.9896
centimetres, raw: direction [-0.741, -0.672], share 0.9897
centimetres, standardized: direction [0.707, 0.707], share 0.9896
metres, raw: direction [0.011, 1.0], share 1.0000
metres, standardized: direction [0.707, 0.707], share 0.9896
InvalidValuesError: cannot keep 3 components from 2 features`,{...{ hints: ["standardize is a field of the constructor, so each unit needs two fits, one with it off and one with it on.", "A component can be read by name from components, and the first is component_1.", "The refusal happens at fit, when the number of features is first known, so the try has to wrap the fit rather than the construction."], check: numberCheck("What share does the first component carry once the heights are standardized, in any of the three units?", 0.9896, 0.0005, "Training standardization removes these positive unit conversions before covariance is calculated. Raw covariance instead uses the changed numerical scales, so it favors different feature directions even for the same people.") },question:"Do raw and standardized PCA react differently to changes of units?"}),
          ],
        },
      ]}
    />
  );
}
