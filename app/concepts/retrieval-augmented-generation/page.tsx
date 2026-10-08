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
  title: "Retrieval-Augmented Generation · oop_ml",
  description: "A model may need information that was absent or out of date when it was trained. Retrieval supplies relevant source material as context, giving the model evidence it can use when answering a question.",
};

export default function Page() {
  return <ConceptPage
      lessonId="retrieval-augmented-generation"
    title="Retrieval-Augmented Generation"
    tagline={"A model may need information that was absent or out of date when it was trained. Retrieval supplies relevant source material as context, giving the model evidence it can use when answering a question."}
    openingTitle="What If the Answer Lives in a Document the Model Needs to Read?"
    intuition={lessonIntuitions["retrieval-augmented-generation"]}
    technicalStart="Part 2. Calculate a Small Retrieval Baseline"
    prerequisites={<>Useful foundations: <Link href="/concepts/pooling-a-text">Text vector pooling</Link>{", "}<Link href="/concepts/distance-and-similarity">distance and similarity</Link>{", "}<Link href="/concepts/autoregressive-generation">autoregressive generation</Link>.</>}
    playgroundIntro="Search for library Saturday, then try renew and elephant. Inspect the source identifiers and passage text beside each score. The example returns only positive word-overlap matches and stops before language-model generation."
    playground={<ModernLearningExample topic="retrieval-augmented-generation" />}
    sections={[
{ title: "Part 1. Keep Retrieval and Answering Separate", content: <>
<SubSection title="1. Prepare passages with recoverable sources">
<p>{"A language model answers from its parameters, and its parameters hold what it was trained on. The library’s Saturday hours may not be in there. They may be in there as they stood some years ago. The model has no way to tell us which. What is missing is a way to put the current schedule in front of the model at the moment the question is asked."}</p>
<p>{"That takes two jobs, and this part is about keeping them apart. Retrieval finds the passages that might hold the answer. Generation writes an answer from the question and those passages. They are kept separate because they fail differently. A retriever can hand over the wrong passage, and a model can misread the right one. If the two were a single step, a wrong answer would not say which of those had happened."}</p>
<p>{"The collection on this page is three invented passages, each with a source number."}</p>
<NumberTable headings={["Source", "Passage"]} rows={[["1", "The library opens at nine on weekdays. It closes at six."], ["2", "The library opens at ten on Saturday. It closes at four."], ["3", "Borrowed books may be renewed online using your library account."]]} caption="The whole collection behind the live example." />
<p>{"A collection needs passages that are small enough to retrieve and include in a prompt, but large enough to preserve the information an answer needs. A sentence split away from its heading or qualifying paragraph can become misleading."}</p>
<p>{"Source 2 shows what is at stake. Its second sentence says that it closes at four. Kept beside the first sentence, that is the Saturday closing time. Stored as a passage of its own, it no longer says what closes or on which day. It also shares no word with a question such as “When does the library close on Saturday?”, so a retriever that matches words would never return it. The last practice problem makes that split and runs the question."}</p>
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
<p>{"The example case-folds text, extracts word-like pieces, and builds a vocabulary from three invented passages. Each text becomes a count vector. The query is compared against passage vectors using cosine similarity."}</p>
<p>{"Each of those terms is a small idea. Case-folding treats capital and small letters as the same, so Saturday and saturday are one word. The vocabulary is the list of every different word in the passages, which comes to 22 words for this collection. A count vector has one entry for each vocabulary word, holding how many times that word occurs in the text. Cosine similarity measures how nearly two such vectors point the same way. It multiplies matching entries and adds them up, then divides by the lengths of the two vectors, so that a passage is not favored merely for holding more words."}</p>
<p>{"For an illustrative two-word vocabulary, a query can exactly match one direction while partially matching another."}</p>
<Equation>{"Vocabulary = [library, Saturday]\nQuery q = [1, 1]\nPassage A = [1, 1]\nPassage B = [1, 0]\n\ncos(q, A) = (1 × 1 + 1 × 1) / (√2 × √2) = 1\ncos(q, B) = (1 × 1 + 1 × 0) / (√2 × 1) = 1 / √2"}</Equation>
<p>{"The live collection contains more words, so its scores differ from these two-coordinate illustrations. Only positive matches are returned. If the query has no words in the indexed vocabulary, its vector has no length and the retriever returns no passages."}</p>
<p>{"Here is the same calculation on the live collection, for the query the example opens with, library Saturday. The query vector has a one at library and a one at saturday, so its length is √2. Sources 1 and 2 each hold eleven words with the word at appearing twice, which gives each a squared length of 13. Source 3 holds ten different words, for a squared length of 10. The numerator of each score counts the shared words."}</p>
<Equation>{"Source 2 shares library and saturday:  2 / (√2 × √13) ≈ 0.392\nSource 3 shares library:               1 / (√2 × √10) ≈ 0.224\nSource 1 shares library:               1 / (√2 × √13) ≈ 0.196"}</Equation>
<p>{"The Saturday passage is first, as hoped. Second place is the surprise. The passage about renewing books outranks the passage about weekday hours, although neither mentions Saturday and each shares only the word library with the query. It ranks higher because it is shorter, and cosine divides by length. At the example’s default of two passages, the context handed on would be the Saturday hours and the renewal instructions. Nothing in that second passage bears on the question, and its score had no way to say so."}</p>
<p>{"Exact matching has a second limit, and the other searches the example suggests run into it."}</p>
<NumberTable headings={["Query", "What comes back"]} rows={[["library Saturday", "Source 2 at 0.392, then Source 3 at 0.224"], ["renewed", "Source 3 at 0.316"], ["renew", "nothing"], ["elephant", "nothing"]]} caption="Four searches of the live collection, each asking for up to two passages." />
<p>{"Elephant returns nothing because no passage contains it, which is the honest result. Renew returns nothing for a worse reason. Source 3 is about renewing books, but the word in it is renewed, and to an exact matcher those are two different words. Learned embeddings are meant to close that gap. This baseline leaves it open so that it can be seen."}</p>
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
              "The word in Source 3 is renewed, and to an exact matcher renew and renewed are two different words. A query with no word in the indexed vocabulary has a vector of no length, and only positive matches are returned, so nothing comes back. Elephant also returns nothing, and there that is the honest result, since no passage is about it.",
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
<p>{"A score can be compared with other scores for the same query on the same collection, and with nothing else. Trimming a sentence from each passage raised the right passage’s score from 0.392 to 0.535 without making it any more relevant. No fixed score means that a passage answers the question."}</p>
</KeepInMind>

</SubSection>
<SubSection title="6. Evaluate evidence and generation independently">
<p>{"If the needed passage was not retrieved, changing the answer model may not fix the failure. Check source coverage, chunk boundaries, retrieval ranking, and the context limit. If the right passage was supplied but the answer was wrong, inspect the generation step and its instructions."}</p>
<NumberTable headings={["What you find", "Where the failure is", "What to inspect"]} rows={[["The needed passage is not among those retrieved", "retrieval", "source coverage, chunk boundaries, ranking, the context limit"], ["The needed passage was retrieved and the answer is still wrong", "generation", "the instructions and how the model read the passage"]]} caption="Look at what was retrieved before looking at what was written." />
<p>{"The live collection supplies two different retrieval failures. A search for renew retrieves nothing although the collection covers renewals, which is the retriever’s failure. A question about Sunday opening cannot be answered from any of the three passages, which is a gap in source coverage. No change to the retriever or to the model will supply a fact the collection does not hold. In both cases a more capable answer model would be working from the wrong context, or from none."}</p>
<p>{"Source text is evidence to read, not permission to follow arbitrary instructions embedded in a document. An application should preserve that distinction when constructing prompts and handling external material."}</p>
<p>{"RAG does not automatically make facts current. The collection must be maintained, and the answer must use the relevant version. It also does not remove the need to say when evidence is missing or contradictory."}</p>
<p>{"The library makes the point about currency concrete. Suppose the Saturday hours change and Source 2 is not edited. The retriever will go on returning the old sentence with the same score, and a faithful model will go on citing it. Every step will have worked, and the answer will be wrong."}</p>

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
              "The shared words are the same in both cases, library and saturday. The snippet’s passages hold seven different words each, so the length in the denominator is √7 where the live passages had √13. The passage became no more relevant, which is why a score can only be compared with other scores for the same query on the same collection.",
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
              { hints: ["TermOverlapRetriever takes the list of passages. Its retrieve method takes the query and a limit, and answers a list of results, best first.", "Each result carries index, score and text. The index counts from zero, so the page’s Source 2 has an index of 1."], check: numberCheck("What score does the Saturday passage receive?", 0.3922, 0.0005, "The query has two words and both are in Source 2, so the numerator is 2. The query’s length is the square root of 2 and the passage’s is the square root of 13, and 2 divided by their product is 0.3922. The renewals passage follows at 0.2236 and the weekday passage at 0.1961. Each of those shares only the word library, and the shorter one ranks higher.") },
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
              { hints: ["retrieve takes the whole question as it is written. The retriever folds the case and drops the question mark itself.", "The retriever keeps the list of every word it indexed in its vocabulary attribute, all in lower case, which is why the starter folds the question’s words before you compare.", "A list comprehension with an if keeps the words that pass a test, and the join method of a string puts them on one line."], check: numberCheck("What score do the two opening-hours passages share?", 0.4804, 0.0005, "Only the words the, library and on are in the vocabulary. Both hours passages contain all three, so they tie at 0.4804, and the tie is listed in source order. That is higher than the 0.3922 the right passage earned for library Saturday, and neither passage says anything about Sunday. A score cannot report that the answer is absent, which is why the prompt template in Part 2 tells the model what to say when the sources do not provide it.") },
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
              { hints: ["Loop over the two collections, building a fresh TermOverlapRetriever for each, since a retriever indexes the passages it is given.", "A limit of five is more than either collection can match here. Only passages with a positive score are returned, so a short list means the others shared no word with the question."], check: numberCheck("What score does the top result receive in the collection of single sentences?", 0.7559, 0.0005, "The top sentence is the one about Saturday opening, which shares the, library, on and saturday with the question and is short, so it scores 0.7559. It does not hold the answer. The sentence that does, about closing at four, is not returned at all, because it shares no word with the question, and close is not the word closes. The whole passages return Source 2 at a lower score of 0.5547 with the closing time still attached. The higher score belongs to the less useful result.") },
            ),
          ],
        },
    ]}
  />;
}

