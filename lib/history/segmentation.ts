import { history, source } from "./types";

const sproat = source("Sproat, Shih, Gale and Chang (1996), A Stochastic Finite-State Word-Segmentation Algorithm for Chinese", "https://aclanthology.org/J96-3004/");

export const segmentation = {
  "maximum-matching": history("Where Does One Word End When There Are No Spaces?", [sproat],
  "A reader can recognize words in a sentence even when the writing does not place spaces between them. A program cannot assume those boundaries are already marked. If we have a dictionary, we can at least ask which entries match the characters at the current position.",
  "Dictionary-based maximum matching became a practical baseline for Chinese word segmentation. Sproat and colleagues' 1996 work discussed this approach while developing a probabilistic finite-state alternative. The difficulty was that a locally plausible dictionary choice could produce the wrong overall reading.",
  "Choosing the longest available entry provides a simple, repeatable scan without examining every full division. The limitation comes from that same local commitment: the longest candidate may leave an unsuitable remainder. A scan from the opposite end can make a different choice, showing where the dictionary alone does not determine an intended reading."),

  "the-word-lattice": history("Could We Keep the Alternatives Until We Have Seen the Whole Sentence?", [sproat],
  "A long dictionary match may look attractive until it leaves an awkward remainder. If we commit immediately, we lose the chance to compare it with a shorter first word that makes the rest of the sentence much more plausible.",
  "Probabilistic segmentation systems, including Sproat and colleagues' 1996 Chinese segmenter, treated competing analyses as alternatives that could be scored. Finite-state representations made it possible to keep those alternatives and search for a good complete analysis.",
  "Candidate words connect positions in the text, and a complete connected route spells one segmentation. Dynamic programming can reuse compatible partial scores instead of calculating every shared prefix again. Retaining alternatives removes the immediate greedy commitment, but the final choice still depends on the supplied dictionary, scoring assumptions and fallback policy."),

  "segmenting-with-a-hidden-model": history("Could Hidden Labels Explain the Boundaries We Cannot See?", [
    source("Rabiner (1989), A Tutorial on Hidden Markov Models and Selected Applications in Speech Recognition", "https://doi.org/10.1109/5.18626"),
  ],
  "A dictionary cannot directly list every new name or unfamiliar word. We could instead ask what role each visible character plays: does it begin a word, continue one, end one, or stand alone? Those roles are not written in the input, so they must be inferred.",
  "Hidden Markov models developed in probabilistic sequence modeling and became important in speech recognition. Rabiner's 1989 tutorial described the problem of inferring hidden state sequences from observations. Character-role segmentation uses the same distinction between what we observe and the state sequence that could have produced it.",
  "The observed characters remain visible while their word-role labels are the hidden sequence being inferred. Transition probabilities connect neighboring roles, and observation probabilities connect roles with characters. Scoring those paths can propose boundaries for whole words absent from a dictionary, while the model's limited state memory and dependence assumptions restrict which context can influence the decision."),

  "learning-boundaries-from-examples": history("Could Labeled Sentences Teach Us Where to Split?", [
    source("Xue (2003), Chinese Word Segmentation as Character Tagging", "https://aclanthology.org/O03-4002/"),
  ],
  "Writing enough rules to cover every boundary decision is difficult. But we may already have sentences divided by people according to an agreed convention. Those examples contain evidence about which neighboring characters and patterns tend to accompany a word boundary.",
  "Xue's 2003 work framed Chinese word segmentation as supervised character tagging, learning from manually annotated data. This shifted attention from choosing only among known whole words to predicting structural labels from the surrounding evidence.",
  "Our teaching example asks a related local question: does a word end at this gap? A boundary classifier learns from labeled gaps and their nearby text features. Xue’s work used character tagging; this gap classifier lets us inspect a simpler prediction unit. Applying the same features to new text makes its decisions visible, while independent predictions leave some whole-sequence constraints unenforced. The annotation convention still defines which gaps count as correct."),
};
