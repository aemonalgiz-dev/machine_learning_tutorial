import { history, source } from "./types";

export const representations = {
  "random-indexing": history("Could We Build Context Vectors Without Storing the Whole Table?", [
    source("Kanerva, Kristoferson and Holst (2000), Random Indexing of Text Samples for Latent Semantic Analysis", "https://redwood.berkeley.edu/wp-content/uploads/2020/08/cogsci2k-poster.pdf"),
  ],
  "A word-context table can grow with both the vocabulary and the number of contexts. Building the full table and then compressing it may become expensive. We would like to accumulate a compact representation as observations arrive.",
  "Kanerva, Kristoferson and Holst's 2000 random-indexing work proposed using sparse random index vectors for contexts. Word representations could then be built by accumulating the index vectors of the contexts in which the words occurred.",
  "Each context receives a short random signature with only a few nonzero entries. A word adds the signatures of its observed contexts. Words with similar context histories therefore accumulate similar patterns, without reserving a separate coordinate for every context. The random signatures make an approximate representation possible; they do not assign linguistic meaning in advance or preserve every original count exactly."),

  "paragraph-vectors": history("Could a Whole Document Have a Learned Representation?", [
    source("Le and Mikolov (2014), Distributed Representations of Sentences and Documents", "https://arxiv.org/abs/1405.4053"),
  ],
  "Individual word vectors do not automatically describe a whole review or article. Averaging them is a useful baseline, but we may want a representation learned specifically to retain information about the surrounding document.",
  "Le and Mikolov introduced Paragraph Vector in 2014. Their methods learned vectors associated with text passages through word-prediction tasks, extending the idea that a useful representation can be learned by asking it to support predictions about the text.",
  "A passage vector supplies information shared across predictions drawn from that passage. In one formulation it helps predict a word alongside local context; in another it predicts sampled words from the passage. A new document requires an inference procedure for its vector, rather than automatically receiving a trained row. The representation reflects the prediction task and does not preserve every sentence or word order exactly."),

  "pooling-a-text": history("How Much Can We Learn from a Simple Summary of the Words?", [
    source("Iyyer and colleagues (2015), Deep Unordered Composition Rivals Syntactic Methods for Text Classification", "https://aclanthology.org/P15-1162/"),
  ],
  "Texts have different lengths, while many downstream models expect a fixed number of inputs. Before building a complicated sequence model, we can ask whether a simple summary of the token vectors already captures enough for our task.",
  "Iyyer and colleagues' 2015 work on deep averaging networks showed that unordered combinations of word embeddings could support effective text classification. It provided a practical reminder that modelling detailed syntax is not necessary for every useful baseline.",
  "Mean pooling averages the available vectors, sum pooling accumulates them, and max pooling keeps the largest value in each coordinate. Each produces a fixed-size representation while retaining different information about length and repeated evidence. Ignoring order can work for some broad topics, but it can also confuse statements whose meanings depend on who did what or where a negation appeared."),

  "n-grams": history("Could a Short Memory Capture Some of a Language's Structure?", [
    source("Shannon (1948), A Mathematical Theory of Communication", "https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf"),
  ],
  "Counting single words tells us that they are common, but not which ones tend to occur together. A short phrase can carry information that disappears when its words are considered separately. We need some memory of neighbouring items without storing every possible sentence.",
  "Shannon's 1948 communication paper illustrated increasingly structured approximations to English by incorporating dependencies between successive symbols and words. Short-context models offered a manageable way to represent some of the order in language.",
  "An n-gram is a consecutive group of a chosen length. Counting these groups preserves local order, whether the units are characters or words. The representation remains limited by its window: distant relationships fall outside it, and longer groups quickly become rare. This explains both the usefulness of short recurring phrases and the need to handle sequences that were absent from training."),

  "codebook-quantisation": history("Could We Store the Nearest Representative Instead of Every Number?", [
    source("Linde, Buzo and Gray (1980), An Algorithm for Vector Quantizer Design", "https://doi.org/10.1109/TCOM.1980.1094577"),
  ],
  "A signal represented by many precise numbers can be expensive to store or transmit. If nearby vectors are similar enough for our purpose, perhaps we can replace them with one shared representative and store only its address.",
  "Vector quantisation developed around this compression problem. Linde, Buzo and Gray's 1980 work described an iterative algorithm for designing a codebook of representative vectors. Assignment and representative updates were used together to reduce distortion.",
  "The encoder finds the nearest codebook entry and records its index. The decoder retrieves that entry. Many different inputs can share the same code, so reconstruction loses detail. More representatives can reduce that loss while requiring more storage. The method makes the tradeoff explicit: the code identifies a representative region, not an exact copy of the original vector."),

  "finite-scalar-quantisation": history("Could a Small Grid Replace a Learned Catalogue of Codes?", [
    source("Mentzer and colleagues (2023), Finite Scalar Quantization: VQ-VAE Made Simple", "https://arxiv.org/abs/2309.15505"),
  ],
  "A learned vector codebook introduces its own training difficulties. Some entries may be used rarely or never, and the system needs to learn both the representation and the catalogue of allowed replacements. We can ask whether the discrete structure can be specified more simply.",
  "Mentzer and colleagues' 2023 finite scalar quantisation work used a small number of bounded scalar dimensions, rounding each to a fixed set of levels. The combinations of those levels provide an implicit codebook rather than a separately learned list of vectors.",
  "Picture a grid of allowed coordinates. The encoder learns where to place an input, and rounding selects a grid point. The decoder learns what to reconstruct from that choice. Fixing the grid removes the need to learn individual codebook entries, but it does not eliminate quantisation error or guarantee that every combination will be useful for the data."),
};
