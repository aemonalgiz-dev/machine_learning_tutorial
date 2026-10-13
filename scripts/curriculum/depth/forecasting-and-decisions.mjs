import { p, worked, withProgram as show, supplement as add } from './shared.mjs';
export default {
 'forecasting-baselines': add('Include seasonal baselines, unavailable days and horizon-specific errors.', [
  p('Yesterday May Be the Wrong Day to Copy', `If greenhouse demand follows a watering schedule, the most recent day in the same schedule position can be a stronger baseline than yesterday. A seasonal-naive forecast repeats that earlier observation.

The seasonal period must describe the actual calendar or process. Seven array positions mean one week only when the record really contains one position per day. Missing days need explicit treatment before we use a positional lag.`),
  show(p('Forecast a Whole Schedule from One Origin', `At a single forecast origin, none of the future observations are available. A multi-step seasonal baseline repeats values from the most recent observed cycle, wrapping around that cycle when necessary.

Keep those forecasts together as one issued forecast. Updating them after tomorrow's reading arrives creates a forecast from a later origin, which should be scored separately.`), worked('Repeat a three-day irrigation cycle', 'The most recent complete cycle used 10, 14 and 8 litres. Botie needs five future daily forecasts now.', `last_cycle = np.array([10.,14.,8.])
horizon = 5
forecast = last_cycle[np.arange(horizon) % len(last_cycle)]
print(forecast.tolist())`, '[10.0, 14.0, 8.0, 10.0, 14.0]', 'The cycle repeats because that is the baseline assumption. A changed watering schedule is a direct reason for the rule to fail.')),
  p('Keep a Separate Error for Each Horizon', `A method that is useful tomorrow may be poor a week ahead. Retain origin, target date, horizon, forecast and eventual observation for every prediction. Compare methods only where those keys match.

Inspect peak-demand days and under-prediction as well as overall absolute error. If running out of water is much more costly than carrying excess, the decision may require a quantile or a stock policy rather than a mean forecast alone.`),
 ]),
 'lagged-features': add('Construct multi-step targets and distinguish known-future from observed-later covariates.', [
  show(p('Choose the Target Horizon before Building Rows', `For a one-day forecast, the label follows the newest feature immediately. For a two-day forecast, an extra day lies between the newest available observation and the target. Shifting the feature window without shifting the target accordingly changes the task.

Print the first and last training rows with their time positions before fitting. This catches off-by-one errors more clearly than inspecting a final model score.`), worked('Build two-day targets from two known lags', 'The forecast origin is the index of the newest known reading. The target is two positions later.', `y = np.array([10.,12.,14.,16.,18.,20.])
rows, targets = [], []
for origin in range(1, len(y)-2):
    rows.append(y[origin-1:origin+1])
    targets.append(y[origin+2])
print(np.array(rows).tolist())
print([float(value) for value in targets])`, '[[10.0, 12.0], [12.0, 14.0], [14.0, 16.0]]\n[16.0, 18.0, 20.0]', 'The intervening reading is not a feature. It would be unavailable at the stated origin.')),
  p('A Future Calendar Entry and a Future Temperature Are Different Inputs', `Tomorrow's weekday or a scheduled watering event may already be known today. Tomorrow's actual temperature is not. A forecast can use a weather forecast issued today, but training must use comparable historical forecasts rather than the later observed weather.

Record issue times for external inputs. Revised forecasts and backfilled measurements can leak later information into a retrospective feature table even when the target column is shifted correctly.`),
 ]),
 'seasonality-and-differencing': add('Trace inverse transformations over multiple horizons and diagnose overdifferencing.', [
  p('A Difference Forecast Still Needs a Starting Level', `Predicting a change removes the level from the model's target. To recover demand, add the predicted change to the last known level. At later horizons, keep adding changes to the level reconstructed so far.

Seasonal differences use a different reference: the corresponding earlier season position. If that reference lies in the forecast future, use the previously reconstructed forecast, not a secretly available observation. Save the initial history required to undo every transformation.`),
  show(p('Rebuild Demand from Predicted Daily Changes', `The first forecast begins from the last observed demand. Each later forecast begins from the preceding forecast. Cumulative sums express this recurrence once the changes have been predicted.

The example supplies changes to isolate the inversion. It does not fit a model or establish that these changes are predictable.`), worked('Undo ordinary differencing', 'The last observed demand is 20 litres.', `last = 20.
predicted_change = np.array([2., -1., 3.])
level = last + np.cumsum(predicted_change)
print(level.tolist())
print(np.diff(np.r_[last, level]).tolist())`, '[22.0, 21.0, 24.0]\n[2.0, -1.0, 3.0]', 'Differencing the reconstructed path recovers the supplied changes, which checks the bookkeeping.')),
  p('Differencing Also Changes the Noise', `Subtracting adjacent noisy readings includes noise from both readings. Consecutive differences share one of those noise terms with opposite signs, so differencing can introduce negative short-lag dependence even when the original noise was independent.

Do not repeatedly difference until a plot merely looks flat. Compare suitable models and inspect residuals. A trend, a seasonal pattern, a level shift and a measurement fault can require different explanations despite all producing visible changes over time.`),
 ]),
 'exponential-smoothing': add('Fit the response rate honestly and introduce trend as a second state.', [
  show(p('Choose Alpha by Forecasting before Updating', `A candidate alpha defines an entire sequence of states. For each candidate, reset to the same initial state, save a forecast, observe the target and only then update. Score all candidates on matching validation targets.

Updating before saving the prediction evaluates how well the smoother explains a value it has already seen. That produces an artificially favourable result, especially at a high alpha.`), worked('Compare two response rates on an ordered record', 'Both candidates start from a level of ten. These supplied observations illustrate validation bookkeeping.', `observed = np.array([12.,14.,13.])
for alpha in [.2,.8]:
    level = 10.
    errors = []
    for value in observed:
        errors.append(abs(value-level))
        level += alpha*(value-level)
    print(alpha, round(float(np.mean(errors)), 3))`, '0.2 2.493\n0.8 1.64', 'The faster response wins on these three targets. Select a rate on a proper validation period and retain a later period for final assessment.')),
  p('A Trend Needs Its Own State', `A level-only smoother keeps one current estimate and predicts that level at every future horizon. A steadily rising process needs another quantity: the estimated change per interval. A trend model updates both level and trend, then extends the level using the trend.

The extra state adds flexibility and another estimation problem. A temporary jump can be mistaken for persistent growth. Compare with the level-only and seasonal baselines rather than assuming an extra state must improve forecasts.`),
 ]),
 'autoregressive-forecasting': add('Inspect lag identifiability, residual dependence and recursive stability.', [
  p('A Smooth Record Can Make Lag Coefficients Hard to Separate', `When yesterday and the day before are almost identical across the training record, their columns contain nearly the same information. Many pairs of coefficients can give similar predictions. Individual coefficient interpretations become fragile even when the fitted curve looks stable.

Inspect the design rank and sensitivity to the training period. Regularisation may stabilise estimation, but coefficients in an observational forecasting rule do not become causal effects merely because a penalty was added.`),
  show(p('A Small Error Can Grow during Recursive Forecasting', `For a one-lag rule, a difference in the current value is multiplied by the lag coefficient at each recursive step. A magnitude above one amplifies that difference. More complicated lag models need a corresponding recurrence analysis.

This does not mean every growing series is invalid. It means a model intended to describe stable fluctuations must be checked against the behaviour of its fitted recurrence.`), worked('Propagate the same initial forecast discrepancy', 'No new observations or disturbances are added. Only the recurrence changes.', `for coefficient in [.8, 1.2]:
    discrepancy = 1.
    path = []
    for _ in range(4):
        discrepancy *= coefficient
        path.append(round(discrepancy, 4))
    print(path)`, '[0.8, 0.64, 0.512, 0.4096]\n[1.2, 1.44, 1.728, 2.0736]', 'The second recurrence magnifies the original discrepancy. Forecast intervals must also account for new disturbances and parameter uncertainty, which this trace deliberately omits.')),
  p('Residuals Can Still Contain a Schedule the Model Missed', `Place residuals in time order. Repeated positive residuals at the same schedule position suggest structure that the fitted features did not explain. Compare residuals with lagged residuals and with known operating conditions.

Use those patterns to form a new modelling hypothesis, then test it on later data. Selecting many lags after repeatedly inspecting the final test period turns that period into model-development data.`),
 ]),
 'rolling-forecast-validation': add('Add delayed availability, window comparison and paired horizon reporting.', [
  p('A Forecast Origin Is Not Always the Latest Row in an Export', `If daily demand is finalised the following afternoon, tomorrow morning's forecast cannot use yesterday's final total yet. Replaying the task requires both event dates and reporting dates.

At each origin, build the available history from records that had arrived by that time. A later corrected reading can be useful for scoring, but should not replace the version actually available to the historical predictor.`),
  show(p('Compare an Expanding History with a Recent Window', `An expanding window retains all past observations. A fixed recent window forgets older regimes. Neither is universally preferable: the first reduces estimation noise under stability, while the second can respond faster to change.

Choose the window rule using validation origins. Compare predictions on the same targets, including dates after a plausible operating change.`), worked('Two historical means after a level change', 'The record shifts from a low-demand period to a high-demand period. Targets begin at position three.', `y = np.array([5.,5.,5.,10.,10.,10.])
for origin in [3,4,5]:
    expanding = y[:origin].mean()
    recent = y[origin-2:origin].mean()
    print(origin, round(float(expanding), 2), round(float(recent), 2), float(y[origin]))`, '3 5.0 5.0 10.0\n4 6.25 7.5 10.0\n5 7.0 10.0 10.0', 'Both methods miss the first unannounced change. The recent window then adapts faster because it discards older conditions.')),
  p('Preserve the Paired Errors before Averaging', `Keep each method's error beside the same origin and horizon. The difference between their errors tells us on which decisions one helped. An overall mean can hide a method that improves ordinary days but fails on the peak days Botie most cares about.

Origins and horizons can overlap, so errors are not generally independent. A simple standard error treating every cell as an unrelated observation can be misleading. Report the evaluation design and use an uncertainty method compatible with its dependence.`),
 ]),
 'exploration-and-bandits': add('Complete the action-feedback loop and separate realised reward from expected regret.', [
  p('Only the Chosen Action Supplies a Reward', `A bandit learner chooses one schedule and sees its result. It cannot update the unchosen schedule with the reward it imagines that schedule would have produced. In a simulation, the evaluator may know both reward distributions, but the agent still receives only its chosen outcome.

Keep counts and value estimates for every action. An epsilon-greedy choice sometimes samples an action to gather information; otherwise it chooses an action with the largest current estimate. Define a tie rule so initial behaviour is understandable.`),
  show(p('Update Only the Action That Was Tried', `The incremental mean needs the selected action's own count. A global step count gives the wrong denominator when actions have been tried different numbers of times.

This trace supplies the chosen actions and rewards, isolating the estimate update from the selection policy. The complete experiment adds a policy before each feedback event.`), worked('Retain separate experience for two schedules', 'The first schedule is tried twice and the second once.', `count = np.zeros(2, dtype=int)
value = np.zeros(2)
for action, reward in [(0,1.), (1,4.), (0,3.)]:
    count[action] += 1
    value[action] += (reward-value[action])/count[action]
print(count.tolist())
print(value.tolist())`, '[2, 1]\n[2.0, 4.0]', 'The second schedule has a larger estimate but less evidence. Greedy selection alone does not account for that uncertainty.')),
  p('One Lucky Reward Does Not Establish a Better Policy', `Compare policies over complete sequences and repeated seeded environments. Keep the reward process stationary if that is the assumption being tested; a changing process requires a learner that can forget outdated evidence.

In a simulator with known expected rewards, expected regret compares the chosen action's expectation with the best available expectation. Realised reward remains noisy. Do not give the agent the simulator's hidden best action merely because the evaluator can use it.`),
 ]),
 'states-actions-and-transitions': add('Explain state aliasing, stochastic sampling and transition-model validation.', [
  p('The Same Observation Can Hide Different Situations', `A dry-soil reading can occur immediately after a sensor fault or after several days without water. If those situations have different next outcomes under the same action, the reading alone may not supply a useful Markov state.

Add relevant history or maintain a belief over hidden conditions when needed. The Markov assumption says the chosen state contains the information needed for predicting the next transition. Naming an array state does not make that assumption true.`),
  show(p('Check That Each Action Defines a Distribution', `For each current state and action, the next-state probabilities should be nonnegative and sum to one. Their positions must refer to the same state vocabulary throughout the model.

An expected-value calculation averages across those outcomes. A simulated transition instead draws one outcome from that distribution. Confusing the two can produce a learner that experiences averaged states that do not actually exist.`), worked('Calculate the distribution and its expected continuation', 'The two entries are dry and moist. This row describes the result of watering a dry tray.', `probability = np.array([.2,.8])
next_value = np.array([-2.,3.])
print(bool((probability >= 0).all() and np.isclose(probability.sum(), 1)))
print(round(float(probability@next_value), 3))`, 'True\n2.0', 'The expected value is two, but the next state is still either dry or moist. It is not a new state halfway between them.')),
 ]),
 'discounted-returns': add('Explain truncation and Monte Carlo variance using a complete backward return trace.', [
  show(p('Calculate a Return for Every Decision in the Episode', `The first action needs all later rewards, but later actions need only their remaining suffix. Starting from the episode's end lets us reuse the return already calculated for the next position.

The result contains one return per action time. It is not one reward copied onto every decision, and it still reflects the actions actually taken later in that episode.`), worked('Propagate the harvest reward backward', 'The episode pays two small costs before a final benefit. Discount is one half.', `rewards = np.array([-1., -1., 8.])
returns = np.zeros_like(rewards)
future = 0.
for t in range(len(rewards)-1, -1, -1):
    future = rewards[t] + .5*future
    returns[t] = future
print(returns.tolist())`, '[0.5, 3.0, 8.0]', 'The first decision includes both later costs and benefits at their respective delays.')),
  p('A Time Limit Is Not Always the End of the Task', `A true terminal state has no future reward under the task definition. A training rollout that stops because a time limit was reached may still represent an ongoing process. Setting the continuation to zero then changes the target.

For a continuing task, a truncated rollout can use an estimated value at its final state. State clearly whether the time limit is part of the environment's objective or merely a sampling limit. This distinction carries directly into temporal-difference targets.`),
  p('Observed Returns Can Vary under the Same Policy', `Different transitions and action samples can produce different returns from the same state. Averaging repeated returns estimates a policy value under those conditions, but long episodes can have substantial variability.

Bootstrapped methods use a current value estimate for part of the future, trading some dependence on that estimate for shorter sampled targets. Neither the discounted sum nor one successful episode establishes that a policy is optimal.`),
 ]),
 'bellman-value-iteration': add('Run the full iteration and distinguish update residuals, policy and model correctness.', [
  p('One Sweep Uses One Consistent Old Value Table', `For each state, calculate the expected reward plus discounted continuation for every action, then retain the best action value. A synchronous sweep reads all continuations from the old table and writes a new table.

Updating entries in place creates a different update schedule. It can still be a useful algorithm, but its intermediate values should not be compared as though it performed the same synchronous sweep.`),
  show(p('Iterate a Small Known Model to a Stable Decision', `This two-state model gives Botie an action that stays where he is and an action that moves to the other state. Rewards belong to state-action pairs, and transitions are deterministic here.

Repeat until the largest table change is small or an explicit iteration limit is reached. Then extract the greedy action from the converged action values.`), worked('Plan before collecting experience', 'Rows are states and columns are actions. The transition table stores the next-state index.', `reward = np.array([[0.,1.],[2.,0.]])
next_state = np.array([[0,1],[1,0]])
value = np.zeros(2)
for _ in range(1000):
    action_value = reward + .5*value[next_state]
    updated = action_value.max(axis=1)
    change = np.max(np.abs(updated-value))
    value = updated
    if change < 1e-10:
        break
policy = (reward + .5*value[next_state]).argmax(axis=1)
print(np.round(value, 4).tolist())
print(policy.tolist())`, '[3.0, 4.0]\n[1, 0]', 'The plan moves from state zero to state one, then takes the rewarding stay action there. The result relies on knowing the supplied transition and reward model.')),
  p('A Stable Calculation Can Plan for the Wrong Greenhouse', `For a finite discounted model with valid probabilities and discount below one, Bellman optimality updates contract differences between value tables. This supports convergence of the planning calculation.

It does not establish that the model accurately describes the greenhouse. A missing action cost or incorrect transition probability can produce a precisely computed but poor real policy. Compare simulated policy behaviour with observed transitions and test sensitivity to uncertain model entries.`),
 ]),
};
