import { history, source } from "./types";

export const wordVectors = {
  "a-vector-for-a-word": history("Could a Word's Surroundings Tell Us Something About It?", [
    source("Harris (1954), Distributional Structure", "https://doi.org/10.1080/00437956.1954.11659520"),
  ],
  "If we encounter an unfamiliar word, the sentences around it often offer clues. It may occur beside words about food, movement, or measurement. A numerical representation could retain some of those recurring relationships instead of merely giving the word an arbitrary ID.",
  "Harris' 1954 work on distributional structure examined language through the environments in which its elements occur. This is an important linguistic foundation for later representations based on word context. It did not introduce today's embedding algorithms, but it supplied a reason to treat usage patterns as evidence.",
  "We can begin with a list of context counts, one coordinate per context. Words used in similar environments then have similar lists. Later methods compress or learn those coordinates. The vector represents regularities in the observed language, not a complete dictionary definition, and words with opposing meanings can still be close when they occur in similar sentences."),

  "distance-and-similarity": history("How Could a Search Engine Compare Two Lists of Words?", [
    source("Salton, Wong and Yang (1975), A Vector Space Model for Automatic Indexing", "https://doi.org/10.1145/361219.361220"),
  ],
  "A query and a document rarely contain exactly the same text. A search system therefore needs a graded comparison rather than an exact match. Once terms are represented as coordinates, the problem becomes deciding which geometric relationship reflects relevance.",
  "Salton, Wong and Yang's 1975 vector-space work examined representations for automatic document indexing. Representing documents and requests in a common space made comparisons between them explicit numerical operations, helping establish the vector view used throughout information retrieval.",
  "Distance measures separation between points. Cosine similarity compares direction, which can be useful when vector length reflects document size more than subject matter. A dot product retains sensitivity to length unless vectors are normalised. None of these comparisons creates meaning by itself; each interprets the representation we supplied. We therefore need to understand both the vectors and the comparison rule."),

  "word2vec": history("Could a Small Prediction Task Learn Useful Word Relationships?", [
    source("Mikolov and colleagues (2013), Efficient Estimation of Word Representations in Vector Space", "https://arxiv.org/abs/1301.3781"),
    source("Mikolov and colleagues (2013), Distributed Representations of Words and Phrases and Their Compositionality", "https://arxiv.org/abs/1310.4546"),
  ],
  "Learning a complete language model can be expensive when our immediate goal is only a useful vector for each word. We would like a simpler task that still forces those vectors to capture relationships in the text.",
  "Mikolov and colleagues' 2013 word2vec work used efficient prediction objectives to learn word representations from large corpora. Continuous bag of words predicts a word from nearby context, while skip-gram predicts nearby words from a central word. Later work that year described negative sampling and other practical improvements.",
  "The vectors become useful because training repeatedly asks them to support these local predictions. Words appearing in comparable environments receive related learning signals. Negative sampling contrasts observed pairs with sampled alternatives, reducing the work needed for each update. Similarity then reflects the corpus and prediction objective, with one stored vector per word unable to cleanly separate every possible sense."),

  "fasttext": history("What If the Word Was Absent but Its Parts Were Familiar?", [
    source("Bojanowski and colleagues (2016), Enriching Word Vectors with Subword Information", "https://arxiv.org/abs/1607.04606"),
  ],
  "A word-level embedding table has no trained row for a completely unseen spelling. This is especially awkward when the spelling is an ordinary inflection of a familiar word. Its stem and ending may be informative even though the exact whole word was missing.",
  "Bojanowski and colleagues' work, released in 2016 and published in 2017, extended word representations with character n-grams. The motivation was to share information across word forms and improve representations of rare or unseen words, including in morphologically rich languages.",
  "Each word draws on vectors for its character fragments, and known words can also have their own contribution. Related spellings therefore share parameters. An unfamiliar word can obtain a representation from the fragments it contains. This offers a useful fallback, but spelling similarity is only evidence: unrelated words can share fragments, and similar meanings need not share letters."),

  "glove": history("Could the Pattern of Co-Occurrence Counts Become a Compact Vector?", [
    source("Pennington, Socher and Manning (2014), GloVe: Global Vectors for Word Representation", "https://aclanthology.org/D14-1162/"),
  ],
  "A corpus tells us which words appear near one another, but a full table of those counts can be enormous. We want compact vectors that preserve informative relationships in that table without merely giving the most frequent words the largest influence.",
  "Pennington, Socher and Manning introduced GloVe in 2014, connecting global co-occurrence statistics with learned word vectors. Their motivation included the information in ratios of co-occurrence probabilities: a context can help distinguish two words when it is associated much more strongly with one than the other.",
  "GloVe fits vector interactions and bias terms to log co-occurrence counts, with a weighting function controlling how count sizes contribute. The result is a compressed representation of observed context relationships. The fitting objective explains why corpus preparation and the context window matter. It also reminds us that the vectors model usage statistics rather than a complete account of language."),

  "latent-semantic-analysis": history("Could a Search Find the Topic Without Finding the Exact Word?", [
    source("Deerwester and colleagues (1990), Indexing by Latent Semantic Analysis", "https://www.cs.csustan.edu/~mmartin/LDS/Deerwester-et-al.pdf"),
  ],
  "A document can discuss the subject of a query without using the same vocabulary. Conversely, a matching word may have a different meaning in the document. Exact term overlap therefore misses some relationships and invents others.",
  "Deerwester and colleagues' 1990 latent semantic indexing work addressed this problem by modelling underlying structure in a term-document table. They used a reduced singular value decomposition to capture major patterns of association while suppressing some of the table's finer variation.",
  "Think of documents that repeatedly use overlapping sets of words. A smaller collection of shared directions can describe those patterns, placing related documents and terms closer even without exact overlap. The dimensions are mathematical components, not guaranteed human-readable topics. Reducing the table can reveal useful structure while also discarding distinctions we may need."),

  "pointwise-mutual-information": history("Are Those Words Associated, or Just Common?", [
    source("Church and Hanks (1990), Word Association Norms, Mutual Information, and Lexicography", "https://aclanthology.org/J90-1003/"),
  ],
  "Two words may appear together frequently simply because both appear everywhere. Raw co-occurrence counts cannot tell us whether the pairing is especially informative. We need a baseline for how often they would meet without an association.",
  "Church and Hanks' 1990 work used an information-theoretic association measure to help identify meaningful word relationships in corpora. The practical concern was lexicographic evidence: which recurring combinations deserve attention beyond the ordinary frequency of their separate words?",
  "Pointwise mutual information compares the observed joint frequency with the frequency expected under independence. A positive value means the pair occurs together more often than that baseline predicts. This gives us a relative measure of association, but rare pairs can receive large values from very little evidence. The score therefore needs to be interpreted alongside the counts that produced it."),
};
