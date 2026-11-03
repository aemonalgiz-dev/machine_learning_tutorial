import { history, source } from "./types";

export const textPieces = {
  "byte-pair-encoding": history("Could Repeated Fragments Solve the Rare-Word Problem?", [
    source("Gage (1994), A New Algorithm for Data Compression", "https://www.derczynski.com/papers/archive/BPE_Gage.pdf"),
    source("Sennrich, Haddow and Birch (2016), Neural Machine Translation of Rare Words with Subword Units", "https://aclanthology.org/P16-1162/"),
  ],
  "A whole-word vocabulary has a recurring problem: names, compounds, and unfamiliar word forms keep arriving. Storing every possibility is impractical. Spelling everything one character at a time avoids some missing-word problems but makes sequences longer.",
  "Philip Gage described byte pair encoding in 1994 as a compression method based on replacing frequent adjacent pairs. Sennrich and colleagues adapted the merging idea to subword units for neural translation in 2016, allowing rare words to be represented through reusable smaller pieces.",
  "Repeated pair merging builds larger entries from the starting symbols, giving common fragments shorter representations. Encoding later needs the learned merge order as well as the resulting vocabulary. The implementation still has to specify whether those starting symbols are bytes or characters and what happens when it encounters one absent from training. The algorithm's name alone does not settle those coverage decisions."),

  "wordpiece": history("How Could Speech Recognition Avoid an Endless Word List?", [
    source("Schuster and Nakajima (2012), Japanese and Korean Voice Search", "https://research.google/pubs/japanese-and-korean-voice-search/"),
    source("Devlin and colleagues (2019), BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding", "https://aclanthology.org/N19-1423/"),
  ],
  "Speech recognition must produce words even when the number of possible word forms makes a complete inventory unwieldy. For languages with productive combinations of stems and endings, treating every surface word as unrelated wastes both vocabulary space and evidence.",
  "Schuster and Nakajima's 2012 work on Japanese and Korean voice search described word pieces as a way to address vocabulary and segmentation difficulties. WordPiece later became familiar through systems such as BERT, which used a subword vocabulary rather than requiring an entry for every complete word.",
  "Vocabulary learning decides which reusable parts receive entries, while encoding decides how those entries cover a new word. A word can therefore use parts learned from other occurrences. The association-style score here is the explicit rule of this teaching trainer; it does not specify every historical WordPiece implementation. Keeping that distinction visible lets us examine the mechanism without attributing one trainer's choices to the entire family."),

  "sentencepiece": history("Why Should Vocabulary Learning Require a Word Split First?", [
    source("Kudo and Richardson (2018), SentencePiece: A Simple and Language Independent Subword Tokenizer and Detokenizer for Neural Text Processing", "https://aclanthology.org/D18-2012/"),
  ],
  "Many subword systems begin by asking another tool to split text into words. That creates a dependency before vocabulary learning even starts, and the split may be difficult in a writing system that does not place spaces between words.",
  "Kudo and Richardson introduced SentencePiece in 2018 as a framework that could train subword models directly from raw sentences. Treating whitespace as an explicit symbol helped keep segmentation and detokenization within a shared representation, instead of assuming a language-specific word splitter had already done the right thing.",
  "The marker makes a preceding separator part of the representation a vocabulary method receives. BPE and a unigram model can then make different choices over that represented input. Decoding recovers the form retained by preprocessing, which may differ from the original bytes after normalization. SentencePiece combines those configurable stages rather than naming one fixed merge rule."),

  "the-unigram-language-model": history("Must a Word Have Only One Useful Segmentation?", [
    source("Kudo (2018), Subword Regularization: Improving Neural Network Translation Models with Multiple Subword Candidates", "https://aclanthology.org/P18-1007/"),
  ],
  "A vocabulary can spell the same word through several sequences of pieces. A fixed merge order commits to one route, but another route may use pieces that generalize better when the wording or domain changes.",
  "Kudo's 2018 work on subword regularization used a unigram language model over pieces to support multiple segmentation candidates. Sampling different segmentations during training offered a way to make a translation model less dependent on one rigid division of the text.",
  "Probabilities let the model score alternative piece sequences that cover the same text. Fitting can revise those probabilities and remove pieces whose loss least damages the chosen objective; encoding can compare or sample complete routes afterward. The independence assumption belongs to the segmentation score, not to a claim that the words in ordinary sentences occur independently."),

  "greedy-coverage": history("Which Addition Gives Us the Most New Coverage?", [
    source("Nemhauser, Wolsey and Fisher (1978), An Analysis of Approximations for Maximizing Submodular Set Functions", "https://thibaut.horel.org/submodularity/papers/nemhauser1978.pdf"),
  ],
  "Suppose we have room for only a few vocabulary additions. Two candidate pieces may each cover many occurrences, but much of their coverage may overlap. Selecting both on their standalone counts can spend the second slot on information the first already supplied.",
  "This is related to a broader optimization problem studied by Nemhauser, Wolsey and Fisher in 1978: choosing a limited set of items when each new item's benefit can diminish as the selected set grows. Their results explain why greedy selection can be useful under specific assumptions about the objective.",
  "After each choice, the next candidate must be judged on what it adds. Standard weighted set coverage permits overlapping subsets while counting their union once. This tokenizer instead rejects occurrences that overlap a piece already placed, so earlier choices can also remove later opportunities. That difference changes the objective and prevents applying the standard set-coverage guarantee to this implementation."),

  "morfessor": history("Could Repeated Word Parts Reveal How Words Are Built?", [
    source("Creutz and Lagus (2002), Unsupervised Discovery of Morphemes", "https://aclanthology.org/W02-0603/"),
  ],
  "In a language with many inflected forms, storing each whole word separately repeats a great deal of structure. Related spellings often share stems and endings. We would like to discover reusable parts without requiring a manually segmented example for every word.",
  "Creutz and Lagus' 2002 work, part of the development of Morfessor, investigated unsupervised segmentation into morpheme-like units, particularly for languages with rich morphology. A description-length approach balanced the cost of storing the pieces against the cost of describing the observed words with them.",
  "Repeated structure can make a shared inventory economical, but splitting also lengthens the description of each occurrence. The objective compares those costs together. Its selected pieces may resemble grammatical morphemes where the corpus supports that reuse; inspecting disagreements remains necessary because economical encoding and linguistic analysis are different criteria."),

  "finite-state-morphology": history("How Do We Connect a Written Word to Its Grammatical Parts?", [
    source("Koskenniemi (1983), Two-Level Morphology: A General Computational Model for Word-Form Recognition and Production", "https://researchportal.helsinki.fi/en/publications/two-level-morphology-a-general-computational-model-for-word-form-/"),
  ],
  "The plural of city is written cities. Finding a frequent substring does not explain the grammatical relationship or the spelling change. A morphology system needs to connect a lexical analysis with the surface spelling a reader sees.",
  "Koskenniemi's 1983 two-level morphology work developed a computational model for both recognizing and producing word forms. It related lexical and surface representations through constraints that could be implemented with finite-state machinery, addressing the interaction between word formation and spelling.",
  "A path through the lexicon and rules connects a written form to one or more analyses. That makes the proposed grammatical reasoning inspectable and can handle combinations licensed by existing rules. Coverage still has a boundary: a missing path may reflect an absent stem or spelling rule, so rejection needs to be interpreted against the actual grammar."),

  "patching-without-a-vocabulary": history("Could We Process Bytes Without Paying for Every Byte in the Largest Model?", [
    source("Pagnoni and colleagues (2024), Byte Latent Transformer: Patches Scale Better Than Tokens", "https://arxiv.org/abs/2412.09871"),
  ],
  "Bytes can represent unfamiliar text without assigning every word or fragment a vocabulary entry. The difficulty is sequence length. If an expensive global model processes every byte as a separate position, broad coverage can come with a substantial computational cost.",
  "The Byte Latent Transformer work released in 2024 explored grouping bytes into patches, with boundaries informed by a measure of predictability. Local processing handles bytes within patches, while a larger model works over patch representations. The motivation was to allocate computation differently without relying on a fixed subword vocabulary.",
  "Choosing a patch boundary determines which bytes are grouped; an encoder still has to represent the contents of that group. Neither step automatically identifies a word. The small examples isolate those choices for inspection, while the complete architecture and its computational benefit require a separate trained-system comparison."),

  "moving-a-vocabulary": history("What Happens to a Learned Word Vector When Its Address Changes?", [
    source("Minixhofer, Paischer and Rekabsaz (2022), WECHSEL: Effective Initialization of Subword Embeddings for Cross-Lingual Transfer of Monolingual Language Models", "https://aclanthology.org/2022.naacl-main.293/"),
  ],
  "A pretrained model's embedding table belongs to a particular vocabulary. If we adapt the model to another language or domain, a new vocabulary may describe the text more efficiently. But an ID in the new vocabulary can name a different piece from the same ID in the old one.",
  "Vocabulary transfer became a practical part of adapting pretrained language models. The 2022 WECHSEL work investigated initializing a new subword embedding table from information in an existing model, so that changing the vocabulary did not require discarding all useful representation knowledge.",
  "Shared pieces can reuse their learned vectors by matching their identities, even when the row order changes. A new piece needs a stated initialization or transfer policy. Those operations prepare a starting table; further training and evaluation need to establish whether the model uses the changed segmentation successfully."),
};
