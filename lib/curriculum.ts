import expandedNavigation from "./lessons/navigation.json";

export interface Concept {
  title: string;
  blurb: string;
  // An href means the page exists and the card links to it. Without one the
  // card is a placeholder, shown but not yet clickable.
  href?: string;
}

export interface Topic {
  id?: string;
  heading: string;
  blurb: string;
  concepts: Concept[];
}

export interface Part {
  id?: string;
  title: string;
  intro: string;
  topics: Topic[];
}

// Shared by the section overview, section pages, and lesson breadcrumbs.
const existingCurriculum: Part[] = [
  {
    "id": "mathematics-as-needed",
    "title": "Introductory Mathematics",
    "intro": "Measurements vary, and the patterns we observe are not always dependable. Statistics and probability help us judge those patterns. Linear algebra and calculus describe relationships between quantities and how those relationships change.",
    "topics": [
      {
        "heading": "Introductory Mathematics",
        "blurb": "",
        "concepts": [
          {
            "title": "Statistics & Probability Primer",
            "href": "/primers/statistics",
            "blurb": "An average describes a typical value in a collection of measurements. Measures of spread show how much those measurements vary, and probability gives us ways to reason about uncertain outcomes."
          },
          {
            "title": "Linear Algebra Primer",
            "href": "/primers/linear-algebra",
            "blurb": "A system of equations can describe several quantities that depend on each other. Vectors and matrices make those relationships easier to calculate with, while geometry helps us picture what the calculations are doing."
          },
          {
            "title": "Calculus Primer",
            "href": "/primers/calculus",
            "blurb": "Calculus describes how one quantity changes as another changes. A derivative measures the rate of that change, helping us understand a function's behavior and decide which adjustments increase or decrease its output."
          }
        ]
      }
    ]
  },
  {
    "title": "Start with a Prediction",
    "intro": "A prediction uses what we know to estimate something we don't. The answer may be a number or a category, and the rule needs to work on examples beyond those used to develop it.",
    "topics": [
      {
        "heading": "Start with a Prediction",
        "blurb": "",
        "concepts": [
          {
            "title": "Simple Linear Regression",
            "href": "/concepts/simple-linear-regression",
            "blurb": "Linear regression represents a relationship with a straight line. Fitting the line means choosing its slope and intercept according to the differences between observed and predicted values."
          },
          {
            "title": "Held-Out Evaluation",
            "href": "/concepts/held-out-evaluation",
            "blurb": "Performance on familiar examples can overstate how well a rule predicts new ones. Setting data aside before fitting gives us a separate check of its predictions."
          },
          {
            "title": "Logistic Regression",
            "href": "/concepts/logistic-regression",
            "blurb": "Logistic regression estimates the probability of a category from a set of measurements. A decision threshold turns that probability into a yes-or-no prediction, with different thresholds producing different kinds of mistake."
          },
          {
            "title": "Judging a Classifier",
            "href": "/concepts/judging-a-classifier",
            "blurb": "Correct predictions and different kinds of mistake need to be counted separately. Their consequences determine which evaluation measures tell us whether a classifier is useful."
          }
        ]
      }
    ]
  },
  {
    "title": "Data Preparation",
    "intro": "The way data is recorded affects what we can calculate from it. Missing values and inconsistent units need explicit treatment, while categories and dates need representations that preserve their meaning. Historical predictions also need the information that was available at the time.",
    "topics": [
      {
        "heading": "Centres and Scales",
        "blurb": "The size of a numerical difference depends on the units we use and the point we measure from. Changing those references can make measurements easier to compare, while also changing how much influence each one has on a calculation.",
        "concepts": [
          {
            "title": "Centering on the Mean",
            "href": "/concepts/centring-on-the-mean",
            "blurb": "Subtracting the mean expresses each measurement relative to the average. The differences between observations stay the same, while zero becomes a useful reference for their departures from that average."
          },
          {
            "title": "The Standard Score",
            "href": "/concepts/the-standard-score",
            "blurb": "A difference from the average depends on how much the measurements normally vary. A standard score expresses that difference in units of standard deviation, allowing values on different scales to be compared."
          },
          {
            "title": "Feature Scaling",
            "href": "/concepts/feature-scaling",
            "blurb": "The units of a measurement can affect its influence on a calculation. Scaling changes those units or ranges, which matters when distances or parameter updates are sensitive to the size of the numbers."
          }
        ]
      },
      {
        "heading": "Constructing and Reducing Features",
        "blurb": "The measurements we collect are not always the most useful inputs for a model. Combining them can express a relationship more directly, while reducing overlapping information can give us a smaller representation. Both choices change what the model can learn.",
        "concepts": [
          {
            "title": "Polynomial Features",
            "href": "/concepts/polynomial-features",
            "blurb": "Powers and products of existing measurements can describe relationships a straight line in the original inputs cannot. They add flexibility while keeping the fitted prediction linear in its coefficients."
          },
          {
            "title": "Principal Component Analysis",
            "href": "/concepts/pca",
            "blurb": "Measurements that vary together can repeat information. Principal component analysis finds directions that preserve the greatest variation, giving us a smaller set of coordinates with a measurable loss of detail."
          }
        ]
      }
    ]
  },
  {
    "title": "Classical Machine Learning",
    "intro": "Learning methods use different assumptions to find useful relationships in data. Some predict an answer from labeled examples; others identify groups or unusual patterns. Those differences affect what each method can explain and where it is useful.",
    "topics": [
      {
        "heading": "Distance",
        "blurb": "Distance gives a numerical meaning to how different two observations are. That meaning depends on the comparison rule and the scale of the measurements. The nearest examples can change when either choice changes.",
        "concepts": [
          {
            "title": "What Near Means",
            "href": "/concepts/distance-metrics",
            "blurb": "Distance depends on which differences we choose to count and how we combine them. Different measures can change which observations are nearest, affecting comparisons and the groups formed from them."
          }
        ]
      },
      {
        "heading": "Regression",
        "blurb": "Regression describes how a numerical outcome relates to its inputs. Additional measurements or curved relationships can improve a prediction, but they also give the fitted rule more freedom to follow noise. We need to judge that flexibility on new observations.",
        "concepts": [
          {
            "title": "Multiple & Polynomial Regression",
            "href": "/concepts/multiple-polynomial-regression",
            "blurb": "A prediction may depend on several measurements and how they interact. Multiple regression combines their contributions, while polynomial terms allow curved relationships in the original inputs."
          },
          {
            "title": "Fitting by Walking",
            "href": "/concepts/gradient-descent-regression",
            "blurb": "A fitted rule can be improved through repeated adjustments to its coefficients. The gradient describes how the error changes near the current settings, providing a direction in which to try reducing it."
          },
          {
            "title": "Ridge & Lasso",
            "href": "/concepts/ridge-lasso",
            "blurb": "A model can fit details in the training data that do not hold elsewhere. Ridge and lasso penalize coefficient size in different ways, changing how the fit balances prediction error against complexity."
          }
        ]
      },
      {
        "heading": "Classification",
        "blurb": "Classification uses measurements to choose between categories. Different methods make that choice through nearby examples, questions about individual features, or comparisons of class scores. Their assumptions affect which distinctions they can learn and where they make mistakes.",
        "concepts": [
          {
            "title": "k-Nearest Neighbors",
            "href": "/concepts/k-nearest-neighbours",
            "blurb": "Nearby labeled examples can provide evidence about an unfamiliar observation. The distance measure and number of neighbors determine which examples contribute and how local the resulting prediction is."
          },
          {
            "title": "Decision Trees",
            "href": "/concepts/decision-trees",
            "blurb": "A decision tree divides observations through a sequence of questions about their measurements. Each route ends in a prediction, making the fitted decisions traceable while leaving their reliability dependent on the examples used."
          },
          {
            "title": "More Than Two Classes",
            "href": "/concepts/multiclass-classification",
            "blurb": "Some predictions have several possible categories. Comparing a score for each category requires a consistent decision rule and a clear distinction between scores and probabilities."
          }
        ]
      },
      {
        "heading": "Ensembles",
        "blurb": "Several models can contribute to one prediction. Their combined answer can be more dependable when their errors differ, but the training procedure determines whether they correct one another or repeat the same mistakes.",
        "concepts": [
          {
            "title": "Bagging",
            "href": "/concepts/bagging",
            "blurb": "Small changes to training data can produce different fitted models. Bagging fits models on resampled observations and combines their predictions, reducing the influence of variation in any one fit."
          },
          {
            "title": "Random Forests",
            "href": "/concepts/random-forests",
            "blurb": "Combining trees helps when their errors differ. Random forests vary both the sampled observations and the features available at a split, encouraging different trees to contribute different information."
          },
          {
            "title": "Gradient Boosting",
            "href": "/concepts/gradient-boosting",
            "blurb": "Boosting builds a prediction in stages. Each additional model targets a correction to the current result, allowing a sequence of limited adjustments to describe a more complicated relationship."
          }
        ]
      },
      {
        "heading": "Clustering",
        "blurb": "Clustering groups observations without supplied category labels. The groups depend on the similarity rule and the structure the method is designed to find. A useful grouping therefore needs interpretation in terms of the original measurements.",
        "concepts": [
          {
            "title": "k-Means Clustering",
            "href": "/concepts/k-means",
            "blurb": "Clustering groups observations without requiring category labels. K-means alternates between assigning points to nearby centers and moving each center to the mean of its assigned points."
          }
        ]
      },
      {
        "heading": "Kernels",
        "blurb": "Changing a representation can make a difficult relationship easier to describe. A kernel calculates certain comparisons in a transformed representation without constructing all its coordinates explicitly. That lets a model use relationships that a straight boundary in the original measurements would miss.",
        "concepts": [
          {
            "title": "The Kernel Trick",
            "href": "/concepts/kernel-trick",
            "blurb": "Changing the representation of data can make a complicated separation easier to describe. A kernel calculates inner-product comparisons in a transformed feature space without requiring every transformed coordinate to be constructed explicitly."
          },
          {
            "title": "Kernel Ridge Regression",
            "href": "/concepts/kernel-ridge",
            "blurb": "Kernel ridge regression combines comparisons in a transformed feature space with a penalty that controls the fit. The kernel determines the relationships available to the model, while the penalty limits how closely it follows the observations."
          },
          {
            "title": "Kernel Principal Components",
            "href": "/concepts/kernel-pca",
            "blurb": "Useful variation can become easier to represent after a nonlinear transformation. Kernel PCA uses comparisons between examples to find principal directions in that transformed space."
          }
        ]
      },
      {
        "heading": "Sequences",
        "blurb": "Observations in a sequence can depend on what came before them. A Markov chain describes the next state using the current one. Its usefulness depends on whether that state retains enough information for the prediction we need.",
        "concepts": [
          {
            "title": "Markov Chains",
            "href": "/concepts/markov-chains",
            "blurb": "A Markov chain represents a process through states and the probabilities of moving between them. Its next-state prediction depends on the current state, making the choice of what a state includes important."
          }
        ]
      },
      {
        "heading": "Classical Computer Vision",
        "blurb": "A digital image stores measurements at pixel positions. Image-processing methods use their arrangement to find boundaries or compare local patterns. Those calculations turn a grid of values into evidence about the objects and structures in a picture.",
        "concepts": [
          {
            "title": "Filters and Edges",
            "href": "/concepts/filters-and-edges",
            "blurb": "Changes in neighboring pixel values reveal boundaries and local patterns in an image. Filters calculate those changes over small regions, making image structure easier to measure."
          },
          {
            "title": "Template Matching",
            "href": "/concepts/template-matching",
            "blurb": "A known image pattern can be compared with regions of a larger image to locate possible matches. The comparison rule determines how changes in brightness affect the match score."
          },
          {
            "title": "Histogram of Oriented Gradients",
            "href": "/concepts/histogram-of-oriented-gradients",
            "blurb": "Local edge directions describe image shape without requiring every pixel value to match. Histograms of oriented gradients collect those directions into regional summaries that can support object detection."
          },
          {
            "title": "Keypoints and Descriptors",
            "href": "/concepts/keypoints-and-descriptors",
            "blurb": "Distinctive image locations can be matched across photographs taken from different viewpoints. A descriptor gives each location a numerical account of its surroundings so candidate matches can be compared."
          },
          {
            "title": "Image Alignment",
            "href": "/concepts/image-alignment",
            "blurb": "Corresponding points in two images provide evidence about how their coordinates relate. Estimating that transformation allows the images to be aligned, with incorrect matches affecting the result."
          },
          {
            "title": "Haar Cascades",
            "href": "/concepts/haar-cascades",
            "blurb": "Most regions searched by an object detector contain no match. A cascade rejects unlikely regions with inexpensive checks before spending more computation on the candidates that remain."
          }
        ],
        "id": "classical-methods"
      }
    ]
  },
  {
    "title": "Choosing and Checking a Model",
    "intro": "Choosing a model involves deciding how to represent a problem and how to measure a useful result. Comparisons need examples that did not guide the fitting process, with a final assessment kept separate from repeated changes.",
    "topics": [
      {
        "heading": "Choosing and Checking a Model",
        "blurb": "",
        "concepts": [
          {
            "title": "Pipelines",
            "href": "/concepts/pipelines",
            "blurb": "Data preparation can learn settings from the observations it receives. Keeping preparation and prediction in one fitting procedure helps prevent evaluation data from influencing those settings."
          },
          {
            "title": "Searching for a Setting",
            "href": "/concepts/grid-search",
            "blurb": "Model settings chosen before fitting affect the result. Grid search compares specified combinations using validation data, while a separate final test checks the choice after the search is complete."
          },
          {
            "title": "Which Feature Mattered",
            "href": "/concepts/feature-importance",
            "blurb": "Feature importance investigates how input measurements affect a fitted model's results. Different methods answer different questions, and related measurements can complicate how their scores should be interpreted."
          }
        ]
      }
    ]
  },
  {
    "title": "Neural Networks",
    "intro": "An artificial neuron combines weighted inputs with a bias and applies an activation function. Connecting neurons allows a network to represent more complicated relationships. Training adjusts their settings according to the errors made on examples.",
    "topics": [
      {
        "heading": "Neurons and Layers",
        "blurb": "An artificial neuron combines weighted inputs with a bias, then applies an activation function. Connecting neurons into layers lets later calculations use patterns found by earlier ones. The arrangement determines how measurements move through the network and become an output.",
        "concepts": [
          {
            "title": "A Neuron",
            "href": "/concepts/neurons-and-activations",
            "blurb": "An artificial neuron has weights, a bias and an activation function. The weights control each input's contribution, the bias shifts the combined value, and the activation determines how that value becomes an output."
          },
          {
            "title": "A Dense Layer and the Forward Pass",
            "href": "/concepts/dense-layers",
            "blurb": "A dense layer applies several neurons to the same inputs. Each neuron learns its own weighted combination, producing a collection of outputs that another layer can use."
          },
          {
            "title": "The Shape Guarantee",
            "href": "/concepts/shapes-and-flattening",
            "blurb": "An array's shape records how values are arranged and which belong to the same example. Flattening puts each example's values into a vector, so the original spatial organization is no longer explicit."
          }
        ]
      },
      {
        "heading": "Training",
        "blurb": "A network learns by adjusting its parameters to reduce a measured error. Backpropagation calculates how those parameters contributed to the loss, giving an update rule information about which direction to move. We can follow those changes through a small network.",
        "concepts": [
          {
            "title": "Loss Functions",
            "href": "/concepts/loss-functions",
            "blurb": "A loss function assigns a numerical cost to a prediction's error. Its definition determines which mistakes contribute most strongly to the adjustments made during training."
          },
          {
            "title": "Backpropagation",
            "href": "/concepts/backpropagation",
            "blurb": "Backpropagation applies the chain rule through a network's calculations. Working backward from the loss gives the derivatives needed to determine how changes to each weight affect that loss."
          },
          {
            "title": "Training a Small Network",
            "href": "/concepts/training-a-network",
            "blurb": "Training repeatedly calculates predictions and measures their errors. Gradients then guide parameter updates, with the update size and sequence of examples affecting how the network changes."
          }
        ]
      },
      {
        "heading": "Regularisation and Normalisation",
        "blurb": "A network can fit its training examples and still struggle elsewhere. Dropout changes the connections used during training to discourage reliance on particular combinations. Normalization changes how intermediate values are scaled, addressing a different part of how a network trains.",
        "concepts": [
          {
            "title": "Dropout",
            "href": "/concepts/dropout",
            "blurb": "Dropout randomly removes some activations during training. The network therefore trains with changing combinations of available units, which can reduce overfitting without guaranteeing better predictions on every task."
          },
          {
            "title": "Normalization Layers",
            "href": "/concepts/normalisation-layers",
            "blurb": "Normalization changes the reference and scale of values passed through a network. The values grouped for that calculation distinguish methods such as batch and layer normalization and affect their behavior during training and prediction."
          }
        ]
      },
      {
        "heading": "Other Ways to Learn and Store Patterns",
        "blurb": "Networks can learn relationships without a supplied target label. Some retain patterns that can be recalled from incomplete inputs; others organize examples or learn features from their own activity. The learning rule determines what the stored representation captures.",
        "concepts": [
          {
            "title": "Hopfield Networks",
            "href": "/concepts/hopfield-network",
            "blurb": "A Hopfield network uses repeated updates to settle toward a stable pattern. Its connections can store associations that help recover a familiar pattern from incomplete or noisy input, though other stable states can also occur."
          },
          {
            "title": "Restricted Boltzmann Machines",
            "href": "/concepts/restricted-boltzmann-machine",
            "blurb": "A restricted Boltzmann machine relates observed values to hidden variables through a probability model. Learning their interactions provides a way to represent patterns shared across the observations."
          },
          {
            "title": "Self-Organizing Maps",
            "href": "/concepts/self-organising-map",
            "blurb": "A self-organizing map places representative vectors on a grid. Nearby positions are encouraged to respond to similar observations, giving a spatial summary of data that may have many dimensions."
          },
          {
            "title": "Hebbian Principal Components",
            "href": "/concepts/hebbian-pca",
            "blurb": "Oja's rule adjusts a neuron's weights from successive inputs and outputs. A normalization-related correction limits unbounded growth, allowing the updates to seek a principal direction under suitable learning conditions."
          }
        ]
      },
      {
        "heading": "Additional Network Layers",
        "blurb": "A layer's connections determine what information it can use. Recurrent connections retain information across steps, while other layers compare inputs with reference points or carry earlier values forward. Those choices give networks different ways to represent a relationship.",
        "concepts": [
          {
            "title": "Recurrent Layers",
            "href": "/concepts/recurrent-layers",
            "blurb": "A recurrent layer retains a state as it processes a sequence, allowing earlier observations to affect later outputs. Gated variants control how information is kept or replaced."
          },
          {
            "title": "Radial Basis Networks",
            "href": "/concepts/radial-basis-networks",
            "blurb": "A radial basis network describes an input through its distance from reference points. Combining those local responses produces a prediction whose behavior depends on the locations and widths of the responses."
          },
          {
            "title": "Residual Connections",
            "href": "/concepts/residual-connections",
            "blurb": "A residual connection adds a layer's learned transformation to its input. This gives information a direct route forward and allows the layer to represent an adjustment to an existing representation."
          }
        ]
      }
    ]
  },
  {
    "title": "Computer Vision with Neural Networks",
    "intro": "Images contain patterns that change with position and appearance. Neural networks can learn which patterns help identify objects or label individual pixels. Their predictions depend on the examples used for training and how an image is represented.",
    "topics": [
      {
        "heading": "Spatial Layers",
        "blurb": "Nearby pixels often form a useful pattern together. Convolution applies shared weights at different image positions, while pooling combines local responses. These operations preserve a connection to location as a network builds larger-scale features.",
        "concepts": [
          {
            "title": "Convolution",
            "href": "/concepts/convolution",
            "blurb": "Convolution applies the same small set of weights across different positions. The resulting response map describes where a local pattern appears, using fewer independent weights than a separate rule for every position."
          },
          {
            "title": "Pooling",
            "href": "/concepts/pooling",
            "blurb": "Pooling combines nearby values into a smaller representation. It reduces spatial resolution, so the choice of operation determines which responses are retained and which positional details are lost."
          }
        ]
      },
      {
        "heading": "Convolutional Networks",
        "blurb": "Convolutional layers can learn image features from labeled examples. A classifier uses those features to identify an image's category, while a segmentation network such as U-Net predicts labels at individual pixel positions. The required output changes how the layers are connected.",
        "concepts": [
          {
            "title": "Convolutional Networks",
            "href": "/concepts/convolutional-networks",
            "blurb": "Convolutional networks combine local image patterns through successive layers. Training learns which combinations help predict an image's label, with later representations drawing on larger regions of the input."
          },
          {
            "title": "U-Net",
            "href": "/concepts/u-net",
            "blurb": "U-Net learns from images paired with labeled masks to predict a label for each pixel. Connections from earlier layers preserve spatial detail as the network reconstructs a higher-resolution output."
          }
        ]
      },
      {
        "heading": "Embedding Pictures",
        "blurb": "Pixel differences do not always reflect how similar two pictures seem. A learned feature vector can preserve distinctions relevant to a particular task. Comparing those vectors gives us a way to search image collections, provided we test what their distances actually represent.",
        "concepts": [
          {
            "title": "A Vector for a Picture",
            "href": "/concepts/a-vector-for-a-picture",
            "blurb": "A trained image network can represent a picture as a vector of features. Comparing those vectors can capture similarities that direct pixel comparisons miss, depending on what the network learned."
          },
          {
            "title": "Learning the Metric Itself",
            "href": "/concepts/learning-the-metric-itself",
            "blurb": "Similarity depends on which differences matter for a task. Metric learning uses examples of matches and nonmatches to shape a representation in which distances reflect those distinctions."
          },
          {
            "title": "Searching a Collection of Pictures",
            "href": "/concepts/searching-a-collection-of-pictures",
            "blurb": "Image vectors allow pictures to be searched by similarity. Comparing every vector provides a reference result, while approximate indexes reduce search work by accepting some missed neighbors."
          }
        ]
      }
    ],
    "id": "computer-vision"
  },
  {
    "title": "Natural Language Processing",
    "intro": "Written language needs a representation a computer can calculate with. Tokens identify pieces of text, while learned numerical representations capture relationships between them. The surrounding words help determine how a particular piece is used.",
    "topics": [
      {
        "heading": "Tokens and Basic Units",
        "blurb": "A numerical model needs text represented as pieces it can process. Those pieces can be words or smaller units, each with an identifier. The choice affects which distinctions remain visible and how unfamiliar text can be represented.",
        "concepts": [
          {
            "title": "What a Token Is",
            "href": "/concepts/what-a-token-is",
            "blurb": "A token is a piece of text represented by an ID from a vocabulary. The piece may be a word or part of one; the ID identifies it without expressing its meaning or similarity to other pieces."
          },
          {
            "title": "Bytes and Characters",
            "href": "/concepts/bytes-and-characters",
            "blurb": "Text has several units of representation. A visible character can involve multiple code points or bytes, affecting how text is stored and how much input a model has to process."
          },
          {
            "title": "Splitting on Spaces",
            "href": "/concepts/splitting-on-spaces",
            "blurb": "Splitting text at spaces gives a simple rule for identifying pieces. Punctuation and repeated whitespace expose its limits, as do writing systems that do not use spaces to mark word boundaries."
          }
        ]
      },
      {
        "heading": "Rules for Word Boundaries",
        "blurb": "Spaces alone do not settle where every text unit begins and ends. Punctuation and writing conventions require further decisions. Rule-based tokenizers make those decisions explicit, which helps explain why the same sentence can produce different pieces under different schemes.",
        "concepts": [
          {
            "title": "Unicode Word Boundaries",
            "href": "/concepts/unicode-word-boundaries",
            "blurb": "Writing systems use different kinds of characters and boundary conventions. Unicode information supports more general splitting rules than English letters and spaces alone, while some language-specific boundaries still need other methods."
          },
          {
            "title": "Penn Treebank Rules",
            "href": "/concepts/penn-treebank-rules",
            "blurb": "Penn Treebank tokenization applies consistent rules to English contractions and punctuation. Those conventions let text be divided into pieces that match the assumptions used in annotated datasets."
          },
          {
            "title": "Moses Rules",
            "href": "/concepts/moses-rules",
            "blurb": "Moses tokenization separates punctuation while accounting for language-specific forms such as abbreviations. Its exceptions affect which marks remain attached to a word and which become separate pieces."
          },
          {
            "title": "The Pattern Language Models Use",
            "href": "/concepts/the-pattern-language-models-use",
            "blurb": "Regular expressions describe patterns of characters that should stay together or be split apart. Initial groups of letters, numbers and punctuation constrain the pieces a tokenizer can learn afterward."
          }
        ]
      },
      {
        "heading": "Scripts Without Spaces",
        "blurb": "Word boundaries are not always marked by spaces. A segmentation method needs other evidence, such as known words or patterns learned from examples. Different sources of evidence lead to different decisions when several divisions of the same text are plausible.",
        "concepts": [
          {
            "title": "Maximum Matching",
            "href": "/concepts/maximum-matching",
            "blurb": "A dictionary can suggest word boundaries when spaces are absent. Maximum matching chooses the longest available word at each position, so an early local choice can affect the segmentation that follows."
          },
          {
            "title": "The Word Lattice",
            "href": "/concepts/the-word-lattice",
            "blurb": "A word lattice retains alternative ways to divide a sequence into words. Complete paths represent different segmentations, allowing choices to be compared before committing to an early boundary."
          },
          {
            "title": "Segmenting With a Hidden Model",
            "href": "/concepts/segmenting-with-a-hidden-model",
            "blurb": "Hidden states can describe which characters begin or end a word even when those labels are unobserved. A probabilistic model compares possible state sequences to infer likely word boundaries."
          },
          {
            "title": "Learning Boundaries From Examples",
            "href": "/concepts/learning-boundaries-from-examples",
            "blurb": "Annotated boundaries provide examples of where text should be split. A supervised model uses surrounding character information to learn decisions that can be applied to new sequences."
          }
        ]
      },
      {
        "heading": "Predicting Token Sequences",
        "blurb": "Counts of short token sequences tell us which continuations have occurred before. They provide a simple next-token model, but limited data leaves many possible sequences unseen. The treatment of those missing counts affects which predictions the model can make.",
        "concepts": [
          {
            "title": "N-Grams",
            "href": "/concepts/n-grams",
            "blurb": "An n-gram model estimates a continuation from counts of short sequences. Its predictions depend on the context length and how probability is assigned to sequences absent from the training data."
          }
        ]
      },
      {
        "heading": "Learning a Subword Vocabulary",
        "blurb": "A fixed list of whole words cannot anticipate every spelling a reader will encounter. Smaller reusable pieces can represent new combinations. Learning that vocabulary requires deciding which pieces are worth keeping and how to split text using them.",
        "concepts": [
          {
            "title": "Byte Pair Encoding",
            "href": "/concepts/byte-pair-encoding",
            "blurb": "Byte pair encoding builds reusable pieces by repeatedly merging frequent neighboring pairs. The learned merge order determines how new text is divided and which combinations share a vocabulary entry."
          },
          {
            "title": "WordPiece",
            "href": "/concepts/wordpiece",
            "blurb": "WordPiece represents text through reusable pieces and a longest-match encoding rule. The teaching implementation builds its vocabulary using pair scores, making the distinction between vocabulary learning and later encoding explicit."
          },
          {
            "title": "The Unigram Language Model",
            "href": "/concepts/the-unigram-language-model",
            "blurb": "A unigram tokenizer assigns probabilities to candidate pieces and compares complete segmentations. Vocabulary selection balances the available pieces against how well their combinations describe the observed text."
          },
          {
            "title": "SentencePiece",
            "href": "/concepts/sentencepiece",
            "blurb": "SentencePiece learns text pieces without requiring a separate word-splitting step first. Its explicit representation of whitespace affects how pieces join and how encoded text can be reconstructed."
          },
          {
            "title": "Greedy Coverage",
            "href": "/concepts/greedy-coverage",
            "blurb": "A limited vocabulary needs a rule for deciding which pieces deserve space. Greedy coverage selects pieces according to how much previously uncovered text they represent, producing different choices from repeated pair merging."
          },
          {
            "title": "Moving a Vocabulary",
            "href": "/concepts/moving-a-vocabulary",
            "blurb": "Vocabulary entries depend on the boundary rules that produced them. Moving pieces to another tokenization scheme can remove distinctions or make several entries map to the same representation."
          }
        ]
      },
      {
        "heading": "Word Structure",
        "blurb": "Related words often reuse parts that carry meaning or grammatical information. Those parts can be inferred from recurring patterns or described with explicit rules. Their boundaries need not match the pieces chosen simply to make a tokenizer's vocabulary smaller.",
        "concepts": [
          {
            "title": "Morfessor",
            "href": "/concepts/morfessor",
            "blurb": "Related words often reuse stems and endings. Morfessor searches for such reusable parts by balancing the cost of a stored vocabulary against the cost of describing the words with it."
          },
          {
            "title": "Finite-State Morphology",
            "href": "/concepts/finite-state-morphology",
            "blurb": "A word form can be described through its components and the spelling rules that connect them. Finite-state methods represent those relationships so word forms can be analyzed or generated."
          }
        ]
      },
      {
        "heading": "Fixed Tables and Shorter Sequences",
        "blurb": "Text representations have costs beyond the size of their vocabulary. Hashing shares a fixed table among character patterns, accepting possible collisions. Grouping bytes into patches can shorten the sequence, with a different trade-off in how local information is represented.",
        "concepts": [
          {
            "title": "Hashing Characters",
            "href": "/concepts/hashing-characters",
            "blurb": "Hashing maps characters into a fixed number of storage locations. It limits the table size, while collisions require different characters to share a location and potentially lose their distinction."
          },
          {
            "title": "Patching Without a Vocabulary",
            "href": "/concepts/patching-without-a-vocabulary",
            "blurb": "Representing text as bytes avoids dependence on a learned word vocabulary. Grouping nearby bytes into patches reduces the number of positions processed by later layers, changing how local information is combined."
          }
        ]
      },
      {
        "heading": "Codes for Numerical Inputs",
        "blurb": "Continuous measurements can be represented using a limited collection of codes. Quantization chooses which code stands for each input, making the representation discrete. The useful question is how much relevant information that replacement preserves.",
        "concepts": [
          {
            "title": "Codebook Quantization",
            "href": "/concepts/codebook-quantisation",
            "blurb": "A codebook replaces a continuous vector with an ID for a nearby representative. The number and placement of representatives determine the available codes and the error introduced by that replacement."
          },
          {
            "title": "Finite Scalar Quantization",
            "href": "/concepts/finite-scalar-quantisation",
            "blurb": "Finite scalar quantization restricts each coordinate to a small set of levels. Combining the coordinate choices produces a discrete code without selecting a whole vector from a learned codebook."
          }
        ]
      },
      {
        "heading": "Word Vectors from Counts",
        "blurb": "Words used in similar contexts provide evidence of related usage. Counts of those contexts can become numerical features, which we can weight or compress into vectors. Their similarities reflect the evidence and comparison rule used to construct them.",
        "concepts": [
          {
            "title": "A Vector for a Word",
            "href": "/concepts/a-vector-for-a-word",
            "blurb": "A token ID identifies an entry but does not describe its relationships to other entries. Learned vectors supply numerical coordinates whose comparisons can capture patterns in how words are used."
          },
          {
            "title": "Distance and Similarity",
            "href": "/concepts/distance-and-similarity",
            "blurb": "Vectors can be compared by the differences between their coordinates or by the angle between them. Those choices treat length differently and can change which words count as similar."
          },
          {
            "title": "Latent Semantic Analysis",
            "href": "/concepts/latent-semantic-analysis",
            "blurb": "A table of word use across documents can contain shared patterns. Latent semantic analysis keeps a smaller set of those patterns, representing words and documents with fewer coordinates."
          },
          {
            "title": "Pointwise Mutual Information",
            "href": "/concepts/pointwise-mutual-information",
            "blurb": "Frequent co-occurrence can arise simply because two words are common. Pointwise mutual information compares observed co-occurrence with the level expected under independence, distinguishing frequency from relative association."
          },
          {
            "title": "Random Indexing",
            "href": "/concepts/random-indexing",
            "blurb": "Random indexing accumulates fixed-size context vectors as word occurrences arrive. It summarizes relationships without storing every word-context count, with random projection affecting how precisely those relationships are preserved."
          }
        ]
      },
      {
        "heading": "Word Vectors from Prediction",
        "blurb": "Word vectors can be learned by predicting nearby words or fitting patterns in their co-occurrence counts. The shared coordinates capture relationships useful for that task. Their value depends on which aspects of word usage the training objective preserves.",
        "concepts": [
          {
            "title": "The Embedding Layer",
            "href": "/concepts/embedding-layers",
            "blurb": "An embedding layer maps each ID to a row in a table of vectors. Training changes those rows according to the task, while repeated occurrences of the same ID use the same learned representation."
          },
          {
            "title": "Word2vec",
            "href": "/concepts/word2vec",
            "blurb": "Word2vec learns word vectors through prediction tasks involving nearby words. Shared patterns of use shape the vectors, allowing their numerical relationships to reflect regularities in the training text."
          },
          {
            "title": "FastText",
            "href": "/concepts/fasttext",
            "blurb": "FastText represents words using character fragments as well as whole-word information. Shared fragments allow related spellings to contribute to each other's representations, including words with few observed occurrences."
          },
          {
            "title": "GloVe",
            "href": "/concepts/glove",
            "blurb": "GloVe learns vectors from word co-occurrence counts. Their comparisons are fitted to patterns in the counts, providing a compact representation of information drawn from the wider text collection."
          }
        ]
      },
      {
        "heading": "Representing Order and Context",
        "blurb": "A word's role depends on where it appears and the words around it. Position information makes order available to the model, while attention lets one position combine information from others. Both affect how a sequence is interpreted.",
        "concepts": [
          {
            "title": "Positional Encoding",
            "href": "/concepts/positional-encoding",
            "blurb": "Word order affects meaning, even when the words themselves stay the same. Positional information lets a model distinguish where tokens occur and use that order in its calculations."
          },
          {
            "title": "Attention",
            "href": "/concepts/attention",
            "blurb": "Attention calculates how strongly one position should combine information from other positions. Similarity scores become normalized weights, allowing the resulting representation to depend on the available context."
          }
        ]
      },
      {
        "heading": "Representing a Whole Text",
        "blurb": "Document search often needs one vector for an entire passage. Combining word vectors gives a simple representation, while learned document vectors provide another approach. Each method retains some information and loses other distinctions, including details of word order.",
        "concepts": [
          {
            "title": "Pooling a Text",
            "href": "/concepts/pooling-a-text",
            "blurb": "Pooling combines a sequence of token vectors into a single representation. The combination rule determines which information remains useful for comparing whole sentences and which details are lost."
          },
          {
            "title": "Paragraph Vectors",
            "href": "/concepts/paragraph-vectors",
            "blurb": "Paragraph vectors learn a representation of a document by using it to help predict its words. The document vector captures information that a fixed average of word vectors may not preserve."
          }
        ]
      }
    ]
  },
  {
    "title": "Large Language Models",
    "intro": "Language models learn to predict text from its context. Generating a response repeats that prediction process, with each new piece affecting what can follow. Attention determines how information from earlier parts of the context contributes to those predictions.",
    "topics": [
      {
        "heading": "Building a Language Model",
        "blurb": "A language model learns to predict tokens from their context. Transformer blocks combine attention with further learned calculations to produce those predictions. Defining which context is available matters because training must not expose the answer it asks the model to predict.",
        "concepts": [
          {
            "title": "Transformer Blocks",
            "blurb": "A transformer block combines attention with processing applied to individual positions. Residual connections and normalization regulate how those operations change the representations passed between blocks.",
            "href": "/concepts/transformer-blocks"
          },
          {
            "title": "Next-Token Prediction",
            "blurb": "Text provides examples of which tokens follow earlier tokens. Training a next-token model uses those continuations as targets while restricting each prediction to the preceding context.",
            "href": "/concepts/next-token-prediction"
          }
        ]
      },
      {
        "heading": "Generating Text",
        "blurb": "A next-token prediction gives a distribution of possible continuations. Generating a passage requires choosing from that distribution repeatedly as the context grows. Sampling rules change how often the model takes a less likely continuation and how varied the resulting text becomes.",
        "concepts": [
          {
            "title": "Autoregressive Generation",
            "blurb": "Autoregressive generation produces a sequence one token at a time. Each selected token becomes part of the context for the next prediction, so early choices influence the continuations that follow.",
            "href": "/concepts/autoregressive-generation"
          },
          {
            "title": "Sampling and Temperature",
            "blurb": "A language model assigns probabilities to possible next tokens. Sampling chooses among them, while temperature changes how concentrated those probabilities are without retraining the model.",
            "href": "/concepts/sampling-and-temperature"
          }
        ]
      }
    ]
  },
  {
    "title": "Generative Models",
    "intro": "Generative models learn patterns that allow them to produce new examples. Different methods represent those patterns through compressed descriptions, competing networks or gradual removal of noise. The quality of a generated result depends on what the model learned and how it is sampled.",
    "topics": [
      {
        "heading": "Learning a Compact Representation",
        "blurb": "Reconstructing an input from a smaller representation forces a model to decide what information to retain. Autoencoders learn through that reconstruction task. Adding a probability model to the representation provides a way to sample codes for generating new examples.",
        "concepts": [
          {
            "title": "Autoencoders",
            "blurb": "An autoencoder learns to reconstruct an input through an intermediate representation. Restricting that representation forces choices about which details to preserve, measured by the error in the reconstruction.",
            "href": "/concepts/autoencoders"
          },
          {
            "title": "Variational Autoencoders",
            "blurb": "A variational autoencoder learns a distribution of intermediate representations as well as a reconstruction procedure. Relating those representations to a prior distribution provides a basis for sampling codes that generate new examples.",
            "href": "/concepts/variational-autoencoders"
          }
        ]
      },
      {
        "heading": "Learning to Generate",
        "blurb": "A generative model needs feedback that tells it how to improve its outputs. Adversarial training learns through a discriminator comparing generated and real examples. Diffusion takes a different route by learning to reverse a process that adds noise.",
        "concepts": [
          {
            "title": "Generative Adversarial Networks",
            "blurb": "A generative adversarial network trains a generator against a model that distinguishes generated examples from training examples. The discriminator's changing responses provide feedback that shapes what the generator produces.",
            "href": "/concepts/generative-adversarial-networks"
          },
          {
            "title": "Diffusion Models",
            "blurb": "A diffusion model learns how to reverse controlled additions of noise. Repeating a learned reverse process from a noisy starting point provides a way to generate an example.",
            "href": "/concepts/diffusion-models"
          }
        ]
      }
    ]
  },
  {
    "title": "Adapting and Evaluating Modern Models",
    "intro": "A pretrained model can be adapted to a particular task through further training. Retrieved information can also change what it has available when answering. Evaluation needs to establish whether those changes improve the intended task and what failures remain.",
    "topics": [
      {
        "heading": "Adapting a Trained Model",
        "blurb": "A trained model can be adapted using examples of the behavior we want. Fine-tuning updates its parameters for that task, while low-rank adaptation restricts the form of the update. The training examples still determine what behavior those changes encourage.",
        "concepts": [
          {
            "title": "Supervised Fine-Tuning",
            "blurb": "Supervised fine-tuning adapts a model using examples of prompts and desired responses. The examples determine which response patterns are reinforced, so their coverage and quality affect the resulting behavior.",
            "href": "/concepts/supervised-fine-tuning"
          },
          {
            "title": "Low-Rank Adaptation",
            "blurb": "LoRA adapts a model by learning a smaller matrix-based correction while leaving the original weights fixed. This reduces the number of parameters updated and stored for a particular adaptation.",
            "href": "/concepts/low-rank-adaptation"
          },
          {
            "title": "Reinforcement Learning",
            "blurb": "Reinforcement learning improves a policy from the rewards associated with its actions. Delayed consequences make it necessary to consider how an action affects later states as well as its immediate result.",
            "href": "/concepts/reinforcement-learning"
          }
        ]
      },
      {
        "heading": "Grounding and Evaluation",
        "blurb": "A convincing answer needs evidence when its claims depend on external information. Retrieval can supply relevant material, but the resulting answer still needs evaluation. We need to check whether it used that evidence correctly and met the task's requirements.",
        "concepts": [
          {
            "title": "Retrieval-Augmented Generation",
            "blurb": "Retrieval-augmented generation supplies source material as context for a model's answer. It can provide information absent from training, while the usefulness of the answer still depends on what was retrieved and how the model uses it.",
            "href": "/concepts/retrieval-augmented-generation"
          },
          {
            "title": "Evaluating Generative Models",
            "blurb": "Generated content needs to be judged against the task it is meant to perform. Relevant evaluation cases and explicit criteria help distinguish a plausible-looking result from one that meets the requirements.",
            "href": "/concepts/evaluating-generative-models"
          }
        ]
      }
    ]
  }
];

const topicIntroductions: Record<string, string> = {
  "Functions and shared rules": "A function needs a clear purpose and an agreement with its callers. Descriptive names make that agreement easier to follow. When several operations depend on the same rule, keeping one definition prevents their behavior from drifting apart.",
  "Types and data boundaries": "Type hints describe the values a program expects. Missing information still needs a deliberate representation, and an annotation does not check incoming data by itself. Distinguish the agreement written for readers and tools from the validation that actually runs.",
  "Objects and interchangeable components": "A named record keeps related values together. An interface describes the behavior another part of the program needs. Combining small components can let us change one implementation without making its callers depend on its internal details.",
  "Validation and Failure Handling": "An invalid record should be identified before later work depends on it. Define what each field permits, then handle a rejected value where there is a useful response. Changes to shared objects and unfinished cleanup need the same care because their effects can outlast the failed operation.",
  "Checking behavior": "Tests need an expected result that comes from the problem rather than a copy of the implementation. Changed inputs and regression cases check what must remain true. Substitutes give tests control over an external dependency, while separate integration checks establish whether the real connection works.",
  "Organizing a project": "A program needs to run outside the directory and environment where it was first written. Explicit module boundaries and dependency records make its requirements visible. Keep configuration separate from the calculation so it can change without rewriting that calculation or embedding credentials in source.",
  "Checking a project": "Formatting and linting catch different problems from type checking and behavioral tests. Run the checks together while keeping their results distinct. A clean tool report is useful evidence about the properties that tool checks, not a guarantee that the program solves the right problem.",
  "Observing a running program": "A failed operation needs enough context to investigate without exposing the data it processed. Logs record those events. When a program is slow, a profile helps locate where the work is happening before we choose a change to measure.",
  "Databricks Fundamentals": "Databricks brings data processing and shared development into a managed platform. Understand where the data lives, how calculations run, and how tables and jobs connect that work. Then use those foundations to record a model experiment.",
  "Describing a model request": "Two programs need a shared agreement about the values they exchange. A model request must distinguish omitted information from an explicit null and retain the meaning of numerical fields. Changes to that agreement also need to account for older callers.",
  "Handling and testing tool outcomes": "A failed connection can leave the caller uncertain whether an operation happened. Error types and retry rules need to preserve that distinction. Interface tests should also check expected relationships between requests, beyond one successful example.",
  "Protecting the training process": "Training data gives its producer influence over a model's behavior. Keeping the source of records visible helps us investigate that influence. Tests also need to look for behaviors triggered by particular inputs that an ordinary evaluation might miss.",
  "Assessing exposure through prediction": "A prediction interface gives others ways to interact with a model. The risk depends on which inputs they can change and how many queries they can make. An experiment needs those limits stated before its results can support a claim about protection.",
  "Following a distributed calculation": "Spark describes a calculation before running its work across available workers. Some operations require records with matching keys to meet on the same worker. That movement, and an uneven distribution of keys, can determine how long the whole job takes.",
  "Keeping a dependable table history": "Changing records can change a training result even when its code stays the same. Table versions give each run a consistent view of its inputs. Repeated deliveries and older corrections also need rules that preserve which changes were actually committed.",
  "Publishing a pipeline result": "A quality check matters through the action taken when it fails. A pipeline can reject a record or stop an update, depending on the agreed policy. The published dataset should make that decision visible rather than silently admitting known failures.",
  "Connecting model evidence to an artifact": "A model score needs the dataset and evaluation procedure that produced it. MLflow records run information alongside saved model files, helping us connect a result to the actual candidate. Comparisons require that evidence before a lower error can justify a change.",
  "Making feature access explicit": "A feature must be both permitted and available for the decision using it. Access controls determine which process may read the data. Historical feature selection separately determines which recorded values could have been known at the time.",
  "When the answer arrives": "A language model first processes its prompt, then generates an answer over time. Those stages create different kinds of waiting. Reusing a previously processed prefix can reduce some work, provided the cached calculation matches the current request.",
  "Serving a changing workload": "Requests enter and leave a serving system while other answers are still being generated. Admission decisions need to account for the memory already in use and what each new request may require. Cancellation and test traffic also need clear limits on their effects.",
  "Following an estimate through time": "An estimate can use known movement to predict what happens between observations. A new reading then updates that prediction according to its uncertainty. Missing a reading should increase uncertainty about the state rather than imply that movement stopped.",
  "When observation and model disagree": "A plausible measurement may describe the wrong object, and a motion model may be wrong about how an object moves. Choosing which observations to use is separate from checking whether the estimate's reported uncertainty matches its actual errors.",
  "Where a fitted number can mislead": "Numerical results need interpretation as well as arithmetic. Intermediate values can overflow even when the intended answer is finite. A perfect fit can also leave several parameter choices equally plausible, so the reported numbers may say less than they appear to.",
  "Checking derivatives and simulated trajectories": "A claimed gradient can be compared with the effect of a small change in the actual calculation. Simulation steps can likewise be checked for numerical error. These comparisons help identify where an approximation needs more work, within the limits of the check itself.",
  "Keeping prediction code dependable": "Prediction code needs to preserve the meaning and order of its inputs. Fitted preprocessing also needs to retain the statistics learned during training. Making that state explicit helps prevent a new request from quietly changing the procedure being evaluated.",
  "Structures for agent workloads": "A useful data structure preserves the relationships a calculation depends on. Retrieval candidates need their scores attached to the right records. A workflow needs to represent which jobs depend on others before deciding what can run next.",
  "Building the training table": "Combining data requires accounting for what each part contributes. An average from a small file carries different weight from one based on many rows. Historical model inputs also need to respect when the underlying information became available.",
  "Repairing a changing pipeline": "An established pipeline needs an explicit response when incoming records break its assumptions. Validation and late-data rules determine which observations reach a result. Keeping input and code versions with that result makes later repairs possible to reproduce.",
  "Latency under real workloads": "A caller waits for the complete request, including time in a queue and any tool calls along the way. Faster processing of one stage can leave that total wait unchanged. Shared deadlines help each stage account for the time already spent.",
  "Memory and reuse": "Conversation state occupies memory for as long as the service retains it. Reusing an answer raises a different question: whether it still belongs to the current context. Both forms of reuse need explicit boundaries as requests and users change.",
  "Making predictions usable for motion": "A detected position belongs to a coordinate system and a measurement time. A controller needs to translate that position into its own frame and account for movement since observation. Otherwise, an accurate detection can still produce the wrong command.",
  "Closing the action loop": "Feedback uses the result of an earlier action to choose the next correction. The controller also needs to account for commands the actuator cannot carry out. Continuing to accumulate an impossible correction can make recovery worse when the system can respond again.",
  "Boundaries around learning systems": "Permission to use a record is separate from its relevance to a prediction. Released statistics can also reveal information about individuals, while loading a model file may execute code. The controls need to address the actual operation and what it can expose.",
  "Learning from a numerical world": "A simulation approximates how a system changes over time. Its time steps can introduce behavior absent from the system it represents. Comparing policies also requires shared scenarios, so differences in the generated experience do not obscure the effect of the policy.",
  "Checking a simulator against observations": "Measurements can help estimate unknown relationships inside a simulator. Agreement on those observations does not establish that the model works under other conditions. Testing changed settings helps reveal which assumptions a learned policy still depends on.",
  "Find the Mistakes Behind the Score": "An overall score combines mistakes that may have very different consequences. Individual errors and results for particular groups help explain what it hides. That evidence connects model evaluation to the cases and decisions the prediction is intended to support.",
  "Compare Revisions Fairly": "Comparing revisions on the same observations helps separate a model change from a change in the test cases. Repeatedly choosing the best score introduces another source of optimism. The selection procedure needs its own independent assessment.",
  "Repair the Evidence and the Behaviour": "A prediction failure can originate in the records or in how the application represents them. Some cases may need human review rather than an automatic answer. Behavioral checks help identify what a proposed repair changes and which failures remain.",
  "Build and Check a Model Revision": "A useful revision should repair an identified error without hiding damage elsewhere. A complete comparison keeps the original model as a reference and tests the changed procedure on fresh data. Acceptance requirements need to be set before those results are known.",
  "Choosing the Shape of the Records": "A database layout makes some requests easier than others. Looking up a value by its key differs from reading a complete history or producing a report. The requests we need to support provide a practical basis for choosing how to store the records.",
  "Keeping Related Records Together": "A document can keep related details available in one read. Shared facts that change independently may instead need their own records. Deciding which information belongs together also determines how many copies must be kept current.",
  "Working Inside Documents": "Nested fields need precise paths when we select or change them. Conditions on an array must keep values attached to the member they describe. Updates also need to preserve unrelated fields and check whether the record has changed since it was read.",
  "Finding and Summarising Documents": "Indexes help locate possible matches without inspecting every document. Later transformations still need to check the remaining conditions and preserve what each record represents. Expanding an array changes that meaning, which affects how a subsequent summary should count it.",
  "Partitioning for the Questions We Ask": "Dividing records among machines changes where a query must look and where requests concentrate. A useful partition key accounts for access patterns and uneven traffic. Histories may also need bounded time groups so one entity's records do not grow without limit.",
  "Reading and Writing Replicated Records": "Copies of a record can temporarily disagree, while competing writers can make decisions from the same old version. Read guarantees determine which observations an application may trust. Conditional writes and suitable merge rules address different kinds of conflicting change.",
  "Keeping Derived Data Repairable": "Stored summaries and older document formats need a clear relationship to their source records. Versions and retained history make changes interpretable and views rebuildable. Recovery also needs evidence from before a mistake, since replication can copy the mistake itself.",
  "Serving Model Data": "A model's input needs an agreed identity and feature definition, with values arranged in the expected order. Live lookups must account for stale or missing data. Historical training inputs separately need to reconstruct the information available at the time.",
  "Representing Connected Records": "A graph gives relationships a place alongside the entities they connect. Each connection needs a meaning and, where relevant, a direction. Clear entity identities prevent unrelated records from becoming connected simply because they share a name.",
  "Asking Questions of a Graph": "A graph query describes a pattern of connected records. Following its matches requires keeping the same entities bound together and knowing what each result row counts. Optional matches can retain a starting entity when an expected relationship is absent.",
  "Following Connections": "A graph search can ask which entities are reachable or which route has the lowest cost. Those questions require different procedures. Cycles need stopping rules, and a bound on exploration limits what the search can claim to have found.",
  "Maintaining a Graph": "A changing graph needs write rules that preserve identities and relationships. Imports must recognize repeated records, while concurrent edits need checks at the actual write. As the graph grows, query plans help explain the cost of following its connections.",
  "Shared Meaning and Evidence": "Combining graph records requires agreement about what their identifiers and statements mean. Keeping a claim attached to its source and applicable time lets us assess it later. Conflicting statements should remain visible rather than being settled by import order.",
  "Graphs in ML Systems": "Relationships can guide an assistant towards connected evidence that a document search alone might miss. That context still needs limits on access and time. Evaluation must establish whether following the extra connections actually improves the answer.",
  "Reading the Records": "A table stores records as rows, with columns describing the values each record contains. Selecting the relevant fields and filtering or ordering the rows turns those stored records into an answer to a particular question.",
  "Missing Values and Decisions": "A missing value represents information we do not have, rather than a measured zero. SQL comparisons involving that value can produce an unknown result, which affects filtering and the conditions used to assign a label.",
  "Summarising Maintenance Work": "An aggregate combines several records into a summary, such as a total or average. Grouping determines which records contribute to each result, while missing values and repeated rows can change what that summary means.",
  "Connecting Tables Without Changing the Question": "A join connects records using a relationship between their tables. One record can match several others, so the number of matches matters when interpreting missing records or calculating totals after the join.",
  "Queries Built from Queries": "A query can use another query's result as part of its calculation. Named intermediate results make complex questions easier to follow, including comparisons with a summary and searches through a hierarchy.",
  "Analysing Change Across Rows": "Window calculations compare related rows without replacing them with one summary record. Their ordering and boundaries determine which observations contribute to a running total or a comparison with an earlier measurement.",
  "Preparing Records for Analysis": "A stored value's format affects what a query can do with it. Dates need a consistent interpretation of time, while text searches and values inside nested records need rules that preserve their intended meaning.",
  "Features from Historical Data": "A historical training example needs the information available when its prediction would have been made. Event timestamps alone cannot establish that boundary when records arrive late or are corrected afterward.",
  "Designing Reliable Tables": "Table structure determines how records refer to one another and where a fact is stored. Keys and constraints enforce declared relationships, reducing contradictions and the number of places that must change when a fact changes.",
  "Changing Shared Data": "Related changes sometimes need to succeed together or leave the stored data unchanged. Transactions provide that grouping, while the handling of concurrent updates determines what happens when several people work on the same records.",
  "Making Queries Practical": "A query's execution plan describes how the database finds and combines its records. Indexes provide shortcuts to relevant rows, while parameterized inputs keep a user's search values separate from the SQL instructions being executed.",
  "Keeping Learning Data Trustworthy": "Dataset updates need to account for late records and corrections as well as new arrivals. Validation and a record of committed progress help prevent a refresh from silently changing the meaning or counting of its inputs.",
  "From an Answer to an Action": "An agent uses a model's output to choose another operation, such as requesting information from a tool. The program performs that operation and returns an observation that can affect the model's next decision.",
  "Teaching the Task Through Examples": "Examples in a prompt demonstrate which responses are acceptable under different conditions. The distinctions they show affect what the model is asked to imitate, so they need evaluation on requests beyond the examples themselves.",
  "Building Evaluation Cases": "An evaluation case describes a task and the conditions that count as success. For an agent, that includes the actions it may take and its response to missing information, alongside the final answer.",
  "Testing the Program Around the Model": "Controlled model responses let us test the program around an agent without relying on a live provider. These checks establish how the code handles its inputs and tools; the quality of a real model's answers needs separate evidence.",
  "Reviewing Answer Quality": "Some answer requirements can be checked exactly, while others require interpretation. A written set of criteria gives those judgments a common basis, and comparison with human review helps establish whether a model judge is dependable.",
  "Finding a Change Worth Making": "An incorrect answer can begin with missing evidence or a mistake later in the run. Tracing that failure and comparing isolated changes on the same tasks helps identify which repair actually affected the result.",
  "Deciding Whether to Release": "A candidate version can improve average performance while introducing a failure on an important task. Release requirements need to account for those individual failures and the resources needed to handle real requests.",
  "A Repair From Failure to Fresh Evidence": "A repair needs a connection to the failure it addresses and evidence from requests beyond that original example. Retaining earlier checks helps show whether the change also damaged behavior that was already useful.",
  "Giving the Model a Clear Job": "A model's instructions describe the task and the evidence it may use. An agreed response format lets another program inspect the answer, while factual support remains separate from whether the response has the right shape.",
  "Letting the Model Use Tools": "Tools let a model request information or propose an operation performed by another program. The application defines what each request accepts and may access, then uses returned results to decide whether more work is needed.",
  "Choosing How Much Autonomy to Give": "A fixed workflow chooses its route in code; an agent lets a model choose some steps from new observations. Comparing those approaches on the same tasks helps establish whether the additional freedom is useful.",
  "Building with Agent Frameworks": "Agent frameworks organize model calls and the work surrounding them. Pydantic AI and LangChain provide structures for tools and responses, while LangGraph makes saved state and the route between operations explicit.",
  "State and Permissions": "Saved state lets an application continue work after a pause, but it does not establish that the original permissions still apply. Approval needs to match the current action, including when its tools are supplied by another service.",
  "Guardrails at the Point of Action": "An agent's instructions can be redirected by content it reads, and a well-formed request can still be unauthorized. Checks where data is read or actions are performed determine which effects the application actually permits.",
  "Keeping an Agent Run Under Control": "A lost reply can leave an action's outcome unknown, while concurrent calls can compete for the same budget. Tracking intended actions and reserving unfinished work helps the application recover without repeating effects or exceeding its limits.",
  "Seeing What Happened": "Execution records connect an agent's answer to the operations and evidence that produced it. Their identities and timing help explain a failed or slow run and connect reported evaluation scores to the answers actually checked.",
  "Evaluating the Whole Agent": "An agent's usefulness depends on its actions as well as its final response. Representative cases and recorded failures provide a basis for comparing revisions, including behavior that an average answer score could hide.",
  "Testing and Operating the Boundaries": "A control can prevent misuse while also blocking legitimate work. Evaluating both effects gives a fuller account of its usefulness, and operating procedures determine how the system responds when a released agent crosses a limit.",
  "Deciding Where Authority Belongs": "An agent proposes actions, but the application determines which proposals can take effect. Placing controls at that point lets permissions remain enforceable even when the model produces an unexpected response.",
  "Working Safely with a Coding Agent": "A coding agent can change the tests and build instructions as well as the program. Independent checks and restricted execution help keep a repair reviewable, with evidence attached to the exact software being released.",
  "Connecting MCP Servers Deliberately": "The Model Context Protocol, or MCP, gives applications a shared interface to capabilities supplied by another program. Its identity and advertised tools still need review, and credentials must be intended for the service receiving them.",
  "Protecting Applications and Shared State": "An approved action can change before execution, and saved information can outlive its permissions. Checking the current action and limiting what a delegated worker inherits helps keep those changes from expanding its authority.",
  "Testing the Whole Boundary": "An agent's final refusal does not undo an action already performed. Evaluating the effects recorded by the receiving service reveals whether a control prevented the unwanted operation and whether legitimate work remains possible.",
  "Decisions Before Models": "A prediction becomes useful through the decision it informs. Defining that decision and comparing an existing rule with a proposed model establishes what improvement would justify the additional work.",
  "The Information We Can Use": "An input has a meaning and a time when it becomes available. Both belong in the system's requirements, because a historical record may describe an event the running application had not yet learned about.",
  "Throughput and Waiting": "Throughput describes how much work a system finishes over time, while waiting depends on what remains unfinished. The slowest processing stage and short bursts of demand can limit a service even when its average workload appears manageable.",
  "Memory and Communication": "A running model needs memory beyond its saved parameters, and remote processing adds time to transfer its inputs. Those demands affect whether computation belongs on a device or a server, especially when the connection is unavailable.",
  "Requirements and Trade-offs": "A requirement defines a limit the design must meet; a preference helps compare designs that meet those limits. Uncertain estimates can change that comparison, making some assumptions more important to investigate than others.",
  "Evidence Before Release": "A prototype can test a design assumption before the complete system is built. Its evidence is most useful when the comparison can change a decision and the design includes a response when its normal operation is unavailable.",
  "Bring the Design Together": "A service design needs evidence for its operating limits alongside the accuracy of its predictions. Connecting each requirement to a test shows which claims the prototype supports and which still require a realistic trial.",
  "Predicting the Next Observation": "A forecast estimates a value that has not yet been observed. Simple baseline predictions give later models something to improve on, while input windows define which earlier measurements are available for that prediction.",
  "Patterns That Repeat or Move": "A time series can contain repeating patterns and a changing underlying level. Separating those effects helps determine whether a forecast should reuse a past pattern or adjust to more recent observations.",
  "Fitting and Testing Forecasts": "A forecasting model learns relationships in earlier observations and uses them to predict later values. Repeated tests that move forward through time preserve the information boundary the model would face in use.",
  "Learning From Consequences": "Reinforcement learning uses feedback from actions to improve later choices. Some tasks reward each choice independently, while others let an action change the situation and opportunities the learner encounters next.",
  "Planning Beyond the Next Reward": "An action's value can depend on rewards that arrive after several later decisions. Returns summarize those consequences, allowing a learner to plan with a known transition model or estimate action values from experience.",
  "Describing What We Do Not Know": "A single estimate leaves out the other outcomes still consistent with limited evidence. Probability distributions describe those possibilities and provide a way to update an uncertain rate as new observations arrive.",
  "Combining Noisy Evidence": "Measurements with different reliability should not necessarily contribute equally to an estimate. Combining them requires assumptions about their errors and, for a changing system, how the underlying condition develops over time.",
  "Predictions as Distributions": "A prediction distribution describes possible values and the uncertainty remaining between observations. A rule for how measurements vary together allows evidence from observed locations to inform estimates at unmeasured ones.",
  "Making Parameter Updates": "A gradient describes how changes to a model's parameters affect its error locally. The update rule determines how that information becomes a step, including the effects of small batches and earlier updates.",
  "Understanding a Training Run": "A stalled training error can reflect the starting values or the calculation of an update, rather than insufficient time. Separate training and validation measurements help distinguish those problems from a model beginning to fit details that do not generalize.",
  "Choosing Useful Candidates": "A recommendation system selects items likely to be useful to a particular person. Popularity provides a starting point without personal history, while item descriptions offer information that does not depend on earlier interactions.",
  "Learning From Interaction Patterns": "People's recorded choices can reveal shared preferences that item descriptions leave out. Neighbor comparisons and compact representations of rating patterns use that evidence, while an absent rating must remain distinct from a dislike.",
  "Evaluating Recommendations": "A recommendation matters only if it reaches a useful position in the list shown to a reader. Ranking measures evaluate that ordering, and separate checks reveal how the system performs for people or items with little history.",
  "Recognising Unusual Records": "An observation is unusual relative to a reference, which may describe the whole dataset or its local neighbors. References less affected by extreme values help distinguish a meaningful deviation from a distorted comparison.",
  "Different Ways to Detect Unusualness": "Anomalies can appear as observations that are easy to separate or patterns a model reconstructs poorly. Those signals identify cases worth investigating without establishing that an unusual observation is a confirmed fault.",
  "Representing Relationships": "A graph records objects and the links between them, preserving relationships that separate rows can leave out. Following probability through those links gives one way to compare positions within the network.",
  "Learning Across Connections": "Connected objects can provide information about one another. Combining a node's measurements with those of its neighbors lets shared model operations use that context, including when estimating whether an unobserved connection is plausible.",
  "Asking What a Change Would Do": "Predicting an outcome does not establish what would happen if we changed its cause. Random assignment provides a way to compare interventions while reducing the influence of preexisting differences between groups on average.",
  "Working With Observational Evidence": "Comparisons from existing records depend on assumptions about why people received different treatments. Adjustment and weighting account for measured differences, but cannot create evidence where the data contain no comparable groups.",
  "From Training to a Repeatable Prediction": "A fitted model depends on the input preparation and feature meanings used during training. Saving that procedure with the model and validating incoming records helps keep later predictions consistent with those expectations.",
  "Running and Identifying a Model": "A prediction depends on a particular model version and its saved preparation. Keeping them together preserves that identity, while tests across individual and batched requests check whether the service applies the same calculation consistently.",
  "Maintaining the Prediction Service": "New data and later outcomes reveal different aspects of a running model. Changes in input distributions need to be distinguished from prediction errors and service failures before deciding which response is appropriate.",
  "Putting the Pieces Together": "A complete prediction project connects a useful question to a baseline and a fair evaluation. Sensor investigation, demand forecasting and image-based counting each expose different assumptions that need to remain visible when interpreting the result.",
  "Reasoning From Uncertain Evidence": "An observation can support several possible explanations. Probability connects that evidence to the groups it could have come from, helping interpret an alarm or compare rules that might have produced a recorded sequence.",
  "Learning From Limited Images": "Limited labeled images make it difficult to learn every visual pattern from scratch. Appropriate variations of training images can provide additional examples, while features learned on other images offer a different starting point.",
  "Finding and Counting Objects": "Object detection needs a location as well as a prediction that an object is present. Rectangles describe those locations, and their overlap helps identify several predictions that may refer to the same object.",
  "From a measurement to a calculation": "An array stores measurements in an ordered structure that supports numerical calculations. Its positions and shape need an agreed meaning so an operation combines the intended observations rather than merely producing a number.",
  "Working with whole arrays": "Array operations can select observations or apply one calculation across many values. Shapes and positions determine which entries work together, including when a shared reference is applied to every row.",
  "Calculations We Will Reuse": "Numerical models combine measurements into predictions and compare those predictions with observations. NumPy expresses these calculations over whole arrays, making the choice of rows and columns part of what each result means.",
  "Keep the Calculation Trustworthy": "A calculation needs a defined response to new inputs and enough recorded information to run it again. Numerical tolerances and controlled random choices help distinguish an expected difference from an implementation mistake.",
  "Can We Trust These Records?": "A record needs a clear identity before repeated entries or missing measurements can be interpreted. Preparation depends on what each row represents and whether an unusual value is plausible for that measurement.",
  "Representing What We Measured": "A numerical representation can introduce relationships that the original measurement did not have. Category labels need to avoid invented rankings, while repeating quantities such as time of day need to preserve their cyclic relationship.",
  "Keep Future Answers Out of Training": "Training inputs must reflect information available at prediction time, including during preparation. Evaluation also needs to account for rare outcomes, since a high overall score can hide poor performance on the cases that matter most.",
  "Establish a Fair Comparison": "A performance score needs a baseline and observations that represent a meaningful new test. Related examples and the amount of training data affect that comparison, so a held-out record is not automatically an independent one.",
  "From a Score to a Decision": "A predicted probability describes an estimated outcome, while an action also depends on its consequences. Checking whether probabilities match observed frequencies helps establish what those estimates can support before choosing a decision threshold.",
  "Know the Limits of the Result": "An estimated result depends on the sample used to calculate it and the population that sample represents. Sampling variation and changes in incoming data affect how confidently the conclusion can be carried into another setting.",
};

function addedTopics(section: string): Topic[] {
  const topics: Topic[] = [];
  for (const lesson of expandedNavigation.filter(lesson => lesson.section === section)) {
    let topic = topics.find(topic => topic.heading === lesson.topic);
    if (!topic) {
      topic = { heading: lesson.topic, blurb: topicIntroductions[lesson.topic], concepts: [] };
      topics.push(topic);
    }
    topic.concepts.push({ title: lesson.title, blurb: lesson.blurb, href: `/concepts/${lesson.id}` });
  }
  return topics;
}

const foundationCurriculum: Part[] = existingCurriculum.flatMap(part => {
  const extra = addedTopics(part.title);
  const newTopics = extra.filter(topic => !part.topics.some(existing => existing.heading === topic.heading));
  const before = newTopics.filter(topic => ["Can We Trust These Records?", "Establish a Fair Comparison"].includes(topic.heading));
  const after = newTopics.filter(topic => !before.includes(topic));
  const topics = part.topics.map(topic => {
    const additions = extra.find(added => added.heading === topic.heading)?.concepts ?? [];
    const retained = topic.concepts.filter(concept => concept.href !== "/concepts/reinforcement-learning");
    const concepts = topic.heading === "Classical Computer Vision" ? [...additions, ...retained] : [...retained, ...additions];
    return { ...topic, concepts };
  });
  const expanded = { ...part, topics: [...before, ...topics, ...after] };
  if (part.title === "Data Preparation") expanded.intro = "The way data is recorded affects what we can calculate from it. Missing values and inconsistent units need explicit treatment, while categories and dates need representations that preserve their meaning. Historical predictions also need the information that was available at the time.";
  if (part.title !== "Introductory Mathematics") return [expanded];
  return [expanded, {
    id: "python-and-numpy", title: "Python and NumPy",
    intro: "Python gives us ways to organize data and express calculations as reusable programs. NumPy works with numerical arrays, allowing the same operation to be applied across many values. Shapes and data types determine how those operations behave and what their results mean.",
    topics: addedTopics("Python and NumPy"),
  }];
});

const newSection = (title: string, intro: string): Part => ({ title, intro, topics: addedTopics(title) });
const pythonPracticeSections = [
  newSection("Python Design and Type Hints", "A program becomes harder to change when its rules are scattered or its inputs are unclear. Learn how names, function boundaries and type hints make those decisions explicit. Reuse a rule when it needs to stay consistent, and keep different responsibilities separate."),
  newSection("Python Validation and Error Handling", "Data arriving from a file or another program may not satisfy the assumptions in our code. Define what is required, validate it before processing and decide which failures the caller can handle. Pydantic checks structured records at runtime; explicit exceptions and resource cleanup control what happens when a check fails."),
  newSection("Python Testing and Project Tools", "A working example does not tell us how a program behaves when its inputs or dependencies change. Use tests to preserve that behavior, then organize the project so it can be run and checked elsewhere. Logging and profiling help investigate failures and performance problems with evidence."),
];
const databaseSections = [
  newSection("SQL", "SQL expresses questions about records stored in tables. Filtering and grouping describe which records matter, while joins connect information across tables. Reliable answers also depend on how the data is structured and how updates are kept consistent."),
  newSection("NoSQL", "Different ways of storing data make different questions easier to answer. Documents keep related details together, while key-based storage supports direct lookups. Dividing records across machines or maintaining several copies introduces further decisions about consistency and failure."),
  newSection("Graph Databases", "Graph databases store relationships as part of the data. Following those connections lets us ask about dependencies and routes across many records. The answers depend on consistent identities and a clear meaning for each relationship."),
];
const probabilitySection = newSection("Probabilistic Models and Uncertainty", "An uncertain quantity can have several plausible values. Probability distributions describe those possibilities, and new evidence changes how much support each receives. Predictions need to account for uncertainty in the estimated relationships as well as variation in observations.");
const modelEvaluationSection = newSection("Evaluating and Improving Models", "A single score can conceal the errors that matter most. Examining individual predictions and relevant groups helps identify what needs to change. A revision needs a fair comparison with the original and further evidence from cases that did not guide the repair.");
const optimisationSection = newSection("Optimisation and Training", "Training changes a model's parameters to reduce an error measure. The size and direction of each update affect whether that process makes progress. Derivative checks and training curves help distinguish a useful adjustment from numerical or fitting problems.");
const reinforcementSection = newSection("Reinforcement Learning", "An action changes what happens next and may receive its reward much later. Reinforcement learning uses that feedback to improve decisions over time. The available information determines whether we can plan from known consequences or need to learn them through experience.");
const reinforcementIntro = existingCurriculum.flatMap(part => part.topics).flatMap(topic => topic.concepts).find(concept => concept.href === "/concepts/reinforcement-learning")!;
reinforcementSection.topics[0].concepts.unshift(reinforcementIntro);

const canonicalCurriculum: Part[] = [
  ...foundationCurriculum.flatMap(part => part.title === "Python and NumPy" ? [part, ...pythonPracticeSections, ...databaseSections] : part.title === "Choosing and Checking a Model" ? [part, modelEvaluationSection, probabilitySection] : part.title === "Neural Networks" ? [part, optimisationSection] : [part]),
  newSection("Time Series and Forecasting", "Observations collected over time can contain trends and repeating patterns. Forecasts use the history available at a particular moment to estimate what comes next. A fair comparison must preserve that order and account for changes in the process being observed."),
  reinforcementSection,
  newSection("Recommendations and Ranking", "A recommendation system chooses which items someone is likely to find useful and in what order to show them. Item descriptions and patterns of interaction provide different kinds of evidence. Evaluation needs to consider the short list people actually see, including users and items with little history."),
  newSection("Anomaly Detection", "An unusual observation may indicate a fault or simply a condition that is uncommon in the data. Anomaly detection measures that departure from expected behavior. Its scores need an investigation rule, since an unusual result alone does not establish its cause."),
  newSection("Graphs and Relational Learning", "Relationships between records can carry information that their individual measurements leave out. Graph methods use those connections to describe structure or combine information from neighboring records. The direction and meaning of each connection affect what can be inferred."),
  newSection("Causal Inference and Experiments", "An association between two measurements does not establish what would happen if we changed one of them. Experiments and causal assumptions help distinguish the effect of an intervention from other differences between groups. Conclusions depend on how those groups were formed and what was measured."),
  newSection("Deploying and Maintaining Models", "A deployed prediction depends on its input preparation and surrounding software as well as the fitted model. Versioned artifacts and checks on incoming records help preserve that behavior. Later observations provide evidence about when the system needs to change or return to an earlier version."),
  newSection("Agents", "An agent uses a model to help choose its next action from the information available. Tools carry out permitted operations and return observations for subsequent decisions. Frameworks such as Pydantic AI, LangChain and LangGraph organize that process, while the application controls permissions and stopping conditions."),
  newSection("Prompting, Evaluation and Iteration", "Instructions and examples influence how an agent interprets a task. Recorded runs reveal which information and tool results led to an answer. Evaluations turn those observations into comparisons that help determine whether a revision improved the behavior we intended."),
  newSection("Agent Guardrails and Secure Development", "An agent's ability to write code or call tools can have effects outside its conversation. Enforced permissions and restricted execution define what those effects may be. Reviews and repeated-action checks need to preserve the same limits when work is retried or delegated."),
  newSection("Complete Projects", "A complete investigation connects a practical question to a repeatable procedure and evidence about its results. A simple baseline gives later changes a reference. Evaluation on separate examples and inspection of failures establish what the finished approach can support."),
  newSection("Define the ML Problem", "A useful system begins with the decision it is meant to support. Its requirements need to account for available information and what people can actually do with an answer. A learned model needs a reason to improve on simpler ways of making that decision."),
  newSection("Model the System Before Building It", "The time and memory a system needs depend on the whole procedure, including data preparation and waiting requests. Estimating those costs helps compare designs before building them. Local and remote processing introduce different limits on the same task."),
  newSection("Compare Designs Under Constraints", "A design has to satisfy the requirements that make it useful. Improving one measure may worsen another, so comparisons need explicit limits and a shared workload. Uncertain assumptions can change which designs remain practical."),
  newSection("Test the Design and Plan for Failure", "A design estimate needs evidence from a working implementation. Tests establish how it behaves under stated conditions, including inputs it cannot use. A defined fallback and a recovery plan determine what happens when the intended behavior is unavailable."),
  newSection("Software for Models and Agents", "Programs need to preserve the meaning of data as it moves between operations. Field order and retained settings can change a result even when the calculation still runs. Data structures also keep retrieved evidence associated with its source and jobs ordered by their dependencies."),
  newSection("Model and Tool API Contracts", "An interface defines what programs agree to exchange and what each value means. Missing information and failures need explicit responses. Compatible changes and behavior tests help preserve that agreement as callers and services evolve."),
  newSection("Data Pipelines for Learning", "A data pipeline turns incoming records into a dataset that can be used repeatedly. Its treatment of late arrivals and corrected information affects what the dataset represents. Preserved history makes it possible to explain which records contributed to a result."),
  newSection("Introduction to Databricks", "Databricks is a managed platform for working with data and the programs that use it. Learn what the platform provides, why it was developed, and how data lakes, Spark and its shared workspace fit together. Follow a dataset from stored files to a repeatable job and a recorded model experiment."),
  newSection("Databricks for ML Pipelines", "A data pipeline needs to preserve what its records mean as files arrive and calculations are repeated. Use Spark query plans, Delta table histories and recorded model runs to inspect that work. Changes to execution or data should remain visible in the result's history."),
  newSection("Serving Models and Agent Runs", "Concurrent requests share computing time and memory. Waiting in a queue and calling another service both contribute to the user's response time. Reusing an earlier result helps only when its data and permissions still apply to the current request."),
  newSection("LLM Inference and Capacity", "A language model processes its prompt before generating an answer piece by piece. Those stages use computing resources differently, and each active conversation occupies memory. Scheduling and safe reuse of earlier calculations affect how many requests the system can handle."),
  newSection("From Learned Perception to Control", "A position measurement refers to a particular coordinate system and moment in time. Using it to guide movement requires accounting for both. Repeated observations correct the next action, while limits on physical movement affect how the controller should respond."),
  newSection("Estimating State from Noisy Observations", "Measurements can be inaccurate or temporarily unavailable. A state estimate combines observations with an account of how the system moves between them. Its reported uncertainty needs to reflect the errors it actually makes, including mistaken assumptions about motion."),
  newSection("Protecting ML Data and Artifacts", "Useful information can still be private, and a downloaded file can contain executable code. Access checks and careful artifact handling address different risks. Privacy calculations also need to account for how much an individual's contribution can affect a released result."),
  newSection("Threats Across the ML Lifecycle", "Changes to training records can alter a model's behavior, including responses triggered by particular inputs. A prediction service can also reveal information through repeated use. Investigating either risk requires a clear account of what an attacker can change or observe."),
  newSection("Simulating and Learning System Behaviour", "A simulation uses calculations to represent how a system changes. Its assumptions and numerical steps affect the experiences it produces. Comparisons with observations and tests under different conditions help establish what decisions those experiences can support."),
  newSection("Numerical Methods for Learning", "Computers represent numbers with limited precision. Calculations can overflow or lose useful information even when their formulas are correct. Numerical checks and well-chosen simulation steps help distinguish those errors from problems in the relationships being fitted."),
];

// Authored section names remain stable matching keys for generated lessons.
// Visible titles can change without changing their URLs or saved-work keys.
export const SECTION_TITLE_REVISIONS: Record<string, string> = {
  "Start with a Prediction": "Introduction to Predictive Models",
  "Choosing and Checking a Model": "Model Selection and Evaluation",
  "Optimisation and Training": "Optimization and Training",
  "Adapting and Evaluating Modern Models": "Model Adaptation and Evaluation",
  "Agents": "AI Agents",
  "Prompting, Evaluation and Iteration": "Agent Prompting and Evaluation",
  "Complete Projects": "Applied Machine Learning Projects",
  "Define the ML Problem": "Problem Definition and Requirements",
  "Model the System Before Building It": "System Capacity and Resource Limits",
  "Compare Designs Under Constraints": "Design Constraints and Tradeoffs",
  "Test the Design and Plan for Failure": "Prototyping and Failure Handling",
  "Software for Models and Agents": "Data Structures and Program State",
  "Data Pipelines for Learning": "Data Pipelines",
  "Databricks for ML Pipelines": "Data Pipelines with Databricks",
  "Serving Models and Agent Runs": "Serving Models and Agents",
  "From Learned Perception to Control": "Robot Perception and Control",
  "Estimating State from Noisy Observations": "State Estimation and Tracking",
  "Protecting ML Data and Artifacts": "Data Privacy and Model Security",
  "Threats Across the ML Lifecycle": "Attacks on Training Data and Models",
  "Simulating and Learning System Behaviour": "Simulating Physical Systems",
  "Numerical Methods for Learning": "Numerical Methods for Modeling",
};
export const displaySectionTitle = (title: string): string => SECTION_TITLE_REVISIONS[title] ?? title;
export const TOPIC_TITLE_REVISIONS: Record<string, string> = {
  "Reasoning From Uncertain Evidence": "Conditional Probability and Likelihood",
  "From a measurement to a calculation": "NumPy Array Fundamentals",
  "Calculations We Will Reuse": "Array Calculations and Linear Algebra",
  "Keep the Calculation Trustworthy": "Testing and Reproducing Calculations",
  "Reading the Records": "Reading Tables with SQL",
  "Missing Values and Decisions": "Missing Values and CASE Expressions",
  "Summarising Maintenance Work": "Aggregation and Grouping",
  "Connecting Tables Without Changing the Question": "Joining Tables",
  "Analysing Change Across Rows": "Window Functions",
  "Preparing Records for Analysis": "Dates, Text, and JSON",
  "Designing Reliable Tables": "Table Design and Normalization",
  "Changing Shared Data": "Updates and Transactions",
  "Making Queries Practical": "Query Performance and Security",
  "Keeping Learning Data Trustworthy": "Data Quality and Incremental Updates",
  "Choosing the Shape of the Records": "Data Models and Key-Based Lookups",
  "Keeping Related Records Together": "Documents and References",
  "Working Inside Documents": "Querying and Updating Documents",
  "Finding and Summarising Documents": "Document Indexes and Aggregation",
  "Partitioning for the Questions We Ask": "Partition Keys and Data Distribution",
  "Keeping Derived Data Repairable": "Derived Views and Data Recovery",
  "Representing Connected Records": "Graph Data Models and Entity Identity",
  "Asking Questions of a Graph": "Graph Pattern Queries",
  "Following Connections": "Graph Traversal and Shortest Paths",
  "Shared Meaning and Evidence": "RDF and Data Provenance",
  "Graphs in ML Systems": "Graph-Based Retrieval",
  "Start with a Prediction": "Introduction to Predictive Models",
  "Can We Trust These Records?": "Record Quality and Missing Values",
  "Centres and Scales": "Centering and Scaling",
  "Representing What We Measured": "Encoding Categories and Cycles",
  "Keep Future Answers Out of Training": "Data Leakage and Class Imbalance",
  "Sequences": "Markov Chains",
  "Establish a Fair Comparison": "Baselines and Validation",
  "Choosing and Checking a Model": "Pipelines and Model Selection",
  "From a Score to a Decision": "Probability Calibration and Decision Thresholds",
  "Know the Limits of the Result": "Distribution Shift and Sampling Uncertainty",
  "Find the Mistakes Behind the Score": "Error Analysis",
  "Repair the Evidence and the Behaviour": "Data Quality and Model Behavior Tests",
  "Build and Check a Model Revision": "Model Improvement Project",
  "Describing What We Do Not Know": "Probability Distributions and Parameter Uncertainty",
  "Combining Noisy Evidence": "Sensor Fusion and Hidden-State Filtering",
  "Predictions as Distributions": "Gaussian Process Regression",
  "Regularisation and Normalisation": "Regularization and Normalization",
  "Other Ways to Learn and Store Patterns": "Unsupervised Neural Networks",
  "Additional Network Layers": "Recurrent, Radial Basis, and Residual Networks",
  "Understanding a Training Run": "Initialization and Training Diagnostics",
  "Embedding Pictures": "Image Embeddings and Similarity Search",
  "Learning From Limited Images": "Image Augmentation and Transfer Learning",
  "Finding and Counting Objects": "Bounding Boxes and Non-Maximum Suppression",
  "Tokens and Basic Units": "Tokens and Text Encoding",
  "Rules for Word Boundaries": "Rule-Based Tokenization",
  "Scripts Without Spaces": "Word Segmentation",
  "Predicting Token Sequences": "N-Gram Language Models",
  "Fixed Tables and Shorter Sequences": "Hashing and Byte Patching",
  "Codes for Numerical Inputs": "Quantizing Numerical Inputs",
  "Word Vectors from Prediction": "Learning Word Embeddings",
  "Representing a Whole Text": "Document Vectors",
  "Learning a Compact Representation": "Autoencoders",
  "Learning to Generate": "Adversarial and Diffusion Models",
  "Adapting a Trained Model": "Fine-Tuning and Low-Rank Adaptation",
  "Grounding and Evaluation": "Retrieval-Augmented Generation and Evaluation",
  "Predicting the Next Observation": "Forecasting Baselines and Lagged Inputs",
  "Patterns That Repeat or Move": "Seasonality and Smoothing",
  "Learning From Consequences": "Actions and Exploration",
  "Planning Beyond the Next Reward": "Planning and Learning Action Values",
  "Choosing Useful Candidates": "Popularity and Content-Based Recommendations",
  "Learning From Interaction Patterns": "Collaborative Filtering and Matrix Factorization",
  "Recognising Unusual Records": "Global and Local Anomaly Scores",
  "Different Ways to Detect Unusualness": "Isolation Forests and Reconstruction Errors",
  "Representing Relationships": "Graph Representations and Random Walks",
  "Learning Across Connections": "Graph Neural Networks and Link Prediction",
  "Asking What a Change Would Do": "Causal Effects and Randomized Experiments",
  "Working With Observational Evidence": "Causal Inference from Observational Data",
  "From Training to a Repeatable Prediction": "Saving Models and Validating Inputs",
  "Running and Identifying a Model": "Serving and Versioning Models",
  "Putting the Pieces Together": "Applied Prediction Projects",
  "From an Answer to an Action": "Agent Fundamentals",
  "Giving the Model a Clear Job": "Agent Prompts and Structured Responses",
  "Letting the Model Use Tools": "Tool Calling and Retrieval",
  "Choosing How Much Autonomy to Give": "Agents and Fixed Workflows",
  "Guardrails at the Point of Action": "Agent Security Controls",
  "Keeping an Agent Run Under Control": "Agent Retries and Resource Budgets",
  "Teaching the Task Through Examples": "Examples in Prompts",
  "Seeing What Happened": "Agent Tracing and Observability",
  "Testing the Program Around the Model": "Testing Agent Code",
  "Finding a Change Worth Making": "Error Analysis and Controlled Experiments",
  "Deciding Whether to Release": "Agent Release Criteria",
  "Testing and Operating the Boundaries": "Guardrail Testing and Incident Response",
  "A Repair From Failure to Fresh Evidence": "Agent Evaluation Project",
  "Deciding Where Authority Belongs": "Permission Enforcement",
  "Connecting MCP Servers Deliberately": "MCP Server Trust and Authentication",
  "Protecting Applications and Shared State": "Action Approvals and Agent Delegation",
  "Testing the Whole Boundary": "Agent Security Testing",
  "Decisions Before Models": "Problem Definition and Baselines",
  "The Information We Can Use": "Information Available at Decision Time",
  "Evidence Before Release": "Prototype Tests and Fallbacks",
  "Bring the Design Together": "Design Review Project",
  "Keeping prediction code dependable": "Prediction Inputs and Preprocessing State",
  "Structures for agent workloads": "Data Structures for Retrieval and Workflows",
  "Describing a model request": "Request Schemas and Compatibility",
  "Handling and testing tool outcomes": "Tool Errors and API Tests",
  "Building the training table": "Combining Files and Historical Features",
  "Repairing a changing pipeline": "Validating and Tracking Pipeline Inputs",
  "Following a distributed calculation": "Spark Query Plans and Data Skew",
  "Keeping a dependable table history": "Table Versions and Incremental Ingestion",
  "Publishing a pipeline result": "Pipeline Data Quality Checks",
  "Connecting model evidence to an artifact": "MLflow Dataset and Model Lineage",
  "Making feature access explicit": "Feature Access and Historical Availability",
  "Latency under real workloads": "Request Latency and Deadlines",
  "Memory and reuse": "Conversation Memory and Response Caching",
  "When the answer arrives": "LLM Generation and Prefix Caching",
  "Serving a changing workload": "Scheduling and Isolating LLM Requests",
  "Making predictions usable for motion": "Coordinate Frames and Measurement Timing",
  "Closing the action loop": "Feedback Control and Actuator Limits",
  "Following an estimate through time": "State Prediction and Measurement Updates",
  "When observation and model disagree": "Matching Measurements and Checking Uncertainty",
  "Boundaries around learning systems": "Data Privacy and Model File Security",
  "Protecting the training process": "Training Data Provenance and Backdoors",
  "Assessing exposure through prediction": "Adversarial Inputs and Prediction API Security",
  "Learning from a numerical world": "Simulation Time Steps and Policy Comparisons",
  "Where a fitted number can mislead": "Numerical Stability and Parameter Identifiability",
  "Representing Order and Context": "Positional Encoding and Attention",
  "Compare Revisions Fairly": "Comparing Model Revisions",
  "Throughput and Waiting": "Throughput and Queues"
};
export const displayTopicTitle = (title: string): string => TOPIC_TITLE_REVISIONS[title] ?? title;
const originalTitleId = (title: string): string => title.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const CURRICULUM: Part[] = canonicalCurriculum.map(part => {
  const title = displaySectionTitle(part.title);
  return {
    ...part,
    id: part.id ?? originalTitleId(part.title),
    title,
    topics: part.topics.map(topic => ({
      ...topic,
      id: topic.id ?? originalTitleId(topic.heading),
      heading: TOPIC_TITLE_REVISIONS[topic.heading] ?? (topic.heading === part.title ? title : topic.heading),
    })),
  };
});
