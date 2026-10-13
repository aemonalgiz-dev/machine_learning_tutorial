import { p, worked, withProgram as show, supplement as add } from './shared.mjs';
export default {
 'autoencoders': add('Train both halves and expose the identity shortcut, scaling and latent sampling limits.', [
  p('Both Halves Learn from the Same Reconstruction Error', `The decoder receives the code and tries to recover the input. Its error supplies gradients for decoder weights, then continues through the code into encoder weights. Training only the decoder while keeping an arbitrary encoder fixed is a different procedure.

For a linear encoder and decoder, the chain rule is especially visible. Save the old parameter values while calculating both gradients, then update together. Biases and nonlinear activations can be added later without changing the need to connect both halves to the loss.`),
  show(p('Fit a One-Coordinate Bottleneck', `The two input coordinates below always move together, so one code coordinate can retain all their information. That makes a useful first training check. If the coordinates varied independently, the same bottleneck would have to discard something.

This example uses mean squared reconstruction error with its explicit averaging convention. The encoder and decoder both receive updates from the loss.`), worked('Learn the redundant direction', 'Rows are observations and columns are two perfectly related measurements.', `X = np.array([[-2.,-2.],[-1.,-1.],[1.,1.],[2.,2.]])
encoder = np.array([[.2],[.3]])
decoder = np.array([[.3,.2]])
initial = np.mean((X@encoder@decoder-X)**2)
for _ in range(1000):
    code = X@encoder
    error = code@decoder-X
    ddecoder = 2*code.T@error/X.size
    dencoder = 2*X.T@(error@decoder.T)/X.size
    encoder -= .02*dencoder
    decoder -= .02*ddecoder
print(bool(np.mean((X@encoder@decoder-X)**2) < initial))
print(np.round(X@encoder@decoder, 2).tolist())`, 'True\n[[-2.0, -2.0], [-1.0, -1.0], [1.0, 1.0], [2.0, 2.0]]', 'The model learns an adequate code for this redundant dataset. Its code scale is not uniquely determined because encoder and decoder scalings can compensate.')),
  p('A Wide Shortcut Can Make Reconstruction Too Easy', `If the model can copy every input coordinate directly, low reconstruction loss may reveal little about useful structure. A bottleneck, denoising task, sparsity constraint or another explicit restriction changes what the model must learn.

Choose the restriction from the intended use. Compression, anomaly detection and representation learning need different evaluations. Inspect held-out reconstruction and downstream usefulness rather than assuming a low training loss establishes a meaningful code.`),
  p('A Decoder Does Not Specify Which Codes to Sample', `A conventional autoencoder learns codes for observed inputs, but leaves their overall distribution largely unconstrained. Randomly sampling a convenient Gaussian can visit code regions the decoder never encountered.

Inspect interpolations and sampled outputs separately from reconstruction. A VAE adds an explicit probabilistic objective and prior so generation has a defined starting distribution. That additional structure is a reason for the next method, not merely a different encoder name.`),
 ]),
 'generative-adversarial-networks': add('Clarify alternating gradient ownership and diagnose missing modes beyond scalar losses.', [
  p('Freeze the Opponent’s Parameters without Breaking Its Derivative', `During a discriminator update, generated samples are treated as inputs from the current generator. During a generator update, the discriminator's parameters stay fixed, but its derivative with respect to the generated input must still flow back into the generator.

Removing that derivative path would leave the generator without feedback. Updating the discriminator at the same time with the generator's objective would train a different game. Make parameter ownership explicit in each half of the loop.`),
  show(p('A Correct Mean Can Hide Missing Variety', `Suppose real observations form two groups. A generator that always produces their midpoint can match the overall mean while producing neither group. Comparing a single average therefore misses a basic form of collapse.

Inspect a distribution-sensitive summary and representative samples. In higher dimensions, the measurement representation used for evaluation also determines which differences can be seen.`), worked('Compare a two-group source with a collapsed generator', 'These supplied samples isolate the evaluation problem; they are not outputs from training in this program.', `real = np.array([-2.,-2.,2.,2.])
collapsed = np.zeros(4)
print(float(real.mean()), float(collapsed.mean()))
print(float(real.var()), float(collapsed.var()))
print(int((real < -1).sum()), int((collapsed < -1).sum()))`, '0.0 0.0\n4.0 0.0\n2 0', 'Equal means conceal both lost variance and a missing group. A useful assessment needs more than matching one moment.')),
  p('The Two Loss Curves Are Responses to Moving Opponents', `A discriminator loss changing across training can reflect changes in either model. A stronger discriminator can make the generator's task harder even when the generator has improved by another measure.

Save generated samples from fixed latent inputs alongside independent evaluation samples. Fixed inputs reveal how the mapping changes; fresh inputs reveal its current distribution. Repeat runs and inspect mode coverage, rather than selecting the checkpoint with the most attractive isolated image.`),
 ]),
 'diffusion-models': add('Complete time-conditioned denoiser fitting and a multistep reverse sampler, with an explicit toy scope.', [
  p('The Denoiser Must Predict Noise It Was Not Given', `The earlier oracle check recovers a clean strip by supplying its actual noise. A learned denoiser receives only the noisy value and the timestep. Its target is the noise used to create that training pair, which stays on the training side of the loss.

To make a complete fit manageable, we will use one-dimensional clean samples instead of images. They come from a Gaussian centred at two with standard deviation one half. A separate linear predictor at each timestep can approximate the optimal noise prediction for this Gaussian teaching distribution.`),
  p('Give Each Noise Level Its Own Training Pairs', `At one timestep, draw clean samples and independent standard-normal noise, combine them using the forward schedule, and fit noise from the noisy value plus an intercept. Repeat for every timestep. The fitted coefficient table represents timestep conditioning in this small example.

An image model usually shares a much richer neural predictor across noise levels and receives a timestep representation. Our separate regressions expose the same input-target separation without pretending to train an image generator.`),
  p('A Reverse Step Needs a Mean and a Noise Scale', `The predicted noise enters the reverse mean. Sampling then adds the chosen reverse noise term, except at the final step. A clean-sample estimate and a reverse sample are different quantities; jumping straight to the clean estimate skips the intended chain.

The program below uses the common DDPM posterior-variance schedule. Starting from a standard Gaussian is appropriate only when the final forward distribution is close enough to it. Sixty steps at the supplied rate make retained signal small for this toy, but finite-step and fitted-model error remain.`, 'αₜ = 1 - βₜ\nμθ(xₜ,t) = (xₜ - βₜ εθ(xₜ,t) / √(1-ᾱₜ)) / √αₜ\nβ̃ₜ = βₜ (1-ᾱₜ₋₁) / (1-ᾱₜ)\nxₜ₋₁ = μθ(xₜ,t) + √β̃ₜ z\nAt the final step, use no additional noise.'),
  show(p('Fit the Predictors, Then Generate without a Clean Input', `The first loop constructs supervised pairs and fits the timestep-specific predictors. The second loop begins from unrelated Gaussian noise and walks backward using only those fitted coefficients. It never reads a clean target or the original forward noise during generation.

Inspect generated mean and spread against the source distribution. This is a complete toy training and sampling procedure, with a deliberately simple Gaussian source and linear denoisers. It cannot demonstrate image structure, multimodal coverage or text conditioning.`), worked('A trained scalar diffusion chain', 'A fixed generator makes this example repeatable in the browser. Print the sample shape, then its mean and standard deviation rounded to three places. The source mean is two and its standard deviation is one half.', `rng = np.random.default_rng(12)
beta = np.full(60, .1)
alpha = 1-beta
retained = np.cumprod(alpha)
model = []
for t in range(len(beta)):
    clean = rng.normal(2., .5, 20000)
    noise = rng.normal(size=len(clean))
    noisy = np.sqrt(retained[t])*clean + np.sqrt(1-retained[t])*noise
    design = np.column_stack([noisy, np.ones(len(noisy))])
    model.append(np.linalg.lstsq(design, noise, rcond=None)[0])
generated = rng.normal(size=5000)
for t in range(len(beta)-1, -1, -1):
    predicted_noise = model[t][0]*generated + model[t][1]
    mean = (generated-beta[t]*predicted_noise/np.sqrt(1-retained[t]))/np.sqrt(alpha[t])
    previous_retained = retained[t-1] if t > 0 else 1.
    variance = beta[t]*(1-previous_retained)/(1-retained[t])
    generated = mean + np.sqrt(variance)*rng.normal(size=len(generated)) if t > 0 else mean
print(generated.shape)
print(round(float(generated.mean()), 3), round(float(generated.std()), 3))`, '(5000,)\n2.007 0.377', 'The mean is close to the source mean, but the generated spread is noticeably smaller than one half. The coarse schedule, chosen reverse variance and fitted predictors approximate the reverse process. This is a working chain whose distribution still needs improvement, not a successful fit merely because it produces numbers. Try a finer schedule and compare repeated runs, including spread as well as location.')),
  p('Why More Steps and Better Training Solve Different Problems', `A finer reverse schedule can reduce discretisation effects, while a more capable denoiser can reduce prediction error. Increasing sampling steps does not automatically fix a predictor trained on the wrong data, and a perfect training fit does not guarantee coverage of unseen modes.

Conditional generation adds another input, such as a class or text representation, and must be trained to use it. Guidance changes the sampling procedure and its tradeoffs. Keep those extensions separate from the unconditional scalar chain so the source of each improvement can be investigated.`),
 ]),
 'supervised-fine-tuning': add('Make formatting, token masking and evaluation a complete adaptation procedure.', [
  p('The Conversation Template Is Part of the Training Input', `Role markers, separators and end markers tell the model where instructions and responses begin and end. Training with one template and serving with another changes the token sequence on which the model was conditioned.

Use the exact tokenizer and formatting convention intended for the base model. Preserve boundaries when packing multiple examples. If examples share one packed sequence, decide whether attention may cross their boundaries rather than silently training on unrelated preceding conversations.`),
  show(p('Align the Response Mask after Shifting Targets', `A next-token input position predicts the following token. Therefore the response-only loss mask belongs to the shifted target positions. Masking the unshifted input roles can skip the first response token or include a prompt token by mistake.

Keep a tiny formatted sequence with explicit role labels as a fixture. Check the first response token, the end marker and padding independently before training on a large corpus.`), worked('Shift IDs and response membership together', 'The final token is an end marker included in the response objective.', `ids = np.array([10,11,20,21,0])
is_response = np.array([False,False,True,True,True])
inputs = ids[:-1]
targets = ids[1:]
loss_mask = is_response[1:]
print(inputs.tolist())
print(targets.tolist())
print(loss_mask.tolist())`, '[10, 11, 20, 21]\n[11, 20, 21, 0]\n[False, True, True, True]', 'The last prompt input predicts the first response target, so that target must be scored.')),
  p('Demonstrations Teach Their Habits as well as Their Answers', `A dataset can teach verbosity, refusal patterns, formatting errors and unsupported claims alongside the intended task. Deduplicate and inspect examples, reserve independent prompts for validation, and test behaviours the base model should retain.

Compare the adapted model with the base model under the same prompting and decoding policy. Falling response loss is evidence of fitting the demonstrations, not proof of broader usefulness. LoRA changes which parameters are trained; it does not change these data and evaluation responsibilities.`),
 ]),
 'low-rank-adaptation': add('Derive factor gradients and explain merge, rank and memory boundaries.', [
  p('The Factors Need Different Initial Roles', `If both factors are zero, each factor's gradient is multiplied by the other zero factor. Neither starts learning. Initialising one factor randomly and the other at zero keeps the initial effective update zero while allowing one gradient route to begin.

Using row inputs, write the adapter as x A B with A mapping down to the rank dimension and B mapping back to the output dimension. This is a convention for these examples; transpose conventions in other implementations must be followed consistently.`),
  show(p('Trace Which Factor Receives the First Gradient', `The upstream derivative reaches B through x A. It reaches A through B, so when B begins at zero, A initially receives zero gradient. After B changes, both factors can learn.

The base weight remains fixed in this adaptation. Its contribution still affects the prediction and therefore the upstream loss derivative.`), worked('Differentiate one adapter output', 'The supplied upstream value is the loss derivative with respect to the one-dimensional output. Scale is one.', `x = np.array([[1.,2.]])
A = np.array([[.1],[.2]])
B = np.zeros((1,1))
upstream = np.array([[3.]])
dB = (x@A).T@upstream
dA = x.T@(upstream@B.T)
print(dB.tolist())
print(dA.tolist())`, '[[1.5]]\n[[0.0], [0.0]]', 'B can change on the first update while A waits for a nonzero B. This is compatible with an initially zero adapter contribution.')),
  p('Merging Must Preserve the Scale and the Base Version', `For a purely linear adapter, its scaled matrix product can be added to the compatible base weight for inference. Save the adapter scaling and the exact base-model identity. Applying it to a different base version does not generally reproduce the trained model.

Quantisation, dropout during training and implementation-specific layouts require additional care. Verify merged and unmerged evaluation outputs on preserved fixtures. The algebraic equivalence assumes the same linear operation and compatible numerical representation.`),
  p('Fewer Trainable Parameters Does Not Eliminate Every Cost', `LoRA reduces the parameters receiving updates and their optimiser state. Activations, base weights and attention computation still consume memory and time. Increasing rank also increases adapter capacity and cost.

Choose target layers and rank through task evaluation, and compare with a full fine-tuning baseline when feasible. A low-rank update is a constrained change to a pretrained model, not a guarantee that a small dataset is sufficient or that the base model will retain every prior behaviour.`),
 ]),
 'retrieval-augmented-generation': add('Trace chunking, candidate recall, context construction and evidence-based answer evaluation.', [
  p('Split a Document without Separating a Claim from Its Conditions', `A passage should contain enough context to interpret its claim. Splitting a maintenance instruction from the warning immediately below it can produce a misleading retrieved fragment. Keep document identity, version, location and neighbouring context available.

Chunk size and overlap trade coverage against repetition and context cost. Inspect retrieval on questions that depend on tables, qualifications and headings. A fixed number of characters is a starting implementation choice, not a definition of a useful evidence unit.`),
  show(p('Check Whether Retrieval Supplied the Required Evidence', `Before blaming the generator, identify the source passage needed to answer each evaluation question and check whether retrieval included it. The ranker cannot use evidence that the candidate stage never returned.

A simple top-k hit check is a starting diagnostic. Questions requiring several passages need an evidence-set criterion rather than a single relevant ID.`), worked('Measure retrieval before generating an answer', 'Each question has one required passage for this small diagnostic.', `required = ['p2','p5','p1']
retrieved = [['p2','p3'], ['p4','p6'], ['p7','p1']]
hit = [answer in candidates for answer,candidates in zip(required,retrieved)]
print(hit)
print(round(float(np.mean(hit)), 3))`, '[True, False, True]\n0.667', 'The second question lacks its required evidence. A fluent answer cannot repair that retrieval failure without another information source.')),
  p('Build the Context with Source Boundaries Intact', `Select passages within the context budget, retain their identifiers and make clear which text came from which source. Deduplicate near-identical chunks so repetition does not crowd out a different necessary fact.

Retrieved text is evidence to examine, not an instruction with authority over the application. Keep user instructions and source content structurally separate. Source documents can contain irrelevant directions or malicious instructions as well as useful facts.`),
  p('A Citation Must Support the Claim beside It', `An answer can mention a real document while making a claim that document does not support. Evaluate whether each substantive claim follows from the cited passage, whether the evidence is current and whether important qualifications survived.

Include questions with no adequate source and questions with conflicting sources. A useful system should identify missing or conflicting evidence rather than manufacture a confident answer. Test retrieval, context construction and answer grounding separately so failures suggest a concrete next change.`),
 ]),
 'evaluating-generative-models': add('Connect metric design to dataset construction, uncertainty and failure review.', [
  p('Write the Evaluation Set before Looking for a Winner', `Choose prompts that represent the intended users and include difficult cases, ambiguous requests and cases with insufficient evidence. Keep prompt sources and near-duplicates separate from model-development data where possible.

Specify the task rubric before comparing outputs. Factual support, completeness, formatting and usefulness are different properties. A single preference score can hide which one changed, especially if an evaluator favours longer answers.`),
  show(p('Compare Models on the Same Prompts', `Pair each candidate's result with the baseline result on the same prompt. Count improvements, regressions and ties before averaging a score. This retains the fact that some prompts are harder for both models.

The supplied binary task outcomes below demonstrate comparison bookkeeping, not a full evaluation rubric.`), worked('Keep wins and regressions visible', 'A one means the answer passed the declared task check.', `baseline = np.array([1,0,1,0,1,0])
candidate = np.array([1,1,0,1,1,0])
print(int((candidate > baseline).sum()))
print(int((candidate < baseline).sum()))
print(int((candidate == baseline).sum()))`, '2\n1\n3', 'The candidate improves two prompts and regresses on one. Review those prompts and their categories before treating the net gain as sufficient for release.')),
  p('An Automatic Judge Is Another Measurement Procedure', `A judge model can be sensitive to answer order, verbosity and wording. Human ratings can also vary. Use a clear rubric, blind model identity where practical, check agreement and inspect disagreement cases.

Keep enough labelled examples to compare automatic judging with the task's actual requirements. A judge's confident score is not a substitute for source verification on factual tasks or execution on programming tasks.`),
  p('Image Quality and Distribution Coverage Need Separate Evidence', `Sharp individual images can coexist with missing modes or repeated training examples. Compare representative sample collections, diversity and distribution-sensitive metrics under a stated feature representation and sample size.

No single score establishes that a generator covers every meaningful group or respects every constraint. Preserve failure examples and subgroup results, and repeat stochastic evaluations with declared settings rather than selecting only favourable samples.`),
 ]),
 'u-net': add('Extend labelled segmentation into loss masking and per-image evaluation.', [
  p('Unlabelled Pixels Are Not Automatically Background', `A segmentation target assigns a class to each labelled pixel. Some datasets leave uncertain or uninspected pixels unlabelled. Treating those as background teaches the model a claim the annotator did not make.

Keep a validity mask for supervised loss and metrics when the annotation scheme requires one. Apply spatial augmentations to the image, target and validity mask together. Document class IDs, ignored values and the difference between a missing mask and an all-background mask.`),
  show(p('Measure Foreground Agreement beside Pixel Accuracy', `A tray can contain much more background than seed. Predicting background everywhere may achieve high pixel accuracy while missing every object. Foreground IoU and Dice focus the comparison on overlap, with an explicit convention for empty masks.

Report metrics per image or acquisition group as well as any pooled score. Large easy images can otherwise dominate the aggregate.`), worked('Compare overlap on one labelled mask', 'The prediction contains two of three seed pixels and one extra background pixel.', `target = np.array([[0,1,1],[0,1,0]], dtype=bool)
prediction = np.array([[0,1,0],[0,1,1]], dtype=bool)
overlap = (target & prediction).sum()
union = (target | prediction).sum()
print(float(overlap/union))
print(float(2*overlap/(target.sum()+prediction.sum())))`, '0.5\n0.6666666666666666', 'IoU and Dice use different denominators. Neither tells us whether the connected foreground corresponds to the correct number of separate seeds.')),
  p('A New Camera Can Change More Than Resolution', `Lighting, colour response, focus and framing can all change the input distribution. A random pixel split from the same photographs cannot assess transfer to a new acquisition setup.

Hold out appropriate plants, trays or sessions, and inspect boundaries and small objects separately. Compare performance after resizing carefully: resampling can erase thin structures even when the final mask has the expected dimensions.`),
 ]),
};
