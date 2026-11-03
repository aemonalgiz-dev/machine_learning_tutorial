import { lessonIntuitions } from "@/lib/intuition";
import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { choice, trueFalse } from "@/lib/quizzes";
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
import { ChainContracts } from "@/components/widgets/ChainContracts";
import { ChainLattice } from "@/components/widgets/ChainLattice";
import { ChainTrace } from "@/components/widgets/ChainTrace";
import { FoldIndependence } from "@/components/widgets/FoldIndependence";
import { LeakageBarsPlayground } from "@/components/widgets/LeakageBarsPlayground";
import { SeedGapStrip } from "@/components/widgets/SeedGapStrip";
import { StepOrderChart } from "@/components/widgets/StepOrderChart";
import { TemplateLedger } from "@/components/widgets/TemplateLedger";

export const metadata: Metadata = {
  title: "Pipelines · Perceptron Lab",
  description:
    "Data preparation can learn settings from the observations it receives. Keeping preparation and prediction in one fitting procedure helps prevent evaluation data from influencing those settings.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function PipelinesPage() {
  return (
    <ConceptPage
      lessonId="pipelines"
      intuition={lessonIntuitions["pipelines"]}
      technicalStart="Part 2. One Chain, One Fit, One Predict"
      openingTitle="The Test Answers Can Leak in Before the Fit"
      playgroundTitle="Keep preprocessing and prediction on the same path"
      playgroundIntro="Follow the data through each transformation and into the model. Check which rows supply the fitted statistics and which rows only use them."
      title="Pipelines"
      tagline={"Data preparation can learn settings from the observations it receives. Keeping preparation and prediction in one fitting procedure helps prevent evaluation data from influencing those settings."}
      prerequisites={
        <>
          The folds come from the{" "}
          <Link href="/concepts/held-out-evaluation" className={link}>
            held-out evaluation page
          </Link>
          , the standardizer and the reason it is learned on the training
          rows from the{" "}
          <Link href="/concepts/feature-scaling" className={link}>
            feature scaling page
          </Link>
          , and the search from the{" "}
          <Link href="/concepts/grid-search" className={link}>
            grid search page
          </Link>
          . This page puts the three into one object and measures what the
          object saves, what it refuses, and what it makes possible that was
          not possible before.
        </>
      }

      playground={<LeakageBarsPlayground />}
      sections={[
        {
          title: "Part 1. Preprocessing Is Part of the Model",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. A held-out person arrives alone">
                <>
<p>Return to the twelve height and weight pairs from grid search. We reserve the people at heights 153, 165 and 177 centimeters, then fit a predictor on the other nine. The predictor expects standardized height. When a reserved person arrives, which mean and standard deviation should we use?</p>
                <p>Those reference values are part of what we learned from the training data. We need to keep them with the predictor so that a new height is expressed in the same units.</p>
                <p>A single arriving height cannot provide the training reference. Its own standard deviation is zero, so standardizing it against itself cannot reproduce the scale on which the predictor was fitted.</p>
              <p>Instead, retain the center and spread calculated from the training people. Every later person must pass through that same fitted transformation before the prediction rule uses the result. A pipeline keeps those dependent steps together.</p>
</>
                <ChainTrace />
                <>
<p>

                  The numbers in the boxes come from the nine training people. Their heights center at 167.11 cm with a spread of 10.38 cm, and the held-out person at 153 cm becomes −1.360 under those two numbers, at 165 cm −0.203, and at 177 cm 0.953. Press the second button and hold out the three tallest instead.
                </p>
                <p>Holding out the three tallest people lowers the training center to 162.11 cm and spread to 7.67 cm. Their standardized heights become 1.942, 2.334 and 2.725. These values measure distance above the training mean, not above the tallest training person. All three heights are outside the training range.</p>
</>
                <KeepInMind>
                  For this evaluation, reuse the reference learned from the training rows. Do not refit it on a held-out person or the held-out group. A pipeline keeps that reference with the model, provided the training procedure gives its fit method the correct rows.</KeepInMind>
              </SubSection>

              <SubSection title="2. The center and spread belong to the fit" id="2-the-centre-and-spread-belong-to-the-fit">
                <p>The training center and spread belong to the fitted prediction procedure. They change when we change the training rows, and later predictions need those same values. Holding out the middle three people leaves a different training group from holding out the tallest three. Each fitted standardizer must stay paired with the predictor trained using it.</p>
                <Equation>{"z = (height − 167.11) / 10.38        the middle three held out\nz = (height − 162.11) / 7.67         the three tallest held out"}</Equation>
                <WorkedExample title="The held-out person at 153 cm, by hand">
                  <>
                    <p>

                      The nine training heights add to 1504 centimeters. Their fitted
                      standard deviation is about 10.38 centimeters. Use those training
                      statistics for both held-out people.
                    </p>
                    <Equation>{"training mean = 1504 / 9 ≈ 167.11 cm\nscore at 153 cm ≈ (153 − 167.11) / 10.38 ≈ −1.360\nscore at 177 cm ≈ (177 − 167.11) / 10.38 ≈ 0.953"}</Equation>
                    <p>
                      Neither held-out person contributed to that mean or spread. The
                      values shown are rounded from the fitted training statistics.
                    </p>
                  </>
                </WorkedExample>
                <InAModel title="What the two fits predict">
                  <>
<p>With the middle three held out, the chain predicts 52.75, 63.66 and 74.98 kg for observed weights 52, 63 and 76 kg. Held-out R² is 0.9930 and training R² is 0.9917. Holding out the tallest three gives predictions 74.71, 77.61 and 80.53 kg for weights 76, 78 and 82 kg. All are underestimates in this example, with held-out R² 0.7871 and training R² 0.9872. Extrapolation makes this a different test, but does not inherently force predictions downward.</p>
                  <p>The standardizer still follows the correct procedure in both cases. What changed was the prediction problem: evaluating on the tallest people asks the fitted model to extend beyond the heights in its training group. Correct preprocessing does not guarantee accurate extrapolation.</p>
</>
                </InAModel>
                <KeepInMind>

                  Anything learned from the rows is part of the fit. A
                  standardizer&rsquo;s center and spread are learned from the
                  rows, so they are part of the fit, and they must be learned
                  wherever the model is learned and reused wherever the model
                  is used.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Two objects that must stay in step">
                <>
<p>Keeping a standardizer and predictor separate means keeping their fitted states consistent. In cross-validation, refit both using the current fold’s training rows. In a search, repeat that for every candidate. When serving predictions, reuse the transformation fitted with the deployed model. A mistake in any of these places can change what the predictor’s inputs mean.</p>
                <p>The rule is easy to explain but easy to lose when the surrounding code changes. A shared object can enforce the order at each place that uses the model.</p>
</>
                <p>A pipeline holds the preparation steps and predictor together. Calling fit learns the steps from the training rows and fits the predictor on their output. Calling predict applies the already-fitted steps before using the predictor. The caller can work with one prediction procedure instead of coordinating several fitted objects.</p>
                <KeepInMind>
                  Fitting preparation inside the pipeline removes repeated coordination between call sites. It still relies on the caller to supply the intended training rows and on each step to implement fit and transform correctly.</KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. One Chain, One Fit, One Predict",
          content: (
            <>
              <SubSection title="4. Steps in order, then the model">
                <p>
                  The chain on this page has two steps and a model. The first
                  step expands height to height and its square, the second
                  standardizes both columns, and the model is a ridge
                  regression at a penalty of one. Fit runs the steps in that
                  order on the training rows and then fits the model on what
                  the last step produced. Each step is named, the names are
                  unique, and the order the steps are given in is the order
                  they run in.
                </p>
                <Equation>{"fit      expanded = expansion fitted on the training rows, applied to them\n         scaled   = standardizer fitted on expanded, applied to expanded\n         model fitted on (scaled, training weights)\npredict  expanded = the fitted expansion, applied to the new rows\n         scaled   = the fitted standardizer, applied to expanded\n         model.predict(scaled)"}</Equation>
                <p>
                  A chain with no steps at all is allowed, and it is then the
                  model and nothing more, which is measured rather than
                  assumed. On the nine training people a chain with an empty
                  step list and a bare ridge at the same penalty predict the
                  three held-out weights to a largest difference of exactly
                  zero. Allowing the empty chain is what lets it be the
                  default wrapper rather than a special case a caller has to
                  decide about.
                </p>
                <KeepInMind>
                  A chain is an ordered list of named transformers followed by
                  one model, and it is itself a model of the same kind as the
                  one it ends in. A regression chain is a regressor; a
                  classification chain is a classifier.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. Each step learns from what the step before produced">
                <p>The expansion produces height and height-squared columns. The following standardizer learns separate reference values for both: height squared has center 28033.78 and spread 3467.39 on these nine people. Raw heights contain enough information to calculate their squares, but this standardizer learns statistics for the columns it actually receives, so the expansion must run first.</p>
                <Equation>{"standardizer, fitted after the expansion, learned\n  height    center 167.11     spread 10.38\n  height²   center 28033.78   spread 3467.39"}</Equation>
                <p>

                  The standardizer will receive expanded features when we predict, so it must learn its reference values from expanded training features too. If we fitted it on raw height alone, it would have no learned center or scale for the new height-squared column. The pipeline keeps this order consistent between fitting and prediction.
                </p>
                <KeepInMind>
                  The first step receives the raw input. Each later step fits the output of its predecessor, matching the order used during prediction. That keeps its learned reference values consistent with the representation it will receive later.</KeepInMind>
              </SubSection>

              <SubSection title="6. Predict applies and learns nothing">
                <p>

                  Predict is the shorter half. It hands the new rows to the
                  fitted expansion, hands what comes back to the fitted
                  standardizer, and hands what comes back from that to the
                  fitted model. Nothing is fitted anywhere along the way.
                  Measured on the chain in section 1, the standardizer&rsquo;s
                  center for height is 167.1111 before a predict on the three
                  held-out people and 167.1111 after it, the same number to
                  the last digit, because predict has no code path that could
                  change it.
                </p>
                <p>Prediction does not refit the transformation, so a new query cannot change its own reference values through this call. The training procedure must still pass only the intended training rows to fit. A pipeline can reuse fitted state correctly while still being fitted on the wrong data.</p>
                <KeepInMind>
                  Prediction applies the stored transformations without refitting them. This prevents a prediction call from recalculating its own scaling reference. It does not prevent leakage if evaluation rows were included in an earlier fit call.</KeepInMind>
              </SubSection>

              <SubSection title="7. Inside cross-validation nothing special happens">
                <p>
                  The held-out evaluation page&rsquo;s fold loop calls fit on a
                  fold&rsquo;s training rows and evaluate on its held-out
                  rows, once per fold, on whatever model it is handed. Hand it
                  the chain and it does exactly that, and since the
                  chain&rsquo;s fit fits the steps, the standardizer is
                  refitted on each fold&rsquo;s training rows for no reason
                  other than that fit was called. The loop knows nothing about
                  what the chain contains and needs to know nothing.
                </p>
                <InAModel title="Four folds over the twelve people">
                  <p>
                    Dealt into four folds with the page&rsquo;s seed, the
                    chain scores 0.9986, 0.9916, 0.9234 and 0.9894 on the
                    four held-out threes, a mean of 0.9758, and at every fold
                    the standardizer was fitted on that fold&rsquo;s nine
                    training people. Part 4 checks the claim in the previous
                    sentence rather than trusting it.
                  </p>
                </InAModel>
                <KeepInMind>
                  Cross-validating a chain needs no special entry point. The
                  fold loop calls fit and evaluate, and fit is what refits the
                  steps.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. The Leak, Measured",
          content: (
            <>
              <SubSection title="8. Where the leak comes from">
                <p>

                  Now the mistake the object exists to prevent, written down
                  and then measured. Standardize the columns once over all
                  the people, and only then deal the folds. Every training
                  fold has now been scaled by a center that its held-out rows
                  helped to compute. With five folds each training fold holds
                  four fifths of the rows, so the center over everyone is a
                  weighted average of the center the fold should have used
                  and the center of the rows it is about to be judged on.
                </p>
                <Equation>{"center over all rows = (4/5) · center of the training fold + (1/5) · center of the held-out fold"}</Equation>
                <>
<p>The playground repeats this comparison on seeded synthetic datasets of thirty, sixty or two hundred people. Each has height in centimeters, age in years, daily walking distance in kilometers and a weight generated from a linear combination of those measurements plus noise. Running several seeds shows how much the measured score difference varies with the sample.</p>
                <p>The columns have different spreads in their original units. Age varies more widely than walking distance, so it can contribute more to unscaled Euclidean distances. Standardization changes that balance before the nearest-neighbor model selects its neighbors.</p>
</>
                <KeepInMind>

                  Fitting on all rows lets held-out observations influence the learned transformation. With five equal folds, they contribute one fifth of the rows used for the overall mean. The standard deviation also changes, but it is not a simple weighted average of the two groups&rsquo; standard deviations.</KeepInMind>
              </SubSection>

              <SubSection title="9. A standardizer leaks little, and in no particular direction">
                <p>For seeds 0 through 29 with thirty people, fitting the standardizer before the folds gives mean held-out R² 0.4813; fitting it inside each fold gives 0.4830. The shortcut lowers the average by 0.0017 here, although it raises the score in fourteen of thirty seeds. At sixty and two hundred people the mean differences are +0.0004 and +0.0001. The sign and size vary across these datasets.</p>
                <NumberTable
                  headings={["people", "fitted before the folds", "fitted inside each fold", "gap", "seeds flattered", "largest single-seed gap"]}
                  rows={[
                    ["30", "0.4813", "0.4830", "−0.0017", "14 of 30", "0.1019"],
                    ["60", "0.7668", "0.7664", "+0.0004", "15 of 30", "0.0256"],
                    ["200", "0.8635", "0.8634", "+0.0001", "18 of 30", "0.0037"],
                  ]}
                  caption="Mean held-out R² of five-fold k-nearest neighbors at five neighbors, seeds 0 to 29. The gap is the first score less the second."
                />
                <SeedGapStrip />
                <p>Inspect the individual seed differences as well as their mean. At thirty people the largest gap is 0.1019, much larger than the average gap. Seeds 30 through 59 give a mean difference of −0.0104, again with fourteen of thirty shortcut scores higher. These runs show variability; they do not establish that every unsupervised preparation step has negligible leakage.</p>
                <KeepInMind>
                  For this standardizer and data generator, the average score difference is small and individual differences have either sign. That result does not measure every transformation that ignores target values. Keep preprocessing within the training split rather than relying on a universal small-effect assumption.</KeepInMind>
              </SubSection>

              <SubSection title="10. Why it is small, and why doubling the people shrinks it">
                <p>The nearest-neighbor model uses differences between standardized observations. Both observations have the same center subtracted, so that center cancels from their difference. The spread used to divide each column still affects distances and therefore which neighbors are selected.</p>
                <Equation>{"d(a, b)² = Σⱼ ((aⱼ − bⱼ) / sⱼ)²        the center mⱼ appears in neither term"}</Equation>
                <p>In this experiment, using all rows changes the spread estimates and therefore the relative influence of the columns. The score can move in either direction, as the repeated seeds show. A small average difference here does not make the shortcut valid or establish that preparation without target values is harmless in other problems.</p>
                <WhyThisWorks title="Why unpenalized least squares is less sensitive to scaling">
                  <>
<p>An unpenalized least-squares model with an intercept can compensate for an invertible shift and rescaling of its columns by changing its coefficients. Ridge adds a penalty on those coefficients, so changing the feature scales changes the fitting preference. That helps explain why the earlier low-penalty ridge experiment showed only small differences.</p>
                  <p>
                    Part 6 measures that same sensitivity from the other side.
                  </p>
</>
                </WhyThisWorks>
                <KeepInMind>

                  A shared center cancels from Euclidean differences, while feature scales still change their relative contributions. In ordinary least squares with an intercept, invertible shifts and rescalings can be absorbed into the coefficients. These special invariances explain parts of this example; they do not imply that transformations ignoring the target cannot bias evaluation.</KeepInMind>
              </SubSection>

              <SubSection title="11. A step that reads the target leaks the target">
                <>
<p>The lower panel uses twenty independently generated noise columns and an independent noise target. It selects the column with the strongest observed target correlation, then fits a nearest-neighbor predictor using that column. There is no population relationship to learn, although chance correlations appear in finite samples. Selecting with held-out targets can make those coincidences look useful during evaluation.</p>
                <p>At thirty people, choosing the column inside each training fold gives mean R² −0.8867. Choosing it using all rows before forming the folds gives −0.5979. Both scores remain negative, but the latter evaluation is less negative because its feature selection used target values that were later treated as held out.</p>
</>
                <NumberTable
                  headings={["people", "chosen before the folds", "chosen inside each fold", "gap", "seeds flattered", "largest single-seed gap"]}
                  rows={[
                    ["30", "−0.5979", "−0.8867", "+0.2888", "27 of 30", "0.7329"],
                    ["60", "−0.2696", "−0.4252", "+0.1556", "27 of 30", "0.4518"],
                    ["200", "−0.1985", "−0.2392", "+0.0407", "18 of 30", "0.1972"],
                  ]}
                  caption="The same folds and the same neighbors regressor as the standardizer's table, on twenty columns of noise beside a target of noise."
                />
                <>
                  <p>
                    Feature selection used the target values from the very rows later
                    presented as held out. Among twenty noise features, the strongest
                    chance correlation can look substantial on a small sample.
                  </p>
                  <p>In the thirty-person experiment, the shortcut raises the score in twenty-seven of thirty seeds. The mean gap becomes smaller at the larger sample sizes in the table. Even though these particular scores remain negative, the comparison shows how held-out answers can influence feature selection without any genuine predictive relationship.</p>
                </>
                <KeepInMind>

                  The two experiments use held-out information in different ways. Standardizing first uses the held-out inputs; selecting by correlation also uses their target values. The measured effects differ in size, but both procedures cross the evaluation boundary.</KeepInMind>
              </SubSection>

              <SubSection title="12. The size of the leak is not the argument">
                <>
<p>The standardization experiment produced small score differences, while selecting features using all target values produced a consistent advantage. These are results for the examples measured here. Preparation that does not read target values can still use information from held-out inputs, so we keep its fitting inside the training split rather than deciding by the size of a convenient result.</p>
                <p>The pipeline gives the fitting boundary one place to be enforced. The same object can be refitted inside a fold or evaluated as a search candidate, with preparation included. It also lets us compare complete configurations, such as an expansion degree together with the predictor’s penalty.</p>
</>
                <KeepInMind>
                  The chain is worth having when the leak is small, because
                  the leak is only one of the things it takes off the
                  caller&rsquo;s hands.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            trueFalse(
              "A held-out person could be standardized against their own center and spread rather than the training rows’.",
              false,
              "One height has no spread at all, so asking to standardize a single person is refused because the column is constant. The center and spread are read off the training rows, 167.11 cm and 10.38 cm for the nine people here, and under those two numbers the held-out person at 153 cm becomes −1.360. They change when the training rows change and a prediction cannot be made without them, which makes them a fitted parameter of the model in every sense that matters.",
            ),
            choice(
              "The chain expands height to height and its square, then standardizes. What does the standardizer learn the center and spread of?",
              [
                "Both columns the expansion handed it, including the square at center 28033.78 and spread 3467.39",
                "The raw height only, since that is the column the caller supplied",
                "The target weights, so that the ridge reads a centered target",
                "Nothing, because a standardizer placed after an expansion has no columns to measure",
              ],
              0,
              "A step is fitted on the output of the step before it, never on the raw input, because the output of the step before it is what it will see when the chain predicts. The square did not exist until the expansion made it, and a standardizer fitted on the raw height would meet a column called height squared that it had never learned a scaling for, and refuse it.",
            ),
            choice(
              "Standardizing over all the people and only then dealing the folds was measured against refitting inside each fold, at thirty people. What came back?",
              [
                "0.4813 against 0.4830, so the shortcut cost 0.0017 rather than flattering the score",
                "0.4830 against 0.4813, a small but consistent flattering of the shortcut",
                "The two arrangements agreed to the last digit",
                "The shortcut flattered the score by more than a tenth of a unit of R²",
              ],
              0,
              "In the thirty-person comparison, fitting the scaler before splitting gives mean R² 0.4813 rather than 0.4830. Individual seeds produce differences in both directions. Their average size decreases in the larger samples measured here, but one thirty-person seed has a gap of 0.1019. A small average difference does not validate the procedure: preprocessing should be fitted using the rows available at the intended training stage.",
            ),
            choice(
              "Why can the standardizer’s leak move the held-out score in either direction?",
              [
                "The leaked input spreads change distance weights, but do not guarantee whether this particular held-out score improves or worsens",
                "Because the folds are dealt from a different seed each time",
                "Because a standardizer is refitted on the held-out rows at predict time",
                "Because R² is not a signed quantity",
              ],
              0,
              "For a distance between two standardized rows, the common mean cancels while the fitted standard deviations set relative feature weights. Using all rows instead of training rows changes those weights and uses information about the held-out input distribution. It does not directly select a feature from the held-out labels, but that does not make the resulting evaluation valid or guarantee an unbiased score change. The observed score can move in either direction.",
            ),
            trueFalse(
              "The step that keeps whichever of twenty noise columns correlates best with a noise target leaks in one direction on most seeds, where the standardizer’s leak changes sign from one seed to the next.",
              true,
              "Choosing the column inside each fold scores −0.8867 at thirty people and choosing it on every person first scores −0.5979, which looks less bad, and the gap is positive in twenty-seven of thirty seeds and twenty-five of the next thirty. That step reads the target, so the held-out answers travel into the fit, which is the difference from a standardizer that reads only the columns.",
            ),
        ],
        },
        {
          title: "Part 4. The Configuration Is Never Fitted",
          content: (
            <>
              <SubSection title="13. A template and its fitted copy">
                <p>In this SDK, fitting copies the configured steps and model, fits those copies, and stores them only after the whole procedure succeeds. The supplied objects remain unchanged. This lets the same pipeline configuration be refitted on successive folds without replacing its configuration with the result of the preceding fit. Copying is the chosen implementation strategy; other APIs can provide fresh fits in other ways.</p>
                <TemplateLedger />
                <p>In the ledger, the supplied model and steps start unfitted and remain so after pipeline fitting. The stored copies are fitted and are separate objects. Refitting the pipeline on a different group of nine produces exactly the same held-out predictions as a fresh pipeline fitted on that group. This checks refitting for the components used in the example.</p>
                <KeepInMind>
                  The pipeline retains its supplied configuration and, after a successful fit, separate fitted copies. It does not fit the supplied objects in place. If an object was already fitted when supplied, it keeps that state; the pipeline uses its own refitted copy. Reading fitted steps before the pipeline&rsquo;s first successful fit raises an error.</KeepInMind>
              </SubSection>

              <SubSection title="14. Four folds, four independent fits">
                <p>Repeat the comparison inside cross-validation. At each fold, refit the shared pipeline on that fold&rsquo;s nine training rows and compare it with a fresh pipeline fitted on the same rows. The figure above each bar gives the largest prediction difference. Agreement checks for an observable effect of earlier fits on these predictions; it cannot prove that no unused internal state exists.</p>
                <FoldIndependence />
                <p>
                  Zero at every fold. Afterwards the shared object is fitted,
                  to the fourth fold it saw, and its configuration is still
                  unfitted, which is the same pair of facts the playground
                  reports about the chain it handed to a hundred and fifty
                  fits per column. Five folds would give five independent
                  fits, and thirty seeds of five folds give a hundred and
                  fifty, for the same reason.
                </p>
                <KeepInMind>
                  One chain object can be handed to every fold of a
                  cross-validation and every candidate of a search, because
                  each fit works on a fresh copy of the configuration and
                  leaves the configuration untouched.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Nothing is committed until everything succeeded">
                <>
<p>A refit can fail after some steps have succeeded. Storing those new steps immediately could leave them paired with the old predictor. The chain instead prepares the complete new fit before replacing the stored state. If any stage fails, the previous fitted procedure remains intact.</p>
                <p>
                  The ledger&rsquo;s seventh and eighth rows break a refit on purpose, handing the fitted chain a constant height column, which the standardizer refuses because a constant column has no spread.
                </p>
</>
                <Equation>{"refit on a constant column   refused, the column has zero variance\nstill fitted afterwards      yes\npredictions moved by         0.0"}</Equation>
                <p>
                  The refusal comes back by name, the chain is still fitted to
                  the nine people it had before, and its predictions on the
                  three held-out people have moved by exactly nothing. A
                  refit that fails leaves the previous fit whole rather than
                  half replaced.
                </p>
                <KeepInMind>
                  The pipeline prepares new fitted state before replacing the old state. A failure during these fit calls therefore leaves the previous steps and predictor paired together. That is a guarantee of the refit procedure, rather than protection against every possible later manual change to an object.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Searching a Setting Inside a Step",
          content: (
            <>
              <SubSection title="16. Degree is not the model's to choose">
                <>
<p>

                  The grid search page varied a neighbor count, which is a field of the neighbors model, and a ridge penalty, which is a field of the ridge model. The degree of the expansion in this chain is neither. It is a field of the expansion step, and a search over the ridge model alone has no way to reach it.
                </p>
                <p>
                  Asked to vary a degree on the ridge model, the search refuses at construction and names the two fields the model does have, its intercept switch and its penalty, and that refusal is quoted under the lattice below.
                </p>
</>
                <p>Wrapping the steps and predictor together gives the search a complete candidate to configure. It can vary the expansion as well as the ridge model and evaluate their combined effect. Without that wrapper, the same comparison would require a separate procedure that explicitly rebuilt both objects.</p>
                <KeepInMind>
                  This search API varies fields of the object it receives. Wrapping preparation and prediction exposes both as parts of one candidate. A different API could also search preprocessing by explicitly rebuilding the full procedure.</KeepInMind>
              </SubSection>

              <SubSection title="17. A candidate is a whole object">
                <>
                  <p>
                    Each search candidate combines a complete preprocessing sequence
                    with a model configuration. This example crosses four polynomial
                    degrees with four ridge penalties, then evaluates each combination
                    on four shared folds.
                  </p>
                  <Equation>{"candidates = 4 degrees × 4 penalties = 16\ncross-validation fits = 16 × 4 folds = 64"}</Equation>
                  <p>
                    Every candidate uses the same seeded folds, so their scores compare
                    configurations on the same partitions.
                  </p>
                </>
                <Equation>{"steps  ∈ { expand to 1 then standardize, expand to 2 then standardize, expand to 3 ..., expand to 4 ... }\nmodel  ∈ { ridge at 0.01, ridge at 0.1, ridge at 1, ridge at 10 }\ncandidates = 4 × 4 = 16        fits = 16 × 4 folds = 64"}</Equation>
                <ChainLattice />
                <KeepInMind>
                  A search over a chain varies whole configured objects, one
                  per value, and combines them into a grid. It never names a
                  field inside a step by a string.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. What the lattice says on the twelve people">
                <>
<p>
                  On the twelve people the search keeps degree 1 at a penalty of 0.1, with a mean held-out R² of 0.9796, and degree 1 at 0.01 finishes within a few millionths of it. Degree 2 at 0.1 scores 0.9790, degree 2 at 1 scores 0.9758, and every candidate at a penalty of 10 is far behind, degree 1 at 0.6157 and degree 4 at 0.9081.
                </p>
                <p>The highest and lowest candidate means differ by 0.3639. The largest changes here come from the ridge penalty; the polynomial degrees at each small penalty finish within 0.015 of one another. On these nearly linear data and these folds, expansion adds little measured benefit. That conclusion is specific to the compared candidates.</p>
</>
                <InAModel title="The Ideal Case">
                  <p>On the separate fifteen-person example, degree 1 with penalty 0.1 again has the highest mean score, 0.9976. The candidate range is 0.2828, driven largely by the poorer scores at penalty 10. Compare the near-ties as well as the winner: this grid distinguishes penalty choices more strongly than polynomial degrees.</p>
                </InAModel>
                <KeepInMind>
                  The reported winner has the highest mean score among the tested candidates. The score range describes this grid, not uncertainty about the winner or performance on new data. Selecting and reporting the best cross-validation score can be optimistic; a separate evaluation is still needed.</KeepInMind>
              </SubSection>

              <SubSection title="19. A misspelt name is refused, never ignored">
                <>
                  <p>
                    Some pipeline APIs address nested settings with a string combining
                    the step name and parameter name. Such an API can validate those
                    names; silently ignoring a misspelling is an implementation error,
                    not an inherent property of strings.
                  </p>
                  <p>
                    This SDK builds candidates from configured objects. Its constructors
                    reject unknown fields before the search starts, so an invalid
                    candidate cannot quietly become another copy of the default model.
                  </p>
                </>
                <Equation>{"a range over the chain's field \"stepz\"     refused at construction, the chain has \"model\" and \"steps\"\na range over the ridge model's \"degree\"    refused at construction, the model has \"fit_intercept\" and \"penalty\""}</Equation>
                <KeepInMind>
                  Rejecting an unknown setting prevents the search from silently evaluating the wrong configurations. These two invalid names fail before any fold is fitted. A search can otherwise finish successfully while testing something different from what the caller intended.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. The Order of the Steps",
          content: (
            <>
              <SubSection title="20. Expand then standardize, or standardize then expand">
                <p>

                  Does preprocessing order change the model? Expand height first and standardize afterwards, and ridge receives two centered, unit-spread columns. Standardize height first and square it afterwards, and the square column has mean one under the population-variance convention used here, with a different spread. The chart compares both orders at six penalties on the same four folds.
                </p>
                <StepOrderChart />
                <p>
                  At a penalty of zero the two orders score 0.9579 and 0.9579
                  and predict the three held-out weights to a largest
                  difference of 1.2e−13, which is rounding. At every positive
                  penalty they part, and the chain&rsquo;s own order scores
                  higher at each one, 0.9764 against 0.9581 at 0.01, 0.9790
                  against 0.9597 at 0.1, 0.9758 against 0.9523 at 1, and
                  0.8105 against 0.5539 at 10, with the held-out predictions
                  differing by 0.735 kg at a penalty of one and 2.334 kg at
                  ten.
                </p>
                <KeepInMind>
                  The order of preparation steps can change the available representations and the fitting preference. In this comparison, both orders span the same quadratic curves, but ridge penalizes their coefficients differently. Their cross-validation R² values differ by about a quarter at penalty ten.</KeepInMind>
              </SubSection>

              <SubSection title="21. Why a penalized model feels the order and least squares does not" id="21-why-a-penalised-model-feels-the-order-and-least-squares-does-not">
                <>
<p>
                  The two column sets span the same curves. Height and its square, or standardized height and its square, either pair together with an intercept can draw any parabola in height, so a fit that only asks which parabola is closest to the nine training people finds the same one either way. That is what the penalty of zero shows, and a plain least-squares model in place of the ridge gives the same 1.2e−13.
                </p>
                <p>Ridge penalizes the coefficients of the columns it receives. A change in representation can therefore change which prediction functions receive a large penalty, even when the available family of curves stays the same. The fitting objective depends on the representation as well as the predictions.</p>
</>
                <Equation>{"expand then standardize, penalty 1    height 4.821   height² 4.853        both columns center 0, spread 1\nstandardize then expand, penalty 1    height 9.191   height² 0.241        the square has center 1, spread 0.932"}</Equation>
                <p>Over heights from 150 to 183 cm, standardized height and standardized height squared are highly correlated. Ridge assigns them coefficients 4.821 and 4.853, illustrating the grouping discussed in the <Link href="/concepts/ridge-lasso" className={link}>ridge and lasso page</Link>. Standardizing before squaring creates a different basis: the squared standardized height represents curvature around the training mean, and the fitted coefficients are 9.191 and 0.241. Both orders can represent the same parabolas, but the same numeric penalty favors them differently. Standardizing last scores higher at each positive penalty tested here.</p>
                <KeepInMind>

                  For these two step orders, unpenalized least squares with an intercept can represent and fit the same quadratic functions. Ridge also depends on how those functions are expressed as coefficients. Standardizing the expanded columns gives both unit spread, while squaring an already standardized column gives a different coefficient basis.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Preserving the Order and Fitted State of Every Step" , id: "part-7-implementation-and-failure-contracts",
          content: (
            <>
              <SubSection title="22. What is fitted, what is copied and what prediction reuses" id="22-what-a-complete-implementation-specifies">
                <p>The order of a pipeline is part of the model. Each named step fits the output of the preceding step. Prediction reuses that fitted sequence and fits nothing, so the later rows cannot change their own reference.</p>
                <p>Here every fit works on copies of the configured steps and model, leaving the supplied objects unchanged. New fitted state is installed only if every stage succeeds. A supplied object can already have its own fit; the pipeline keeps its newly fitted copy separately.</p>
                <p>Nested search settings must identify the correct step and parameter. Also check the treatment of a wrong name, an empty step list, an incompatible final model and incoming columns that are missing, extra or reordered.</p>
                <KeepInMind>
                  Most of those are promises about what the chain does with
                  the objects it was given, which is why the last two steps
                  ask the chain rather than describe it.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. What the chain refuses, accepts, and lets through">
                <p>The table records how the chain responds to these cases. The widget repeats the checks when it loads, using the twelve-person dataset where observations are needed.</p>
                <DerivationTable
                  expressionHeading="Pipeline stage or input"
                  reasonHeading="Where fitting or prediction can fail"
                  rows={[
                    { expression: "no steps at all", reason: "accepted; the chain is the bare model, to a largest prediction gap of exactly zero." },
                    { expression: "no features at all", reason: "refused at the first step, since there is nothing to expand." },
                    { expression: "one training person, or a constant height column", reason: "refused by the standardizer, because a column with no spread cannot be scaled." },
                    { expression: "a height that is not a number", reason: "refused at the boundary, by the same guard every column here passes through." },
                    { expression: "a target shorter than the features", reason: "refused by name, with both lengths in the message." },
                    { expression: "a degree the training people cannot support", reason: "refused by this SDK’s ridge implementation because it requires at least as many rows as parameters; degree 9 on 8 people creates ten parameters. Ridge regression can be defined for this case mathematically, but this implementation imposes the row-count check." },
                    { expression: "predict before fit, or read the fitted steps before fit", reason: "refused; there is no fitted copy to read." },
                    { expression: "predict with a feature missing", reason: "refused, though not by the first step; a standardizer transforms the subset it is given, and the model behind it refuses the exact set it was fitted on being incomplete." },
                    { expression: "predict with a feature the fit never saw", reason: "depends on which step meets it. A standardizer refuses a column it never learned a scaling for; an expansion computes the terms it needs and ignores the rest." },
                    { expression: "predict with the features reordered", reason: "accepted; every step and the model match columns by name." },
                    { expression: "a step already fitted on other people, handed in", reason: "accepted and refitted from scratch on the training people; the handed-in object keeps its own fit, which the chain never reads." },
                    { expression: "a transformer as the model, or a classifier as a regression chain's model", reason: "refused at construction, by the declared type of the model field." },
                    { expression: "a binary-only classifier as a classification chain's model", reason: "refused at construction; the classification chain wraps a multi-class classifier so it can score every class." },
                    { expression: "a model handed in as a step", reason: "accepted at construction and fails inside fit with a bare attribute error, not a named refusal. Documented below." },
                    { expression: "two steps with one name, a blank name, or a name the chain does not run", reason: "refused by name, because the names are what a fitted chain is read and a step replaced by." },
                    { expression: "an unknown constructor keyword, or a search over a misspelt field", reason: "refused at construction, naming the fields that exist." },
                    { expression: "four people dealt into five folds", reason: "refused by the folds, before any chain is fitted." },
                    { expression: "a classification chain with one class in the target", reason: "refused by the classifier, since there is nothing to discriminate between." },
                  ]}
                />
                <ChainContracts />
                <KeepInMind>
                  Which refusal a bad row meets depends on which step meets it
                  first, and the two steps in this chain draw the line in
                  different places, since a standardizer can scale a subset and
                  an expansion needs every column a term uses. The chain does
                  not add a rule of its own; it runs the steps and lets each
                  one keep the rule it already had.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. Validation Limits and Extra Columns" id="24-documented-rather-than-defended">
                <>
<p>Some failures occur later than a caller might expect. The constructor accepts a named object as a step without checking that it can transform data. A ridge model supplied there is accepted initially, then fails during fit because the required transformation method is missing. That is a limitation of this implementation’s validation.</p>
                <p>An expansion ignores incoming columns it does not use, while a standardizer rejects a column for which it has no learned scaling. The same extra measurement can therefore be accepted or rejected depending on the first step. That behavior comes from each step&rsquo;s input contract.</p>
                <p>Checking a step’s interface at construction could catch the first problem earlier. The extra-column behavior comes from the steps’ different input rules. Combining steps into a pipeline does not automatically make those rules identical.</p>
</>
                <KeepInMind>

                  The pipeline coordinates fitting order and state replacement, but it inherits its steps&rsquo; input rules and validation limits. Check the complete configured sequence rather than assuming the wrapper adds stricter checks everywhere.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 4 to 6",
          quiz: [
            trueFalse(
              "After a chain has been fitted, the configured steps and the configured model report themselves fitted.",
              false,
              "They report themselves unfitted. Fit copies them, fits the copies and stores those, so the configuration stays exactly as it was built and a second fold cannot start from whatever the first fold learned. Refitting the same object on a different nine and comparing it with a chain built fresh for those nine gives predictions agreeing to a largest difference of exactly zero.",
            ),
            choice(
              "A fitted chain is refit on a constant height column, which the standardizer refuses. What is the chain left holding?",
              [
                "The previous fit whole, with its predictions on the three held-out people moved by exactly nothing",
                "Fitted steps from the new attempt beside a model from the old one",
                "No fit at all, since the refusal clears whatever was stored",
                "A standardizer that substituted a spread of one for the constant column",
              ],
              0,
              "The chain computes every part of a fit into a result first and stores nothing until the model has fitted too, so it either finishes a fit or keeps the one it had. The refusal comes back by name, the chain still reports itself fitted to the nine people it had before, and no caller ever meets a chain whose steps and model came from different fits.",
            ),
            choice(
              "Why can a search over the ridge model alone not vary the degree of the expansion?",
              [
                "Because the degree is a field of the expansion step, and a search can only vary a field of the model it was handed",
                "Because a degree is an integer and the search varies only continuous settings",
                "Because the expansion is fitted before the model and so is already fixed",
                "Because the search would have to refit the standardizer for every degree",
              ],
              0,
              "In this SDK, SearchSpace.over varies declared fields of the supplied model class. RidgeRegression has no polynomial-degree field. RegressionPipeline exposes its steps and final model as configuration, allowing candidate step sequences and ridge models to be evaluated together. Each candidate is then a complete procedure, including the preprocessing that must be refitted.",
            ),
            choice(
              "The sixteen candidates span scores by 0.3639. Small penalties give similar scores across degrees, while penalty 10 gives much lower scores. What does that full comparison suggest?",
              [
                "That the settings mattered, and that what mattered was the penalty rather than the degree",
                "That the winner is within noise of every other candidate",
                "That degree 4 is the only candidate worth keeping",
                "That the winning score is an honest estimate of future performance",
              ],
              0,
              "The full candidate results show that the large penalty accounts for the largest differences in this search. The range alone says only that candidate scores differ. Small degree differences on twelve nearly linear observations do not establish that one degree will generalize better. Since these same folds selected the winner, use separate evaluation or nested validation for an independent performance estimate.",
            ),
            trueFalse(
              "At a penalty of zero, expanding then standardizing and standardizing then expanding give the same held-out predictions.",
              true,
              "With a free intercept and no penalty, both feature orders span the same quadratic functions of height, giving equivalent least-squares predictions up to rounding. A coefficient penalty depends on the chosen coordinates, so the two orders need not select the same function once the penalty is positive. They differ in this dataset; that is not a guarantee of different predictions for every possible dataset or penalty.",
            ),
        ],
        },
        {
          title: "Practice. Fitting, Folding and Searching the Chain",
          practice: [
            exercise("Fit the chain on nine people and score the three held out",["Use the supplied RegressionPipeline: degree-two PolynomialFeatures, then Standardizer, then RidgeRegression(penalty=1). Hold out heights 153, 165 and 177 cm and fit on the other nine people. Print each fitted scaling's name, mean and standard deviation.", "Predict the three held-out weights and print each beside its actual value. Print held-out R² and mean squared error. Inspect the squared-height scaling as well as height: the standardizer receives both expanded columns."],`from oop_ml import (
    Feature,
    PipelineSteps,
    PolynomialFeatures,
    RegressionPipeline,
    RidgeRegression,
    Standardizer,
)

heights = [150, 153, 157, 159, 162, 165, 168, 171, 174, 177, 180, 183]
weights = [50, 52, 55, 57, 61, 63, 66, 71, 72, 76, 78, 82]
held = [1, 5, 9]
training = [index for index in range(12) if index not in held]

train_height = Feature("height", [heights[index] for index in training])
train_weight = Feature("weight", [weights[index] for index in training])
held_height = Feature("height", [heights[index] for index in held])
held_weight = Feature("weight", [weights[index] for index in held])

chain = RegressionPipeline(
    steps=PipelineSteps.of(terms=PolynomialFeatures(degree=2), scaler=Standardizer()),
    model=RidgeRegression(penalty=1.0),
)

# Fit the chain on the nine training people.
# Read the fitted standardizer out of the chain's fitted steps and print the
# name, centre and spread of every scaling it learned, to two places.
# Predict the three held-out weights and print each beside the truth.
# Evaluate on the held-out people and print the R squared and the mean
# squared error, each to four places.`,`from oop_ml import (
    Feature,
    PipelineSteps,
    PolynomialFeatures,
    RegressionPipeline,
    RidgeRegression,
    Standardizer,
)

heights = [150, 153, 157, 159, 162, 165, 168, 171, 174, 177, 180, 183]
weights = [50, 52, 55, 57, 61, 63, 66, 71, 72, 76, 78, 82]
held = [1, 5, 9]
training = [index for index in range(12) if index not in held]

train_height = Feature("height", [heights[index] for index in training])
train_weight = Feature("weight", [weights[index] for index in training])
held_height = Feature("height", [heights[index] for index in held])
held_weight = Feature("weight", [weights[index] for index in held])

chain = RegressionPipeline(
    steps=PipelineSteps.of(terms=PolynomialFeatures(degree=2), scaler=Standardizer()),
    model=RidgeRegression(penalty=1.0),
)

chain.fit([train_height], train_weight)

for scaling in chain.fitted_steps["scaler"].transformer.scalings:
    print(f"{scaling.name}: centre {scaling.mean:.2f}, spread {scaling.standard_deviation:.2f}")

predictions = chain.predict([held_height])
for height, weight, predicted in zip(held_height.values, held_weight.values, predictions):
    print(f"{height:.0f} cm weighs {weight:.0f} kg, predicted {predicted:.2f} kg")

evaluation = chain.evaluate([held_height], held_weight)
print(f"held-out R squared {evaluation.r2_score:.4f}")
print(f"held-out mean squared error {evaluation.mean_squared_error:.4f}")`,`height: centre 167.11, spread 10.38
height^2: centre 28033.78, spread 3467.39
153 cm weighs 52 kg, predicted 52.75 kg
165 cm weighs 63 kg, predicted 63.66 kg
177 cm weighs 76 kg, predicted 74.98 kg
held-out R squared 0.9930
held-out mean squared error 0.6773`,{...{ hints: ["A chain is fitted and asked for predictions exactly like a single model. fit takes a list of features and a target feature, and predict takes a list of features.", "The fitted copies of the steps are on the chain as fitted_steps and are addressed by the names the steps were given, so the standardizer is fitted_steps[\"scaler\"].transformer. Its scalings can be looped over, and each has a name, a mean and a standard_deviation.", "evaluate answers an object that has already paired each prediction with its truth. r2_score and mean_squared_error are properties of it."], check: numberCheck("What mean squared error does the chain score on the three held-out people, to four places?", 0.6773, 0.0005, "The held-out errors come from predictions made with preprocessing learned on the nine training people. The held-out rows are transformed by that retained preparation without contributing to its fitted center or spread.") },question:"Can a fitted pipeline predict held-out weights using training-only preprocessing?"}),
            exercise("Read the configuration back, then break a refit",["Fit the same chain on the same nine people. Then ask the objects the chain was built from whether they are fitted, ask the fitted copy of the model the same question, and check whether the two models are the same object. After that, refit the chain on a height column that is constant, catch what the library raises, and see what the chain is left holding.", "Print whether the configured model and transformers are fitted, whether fitted_model is fitted, and whether it is the same object as model. After the deliberate failed refit, compare the held-out predictions with those saved before the attempt."],`from oop_ml import (
    Feature,
    MLLibError,
    PipelineSteps,
    PolynomialFeatures,
    RegressionPipeline,
    RidgeRegression,
    Standardizer,
)

heights = [150, 153, 157, 159, 162, 165, 168, 171, 174, 177, 180, 183]
weights = [50, 52, 55, 57, 61, 63, 66, 71, 72, 76, 78, 82]
held = [1, 5, 9]
training = [index for index in range(12) if index not in held]

train_height = Feature("height", [heights[index] for index in training])
train_weight = Feature("weight", [weights[index] for index in training])
held_height = Feature("height", [heights[index] for index in held])
held_weight = Feature("weight", [weights[index] for index in held])

chain = RegressionPipeline(
    steps=PipelineSteps.of(terms=PolynomialFeatures(degree=2), scaler=Standardizer()),
    model=RidgeRegression(penalty=1.0),
)

chain.fit([train_height], train_weight)
# Print whether chain.model is fitted, whether each configured step's
# transformer is fitted, whether chain.fitted_model is fitted, and whether
# chain.fitted_model is the same object as chain.model.

before = [float(value) for value in chain.predict([held_height])]
# Try to fit the chain again on nine heights that are all 170.0. Catch the
# library's error and print its name and message. Then print whether the
# chain is still fitted and how far its three predictions moved.`,`from oop_ml import (
    Feature,
    MLLibError,
    PipelineSteps,
    PolynomialFeatures,
    RegressionPipeline,
    RidgeRegression,
    Standardizer,
)

heights = [150, 153, 157, 159, 162, 165, 168, 171, 174, 177, 180, 183]
weights = [50, 52, 55, 57, 61, 63, 66, 71, 72, 76, 78, 82]
held = [1, 5, 9]
training = [index for index in range(12) if index not in held]

train_height = Feature("height", [heights[index] for index in training])
train_weight = Feature("weight", [weights[index] for index in training])
held_height = Feature("height", [heights[index] for index in held])
held_weight = Feature("weight", [weights[index] for index in held])

chain = RegressionPipeline(
    steps=PipelineSteps.of(terms=PolynomialFeatures(degree=2), scaler=Standardizer()),
    model=RidgeRegression(penalty=1.0),
)

chain.fit([train_height], train_weight)
print(f"configured model fitted: {chain.model.is_fitted}")
for step in chain.steps:
    print(f"configured step {step.name} fitted: {step.transformer.is_fitted}")
print(f"fitted copy of the model fitted: {chain.fitted_model.is_fitted}")
print(f"copy is the configured object: {chain.fitted_model is chain.model}")

before = [float(value) for value in chain.predict([held_height])]
try:
    chain.fit([Feature("height", [170.0] * 9)], train_weight)
except MLLibError as refusal:
    print(type(refusal).__name__)
    print(refusal)

after = [float(value) for value in chain.predict([held_height])]
print(f"still fitted: {chain.is_fitted}")
print(f"predictions moved by {max(abs(new - old) for new, old in zip(after, before))}")`,`configured model fitted: False
configured step terms fitted: False
configured step scaler fitted: False
fitted copy of the model fitted: True
copy is the configured object: False
AllSameValuesError
feature_values must not be constant (zero variance)
still fitted: True
predictions moved by 0.0`,{...{ hints: ["Every model and every transformer in the library answers is_fitted. The configuration is chain.model and chain.steps, and the results of the fit are chain.fitted_model and chain.fitted_steps.", "Looping over chain.steps gives each step in the order it runs, with a name and the transformer it wraps."] },question:"Does a failed refit preserve the previous fitted pipeline?"}),
            exercise("Fold the chain, then let a search choose the degree",["Evaluate the complete pipeline with four-fold KFold under random_seed=4. Print each fold's held-out R² and their mean. Then search all combinations of polynomial degrees 1 through 4 and ridge penalties 0.01, 0.1, 1 and 10 using those same folds.", "Print every candidate's degree, penalty and mean score, then best_score and score_spread. Also print the degree-three, penalty-one result separately. Check that each candidate refits its preprocessing within the fold rather than reusing another candidate's fitted statistics."],`from oop_ml import (
    CrossValidation,
    Dataset,
    Feature,
    GridSearch,
    KFold,
    PipelineSteps,
    PolynomialFeatures,
    RegressionPipeline,
    RidgeRegression,
    SearchSpace,
    Standardizer,
)

heights = [150, 153, 157, 159, 162, 165, 168, 171, 174, 177, 180, 183]
weights = [50, 52, 55, 57, 61, 63, 66, 71, 72, 76, 78, 82]
dataset = Dataset([Feature("height", heights)], Feature("weight", weights))
folds = KFold(n_folds=4, random_seed=4)

chain = RegressionPipeline(
    steps=PipelineSteps.of(terms=PolynomialFeatures(degree=2), scaler=Standardizer()),
    model=RidgeRegression(penalty=1.0),
)
# Cross-validate the chain on the folds and print each fold's R squared and
# the mean, to four places.

# Build a SearchSpace over RegressionPipeline whose steps are four whole
# PipelineSteps, one per degree, and whose model is four whole
# RidgeRegression objects, one per penalty. Search it with a GridSearch on
# the same folds, print each candidate's degree, penalty and score, and
# then the winner's score, the spread, and degree 3's score at a penalty of 1.`,`from oop_ml import (
    CrossValidation,
    Dataset,
    Feature,
    GridSearch,
    KFold,
    PipelineSteps,
    PolynomialFeatures,
    RegressionPipeline,
    RidgeRegression,
    SearchSpace,
    Standardizer,
)

heights = [150, 153, 157, 159, 162, 165, 168, 171, 174, 177, 180, 183]
weights = [50, 52, 55, 57, 61, 63, 66, 71, 72, 76, 78, 82]
dataset = Dataset([Feature("height", heights)], Feature("weight", weights))
folds = KFold(n_folds=4, random_seed=4)

chain = RegressionPipeline(
    steps=PipelineSteps.of(terms=PolynomialFeatures(degree=2), scaler=Standardizer()),
    model=RidgeRegression(penalty=1.0),
)
result = CrossValidation(folds=folds).evaluate(chain, dataset)
print("fold scores", [round(evaluation.r2_score, 4) for evaluation in result])
print(f"mean {result.mean_r2_score:.4f}")

space = SearchSpace.over(
    RegressionPipeline,
    steps=[
        PipelineSteps.of(terms=PolynomialFeatures(degree=degree), scaler=Standardizer())
        for degree in (1, 2, 3, 4)
    ],
    model=[RidgeRegression(penalty=penalty) for penalty in (0.01, 0.1, 1.0, 10.0)],
)
search = GridSearch(folds=folds).search(chain, space, dataset)
for scored in search:
    degree = scored.candidate.value_for("steps")["terms"].transformer.degree
    penalty = scored.candidate.value_for("model").penalty
    print(f"degree {degree}, penalty {penalty}: {scored.score:.4f}")
    if degree == 3 and penalty == 1.0:
        asked = scored.score

print(f"winner {search.best_score:.4f}, spread {search.score_spread:.4f}")
print(f"degree 3 at a penalty of 1: {asked:.4f}")`,`fold scores [0.9986, 0.9916, 0.9234, 0.9894]
mean 0.9758
degree 1, penalty 0.01: 0.9796
degree 1, penalty 0.1: 0.9796
degree 1, penalty 1.0: 0.9678
degree 1, penalty 10.0: 0.6157
degree 2, penalty 0.01: 0.9764
degree 2, penalty 0.1: 0.9790
degree 2, penalty 1.0: 0.9758
degree 2, penalty 10.0: 0.8105
degree 3, penalty 0.01: 0.9699
degree 3, penalty 0.1: 0.9761
degree 3, penalty 1.0: 0.9751
degree 3, penalty 10.0: 0.8787
degree 4, penalty 0.01: 0.9651
degree 4, penalty 0.1: 0.9717
degree 4, penalty 1.0: 0.9717
degree 4, penalty 10.0: 0.9081
winner 0.9796, spread 0.3639
degree 3 at a penalty of 1: 0.9751`,{...{ hints: ["CrossValidation is built with the folds and its evaluate takes the chain and the dataset. The result can be looped over, one evaluation per fold, and it carries mean_r2_score.", "SearchSpace.over takes the class being searched and then one list per field. The chain has two fields, steps and model, and each list holds whole objects that their own constructors have already checked.", "GridSearch is built with the folds, and its search takes a prototype, the space and the dataset. Looping over what it answers gives every scored candidate.", "A candidate hands back the object it carried for a field through value_for, so the degree is value_for(\"steps\")[\"terms\"].transformer.degree and the penalty is value_for(\"model\").penalty."], check: numberCheck("What mean held-out R squared does the degree 3 chain score at a penalty of one, to four places?", 0.9751, 0.0005, "This candidate is evaluated on the same folds as the other degree-and-penalty settings. Its score belongs to the complete refitted pipeline, including the transformations learned inside each training fold.") },question:"Can cross-validation and search refit every preprocessing stage within its fold?"}),
            exercise("Run the two steps in the other order",["Part 6 says the order of the steps is part of the model. Build the chain both ways round, expanding and then standardizing, and standardizing and then expanding, and cross-validate each on the same four folds at penalties of 0, 1 and 100.", "Print both mean held-out R² values at each penalty, then the expand-first result at penalty 100 separately. Before running, consider why both orders can represent the same quadratic without a penalty but penalize its coefficient representations differently."],`from oop_ml import (
    CrossValidation,
    Dataset,
    Feature,
    KFold,
    PipelineSteps,
    PolynomialFeatures,
    RegressionPipeline,
    RidgeRegression,
    Standardizer,
)

heights = [150, 153, 157, 159, 162, 165, 168, 171, 174, 177, 180, 183]
weights = [50, 52, 55, 57, 61, 63, 66, 71, 72, 76, 78, 82]
dataset = Dataset([Feature("height", heights)], Feature("weight", weights))
folds = KFold(n_folds=4, random_seed=4)

for penalty in (0.0, 1.0, 100.0):
    expand_first = PipelineSteps.of(terms=PolynomialFeatures(degree=2), scaler=Standardizer())
    scale_first = PipelineSteps.of(scaler=Standardizer(), terms=PolynomialFeatures(degree=2))
    # Wrap each set of steps in a RegressionPipeline around a ridge at this
    # penalty, cross-validate both on the folds, and print the two mean
    # scores to four places.

# Print the expand-first score at a penalty of 100 on a line of its own.`,`from oop_ml import (
    CrossValidation,
    Dataset,
    Feature,
    KFold,
    PipelineSteps,
    PolynomialFeatures,
    RegressionPipeline,
    RidgeRegression,
    Standardizer,
)

heights = [150, 153, 157, 159, 162, 165, 168, 171, 174, 177, 180, 183]
weights = [50, 52, 55, 57, 61, 63, 66, 71, 72, 76, 78, 82]
dataset = Dataset([Feature("height", heights)], Feature("weight", weights))
folds = KFold(n_folds=4, random_seed=4)

for penalty in (0.0, 1.0, 100.0):
    expand_first = PipelineSteps.of(terms=PolynomialFeatures(degree=2), scaler=Standardizer())
    scale_first = PipelineSteps.of(scaler=Standardizer(), terms=PolynomialFeatures(degree=2))
    scores = []
    for steps in (expand_first, scale_first):
        chain = RegressionPipeline(steps=steps, model=RidgeRegression(penalty=penalty))
        scores.append(CrossValidation(folds=folds).evaluate(chain, dataset).mean_r2_score)
    print(f"penalty {penalty}: expand first {scores[0]:.4f}, standardize first {scores[1]:.4f}")

print(f"expand first at a penalty of 100: {scores[0]:.4f}")`,`penalty 0.0: expand first 0.9579, standardize first 0.9579
penalty 1.0: expand first 0.9758, standardize first 0.9523
penalty 100.0: expand first 0.0257, standardize first -0.1614
expand first at a penalty of 100: 0.0257`,{...{ hints: ["PipelineSteps.of runs its steps in the order the keywords are written, so swapping the two keywords is the whole of the change.", "Each cross-validation needs a chain of its own, built from one set of steps and a ridge at the penalty in hand. The folds are seeded, so both orders are judged on the same four deals."], check: numberCheck("What does the expand-first chain score at a penalty of 100, to four places?", 0.0257, 0.0005, "Changing step order changes the coordinates being penalized. At this large penalty both procedures lose much of their predictive fit; their score difference on these folds does not make either configuration useful.") },question:"Does the order of expansion and scaling change a regularized fit?"}),
          ],
        },
      ]}
    />
  );
}
