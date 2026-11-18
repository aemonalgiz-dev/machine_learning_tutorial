import { pageMetadata } from "@/lib/seo";
import { lessonIntuitions } from "@/lib/intuition";
import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { choice, several, trueFalse } from "@/lib/quizzes";
import { exercise, numberCheck } from "@/lib/exercises";
import { Equation } from "@/components/concept/PrimerPage";
import {
  DerivationTable,
  InAModel,
  KeepInMind,
  NumberTable,
  SubSection,
  WhyThisWorks,
  WorkedExample,
} from "@/components/concept/Treatments";
import { NGramCountTable } from "@/components/widgets/NGramCountTable";
import { NGramGenerator } from "@/components/widgets/NGramGenerator";
import { NGramNextWord } from "@/components/widgets/NGramNextWord";
import { NGramOrderCurve } from "@/components/widgets/NGramOrderCurve";
import { NGramPlayground } from "@/components/widgets/NGramPlayground";
import { NGramSmoothingSweep } from "@/components/widgets/NGramSmoothingSweep";
import { NGramWindows } from "@/components/widgets/NGramWindows";

export const metadata: Metadata = pageMetadata("/concepts/n-grams", {
  title: "N-Grams · Perceptron Lab",
  description:
    "An n-gram model estimates a continuation from counts of short sequences. Its predictions depend on the context length and how probability is assigned to sequences absent from the training data.",
});

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function NGramsPage() {
  return (
    <ConceptPage
      lessonId="n-grams"
      intuition={lessonIntuitions["n-grams"]}
      technicalStart="Part 2. From Counts to a Prediction"
      openingTitle="One Previous Word May Not Be Enough"
      playgroundTitle="Predict a word from the words just before it"
      playgroundIntro="Compare predictions with shorter and longer contexts. Inspect an unseen continuation and observe how smoothing changes its probability."
      title="N-Grams"
      tagline={"An n-gram model estimates a continuation from counts of short sequences. Its predictions depend on the context length and how probability is assigned to sequences absent from the training data."}
      prerequisites={
        <>
          The words counted here are whatever a splitting rule handed over, so{" "}
          <Link href="/concepts/splitting-on-spaces" className={link}>
            splitting on spaces
          </Link>{" "}
          comes first and decides what a word even is on this page. The closed
          list of words a model is allowed to answer with is the vocabulary of{" "}
          <Link href="/concepts/what-a-token-is" className={link}>
            what a token is
          </Link>
          . The habit in Part 4 of choosing a setting on text held back for the
          purpose, rather than on the text the score is then quoted from, is the
          argument of{" "}
          <Link href="/concepts/grid-search" className={link}>
            searching for a setting
          </Link>
          .
        </>
      }

      playground={<NGramPlayground />}
      sections={[
        {
          title: "Part 1. Counting Runs, Not Cutting Text",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. What this method is for">
                <p>
                  Once we have chosen text pieces, we can ask which pieces tend to occur together. Does knowing the preceding word help us predict the next one? We will count runs of adjacent tokens at different lengths and use those counts to build a prediction rule. The tokenizer is fixed for this experiment, so we can focus on what the counts tell us.
                </p>
                <p>

                  Context can help a speech recognizer choose between words
                  that sound similar. A count-based language model supplies
                  one source of that contextual evidence.
                </p>
                <p>
                  Predicting the next token is also a training task for
                  autoregressive neural language models. Those models learn
                  prediction parameters instead of relying on an explicit
                  table of n-gram counts. The counting version gives us a
                  transparent starting point for the shared prediction problem.
                </p>
                <p>
                  A run of n adjacent pieces is called an n-gram. One word is a
                  unigram, two a bigram, three a trigram, and above that people
                  usually say the number. The pieces do not have to be words, and
                  character n-grams are common, though everything on this page is
                  counted over words.
                </p>
                <p>
                  Runs have to be counted rather than words because a table of
                  how often each word occurs contains no information about order
                  at all. It gives exactly the same answer for a sentence and for
                  the same sentence with its words reversed, and step 19 measures
                  that coming out equal to the last digit on six real sentences.
                  Everything a model of this kind knows about which word follows
                  which is in the runs of two or more.
                </p>
                <KeepInMind>
                  An n-gram is a run of n adjacent pieces of a text, and this
                  page counts runs of words. What a word is was settled before
                  the counting started, by the splitting rule, and nothing here
                  can repair a bad decision made there.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Read the Alvarez sentence as overlapping word sequences" id="2-the-running-sentence-as-runs-of-words">
                <p>
                  Take the sentence this section of the site carries throughout,
                  Dr. Alvarez didn&rsquo;t expect the low-cost re-analysis. Split
                  on spaces and it is seven words, and the last of them is
                  re-analysis. with the full stop attached, because a space
                  splitter has no reason to take the stop off. Slide a window of
                  three along those seven and you get the trigrams. Slide a
                  window of two and you get the bigrams.
                </p>
                <p>
                  The widget below cuts it at four widths. The chip that matters
                  in each row is the last one, since that is the word the run
                  predicts, and everything to its left is what the prediction is
                  made from.
                </p>
                <NGramWindows />
                <KeepInMind>
                  {"The tokens re-analysis. and re-analysis have separate entries. With these count features, observing one does not directly increment the other’s count. A different tokenizer could separate the period before fitting."}
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Framing the edges">
                <p>
                  {"To predict the first word, this implementation supplies special start markers as its context. A model that reads two positions back receives two start markers. Other designs could use shorter contexts at sentence edges; explicit padding is the convention used here."}
                </p>
                <p>An end marker lets the model assign probability to finishing after a given context. It is predicted like another token, so observed endings contribute to the counts. A generation procedure still needs a stopping rule, and the learned transition structure determines whether an end marker will eventually be reached.</p>
                <p>
                  The start markers are the mirror image. They are never
                  predicted, only ever read back from, since the beginning of a
                  sentence is where the model starts rather than somewhere it can
                  arrive. A run whose last position is a start marker is not
                  counted at all.
                </p>
                <Equation>
                  {"P(sentence)  =  P(w₁ | start) · P(w₂ | w₁) · … · P(end | wₙ)"}
                </Equation>
                <WorkedExample title="What the framing adds">
                  <p>
                    The sentence about Dr. Alvarez is seven words. Framed for a window of
                    two it becomes nine positions, one start marker and one end
                    marker, and produces eight windows. Framed for a window of
                    three it becomes ten positions, two start markers and one end
                    marker, and still produces eight windows. The window count
                    does not change with the width, because every framing is
                    built so that each of the eight predicted positions, the
                    seven words and the end, has a full context to be predicted
                    from.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  A model of width n frames each sentence with n &minus; 1 start
                  markers and one end marker. The end marker is a prediction and
                  the start markers are not, which is why a text of seven words
                  gives eight predicted positions under every width.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. How many runs there could be, and how few there are">
                <p>
                  Everything on this page from here on is fitted to forty-four
                  short sentences from the world the sentence about Dr. Alvarez belongs to,
                  reports and analyses and samples arriving late. They hold 326
                  word occurrences and 62 distinct words, so with the end marker
                  and one stand-in for anything unseen the model has 64 words it
                  is allowed to answer with.
                </p>
                <p>
                  {"The prediction vocabulary allows 4,096 pairs and 262,144 triples. These forty-four sentences contain 141 distinct counted pairs and 202 triples. Some counted contexts also contain start markers, which are not prediction-vocabulary words, so the two columns are a scale comparison rather than exact coverage fractions. Longer contexts greatly increase the possible combinations."}
                </p>
                <NumberTable
                  headings={[
                    "words per run",
                    "distinct runs seen",
                    "runs the vocabulary allows",
                    "seen exactly once",
                  ]}
                  rows={[
                    ["1", "63", "64", "9 of 63"],
                    ["2", "141", "4,096", "41 of 141"],
                    ["3", "202", "262,144", "109 of 202"],
                    ["4", "236", "16,777,216", "164 of 236"],
                    ["5", "248", "1,073,741,824", "185 of 248"],
                  ]}
                  caption="Every width sees the same 370 predicted positions, the 326 words and the 44 end markers. The last column is the one that hurts, since by three words per run more than half of everything the corpus taught, it taught exactly once."
                />
                <p>
                  The 63 distinct single words are the 62 words of the corpus
                  plus the end marker; the stand-in is in the vocabulary without
                  ever having been counted, which is a detail that comes back in
                  Part 3.
                </p>
                <InAModel>
                  {"Increasing the sample from eleven sentences to forty-four raises word occurrences from 78 to 326, distinct pairs from 54 to 141 and distinct triples from 62 to 202. More data does reveal additional runs, but these samples still cover only a small part of the possible combinations. This finite comparison does not prove that a larger corpus can never help."}
                </InAModel>
                <KeepInMind>
                  A run seen once is a run whose probability is being estimated
                  from a single observation. At three words that describes 109 of
                  the 202 runs this corpus produced, and the share only rises with
                  the width.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. From Counts to a Prediction",
          content: (
            <>
              <SubSection title="5. The assumption that makes the question answerable">
                <p>
                  {"The probability chain rule conditions each word on all earlier words. It is exact, but directly estimating every full-history conditional from counts becomes difficult as histories grow. Many new contexts may have no observations. Restricting the context is one way to share evidence across sentences."}
                </p>
                <Equation>
                  {"P(w₁ … wₘ)  =  Π over i of  P(wᵢ | w₁ … wᵢ₋₁)"}
                </Equation>
                <>
<p>
                  Suppose the next word is predicted from only the two words
                  immediately before it. We can collect examples of those short
                  contexts even when the entire sentence is new. A width-three
                  n-gram model makes that restriction: earlier words cannot
                  change its answer once those final two words are fixed.
                </p>
                <p>

                  That fixed-context restriction is a Markov assumption. It is a
                  modeling choice, not a claim that language really forgets
                  everything earlier. A subject, topic or reference can matter
                  from farther away, so the short context can miss information
                  that a reader uses.
                </p>
                <p>
                  The restriction gives us a table we can estimate from observed
                  runs. At a fixed context width, a suitable lookup structure can
                  retrieve an entry without searching the whole training corpus.
                  Unseen contexts still need a policy, which the smoothing
                  sections will make explicit.
                </p>
</>
                <Equation>
                  {"P(wᵢ | w₁ … wᵢ₋₁)  ≈  P(wᵢ | wᵢ₋ₙ₊₁ … wᵢ₋₁)"}
                </Equation>
                <p>
                  The width n controls how much preceding context the counts
                  may use. A model of width one knows which words are common
                  and nothing else. A model of width three knows which words
                  follow which pairs and has seen very few of the pairs a new
                  text will contain. Smoothing and the tokenizer are separate
                  choices too. Part 5 measures where the context-width trade
                  lands on this corpus while keeping those choices explicit.
                </p>
                <KeepInMind>
                  The number n counts the whole run, so a model of width three
                  reads two words back. The off-by-one is worth holding on to,
                  since a trigram model and a two-word context are the same
                  thing described from either end.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. One count divided by another">
                <p>For the unsmoothed count model, the estimated probability is the observed continuation count divided by the total count for that context. This is a maximum-likelihood estimate within that fixed model: it maximizes the probability assigned to the observed training continuations. Unseen continuations receive zero until an additional smoothing rule changes the estimator.</p>
                <Equation>
                  {"P(word | context)  =  C(context word) ⁄ C(context)"}
                </Equation>
                <p>
                  Three sentences are enough to see the whole thing. The report
                  was late, the report was short, a summary was late. Nine words
                  can be predicted once the end marker and the stand-in are
                  counted, and there are fifteen predicted positions in all,
                  twelve words and three ends.
                </p>
                <NGramCountTable />
                <WorkedExample title="One sentence by hand">
                  <p>
                  {"In the three-sentence corpus, the starts two sentences. Every observed the is followed by report, and every report by was. The word was is followed by late twice and short once. Every late ends its sentence. The equation below multiplies those observed continuation probabilities."}
                </p>
                  <Equation>
                    {"P(the report was late)  =  (2⁄3)(1)(1)(2⁄3)(1)  =  4⁄9  =  0.4444"}
                  </Equation>
                  <p>
                  {"The product covers five predicted positions: four words and the end marker. Part 5 converts it to a per-position perplexity of 1.1761, so sentence length does not determine the reported scale on its own."}
                </p>
                </WorkedExample>
                <KeepInMind>
                  The denominator is how often the context stood before a next
                  word, not how often the context occurred. The two agree inside
                  a sentence and part company at the edges, since the end marker
                  occurs three times here and is followed by nothing, so its
                  denominator is zero.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. The same rule on a larger text">
                <p>
                  Fit the same rule to the forty-four sentences, ask it to read
                  the sentence about Dr. Alvarez, and every step is one division. Two of
                  the sentence&rsquo;s words are not in the vocabulary at all,
                  since nothing in the training text contains didn&rsquo;t or
                  expect, and both are replaced by the one stand-in the model
                  keeps for that purpose before anything is looked up.
                </p>
                <NumberTable
                  headings={[
                    "reading back",
                    "predicting",
                    "times seen",
                    "probability",
                  ]}
                  rows={[
                    ["start", "Dr.", "7 of 44", "0.1581"],
                    ["Dr.", "Alvarez", "7 of 7", "0.9570"],
                    ["Alvarez", "the stand-in", "0 of 7", "0.0007"],
                    ["the stand-in", "the stand-in", "0 of 0", "0.0156"],
                    ["the stand-in", "the", "0 of 0", "0.0156"],
                    ["the", "low-cost", "1 of 46", "0.0217"],
                    ["low-cost", "re-analysis.", "2 of 4", "0.4641"],
                    ["re-analysis.", "end", "3 of 3", "0.9051"],
                  ]}
                  caption="The sentence about Dr. Alvarez read by a two-word model, with a little smoothing applied so that the zeroes of the next Part do not swallow the table. Three of the eight runs never occurred in training."
                />
                <p>
                  Two rows are worth staring at. Dr. was followed by Alvarez
                  every one of the seven times it occurred, and the model very
                  nearly says so. The two rows reading 0.0156 are the model with
                  nothing at all to go on, since the stand-in never occurred in
                  training and so never stood before anything, and 0.0156 is one
                  divided by the 64 words the model is allowed to answer with.
                </p>
                <KeepInMind>
                  A closed vocabulary means every word outside it becomes one
                  word, and that word inherits whatever the rule gives something
                  never counted. The usual repair is to relabel the rarest words
                  of the training text as the stand-in before counting, so the
                  model learns what tends to surround an unfamiliar word rather
                  than having no opinion at all.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. A whole answer, not one number">
                <p>
                  {"For a given context, a normalized model supplies a probability for every vocabulary item. Together they form a distribution. Its most probable word is one possible prediction. Entropy measures how concentrated the distribution is, in bits; raising two to that entropy gives its effective number of equally likely choices. Concentration alone does not establish whether the predictions are accurate or calibrated."}
                </p>
                <Equation>
                  {"bits  =  −Σ over words of  P(word) log₂ P(word)"}
                </Equation>
                <NGramNextWord />
                <>
<p>
                  Four contexts are worth comparing there. At the start of a sentence the model has 44 observations and only five words ever began one, so the answer is the narrowest of the four at 4.9775 bits. After the it has 46 observations spread over eighteen different words and reads 5.6283. After Dr. it has seven observations all agreeing, which ought to be the narrowest answer of all and is instead the widest at 5.8117, for a reason Part 4 is about.
                </p>
                <p>
                  And after a word it never saw it has nothing, so every word of the vocabulary gets the same number and the answer is exactly 6 bits, which is 64 equally likely words.
                </p>
</>
                <KeepInMind>
                  {"A uniform distribution over 64 words has entropy six bits, the maximum for this vocabulary. Observed contexts can have lower entropy, but can also reach the same maximum if their smoothed counts are uniform."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            trueFalse(
              "A seven-word sentence gives eight predicted positions whether the model reads one word back or two.",
              true,
              "A model of width n frames each sentence with n − 1 start markers and one end marker. Framed for a window of two the sentence becomes nine positions and eight windows, and framed for a window of three it becomes ten positions and still eight windows, because every framing is built so that each of the seven words and the end has a full context to be predicted from.",
            ),
            choice(
              "Why is the end marker predicted while the start markers are not?",
              [
                "The beginning of a sentence is where the model starts rather than somewhere it can arrive, so a run ending in a start marker is not counted at all",
                "The start markers are too common for their counts to be useful",
                "The end marker is the only marker the splitting rule produces",
                "Start markers are predicted as well, but always with probability one",
              ],
              0,
              "The start markers supply context before the first predicted word. Predicting an end marker models when a sequence terminates. Without it, a next-word model needs another stopping or length rule; the SDK also imposes a generation cap. These are distinct from pretending a start marker is a possible next word.",
            ),
            several(
              "Sixty-four words allow 4,096 pairs and 262,144 triples, and the forty-four sentences produced 141 and 202. Which of these does Part 1 go on to measure about that table of counts?",
              [
                "By three words per run, more than half of the distinct runs were seen exactly once",
                "Going from eleven sentences to all forty-four, the distinct pairs and triples grew roughly as fast as the text did",
                "A wider window finds more predicted positions in the same corpus",
                "The share of runs seen exactly once falls as the window widens",
              ],
              [0, 1],
              "At width three, 109 of 202 distinct runs were seen once; at widths four and five the counts are 164 of 236 and 185 of 248. Each width covers the same 370 predicted positions. Increasing the finite sample from eleven to forty-four sentences expands distinct pairs from 54 to 141 and triples from 62 to 202. That illustrates sparse coverage here, without proving that additional data cannot help.",
            ),
            choice(
              "In the three sentences the step from was to late is worth 2 ⁄ 3, where the step from the to report is worth 1. Where does the 3 come from?",
              [
                "Was stood before a next word three times, and late was that word in two of them",
                "Late is one of three words that end a sentence in the corpus",
                "One of the three sentences does not contain was",
                "The end marker takes a third of every context’s probability",
              ],
              0,
              "The denominator counts all observed continuations of was: two late and one short. The report continuation after the occurred every time in this tiny corpus. Including the start and end steps, the sentence weight is:\n\n```math\n(2/3) × 1 × 1 × (2/3) × 1 = 4/9 ≈ 0.4444\n```\n\nThese are conditional counts under this fitted bigram model.",
            ),
            choice(
              "After an unseen context, the model’s uniform distribution over 64 possible outputs has entropy 6 bits. What does that mean?",
              [
                "Every one of the 64 words gets the same probability, which is what having no information looks like",
                "The six likeliest words share the probability between them",
                "The model needs six words of context before it can answer",
                "The context was seen six times in the forty-four sentences",
              ],
              0,
              "A uniform distribution over 64 outputs has six bits of entropy, the largest entropy any distribution over those same outputs can have. That is uncertainty averaged over the whole predicted distribution. A particular unlikely observed word can have more than six bits of surprisal, so the entropy ceiling is not a ceiling on every individual prediction error.",
            ),
        ],
        },
        {
          title: "Part 3. The Zero",
          content: (
            <>
              <SubSection title="9. A run that never occurred">
                <p>
                  Go back to the three sentences. The word summary never followed
                  the, so the count of that pair is zero, so the probability of
                  summary given the is zero. Now ask for the probability of the
                  sentence the summary was late. Every other step of it is
                  perfectly ordinary and one step is zero, and a product with a
                  zero in it is zero.
                </p>
                <p>
                  {"The unsmoothed model assigns zero probability to that sentence, even though a reader can form it from familiar words. This is a failure of the count estimate as a predictive model, rather than evidence that the sentence is linguistically impossible. The same issue affects a report was short because the pair a report is absent."}
                </p>
                <WorkedExample title="Two sentences the three cannot contain">
                  <p>
                  {"The training sentence the report was late receives probability 0.4444 and perplexity 1.1761. The two new sentences receive zero probability and infinite perplexity. With the next section’s smoothing, their perplexities become 5.0321 and 5.8064, while the training sentence scores 3.7965. All three are then scorable; that ranking is a property of this fit."}
                </p>
                </WorkedExample>
                <KeepInMind>
                  {"One zero continuation probability makes the entire sentence’s probability zero. Adding relevant training examples can remove a particular zero, but unseen combinations can remain. Smoothing changes the estimate so that it can assign probability beyond observed runs."}
                </KeepInMind>
              </SubSection>

              <SubSection title="10. How much of a new text is new">
                <p>
                  How often that happens is a measurable thing rather than a fear.
                  Take six sentences the model was never fitted to, frame them,
                  and count how many of their runs are runs the training text
                  never produced. There are 53 predicted positions across the six.
                </p>
                <NumberTable
                  headings={[
                    "words per run",
                    "runs never seen",
                    "of 53",
                    "share",
                  ]}
                  rows={[
                    ["1", "3", "53", "0.057"],
                    ["2", "10", "53", "0.189"],
                    ["3", "21", "53", "0.396"],
                    ["4", "30", "53", "0.566"],
                    ["5", "33", "53", "0.623"],
                  ]}
                  caption="At three words per run, two fifths of a new text is made of runs this corpus never contained. Each of those would be a zero, and any one of them is enough."
                />
                <p>
                  {"Even the unigram evaluation contains three unseen vocabulary items. Wider runs have more unseen combinations in this sample. That creates a coverage problem for unsmoothed prediction, especially at larger widths; its severity depends on the corpus, vocabulary and evaluation text."}
                </p>
                <KeepInMind>
                  A wider window knows more about the runs it has seen and has
                  seen a smaller share of what it will meet. The two effects pull
                  against each other, which is why Part 5 finds a best width
                  rather than an ever-improving one.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Why the estimate does this on purpose">
                <p>

                  Dividing one count by another is not a careless choice that a
                  more careful one would improve on. It is the estimate that
                  maximizes the probability of the training text, and it is the
                  best possible estimate by that standard. Every scrap of
                  probability it gives to a run it never saw would have to be
                  taken from a run it did see, and that would lower the number it
                  was maximizing.
                </p>
                <p>
                  {"On its own training sentences, the unsmoothed bigram model has perplexity 2.9970 and the five-gram model 1.6025. On the six held-out sentences, each tested width encounters a zero and has infinite perplexity. Infinite is a defined evaluation result here, rather than no score."}
                </p>
                <WhyThisWorks title="Why relative counts maximize the training likelihood">
                  <p>

                    Write the probability of the training text as a product over
                    contexts, and for one context the terms are the counts of
                    each following word as exponents on that word&rsquo;s
                    probability. Maximizing that product subject to the
                    probabilities summing to one gives each word its own count
                    over the total, and gives zero to anything with a count of
                    zero, because raising a probability of zero to the power of
                    zero costs the product nothing while giving that word any
                    probability at all takes it from the words that do have
                    counts.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  {"The same unsmoothed estimate can fit the training text well and assign zero probability to new combinations. Smoothing changes that estimator to support prediction on new text, accepting a reduction in training likelihood."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Taking From the Seen and Giving to the Unseen",
          content: (
            <>
              <SubSection title="12. Adding one to every count">
                <p>
                  {"Add the same positive constant to each possible continuation count. To keep the resulting probabilities normalized, add the constant once per vocabulary item to the denominator. An unobserved continuation then has a positive numerator. This is additive smoothing; other smoothing methods can use different rules."}
                </p>
                <Equation>
                  {"P(word | context)  =  ( C(context word) + k ) ⁄ ( C(context) + k V )"}
                </Equation>
                <p>
                  {"V is the prediction-vocabulary size, and k is the added count per possible continuation. The familiar add-one case is associated with Laplace’s rule of succession. The historical idea is to allow for outcomes missing from a finite observation set."}
                </p>
                <WorkedExample title="What adding one does to the three sentences">
                  <p>
                  {"With nine vocabulary items, add-one smoothing reduces the start-context probability of the to 0.25 and the probability of report after the to 0.2727. It gives summary after the a positive probability of 0.0909. The previously zero-probability sentence can now be scored."}
                </p>
                </WorkedExample>
                <KeepInMind>
                  {"Smoothing reallocates probability rather than creating extra probability mass. Methods differ in how they estimate that allocation, including how they use shorter contexts and evidence about rare events."}
                </KeepInMind>
              </SubSection>

              <SubSection title="13. What adding one costs a certainty">
                <p>
                  Adding one sounds modest until you notice that it is added once
                  per word of the vocabulary, so the denominator grows by the size
                  of the vocabulary while a typical numerator grows by one. When
                  the context is rare that swamps the evidence completely.
                </p>
                <p>
                  {"All seven observed occurrences of Dr. are followed by Alvarez. Add-one smoothing lowers that continuation probability to 0.1127 because it also allocates a count to every other vocabulary item. The resulting entropy is 5.8117 bits, close to the six-bit uniform maximum. Agreement among seven observations is still limited evidence, rather than certainty about all future text."}
                </p>
                <NumberTable
                  headings={[
                    "times every word is pretended to have followed",
                    "P(Alvarez after Dr.)",
                    "bits the answer costs",
                  ]}
                  rows={[
                    ["nothing added", "1.0000", "0.0000"],
                    ["0.001", "0.9911", "0.1268"],
                    ["0.005", "0.9570", "0.5132"],
                    ["0.01", "0.9175", "0.9037"],
                    ["0.1", "0.5299", "3.8076"],
                    ["0.5", "0.1923", "5.5341"],
                    ["1", "0.1127", "5.8117"],
                  ]}
                  caption="Seven observed continuations all name Alvarez. Add-one smoothing reduces its predicted probability to 0.1127 and raises entropy to 5.8117 bits. This measures the estimator’s concentration, not its calibrated certainty about future text."
                />
                <KeepInMind>
                  {"At fixed vocabulary size, the added counts have more influence when a context has few observations. That can make the prediction less concentrated than the raw counts suggest. Whether that allocation improves held-out probability is an evaluation question."}
                </KeepInMind>
              </SubSection>

              <SubSection title="14. A fraction rather than one, chosen by measurement">
                <p>
                  Nothing requires the constant to be one. Any positive number
                  works, and a fraction takes less from what was seen while still
                  leaving nothing at zero. Which fraction is a question with an
                  answer, and the answer is found by trying them and scoring each
                  on text the counts were not taken from.
                </p>
                <p>
                  {"Use six validation sentences to select the constant, then report performance on six separate test sentences. The indigo curve shows validation performance and the amber curve shows test performance. The marked validation minimum selects a candidate without using the test score to choose it."}
                </p>
                <NGramSmoothingSweep />
                <p>
                  {"For bigrams, validation selects 0.005, two hundred times smaller than add one. Its test perplexity is 8.9626, compared with 23.6179 for add one. The same evaluation procedure tests other widths; their selected constants increase as contexts become sparser."}
                </p>
                <KeepInMind>
                  {"Very small constants leave unseen continuations with little probability. Large constants give the added counts more influence, reducing distinctions supported by observed counts. Validation measures that trade-off for the supplied candidates and text."}
                </KeepInMind>
              </SubSection>

              <SubSection title="15. The two ends of the dial">
                <p>
                  {"For an observed context, reducing the positive constant toward zero approaches the relative-count estimate. For an unseen context, positive additive smoothing stays uniform even as the constant approaches zero; the unsmoothed quotient has no positive denominator. Increasing the constant without bound makes all contexts approach the uniform distribution."}
                </p>
                <NumberTable
                  headings={[
                    "times every word is pretended to have followed",
                    "score on the reporting text",
                  ]}
                  rows={[
                    ["1", "23.62"],
                    ["10", "49.41"],
                    ["100", "61.70"],
                    ["1,000", "63.75"],
                    ["100,000", "64.00"],
                  ]}
                  caption="At large positive constants, the fitted distribution approaches the uniform vocabulary distribution. Its perplexity approaches 64 on this representation."
                />
                <p>
                  {"A uniform distribution over 64 predicted items has perplexity 64. It is a useful baseline when the evaluation uses the same vocabulary and tokenization. A fitted model can score worse on a particular test set, so beating the baseline is evidence for that evaluation rather than proof of general understanding."}
                </p>
                <KeepInMind>
                  {"The additive constant controls the influence of observed counts relative to a uniform distribution. On this corpus, the selected bigram value is 0.005. Other corpora or candidate rules can favor another value."}
                </KeepInMind>
              </SubSection>

              <SubSection title="16. What this page does not carry">
                <p>
                  Adding a constant is the baseline rather than the state of the
                  art, and it has been known to be a poor one since Gale and
                  Church argued in the early 1990s that it hands unseen events far
                  more probability than they deserve. Everything measured above is
                  a demonstration of their point on a small scale.
                </p>
                <>
<p>
                  The rules that replaced it are named here without being drawn, because this page measures only what it can show. The Good-Turing estimate uses how many runs were seen exactly once to estimate how much probability the unseen runs should share. Interpolation mixes the estimate from a wide window with the estimate from a narrower one, so a triple nobody has seen falls back on the pair inside it.
                </p>
                <p>
                  Kneser and Ney&rsquo;s rule refines the fallback by asking, of the lower-order estimate, not how often a word occurred but in how many different contexts it occurred, which is what stops a word like Francisco from looking common when it only ever appears after one other word.
                </p>
</>
                <KeepInMind>
                  {"Alternative smoothing rules still need a defined vocabulary, context policy and evaluation. Their estimates can differ from additive smoothing in ways beyond the total mass assigned to unseen events, so the specific numerical results above belong to the rule measured here."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            trueFalse(
              "A pair with a count of zero makes the model say the sentence containing it is unlikely.",
              false,
              "A product with a zero in it is zero, so the model says the sentence cannot happen, which is a claim of a different kind and a false one about a sentence a reader has just read. A single unseen pair ruins a document of any length.",
            ),
            choice(
              "Part 5 finds a best width rather than a score that keeps improving. What in Part 3 is the reason?",
              [
                "A wider window knows more about the runs it has seen and has seen a smaller share of what it will meet",
                "A wider window has fewer predicted positions to average over",
                "The Markov assumption stops holding above two words",
                "A wider window cannot be framed, since there are not enough start markers",
              ],
              0,
              "On the six sentences the model was never fitted to there are 53 predicted positions at every width. The runs the training text never produced are 3 of them at one word, 10 at two, 21 at three and 33 at five, so by three words two fifths of a new text is made of runs that would each be a zero. The two effects pull against each other, which is why the score on new text turns at two words instead of improving all the way to five.",
            ),
            choice(
              "Why is giving an unseen run a probability of zero not a careless choice that a more careful one would improve on?",
              [
                "It is the estimate that makes the training text as probable as it can be, and any probability given to an unseen run has to be taken from a seen one",
                "The zeroes are a rounding artifact that a longer corpus removes",
                "No other estimate can be read in constant time",
                "A zero is what the Markov assumption requires",
              ],
              0,
              "Without smoothing, relative counts maximize the likelihood of the observed continuations for each fixed context. An outcome never observed after that context receives probability zero at that optimum. That answers a training-objective question, not whether the outcome is impossible in future text. Smoothing changes the estimator to reserve probability for missing evidence.",
            ),
            trueFalse(
              "Adding one to every count leaves Dr. followed by Alvarez, seven times out of seven, at a probability of 0.1127.",
              true,
              "The constant is added once for every word the model is allowed to answer with, so the denominator went from 7 to 71 while the numerator went from 7 to 8. The answer as a whole then costs 5.8117 bits against the 6 bits of knowing nothing at all, and rare contexts are exactly what a wider window is full of.",
            ),
            several(
              "Which of these hold for the constant added to every count?",
              [
                "Sending it towards zero brings the zeroes back",
                "At two words it was chosen on six sentences held back for the choosing, and the score was then reported on six more",
                "Sending it upwards makes the model memorize the training text",
                "The right amount can be read off the counts without a further choice",
              ],
              [0, 1],
              "Near zero, the additive constant approaches unsmoothed relative counts. At a very large value, its added mass dominates the observed counts and predictions approach uniform over the fixed output vocabulary. Validation text can select a useful strength between those limits. The reported optimum is specific to this training corpus, vocabulary and evaluation split.",
            ),
        ],
        },
        {
          title: "Part 5. Judging a Model on Text It Was Not Fitted To",
          content: (
            <>
              <SubSection title="17. Perplexity, and the same number in bits">
                <p>
                  {"One useful evaluation asks how much probability the model assigns to held-out text. Score each observed word using its preceding context, then combine the log probabilities. This tests probabilistic prediction; it is not the only way to evaluate a language model."}
                </p>
                <p>
                  {"For a length-normalized score, take the geometric mean of the inverse continuation probabilities. That is perplexity. A model assigning one chance in a hundred to each observed token has perplexity 100; assigning probability one throughout gives perplexity one. Implementations sum log probabilities to avoid underflow from long products."}
                </p>
                <Equation>
                  {"perplexity  =  exp( −(1⁄M) Σ over positions of  ln P(word | context) )"}
                </Equation>
                <p>
                  {"Cross-entropy reports the same average prediction loss in bits per predicted position. Perplexity is two raised to that value. Here 4.5618 bits per position corresponds to perplexity 23.6179 for the add-one bigram model on the six test sentences."}
                </p>
                <KeepInMind>
                  M is the number of predicted positions, and on this page that
                  includes every sentence&rsquo;s end marker and excludes its start
                  markers. Two perplexities computed over different position counts
                  are not the same measurement, so the convention has to be stated
                  before the number means anything.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. The score against the width">
                <p>
                  Now the trade of Part 2 can be measured. Fit the same corpus at
                  every width from one to five, score each on the six reporting
                  sentences, and see where the curve turns.
                </p>
                <NGramOrderCurve />
                <p>

                  The gray line falls all the way, from 35.06 at one word to
                  1.6025 at five, and it is the score on the sentences the counts
                  came from, so it is measuring how much of the corpus the model
                  has memorized. The indigo line, on text nothing was fitted to,
                  turns immediately. One word scores 46.73, two words 8.9626, and
                  from there it rises through 13.00, 20.09 and 23.40. Two words is
                  the best this corpus supports, and every wider window is worse
                  despite having strictly more information available to it.
                </p>
                <p>
                  {"At width three, about two fifths of the held-out predicted runs are unseen in training. Those positions rely on smoothing, while observed contexts can still use counts. The proportion helps explain the sparse-data problem; it does not mean most predictions at every context ignore the data."}
                </p>
                <InAModel>
                  {"Larger corpora and interpolation allow useful n-gram models with contexts wider than this tiny corpus supports. The best tested width here is two. That numerical result and this curve’s exact shape should not be generalized to every language-modeling task."}
                </InAModel>
                <KeepInMind>
                  {"The displayed training perplexity falls as the width increases, while test perplexity eventually rises. Training scores therefore give a poor selection rule in this experiment. At width five, 1.6025 on training text contrasts with 23.40 on held-out text. With arbitrary smoothing choices, monotonic training improvement is not a universal guarantee."}
                </KeepInMind>
              </SubSection>

              <SubSection title="19. What the second word buys">
                <p>
                  Step 1 claimed that counting words one at a time carries no
                  information about order. That is checkable rather than
                  arguable. Take the six reporting sentences, reverse the words
                  of each, and score both versions with the same model.
                </p>
                <NumberTable
                  headings={[
                    "words per run",
                    "the sentences as written",
                    "the same words reversed",
                  ]}
                  rows={[
                    ["1", "57.5683", "57.5683"],
                    ["2", "8.9626", "1715.1308"],
                    ["3", "14.0173", "111.8429"],
                  ]}
                  caption="A one-word model gives the two versions the same number to the last digit, since the words it multiplies are the same words in a different order. A two-word model is 191 times more surprised by the reversed text than by the original."
                />
                <p>
                  The equality in the first row is exact and has to be, because a
                  product does not depend on the order of its factors and the
                  factors are the same set of words either way. Every one of the
                  53 positions is scored from the same table however the sentence
                  is arranged, so the two columns could not have differed.
                </p>
                <p>
                  {"The trigram model assigns the reversed text perplexity 111.8429, compared with the bigram model’s 1715.1308. This measures their different distributions under the chosen smoothing. A less severe penalty does not establish that the trigram model understands order less well in general."}
                </p>
                <KeepInMind>
                  A model that counts one word at a time knows which words are
                  common and has no way of knowing which follows which, so every
                  claim on this page about word order needs a window of at least
                  two. The
                  first row above, 57.5683 in both columns, is what that limit
                  looks like from the outside.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. When two perplexities cannot be compared">
                <p>
                  {"Compare perplexities on the same text representation and evaluation convention. Changing the vocabulary can collapse distinct words into the same unknown token, changing the prediction task as well as the number of possible outputs. A smaller vocabulary does not automatically improve every fitted model’s score."}
                </p>
                <p>
                  {"With eleven training sentences, the vocabulary has 36 items; with all forty-four it has 64. At a very large smoothing constant, their measured perplexities approach the uniform baselines, 35.9998 and 63.9975. The lower number reflects a smaller output space rather than better recovery of the original words."}
                </p>
                <NumberTable
                  headings={[
                    "sentences fitted to",
                    "words in the vocabulary",
                    "positions of the reporting text it calls unfamiliar",
                    "its score",
                    "score of knowing nothing",
                  ]}
                  rows={[
                    ["11", "36", "15 of 53", "52.03", "36.00"],
                    ["22", "48", "9 of 53", "21.49", "48.00"],
                    ["33", "59", "5 of 53", "11.93", "59.00"],
                    ["44", "64", "3 of 53", "8.96", "64.00"],
                  ]}
                  caption="The eleven-sentence fit scores worse than its uniform baseline on this test set. That is evidence against this fitted predictor for the evaluated task, rather than proof that it learned no useful regularities."
                />
                <p>
                  {"At the constant selected for the full corpus, the eleven-sentence bigram model scores 52.03 on test text, worse than its uniform baseline of 36.00. That result concerns this training size, smoothing choice and test set. It does not prove that every pattern learned from those sentences is useless."}
                </p>
                <KeepInMind>
                  Quote a perplexity with the vocabulary it was computed over, the
                  positions it was averaged across, and the text it was read on,
                  or it is not a comparable number. A model calling more of the
                  text unfamiliar is scoring a different, easier question.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Writing Instead of Reading",
          content: (
            <>
              <SubSection title="21. Drawing a word instead of scoring one">
                <p>
                  {"To generate, sample the next word according to the distribution, append it to the context and repeat. The SDK stops when it samples the end marker or reaches a configured word limit. Scoring and sampling use the same probabilities but answer different questions."}
                </p>
                <p>
                  This is worth doing because it makes the model&rsquo;s opinion
                  visible in a way a score does not. A perplexity of 8.9626 tells
                  you a model is better than one at 23.6179 and tells you nothing
                  about what either of them thinks English is.
                </p>
                <NGramGenerator />
                <p>
                  {"The displayed samples gain longer familiar phrases as the context widens. At the widest settings, many outputs reproduce training sentences. Those samples illustrate this fit; a wide n-gram model can still generate new combinations when its observed contexts permit them."}
                </p>
                <KeepInMind>
                  {"Sampling exposes combinations the probability tables can produce. A sampled sentence need not have high total probability: random sampling can select rare continuations too. Read generated samples alongside probability-based evaluation rather than treating either as a complete quality check."}
                </KeepInMind>
              </SubSection>

              <SubSection title="22. Flattening or sharpening the draw">
                <p>
                  {"Before sampling, raise each positive probability to the inverse temperature and normalize. Temperatures below one concentrate the positive mass; values above one flatten it. A zero probability remains zero, and temperature one leaves the distribution unchanged. The change applies to the sampling distribution, not the stored counts."}
                </p>
                <p>
                  At a temperature of a quarter a three-word model draws The
                  analysis of the samples was expected to agree, which is one of
                  the forty-four sentences word for word. At a temperature of one
                  the same seed
                  gives The analysis of the samples. first summary delay. reviewed
                  cost. rewrote, which is the smoothing showing through, since a
                  little probability was spread over every word and the draw
                  occasionally takes it.
                </p>
                <KeepInMind>
                  {"The SDK applies temperature during sampling without changing the model’s reported probabilities. Its ordinary evaluation therefore stays unchanged. Evaluating the temperature-transformed distributions instead would define a different predictor and could change perplexity."}
                </KeepInMind>
              </SubSection>

              <SubSection title="23. What a wide window turns out to have learned">
                <p>
                  The bar chart above is the measurement rather than the
                  impression. Draw fifty sentences at each width with no smoothing
                  at all and count how many come back as one of the forty-four
                  training sentences word for word. At one word it is 0 of 50. At
                  two it is 2, at three 10, at four 37, at five 45, and at six all
                  fifty.
                </p>
                <p>
                  {"All fifty sampled outputs at width six reproduce training sentences. This is strong duplication in that finite sample, rather than proof that no new sentence can ever be generated. The low training perplexity measures prediction on familiar data; it does not on its own quantify the entire generator’s support."}
                </p>
                <KeepInMind>
                  {"Check held-out prediction and sample duplication separately. Reproducing a training sentence shows that this sample is a duplicate, but does not reveal whether the model also learned reusable patterns. A good training score alone cannot settle how it behaves on new text."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. What Falls Outside the Context Window?" , id: "part-7-where-the-method-stops-being-defined",
          content: (
            <>
              <SubSection title="24. A dependency the window cannot reach">
                <p>
                  The Markov assumption is not an approximation that more data
                  improves. It is a statement about what the model is allowed to
                  condition on, and anything outside that window is absent from
                  the description altogether rather than approximated badly.
                </p>
                <p>
                  Here is a corpus in which that can be watched. Six sentences,
                  each of the form the samples that somebody read were late or the
                  sample that somebody read was late, so the verb agrees with the
                  subject every single time and the subject stands five words
                  before the verb. There is nothing ambiguous about the corpus and
                  nothing statistical about the rule.
                </p>
                <NumberTable
                  headings={[
                    "words the model reads back",
                    "P(were) after “the samples that Dr. Alvarez read”",
                    "P(was)",
                  ]}
                  rows={[
                    ["1", "0.5", "0.5"],
                    ["2", "0.5", "0.5"],
                    ["3", "0.5", "0.5"],
                    ["4", "0.5", "0.5"],
                    ["5", "1.0", "0.0"],
                  ]}
                  caption="The subject needed for agreement is five words back. Under the balanced constructed corpus, models retaining at most four words assign equal probabilities to was and were. Repeating this same balanced evidence would not identify which subject occurred outside the retained window. Changing the corpus balance could move the average without recovering that missing distinction."
                />
                <p>
                  {"Widening the window lets the model use more distant words, but rapidly increases the number of possible contexts. A corpus need not populate every context to be useful; interpolation can share evidence. A fixed-width count model still cannot distinguish histories that have the same retained context."}
                </p>
                <KeepInMind>
                  A fixed window is a claim that nothing outside it matters. Where
                  that claim is false the model does not become approximate, it
                  becomes unable to represent the distinction at all, and the
                  answer it gives is the average over the cases it cannot tell
                  apart.
                </KeepInMind>
              </SubSection>

              <SubSection title="25. The counts are one text’s opinions">
                <p>
                  A model of this kind has no content beyond the text it counted.
                  It does not know that Dr. is usually followed by a surname; it
                  knows that in these forty-four sentences it was followed by
                  Alvarez seven times out of seven, and it will say so about any
                  text you show it. Every regularity it reports is a regularity of
                  one corpus, including the ones that are accidents of that corpus.
                </p>
                <p>
                  {"Changing the training subset changes the fitted vocabulary and counts. Here it changes recognized test positions from 38 to 50 out of 53 and perplexity from 52.03 to 8.96. Part of that change is the prediction representation, so it cannot be read as a clean comparison of accuracy on the original words."}
                </p>
                <p>
                  The count table reflects the corpus from which it was estimated. We can inspect individual entries to see that dependence directly. Other fitted language models also depend on their training data, although their learned relationships may be harder to read entry by entry.
                </p>
                <KeepInMind>
                  {"A model can assign probabilities to mapped input from another domain, but those scores do not certify that its predictions are suitable there. Check the unknown-token share and evaluate on representative text from the intended domain."}
                </KeepInMind>
              </SubSection>

              <SubSection title="26. A rule the data cannot supply">
                <p>
                  {"Counts record observed continuations. Assigning probability to unobserved combinations requires an estimator that generalizes beyond those observations. New data can inform that choice, including through validation, but the count table alone does not select a unique smoothing procedure."}
                </p>
                <p>
                  {"Additive smoothing assigns the same added count to every continuation within a context. Choosing k controls the strength of that uniform contribution. The 0.005 choice was selected by validation, while add one gives P(Alvarez after Dr.) of 0.1127 here. A selected estimator still reflects choices about its candidate family and evaluation data."}
                </p>
                <p>
                  {"Validation selected 0.005 for bigrams and 0.02 for four-grams. That difference shows that the tested widths favored different candidates on this data. It does not prove that every useful smoothing parameter must be found by a sweep; other estimators derive parameters from statistics or optimize them directly."}
                </p>
                <KeepInMind>
                  Every estimate here is a count plus a choice, and the choice is
                  not in the data. The better rules of step 16 make a more
                  defensible choice; none of them removes the need to make one.
                </KeepInMind>
              </SubSection>

              <SubSection title="27. Where the arithmetic runs out">
                <p>
                  The following cases need an explicit implementation policy or make a requested calculation undefined. The table names the missing quantity and explains what each policy changes.
                </p>
                <DerivationTable
                  expressionHeading="Context or observed sequence"
                  reasonHeading="Which probability can be assigned"
                  rows={[
                    {
                      expression: "a context that never occurred",
                      reason:
                        "The raw count quotient has a zero denominator. This SDK’s MaximumLikelihood policy returns zero; it does not raise an undefined-quotient error. Positive additive smoothing returns a uniform distribution, about 0.0156 per vocabulary item here.",
                    },
                    {
                      expression: "an unseen continuation after an observed context",
                      reason:
                        "defined, and zero. That is a real number rather than an absence, and it is the number that makes a whole text impossible, which is the difference between this row and the one above.",
                    },
                    {
                      expression: "any text containing one such run",
                      reason:
                        "its probability is a product with a zero in it, so the probability is zero, the log probability is negative infinity and the perplexity is infinite. Infinite is the correct answer rather than an error, since the model really is claiming the text cannot occur.",
                    },
                    {
                      expression: "a word outside the vocabulary",
                      reason:
                        "This SDK maps it to the unknown token before scoring. That makes the lookup available, but the unknown token can still have zero probability under an unsmoothed estimate. Mapping changes which prediction task is being evaluated.",
                    },
                    {
                      expression: "the stand-in itself never occurring in training",
                      reason:
                        "then the model has never seen an unfamiliar word and has no opinion about what surrounds one, so both of the sentence about Dr. Alvarez’s unfamiliar words are answered from the smoothing alone. Relabeling the rarest training words as the stand-in before counting is the repair, and it costs those words their own entries.",
                    },
                    {
                      expression: "a smoothing constant of exactly zero",
                      reason:
                        "AdditiveSmoothing requires a strictly positive constant. To use the unsmoothed relative-count rule, select MaximumLikelihood, whose explicit unseen-context policy returns zero. For an unseen context, every positive additive constant instead gives a uniform distribution.",
                    },
                    {
                      expression: "a window wider than the sentence",
                      reason:
                        "Start padding supplies missing context positions, so prediction remains defined. A two-word sentence still contributes its two words and end marker; its contexts combine those words with start markers rather than consisting entirely of framing.",
                    },
                    {
                      expression: "no end marker in the framing",
                      reason:
                        "Without a predicted end event, the word model alone does not define when to stop. An external length limit can still terminate generation. A distribution over variable-length complete sentences needs a termination model, supplied by an end marker here.",
                    },
                    {
                      expression: "an empty text",
                      reason:
                        "The SDK rejects an entirely blank evaluation corpus, including evaluate([\" \"]). A blank sentence inside an otherwise nonblank corpus is retained and contributes its end marker. log_probability_of can also score a blank string through that marker. A hypothetical evaluation with zero predicted positions has an undefined average; the implemented entry-point policies should be stated separately.",
                    },
                    {
                      expression: "two perplexities over different vocabularies",
                      reason:
                        "not comparable, and the direction of the error is predictable. A model that knows nothing scores the size of its own vocabulary, measured here at 36.00 over 36 words and 64.00 over 64, so the smaller vocabulary flatters every model built on it.",
                    },
                    {
                      expression: "the smoothing constant chosen on the text the score is quoted from",
                      reason:
                        "the score is then a best-of-many rather than an estimate, and it is optimistic. Choosing on separate text is the repair; here the chosen constant scores 4.07 where it was chosen and 8.96 where it was not, and at one word per run it scores 46.73 against adding one’s 43.06, so the choice made on one text was the wrong choice for the other.",
                    },
                  ]}
                />
                <KeepInMind>
                  {"Separate an unobserved continuation in an observed context from an entirely unseen context. The first has a well-defined zero relative frequency; the second has a zero denominator in the raw quotient. The SDK returns zero for both under MaximumLikelihood, while positive additive smoothing supplies probabilities for both. Report evaluation conventions alongside perplexity."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 to 7",
          quiz: [
            choice(
              "A model with one chance in a hundred at every word has a perplexity of 100. What is the number saying?",
              [
                "Over how many equally likely words the model would have to be guessing to do this well",
                "How many words long the text is",
                "What share of the words the model would have got right",
                "How many bits per word the model spends",
              ],
              0,
              "It is the geometric mean of the inverse probabilities, so a model certain of every word scores 1 and lower is better. The same quantity in bits per word is the cross-entropy and perplexity is two to that power, and neither of the two is more fundamental.",
            ),
            trueFalse(
              "On the six reporting sentences the score keeps improving as the window widens from one word to five.",
              false,
              "On this split, held-out perplexity improves at the bigram setting and worsens at the wider tested orders. Training perplexity continues falling, so it cannot select the order by itself. The many exact training-sentence samples at high orders give another view of repetition in the fitted distribution. They do not make every training-loss reduction a direct measurement of memorization.",
            ),
            several(
              "Which of these have to be stated before one perplexity can be compared with another?",
              [
                "The vocabulary it was computed over",
                "The positions it was averaged across",
                "The text it was read on",
                "The temperature the model was sampled at",
              ],
              [0, 1, 2],
              "Compare perplexities only when the tokenization, output vocabulary, unknown-word handling, sentence framing and evaluation text are compatible. In this SDK, the sampling-temperature option does not alter the probabilities used by evaluate. If another system explicitly applies temperature to its evaluated probabilities, that can change perplexity and must also be stated.",
            ),
            trueFalse(
              "A model that counts words one at a time gives the six reporting sentences and the same sentences with their words reversed exactly the same score.",
              true,
              "A unigram model assigns the same sequence probability when the same word counts are rearranged, because it has no preceding-word context. The bigram model changes its score substantially when these sentences are reversed. A smaller reversal gap at another order can reflect smoothing and sparse counts as well as the context definition; it is not a direct scale of language understanding.",
            ),
            trueFalse(
              "Where a dependency reaches further back than the window, the model becomes approximate about it.",
              false,
              "A fixed window is a claim that nothing outside it matters, and where that claim is false the model cannot represent the distinction at all. What it answers is the average over the cases it cannot tell apart. Widening the window is no general answer either, since every extra word multiplies the number of possible contexts by the size of the vocabulary.",
            ),
        ],
        },
        {
          title: "Practice. Counting, Smoothing and Scoring With the Library",
          practice: [
            exercise(
              "Work the three sentences with the library",
              [
  "Train a model that predicts each next word from the preceding word on the three supplied sentences. First use MaximumLikelihood, which estimates each next-word probability directly from observed pair counts.",
  "Print the five next-word probabilities for the report was late, including its end marker. Then report perplexity for each of the four supplied test sentences with raw counts and with AdditiveSmoothing(pretended_count=1.0).",
  "Perplexity summarizes how much probability the model assigns to the whole sequence, including sentence endings here. A zero-probability step gives infinite perplexity. The fourth test combines observed pairs into a sentence absent from training."
],
              `from oop_ml.core.natural_language_processing.n_grams.language_model import (
    NGramLanguageModel,
)
from oop_ml.core.natural_language_processing.n_grams.smoothing.base import (
    AdditiveSmoothing,
    MaximumLikelihood,
)

corpus = ["the report was late", "the report was short", "a summary was late"]
tests = [
    "the report was late",
    "the summary was late",
    "a report was short",
    "a summary was short",
]
steps = [
    ([], "the"),
    (["the"], "report"),
    (["report"], "was"),
    (["was"], "late"),
    (["late"], "</s>"),
]

# Fit one two-word model with the counts as they stand and one with a
# pretended count of 1.0 added to every count.
# For each step print the probability of the word after its context under
# the first model, to four places. An empty context is the start of a sentence
# and "</s>" is the end marker.
# For each test sentence print the perplexity under both models, to four places.`,
              `from oop_ml.core.natural_language_processing.n_grams.language_model import (
    NGramLanguageModel,
)
from oop_ml.core.natural_language_processing.n_grams.smoothing.base import (
    AdditiveSmoothing,
    MaximumLikelihood,
)

corpus = ["the report was late", "the report was short", "a summary was late"]
tests = [
    "the report was late",
    "the summary was late",
    "a report was short",
    "a summary was short",
]
steps = [
    ([], "the"),
    (["the"], "report"),
    (["report"], "was"),
    (["was"], "late"),
    (["late"], "</s>"),
]

counted = NGramLanguageModel(order=2, smoothing=MaximumLikelihood()).fit(corpus)
added = NGramLanguageModel(
    order=2, smoothing=AdditiveSmoothing(pretended_count=1.0)
).fit(corpus)

for context, word in steps:
    probability = counted.probability_of(word, context)
    print(f"{' '.join(context) or 'start'} -> {word}: {probability:.4f}")

for text in tests:
    alone = counted.evaluate([text]).perplexity
    repaired = added.evaluate([text]).perplexity
    print(f"{text}: counts alone {alone:.4f}, one added {repaired:.4f}")`,
              `start -> the: 0.6667
the -> report: 1.0000
report -> was: 1.0000
was -> late: 0.6667
late -> </s>: 1.0000
the report was late: counts alone 1.1761, one added 3.7965
the summary was late: counts alone inf, one added 5.0321
a report was short: counts alone inf, one added 5.8064
a summary was short: counts alone 1.5518, one added 5.3783`,
              {
question: "Can a bigram model score a sentence it never saw?",
 hints: [
  "Use order=2 and fit the same training list for both smoothing rules.",
  "probability_of(next_word, context) returns one conditional probability. evaluate(test_texts).perplexity reports the sequence score.",
  "The model supplies start markers for short contexts. Include the end marker when reproducing the five displayed steps."
], check: numberCheck("What does a summary was short score with the counts as they stand, to four places?", 1.5518, 0.0001, "The unseen sentence a summary was short has finite perplexity of 1.5518 under raw counts. Every adjacent pair it needs occurred in training, which is sufficient for this bigram model to score it.") },
            ),
            exercise(
              "Reach a subject five words back, then smooth it",
              [
  "The six training sentences distinguish singular and plural subjects before otherwise shared wording. Measure how far back the model must look to prefer were over was after the supplied context.",
  "Fit unsmoothed models with orders 2 through 6. For each print the probabilities of were and was. Then fit order 6 with additive constants 1.0 and 0.005 and print the same pair.",
  "Order includes the next word being predicted, so order 6 uses five preceding words. Keep the vocabulary and training sentences fixed when comparing smoothing strengths."
],
              `from oop_ml.core.natural_language_processing.n_grams.language_model import (
    NGramLanguageModel,
)
from oop_ml.core.natural_language_processing.n_grams.smoothing.base import (
    AdditiveSmoothing,
    MaximumLikelihood,
)

corpus = [
    "The samples that Dr. Alvarez read were late.",
    "The sample that Dr. Alvarez read was late.",
    "The samples that the team read were late.",
    "The sample that the team read was late.",
    "The samples that we read were late.",
    "The sample that we read was late.",
]
context = ["The", "samples", "that", "Dr.", "Alvarez", "read"]

for order in [2, 3, 4, 5, 6]:
    # Fit a model of this width with the counts as they stand and print
    # how many words it reads back and the probabilities of "were" and of
    # "was" after the context, to four places.
    ...

for pretended in [1.0, 0.005]:
    # Fit a model of width six with this constant added to every count and
    # print the same two probabilities, to four places.
    ...`,
              `from oop_ml.core.natural_language_processing.n_grams.language_model import (
    NGramLanguageModel,
)
from oop_ml.core.natural_language_processing.n_grams.smoothing.base import (
    AdditiveSmoothing,
    MaximumLikelihood,
)

corpus = [
    "The samples that Dr. Alvarez read were late.",
    "The sample that Dr. Alvarez read was late.",
    "The samples that the team read were late.",
    "The sample that the team read was late.",
    "The samples that we read were late.",
    "The sample that we read was late.",
]
context = ["The", "samples", "that", "Dr.", "Alvarez", "read"]

for order in [2, 3, 4, 5, 6]:
    model = NGramLanguageModel(order=order, smoothing=MaximumLikelihood()).fit(corpus)
    were = model.probability_of("were", context)
    was = model.probability_of("was", context)
    print(f"reading {order - 1} back: were {were:.4f}, was {was:.4f}")

for pretended in [1.0, 0.005]:
    rule = AdditiveSmoothing(pretended_count=pretended)
    model = NGramLanguageModel(order=6, smoothing=rule).fit(corpus)
    were = model.probability_of("were", context)
    was = model.probability_of("was", context)
    print(f"reading 5 back with {pretended} added: were {were:.4f}, was {was:.4f}")`,
              `reading 1 back: were 0.5000, was 0.5000
reading 2 back: were 0.5000, was 0.5000
reading 3 back: were 0.5000, was 0.5000
reading 4 back: were 0.5000, was 0.5000
reading 5 back: were 1.0000, was 0.0000
reading 5 back with 1.0 added: were 0.1250, was 0.0625
reading 5 back with 0.005 added: were 0.9349, was 0.0047`,
              {
question: "What does a longer context remember, and what does smoothing change?",
 hints: [
  "probability_of accepts the whole context and keeps the suffix allowed by the model’s order.",
  "Construct a fresh model for each order or smoothing rule.",
  "A wider context can have fewer observations. Added counts spread probability to alternatives even when the observed continuation is consistent."
], check: numberCheck("With 1.0 added to every count, what probability does the model reading five words back give were, to four places?", 0.125, 0.0001, "Add-one smoothing gives were probability 0.1250 at the widest context. That context occurs only once here, so a full added count for every vocabulary outcome has a large influence.") },
            ),
            exercise(
              "Choose the constant for eleven sentences",
              [
  "Use the eleven training sentences, the choosing set and the reporting set supplied in the starter. The choosing set selects the setting; the reporting set measures the final selected model.",
  "Fit order-2 models at each supplied smoothing constant. Print choosing and reporting perplexities to two decimal places, then select the row with the lowest choosing score and print its reporting score.",
  "Fit the supplied very-large-constant comparison separately. Print its reporting perplexity, vocabulary size and the reporting set’s unknown-token count out of all predicted positions. Do not use reporting scores to choose the constant."
],
              `from oop_ml.core.natural_language_processing.n_grams.language_model import (
    NGramLanguageModel,
)
from oop_ml.core.natural_language_processing.n_grams.smoothing.base import (
    AdditiveSmoothing,
)

training = [
    "The report was expected on Monday.",
    "The report was expected to cost less.",
    "The first report was late.",
    "The second report was late as well.",
    "Dr. Alvarez wrote the report on Monday.",
    "Dr. Alvarez wrote the report on Tuesday.",
    "Dr. Alvarez read the report and asked for a re-analysis.",
    "The team asked for a re-analysis of the samples.",
    "The team asked for a low-cost re-analysis.",
    "A low-cost re-analysis was expected.",
    "A low-cost re-analysis of the samples was expected.",
]
choosing = [
    "The cost of the samples was the reason for the delay.",
    "The team asked for the analysis of the second batch.",
    "We reviewed the summary and rewrote the analysis.",
    "The revised report was expected on Monday.",
    "Nobody expected the analysis to arrive early.",
    "The estimate of the re-analysis was short.",
]
reporting = [
    "Dr. Alvarez didn't expect the low-cost re-analysis.",
    "The cost of the re-analysis was lower than the estimate.",
    "The team expected the samples on Tuesday.",
    "We reviewed the tests and rewrote the analysis.",
    "Nobody expected the second batch to be late.",
    "The summary of the re-analysis was short.",
]

rows = []
for pretended in [0.005, 0.02, 0.05, 0.1, 0.2, 0.5, 1.0]:
    # Fit a two-word model with this constant, print its perplexity on the
    # choosing text and on the reporting text to two places, and append
    # (choosing score, reporting score, constant) to rows.
    ...

# Print the constant with the lowest choosing score and what it reports.
# Then fit at 100000.0 and print the vocabulary size, the reporting score,
# and how many predicted positions were unfamiliar out of how many.`,
              `from oop_ml.core.natural_language_processing.n_grams.language_model import (
    NGramLanguageModel,
)
from oop_ml.core.natural_language_processing.n_grams.smoothing.base import (
    AdditiveSmoothing,
)

training = [
    "The report was expected on Monday.",
    "The report was expected to cost less.",
    "The first report was late.",
    "The second report was late as well.",
    "Dr. Alvarez wrote the report on Monday.",
    "Dr. Alvarez wrote the report on Tuesday.",
    "Dr. Alvarez read the report and asked for a re-analysis.",
    "The team asked for a re-analysis of the samples.",
    "The team asked for a low-cost re-analysis.",
    "A low-cost re-analysis was expected.",
    "A low-cost re-analysis of the samples was expected.",
]
choosing = [
    "The cost of the samples was the reason for the delay.",
    "The team asked for the analysis of the second batch.",
    "We reviewed the summary and rewrote the analysis.",
    "The revised report was expected on Monday.",
    "Nobody expected the analysis to arrive early.",
    "The estimate of the re-analysis was short.",
]
reporting = [
    "Dr. Alvarez didn't expect the low-cost re-analysis.",
    "The cost of the re-analysis was lower than the estimate.",
    "The team expected the samples on Tuesday.",
    "We reviewed the tests and rewrote the analysis.",
    "Nobody expected the second batch to be late.",
    "The summary of the re-analysis was short.",
]

rows = []
for pretended in [0.005, 0.02, 0.05, 0.1, 0.2, 0.5, 1.0]:
    rule = AdditiveSmoothing(pretended_count=pretended)
    model = NGramLanguageModel(order=2, smoothing=rule).fit(training)
    chosen_on = model.perplexity(choosing)
    reported = model.perplexity(reporting)
    rows.append((chosen_on, reported, pretended))
    print(f"{pretended}: choosing {chosen_on:.2f}, reporting {reported:.2f}")

chosen_on, reported, pretended = min(rows)
print(f"chosen {pretended}, which reports {reported:.2f}")

rule = AdditiveSmoothing(pretended_count=100000.0)
flat = NGramLanguageModel(order=2, smoothing=rule).fit(training)
read = flat.evaluate(reporting)
print(f"knowing nothing over {flat.vocabulary.n_tokens} words: {read.perplexity:.2f}")
print(f"{read.n_unknown} of {read.n_words} positions unfamiliar")`,
              `0.005: choosing 46.27, reporting 52.03
0.02: choosing 29.83, reporting 32.93
0.05: choosing 24.46, reporting 26.83
0.1: choosing 22.63, reporting 24.74
0.2: choosing 22.40, reporting 24.36
0.5: choosing 24.10, reporting 25.87
1.0: choosing 26.39, reporting 27.93
chosen 0.2, which reports 24.36
knowing nothing over 36 words: 36.00
15 of 53 positions unfamiliar`,
              {
question: "Which smoothing strength should be chosen when the training corpus is smaller?",
 hints: [
  "perplexity(texts) evaluates the complete list, including sentence endings.",
  "Keep choosing_score, reporting_score and constant together in each row; select by choosing_score.",
  "evaluate exposes n_words and n_unknown. The very large constant produces an approximately uniform prediction over this model’s vocabulary."
], check: numberCheck("What does the constant chosen on the choosing text score on the reporting text, to two places?", 24.36, 0.005, "The choosing set selects 0.2, whose reporting perplexity is 24.36. The reporting set remains separate from selection, so its result checks the chosen setting on different sentences.") },
            ),
          ],
        },
      ]}
    />
  );
}
