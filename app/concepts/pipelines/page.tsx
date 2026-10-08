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
  title: "Pipelines · oop_ml",
  description:
    "Preparing data is part of fitting a model. If a scaler learns from our test examples, the test has already influenced the result. A pipeline helps us keep those fitting steps together and inside the training procedure.",
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
      playgroundIntro="Follow the data through each transformation and into the model. Check which rows supply the fitted statistics and which rows only use them."
      title="Pipelines"
      tagline={"Preparing data is part of fitting a model. If a scaler learns from our test examples, the test has already influenced the result. A pipeline helps us keep those fitting steps together and inside the training procedure."}
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
<p>
                  Take the grid search page&rsquo;s twelve people, measured by height in centimetres and weight in kilograms, and hold three of them out, the people at 153, 165 and 177 cm. A model that predicts weight from standardized height is fitted on the other nine, and now the first held-out person arrives to be scored. Their height has to be standardized before the model can read it, and the question is what centre and what spread to subtract and divide by.
                </p>
                <p>
                  Their own are no use. One height has no spread at all, so asking to standardize a single person is refused, because the column is constant.
                </p>
</>
                <ChainTrace />
                <>
<p>
                  The numbers in the boxes come from the nine training people. Their heights centre at 167.11 cm with a spread of 10.38 cm, and the held-out person at 153 cm becomes −1.360 under those two numbers, at 165 cm −0.203, and at 177 cm 0.953. Press the second button and hold out the three tallest instead.
                </p>
                <p>
                  The centre falls to 162.11 and the spread to 7.67, and the three held-out heights standardize to 1.942, 2.334 and 2.725, more than two spreads above anyone the fit saw, which is the truth about them and is what the scaled numbers should say.
                </p>
</>
                <KeepInMind>
                  A held-out row is measured against the training rows, never
                  against itself or against the other held-out rows. The
                  feature scaling page showed what goes wrong when it is
                  measured against itself; this page is about the object that
                  stops the question ever arising.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. The centre and spread belong to the fit">
                <p>
                  So the centre and spread are learned from the training
                  people and reused on everyone who comes later, which makes
                  them a fitted parameter of the model in every sense that
                  matters. They were read off the training rows, they change
                  when the training rows change, and a prediction cannot be
                  made without them. The middle three and the tallest three
                  give two different standardizers from the same twelve
                  people, because the nine left to train on differ, and each
                  standardizer is the right one for the model fitted beside
                  it.
                </p>
                <Equation>{"z = (height − 167.11) / 10.38        the middle three held out\nz = (height − 162.11) / 7.67         the three tallest held out"}</Equation>
                <WorkedExample title="The held-out person at 153 cm, by hand">
                  <>
                    <p>
                      The nine training heights add to 1504 centimetres. Their fitted
                      standard deviation is about 10.38 centimetres. Use those training
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
<p>
                    With the middle three held out the chain predicts 52.75, 63.66 and 74.98 kg for people who weigh 52, 63 and 76, a held-out R² of 0.9930 against a training R² of 0.9917. With the tallest three held out it predicts 74.71, 77.61 and 80.53 kg for people who weigh 76, 78 and 82, every one an underestimate, since the chain is reaching past its data, and the held-out R² falls to 0.7871 while the training R² stays at 0.9872.
                  </p>
                  <p>
                    The standardizer did not cause that gap; the three tallest people are simply outside what nine shorter ones can teach.
                  </p>
</>
                </InAModel>
                <KeepInMind>
                  Anything learned from the rows is part of the fit. A
                  standardizer&rsquo;s centre and spread are learned from the
                  rows, so they are part of the fit, and they must be learned
                  wherever the model is learned and reused wherever the model
                  is used.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Two objects that must stay in step">
                <>
<p>
                  Written by hand, that is two objects to keep in step, a standardizer and a model, with a rule that the standardizer is fitted exactly where the model is fitted and applied exactly where the model predicts. Every place the model is used is a place the rule can be broken. A fold loop written by hand has to refit the standardizer on each fold&rsquo;s training rows; a search over settings has to do it for every candidate at every fold; a serving endpoint has to apply the one standardizer that the deployed model was fitted with and never another.
                </p>
                <p>
                  None of that is hard, and each is the kind of rule that is right when the loop is first written and wrong after the third change to it.
                </p>
</>
                <p>
                  The alternative is to make the two objects one. A chain
                  holds its steps and its model together and exposes the same
                  fit and predict as any single model on this site, so
                  wherever a model is fitted the steps are fitted, and
                  wherever a model predicts the fitted steps are applied,
                  because there is nowhere else the fitting or the applying
                  could happen.
                </p>
                <KeepInMind>
                  The rule that preprocessing is fitted on the training rows
                  and reused elsewhere is easy to state and easy to break in
                  one of several places. An object that fits its steps inside
                  its own fit has no such places.
                </KeepInMind>
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
                <p>
                  The standardizer in this chain does not learn the centre
                  and spread of height. It learns the centre and spread of
                  whatever the expansion handed it, which is two columns,
                  height and height squared, and the boxes in section 1 show
                  both. On the nine training people the square centres at
                  28033.78 with a spread of 3467.39, numbers the standardizer
                  could not have known from the raw height, because the
                  column did not exist until the expansion made it.
                </p>
                <Equation>{"standardizer, fitted after the expansion, learned\n  height    centre 167.11     spread 10.38\n  height²   centre 28033.78   spread 3467.39"}</Equation>
                <p>
                  That is the rule, and at predict time nothing else would
                  work, since the standardizer will be handed the
                  expansion&rsquo;s output and so has to have been fitted on
                  the expansion&rsquo;s output; a standardizer fitted on the
                  raw height would meet a column called height squared that it
                  had never learned a scaling for, and refuse it.
                </p>
                <KeepInMind>
                  A step is fitted on the output of the step before it, never
                  on the raw input, because the output of the step before it
                  is what it will see when the chain predicts.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Predict applies and learns nothing">
                <p>
                  Predict is the shorter half. It hands the new rows to the
                  fitted expansion, hands what comes back to the fitted
                  standardizer, and hands what comes back from that to the
                  fitted model. Nothing is fitted anywhere along the way.
                  Measured on the chain in section 1, the standardizer&rsquo;s
                  centre for height is 167.1111 before a predict on the three
                  held-out people and 167.1111 after it, the same number to
                  the last digit, because predict has no code path that could
                  change it.
                </p>
                <p>
                  That sentence is the whole of the leak protection at serving
                  time. There is no second call site where a transformer could
                  be fitted on the rows being scored, since the only place a
                  transformer is ever fitted is inside fit, and fit is called
                  on the training rows.
                </p>
                <KeepInMind>
                  Fit is the only method that learns, and predict only applies
                  what fit learned, so a chain cannot be asked to standardize
                  the rows it is scoring against themselves; no method of it
                  does that.
                </KeepInMind>
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
                  fold has now been scaled by a centre that its held-out rows
                  helped to compute. With five folds each training fold holds
                  four fifths of the rows, so the centre over everyone is a
                  weighted average of the centre the fold should have used
                  and the centre of the rows it is about to be judged on.
                </p>
                <Equation>{"centre over all rows = (4/5) · centre of the training fold + (1/5) · centre of the held-out fold"}</Equation>
                <>
<p>
                  Whether that matters, and how much, cannot be settled by looking at the formula, so the playground at the top of the page measures it. Twelve hand-typed people are too few to fold thirty times over, so the measurement draws people by seed, thirty, sixty or two hundred of them, measured by height in centimetres, age in years and how far they walk in a day in kilometres, with a weight that is a plain line through the three plus a little noise.
                </p>
                <p>
                  The three columns are on three different scales, so a k-nearest neighbours regressor that skipped the standardizer would let age decide who is near, and the standardizer genuinely has work to do.
                </p>
</>
                <KeepInMind>
                  The leak is the share of the held-out rows in whatever the
                  transformer learned. For a standardizer that is a fifth of a
                  centre and a fifth of a spread, and the question is how much
                  of that reaches the score.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. A standardizer leaks little, and in no particular direction">
                <p>
                  Press the button for the first thirty seeds and read the
                  thirty-people column. Fitted on every person and then
                  folded, the standardizer arrangement scores a mean held-out
                  R² of 0.4813; refitted inside each fold it scores 0.4830.
                  The shortcut did not flatter the score at all here, it cost
                  0.0017, and fourteen of the thirty seeds went the other way.
                  At sixty people the gap is +0.0004 with fifteen of thirty
                  flattered, and at two hundred it is +0.0001 with eighteen of
                  thirty, a coin toss that shrinks as the people multiply.
                </p>
                <NumberTable
                  headings={["people", "fitted before the folds", "fitted inside each fold", "gap", "seeds flattered", "largest single-seed gap"]}
                  rows={[
                    ["30", "0.4813", "0.4830", "−0.0017", "14 of 30", "0.1019"],
                    ["60", "0.7668", "0.7664", "+0.0004", "15 of 30", "0.0256"],
                    ["200", "0.8635", "0.8634", "+0.0001", "18 of 30", "0.0037"],
                  ]}
                  caption="Mean held-out R² of five-fold k-nearest neighbours at five neighbours, seeds 0 to 29. The gap is the first score less the second."
                />
                <SeedGapStrip />
                <p>
                  The strip is the number that matters. A step that leaked
                  something worth having would flatter most seeds, and this
                  one flatters fourteen of thirty and costs the other sixteen,
                  with the dots straddling zero and the largest single-seed
                  gap at thirty people, 0.1019, larger than the mean gap by a
                  factor of sixty. Press the button for seeds 30 to 59 and the
                  mean is −0.0104 with fourteen of thirty flattered again. I
                  have not found a family of seeds on which the standardizer
                  flatters more than about half of them.
                </p>
                <KeepInMind>
                  For a transformer that never reads the target the leak is
                  real, small, and as likely to hurt the score as to help it.
                  Reporting it as a scare would be reporting something the
                  measurement does not show.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Why it is small, and why doubling the people shrinks it">
                <p>
                  Two reasons, and the model is the first. Nearest neighbours
                  reads only distances, and a distance between two
                  standardized people subtracts the same centre from both, so
                  the centre cancels entirely and only the spread survives.
                </p>
                <Equation>{"d(a, b)² = Σⱼ ((aⱼ − bⱼ) / sⱼ)²        the centre mⱼ appears in neither term"}</Equation>
                <p>
                  What leaks, then, is the ratio of each column&rsquo;s spread
                  over everyone to its spread over the training fold, a number
                  close to one that reweights the three columns by a fraction
                  shrinking like one over the number of people. That is the
                  second reason. Nothing about that ratio knows the weight, so
                  it cannot lean the fit toward the held-out answers any more
                  than away from them, and a leak that is blind to the target
                  can move the score in either direction, which is why
                  fourteen of thirty seeds were flattered and sixteen were
                  not.
                </p>
                <WhyThisWorks title="Why the held-out evaluation page's line felt even less">
                  <>
<p>
                    That page measured the same leak on a ridge fit at a small penalty and found gaps of a few ten-thousandths, and the reason is one step further along the same argument. A least-squares line is unchanged by any rescaling of its columns, since the slope simply rescales to match, so for it neither the centre nor the spread leaks anything at all; only the penalty, which charges for the size of a coefficient and so notices what scale the coefficient is in, lets any of the standardizer&rsquo;s numbers through.
                  </p>
                  <p>
                    Part 6 measures that same sensitivity from the other side.
                  </p>
</>
                </WhyThisWorks>
                <KeepInMind>
                  A centre cancels out of every distance and every
                  least-squares line. A spread is a ratio near one that
                  approaches one as the rows grow. Neither consults the target,
                  which is why neither can bias the score.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. A step that reads the target leaks the target">
                <>
<p>
                  The lower panel of the playground fits something deliberately not built here, a step that keeps whichever of twenty noise columns correlates best with a target that is itself noise. No column deserves any score above zero, and a neighbours fit on any one of them should do worse than answering the mean weight every time.
                </p>
                <p>
                  Both arrangements do exactly that. Choosing the column inside each fold scores −0.8867 at thirty people, and choosing it on every person first scores −0.5979, which looks less bad by a margin that has survived every family of seeds I have run.
                </p>
</>
                <NumberTable
                  headings={["people", "chosen before the folds", "chosen inside each fold", "gap", "seeds flattered", "largest single-seed gap"]}
                  rows={[
                    ["30", "−0.5979", "−0.8867", "+0.2888", "27 of 30", "0.7329"],
                    ["60", "−0.2696", "−0.4252", "+0.1556", "27 of 30", "0.4518"],
                    ["200", "−0.1985", "−0.2392", "+0.0407", "18 of 30", "0.1972"],
                  ]}
                  caption="The same folds and the same neighbours regressor as the standardizer's table, on twenty columns of noise beside a target of noise."
                />
                <>
                  <p>
                    Feature selection used the target values from the very rows later
                    presented as held out. Among twenty noise features, the strongest
                    chance correlation can look substantial on a small sample.
                  </p>
                  <p>
                    The resulting score inflation is positive in twenty-seven of thirty
                    seeds in this experiment. It shrinks as the sample grows, but
                    remains visible. A seemingly useful score can therefore arise from
                    leaking answers into feature selection even when the input features
                    contain no predictive information.
                  </p>
                </>
                <KeepInMind>
                  A centre and a spread leak a fifth of two numbers that never
                  consulted the weight, and the score moves either way by a
                  few thousandths. A column chosen by its correlation with the
                  target carries the held-out answers into the fit, and the gap
                  kept its sign on twenty-seven seeds of thirty and on
                  twenty-five of the next thirty.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. The size of the leak is not the argument">
                <>
<p>
                  It would be easy to read Part 3 as saying the chain matters only for a step that reads the target, and that reading is half right. No step on this page reads the target, and for the steps that are here the leak is within noise of zero. The argument for the object was never the size of the penalty for getting the fold wrong.
                </p>
                <p>
                  It is that the question stops being the caller&rsquo;s to remember, at every fold, every candidate and every serving call, and that once the steps and the model are one object a setting inside a step becomes something a search can vary. Parts 4 and 5 are about those two things.
                </p>
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
              "A held-out person could be standardized against their own centre and spread rather than the training rows’.",
              false,
              "One height has no spread at all, so asking to standardize a single person is refused because the column is constant. The centre and spread are read off the training rows, 167.11 cm and 10.38 cm for the nine people here, and under those two numbers the held-out person at 153 cm becomes −1.360. They change when the training rows change and a prediction cannot be made without them, which makes them a fitted parameter of the model in every sense that matters.",
            ),
            choice(
              "The chain expands height to height and its square, then standardizes. What does the standardizer learn the centre and spread of?",
              [
                "Both columns the expansion handed it, including the square at centre 28033.78 and spread 3467.39",
                "The raw height only, since that is the column the caller supplied",
                "The target weights, so that the ridge reads a centred target",
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
              "The shortcut did not flatter the score at all there, and fourteen of the thirty seeds went the other way. At sixty people the gap is +0.0004 and at two hundred +0.0001, a coin toss that shrinks as the people multiply, and the largest single-seed gap at thirty people is 0.1019, which is sixty times the mean gap.",
            ),
            choice(
              "Why can the standardizer’s leak move the held-out score in either direction?",
              [
                "Because what leaks is a ratio of spreads that never consults the target",
                "Because the folds are dealt from a different seed each time",
                "Because a standardizer is refitted on the held-out rows at predict time",
                "Because R² is not a signed quantity",
              ],
              0,
              "A distance between two standardized people subtracts the same centre from both, so the centre cancels and only the spread survives. What leaks is the ratio of each column’s spread over everyone to its spread over the training fold, a number close to one, and nothing about that ratio knows the weight, so it cannot lean the fit toward the held-out answers any more than away from them.",
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
                <p>
                  Section 7 handed one chain object to four folds in turn and
                  claimed each fold got its own fit. For that to be true the
                  steps and the model a caller builds the chain from must never
                  themselves be fitted, or the second fold would start from
                  whatever the first fold learned. So fit copies them. The
                  copies are fitted and stored, and the originals, which are
                  the configuration, stay exactly as they were built. The
                  ledger reads that claim off a chain fitted on the nine
                  training people.
                </p>
                <TemplateLedger />
                <p>
                  The configured model and both configured steps report
                  themselves unfitted after the fit; the fitted copies report
                  themselves fitted; and the copies are different objects from
                  the configuration, so a change to one cannot reach the other.
                  Refitting the same object on a different nine and comparing
                  it with a chain built fresh for those nine gives predictions
                  that agree to a largest difference of exactly zero, which is
                  what starting from scratch means.
                </p>
                <KeepInMind>
                  A chain holds a configuration and, after fit, a fitted copy
                  of it. The configuration is a description and is never
                  fitted; the copy is the result. Reading the fitted steps of
                  an unfitted chain is refused, since there is no copy yet.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. Four folds, four independent fits">
                <p>
                  The same check, run inside the fold loop. At each of the
                  four folds the shared object is refitted on that fold&rsquo;s
                  nine and scored on its three, and a chain built fresh for
                  the fold is fitted and scored beside it. If anything from an
                  earlier fold survived on the shared object the two would
                  differ somewhere; the figure over each bar is the largest
                  difference between their predictions on that fold.
                </p>
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
<p>
                  A fit can fail halfway. The expansion may succeed and the standardizer refuse, or both steps may succeed and the model refuse, and a chain that had already stored its new fitted steps by then would be left holding fitted steps from one fit beside a fitted model from another. So the chain computes every part into a result first and stores nothing until the model has fitted too.
                </p>
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
                  The chain computes every part of a fit before it stores
                  any of it, so it either finishes a fit or keeps the one it
                  had, and no caller ever meets a chain whose steps and model
                  came from different fits.
                </KeepInMind>
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
                  The grid search page varied a neighbour count, which is a field of the neighbours model, and a ridge penalty, which is a field of the ridge model. The degree of the expansion in this chain is neither. It is a field of the expansion step, and a search over the ridge model alone has no way to reach it.
                </p>
                <p>
                  Asked to vary a degree on the ridge model, the search refuses at construction and names the two fields the model does have, its intercept switch and its penalty, and that refusal is quoted under the lattice below.
                </p>
</>
                <p>
                  Wrapped in a chain, the whole configuration is one model
                  whose two fields are its steps and its model, and both can
                  be varied. That is the capability the object buys, and it is
                  stronger than the leak argument, since without it the
                  question of which degree to use could not be put to a search
                  at all.
                </p>
                <KeepInMind>
                  A search can only vary a field of the model it is handed. A
                  setting inside a preprocessing step is out of its reach
                  until the step and the model are one object.
                </KeepInMind>
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
                <p>
                  The spread across the sixteen is 0.3639, which says the settings mattered, though what mattered was the penalty; the degrees at any one small penalty finish within 0.015 of one another, and the expansion earns nothing on twelve people who lie very nearly on a line.
                </p>
</>
                <InAModel title="The Ideal Case">
                  <p>
                    On fifteen people lying almost exactly on one line the
                    winner is again degree 1 at 0.1, at 0.9976, and the spread
                    of 0.2828 is once more the penalty of 10 ruining every
                    degree. The search reports both numbers because a winner
                    without its spread is a number that cannot be read, and
                    here the spread says the search chose a penalty and had
                    no opinion about the degree.
                  </p>
                </InAModel>
                <KeepInMind>
                  The winner is the candidate with the highest mean held-out
                  score, and the spread beside it says how much the choice
                  mattered. The grid search page&rsquo;s warning applies
                  unchanged, since the winner&rsquo;s score is optimistic
                  and a chain does nothing to change that.
                </KeepInMind>
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
                  A wrong name inside a candidate has to fail loudly, because
                  the failure it would otherwise produce is a search that ran
                  to completion and measured nothing. Both wrong names here
                  are refused before a single fold is dealt.
                </KeepInMind>
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
                  Two steps can run in two orders, and the chain treats the
                  order as part of the model rather than as a detail, so it is
                  worth asking whether the model can tell. Expand height and
                  then standardize both columns, and the ridge is handed two
                  columns each with centre zero and spread one. Standardize
                  height and then square it, and the ridge is handed the
                  standardized height beside its square, whose centre is one
                  and whose spread is something else. The chart runs both
                  orders at six penalties on the same four folds.
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
                  The order of the steps is part of the model. Two chains with
                  the same steps in different orders are different models, and
                  on these twelve people they differ by as much as a quarter
                  of a unit of R² at a penalty of ten.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. Why a penalised model feels the order and least squares does not">
                <>
<p>
                  The two column sets span the same curves. Height and its square, or standardized height and its square, either pair together with an intercept can draw any parabola in height, so a fit that only asks which parabola is closest to the nine training people finds the same one either way. That is what the penalty of zero shows, and a plain least-squares model in place of the ridge gives the same 1.2e−13.
                </p>
                <p>
                  A ridge penalty is a charge on the squared coefficients of whatever columns it was handed, and handing it different columns changes what it is charging for.
                </p>
</>
                <Equation>{"expand then standardize, penalty 1    height 4.821   height² 4.853        both columns centre 0, spread 1\nstandardize then expand, penalty 1    height 9.191   height² 0.241        the square has centre 1, spread 0.932"}</Equation>
                <p>
                  On heights between 150 and 183 cm the standardized height
                  and the standardized square are very nearly the same column,
                  and the ridge splits the slope between them, 4.821 and
                  4.853, which is the grouping the{" "}
                  <Link href="/concepts/ridge-lasso" className={link}>
                    ridge and lasso page
                  </Link>{" "}
                  describes. Standardized first and then squared, the square is
                  centred at one and carries little that the height does not,
                  and the ridge puts 9.191 on the height and 0.241 on the
                  square. Both orders fit the same nine people with the same
                  family of curves, and the one that hands the penalty every
                  column at the same spread scored higher at every penalty
                  tried.
                </p>
                <KeepInMind>
                  A model with no penalty sees only the curves the columns can
                  draw, and the order does not change those. A penalised model
                  sees the columns themselves, and the order changes them. The
                  chain&rsquo;s own order standardizes last, so the penalty
                  meets every column at spread one.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Implementation and Failure Contracts",
          content: (
            <>
              <SubSection title="22. What a complete implementation specifies">
                <p>
                  A complete implementation states what a step is and how
                  steps are named and ordered, that each step is fitted on the
                  output of the step before it, that predict applies the
                  fitted steps and fits nothing, that the configured steps and
                  model are copied before every fit and never fitted
                  themselves, that a fit commits nothing until every part has
                  succeeded, how a search varies a setting inside a step and
                  what a wrong name does, whether an empty step list is
                  allowed, which kind of model a chain of each task will
                  accept, and what it does when a row arrives with a column
                  missing, a column it never saw, or its columns in another
                  order.
                </p>
                <KeepInMind>
                  Most of those are promises about what the chain does with
                  the objects it was given, which is why the last two steps
                  ask the chain rather than describe it.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. What the chain refuses, accepts, and lets through">
                <p>
                  Every row below was put to the chain, on the twelve people
                  where a row needs people, and the widget under the table
                  asks the same list again on each load so the two cannot
                  drift apart.
                </p>
                <DerivationTable
                  expressionHeading="the edge"
                  reasonHeading="the behaviour"
                  rows={[
                    { expression: "no steps at all", reason: "accepted; the chain is the bare model, to a largest prediction gap of exactly zero." },
                    { expression: "no features at all", reason: "refused at the first step, since there is nothing to expand." },
                    { expression: "one training person, or a constant height column", reason: "refused by the standardizer, because a column with no spread cannot be scaled." },
                    { expression: "a height that is not a number", reason: "refused at the boundary, by the same guard every column here passes through." },
                    { expression: "a target shorter than the features", reason: "refused by name, with both lengths in the message." },
                    { expression: "a degree the training people cannot support", reason: "refused by the ridge, which needs at least as many rows as parameters; degree 9 on 8 people is ten parameters on eight rows." },
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

              <SubSection title="24. Documented rather than defended">
                <>
<p>
                  Two rows in the table are honest gaps rather than contracts. A step is accepted by name and object at construction and nothing checks that the object can transform, so a ridge model handed in as a step is accepted and fails inside fit with a bare attribute error about a missing method, which is not one of the named refusals.
                </p>
                <p>
                  And an expansion met by a column it never saw ignores the column rather than refusing it, so a chain whose first step is an expansion will quietly predict for a row carrying an extra measurement, where a chain whose first step is a standardizer will refuse the same row by name. Neither is defended here.
                </p>
                <p>
                  The first would be a type check at construction; the second is a difference between two steps&rsquo; own rules that the chain inherits rather than makes.
                </p>
</>
                <KeepInMind>
                  The chain keeps every promise in Parts 2 and 4 and inherits
                  the edges of its steps, and where a step&rsquo;s edge is
                  loose the table reports the measured behaviour rather than a
                  tidier one.
                </KeepInMind>
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
              "Asked to vary a degree on the ridge model, the search refuses at construction and names the two fields the model does have, its intercept switch and its penalty. Wrapped in a chain the whole configuration is one model whose fields are its steps and its model, so both can be varied, and that is the capability the object buys beyond the leak argument.",
            ),
            choice(
              "The search over four degrees and four penalties reports a winner of 0.9796 with a spread of 0.3639 across the sixteen candidates. What does the spread say?",
              [
                "That the settings mattered, and that what mattered was the penalty rather than the degree",
                "That the winner is within noise of every other candidate",
                "That degree 4 is the only candidate worth keeping",
                "That the winning score is an honest estimate of future performance",
              ],
              0,
              "Four degrees crossed with four penalties is sixteen candidates and sixty-four fits on the shared folds. Every candidate at a penalty of 10 is far behind, degree 1 at 0.6157 and degree 4 at 0.9081, while the degrees at any one small penalty finish within 0.015 of one another, so the expansion earns nothing on twelve people who lie very nearly on a line. The winner’s score is still optimistic, and a chain does nothing to change that.",
            ),
            trueFalse(
              "At a penalty of zero, expanding then standardizing and standardizing then expanding give the same held-out predictions.",
              true,
              "Both orders score 0.9579 and predict the three held-out weights to a largest difference of 1.2e−13, because either pair of columns together with an intercept can draw any parabola in height, and a fit with no penalty sees only the curves the columns can draw. At every positive penalty they part, because a penalty is a charge on the squared coefficients of whatever columns it was handed. At a penalty of one the chain’s own order puts 4.821 and 4.853 on height and its square, where standardizing first puts 9.191 and 0.241 on them, and the two score 0.9758 and 0.9523.",
            ),
        ],
        },
        {
          title: "Practice. Fitting, Folding and Searching the Chain",
          practice: [
            exercise(
              "Fit the chain on nine people and score the three held out",
              ["The starter builds Part 2’s chain, an expansion to degree 2, a standardizer and a ridge at a penalty of one, and holds out the people at 153, 165 and 177 cm. Fit the chain on the other nine. Print the centre and spread its standardizer learned for each column it was handed, the weight it predicts for each held-out person, and the held-out R squared and mean squared error.", "Part 1 gives the centre and spread of height as 167.11 and 10.38, the three predictions as 52.75, 63.66 and 74.98 kg, and the held-out R squared as 0.9930. The mean squared error is not on the page."],
              `from oop_ml import (
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
# squared error, each to four places.`,
              `from oop_ml import (
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
print(f"held-out mean squared error {evaluation.mean_squared_error:.4f}")`,
              `height: centre 167.11, spread 10.38
height^2: centre 28033.78, spread 3467.39
153 cm weighs 52 kg, predicted 52.75 kg
165 cm weighs 63 kg, predicted 63.66 kg
177 cm weighs 76 kg, predicted 74.98 kg
held-out R squared 0.9930
held-out mean squared error 0.6773`,
              { hints: ["A chain is fitted and asked for predictions exactly like a single model. fit takes a list of features and a target feature, and predict takes a list of features.", "The fitted copies of the steps are on the chain as fitted_steps and are addressed by the names the steps were given, so the standardizer is fitted_steps[\"scaler\"].transformer. Its scalings can be looped over, and each has a name, a mean and a standard_deviation.", "evaluate answers an object that has already paired each prediction with its truth. r2_score and mean_squared_error are properties of it."], check: numberCheck("What mean squared error does the chain score on the three held-out people, to four places?", 0.6773, 0.0005, "The three misses are about 0.75, 0.66 and 1.02 kg, whose squares add to about 2.03, and a third of that is 0.6773. Every one of those predictions was made from a height standardized by the nine training people’s centre of 167.11 and spread of 10.38, which the standardizer learned inside the chain’s own fit and the held-out people never touched.") },
            ),
            exercise(
              "Read the configuration back, then break a refit",
              ["Fit the same chain on the same nine people. Then ask the objects the chain was built from whether they are fitted, ask the fitted copy of the model the same question, and check whether the two models are the same object. After that, refit the chain on a height column that is constant, catch what the library raises, and see what the chain is left holding.", "Part 4 says the configuration is never fitted and that a refit which fails leaves the previous fit whole, with the predictions moved by exactly nothing."],
              `from oop_ml import (
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
# chain is still fitted and how far its three predictions moved.`,
              `from oop_ml import (
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
print(f"predictions moved by {max(abs(new - old) for new, old in zip(after, before))}")`,
              `configured model fitted: False
configured step terms fitted: False
configured step scaler fitted: False
fitted copy of the model fitted: True
copy is the configured object: False
AllSameValuesError
feature_values must not be constant (zero variance)
still fitted: True
predictions moved by 0.0`,
              { hints: ["Every model and every transformer in the library answers is_fitted. The configuration is chain.model and chain.steps, and the results of the fit are chain.fitted_model and chain.fitted_steps.", "Looping over chain.steps gives each step in the order it runs, with a name and the transformer it wraps.", "Every refusal the library makes derives from MLLibError, so catching that catches whichever specific one a constant column meets."] },
            ),
            exercise(
              "Fold the chain, then let a search choose the degree",
              ["Cross-validate Part 2’s chain over all twelve people, on four folds dealt with the page’s seed of 4, and print each fold’s held-out R squared and their mean. Then build a search space that varies the chain’s steps over degrees 1 to 4 and its model over penalties of 0.01, 0.1, 1 and 10, run the search on the same folds, and print every candidate’s score with the winner and the spread.", "Part 2 reports fold scores of 0.9986, 0.9916, 0.9234 and 0.9894, and Part 5 reports a winner of degree 1 at a penalty of 0.1, at 0.9796, with a spread of 0.3639. The lesson does not quote what degree 3 scores at a penalty of one."],
              `from oop_ml import (
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
# then the winner's score, the spread, and degree 3's score at a penalty of 1.`,
              `from oop_ml import (
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
print(f"degree 3 at a penalty of 1: {asked:.4f}")`,
              `fold scores [0.9986, 0.9916, 0.9234, 0.9894]
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
degree 3 at a penalty of 1: 0.9751`,
              { hints: ["CrossValidation is built with the folds and its evaluate takes the chain and the dataset. The result can be looped over, one evaluation per fold, and it carries mean_r2_score.", "SearchSpace.over takes the class being searched and then one list per field. The chain has two fields, steps and model, and each list holds whole objects that their own constructors have already checked.", "GridSearch is built with the folds, and its search takes a prototype, the space and the dataset. Looping over what it answers gives every scored candidate.", "A candidate hands back the object it carried for a field through value_for, so the degree is value_for(\"steps\")[\"terms\"].transformer.degree and the penalty is value_for(\"model\").penalty."], check: numberCheck("What mean held-out R squared does the degree 3 chain score at a penalty of one, to four places?", 0.9751, 0.0005, "It finishes just behind degree 2 at the same penalty, which is the 0.9758 the fold loop reported for the chain on its own, since that chain is one of the sixteen candidates. The degrees sit close together at every small penalty and the penalty of 10 ruins all four, which is why a spread of 0.3639 says the search chose a penalty and had little to say about the degree.") },
            ),
            exercise(
              "Run the two steps in the other order",
              ["Part 6 says the order of the steps is part of the model. Build the chain both ways round, expanding and then standardizing, and standardizing and then expanding, and cross-validate each on the same four folds at penalties of 0, 1 and 100.", "The lesson gives 0.9579 for both orders at a penalty of zero and 0.9758 against 0.9523 at a penalty of one. It stops at a penalty of ten, so the last pair of numbers is yours to find. Before running, decide whether the gap between the orders should keep growing."],
              `from oop_ml import (
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

# Print the expand-first score at a penalty of 100 on a line of its own.`,
              `from oop_ml import (
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

print(f"expand first at a penalty of 100: {scores[0]:.4f}")`,
              `penalty 0.0: expand first 0.9579, standardize first 0.9579
penalty 1.0: expand first 0.9758, standardize first 0.9523
penalty 100.0: expand first 0.0257, standardize first -0.1614
expand first at a penalty of 100: 0.0257`,
              { hints: ["PipelineSteps.of runs its steps in the order the keywords are written, so swapping the two keywords is the whole of the change.", "Each cross-validation needs a chain of its own, built from one set of steps and a ridge at the penalty in hand. The folds are seeded, so both orders are judged on the same four deals."], check: numberCheck("What does the expand-first chain score at a penalty of 100, to four places?", 0.0257, 0.0005, "At a penalty of 100 the charge on the coefficients outweighs twelve people’s worth of evidence, so both orders are shrunk most of the way to predicting the mean weight, which is what an R squared near zero means. The chain’s own order still finishes ahead, 0.0257 against −0.1614, but a penalty this large has ruined both, and the order of the steps was never going to rescue it.") },
            ),
          ],
        },
      ]}
    />
  );
}
