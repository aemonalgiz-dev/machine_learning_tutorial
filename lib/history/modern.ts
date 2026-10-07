import { history, source } from "./types";

export const modern = {
  "transformer-blocks": history("Could Every Position Consult the Others Directly?", [
    source("Vaswani and colleagues (2017), Attention Is All You Need", "https://arxiv.org/abs/1706.03762"),
  ],
  "A recurrent network carries information through successive steps. When two words are far apart, their relationship may have to survive many intermediate operations. The sequential processing also limits how much of a training sequence can be computed at once.",
  "Vaswani and colleagues introduced the Transformer in 2017 for sequence transduction, including translation. It made attention the main means of exchanging information across positions, without the recurrent or convolutional layers used by many earlier systems.",
  "A block first lets positions gather information through attention. A feed-forward stage then transforms each position's updated representation. Residual connections and normalisation help these stages work together in a trainable stack. The block is useful because it separates communication between positions from processing within a position. A language generator additionally restricts which positions can be consulted, so training does not reveal the next token's answer."),

  "next-token-prediction": history("Could Predicting the Next Symbol Teach Us About Language?", [
    source("Shannon (1948), A Mathematical Theory of Communication", "https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf"),
  ],
  "After reading the beginning of a sentence, some continuations seem much more plausible than others. A model that predicts the next piece of text must learn something about spelling, recurring expressions, and longer relationships if it is to keep making useful predictions.",
  "In his 1948 work on communication, Claude Shannon illustrated statistical approximations to English using progressively more structure in symbol and word sequences. This was not a modern language model, but it established a useful perspective: language can be studied through conditional probabilities and the uncertainty remaining about what comes next.",
  "A next-token model turns that perspective into a training task. The earlier tokens are the input, and the following token supplies an observed target. Text therefore supplies many examples without someone labelling each sentence by hand. Predicting the target well requires useful regularities, but it does not by itself guarantee that a generated statement is true or that the model will follow an instruction."),

  "autoregressive-generation": history("How Does One Prediction Become a Whole Passage?", [
    source("Radford and colleagues (2019), Language Models Are Unsupervised Multitask Learners", "https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf"),
  ],
  "A model that predicts the next token produces only one distribution at a time. To write a passage, we need to decide what happens after that prediction. The token we select becomes part of the context for the following decision.",
  "Autoregressive sequence modelling predates today's large language models. GPT-2, described by Radford and colleagues in 2019, is a familiar application: a Transformer language model trained to predict text from its preceding context could continue supplied passages and perform tasks expressed through that context.",
  "Generation repeats a short procedure. Read the available context, calculate next-token probabilities, choose a token, append it, and continue until a stopping condition is reached. Every choice changes the input to later predictions. This explains both the flexibility and a weakness of the procedure: an early mistake can become context that later tokens elaborate rather than correct."),

  "sampling-and-temperature": history("Why Does Always Choosing the Favourite Produce Dull Text?", [
    source("Holtzman and colleagues (2019, revised 2020), The Curious Case of Neural Text Degeneration", "https://arxiv.org/abs/1904.09751"),
  ],
  "A sentence can have several reasonable continuations. Always selecting the highest-scoring option sounds safe, but repeated local choices can produce repetitive or uninteresting passages. Sampling indiscriminately has the opposite problem: very unlikely tokens can derail the continuation.",
  "Holtzman and colleagues examined this difficulty in work first released in 2019. They showed that decoding choices could strongly change text quality with the same underlying language model, and proposed nucleus sampling to retain a changing set of plausible candidates.",
  "Temperature adjusts how concentrated the probability distribution is before sampling. A lower positive temperature emphasises the larger scores; a higher one spreads probability more broadly. Top-k and nucleus sampling instead restrict which candidates remain available. These controls change how we use the learned distribution. They do not add knowledge or make randomness a substitute for a well-trained model."),

  "autoencoders": history("What Must We Keep If We Need to Rebuild the Input?", [
    source("Hinton and Salakhutdinov (2006), Reducing the Dimensionality of Data with Neural Networks", "https://doi.org/10.1126/science.1127647"),
  ],
  "Imagine describing an image with a much shorter list of numbers, then asking someone to reconstruct it from that list alone. If the description is too short to copy every pixel, it must preserve some of the structure that makes the image recognisable.",
  "Autoencoders developed as networks trained to reproduce their inputs through an internal representation. Hinton and Salakhutdinov's 2006 work demonstrated deep networks learning low-dimensional codes that could preserve structure beyond what a linear projection captured.",
  "The encoder produces the code, and the decoder attempts the reconstruction. A restriction, such as a narrow code or another regularising constraint, makes simple copying harder and encourages useful structure. Reconstruction supplies the training target, so separate category labels are not necessary. A code useful for reconstruction is not automatically useful for every later task, and an unrestricted network may learn little more than an identity mapping."),

  "variational-autoencoders": history("Could We Choose a New Code and Obtain a Plausible Example?", [
    source("Kingma and Welling (2013), Auto-Encoding Variational Bayes", "https://arxiv.org/abs/1312.6114"),
  ],
  "An ordinary autoencoder can give each training example a code, but that does not tell us where to choose a new code for generation. Unused regions between familiar codes may decode poorly. We need a model of how the hidden codes themselves are distributed.",
  "Kingma and Welling's 2013 work developed efficient learning and approximate inference for models with continuous latent variables. A key contribution was reparameterising a random draw so that gradient-based training could adjust the distribution's parameters.",
  "The encoder describes a distribution of possible codes for an input. The decoder learns to reconstruct from samples, while the objective encourages those code distributions to remain compatible with a chosen prior. We can later draw from that prior and decode. Reconstruction quality and the distribution constraint compete, so the method learns an organised generative representation rather than simply assigning an unrelated address to each example."),

  "generative-adversarial-networks": history("Could Another Model Tell the Generator What Looks Wrong?", [
    source("Goodfellow and colleagues (2014), Generative Adversarial Networks", "https://arxiv.org/abs/1406.2661"),
  ],
  "Writing a formula for whether an image looks plausible is difficult. Pixel-by-pixel agreement with one target is also a poor description of all the different images that could be valid. We would like a learning signal that can adapt to the kinds of mistakes a generator makes.",
  "Goodfellow and colleagues proposed generative adversarial networks in 2014. They trained a generator alongside a discriminator that distinguishes generated samples from examples in the dataset. The discriminator supplies a changing learning signal instead of relying only on a fixed reconstruction target.",
  "The generator maps a random input to a proposed example. The discriminator examines examples from both sources. As the discriminator learns distinctions, the generator is trained to produce examples that defeat them. This interaction can teach rich structure, but the two learning processes can become unbalanced, and a generator may produce only a narrow selection of the possible outputs."),

  "diffusion-models": history("Could Learning to Remove Noise Teach a Model to Generate?", [
    source("Sohl-Dickstein and colleagues (2015), Deep Unsupervised Learning Using Nonequilibrium Thermodynamics", "https://arxiv.org/abs/1503.03585"),
    source("Ho, Jain and Abbeel (2020), Denoising Diffusion Probabilistic Models", "https://arxiv.org/abs/2006.11239"),
  ],
  "Creating a detailed image in one operation is a difficult task. Adding a little noise to an existing image is easy, and learning to account for a small corruption gives us a more manageable question. What if we could organise generation as many such steps?",
  "Sohl-Dickstein and colleagues' 2015 diffusion work modelled data through a gradual noising process and a learned reverse process. Ho, Jain and Abbeel's 2020 work developed a particularly effective denoising formulation for image generation.",
  "During training, we corrupt examples by known amounts and teach a model to estimate the noise or an equivalent denoising quantity. During generation, we start with noise and repeatedly apply learned reverse steps. Each step is conditioned on where we are in the process. This does not recover a uniquely hidden original image from arbitrary noise; it samples a new example using regularities learned from the training data."),

  "supervised-fine-tuning": history("Why Does a Text Predictor Need Examples of Following Instructions?", [
    source("Ouyang and colleagues (2022), Training Language Models to Follow Instructions with Human Feedback", "https://arxiv.org/abs/2203.02155"),
  ],
  "A model trained to continue text has seen questions, answers, stories, arguments, and many other patterns. Given a request, it may continue the wording without doing what the person wanted. Predicting plausible text and providing a useful response are related tasks, but they are not identical.",
  "The 2022 InstructGPT work used demonstrations written by labelers to fine-tune a pretrained model before later preference-based training. That supervised stage gave explicit examples of the response behaviour the system was intended to produce.",
  "Supervised fine-tuning continues training with input-output pairs chosen for a task. The desired response supplies the target tokens. We are adapting an existing model's behaviour rather than learning language entirely from scratch. The demonstrations therefore matter: their coverage, correctness, and style influence what the adapted model learns, and performance still needs checking on unfamiliar requests."),

  "reinforcement-learning": history("How Do We Learn When the Consequence Arrives Later?", [
    source("Watkins and Dayan (1992), Q-Learning", "https://doi.org/10.1007/BF00992698"),
  ],
  "Suppose an agent is moving through a maze. We may know when it reaches the exit without having a labelled correct move for every location. Some useful moves initially take it away from the exit, so judging each action only by its immediate reward can be misleading.",
  "Reinforcement learning brings together ideas from trial-and-error learning and the study of sequential decisions. Watkins' Q-learning, analysed with Dayan in 1992, gave an agent a way to improve estimates of action quality from experience without first learning a complete model of the environment.",
  "The agent observes a state, chooses an action, receives a reward and a new state, and updates what it expects from similar choices. A value estimate includes possible later rewards, allowing useful outcomes to inform earlier decisions. Exploration supplies experience beyond the current favourite action. The learned behaviour depends on what the reward measures, which may differ from what we actually hoped the agent would accomplish."),

  "low-rank-adaptation": history("Must We Change Every Weight to Teach a Model a New Task?", [
    source("Hu and colleagues (2021), LoRA: Low-Rank Adaptation of Large Language Models", "https://arxiv.org/abs/2106.09685"),
  ],
  "A large pretrained model already contains a useful representation. Updating every weight for each new task can require substantial training memory and a separate large set of parameters to store for every adaptation. We would like to preserve most of that shared work.",
  "Hu and colleagues introduced LoRA in 2021, motivated by the possibility that useful task-specific changes occupy a much smaller space than the full weight matrices. They froze pretrained weights and learned low-rank updates through smaller matrices.",
  "The original transformation remains available. Two smaller learned transformations together provide an adjustment to it. Their restricted size limits the rank of the update, reducing the number of trainable parameters. This is an assumption about the changes needed for adaptation, not a claim that the original model itself has only a few useful directions. The rank controls the capacity of the adjustment."),

  "retrieval-augmented-generation": history("Could the Model Consult a Reference Before Answering?", [
    source("Lewis and colleagues (2020), Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks", "https://arxiv.org/abs/2005.11401"),
  ],
  "A language model's weights are an awkward place to keep every fact we might later need. Updating a document does not automatically update the model, and an answer drawn only from its parameters may provide no clear reference for checking where the information came from.",
  "Lewis and colleagues' 2020 RAG work combined a pretrained generator with retrieval from an external document index. It addressed knowledge-intensive tasks by allowing the model to condition generation on retrieved passages as well as its learned parameters.",
  "A retriever first finds material related to the request. The generator then uses that material as part of its context when producing an answer. The documents can be maintained separately from the model, but this creates several things to check: whether retrieval found the right material, whether the material supports the answer, and whether the generator used it faithfully. Access to a reference does not guarantee a correct reading of it."),

  "evaluating-generative-models": history("How Do We Judge an Answer When Several Answers Could Be Good?", [
    source("Papineni and colleagues (2002), BLEU: A Method for Automatic Evaluation of Machine Translation", "https://aclanthology.org/P02-1040/"),
    source("Heusel and colleagues (2017), GANs Trained by a Two Time-Scale Update Rule Converge to a Local Nash Equilibrium", "https://arxiv.org/abs/1706.08500"),
  ],
  "A classifier often has a specified label to compare with its prediction. A generated sentence or image may have many acceptable forms. Exact agreement with one reference can reject a good alternative, while a few attractive examples can hide repetition or failures elsewhere.",
  "Different fields developed different approximations. BLEU, introduced in 2002 for machine translation, compared candidate text with reference translations through n-gram overlap. The 2017 work introducing Fréchet Inception Distance compared distributions of image features, addressing a different problem from matching one generated image to one target.",
  "Each measure asks a limited question. We need to decide whether we care about correctness, variety, instruction following, resemblance to a distribution, or some combination. Then we choose measurements and inspect representative outputs, including failures. A single improving score cannot establish that every quality we care about improved with it."),
};
