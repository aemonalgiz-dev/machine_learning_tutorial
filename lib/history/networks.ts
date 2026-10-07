import { history, source } from "./types";

const backprop = source("Rumelhart, Hinton and Williams (1986), Learning Representations by Back-Propagating Errors", "https://doi.org/10.1038/323533a0");
const lenet = source("LeCun and colleagues (1998), Gradient-Based Learning Applied to Document Recognition", "https://doi.org/10.1109/5.726791");
const transformer = source("Vaswani and colleagues (2017), Attention Is All You Need", "https://arxiv.org/abs/1706.03762");

export const networks = {
  "neurons-and-activations": history("Could a Machine Learn Which Signals Matter?", [
    source("McCulloch and Pitts (1943), A Logical Calculus of the Ideas Immanent in Nervous Activity", "https://doi.org/10.1007/BF02478259"),
    source("Rosenblatt (1958), The Perceptron", "https://doi.org/10.1037/h0042519"),
    source("Cornell Aeronautical Laboratory (1960), Mark I Perceptron Operators' Manual", "https://apps.dtic.mil/sti/tr/pdf/AD0236965.pdf"),
  ],
  "Imagine building a machine that can recognise a simple pattern of light. Sensors can tell us which parts of an image are bright, but that does not tell the machine which combination means the pattern is present. We need a way for some signals to matter more than others, and a way to change their influence when the machine gets an answer wrong.",
  "McCulloch and Pitts explored simplified mathematical neurons in 1943: units that respond when their combined inputs meet a condition. Rosenblatt's perceptron work in the 1950s investigated learning from examples. The Mark I Perceptron made adjustable connection strengths physical. Its hardware used motor-driven potentiometers, described in the machine's 1960 operator's manual.",
  "A potentiometer is an adjustable electrical component, like the component behind a traditional volume knob. Used as a voltage divider, it changes how much of an input voltage reaches the next part of a circuit. The signal can stay the same while the knob changes its contribution. That gives us something concrete to picture when we talk about a weight. In the Mark I, motors could change these settings during learning.",
  "For the artificial neuron we will use here, there are three fundamental components:",
  { items: [
    { name: "Weights", explanation: "Each input has its own weight. Think of a separate control for each incoming signal, rather than one volume knob for the whole neuron. In software, we multiply the input by that weight. A negative weight makes the input oppose the combined score; that signed arithmetic goes beyond a passive volume knob on its own." },
    { name: "A bias", explanation: "This is a separate adjustable constant added to the combined score. It lets us change how readily the neuron responds without changing the relative influence of all its inputs. With a threshold activation, changing the bias moves the point at which the neuron switches on." },
    { name: "An activation function", explanation: "This turns the combined score into the output passed onward. An early threshold unit gave an on-or-off response. Other choices let the response vary continuously or suppress negative scores. We will examine those choices after the components themselves are clear." },
  ] },
  "Learning adjusts the weights and bias so that useful signals contribute appropriately. The activation determines how their combined evidence is expressed. This is a simplified computational model inspired by nervous systems, not a complete description of a biological neuron. We can now follow one small example and see exactly what each component changes."),

  "dense-layers": history("What Could Several Neurons Notice That One Cannot?", [backprop],
  "One neuron combines its inputs into one response. If we want to notice several different patterns in the same measurements, one response may discard distinctions we still need. We could instead let several neurons examine the inputs with different weights.",
  "Work on multilayer networks made this possibility useful by learning internal representations, rather than requiring a person to specify every intermediate feature. Rumelhart, Hinton and Williams' 1986 backpropagation paper showed hidden units developing features relevant to the task while the network learned from its output errors.",
  "In a dense layer, every output unit receives all the incoming values, but each has its own weights and bias. One can respond to one combination while another responds to a different combination. Their outputs become the next layer's inputs. Nonlinear activations matter here: without them, stacking these linear combinations would still amount to a single affine transformation."),

  "backpropagation": history("Which Earlier Weight Helped Produce the Mistake?", [backprop],
  "When a network gives a wrong answer, we can compare its final prediction with the target. But the prediction may have passed through many layers. An early weight did not produce the answer directly, so we need to work out how its influence travelled through the later calculations.",
  "Backpropagation draws on the chain rule and earlier work on reverse differentiation. The 1986 paper by Rumelhart, Hinton and Williams helped demonstrate its value for learning the hidden representations of neural networks. The central problem was assigning a useful adjustment signal to connections far from the output.",
  "We record the calculations on the way forward. Starting from the loss, we then pass derivatives backward through those same operations, reusing intermediate results. Each derivative says how a small local change would affect the final loss. Backpropagation computes those sensitivities; an optimiser uses them to choose the actual weight updates."),

  "loss-functions": history("What Should Count as a Worse Answer?", [
    source("Huber (1964), Robust Estimation of a Location Parameter", "https://doi.org/10.1214/aoms/1177703732"),
  ],
  "A model needs a numerical way to compare mistakes. If one prediction is slightly wrong and another is badly wrong, how much more should the second count? The answer determines which compromises the training procedure will make.",
  "Least squares established one influential answer by squaring discrepancies. But unusually large observations can then dominate the fit. Huber's 1964 work on robust estimation studied procedures that remain useful when the assumed distribution is slightly wrong, motivating a loss that is quadratic near the centre and grows more gently in the tails.",
  "The choice of loss therefore expresses a judgement about the problem. Squared error strongly emphasises large numerical misses. Absolute error treats their growth differently. A probability loss judges the probability assigned to the observed outcome. Before differentiating a loss, we should understand what behaviour minimising it rewards and which kind of bad answer it considers expensive."),

  "embedding-layers": history("Could Related Words Share What the Model Learns?", [
    source("Bengio and colleagues (2003), A Neural Probabilistic Language Model", "https://www.jmlr.org/papers/v3/bengio03a.html"),
  ],
  "A token ID tells us which item we have, but its numerical size says nothing about the item's meaning. If every word is treated as wholly separate, learning something from one sentence offers little help with a similar sentence containing a different word.",
  "Bengio and colleagues' 2003 neural language model learned a vector for each word alongside the prediction model. Their motivation was the enormous number of possible word sequences. Related learned representations could allow evidence from one sequence to help with another that had never appeared in training.",
  "An embedding layer stores those vectors in a table. A token ID selects a row, and training adjusts the row through the task's loss. Similarity is something the learning process may produce, not a property of adjacent IDs. The table gives the rest of the network useful numerical inputs without requiring us to hand-write a list of linguistic attributes."),

  "attention": history("Why Must a Translator Remember the Whole Sentence in One Summary?", [
    source("Bahdanau, Cho and Bengio (2014), Neural Machine Translation by Jointly Learning to Align and Translate", "https://arxiv.org/abs/1409.0473"),
    transformer,
  ],
  "Imagine translating a long sentence after reading it once, while being allowed to keep only one short note. Different output words may depend on different parts of the original sentence. The note has to preserve everything that might later matter.",
  "Bahdanau, Cho and Bengio's 2014 work challenged this fixed-summary bottleneck in neural translation. Their decoder could use a weighted combination of source representations at each output step. The part of the source contributing most strongly could change as the translation progressed.",
  "Attention gives us a way to ask for relevant information. We compare a current request with the available items, turn the comparison scores into weights, and combine the information those items carry. The query, key, and value formulation used in the 2017 Transformer makes these roles explicit. We will separate those roles before calculating the scores, so the matrix operations have a purpose we can follow."),

  "positional-encoding": history("How Would a Model Know Which Word Came First?", [transformer],
  "The same words can describe different events when we change their order. A collection of word representations alone does not distinguish who acted on whom. If our architecture no longer processes tokens one after another, we need another way to make their positions available.",
  "The 2017 Transformer removed recurrence from its sequence-processing architecture and added positional information to token embeddings. Its paper considered learned positions and used a fixed pattern of sine and cosine values in the reported model.",
  "Think of attaching an address to each token's representation. The content says which token is present; the positional information helps identify where it appears. Different position schemes provide different ways to compare addresses, including relative separations. Position is additional information for the model to use, not a guarantee that it will interpret every ordering correctly."),

  "recurrent-layers": history("Could the Previous Step Leave a Useful Memory?", [
    source("Elman (1990), Finding Structure in Time", "https://doi.org/10.1207/s15516709cog1402_1"),
  ],
  "A sound or word often means something different depending on what preceded it. If we process each observation independently, we throw away that context before making the next prediction. We need a representation that can carry something forward.",
  "Elman's 1990 Finding Structure in Time explored recurrent connections as a way to give a network a changing internal memory. Instead of representing time only by placing a fixed window of observations side by side, the network's state could reflect the sequence it had processed.",
  "At each step, a recurrent layer combines the new input with its previous hidden state and produces an updated state. The same parameters are reused along the sequence. This lets history influence the present computation without storing the entire past explicitly, but information can be weakened or overwritten. Longer-range memory requires careful architecture and training rather than following automatically from recurrence."),

  "residual-connections": history("Why Did Adding More Layers Make Training Worse?", [
    source("He and colleagues (2015), Deep Residual Learning for Image Recognition", "https://arxiv.org/abs/1512.03385"),
  ],
  "If a network already gives a useful representation, adding layers seems as though it should at least preserve that result. The new layers could simply pass the representation through. In practice, learning that apparently simple behaviour was not always easy, and deeper networks could have worse training error.",
  "He and colleagues addressed this degradation problem in their 2015 residual-network paper. A block was asked to learn a change relative to its input, with a shortcut carrying the input alongside the learned transformation.",
  "The output combines the original representation with the block's proposed adjustment. If little needs changing, a small adjustment is easier to express than rebuilding the whole representation. The shortcut also supplies a direct route for information and derivatives. It helps optimisation, but it does not mean every extra layer improves a model or that incompatible shapes can be added without a projection."),

  "dropout": history("What Happens When a Neuron Cannot Rely on the Same Partners?", [
    source("Srivastava and colleagues (2014), Dropout: A Simple Way to Prevent Neural Networks from Overfitting", "https://www.jmlr.org/papers/v15/srivastava14a.html"),
  ],
  "A large network can learn combinations that work very well on its training examples but depend too closely on their particular details. We would like useful signals to remain useful when some of their usual partners are absent.",
  "The dropout work developed by Hinton and colleagues, presented in detail by Srivastava and colleagues in 2014, randomly omitted units during training. It offered a practical way to discourage fragile co-adaptation and obtain some of the benefits of combining many different thinned networks.",
  "On a training pass, a random mask removes selected activations. On another pass, a different mask is used. The model must distribute useful information across these changing conditions. At evaluation, random dropping is disabled and the chosen scaling convention keeps magnitudes consistent. Dropout changes the learning environment; it does not permanently delete the selected neurons."),

  "normalisation-layers": history("Could We Give Each Layer a More Manageable Scale?", [
    source("Ioffe and Szegedy (2015), Batch Normalization", "https://arxiv.org/abs/1502.03167"),
    source("Ba, Kiros and Hinton (2016), Layer Normalization", "https://arxiv.org/abs/1607.06450"),
  ],
  "As earlier layers change during training, the numbers arriving at later layers change too. Their scale can make optimisation sensitive to initial weights and learning rates. We would like some control over those magnitudes inside the network, as well as at its input.",
  "Ioffe and Szegedy introduced batch normalization in 2015 as a way to accelerate training, originally motivating it through changing internal input distributions. Ba, Kiros and Hinton introduced layer normalization in 2016, addressing limitations associated with batch-dependent statistics, including their use in recurrent networks. The original motivation should not be mistaken for a complete account of why normalisation improves optimisation.",
  "Both approaches measure a centre and spread, rescale activations, and allow learned adjustments afterward. What differs is which values form the group being measured. Batch normalisation uses batch-related statistics; layer normalisation works across features within an example. That choice affects training, evaluation, and whether one example's output depends on others in the batch."),

  "training-a-network": history("How Do We Turn a Collection of Parts into a Learning Procedure?", [
    source("LeCun and colleagues (1998), Efficient BackProp", "https://cseweb.ucsd.edu/classes/wi08/cse253/Handouts/lecun-98b.pdf"),
  ],
  "Knowing how a neuron calculates an output does not yet tell us how to train a useful network. We still have to decide how to initialise it, how many examples to process together, how to measure mistakes, and how far to move the parameters after each measurement.",
  "As backpropagation became widely used, practical training work showed that these choices mattered greatly. LeCun and colleagues' 1998 Efficient BackProp collected advice on making gradient-based learning work well, including input preparation, initialisation, and optimisation.",
  "A training loop connects the parts in a particular order. Run examples forward, measure a loss, compute derivatives backward, and let the optimiser update the parameters. Repeat while checking performance on separate data. Each stage has a distinct responsibility. A falling training loss tells us that this loop is fitting the examples; validation helps us decide whether the resulting behaviour is useful beyond them."),

  "radial-basis-networks": history("Could Several Local Responses Describe a Complicated Relationship?", [
    source("Broomhead and Lowe (1988), Multivariable Functional Interpolation and Adaptive Networks", "https://www.deepscn.com/pdfs/Broomhead%20and%20Lowe_1988.pdf"),
  ],
  "A single global rule can be a poor description when a relationship behaves differently in different regions. We might instead place a set of reference points and let each contribute most strongly near its own part of the input space.",
  "Broomhead and Lowe's 1988 paper connected adaptive networks with multivariable interpolation using radial basis functions. This supplied another route to learning a function: combine responses centred on particular locations rather than relying only on successive layers of weighted sums and thresholds.",
  "A radial response depends on distance from a centre. With a Gaussian response, nearby inputs activate it strongly and distant inputs activate it weakly. A final weighted combination joins these local responses into a prediction. Centre placement and response width determine how much the regions overlap, so they control whether the model is too local, too smooth, or a useful compromise."),

  "convolution": history("Should an Edge Need a Different Detector in Every Corner?", [
    source("LeCun and colleagues (1989), Backpropagation Applied to Handwritten Zip Code Recognition", "https://doi.org/10.1162/neco.1989.1.4.541"),
  ],
  "An edge can appear on the left or right of an image. If a model treats every pixel position as unrelated, it must learn the same useful pattern repeatedly. We would like a detector learned in one region to be usable elsewhere.",
  "Convolution already had a long history in mathematics and signal processing. In neural image recognition, LeCun and colleagues' 1989 handwritten zip-code work used local connections and shared weights so that feature detection did not have to be relearned independently at every location.",
  "A small array of weights examines one neighbourhood of pixels, then the same weights examine the next neighbourhood. The resulting map records where that local pattern produced a response. Sharing the weights reduces the number of parameters and expresses a useful assumption about images. The operation used in many neural libraries is technically cross-correlation, with no filter reversal; the lesson states the convention used here."),

  "pooling": history("Does a Feature's Exact Pixel Position Always Matter?", [
    source("Fukushima (1980), Neocognitron: A Self-Organizing Neural Network Model for a Mechanism of Pattern Recognition Unaffected by Shift in Position", "https://doi.org/10.1007/BF00344251"),
  ],
  "If a handwritten stroke moves slightly, we usually still regard it as the same stroke. A feature map may change at several individual positions, though, and carrying every small positional change into the next stage can make recognition unnecessarily sensitive.",
  "Fukushima's 1980 neocognitron alternated feature-detecting stages with stages intended to tolerate shifts. This is an important part of the history behind pooling and subsampling in later convolutional networks, though its units should not be treated as identical to a modern max-pooling operation.",
  "Pooling summarises responses in a neighbourhood. Taking the maximum asks whether a strong response occurred somewhere inside it; taking the average measures the overall response there. A smaller output can be less sensitive to small shifts, but the summary loses detail. That tradeoff matters when the task requires precise locations rather than just recognition."),

  "shapes-and-flattening": history("How Does a Grid of Features Reach a Final Decision?", [lenet],
  "An image-processing layer may produce several grids, one for each detected feature. A later layer may expect a single list of values per example. These are different organisations of numbers, so connecting them requires an explicit agreement about dimensions and ordering.",
  "Document-recognition networks such as LeNet, described by LeCun and colleagues in 1998, combined spatial feature maps with later classification stages. That practical boundary makes shape bookkeeping important. Flattening is an array operation used to cross such boundaries, not a separate learning algorithm with a single invention story.",
  "Flattening lays the existing values out in a fixed order. It does not calculate new evidence or learn which feature matters. The following layer does that. If we mix the example dimension with the feature dimensions, we can accidentally combine different observations. We will therefore name what each axis represents before changing the arrangement."),

  "convolutional-networks": history("Could a Machine Read Handwriting Without Hand-Written Rules for Every Style?", [lenet],
  "People write the same digit with different thicknesses, positions, and shapes. Listing rules for every possible version becomes unmanageable. We need a method that can learn useful local patterns and combine them into larger ones.",
  "LeCun and colleagues' 1998 document-recognition paper described convolutional networks trained for tasks including handwritten character recognition. It brought together shared local feature detectors, subsampling, and gradient-based training as parts of a complete recognition system.",
  "Early layers can respond to small patterns. Later layers combine responses from larger regions, and a final stage turns the resulting representation into a decision. The features are learned through the task rather than all being specified in advance. This structure gives the model useful assumptions about images, while labelled examples teach it which combinations support the categories we want."),

  "u-net": history("How Do We Identify an Object Without Losing Its Boundary?", [
    source("Ronneberger, Fischer and Brox (2015), U-Net: Convolutional Networks for Biomedical Image Segmentation", "https://arxiv.org/abs/1505.04597"),
  ],
  "Knowing that a microscope image contains cells is not enough if we need to measure each cell. We need to identify which pixels belong to the object. Reducing an image through a classification network helps collect context, but it can discard the fine detail needed to draw a boundary.",
  "Ronneberger, Fischer and Brox introduced U-Net in 2015 for biomedical image segmentation. The original work addressed learning from relatively few annotated images, using data augmentation. It used labelled training data: example images were paired with annotations showing the regions the network should identify.",
  "The contracting path collects broader context as spatial resolution decreases. The expanding path builds a detailed output again. Connections from earlier high-resolution stages supply location information that the compressed representation alone may lack. The network can therefore combine what a region appears to contain with where its boundaries lie. Those connections support localisation; the labelled examples still teach the desired segmentation."),
};
