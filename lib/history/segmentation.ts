import { history, source } from "./types";

const sproat = source("Sproat, Shih, Gale and Chang (1996), A Stochastic Finite-State Word-Segmentation Algorithm for Chinese", "https://aclanthology.org/J96-3004/");

export const segmentation = {
  "maximum-matching": history("Where Does One Word End When There Are No Spaces?", [sproat],
  "A reader can recognise words in a sentence even when the writing does not place spaces between them. A program cannot assume those boundaries are already marked. If we have a dictionary, we can at least ask which entries match the characters at the current position.",
  "Dictionary-based maximum matching became a practical baseline for Chinese word segmentation. Sproat and colleagues' 1996 work discussed this approach while developing a probabilistic finite-state alternative. The difficulty was that a locally plausible dictionary choice could produce the wrong overall reading.",
  "Maximum matching chooses the longest available entry at the current position, then continues after it. This avoids exploring every possible division and is easy to inspect. But the longest entry is not necessarily the intended word in context. Reading from the opposite direction can even give a different result, which exposes the assumption behind the greedy choice."),

  "the-word-lattice": history("Could We Keep the Alternatives Until We Have Seen the Whole Sentence?", [sproat],
  "A long dictionary match may look attractive until it leaves an awkward remainder. If we commit immediately, we lose the chance to compare it with a shorter first word that makes the rest of the sentence much more plausible.",
  "Probabilistic segmentation systems, including Sproat and colleagues' 1996 Chinese segmenter, treated competing analyses as alternatives that could be scored. Finite-state representations made it possible to keep those alternatives and search for a good complete analysis.",
  "A word lattice marks positions in the text and connects them with possible words. A route from the beginning to the end is a complete segmentation. Scores on the connections let us compare routes, and dynamic programming reuses the best partial results. Keeping alternatives prevents an early commitment, but the final choice is only as useful as the dictionary, fallback rules, and scoring model that supplied them."),

  "segmenting-with-a-hidden-model": history("Could Hidden Labels Explain the Boundaries We Cannot See?", [
    source("Rabiner (1989), A Tutorial on Hidden Markov Models and Selected Applications in Speech Recognition", "https://doi.org/10.1109/5.18626"),
  ],
  "A dictionary cannot directly list every new name or unfamiliar word. We could instead ask what role each visible character plays: does it begin a word, continue one, end one, or stand alone? Those roles are not written in the input, so they must be inferred.",
  "Hidden Markov models developed in probabilistic sequence modelling and became important in speech recognition. Rabiner's 1989 tutorial described the problem of inferring hidden state sequences from observations. Character-role segmentation uses the same distinction between what we observe and the state sequence that could have produced it.",
  "The model assigns probabilities to state transitions and to observations in each state. We compare complete state paths, so a character's proposed role is judged alongside neighbouring roles. This can identify boundaries without requiring every whole word in a dictionary. It still makes restrictive assumptions about memory and observation dependence, which limit how much context the model can use."),

  "learning-boundaries-from-examples": history("Could Labelled Sentences Teach Us Where to Split?", [
    source("Xue (2003), Chinese Word Segmentation as Character Tagging", "https://aclanthology.org/O03-4002/"),
  ],
  "Writing enough rules to cover every boundary decision is difficult. But we may already have sentences divided by people according to an agreed convention. Those examples contain evidence about which neighbouring characters and patterns tend to accompany a word boundary.",
  "Xue's 2003 work framed Chinese word segmentation as supervised character tagging, learning from manually annotated data. This shifted attention from choosing only among known whole words to predicting structural labels from the surrounding evidence.",
  "The lesson's boundary classifier uses a simpler question at each gap: split here or continue? We extract local features, learn their relationship with labelled boundaries, and apply the same representation to new text. This makes individual decisions easy to inspect, but independent gap decisions do not enforce all the constraints of a whole-sequence tagger. The annotation convention also matters, because it defines the answers being learned."),
};
