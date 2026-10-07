import { history, source } from "./types";

export const textPieces = {
  "byte-pair-encoding": history("Could Repeated Fragments Solve the Rare-Word Problem?", [
    source("Gage (1994), A New Algorithm for Data Compression", "https://www.derczynski.com/papers/archive/BPE_Gage.pdf"),
    source("Sennrich, Haddow and Birch (2016), Neural Machine Translation of Rare Words with Subword Units", "https://aclanthology.org/P16-1162/"),
  ],
  "A whole-word vocabulary has a recurring problem: names, compounds, and unfamiliar word forms keep arriving. Storing every possibility is impractical. Spelling everything one character at a time avoids some missing-word problems but makes sequences longer.",
  "Philip Gage described byte pair encoding in 1994 as a compression method based on replacing frequent adjacent pairs. Sennrich and colleagues adapted the merging idea to subword units for neural translation in 2016, allowing rare words to be represented through reusable smaller pieces.",
  "Start with small units that cover the training text. Count neighbouring pairs, merge a frequent pair, and repeat. Common fragments gradually become single entries, while less familiar words can remain sequences of smaller pieces. The learned merge order matters during encoding. The name alone does not tell us whether an implementation begins with bytes or characters, or how it handles a previously unseen starting symbol."),

  "wordpiece": history("How Could Speech Recognition Avoid an Endless Word List?", [
    source("Schuster and Nakajima (2012), Japanese and Korean Voice Search", "https://research.google/pubs/japanese-and-korean-voice-search/"),
    source("Devlin and colleagues (2019), BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding", "https://aclanthology.org/N19-1423/"),
  ],
  "Speech recognition must produce words even when the number of possible word forms makes a complete inventory unwieldy. For languages with productive combinations of stems and endings, treating every surface word as unrelated wastes both vocabulary space and evidence.",
  "Schuster and Nakajima's 2012 work on Japanese and Korean voice search described word pieces as a way to address vocabulary and segmentation difficulties. WordPiece later became familiar through systems such as BERT, which used a subword vocabulary rather than requiring an entry for every complete word.",
  "Reusable pieces allow a word to be represented through parts the model has seen elsewhere. Vocabulary learning decides which parts deserve entries; encoding decides how those entries cover a new word. Those are separate procedures. The association-style merge score in this lesson is the teaching implementation's explicit rule, and should not be mistaken for a complete specification of every historical WordPiece trainer."),

  "sentencepiece": history("Why Should Vocabulary Learning Require a Word Split First?", [
    source("Kudo and Richardson (2018), SentencePiece: A Simple and Language Independent Subword Tokenizer and Detokenizer for Neural Text Processing", "https://aclanthology.org/D18-2012/"),
  ],
  "Many subword systems begin by asking another tool to split text into words. That creates a dependency before vocabulary learning even starts, and the split may be difficult in a writing system that does not place spaces between words.",
  "Kudo and Richardson introduced SentencePiece in 2018 as a framework that could train subword models directly from raw sentences. Treating whitespace as an explicit symbol helped keep segmentation and detokenisation within a shared representation, instead of assuming a language-specific word splitter had already done the right thing.",
  "The space marker lets a learned piece carry information about a preceding separator. A vocabulary method, such as BPE or a unigram model, can then work over the represented sentence. Normalisation still needs attention: if an earlier step changes the input, decoding can recover the normalised form without reproducing every original byte. SentencePiece is a framework with choices, not one universal merge rule."),

  "the-unigram-language-model": history("Must a Word Have Only One Useful Segmentation?", [
    source("Kudo (2018), Subword Regularization: Improving Neural Network Translation Models with Multiple Subword Candidates", "https://aclanthology.org/P18-1007/"),
  ],
  "A vocabulary can spell the same word through several sequences of pieces. A fixed merge order commits to one route, but another route may use pieces that generalise better when the wording or domain changes.",
  "Kudo's 2018 work on subword regularisation used a unigram language model over pieces to support multiple segmentation candidates. Sampling different segmentations during training offered a way to make a translation model less dependent on one rigid division of the text.",
  "Each piece has a probability, and a complete route receives a score from its constituent pieces. We can compare routes through the same text or sample among them. Vocabulary fitting can remove pieces whose loss is least harmful under the objective. The independence assumption belongs to this segmentation model; it does not claim that the words of a real sentence are independent."),

  "greedy-coverage": history("Which Addition Gives Us the Most New Coverage?", [
    source("Nemhauser, Wolsey and Fisher (1978), An Analysis of Approximations for Maximizing Submodular Set Functions", "https://thibaut.horel.org/submodularity/papers/nemhauser1978.pdf"),
  ],
  "Suppose we have room for only a few vocabulary additions. Two candidate pieces may each cover many occurrences, but much of their coverage may overlap. Selecting both on their standalone counts can spend the second slot on information the first already supplied.",
  "This is related to a broader optimisation problem studied by Nemhauser, Wolsey and Fisher in 1978: choosing a limited set of items when each new item's benefit can diminish as the selected set grows. Their results explain why greedy selection can be useful under specific assumptions about the objective.",
  "We select a candidate, mark what it covers, and recalculate what each remaining candidate would add. The next decision uses new coverage, not the original total. Applying that principle to vocabulary selection requires an explicit definition of the units being covered. A guarantee for a coverage objective does not automatically guarantee shorter token sequences or a better language model."),

  "morfessor": history("Could Repeated Word Parts Reveal How Words Are Built?", [
    source("Creutz and Lagus (2002), Unsupervised Discovery of Morphemes", "https://aclanthology.org/W02-0603/"),
  ],
  "In a language with many inflected forms, storing each whole word separately repeats a great deal of structure. Related spellings often share stems and endings. We would like to discover reusable parts without requiring a manually segmented example for every word.",
  "Creutz and Lagus' 2002 work, part of the development of Morfessor, investigated unsupervised segmentation into morpheme-like units, particularly for languages with rich morphology. A description-length approach balanced the cost of storing the pieces against the cost of describing the observed words with them.",
  "Keeping every whole word makes the inventory expensive. Keeping only tiny pieces makes the descriptions long. A useful collection lies between these extremes, where repeated structure earns its storage cost. The resulting pieces may resemble grammatical morphemes, but the objective rewards economical description, so we still need to inspect where the statistical segmentation differs from linguistic analysis."),

  "finite-state-morphology": history("How Do We Connect a Written Word to Its Grammatical Parts?", [
    source("Koskenniemi (1983), Two-Level Morphology: A General Computational Model for Word-Form Recognition and Production", "https://researchportal.helsinki.fi/en/publications/two-level-morphology-a-general-computational-model-for-word-form-/"),
  ],
  "The plural of city is written cities. Finding a frequent substring does not explain the grammatical relationship or the spelling change. A morphology system needs to connect a lexical analysis with the surface spelling a reader sees.",
  "Koskenniemi's 1983 two-level morphology work developed a computational model for both recognising and producing word forms. It related lexical and surface representations through constraints that could be implemented with finite-state machinery, addressing the interaction between word formation and spelling.",
  "A lexicon supplies known stems and permitted continuations. Rules account for how those combinations appear in writing. A path through the system can connect a surface word with one or more analyses. This makes the reasoning inspectable, while also making coverage explicit: a missing path may indicate a missing stem or rule, rather than an impossible word."),

  "patching-without-a-vocabulary": history("Could We Process Bytes Without Paying for Every Byte in the Largest Model?", [
    source("Pagnoni and colleagues (2024), Byte Latent Transformer: Patches Scale Better Than Tokens", "https://arxiv.org/abs/2412.09871"),
  ],
  "Bytes can represent unfamiliar text without assigning every word or fragment a vocabulary entry. The difficulty is sequence length. If an expensive global model processes every byte as a separate position, broad coverage can come with a substantial computational cost.",
  "The Byte Latent Transformer work released in 2024 explored grouping bytes into patches, with boundaries informed by a measure of predictability. Local processing handles bytes within patches, while a larger model works over patch representations. The motivation was to allocate computation differently without relying on a fixed subword vocabulary.",
  "A patch is a region of the sequence, not automatically a word. Predictable stretches can be grouped differently from less predictable ones. Choosing boundaries and representing each resulting group are separate responsibilities. The small patching examples here let us inspect boundary choices; they do not reproduce the complete trained architecture or establish its computational savings by themselves."),

  "moving-a-vocabulary": history("What Happens to a Learned Word Vector When Its Address Changes?", [
    source("Minixhofer, Paischer and Rekabsaz (2022), WECHSEL: Effective Initialization of Subword Embeddings for Cross-Lingual Transfer of Monolingual Language Models", "https://aclanthology.org/2022.naacl-main.293/"),
  ],
  "A pretrained model's embedding table belongs to a particular vocabulary. If we adapt the model to another language or domain, a new vocabulary may describe the text more efficiently. But an ID in the new vocabulary can name a different piece from the same ID in the old one.",
  "Vocabulary transfer became a practical part of adapting pretrained language models. The 2022 WECHSEL work investigated initialising a new subword embedding table from information in an existing model, so that changing the vocabulary did not require discarding all useful representation knowledge.",
  "We first preserve the association between each piece and its learned vector. Shared pieces can be copied by identity into their new rows; unfamiliar pieces require an explicit initialisation or transfer rule. This lesson examines that bookkeeping with simpler policies. Transferring a table supplies a starting point, while further training and evaluation determine whether the adapted model uses the new segmentation successfully."),
};
