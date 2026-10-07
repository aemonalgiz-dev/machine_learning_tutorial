import { history, source } from "./types";

export const textBasics = {
  "what-a-token-is": history("How Did Text Become Something a Program Could Work With?", [
    source("Lesk and Schmidt (1975), Lex: A Lexical Analyzer Generator", "https://www.cs.man.ac.uk/~pjj/cs212/lex/lex.html"),
  ],
  "As humans, we recognise letters and words in the text we read. A program needs explicit rules for what to treat as one item. Even before modern language models, a compiler reading a program needed to distinguish a name, a number, and a punctuation symbol instead of treating the input as an undifferentiated stream of characters.",
  "Tools such as Lesk and Schmidt's Lex, documented in 1975, let programmers describe patterns and turn matching character sequences into items for later processing. This is part of the computing history of tokens. Natural-language tokenizers inherited the need to define units, although their rules and goals differ from those of a programming-language lexer.",
  "For a language model, we also associate each recognised piece with an ID. A piece such as cat can have a particular table entry, and the model can use that entry consistently. The ID gives the piece an address; it does not supply its meaning. Our next question is therefore which pieces to recognise, because choosing words, word parts, characters, or bytes creates different practical problems."),

  "splitting-on-spaces": history("Could the Spaces Do the First Part of the Work?", [
    source("Manning, Raghavan and Schütze (2008), Introduction to Information Retrieval: Tokenization", "https://nlp.stanford.edu/IR-book/html/htmledition/tokenization-1.html"),
  ],
  "A search system needs to count and index the items in a document. For much English text, spaces seem to offer a convenient first answer: the stretches between them often resemble the words a reader would look for.",
  "Word-based information retrieval made this apparently simple boundary decision a practical concern. Manning, Raghavan and Schütze's 2008 treatment documents why tokenisation requires decisions even before ranking documents: punctuation, apostrophes, and languages with different writing conventions do not all fit the same space-based rule. There is no single invention date for splitting a string on whitespace.",
  "The attraction is that the rule is easy to explain and reproduce. The limitation is equally concrete. A comma may remain attached to a word, and a writing system without spaces between words supplies no such boundaries. We begin with this baseline so that each later rule can be understood as an answer to something this first attempt leaves unresolved."),

  "unicode-word-boundaries": history("What Happens When Text Uses More Than One Writing System?", [
    source("The Unicode Consortium, Unicode Text Segmentation (Standard Annex #29)", "https://www.unicode.org/reports/tr29/"),
    source("The Unicode Standard, Version 1.0 (1991)", "https://www.unicode.org/versions/Unicode1.0.0/"),
  ],
  "A rule written only for unaccented English letters quickly runs into trouble. An accent can be encoded separately from its base letter, and punctuation does not behave the same way in every script. Even deciding what a user should select with a double-click requires more than searching for spaces.",
  "Unicode developed a common character standard across writing systems, with its first volume published in 1991. Its text-segmentation work supplies default rules for boundaries, including grapheme clusters, words, and sentences. These rules address shared text-processing needs rather than defining one universal linguistic analysis.",
  "Character properties let a program distinguish letters, combining marks, numbers, and other categories without listing every spelling manually. Boundary rules then use those properties together. Some languages still need dictionary or language-specific handling. This is why recognising Unicode categories improves a tokenizer while not making a short regular expression equivalent to the complete Unicode boundary algorithm."),

  "penn-treebank-rules": history("How Could Annotators Agree on What They Were Labelling?", [
    source("Marcus, Santorini and Marcinkiewicz (1993), Building a Large Annotated Corpus of English: The Penn Treebank", "https://aclanthology.org/J93-2004/"),
    source("NLTK, Treebank Tokenizer Conventions", "https://www.nltk.org/api/nltk.tokenize.treebank.html"),
  ],
  "If two annotators divide the same sentence differently, their grammatical labels no longer refer to the same pieces. Before building a corpus of tagged and parsed English, a project needs consistent decisions about contractions, quotation marks, and punctuation.",
  "The Penn Treebank project established such conventions while creating a large annotated corpus, described by Marcus and colleagues in 1993. Its tokenisation became widely reused because models trained on those annotations needed inputs divided in a compatible way.",
  "These rules sometimes separate a written word into pieces that support the annotation scheme. A contraction is a useful example: the written form contains more than one grammatical contribution. The goal is consistent analysis, not preserving every surface detail as an untouched string. When we use Treebank-style rules, we should know which conventions are being reproduced and which differences the teaching implementation retains."),

  "moses-rules": history("How Could a Translation System Compare Text Consistently?", [
    source("Koehn and colleagues (2007), Moses: Open Source Toolkit for Statistical Machine Translation", "https://aclanthology.org/P07-2045/"),
    source("Moses, Tokenizer Implementation", "https://github.com/moses-smt/mosesdecoder/blob/master/scripts/tokenizer/tokenizer.perl"),
  ],
  "A statistical translation system learns from recurring pieces of text. If a word beside a comma is treated differently from the same word elsewhere, its evidence becomes fragmented. But blindly separating every period would damage abbreviations and numbers.",
  "Moses, presented in 2007 as an open-source statistical machine translation toolkit, came with practical text-processing tools. Its tokenizer applied punctuation rules and language-specific conventions so that training and translation could use compatible units.",
  "The idea is to make boundary decisions explicit and repeatable. Separate punctuation where the rules require it, preserve recognised exceptions, and use the same preparation for later inputs. These decisions affect the counts and alignments a translation model learns. Moses-style tokenisation is consequently a particular collection of conventions, not a guarantee that all languages or all punctuation can be handled identically."),

  "the-pattern-language-models-use": history("Why Put Rules Before a Learned Vocabulary?", [
    source("OpenAI (2019), GPT-2 Token Encoder", "https://github.com/openai/gpt-2/blob/master/src/encoder.py"),
  ],
  "A learned subword tokenizer can merge neighbouring units into larger pieces. Before it learns or applies those merges, we may want to decide which kinds of characters are allowed to be grouped together. Otherwise a frequent combination could cross a boundary we wanted to retain.",
  "GPT-2's released 2019 encoder used a regular expression to divide text into groups before byte-level BPE. The pattern distinguished contractions, letter sequences, number sequences, punctuation, and whitespace, with particular handling of a leading space. This is a concrete design from a particular model family, rather than a rule followed by every language model.",
  "The first stage controls the regions in which later merges operate. The learned vocabulary then determines how those regions are divided into tokens. Separating those jobs explains why two tokenizers can both use BPE and still produce different results. We will inspect the pattern's decisions before following any learned merges."),

  "bytes-and-characters": history("How Could One Encoding Carry Text from Many Languages?", [
    source("Thompson and Pike, First-Hand Accounts of UTF-8's 1992 Development", "https://www.cl.cam.ac.uk/~mgk25/ucs/utf-8-history.txt"),
    source("Yergeau (2003), UTF-8, a Transformation Format of ISO 10646 (RFC 3629)", "https://www.rfc-editor.org/rfc/rfc3629"),
  ],
  "A computer stores bytes, but a written character is not necessarily one byte. Small character encodings could not represent every writing system, and simply making all characters wider would disrupt software built around existing byte-oriented text.",
  "Ken Thompson and Rob Pike developed UTF-8 for Plan 9 in 1992. It provided a variable-length representation compatible with ASCII for its existing characters. The encoding allowed a wider range of character values while retaining useful properties for processing byte streams.",
  "This separates three things we should not confuse: stored bytes, Unicode code points, and the characters a reader perceives. One visible character may involve several code points, and a code point may require several UTF-8 bytes. A byte tokenizer can represent unfamiliar text without a word vocabulary, but it usually creates more positions for the model to process."),

  "hashing-characters": history("Could We Allocate Space Before Knowing Every Feature?", [
    source("Weinberger and colleagues (2009), Feature Hashing for Large Scale Multitask Learning", "https://arxiv.org/abs/0902.2206"),
  ],
  "A growing text collection can keep introducing new items. If each one requires a new dictionary entry and feature coordinate, the representation grows with the collection. We may instead need a fixed amount of memory and a rule that can handle an item immediately.",
  "Weinberger and colleagues' 2009 feature-hashing work examined mapping a large feature space into a smaller fixed one without maintaining a full feature dictionary. The character-hashing example here applies that broader idea to a small, inspectable case; it is not a claim that the original paper introduced this particular tokenizer.",
  "A deterministic hash selects a bucket for each item. The same item returns to the same bucket, including when it first appears after training. Different items can share a bucket, so we trade a bounded representation for collisions and lost identity. A bucket number is therefore not a reversible token ID or a learned statement about meaning."),
};
