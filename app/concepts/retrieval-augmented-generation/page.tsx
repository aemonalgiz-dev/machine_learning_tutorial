import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { choice, several, trueFalse } from "@/lib/quizzes";
import { exercise, numberCheck } from "@/lib/exercises";
import { Equation } from "@/components/concept/Equation";
import { KeepInMind, NumberTable, SubSection } from "@/components/concept/Treatments";
import { ModernLearningExample } from "@/components/widgets/ModernLearningExample";
import { lessonIntuitions } from "@/lib/intuition";

export const metadata: Metadata = {
  title: "Retrieval-Augmented Generation · Perceptron Lab",
  description: "Retrieval-augmented generation supplies source material as context for a model's answer. It can provide information absent from training, while the usefulness of the answer still depends on what was retrieved and how the model uses it.",
};

export default function Page() {
  return <ConceptPage
      lessonId="retrieval-augmented-generation"
    title="Retrieval-Augmented Generation"
    tagline={"Retrieval-augmented generation supplies source material as context for a model's answer. It can provide information absent from training, while the usefulness of the answer still depends on what was retrieved and how the model uses it."}
    openingTitle="What If the Answer Lives in a Document the Model Needs to Read?"
    intuition={lessonIntuitions["retrieval-augmented-generation"]}
    technicalStart="Part 2. Calculate a Small Retrieval Baseline"
    prerequisites={<>Useful foundations: <Link href="/concepts/pooling-a-text">Text vector pooling</Link>{", "}<Link href="/concepts/distance-and-similarity">distance and similarity</Link>{", "}<Link href="/concepts/autoregressive-generation">autoregressive generation</Link>.</>}
    playgroundTitle="Which passages could help answer this question?"
    playgroundIntro="Search for library Saturday, then try renew and elephant. Inspect the source identifiers and passage text beside each score. The example returns only positive word-overlap matches and stops before language-model generation."
    playground={<ModernLearningExample topic="retrieval-augmented-generation" />}
    sections={[
{ title: "Part 1. Keep Retrieval and Answering Separate", content: <>
<SubSection title="1. Prepare passages with recoverable sources">
<p>{"Suppose we ask for the library's Saturday hours. A model's parameters may reflect an old schedule or no reliable schedule at all. A confident answer would not establish that it is current. We can instead retrieve the relevant passage from the library's information and include it with the question. That gives the model evidence to work from, which we still need to check it uses correctly."}</p>
<p>{"First, retrieval selects passages that may answer the question. Then generation uses the question and those passages to write a response. Keeping track of each stage helps us investigate mistakes. Did the search miss the right passage, or did the model misread information it was given? We need different fixes for those failures."}</p>
<p>{"The collection on this page is three invented passages, each with a source number."}</p>
<NumberTable headings={["Source", "Passage"]} rows={[["1", "The library opens at nine on weekdays. It closes at six."], ["2", "The library opens at ten on Saturday. It closes at four."], ["3", "Borrowed books may be renewed online using your library account."]]} caption="The whole collection behind the live example." />
<p>{"A collection needs passages that are small enough to retrieve and include in a prompt, but large enough to preserve the information an answer needs. A sentence split away from its heading or qualifying paragraph can become misleading."}</p>
<p>
                  {"Source 2’s second sentence says that it closes at four. Beside the first sentence, that is the Saturday closing time. Stored alone, it no longer says what closes or on which day. This exact word matcher would not return it for “When does the library close on Saturday?” because the isolated sentence shares none of the query’s words. The last practice problem tests that split."}
                </p>
<p>{"Keep the original source and location alongside each passage. A generated citation is useful only if it points to the material actually used and that material supports the claim. Updating the collection changes available evidence without necessarily changing model parameters."}</p>
<p>{"The source number is what makes an answer checkable. An answer that says ten and cites Source 2 can be held against the sentence in Source 2. And because the schedule lives in the collection, a change of hours is an edit to one passage. No parameter of the model has to change."}</p>

</SubSection>
<SubSection title="2. Retrieve candidate evidence">
<p>{"The retriever ranks passages for the question. Exact term matching works when question and source use similar words. Learned embeddings can compare broader semantic relationships. Some systems combine lexical and vector retrieval or rerank initial candidates."}</p>
<p>{"Ask the live collection the full question, “When does the library open on Saturday?”, and it scores all three passages. Part 2 shows how the scores are calculated."}</p>
<NumberTable headings={["Source", "What it is about", "Score"]} rows={[["2", "Saturday hours", "0.555"], ["1", "Weekday hours", "0.416"], ["3", "Renewing books", "0.158"]]} caption="Word-overlap scores of the three passages for the question about Saturday opening." />
<p>{"Similarity is a selection signal, not proof of relevance. A passage about weekday hours can share many words with a Saturday question and still be the wrong evidence. Read the content, especially dates, conditions, and exceptions."}</p>
<p>{"The table is that warning in numbers. The right passage is ranked first, and the weekday passage is not far behind it at 0.416, because it shares the words the, library and on with the question. One word, Saturday, separates the passage that answers this question from the passage that answers a different one. A retriever asked for two passages would hand over both, and it would then be up to the model to notice the difference in days."}</p>

</SubSection>

</> },
{ title: "Part 2. Calculate a Small Retrieval Baseline", content: <>
<SubSection title="3. Represent text with word counts">
<p>{"Begin with the question library Saturday and the three passages above. Which words do they share? Give every distinct word a column and record how often it appears in each text. We can then compare the question's row of counts with each passage's row, keeping the words aligned."}</p>
<p>
                  {"First treat capital and lowercase forms as the same word; this is case-folding. The vocabulary lists the 22 different words in these three passages. A count vector stores one count for each vocabulary entry, so matching positions refer to the same word."}
                </p>
                <p>{"Cosine similarity compares the directions of those count vectors. Multiply matching coordinates and add the results, then divide by both vector lengths. Repeating an entire passage would scale all its counts equally and leave the cosine unchanged. Adding different words can change its direction and therefore its score."}</p>
<p>{"For an illustrative two-word vocabulary, a query can exactly match one direction while partially matching another."}</p>
<Equation>{"Vocabulary = [library, Saturday]\nQuery q = [1, 1]\nPassage A = [1, 1]\nPassage B = [1, 0]\n\ncos(q, A) = (1 × 1 + 1 × 1) / (√2 × √2) = 1\ncos(q, B) = (1 × 1 + 1 × 0) / (√2 × 1) = 1 / √2"}</Equation>
<p>{"The live collection contains more words, so its scores differ from these two-coordinate illustrations. Only positive matches are returned. If the query has no words in the indexed vocabulary, its vector has no length and the retriever returns no passages."}</p>
<p>
                  {"For the default query, compare its counts with the complete live collection. The shared-word counts supply the score numerators; the vector lengths below supply the denominators."}
                </p>
                <Equation>{"Query: library = 1, saturday = 1\nquery squared length = 1² + 1² = 2\n\nSources 1 and 2: at = 2, nine other words = 1 each\nsquared length = 2² + (9 × 1²) = 13\n\nSource 3: ten words = 1 each\nsquared length = 10 × 1² = 10"}</Equation>
<Equation>{"Source 2 shares library and saturday:  2 / (√2 × √13) ≈ 0.392\nSource 3 shares library:               1 / (√2 × √10) ≈ 0.224\nSource 1 shares library:               1 / (√2 × √13) ≈ 0.196"}</Equation>
<p>{"The Saturday passage is first, as hoped. Second place is the surprise. The passage about renewing books outranks the passage about weekday hours, although neither mentions Saturday and each shares only the word library with the query. It ranks higher because it is shorter, and cosine divides by length. At the example’s default of two passages, the context handed on would be the Saturday hours and the renewal instructions. Nothing in that second passage bears on the question, and its score had no way to say so."}</p>
<p>{"Exact matching has a second limit, and the other searches the example suggests run into it."}</p>
<NumberTable headings={["Query", "What comes back"]} rows={[["library Saturday", "Source 2 at 0.392, then Source 3 at 0.224"], ["renewed", "Source 3 at 0.316"], ["renew", "nothing"], ["elephant", "nothing"]]} caption="Four searches of the live collection, each asking for up to two passages." />
<p>{"Elephant returns nothing because no passage contains it. Renew returns nothing even though Source 3 is about renewing books: the stored word is renewed, and this exact matcher treats them differently. Learned embeddings can place related expressions near one another in a numerical representation, so they can help with this mismatch. They can also return plausible but irrelevant neighbors. This baseline leaves the word-matching failure visible before we try a more flexible retriever."}</p>
</SubSection>
<SubSection title="4. Put evidence into the answer context">
<p>{"A complete RAG application combines the question with selected passages and instructions about using them. The language model then performs normal conditional generation on that prompt. A simple prompt structure is:"}</p>
<Equation>{"Task: Answer using the supplied sources.\nIf the sources do not provide the answer, say so.\n\nQuestion: When does the library open on Saturday?\n\n[Source 2]\nThe library opens at ten on Saturday. It closes at four.\n\nAnswer with supporting source identifiers:"}</Equation>
<p>{"Each line of the template has a job. The task line tells the model to answer from the sources and not from memory. The second line gives it something to say when the sources are silent. That matters because a word-matching retriever returns its best matches whether or not any of them holds the answer. The question is restated so the model knows what to look for. The passage arrives with its source number, so the answer can cite it, and the closing line asks for that citation."}</p>
<p>{"This is a prompt template, not a measured model response. Instructions alone cannot guarantee source-faithful output. The application must evaluate whether the answer agrees with the passages and whether citations support their associated claims."}</p>
</SubSection>

</> },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            trueFalse(
              "A high similarity score shows that the passage is the right evidence.",
              false,
              "Similarity is a selection signal, not proof of relevance. For the question about Saturday opening, the weekday passage scores 0.416 against the Saturday passage’s 0.555, because it shares the words the, library and on with the question. That is why the dates, conditions and exceptions have to be read rather than trusted to the score.",
            ),
            choice(
              "What has to be balanced when a collection is split into passages?",
              [
                "Small enough to retrieve and include in a prompt, large enough to preserve the information an answer needs",
                "Small enough that each passage holds a single sentence",
                "Large enough that the whole collection fits in one prompt",
                "Equal in length, so that scores are comparable across passages",
              ],
              0,
              "A sentence split away from its heading or qualifying paragraph can become misleading, so the smaller piece is not automatically the better one. The original source and location are kept alongside each passage, because a generated citation is useful only if it points to the material actually used and that material supports the claim.",
            ),
            choice(
              "With a vocabulary of library and Saturday, a query of [1, 1], passage A of [1, 1] and passage B of [1, 0], what are the two cosine scores?",
              [
                "1 for A, and 1 over the square root of two for B",
                "1 for both, since both contain library",
                "1 for A and 0 for B",
                "0.5 for A and 0.25 for B",
              ],
              0,
              "Passage A points in the same direction as the query and scores exactly one, while B matches one of the two words and comes out lower. The live collection contains more words, so its scores differ from these two-coordinate illustrations.",
            ),
            trueFalse(
              "A search for renew returns no passage from the live collection, although Source 3 is about renewing books.",
              true,
              "The collection contains renewed, not renew. This tokenizer keeps those as different terms, so renew has no matching indexed coordinate and returns no positive-overlap passage. That is a retrieval miss despite relevant source material being present. Elephant also returns no match, but in that case the collection contains no relevant passage. The same empty result can have different causes.",
            ),
            choice(
              "For the query library Saturday, the passage about renewing books scores 0.224 and the passage about weekday hours scores 0.196, although each shares only the word library with the query. Why is the renewals passage ahead?",
              [
                "It is shorter, and cosine similarity divides by the passage’s length",
                "It contains the word Saturday",
                "It holds more different words than the weekday passage",
                "It comes later in the collection, and later sources are preferred",
              ],
              0,
              "Both numerators are one, for the single shared word. The renewals passage has a squared length of 10 and the weekday passage 13, so dividing by the smaller length gives the larger score. Neither passage bears on Saturday opening, and at the default of two passages the renewals passage is handed on as context anyway.",
            ),
        ],
        },
{ title: "Part 3. Find the Failure Before Changing the Model", content: <>
<SubSection title="5. Inspect the retrieval result">
<p>{"The SDK baseline returns source indices, text, and cosine scores. It keeps retrieval inspectable without introducing a hosted model or claiming that a generated answer has been verified."}</p>
<pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm leading-relaxed text-slate-100"><code>{"from oop_ml.numpy.modern import TermOverlapRetriever\n\nretriever = TermOverlapRetriever([\n    \"The library opens at nine on weekdays.\",\n    \"The library opens at ten on Saturday.\",\n])\nfor passage in retriever.retrieve(\"library Saturday\", limit=2):\n    print(passage.index, passage.score, passage.text)"}</code></pre>
<p>{"The snippet indexes two shortened passages and prints two lines. The Saturday sentence comes first with index 1 and a score near 0.535, and the weekday sentence follows with index 0 and a score near 0.267. Indices count from zero, so index 1 is the second passage in the list."}</p>
<p>{"Those scores are higher than the 0.392 and 0.196 the live collection gave the same query and the same two opening sentences. The words shared are the same. The passages are shorter. Each holds seven different words, so the passage length in the denominator is √7 where the live passages had √13."}</p>
<Equation>{"Saturday sentence:  2 / (√2 × √7) ≈ 0.535\nWeekday sentence:   1 / (√2 × √7) ≈ 0.267"}</Equation>
<KeepInMind>
<p>
                  {"These scores rank passages for the current query and representation. Their values depend on how we tokenize and form the passages: trimming each passage raised the relevant score from 0.392 to 0.535 without changing the answer. A useful threshold needs evaluation on relevant queries and sources; cosine similarity alone does not establish that a passage answers the question."}
                </p>
</KeepInMind>

</SubSection>
<SubSection title="6. Evaluate evidence and generation independently">
<p>{"If the needed passage was not retrieved, changing the answer model may not fix the failure. Check source coverage, chunk boundaries, retrieval ranking, and the context limit. If the right passage was supplied but the answer was wrong, inspect the generation step and its instructions."}</p>
<NumberTable headings={["What you find", "Where the failure is", "What to inspect"]} rows={[["The needed passage is not among those retrieved", "retrieval", "source coverage, chunk boundaries, ranking, the context limit"], ["The needed passage was retrieved and the answer is still wrong", "generation", "the instructions and how the model read the passage"]]} caption="Look at what was retrieved before looking at what was written." />
<p>{"A search for renew misses the passages about renewals even though the answer is present, identifying a retrieval failure. A question about Sunday opening is different: none of the three passages supplies the fact. Improving retrieval can address the first case, but cannot create missing source evidence for the second. The answer stage needs to recognize either kind of insufficient context."}</p>
<p>{"Source text is evidence to read, not permission to follow arbitrary instructions embedded in a document. An application should preserve that distinction when constructing prompts and handling external material."}</p>
<p>{"RAG does not automatically make facts current. The collection must be maintained, and the answer must use the relevant version. It also does not remove the need to say when evidence is missing or contradictory."}</p>
<p>{"Suppose the library changes its Saturday hours while Source 2 retains the old schedule. The retriever still finds the same words with the same score, and a model that follows that source can still cite the obsolete hours. Correct retrieval and faithful use of a document cannot establish that the document itself is current."}</p>

</SubSection>
<p>{"This paper combines retrieval with generation. The lesson’s word-count retriever is a small baseline, not a reproduction of its learned retrieval architecture."}{" "}<a href="https://arxiv.org/abs/2005.11401">Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks</a>.</p>
<p>Continue with <Link href="/concepts/evaluating-generative-models">Evaluating Generative Models</Link>.</p>
</> },
        {
          title: "Questions on Part 3",
          quiz: [
            choice(
              "The right passage was supplied and the answer was still wrong. Where does the lesson say to look?",
              [
                "The generation step and its instructions",
                "The chunk boundaries",
                "The retrieval ranking",
                "The context limit",
              ],
              0,
              "Source coverage, chunk boundaries, retrieval ranking and the context limit are the things to check when the needed passage was not retrieved, and changing the answer model may not fix that failure at all. Once the evidence did arrive, the remaining step is the generation and the instructions given with it, which is why the two are evaluated independently.",
            ),
            trueFalse(
              "Instructions found inside a retrieved passage are instructions the application should follow.",
              false,
              "Source text is evidence to read, not permission to follow arbitrary instructions embedded in a document. An application should preserve that distinction when constructing prompts and handling external material, since the passage arrived from the collection rather than from the person asking.",
            ),
            several(
              "Which of these does the lesson state?",
              [
                "RAG does not automatically make facts current",
                "Instructions alone cannot guarantee source-faithful output",
                "The word-count retriever here is a small baseline rather than a reproduction of the paper’s learned retrieval architecture",
                "A generated citation is enough on its own to show that a claim is supported",
              ],
              [0, 1, 2],
              "The collection has to be maintained and the answer has to use the relevant version, and the need to say when evidence is missing or contradictory does not go away either. A citation is useful only if it points to the material actually used and that material supports the claim, so the application must evaluate whether the answer agrees with the passages rather than reading the citation as the check.",
            ),
            trueFalse(
              "The snippet in step 5 scores the Saturday sentence near 0.535, higher than the 0.392 the live collection gives the same query, because its passages are shorter.",
              true,
              "Both versions share the terms library and saturday with the query. The shorter passage has fewer nonzero count coordinates, reducing its norm and raising cosine from about 0.392 to 0.535. Its relevance has not improved merely because its score rose. Changing chunking or the indexed representation changes the score's context, so evaluate retrieval quality rather than treating that increase as evidence of a better answer.",
            ),
            several(
              "Which of these are retrieval failures, to be fixed in the collection or the retriever and not in the answer model?",
              [
                "A search for renew returns nothing, although the collection covers renewals",
                "A question about Sunday opening, which none of the three passages covers",
                "The Saturday passage was supplied and the answer gave the weekday hours",
                "The answer obeyed an instruction written inside a retrieved passage",
              ],
              [0, 1],
              "In the two retrieval failures the needed evidence never reached the model, once because exact matching missed renewed and once because the collection holds no such fact, so a more capable answer model would be working from the wrong context or from none. When the right passage was supplied and the answer is still wrong, the place to look is the generation step and its instructions. Treating source text as instructions is also a failure of how the prompt and the answer were handled, since the passage was evidence to read.",
            ),
        ],
        },
        {
          title: "Practice. Retrieve From the Three Passages With the Library",
          practice: [
            exercise(
              "Rank all three passages for the opening query",
              ["Part 2 worked the three cosine scores for the query library Saturday by hand. Index the page’s three passages and retrieve up to three of them for that query. Print each one’s source number, its score to four places and its text.", "The live example asks for two passages, so it never shows where the weekday passage lands. Asking for three shows the whole ranking, with the renewals passage in between."],
              `from oop_ml.numpy.modern import TermOverlapRetriever

passages = [
    "The library opens at nine on weekdays. It closes at six.",
    "The library opens at ten on Saturday. It closes at four.",
    "Borrowed books may be renewed online using your library account.",
]
# Index the passages, retrieve up to three for the query "library Saturday",
# and print each result's source number, score to four places, and text.
# The source number is the result's index plus one.`,
              `from oop_ml.numpy.modern import TermOverlapRetriever

passages = [
    "The library opens at nine on weekdays. It closes at six.",
    "The library opens at ten on Saturday. It closes at four.",
    "Borrowed books may be renewed online using your library account.",
]
retriever = TermOverlapRetriever(passages)
for found in retriever.retrieve("library Saturday", limit=3):
    print(f"Source {found.index + 1}  score {found.score:.4f}  {found.text}")`,
              `Source 2  score 0.3922  The library opens at ten on Saturday. It closes at four.
Source 3  score 0.2236  Borrowed books may be renewed online using your library account.
Source 1  score 0.1961  The library opens at nine on weekdays. It closes at six.`,
              { hints: ["TermOverlapRetriever takes the list of passages. Its retrieve method takes the query and a limit, and answers a list of results, best first.", "Each result carries index, score and text. The index counts from zero, so the page’s Source 2 has an index of 1."], check: numberCheck("What score does the Saturday passage receive?", 0.3922, 0.0005, "The Saturday passage shares both query terms. The cosine score also accounts for the lengths of the query and passage count vectors, so matching a word in a longer passage contributes differently. This ranks lexical overlap; it does not verify that a passage answers the question.") , question: "Which passage best matches the Saturday question, and why does it rank first?" },
            ),
            exercise(
              "Ask about a day the collection does not cover",
              ["Part 3 named a question about Sunday opening as a gap in source coverage. Ask the retriever “Is the library open on Sunday?” and print every passage it returns, with source number and score to four places.", "Then print which of the question’s words are in the retriever’s vocabulary. No passage mentions Sunday, so look at what the scores were built from, and compare the top score with the 0.3922 the right passage earned in the first problem."],
              `from oop_ml.numpy.modern import TermOverlapRetriever

passages = [
    "The library opens at nine on weekdays. It closes at six.",
    "The library opens at ten on Saturday. It closes at four.",
    "Borrowed books may be renewed online using your library account.",
]
question = "Is the library open on Sunday?"
words = question.casefold().replace("?", "").split()
# Index the passages and retrieve up to three for the question. Print each
# result's source number and score. Then print the words of the question
# that appear in the retriever's vocabulary.`,
              `from oop_ml.numpy.modern import TermOverlapRetriever

passages = [
    "The library opens at nine on weekdays. It closes at six.",
    "The library opens at ten on Saturday. It closes at four.",
    "Borrowed books may be renewed online using your library account.",
]
question = "Is the library open on Sunday?"
words = question.casefold().replace("?", "").split()

retriever = TermOverlapRetriever(passages)
for found in retriever.retrieve(question, limit=3):
    print(f"Source {found.index + 1}  score {found.score:.4f}")
matched = [word for word in words if word in retriever.vocabulary]
print("words found in the vocabulary:", ", ".join(matched))`,
              `Source 1  score 0.4804
Source 2  score 0.4804
Source 3  score 0.1826
words found in the vocabulary: the, library, on`,
              { hints: ["retrieve takes the whole question as it is written. The retriever folds the case and drops the question mark itself.", "The retriever keeps the list of every word it indexed in its vocabulary attribute, all in lower case, which is why the starter folds the question’s words before you compare.", "A list comprehension with an if keeps the words that pass a test, and the join method of a string puts them on one line."], check: numberCheck("What score do the two opening-hours passages share?", 0.4804, 0.0005, "Sunday contributes no indexed evidence because it is absent from the collection. The remaining common words still produce substantial overlap scores, allowing irrelevant opening-hours passages to rank highly. A retrieval score cannot establish that an answer exists in the returned text.") , question: "What does the retriever return when the collection has no Sunday answer?" },
            ),
            exercise(
              "Split the passages into sentences and lose the closing time",
              ["Part 1 warned that a sentence split from the one that qualifies it can stop being retrievable. Index the collection twice, once as the page’s three passages and once with each sentence stored as a passage of its own. Ask both “When does the library close on Saturday?” with a limit of five.", "Print what each collection returns, with scores to four places and the text. The answer is four. Check whether the sentence that says so is returned by each collection."],
              `from oop_ml.numpy.modern import TermOverlapRetriever

passages = [
    "The library opens at nine on weekdays. It closes at six.",
    "The library opens at ten on Saturday. It closes at four.",
    "Borrowed books may be renewed online using your library account.",
]
sentences = [
    "The library opens at nine on weekdays.",
    "It closes at six.",
    "The library opens at ten on Saturday.",
    "It closes at four.",
    "Borrowed books may be renewed online using your library account.",
]
question = "When does the library close on Saturday?"
# For each of the two collections, index it, retrieve up to five results
# for the question, and print each result's score to four places and text.`,
              `from oop_ml.numpy.modern import TermOverlapRetriever

passages = [
    "The library opens at nine on weekdays. It closes at six.",
    "The library opens at ten on Saturday. It closes at four.",
    "Borrowed books may be renewed online using your library account.",
]
sentences = [
    "The library opens at nine on weekdays.",
    "It closes at six.",
    "The library opens at ten on Saturday.",
    "It closes at four.",
    "Borrowed books may be renewed online using your library account.",
]
question = "When does the library close on Saturday?"

for name, collection in [("whole passages", passages), ("single sentences", sentences)]:
    print(name)
    for found in TermOverlapRetriever(collection).retrieve(question, limit=5):
        print(f"  {found.score:.4f}  {found.text}")`,
              `whole passages
  0.5547  The library opens at ten on Saturday. It closes at four.
  0.4160  The library opens at nine on weekdays. It closes at six.
  0.1581  Borrowed books may be renewed online using your library account.
single sentences
  0.7559  The library opens at ten on Saturday.
  0.5669  The library opens at nine on weekdays.
  0.1581  Borrowed books may be renewed online using your library account.`,
              { hints: ["Loop over the two collections, building a fresh TermOverlapRetriever for each, since a retriever indexes the passages it is given.", "A limit of five is more than either collection can match here. Only passages with a positive score are returned, so a short list means the others shared no word with the question."], check: numberCheck("What score does the top result receive in the collection of single sentences?", 0.7559, 0.0005, "The opening sentence shares several exact query words and ranks highly, but the separate closing sentence shares none under this tokenizer. Keeping the sentences together preserves the closing fact beside its Saturday context. This exposes a chunking failure in the lexical retriever; a larger score is not a measure of answer usefulness.") , question: "Can splitting a useful passage make its answer disappear from retrieval?" },
            ),
          ],
        },
    ]}
  />;
}

