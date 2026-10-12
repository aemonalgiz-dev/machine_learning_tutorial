import { example } from "./authoring.mjs";

// Explain one calculation before practice asks the reader to apply it to a
// different record, repeat it over time, or assemble the complete procedure.
const e = (title, explanation, code, output, interpretation) => example(title, explanation, `import numpy as np\n${code}`, output, interpretation);

export const pathExamples = {
  "forecasting-baselines": e("One forecast, recorded before the next reading", "Suppose the last three daily totals are known. We copy the most recent one before revealing the next day's water use, then measure the size of the miss.", `history = np.array([10., 12., 11.])
forecast = history[-1]
observed_next_day = 14.0
print(float(forecast))
print(float(abs(observed_next_day - forecast)))`, "11.0\n3.0", "The forecast stays at eleven litres when the fourteen-litre observation arrives. The later value belongs in the error calculation, not in the earlier prediction."),
  "lagged-features": e("Build the row for one target day", "The first prediction with two lags needs two earlier readings. Separate those inputs from the next value before building a whole table.", `readings = np.array([10, 12, 11, 15])
target_position = 2
features = readings[target_position - 2:target_position]
target = readings[target_position]
print(features.tolist())
print(int(target))`, "[10, 12]\n11", "The feature slice stops before the target position. Practice will repeat this alignment across every eligible target date."),
  "seasonality-and-differencing": e("Compare two positions with their previous cycle", "Here the illustrative pattern repeats every two readings. Put the earlier cycle beside the later one so each subtraction compares the same position.", `earlier_cycle = np.array([8, 12])
later_cycle = np.array([11, 13])
change = later_cycle - earlier_cycle
print(change.tolist())
print((earlier_cycle + change).tolist())`, "[3, 1]\n[11, 13]", "The changes retain their cycle positions. Adding them to the correct earlier values recovers the later levels; differences alone do not preserve the original level."),
  "exponential-smoothing": e("Let one new day move the retained level", "Botie predicted ten litres. The next day used fourteen, and we choose to absorb one quarter of that surprise into the level.", `level = 10.0
reading = 14.0
alpha = 0.25
forecast_before_reading = level
surprise = reading - level
level = level + alpha * surprise
print(f'{forecast_before_reading:.2f}')
print(f'{level:.2f}')`, "10.00\n11.00", "The saved forecast is still ten. Eleven is the updated state for a later prediction. Keeping those two moments separate is the main job of the loop in practice."),
  "autoregressive-forecasting": e("Use one lag with already fitted coefficients", "Before fitting a rule, check what its coefficients mean. This supplied rule combines an intercept with half of the latest reading.", `coefficients = np.array([1.0, 0.5])
latest_reading = 8.0
row = np.array([1.0, latest_reading])
contributions = row * coefficients
print(contributions.tolist())
print(float(contributions.sum()))`, "[1.0, 4.0]\n5.0", "The constant column contributes the intercept; the other column contributes the lagged demand. Practice will estimate coefficients from a new sequence instead of receiving them."),
  "rolling-forecast-validation": e("Score two rules at one prediction date", "Only the three history values are available when the prediction is made. We save both rules' answers and reveal the target afterwards.", `history = np.array([4., 6., 8.])
predictions = np.array([history[-1], history[-2:].mean()])
target = 10.0
print(predictions.tolist())
print(np.abs(target - predictions).tolist())`, "[8.0, 7.0]\n[2.0, 3.0]", "Persistence does better at this one origin. That does not settle the comparison across a whole period; the challenge repeats the process at several dates."),
  "exploration-and-bandits": e("Update the estimate of one tried action", "One schedule has been tried three times and averaged four units of reward. Its next observed reward is eight. We revise that schedule's estimate without claiming to have learned anything new about the other schedule.", `old_count = 3
old_mean = 4.0
reward = 8.0
new_count = old_count + 1
correction = (reward - old_mean) / new_count
print(new_count)
print(old_mean + correction)`, "4\n5.0", "The new observation receives one quarter of the updated average. Practice adds the bookkeeping needed to select and update one entry in arrays of actions."),
  "states-actions-and-transitions": e("Account for one action's possible next states", "Suppose waiting leaves the bed dry with probability three quarters and moist otherwise. The two state values describe what those consequences are worth.", `transition = np.array([0.75, 0.25])
state_values = np.array([0., 8.])
contributions = transition * state_values
print(contributions.tolist())
print(float(contributions.sum()))`, "[0.0, 2.0]\n2.0", "The expected value weights both possible outcomes. It is not a claim that the next state will have value two; this environment only has the two supplied states."),
  "discounted-returns": e("See each reward's contribution before adding", "These rewards arrive now, one step later and two steps later. Give each delay its own power of the discount before forming the return from the start.", `rewards = np.array([2., 0., 8.])
gamma = 0.5
weights = gamma ** np.arange(len(rewards))
contributions = weights * rewards
print(weights.tolist())
print(contributions.tolist())
print(float(contributions.sum()))`, "[1.0, 0.5, 0.25]\n[2.0, 0.0, 2.0]\n4.0", "The distant reward contributes less because it is delayed twice. The challenge asks for the return starting at every position, which is easier to calculate backwards."),
  "bellman-value-iteration": e("Combine a payment now with a continuation later", "Compare two actions whose next states are known here. One pays immediately but has little continuation value; the other pays nothing now and reaches a more useful state.", `immediate = np.array([2., 0.])
continuation = np.array([1., 8.])
gamma = 0.5
scores = immediate + gamma * continuation
print(scores.tolist())
print(int(np.argmax(scores)))`, "[2.5, 4.0]\n1", "The second action wins after including the continuation. Practice replaces these supplied next-state values with expectations under a transition model."),
  "q-learning": e("Separate the target from the size of the update", "Botie receives a reward of two and reaches a nonterminal state. Its best current action estimate is eight, but the old estimate for the action just taken is only three.", `old_value = 3.0
next_values = np.array([4., 8.])
reward, gamma, rate = 2.0, 0.5, 0.5
target = reward + gamma * next_values.max()
correction = rate * (target - old_value)
print(float(target))
print(float(old_value + correction))`, "6.0\n4.5", "The target is six, while the half-sized correction only moves the estimate to four and a half. The table update in practice must change the visited entry and leave all others alone."),
  "distributions-and-expectations": e("Keep the probability beside the damage count", "A delivery can damage zero, one or two items. Multiply each count by its probability before adding; neither the most likely outcome nor an unweighted average answers this question.", `counts = np.array([0., 1., 2.])
probabilities = np.array([0.25, 0.5, 0.25])
contributions = counts * probabilities
print(contributions.tolist())
print(float(contributions.sum()))`, "[0.0, 0.5, 0.5]\n1.0", "One is the expected count under this distribution. Individual deliveries can still have any of the three listed outcomes."),
  "parameter-posteriors": e("Put failures and successes into separate counts", "Start with a Beta prior whose parameters are one and three. This small new trial contains two failures and no working sensors.", `prior = np.array([1., 3.])
new_failures = 2
new_working = 0
posterior = prior + np.array([new_failures, new_working])
print(posterior.tolist())
print(float(posterior[0] / posterior.sum()))`, "[3.0, 3.0]\n0.5", "The two failures increase the first parameter. The posterior mean is now one half, but the distribution still expresses uncertainty about the underlying rate."),
  "gaussian-sensor-fusion": e("Start with two equally reliable thermometers", "The instruments report different temperatures but have the same known variance. Calculate their precision weights before combining the readings.", `readings = np.array([18., 22.])
variances = np.array([4., 4.])
precision = 1.0 / variances
weights = precision / precision.sum()
print(weights.tolist())
print(float(weights @ readings))
print(float(1.0 / precision.sum()))`, "[0.5, 0.5]\n20.0\n2.0", "Equal variances give equal influence. Under independent errors, the combined variance is smaller than either instrument's variance. The challenge then gives the instruments different reliabilities."),
  "hidden-state-filtering": e("Predict a state change before reading the alarm", "Yesterday the pump was believed to be working with certainty. First allow a transition, then use a reading more likely under the faulty state.", `belief = np.array([1., 0.])
transition = np.array([[0.75, 0.25], [0.2, 0.8]])
reading_likelihood = np.array([0.2, 0.8])
predicted = belief @ transition
supported = predicted * reading_likelihood
print(predicted.tolist())
print(np.round(supported / supported.sum(), 3).tolist())`, "[0.75, 0.25]\n[0.429, 0.571]", "The transition creates some probability of a fault before the reading. The alarm then favours that state; normalising restores a probability distribution."),
  "gaussian-process-regression": e("Borrow information from one noisy observation", "Use one training residual and a covariance relating it to the query. Solve for the observation's contribution instead of explicitly inverting the covariance matrix.", `noisy_covariance = np.array([[2.5]])
observed = np.array([5.0])
query_covariance = np.array([1.0])
coefficients = np.linalg.solve(noisy_covariance, observed)
mean = query_covariance @ coefficients
variance = 2.0 - query_covariance @ np.linalg.solve(noisy_covariance, query_covariance)
print(coefficients.tolist())
print(f'{mean:.1f}')
print(f'{variance:.1f}')`, "[2.0]\n2.0\n1.6", "The observation shifts the query mean and reduces its prior variance. The covariance controls how much information is shared; proximity by itself is not a calculation."),
  "minibatch-gradients": e("Find the contribution from one training record", "For half squared error, one observation contributes its prediction error multiplied by its input. Inspect that contribution before averaging several of them in a batch.", `x, target, weight = 2.0, 6.0, 2.0
rate = 0.1
error = weight * x - target
gradient = error * x
print(error)
print(gradient)
print(weight - rate * gradient)`, "-2.0\n-4.0\n2.4", "The prediction is too small and the input is positive, so increasing the weight helps locally. A minibatch combines such contributions using its actual number of observations."),
  "momentum-updates": e("An agreeing gradient adds to the stored direction", "The old velocity is positive and the new gradient agrees with it. Retain half the old velocity, add the current gradient, and only then scale the parameter movement.", `weight = 4.0
old_velocity = 2.0
gradient = 1.0
retention, rate = 0.5, 0.1
velocity = retention * old_velocity + gradient
print(velocity)
print(weight - rate * velocity)`, "2.0\n3.8", "Velocity and learning rate have different jobs. The challenge carries the updated velocity into a second step where the gradient changes direction."),
  "adaptive-gradients": e("Use the retained scales for two coordinates", "Start after moment estimation so the scale adjustment is easy to see. The directions have equal magnitudes, but the second coordinate has a larger second moment.", `weight = np.array([1., 1.])
mean_gradient = np.array([2., -2.])
second_moment = np.array([4., 16.])
step = 0.1 * mean_gradient / (np.sqrt(second_moment) + 1e-8)
print(np.round(step, 3).tolist())
print(np.round(weight - step, 3).tolist())`, "[0.1, -0.05]\n[0.9, 1.05]", "The second coordinate moves less despite an equally large direction. Practice also constructs the moments and applies the correction for their zero initialisation."),
  "initialisation-and-gradient-checks": e("Estimate a slope from two nearby losses", "The loss below is a simple bowl. Evaluate it on both sides of the chosen weight, using a symmetric perturbation so neither side gets special treatment.", `def loss(weight):
    return (weight - 2.0) ** 2

weight, h = 4.0, 0.01
above = loss(weight + h)
below = loss(weight - h)
slope = (above - below) / (2 * h)
print(f'{slope:.4f}')`, "4.0000", "The positive slope says that a small increase in the weight raises this loss. In practice, compare a numerical estimate like this with the derivative produced by the implementation."),
  "training-diagnostics": e("The most recent state need not be the best state", "These three saved checkpoints were evaluated by the same validation loss. Choose the minimum and keep its position attached to the saved state.", `validation_loss = np.array([0.2, 0.4, 0.3])
best_position = int(np.argmin(validation_loss))
print(best_position)
print(f'{validation_loss[best_position]:.2f}')`, "0\n0.20", "The first checkpoint wins here. Stopping after the third check would not justify returning the third checkpoint instead."),
  "popularity-baselines": e("Count the opens of one guide first", "One column records whether each reader opened this guide. Its total measures popularity across these readers, without yet deciding the order of the whole catalogue.", `opened_this_guide = np.array([1, 0, 1, 1])
print(int(opened_this_guide.sum()))`, "3", "Three readers opened it. Practice applies the reduction to every guide column, then uses the counts to obtain a stable ranking."),
  "content-based-ranking": e("A longer description need not be a different direction", "The reader and guide use the same two content features. Compare the guide with a version whose coordinates are both ten times larger.", `reader = np.array([1., 1.])
guide = np.array([2., 2.])
for description in [guide, 10 * guide]:
    similarity = (reader @ description) / (np.linalg.norm(reader) * np.linalg.norm(description))
    print(f'{similarity:.3f}')`, "1.000\n1.000", "Both descriptions point in the reader's direction, so scaling alone does not improve the cosine match. Practice compares several genuinely different directions."),
  "collaborative-filtering": e("Interpret one neighbour relative to their usual rating", "This neighbour usually rates guides at two but gave this guide four. The target reader's own average is three.", `neighbour_rating = 4.0
neighbour_mean = 2.0
target_mean = 3.0
deviation = neighbour_rating - neighbour_mean
print(deviation)
print(target_mean + deviation)`, "2.0\n5.0", "The transferable evidence is the neighbour's positive deviation from their usual rating. Practice combines several such deviations with different similarity weights."),
  "recommendation-factorisation": e("Find both gradients before changing either factor", "One observed rating is four, while the supplied reader and guide factors predict a smaller value. Calculate each gradient from the original pair.", `reader = np.array([1., 0.])
guide = np.array([2., 1.])
rating = 4.0
error = reader @ guide - rating
print(float(error))
print((error * guide).tolist())
print((error * reader).tolist())`, "-2.0\n[-4.0, -2.0]\n[-2.0, -0.0]", "Each factor's gradient uses the other factor as it was before the update. Practice turns those gradients into two parameter updates without letting the first change contaminate the second."),
  "ranking-evaluation": e("Count relevance at the part of the list being shown", "There are three relevant guides in the catalogue. Only the first two recommendations are visible in this comparison, and one of those is relevant.", `relevance = np.array([0, 1, 1, 0])
visible = relevance[:2]
total_relevant = 3
print(f'{visible.mean():.3f}')
print(f'{visible.sum() / total_relevant:.3f}')`, "0.500\n0.333", "Half of the visible list is useful, but it retrieves only one third of the relevant catalogue. The denominators answer different questions."),
  "robust-anomaly-scores": e("Measure spread around the middle reading", "Begin with an orderly reference sample. Find its middle value, measure every absolute departure from it, then take the middle departure.", `reference = np.array([4., 5., 6., 7., 8.])
centre = np.median(reference)
departures = np.abs(reference - centre)
print(float(centre))
print(departures.tolist())
print(float(np.median(departures)))`, "6.0\n[2.0, 1.0, 0.0, 1.0, 2.0]\n1.0", "The MAD is one in the original measurement units. Practice adds an extreme reference value and then scores a separate incoming reading."),
  "local-density-anomalies": e("Compare one local density with its neighbours", "Suppose the reachability distances for this point are both two. Its two neighbours have the supplied local densities. The question is how their average density compares with this point's density.", `reachability = np.array([2., 2.])
neighbour_density = np.array([0.5, 1.0])
own_density = 1.0 / reachability.mean()
print(float(own_density))
print(float(np.mean(neighbour_density / own_density)))`, "0.5\n1.5", "The neighbours are denser on average. Practice starts earlier in the procedure, calculating neighbours and reachability from the point coordinates."),
  "isolation-forests": e("Combine the path lengths from two trees", "One tree isolated the observation after one split; another needed three. Average those path lengths before converting them to a score using the supplied sample-size normaliser.", `paths = np.array([1., 3.])
normaliser = 4.0
mean_path = paths.mean()
score = 2.0 ** (-mean_path / normaliser)
print(float(mean_path))
print(f'{score:.3f}')`, "2.0\n0.707", "The average reduces reliance on one lucky partition. Practice asks you to obtain path lengths by actually following a tree's branches."),
  "reconstruction-alerts": e("Inspect the mismatched features before raising an alert", "The reconstruction gets the first feature right and misses the second. Square the feature errors before averaging them into one record score.", `record = np.array([2., 4.])
reconstructed = np.array([2., 2.])
squared_errors = (record - reconstructed) ** 2
print(squared_errors.tolist())
print(float(squared_errors.mean()))`, "[0.0, 4.0]\n2.0", "The single score hides which feature caused the error, so inspecting the contributions remains useful. Practice scores several records and applies a fixed alert threshold."),
  "graph-representations": e("Read the neighbours of one pump from its row", "This pump has a position for every possible neighbour, including itself. A one means an edge is present and the zero on its own position means no self-loop.", `pump_row = np.array([0, 1, 1, 1])
print(np.flatnonzero(pump_row).tolist())
print(int(pump_row.sum()))`, "[1, 2, 3]\n3", "The neighbour indices identify three connections. Practice counts degrees across a complete adjacency matrix and checks the undirected symmetry."),
  "graph-random-walks": e("Collect arrivals from two possible starting nodes", "Half the probability begins at each node. The first stays put; the second splits equally between staying and moving to the first.", `probability = np.array([0.5, 0.5])
transition = np.array([[1., 0.], [0.5, 0.5]])
contributions = probability[:, None] * transition
print(contributions.tolist())
print(contributions.sum(axis=0).tolist())`, "[[0.5, 0.0], [0.25, 0.25]]\n[0.75, 0.25]", "Each row records one source node's contribution. Adding down the columns collects the probability arriving at each destination."),
  "neighbour-aggregation": e("Average the readings attached to one node's neighbours", "The adjacency row selects two neighbours from the same ordered reading array. Keep their identities during selection before reducing their readings to one average.", `adjacency_row = np.array([0, 1, 1])
readings = np.array([20., 4., 10.])
neighbour_readings = readings[adjacency_row.astype(bool)]
print(neighbour_readings.tolist())
print(float(neighbour_readings.mean()))`, "[4.0, 10.0]\n7.0", "The node's own reading of twenty is excluded by this row. Practice computes all nodes' summaries and handles the case where no neighbour is selected."),
  "graph-convolution": e("Separate neighbourhood mixing from the learned feature change", "With two connected nodes and self-loops, each node receives equal contributions from both. A supplied negative feature weight then changes the mixed value before ReLU.", `mixing = np.array([[0.5, 0.5], [0.5, 0.5]])
features = np.array([[1.], [5.]])
weight = np.array([[-1.]])
mixed = mixing @ features
weighted = mixed @ weight
print(mixed.tolist())
print(weighted.tolist())
print(np.maximum(weighted, 0).tolist())`, "[[3.0], [3.0]]\n[[-3.0], [-3.0]]\n[[0.0], [0.0]]", "The graph first shares information, the weight changes its feature contribution, and the activation clips negative outputs. Practice constructs the normalised mixing matrix as well."),
  "link-prediction": e("What score does a zero dot product produce?", "The two supplied node vectors are perpendicular. Calculate their compatibility score before applying the sigmoid decoder.", `first = np.array([1., 0.])
second = np.array([0., 2.])
logit = first @ second
print(float(logit))
print(float(1 / (1 + np.exp(-logit))))`, "0.0\n0.5", "A zero logit maps to one half. That is a property of this decoder, not evidence that half of all unobserved links really exist."),
  "confounding-and-comparisons": e("A benefit within each group can reverse after pooling", "The treatment outcome is higher within both starting conditions. However, the treatment group contains mostly the harder condition and the control group mostly the easier one.", `treatment = np.array([2., 8.])
control = np.array([0., 6.])
treatment_mix = np.array([0.8, 0.2])
control_mix = np.array([0.2, 0.8])
print((treatment - control).tolist())
print(f'{treatment @ treatment_mix:.1f}')
print(f'{control @ control_mix:.1f}')`, "[2.0, 2.0]\n3.2\n4.8", "The pooled treatment average is lower despite both within-condition differences being positive. Group composition changes the comparison we are making."),
  "randomised-experiments": e("Calculate the outcome difference before its uncertainty", "These are outcomes from an illustrative random assignment of independent units. Inspect each assigned group's mean before forming the difference.", `assigned_treatment = np.array([5., 7.])
assigned_control = np.array([4., 4.])
means = np.array([assigned_treatment.mean(), assigned_control.mean()])
print(means.tolist())
print(float(means[0] - means[1]))`, "[6.0, 4.0]\n2.0", "The observed contrast is two outcome units. Its causal interpretation depends on the assignment design; its sampling uncertainty requires more than quoting this difference."),
  "causal-adjustment": e("Apply one target population to the condition-specific effects", "The schedule's difference is not the same in the two starting conditions. Give both schedules the same target mixture so the final comparison answers one population's question.", `treatment = np.array([3., 8.])
control = np.array([1., 7.])
target_mix = np.array([0.5, 0.5])
effects = treatment - control
print(effects.tolist())
print(float(target_mix @ effects))`, "[2.0, 1.0]\n1.5", "The adjusted contrast lies between the two condition-specific differences. Changing the target mix changes whose average effect is being described, under the lesson's identification assumptions."),
  "treatment-effects-and-overlap": e("Inspect the weighted contributions before averaging", "One treated record had a treatment propensity of one quarter. One control record had a treatment propensity of one half. Use the probability of the treatment each actually received.", `treatment = np.array([1., 0.])
outcome = np.array([4., 2.])
propensity = np.array([0.25, 0.5])
contributions = treatment * outcome / propensity - (1 - treatment) * outcome / (1 - propensity)
print(contributions.tolist())
print(float(contributions.mean()))`, "[16.0, -4.0]\n6.0", "The first record has much greater influence. This is why a final weighted contrast needs an overlap check as well as correct arithmetic."),
  "saving-fitted-pipelines": e("A coefficient expects the scale it was trained on", "This one-feature rule was fitted after centring and scaling. Compare its prediction with the result of mistakenly applying the coefficient straight to the raw reading.", `raw = 12.0
saved_mean, saved_scale = 10.0, 2.0
weight, bias = 3.0, 1.0
prepared = (raw - saved_mean) / saved_scale
print(prepared)
print(prepared * weight + bias)
print(raw * weight + bias)`, "1.0\n4.0\n37.0", "Saving the coefficient without its preprocessing would silently change the numerical procedure. Practice saves and restores the complete two-feature state."),
  "prediction-input-contracts": e("Use feature names to restore the expected order", "The record arrived with keys in a different order from the model's saved feature list. Index by the saved names instead of relying on dictionary insertion order.", `features = ['humidity', 'temperature', 'pressure']
record = {'pressure': 1000., 'temperature': 18., 'humidity': 60.}
row = np.array([record[name] for name in features])
print(row.tolist())`, "[60.0, 18.0, 1000.0]", "The model receives humidity first because that is its saved convention. Practice adds explicit checks for missing or unexpected fields and non-finite values."),
  "serving-predictions": e("Keep the prediction rule separate from the request", "A validated request supplies two features. The already fitted coefficients determine how to combine them; serving the request does not fit new coefficients.", `features = np.array([2., 4.])
saved_weights = np.array([1., 0.5])
saved_bias = 0.0
contributions = features * saved_weights
print(contributions.tolist())
print(float(contributions.sum() + saved_bias))`, "[2.0, 2.0]\n4.0", "Both features contribute to one answer. Practice packages this rule for a batch and checks that the same row gets the same answer when served alone."),
  "model-versioning": e("Compare the answers on preserved fixtures", "Both versions have already predicted the same three inputs in the same order. Retain the signed differences as well as their largest size.", `old_predictions = np.array([1., 2., 3.])
new_predictions = np.array([1., 2.5, 2.])
change = new_predictions - old_predictions
print(change.tolist())
print(float(np.abs(change).max()))`, "[0.0, 0.5, -1.0]\n1.0", "The largest change is on the third fixture and it is a decrease. Practice starts with the preserved model states and computes the predictions for both versions."),
  "monitoring-and-rollback": e("Join the later answers to the earlier predictions", "These arrays have already been aligned by record identity. Inspect each absolute error before reporting their average.", `predicted = np.array([7., 8., 9.])
observed = np.array([6., 8., 11.])
errors = np.abs(predicted - observed)
print(errors.tolist())
print(float(errors.mean()))`, "[1.0, 0.0, 2.0]\n1.0", "The average describes these three matched outcomes. It does not reveal which subgroup is doing poorly, so the later challenge asks for that separation."),
  "project-sensor-investigation": e("Apply a rule whose fitting decisions have already been made", "For this illustration, the reference centre, raw MAD and alert threshold are already fixed. Score new readings without allowing them to move the reference.", `readings = np.array([8., 10., 16.])
saved_centre, saved_mad = 10.0, 2.0
threshold = 2.0
scores = np.abs(readings - saved_centre) / saved_mad
print(scores.tolist())
print((scores > threshold).tolist())`, "[1.0, 0.0, 3.0]\n[False, False, True]", "Only the last reading exceeds the chosen threshold. The project challenge goes back a step: fit the reference and select a threshold using validation data, then freeze those decisions."),
  "project-demand-forecast": e("Make a baseline at one forecast origin", "The history stops before the unknown target day. Save the persistence prediction first, then compare it with the observation when it arrives.", `history = np.array([3., 6., 9., 12.])
prediction = float(history[-1])
later_observation = 15.0
print(prediction)
print(abs(later_observation - prediction))`, "12.0\n3.0", "The increasing sequence leaves persistence behind here. A fitted alternative still needs an honest comparison across several origins, which is the work of the project challenge."),
  "project-seed-counting": e("Count qualifying regions after pixels have been labelled", "Suppose the connectivity step has already given each foreground region an ID, with zero reserved for background. Count the pixels belonging to each positive ID before applying a minimum area.", `labels = np.array([[0, 1, 1], [0, 0, 2], [3, 3, 0]])
region_ids = np.unique(labels[labels > 0])
areas = np.array([np.count_nonzero(labels == region) for region in region_ids])
print(areas.tolist())
print(int(np.count_nonzero(areas >= 2)))`, "[2, 1, 2]\n2", "There are three foreground regions, but only two meet the area rule. Practice starts from intensities and asks you to discover the connected regions yourself."),
};
