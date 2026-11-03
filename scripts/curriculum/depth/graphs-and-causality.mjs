import { p, worked, withProgram as show, supplement as add } from './shared.mjs';
export default {
 'graph-representations': add('Explain directed storage, node identity and sparse edge accumulation.', [
  p('A Pipe Connection Has a Direction Only If the Problem Gives It One', `An undirected edge says two pumps are connected. A directed edge can instead describe permitted flow from one pump to another. Decide which relation the model needs before filling an adjacency matrix.

State whether rows identify senders or receivers. Matrix multiplication does not infer this convention. With sender rows, multiplying a row-vector distribution on the right moves mass along outgoing edges; gathering incoming node features uses the transposed adjacency.`),
  show(p('Keep Node Identity When Converting an Edge List', `An edge list stores endpoint indices instead of a dense table full of zeros. The indices must refer to a saved node vocabulary. Reordering a feature table without reindexing the edges sends messages to the wrong pumps.

Repeated edges need a policy: accumulate their weights for a multigraph or deduplicate them for a simple graph. Do not let the storage conversion choose that meaning accidentally.`), worked('Accumulate two reports of the same directed connection', 'Rows are source nodes and columns are destination nodes. Each report has unit weight.', `source = np.array([0,0,1])
target = np.array([1,1,2])
A = np.zeros((3,3), dtype=int)
np.add.at(A, (source,target), 1)
print(A.tolist())
print(A.sum(axis=1).tolist())`, '[[0, 2, 0], [0, 0, 1], [0, 0, 0]]\n[2, 1, 0]', 'Node zero has two reported edges to node one under the accumulation policy. A simple-graph interpretation would convert that count to one.')),
  p('An Isolated Node Still Has Features', `A node with no edges should not disappear merely because an edge list never mentions it. Store the full node vocabulary independently. Its features can still support a node-level prediction or a later connection.

For a large sparse network, avoid constructing a dense square matrix solely for convenience. The edge list or a sparse matrix can express the same connectivity with storage proportional to observed edges. Keep the tiny dense version as an inspectable teaching case.`),
 ]),
 'graph-random-walks': add('Handle dangling nodes, periodicity and restart distributions.', [
  p('A Node with No Outgoing Edges Needs a Rule', `Dividing outgoing edge weights by their row sum fails when that sum is zero. The walker could remain at the node, restart according to a chosen distribution or terminate. These are different processes.

Specify the policy before normalization. A transition matrix for a continuing walk needs every row to sum to one. Quietly leaving a zero row makes probability mass disappear when the walk reaches that node.`),
  show(p('Restarting Changes the Process We Are Studying', `A two-node walk that always switches nodes alternates forever from a concentrated start. Mixing each step with a restart distribution interrupts that strict cycle. It also changes what long-run visit frequency means.

The restart distribution can be uniform or personalized. Its choice is a modeling decision, not merely a numerical fix.`), worked('Follow a walk that would otherwise alternate', 'At each step, retain half the graph transition and use half a uniform restart.', `P = np.array([[0.,1.],[1.,0.]])
state = np.array([1.,0.])
restart = np.array([.5,.5])
for _ in range(3):
    state = .5*(state@P) + .5*restart
    print(state.tolist())`, '[0.25, 0.75]\n[0.625, 0.375]\n[0.4375, 0.5625]', 'The alternating discrepancy shrinks under this modified transition rule. The stationary distribution describes the restart process, not the original deterministic walk.')),
  p('Visit Frequency Is Not Automatically Importance', `A node can receive high mass because many paths lead to it, because a small region traps the walker or because the restart favors it. Relate the score to the inspection or retrieval task before naming it importance.

Check disconnected regions, dangling nodes and sensitivity to restart. A random walk uses connectivity; it does not automatically include node features, physical flow conservation or causal influence.`),
 ]),
 'neighbour-aggregation': add('Explain permutation invariance, isolated nodes and oversmoothing through repeated mixing.', [
  {...p("Aggregate Neighbors in Any Order", `Renumbering the neighbors should not change their summed or averaged message. A learned operation applied to each neighbor followed by a sum or mean preserves that order independence.

A flattened list fed into an ordinary dense layer generally treats positions differently. That can be appropriate if positions have roles, but arbitrary neighbor enumeration should not create those roles. Keep edge direction and edge attributes when they carry relevant information.`), id: "5-neighbours-are-a-set-not-a-meaningful-input-order"},
  show(p('Repeated Averages Can Remove the Difference We Needed', `Averaging nearby readings provides context, but repeated averaging can make connected nodes increasingly alike. That is useful for smoothing noise and harmful when the prediction depends on a local contrast.

Retaining a separate self representation, using a limited number of layers or designing another message rule can preserve information. Those are modeling choices to evaluate, not guarantees that every graph benefits from deeper aggregation.`), worked('Watch two pump readings become identical', 'Each pump averages itself with the other using this supplied mixing matrix.', `mix = np.array([[.5,.5],[.5,.5]])
features = np.array([[0.],[10.]])
once = mix@features
twice = mix@once
print(once[:,0].tolist())
print(twice[:,0].tolist())`, '[5.0, 5.0]\n[5.0, 5.0]', 'The original difference is gone after one step. A later layer cannot recover it from these identical features alone.')),
  p('Connected Does Not Necessarily Mean Similar', `A supply pump may connect to a demand pump whose normal behavior is different. Averaging them as though neighbors should agree can erase useful roles. This situation is often described as heterophily when linked nodes tend to have different labels or features.

Inspect what the edges actually represent and compare with a model using each node's own features. For an isolated node, define an empty-neighbor policy and preserve its self information rather than creating an undefined mean.`),
 ]),
 'graph-convolution': add('Trace receptive fields, trainable weights and graph-level readout.', [
  p("One Layer Reaches One Neighborhood", `One message-passing layer lets a node use its immediate neighbors. A second layer can bring information from neighbors of those neighbors because their first-layer representations already contain context.

The receptive field therefore grows with depth, but the number of distinguishable signals does not necessarily grow with it. Repeated mixing can wash out differences, and a narrow representation may compress many distant messages into very few coordinates.`),
  show(p('Separate Graph Mixing from Feature Learning', `The normalized adjacency determines which nodes exchange information and how it is scaled. The weight matrix determines how feature coordinates are combined. These are different axes of the calculation.

Check the graph operator on an unequal-degree example before adding learned features. Self-loops and degree normalization should use the same augmented adjacency.`), worked("Normalize a three-node chain", 'The graph is undirected. We add one self-loop to every node before computing degrees.', `A = np.array([[0.,1.,0.],[1.,0.,1.],[0.,1.,0.]])
augmented = A + np.eye(3)
degree = augmented.sum(axis=1)
S = augmented/np.sqrt(degree[:,None]*degree[None,:])
print(np.round(S, 4).tolist())
print(bool(np.allclose(S, S.T)))`, '[[0.5, 0.4082, 0.0], [0.4082, 0.3333, 0.4082], [0.0, 0.4082, 0.5]]\nTrue', "Symmetric normalization remains symmetric, but its rows are not required to sum to one. It is not the same operator as a random-walk transition matrix.")),
  p('A Whole-Network Prediction Needs a Readout', "Node embeddings give one representation per node. To predict a property of an entire pipe network, combine them into a graph representation. A sum retains a dependence on graph size; a mean removes that direct count effect.\n\nThe graph summary must preserve the information needed by its target. A total capacity depends on how much the network contains; an average condition asks another question. During batching, retain each graph's identity so messages and readout values from one installation do not mix with another's."),
  p('Define What the Test Nodes Are Allowed to Reveal', "Suppose a new installation arrives after training. Its node features and connections may be available when making predictions, but they did not help fit the shared weights. Check the method under that actual arrival pattern if transfer to new installations is the intended use. Results from already-known test nodes answer another question.\n\nReport whether the test nodes or graph were available during fitting. A transductive result alone does not establish transfer to an unseen installation. For link prediction, remove held-out target edges before building the message-passing graph."),
 ]),
 'link-prediction': add('Separate graph splitting, candidate negatives and decoding assumptions.', [
  p('Remove Both Directions of a Held-Out Undirected Edge', `An undirected connection is often stored twice, once in each direction. Holding out only one stored direction leaves the same connection visible to the encoder through the other entry.

Split unique physical edges first, then construct the training adjacency. Recompute graph-derived features from that training graph too. Removing an edge from the target list alone does not prevent degree counts, paths or embeddings from revealing it.`),
  show(p('A Dot Product Cannot Distinguish Two Directions', `A dot-product decoder gives the same score to a pair in either order. That can suit an undirected connection task. It cannot express that flow from A to B is likely while flow from B to A is unlikely.

A directed relation needs an order-sensitive decoder or separate source and destination representations. Choose that representation from the relation, not from whichever scoring formula is shortest.`), worked('Check the symmetry of a pair score', 'The embeddings are supplied to isolate the decoder.', `a = np.array([1.,2.])
b = np.array([3.,1.])
print(float(a@b), float(b@a))
W = np.array([[0.,1.],[0.,0.]])
print(float(a@W@b), float(b@W@a))`, '5.0 5.0\n1.0 6.0', 'The bilinear example can distinguish order because its matrix is asymmetric. Whether that flexibility is useful requires training and evaluation.')),
  p('An Unrecorded Pipe May Still Exist', `A missing edge is not necessarily a verified absence. Negative sampling chooses unrecorded candidate pairs for a training or evaluation task, and some may be genuine undiscovered connections.

State candidate restrictions, time boundaries and how negatives were obtained. Easy random pairs can inflate scores compared with plausible inspection candidates. Evaluate the ranking against the inspection process the model is intended to support.`),
 ]),
 'confounding-and-comparisons': add('Use explicit group calculations and distinguish confounders, mediators and colliders.', [
  show(p('Compare Like Starting Conditions before Combining Them', `If the new watering schedule is used more often on dry beds, its overall growth average mixes treatment differences with differences in starting soil. Compare schedules within the same pre-treatment soil group first.

Then combine those comparisons using one shared target population. Giving each treatment its own soil mixture recreates the original imbalance rather than removing it.`), worked('Separate group effects from group composition', 'Both soil groups gain two units under the new schedule, but treated beds are mostly in the harder dry group.', `old = np.array([2.,8.])
new = np.array([4.,10.])
old_mix = np.array([.2,.8])
new_mix = np.array([.8,.2])
target_mix = np.array([.5,.5])
print(round(float(new_mix@new-old_mix@old), 2))
print(round(float(target_mix@(new-old)), 2))`, '-1.6\n2.0', 'The unadjusted difference reverses the within-group comparison in this invented table. The adjusted arithmetic has a causal interpretation only under the required assumptions.')),
  p('Do Not Control for a Variable Merely because It Predicts the Outcome', `A confounder is a common cause of treatment and outcome. A mediator lies on a pathway through which treatment affects outcome. Adjusting for a mediator changes the effect being estimated and can introduce other problems.

A collider is affected by two variables. Conditioning on it can create an association that was absent before. Draw the assumed directions from the problem before selecting adjustment columns. Predictive usefulness alone does not identify an appropriate adjustment set.`),
  p('An Adjustment Cannot Repair an Unmeasured Common Cause', `Soil condition may be recorded too crudely, or the gardener may use unrecorded plant health when assigning extra water. Comparing recorded soil groups does not guarantee comparable treatment groups within them.

State what would need to be measured and what remains uncertain. Use domain knowledge, study design and sensitivity analysis to examine those assumptions. A clean numerical difference is not proof that every relevant cause was controlled.`),
 ]),
 'randomised-experiments': add('Explain assignment units, intent-to-treat, uncertainty and stopping rules.', [
  p("Randomize the Unit That Can Receive Its Own Treatment", `If neighboring beds share irrigation, assigning each plant independently may not create independent treatments. Water delivered to one can affect another. Randomize beds or larger groups when that matches how treatment is delivered, and analyze uncertainty at the appropriate unit.

Random assignment balances starting conditions in expectation, not perfectly in every small run. Record the assignment procedure before outcomes arrive and inspect whether the intended procedure was followed.`),
  show(p('Keep Assignment Separate from Compliance', `A bed assigned extra watering may miss a scheduled visit. Comparing beds by what they actually received can reintroduce selection: the missed visits may happen on particular kinds of beds.

An intention-to-treat comparison groups outcomes by original assignment. It estimates the effect of the assignment policy under the experiment's conditions, including its compliance behavior. It is not automatically the effect of receiving the treatment exactly as intended.`), worked('Compare the assigned groups', 'Assignment is random in the imagined study; the arrays below are its supplied observed record.', `assigned = np.array([0,0,1,1])
received = np.array([0,0,1,0])
growth = np.array([4.,6.,9.,5.])
itt = growth[assigned == 1].mean()-growth[assigned == 0].mean()
received_difference = growth[received == 1].mean()-growth[received == 0].mean()
print(float(itt))
print(float(received_difference))`, '2.0\n4.0', "The two comparisons use different groups. The received-treatment comparison no longer inherits randomization simply because the study began randomly.")),
  p('A Difference Needs an Uncertainty Assessment', `Four beds are enough to demonstrate the calculation, not enough to establish a stable agronomic effect. Variation among units makes the estimated difference change across possible assignments and samples.

Choose a sample-size plan, outcome definition and analysis before inspecting results. A randomization test can compare the observed statistic with assignments allowed by the actual design. Its permutations must respect blocks or clusters when those were part of assignment.`),
  p('Repeated Peeking Changes the Experiment', `Stopping the first time an ordinary significance threshold is crossed does not have the same error properties as one preplanned analysis. Nor does trying many outcomes and reporting only the most favorable one.

Use a fixed analysis plan or a suitable sequential design. Report effect size and uncertainty alongside the practical cost of the intervention. A small p-value alone does not establish that the effect is large enough to matter.`),
 ]),
 'causal-adjustment': add("Trace standardization, overlap and causal-variable selection.", [
  p('Both Treatments Must Describe the Same Target Population', "Within each pre-treatment group, estimate the outcome mean under each treatment. Then average both sets of means using the same group weights. Subtracting those standardized outcomes answers what the difference would be for that target mixture under the identification assumptions.\n\nThe target may be the study population or another specified population. Its group weights determine whose average effect we want to estimate; that target quantity is the estimand. Changing the weights changes the question, so their source should be explicit rather than determined by whichever treatment group supplied more rows."),
  show(p('Carry Group Means into Two Target Populations', "Treatment effects can differ between soil groups. In that case, two target populations can have different average effects even when every group-specific estimate is unchanged.\n\nReport each group's estimate and the number of observations supporting it alongside the overall adjusted result. Readers can then see whether a change comes from different within-group outcomes or a different target-population mix."), worked('Change the target mixture deliberately', 'The supplied group means concern dry and moist beds.', `untreated = np.array([2.,7.])
treated = np.array([6.,8.])
effect = treated-untreated
for weights in [np.array([.5,.5]), np.array([.8,.2])]:
    print(round(float(weights@effect), 3))`, '2.5\n3.4', 'The target with more dry beds has a larger average effect because that group benefits more in this supplied table.')),
  p('An Empty Treatment Cell Requires Extrapolation', `If every dry bed received treatment, we have no untreated dry-bed mean to compare. An outcome model can produce a numerical prediction there, but it extrapolates beyond observed treatment overlap.

Inspect the counts behind every estimated group mean. Combining sparse groups or restricting the target population changes assumptions or the question. State the change. More flexible modeling does not create observations of a treatment that was never used in that group.`),
 ]),
 'treatment-effects-and-overlap': add('Distinguish weighting estimators, diagnose extreme weights and state assumptions.', [
  p('A Large Weight Is a Warning about Thin Evidence', "If a kind of bed rarely receives the new schedule, a treated bed of that kind represents many similar beds under inverse-probability weighting. Its outcome can therefore dominate the estimate.\n\nInspect propensity ranges and weight concentration separately for treated and untreated records. A fitted probability near zero or one may reflect genuine lack of overlap, model misspecification or a small sample. Investigate which explanation applies before relying on the weighted comparison."),
  show(p('Measure How Concentrated the Weights Are', "Uneven weights can concentrate a weighted average on a small part of the data. Effective sample size summarizes that concentration and helps compare it with the raw record count. It is a diagnostic of the weights, not a complete uncertainty calculation or a replacement for checking causal assumptions.\n\nCompare it with the raw number of records. A large dataset whose result depends on a few enormous weights may still provide fragile evidence for the target population."), worked('Four records with one dominant weight', 'These are supplied nonnegative weights for one comparison group.', `weight = np.array([1.,1.,1.,9.])
effective = weight.sum()**2/(weight@weight)
print(len(weight))
print(round(float(effective), 3))`, '4\n1.714', 'Four records have the weight concentration of far fewer equally weighted records under this diagnostic.')),
  p("Normalizing Weights Changes the Finite-Sample Estimator", `One estimator averages inverse-weighted outcomes over the full sample size. Another divides each group's weighted outcome sum by that group's weight sum, then takes the difference. The latter is often called a normalized or Hájek form.

These estimators can differ in finite samples even under the same propensity model. State which formula is used. Clipping large weights also changes the procedure and can trade variance for bias; it is not a neutral numerical repair.`),
  p('Overlap Is Necessary but Not Sufficient', "Even well-behaved weights do not establish that all treatment-outcome common causes were measured. Within the recorded starting conditions, we assume assignment does not further separate beds by the outcomes they would have under either schedule. This is conditional exchangeability. It still depends on what was measured; balance on recorded soil conditions cannot establish that unrecorded plant health did not influence assignment. Consistency and the relevant interference assumptions are also required.\n\nReport the target population, assignment model, balance checks and remaining causal assumptions. A predictive model of treatment assignment can help estimate propensities, but its classification accuracy is not the causal objective."),
 ]),
};
