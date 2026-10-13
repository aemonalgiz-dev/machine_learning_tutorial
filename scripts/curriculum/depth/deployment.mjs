import { p, worked, withProgram as show, supplement as add } from './shared.mjs';
export default {
 'saving-fitted-pipelines': add('Preserve the full fitted state and verify reload behaviour on independent fixtures.', [
  p('Save What Was Learned and What Was Assumed', `A linear predictor may need a feature order, units, imputation values, category vocabulary, scaling statistics, weights and an intercept. Some came from fitting; others came from the input contract. Both affect the answer.

Give the artifact a schema version. A loader should know which fields that version requires and reject unsupported versions explicitly. A model name alone does not specify how an incoming record becomes the array the weights expect.`),
  show(p('Reload in a Fresh Object and Compare Predictions', `Serialising a model is not finished when a file is written. Load the saved representation into a new object, reconstruct its numerical arrays and run fixtures that exercise more than one input.

Keep these fixtures separate from the training objective. They test that storage and loading preserve the procedure, not that the model generalises.`), worked('Round-trip a centred linear predictor', 'The feature order is temperature then humidity, with a saved mean for each.', `import json
artifact = {'schema': 1, 'features': ['temperature','humidity'], 'mean': [10.,50.], 'weight': [2.,.1], 'bias': 3.}
restored = json.loads(json.dumps(artifact))
X = np.array([[12.,60.],[10.,50.]])
def predict(model, X):
    return (X-np.array(model['mean']))@np.array(model['weight'])+model['bias']
print(predict(restored, X).tolist())
print(bool(np.allclose(predict(artifact,X), predict(restored,X))))`, '[8.0, 3.0]\nTrue', 'The comparison includes the fitted centring step. Saving weights alone would not reproduce these predictions.')),
  p('An Artifact Needs a Compatible Runtime', `A saved representation may depend on library conventions, numerical precision or custom preprocessing code. Record the runtime and code version needed to interpret it. Test a fresh process rather than relying on imports and variables left in a notebook.

For the small model here, an inspectable JSON schema is sufficient. More complex models may require another format. Only load trusted executable serialisations; plain numerical formats reduce that need but still require schema and size checks.`),
 ]),
 'prediction-input-contracts': add('Build named records into arrays with explicit missingness and unit validation.', [
  p('A Number Needs a Name and a Unit', `Temperature and humidity can both be valid floating-point values while being assigned to the wrong columns. A parser should build arrays from declared names in a fixed order, rather than trusting the order of keys supplied by the caller.

Units also belong to the interface. Celsius and Fahrenheit values can both look plausible numerically. Either accept one documented unit or perform an explicit conversion before model preprocessing. Do not infer units from the magnitude alone.`),
  show(p('Construct the Model Row from Names', `Validate required fields before calculating a prediction. Missing fields, unknown fields and explicit null values need declared policies. Rejecting unknown fields can reveal a caller's typo; accepting them may be appropriate when a versioned envelope carries other metadata.

This small parser rejects both missing and extra fields and requires finite numerical values. It demonstrates the contract independently of any web framework.`), worked('Preserve feature order despite dictionary order', 'The incoming dictionary lists humidity first, but the model contract lists temperature first.', `def row(record):
    names = ['temperature','humidity']
    if set(record) != set(names):
        raise ValueError('Expected temperature and humidity')
    if any(isinstance(record[name], (bool, str)) for name in names):
        raise ValueError('Expected numerical measurements')
    values = np.array([record[name] for name in names], dtype=float)
    if not np.isfinite(values).all():
        raise ValueError('Measurements must be finite')
    return values
print(row({'humidity': 60., 'temperature': 12.}).tolist())`, '[12.0, 60.0]', 'The caller\'s key order cannot swap the model\'s feature meanings. A complete contract can add valid ranges and explicit unit fields.')),
  p('An Error Response Should Identify the Broken Promise', `Distinguish a missing measurement from an unsupported unit, a wrong shape and a non-finite value. A caller can correct a specific contract error; a generic failed prediction provides little help.

Keep validation separate from a learned missing-value rule. If the model was trained to impute an allowed missing field, apply that saved policy. If it was not, silently filling zero invents behaviour the model was never evaluated to handle.`),
 ]),
 'serving-predictions': add('Separate batch semantics, resource limits and failure handling.', [
  p('A Batch Should Not Change the Meaning of One Record', `A deterministic fitted predictor should return the same answer for a record alone or beside other records, unless the model explicitly uses batch context. Recomputing a batch mean during serving breaks that property.

Keep the fitted transform fixed, preserve output order and return one result or a documented error for each requested record. Test a short final batch and an empty batch according to the contract.`),
  show(p('Check Single-Record and Batch Agreement', `The same prediction function can serve both forms by representing one record as a one-row matrix. That keeps the feature axis in the same position and avoids special-case arithmetic.

The service wrapper can then handle request parsing and response formatting without changing the mathematical rule.`), worked('Use one numerical path for both request sizes', 'Two features are transformed with saved training means.', `mean = np.array([10.,50.])
weight = np.array([2.,.1])
def predict(X):
    return (X-mean)@weight+3.
X = np.array([[12.,60.],[15.,40.]])
batch = predict(X)
single = np.array([predict(X[i:i+1])[0] for i in range(len(X))])
print(batch.tolist())
print(bool(np.array_equal(batch,single)))`, '[8.0, 12.0]\nTrue', 'This verifies batch consistency for the supplied rule. The surrounding service still needs to preserve those rows and their request identifiers.')),
  p('Limit Work before Starting Expensive Computation', `A valid shape can still request an unreasonable amount of memory or compute. Define supported batch sizes, input dimensions and time budgets. Measure end-to-end latency, including parsing and feature preparation, rather than only a matrix multiplication.

Batching can improve throughput while increasing waiting time for an individual request. Choose that tradeoff for the application. Avoid retaining unbounded request arrays while waiting for a larger batch.`),
  p('A Timeout Is Not a Numerical Prediction', `Keep service failures separate from model outputs. A timed-out request should not quietly return a zero prediction, which downstream code may treat as a valid estimate.

Include the model version with successful results and retain request identifiers for later outcome matching. Retries should follow a documented policy, especially if a prediction also triggers an external action. The example predictor is pure; a production action workflow needs its own duplicate-handling rules.`),
 ]),
 'model-versioning': add('Distinguish semantic compatibility from numerical comparison and build an immutable release manifest.', [
  p('A New Weight File May Need a New Input Contract', `Changing feature order, category vocabulary or target units can make a model incompatible with an earlier caller even when its array shape stays the same. Version the whole fitted procedure and its contract together.

A release manifest should identify the artifact, training data snapshot or reproducible reference, code version, dependencies, evaluation report and intended use. A human-friendly version name helps discussion; a content hash helps identify the exact bytes.`),
  show(p('Compare Releases on Preserved Requests', `A new model may legitimately change predictions. The comparison should make those changes visible and check both expected improvements and unacceptable regressions.

Use fixtures with normal inputs, boundary values and known failure cases. Compare target units and preprocessing before comparing numerical differences.`), worked('Report prediction changes without calling every change a bug', 'Both versions predict the same quantity on the same three requests.', `old = np.array([10.,20.,30.])
new = np.array([10.5,19.,36.])
change = new-old
print(change.tolist())
print(np.flatnonzero(np.abs(change) > 2).tolist())`, '[0.5, -1.0, 6.0]\n[2]', 'The final fixture exceeds the declared review threshold. Investigation still needs the input and eventual outcome; a large change alone does not say which version is better.')),
  p('Keep Earlier Releases Loadable', `Do not overwrite the previous artifact when a candidate passes offline evaluation. Store releases immutably and change a separate active-version reference. Rollback then selects a known artifact rather than trying to recreate yesterday's model from memory.

Test that the earlier runtime and preprocessing still load correctly. A retained weight file is not a usable rollback if its dependencies or input contract have been removed.`),
 ]),
 'monitoring-and-rollback': add('Use delayed labels, staged release and a concrete rollback decision record.', [
  p('Separate Service Health from Prediction Quality', `Latency, error rates and resource use tell us whether the service operates. Input distributions and missingness tell us whether the records changed. Outcome-based metrics tell us whether predictions remain useful once labels arrive.

Give each signal a reference period and a response owner. A spike in request failures calls for a different investigation from a gradual rise in forecast error. One dashboard number cannot distinguish these causes.`),
  show(p('Match Later Outcomes to the Prediction That Was Actually Issued', `Retain the prediction, issue time and model version under a stable request or event identifier. When an outcome arrives, join it to that stored prediction. Recomputing with today's model answers a different question.

Do not treat unresolved outcomes as negative labels. Track label coverage and delay so the reported score's population is visible.`), worked('Score only outcomes that have arrived', 'Prediction b remains unresolved and is excluded from this score, while its missing status is reported.', `prediction = {'a': 10., 'b': 20., 'c': 30.}
observed = {'a': 12., 'c': 27.}
matched = sorted(set(prediction) & set(observed))
error = [abs(prediction[k]-observed[k]) for k in matched]
print(matched)
print(float(np.mean(error)))
print(len(matched), len(prediction))`, "['a', 'c']\n2.5\n2 3", 'The error describes two resolved predictions. If difficult cases take longer to label, that partial score can be biased.')),
  p('Observe a Candidate before Giving It Every Decision', `A shadow run produces candidate predictions beside the active model without letting the candidate control the decision. It can reveal input-contract, latency and prediction disagreements before a rollout.

A limited rollout then exposes the candidate to a declared share of eligible traffic. Keep assignment and outcomes so comparisons remain meaningful. Shadow predictions alone cannot measure how users respond to decisions the candidate never actually made.`),
  p('Rehearse the Return to a Known Version', `Define the signals that trigger review or rollback, the person or process authorised to act, and the earlier compatible release. Test switching the full artifact and preprocessing together, then verify preserved fixtures and service health.

Record why the change occurred and which requests used each version. Rollback limits exposure to a suspected regression; it does not guarantee the earlier model is suitable after a genuine population change. Continue the investigation after service is restored.`),
 ]),
};
