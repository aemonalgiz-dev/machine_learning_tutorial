import { bars, plot, step, story, strips, type LessonIntuition } from "./types";

export const representations: Record<string, LessonIntuition> = {
  "random-indexing": story([
    "A word-context table can become enormous. Most entries may be empty, yet storing a separate coordinate for every possible context still makes the representation wide.",
    "Random indexing gives each context a short, fixed numerical signature. A word accumulates the signatures of contexts in which it appears."
  ], [
    step("Start with the evidence we want to keep", "If bread appears near oven and bake, we want its representation to record those observations. A full table would reserve separate places for oven, bake, and every other possible context.", strips("The useful evidence is a history of observed contexts.", [["Target word", ["bread"]], ["Observed contexts", ["oven", "bake"]]])),
    step("Assign compact signatures to contexts", "Give each context a fixed random vector, often mostly zeros with a few positive and negative entries. The initial randomness supplies a compact code. It does not mean the vector already understands the context word.", strips("Short illustrative signatures, chosen only to show the operation.", [["oven signature", ["1", "0", "-1", "0"]], ["bake signature", ["0", "1", "0", "-1"]]])),
    step("Add observed signatures to the word's record", "Each context observation contributes its signature. Words with overlapping context histories can accumulate related vectors because they repeatedly receive some of the same contributions.", strips("A standalone example with one observation of each context.", [["oven contribution", ["1", "0", "-1", "0"]], ["bake contribution", ["0", "1", "0", "-1"]], ["Accumulated bread vector", ["1", "1", "-1", "-1"]]], true)),
    step("Inspect the cost of compression", "Different histories can interfere in a short representation. Width, sparsity, and the random seed affect that interference. Compare the resulting neighbours with the task we wanted the original table to support.", strips("Compact storage trades exact context records for an approximation.", [["Choose", ["Signature width", "Signature sparsity", "Random seed"]], ["Evaluate", ["Neighbour quality", "Stability", "Storage cost"]]]))
  ], "Random codes become informative through observed use", [
    "The detailed example constructs the signatures, accumulates them, and compares the resulting word vectors.",
    "The signatures remain fixed. The corpus determines the accumulated word representations, so random initialization and learned distributional evidence have different roles."
  ]),
  "paragraph-vectors": story([
    "A document contains more than one word. If we want to find documents about similar things, we need some way to represent the document as a whole.",
    "Paragraph vectors learn a dedicated vector for each training document by giving that vector a role in predicting the document's words."
  ], [
    step("Give each training document its own vector", "The document vector begins as an adjustable numerical record, not a summary written by a person. Different documents receive different records even if their lengths differ.", strips("Each training document has a separate adjustable representation.", [["Document A", ["A recipe for bread"]], ["Document B", ["Instructions for sailing"]], ["Initial records", ["Vector for A", "Vector for B"]]])),
    step("Ask the record to help predict words", "Depending on the variant, the document vector predicts sampled words or helps local context predict a missing word. Useful information about the document can improve those predictions.", strips("One schematic prediction task.", [["Available evidence", ["Document vector", "Optional local word context"]], ["Prediction target", ["A word from that document"]]], true)),
    step("Update the representation through prediction errors", "Training adjusts the document vector and the other learned parameters. Repeated examples encourage a document vector to carry information useful across that document's predictions.", strips("Many examples shape the same document record.", [["Examples from document A", ["Prediction", "Error", "Update vector A"]], ["Examples from document B", ["Prediction", "Error", "Update vector B"]]])),
    step("Infer a vector for an unseen document", "A new document has no previously trained row to retrieve. Hold the learned model parameters fixed and optimize a new document vector using its words. The resulting vector can then be compared with existing document vectors.", strips("Inference for new text requires its own fitting step.", [["Keep fixed", ["Trained word and prediction parameters"]], ["Adjust", ["New document vector"]], ["Then", ["Compare document representations"]]], true))
  ], "A document vector learns through its contribution to a task", [
    "The worked example separates training-document vectors from inference for new text, then compares the resulting positions.",
    "This is different from simply averaging existing word vectors. Both approaches produce a fixed-size representation, but they obtain it through different operations."
  ]),
  "pooling-a-text": story([
    "One sentence may contain five words and another fifty. If every word has a vector, those sentences initially produce different numbers of vectors.",
    "Pooling combines a variable-length collection into one fixed-size vector. The main question is what information that combination keeps."
  ], [
    step("Begin with one vector per word", "Each word contributes a vector of the same width. Sentence length changes the number of vectors, while vector width stays fixed. We need one result with a predictable size for comparison or a later model.", strips("Three word vectors still form a sequence of three records.", [["Sentence", ["the", "cat", "sleeps"]], ["Representations", ["Vector for the", "Vector for cat", "Vector for sleeps"]]])),
    step("Average corresponding coordinates", "A simple pool takes the average in each coordinate. The result has the same width as one word vector, regardless of sentence length. It is a summary of the component vectors.", strips("A small standalone calculation using two illustrative vectors.", [["First vector", ["2", "4"]], ["Second vector", ["4", "2"]], ["Coordinate-wise average", ["3", "3"]]], true)),
    step("Decide whether every word should contribute equally", "Common words can dominate an unweighted summary without distinguishing documents well. A weighting rule can reduce their influence, but it introduces its own assumptions and needs frequencies from a defined source.", strips("Weighting changes each word's contribution to the summary.", [["Equal weighting", ["Every included word has equal influence"]], ["Frequency-based weighting", ["Some common words contribute less"]]])),
    step("Notice what ordinary averaging cannot preserve", "With fixed word vectors and the same weights, changing word order leaves the average unchanged. Dog bites man and man bites dog then receive the same pooled representation even though their meanings differ.", strips("The same word collection can express different events.", [["Sentence A", ["dog", "bites", "man"]], ["Sentence B", ["man", "bites", "dog"]], ["Ordinary average", ["The same pooled vector"]]]))
  ], "A fixed-size summary keeps some information and loses some", [
    "The full example calculates pooling choices and compares their results on actual text.",
    "Weighting and removing a common direction can improve some comparisons. They do not by themselves restore word order or every distinction discarded by the pooling operation."
  ]),
  "n-grams": story([
    "After reading spread butter on the, we can make a reasonable guess about what might come next. One simple way for a computer to practise this is to count what followed similar text before.",
    "An n-gram model records short consecutive token sequences. It uses those counts to estimate what may follow a limited recent context."
  ], [
    step("Choose the units before counting runs", "First decide what counts as a token. An n-gram then groups consecutive tokens; it does not choose the original token boundaries. Here we use words so the grouping is easy to see.", strips("Word tokens in a short illustrative sentence.", [["Tokens", ["spread", "butter", "on", "bread"]]])),
    step("Slide a window across the sequence", "A bigram contains two consecutive tokens. Moving the window one position at a time records overlapping pairs, so each pair preserves a small piece of local order.", strips("All bigrams from the illustrative sequence.", [["First window", ["spread", "butter"]], ["Second window", ["butter", "on"]], ["Third window", ["on", "bread"]]])),
    step("Use matching contexts to estimate the next token",
      "Collect training occurrences with the same preceding context and count their continuations. More frequent continuations receive more probability under the simple count estimate.",
      bars("Illustrative continuation counts after on, keeping one preceding word as context. These are not fitted SDK counts.",
        [["bread", 4, "4 observations"], ["toast", 2, "2 observations"]])
    ),
    step("Plan for contexts the corpus did not contain", "Longer contexts preserve more detail but usually have fewer matching observations. An unseen continuation need not be impossible, so smoothing or backing off to shorter context requires an explicit policy.", strips("Longer memory creates a data-coverage problem.", [["More context", ["More specific histories", "Fewer repeated examples"]], ["Fallback choices", ["Smoothing", "Shorter-context estimates"]]]))
  ], "Local counts provide a transparent prediction baseline", [
    "The detailed lesson calculates conditional probabilities from counts, then examines sampling and evaluation.",
    "The model's context length is a deliberate limit. Its predictions reflect the training corpus and fallback rules, rather than an understanding of everything earlier in the document."
  ]),
  "codebook-quantisation": story([
    "Imagine storing a picture using a limited palette. Each original colour is replaced by the nearest available colour, and the stored record can name that palette entry.",
    "Vector quantisation extends this idea to groups of numbers. A codebook contains representative vectors, and each input is assigned to one of them."
  ], [
    step("Start with values that vary continuously", "Inputs may be colours, image patches, or learned feature vectors. Many slightly different inputs would require different exact records if we preserved every coordinate.", plot("Illustrative two-coordinate inputs before compression.", [[1, 1], [1.2, 1.4], [1.5, 1.1], [3.5, 3], [4, 3.5], [4.2, 3]], "First coordinate", "Second coordinate")),
    step("Choose representative vectors", "A codebook provides a limited set of possible replacements. Its entries may be learned from data so they represent frequently occurring inputs well. More entries allow more choices, with additional storage and lookup cost.", plot("Two illustrative representatives, placed by hand.", [[1.25, 1.2, 1], [3.9, 3.2, 1], [1, 1], [1.2, 1.4], [1.5, 1.1], [3.5, 3], [4, 3.5], [4.2, 3]], "First coordinate", "Second coordinate", { labels: ["Code A", "Code B"] })),
    step("Replace each input with its nearest entry", "A distance rule selects the representative. Several nearby inputs can receive the same code, so the code identifies a region of the input space rather than preserving each original input.", strips("Several distinct inputs can share one representative.", [["Inputs near A", ["First input", "Second input", "Third input"]], ["Stored codes", ["A", "A", "A"]]], true)),
    step("Decode and inspect the lost detail", "Decoding retrieves the codebook vector. It cannot distinguish inputs assigned to the same entry, so reconstruction is usually approximate. Compare the reconstruction error and code usage before deciding the compression is useful.", strips("The codebook supplies the reconstructed value.", [["Stored code", ["A"]], ["Decoded value", ["Representative vector A"]], ["Check", ["Difference from the original input"]]], true))
  ], "A discrete code names a representative, not the exact input", [
    "The full example learns or inspects the codebook, assigns inputs, and reconstructs them so the approximation is visible.",
    "These codes are different from arbitrary text vocabulary IDs: assignment here depends on distance to numerical representatives."
  ]),
  "finite-scalar-quantisation": story([
    "A measuring instrument may report only a few permitted settings even when the quantity changes continuously. Rounding replaces the exact reading with one of those settings.",
    "Finite scalar quantisation applies a defined set of levels to each vector coordinate. The combination of selected levels becomes a discrete code."
  ], [
    step("Give each coordinate a small set of levels", "Instead of learning a collection of whole-vector representatives, define allowed values for each coordinate. Their combinations form a grid of possible reconstructed vectors.", strips("A tiny illustrative grid with two coordinates.", [["First coordinate levels", ["-1", "0", "1"]], ["Second coordinate levels", ["-1", "0", "1"]]])),
    step("Bring inputs into the supported range", "A bounding transformation keeps values within the range the levels cover. This changes the representation before rounding, so its effect must be considered when interpreting reconstructed values.", strips("Bounding and rounding have separate jobs.", [["Bounding", ["Bring each coordinate into range"]], ["Rounding", ["Select an allowed level"]]], true)),
    step("Select a level for each coordinate", "Quantise each bounded coordinate independently. In this simple illustration, ordinary nearest-level rounding picks the displayed grid point. The implementation defines its exact levels and rounding convention.", strips("A standalone nearest-level example.", [["Bounded input", ["0.7", "-0.2"]], ["Selected levels", ["1", "0"]]])),
    step("Encode the combination and recover the grid point", "An indexing rule gives each possible combination a unique code. Decoding recovers the selected levels, not the precise values before quantisation. A fixed grid also does not guarantee that data will use every code equally.", strips("The integer code identifies a combination of coordinate levels.", [["Selected levels", ["1", "0"]], ["Encode", ["One code for this combination"]], ["Decode", ["Recover the selected levels"]]], true))
  ], "Per-coordinate choices define the available vector codes", [
    "The detailed lesson specifies the bounding rule, levels, and combined index, with calculations shown separately.",
    "We compare code capacity, actual usage, and reconstruction quality. Avoiding a learned codebook removes one learning problem, but the representation still needs evaluation."
  ]),
};
