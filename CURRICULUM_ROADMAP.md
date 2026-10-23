# Perceptron Lab curriculum expansion

This is the editorial plan, not a list of published lessons. The public course
counts only working lesson routes. A section is ready to appear when its lessons
have explanations, examples, questions, working constructions, and verified
Python challenges. Planned titles do not become empty cards on the landing page.

The existing course has substantial depth in language representations and much
less coverage of data collection, evaluation, uncertainty, and operational use.
The expansion should close those gaps while keeping one connected learning path.
Roughly 25 sections and 300 to 380 focused lessons is a planning range, not a quota.
Do not split a coherent explanation merely to increase the count.

## Published in the first foundation pass

The first foundation pass brought the course to 12 sections and 126 lessons. It added 18 lessons, 54 quiz
questions, 36 NumPy challenges, and 18 construction workshops. It does not complete
the full expansion below.

| Section | Added lessons |
| --- | --- |
| Python and NumPy | Giving Measurements a Place; Which Direction Are We Adding?; One Reference for Many Rows; Ask Each Row a Question; Can We Repeat the Same Experiment? |
| Data Preparation | What Does One Row Represent?; When a Measurement Is Missing; Categories Without an Invented Ranking; When the End Is Beside the Beginning; What Could We Know at Prediction Time?; When the Important Class Is Rare |
| Choosing and Checking a Model | What Must a Model Improve On?; Would More Examples Help?; When Should a Probability Become an Action?; Does Eighty Percent Mean Eighty Percent?; Have We Really Held Out a New Example?; What Changed After the Model Was Fitted?; How Much Does Our Estimate Depend on This Sample? |

The shared greenhouse setting carries measurement identity, array operations,
preparation, and evaluation into one another. Histories distinguish documented
contributions from invented teaching examples. All new direct calculations use
NumPy. The SDK remains appropriate when applying an already explained model is
the challenge.

## Python and NumPy depth pass

That pass brought the course to 12 sections and 135 lessons. Python and NumPy has 14 lessons,
68 executable worked examples, 60 questions with their inputs on the question
card, and 28 coding challenges. Nine additional workshops continue the same
greenhouse problems. This is a practical foundation for the course's numerical
code, not a claim to cover every NumPy API.

The added lessons cover array creation; slicing, gathering and shared storage;
reshape, transpose and joining; reductions, statistics and sorting; vectorised
operations and memory; matrix calculations, solving and least squares; data
types, missing values and tolerances; reusable functions and validation; and
binary and text array storage. The sampling lesson now also covers choice,
shared permutations and simulated distributions. Each lesson links to later
course applications. Existing lesson and practice URLs remain available.

## Probability, classical methods, and vision gap pass

That pass brought the course to 12 sections and 149 lessons. It added 14 complete
lessons, 56 questions with their inputs on the question card, 28 NumPy
challenges, and 14 Botie construction workshops. Each lesson includes a sourced
historical introduction, a visual walkthrough, five explanation parts, and an
editable numerical example. Vision examples display pixel values in their
spatial arrangement and let readers edit those values directly.

| Section | Added lessons |
| --- | --- |
| Introductory Mathematics | What Does an Alarm Tell Us?; Which Rule Could Have Produced These Observations? |
| Classical Machine Learning | Naive Bayes; Support Vector Machines and Margins; Hierarchical Clustering; Density-Based Clustering; Images as Arrays; Image Thresholding; Cleaning Masks With Morphology; Connected Components |
| Computer Vision with Neural Networks | Image Augmentation; Transfer Learning; Bounding Boxes and Overlap; Non-Maximum Suppression |

The probability lessons precede probabilistic classification. The new
classification and clustering methods join their existing topics, and image
representation and mask operations precede filters and feature detection.
The neural vision additions follow the existing network foundations. All
existing lesson URLs remain available.

The small constructions expose particular steps, with their limits stated:
single-linkage distance is not a complete hierarchy, a core mask is not a full
DBSCAN clustering, and box suppression is not a trained detector. The larger
roadmap below still has substantial work remaining.

## Published section paths

The course now has 22 sections and 196 lessons. This pass adds 47 complete
lessons across nine new subject sections and Complete Projects, with 188
self-contained questions, 94 runnable programming challenges, and 47 Botie
construction workshops. The existing reinforcement-learning introduction moves
into its dedicated section without changing its lesson or workshop URL.

| New section | Published coverage |
| --- | --- |
| Probabilistic Models and Uncertainty | Outcome distributions and expectation; Beta updates for failure rates; precision-weighted sensor fusion; hidden-state filtering; Gaussian-process prediction. |
| Optimisation and Training | Minibatch gradients; momentum; Adam; initialisation and gradient checks; validation checkpoints, schedules, and stopping. |
| Time Series and Forecasting | Persistence and mean baselines; lagged inputs; seasonality and differencing; exponential smoothing; autoregression; rolling-origin evaluation. |
| Reinforcement Learning | Existing introduction; bandit exploration; states and transitions; discounted returns; Bellman value iteration; tabular Q-learning. |
| Recommendations and Ranking | Popularity and exposure; content similarity; centred neighbour ratings; matrix factorisation; precision, recall, NDCG, and cold-start evaluation. |
| Anomaly Detection | Median/MAD scores; local density and LOF; isolation-tree paths and forest scores; reconstruction-based alerts. |
| Graphs and Relational Learning | Adjacency and feature representations; random walks; neighbour aggregation; graph convolution; link prediction and split leakage. |
| Causal Inference and Experiments | Confounding and composition; random assignment; standardisation and adjustment assumptions; inverse-probability weighting and overlap. |
| Deploying and Maintaining Models | Complete pipeline persistence; input contracts; consistent batch inference; versioned artifacts; monitoring, delayed labels, and rollback. |
| Complete Projects | A sensor investigation with validation-selected alert costs; rolling demand forecasting against a baseline; seed-region counting with held-out error analysis. |

Each lesson includes a historical introduction with primary references, a
three-stage visual walkthrough, four or more explanation parts, an editable
calculation, questions, and two programming tasks. All new teaching calculations
use NumPy or standard-library data handling rather than hiding the mechanism in
an SDK call. Forecast replay reveals observations one day at a time, and an
interactive Q-learning environment retains a learned table between episodes.
These are explicitly labelled synthetic examples with their assumptions stated.

This establishes working introductions, not exhaustive coverage of every field.
Further depth still includes ARIMA and forecast intervals; SARSA, policy gradients
and actor-critic methods; posterior sampling; end-to-end random isolation-forest
fitting; large-scale retrieval; advanced graph architectures; and causal
sensitivity analysis. Limited-label learning, efficiency, and responsible use
remain proposed sections. The original broad roadmap below is retained as a
planning reference, with overlap checked against the published coverage above
before creating another lesson.

Verification for this pass: all 176 generated-lesson challenge solutions and
128 displayed programs pass in the pinned Pyodide runtime; all 59 executable
question setups run independently. The 25 relevant integration and browser
checks pass, including new section routes, chronological prerequisites,
construction cases, real Python pass/fail feedback, and mobile interaction.
Type checking, changed-file lint, and the production build pass. Estimated
production deployment inputs are 166.52 MiB (about 175 MB), below the 220 MB
target. Amplify's packaged deployment remains the final size measurement.

## Intended section structure

Existing URLs remain valid when a lesson moves between sections. Existing long
primers and lessons remain available as references; a focused lesson earns a
separate page through a distinct problem and construction, not duplicated prose.

| Section | Problems and lessons still to add or deepen |
| --- | --- |
| 1. Introductory Mathematics | Counting possible outcomes; random variables; expectation and variance; common distributions; covariance and correlation; logarithms; gradients and the chain rule; eigenvectors and singular values; numerical precision. Conditional probability, base rates, and likelihood now have focused lessons. Audit the three long primers before extracting more. |
| 2. Python and NumPy | The 14-lesson foundation now covers array creation, indexing, layouts, masks, reductions, matrix calculations, vectorisation, types, tolerances, random sampling, functions, and array storage. Add focused extensions when later courses require sparse arrays, larger-than-memory data, or specialised signal/image operations; avoid duplicating the existing foundation. |
| 3. Start with a Prediction | Keep the current short entry route. Add a complete small prediction project that defines an observation, target, fitting rule, and held-out comparison before introducing more model families. |
| 4. Data Preparation | Collection and labelling; exploratory plots; robust summaries and outliers; skewed measurements and log transforms; interactions; feature selection inside validation; sparse arrays; target transformations; weighting and resampling. Six additions are published. |
| 5. Classical Machine Learning | Support vector regression; elastic net; generalised linear models; Gaussian mixtures and expectation-maximisation; spectral clustering; robust regression; nearest-neighbour search; histogram equalisation; Hough transforms; optical flow. Naive Bayes, SVM margins, hierarchical and density-based clustering, image arrays, thresholding, morphology, and connected components are now published. |
| 6. Choosing and Checking a Model | ROC and precision-recall curves; regression residuals; learning and validation curves with actual repeated fits; paired model comparisons; multiple comparisons; nested model selection; confidence and prediction intervals; conformal prediction; subgroup error analysis; permutation importance versus explanations of individual predictions. Seven additions are published. |
| 7. Probabilistic Machine Learning | Build on the published conditional-probability and likelihood lessons: priors and posterior distributions over parameters; maximum a posteriori fitting; conjugate examples; probabilistic graphical models; hidden Markov models; Gaussian processes; Monte Carlo integration; Markov chain Monte Carlo; variational inference. |
| 8. Optimisation and Training | Conditioning and scaling; stochastic gradients; batches and gradient accumulation; momentum; adaptive optimisers; learning-rate schedules; clipping; initialisation; regularisation; early stopping; numerical gradient checks; convergence diagnostics. Link the existing gradient descent and training lessons without duplicating their derivations. |
| 9. Neural Networks | Universal approximation and its limits; capacity and generalisation; loss choices; multilabel and multitask outputs; embeddings beyond language; gated recurrence; sequence-to-sequence models; architecture comparisons; training diagnostics; attribution and sensitivity. Preserve the existing 15 lessons as the core. |
| 10. Computer Vision with Neural Networks | Receptive fields; residual image networks; complete object-detector architectures and training; semantic versus instance segmentation; feature pyramids; vision transformers; contrastive image features; detection matching and average precision; image evaluation and dataset bias. Augmentation, transfer learning, bounding boxes and overlap, and non-maximum suppression are now published. Keep labelled-data assumptions explicit. |
| 11. Natural Language Processing | Sequence labelling; CRFs; text classification; information retrieval and BM25; ranking evaluation; sequence-to-sequence translation; multilingual evaluation; language-specific segmentation and morphology. Review the existing 37 lessons before adding more tokenisation or embedding variants. |
| 12. Large Language Models | Transformer blocks as a complete information path; pretraining objectives; next-token loss; context windows; attention masks; positional schemes; KV caching; decoding tradeoffs; instruction tuning; tool use; structured output validation; context and reasoning limitations; grounded evaluation. |
| 13. Generative Models | Autoregressive generation; latent-variable models; variational autoencoders and the ELBO; GAN objectives and training failure; diffusion forward and reverse processes; noise schedules; conditioning; guidance; flow-based models and flow matching; distribution and sample-quality evaluation. |
| 14. Adapting and Evaluating Modern Models | Full fine-tuning versus frozen features; adapters and LoRA variants; preference datasets; reward modelling; preference optimisation; retrieval chunking; retrieval evaluation; reranking; grounding and citation checks; controlled generative evaluations. Move the general reinforcement-learning introduction to its dedicated section while preserving its URL. |
| 15. Reinforcement Learning | States, actions, rewards, and policies; bandits; exploration; discounted returns; Markov decision processes; Bellman equations; policy evaluation; value iteration; Monte Carlo estimates; temporal-difference learning; SARSA; Q-learning; policy gradients; actor-critic methods; offline evaluation. |
| 16. Time Series and Forecasting | Time-aware baselines; lag features; rolling statistics without future data; seasonality; differencing; stationarity assumptions; exponential smoothing; autoregression; ARIMA; rolling-origin validation; multistep forecasting; prediction intervals; intermittent demand. |
| 17. Recommendations and Ranking | Popularity baselines; content-based retrieval; user-item matrices; collaborative filtering; matrix factorisation; implicit feedback; negative sampling; retrieval versus ranking; ranking metrics; cold starts; exposure and feedback loops. |
| 18. Anomaly Detection | Outliers versus novel events; density and distance scores; robust thresholds; isolation forests; local outlier factor; one-class methods; reconstruction error; rare-event evaluation and alert budgets. |
| 19. Graphs and Relational Learning | Nodes and edges; adjacency and degree; graph walks; link prediction; graph embeddings; neighbour aggregation; graph convolution; graph attention; permutation invariance; graph sampling; evaluation leakage through edges. |
| 20. Causal Inference and Experiments | Association versus intervention; confounding; causal diagrams; randomised experiments; treatment effects; adjustment; matching and propensity scores; heterogeneous effects; counterfactual questions; assumptions that data alone cannot verify. |
| 21. Learning With Limited Labels | Annotation quality; active learning; semi-supervised learning; pseudo-labels and confirmation bias; consistency regularisation; self-supervised objectives; contrastive learning; transfer and few-shot evaluation. |
| 22. Efficient Machine Learning | Parameter and activation memory; batching; mixed precision; quantisation; pruning; distillation; low-rank approximations; sparse computation; inference profiling; latency and throughput. Use measured toy benchmarks with clearly stated hardware and limits. |
| 23. Deploying and Maintaining Models | Persisting the whole fitted pipeline; input contracts; train-serving consistency; batch versus online inference; model and dataset versions; experiment records; monitoring; delayed outcomes; shadow evaluation; rollback; retraining policies. |
| 24. Responsible Use and Security | Dataset documentation; consent and provenance; model cards; subgroup performance; competing fairness definitions; privacy and membership inference; adversarial examples; prompt injection and tool boundaries; human review; communicating uncertainty. Keep claims tied to the actual setting. |
| 25. Complete Projects | A reproducible tabular prediction study; a time-aware forecast; an image classifier; an image segmentation study with labels; a recommendation pipeline; a grounded document assistant; a sequential decision problem. Each project must include a baseline, data audit, failure analysis, and a repeatable evaluation. |

## Delivery order

1. Finish the foundations: accessible Python entry points, focused probability
   and uncertainty, data preparation, and meaningful model comparisons.
2. Expand classical methods and add probabilistic learning and optimisation.
   These supply reusable pieces for later neural and sequential methods.
3. Build the dedicated reinforcement-learning, forecasting, recommendation,
   anomaly, and graph paths. Each begins with a problem and baseline.
4. Deepen vision, language models, and generation using those foundations.
   Continue to distinguish a hand-built illustration from a trained result.
5. Add causal reasoning, limited-label learning, efficiency, deployment,
   responsible use, and projects that make readers choose among earlier tools.

## What makes a lesson ready

- A specific problem and historical context supported by primary sources.
- Components introduced individually, then combined in a visible example.
- Calculations in their own blocks with the results interpreted afterwards.
- A technical route and prerequisite links without locked steps.
- Questions referring only to material already explained, with Botie feedback.
- A construction that continues the lesson's problem and starts empty.
- Multiple test cases, including a changed input or boundary case, with expected
  results checked independently of the reference construction.
- Two to four programming challenges with explicit outputs, hints from Botie,
  and reference solutions run in the pinned browser Python environment.
- Desktop and narrow-screen checks and a production build within the deployment
  budget. The current target remains below 220 MB for Amplify packaging.

## Maintaining the expansion

Author the first-pass lessons in `scripts/curriculum/`. Run
`npm run curriculum:generate` after edits. It creates separate lesson, history,
workshop, navigation, and ID artifacts under `lib/lessons/`.
`npm run curriculum:check` rejects stale generated artifacts during builds.

Use `node scripts/check-practice.mjs --expanded` to check the new reference
solutions in browser Python. The ordinary exercise collector and complete
practice check include these lessons too. Do not record unreviewed outputs merely
to make a failing solution pass. Existing static routes and their anchors remain
unchanged; new lesson pages use the registered dynamic concept route.

Run `npm run test:lesson-examples` to execute displayed worked programs and
independently check the code supplied on question cards. Quiz inputs belong in
the question's `given` block so the reader never has to remember an earlier array.
