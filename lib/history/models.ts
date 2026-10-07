import { history, source } from "./types";

const forests = source("Breiman (2001), Random Forests", "https://www.stat.berkeley.edu/users/breiman/randomforest2001.pdf");
const kernels = source("Boser, Guyon and Vapnik (1992), A Training Algorithm for Optimal Margin Classifiers", "https://doi.org/10.1145/130385.130401");

export const models = {
  "distance-metrics": history("What Should Count as Nearby?", [
    source("Mahalanobis (1936), On the Generalised Distance in Statistics", "https://doi.org/10.1007/s13171-019-00164-5"),
  ],
  "Suppose two people differ in both height and weight. We can draw them as points, but how far apart should they be? Measuring height in a different unit changes an ordinary geometric distance, even though the people are the same. Measurements that tend to move together create another complication: we may count much the same difference twice.",
  "Mahalanobis addressed the comparison of groups using several measurements in his 1936 paper on generalised distance. The distance took account of the variation and relationships between the measurements, rather than treating each raw coordinate as an equally informative direction.",
  "This gives us a reason to examine several distance rules. Straight-line distance, the sum of coordinate differences, and a distance adjusted for covariance answer different questions. Before choosing one, we need to decide what differences matter in our problem. A formula can measure proximity precisely while still measuring the wrong kind of proximity."),

  "k-nearest-neighbours": history("Could a Previous Example Supply the Answer?", [
    source("Cover and Hart (1967), Nearest Neighbor Pattern Classification", "https://isl.stanford.edu/~cover/papers/transIT/0021cove.pdf"),
  ],
  "Imagine receiving an unfamiliar specimen with several measurements. You already have labelled specimens. Before trying to write a complete rule for each class, a reasonable first question is whether any of the known specimens look similar to this one.",
  "Cover and Hart analysed nearest-neighbour classification in 1967. Their work helped establish that a very simple decision rule could have meaningful statistical properties: retain examples and classify a new observation using a nearby labelled observation. Those results depend on assumptions; they are not a promise that every choice of measurements or distance will work.",
  "Using several neighbours extends the same idea. We find nearby examples and let their labels vote, or average their values for regression. A small neighbourhood follows local detail; a larger one smooths across more observations. The method's simplicity makes its dependency clear: the measurements and distance must place meaningfully similar cases near one another."),

  "decision-trees": history("Could We Reach an Answer by Asking Smaller Questions?", [
    source("Breiman, Friedman, Olshen and Stone (1984), Classification and Regression Trees", "https://doi.org/10.1201/9781315139470"),
  ],
  "A single rule may describe a population poorly because different parts of it behave differently. Perhaps one measurement is useful for one group, while another becomes useful only after we have separated that group from the rest.",
  "The 1984 Classification and Regression Trees book brought together a systematic treatment of learning tree-shaped prediction rules. It addressed both how to split observations and how to avoid keeping every split that improves the training fit. The problem was not merely drawing a flowchart; it was finding a useful flowchart from data.",
  "At each step, a tree asks a question about an input and divides the examples according to the answer. Each resulting group can ask another question. The final groups provide predictions. A sequence of simple questions can describe quite different regions, but continuing until every training case is isolated usually records details that will not repeat. Stopping and pruning are therefore part of the method."),

  "bagging": history("What If One Small Change Produces a Different Tree?", [
    source("Breiman (1996), Bagging Predictors", "https://doi.org/10.1007/BF00058655"),
  ],
  "A decision tree can change substantially when a few training examples change. One different early split sends later observations down different branches. If several reasonable versions disagree, relying on just one may give a needlessly unstable answer.",
  "In his 1996 bagging paper, Leo Breiman investigated improving predictors by combining versions fitted to bootstrap samples. A bootstrap sample is drawn from the observed dataset with replacement, so some examples appear repeatedly and others are absent. This creates different training sets without pretending that new observations have been collected.",
  "We train a model on each sample and combine their predictions. Errors peculiar to one fitted model may be reduced by averaging or voting across the group. The benefit depends on the models making different errors. If they all miss the same pattern, combining them will not repair that shared mistake."),

  "random-forests": history("Why Do All Our Trees Keep Asking the Same Question?", [forests],
  "Training several trees does not help much if they repeatedly make the same decisions. A very strong input can be chosen near the top of almost every tree, leaving their predictions and mistakes strongly related.",
  "Breiman's 2001 random forests paper combined trees with random feature selection, building on earlier work on randomised tree ensembles. The concern was the relationship between the trees: useful individual predictions become a stronger collection when their errors are less closely tied.",
  "At a split, we offer a tree only a random selection of the available inputs. It must sometimes discover an alternative way to divide the examples. Combined with resampled training data, this produces a more varied collection of trees. The final vote or average can then benefit from that variety, provided the individual trees still contain useful information."),

  "gradient-boosting": history("Could the Next Model Concentrate on What We Got Wrong?", [
    source("Friedman (2001), Greedy Function Approximation: A Gradient Boosting Machine", "https://doi.org/10.1214/aos/1013203451"),
  ],
  "Suppose a simple model captures the broad pattern but consistently predicts too low in one region and too high in another. We could throw it away and start over. Or we could keep what it learned and ask another small model to describe the corrections it still needs.",
  "Friedman's 2001 gradient boosting paper developed this view through numerical optimisation. The successive models move the overall prediction in a direction that reduces a chosen loss. This connected boosting to gradient descent, with a fitted function supplying each adjustment.",
  "For squared error, the correction targets are the remaining residuals. We fit a small model to those residuals, add a controlled amount of its prediction, and inspect what remains. Other losses produce different correction signals. Small steps and limited model complexity matter because repeatedly correcting the training set can eventually fit its noise as well as its useful structure."),

  "feature-importance": history("Which Measurements Is the Model Actually Using?", [forests],
  "A model may predict well without making it obvious which inputs matter to its decisions. Looking at one branch of one tree does not answer the question for a whole forest. We need a way to examine the fitted model's dependence on a measurement.",
  "Breiman's 2001 random forests paper included an approach that perturbed a variable and measured the resulting change in predictive performance. The question was practical: if we disrupt this information while retaining the fitted predictor, how much worse does its work become?",
  "Permutation importance shuffles one input across observations, breaking its original relationship with the answers. A large performance drop suggests the model relied on that relationship. Split-based importance asks a different question about improvement during tree construction. Neither is a direct measure of causation, and correlated inputs can hide each other's contribution, so the meaning of the reported importance depends on how we measured it."),

  "grid-search": history("Who Chooses the Settings the Model Does Not Learn?", [
    source("Bergstra and Bengio (2012), Random Search for Hyper-Parameter Optimization", "https://www.jmlr.org/papers/v13/bergstra12a.html"),
  ],
  "A training procedure may learn coefficients while leaving us to choose the penalty strength or maximum tree depth. Different choices can produce different models from the same observations. We need a repeatable way to compare them.",
  "Grid search became a common experimental approach: specify candidate values and evaluate their combinations. Bergstra and Bengio's 2012 study used it as an established baseline and showed why it could spend evaluations inefficiently. Some settings matter much more than others, yet a grid repeats the same small set of values along each direction.",
  "The appeal is still easy to understand. A small grid states exactly which possibilities we tried and compares them under a shared evaluation procedure. The best result is the best among those tested, not proof of a global optimum. This lesson starts with that explicit search before considering its cost and alternatives."),

  "pipelines": history("How Do We Repeat the Whole Procedure Without Changing It?", [
    source("Pedregosa and colleagues (2011), Scikit-learn: Machine Learning in Python", "https://www.jmlr.org/papers/v12/pedregosa11a.html"),
    source("Scikit-learn, Common Pitfalls and Recommended Practices", "https://scikit-learn.org/stable/common_pitfalls.html"),
  ],
  "A useful model often depends on several earlier steps: filling missing values, scaling measurements, perhaps reducing dimensions. If we remember to repeat the predictor but forget how those preparations were learned, our evaluation no longer describes the procedure we will use on new data.",
  "Pipelines grew out of this broader software and experimental problem rather than a single new statistical formula. Scikit-learn's 2011 paper describes a library built around consistent interfaces for learning procedures. Its pipeline tools make a sequence of transformations and a predictor behave as one fitted object.",
  "Each learned preparation step fits only on the training data, then passes its result onward. Later observations travel through the stored steps in the same order. During cross-validation, the whole sequence must be fitted again inside each training fold. Packaging the procedure helps us enforce that boundary instead of relying on memory."),

  "k-means": history("Could a Few Representative Points Summarise the Collection?", [
    source("MacQueen (1967), Some Methods for Classification and Analysis of Multivariate Observations", "https://digicoll.lib.berkeley.edu/record/113015?v=pdf"),
  ],
  "Imagine a large collection of measurements with no category labels. We would like to describe it using a small number of representative cases. The problem is circular: sensible representatives depend on the groups, but sensible groups depend on where the representatives are.",
  "MacQueen's 1967 paper discussed methods for classifying multivariate observations and used the term k-means. It belongs to a broader history of clustering and quantisation, where researchers sought compact descriptions of many observations through representative centres.",
  "The familiar batch procedure alternates between two manageable tasks. First assign each observation to its nearest centre. Then replace each centre with the mean of its assigned observations. Repeating those steps reduces the squared-distance objective until the assignments settle. Different starting centres can still give different results, and the resulting groups need not correspond to natural categories."),

  "kernel-trick": history("Could a Different View Make the Groups Easier to Separate?", [kernels],
  "Imagine one group of points surrounded by another. Moving a straight dividing line around the picture will not separate them. We need to change the information used to describe each point, such as adding its distance from the middle.",
  "In 1992, Boser, Guyon and Vapnik showed how an optimal-margin classifier could work with a kernel to use richer features. This was an important machine-learning application of a mathematical idea with earlier roots: some calculations in a transformed space can be obtained directly from the original observations.",
  "A transformation can stretch or rotate coordinates, but those linear changes alone will not separate a surrounding ring from its centre. Adding a nonlinear feature can: the central points and the ring may occupy different heights in a new view, where a plane separates them. A suitable kernel computes the inner products that the method needs in that feature space, without explicitly constructing every new coordinate. The next walkthrough makes that change of view visible."),

  "kernel-ridge": history("Could We Keep Ridge Regression and Give It Richer Features?", [
    source("Saunders, Gammerman and Vovk (1998), Ridge Regression Learning Algorithm in Dual Variables", "https://pure.royalholloway.ac.uk/en/publications/ridge-regression-learning-algorithm-in-dual-variables/"),
  ],
  "Ridge regression gives us a controlled way to fit a relationship, but the features we supply still limit what it can express. Adding many transformed features may help, while also making the explicit feature table expensive to construct.",
  "Saunders, Gammerman and Vovk's 1998 work described ridge regression in terms of dual variables. This expresses the solution through relationships between training observations, opening the way to use a kernel in place of explicitly listed transformed features.",
  "For a new observation, the prediction combines its kernel comparisons with the training examples. The fitted coefficients determine how those comparisons contribute, and the ridge penalty still restrains the solution. This lets us fit a nonlinear relationship in the original inputs while retaining the regularisation idea. It also changes the cost: working with comparisons between every pair can become expensive as the dataset grows."),

  "kernel-pca": history("What If the Useful Direction Is Not Straight in the Original Picture?", [
    source("Schölkopf, Smola and Müller (1998), Nonlinear Component Analysis as a Kernel Eigenvalue Problem", "https://doi.org/10.1162/089976698300017467"),
  ],
  "Ordinary PCA looks for straight directions through a cloud of observations. If the observations follow a curved structure, projecting onto a straight direction can place very different parts of that structure on top of one another.",
  "Schölkopf, Smola and Müller developed kernel PCA in a 1996 technical report and a 1998 journal paper. They applied the kernel approach to component analysis, allowing PCA to operate in a feature space related nonlinearly to the original inputs.",
  "The idea is to describe observations through richer features before asking which directions carry variation. We do not need to write those features out when a kernel supplies their inner products. We must still centre the representation correctly. The resulting components are coordinates in that feature space, so a useful low-dimensional plot does not automatically provide a simple reconstruction in the original measurements."),

  "hebbian-pca": history("Could a Neuron Discover a Repeated Direction by Itself?", [
    source("Oja (1982), A Simplified Neuron Model as a Principal Component Analyzer", "https://doi.org/10.1007/BF00275687"),
  ],
  "Suppose a neuron repeatedly receives patterns with a shared direction of variation. We would like its weights to become sensitive to that direction without supplying a class label. Strengthening connections when input and output are active together offers a starting idea, but unchecked strengthening can make the weights grow without limit.",
  "Oja's 1982 paper examined a simplified neuron with a learning rule that included a stabilising term. It connected a local adjustment of weights with principal component analysis: under appropriate conditions, the unit could learn the leading direction of variation.",
  "The input-output agreement encourages the weights toward recurring structure. The stabilising correction prevents simple growth from being the only outcome. This gives us an incremental route to a principal component, using observations as they arrive. It is a mathematical learning model inspired by neural ideas, not a claim that a biological neuron literally runs the whole PCA procedure."),

  "self-organising-map": history("Could Similar Observations Become Neighbours on a Map?", [
    source("Kohonen (1982), Self-Organized Formation of Topologically Correct Feature Maps", "https://doi.org/10.1007/BF00337288"),
  ],
  "A collection may have too many measurements to plot directly. We could assign examples to groups, but that would not tell us which groups resemble one another. We would like the arrangement itself to carry some information.",
  "Kohonen's 1982 work investigated how an initially unorganised array of adaptive units could develop an ordered feature map. The problem was how local adjustments could produce a larger arrangement in which similar inputs activate nearby regions.",
  "Each location on the map stores a representative vector. An observation selects the closest representative, which moves toward it. Nearby map locations also move toward it, though usually less strongly. Updating neighbours together encourages a gradual organisation across the map. The map is still a compressed approximation; nearby positions can be informative without every distance being preserved."),

  "hopfield-network": history("Could a Damaged Pattern Lead Us Back to a Stored One?", [
    source("Hopfield (1982), Neural Networks and Physical Systems with Emergent Collective Computational Abilities", "https://doi.org/10.1073/pnas.79.8.2554"),
  ],
  "We can often recognise a familiar pattern when part of it is missing or corrupted. An exact lookup cannot do this: it expects the complete stored address. Associative memory asks whether the available fragments can instead guide us toward a complete pattern.",
  "Hopfield's 1982 paper connected networks of interacting units with the behaviour of physical systems that settle into stable states. Stored patterns could be represented as attractors, states toward which nearby starting configurations tend to move.",
  "The units repeatedly adjust in response to one another. With the appropriate symmetric connections and update conditions, an energy measure decreases until the network settles. Think of a noisy pattern starting within reach of a stored arrangement. The settling process may recover it, but competing memories and unwanted stable states mean that recovery is not guaranteed from every starting point."),

  "restricted-boltzmann-machine": history("Could Hidden Variables Explain Which Inputs Occur Together?", [
    source("Hinton (2002), Training Products of Experts by Minimizing Contrastive Divergence", "https://doi.org/10.1162/089976602760128018"),
  ],
  "Some observations occur together more often than others. A model of those patterns needs more than a separate frequency for each input. It needs a way to represent combinations, including influences that we do not observe directly.",
  "Boltzmann machines approached this through probabilistic networks with visible and hidden units. Training them could require expensive sampling. Hinton's 2002 contrastive divergence paper developed a practical approximation to learning such models, including restricted networks with connections between layers but none within a layer.",
  "Visible units describe the observation. Hidden units describe patterns that can help account for it. Because of the restricted connections, we can sample hidden units given the visible layer, then sample a reconstructed visible layer. Comparing the observed and reconstructed associations supplies an approximate learning signal. The short sampling procedure is useful, but it is not an exact calculation of the full likelihood gradient."),

  "multiclass-classification": history("What Changes When There Are More Than Two Answers?", [
    source("Dietterich and Bakiri (1995), Solving Multiclass Learning Problems via Error-Correcting Output Codes", "https://www.jair.org/index.php/jair/article/view/10127"),
  ],
  "Recognising whether an image contains a digit is a yes-or-no question. Identifying which digit it contains is a different task. A binary classifier cannot directly return one of several categories, so we need a rule for organising the larger decision.",
  "Researchers developed several ways to turn multiclass problems into collections of binary problems. Dietterich and Bakiri's 1995 work explored error-correcting output codes, giving classes different answer patterns across binary classifiers. It asked whether the combined pattern could tolerate some individual mistakes.",
  "Simpler decompositions include one classifier per class or one for each pair of classes. A model can also learn all class scores together and normalise them into a probability distribution. These arrangements use different evidence and can disagree. We will make the combination rule explicit instead of assuming that several binary outputs automatically form one coherent multiclass prediction."),

  "markov-chains": history("Does the Previous Event Tell Us Anything About the Next One?", [
    source("Markov (1913), An Example of Statistical Investigation of the Text Eugene Onegin Concerning the Connection of Samples in Chains", "https://nessie.ilab.sztaki.hu/~kornai/2022/HaladoGepiTanulas/markov_1913.pdf"),
  ],
  "If we count vowels in a passage, we learn how common they are. We do not yet know how they are arranged. A vowel may be more likely after a consonant than after another vowel, so treating every letter as an independent draw would discard useful structure.",
  "In 1913, Andrey Markov examined sequences of vowels and consonants in Pushkin's Eugene Onegin. This gave a concrete illustration of the dependent trials he had been studying: probabilities can describe a sequence even when successive outcomes are connected.",
  "A first-order Markov chain keeps the current state and uses it to choose probabilities for the next state. We can organise those probabilities in a transition table and advance through it repeatedly. The simplification is that the current state stands in for the relevant past. That can be useful for a manageable model, but it does not mean real language or every physical process forgets everything beyond one step."),
};
