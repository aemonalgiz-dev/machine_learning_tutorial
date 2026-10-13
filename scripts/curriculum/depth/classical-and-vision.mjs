import { p, worked, withProgram as show, supplement as add } from './shared.mjs';
export default {
 'naive-bayes': add('Complete the route from labelled records to stable class probabilities and investigate duplicated evidence.', [
  p('Keep Fitting and Prediction as Separate Procedures', `Fitting produces a class prior and a table of feature probabilities. Prediction receives a new sign vector and reads those saved tables. It must not count the new batch to redefine what a faulty sensor looks like.

For binary signs, every coordinate contributes either the probability of presence or the probability of absence. Add log probabilities to form one score per class. Subtract the largest score before exponentiating and normalising, just as we did for stable probability calculations in NumPy.`),
  show(p('Fit Two Classes, Then Inspect a New Sensor', `The training table below uses warm casing and unstable readings as its two columns. Labels zero and one mean working and faulty. We add one count for each binary outcome inside each class.

The example shows both learned tables and a new prediction. Inspect those tables before trusting the label: a feature order error can preserve every shape while changing the meaning of the evidence.`), worked('A complete Bernoulli prediction', 'The four sensors are an invented training set, too small to establish real diagnostic performance.', `X = np.array([[0,0], [1,0], [1,1], [1,1]])
y = np.array([0,0,1,1])
rate = np.array([(X[y == label].sum(axis=0) + 1) / ((y == label).sum() + 2) for label in [0,1]])
prior = np.array([(y == label).mean() for label in [0,1]])
new = np.array([1,1])
score = np.log(prior) + (new*np.log(rate) + (1-new)*np.log1p(-rate)).sum(axis=1)
probability = np.exp(score-score.max())
probability /= probability.sum()
print(rate.tolist())
print(np.round(probability, 4).tolist())`, '[[0.5, 0.25], [0.75, 0.75]]\n[0.1818, 0.8182]', 'Both signs favour the faulty class under the fitted approximation. These probabilities depend on the class priors, smoothing and conditional-independence assumption.')),
  p('Copying a Clue Can Make the Model Overconfident', `If the unstable-reading feature is copied into a second column, the model multiplies its evidence twice. It treats the copy as another conditionally independent observation even though no new measurement occurred.

Try that change and compare probabilities before labels. The predicted class may stay the same while confidence becomes more extreme. This is why a useful classifier can still need calibration, and why a high probability is not a substitute for inspecting the feature construction.`),
 ]),
 'support-vector-machines': add('Move beyond supplied hinge losses to an actual optimisation procedure and inspect its support.', [
  p('Which Observations Push the Boundary?', `A point outside its margin already satisfies the hinge requirement, so that loss contributes no gradient there. A point inside the margin, including a correctly classified one, pushes the boundary toward a larger signed score. The weight penalty simultaneously pulls the weights toward zero.

The bias is not penalised in the convention used here. We average hinge losses and multiply them by C. This differs by a dataset-size factor from a sum-loss convention, so a copied numerical C need not represent the same tradeoff.`),
  show(p('Repeat the Update Until the Boundary Can Be Checked', `Begin with zero weights, calculate every signed score, collect only margin violations and make a small subgradient step. Repeat that procedure, then examine classifications and margin values separately.

Hinge loss is not differentiable exactly at its corner. The code uses zero contribution when the margin is exactly one, an allowed subgradient choice. A fixed step size can oscillate near the optimum; this small demonstration is not a replacement for a production solver.`), worked('Train a one-feature separating rule', 'Negative and positive measurements belong to different inspected classes.', `x = np.array([-2., -1., 1., 2.])
y = np.array([-1., -1., 1., 1.])
w, b, C = 0., 0., 2.
for step in range(1000):
    active = y*(w*x+b) < 1
    dw = w - C*np.mean(np.where(active, y*x, 0.))
    db = -C*np.mean(np.where(active, y, 0.))
    rate = 0.1 / np.sqrt(step+1)
    w -= rate*dw
    b -= rate*db
print(np.sign(w*x+b).astype(int).tolist())
print(bool(w > 0), bool(abs(b) < 1e-10))`, '[-1, -1, 1, 1]\nTrue True', 'The symmetric data produce a boundary at zero. Correct labels alone do not establish that the margin objective is fully optimised.')),
  p('A Wide Margin Still Depends on the Ruler', `Changing a feature from metres to millimetres changes its coefficient scale and the geometry of the weight penalty. Standardise using training statistics when that matches the feature meaning, and use the same transform for validation and prediction.

Inspect sensitivity to C on held-out records rather than choosing the setting with the widest-looking training strip. Overlapping classes, measurement errors and nonlinear relationships can all make a perfect separating line an unsuitable target.`),
 ]),
 'hierarchical-clustering': add('Trace repeated linkage updates and interpret a cut rather than only the first merge.', [
  show(p('A Second Merge Must Compare Groups, Not Their Names', `After joining the first pair, recompute linkage using the members of the new group. A group identifier is only a bookkeeping label. Its numerical value has no role in the distance calculation.

For single linkage, the nearest pair across two groups determines their separation. This lets nearby points extend a chain even when its endpoints are far apart. Complete linkage would ask about those endpoints and can produce a different hierarchy.`), worked('Follow a small single-linkage hierarchy', 'The two pairs occupy response times near zero and near five.', `x = np.array([0., 1., 5., 6.])
groups = [[i] for i in range(len(x))]
while len(groups) > 1:
    candidates = []
    for i in range(len(groups)):
        for j in range(i+1, len(groups)):
            distance = min(abs(x[a]-x[b]) for a in groups[i] for b in groups[j])
            candidates.append((distance, i, j))
    distance, i, j = min(candidates)
    merged = groups[i] + groups[j]
    print(sorted(merged), float(distance))
    groups = [g for k,g in enumerate(groups) if k not in [i,j]] + [merged]`, '[0, 1] 1.0\n[2, 3] 1.0\n[0, 1, 2, 3] 4.0', 'At a cut below four but above one, the two close pairs remain separate. The final merge height describes the nearest cross-pair distance, not the total width of the combined group.')),
  p('A Cut Is a Decision About Useful Resolution', `The hierarchy does not automatically tell us how many physical sensor types exist. A cut chooses the resolution at which we want to describe similarity. Compare that choice with the purpose of grouping: shared calibration, inspection scheduling or exploratory description may favour different resolutions.

Check whether small measurement changes move important merges. Stable groups can be useful, but stability alone does not establish a causal or biological category. Retain the distance definition and linkage with the result so another reader can reproduce the tree.`),
 ]),
 'density-based-clustering': add('Complete core-component expansion, border assignment and sensitivity checks.', [
  p('Connect Core Points Before Attaching the Border', `The core mask is only the local density test. To obtain clusters, start from an unassigned core point and follow neighbouring core points until no more are reachable. All of those core points belong to one connected dense region.

Then attach nearby non-core points as border points. A border point does not let the search continue farther. Keeping these roles separate prevents a chain of sparse points from joining two otherwise separate dense regions.`),
  show(p('Follow the Frontier Until One Region Is Complete', `A frontier is a collection of positions still waiting to be explored. Removing one position, checking its neighbours and adding unseen core neighbours repeats until that collection is empty.

This example extracts the core regions explicitly. Border attachment is a separate decision after the core regions are known, so the intermediate output makes clear what has and has not been clustered.`), worked('Find connected dense regions', 'The radius includes its boundary and each point counts itself. Three neighbours are required for a core point.', `x = np.array([0., .1, .2, 2., 2.1, 2.2, 5.])
near = np.abs(x[:,None]-x[None,:]) <= .25
core = near.sum(axis=1) >= 3
labels = np.full(len(x), -1)
cluster = 0
for start in np.flatnonzero(core):
    if labels[start] >= 0:
        continue
    frontier = [int(start)]
    labels[start] = cluster
    while frontier:
        current = frontier.pop()
        for nxt in np.flatnonzero(near[current] & core & (labels < 0)):
            labels[nxt] = cluster
            frontier.append(int(nxt))
    cluster += 1
print(core.tolist())
print(labels.tolist())`, '[True, True, True, True, True, True, False]\n[0, 0, 0, 1, 1, 1, -1]', 'The distant point is not a core point and is not near either core region. It remains noise under this chosen density definition.')),
  p('A Border Point Can Be Near Two Regions', `A non-core point can lie within the radius of core points from two different regions. Assigning it to the first region reached is a common convention; its assignment can then depend on traversal order. The core regions themselves need not be ambiguous in that way.

Report that distinction when comparing implementations. Also vary the radius and minimum count deliberately. A cluster disappearing under a tiny change can reveal a fragile density assumption, while differing density levels may make one global radius unsuitable.`),
 ]),
 'images-as-arrays': add('Connect crops to global coordinates and distinguish channel and spatial operations.', [
  show(p('A Crop Has Its Own Origin', `Botie crops a seed before measuring its location. Inside that crop, row zero and column zero refer to the crop's upper-left pixel, not the original photograph. To place a result back into the full image, restore the crop offset.

Keep this coordinate conversion alongside any resizing or rotation. An accurate detector can produce an incorrect displayed box if its coordinate system is forgotten between preprocessing and presentation.`), worked('Return a local pixel to the tray photograph', 'The crop starts at original row four and column seven.', `crop_origin = np.array([4, 7])
local_pixel = np.array([2, 3])
global_pixel = crop_origin + local_pixel
print(global_pixel.tolist())
print(global_pixel[::-1].tolist())`, '[6, 10]\n[10, 6]', 'The first output is row then column for array indexing. The second is x then y for a geometric display.')),
  p('Averaging Channels and Averaging Neighbours Ask Different Questions', `Combining red, green and blue channels at one pixel changes how we describe that location. Combining neighbouring pixels changes spatial detail. Both use averages, but their axes and information loss are different.

A plain channel mean is a teaching simplification, not a universal perceptual grayscale conversion. Preserve the original image when trying representations, and state channel order, numerical range and any colour conversion used by a trained model.`),
 ]),
 'image-thresholding': add('Measure segmentation quality and diagnose uneven illumination.', [
  p('A Bright Background Can Defeat One Global Cutoff', `A shadow can make a seed darker than a well-lit patch of tray. No single intensity cutoff then separates both correctly. Moving the cutoff merely trades one kind of mistake for another.

Inspect the photograph and mask together. Local reference rules, controlled lighting or a learned segmenter can address different causes of failure. Do not keep adjusting a global threshold when the required distinction is absent from the intensity alone.`),
  show(p('Compare Pixel Decisions with a Labelled Mask', `A supervised assessment needs a mask that states which pixels belong to the seed. Count overlap and extra selected pixels against that reference. Intersection over union penalises both missed seed pixels and selected background.

An all-background prediction can have high pixel accuracy when seeds occupy little of the image. That is why the metric must reflect the foreground task. Specify how empty prediction and empty reference masks are handled.`), worked('Score a small seed mask', 'Each row below preserves its image position. The predicted mask misses one seed pixel and adds one background pixel.', `truth = np.array([[0,1,1],[0,1,0]], dtype=bool)
pred = np.array([[0,1,0],[0,1,1]], dtype=bool)
intersection = (truth & pred).sum()
union = (truth | pred).sum()
print(int(intersection), int(union))
print(float(intersection/union))`, '2 4\n0.5', 'The overlap score describes segmentation on this labelled image. It is not the same as the accuracy of the later seed count.')),
 ]),
 'morphology': add('Explain border assumptions and pixel-to-physical footprint scaling.', [
  p('The Image Boundary Is Part of the Rule', `A footprint placed near the image edge reaches positions we did not photograph. Treating those positions as background can erode a seed that touches the boundary. Reflecting or repeating edge values creates a different assumption about the unobserved area.

State the padding convention and test objects touching each edge. Cropping can turn an ordinary object into a boundary case, so a cleaning rule that worked in the full photograph may behave differently after a crop.`),
  show(p('Opening Can Remove an Object We Wanted to Keep', `Erosion asks whether the entire footprint fits inside foreground. Dilation then expands the surviving positions. If a thin seed leaves no survivors during erosion, the later dilation has nothing from which to rebuild it.

Use a footprint whose shape and physical scale match the nuisance being removed. A three-pixel footprint represents a different physical size after changing the camera resolution.`), worked('Check whether a square footprint fits a thin region', 'The foreground is a one-pixel horizontal line. The test uses a three-by-three square footprint.', `mask = np.array([[0,0,0,0,0],[0,1,1,1,0],[0,0,0,0,0]], dtype=bool)
padded = np.pad(mask, 1, constant_values=False)
eroded = np.zeros_like(mask)
for row in range(mask.shape[0]):
    for col in range(mask.shape[1]):
        eroded[row,col] = padded[row:row+3,col:col+3].all()
print(eroded.astype(int).tolist())`, '[[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]]', 'The line disappears because the footprint cannot fit anywhere. Removing small regions is an assumption about what matters, not an automatically beneficial cleanup.')),
 ]),
 'connected-components': add('Extend labels into object measurements and test equivalence without relying on IDs.', [
  show(p('Measure Where a Region Is, Not Only How Large', `Once one region has a label, its row and column positions supply a centroid and an enclosing rectangle. The centroid averages pixel coordinates; it is not necessarily a foreground pixel, especially for a curved or hollow region.

The rectangle needs exclusive lower and right boundaries to match array slicing. Adding one to the largest included pixel index performs that conversion. This is different from adding one to already continuous box coordinates.`), worked('Describe one labelled seed region', 'Label one identifies the seed; zero is background.', `labels = np.array([[0,1,1,0],[0,1,0,0],[0,0,0,0]])
rows, cols = np.nonzero(labels == 1)
print([round(float(rows.mean()), 3), round(float(cols.mean()), 3)])
print([int(rows.min()), int(cols.min()), int(rows.max()+1), int(cols.max()+1)])`, '[0.333, 1.333]\n[0, 1, 2, 3]', 'The rectangle is expressed as row-start, column-start, row-stop, column-stop. Keep that convention explicit when converting to x/y boxes.')),
  p('Two Correct Labellers May Use Different Numbers', `One traversal may call a seed region one while another calls it three. Compare membership rather than the raw label numbers: pixels grouped together by one result should be grouped together by the other, with background handled consistently.

Test diagonal contact, thin bridges, holes, an empty mask and an object touching the boundary. These reveal the connectivity and border conventions. A component count alone can conceal an incorrect partition whose number of groups happens to match.`),
 ]),
 'image-augmentation': add('Teach box transforms, semantic failure and an ablation experiment.', [
  show(p('A Flipped Rectangle Needs New Boundaries', `A horizontal flip reverses the x direction across the image width. The old right boundary becomes the new left boundary, measured from the opposite edge. Swapping array columns without updating rectangles leaves the labels on the wrong object.

Apply one sampled transformation to every spatial label associated with the photograph: masks, boxes and keypoints. Each representation needs its own coordinate conversion, even though the underlying geometric change is shared.`), worked('Reflect an exclusive-boundary box', 'The image width is ten. The box stores x-min, y-min, x-max, y-max.', `width = 10
box = np.array([1., 2., 4., 6.])
flipped = box.copy()
flipped[[0,2]] = width - box[[2,0]]
print(flipped.tolist())
print(float(box[2]-box[0]) == float(flipped[2]-flipped[0]))`, '[6.0, 2.0, 9.0, 6.0]\nTrue', 'The box moves to the opposite side while keeping its width. The same conversion applies again to recover the original coordinates.')),
  p('Plausible Pixels Can Carry the Wrong Label', `A crop can remove the diseased part of a leaf while retaining the image-level damaged label. A reflection can reverse readable text. Brightness changes can erase a colour cue that defines the class. Visual plausibility does not guarantee label preservation.

Inspect transformed examples with the target task in mind. Compare training with and without the proposed augmentation on the same held-out acquisition groups. Keep the evaluation preprocessing fixed so an apparent improvement is not merely a change in what was measured.`),
 ]),
 'transfer-learning': add('Complete head training, separate modes and gradients, and examine negative transfer.', [
  p('A Frozen Extractor Still Has an Execution Mode', `Preventing parameter updates and selecting evaluation behaviour are separate decisions. Dropout can still randomise features in training mode. Batch normalisation can update running statistics even when its trainable coefficients are frozen.

If we cache features, use a documented deterministic extractor configuration and preserve its preprocessing. Otherwise the head may be trained on representations that differ from those used at prediction time. Changing the extractor invalidates a cache made from its earlier state.`),
  show(p('Let the New Labels Train the Head', `For a binary head, subtract labels from sigmoid probabilities to obtain score derivatives under mean binary cross-entropy. Multiply those derivatives by the feature table to collect weight gradients. The bias receives their mean.

Repeat the update on the same supplied features to see the head learn. A real transfer experiment would replace these invented features with a pretrained extractor and evaluate on held-out leaves.`), worked('Train only the decision layer', 'One feature orders the examples from healthy to damaged; the feature values themselves never change.', `features = np.array([[-2.],[-1.],[1.],[2.]])
y = np.array([0.,0.,1.,1.])
w, b = np.zeros(1), 0.
for _ in range(200):
    probability = 1/(1+np.exp(-(features@w+b)))
    error = probability-y
    w -= .1*(features.T@error)/len(y)
    b -= .1*error.mean()
print(((features@w+b) >= 0).astype(int).tolist())
print(features[:,0].tolist())`, '[0, 0, 1, 1]\n[-2.0, -1.0, 1.0, 2.0]', 'The head can separate this deliberately simple representation. Its training success is not evidence that an arbitrary source extractor will represent leaf damage well.')),
  p('A Useful Source Model Can Still Be the Wrong Starting Point', `If the source training discarded exactly the variation our target needs, a frozen head may have little information to use. Compare frozen features, limited fine-tuning and a suitable simpler baseline under the same split.

Inspect which classes improve and which regress. A smaller learning rate for the extractor is a reasonable experiment, not a guarantee against damaging useful features. Save the best validated state and its preprocessing together, rather than selecting the last training step automatically.`),
 ]),
 'bounding-boxes': add('Trace detector evaluation matching and image-size transformations.', [
  p('A Detection Needs a Class, a Location and a Match', `To score a detector, sort predictions by confidence under the evaluation protocol and match eligible predictions to labelled objects. One labelled seed should not become several true positives because several boxes cover it.

Class agreement and sufficient overlap are both necessary. Keep unmatched predictions as false positives and unmatched labels as misses. Average precision summarises a ranking under a particular matching and overlap protocol; one good IoU calculation is only a component of that procedure.`),
  show(p('Resize Coordinates Along with the Photograph', `If width and height change by different factors, x coordinates and y coordinates need different multipliers. The box order must be known before applying them. A detector output in resized coordinates must be mapped back before displaying it on the original image.

Letterboxing introduces padding offsets as well as scaling. Keep both transformations, and undo them in reverse order. Clipping to image bounds is a separate policy and can turn a box into an empty one.`), worked('Resize a box with unequal scale factors', 'The image changes from width eight and height six to width four and height six.', `box = np.array([2., 1., 6., 5.])
scale = np.array([.5, 1., .5, 1.])
resized = box * scale
print(resized.tolist())
print((resized / scale).tolist())`, '[1.0, 1.0, 3.0, 5.0]\n[2.0, 1.0, 6.0, 5.0]', 'The y coordinates stay fixed because height did not change. Applying one scale to all four values would move the box vertically.')),
 ]),
 'non-maximum-suppression': add('Expose greedy chain behaviour and crowded-scene tradeoffs.', [
  show(p('A Removed Candidate Must Not Remove Another Candidate', `Three proposals can form an overlap chain: A overlaps B, B overlaps C, but A and C can both describe separate objects. After keeping A and removing B, compare C with the boxes actually kept.

Deleting every box that overlaps any higher-scored box implements a different operation. The waiting list is state: each greedy choice changes which candidates are allowed to influence the remaining decisions.`), worked('Trace suppression using a supplied overlap table', 'Scores descend in index order. Off-diagonal values are the supplied pairwise IoUs for this trace.', `overlap = np.array([[1., .6, .2], [.6, 1., .6], [.2, .6, 1.]])
waiting = [0,1,2]
kept = []
while waiting:
    current = waiting.pop(0)
    kept.append(current)
    waiting = [j for j in waiting if overlap[current,j] <= .5]
print(kept)`, '[0, 2]', 'Candidate one is suppressed and never gets a turn to suppress candidate two. The full box implementation computes these overlaps from coordinates.')),
  p('Crowded Objects Can Be Correctly Overlapping', `Two real seeds may overlap in the photograph. A strict suppression threshold can erase one legitimate detection; a loose threshold can retain several copies of the same seed. NMS cannot resolve that ambiguity from overlap alone.

Evaluate the retained detections on crowded scenes as well as isolated objects. Inspect missed objects and duplicate counts separately. A score-decay method or a detector trained for the setting may help, but changing postprocessing cannot create evidence that the original candidates lack.`),
 ]),
};
