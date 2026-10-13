import { p, worked, withProgram as show, supplement as add } from './shared.mjs';
export default {
 'popularity-baselines': add('Distinguish event counts from user support, eligibility and exposure bias.', [
  p('Ten Opens May Come from One Reader', `A guide opened ten times by one reader has ten events but only one distinct reader. A popularity rule must decide which support it counts. Reloads, automated requests and repeated visits can dominate a raw event count.

Keep event identity, reader identity when available, and timestamps long enough to apply the chosen counting rule. On an anonymous site, do not claim to know distinct people from events alone. The measurement limits what the baseline can mean.`),
  show(p('Remove Ineligible Guides before Taking the First Few', `A reader may have already completed a guide, or a guide may be unavailable in the selected language. Rank among the candidates that can actually be shown. Taking the top entries first and removing ineligible ones afterward can leave an unnecessarily short list.

Use a deterministic tie convention so a replay produces the same recommendation. Stable ordering is a reproducibility choice; it does not establish that one tied guide is better.`), worked('Rank the available unread guides', 'The counts are fixed historical inputs, not updated from the evaluation interaction.', `count = np.array([20,12,12,5])
eligible = np.array([False,True,True,True])
candidates = np.flatnonzero(eligible)
ranked = candidates[np.argsort(-count[candidates], kind='stable')]
print(ranked[:2].tolist())`, '[1, 2]', 'The most popular guide is excluded before ranking because it is not eligible for this request.')),
  p('What Was Shown Affects What Was Opened', `A prominent guide has more opportunities to receive interactions. Popularity can therefore reinforce earlier display choices. A low count may mean low interest, little exposure or a newly published guide.

Evaluate a temporal baseline on later eligible requests and inspect new guides separately. Keep exposure records when available. Interaction counts are useful for a starting rule, but they are not direct measurements of each guide's intrinsic quality.`),
 ]),
 'content-based-ranking': add('Construct a reader profile, handle cold start and test feature omissions.', [
  show(p('Build a Profile from the Guides a Reader Chose', `A reader profile can average feature vectors from previously chosen guides. It then describes the topics represented in that history. Give recent or explicit positive choices different weights only when that weighting is part of the declared model.

Normalise before cosine comparison and handle zero-length vectors explicitly. A reader with no usable history needs a fallback or stated preferences, not a division by zero.`), worked('Compare two candidate topics with a history profile', 'Coordinates represent irrigation and image processing. The two previous guides both concern irrigation.', `history = np.array([[1.,0.],[.8,.2]])
profile = history.mean(axis=0)
candidates = np.array([[1.,0.],[0.,1.]])
score = candidates@profile/(np.linalg.norm(candidates, axis=1)*np.linalg.norm(profile))
print(np.round(score, 4).tolist())`, '[0.9939, 0.1104]', 'The representation favours another irrigation guide. It does not know whether the reader wants to repeat the topic or learn something new.')),
  p('Matching Topics Does Not Establish the Right Difficulty', `Two guides may have similar topic vectors while one assumes mathematics the reader has not encountered. Add explicit constraints or features for prerequisites, format and difficulty when those affect usefulness.

Inspect failures caused by missing metadata separately from failures of the similarity rule. A more elaborate similarity cannot recover a distinction absent from every coordinate. Preserve a path for new guides whose features exist before any interaction history does.`),
 ]),
 'collaborative-filtering': add('Explain overlap support, missing ratings and cold-start fallback.', [
  p('Agreement on One Guide Is Weak Evidence', `Two readers can match perfectly on their only shared rating. That correlation is not supported by the same evidence as agreement across many shared guides. Keep overlap counts beside similarities and define a minimum support or shrinkage rule if the task needs one.

Calculate each similarity on the intended shared observations. Treating missing ratings as zero makes absence look like a strong dislike and changes both the centring and the distance.`),
  show(p('Restore the Target Reader’s Rating Scale', `A generous reader and a strict reader can share preferences while using different numerical levels. Neighbour deviations describe whether a guide scored above or below that neighbour's usual level. Add the weighted deviation to the target reader's reference level.

Only neighbours who rated the candidate can contribute to that candidate's estimate. Keep the denominator's convention explicit, especially if negative similarities are allowed.`), worked('Transfer preferences rather than raw ratings', 'The target reader has a mean of three. Both similarities are positive in this example.', `target_mean = 3.
similarity = np.array([.8,.2])
neighbour_mean = np.array([4.,2.])
rating = np.array([5.,1.])
prediction = target_mean + similarity@(rating-neighbour_mean)/np.abs(similarity).sum()
print(round(float(prediction), 3))`, '3.6', 'The neighbours contribute opposite deviations. Their different rating scales do not enter as raw candidate scores.')),
  p('What If Nobody Comparable Rated the Guide?', `A new guide or reader can have no useful collaborative overlap. Define a fallback such as a content-based ranking or an appropriate popularity rule. A missing prediction should not silently become a zero rating.

Evaluate cold-start requests separately from requests with long histories. Split interactions in time so that the neighbourhood for a historical request contains only ratings already available then. A future rating can otherwise leak the answer into the similarity itself.`),
 ]),
 'recommendation-factorisation': add('Explain complete fitting, implicit feedback, regularisation and cold start.', [
  p('One Update Is Not Yet a Fitted Recommender', `The factor tables begin with small nonidentical values. Repeatedly visit observed reader-guide pairs, calculate the current prediction, and update the two participating vectors. Save the old vectors while computing both gradients so one update does not unexpectedly use the other's new value.

Repeat over shuffled observed pairs for several passes, tracking held-out performance as well as observed-entry reconstruction. The unobserved cells are not zero targets. They simply do not supply explicit rating errors in this objective.`),
  show(p('Check Whether the Factors Can Fit a Tiny Rating Table', `Before using a sparse real collection, test the training mechanism on a tiny known matrix. Here every entry is observed and the table is exactly rank one. That gives us a deliberately easy diagnostic for the update loop.

We use full-batch gradients from the same old factors. Regularisation is omitted for this mechanism check; it belongs in the later generalisation experiment.`), worked('Fit a rank-one table', 'Rows are two readers and columns are two guides. All four ratings are known.', `rating = np.array([[1.,2.],[2.,4.]])
U = np.array([[.4],[.7]])
V = np.array([[.5],[.8]])
initial = np.mean((U@V.T-rating)**2)
for _ in range(1000):
    error = U@V.T-rating
    dU = 2*error@V/rating.size
    dV = 2*error.T@U/rating.size
    U -= .05*dU
    V -= .05*dV
print(bool(np.mean((U@V.T-rating)**2) < initial))
print(np.round(U@V.T, 2).tolist())`, 'True\n[[1.0, 2.0], [2.0, 4.0]]', 'The reconstructed table is identified more directly than the factors: multiplying one factor by a nonzero scale and dividing the other by it can preserve predictions.')),
  p('An Unopened Guide Is Not a Negative Rating', `Implicit interactions such as opens tell us which guides were encountered and selected, but usually not why other guides were ignored. An unobserved pair may be unseen, irrelevant, unavailable or simply not yet chosen.

Implicit-feedback methods therefore need a declared confidence or negative-sampling scheme. Sampling a few unobserved candidates creates a training task whose distribution affects the learned scores. Those scores should not automatically be interpreted as probabilities of liking a guide.`),
  p('Small Reconstruction Error Can Still Produce a Poor List', `A factor model may fit popular observed ratings while recommending guides already seen or failing new readers entirely. Apply eligibility rules and evaluate ranking on later interactions with a documented candidate set.

Regularisation, factor dimension and training duration should be selected on validation requests. New guides have no learned factor from interactions alone, so a content model or fallback remains necessary. Report that boundary instead of implying the factor table can describe an entity it has never fitted.`),
 ]),
 'ranking-evaluation': add('Distinguish candidate retrieval, ranking and exposure-dependent relevance.', [
  p('A Ranking Cannot Recover a Guide Missing from Its Candidates', `A two-stage recommender first retrieves a manageable candidate set, then ranks it. If the useful guide never reaches that set, the ranker cannot place it first. Evaluate candidate recall separately from the quality of the final ordering.

Use the same candidate policy when comparing rankers. A model scored against a handful of easy random negatives is solving a different problem from one ranking the full eligible catalogue.`),
  show(p('Separate Finding the Guide from Ordering It', `The first count asks how many relevant guides retrieval included. The second asks how many appear in the visible list after ranking. Keep the full relevance set fixed while calculating both.

An unobserved interaction is not necessarily a confirmed irrelevant item. The example supplies relevance explicitly so the metric calculation has an unambiguous target.`), worked('Inspect both stages of a recommendation', 'Guides two and five are relevant. Retrieval misses guide five entirely.', `relevant = {2,5}
candidates = [0,1,2,3]
visible = [1,2]
candidate_recall = len(relevant.intersection(candidates))/len(relevant)
precision = len(relevant.intersection(visible))/len(visible)
print(candidate_recall, precision)`, '0.5 0.5', 'Improving the order might move guide two first. Recovering guide five requires changing retrieval, not merely the ranker.')),
  p('Average across Requests with a Defined Policy for Empty Targets', `Some evaluation requests have no labelled relevant guide. Recall then has a zero denominator. Decide whether those requests are excluded from that metric or assigned a documented convention, and report how many there are.

Inspect new readers, new guides and low-exposure topics separately. An average dominated by frequent readers can conceal poor results for everyone else. Offline relevance reflects the collection and exposure process; an online change still needs a careful comparison of user outcomes.`),
 ]),
 'robust-anomaly-scores': add('Handle zero spread, frozen references and multivariate dependence.', [
  p('A Zero MAD Is a Missing Scale, Not an Infinite Certainty', `Several repeated pressure readings can give a median absolute deviation of zero. Dividing by it is undefined. Adding a tiny constant merely chooses an extremely sensitive scale, often without a physical justification.

Declare a fallback based on measurement resolution or another fitted scale, or report that this score cannot be formed. Keep the median and scale fitted on the reference period when scoring new batches. Re-estimating them on each incoming batch can hide a whole shifted batch.`),
  show(p('Ordinary Coordinates Can Form an Unusual Pair', `Pressure and flow may usually rise together. A new observation can be ordinary on both individual ranges while contradicting their relationship. Separate univariate scores will miss that kind of anomaly.

A residual from an explicitly fitted relationship provides one way to inspect it. This example supplies a simple reference relationship so that we can distinguish marginal range checks from joint behaviour.`), worked('Compare ranges with a relationship residual', 'The reference points follow equal pressure and flow in these illustrative units.', `reference = np.array([[1.,1.],[2.,2.],[3.,3.]])
new = np.array([1.,3.])
inside = (new >= reference.min(axis=0)) & (new <= reference.max(axis=0))
print(inside.tolist())
print(float(new[1]-new[0]))`, '[True, True]\n2.0', 'Both coordinates lie inside their historical ranges, but their difference is unlike the reference pairs. The residual still needs its own scale and threshold.')),
  p('Choose a Threshold for an Investigation Process', `An unusually large score is a reason to investigate, not a fault label. Choose the inspection threshold or review budget using a suitable validation period and whatever outcome labels are available.

Record unresolved cases separately from confirmed healthy cases. If only high-scoring records are inspected, the labelled subset cannot establish how many low-scoring faults were missed. A sampling plan for some lower-scoring records can help assess that blind spot.`),
 ]),
 'local-density-anomalies': add('Clarify the complete LOF neighbourhood calculation and reference-only scoring.', [
  p('The Neighbour’s Radius Sets the Reachability Floor', `For each reference point, find its distance to its kth neighbour. When comparing a query with a neighbour, the reachability distance is at least that neighbour's kth-distance. This prevents a tiny pairwise distance inside a dense group from dominating the density estimate.

Average the reachability distances, take their reciprocal to form local reachability density, then compare the query density with its neighbours' densities. Each stage has a separate role; an ordinary mean distance ratio is not automatically LOF.`),
  show(p('Inspect the Reachability Distances before Their Reciprocal', `The supplied neighbour radii and query distances below let us see the floor directly. A close query-neighbour pair can still receive a larger reachability distance because of the neighbour's surrounding spacing.

Neighbour selection, distance units and tie handling must be consistent throughout the calculation. The example supplies those neighbours rather than pretending to fit a complete local-density model.`), worked('Apply the neighbour-specific floor', 'There are two chosen neighbours. Their kth-distances are 0.5 and 0.7.', `distance = np.array([.1, 1.2])
neighbour_radius = np.array([.5, .7])
reachability = np.maximum(distance, neighbour_radius)
density = 1/reachability.mean()
print(reachability.tolist())
print(round(float(density), 4))`, '[0.5, 1.2]\n1.1765', 'The first pair is floored while the second retains its actual distance. A final LOF ratio still requires the neighbours\' own local densities.')),
  p('Do Not Let a New Batch Quietly Become Its Own Reference', `Novelty detection scores new observations against a fitted reference collection. Including all new observations in the neighbourhood fit can make a cluster of unusual incoming points support each other and appear ordinary.

Distinguish that task from detecting outliers inside one supplied dataset. Both can be legitimate, but their fitted neighbourhoods and score interpretations differ. Test duplicates, isolated points and varying density before trusting a numerical threshold.`),
 ]),
 'isolation-forests': add('Trace actual random partitions and explain path corrections and reproducibility.', [
  p('A Tree Needs a Stopping Rule', `A random isolation tree chooses a feature with variation, samples a split between its observed minimum and maximum, and sends observations left or right. Repeat until a node contains one observation, cannot be split or reaches a depth limit.

A query follows those saved decisions. It does not choose fresh splits while being scored. Keep the fitted tree, feature conventions and random seed so the path lengths can be reproduced.`),
  show(p('Follow One Saved Tree', `A distant reading can be separated near the root while central readings need more decisions. One tree can also make an unhelpful split by chance, which is why a forest averages across many random partitions.

The hand-specified tree below exposes the path-counting convention. It is an illustration of scoring a tree, not a trained isolation forest.`), worked('Count edges from the root to a leaf', 'The root splits at five. Its left child splits at 1.5.', `reading = np.array([1.,2.,10.])
depth = np.where(reading >= 5, 1, 2)
print(depth.tolist())`, '[2, 2, 1]', 'The distant observation needs fewer decisions in this tree. A different random tree can give different individual depths.')),
  p('A Leaf with Several Records Has Unfinished Isolation Work', `When training stops at a leaf containing several observations, the raw depth understates the remaining work of isolating one of them. Isolation-forest scoring commonly adds an expected path-length correction based on that leaf size before averaging and normalising.

Identical records may never be separated by feature-value splits. Check the implementation's treatment of such leaves, subsample size and score direction. A larger anomaly score in one API can correspond to a smaller normality score in another.`),
  p('The Alert Fraction Is an Operational Choice', `A contamination setting or chosen score quantile determines how many observations are flagged under a reference distribution. It does not measure the true fraction of faulty sensors without labels.

Inspect stability across seeds and reference samples. Keep the reference fit fixed when monitoring a new batch, and investigate which feature splits led an alert down a short path. The score is evidence of easy isolation, not an explanation of a physical fault.`),
 ]),
 'reconstruction-alerts': add('Keep feature-level evidence and investigate both missed and false alerts.', [
  show(p('Keep the Residual Vector before Reducing It', `A single reconstruction score hides which measurements the model failed to reproduce. Retain the residual for pressure, flow and every other feature before averaging. Scale features deliberately so a large-unit column does not own the result by accident.

The reconstruction may look plausible while one critical feature is badly wrong. An operational alert may therefore need a per-feature rule as well as a total score.`), worked('Two equal totals with different failure locations', 'Columns represent standardised pressure and flow residuals.', `residual = np.array([[2.,0.],[0.,2.]])
print((residual**2).mean(axis=1).tolist())
print(np.argmax(np.abs(residual), axis=1).tolist())`, '[2.0, 2.0]\n[0, 1]', 'The total scores are equal, but the first example disagrees on pressure and the second on flow. That distinction matters to an inspection.')),
  p('A Flexible Reconstructor Can Reproduce an Anomaly', `A model with enough capacity may learn to reconstruct patterns beyond the intended normal regime. Low reconstruction error then does not guarantee normality. Conversely, a harmless new operating mode can reconstruct poorly and trigger false alerts.

Compare with a simple reference model, reserve a validation period for the threshold and inspect labelled faults when available. Do not tune architecture and threshold on the same small collection of known anomalies and call the resulting score an independent test.`),
  p('Training Contamination Changes What Counts as Ordinary', `If faulty operation is common in the reference set, a reconstructor may learn it as part of the normal pattern. Inspect reference collection rules and retain a record of exclusions.

When new labels arrive, revisit both the threshold and the fitted representation through a versioned evaluation. Automatically retraining on every alert can teach the model to accept the very faults the system was intended to detect.`),
 ]),
};
