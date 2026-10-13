import { question as q } from '../depth-helpers.mjs';

export default {
 'numpy-arrays': {
  after: 'Why a List and an Array Give Different Answers', title: 'Questions on Lists and Array Operations',
  questions: [q('readings = [2, 3, 5]. The expression is readings * 2, before converting to NumPy.', 'What does this expression represent?', ['The same three list entries repeated twice', 'Three doubled numerical measurements', 'A two-dimensional NumPy array'], 0, 'Python list multiplication repeats the collection. Converting to an array changes which multiplication rule is applied.')],
 },
 'numpy-indexing': {
  after: 'Choose Two Cells or a Rectangular Subtable', title: 'Questions on Selecting Pairs and Rectangles',
  questions: [q('a = [[10,11,12],[20,21,22],[30,31,32]] as a NumPy array. Row indices are [0,2] and column indices are [0,2].', 'Which request selects all four corner cells as a two-by-two table?', ['a[np.ix_([0,2], [0,2])]', 'a[[0,2], [0,2]]', 'a.reshape(3,3)'], 0, 'ix_ constructs independent row and column selections. Two ordinary index arrays select paired cells instead.')],
 },
 'data-leakage': {
  after: 'Ask Whether Changing Tomorrow Changes Today’s Input', title: 'Questions on Information Available at Prediction Time',
  questions: [q('At origin 3, indices 0,1,2 are available. Tomorrow begins at index 3. A feature is the mean of y[1:4].', 'Does this feature respect the information boundary?', ['No: it includes index 3', 'Yes: a mean cannot leak a target', 'Yes: its slice starts in the past'], 0, 'The slice includes indices 1,2,3. Ending in the future leaks information even when most of the window is historical.')],
 },
 'density-based-clustering': {
  after: 'Connect Core Points Before Attaching the Border', title: 'Questions on Extending a Dense Region',
  questions: [q('Core A is near border B. B is near C, but C is not near any core point. B does not meet the core count.', 'Can B extend A’s cluster to C?', ['No: only core points extend the region', 'Yes: any assigned point can extend it', 'Yes: all nearby points are cores'], 0, 'B can join as a border point, but its own neighbours do not extend the dense region. C remains unsupported under the stated setup.')],
 },
 'hidden-state-filtering': {
  after: 'An Impossible Report Cannot Be Normalised', title: 'Questions on Updating a Hidden-State Belief',
  questions: [q('The predictive belief is [0.7,0.3]. A report has likelihood [0,0] under the two modelled states.', 'What should the filter do?', ['Report that the observation has zero probability under the model', 'Return [0,0] as a valid posterior', 'Choose the first state because it was more likely'], 0, 'The weights have zero total and cannot be normalised. A valid posterior needs a model that assigns positive probability to the observed report.')],
 },
 'rolling-forecast-validation': {
  after: 'A Forecast Origin Is Not Always the Latest Row in an Export', title: 'Questions on Delayed Forecast Inputs',
  questions: [q('A forecast is issued at 08:00 Tuesday. Monday’s final demand is only published at 14:00 Tuesday. A retrospective export labels it Monday.', 'Can the 08:00 forecast use Monday’s final demand?', ['No: it had not been published yet', 'Yes: its event date is Monday', 'Yes: it is available in the final export'], 0, 'Availability time controls the historical information boundary. The event date alone does not make the value available.')],
 },
 'recommendation-factorisation': {
  after: 'An Unopened Guide Is Not a Negative Rating', title: 'Questions on Missing Recommendation Feedback',
  questions: [q('A guide was never shown to a reader and has no rating from them.', 'What does that missing rating establish?', ['No explicit preference was observed for that pair', 'The reader disliked the guide', 'The correct rating is zero'], 0, 'Absence can reflect lack of exposure. Treating it as a confirmed negative requires an additional, often unjustified assumption.')],
 },
 'graph-convolution': {
  after: 'Normalise a three-node chain', title: 'Questions on the Graph Mixing Operator',
  questions: [q('A is an undirected adjacency. Self-loops are added, then S = D^(-1/2)(A+I)D^(-1/2), using degrees from A+I.', 'Which property should we expect here?', ['S is symmetric, but its rows need not sum to one', 'Every row must sum to one', 'Self-loops can be omitted when computing D'], 0, 'Symmetric degree normalisation differs from row-stochastic random-walk normalisation. Both endpoint degrees use the augmented graph.')],
 },
 'randomised-experiments': {
  after: 'Keep Assignment Separate from Compliance', title: 'Questions on Assignment and Received Treatment',
  questions: [q('Some beds assigned the new watering schedule miss their visits. The intended analysis is intention-to-treat.', 'Which grouping preserves the assigned-policy comparison?', ['Original random assignment', 'Whether water was actually delivered', 'Whether growth improved'], 0, 'Intention-to-treat groups by original assignment. Actual receipt may depend on later conditions and no longer be randomly assigned.')],
 },
 'attention': {
  after: 'Remove an Unavailable Key and Renormalise', title: 'Questions on Masked Attention',
  questions: [q('Scores are [1,1,9]. The third key is padding and is excluded before softmax.', 'What shares should the two allowed keys receive?', ['Equal shares summing to one', 'Tiny shares because the padded score is largest', 'Shares summing to less than one'], 0, 'The padded key is outside the normalisation. Equal allowed scores receive equal shares of the complete allowed distribution.')],
 },
 'supervised-fine-tuning': {
  after: 'Align the Response Mask after Shifting Targets', title: 'Questions on the First Response Target',
  questions: [q('Tokens are [prompt_A, prompt_B, answer_A, end]. The objective scores answer_A and end only.', 'Which input position predicts the first scored response token?', ['prompt_B', 'answer_A', 'end'], 0, 'Each input predicts the following token. The last prompt position predicts answer_A, so its shifted target must be included.')],
 },
 'diffusion-models': {
  after: 'Fit the Predictors, Then Generate without a Clean Input', title: 'Questions on Training and Reverse Sampling',
  questions: [q('Training creates noisy values from clean samples and recorded random noise. Generation begins from a new Gaussian draw and uses the fitted timestep predictors.', 'Which quantity must generation estimate rather than receive from the training pair?', ['The noise prediction at its current sample and timestep', 'The timestep index', 'The chosen beta schedule'], 0, 'Generation does not know the forward noise of a corresponding clean target. It uses the learned predictor at each current noisy state.')],
 },
};
