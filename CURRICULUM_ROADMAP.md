# FitLab curriculum expansion

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

The course now has 12 sections and 135 lessons. Python and NumPy has 14 lessons,
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

## Intended section structure

Existing URLs remain valid when a lesson moves between sections. Existing long
primers and lessons remain available as references; a focused lesson earns a
separate page through a distinct problem and construction, not duplicated prose.

| Section | Problems and lessons still to add or deepen |
| --- | --- |
| 1. Introductory Mathematics | Counting possible outcomes; conditional probability and base rates; random variables; expectation and variance; common distributions; covariance and correlation; likelihood versus probability; logarithms; gradients and the chain rule; eigenvectors and singular values; numerical precision. Audit the three long primers before extracting focused lessons. |
| 2. Python and NumPy | The 14-lesson foundation now covers array creation, indexing, layouts, masks, reductions, matrix calculations, vectorisation, types, tolerances, random sampling, functions, and array storage. Add focused extensions when later courses require sparse arrays, larger-than-memory data, or specialised signal/image operations; avoid duplicating the existing foundation. |
| 3. Start with a Prediction | Keep the current short entry route. Add a complete small prediction project that defines an observation, target, fitting rule, and held-out comparison before introducing more model families. |
| 4. Data Preparation | Collection and labelling; exploratory plots; robust summaries and outliers; skewed measurements and log transforms; interactions; feature selection inside validation; sparse arrays; target transformations; weighting and resampling. Six additions are published. |
| 5. Classical Machine Learning | Naive Bayes; support vector machines and margins; support vector regression; elastic net; generalised linear models; hierarchical and density-based clustering; Gaussian mixtures and expectation-maximisation; spectral clustering; robust regression; nearest-neighbour search; histogram equalisation; morphology; connected components; Hough transforms; optical flow. |
| 6. Choosing and Checking a Model | ROC and precision-recall curves; regression residuals; learning and validation curves with actual repeated fits; paired model comparisons; multiple comparisons; nested model selection; confidence and prediction intervals; conformal prediction; subgroup error analysis; permutation importance versus explanations of individual predictions. Seven additions are published. |
| 7. Probabilistic Machine Learning | Bayes' rule as updating evidence; likelihood and maximum likelihood; priors and posterior distributions; maximum a posteriori fitting; conjugate examples; probabilistic graphical models; hidden Markov models; Gaussian processes; Monte Carlo integration; Markov chain Monte Carlo; variational inference. |
| 8. Optimisation and Training | Conditioning and scaling; stochastic gradients; batches and gradient accumulation; momentum; adaptive optimisers; learning-rate schedules; clipping; initialisation; regularisation; early stopping; numerical gradient checks; convergence diagnostics. Link the existing gradient descent and training lessons without duplicating their derivations. |
| 9. Neural Networks | Universal approximation and its limits; capacity and generalisation; loss choices; multilabel and multitask outputs; embeddings beyond language; gated recurrence; sequence-to-sequence models; architecture comparisons; training diagnostics; attribution and sensitivity. Preserve the existing 15 lessons as the core. |
| 10. Computer Vision with Neural Networks | Data augmentation; transfer learning; receptive fields; residual image networks; object detection; bounding boxes and overlap; non-maximum suppression; semantic versus instance segmentation; feature pyramids; vision transformers; contrastive image features; image evaluation and dataset bias. Keep labelled-data assumptions explicit. |
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
