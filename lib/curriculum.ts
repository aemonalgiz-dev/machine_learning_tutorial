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
export const CURRICULUM: Part[] = [
  {
    "id": "mathematics-as-needed",
    "title": "Introductory Mathematics",
    "intro": "Begin with statistics, linear algebra, and calculus. Build the mathematical ideas from small examples, then return to these primers as the later lessons need them.",
    "topics": [
      {
        "heading": "Introductory Mathematics",
        "blurb": "",
        "concepts": [
          {
            "title": "Statistics & Probability Primer",
            "href": "/primers/statistics",
            "blurb": "Describe a sample, compare variables, and separate the observed pattern from uncertainty about new data."
          },
          {
            "title": "Linear Algebra Primer",
            "href": "/primers/linear-algebra",
            "blurb": "Build vectors and matrices from small examples, then use them to describe model calculations."
          },
          {
            "title": "Calculus Primer",
            "href": "/primers/calculus",
            "blurb": "Build derivatives from changes you can measure, then use them to guide small improvements."
          }
        ]
      }
    ]
  },
  {
    "title": "Start with a Prediction",
    "intro": "Begin with one small model, then ask whether its predictions deserve to be trusted. These four lessons introduce inputs, fitting, evaluation, and classification through examples.",
    "topics": [
      {
        "heading": "Start with a Prediction",
        "blurb": "",
        "concepts": [
          {
            "title": "Simple Linear Regression",
            "href": "/concepts/simple-linear-regression",
            "blurb": "Use height to predict weight, then work out what makes one line fit better than another."
          },
          {
            "title": "Held-Out Evaluation",
            "href": "/concepts/held-out-evaluation",
            "blurb": "Judge predictions on examples excluded from fitting, then examine how much that score can tell us."
          },
          {
            "title": "Logistic Regression",
            "href": "/concepts/logistic-regression",
            "blurb": "Turn measurements into a probability, then choose how that probability becomes a decision."
          },
          {
            "title": "Judging a Classifier",
            "href": "/concepts/judging-a-classifier",
            "blurb": "Count different kinds of classification mistakes and connect them to the decision you need to make."
          }
        ]
      }
    ]
  },
  {
    "title": "Data Preparation",
    "intro": "Before choosing a more complicated model, look at what its input numbers represent. Change the reference point, compare scales, and construct useful features.",
    "topics": [
      {
        "heading": "Centres and Scales",
        "blurb": "Start with subtraction, then division, then compare alternative transformations.",
        "concepts": [
          {
            "title": "Centring on the Mean",
            "href": "/concepts/centring-on-the-mean",
            "blurb": "Subtract each feature's mean and measure values relative to the average observation."
          },
          {
            "title": "The Standard Score",
            "href": "/concepts/the-standard-score",
            "blurb": "Express a value as a number of standard deviations above or below the training mean."
          },
          {
            "title": "Feature Scaling",
            "href": "/concepts/feature-scaling",
            "blurb": "Put feature values on suitable scales and see which models notice the change."
          }
        ]
      },
      {
        "heading": "Constructing and Reducing Features",
        "blurb": "Build extra inputs when they help, or preserve the useful variation with fewer coordinates.",
        "concepts": [
          {
            "title": "Polynomial Features",
            "href": "/concepts/polynomial-features",
            "blurb": "Build powers and products of inputs so a linear model can represent curved relationships."
          },
          {
            "title": "Principal Component Analysis",
            "href": "/concepts/pca",
            "blurb": "Find directions that preserve as much variation as possible when you use fewer coordinates."
          }
        ]
      }
    ]
  },
  {
    "title": "Classical Machine Learning",
    "intro": "Build on the first prediction lessons with several inputs, different decision rules, and groups of models. Then apply classical methods to pictures through matching, image features, and learned detectors.",
    "topics": [
      {
        "heading": "Distance",
        "blurb": "Define nearness before using it to choose neighbours or form groups.",
        "concepts": [
          {
            "title": "What Near Means",
            "href": "/concepts/distance-metrics",
            "blurb": "Compare distance rules and see how their definitions change a model's neighbours and groups."
          }
        ]
      },
      {
        "heading": "Regression",
        "blurb": "Extend the line, learn its settings by iteration, and control its flexibility.",
        "concepts": [
          {
            "title": "Multiple & Polynomial Regression",
            "href": "/concepts/multiple-polynomial-regression",
            "blurb": "Add more measurements or curved features while keeping the same idea of fitting coefficients."
          },
          {
            "title": "Fitting by Walking",
            "href": "/concepts/gradient-descent-regression",
            "blurb": "Improve a fitted line one small adjustment at a time, using the slope of its error."
          },
          {
            "title": "Ridge & Lasso",
            "href": "/concepts/ridge-lasso",
            "blurb": "Limit the size of a model's coefficients and examine the trade between fitting and overfitting."
          }
        ]
      },
      {
        "heading": "Classification",
        "blurb": "Compare local votes, decision trees, and predictions over several categories.",
        "concepts": [
          {
            "title": "k-Nearest Neighbours",
            "href": "/concepts/k-nearest-neighbours",
            "blurb": "Store labelled examples, find the nearest ones, and use their answers to predict a new case."
          },
          {
            "title": "Decision Trees",
            "href": "/concepts/decision-trees",
            "blurb": "Build a prediction from a sequence of yes-or-no questions chosen from the data."
          },
          {
            "title": "More Than Two Classes",
            "href": "/concepts/multiclass-classification",
            "blurb": "Compare ways to assign one of several categories, and see how their scores become predictions."
          }
        ]
      },
      {
        "heading": "Ensembles",
        "blurb": "Combine trees by voting or by fitting successive corrections.",
        "concepts": [
          {
            "title": "Bagging",
            "href": "/concepts/bagging",
            "blurb": "Fit models to different resamples of the same data, then combine their predictions."
          },
          {
            "title": "Random Forests",
            "href": "/concepts/random-forests",
            "blurb": "Give each tree different feature choices so their combined prediction depends less on the same few splits."
          },
          {
            "title": "Gradient Boosting",
            "href": "/concepts/gradient-boosting",
            "blurb": "Build a prediction in stages, with each small tree correcting the errors that remain."
          }
        ]
      },
      {
        "heading": "Clustering",
        "blurb": "Find groups when no target labels have been supplied.",
        "concepts": [
          {
            "title": "k-Means Clustering",
            "href": "/concepts/k-means",
            "blurb": "Alternate between assigning points to nearby centres and moving each centre to its group's mean."
          }
        ]
      },
      {
        "heading": "Kernels",
        "blurb": "Use transformed features through pairwise comparisons.",
        "concepts": [
          {
            "title": "The Kernel Trick",
            "href": "/concepts/kernel-trick",
            "blurb": "Use a kernel to work with transformed features through pairwise comparisons."
          },
          {
            "title": "Kernel Ridge Regression",
            "href": "/concepts/kernel-ridge",
            "blurb": "Rewrite ridge regression around training examples, then replace dot products with a kernel."
          },
          {
            "title": "Kernel Principal Components",
            "href": "/concepts/kernel-pca",
            "blurb": "Apply PCA through a kernel to describe variation in a transformed feature space."
          }
        ]
      },
      {
        "heading": "Sequences",
        "blurb": "Introduce limited memory before using it in language models.",
        "concepts": [
          {
            "title": "Markov Chains",
            "href": "/concepts/markov-chains",
            "blurb": "Model the next state using the current one, then follow the consequences over several steps."
          }
        ]
      },
      {
        "heading": "Classical Computer Vision",
        "blurb": "Find a known pattern in a picture, describe its edges and distinctive points, then train a detector. Start with fixed image measurements before learning from labeled examples.",
        "concepts": [
          {
            "title": "Filters and Edges",
            "href": "/concepts/filters-and-edges",
            "blurb": "Use small image filters to measure local changes in brightness."
          },
          {
            "title": "Template Matching",
            "href": "/concepts/template-matching",
            "blurb": "Slide a known template over an image and compare the match score at each position."
          },
          {
            "title": "Histogram of Oriented Gradients",
            "href": "/concepts/histogram-of-oriented-gradients",
            "blurb": "Describe a picture by counting local directions of brightness change, then reduce sensitivity to contrast."
          },
          {
            "title": "Keypoints and Descriptors",
            "href": "/concepts/keypoints-and-descriptors",
            "blurb": "Locate distinctive image points, describe their neighbourhoods, and match them between pictures."
          },
          {
            "title": "Image Alignment",
            "href": "/concepts/image-alignment",
            "blurb": "Give each keypoint a direction so its description survives a turn, match the descriptions, and recover the camera's move from the matches."
          },
          {
            "title": "Haar Cascades",
            "href": "/concepts/haar-cascades",
            "blurb": "Use cheap rectangular features and staged decisions to search an image efficiently."
          }
        ],
        "id": "classical-methods"
      }
    ]
  },
  {
    "title": "Choosing and Checking a Model",
    "intro": "Keep transformations inside the evaluation procedure, compare candidate settings, and inspect what the selected model relies on. The final test remains separate from those choices.",
    "topics": [
      {
        "heading": "Choosing and Checking a Model",
        "blurb": "",
        "concepts": [
          {
            "title": "Pipelines",
            "href": "/concepts/pipelines",
            "blurb": "Keep preprocessing and prediction together so each training split learns its own transformations."
          },
          {
            "title": "Searching for a Setting",
            "href": "/concepts/grid-search",
            "blurb": "Compare candidate settings with cross-validation, then evaluate the selected model on a separate test set."
          },
          {
            "title": "Which Feature Mattered",
            "href": "/concepts/feature-importance",
            "blurb": "Compare split-based and permutation importance, and learn what each can say about a fitted model."
          }
        ]
      }
    ]
  },
  {
    "title": "Neural Networks",
    "intro": "Calculate one neuron, combine neurons into layers, and then train the resulting network. The order follows a prediction forward before following its gradients back.",
    "topics": [
      {
        "heading": "Neurons and Layers",
        "blurb": "Start with a weighted sum and make the connections between layers explicit.",
        "concepts": [
          {
            "title": "A Neuron",
            "href": "/concepts/neurons-and-activations",
            "blurb": "Build one artificial neuron from inputs, weights, a bias, and an activation function."
          },
          {
            "title": "A Dense Layer and the Forward Pass",
            "href": "/concepts/dense-layers",
            "blurb": "Group neurons into a layer and pass their outputs to the next layer."
          },
          {
            "title": "The Shape Guarantee",
            "href": "/concepts/shapes-and-flattening",
            "blurb": "Track how each layer arranges its inputs and outputs, and make reshaping explicit."
          }
        ]
      },
      {
        "heading": "Training",
        "blurb": "Choose a loss, calculate its gradients, and repeat the updates.",
        "concepts": [
          {
            "title": "Loss Functions",
            "href": "/concepts/loss-functions",
            "blurb": "Choose a numerical cost for prediction errors and see how the choice changes learning."
          },
          {
            "title": "Backpropagation",
            "href": "/concepts/backpropagation",
            "blurb": "Trace how each weight affects the loss, then use those gradients to improve the network."
          },
          {
            "title": "Training a Small Network",
            "href": "/concepts/training-a-network",
            "blurb": "Repeat prediction, gradient calculation, and updates while checking what the model learns."
          }
        ]
      },
      {
        "heading": "Regularisation and Normalisation",
        "blurb": "Examine how masking and internal rescaling change training.",
        "concepts": [
          {
            "title": "Dropout",
            "href": "/concepts/dropout",
            "blurb": "Randomly mask activations during training and measure whether the network generalises better."
          },
          {
            "title": "Normalisation Layers",
            "href": "/concepts/normalisation-layers",
            "blurb": "Compare ways to control scales inside a network, including batch, layer, RMS, and weight normalisation."
          }
        ]
      },
      {
        "heading": "Other Ways to Learn and Store Patterns",
        "blurb": "Explore associative memory, hidden representations, maps, and local learning rules after the basic network vocabulary.",
        "concepts": [
          {
            "title": "Hopfield Networks",
            "href": "/concepts/hopfield-network",
            "blurb": "Store patterns in a network and update its cells to retrieve a stable pattern."
          },
          {
            "title": "Restricted Boltzmann Machines",
            "href": "/concepts/restricted-boltzmann-machine",
            "blurb": "Use visible and hidden units to model patterns and reconstruct incomplete inputs."
          },
          {
            "title": "Self-Organising Maps",
            "href": "/concepts/self-organising-map",
            "blurb": "Arrange representative vectors on a grid and update nearby grid cells together."
          },
          {
            "title": "Hebbian Principal Components",
            "href": "/concepts/hebbian-pca",
            "blurb": "Use Oja's learning rule to approach the leading principal component through repeated local updates."
          }
        ]
      },
      {
        "heading": "Additional Network Layers",
        "blurb": "Respond to nearby examples, carry information through a sequence, and learn adjustments to an existing representation.",
        "concepts": [
          {
            "title": "Recurrent Layers",
            "href": "/concepts/recurrent-layers",
            "blurb": "Carry information through a sequence, then use LSTM and GRU gates to control what is retained."
          },
          {
            "title": "Radial Basis Networks",
            "href": "/concepts/radial-basis-networks",
            "blurb": "Describe local regions with centres and widths, then learn how their responses contribute to a prediction."
          },
          {
            "title": "Residual Connections",
            "href": "/concepts/residual-connections",
            "blurb": "Preserve a representation while a layer learns an adjustment to it."
          }
        ]
      }
    ]
  },
  {
    "title": "Computer Vision with Neural Networks",
    "intro": "Build on the image measurements introduced in Classical Computer Vision. Learn useful filters from labeled examples, use them to label pictures or pixels, and compare pictures through learned vectors.",
    "topics": [
      {
        "heading": "Spatial Layers",
        "blurb": "Learn how a network shares local weights and summarises nearby responses.",
        "concepts": [
          {
            "title": "Convolution",
            "href": "/concepts/convolution",
            "blurb": "Slide a small set of shared weights across a picture to produce a map of responses."
          },
          {
            "title": "Pooling",
            "href": "/concepts/pooling",
            "blurb": "Replace each small window with a maximum or an average and inspect the information lost."
          }
        ]
      },
      {
        "heading": "Convolutional Networks",
        "blurb": "Assemble the layers into a classifier and then a model that labels every pixel.",
        "concepts": [
          {
            "title": "Convolutional Networks",
            "href": "/concepts/convolutional-networks",
            "blurb": "Combine convolution, activation, pooling, and a classifier into a trainable image model."
          },
          {
            "title": "U-Net",
            "href": "/concepts/u-net",
            "blurb": "Learn from images paired with labeled masks to predict a label for every pixel."
          }
        ]
      },
      {
        "heading": "Embedding Pictures",
        "blurb": "Represent similarity, learn it directly, and search a collection efficiently.",
        "concepts": [
          {
            "title": "A Vector for a Picture",
            "href": "/concepts/a-vector-for-a-picture",
            "blurb": "Use a trained network's internal features to compare pictures with a compact vector."
          },
          {
            "title": "Learning the Metric Itself",
            "href": "/concepts/learning-the-metric-itself",
            "blurb": "Train on picture pairs so useful matches receive nearby representations."
          },
          {
            "title": "Searching a Collection of Pictures",
            "href": "/concepts/searching-a-collection-of-pictures",
            "blurb": "Compare exact neighbour search with indexes that inspect fewer candidate pictures."
          }
        ]
      }
    ],
    "id": "computer-vision"
  },
  {
    "title": "Natural Language Processing",
    "intro": "First decide how text becomes pieces and IDs. Then build ways to predict from those pieces and represent their relationships. Tokenisation and meaning are separate problems.",
    "topics": [
      {
        "heading": "Tokens and Basic Units",
        "blurb": "Establish what an ID means, then compare bytes, characters, and whitespace-delimited words.",
        "concepts": [
          {
            "title": "What a Token Is",
            "href": "/concepts/what-a-token-is",
            "blurb": "Turn text into pieces with numeric IDs, and examine what those IDs preserve."
          },
          {
            "title": "Bytes and Characters",
            "href": "/concepts/bytes-and-characters",
            "blurb": "Compare character and byte representations, including their coverage and sequence lengths."
          },
          {
            "title": "Splitting on Spaces",
            "href": "/concepts/splitting-on-spaces",
            "blurb": "Split text at whitespace and inspect which words, punctuation, and positions the rule preserves."
          }
        ]
      },
      {
        "heading": "Rules for Word Boundaries",
        "blurb": "Compare general character rules with conventions written for particular tasks.",
        "concepts": [
          {
            "title": "Unicode Word Boundaries",
            "href": "/concepts/unicode-word-boundaries",
            "blurb": "Use character classes and boundary rules to segment a wider range of writing."
          },
          {
            "title": "Penn Treebank Rules",
            "href": "/concepts/penn-treebank-rules",
            "blurb": "Separate contractions and punctuation using rules designed for annotated English text."
          },
          {
            "title": "Moses Rules",
            "href": "/concepts/moses-rules",
            "blurb": "Combine punctuation rules with language-specific exceptions for translation-oriented tokenisation."
          },
          {
            "title": "The Pattern Language Models Use",
            "href": "/concepts/the-pattern-language-models-use",
            "blurb": "Use a regular expression to make initial text pieces while retaining their spacing."
          }
        ]
      },
      {
        "heading": "Scripts Without Spaces",
        "blurb": "Move from local dictionary matches to whole-sequence and learned boundary decisions.",
        "concepts": [
          {
            "title": "Maximum Matching",
            "href": "/concepts/maximum-matching",
            "blurb": "Use a dictionary to take the longest available word at each position."
          },
          {
            "title": "The Word Lattice",
            "href": "/concepts/the-word-lattice",
            "blurb": "Keep alternative word segmentations and score complete paths through the sentence."
          },
          {
            "title": "Segmenting With a Hidden Model",
            "href": "/concepts/segmenting-with-a-hidden-model",
            "blurb": "Infer word boundaries from a sequence of hidden character-position labels."
          },
          {
            "title": "Learning Boundaries From Examples",
            "href": "/concepts/learning-boundaries-from-examples",
            "blurb": "Learn boundary decisions from local character features in labelled examples."
          }
        ]
      },
      {
        "heading": "Predicting Token Sequences",
        "blurb": "Count short sequences and deal with continuations absent from training.",
        "concepts": [
          {
            "title": "N-Grams",
            "href": "/concepts/n-grams",
            "blurb": "Predict the next token by counting short sequences and reserving probability for unseen ones."
          }
        ]
      },
      {
        "heading": "Learning a Subword Vocabulary",
        "blurb": "Compare the goals and encoding rules behind different inventories of pieces.",
        "concepts": [
          {
            "title": "Byte Pair Encoding",
            "href": "/concepts/byte-pair-encoding",
            "blurb": "Grow a subword vocabulary by repeatedly merging frequent adjacent pairs."
          },
          {
            "title": "WordPiece",
            "href": "/concepts/wordpiece",
            "blurb": "Compare a pair's frequency with the frequencies of its parts, then encode using longest matching pieces."
          },
          {
            "title": "The Unigram Language Model",
            "href": "/concepts/the-unigram-language-model",
            "blurb": "Assign probabilities to candidate pieces and prune a large vocabulary while considering alternative segmentations."
          },
          {
            "title": "SentencePiece",
            "href": "/concepts/sentencepiece",
            "blurb": "Treat whitespace as part of the text representation and learn subword pieces from that stream."
          },
          {
            "title": "Greedy Coverage",
            "href": "/concepts/greedy-coverage",
            "blurb": "Build a vocabulary by repeatedly choosing the candidate with the largest remaining coverage gain."
          },
          {
            "title": "Moving a Vocabulary",
            "href": "/concepts/moving-a-vocabulary",
            "blurb": "Translate vocabulary entries between tokenisation schemes and inspect what the transfer preserves."
          }
        ]
      },
      {
        "heading": "Word Structure",
        "blurb": "Compare learned recurring parts with an explicitly written grammar.",
        "concepts": [
          {
            "title": "Morfessor",
            "href": "/concepts/morfessor",
            "blurb": "Learn recurring word parts by balancing the cost of a piece inventory against the cost of the text."
          },
          {
            "title": "Finite-State Morphology",
            "href": "/concepts/finite-state-morphology",
            "blurb": "Use explicit stems, endings, and spelling rules to analyse a word's structure."
          }
        ]
      },
      {
        "heading": "Fixed Tables and Shorter Sequences",
        "blurb": "Use hashing and patches when vocabulary size or sequence length is the constraint.",
        "concepts": [
          {
            "title": "Hashing Characters",
            "href": "/concepts/hashing-characters",
            "blurb": "Map characters to a fixed number of buckets and examine collisions."
          },
          {
            "title": "Patching Without a Vocabulary",
            "href": "/concepts/patching-without-a-vocabulary",
            "blurb": "Group byte sequences into patches using fixed sizes or predictability-based boundaries."
          }
        ]
      },
      {
        "heading": "Codes for Numerical Inputs",
        "blurb": "Apply the vocabulary idea to vectors and measure the approximation it introduces.",
        "concepts": [
          {
            "title": "Codebook Quantisation",
            "href": "/concepts/codebook-quantisation",
            "blurb": "Assign each vector to a nearby codebook entry and measure the reconstruction error."
          },
          {
            "title": "Finite Scalar Quantisation",
            "href": "/concepts/finite-scalar-quantisation",
            "blurb": "Map each coordinate to a few fixed levels and combine the level choices into a code."
          }
        ]
      },
      {
        "heading": "Word Vectors from Counts",
        "blurb": "Understand vector comparisons, then build representations from observed word use.",
        "concepts": [
          {
            "title": "A Vector for a Word",
            "href": "/concepts/a-vector-for-a-word",
            "blurb": "Represent words with vectors so their relationships can be compared numerically."
          },
          {
            "title": "Distance and Similarity",
            "href": "/concepts/distance-and-similarity",
            "blurb": "Compare distances and similarity scores on the same word representations."
          },
          {
            "title": "Latent Semantic Analysis",
            "href": "/concepts/latent-semantic-analysis",
            "blurb": "Weight a term-document table and compress it into a shared space for words and documents."
          },
          {
            "title": "Pointwise Mutual Information",
            "href": "/concepts/pointwise-mutual-information",
            "blurb": "Compare an observed pair frequency with the frequency predicted by independence."
          },
          {
            "title": "Random Indexing",
            "href": "/concepts/random-indexing",
            "blurb": "Accumulate sparse random context vectors to build fixed-width word representations."
          }
        ]
      },
      {
        "heading": "Word Vectors from Prediction",
        "blurb": "Learn representations through context-prediction and co-occurrence objectives.",
        "concepts": [
          {
            "title": "The Embedding Layer",
            "href": "/concepts/embedding-layers",
            "blurb": "Look up one trainable vector per token ID and follow how repeated words update the shared table."
          },
          {
            "title": "Word2vec",
            "href": "/concepts/word2vec",
            "blurb": "Train on nearby words, then keep the vectors that helped make those predictions."
          },
          {
            "title": "FastText",
            "href": "/concepts/fasttext",
            "blurb": "Share information through character substrings so word vectors can use spelling as well as context."
          },
          {
            "title": "GloVe",
            "href": "/concepts/glove",
            "blurb": "Learn word vectors from a table of co-occurrence counts."
          }
        ]
      },
      {
        "heading": "Representing Order and Context",
        "blurb": "Give token vectors position information, then let each position gather relevant information from the sequence.",
        "concepts": [
          {
            "title": "Positional Encoding",
            "href": "/concepts/positional-encoding",
            "blurb": "Represent where a token occurs so a model can use order as well as content."
          },
          {
            "title": "Attention",
            "href": "/concepts/attention",
            "blurb": "Give tokens context by comparing queries with keys and gathering the corresponding values."
          }
        ]
      },
      {
        "heading": "Representing a Whole Text",
        "blurb": "Start with combinations of word vectors, then learn a document vector of its own.",
        "concepts": [
          {
            "title": "Pooling a Text",
            "href": "/concepts/pooling-a-text",
            "blurb": "Combine word representations into a fixed-size text representation and inspect what the combination loses."
          },
          {
            "title": "Paragraph Vectors",
            "href": "/concepts/paragraph-vectors",
            "blurb": "Train a document vector through word prediction and infer vectors for new text."
          }
        ]
      }
    ]
  },
  {
    "title": "Large Language Models",
    "intro": "How does a numerical model turn a prompt into a response? Build from a transformer block to the training target, then follow the choices that produce a sequence.",
    "topics": [
      {
        "heading": "Building a Language Model",
        "blurb": "Connect the components first, then define what the model learns to predict.",
        "concepts": [
          {
            "title": "Transformer Blocks",
            "blurb": "Combine attention, residual connections, and local processing into one reusable component.",
            "href": "/concepts/transformer-blocks"
          },
          {
            "title": "Next-Token Prediction",
            "blurb": "Build the training task behind an autoregressive large language model.",
            "href": "/concepts/next-token-prediction"
          }
        ]
      },
      {
        "heading": "Generating Text",
        "blurb": "Keep the model fixed while the context grows, and inspect how a distribution becomes a selected token.",
        "concepts": [
          {
            "title": "Autoregressive Generation",
            "blurb": "Turn a next-token distribution into a response by extending the context one choice at a time.",
            "href": "/concepts/autoregressive-generation"
          },
          {
            "title": "Sampling and Temperature",
            "blurb": "Control how predictions become choices while keeping the model's learned weights fixed.",
            "href": "/concepts/sampling-and-temperature"
          }
        ]
      }
    ]
  },
  {
    "title": "Generative Models",
    "intro": "Move from describing an observation to creating new examples. These methods build on earlier ideas about compression, probability, neural networks, and learning from data.",
    "topics": [
      {
        "heading": "Learning a Compact Representation",
        "blurb": "Find out what a code preserves, then give generation a distribution of codes to draw from.",
        "concepts": [
          {
            "title": "Autoencoders",
            "blurb": "Learn a compact representation by checking whether it can reconstruct its input.",
            "href": "/concepts/autoencoders"
          },
          {
            "title": "Variational Autoencoders",
            "blurb": "Train reconstruction together with a distribution from which new latent codes can be drawn.",
            "href": "/concepts/variational-autoencoders"
          }
        ]
      },
      {
        "heading": "Learning to Generate",
        "blurb": "Compare learning from a discriminator with learning to estimate noise in corrupted examples.",
        "concepts": [
          {
            "title": "Generative Adversarial Networks",
            "blurb": "Learn a generator by training another model to distinguish its outputs from real examples.",
            "href": "/concepts/generative-adversarial-networks"
          },
          {
            "title": "Diffusion Models",
            "blurb": "Create a learning task from controlled corruption, then use a trained reverse process to generate.",
            "href": "/concepts/diffusion-models"
          }
        ]
      }
    ]
  },
  {
    "title": "Adapting and Evaluating Modern Models",
    "intro": "An architecture is only part of a useful system. Teach response behavior, adapt parameters, supply source material, and check whether the result solves the intended problem.",
    "topics": [
      {
        "heading": "Adapting a Trained Model",
        "blurb": "Learn from demonstrated responses, adapt a smaller set of parameters, and improve decisions using rewards.",
        "concepts": [
          {
            "title": "Supervised Fine-Tuning",
            "blurb": "Use prompt-response examples to adapt the behavior of an already trained model.",
            "href": "/concepts/supervised-fine-tuning"
          },
          {
            "title": "Low-Rank Adaptation",
            "blurb": "Express a trainable correction through a narrow pair of matrices while freezing the base projection.",
            "href": "/concepts/low-rank-adaptation"
          },
          {
            "title": "Reinforcement Learning",
            "blurb": "Start with an agent learning from actions and rewards, then connect that feedback loop to language models.",
            "href": "/concepts/reinforcement-learning"
          }
        ]
      },
      {
        "heading": "Grounding and Evaluation",
        "blurb": "Find relevant evidence and distinguish a plausible output from a measured improvement.",
        "concepts": [
          {
            "title": "Retrieval-Augmented Generation",
            "blurb": "Find relevant source material, place it in context, and check the answer against that evidence.",
            "href": "/concepts/retrieval-augmented-generation"
          },
          {
            "title": "Evaluating Generative Models",
            "blurb": "Match the measurement to the task, preserve a held-out comparison, and inspect what averages conceal.",
            "href": "/concepts/evaluating-generative-models"
          }
        ]
      }
    ]
  }
];
