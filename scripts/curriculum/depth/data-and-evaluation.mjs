import { p, worked, withProgram as show, supplement as add } from './shared.mjs';
export default {
 'conditional-probability': add('Separate sensitivity, false alarms and base rates with a population table.', [
  p('Follow People through the Groups Before Dividing', `A warning system can catch most faults while producing many false alarms. To see why, start with a population rather than a percentage. Separate faulty sensors from working sensors, then ask how many in each group trigger the light.

Only after counting those two routes should we restrict attention to the sensors whose lights are on. The denominator has changed from all sensors, or all faulty sensors, to all alarms. That change of group is the reason the two conditional probabilities differ.`, '1,000 sensors: 10 faulty, 990 working\n80% of faulty sensors trigger: 8 alarms\n10% of working sensors trigger: 99 alarms\nFaulty among alarms = 8 / (8 + 99) ≈ 0.0748'),
  show(p('Carry the Same Test into a Different Population', `Suppose Botie checks a batch already suspected of damage. The warning light has the same sensitivity and false-alarm rate, but faults are more common before the light is observed. The composition of the alarm group changes.

This is why a probability attached to a test result needs a population assumption. A result measured in one setting cannot automatically be carried to another with a different starting rate.`), worked('Change only the starting failure rate', 'The two entries represent ordinary stock and a damaged shipment.', `prior = np.array([0.01, 0.20])
sensitivity, false_alarm = 0.8, 0.1
alarm_fault = prior * sensitivity
alarm_working = (1 - prior) * false_alarm
print(np.round(alarm_fault / (alarm_fault + alarm_working), 4).tolist())`, '[0.0748, 0.6667]', 'The mechanism of the warning light did not improve. The evidence began from a different proportion of faulty sensors.')),
 ]),
 'likelihood': add('Show boundary estimates and the difference between fit and uncertainty.', [
  show(p('How Much Evidence Separates Two Germination Rates?', `Botie observes three germinated seeds and one that did not germinate. Both a moderate rate and a high rate can produce that outcome. Likelihood compares how well candidate rates account for the observations; it does not assign those candidates posterior probabilities.

Working with log likelihood turns products into sums and avoids tiny products for long records. When a count is zero, its log term contributes zero. Do not calculate an undefined logarithm and hope multiplying it by zero will repair it.`), worked('Compare candidate rates on the same seeds', 'These interior candidates avoid zero-probability boundary cases.', `rates = np.array([0.25, 0.50, 0.75])
log_likelihood = 3 * np.log(rates) + np.log1p(-rates)
relative = np.exp(log_likelihood - log_likelihood.max())
print(np.round(relative, 4).tolist())`, '[0.1111, 0.5926, 1.0]', 'The best candidate is used as a reference of one. These relative likelihoods do not sum to one and are not posterior probabilities.')),
  p('All Successes Do Not Establish Certainty', `If every seed in a small batch germinates, the maximum-likelihood rate is one. That is where this batch's likelihood is greatest. It does not establish that failure is impossible in future batches.

Keep the number of trials beside the estimate. A posterior distribution or an interval procedure addresses uncertainty that the single optimum omits. Also examine the trial model: seeds from one shared tray can be dependent, and combining them as independent trials may exaggerate the evidence.`),
 ]),
 'record-quality': add('Make duplicate resolution, conflicting records and audit trails explicit.', [
  p('Two Equal Temperatures Are Not Necessarily One Event', `An event identifier says which observation a row claims to describe. Equal temperatures on different events can be perfectly legitimate. Conversely, two rows with one identifier but different temperatures are a conflict, not harmless duplication.

Before dropping anything, group by the identity rule and distinguish exact repeated reports from conflicting reports. A later timestamp may indicate a correction, but only if the data producer defines it that way. Otherwise send the disagreement for review and retain its source.`),
  show(p('Count Identities Before Choosing Which Report to Keep', `Botie can produce a small audit table before cleaning. It should show which identities repeat and how many rows each supplied. This does not yet select a correct value; it tells us which records need the resolution policy.

Retain the raw input and record which rule selected or rejected each row. If an implausible measurement later proves valid, we can revisit the decision without recreating a deleted observation.`), worked('Find repeated greenhouse events', 'The third row repeats the first event identifier; equal values under different identifiers would not count as a duplicate event.', `event_id = np.array(['north-1', 'south-1', 'north-1', 'north-2'])
identities, counts = np.unique(event_id, return_counts=True)
print(identities[counts > 1].tolist())
print(counts[counts > 1].tolist())`, "['north-1']\n[2]", 'The next step is to compare the two source records and apply the declared resolution rule. Counting duplicates alone cannot decide which measurement is true.')),
 ]),
 'missing-measurements': add('Demonstrate reusable imputation and expose selective sensor failure.', [
  show(p('Fit the Replacement Once, Then Carry It Forward', `The training rows provide the reference for missing measurements. Incoming rows receive that reference even when their observed values have a very different average. Otherwise a prediction depends on which other records happened to arrive in the same batch.

Keep a missingness indicator if absence may itself be informative. Decide separately what to do with a training column that has no observed values at all; there is no sample mean to learn from it.`), worked('An unusually hot batch must not redefine the training mean', 'Training observations are 10 and 14 degrees. A later batch contains one observation and one blank.', `training = np.array([10., np.nan, 14.])
reference = training[np.isfinite(training)].mean()
incoming = np.array([30., np.nan])
missing = ~np.isfinite(incoming)
print(np.where(missing, reference, incoming).tolist())
print(missing.tolist())`, '[30.0, 12.0]\n[False, True]', 'The filled value describes our training-based rule. It is not evidence that the second greenhouse was actually at 12 degrees.')),
  p('What If the Hottest Sensors Stop Reporting?', `Mean replacement is particularly misleading when missingness depends on the unobserved value. If thermometers fail above a temperature limit, the available readings systematically omit the hottest conditions. Their mean can be too low for the missing group.

Compare reporting rates by device, time and known operating conditions. An indicator may help prediction, but it does not identify the missing temperatures. Investigating the measurement process or obtaining another sensor can be more valuable than choosing a more elaborate filling rule.`),
 ]),
 'categorical-encoding': add('Demonstrate category contributions and rare/unknown category decisions.', [
  show(p('Follow a Roof Name into a Prediction', `Once the indicators exist, a linear model assigns a separate contribution to each column. The intercept supplies a shared starting prediction. Choosing a reference category removes redundant columns, but changes how the remaining coefficients should be read.

Here we retain every indicator and supply illustrative coefficients so that the routing is visible. We are applying a stated rule, not claiming these materials have measured thermal effects.`), worked('Apply contributions in the saved vocabulary order', 'The vocabulary is glass, plastic, mesh. Foil uses the previously declared all-zero policy.', `vocabulary = np.array(['glass', 'plastic', 'mesh'])
materials = np.array(['mesh', 'foil', 'glass'])
X = (materials[:, None] == vocabulary).astype(float)
weights = np.array([2., -1., -3.])
print((20 + X @ weights).tolist())`, '[17.0, 20.0, 22.0]', 'The unfamiliar roof receives only the intercept. That is a fallback policy, not evidence that foil behaves like an average known roof.')),
  p('A Column with One Training Example Has Little Support', `A vocabulary can contain many rare names. Giving each its own coefficient asks the model to learn effects from very few observations. Grouping rare categories into an other category or regularising the model can reduce that instability, with different tradeoffs.

Fit any frequency threshold on training data. Keep unknown and missing categories distinct if their meanings differ. If a category is a near-unique identifier, consider whether the prediction task permits remembering that identity at all, especially when evaluating on new greenhouses.`),
 ]),
 'cyclical-features': add('Explain what one harmonic can express and preserve calendar context.', [
  p('A Circle Fixes the Boundary, Not Every Daily Pattern', `Putting hours on a circle makes late night and early morning neighbours. A linear model using one sine and one cosine can then describe one smooth rise and fall per cycle. It cannot independently place several sharp peaks wherever we choose.

If demand rises at two watering times, additional harmonics or another representation may help. Each additional harmonic introduces a faster repeating pattern. Choose that flexibility with validation rather than assuming a circular representation solves every time-related prediction problem.`),
  show(p('Represent a Pattern That Repeats Twice a Day', `The first harmonic completes one turn over a day. The second completes two. They are separate features, so a model can combine broad daily variation with a repeated morning-and-evening pattern.

Hour-of-day does not identify the date, season or timezone. Preserve those when they matter, and handle irregular or repeated clock times before treating array positions as equal time intervals.`), worked('Compare one daily cycle with two', 'The table samples four six-hour positions. Cosine is enough here to show the different frequencies.', `hour = np.array([0., 6., 12., 18.])
angle = 2 * np.pi * hour / 24
print(np.round(np.cos(angle), 3).tolist())
print(np.round(np.cos(2 * angle), 3).tolist())`, '[1.0, 0.0, -1.0, -0.0]\n[1.0, -1.0, 1.0, -1.0]', 'The second feature gives midnight and noon the same value. A model still needs data to learn whether that repetition is relevant.')),
 ]),
 'data-leakage': add('Trace availability and enforce it with a counterfactual information-boundary check.', [
  p('A Record Has an Event Time and an Availability Time', `A repair may concern a noon failure but only be entered that evening. If Botie predicts at noon, the repair report is unavailable even when a retrospective export assigns it the failure's date. An event timestamp alone does not establish that a feature was usable.

For each input, record how it is obtained and when it becomes available. Reconstruct training rows from that point of view. A lag must account for reporting delay, not merely move a value to an earlier-looking column.`),
  show(p('Ask Whether Changing Tomorrow Changes Today’s Input', `A useful test is to alter future observations while leaving the available history fixed. A correctly constructed historical feature should stay unchanged. This does not prove the whole pipeline is clean, but it catches a direct violation of the information boundary.

Apply the same reasoning to preprocessing, category vocabularies and feature selection. If future rows influence a fitted reference, the leak can remain even when the final model sees only historical rows.`), worked('Perturb the unavailable suffix', 'The prediction is made at index three using the two preceding readings.', `def trailing_mean(y, origin):
    return float(y[origin-2:origin].mean())
y = np.array([10., 12., 14., 16., 18.])
changed = y.copy()
changed[3:] = 999
print(trailing_mean(y, 3))
print(trailing_mean(changed, 3))`, '13.0\n13.0', 'A centred rolling window would fail this check because it would include an unavailable reading.')),
 ]),
 'class-imbalance': add('Connect sampling and weighting to probability interpretation and review capacity.', [
  p('More Copies of a Failure Do Not Add New Failures', `Oversampling can make rare failures appear more often during fitting. It changes the training emphasis; copying one faulty sensor repeatedly does not provide new independent evidence about faults. Split by the appropriate observation or group before resampling.

Weighting the loss is another way to change emphasis. Neither choice guarantees useful probabilities at the original failure rate. Evaluate on a population that matches intended use, and check calibration as well as how many failures the model detects.`),
  show(p('Put the Inspection Budget Beside Recall', `Botie can inspect only a limited number of sensors each morning. A model that finds more failures by calling nearly everything faulty may not fit that budget. Examine true failures found, unnecessary inspections and missed failures together.

Choose the rule using validation data, then freeze it for the held-out assessment. If labels exist only for inspected sensors, acknowledge that missed failures among uninspected sensors are not fully observed.`), worked('Count the consequences of the chosen calls', 'Labels are 1 for faulty and 0 for healthy. These are illustrative held-out decisions.', `faulty = np.array([1, 0, 0, 1, 0, 0])
inspect = np.array([True, True, False, False, False, True])
print(int(inspect.sum()))
print(int(((faulty == 1) & inspect).sum()))
print(int(((faulty == 1) & ~inspect).sum()))`, '3\n1\n1', 'Three inspections find one of the two failures. Reporting only overall accuracy would hide the operational question.')),
 ]),
 'baseline-predictions': add('Derive baseline choice from loss and preserve the training boundary.', [
  p('The Best Constant Depends on How We Measure Error', `If Botie must predict one temperature for every greenhouse, squared error favours the training mean. Absolute error favours a training median. A baseline is therefore part of the evaluation design, not an arbitrary weak opponent.

Keep its fitted value fixed on held-out rows. Taking the test mean gives the baseline access to the answers. For classification, a majority-label baseline and a constant class-probability baseline serve different metrics and should be named accordingly.`),
  show(p('One Extreme Reading Separates Two Constant Rules', `A distant reading pulls the mean because squaring makes a large residual expensive. The median depends on ordering and is less affected by the size of that extreme. Neither is universally better: they minimise different losses.

Compare candidate models with a baseline that is appropriate to the same target, loss and information available at prediction time.`), worked('Score both constants under both losses', 'The example is a training calculation to explain the loss, not a held-out performance claim.', `y = np.array([10., 11., 12., 40.])
for value in [y.mean(), np.median(y)]:
    print(float(value), round(float(np.abs(y-value).mean()), 3), round(float(((y-value)**2).mean()), 3))`, '18.25 10.875 158.188\n11.5 7.75 203.75', 'The mean wins squared error and the median wins absolute error. The baseline must answer the metric we intend to use.')),
 ]),
 'learning-curves': add('Distinguish sample-size and epoch curves and use matched repeated subsets.', [
  p('More Training Rows and More Training Passes Are Different Experiments', `A learning curve against dataset size asks whether additional observations help. A curve against training steps asks what happens when the optimiser keeps revisiting the available data. Similar-looking plots can therefore answer different questions.

For the sample-size experiment, refit the complete procedure at each size and retain a fixed validation population. Repeat the subset selection when feasible. One unusually easy small subset can otherwise make the curve look much more convincing than the evidence supports.`),
  p('Read the Pattern Before Choosing the Next Expense', `High training and validation errors can mean the model cannot express the relationship, but also that optimisation failed or features are missing. Low training error with much higher validation error suggests a generalisation problem; check leakage, duplicates and group structure before calling it ordinary overfitting.

If validation performance is still improving with more representative data, collecting more may help. If it plateaus, investigate the errors rather than assuming a larger network is the answer. The curve narrows the investigation. It does not diagnose the cause on its own.`),
  show(p('Report the Variation Behind the Average', `Keep one result per repeat and sample size. Summarise across repeats only after checking that every column refers to the same size and every score uses the same validation procedure.`), worked('Three repeats at three training sizes', 'Rows are independently chosen training subsets; columns represent increasing dataset sizes. These supplied scores illustrate reporting rather than model fitting.', `validation_error = np.array([[5., 4., 3.], [7., 5., 3.5], [6., 3., 4.]])
print(np.round(validation_error.mean(axis=0), 2).tolist())
print(np.round(validation_error.min(axis=0), 2).tolist())
print(np.round(validation_error.max(axis=0), 2).tolist())`, '[6.0, 4.0, 3.5]\n[5.0, 3.0, 3.0]\n[7.0, 5.0, 4.0]', 'The mean improves, but the final size is not equally successful in every repeat. This range describes these runs, not a formal confidence interval.')),
 ]),
 'grouped-validation': add('Align groups with deployment and weight evaluation populations explicitly.', [
  p('Unseen Greenhouses and Future Days Need Different Splits', `Holding out a greenhouse asks whether the method transfers to a new location. Holding out later days asks whether it predicts the future at known locations. If the intended use requires both, the test design must separate both dimensions.

Choose the group from the dependence we need to break: patient, household, device or collection session, for example. An arbitrary group identifier does not make a split meaningful. Keep all fitted preprocessing inside the training portion of each split.`),
  show(p('Check Identity Separation Directly', `A grouped split should carry its group IDs into validation checks. Do not infer separation from row indices or from equal split sizes. A small assertion can catch accidental overlap introduced by a join or resampling step.

After splitting, inspect how many groups and observations remain. One large greenhouse can dominate a per-record score even when most greenhouses perform poorly.`), worked('Detect a greenhouse that appears on both sides', 'The labels identify greenhouses, not individual daily readings.', `train_groups = np.array(['north', 'north', 'south'])
test_groups = np.array(['annex', 'south'])
overlap = np.intersect1d(train_groups, test_groups)
print(overlap.tolist())
print(overlap.size == 0)`, "['south']\nFalse", 'This split cannot estimate performance exclusively on unseen greenhouses. Removing the overlapping row without understanding the sampling plan may create another biased test.')),
 ]),
 'decision-thresholds': add('Derive the cost threshold and separate it from capacity-constrained ranking.', [
  p('Compare the Expected Cost of Each Action', `Suppose the probability of a failure is trustworthy, a false inspection costs one unit, and a missed failure costs nine. Inspecting is costly only when the sensor is healthy under this simplified loss table. Not inspecting is costly when it is faulty.

Write those two expected costs and choose the smaller one. This explains why a halfway threshold is not a universal decision rule. Different costs, probability quality or capacity constraints change the decision.`, 'Cost(inspect) = 1 × (1 - p)\nCost(do not inspect) = 9 × p\nInspect when 1 - p < 9p\np > 0.1'),
  show(p('A Budget Can Prevent Acting on Every High-Risk Sensor', `If Botie has two inspection slots, he may have to rank sensors and take the first two even when more exceed a cost threshold. The number of inspections is fixed, so the effective score cutoff changes with the incoming batch.

State how ties are handled and whether inspection costs or benefits vary by sensor. A top-k policy answers a different operational question from one fixed probability threshold.`), worked('Select two inspections reproducibly', 'The input order breaks equal-score ties in this small demonstration.', `risk = np.array([0.8, 0.6, 0.6, 0.2])
chosen = np.argsort(-risk, kind='stable')[:2]
print(chosen.tolist())
print((risk > 0.1).tolist())`, '[0, 1]\n[True, True, True, True]', 'The cost threshold requests four inspections while the budget permits two. Evaluate the actual policy Botie will use.')),
 ]),
 'probability-calibration': add('Explain bin support, proper scores and held-out calibrator fitting.', [
  p('A Reliability Bin Is a Small Estimation Problem', `A group of predictions near the same probability supplies an observed failure fraction. That fraction itself is noisy when the group is small. Keep the number of observations beside every bin, and avoid reading a jagged small-sample diagram as precise evidence of miscalibration.

Binning also hides differences within a bin. Check several sensible summaries and a proper probability score. A low average score does not mean every subgroup is calibrated, especially after the deployment population changes.`),
  show(p('Equal Decisions Can Hide Different Probability Quality', `Two models can classify every observation identically at the halfway threshold while assigning different confidence. The Brier score compares each probability with the observed binary label, squares that discrepancy and averages it.

Use held-out predictions to fit or assess a calibration mapping. Fitting that mapping and reporting its improvement on the same observations gives an optimistic assessment.`), worked('Score confidence on the same outcomes', 'Both models predict the labels correctly, but the second assigns more probability to the observed outcomes.', `y = np.array([0., 0., 1., 1.])
for probability in [np.array([.4, .4, .6, .6]), np.array([.1, .1, .9, .9])]:
    print(round(float(((probability-y)**2).mean()), 3))`, '0.16\n0.01', 'This batch favours the second set of probabilities. It is a score calculation, not enough evidence to establish calibration across all future predictions.')),
 ]),
 'distribution-shift': add('Separate population mixture changes from conditional failures and select a response.', [
  show(p('The Overall Error Can Rise Without Either Group Getting Worse', `Suppose a model has always found plastic-roofed greenhouses harder than glass-roofed ones. If plastic roofs become more common, the overall error rises even when the error within each group stays unchanged.

Report the changing mixture beside within-group performance. Otherwise we may attribute the change to a broken model when the immediate cause is a different population. That change can still require action if the new population is the one we must serve.`), worked('Change the mixture, keep group errors fixed', 'The supplied values are illustrative mean absolute errors for glass and plastic roofs.', `error = np.array([1., 4.])
old_share = np.array([.8, .2])
new_share = np.array([.2, .8])
print(round(float(old_share @ error), 2))
print(round(float(new_share @ error), 2))`, '1.6\n3.4', 'The model now serves more of the group it handles poorly. Group performance and overall performance answer complementary questions.')),
  p('An Input Alarm Does Not Establish a Prediction Failure', `A shifted feature distribution is evidence that the incoming data differ from the reference. It does not by itself establish that the target relationship changed, or that performance fell. A unit conversion, changed reporting policy and genuine environmental change need different responses.

Inspect schema and measurement changes first, then obtain outcome labels where possible. Retrain only through a validated procedure. Automatically fitting on a shifted batch can teach the model a temporary fault or contamination instead of a useful new relationship.`),
 ]),
 'bootstrap-uncertainty': add('Match resampling units to dependence and interpret percentile intervals carefully.', [
  p('Resample the Independent Units', `If Botie has ten readings from each greenhouse, those readings may share the same device bias or environment. Resampling individual rows treats them as independent pieces of evidence. Resampling greenhouses carries their related rows together.

Choose the unit to match the data collection process and the target of inference. A time series may require blocks that retain local dependence. Merely drawing more bootstrap replicates cannot repair an inappropriate resampling unit.`),
  show(p('A Constant Sample Cannot Reveal Variation It Never Contains', `The bootstrap reuses the empirical distribution of the observed data. If every observed value is identical, every resampled mean is identical too. That narrow result describes the sample we supplied, not proof that the wider population has no variation.

Percentile endpoints summarise the simulated estimates under this resampling scheme. Their quality depends on sample size, the statistic, dependence and bias. State those assumptions beside the interval rather than treating any two quantiles as a universal uncertainty guarantee.`), worked('Inspect a degenerate resampling distribution', 'All three observed readings happen to be identical.', `x = np.array([12., 12., 12.])
rng = np.random.default_rng(4)
means = rng.choice(x, size=(100, len(x)), replace=True).mean(axis=1)
print(np.quantile(means, [.025, .975]).tolist())`, '[12.0, 12.0]', 'More resamples would reproduce the same limitation. Collecting a more informative sample is a different operation from resampling this one.')),
 ]),
};
