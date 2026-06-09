import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
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

export const metadata: Metadata = {
  title: "N-Grams · oop_ml",
  description:
    "Counting runs of adjacent words gives a model of what comes next. Most of the method is repairing what it says about a run it never counted, which on a new text is two fifths of the triples.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function NGramsPage() {
  return (
    <ConceptPage
      title="N-Grams"
      tagline="Count how often runs of words occur, turn the counts into a guess at the next word, and repair the answer of zero that a new text always produces."
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
      history={
        <>
          <p>
            Andrei Markov was arguing about free will. Pavel Nekrasov had
            claimed that the law of large numbers holds only for independent
            trials, and drew from that the conclusion that human choices, since
            they obey statistical regularities, must be independent and
            therefore free. Markov set out to show that dependent trials obey
            the same law, and in 1913, in St Petersburg, he needed a real
            sequence of dependent events to count. He took the first 20,000
            letters of Pushkin&rsquo;s Eugene Onegin, classified each as a vowel
            or a consonant, and counted how often each of the four pairs
            occurred. He was counting a text to settle an argument in
            probability rather than to model Russian, and the chain of
            dependence he described is the one every page like this one assumes.
          </p>
          <p>
            Shannon made the same counting a model of language rather than a
            counterexample in probability. &ldquo;A Mathematical Theory of
            Communication&rdquo;, published at Bell Labs in 1948, has a section
            of approximations to English in which he builds text from counts of
            increasing width, first letters at random, then letters with their
            frequencies, then pairs, then triples, then whole words and pairs of
            words, and prints what each produces. He generated the word-level
            ones by opening a book at a random page, reading until he found the
            word he needed, and taking whatever followed it. His 1951 paper,
            &ldquo;Prediction and Entropy of Printed English&rdquo;, turned the
            same idea into a measurement, asking people to guess the next letter
            of a text and estimating from their guesses how many bits a letter
            of English costs. That measurement is the ancestor of the score in
            Part 5.
          </p>
          <p>
            The method became the working part of a technology at IBM. Frederick
            Jelinek&rsquo;s group at the Thomas J. Watson Research Center spent
            the 1970s and 1980s on continuous speech recognition, where the
            acoustic evidence for a word is often hopeless on its own and the
            only thing that can settle it is what tends to follow what. A
            trigram model counted over a large corpus was the piece that made
            those systems work, and the group needed a way of saying which of
            two such models was better without rebuilding the recogniser around
            each, which is what perplexity was introduced for, by Jelinek,
            Robert Mercer, Lalit Bahl and James Baker in 1977. Jelinek and
            Mercer&rsquo;s 1980 paper on interpolated estimation from sparse
            data is one of the first serious answers to the hole this page is
            mostly about, and the line of work it opened runs through Good and
            Turing&rsquo;s estimate of unseen species, Kneser and Ney&rsquo;s
            1995 backing-off rule, and Chen and Goodman&rsquo;s 1998 study
            comparing them all.
          </p>
          <p>
            The page asks six questions in order. What is a run of words, and
            what is counting them for? How does a count become a probability,
            and what has to be added to a sentence before its first word has
            anything to be predicted from? What happens the first time the model
            meets a run that never occurred, and how much of a new text is made
            of those? How much probability should be taken from what was seen
            and given to what was not, and can that amount be measured rather
            than assumed? How is a model judged on text it was not fitted to,
            and why is a lower score better? And what does the same model
            produce when it is asked to write rather than to read?
          </p>
        </>
      }
      playground={<NGramPlayground />}
      sections={[
        {
          title: "Part 1. Counting Runs, Not Cutting Text",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. What this method is for">
                <p>
                  The pages on either side of this one decide where the pieces
                  of a text are, splitting on spaces by the simplest rule there
                  is and the Unicode boundaries by a standard written to cover
                  every writing system at once. This page starts after that
                  decision has been made. It takes the pieces as given and asks
                  a different question, which is how often each run of adjacent
                  pieces occurs, and what those counts let you say about a word
                  you have not read yet.
                </p>
                <p>
                  That question is the oldest one in the subject, and it is what
                  a speech recogniser is doing when the sound of a word is
                  ambiguous and the only thing that can settle it is what tends
                  to follow the word before. It is also the question a modern
                  language model is trained on, unchanged in form and answered by
                  a machine with no counts in it anywhere, so the counting
                  version is a way in to what the newer ones are being asked to
                  do.
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

              <SubSection title="2. The running sentence as runs of words">
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
                  Because the full stop travelled with the word, re-analysis.
                  and re-analysis are two different words as far as the counting
                  is concerned, and a corpus containing one teaches nothing about
                  the other. That is a decision the splitting rule made, inherited
                  here without appeal.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Framing the edges">
                <p>
                  A sentence has a beginning and an end, and both have to be
                  written down or the counting cannot see them. The first word of
                  a sentence has nothing before it, so if the model is to predict
                  it at all there must be something standing in for the place
                  where the sentence starts. A model reading two words back needs
                  two such markers, one for each empty position, which is why the
                  count of them changes with the width of the window.
                </p>
                <p>
                  The end matters for a different reason. A marker after the last
                  word is predicted exactly like a word, so the model learns
                  which words tend to end a sentence, and a model that has learned
                  that is a model that knows when to stop. Without it the
                  probabilities of all the sentences of a given length would sum
                  to one separately for each length, and the model would have no
                  way of preferring a short sentence to a long one.
                </p>
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
                    The running sentence is seven words. Framed for a window of
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
                  short sentences from the world the running sentence belongs to,
                  reports and analyses and samples arriving late. They hold 326
                  word occurrences and 62 distinct words, so with the end marker
                  and one stand-in for anything unseen the model has 64 words it
                  is allowed to answer with.
                </p>
                <p>
                  Sixty-four words allow 4,096 different pairs and 262,144
                  different triples. The forty-four sentences produced 141 pairs
                  and 202 triples. That is the ordinary condition of the method
                  rather than a shortage of text, and it gets worse as the window
                  widens, since the number of possible runs is multiplied by the
                  vocabulary each time while the number of positions in the corpus
                  stays where it was.
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
                  Adding more text does not fix this. Going from eleven of the
                  sentences to all forty-four took the word occurrences from 78 to
                  326, a little over four times as many, and took the distinct
                  pairs from 54 to 141 and the distinct triples from 62 to 202.
                  The table of counts grows roughly as fast as the text does,
                  which is what it looks like when a table is nowhere near full.
                </InAModel>
                <KeepInMind>
                  A run seen once is a run whose probability is being estimated
                  from a single observation. At three words that describes 109 of
                  the 202 runs this corpus produced, and the share only rises with
                  the width.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 2. From Counts to a Prediction",
          content: (
            <>
              <SubSection title="5. The assumption that makes the question answerable">
                <p>
                  The probability of a sentence is the probability of its first
                  word, times the probability of its second given the first,
                  times the probability of its third given the first two, and so
                  on to the end. That is exact and it is useless, because by the
                  fourth or fifth word the thing being conditioned on is a phrase
                  that has never been written before, so there is nothing to
                  count and no estimate to make.
                </p>
                <Equation>
                  {"P(w₁ … wₘ)  =  Π over i of  P(wᵢ | w₁ … wᵢ₋₁)"}
                </Equation>
                <p>
                  The n-gram model throws away all of that history except the
                  last few words. A model of width three believes that the
                  probability of a word given everything before it equals the
                  probability of that word given the two words immediately
                  before, and nothing else about the sentence matters. This is
                  the Markov assumption, and it is false about language, since
                  what a sentence is about survives across any number of words.
                  It is useful anyway, because it turns an unanswerable question
                  into a table of counts, and a table of counts can be built from
                  any text at all and read in constant time.
                </p>
                <Equation>
                  {"P(wᵢ | w₁ … wᵢ₋₁)  ≈  P(wᵢ | wᵢ₋ₙ₊₁ … wᵢ₋₁)"}
                </Equation>
                <p>
                  The width n is the whole trade and it is the only real dial the
                  method has. A model of width one knows which words are common
                  and nothing else. A model of width three knows which words
                  follow which pairs and has seen very few of the pairs a new
                  text will contain. Part 5 measures where the trade lands here.
                </p>
                <KeepInMind>
                  The number n counts the whole run, so a model of width three
                  reads two words back. The off-by-one is worth holding on to,
                  since a trigram model and a two-word context are the same
                  thing described from either end.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. One count divided by another">
                <p>
                  With the history cut down to a fixed length, the estimate is
                  the obvious one. Count how often the run occurred, count how
                  often its first words stood before anything at all, and divide.
                  Nothing about it is a choice; it is the estimate that makes the
                  training text as probable as it can be, which is why it is
                  called the maximum-likelihood estimate.
                </p>
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
                    The word the started two of the three sentences, so the
                    probability of the after the start marker is 2 ⁄ 3. The
                    followed by report happened twice out of the two times the
                    stood before anything, so that step is 1. Report was is the
                    same, and was late happened twice out of the three times was
                    stood before anything, so that step is 2 ⁄ 3. Late ended the
                    sentence both times it occurred, so the last step is 1 again.
                  </p>
                  <Equation>
                    {"P(the report was late)  =  (2⁄3)(1)(1)(2⁄3)(1)  =  4⁄9  =  0.4444"}
                  </Equation>
                  <p>
                    Five steps went into that product, the four words and the
                    end, so the score reported in Part 5 is the fifth root of
                    9 ⁄ 4, which is 1.1761.
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
                  the running sentence, and every step is one division. Two of
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
                  caption="The running sentence read by a two-word model, with a little smoothing applied so that the zeroes of the next Part do not swallow the table. Three of the eight runs never occurred in training."
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
                  Asking the probability of one word is asking one entry of a
                  larger answer. For any context the model has a number for every
                  word it knows, the numbers sum to one, and it is only together
                  that they say anything. The largest is the model&rsquo;s guess.
                  How evenly the rest are spread is how unsure it is, and that
                  spread has a standard measurement in bits, with two to the
                  power of the bits being the number of equally likely words the
                  answer is worth.
                </p>
                <Equation>
                  {"bits  =  −Σ over words of  P(word) log₂ P(word)"}
                </Equation>
                <NGramNextWord />
                <p>
                  Four contexts are worth comparing there. At the start of a
                  sentence the model has 44 observations and only five words ever
                  began one, so the answer is the narrowest of the four at 4.9775
                  bits. After the it has 46 observations spread over eighteen
                  different words and reads 5.6283. After Dr. it has seven
                  observations all agreeing, which ought to be the narrowest
                  answer of all and is instead the widest at 5.8117, for a reason
                  Part 4 is about. And after a word it never saw it has nothing,
                  so every word of the vocabulary gets the same number and the
                  answer is exactly 6 bits, which is 64 equally likely words.
                </p>
                <KeepInMind>
                  Six bits over 64 words is what having no information looks
                  like, and it is the ceiling for this model. Any context the
                  model has actually seen has to come in below it.
                </KeepInMind>
              </SubSection>
            </>
          ),
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
                  The model is not saying that sentence is unlikely. It is saying
                  the sentence cannot happen, which is a claim of a different
                  kind, and a false one about a sentence a reader has just read.
                  The same thing happens to a report was short, whose every word
                  and every idea is in the three sentences and whose pair a
                  report is not.
                </p>
                <WorkedExample title="Two sentences the three cannot contain">
                  <p>
                    The report was late, which the corpus holds, comes out at
                    0.4444 and scores 1.1761. The summary was late and a report
                    was short both come out at exactly zero, and the score in
                    Part 5, which is a probability inverted and rooted, is
                    therefore infinite for both. Under the repair of the next
                    Part the same two sentences come back finite, at 5.0321 and
                    5.8064 against the held sentence&rsquo;s 3.7965, which is the
                    ordering a reader would have wanted all along.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  A zero anywhere in a text makes the whole text impossible, so a
                  single unseen pair ruins a document of any length. This is not
                  a rounding problem that a longer corpus fixes; it is a
                  statement the estimate is making.
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
                  The single-word row is the only one that is small, and even
                  there three words of the new text were never seen. Everything
                  above one word is a model that would refuse most of what it is
                  shown. This is the ordinary condition of the method rather than
                  a symptom of a small corpus, and it is worse at the widths that
                  would otherwise be the most informative.
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
                  maximises the probability of the training text, and it is the
                  best possible estimate by that standard. Every scrap of
                  probability it gives to a run it never saw would have to be
                  taken from a run it did see, and that would lower the number it
                  was maximising.
                </p>
                <p>
                  So the failure is exactly the success viewed from outside. On
                  the forty-four sentences it was fitted to, a two-word model
                  scores 2.9970 and a five-word model 1.6025, both far better
                  than anything else on this page. On the six sentences it was
                  not fitted to, the same models have no score at all, at every
                  width from one to five.
                </p>
                <WhyThisWorks>
                  <p>
                    Write the probability of the training text as a product over
                    contexts, and for one context the terms are the counts of
                    each following word as exponents on that word&rsquo;s
                    probability. Maximising that product subject to the
                    probabilities summing to one gives each word its own count
                    over the total, and gives zero to anything with a count of
                    zero, because raising a probability of zero to the power of
                    zero costs the product nothing while giving that word any
                    probability at all takes it from the words that do have
                    counts.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  The 2.9970 on the training text and the missing score on the
                  six sentences come from the same estimate, and the first is what
                  buys the second. Everything in Part 4 is a deliberate move away
                  from the best possible number on the training text.
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
                  The repair every method here is a version of is to pretend the
                  counting saw a little more than it did. Before dividing, add
                  the same constant to every count, and add the matching amount
                  to the denominator so that the numbers still sum to one, which
                  means adding the constant once for every word the model is
                  allowed to answer with. A run that never occurred now has a
                  small numerator instead of nothing.
                </p>
                <Equation>
                  {"P(word | context)  =  ( C(context word) + k ) ⁄ ( C(context) + k V )"}
                </Equation>
                <p>
                  V there is the size of the vocabulary and k is how many times
                  every word is pretended to have followed every context. Setting
                  k to one is the oldest version, and it is Laplace&rsquo;s rule
                  of succession from the Essai philosophique sur les
                  probabilit&eacute;s of 1814, which is where anyone reading
                  about this for the first time starts.
                </p>
                <WorkedExample title="What adding one does to the three sentences">
                  <p>
                    The vocabulary is nine words. The probability of the after the
                    start marker was 2 ⁄ 3 and becomes 3 ⁄ 12, which is 0.25. The
                    probability of report after the was 1 and becomes 3 ⁄ 11,
                    which is 0.2727. And the probability of summary after the was
                    0 and becomes 1 ⁄ 11, which is 0.0909. The sentence the
                    summary was late is now possible.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  The whole family of repairs has this shape. Probability is
                  taken from the runs that occurred and given to the runs that
                  did not, and the methods differ only in how much is taken and
                  how it is shared out.
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
                  In the forty-four sentences, Dr. occurs seven times and is
                  followed by Alvarez all seven. The counts are as certain as
                  counts get. Adding one leaves the probability of Alvarez at
                  0.1127, because the denominator went from 7 to 71, and the
                  answer as a whole costs 5.8117 bits, which is very close to the
                  6 bits of knowing nothing at all.
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
                  caption="Seven observations, all agreeing. Adding one to every count leaves the model less than an eighth as sure as its evidence, and nearly as unsure as a model with no evidence at all."
                />
                <KeepInMind>
                  A constant added per word of the vocabulary is a fixed amount of
                  invented evidence, and how much damage it does depends entirely
                  on how much real evidence it is competing with. Rare contexts
                  are exactly the ones a wider window is full of.
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
                  Six sentences are held back for the choosing and six more are
                  held back from that too, so the number reported is a number
                  nothing selected. The indigo curve below is the choosing text
                  and the amber curve is the reporting text; the ring marks the
                  lowest point of the indigo curve, which is the setting a person
                  would take away.
                </p>
                <NGramSmoothingSweep />
                <p>
                  At two words the chosen constant is 0.005, two hundred times
                  smaller than the textbook one. It scores 8.9626 on the reporting
                  text where adding one scores 23.6179, so the textbook setting is
                  more than two and a half times worse than a setting nobody had to be
                  clever to find. The same shape holds at three, four and five
                  words, with the chosen constant drifting up as the counts thin
                  out.
                </p>
                <KeepInMind>
                  The curve is choosing between two ways of being wrong. Too small
                  a constant and a run never seen gets almost nothing, so a text
                  containing one is nearly impossible; too large and a run seen
                  seven times out of seven is treated as a rumour. Neither end is
                  safe and the bottom is not at a round number.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. The two ends of the dial">
                <p>
                  The constant has a limit in each direction, and both limits are
                  models we have already met. Send it towards zero and the added
                  amount stops mattering beside the real counts, so the answer
                  approaches one count divided by another and the zeroes come
                  back. Send it upwards and the real counts stop mattering beside
                  the added amount, so every word of the vocabulary gets the same
                  number whatever stands before it.
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
                  caption="The vocabulary is 64 words, and a model that has been pretended into knowing nothing scores exactly that. The number a model has to beat is the size of its own vocabulary."
                />
                <p>
                  The upper limit is more useful than it looks, because it is the
                  yardstick. A model over 64 words that knows nothing scores 64,
                  and any real model has to come in under that to have earned
                  anything. It also has a sting in it, which Part 5 comes back to,
                  since a model over a smaller vocabulary starts from a smaller
                  number without having done anything better.
                </p>
                <KeepInMind>
                  Adding a constant is a dial between two models that already
                  exist, one that memorises the training text and one that scores
                  64 by knowing nothing. Every useful setting is somewhere in
                  between, and on this corpus at two words per run the useful part
                  of the range turned out to lie around 0.005.
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
                <p>
                  The rules that replaced it are named here without being drawn,
                  because this page measures only what it can show. The
                  Good-Turing estimate uses how many runs were seen exactly once
                  to estimate how much probability the unseen runs should share.
                  Interpolation mixes the estimate from a wide window with the
                  estimate from a narrower one, so a triple nobody has seen falls
                  back on the pair inside it. Kneser and Ney&rsquo;s rule refines
                  the fallback by asking, of the lower-order estimate, not how
                  often a word occurred but in how many different contexts it
                  occurred, which is what stops a word like Francisco from looking
                  common when it only ever appears after one other word.
                </p>
                <KeepInMind>
                  Everything on this page below the first Part is true of the
                  better rules as well. They change how much is taken and where it
                  goes; they do not change that something has to be taken, or that
                  the amount cannot be read off the data without a further choice.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Judging a Model on Text It Was Not Fitted To",
          content: (
            <>
              <SubSection title="17. Perplexity, and the same number in bits">
                <p>
                  There is one way of scoring a model of this kind and it is the
                  obvious one. Take text the model has never seen, ask it for the
                  probability of each word in turn given what came before, and
                  multiply. A model that gives the actual text a high probability
                  is a model that would have guessed well.
                </p>
                <p>
                  Multiplying thousands of numbers below one underflows, and the
                  result depends on how long the text is, so the reported figure
                  is the geometric mean of the inverses. Ask over how many equally
                  likely words a model would have to be guessing to do this well,
                  and that number is the perplexity. A model with one chance in a
                  hundred at every word has a perplexity of 100, a model certain of
                  every word has 1, and lower is better because a smaller number of
                  effective choices is a better-informed guess.
                </p>
                <Equation>
                  {"perplexity  =  exp( −(1⁄M) Σ over positions of  ln P(word | context) )"}
                </Equation>
                <p>
                  The same quantity in bits per word is the cross-entropy, and
                  perplexity is two to that power. A reader of the literature meets
                  both and neither is more fundamental. On the six reporting
                  sentences a two-word model with one added scores 4.5618 bits per
                  word, and two to that power is 23.6179, which is the perplexity
                  quoted above.
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
                  The grey line falls all the way, from 35.06 at one word to
                  1.6025 at five, and it is the score on the sentences the counts
                  came from, so it is measuring how much of the corpus the model
                  has memorised. The indigo line, on text nothing was fitted to,
                  turns immediately. One word scores 46.73, two words 8.9626, and
                  from there it rises through 13.00, 20.09 and 23.40. Two words is
                  the best this corpus supports, and every wider window is worse
                  despite having strictly more information available to it.
                </p>
                <p>
                  The reason is Part 3&rsquo;s table. At three words per run, two
                  fifths of the reporting text is runs that never occurred, so most
                  of what a three-word model says comes from the constant rather
                  than from the counts. The extra context it could use is context it
                  has almost never seen.
                </p>
                <InAModel>
                  Real systems do not stop at two. Trigram and four-gram models
                  were the working standard in speech recognition and machine
                  translation for thirty years, fitted to hundreds of millions of
                  words rather than 326, and with a fallback rule that lets an
                  unseen triple use the pair inside it instead of the constant.
                  The width the curve here prefers is a fact about a corpus of
                  forty-four sentences, and the shape of the curve is not.
                </InAModel>
                <KeepInMind>
                  The score on the text a model was fitted to only ever falls as
                  the window widens, so it cannot be used to choose the width. At
                  five words that score reads 1.6025 while the score on new text
                  reads 23.40, and a reader with only the first of those numbers
                  would take five words as the answer.
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
                    "words the model reads back",
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
                  The third row is the part worth noticing. A three-word model is
                  less offended by the scrambling than a two-word model, at
                  111.8429 against 1715.1308, and the reason is the smoothing
                  rather than any weaker grasp of order. Most of what a three-word
                  model says about any text at all comes from the constant, so it
                  was never very confident about the original either.
                </p>
                <KeepInMind>
                  A model that reads one word back knows which words are common
                  and has no way of knowing which follows which, so every claim on
                  this page about word order needs a window of at least two. The
                  first row above, 57.5683 in both columns, is what that limit
                  looks like from the outside.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. When two perplexities cannot be compared">
                <p>
                  A perplexity is a number about one model reading one text with
                  one vocabulary, and moving any of those three moves the number
                  for reasons that have nothing to do with how good the model is.
                  The vocabulary is the one that catches people, because a smaller
                  vocabulary makes every guess easier without making any guess
                  better informed.
                </p>
                <p>
                  This corpus can be made to show it. Fitted to eleven of the
                  forty-four sentences the model has a vocabulary of 36 words, and
                  a model over 36 words that knows nothing scores 35.9998. Fitted
                  to all forty-four it has 64 words, and knowing nothing there
                  scores 63.9975. The ignorant model looks nearly twice as good on
                  the smaller vocabulary, and it is the same model.
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
                  caption="The last two columns have to be read together. A model whose score is above the score of knowing nothing over its own vocabulary has learned nothing useful, and the eleven-sentence model, at 52.03 against 36.00, is in that position."
                />
                <p>
                  That first row is worth naming plainly. A two-word model fitted
                  to eleven sentences, at the constant chosen for the full corpus,
                  is worse on the reporting text than a model that gives every
                  word of its vocabulary the same probability. The counting only
                  starts to pay once there is enough text for the counts to mean
                  something, and on the way there it can be beaten by the crudest
                  thing available.
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
                  The answer in step 8 is a distribution, and there are two things
                  to do with a distribution. One is to look up the probability of
                  a word somebody else wrote, which is everything above. The other
                  is to draw a word from it at random in proportion to the
                  numbers, write that word down, slide the window along, and draw
                  again. Stop when the end marker is drawn.
                </p>
                <p>
                  This is worth doing because it makes the model&rsquo;s opinion
                  visible in a way a score does not. A perplexity of 8.9626 tells
                  you a model is better than one at 23.6179 and tells you nothing
                  about what either of them thinks English is.
                </p>
                <NGramGenerator />
                <p>
                  A one-word model produces the right words in no order, since it
                  has no notion of order to have. Two words gives phrases that
                  hold together for three or four words and then wander. Three
                  gives sentences that are mostly grammatical, and by five and six
                  the sentences are grammatical because they are the training
                  sentences.
                </p>
                <KeepInMind>
                  Drawing and scoring use the same numbers, so a model that
                  generates something absurd was going to score that thing highly
                  too. Reading a page of what a model writes is another way of
                  looking at the table that produced the 8.9626.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. Flattening or sharpening the draw">
                <p>
                  The draw can be reshaped before a word is taken. Raise every
                  probability to the power of one over a temperature and
                  renormalise, and the answer becomes more or less peaked without
                  any word being ruled in or out. Below a temperature of one the
                  likely words become likelier and the text more predictable;
                  above one the tail comes up and the text more surprising. At a
                  temperature of exactly one the draw is the model&rsquo;s own
                  answer untouched.
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
                  A temperature is a knob on the sampling and not on the model. The
                  probabilities the model reports are unchanged by it, so a
                  perplexity computed at one temperature is the perplexity at every
                  temperature.
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
                  A six-word model on this corpus draws nothing that was not
                  already written down, which is the same fact as the grey line in
                  step 18 falling to 1.6025, seen from the other side. What it has
                  learned is the forty-four sentences, and its excellent score on
                  those sentences is a report of that and not of anything else.
                </p>
                <KeepInMind>
                  Memorisation shows up as an excellent score on the text the
                  model was fitted to, and the only way to tell it apart from
                  having learned something is to score the model on text it was
                  never shown. The drawn sentences are a second, cheaper way of
                  noticing, since a draw that reproduces its source is not
                  ambiguous about what it was doing.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Where the Method Stops Being Defined",
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
                  caption="The deciding word is five back. At four words of context the model splits its answer exactly in half, and no amount of further text of this kind would move it, since the word that settles the question is not in the description."
                />
                <p>
                  Widening the window until it reaches is not a general answer.
                  Every extra word multiplies the number of possible contexts by
                  the size of the vocabulary, which is Part 1&rsquo;s table, so the
                  width that would reach a dependency of ten words describes a
                  space no corpus can populate. English has agreements and
                  references that reach much further than that, and a fixed window
                  cannot be widened to cover them without the counting collapsing
                  first.
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
                  The measurement in step 20 is the same point in another form.
                  Changing which sentences were counted changed the vocabulary from
                  36 words to 64, changed how many of a new text&rsquo;s 53 predicted
                  positions were recognised at all from 38 to 50, and changed the
                  score from 52.03 to 8.96. None of that is the method working
                  better or worse; it is
                  the model being a different model because the text was different.
                </p>
                <p>
                  This is not peculiar to counting runs. Anything fitted to a
                  corpus inherits it. It is worth stating here because the counting
                  is so direct that the inheritance can be looked up entry by
                  entry, which is more than can be said for most of the models on
                  this site.
                </p>
                <KeepInMind>
                  A model of this kind will happily predict text from a domain
                  nothing like the one it counted, at a score that says how badly.
                  Read the score before trusting the prediction, and read the
                  vocabulary before trusting the score.
                </KeepInMind>
              </SubSection>

              <SubSection title="26. A rule the data cannot supply">
                <p>
                  The deepest gap is the one Part 4 measured without naming. The
                  counts say how often each run occurred. They cannot say how much
                  probability the runs that did not occur ought to share, because
                  that is a question about events the counting has no observations
                  of, and no amount of counting produces observations of them.
                </p>
                <p>
                  So a smoothing rule is an assumption brought in from outside, and
                  the choice among rules is not settled by the data. Adding one
                  assumes every unseen run is as plausible as every other, which is
                  why a certainty of seven out of seven falls to 0.1127. Choosing
                  0.005 instead assumes far less, and it was chosen by scoring
                  candidate values on further text, which is a measurement of the
                  consequence rather than a derivation of the rule. Somebody had to
                  decide what to sweep over and which text to sweep on.
                </p>
                <p>
                  That the sweep found 0.005 at two words and 0.02 at four is
                  itself the evidence. An amount that followed from the counts
                  would not have to be searched for, and it would not have moved
                  by a factor of four when the only thing that changed was how
                  many words the model reads back.
                </p>
                <KeepInMind>
                  Every estimate here is a count plus a choice, and the choice is
                  not in the data. The better rules of step 16 make a more
                  defensible choice; none of them removes the need to make one.
                </KeepInMind>
              </SubSection>

              <SubSection title="27. Where the arithmetic runs out">
                <p>
                  Beside the three limits above there are cases where the
                  definition simply has nothing to say, and it is worth knowing
                  which is which. Each row below is a fact about the mathematics
                  rather than a matter of taste, and several of them carry a choice
                  that somebody has to make and that changes the answer.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what the method says"
                  rows={[
                    {
                      expression: "a context that never occurred",
                      reason:
                        "the estimate is a count over a total and the total is zero, so the quotient is undefined rather than small. Adding a constant makes it defined and makes it flat, one over the vocabulary for every word alike, which is 0.0156 here and carries no information about the context at all.",
                    },
                    {
                      expression: "a run that occurred with a context that did",
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
                        "the model has no entry for it, so something must be decided. Either the vocabulary is closed and the word becomes a single stand-in, which is what happens here, or the model refuses the text. Closing it makes every text scorable and makes the score depend on how many words were folded into the stand-in.",
                    },
                    {
                      expression: "the stand-in itself never occurring in training",
                      reason:
                        "then the model has never seen an unfamiliar word and has no opinion about what surrounds one, so both of the running sentence’s unfamiliar words are answered from the smoothing alone. Relabelling the rarest training words as the stand-in before counting is the repair, and it costs those words their own entries.",
                    },
                    {
                      expression: "a smoothing constant of exactly zero",
                      reason:
                        "the rule becomes one count over another, so it is defined wherever the context occurred and undefined where it did not. Every positive constant is defined everywhere, so zero is a boundary rather than a small value.",
                    },
                    {
                      expression: "a window wider than the sentence",
                      reason:
                        "defined, because the framing supplies as many start markers as the width asks for, so a sentence of two words under a six-word window is read entirely out of markers. The counts it produces are about the framing rather than about the language.",
                    },
                    {
                      expression: "no end marker in the framing",
                      reason:
                        "the model can never predict that a sentence has finished, so generation does not terminate and the probabilities of the sentences of each length sum to one separately. A distribution over sentences of all lengths needs the end to be an event.",
                    },
                    {
                      expression: "an empty text",
                      reason:
                        "there are no predicted positions, so the average in the exponent is a division by zero and the perplexity is undefined. A text of no words is not a text with a perfect score.",
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
                  Two of these are worth carrying away. A probability of zero is
                  defined and ruinous, while a context that never occurred is
                  undefined and merely uninformative, and the two failures need
                  different repairs. And a perplexity is only a number about a
                  model once the vocabulary, the counted positions and the text are
                  all stated beside it.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
