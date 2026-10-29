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
            "blurb": "Where does an object begin and end in an image? U-Net learns from images paired with labelled masks, using spatial detail from earlier layers to help predict the region belonging to each object."
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

const topicIntroductions: Record<string, string> = {
  "Describing a model request": "The model expects named measurements. We need to agree on which ones are required and what their values mean before two programs can exchange them.",
  "Handling and testing tool outcomes": "What should an agent do when a tool times out? It depends on whether the tool did anything before the connection failed. We’ll represent that difference and write tests for it.",
  "Protecting the training process": "A training pipeline accepts a file. Who supplied it, and what could its contents make the model learn? We’ll keep the source of the records visible while testing a suspected change in behaviour.",
  "Assessing exposure through prediction": "An attacker may change an input or call a prediction service many times. We need to state which actions are available before an experiment can tell us whether a defence helped.",
  "Following a distributed calculation": "Spark can spread a calculation across workers. Begin with the instructions it receives, then look at why some records have to move between workers before a result can be calculated.",
  "Keeping a dependable table history": "The sensor records changed after our first training run. Which version should an old model still refer to? We need to preserve a consistent view of the table for each run.",
  "Publishing a pipeline result": "A pipeline finds an invalid reading. Should it record the failure and continue, leave that row out, or stop the update? Those choices change what reaches the model.",
  "Connecting model evidence to an artifact": "One model run has a lower error than another. Before we prefer it, we need to know what each run was evaluated on. MLflow can keep those details alongside the model files.",
  "Making feature access explicit": "A training job can name a table and still lack permission to read it. A feature can also be present now but unavailable at the time of an older prediction. We’ll handle those as separate requirements.",
  "When the answer arrives": "The model has to process the prompt before it can emit its first token. It then produces more tokens over time. We’ll measure those waits separately so we know which part of the work we are trying to reduce.",
  "Serving a changing workload": "A request can finish while others are still generating answers. Work out when its memory becomes available for the next request, including what happens when somebody clicks Stop.",
  "Following an estimate through time": "The belt moves between camera readings. Use that movement to predict a position, then decide how much a new reading should change the estimate.",
  "When observation and model disagree": "A nearby camera detection could belong to the wrong part. We’ll first check which detection we can reasonably use, then examine what happens when our motion assumptions are wrong.",
  "Where a fitted number can mislead": "A document is represented by a list of numbers, but squaring those numbers can exceed what the computer can represent. Another example gives different parameter choices the same fit. We’ll work out why each result needs closer inspection.",
  "Checking derivatives and simulated trajectories": "A program claims to know how a model’s error will change when a weight moves. We can test that claim by making a small change ourselves. We’ll also compare proposed simulation steps before accepting their results.",
  "Keeping prediction code dependable": "The same values can reach a model in a different order. A procedure that rescales readings can also reuse statistics from the wrong training run. We’ll write procedures that make those assumptions explicit.",
  "Structures for agent workloads": "A retrieved passage needs to stay attached to the score that selected it. A training job needs its input job to finish first. Those problems give us reasons to use different data structures.",
  "Building the training table": "One sensor file has fewer rows than another. Before combining them, we need to know what each row represents and what information was available at the time.",
  "Repairing a changing pipeline": "The next file uses a different column layout, or a reading arrives after its reporting window. Work out what the existing procedure would do before deciding how to change it.",
  "Latency under real workloads": "A person waits from the moment they send a request, including any time it spends in a queue. An agent may make several tool calls during that same wait. We’ll measure the time that actually passes for the caller.",
  "Memory and reuse": "A saved conversation occupies memory. A saved answer is useful only if it still answers the current question. Work out what each kind of reuse requires.",
  "Making predictions usable for motion": "The camera’s position reading refers to a particular view and time. We need to account for both before using it to move towards an object.",
  "Closing the action loop": "An action changes what the next observation will show. Use that feedback to adjust the next command, then see what happens when the motor cannot apply the command we requested.",
  "Boundaries around learning systems": "A useful record may be private, and a downloaded model may execute code when loaded. We’ll examine each operation before deciding what the application can safely permit.",
  "Learning from a numerical world": "A simulation chooses how to approximate movement and which conditions to generate. Work through those choices before using the examples to judge a learned policy.",
  "Checking a simulator against observations": "Some relationships in our simulator are unknown. Fit them from measurements, then try the fitted model under conditions it has not already seen.",
  "Find the Mistakes Behind the Score": "An average can hide the mistakes we most need to understand. Keep predictions beside their observations, follow the inspection queue, and ask which conditions the model struggles with.",
  "Compare Revisions Fairly": "A lower score may reflect easier cases or repeated searching. Compare revisions on shared observations and keep the model-choosing process inside its own assessment boundary.",
  "Repair the Evidence and the Behaviour": "Some failures begin in the records or the input adapter. Others need a person to review them. Work out which part needs repair, then test the change without hiding the remaining work.",
  "Build and Check a Model Revision": "Botie's temperature model misses the night shift. Fit a specific repair, compare it with the original, and check the next shift against requirements written before seeing its results.",
  "Choosing the Shape of the Records": "The team looks up a pump by its ID many times a day. Other jobs need an entire inspection or a summary across sites. Begin with those questions and see why a useful way to store one answer can be awkward for another.",
  "Keeping Related Records Together": "An inspection can contain several readings and a technician's notes. Decide which details belong in the same record and which need their own identity, especially when they change independently.",
  "Working Inside Documents": "A nested record is convenient to save, but we still need to find particular measurements and change the intended field. Follow each path into the document and account for values that are missing.",
  "Finding and Summarising Documents": "The collection grows beyond what we want to read for every question. Organise a route to likely matches, then follow the selected documents through the operations that produce a useful summary.",
  "Partitioning for the Questions We Ask": "One site sends far more readings than the others. Work out where those records go and which records a query must visit before choosing how to divide the data.",
  "Reading and Writing Replicated Records": "Two technicians can see different versions of the same work order. Follow the copies and the updates to understand which answers a read can promise and how a competing write should be handled.",
  "Keeping Derived Data Repairable": "A summary can fall behind its source, an old document can have a different shape, and a backup can omit recent work. Keep enough information to detect those gaps and rebuild a trustworthy result.",
  "Serving Model Data": "A fast lookup still gives a model the wrong input if it returns a stale value or information from the future. Bring the storage decisions back to the inspection the model is helping us make.",
  "Representing Connected Records": "A failed pump can affect equipment connected to it. Give each asset an identity, name the relationships between assets, and decide what information belongs on the connection itself.",
  "Asking Questions of a Graph": "The team needs inspections of equipment served by a particular pump. Describe that connected pattern, follow its matches, and keep track of what happens when an expected relationship is absent.",
  "Following Connections": "A fault may reach equipment several connections away. Explore the network without circling forever, then decide whether we need every reachable asset or a particular route.",
  "Maintaining a Graph": "Imports, corrections and concurrent work can change the network we are querying. Preserve identities and valid relationships while making queries practical on a larger graph.",
  "Shared Meaning and Evidence": "Two systems can use different names for the same equipment, or disagree about a connection. Make the meaning of a statement explicit and retain the evidence behind it.",
  "Graphs in ML Systems": "A model or an agent may need the equipment surrounding a fault, together with the documents that explain those connections. Retrieve that context with boundaries on time, access and relevance.",
  "Reading the Records": "Botie has a table of inspections, but the team needs answers about particular pumps and visits. Start by defining what each row records, then choose the rows and columns that answer the question.",
  "Missing Values and Decisions": "An empty measurement is different from a measurement of zero. Follow what happens when an unknown value enters a comparison, then write decisions that handle those gaps deliberately.",
  "Summarising Maintenance Work": "A list of visits does not tell us which site is falling behind. Collect measurements into summaries, keeping the population and missing values visible as the question changes.",
  "Connecting Tables Without Changing the Question": "Asset details and inspection visits live in separate tables. Match the records that belong together, then investigate why a reasonable-looking join can count the same work several times.",
  "Queries Built from Queries": "Some questions depend on the answer to another question. Give each intermediate result a clear job, from checking whether a visit exists to following the equipment hierarchy.",
  "Analysing Change Across Rows": "An average hides the sequence of visits. Keep individual records while comparing neighbouring measurements, ranking results and following totals through time.",
  "Preparing Records for Analysis": "Dates, notes and nested records bring their own ambiguities. Work out what each value represents before turning it into something a query can compare.",
  "Features from Historical Data": "A prediction needs the records available when the decision was made. Rebuild that boundary for each training example, including measurements that arrived after the event they describe.",
  "Designing Reliable Tables": "If an asset appears under two conflicting site names, which record should a query trust? Design the stored relationships and constraints that keep these contradictions from becoming ordinary data.",
  "Changing Shared Data": "Recording a visit may also change a work order. Keep those changes consistent, then examine what happens when two technicians update the same records at once.",
  "Making Queries Practical": "The query works on a handful of rows. What happens when the table contains years of inspections? Read its plan, choose useful indexes, and pass user inputs without changing the query's instructions.",
  "Keeping Learning Data Trustworthy": "A scheduled dataset refresh has to cope with corrections and late records. Build checks that explain failures, then update the dataset without quietly duplicating work or losing older changes.",
  "From an Answer to an Action": "The manual lives in another system. Follow the pieces that let Botie request it, use what comes back and stop when the evidence is insufficient.",
  "Teaching the Task Through Examples": "An example can accidentally teach Botie to recommend an inspection every time. Choose demonstrations that show why the right response changes with the evidence.",
  "Building Evaluation Cases": "Keep the request and its expected outcome together. The next prompt revision needs cases that can reveal a mistake, including cases we did not use to design it.",
  "Testing the Program Around the Model": "A model can vary its wording while our code keeps passing the wrong asset to a tool. Separate reproducible application checks from evaluations of model behaviour.",
  "Reviewing Answer Quality": "Some requirements have exact checks. Others need judgement. Define what the reviewer should look for and test whether those judgements are dependable.",
  "Finding a Change Worth Making": "The answer is wrong. Was the right evidence available? Trace the failure to a specific question, then change one part and inspect what improves or regresses.",
  "Deciding Whether to Release": "The candidate looks promising on our examples. Check the remaining requirements before allowing it to handle real requests.",
  "A Repair From Failure to Fresh Evidence": "A stale manual trips up the assistant. Carry that failure through a tool repair, preserve useful behaviour and test the candidate on a new shift.",
  "Giving the Model a Clear Job": "Botie has a maintenance question to answer. We need to say what a useful answer contains, give him the relevant evidence, and check the result before another program relies on it.",
  "Letting the Model Use Tools": "The answer may need a manual lookup or a proposed inspection. We will define what each tool accepts, control which records it can reach, and decide when the work should stop.",
  "Choosing How Much Autonomy to Give": "The maintenance team already follows a procedure. Where does a model's choice actually help? Compare that procedure with an agent on the same tickets before giving the system more freedom.",
  "Building with Agent Frameworks": "Once we understand the loop, a framework can organise its repeated work. Follow the same maintenance task through Pydantic AI, LangChain, and an explicit LangGraph workflow to see what each one manages.",
  "State and Permissions": "A paused job may resume after its details have changed. Keep the saved state and the technician's approval tied to the action, then examine what changes when tools come from another service.",
  "Guardrails at the Point of Action": "A manual can contain misleading instructions, and a valid tool request can still reach the wrong customer's records. Follow each proposal to the place where software can permit or prevent it. Then test what happens when a check is missing or gives the wrong answer.",
  "Keeping an Agent Run Under Control": "An inspection request times out. Did it fail, or did the service create it before the reply was lost? Work through that uncertainty, then give concurrent jobs a budget they cannot each spend twice.",
  "Seeing What Happened": "Botie returned the wrong answer, but which step went wrong? Record the work as it happens so we can distinguish a missing manual from a failed tool or an unsupported answer.",
  "Evaluating the Whole Agent": "A convincing answer on one ticket tells us little about the next shift. Keep representative cases, inspect the failures, and compare a proposed change against the system people already use.",
  "Testing and Operating the Boundaries": "A guardrail that blocks every request would also stop useful work. Test ordinary jobs alongside attempts to misuse the system, then practise responding when a released version crosses a boundary.",
  "Deciding Where Authority Belongs": "Botie can produce a correct answer after taking an unauthorised action. Start with the effects we need to control and identify where the application can actually stop them.",
  "Working Safely with a Coding Agent": "A green test run can hide a deleted assertion or evidence from an older build. Give Botie a reviewable task, run candidate code with limited access, and keep verification attached to the artifact it inspected.",
  "Connecting MCP Servers Deliberately": "A connected server can advertise new tools, return untrusted content or receive a credential meant for somewhere else. Follow those changes through the host and the service before allowing an operation.",
  "Protecting Applications and Shared State": "An approved draft can change before it runs, and a saved note can outlive its permission. Keep review attached to the actual action and narrow what another worker may inherit.",
  "Testing the Whole Boundary": "A refusal at the end of a conversation does not undo an earlier export. Inspect receiver-side effects, keep ordinary work in the evaluation, and decide what the evidence supports next.",
  "Decisions Before Models": "A prediction helps only if someone can use it. Begin with the inspection decision, identify its limits, and compare a learned model with a rule we can already run.",
  "The Information We Can Use": "A record in today's database may have arrived too late for yesterday's decision. Define what each input means and when the service could actually use it.",
  "Throughput and Waiting": "Requests pass through several stages, and unfinished work carries forward. Follow that work to find the limiting stage and see what a burst does to the queue.",
  "Memory and Communication": "A model needs space to run, and a remote model needs time to receive its inputs. Account for those costs before choosing a device or moving computation to a server.",
  "Requirements and Trade-offs": "Some limits must hold; other qualities are preferences. Keep that distinction visible while comparing candidates and investigating assumptions that could change the choice.",
  "Evidence Before Release": "A prototype should answer a question we still have about the design. Plan the comparison and define what the service does when its normal prediction route is unavailable.",
  "Bring the Design Together": "Return to the inspection team's needs. Connect each requirement to a test, keep failures understandable, and identify what a real trial still has to establish.",
  "Predicting the Next Observation": "Tomorrow's value is unavailable when we make today's forecast. Begin with a simple prediction, then arrange earlier observations into inputs without borrowing the answer.",
  "Patterns That Repeat or Move": "A series can repeat, drift, or react to recent observations. We will separate those behaviours before choosing a rule for updating a forecast.",
  "Fitting and Testing Forecasts": "A useful forecast must work with the information available at its origin. Fit a small model, then recreate that boundary on successive later days.",
  "Learning From Consequences": "Botie sees feedback only after choosing an action. We will distinguish learning about independent choices from decisions that change the state he faces next.",
  "Planning Beyond the Next Reward": "An action can pay off later. Keep the reward sequence visible as we calculate returns, plan with a transition model, and learn action values from experience.",
  "Describing What We Do Not Know": "A single estimate can hide how little evidence supports it. Describe possible outcomes, then update an uncertain failure rate as observations arrive.",
  "Combining Noisy Evidence": "Measurements can disagree without either being useless. Account for their reliability and the way an underlying condition changes before combining them.",
  "Predictions as Distributions": "An unmeasured location needs both a prediction and an account of what remains uncertain. We will see how a covariance rule lets measured locations inform it.",
  "Making Parameter Updates": "A derivative tells us a local direction, but training still needs a rule for using it. Follow small batches, stored velocity, and adaptive scaling through actual parameter changes.",
  "Understanding a Training Run": "A stalled loss can have several causes. Check the starting values and derivatives, then use separate training and validation evidence to decide whether to continue.",
  "Choosing Useful Candidates": "A reader should not have to search the whole shelf. Begin with what previous readers opened, then use guide descriptions when interaction history is missing.",
  "Learning From Interaction Patterns": "Readers can share preferences that item descriptions miss. Keep missing ratings distinct from dislikes while learning from neighbours and compact factor representations.",
  "Evaluating Recommendations": "A useful guide needs to reach the part of the list someone sees. Evaluate the visible ranking and inspect readers and items with little history separately.",
  "Recognising Unusual Records": "An unusual reading needs a reference. Compare a robust global baseline with a local neighbourhood, and keep unusualness separate from a confirmed fault.",
  "Different Ways to Detect Unusualness": "Some observations are easy to isolate; others are hard to reconstruct. Work through both signals before deciding which cases deserve investigation.",
  "Representing Relationships": "Independent rows leave out who is connected to whom. Record a network carefully, then follow probability through its links.",
  "Learning Across Connections": "A node's neighbours can supply context. Gather that information, transform it with shared weights, and test what it tells us about missing links.",
  "Asking What a Change Would Do": "Predicting an outcome and changing it are different questions. Examine why groups differ before using a random assignment to make a treatment comparison.",
  "Working With Observational Evidence": "An old dataset cannot be rerun as an experiment. Make the assumptions behind adjustment and weighting explicit, including where the data provide no comparison.",
  "From Training to a Repeatable Prediction": "Saved weights need the preparation and feature meanings that made them useful. Preserve that procedure and validate the records entering it.",
  "Running and Identifying a Model": "A prediction should stay consistent across requests and traceable to a particular version. Test batch behaviour and preserve complete artifacts before changing the served model.",
  "Maintaining the Prediction Service": "New inputs and later outcomes can reveal different problems. Monitor data, accuracy, and service behaviour separately, with a tested response when something changes.",
  "Putting the Pieces Together": "A complete small project needs a question, a baseline, a fair test, and an explanation of failures. Follow Botie through sensor inspection, demand forecasting, and counting seeds in images.",
  "Reasoning From Uncertain Evidence": "An observation can change what we believe, but we need to keep track of the group we are talking about. We will follow an alarm back to its possible causes, then compare rules that could have produced a recorded sequence.",
  "Learning From Limited Images": "We may have too few labelled photographs to learn every visual pattern from scratch. We can create appropriate variations of our training images or test features learned elsewhere, while keeping the labels and evaluation honest.",
  "Finding and Counting Objects": "Knowing an object is present does not tell us where it is or how many we found. We will describe locations with rectangles, measure their overlap, and work through what to do when several predictions point at the same object.",
  "From a measurement to a calculation": "Before asking a model to learn from numbers, we need to put those numbers in a form we can inspect. We will keep track of what each entry represents as we calculate with arrays.",
  "Working with whole arrays": "A calculation often needs the same reference for many observations, or only the observations meeting a condition. We need to express those choices without losing which values belong together.",
  "Calculations We Will Reuse": "Later models will combine feature columns, compare predictions with observations, and summarise their errors. We will calculate those pieces with NumPy and keep their intermediate results visible.",
  "Keep the Calculation Trustworthy": "A useful result needs to survive new inputs and another run. We will check numerical agreement, repeat random choices, package calculations in functions, and save the information needed to reconstruct them.",
  "Can We Trust These Records?": "A blank reading, a repeated import, and an unusual observation are different problems. We need to establish what each record represents before deciding how to prepare it.",
  "Representing What We Measured": "A material name is not a quantity, and an hour of the day repeats. Our representation should preserve those meanings instead of inventing relationships between arbitrary numbers.",
  "Keep Future Answers Out of Training": "Our fitting procedure must respect what was available at prediction time. We also need to keep rare outcomes visible so an apparently successful score does not hide the mistakes that matter.",
  "Establish a Fair Comparison": "A score needs a reference and an evaluation population. We will establish a simple baseline, keep related observations together, and examine what changes as more training data become available.",
  "From a Score to a Decision": "A model's confidence and the action we take are separate questions. We need to understand what the probabilities mean before connecting them to the consequences of a decision.",
  "Know the Limits of the Result": "A result depends on the observations we collected and the population we tested. We will examine sampling variation and changes in incoming data before carrying a conclusion into a new setting.",
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
  if (part.title === "Data Preparation") expanded.intro = "A model only sees the records we give it. Before fitting, we need to know what a row represents, which measurements are missing, and how categories, units, and time should be represented. We also need to keep information from the future out of a prediction about the present.";
  if (part.title !== "Introductory Mathematics") return [expanded];
  return [expanded, {
    id: "python-and-numpy", title: "Python and NumPy",
    intro: "The courses use Python and NumPy to turn the ideas into calculations we can inspect. We will begin with a few greenhouse readings, learn how to store and select them, then work through array shapes, summaries, matrix calculations, and numerical checks. We will also make the code reusable and keep enough of each experiment to run it again. The examples and challenges run here in the browser.",
    topics: addedTopics("Python and NumPy"),
  }];
});

const newSection = (title: string, intro: string): Part => ({ title, intro, topics: addedTopics(title) });
const databaseSections = [
  newSection("SQL", "Botie's maintenance team has years of inspections, equipment details and sensor readings. How can we use those records to answer a specific question without counting the wrong visits or mixing up assets? Begin with a table and a small query, then work toward analytical queries and dependable databases. The lessons also follow the data into machine learning, where the time a record became available matters as much as its value."),
  newSection("NoSQL", "A technician wants the whole inspection on one screen. A sensor needs to send readings quickly, while the dashboard keeps asking for the latest one. Should all of those jobs store their records in the same way? Work through keys and documents with Botie, then follow what happens when we divide the records among machines or keep several copies. Each choice changes the questions we can answer easily and the failures we need to handle."),
  newSection("Graph Databases", "A pump fails. Which equipment depends on it, and which inspection tells us why that connection matters? The answer follows relationships across the records. We will give those relationships a place in the database, learn to query their patterns, and build traversals with Botie. As the graph grows, we will handle repeated routes, conflicting identities and evidence that has gone out of date."),
];
const probabilitySection = newSection("Probabilistic Models and Uncertainty", "A prediction is rarely the only plausible outcome. Botie will keep track of possible outcomes, update an uncertain failure rate, and combine noisy readings. We will distinguish uncertainty about a model from variation in the next observation, then use those ideas to predict between measured locations.");
const modelEvaluationSection = newSection("Evaluating and Improving Models", "The model has a score. What should we change next? Follow its individual mistakes, check which cases a revision helps, and keep the next assessment separate from the decisions that produced the model. Botie will help you test repairs against group errors and the conditions the service actually needs to handle.");
const optimisationSection = newSection("Optimisation and Training", "A model learns through changes to its parameters. We will follow those changes directly, from a small batch's gradient to momentum and adaptive updates. We will also check derivatives, inspect training curves, and decide when a saved model is a better choice than the final one.");
const reinforcementSection = newSection("Reinforcement Learning", "Botie sometimes has to act before he knows which choice is best. We will begin with the feedback an action produces, then add changing states and rewards that arrive later. Planning with a known model and learning from observed transitions will give us two ways to improve his decisions.");
const reinforcementIntro = existingCurriculum.flatMap(part => part.topics).flatMap(topic => topic.concepts).find(concept => concept.href === "/concepts/reinforcement-learning")!;
reinforcementSection.topics[0].concepts.unshift(reinforcementIntro);

export const CURRICULUM: Part[] = [
  ...foundationCurriculum.flatMap(part => part.title === "Python and NumPy" ? [part, ...databaseSections] : part.title === "Choosing and Checking a Model" ? [part, modelEvaluationSection, probabilitySection] : part.title === "Neural Networks" ? [part, optimisationSection] : [part]),
  newSection("Time Series and Forecasting", "Tomorrow's demand is unknown when Botie needs to prepare for it. Start with a forecast that simply repeats a known value, then introduce earlier observations, repeating patterns, and fitted relationships. Every comparison will respect what could have been known at the time the forecast was made."),
  reinforcementSection,
  newSection("Recommendations and Ranking", "Botie has more guides than a reader can inspect. We will work out which ones to suggest using popularity, descriptions, and shared preferences, then evaluate the short list the reader actually sees. Missing interactions and new readers need their own treatment."),
  newSection("Anomaly Detection", "An unexpected reading can mean a broken sensor, a real event, or an operating condition we have not seen before. We will compare several ways to recognise unusual records and turn their scores into an investigation rule. A high score will remain evidence to inspect, rather than a diagnosis."),
  newSection("Graphs and Relational Learning", "A pump's reading can depend on the network around it. Graphs let us record those connections and use neighbouring measurements as context. We will begin with the representation, then follow information through walks, aggregation, learned layers, and predictions about missing links."),
  newSection("Causal Inference and Experiments", "Knowing which plants grew well does not tell us which intervention helped them. We will examine how treatment groups were formed, design a randomised comparison, and state the assumptions needed to learn from observational records. The calculations will keep those assumptions visible."),
  newSection("Deploying and Maintaining Models", "A model needs to keep behaving as intended after it leaves a training script. Botie will save the full prediction procedure, check incoming records, preserve model versions, and inspect later performance. We will also work through what a useful rollback must restore."),
  newSection("Agents", "A technician asks Botie about a pump, but the answer needs a manual held in another system. How can a model request that information, and who decides what it may do with it? Start with the pieces of an agent, then build the maintenance assistant using Pydantic AI, LangChain and LangGraph. As the job grows, add permission checks and guardrails, and handle calls whose replies never arrive."),
  newSection("Prompting, Evaluation and Iteration", "Botie answers the first maintenance question correctly, then gets the next one wrong. Before rewriting the prompt, we need to understand what happened. Choose useful examples, follow the tool calls through their traces, and build tests that expose the failure. We will use Langfuse and other evaluation tools, compare candidate revisions, and carry a repair through a fresh shift without losing the behaviours that already worked."),
  newSection("Agent Guardrails and Secure Development", "Botie can now write code, call MCP tools and change application records. What should he be unable to do, even if a document misleads him or a proposed fix is wrong? Build the boundaries around those effects. We will inspect patches, restrict execution, check delegated authority and follow reviewed actions through retries, then test the repaired system against a different shift."),
  newSection("Complete Projects", "Bring the pieces together around a question Botie needs to answer. Each small project includes a baseline, a repeatable procedure, held-out evaluation, and cases where the method fails. The datasets are small enough to inspect, so the reasoning stays visible as the work becomes more complete."),
  newSection("Define the ML Problem", "A model can produce a prediction without helping anyone make a better decision. We will start with Botie's inspection team, work out what they can act on, and decide what a learned model would need to improve. The information available at decision time will become part of the design."),
  newSection("Model the System Before Building It", "A prediction service needs more than a fast model. Images must be prepared, requests can arrive together, and devices have limited memory. We will calculate where the work goes, then compare local and remote inference using the same task."),
  newSection("Compare Designs Under Constraints", "The fastest candidate may miss too many faults, while the most accurate one may respond too late. We will identify which designs meet the requirements, examine the remaining trade-offs, and find the assumptions that could change our choice."),
  newSection("Test the Design and Plan for Failure", "A promising estimate needs evidence. Botie will compare prototype changes, route unusable inputs to a defined fallback, and bring the inspection service through a design review. Each passing test will have a clear meaning and a clear limit."),
  newSection("Software for Models and Agents", "The model worked in a notebook. Why does it change when the API reorders fields, another request joins the batch, or a job reads an old artifact? Build the software boundaries around those failures, then use data structures to keep retrieved evidence and workflow dependencies intact."),
  newSection("Model and Tool API Contracts", "Suppose another program calls our pump model. Which readings does it need to send, and what should happen if they are missing? We’ll work out that agreement, give it a form both programs can check, then test what happens as either program changes."),
  newSection("Data Pipelines for Learning", "A training table is the result of decisions about records. Follow Botie from unequal input files to historical features, rejected sensor batches and late events. Keep enough history to explain which data actually produced a model."),
  newSection("Databricks for ML Pipelines", "Databricks gives a team a shared environment for processing data and building ML applications. Apache Spark is one of the tools that performs the calculations, with work spread across several machines. We’ll start with why that became useful, then examine what a training run needs to remember about its data and model files."),
  newSection("Serving Models and Agent Runs", "A model that fits and an agent that answers once still have to handle concurrent requests. Measure what users wait for, carry deadlines through tool calls, and account for conversation memory. Then decide when a cached answer really belongs to the next request."),
  newSection("LLM Inference and Capacity", "A language model answers one person quickly, but slows down when several people ask questions at once. Why? We’ll follow what it does with a prompt and what happens as it writes an answer. That gives us a reason to look at shared calculations and the memory each conversation occupies."),
  newSection("From Learned Perception to Control", "A detector's output is not yet a useful motion command. Give its coordinates a frame and a timestamp, then follow Botie through repeated corrections. When the actuator cannot do what the controller asks, repair the controller's memory as well as its output."),
  newSection("Estimating State from Noisy Observations", "Botie is watching parts move along a conveyor. The camera reports slightly different positions from frame to frame, and sometimes misses a part completely. How can we combine what we know about the belt’s movement with those imperfect readings? We’ll build a position estimate, then test how well its reported uncertainty describes its errors."),
  newSection("Protecting ML Data and Artifacts", "A relevant document may belong to another customer, an anonymous statistic may still expose someone's contribution, and a model file may execute code when loaded. Put the checks around those concrete effects and make clear what each check can establish."),
  newSection("Threats Across the ML Lifecycle", "Suppose a model usually works, but gives the wrong answer whenever an input contains a particular mark. Where did that behaviour come from? We’ll investigate how changes to training records can affect a model, and how someone using the finished model might find a different way to make it fail."),
  newSection("Simulating and Learning System Behaviour", "Botie can learn from simulated experiences, but we first need to know what that simulator is doing. Inspect numerical time steps, compare policies on shared scenarios, fit unknown physical parameters and test conditions that the original model did not handle."),
  newSection("Numerical Methods for Learning", "A formula can be correct and still give a bad answer on a computer. A calculation may produce a number too large to represent, or a set of measurements may leave several explanations equally possible. We’ll examine those problems before using numerical results to judge a model or a simulation."),
];
