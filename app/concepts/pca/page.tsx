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
  title: "Principal Component Analysis · oop_ml",
  description:
    "Find directions that preserve as much variation as possible when you use fewer coordinates.",
};

const link = "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function PcaPage() {
  return (
    <ConceptPage
      lessonId="pca"
      intuition={lessonIntuitions["pca"]}
      technicalStart="Part 3. Viewing the Cloud Along One Direction"
      openingTitle="Two Measurements, Much of the Same Information"
      playgroundIntro="Rotate the projection direction and compare the spread of the projected points. Then inspect the gap between each original point and its reconstruction."
      title="Principal Component Analysis"
      tagline="Find directions that preserve as much variation as possible when you use fewer coordinates."
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
                  So does each feature contribute entirely new information?
                  Not entirely. Much of what the weight line says, the height
                  line already said, and a single combined measurement of
                  how big someone is would describe most of the shared
                  pattern. Not all of it, since being heavy for your height
                  is real and is not on that combined axis, which is the part
                  that is unique to each feature.
                </p>
                <p>
                  The idea grows with the number of columns. Measure sixty
                  people five ways, height, arm span, leg length, sitting
                  height and shoe size, and the five are genuinely different
                  measurements that all follow one shared pattern, overall
                  body size, each with something of its own besides.
                </p>
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
                <p>
                  The original features are the axes we happened to measure
                  along, a height axis and a weight axis. A direction is
                  something else, a weighted combination of the two. Height
                  and weight increasing together is one direction; height
                  increasing while weight decreases is another; any
                  weighting at all is a third. Turn the arrow below through
                  the crowd and it combines the two measurements into one
                  new axis at every angle.
                </p>
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
        {
          title: "Part 2. Centre the Data",
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
                  centre of the observations, and it is the pivot everything
                  that follows turns about.
                </p>
              </SubSection>

              <SubSection title="4. Centring the cloud">
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
                  along directions, and without centring, a direction can
                  look important just because the whole cloud sits far from
                  the origin. Untick the switch below and the scores along
                  the arrow stop being deviations and start being positions,
                  and the mean of their squares balloons from a measure of
                  spread into a measure of where the cloud is.
                </p>
                <ProjectionExplorer panels={["centre"]} initialAngle={45} people="worked" />
                <InAModel title="On the measured four at 45 degrees">
                  <p>
                    Centred, the four scores have mean 0, the mean of their
                    squares is 100, and so is their variance. Uncentred, the
                    scores have mean 168.3, the mean of their squares is
                    28,422, and their variance about their own mean is still
                    100. The number that changed is location. The number the
                    method wants did not.
                  </p>
                </InAModel>
                <KeepInMind>
                  Centring relocates the cloud around the origin without
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
                  Choose a unit direction u. For each centred person, drop a
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
                  Second, because the cloud is centred, the scores are
                  centred too, and their variance is simply the mean of
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
                <p>
                  Now sweep. Some directions squeeze the people together on
                  the number line and some spread them out, and the curve
                  beneath the cloud records the variance at every angle of
                  the half turn. It has one peak and one trough, a quarter
                  turn apart.
                </p>
                <ProjectionExplorer panels={["scores", "sweep"]} initialAngle={10} people="worked" />
                <KeepInMind>
                  Every direction gives the cloud a different one-dimensional
                  shadow, and exactly one direction gives the widest.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. The first principal component">
                <p>
                  That widest direction has a name. The first principal
                  component is the unit direction along which the centred
                  observations have the greatest variance, and on the
                  measured four it sits at 45 degrees, where the variance of
                  the scores is 100 and every other angle gives less. On the
                  crowd it sits at 42.2 degrees. The playground at the top of
                  the page draws it in indigo, and it is not the height axis
                  and not the weight axis. It is the cloud&rsquo;s own.
                </p>
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
                  centred features.
                </p>
                <Equation>{"score = 0.71 × centred height + 0.71 × centred weight"}</Equation>
                <p>
                  Both features contribute positively, and the equal
                  coefficients mean a unit of movement in either contributes
                  the same, after centring. The coefficients that define the
                  direction are called the loadings, and the widget builds
                  one person&rsquo;s score from them, the height part in
                  indigo, the weight part in amber, and their sum.
                </p>
                <ProjectionExplorer panels={["contribution"]} initialAngle={45} people="worked" />
                <WorkedExample title="Person 1 on the measured four">
                  <>
                    <p>
                      The first person’s centred measurements are (10, 10). At
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
                <p>
                  Which leads to a caution about names. The first component
                  on the crowd resembles overall body size, and it would be
                  natural to call it that, but the method never learned the
                  phrase. It found a mathematical direction. Whether that
                  direction deserves a human label depends on the loadings
                  and on knowing something about bodies, and a component can
                  combine features in ways with no clean real-world label at
                  all. When it does, the honest move is to leave it unnamed.
                </p>
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
              "Centring moves the cloud onto the origin without changing the distance between any two observations.",
              true,
              "Subtracting one fixed point from every observation slides the whole cloud and leaves its shape and orientation alone. On the four people the centred scores have mean 0 and mean square 100, while uncentred the mean square is 28,422; the variance about their own mean is 100 either way, so what centring removed was location rather than spread.",
            ),
            choice(
              "Why must the direction u be restricted to unit length?",
              [
                "Otherwise stretching the arrow raises every score, so a direction could look wide merely by being long",
                "Otherwise the dot product is undefined for vectors of different lengths",
                "Because the covariance matrix only acts on vectors of length one",
                "Because the scores would no longer be centred",
              ],
              0,
              "Every score is the dot product of a deviation with u, so doubling u doubles every score and quadruples the variance along it without any change of direction. Fixing u · u = 1 makes a comparison between directions a comparison between directions rather than between vector scales.",
            ),
            choice(
              "Person 1’s centred measurements are (10, 10) and the first direction at 45 degrees is (0.71, 0.71). What is their score along it?",
              [
                "14.14, the sum of a height contribution of 7.07 and a weight contribution of 7.07",
                "7.07, since each feature contributes 7.07",
                "20, the sum of the two deviations",
                "0, since the two contributions cancel as they do for person 3",
              ],
              0,
              "A score is a dot product, each centred measurement multiplied by its direction coordinate and the products added, and at 45 degrees both coordinates are 1/√2, so 10/√2 + 10/√2 ≈ 14.142. The two contributions of 7.07 are the parts of one score, not two scores. Person 3, at (5, −5), is the case where the parts cancel to 0, which puts them at the mean’s coordinate along this direction while they sit away from it along the perpendicular one.",
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
                "It is uniquely determined in two dimensions, apart from its sign",
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
                  the rotation. For centred height and weight it holds three
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
                <InAModel title="On the measured four">
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
                  found by rotating, 45 degrees on the measured four, is the
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
              <SubSection title="16. The four-person worked example">
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
                  (1, 1) and (1, −1), normalised to u₁ = (0.707, 0.707) and
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
                  A common divisor changes the variance scale but not the
                  share attributed to each component. Eighty percent of how
                  these four people differ is one diagonal fact, bigger or
                  smaller overall.
                </KeepInMind>
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
                  centred rows stacked into a matrix X and the component
                  directions as the columns of W, the scores are one
                  product, and the widget writes it out for whichever person
                  is selected.
                </p>
                <Equation>{"Z = X W"}</Equation>
                <CoordinateChange />
                <KeepInMind>
                  PCA transforms each observation from the original feature
                  coordinates into coordinates along the principal
                  components, and it applies the same projections to every
                  row. It changes the coordinate system; it does not merely
                  draw a line through the data.
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
                <p>
                  Instead of keeping both scores, keep only s₁, and each
                  person is one number. That is dimensionality reduction,
                  and on real data with hundreds of correlated columns it is
                  the difference between unworkable and workable. Tick the
                  flatten toggle on the playground and the crowd moves onto
                  the first component&rsquo;s line.
                </p>
                <p>
                  One number per person is not the whole of what has to be
                  stored, though. To do anything with those numbers later
                  you also need the original feature means, the feature
                  scales if standardisation was used, and the retained
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
                  where they really were. If standardisation was used, the
                  scaling is reversed as well, in the opposite order it was
                  applied.
                </p>
                <KeepInMind>
                  Reconstruction maps retained component scores back into an
                  approximation of the original feature space.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. Reconstruction error">
                <p>
                  The stub is the error, and its squared length is the
                  natural measure of it.
                </p>
                <Equation>{"errorᵢ = ‖xᵢ − x̂ᵢ‖²           total = Σᵢ ‖xᵢ − x̂ᵢ‖²"}</Equation>
                <>
<p>
                  Now rotate the retained direction instead of accepting the first component, and watch the total. The widget in section 11 is the same instrument, and its discarded readout is this total. It is smallest at the first component, because for centred data the direction that keeps the most variance and the direction that leaves the smallest squared stubs are the same direction.
                </p>
                <p>
                  Pythagoras is why. Each person&rsquo;s squared distance from the mean splits into a squared score plus a squared stub, and the distances do not depend on the direction, so making the scores as large as possible makes the stubs as small as possible.
                </p>
</>
                <Equation>{"‖dᵢ‖² = (dᵢ · u)² + stubᵢ²"}</Equation>
                <InAModel title="On the measured four">
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
                  Maximising retained projected variance and minimising
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
                  standardised variance, two carry 87.2, three 94.4, four
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
              <SubSection title="24. Covariance PCA versus standardised PCA">
                <p>
                  The crowd&rsquo;s heights are in centimetres. Write them
                  in metres or in millimetres and nothing about the people
                  changes, but the numbers do, and the covariance matrix is
                  built from the numbers.
                </p>
                <UnitToggle />
                <p>
                  In millimetres the height variance is 52,178 against
                  weight&rsquo;s 431, the first component is (−0.996,
                  −0.089), almost pure height, and it claims 99.97 percent of
                  the variance. In metres the height variance is 0.05, the
                  first component is (0.011, 1.000), almost pure weight, and
                  it claims all of it. Same people. Covariance PCA is
                  sensitive to the numerical scale of its features, and a
                  feature can dominate for no better reason than its units
                  produce big numbers.
                </p>
                <p>
                  The usual repair is to standardise each feature first,
                  dividing its deviations by its own standard deviation, so
                  every feature starts with variance one. PCA on
                  standardised features is PCA on the correlation matrix
                  rather than the covariance matrix, and the question it
                  answers changes from how the features vary together in
                  their units to how they vary together relative to their
                  own scales.
                </p>
                <Equation>{"zᵢⱼ = (xᵢⱼ − x̄ⱼ) / sⱼ"}</Equation>
                <StandardizedComparison />
                <p>
                  Whether to standardise is a modelling choice, not a rule.
                  Raw covariance PCA is the right instrument when the
                  features share comparable units, when absolute variance
                  means something, and when a feature that varies more
                  should count for more. Standardised PCA is the right one
                  when units differ, when relative variation is what matters,
                  and when no feature should dominate merely because of its
                  measurement scale.
                </p>
                <KeepInMind>
                  Choosing whether to standardise determines what kind of
                  variation PCA treats as important. Centring is required;
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
              "The choice of divisor is a common factor on every eigenvalue, so it changes neither the eigenvectors nor the shares. The scatter eigenvalues 400 and 100 become variances 100 and 25 under the population divisor and 133.3 and 33.3 under the sample one, which is what the playground reports, and the share of the first component is 400 over 500, 100 over 125 or 133.3 over 166.7, which is 0.8 every time. Name the matrix you are using, because the variances are comparable only under one divisor.",
            ),
            trueFalse(
              "Keeping the most variance and leaving the smallest squared stubs pull in different directions, so one has to be traded against the other.",
              false,
              "They are the same direction for centred data, and Pythagoras is the reason. Each squared distance from the mean splits into a squared score plus a squared stub, and the distances do not depend on the direction chosen, so the largest squared scores leave the smallest squared stubs. On the four people the two totals are 400 and 100 at 45 degrees and sum to 500 at every angle.",
            ),
            trueFalse(
              "Writing the crowd’s heights in millimetres rather than metres changes which feature the first component is almost entirely made of.",
              true,
              "In millimetres the height variance is 52,178 against weight’s 431, and the first component is (−0.996, −0.089), almost pure height, claiming 99.97 percent. In metres the height variance is 0.05 and the first component is (0.011, 1.000), almost pure weight. Same people, different units, and the covariance matrix is built from the numbers.",
            ),
            several(
              "Which of these does the page say about choosing how many components to keep?",
              [
                "Keeping 95 percent of the variance is a rule of thumb rather than a law",
                "The right count depends on what the reduced representation is for",
                "On the five-measurement dataset the first component alone carries 95 percent of the standardised variance",
                "Reconstruction quality and predictive performance are the same question measured two ways",
              ],
              [0, 1],
              "On the five-measurement dataset the first component carries 78.2 percent of the standardised variance, two carry 87.2, three 94.4 and four 99.0, so a 95 percent rule would keep four, and the page is explicit that the rule is a convention and not a law. A low-variance direction may carry the information a downstream task needs, which is why reconstruction quality and predictive performance answer different questions rather than one question measured two ways.",
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
                <p>
                  The method runs on means, squared deviations and
                  covariances, and every one of those gives a distant
                  observation more than its share of the say. Add one
                  stranger to the crowd, tall and light, and the mean moves,
                  the covariance changes, the first component turns, and the
                  shares follow.
                </p>
                <OutlierInfluence />
                <p>
                  One person in twelve moves the mean from (151.8, 53.4) to
                  (155.4, 51.4), pulls the covariance of height and weight
                  from 464 down to 349, turns the first component by 4.6
                  degrees, and cuts its share from 0.990 to 0.841. A squared
                  deviation grows with the square of the distance, so a
                  distant person contributes far more than a twelfth.
                </p>
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
                <p>
                  The first component claims 68 percent of the variance
                  here and the one-component reconstruction error is 3,316,
                  against 108 on the crowd, which has one more person. The
                  numbers say a straight axis is a poor summary; they do not
                  say why, and the picture does.
                </p>
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
                  outcome, predicts it from the other feature, and minimises
                  the vertical misses in the picture. PCA treats the features
                  symmetrically after preprocessing, finds a direction
                  through the cloud, and minimises the perpendicular misses.
                  Different objectives, different lines.
                </p>
                <RegressionVersusPca />
                <p>
                  The third line makes the point twice. Predicting weight
                  from height gives a slope of 0.890; predicting height from
                  weight, drawn on the same axes, gives 0.928; the first
                  component sits between them at 0.907. Reversing which
                  feature is the outcome changes the regression line, because
                  it changes which misses are being minimised, and PCA is
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
                <p>
                  The claim to earn is that hunting variance leads to the
                  covariance matrix&rsquo;s eigenvectors, and it walks in
                  four steps. First, the variance along a unit direction u.
                  Each deviation d lands on u by the dot product, and
                  expanding the square of that makes something familiar
                  appear.
                </p>
                <Equation>{"(d · u)² = (d₁u₁ + d₂u₂)² = d₁²u₁² + 2 d₁d₂ u₁u₂ + d₂²u₂²"}</Equation>
                <p>
                  Average over the people and the d sums become the
                  statistics primer&rsquo;s quantities, the two variances on
                  the squared terms and the covariance on the cross term,
                  which is the covariance matrix evaluated on u.
                </p>
                <Equation>{"variance along u = uᵀ C u"}</Equation>
                <p>
                  Second, maximise that subject to u being a unit vector.
                  Put the constraint in with a Lagrange multiplier and
                  differentiate.
                </p>
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
                <p>
                  The variance achieved along an eigenvector is its
                  eigenvalue, so the maximum is the eigenvector with the
                  largest eigenvalue, and that is the first principal
                  component. Fourth, the second component solves the same
                  problem with one more constraint, u₂ᵀu₁ = 0, which
                  prevents it from rediscovering the same direction, and the
                  argument continues for each later component inside the
                  space perpendicular to all the earlier ones. A symmetric
                  matrix&rsquo;s eigenvectors for distinct eigenvalues are
                  perpendicular to one another already, which is why the
                  constraint costs nothing.
                </p>
                <KeepInMind>
                  The unit direction maximising projected variance must be an
                  eigenvector of the covariance matrix, its eigenvalue is the
                  variance it achieves, and later components maximise the
                  remaining variance without repeating directions already
                  retained. Nothing about the eigen machinery was borrowed on
                  faith.
                </KeepInMind>
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
                  walked. Centre the data matrix, optionally standardise its
                  columns, form the covariance matrix, find its eigenvectors
                  and eigenvalues, sort them by decreasing eigenvalue, keep
                  the ones you want, and transform. It matches the concept
                  step for step.
                </p>
                <p>
                  Practical implementations often skip the covariance matrix
                  and decompose the centred data matrix directly.
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
                  PCA can be computed directly from the centred data matrix
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
                  The fit here keeps the means and, when it standardised,
                  the standardiser, and its transform matches features by
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
          title: "Part 16. Implementation and Failure Contracts",
          content: (
            <>
              <SubSection title="32. Implementation and failure contracts">
                <p>
                  A complete implementation states the number of components,
                  whether it centres, whether it scales, whether the
                  covariance uses the population or sample divisor, whether
                  it decomposes the covariance or the data matrix, how it
                  orders components, what sign convention it applies if
                  deterministic output is required, how it treats tied or
                  nearly tied eigenvalues, its tolerances, and which of the
                  scores, components, reconstructions and explained variances
                  it returns.
                </p>
                <p>
                  Most of those choices change a number without changing the
                  fit, which is what makes them worth stating. The divisor
                  scales every variance by one factor and leaves the
                  directions and the shares alone, as Part 7 measured, so two
                  implementations can disagree about every variance they
                  report and agree about every component. The sign is the same
                  kind of difference. The fit on this page keeps whichever
                  sign the solver returned, which is why the millimetre
                  component of Part 11 came back as (−0.996, −0.089) with both
                  loadings negative while the metre one came back as
                  (0.011, 1.000), and Part 4 is the reason neither sign means
                  anything. A reader comparing two implementations has to know
                  which of their disagreements are about the data and which
                  are about these conventions, and only a stated contract
                  tells them.
                </p>
                <DerivationTable
                  expressionHeading="the edge"
                  reasonHeading="the behaviour"
                  rows={[
                    { expression: "empty data, or a missing or non-finite value", reason: "refused at the boundary, by the same guard every feature here passes through." },
                    { expression: "one observation", reason: "refused; a covariance needs at least two rows to have a spread to decompose." },
                    { expression: "one feature", reason: "fits, with one component carrying every share." },
                    { expression: "more components requested than features", reason: "refused at the fit, since the valid rank cannot supply them." },
                    { expression: "a constant column, raw", reason: "fits; the column contributes a component of zero variance and zero share." },
                    { expression: "a constant column, standardised", reason: "refused, because its standard deviation is zero and there is nothing to divide by." },
                    { expression: "duplicate features, or rank-deficient data", reason: "fits; the redundant direction comes back with zero variance." },
                    { expression: "a negative eigenvalue from rounding", reason: "clamped at zero, since a covariance matrix cannot truly have one and the solver's −3e−17 is not a fact about the data." },
                    { expression: "new data with reordered columns", reason: "matched by name and accepted; a column missing or unknown is refused." },
                    { expression: "reordered or non-orthogonal components handed to the model", reason: "refused at construction, because both failures are silent otherwise." },
                  ]}
                />
                <InAModel title="The contracts on the crowd">
                  <p>
                    Every refusal in the table is a sentence rather than a
                    crash. Asked for three components of the crowd&rsquo;s two
                    features, the fit answers that it cannot keep three
                    components from two features; handed one person, that a
                    decomposition needs at least two rows to have any spread;
                    handed height alone after being fitted on height and
                    weight, that it expected exactly the fitted features and
                    names them.
                  </p>
                  <p>
                    The accepted edges are quieter. Height fitted beside an
                    exact copy of itself comes back with the first component
                    carrying every share and the second a variance of exactly
                    0.0, and a constant shoe size beside height does the same.
                    Both are correct, and both are exactly what a reader who
                    did not look at the shares would miss.
                  </p>
                </InAModel>
                <p>
                  Constant features are the case that deserves particular
                  care, because the two preprocessing choices treat them
                  oppositely. Raw, a constant column is harmless and simply
                  carries nothing. Standardised, it is a division by zero,
                  and the refusal is the right answer rather than a quiet
                  substitution.
                </p>
                <KeepInMind>
                  In every one of these the alternative is a number that looks
                  fine. A sign chosen by the solver, a variance under the
                  other divisor, a zero-variance component quietly dropped, a
                  solver&rsquo;s −3e−17 reported as a fact about the data, all
                  fit and all transform. The rows that refuse are the ones
                  where no number would be honest, and the rows that accept
                  are the ones where the honest number is zero.
                </KeepInMind>
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
                "Because each minimises a different set of misses, the vertical ones for its own chosen outcome",
                "Because the two fits were run on different people",
                "Because one of the two fits has not converged",
                "Because regression requires the features to be standardised and PCA does not",
              ],
              0,
              "Regression picks an outcome and minimises the vertical misses in predicting it, so reversing which feature is the outcome changes which misses are being minimised and therefore the line. PCA minimises the perpendicular misses instead and sits between the two at 0.907, which is why it is a different geometric problem rather than regression without a target.",
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
              "The new observation goes through the same transformation the training data went through, so the mean, the scales when standardisation was fitted, and the retained directions all travel with the scores. Refitting per observation would make the coordinates mean something different every time.",
            ),
            trueFalse(
              "A constant column is harmless to raw covariance PCA and a division by zero once the features are standardised.",
              true,
              "The two preprocessing choices treat it oppositely. Raw, the column simply carries nothing; standardised, its deviations are divided by a standard deviation of zero, and refusing is the right answer rather than quietly substituting some other number.",
            ),
        ],
        },
        {
          title: "Practice. Turning the Crowd Onto Its Own Axes With the Library",
          practice: [
            exercise(
              "Work the four people with the library",
              ["Part 7 works the four people by hand to directions of (0.707, 0.707) and (0.707, −0.707), variances of 100 and 25 under the population divisor, and shares of 0.8 and 0.2, and says the playground reports sample variances of 133.3 and 33.3 instead. Fit PrincipalComponentAnalysis on the four and read all of that off the fitted components.", "Then transform the four people and print each one's two scores. Part 8 has person 1 at 14.14 and 0 and person 3 at 0 and 7.07. Expect the sign of the second component, and so of person 3's second score, to come back as the solver chose it, which Part 4 says is a convention and not a fact."],
              `from oop_ml import Feature, PrincipalComponentAnalysis

people = [Feature("height", [180, 160, 175, 165]), Feature("weight", [78, 58, 63, 73])]

fitted = PrincipalComponentAnalysis().fit(people)
# For each component print its name, its direction rounded to three places,
# its variance and its share of the total. Then transform the four people and
# print each person's score along the first and the second component.`,
              `from oop_ml import Feature, PrincipalComponentAnalysis

people = [Feature("height", [180, 160, 175, 165]), Feature("weight", [78, 58, 63, 73])]

fitted = PrincipalComponentAnalysis().fit(people)
for component, share in zip(fitted.components, fitted.components.variance_shares):
    direction = [round(float(value), 3) for value in component.direction]
    print(f"{component.name}: direction {direction}, variance {component.variance:.2f}, share {share:.2f}")

first, second = fitted.transform(people)
for person in range(4):
    print(f"person {person + 1}: scores {first.values[person]:.2f} and {second.values[person]:.2f}")`,
              `component_1: direction [0.707, 0.707], variance 133.33, share 0.80
component_2: direction [-0.707, 0.707], variance 33.33, share 0.20
person 1: scores 14.14 and 0.00
person 2: scores -14.14 and 0.00
person 3: scores 0.00 and -7.07
person 4: scores 0.00 and 7.07`,
              { hints: ["The fitted components can be iterated, and variance_shares on the same object answers one share per component in the same order, so zip pairs them.", "A component carries name, direction and variance as properties. The direction is an array, one entry per feature in the order they were fitted.", "transform answers one Feature per component, named component_1 and component_2, whose values are the scores of the four people in the order they went in."], check: numberCheck("What variance does the library report for the first component?", 133.33, 0.01, "The library divides by one fewer than the number of people, the sample divisor, so the first component's variance is 100 times 4/3, which is 133.33, and the second is 33.33, exactly as Part 7 says the playground reports. The directions and the shares of 0.8 and 0.2 are the same under either divisor, because a common factor on both eigenvalues cancels in the ratio and moves no direction.") },
            ),
            exercise(
              "Flatten the crowd and the arc onto one axis",
              ["Part 5 says the crowd's first component carries 98.97 percent of the variance and Part 3 puts it at 42.2 degrees; Part 12 says the arc's carries 68 percent and that keeping one component leaves a reconstruction error of 3,316 on the arc against 108 on the crowd. Fit each cloud whole for its directions and shares, then fit it again with n_components=1, transform and inverse_transform, and total the squared gaps between the people and their rebuilt copies.", "Report the first component's angle modulo a half turn, since its sign is conventional, and both components' variances, which the lesson does not quote."],
              `import math
from oop_ml import Feature, PrincipalComponentAnalysis

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]
crowd = [Feature("height", heights), Feature("weight", weights)]
arc = [Feature("height", [120, 128, 136, 144, 152, 160, 168, 176, 184, 192, 200, 156]), Feature("weight", [80, 62, 49, 40, 35, 33, 35, 40, 49, 62, 80, 33])]

for label, people in (("the crowd", crowd), ("the arc", arc)):
    whole = PrincipalComponentAnalysis().fit(people)
    # Print the first component's angle in degrees modulo 180, the two
    # variances, and the first share. Then fit with n_components=1, rebuild
    # the people from their one score, and print the total squared error.`,
              `import math
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
    print(f"  one-component reconstruction error {error:.2f}")`,
              `the crowd: first component at 42.2 degrees, variances 1037.41 and 10.81, first share 0.9897
  one-component reconstruction error 108.10
the arc: first component at 1.0 degrees, variances 641.44 and 301.50, first share 0.6803
  one-component reconstruction error 3316.45`,
              { hints: ["Unpacking the fitted components into two names works because a two-feature fit has exactly two of them, in order of variance.", "atan2 of the direction's second entry over its first is the angle; taking it modulo 180 removes the sign the solver chose, since (−0.74, −0.67) and (0.74, 0.67) are one axis.", "inverse_transform takes what transform answered and hands back one Feature per original column, so the error is a double loop, over the two columns and over the people in each."], check: numberCheck("What variance does the crowd's second component carry?", 10.81, 0.01, "The crowd's two components carry 1037.41 and 10.81, which is why the first claims 98.97 percent and the stubs left by flattening total only 108.10. The arc's two carry 641.44 and 301.50, a first share of 68 percent, and the stubs total 3316.45, because twelve people along a curve have no straight axis to follow and the first component lays a line across the bend. The numbers say the straight axis is a poor summary of the arc; the picture says why.") },
            ),
            exercise(
              "Add one stranger to the crowd",
              ["Part 12 adds one tall, light person, 195 cm and 30 kg, to the eleven and reports that the first component turns by 4.6 degrees and its share falls from 0.990 to 0.841. Fit the crowd with and without the stranger and print the first component's angle and share for each.", "Print the second component's variance as well, before and after, which the lesson does not quote and which is where the stranger's say shows most plainly."],
              `import math
from oop_ml import Feature, PrincipalComponentAnalysis

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]

for label, extra_height, extra_weight in (("the crowd", [], []), ("with the stranger", [195], [30])):
    people = [Feature("height", heights + extra_height), Feature("weight", weights + extra_weight)]
    # Fit the cloud, then print the label, the first component's angle in
    # degrees modulo 180, its share, and the second component's variance.`,
              `import math
from oop_ml import Feature, PrincipalComponentAnalysis

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]

for label, extra_height, extra_weight in (("the crowd", [], []), ("with the stranger", [195], [30])):
    people = [Feature("height", heights + extra_height), Feature("weight", weights + extra_weight)]
    fitted = PrincipalComponentAnalysis().fit(people)
    first, second = fitted.components
    angle = math.degrees(math.atan2(first.direction[1], first.direction[0])) % 180
    share = fitted.components.variance_shares[0]
    print(f"{label}: first component at {angle:.2f} degrees with share {share:.4f}, second component variance {second.variance:.2f}")`,
              `the crowd: first component at 42.21 degrees with share 0.9897, second component variance 10.81
with the stranger: first component at 37.62 degrees with share 0.8409, second component variance 183.55`,
              { hints: ["The stranger is appended to both lists before the Features are built, so the second fit sees twelve people and the first sees eleven.", "The angle and the share are read exactly as in the previous problem. The turn is the difference between the two printed angles."], check: numberCheck("What share of the variance does the first component carry once the stranger is in?", 0.8409, 0.0005, "One person in twelve turns the first component from 42.21 to 37.62 degrees, the 4.6 degrees Part 12 reports, and cuts its share from 0.9897 to 0.8409, because a squared deviation grows with the square of the distance and a distant person contributes far more than a twelfth. The second component's variance goes from 10.81 to 183.55, which is the stranger's whole say, since they sit far off the crowd's long axis and the short axis has to grow to reach them.") },
            ),
            exercise(
              "Write the heights in three units, then standardize",
              ["Part 11 writes the crowd's heights in millimetres, where the first component is (−0.996, −0.089) and claims 99.97 percent, and in metres, where it is (0.011, 1.000) and claims all of it. Fit the crowd with the heights in millimetres, centimetres and metres, raw and with standardize=True, and print the first component's direction and share for each of the six fits.", "Then ask the fit for three components of two features and print what the library raises, which the table in Part 16 says is a refusal at the fit."],
              `from oop_ml import Feature, MLLibError, PrincipalComponentAnalysis

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]

for unit, factor in (("millimetres", 10), ("centimetres", 1), ("metres", 0.01)):
    people = [Feature("height", [h * factor for h in heights]), Feature("weight", weights)]
    # Fit the cloud raw and with standardize=True, and for each print the
    # unit, which of the two it was, the first component's direction rounded
    # to three places, and its share to four.

# Try to fit a PrincipalComponentAnalysis with n_components=3 on the last
# cloud, catching the library's own error and printing its name and message.`,
              `from oop_ml import Feature, MLLibError, PrincipalComponentAnalysis

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
    print(f"{type(refusal).__name__}: {refusal}")`,
              `millimetres, raw: direction [-0.996, -0.089], share 0.9997
millimetres, standardized: direction [0.707, 0.707], share 0.9896
centimetres, raw: direction [-0.741, -0.672], share 0.9897
centimetres, standardized: direction [0.707, 0.707], share 0.9896
metres, raw: direction [0.011, 1.0], share 1.0000
metres, standardized: direction [0.707, 0.707], share 0.9896
InvalidValuesError: cannot keep 3 components from 2 features`,
              { hints: ["standardize is a field of the constructor, so each unit needs two fits, one with it off and one with it on.", "A component can be read by name from components, and the first is component_1.", "The refusal happens at fit, when the number of features is first known, so the try has to wrap the fit rather than the construction."], check: numberCheck("What share does the first component carry once the heights are standardized, in any of the three units?", 0.9896, 0.0005, "Standardized, all three units give the same fit, a direction of (0.707, 0.707) and a share of 0.9896, because dividing each feature by its own spread removes the unit before the covariance is built, and the question changes from how the features vary together in their units to how they vary relative to their own scales. Raw, the share runs from 0.9897 in centimetres to 0.9997 in millimetres and 1.0000 in metres while the direction swings from almost pure height to almost pure weight. Same people, and the covariance matrix is built from the numbers.") },
            ),
          ],
        },
      ]}
    />
  );
}
