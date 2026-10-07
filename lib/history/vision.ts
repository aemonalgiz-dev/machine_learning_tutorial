import { history, source } from "./types";

export const vision = {
  "filters-and-edges": history("How Could We Find a Boundary Among All Those Pixels?", [
    source("Canny (1986), A Computational Approach to Edge Detection", "https://www.cs.princeton.edu/courses/archive/fall13/cos429/papers/Canny86.pdf"),
  ],
  "A camera gives us brightness measurements, while many vision tasks need shapes and boundaries. A bright pixel alone does not identify either. A sudden change between neighbouring regions is more useful evidence, although noise can also produce abrupt changes.",
  "Edge detection developed around the problem of turning images into useful structural evidence. Canny's 1986 work made the competing goals explicit: detect real edges, locate them accurately, and avoid multiple responses to the same edge. It showed why smoothing and precise localisation have to be considered together.",
  "A local filter combines neighbouring pixels according to a chosen set of weights. Averaging can suppress small fluctuations; difference filters reveal changes in brightness and their directions. We will begin with those components before considering a complete detector. An edge response marks an image change, which may come from a shadow or texture as well as an object's boundary."),

  "histogram-of-oriented-gradients": history("Could the Arrangement of Edges Help Us Recognise a Person?", [
    source("Dalal and Triggs (2005), Histograms of Oriented Gradients for Human Detection", "https://www.cs.princeton.edu/courses/archive/fall13/cos429/papers/Dalal05.pdf"),
  ],
  "People in photographs wear different clothes and appear under different lighting. Their raw pixels vary greatly, but their outlines and local edge arrangements can still share useful structure. We need a representation that retains those arrangements without requiring exact pixel agreement.",
  "Dalal and Triggs' 2005 work investigated histograms of oriented gradients for detecting humans. Their experiments examined how local gradient directions and overlapping contrast normalisation could supply useful evidence to a classifier.",
  "Within small cells, we count the strength of brightness changes pointing in different directions. Neighbouring cells preserve a rough spatial layout, and normalising groups of cells reduces sensitivity to some contrast changes. The resulting vector describes a pattern of local edges. It is a feature representation, so a separate trained classifier is still needed to decide which patterns indicate a person."),

  "template-matching": history("Where Does This Particular Pattern Appear Again?", [
    source("Lewis (1995), Fast Template Matching, with the Expanded Fast Normalized Cross-Correlation Paper", "https://www.scribblethink.org/Work/nvisionInterface/nip.pdf"),
  ],
  "Suppose we already have a small image of the thing we want to locate. We are not yet trying to recognise every member of a broad category. We are looking for another occurrence of this particular appearance within a larger image.",
  "Template matching has a long signal-processing and computer-vision lineage. Lewis' 1995 work on fast template matching addressed a practical bottleneck: computing normalised cross-correlation efficiently across candidate locations. The normalisation matters when illumination changes would make raw brightness comparisons misleading.",
  "We move the reference patch over the image and score each position. Normalised correlation compares the pattern of variation after accounting for local mean and scale. A high score points to similar appearance under those assumptions. Rotation, size changes, and deformation can still disrupt the match, which explains why later methods often search using more adaptable local features."),

  "keypoints-and-descriptors": history("Which Parts of a Picture Would We Recognise in Another View?", [
    source("Harris and Stephens (1988), A Combined Corner and Edge Detector", "https://www.bmva-archive.org.uk/bmvc/1988/avc-88-023.pdf"),
    source("Lowe (2004), Distinctive Image Features from Scale-Invariant Keypoints", "https://www.cs.ubc.ca/~lowe/papers/ijcv04.pdf"),
  ],
  "A blank wall looks similar at many positions, so it offers poor evidence for matching two photographs. A distinctive corner or textured patch gives us a better chance of recognising the same location again. We need both a way to select such locations and a way to describe them.",
  "Harris and Stephens' 1988 detector examined how an image patch changes when shifted, helping identify corners with variation in more than one direction. Lowe's later SIFT work, described in detail in 2004, developed distinctive local features that could survive changes in scale and rotation.",
  "Detection chooses where to look; description records what the neighbourhood looks like. Matching compares those descriptions. Keeping the three jobs separate explains why a stable corner alone is insufficient: its descriptor may still change when the camera rotates. The lesson begins with simpler components so that the need for more invariant descriptions becomes visible."),

  "image-alignment": history("How Could We Align Two Views When Some Matches Are Wrong?", [
    source("Fischler and Bolles (1981), Random Sample Consensus: A Paradigm for Model Fitting with Applications to Image Analysis and Automated Cartography", "https://doi.org/10.1145/358669.358692"),
  ],
  "Two photographs of a scene may share many recognisable points, yet some proposed matches will be wrong. Repeated windows or similar textures can create convincing false correspondences. Fitting a transformation to all matches indiscriminately can let those errors pull the images out of alignment.",
  "Fischler and Bolles introduced RANSAC in 1981 for model fitting in the presence of gross errors, with applications including image analysis and cartography. Instead of assuming every observation deserved equal influence, the method searched for a model supported by a consistent subset.",
  "We fit a candidate transformation from a small sample of matches, then ask how many other matches agree with it. Repeating this can reveal a well-supported transformation despite outliers. The transformation still needs to suit the geometry: one planar mapping cannot generally account for arbitrary three-dimensional parallax. Agreement gives us evidence for alignment under the chosen model, not proof that every correspondence is correct."),

  "haar-cascades": history("Why Spend the Same Effort on an Empty Wall and a Possible Face?", [
    source("Viola and Jones (2001), Rapid Object Detection Using a Boosted Cascade of Simple Features", "https://www.cs.utexas.edu/~grauman/courses/spring2007/395T/papers/viola_cvpr2001.pdf"),
  ],
  "Searching an image for faces means examining many windows, most of which contain no face at all. If every window requires an expensive classifier, the cost of rejecting obvious background can dominate the work.",
  "Viola and Jones' 2001 detector combined quickly computed rectangular features, boosting, and a cascade of classifiers. A central practical idea was to reject easy negative windows early, leaving more computation for the smaller number that remained plausible.",
  "A rectangular feature compares brightness totals in adjacent regions. An integral image makes those totals quick to obtain. Early cascade stages use a few selected tests; only passing windows continue to later stages. The cascade must be trained to retain likely positives, because a face rejected early never reaches the more detailed checks."),

  "a-vector-for-a-picture": history("Could Features Learned for One Image Task Help with Another?", [
    source("Donahue and colleagues (2014), DeCAF: A Deep Convolutional Activation Feature for Generic Visual Recognition", "https://proceedings.mlr.press/v32/donahue14.html"),
  ],
  "Two pictures can show similar objects while differing at nearly every pixel. Position, lighting, and background all change the raw array. We would like a representation that retains features useful for recognition rather than comparing only corresponding brightness values.",
  "Donahue and colleagues' DeCAF work, released in 2013 and published in 2014, investigated reusing the internal activations of a trained convolutional network for other recognition tasks. It helped demonstrate that an intermediate representation could be valuable beyond the original classifier's output categories.",
  "We pass an image through the network and take a selected internal representation as its vector. Training has shaped what that vector retains, so images sharing useful features may be close despite pixel differences. Which layer we choose and how the network was trained both matter. A vector from a classifier is a useful candidate for comparison, not an automatic guarantee of the similarity our application needs."),

  "learning-the-metric-itself": history("Could Examples Teach Us What Similar Should Mean?", [
    source("Hadsell, Chopra and LeCun (2006), Dimensionality Reduction by Learning an Invariant Mapping", "https://doi.org/10.1109/CVPR.2006.100"),
  ],
  "For some searches, similar means the same object under different lighting. For others, it means different objects in the same category. Raw pixel distance cannot decide which of those relationships matters, and a generic classifier may not have learned it either.",
  "Hadsell, Chopra and LeCun's 2006 work learned a mapping from examples of relationships between inputs. Its contrastive objective encouraged related observations to be nearby while separating observations marked as dissimilar.",
  "A shared encoder maps both members of a pair into the same space. Training pulls specified positive pairs together and penalises negative pairs that are too close under the chosen margin. This makes the desired relationship part of the learning task. The labels and sampling policy therefore define the notion of similarity, and the resulting distances still need evaluation on pairs the model did not see."),

  "searching-a-collection-of-pictures": history("How Could We Search Images Without Comparing Every Pixel of Every Picture?", [
    source("Sivic and Zisserman (2003), Video Google: A Text Retrieval Approach to Object Matching in Videos", "https://www.robots.ox.ac.uk/~vgg/publications/2003/Sivic03/"),
    source("Johnson, Douze and Jégou (2017), Billion-Scale Similarity Search with GPUs", "https://arxiv.org/abs/1702.08734"),
  ],
  "A useful image representation solves only part of a retrieval problem. We still have to find related entries among a large collection. Comparing a query with every stored representation is straightforward, but the cost grows with the collection.",
  "Sivic and Zisserman's 2003 Video Google work borrowed text-retrieval ideas to search local visual features through an index. Later vector-search work, including Johnson and colleagues' 2017 study, addressed efficient similarity search at much larger scales. These approaches use different representations but share the need to organise the search.",
  "An index gives us a way to inspect promising candidates without treating every stored item equally. Clusters, partitions, or compressed codes can reduce the work. Approximate search may miss some true nearest neighbours, so we measure retrieval quality as well as speed. The index helps find nearby representations; the representation determines whether those neighbours are useful pictures."),
};
