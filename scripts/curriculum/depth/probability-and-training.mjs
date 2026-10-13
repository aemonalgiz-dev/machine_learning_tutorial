import { p, worked, withProgram as show, supplement as add } from './shared.mjs';
export default {
 'distributions-and-expectations': add('Distinguish the mean outcome from a decision under asymmetric costs.', [
  p('An Expected Count Need Not Be a Possible Count', `A shipment can contain zero, one or two damaged sensors. Its expected damage count can lie between those integers because it averages across possible shipments, weighted by their probabilities. It is not a claim that a particular shipment contains a fraction of a sensor.

If Botie must order whole replacement units, rounding the expectation is one possible rule. Whether it is useful depends on the consequences of too many or too few replacements. A prediction summary and an action are different objects.`),
  show(p('Average the Consequences of Each Stock Decision', `Suppose an unused replacement costs one unit, while a shortage costs five per missing replacement. For each stock choice, calculate the cost under every damage outcome and then take its probability-weighted average.

This is the same expectation operation, now applied to cost instead of damage count. It connects a probability distribution to a decision without pretending the most likely outcome is the only one that matters.`), worked('Choose among three replacement stocks', 'The invented damage distribution is shared by every stock choice.', `damage = np.array([0,1,2])
probability = np.array([.5,.3,.2])
for stock in [0,1,2]:
    unused = np.maximum(stock-damage, 0)
    shortage = np.maximum(damage-stock, 0)
    print(stock, round(float(probability@(unused+5*shortage)), 2))`, '0 3.5\n1 1.5\n2 1.3', 'Two replacements minimise expected cost under these probabilities and costs, even though zero damaged sensors is the most likely outcome.')),
  p('Keep Uncertainty in the Probabilities Visible', `The distribution may itself be estimated from a small or changing collection of shipments. A precisely computed expectation can therefore depend on uncertain inputs.

Repeat the decision calculation under plausible alternative damage rates and shortage costs. If the preferred stock changes easily, the decision needs more evidence or an explicit tolerance for risk. Arithmetic precision does not remove uncertainty about the model.`),
 ]),
 'parameter-posteriors': add('Construct a posterior across candidate rates and use it for prediction and model checks.', [
  p('Keep Several Candidate Rates Alive', `One observed failure in two sensors does not identify the supplier's long-run failure rate. Instead of choosing one candidate immediately, give each candidate a prior weight and multiply it by the likelihood of what happened.

Normalising those products gives posterior weights. A discrete candidate grid makes this process visible; a continuous beta distribution provides an analytic version for the Bernoulli model used earlier. A coarse grid is an approximation, not an alternative physical description of failure rates.`),
  show(p('Update a Small Grid and Predict One More Sensor', `The next sensor can fail under any of the candidate rates. Average that failure probability using the posterior weights. This integrates uncertainty about the parameter rather than selecting the largest posterior entry and discarding the rest.

The example uses three equally weighted candidate rates. With a denser grid, the prior weights must still represent the intended prior distribution.`), worked('One failure and one success', 'The order of these two outcomes is not needed for comparing the three rates because every candidate receives the same combinatorial factor.', `rates = np.array([.1,.5,.9])
prior = np.array([1/3,1/3,1/3])
weight = prior*rates*(1-rates)
posterior = weight/weight.sum()
print(np.round(posterior, 4).tolist())
print(round(float(posterior@rates), 4))`, '[0.2093, 0.5814, 0.2093]\n0.5', 'The predictive probability is halfway, but substantial posterior weight remains on very different rates. The prediction alone conceals that uncertainty.')),
  p('Predict Several Outcomes with One Shared Rate', `For a simulated future batch, first draw one rate from the posterior and then draw that batch's outcomes conditional on the rate. Drawing a new rate independently for every sensor would describe a different model.

The shared rate introduces dependence after averaging over parameter uncertainty. A batch with many failures may be more plausible than a plug-in calculation at the posterior mean suggests. This distinction matters when preparing for unusually poor shipments.`),
  p('Ask Whether the Model Can Reproduce the Pattern We Saw', `Generate replicated batches under the posterior and compare features such as total failures, runs of failures and differences between suppliers. A Bernoulli model with one shared rate may reproduce the total while missing clustering by shipment.

A posterior can be internally consistent and still answer the wrong model. If sensors share a manufacturing defect or conditions change over time, revise the data-generating assumptions rather than interpreting a narrow posterior as universal certainty.`),
 ]),
 'gaussian-sensor-fusion': add('Make correlation and bias concrete rather than assuming more measurements always add precision.', [
  show(p('Independent Evidence Earns Additional Precision', `Two independent noisy readings of the same quantity can reduce uncertainty. A reading with smaller variance contributes more precision and therefore more weight. The combined variance is smaller because we have added independent information.

The variances must describe uncertainty in comparable units. A sensor's short-term repeatability is not necessarily its total measurement error if it also has an unknown calibration offset.`), worked('Fuse a precise reading with a noisy one', 'Both thermometers are assumed unbiased and independent for this calculation.', `reading = np.array([20., 24.])
variance = np.array([1., 9.])
precision = 1/variance
mean = (precision@reading)/precision.sum()
combined_variance = 1/precision.sum()
print(round(float(mean), 3))
print(round(float(combined_variance), 3))`, '20.4\n0.9', 'The noisier reading moves the estimate only modestly. Its variance, not merely the fact that it is another reading, determines its influence.')),
  p('Copying One Thermometer Does Not Give Us Two Thermometers', `If both displayed readings come from the same instrument, their errors can move together. Treating them as independent would count the same information twice and report unjustified precision.

For equal-variance readings, the variance of their average includes their covariance. As correlation approaches one, averaging offers almost no reduction. Independence is therefore a substantive assumption about the sensors, not a convenient detail of the formula.`, 'Var((X + Y)/2) = (Var(X) + Var(Y) + 2 Cov(X,Y)) / 4\nEqual variance σ² and correlation ρ:\nVar(average) = σ²(1 + ρ)/2'),
  p('Shared Bias Survives Averaging', `Two thermometers can agree closely because both were calibrated against the same incorrect reference. Averaging reduces certain random errors; it does not automatically remove a shared offset.

Compare against an independent reference when possible, retain calibration records and inspect disagreement over time. If the readings differ far more than their stated uncertainties predict, investigate the assumptions before producing a confident combined estimate.`),
 ]),
 'hidden-state-filtering': add('Implement repeated prediction/update steps and distinguish filtering from smoothing.', [
  p('The State Vector Is a Belief, Not a Diagnosis', `The pump's state vector stores probabilities for working and faulty. A transition matrix first moves that belief forward in time. Only then does the current alarm provide evidence about the current state.

Multiplying by alarm likelihoods changes the relative support for each state. Normalise after that multiplication so the entries again sum to one. The normalising sum is also the probability assigned to the observed alarm under the predictive belief.`),
  show(p('Carry Belief through Two Reports', `The first report is an alarm; the second is quiet. Both matter, but the second report should not erase the transition model or reset us to the initial belief.

Rows of the transition matrix describe the old state and columns the next state. With a row-vector belief, multiply on the right. Changing orientation silently computes a different operation.`), worked('Predict, observe and retain the result', 'The transition and alarm probabilities are supplied assumptions for this invented pump.', `belief = np.array([.9,.1])
transition = np.array([[.9,.1],[.2,.8]])
alarm = np.array([.1,.8])
for likelihood in [alarm, 1-alarm]:
    predicted = belief@transition
    weight = predicted*likelihood
    belief = weight/weight.sum()
    print(np.round(belief, 4).tolist())`, '[0.379, 0.621]\n[0.7966, 0.2034]', 'The quiet report reduces fault probability, but the retained belief also reflects how faults persist and how often a quiet report can occur under a fault.')),
  p('An Impossible Report Cannot Be Normalised', `If every state assigns zero likelihood to a report, the normalising sum is zero. Dividing anyway does not produce a valid posterior. The observation contradicts the supplied model or an input convention is wrong.

Detect that case explicitly. With many small probabilities, numerical underflow can create a similar symptom, so stable scaling or log-space calculations become useful. Distinguish a numerical representation failure from a genuinely impossible observation.`),
  p('Later Evidence Answers a Different Historical Question', `Filtering asks what we can infer now using reports available now. Smoothing revisits earlier hidden states after later reports have arrived. A later repair inspection can improve our account of yesterday's pump condition, but it was unavailable to yesterday's decision.

Keep that distinction when evaluating an online detector. Scoring a historical decision using a smoothed belief can give it information from the future and exaggerate how well it could have acted at the time.`),
 ]),
 'minibatch-gradients': add('Complete epoch bookkeeping and explain unequal batches and accumulated gradients.', [
  p('An Epoch Is a Pass through the Training Records', `Choose one permutation of the training indices, divide it into batches and use each batch to estimate a gradient. The final batch may be shorter. Divide its summed gradient by its actual size, not the usual batch size.

The parameters change between batches, so averaging the gradients observed during an epoch is not generally the full-dataset gradient at one fixed parameter. Keep the distinction between the sampling operation and the sequence of updates.`),
  show(p('Combine Unequal Batch Means without Changing the Objective', `If memory forces us to accumulate several batches before one update, their means need weights proportional to batch size. Equal weighting gives a short final batch too much influence.

This example holds the parameter fixed and supplies per-record gradients so that only the bookkeeping changes. An accumulated update matches the full mean here because all contributions were evaluated at that same parameter.`), worked('Three records and one final record', 'The first batch contains three gradient contributions and the second contains one.', `gradient = np.array([1., 2., 3., 10.])
batch_means = np.array([gradient[:3].mean(), gradient[3:].mean()])
sizes = np.array([3,1])
print(float(batch_means.mean()))
print(float(np.average(batch_means, weights=sizes)))
print(float(gradient.mean()))`, '6.0\n4.0\n4.0', 'The equal average of batch means is wrong for the mean per-record objective. Weighting by record count recovers it.')),
  p('Batch Size Changes More Than Memory Use', `A smaller batch usually gives a noisier gradient estimate and more updates per epoch. Holding epochs fixed while changing batch size therefore also changes the update count. Comparing runs requires stating which training budget is fixed.

Inspect validation behaviour and optimisation stability. Do not assume that noise is always harmful or always useful. Correlated records within a batch can make it less representative than its row count suggests.`),
 ]),
 'momentum-updates': add('Trace retained velocity across gradient reversal and make conventions explicit.', [
  p('Velocity Remembers Directions That Have Already Changed', `Momentum carries part of the previous update direction into the next step. If gradients repeatedly point the same way, those contributions accumulate. If signs alternate, they can partly cancel.

That memory means the current update need not point along the current gradient alone. Near a minimum, old velocity can carry the parameter past it. A learning rate and momentum coefficient must therefore be considered together, rather than treating momentum as an automatic acceleration button.`),
  show(p('Watch the Parameter after the Gradient Reverses', `We will use a velocity that accumulates gradients, followed by subtracting learning rate times velocity. Another common convention includes learning rate inside the velocity. The two forms need consistent state definitions, especially if the learning rate changes.

Track gradient, velocity and parameter separately. Their signs answer different questions: current slope, retained direction and current location.`), worked('Three updates with one reversal', 'The first two gradients are positive and the third is negative.', `w, velocity = 0., 0.
for gradient in [2.,2.,-1.]:
    velocity = .8*velocity + gradient
    w -= .1*velocity
    print(round(velocity, 3), round(w, 3))`, '2.0 -0.2\n3.6 -0.56\n1.88 -0.748', 'Even after the slope reverses, the retained velocity still moves the parameter in the previous direction. This is expected under the stated rule.')),
  p('Resume the Optimiser, Not Only the Weights', `A training checkpoint needs the velocity as well as the model parameters. Restoring only the weights and zeroing velocity starts a different trajectory, even on the same next batch.

Test checkpoint continuation against an uninterrupted run. Save the learning-rate schedule position and random state when they influence the next updates. If a run oscillates, inspect these states and gradient scales before adding more training passes.`),
 ]),
 'initialisation-and-gradient-checks': add('Expose symmetry, finite-difference tradeoffs and directional checks.', [
  p('Identical Hidden Units Can Remain Identical', `If hidden units start with identical incoming and outgoing weights, they receive the same activations and updates under a symmetric architecture. Several units can then behave like copies of one unit instead of learning different features.

Small random differences break that symmetry. Their scale also matters: overly large values can saturate some activations, while overly small values can weaken signals through many layers. Fan-in based initialisation rules address signal scale under assumptions about the layer and activation; they are not universal constants.`),
  show(p('Check a Derivative along a Chosen Direction', `A coordinate check nudges one parameter at a time. A directional check nudges several together and compares the finite difference with the gradient's dot product with that direction. It is an inexpensive additional check for a larger parameter vector.

Use deterministic evaluation during the comparison. Dropout draws, changing batches or stateful updates can change the loss for reasons unrelated to the parameter perturbation.`), worked('Check a quadratic derivative independently', 'The analytic gradient is compared with a symmetric finite difference at the same point.', `w = np.array([1., -2.])
direction = np.array([.6, .8])
def loss(v):
    return float((v*v).sum())
eps = 1e-5
numerical = (loss(w+eps*direction)-loss(w-eps*direction))/(2*eps)
analytic = (2*w)@direction
print(round(float(numerical), 4))
print(round(float(analytic), 4))`, '-2.0\n-2.0', 'Agreement checks this direction at this point. Test several directions and examples; one successful check does not prove every branch of a network correct.')),
  p('A Smaller Perturbation Is Not Always a Better Check', `A large perturbation measures curvature over too wide an interval. A very small one subtracts nearly equal floating-point losses and can amplify rounding error. Try a sensible range and look for agreement over a stable region.

At a nondifferentiable point, such as the corner of ReLU, a symmetric finite difference can disagree with the implementation's selected derivative without revealing a bug. Move away from the corner for the smooth check, and test the chosen boundary convention separately.`),
 ]),
 'training-diagnostics': add('Turn diagnostic advice into a reproducible stopping and restoration procedure.', [
  p('The Best Validation Step May Be Earlier Than the Last Step', `Early stopping needs a record of the best validated state, not only a counter of disappointing epochs. If training continues for several checks after the best score, the final parameters can be worse than the saved ones.

Copy the parameter arrays when recording the checkpoint. Storing another reference to mutable weights lets later updates overwrite the supposed best state. Keep training and validation losses separate, and never use the final test score to decide when to stop.`),
  show(p('Trace Patience and the Restored Checkpoint', `Patience counts consecutive validation checks without a qualifying improvement. Declare whether equality counts, what minimum improvement is required and how often validation runs.

The example stores a step identifier instead of parameter arrays so we can see the decision clearly. A real run would save the full fitted state at that step.`), worked('Stop after two non-improving checks', 'Lower validation loss is better; any strict decrease resets patience.', `losses = [1., .8, .7, .71, .72, .69]
best, best_step, stale = float('inf'), None, 0
for step, loss in enumerate(losses):
    if loss < best:
        best, best_step, stale = loss, step, 0
    else:
        stale += 1
    if stale >= 2:
        break
print(step, best_step, best)`, '4 2 0.7', 'The run stops before the later hypothetical improvement is observed. Patience is a chosen rule with a tradeoff, not knowledge of the future loss curve.')),
  p('Try to Fit a Tiny Batch before Investigating Generalisation', `If a flexible network cannot fit a tiny clean batch, inspect labels, shapes, loss conventions and gradients before collecting more data. Check that parameters change and that a small step can reduce the chosen loss.

Once that mechanism works, restore the intended regularisation and evaluate on independent data. Successfully memorising a tiny batch is a debugging check. It is deliberately not evidence of useful generalisation.`),
 ]),
};
