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
    "Find the few directions a cloud of data actually varies along, and describe each point by where it sits along them.",
};

const link = "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function PcaPage() {
  return (
    <ConceptPage
      title="Principal Component Analysis"
      tagline="Find the directions the data actually varies along, and keep only the ones that matter."
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
      history={
        <>
          <p>
            Height and weight carry a lot of the same information. Tell me one
            and I can guess the other tolerably well, which the statistics
            primer measured as their correlation, and the pattern only deepens
            with more measurements, since arm span, shoe size and sitting
            height all largely follow how big a person is. Karl Pearson, at
            University College London, asked in 1901 what to do with such
            data when no one column is the answer. Regression as Galton and
            Yule had left it treats one measurement as the outcome and the
            others as exact, and Pearson&rsquo;s paper &ldquo;On lines and
            planes of closest fit to systems of points in space&rdquo; started
            from the fact that every measurement of a body carries error, so
            the line wanted is the one closest to the points in every
            direction at once rather than the one whose vertical misses are
            smallest. He found it, and it is the direction of greatest spread
            that this page turns a bar through the crowd to look for.
          </p>
          <p>
            Harold Hotelling rebuilt the method in 1933 at Columbia, in
            &ldquo;Analysis of a complex of statistical variables into
            principal components&rdquo;, and his data were scores on batteries
            of mental tests, where Charles Spearman had argued in 1904 that
            the correlations among a child&rsquo;s test scores were explained
            by one underlying factor of general intelligence. Hotelling&rsquo;s
            question was how many directions such a table actually varied
            along and how much of the total variance each carried, and he
            gave the components their name and a way of computing them one at
            a time, by repeated multiplication, that was feasible by hand.
            Carl Eckart and Gale Young showed in 1936 that keeping the first
            few components gives the reconstruction of the original table
            closest in squared error that any fixed number of directions can
            give, which is the guarantee this page leans on when it rebuilds
            height and weight from one number. The difficulty underneath all
            three papers is the one this page has to be plain about. A
            component is a direction the data spreads along and nothing more;
            it is not a cause, it need not correspond to anything we would
            name, and how much variance a direction carries depends entirely
            on the units the columns were measured in.
          </p>
          <p>
            The page asks six questions in order. Why can several measured
            features overlap? What does it mean to look at data from a
            different direction? Which direction keeps the most variation?
            How does the covariance matrix find that direction? How are
            observations turned into fewer numbers and rebuilt? And what does
            the method discard or distort along the way?
          </p>
        </>
      }
      playground={<PcaPlayground />}
      sections={[
        {
          title: "Part 1. Redundant Measurements",
          defaultOpen: true,
          content: (
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
          ),
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
                  <p>
                    Their deviation is (10, 10), so the height part is
                    0.71 × 10 = 7.07, the weight part is also 7.07, and the
                    score is 14.14. Person 3, at (5, −5), has parts of 3.54
                    and −3.54, and a score of exactly zero. They sit on the
                    mean along this direction, however far from it they sit
                    along the other.
                  </p>
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
                  <p>
                    At 0 degrees, u = (1, 0) and Cu = (62.5, 37.5), which
                    is 31 degrees off the input. At 45 degrees, u = (0.71,
                    0.71) and Cu = (70.7, 70.7), exactly u scaled by 100.
                    Turn the slider and watch the amber arrow swing toward
                    the indigo one as the angle approaches 45, and again at
                    135, where the scaling factor is 25.
                  </p>
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
                  <p>
                    The playground reports each component&rsquo;s variance
                    with the sample divisor, so on the measured four it says
                    133.3 and 33.3 rather than 100 and 25. Same directions,
                    same shares, one common factor of 4 / 3 on the
                    variances.
                  </p>
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
                <p>
                  Now rotate the retained direction instead of accepting the
                  first component, and watch the total. The widget in
                  section 11 is the same instrument, and its discarded
                  readout is this total. It is smallest at the first
                  component, because for centred data the direction that
                  keeps the most variance and the direction that leaves the
                  smallest squared stubs are the same direction. Pythagoras
                  is why. Each person&rsquo;s squared distance from the mean
                  splits into a squared score plus a squared stub, and the
                  distances do not depend on the direction, so making the
                  scores as large as possible makes the stubs as small as
                  possible.
                </p>
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
                  PCA finds linear structure. Twelve people along a bend
                  have a one-dimensional pattern, their position along the
                  curve, and no straight axis follows it. The first component
                  does what it can, which is to lay a line across the bend
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
                <p>
                  Constant features are the case that deserves particular
                  care, because the two preprocessing choices treat them
                  oppositely. Raw, a constant column is harmless and simply
                  carries nothing. Standardised, it is a division by zero,
                  and the refusal is the right answer rather than a quiet
                  substitution.
                </p>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
