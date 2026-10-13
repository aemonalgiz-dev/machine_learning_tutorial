import { p, worked, withProgram as show, supplement as add } from './shared.mjs';
export default {
 'recurrent-layers': add('Make sequence boundaries, padding and backpropagation through time explicit.', [
  p('A New Sequence Needs a Deliberate Initial State', `If Botie processes one greenhouse's week and then another greenhouse's week, carrying hidden state across the boundary lets the second prediction depend on the first greenhouse. Reset state for independent sequences unless the task explicitly defines continuity.

For chunks of one continuous record, carrying the numerical state may be appropriate. Detaching its gradient at a chunk boundary truncates backpropagation while retaining the state value. That changes how far a later error can teach earlier computations, not what the retained vector currently contains.`),
  show(p('Padding Should Not Become an Extra Observation', `A batch can contain sequences of different lengths. Padding gives them a rectangular storage layout, but the padded positions are not additional time steps in the original record. A length mask can keep the previous state when a position is padding.

Distinguish a padded zero from a real zero measurement. Their numerical values can be identical while their roles are different.`), worked('Ignore the storage padding after a short sequence', 'The first two entries are observed inputs; the last two exist only to complete the batch layout.', `inputs = np.array([1.,2.,0.,0.])
length = 2
state = 0.
history = []
for t, value in enumerate(inputs):
    candidate = np.tanh(value + .5*state)
    if t < length:
        state = candidate
    history.append(round(float(state), 4))
print(history)`, '[0.7616, 0.983, 0.983, 0.983]', 'The state stops changing after the last real observation. Updating on the padded zeros would gradually erase information.')),
  p('Shared Weights Receive Contributions from Every Use', `Unrolling the recurrent computation gives a copy of the update operation at each time step, but those copies share parameters. Backpropagation adds the gradient contributions from every use into the same weight arrays.

Clipping a gradient's norm can limit unusually large updates, but it does not repair a wrong derivative or restore information lost through vanishing gradients. Check a short deterministic sequence with finite differences before trusting a long training run.`),
 ]),
 'radial-basis-networks': add('Fit the linear output layer, expose centre-width choices and evaluate extrapolation.', [
  p('A Centre and a Width Define One Local Response', `A radial basis unit responds according to distance from its centre. The width determines how quickly its response falls as the input moves away. Several centres divide the input space into overlapping regions of influence without assigning each input to only one region.

Choosing centres from training observations or fitted clusters is a modelling step. Learning widths or centres by optimisation is another. Keep those choices separate from fitting the output weights, which is a linear problem once the basis responses are fixed.`),
  show(p('Turn Local Responses into a Regression Table', `Evaluate each basis at every training input to build a design matrix. Add an intercept column if the output rule needs a baseline. A least-squares solver can then fit the output coefficients.

The basis functions are nonlinear in the original input, but the prediction is linear in these output coefficients. This is the same distinction used in polynomial regression.`), worked('Fit two Gaussian basis responses and an intercept', 'The centres and width are fixed teaching choices, not learned quantities in this program.', `x = np.array([-1.,0.,1.])
y = np.array([0.,1.,0.])
centres = np.array([-1.,1.])
def design(values):
    response = np.exp(-.5*((values[:,None]-centres[None,:])/1.)**2)
    return np.column_stack([np.ones(len(values)),response])
w = np.linalg.lstsq(design(x), y, rcond=None)[0]
print(np.round(design(x)@w, 4).tolist())
print(design(np.array([10.])).shape)`, '[0.0, 1.0, 0.0]\n(1, 3)', 'Three fitted coefficients interpolate these three targets. That easy fit does not establish useful predictions away from the observations.')),
  p('Far from Every Centre, Only the Baseline May Remain', `Gaussian basis responses approach zero far from their centres. With an intercept, the prediction then approaches that intercept. Without one, it approaches zero. Neither behaviour necessarily matches the underlying problem.

Inspect widths that are too narrow and too broad. Narrow units can leave unsupported gaps; broad units can create similar columns and unstable coefficients. Choose centres, widths and regularisation using an evaluation that reflects where new inputs will occur.`),
 ]),
 'residual-connections': add('Trace the gradient route and distinguish identity from projection shortcuts.', [
  show(p('The Skip Route Also Carries a Gradient', `A residual block adds a learned correction to its input. Differentiating the sum gives a direct contribution from the identity route alongside the derivative through the correction. This is why the skip connection changes optimisation, not merely the appearance of a diagram.

The sum can still cancel in a particular direction, so a residual connection is not a guarantee that gradients never vanish. It supplies another route that the network can use.`), worked('Compare a small correction with a replacement', 'For this scalar illustration, the correction multiplies its input by 0.1.', `x = 4.
correction_weight = .1
replacement = correction_weight*x
residual = x + correction_weight*x
print(replacement, residual)
print(correction_weight, 1+correction_weight)`, '0.4 4.4\n0.1 1.1', 'The final line gives derivatives with respect to the input. The residual path retains the direct derivative of one.')),
  p('An Addition Requires Compatible Representations', `If the correction changes channel count or spatial resolution, the original input cannot be added unchanged. A projection shortcut can map it to the required shape, often with a learned linear operation.

That projection is no longer an identity route. Include its parameters and computation when explaining the block. A shape match alone is not the learning objective; the combined representation must still be trained for the downstream task.`),
 ]),
 'embedding-layers': add('Explain repeated-index gradients, padding and what embedding training can identify.', [
  p('A Lookup Selects Rows, Not Numerical Magnitudes', `A token ID identifies one row of the embedding table. Changing cat's ID from three to seven and moving its embedding row with it should leave the model's behaviour unchanged. The ID itself does not tell the model that cat is closer to one word than another.

The selected vector enters later computations, whose loss supplies a gradient for that row. Rows absent from the batch receive no lookup contribution from it. Their possible regularisation updates are a separate part of training.`),
  show(p('Repeated Tokens Send Several Contributions to One Row', `If the same token occurs twice, both positions read the same parameter row. During the backward pass, their gradient contributions must be added. Overwriting the row with the last contribution loses part of the learning signal.

Use an accumulation operation that handles repeated indices. This connects the embedding update directly to the repeated-destination case from NumPy indexing.`), worked('Accumulate two occurrences of the same token', 'Token one appears twice and token three once. Each occurrence has its own two-coordinate upstream gradient.', `ids = np.array([1,3,1])
upstream = np.array([[1.,2.],[3.,4.],[5.,6.]])
gradient = np.zeros((4,2))
np.add.at(gradient, ids, upstream)
print(gradient.tolist())`, '[[0.0, 0.0], [6.0, 8.0], [0.0, 0.0], [3.0, 4.0]]', 'The two contributions to row one add together. Their positions in the sentence remain separate even though their parameter row is shared.')),
  p('Padding Is a Storage Token with a Special Role', `A padding ID lets different-length sequences share a batch shape. Decide whether its embedding is fixed and ensure padded positions are excluded from the relevant loss and attention operations. A zero embedding alone does not automatically mask all later computations.

Keep unknown tokens, padding and end-of-sequence tokens distinct. An unknown token represents content outside the vocabulary; padding represents no content at that position; an end marker represents an actual sequence boundary.`),
 ]),
 'positional-encoding': add('Explain why content-only attention misses order, how positions combine and what extrapolation means.', [
  p('The Same Words Can Describe Different Events', `Compare the dog chased the cat with the cat chased the dog. A collection of word vectors contains the same words, but their positions change who did what. A model needs a signal that distinguishes those arrangements.

Without an order signal or order-dependent constraint, self-attention processes a reordering as a corresponding reordering of its inputs. Content similarity alone does not assign first, second or later roles. Causal masking supplies an ordering constraint, while positional information can describe locations and distances more directly.`),
  show(p('Add a Position Signal without Creating More Token Rows', `An additive position vector has the same width as a token embedding. The model receives their sum at each sequence position. This preserves the table shape while making two occurrences of the same word distinguishable by location.

The addition does not attach a human-readable position label to a dedicated coordinate. Later learned operations must use the combined representation.`), worked('One word at two positions', 'The position vectors below are supplied illustrative vectors, not a fitted positional table.', `word = np.array([2.,1.])
position = np.array([[0.,1.],[1.,0.]])
encoded = word + position
print(encoded.tolist())
print(encoded.shape)`, '[[2.0, 2.0], [3.0, 1.0]]\n(2, 2)', 'Both rows began with the same word vector. Their differing position contributions make their resulting representations different.')),
  p('A Position Rule and a Trained Context Length Are Different Limits', `A sinusoidal formula can be evaluated at positions beyond those seen during training. That does not establish that the trained model will behave well there. Learned absolute tables can also have an explicit maximum index.

Relative-position methods and rotary methods change how positional relationships enter attention. They do not remove memory cost, training-distribution limits or the need to evaluate long-context behaviour. Distinguish a mathematically defined position from a context length the full model has learned to use.`),
 ]),
 'attention': add('Teach padding masks, complete multihead shapes and attention interpretation limits.', [
  p('Mask a Score before Turning It into a Share', `A padded position should not receive attention merely because a batch needs a rectangular shape. Set its score to an excluded value before softmax so the allowed positions receive the whole normalised share. A causal mask additionally excludes future positions.

If an entire query row is masked, ordinary softmax has no allowed outcome. Handle that row explicitly according to the task. Replacing excluded scores with a large negative number is a numerical implementation choice; it does not define what an all-masked row should mean.`),
  show(p('Remove an Unavailable Key and Renormalise', `An attention share is relative to the allowed keys. Removing one key changes the denominator and therefore the shares of the remaining keys, even when their original scores stay unchanged.

The resulting vector is a weighted sum of values. Scores and values have separate jobs, so keep both beside the calculation.`), worked('A padded key must not receive a share', 'The third key is padding. The two allowed scores are equal.', `scores = np.array([1.,1.,9.])
allowed = np.array([True,True,False])
masked = np.where(allowed, scores, -np.inf)
weight = np.exp(masked-np.max(masked))
weight /= weight.sum()
values = np.array([[2.,0.],[0.,4.],[100.,100.]])
print(weight.tolist())
print((weight@values).tolist())`, '[0.5, 0.5, 0.0]\n[1.0, 2.0]', 'The very large padded score contributes nothing. Masking the output after softmax instead would have already changed the allowed weights.')),
  p('Each Head Makes Its Own Comparison', `Multihead attention projects the representation into several query, key and value spaces. Each head calculates its own score table and weighted values. Concatenate those head outputs, then apply an output projection to mix their information.

Heads are learned computational components, not preassigned grammatical jobs. A head may show a recognisable pattern on some examples without reliably representing one human concept. Track batch, head, query, key and feature axes before combining arrays.`),
  p('A Large Attention Weight Is Not a Complete Explanation', `The output depends on value vectors, output projections, residual paths and later layers as well as attention weights. A large weight on one token does not by itself establish that the token caused the final decision in a particular human sense.

Inspect controlled input changes and resulting predictions alongside the attention display. Treat the display as a view of one operation in the model, with a clearly stated mask and layer, rather than a complete explanation of its reasoning.`),
 ]),
 'transformer-blocks': add('Explain batching, feed-forward mechanics, full decoder boundaries and training state.', [
  p('A Batch Adds an Axis, Not a Conversation between Examples', `A decoder batch commonly stores batch, token and feature axes. Attention should compare positions within the same sequence, not words from unrelated examples in other batch rows.

Different sequence lengths need padding masks, while next-token training also needs a causal mask. Check both with unequal lengths. A triangular mask alone prevents looking forward but does not automatically remove every padded key.`),
  show(p('The Feed-Forward Network Reuses Its Rule at Every Position', `Attention mixes information between positions. The feed-forward network applies the same learned transformation independently to each position's current vector. Expanding and then reducing the feature width gives that transformation room to form nonlinear combinations.

This distinction explains why the block needs both operations. Sharing the same feed-forward weights across positions does not mean each position produces the same output.`), worked('Apply one position-wise transformation to two rows', 'The supplied matrices isolate the expand, activate and contract sequence.', `X = np.array([[1.,-1.],[2.,1.]])
W1 = np.array([[1.,0.,1.],[0.,1.,-1.]])
W2 = np.array([[1.,0.],[0.,1.],[1.,1.]])
hidden = np.maximum(X@W1, 0)
print(hidden.tolist())
print((hidden@W2).tolist())`, '[[1.0, 0.0, 2.0], [2.0, 1.0, 1.0]]\n[[3.0, 2.0], [3.0, 2.0]]', 'The rows happen to produce equal final vectors despite different hidden activations. Shared weights do not require equal outputs, but they can discard distinctions.')),
  p('A Block Still Needs a Vocabulary Head and an Objective', `A decoder language model begins with token representations, applies a stack of blocks, and maps each final position to one score per vocabulary entry. The shifted target token supplies the training label at that position.

Gradients must pass from that loss through the vocabulary projection, every block and the input embeddings that participated. A forward pass through one block demonstrates architecture. It is not a pretrained language model and has no learned linguistic competence by itself.`),
  p('Normalisation Placement Is Part of the Architecture', `Applying normalisation before a sublayer and applying it after the residual addition produce different computations and gradient paths. Preserve the selected convention when reproducing a model; moving a normalisation is not a formatting change.

Training and generation also require different execution behaviour for dropout and gradient tracking. Save enough configuration to reconstruct the exact block, including widths, head count, activation, normalisation convention and mask rules.`),
 ]),
 'next-token-prediction': add('Complete a fitted language baseline and cover corpus splits, padding and token-weighted loss.', [
  p('Split Documents before Turning Them into Overlapping Windows', `Adjacent training windows share most of their tokens. Randomly splitting those windows can place almost identical passages in training and evaluation. Split at the document or other independent source level before constructing windows, and inspect duplicates across the boundary.

Decide how document boundaries are represented. Joining two unrelated documents without a separator creates a transition that never occurred in either source. The tokenizer, boundary rule and window construction belong to the training procedure.`),
  show(p('Train a Small Next-Token Model before Adding a Network', `A bigram model keeps one next-token count row per current token. Adding a small count to every possible continuation prevents an unseen pair from receiving zero probability. Normalising each row produces a complete conditional distribution.

This model reads only the immediately preceding token. That limitation makes a useful baseline: the training target is the same kind of next-token target, but the context representation is deliberately restricted.`), worked('Learn transitions from two tiny sequences', 'IDs zero, one and two stand for three vocabulary entries. The sequences are kept separate.', `sequences = [[0,1,2],[0,1,1,2]]
count = np.ones((3,3))
for sequence in sequences:
    for current, target in zip(sequence[:-1], sequence[1:]):
        count[current,target] += 1
probability = count/count.sum(axis=1, keepdims=True)
print(np.round(probability, 3).tolist())
test = [0,1,2]
loss = -np.mean([np.log(probability[a,b]) for a,b in zip(test[:-1],test[1:])])
print(round(float(loss), 3))`, '[[0.2, 0.6, 0.2], [0.167, 0.333, 0.5], [0.333, 0.333, 0.333]]\n0.602', 'The final test sequence overlaps the training examples, so this loss is only a calculation check. A genuine evaluation would use independent held-out text.')),
  p('Average over the Tokens That Actually Carry Targets', `Sequences in a padded batch can contain different numbers of scored tokens. Sum the negative log probabilities on valid target positions and divide by the number of those positions. Equal weighting of per-sequence means answers a different question when lengths differ.

Keep end markers if they are part of the objective, and exclude storage padding. A batch with no valid targets needs an explicit skip or error policy. Dividing by one to hide a zero count does not create a meaningful loss.`),
  p('Low Next-Token Loss Does Not Answer Every User Task', `The objective rewards probability on observed continuations. It does not directly certify factuality, instruction following, useful explanations or safety. A model can exploit repeated boilerplate and frequent tokens while failing on the decisions people care about.

Retain token-level loss as one diagnostic and evaluate relevant tasks separately. Compare losses only under compatible tokenisation, target masking and data conventions; changing those changes what one averaged term represents.`),
 ]),
 'autoregressive-generation': add('Clarify cached state, context truncation and batch stopping.', [
  p('A Cache Reuses Computation from an Unchanged Prefix', `During causal generation, earlier token representations cannot depend on tokens that have not been generated yet. Their key and value projections can therefore be retained while a new query is calculated for the appended token.

The cache must match the model weights, position convention, mask and exact prefix. Editing an earlier token invalidates affected cached state. A cache accelerates the same intended computation; it does not supply additional knowledge or change the probability model by itself.`),
  show(p('Different Sequences Can Finish at Different Times', `In a generated batch, one sequence can emit an end marker while another continues. Keep a finished mask and stop extending completed sequences. The remaining rows still need their own prefix and sampling state.

Also impose a maximum length. Reaching that limit means the run was truncated, which is different from the model choosing an end marker.`), worked('Retain a per-sequence stopping state', 'Token zero is the end marker. The supplied choices illustrate three generation rounds.', `finished = np.array([False,False])
length = np.zeros(2, dtype=int)
for chosen in [np.array([2,1]), np.array([0,3]), np.array([4,0])]:
    length += ~finished
    finished |= chosen == 0
print(length.tolist())
print(finished.tolist())`, '[2, 3]\n[True, True]', 'The first sequence stops after its second generated token. The later supplied choice for that row is ignored by the length accounting.')),
  p('Dropping Old Tokens Changes the Available Evidence', `A context limit can require truncating a long prefix. Decide which information is retained, including task instructions and recent conversation. A model cannot reliably use evidence that has been removed from its input.

Position handling and cache updates must remain consistent with the chosen truncation method. Test the complete generation implementation against an uncached reference on short prefixes before relying on an optimisation for long ones.`),
 ]),
 'sampling-and-temperature': add('Separate policy order, stochastic reproducibility and evaluation over samples.', [
  show(p('Filtering Changes the Distribution, Not Just Its Display', `After selecting a permitted set of tokens, normalise the remaining weights again. The sampled probabilities belong to that filtered distribution, which can differ substantially from the original model distribution.

Temperature, top-k and nucleus filtering can be composed in different orders. State the order being used, and preserve at least one candidate. Temperature zero needs a separately defined greedy policy rather than literal division by zero.`), worked('Renormalise after a top-two choice', 'The model probabilities are supplied. No retraining occurs.', `probability = np.array([.5,.3,.2])
keep = np.argsort(-probability)[:2]
filtered = np.zeros_like(probability)
filtered[keep] = probability[keep]
filtered /= filtered.sum()
print(np.round(filtered, 4).tolist())`, '[0.625, 0.375, 0.0]', 'The retained tokens now carry all probability mass. Their model probabilities were not originally these larger numbers.')),
  p('One Pleasant Completion Is Not a Sampling Evaluation', `A random seed can reproduce a particular draw sequence under the same implementation and request order. It does not establish that a sampling policy usually produces useful responses.

Evaluate several declared prompts and repeated samples, retaining failures as well as successes. Compare diversity, correctness and task constraints separately. Lower temperature can repeat an incorrect favourite more consistently; greater variety can reveal alternatives without making them more reliable.`),
 ]),
};
