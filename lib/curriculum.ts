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
    "intro": "Machine learning uses mathematics to describe data, make predictions, and improve those predictions. Those calculations are much easier to follow when we understand what they are doing. We will work through statistics, linear algebra, and calculus from small examples, so you don't need to arrive with that background.",
    "topics": [
      {
        "heading": "Introductory Mathematics",
        "blurb": "",
        "concepts": [
          {
            "title": "Statistics & Probability Primer",
            "href": "/primers/statistics",
            "blurb": "A collection of measurements does not explain itself. We need ways to describe what is typical, how much the values differ, and how much confidence we should place in the patterns we observe."
          },
          {
            "title": "Linear Algebra Primer",
            "href": "/primers/linear-algebra",
            "blurb": "A model often needs to work with many measurements at once. Vectors and matrices let us organise those numbers and repeat useful calculations without writing a separate rule for every example."
          },
          {
            "title": "Calculus Primer",
            "href": "/primers/calculus",
            "blurb": "If we change a model's setting a little, does its error improve or get worse? Calculus gives us a way to describe that change and use it to decide what to adjust next."
          }
        ]
      }
    ]
  },
  {
    "title": "Start with a Prediction",
    "intro": "Suppose we know a person's height and want to estimate their weight. How would we find a useful rule, and how would we know whether it works for someone we haven't measured? We will start with that problem, then look at predictions that choose a category instead of a number.",
    "topics": [
      {
        "heading": "Start with a Prediction",
        "blurb": "",
        "concepts": [
          {
            "title": "Simple Linear Regression",
            "href": "/concepts/simple-linear-regression",
            "blurb": "Taller people tend to weigh more, but height does not determine weight exactly. We will use that relationship to build a prediction rule and work out what makes one line fit the observations better than another."
          },
          {
            "title": "Held-Out Evaluation",
            "href": "/concepts/held-out-evaluation",
            "blurb": "A rule can fit the examples it has already seen without being useful on new ones. We need to put some examples aside and use them to check the predictions after fitting."
          },
          {
            "title": "Logistic Regression",
            "href": "/concepts/logistic-regression",
            "blurb": "Suppose our answer needs to be yes or no. We can first estimate a probability from the measurements, then decide how large that probability needs to be before we choose yes."
          },
          {
            "title": "Judging a Classifier",
            "href": "/concepts/judging-a-classifier",
            "blurb": "A model can make different kinds of mistake, and they may have very different consequences. Counting correct answers alone can hide the errors that matter most for the task."
          }
        ]
      }
    ]
  },
  {
    "title": "Data Preparation",
    "intro": "A model works with the numbers we give it, but those numbers may describe very different things. Age, income, and distance do not use the same units or vary by the same amounts. We need to consider what our measurements represent before expecting a model to make useful comparisons.",
    "topics": [
      {
        "heading": "Centres and Scales",
        "blurb": "A difference of ten means something very different when we are measuring age rather than income. We will look at how changing a measurement's reference point and units changes the comparisons a model makes.",
        "concepts": [
          {
            "title": "Centring on the Mean",
            "href": "/concepts/centring-on-the-mean",
            "blurb": "Sometimes it is more useful to know how far a measurement is from the average than how far it is from zero. Subtracting the mean gives us that new reference point."
          },
          {
            "title": "The Standard Score",
            "href": "/concepts/the-standard-score",
            "blurb": "How unusual is a measurement that is ten units above average? That depends on how much the measurements usually vary. A standard score expresses the difference in units of standard deviation."
          },
          {
            "title": "Feature Scaling",
            "href": "/concepts/feature-scaling",
            "blurb": "A distance calculation can be dominated by a feature simply because its numbers are larger. We will look at how scaling changes that calculation and why some models are affected more than others."
          }
        ]
      },
      {
        "heading": "Constructing and Reducing Features",
        "blurb": "Sometimes the useful relationship is easier to describe with a new measurement, such as area rather than length. Other times we have several measurements describing much the same thing. Both affect what we give the model.",
        "concepts": [
          {
            "title": "Polynomial Features",
            "href": "/concepts/polynomial-features",
            "blurb": "A straight line cannot describe every relationship between our measurements and the answer. Adding features such as an input squared gives the model more to work with while keeping its coefficients straightforward to fit."
          },
          {
            "title": "Principal Component Analysis",
            "href": "/concepts/pca",
            "blurb": "Several measurements may vary together, so storing all of them can repeat much of the same information. Principal component analysis looks for directions that preserve the most variation with fewer coordinates."
          }
        ]
      }
    ]
  },
  {
    "title": "Classical Machine Learning",
    "intro": "Different problems give us different information to work with. We might have examples with known answers, observations we want to group, or a pattern we need to find in a picture. We will work through the methods developed for these problems and why their different approaches can be useful.",
    "topics": [
      {
        "heading": "Distance",
        "blurb": "Before we ask a model to find similar examples, we need to decide what similar means. Different ways of measuring distance can give us different answers.",
        "concepts": [
          {
            "title": "What Near Means",
            "href": "/concepts/distance-metrics",
            "blurb": "Which of two examples is nearer depends on how we measure distance. We will compare those choices before using nearness to find neighbours or form groups."
          }
        ]
      },
      {
        "heading": "Regression",
        "blurb": "A single straight line will not explain every relationship. We can include more measurements or allow a more flexible rule, but we still need to work out how to fit it and when that flexibility stops helping.",
        "concepts": [
          {
            "title": "Multiple & Polynomial Regression",
            "href": "/concepts/multiple-polynomial-regression",
            "blurb": "One measurement may not be enough to explain the outcome. We can give a regression model several inputs, including transformed inputs, and work out how much each contributes to the prediction."
          },
          {
            "title": "Fitting by Walking",
            "href": "/concepts/gradient-descent-regression",
            "blurb": "Rather than solving for a fitted line all at once, we can improve an initial guess through small adjustments. The gradient tells us which direction increases the error, so we can try moving the other way."
          },
          {
            "title": "Ridge & Lasso",
            "href": "/concepts/ridge-lasso",
            "blurb": "A flexible model can fit accidental details in the training data. Penalising large coefficients gives us a way to discourage that behaviour, with ridge and lasso making different kinds of adjustment."
          }
        ]
      },
      {
        "heading": "Classification",
        "blurb": "Sometimes we want a category rather than a number. We will look at how nearby examples, a sequence of questions, and scores for different classes can each give us a way to decide.",
        "concepts": [
          {
            "title": "k-Nearest Neighbours",
            "href": "/concepts/k-nearest-neighbours",
            "blurb": "If similar examples tend to have similar answers, nearby labelled examples may help us predict a new one. We still need to decide how to measure distance and how many neighbours to ask."
          },
          {
            "title": "Decision Trees",
            "href": "/concepts/decision-trees",
            "blurb": "A series of simple questions can narrow down a decision. A decision tree learns which questions to ask from the examples and places a prediction at the end of each route."
          },
          {
            "title": "More Than Two Classes",
            "href": "/concepts/multiclass-classification",
            "blurb": "Some problems have more than two possible answers. We need a way to compare the evidence for each category and decide how the resulting scores become a prediction."
          }
        ]
      },
      {
        "heading": "Ensembles",
        "blurb": "One model may depend too heavily on a few examples or miss a pattern another model captures. Combining models can help, but the way we train and combine them matters.",
        "concepts": [
          {
            "title": "Bagging",
            "href": "/concepts/bagging",
            "blurb": "Small changes in the training data can produce very different fitted models. Fitting several models to resampled data and combining their answers can make the result less dependent on one particular fit."
          },
          {
            "title": "Random Forests",
            "href": "/concepts/random-forests",
            "blurb": "A collection of trees is less useful if they all make the same mistakes. Giving them different samples and different feature choices encourages the variety that can make their combined prediction more reliable."
          },
          {
            "title": "Gradient Boosting",
            "href": "/concepts/gradient-boosting",
            "blurb": "A model's mistakes tell us what it has not yet explained. Boosting adds models in stages, with each new model learning a correction to the predictions already made."
          }
        ]
      },
      {
        "heading": "Clustering",
        "blurb": "We do not always have labels telling us which examples belong together. Clustering tries to find groups from the measurements themselves, using a chosen definition of similarity.",
        "concepts": [
          {
            "title": "k-Means Clustering",
            "href": "/concepts/k-means",
            "blurb": "We may want to group similar observations without having labels for those groups. K-means uses nearby centres to assign the observations, then moves the centres to better represent their assigned points."
          }
        ]
      },
      {
        "heading": "Kernels",
        "blurb": "A pattern that is difficult to separate in its original coordinates may become simple after a transformation. Kernels let us use comparisons in that transformed space without explicitly calculating every new coordinate.",
        "concepts": [
          {
            "title": "The Kernel Trick",
            "href": "/concepts/kernel-trick",
            "blurb": "A pattern may be difficult to separate with a straight boundary until we change how it is represented. A kernel lets us compare examples in a transformed space without explicitly building every new feature."
          },
          {
            "title": "Kernel Ridge Regression",
            "href": "/concepts/kernel-ridge",
            "blurb": "Ridge regression gives us a way to control a fit, but its original features may not describe the relationship well. Kernel comparisons let us apply the same idea in a transformed feature space."
          },
          {
            "title": "Kernel Principal Components",
            "href": "/concepts/kernel-pca",
            "blurb": "The useful structure in a dataset may not lie along a straight direction in its original coordinates. Kernel PCA looks for variation after a transformation, using comparisons between examples to do the work."
          }
        ]
      },
      {
        "heading": "Sequences",
        "blurb": "The order of observations can matter. We will start with a model that uses the current state to predict the next one, so we can see what this limited form of memory allows.",
        "concepts": [
          {
            "title": "Markov Chains",
            "href": "/concepts/markov-chains",
            "blurb": "The next event may depend on what is happening now. A Markov chain describes that dependence using probabilities of moving from one state to another, while leaving earlier history out of the prediction."
          }
        ]
      },
      {
        "heading": "Classical Computer Vision",
        "blurb": "A computer receives a picture as an array of pixel values. We need ways to turn those values into useful observations, such as where an edge lies or whether a familiar shape is present.",
        "concepts": [
          {
            "title": "Filters and Edges",
            "href": "/concepts/filters-and-edges",
            "blurb": "The boundary of an object often appears as a change in brightness. Small image filters compare nearby pixels so we can measure those changes instead of treating each pixel in isolation."
          },
          {
            "title": "Template Matching",
            "href": "/concepts/template-matching",
            "blurb": "If we already know what a pattern looks like, we can search for it in a larger picture. Template matching compares that known pattern with each possible location in the image."
          },
          {
            "title": "Histogram of Oriented Gradients",
            "href": "/concepts/histogram-of-oriented-gradients",
            "blurb": "An object's outline can remain recognisable when the lighting changes. Histograms of oriented gradients describe local edge directions, giving a detector information about shape without relying on exact pixel values."
          },
          {
            "title": "Keypoints and Descriptors",
            "href": "/concepts/keypoints-and-descriptors",
            "blurb": "Two photographs may show the same scene from different positions. We need distinctive points we can recognise in both pictures and a numerical description that lets us compare their surroundings."
          },
          {
            "title": "Image Alignment",
            "href": "/concepts/image-alignment",
            "blurb": "A camera can move or turn between photographs. Matching points gives us evidence of that movement, which we can use to work out how to bring the images into alignment."
          },
          {
            "title": "Haar Cascades",
            "href": "/concepts/haar-cascades",
            "blurb": "Searching every part of a picture can be expensive, especially when most regions contain nothing relevant. A cascade uses inexpensive checks to reject unlikely regions before applying more demanding tests."
          }
        ],
        "id": "classical-methods"
      }
    ]
  },
  {
    "title": "Choosing and Checking a Model",
    "intro": "A model can look good on the examples we used to choose it and still make poor predictions on new data. We need a way to compare our choices without giving them access to the answers we will use for the final test.",
    "topics": [
      {
        "heading": "Choosing and Checking a Model",
        "blurb": "",
        "concepts": [
          {
            "title": "Pipelines",
            "href": "/concepts/pipelines",
            "blurb": "Preparing data is part of fitting a model. If a scaler learns from our test examples, the test has already influenced the result. A pipeline helps us keep those fitting steps together and inside the training procedure."
          },
          {
            "title": "Searching for a Setting",
            "href": "/concepts/grid-search",
            "blurb": "Many model settings must be chosen before fitting. We need a fair way to compare those choices using training and validation data, while keeping the final test separate from the decision."
          },
          {
            "title": "Which Feature Mattered",
            "href": "/concepts/feature-importance",
            "blurb": "A prediction alone does not tell us which measurements the model relied on. Feature importance methods give us ways to investigate that question, although their scores need careful interpretation."
          }
        ]
      }
    ]
  },
  {
    "title": "Neural Networks",
    "intro": "How do a collection of connected neurons learn to make a prediction? We will start with what one artificial neuron actually does: how its weights, bias, and activation function affect its output. From there, we can connect neurons and work through how examples are used to adjust their settings.",
    "topics": [
      {
        "heading": "Neurons and Layers",
        "blurb": "An artificial neuron has a few basic components. Once we understand what each does, we can connect neurons and follow how a set of measurements becomes a prediction.",
        "concepts": [
          {
            "title": "A Neuron",
            "href": "/concepts/neurons-and-activations",
            "blurb": "An artificial neuron starts with three fundamental components: weights, a bias, and an activation function. We will work through what each contributes before putting them together to calculate an output."
          },
          {
            "title": "A Dense Layer and the Forward Pass",
            "href": "/concepts/dense-layers",
            "blurb": "One neuron can only do so much with an input. Connecting several neurons lets us calculate different combinations of the same measurements, then pass those outputs to another layer."
          },
          {
            "title": "The Shape Guarantee",
            "href": "/concepts/shapes-and-flattening",
            "blurb": "A layer needs to know which numbers belong to which example and how they are arranged. We will follow those dimensions through a network and see what changes when an image is flattened."
          }
        ]
      },
      {
        "heading": "Training",
        "blurb": "A network's first predictions are usually poor. We need a way to measure the mistakes, work out which settings contributed to them, and use that information to make an adjustment.",
        "concepts": [
          {
            "title": "Loss Functions",
            "href": "/concepts/loss-functions",
            "blurb": "Before a network can improve, we need to tell it what counts as an error. A loss function assigns a numerical cost to a prediction, and that choice affects which mistakes the model tries hardest to reduce."
          },
          {
            "title": "Backpropagation",
            "href": "/concepts/backpropagation",
            "blurb": "A network can contain many weights between an input and its prediction. Backpropagation works backwards through those calculations to find how each weight contributed to a change in the loss."
          },
          {
            "title": "Training a Small Network",
            "href": "/concepts/training-a-network",
            "blurb": "We now have a prediction, a way to measure its error, and gradients that describe possible adjustments. Training brings those steps together and repeats them over examples so the network can improve."
          }
        ]
      },
      {
        "heading": "Regularisation and Normalisation",
        "blurb": "Improving the training score is not our only concern. We also want the network to cope with new examples and to train reliably. These methods address different parts of those problems.",
        "concepts": [
          {
            "title": "Dropout",
            "href": "/concepts/dropout",
            "blurb": "A network can become too dependent on particular activations during training. Randomly removing some of them makes it work with different combinations, which can help it cope better with new examples."
          },
          {
            "title": "Normalisation Layers",
            "href": "/concepts/normalisation-layers",
            "blurb": "The values passed between layers can change in scale as a network trains. Normalisation methods control aspects of those scales, but they differ in which values they compare and what they preserve."
          }
        ]
      },
      {
        "heading": "Other Ways to Learn and Store Patterns",
        "blurb": "A network can do more than predict a label. We will look at networks that recall damaged patterns, organise similar examples, and learn from relationships between their own inputs and outputs.",
        "concepts": [
          {
            "title": "Hopfield Networks",
            "href": "/concepts/hopfield-network",
            "blurb": "We can often recognise a familiar pattern even when part of it is damaged. A Hopfield network stores patterns in its connections and uses repeated updates to try to recover a stable pattern from a noisy input."
          },
          {
            "title": "Restricted Boltzmann Machines",
            "href": "/concepts/restricted-boltzmann-machine",
            "blurb": "An observation may reflect several underlying patterns we cannot see directly. A restricted Boltzmann machine uses hidden units to represent those patterns and learn a probability model of the visible data."
          },
          {
            "title": "Self-Organising Maps",
            "href": "/concepts/self-organising-map",
            "blurb": "A large collection of measurements is difficult to picture at once. A self-organising map arranges representative examples on a small grid, trying to keep similar observations near one another."
          },
          {
            "title": "Hebbian Principal Components",
            "href": "/concepts/hebbian-pca",
            "blurb": "Can a neuron learn a useful direction from examples arriving one at a time? Oja's rule adjusts its weights using the input and output, while adding a correction that prevents simple Hebbian growth from continuing unchecked."
          }
        ]
      },
      {
        "heading": "Additional Network Layers",
        "blurb": "Different tasks need different connections. A sequence may need memory, a local pattern may need a nearby reference point, and a deep network may benefit from carrying earlier information forward.",
        "concepts": [
          {
            "title": "Recurrent Layers",
            "href": "/concepts/recurrent-layers",
            "blurb": "A measurement in a sequence may only make sense in light of what came before it. Recurrent layers carry a state between steps, and gates give us more control over what information is kept."
          },
          {
            "title": "Radial Basis Networks",
            "href": "/concepts/radial-basis-networks",
            "blurb": "Some patterns are useful only near particular examples. A radial basis network measures how close an input is to several reference points, then combines those local responses into a prediction."
          },
          {
            "title": "Residual Connections",
            "href": "/concepts/residual-connections",
            "blurb": "A new layer may only need to improve a representation we already have. A residual connection carries the input forward so the layer can learn a correction rather than having to recreate the entire representation."
          }
        ]
      }
    ]
  },
  {
    "title": "Computer Vision with Neural Networks",
    "intro": "We can write rules to find an edge or match a known pattern in a picture, but deciding which patterns matter becomes difficult as the task grows. Neural networks let us learn useful image features from examples. We will use them to recognise objects, label individual pixels, and find similar pictures.",
    "topics": [
      {
        "heading": "Spatial Layers",
        "blurb": "An edge is still an edge when it moves across a picture. We need layers that can apply the same detector in different places and summarise what it finds.",
        "concepts": [
          {
            "title": "Convolution",
            "href": "/concepts/convolution",
            "blurb": "A useful image pattern can appear anywhere in a picture. Convolution applies the same small set of weights at different positions, producing a map of where that pattern receives a response."
          },
          {
            "title": "Pooling",
            "href": "/concepts/pooling",
            "blurb": "After detecting local patterns, we may not need every response at its original resolution. Pooling summarises nearby values, reducing the amount of data while giving up some information about exact positions."
          }
        ]
      },
      {
        "heading": "Convolutional Networks",
        "blurb": "Knowing which object is in a picture is one task; knowing exactly which pixels belong to it is another. We will build toward both from the image layers we have already covered.",
        "concepts": [
          {
            "title": "Convolutional Networks",
            "href": "/concepts/convolutional-networks",
            "blurb": "Recognising an object usually takes more than finding one edge. A convolutional network combines learned local patterns through layers, using the resulting features to make a prediction about the image."
          },
          {
            "title": "U-Net",
            "href": "/concepts/u-net",
            "blurb": "Sometimes we need to know which pixels belong to an object, not just whether the object is present. U-Net learns from images paired with labelled masks and carries spatial detail forward to help reconstruct those boundaries."
          }
        ]
      },
      {
        "heading": "Embedding Pictures",
        "blurb": "Two pictures of the same object can have very different pixel values. To search by similarity, we need a representation that preserves the differences relevant to the task.",
        "concepts": [
          {
            "title": "A Vector for a Picture",
            "href": "/concepts/a-vector-for-a-picture",
            "blurb": "Two photographs of the same object may look very different pixel by pixel. A trained network can provide a compact vector of features that gives us a more useful way to compare them."
          },
          {
            "title": "Learning the Metric Itself",
            "href": "/concepts/learning-the-metric-itself",
            "blurb": "What makes two pictures similar depends on the task. By training on examples of useful matches, we can learn a representation in which the differences we care about affect the distance."
          },
          {
            "title": "Searching a Collection of Pictures",
            "href": "/concepts/searching-a-collection-of-pictures",
            "blurb": "Once pictures have numerical representations, we can search for nearby ones. Comparing every picture works for a small collection, but a larger collection gives us a reason to consider search indexes and their compromises."
          }
        ]
      }
    ],
    "id": "computer-vision"
  },
  {
    "title": "Natural Language Processing",
    "intro": "The words we read are comprehensible to us, but a numerical model needs some way to process them. We will start by turning text into pieces with numerical IDs. Then we can ask how a model might learn relationships between those pieces and use the surrounding words to interpret them.",
    "topics": [
      {
        "heading": "Tokens and Basic Units",
        "blurb": "Before a model can work with text, we need to decide what pieces it will receive. A word, a character, and a byte each give us a different starting point.",
        "concepts": [
          {
            "title": "What a Token Is",
            "href": "/concepts/what-a-token-is",
            "blurb": "We can read the word cat, but a numerical model needs a representation it can process. A tokenizer divides text into pieces and maps those pieces to IDs, giving us a starting point for working with language."
          },
          {
            "title": "Bytes and Characters",
            "href": "/concepts/bytes-and-characters",
            "blurb": "A visible character and the bytes used to store it are not always the same unit. That distinction affects how much text a model receives and whether its representation can handle unfamiliar writing."
          },
          {
            "title": "Splitting on Spaces",
            "href": "/concepts/splitting-on-spaces",
            "blurb": "Spaces give us an obvious first place to divide a sentence. We will try that rule, then look at what it does with punctuation, repeated whitespace, and writing that does not separate words with spaces."
          }
        ]
      },
      {
        "heading": "Rules for Word Boundaries",
        "blurb": "Splitting text on spaces leaves us with questions about punctuation, contractions, and different writing systems. These tokenizers make explicit choices about where one piece ends and another begins.",
        "concepts": [
          {
            "title": "Unicode Word Boundaries",
            "href": "/concepts/unicode-word-boundaries",
            "blurb": "Rules written around English letters and spaces do not cover every writing system. Unicode character information gives us a broader basis for deciding where boundaries should fall, though it does not settle every linguistic question."
          },
          {
            "title": "Penn Treebank Rules",
            "href": "/concepts/penn-treebank-rules",
            "blurb": "Should can't remain one piece, or should the negation be separated? Penn Treebank tokenization gives English contractions and punctuation consistent treatment so annotated text can be processed using the same conventions."
          },
          {
            "title": "Moses Rules",
            "href": "/concepts/moses-rules",
            "blurb": "A translation system needs a consistent way to handle punctuation without breaking abbreviations and other language-specific forms. Moses tokenization combines general splitting rules with exceptions for those cases."
          },
          {
            "title": "The Pattern Language Models Use",
            "href": "/concepts/the-pattern-language-models-use",
            "blurb": "Before learning smaller pieces, a tokenizer may need to separate runs of letters, numbers, and punctuation. A regular expression can describe those initial groups while retaining information about the spaces around them."
          }
        ]
      },
      {
        "heading": "Scripts Without Spaces",
        "blurb": "Not every writing system places spaces between words. We need another source of information about the boundaries, whether that comes from a dictionary, a probability model, or labelled examples.",
        "concepts": [
          {
            "title": "Maximum Matching",
            "href": "/concepts/maximum-matching",
            "blurb": "When spaces do not tell us where words end, a dictionary gives us one possible guide. Maximum matching takes the longest word it recognises at each position, leaving us to examine when that local choice fails."
          },
          {
            "title": "The Word Lattice",
            "href": "/concepts/the-word-lattice",
            "blurb": "Choosing a word early can change which words remain available later in a sentence. A word lattice keeps the alternatives so we can compare complete segmentations before committing to one."
          },
          {
            "title": "Segmenting With a Hidden Model",
            "href": "/concepts/segmenting-with-a-hidden-model",
            "blurb": "We can see the characters in a sentence without knowing which ones begin or end a word. A hidden-state model uses learned probabilities to infer a sequence of labels for those positions."
          },
          {
            "title": "Learning Boundaries From Examples",
            "href": "/concepts/learning-boundaries-from-examples",
            "blurb": "If people have already marked word boundaries in example text, we can use those labels to teach a model. The surrounding characters provide clues it can use when deciding where to split new text."
          }
        ]
      },
      {
        "heading": "Predicting Token Sequences",
        "blurb": "Some words are more likely after a particular phrase than others. Counting short sequences gives us a simple way to make a next-token prediction and a reason to consider phrases we have never seen.",
        "concepts": [
          {
            "title": "N-Grams",
            "href": "/concepts/n-grams",
            "blurb": "The words immediately before a position give us clues about what might come next. An n-gram model uses counts of short sequences to make that prediction, with adjustments for sequences missing from its training data."
          }
        ]
      },
      {
        "heading": "Learning a Subword Vocabulary",
        "blurb": "A vocabulary containing every possible word would be enormous, and it would still miss new words. Reusing smaller pieces helps, but we need a way to decide which pieces deserve an entry.",
        "concepts": [
          {
            "title": "Byte Pair Encoding",
            "href": "/concepts/byte-pair-encoding",
            "blurb": "Common letter combinations need not be stored one character at a time. Byte pair encoding repeatedly joins frequent neighbouring pieces, building a vocabulary that can reuse parts across different words."
          },
          {
            "title": "WordPiece",
            "href": "/concepts/wordpiece",
            "blurb": "A tokenizer needs reusable word parts and a consistent way to find them in new text. We will look at the pair-scoring rule used here to build a WordPiece vocabulary, then its longest-match encoding rule."
          },
          {
            "title": "The Unigram Language Model",
            "href": "/concepts/the-unigram-language-model",
            "blurb": "A word can have several valid divisions into smaller pieces. A unigram tokenizer assigns probabilities to those pieces so it can compare complete segmentations while learning which vocabulary entries to keep."
          },
          {
            "title": "SentencePiece",
            "href": "/concepts/sentencepiece",
            "blurb": "Requiring text to be split into words first makes tokenization depend on another set of boundary rules. SentencePiece can learn pieces from a text stream that explicitly represents whitespace, reducing that dependence on predefined words."
          },
          {
            "title": "Greedy Coverage",
            "href": "/concepts/greedy-coverage",
            "blurb": "There is only so much room in a vocabulary. Instead of choosing the most frequent pair to merge, we can ask which new piece covers the most text that our earlier choices have not already covered."
          },
          {
            "title": "Moving a Vocabulary",
            "href": "/concepts/moving-a-vocabulary",
            "blurb": "A vocabulary learned under one tokenization scheme may need to be used under another. We will follow what happens to its pieces, including boundaries that disappear and entries that become indistinguishable after the move."
          }
        ]
      },
      {
        "heading": "Word Structure",
        "blurb": "Words such as walk, walked, and walking share more than a few letters. We will look at how recurring word parts can be learned from examples or described with explicit rules.",
        "concepts": [
          {
            "title": "Morfessor",
            "href": "/concepts/morfessor",
            "blurb": "Words often share stems and endings, such as walk in walked and walking. Morfessor looks for reusable parts by balancing the cost of storing a vocabulary against the cost of describing the observed words."
          },
          {
            "title": "Finite-State Morphology",
            "href": "/concepts/finite-state-morphology",
            "blurb": "A word's spelling can reflect a stem, an ending, and a rule that changes how they join. Finite-state morphology describes those relationships explicitly so we can analyse forms and generate them from their components."
          }
        ]
      },
      {
        "heading": "Fixed Tables and Shorter Sequences",
        "blurb": "A large vocabulary takes up space, while a long sequence takes work to process. Hashing and byte patches make different compromises when those costs become a problem.",
        "concepts": [
          {
            "title": "Hashing Characters",
            "href": "/concepts/hashing-characters",
            "blurb": "A separate entry for every possible character can make a table large. Hashing maps characters into a fixed number of buckets, at the cost of sometimes giving different characters the same destination."
          },
          {
            "title": "Patching Without a Vocabulary",
            "href": "/concepts/patching-without-a-vocabulary",
            "blurb": "Bytes let us represent text without a learned word vocabulary, but they can produce long sequences. Grouping nearby bytes into patches gives later parts of a model fewer positions to process."
          }
        ]
      },
      {
        "heading": "Codes for Numerical Inputs",
        "blurb": "The idea of assigning a piece an ID can also be applied to numerical data. We will replace continuous values with a limited set of codes and examine what information is lost.",
        "concepts": [
          {
            "title": "Codebook Quantisation",
            "href": "/concepts/codebook-quantisation",
            "blurb": "We may need to replace a continuous vector with a compact ID. A codebook provides a fixed set of representative vectors, letting us choose a nearby entry and measure how much the replacement changes the input."
          },
          {
            "title": "Finite Scalar Quantisation",
            "href": "/concepts/finite-scalar-quantisation",
            "blurb": "Instead of choosing a whole vector from a learned codebook, we can give each coordinate a few allowed levels. Combining those choices produces a discrete code with a different way of controlling the available representations."
          }
        ]
      },
      {
        "heading": "Word Vectors from Counts",
        "blurb": "A token ID identifies a word without telling us how it relates to other words. The contexts in which words occur give us information we can use to build more useful numerical representations.",
        "concepts": [
          {
            "title": "A Vector for a Word",
            "href": "/concepts/a-vector-for-a-word",
            "blurb": "A token's ID tells us which word it identifies, but not how that word relates to another. A vector gives us several numerical coordinates whose learned relationships can support useful comparisons."
          },
          {
            "title": "Distance and Similarity",
            "href": "/concepts/distance-and-similarity",
            "blurb": "Once words have vectors, we still need to decide what makes two vectors similar. Their distance, direction, and length can give us different answers, depending on the comparison we choose."
          },
          {
            "title": "Latent Semantic Analysis",
            "href": "/concepts/latent-semantic-analysis",
            "blurb": "Documents about related subjects may use some of the same words in different amounts. Latent semantic analysis starts with a table of word use and keeps a smaller set of shared patterns for representing words and documents."
          },
          {
            "title": "Pointwise Mutual Information",
            "href": "/concepts/pointwise-mutual-information",
            "blurb": "Two common words can appear together often simply because both appear everywhere. Pointwise mutual information compares their observed association with what we would expect if their occurrences were independent."
          },
          {
            "title": "Random Indexing",
            "href": "/concepts/random-indexing",
            "blurb": "Counting every possible word-context pair can require a very large table. Random indexing gives contexts small random vectors and accumulates them, keeping the representation a fixed size as new examples arrive."
          }
        ]
      },
      {
        "heading": "Word Vectors from Prediction",
        "blurb": "If a representation helps a model predict the words around it, it must preserve something useful about how that word is used. These methods learn word vectors from that requirement and related observations.",
        "concepts": [
          {
            "title": "The Embedding Layer",
            "href": "/concepts/embedding-layers",
            "blurb": "A token ID needs to lead to the vector associated with that token. An embedding layer provides the lookup table, and training adjusts its rows so the retrieved vectors become useful for the task."
          },
          {
            "title": "Word2vec",
            "href": "/concepts/word2vec",
            "blurb": "Words used in similar contexts often have something in common. Word2vec uses a word-prediction task to learn vectors that capture useful regularities in those surrounding words."
          },
          {
            "title": "FastText",
            "href": "/concepts/fasttext",
            "blurb": "A rare word may share useful parts with words we have seen many times. FastText includes character fragments in its word representations, allowing those related spellings to share information during learning."
          },
          {
            "title": "GloVe",
            "href": "/concepts/glove",
            "blurb": "A table of word co-occurrences contains information about how words are used together. GloVe learns vectors whose comparisons account for patterns in those counts, rather than keeping the full table as the representation."
          }
        ]
      },
      {
        "heading": "Representing Order and Context",
        "blurb": "The same word can play different roles depending on where it appears and what surrounds it. A model needs access to that information as well as the word itself.",
        "concepts": [
          {
            "title": "Positional Encoding",
            "href": "/concepts/positional-encoding",
            "blurb": "The same words in a different order can mean something different. A model that receives token vectors needs a way to know where those tokens occur, which positional information provides."
          },
          {
            "title": "Attention",
            "href": "/concepts/attention",
            "blurb": "A word's meaning in a sentence can depend on words some distance away. Attention gives each position a way to compare the available information and combine the parts most relevant to its current representation."
          }
        ]
      },
      {
        "heading": "Representing a Whole Text",
        "blurb": "Searching or comparing documents often calls for one representation of each text. We can combine its word vectors or learn a document vector, with different consequences for what survives.",
        "concepts": [
          {
            "title": "Pooling a Text",
            "href": "/concepts/pooling-a-text",
            "blurb": "Comparing whole sentences often requires one vector per sentence. Pooling combines their token vectors into a fixed-size representation, but the choice of combination determines which details we can still recover."
          },
          {
            "title": "Paragraph Vectors",
            "href": "/concepts/paragraph-vectors",
            "blurb": "A document may have useful characteristics beyond an average of its word vectors. Paragraph vectors learn a document representation by asking it to help predict the words in that document."
          }
        ]
      }
    ]
  },
  {
    "title": "Large Language Models",
    "intro": "A language model receives some text and produces more text. To understand how, we need to look at what it was trained to predict and how earlier words influence that prediction. We will follow those steps from a single prediction to a complete response.",
    "topics": [
      {
        "heading": "Building a Language Model",
        "blurb": "We have ways to represent tokens and let them use context. Now we need to put those components together and define a prediction task that provides the model with something to learn.",
        "concepts": [
          {
            "title": "Transformer Blocks",
            "blurb": "Attention lets tokens exchange information, but that is only part of a transformer. We will put it together with per-token processing, normalisation, and residual connections, explaining the job of each component.",
            "href": "/concepts/transformer-blocks"
          },
          {
            "title": "Next-Token Prediction",
            "blurb": "Text already contains examples of what follows what, giving us a training task without asking someone to label every sentence. A next-token model learns to predict each continuation using only the text available before it.",
            "href": "/concepts/next-token-prediction"
          }
        ]
      },
      {
        "heading": "Generating Text",
        "blurb": "Predicting the next token does not produce a whole answer at once. We need to choose a token, add it to the text, and make another prediction using the updated context.",
        "concepts": [
          {
            "title": "Autoregressive Generation",
            "blurb": "A next-token model predicts one step ahead. To produce a response, we choose a token, append it to the existing text, and ask the model to predict again with that new context.",
            "href": "/concepts/autoregressive-generation"
          },
          {
            "title": "Sampling and Temperature",
            "blurb": "The highest-scoring token is not the only token a model could produce. Sampling and temperature control how we choose from its predictions, changing the output without changing the learned weights.",
            "href": "/concepts/sampling-and-temperature"
          }
        ]
      }
    ]
  },
  {
    "title": "Generative Models",
    "intro": "Recognising a picture and creating a new one are different problems. To generate examples, a model needs to learn something about how the training examples are put together. We will look at several ways to do this, from reconstructing compressed inputs to learning how to remove noise.",
    "topics": [
      {
        "heading": "Learning a Compact Representation",
        "blurb": "If a model compresses an input, what must it keep to reconstruct it? That question gives us a starting point for learning representations from which we might also generate new examples.",
        "concepts": [
          {
            "title": "Autoencoders",
            "blurb": "If we ask a model to compress an input and then reconstruct it, the reconstruction tells us what the compressed representation kept. An autoencoder learns that representation by trying to reduce what is lost.",
            "href": "/concepts/autoencoders"
          },
          {
            "title": "Variational Autoencoders",
            "blurb": "A model that reconstructs known examples does not necessarily give us a good way to generate new ones. A variational autoencoder also shapes a distribution of compressed representations from which we can draw new codes.",
            "href": "/concepts/variational-autoencoders"
          }
        ]
      },
      {
        "heading": "Learning to Generate",
        "blurb": "A generator needs feedback about what to improve. We will compare learning from a model that distinguishes generated examples from real ones with learning to reverse a process that adds noise.",
        "concepts": [
          {
            "title": "Generative Adversarial Networks",
            "blurb": "A generator needs feedback about whether its examples resemble the training data. A GAN trains a second model to distinguish generated examples from real ones, giving the generator a changing source of feedback.",
            "href": "/concepts/generative-adversarial-networks"
          },
          {
            "title": "Diffusion Models",
            "blurb": "Adding noise to an example is easy to control. Learning to remove it gives us a useful training problem, and a trained reverse process can then turn a noisy starting point into a generated example.",
            "href": "/concepts/diffusion-models"
          }
        ]
      }
    ]
  },
  {
    "title": "Adapting and Evaluating Modern Models",
    "intro": "A trained model may be capable of many things without doing the particular job we need. We can teach it from examples, give it feedback, or provide information it did not have during training. We also need to check whether those changes actually make it more useful.",
    "topics": [
      {
        "heading": "Adapting a Trained Model",
        "blurb": "We may already have a useful model but need it to respond differently for a particular task. Examples, smaller parameter updates, and rewards offer different ways to teach that behaviour.",
        "concepts": [
          {
            "title": "Supervised Fine-Tuning",
            "blurb": "A model that can continue text may not respond in the way a task requires. Fine-tuning on examples of prompts and desired responses gives it demonstrations of the behaviour we want.",
            "href": "/concepts/supervised-fine-tuning"
          },
          {
            "title": "Low-Rank Adaptation",
            "blurb": "Adapting every weight in a large model can be expensive. LoRA keeps the original weights fixed and learns a smaller correction through two narrow matrices, reducing the number of parameters that need updating.",
            "href": "/concepts/low-rank-adaptation"
          },
          {
            "title": "Reinforcement Learning",
            "blurb": "We cannot always provide the correct answer before an action is taken. Reinforcement learning uses the rewards that follow actions to improve a policy, including decisions whose consequences appear several steps later.",
            "href": "/concepts/reinforcement-learning"
          }
        ]
      },
      {
        "heading": "Grounding and Evaluation",
        "blurb": "An answer can sound convincing and still be wrong. We need to provide relevant information when the task requires it and evaluate the answer against what the user actually needed.",
        "concepts": [
          {
            "title": "Retrieval-Augmented Generation",
            "blurb": "A model may need information that was absent or out of date when it was trained. Retrieval supplies relevant source material as context, giving the model evidence it can use when answering a question.",
            "href": "/concepts/retrieval-augmented-generation"
          },
          {
            "title": "Evaluating Generative Models",
            "blurb": "A fluent answer or convincing picture is not enough to show that a model does its job well. We need evaluation examples and criteria that reflect the task, including failures an overall average might conceal.",
            "href": "/concepts/evaluating-generative-models"
          }
        ]
      }
    ]
  }
];
