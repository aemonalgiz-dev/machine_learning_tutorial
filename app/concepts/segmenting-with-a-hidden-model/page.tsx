import type { Metadata } from "next";
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
import { CorpusSizeCurve } from "@/components/widgets/CorpusSizeCurve";
import { HiddenModelPlayground } from "@/components/widgets/HiddenModelPlayground";
import { LearnedTables } from "@/components/widgets/LearnedTables";
import { SmoothingDial } from "@/components/widgets/SmoothingDial";
import { TagTrellis } from "@/components/widgets/TagTrellis";
import { ThreeMethodsOneCorpus } from "@/components/widgets/ThreeMethodsOneCorpus";
import { TwinLanguages } from "@/components/widgets/TwinLanguages";

const TAGLINE =
  "Ask of every character where in its word it sits, beginning, middle, end or alone, and let the boundaries fall out of the answers. A hidden Markov model over four places, what it counts from tagged sentences, and the words it finds that no dictionary could.";

export const metadata: Metadata = {
  title: "Segmenting With a Hidden Model · oop_ml",
  description: TAGLINE,
};

export default function SegmentingWithAHiddenModelPage() {
  return (
    <ConceptPage
      title="Segmenting With a Hidden Model"
      tagline={TAGLINE}
      prerequisites={
        <>
          The two dictionary pages of this section, since this one is the repair
          for the failure both of them share. Nothing here needs a word list at
          all, and what it needs instead is sentences somebody has already cut up
          into words. The arithmetic is counting, division, and adding
          logarithms, and the search is the one the word lattice page derived,
          run over places in a word rather than words in a sentence.
        </>
      }
      history={
        <>
          <p>
            By the end of the 1990s the dictionary segmenters had settled into
            the shape the previous page describes, and everybody who used one
            knew where it broke. It broke on names. A system reading Chinese
            newswire met a foreign surname, a company nobody had floated when the
            dictionary was compiled, a place in a province the lexicographers had
            not covered, and each of them came back as its separate characters,
            because a reading built out of a word the list lacks is not a reading
            the method can produce. Adding the word fixed that word and nothing
            else. The people building these systems were adding entries faster
            than the language was coining them and still losing.
          </p>
          <p>
            Nianwen Xue turned the problem inside out in a 2003 article in
            Computational Linguistics and Chinese Language Processing, called
            Chinese word segmentation as character tagging, written while he was
            working on the Penn Chinese Treebank at the University of
            Pennsylvania. His move was to stop asking which word a stretch of
            characters is and start asking, of each character on its own, where
            in its word that character sits. There are only four answers, and a
            character has one of them whether or not its word has ever been
            written down before, so the question has an answer for a surname
            nobody has seen. He learned the answers from a corpus somebody had
            cut up by hand and tagged with a maximum entropy classifier; Fuchun
            Peng, Fangfang Feng and Andrew McCallum took the same four answers to
            conditional random fields at COLING in 2004, under a title that named
            the prize directly, new word detection.
          </p>
          <p>
            The machinery this page uses to choose among the answers is older
            than the idea it serves. Leonard Baum and Ted Petrie published the
            statistics of a Markov chain you cannot see, watched through the
            symbols it emits, in the Annals of Mathematical Statistics in 1966,
            and Andrew Viterbi published the recurrence that finds its most
            probable run of states in the IEEE Transactions on Information Theory
            in 1967, for decoding convolutional codes off a noisy channel. Set
            the hidden states to be the four places and the emitted symbols to be
            the characters, and the segmentation problem is a decoding problem.
            The first international Chinese word segmentation bakeoff, run by
            Richard Sproat and Thomas Emerson in 2003, is where the character
            methods and the dictionary methods were first measured against each
            other on the same data, and it is also where it became impossible to
            ignore that the annotated corpora disagreed with one another about
            what a word is. The segmenter most people reach for in Python today
            runs the word lattice of the previous page over its dictionary and
            hands the stretches its dictionary missed to exactly this model.
          </p>
          <p>
            This page asks six questions in order. What can neither dictionary
            method do, however good its counts become? What is there to ask of a
            character, and why are four answers enough to say anything a cut can
            say? What is counted from tagged sentences, and what has to be added
            to those counts before they can be used at all? How is the best run
            of answers found without trying the runs? What does the method buy
            over a word list, what does it give up, and how much tagged text does
            the trade need? And where does it stop deciding, so that something
            outside it has to?
          </p>
        </>
      }
      playground={<HiddenModelPlayground />}
      sections={[
        {
          title: "Part 1. The Word No List Can Reach",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. What both dictionary methods have in common">
                <p>
                  The greedy scan and the best whole path disagree about a great
                  many texts, and on one thing they cannot disagree. Both build
                  their answer out of entries of a word list, so a reading
                  containing a word the list lacks was never among the candidates
                  and no improvement to the scoring can reach it. That is not a
                  weakness of either rule. It is what it means to answer with
                  entries.
                </p>
                <p>
                  Here is the failure with everything else held still. Three
                  sentences are handed to all three methods, six words between
                  them, three of them distinct. A word list is counted from those
                  sentences and the greedy scan and the best path are run against
                  it, and the model this page is about is fitted on exactly the
                  same three sentences. Then all three are asked to read six
                  characters that spell out three words none of the sentences
                  contained.
                </p>
                <ThreeMethodsOneCorpus show="novel" />
                <p>
                  Both word-list methods answer six single characters, which is
                  the only thing they can do when nothing in the text matches
                  anything they hold. The third answers three two-character
                  words, and it is right, and every one of the three is a word it
                  had never been shown. The characters were not new; a, c and e
                  had only ever begun a word in those sentences and b, d and f
                  had only ever ended one, so what those three sentences taught
                  about a and about d is still true inside ad, where what they
                  taught about the words ab and cd reaches nothing in this text
                  at all.
                </p>
                <KeepInMind>
                  A word list can be added to and a scoring can be improved, and
                  neither of those makes a word off the list producible. What
                  changes on this page is what the candidates are made of, and
                  the scoring is a separate question that arrives in Part 4.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Asking the character instead of the stretch">
                <p>
                  The dictionary methods ask, of a stretch of characters, which
                  word it is. That question has no answer for a stretch nobody
                  has written down. Ask instead, of one character, where in its
                  word it happens to sit, and the question has an answer for
                  every character in every text, because a character sits
                  somewhere whatever word it is in.
                </p>
                <p>
                  Our own sentence carries the case that made this worth
                  inventing. Dr. Alvarez didn&rsquo;t expect the low-cost
                  re-analysis, and Alvarez is a Spanish surname in an English
                  sentence, which is precisely the sort of word no list holds. In
                  Chinese a foreign name is written out in characters chosen for
                  their sound, so Alvarez becomes five characters that are each
                  ordinary and that together mean nothing. The previous page
                  showed those five costing five separate pieces and the loss
                  being unrecoverable by any arrangement of the counts.
                </p>
                <p>
                  There is a second thing this buys, and it will matter later. To
                  build a word list somebody has to have decided where the words
                  were; to count what this method counts somebody has to have
                  decided exactly the same thing. So the two methods need the
                  same evidence and differ only in what they take from it, which
                  is why every measurement on this page can hand both of them the
                  identical sentences.
                </p>
                <KeepInMind>
                  One question about a stretch of text, which only a list can
                  answer, has been swapped for one question about a character,
                  which anything that has seen that character can answer. The
                  rest of the page is what the four answers are and how they are
                  chosen.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 2. Four Places, and Why Four Are Enough",
          content: (
            <>
              <SubSection title="3. Where a character sits in its word">
                <p>
                  Take a word and look at each of its characters in turn. If the
                  word has several characters then one of them is the first, one
                  is the last, and any others are somewhere in between. If the
                  word has only one character then that character is the whole
                  word and none of those three descriptions fits it. That is four
                  descriptions, and every character of every word has exactly one
                  of them.
                </p>
                <Equation>
                  {"a word of one character      →   S"}
                </Equation>
                <Equation>
                  {"a word of k characters, k ≥ 2   →   B  M … M  E,  with k − 2 middles"}
                </Equation>
                <p>
                  The letters are the usual shorthand and they stand for begins,
                  middle, ends and single. Read a whole sentence this way and you
                  get one letter per character. The six characters that mean
                  either research into the origin of life or a graduate
                  student&rsquo;s fate and origin are B E B E B E under the first
                  reading, since it is three two-character words, and B M E S B E
                  under the second, since it is a three-character word, then a
                  one-character word, then a two-character word.
                </p>
                <WorkedExample>
                  <p>
                    Going the other way is a rule with no choices in it. Walk the
                    letters from the left, keep collecting characters, and finish
                    a word whenever the letter is E or S. B E B E B E gives back
                    the three two-character words and B M E S B E gives back the
                    three of the other reading, and nothing had to be looked up
                    or scored, since the letters already say where the boundaries
                    are.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  A cut of a text and a run of these four letters over its
                  characters are the same object described twice. Choosing the
                  letters is therefore choosing the cut, and the whole method is
                  a way of choosing the letters.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. Every cut is one run of places, and every run is one cut">
                <p>
                  That correspondence deserves to be checked rather than
                  believed, because everything after it depends on the letters
                  being able to say whatever a cut can say. Between any two
                  neighbouring characters there either is a boundary or there is
                  not, so a run of n characters admits two to the power of n
                  minus one cuts. Count the runs of letters instead, allowing
                  only those that describe some cutting, and the count comes out
                  the same.
                </p>
                <Equation>
                  {"runs of places over n characters  =  2^(n − 1)  =  ways to cut n characters"}
                </Equation>
                <NumberTable
                  headings={[
                    "characters",
                    "runs of four letters in all",
                    "runs that describe a cut",
                    "ways to cut",
                  ]}
                  rows={[
                    ["1", "4", "1", "1"],
                    ["2", "16", "2", "2"],
                    ["3", "64", "4", "4"],
                    ["6", "4,096", "32", "32"],
                    ["10", "1,048,576", "512", "512"],
                  ]}
                  caption="Counted by trying every run of four letters of each length and keeping the ones that describe a cutting, which is the check written from the definition rather than from the recurrence. Most runs of letters describe nothing; the ones that survive are in step with the cuts exactly."
                />
                <p>
                  This is a sharper statement than it looks, and it is worth
                  setting against the previous page. A word lattice contains only
                  the readings its list permits, which on twenty-eight characters
                  of ordinary English was 2,592 out of 134,217,728. The places
                  here reach every cut there is, the 134,217,728 rather than the
                  2,592, including all the ones no dictionary would ever allow.
                  That is the same fact as section 1 seen from the other side,
                  since a word nobody listed sits on some cut of the characters
                  that spell it, and every cut is reachable here.
                </p>
                <KeepInMind>
                  Every cut has exactly one run of letters and every admissible
                  run of letters has exactly one cut, so working in letters keeps
                  every cut available and admits nothing that is not a cut. That
                  is what makes it safe to spend the rest of the page choosing
                  letters.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. Half the steps from one place to the next cannot happen">
                <p>
                  Look at what may follow what. After a character that begins a
                  word, or one inside a word, the word is still open, so the next
                  character is either another middle or the end. After a
                  character that ends a word, or one that was a word by itself, a
                  word has just closed, so the next character either begins a new
                  word or is a new word by itself. That rules out eight of the
                  sixteen pairs before any text has been looked at.
                </p>
                <DerivationTable
                  expressionHeading="after this place"
                  reasonHeading="only these may follow, and why"
                  rows={[
                    {
                      expression: "B, a character that begins a word",
                      reason:
                        "M or E, since the word it opened has to be finished. B then B would mean a word beginning inside another word.",
                    },
                    {
                      expression: "M, a character inside a word",
                      reason:
                        "M or E, for the same reason. A word open in the middle is still open.",
                    },
                    {
                      expression: "E, a character that ends a word",
                      reason:
                        "B or S, since the word has closed and whatever comes next starts a new one.",
                    },
                    {
                      expression: "S, a character that was a word alone",
                      reason:
                        "B or S, for the same reason. Nothing is open, so nothing can continue.",
                    },
                    {
                      expression: "the first character of a run",
                      reason:
                        "B or S, since there is no open word behind it to be the middle or the end of.",
                    },
                    {
                      expression: "the last character of a run",
                      reason:
                        "E or S, since a word left open at the end of the text is not a cutting of anything.",
                    },
                  ]}
                />
                <p>
                  These eight steps are not learned and they are not smoothed
                  away. They are refused, and the refusal is the reason the
                  counting in the next Part comes out as small as it does, since
                  a place has two possible successors rather than four. It is
                  also what stops the search answering something like B B, which
                  is a run of letters that cannot be cut into words at all and
                  would be a wrong answer of a kind no inspection of the words
                  would explain.
                </p>
                <KeepInMind>
                  Half the structure of this model was fixed by what a word is
                  before a single sentence was counted. The counting decides which
                  of the eight remaining steps are common; it never gets a say in
                  whether the other eight are possible.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. What Is Counted, and What Is Added To It",
          content: (
            <>
              <SubSection title="6. Three tables, and all of them are counts">
                <p>
                  Take sentences somebody has already cut into words. Write the
                  four letters under every character, which the third section
                  showed is a rule with no choices in it. Now three things can be
                  counted, and the model is those three things and nothing else.
                  How often a sentence started in each place, how often each place
                  followed each other place, and how often each place produced
                  each character.
                </p>
                <p>
                  Two sentences over three characters are small enough to read
                  every number of. The first is the two-character word ab
                  followed by the one-character word c, so its letters are B E S.
                  The second is the single three-character word abc, so its
                  letters are B M E.
                </p>
                <LearnedTables corpusKeys={["two sentences", "five sentences"]} />
                <p>
                  Read the middle table across. Both sentences started with a
                  character that begins a word, so of the two starts, two were B
                  and none was S. After a B there was one M and one E. After the
                  only M there was one E and no further M. After the only E there
                  was one S and no B. And after S there was nothing at all, since
                  the one S in the corpus was the last character of its sentence.
                  That last row is the interesting one, and the next section is
                  about it.
                </p>
                <KeepInMind>
                  Every number in those three tables is a count over a total.
                  There is no fitting, no optimisation and nothing to converge, so
                  two people counting the same sentences get identical tables.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. A count of zero would end the search before it started">
                <p>
                  A run of letters is scored by multiplying together one number
                  per character and one per step between characters, and any one
                  of those numbers being zero makes the whole product zero. The
                  row that never occurred would therefore not merely be
                  unfavoured; it would be impossible, and every reading that used
                  it would be ruled out by an accident of what the corpus happened
                  to contain. So a fixed amount is added to every outcome that can
                  happen, before the counts are turned into shares.
                </p>
                <Equation>
                  {"P(next place | this place)  =  (count of the pair + a) / (count of this place + 2a)"}
                </Equation>
                <p>
                  The two in the denominator is the number of places that may
                  follow, which the fifth section fixed at two for each of the
                  four. The eight refused steps get no helping, because a helping is
                  for an outcome that could have occurred and did not, and those
                  eight could not have occurred.
                </p>
                <WorkedExample>
                  <p>
                    On the two sentences above, with one added to every outcome
                    that can happen, a run starts in B with share (2 + 1) over (2
                    + 2), which is three quarters, and in S with one quarter. A B
                    is followed by M or E with one half each, since each was seen
                    once out of two. An M is followed by M with (0 + 1) over (1 +
                    2), a third, and by E with two thirds. An E is followed by B
                    with a third and S with two thirds.
                  </p>
                  <p>
                    The row for S is the one worth staring at. Nothing at all
                    followed an S in this corpus, so the counts are zero over
                    zero, and after the helping the two admissible successors come
                    out at one half each. That is the model reporting that it has
                    never seen what follows a one-character word and has nothing
                    to say about it.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  Smoothing here makes an estimate exist at all for the outcomes
                  a small corpus did not happen to show, rather than refining one
                  that was already there, and the ninth section measures what it
                  decides while it is doing that.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. The spare slot, so an unfamiliar character still costs something">
                <p>
                  The characters need the same treatment and one thing more. A
                  place that never produced a given character can be handled the
                  way the steps were, by adding a helping to every character of
                  the alphabet. That still leaves a character the corpus never
                  contained anywhere with no entry in any row, and such a
                  character is exactly what turns up in a name. So the shares are
                  spread over the alphabet plus one extra slot standing for
                  everything else.
                </p>
                <Equation>
                  {"P(character | place)  =  (count of that pair + a) / (count of the place + a × (alphabet + 1))"}
                </Equation>
                <p>
                  On the two sentences the alphabet is a, b and c, so there are
                  four slots. The place that begins a word produced a twice and
                  nothing else, so a gets (2 + 1) over (2 + 4), one half, and b, c
                  and anything at all get one sixth each. The place that stands
                  for a word alone produced c once, so c gets two fifths and
                  everything else a fifth.
                </p>
                <p>
                  Notice what that last sentence quietly concedes. A character the
                  corpus contains but that this place never produced gets exactly
                  the same share as a character the corpus has never seen. The
                  extra slot exists so that the second case has a number rather
                  than to tell the two cases apart, and the nineteenth section is
                  about what follows from their being indistinguishable.
                </p>
                <KeepInMind>
                  Every row of the character table sums to one over the alphabet
                  and the spare slot together. The share sitting in that spare
                  slot is the whole of what the model has to say about a character
                  it has never met, and it says it four times, once per place.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. What the helping decides, on a corpus that disagrees with itself">
                <p>
                  How much to add is a free number, and on a small corpus it is
                  not a small decision. Here are four sentences in which the first
                  two of three characters are a word twice and all three are a
                  word once, so the corpus contradicts itself about that stretch
                  and something has to choose. Walk the amount added down from two
                  to a hundredth and watch the answer turn over.
                </p>
                <SmoothingDial />
                <p>
                  At the usual value of one, and at a half, and at a quarter, the
                  model answers the majority reading and therefore fails to
                  reproduce a sentence it was itself trained on. Below about
                  0.238 it answers the minority reading and the training sentence
                  comes back as written. The middle figure in the widget is what
                  moves. The share of the place inside a word producing
                  the second character rises from 0.1429 at a helping of two to
                  0.9182 at a hundredth, because that place produced that
                  character every one of the very few times it produced anything,
                  and a large helping drowns a small count while a small one lets
                  it through.
                </p>
                <InAModel>
                  <p>
                    Both answers are defensible and the method contains no
                    argument for either. Failing to reproduce your own training
                    sentence sounds like a fault and is the ordinary consequence
                    of not trusting a single observation, which is what smoothing
                    is for. Reproducing it sounds like success and is one step
                    from memorising every accident of the corpus. What I take from
                    the measurement is narrower, that the number is not a
                    formality and a page reporting a segmentation without saying
                    what was added to the counts has left out something that
                    changed the answer.
                  </p>
                </InAModel>
                <KeepInMind>
                  One free number, one corpus, two readings, and a threshold at
                  0.238 that nothing in the method predicts. The twentieth section
                  comes back to this as one of the two things that have to be
                  decided before any counting can begin.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Finding the Best Run of Places",
          content: (
            <>
              <SubSection title="10. What a whole run of places is worth">
                <p>
                  A run of letters over a text is worth the chance of it having
                  happened, and by the three tables that chance is a product. The
                  chance that the first character sat where it did, times the
                  chance it produced the character it produced, times for every
                  character after it the chance of the step that reached it and
                  the chance of the character it produced. Taking logarithms turns
                  that product into a sum for the same reason it did on the
                  previous page, which is that a product of many numbers below one
                  falls below what a computer can tell from zero.
                </p>
                <Equation>
                  {"score  =  log P(t₁) + log P(c₁ | t₁) + Σ over i ≥ 2 of [ log P(tᵢ | tᵢ₋₁) + log P(cᵢ | tᵢ) ]"}
                </Equation>
                <p>
                  Two properties of that sum decide everything that follows. It
                  has one term per character and one per step, so it is a sum along
                  a path, which is the shape the search of the next section needs.
                  And each term looks at one character and at most one step, so
                  nothing in it can read two characters at once, which is the
                  shape of the failure the eighteenth section measures.
                </p>
                <KeepInMind>
                  A whole reading of a text has one number attached to it, made of
                  small local pieces. Everything the method claims to know about
                  the text is in those pieces, and everything it cannot know is
                  what will not fit into a piece that size.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. The same recurrence as the lattice, one level down">
                <p>
                  There are two to the power of n minus one runs of letters over n
                  characters, so scoring them all is not a method. The word
                  lattice page derived the way round it, and the argument is
                  reused here rather than rebuilt. If the best run of letters over
                  a whole text passes through a particular place at a particular
                  character, then the part of it up to there is the best way of
                  reaching that place at that character. Otherwise a better head
                  could be swapped in, leaving the tail untouched and raising the
                  total, which contradicts the run having been best.
                </p>
                <Equation>
                  {"best(i, t)  =  log P(cᵢ | t)  +  max over places s that may precede t of [ best(i − 1, s) + log P(t | s) ]"}
                </Equation>
                <p>
                  So carry four numbers rather than one, since a tail depends on
                  which place the head finished in, and there are four places it
                  could have finished in. At every character work out, for each of
                  the four, the best way of arriving there and which place it came
                  from; at the end take the better of the two places a text may
                  finish in and walk the record backwards. The grid below is that
                  calculation with nothing hidden.
                </p>
                <TagTrellis
                  scenarioKeys={["research", "student", "two-sentence"]}
                />
                <p>
                  Read the first column. Only two of its four cells carry a
                  number, because a text cannot start in the middle or at the end
                  of a word, and the cells that carry no number carry no number for
                  a reason fixed in the fifth section rather than for want of
                  evidence. Every cell after that is a maximum over the two places
                  that could have led to it. The filled cells are the winners at
                  each character and the line joining them is the answer, which for
                  those six characters is B E B E B E and therefore three
                  two-character words.
                </p>
                <WhyThisWorks>
                  <p>
                    It is worth being exact about what is the same as the previous
                    page and what is not. There, the thing being chosen at each
                    position was a word from a list and the table had one entry per
                    position; here, the thing being chosen is a place out of four
                    and the table has four entries per character. Both are the
                    recurrence Bellman described and Viterbi published, and the
                    difference is only what the states are. The consequence of the
                    change is the whole page, since a state that is a word can only
                    ever be a word somebody listed and a state that is a place is
                    available at every character of every text.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  Four numbers per character settle a choice among two to the
                  power of n minus one runs, and the arithmetic never mentions a
                  run. The reason four suffice is that a place summarises
                  everything about the head of a reading that the tail is allowed
                  to care about.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. What it costs, which is the same for every text">
                <p>
                  Each character offers four places, each place is reached from at
                  most two, and the fifth section fixed those numbers before any
                  data arrived. So the work is eight comparisons per character
                  plus two to start, whatever the text says and whatever the
                  corpus was.
                </p>
                <Equation>{"comparisons  =  8 × (n − 1) + 2"}</Equation>
                <NumberTable
                  headings={[
                    "text",
                    "characters",
                    "runs of places over them",
                    "comparisons made",
                  ]}
                  rows={[
                    ["研究生命起源", "6", "32", "42"],
                    ["阿尔瓦雷斯研究生命起源", "11", "1,024", "82"],
                    ["our sentence, spaces removed", "45", "17,592,186,044,416", "354"],
                  ]}
                  caption="The count of runs is two to the power of one less than the length, which the fourth section checked against a brute-force enumeration; the comparisons follow from four places each reached from at most two. Neither figure depends on the corpus."
                />
                <p>
                  Set that beside the previous page, where the work was the length
                  of the text times the length of the longest entry, and grew when
                  a longer word joined the list. Here there is no list to grow.
                  What replaces the dictionary lookup entirely is a table of four
                  numbers per character, which is why nothing in this method needs
                  to be optimised and why the interesting costs are all in the
                  next Part, where they are paid in tagged text rather than in
                  time.
                </p>
                <KeepInMind>
                  The search is linear in the length of the text with a constant
                  of eight, fixed by the four places rather than by anything
                  learned. Two texts of the same length cost exactly the same, and
                  a longer corpus costs nothing at all at reading time.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. What the Places Buy and What They Cost",
          content: (
            <>
              <SubSection title="13. Reading a word the sentences never held">
                <p>
                  Back to the six characters of the first section, now with the
                  search visible. The three sentences the model was fitted on
                  contain three words and none of them appears in the text at all,
                  so a word list has nothing to match and every candidate on the
                  previous page&rsquo;s lattice is a single character.
                </p>
                <TagTrellis scenarioKeys={["novel", "name"]} />
                <p>
                  What decides is the character table. In those three sentences a,
                  c and e only ever produced under the place that begins a word,
                  and b, d and f only under the place that ends one, so at the
                  first character the cell for begins carries a much larger number
                  than the cell for alone, and at the second the cell for ends
                  carries a much larger number than the cell for begins. The run
                  that wins alternates, and reading it off gives three words that
                  were never in the corpus and are the right three.
                </p>
                <p>
                  The second text is the same trick failing, and it is our own
                  sentence, so it is worth dwelling on. The surname in front of the
                  research characters is five characters the corpus has never
                  seen. The word list answers eight pieces, five of them single
                  characters. The places answer seven, having glued the first two
                  characters of the name together into a two-character word, which
                  is one piece closer and still wrong, and the four-word reading a
                  person gives is out of reach for both. The nineteenth section is
                  about why that particular wrong answer, and it turns out to have
                  nothing to do with the name.
                </p>
                <KeepInMind>
                  The mechanism that finds an unseen word is that a character keeps
                  its habits when it moves into a word nobody has written down. It
                  works where the corpus has seen the characters and it does not
                  work where the corpus has seen nothing.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. How much tagged text the trade needs">
                <p>
                  Everything so far has been read off corpora of two to five
                  sentences, which is enough to see a mechanism and not enough to
                  say what it is worth. So here is a measurement. A language is
                  generated with a fixed seed, seventy words spelled out of forty
                  characters, with a few words carrying most of the text and a long
                  tail behind them, which is the shape a real vocabulary has. Both
                  methods are fitted on the first two sentences of one corpus, then
                  the first five, and so on, and both are scored on the same two
                  hundred held-out sentences, a word counting as found only when
                  both its ends land where the sentence put them.
                </p>
                <CorpusSizeCurve corpusKeys={["characters"]} />
                <p>
                  The curves cross between thirty and forty sentences, and they
                  cross the other way from the way I expected. Below the crossing
                  the places win, at thirty sentences by 0.8659 against 0.8501; at
                  and above it the word list wins, at forty by 0.9019 against
                  0.8792, and by a hundred and sixty sentences the list has seen
                  every word of a seventy-word language and scores exactly 1.0000
                  while the places have flattened out at 0.9178.
                </p>
                <p>
                  The split recall says why. Against words the training sentences
                  contained, the list is at 0.9983 and better at every size; against
                  words they did not, the list is at 0.0000 from ten sentences on and
                  the places are between 0.42 and 0.66. So the
                  crossing is not really about sentence counts at all. It sits
                  where the share of held-out words that are new falls below about
                  a tenth, and it is a crossing at all only because a language of
                  seventy words runs out of new words. A real vocabulary does not,
                  which is the honest caveat on this measurement and the reason the
                  method is used on real text at corpus sizes far past forty
                  sentences.
                </p>
                <KeepInMind>
                  Thirty tagged sentences is where the places stopped being ahead
                  on this language. The quantity that actually moved was the share
                  of unfamiliar words, and any language that keeps producing new
                  ones keeps the places ahead however much text is counted.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. It is the worse of the two on the words it was shown">
                <p>
                  There is a cost here and the split recall has already shown it.
                  This method does not memorise. A word list holds a word and
                  recovers it whenever it appears; a table of four places holds a
                  habit and can be talked out of it by the characters on either
                  side. Across every size measured, on both languages, the places
                  are worse than the list on exactly the words the corpus
                  contained.
                </p>
                <NumberTable
                  headings={[
                    "tagged sentences",
                    "places, on words it was shown",
                    "list, on words it was shown",
                    "places, on words it was not",
                    "list, on words it was not",
                  ]}
                  rows={[
                    ["10", "0.9075", "0.9970", "0.4843", "0.0000"],
                    ["30", "0.9117", "0.9983", "0.6560", "0.0000"],
                    ["80", "0.9277", "1.0000", "0.2632", "0.0000"],
                    ["320", "0.9327", "1.0000", "no new words left", "no new words left"],
                  ]}
                  caption="Recall on the same two hundred held-out sentences of the generated language, split by whether the word had appeared in the training sentences at all. The gap in the first pair of columns is what the method gives up; the gap in the second pair is what it buys."
                />
                <p>
                  Reading the last column of the first two rows together with the
                  first is the whole trade in one place. Under a tenth of the
                  familiar words are given up, in exchange for about half of the
                  unfamiliar ones being recovered where a list recovers none. Which
                  of those matters more is a question about the text being read
                  rather than about either method, and the seventeenth section is
                  about not having to choose.
                </p>
                <KeepInMind>
                  A method that generalises to words it has not seen is by the same
                  token a method that can be argued out of a word it has seen. The
                  two are one property looked at from either end and no setting
                  separates them.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. A writing system where a character says less">
                <p>
                  This method was invented for Chinese, and it is fair to ask what
                  is special about that. The answer is measurable and it is not
                  about the language. It is about how much a single character tells
                  you about where it sits. Take the same measurement on a generated
                  language built from the eight hundred and ten ordinary English
                  words of the first page of this section, with the spaces taken
                  out, and everything changes.
                </p>
                <CorpusSizeCurve corpusKeys={["letters"]} />
                <p>
                  Before you read a character, which of the four places it is in is
                  worth 1.5590 bits of uncertainty on the English words and 1.7518
                  on the character language. Reading the character removes 0.4869
                  of those bits on the English and 0.9207 on the characters, which
                  is roughly twice as much. That is the whole difference, and it
                  shows up as a ceiling. The places top out at 0.6087 on the
                  English words and then fall back to 0.5186 as the corpus grows,
                  because a wider vocabulary uses every letter in every position,
                  while on the character language they climb past 0.92.
                </p>
                <p>
                  Our own sentence is where this lands. Handed the sentence with
                  its spaces taken out, a model fitted on 1,280 English sentences
                  answers thirteen pieces where a reader answers seven, and it gets
                  Dr. and nothing else; the word list at the same size answers
                  twenty-four pieces and gets expect and the. Neither is usable, and
                  the reason the first one is unusable is the 0.4869 bits above
                  rather than anything about the sentence.
                </p>
                <InAModel>
                  <p>
                    So this is a method for writing systems with a large character
                    set, where each character appears in few words and therefore
                    keeps its habits, and it is a poor method for an alphabet. The
                    thing to carry away is that the deciding quantity can be
                    computed from a corpus before any segmenter is built, which
                    means the question of whether this approach suits a writing
                    system has an answer that does not require trying it.
                  </p>
                </InAModel>
                <KeepInMind>
                  Twice the bits, and the difference between a ceiling near 0.92
                  and one near 0.61. More tagged text raises the first and lowers
                  the second, so on an alphabet this method is not merely weaker;
                  it stops improving and then gets worse.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Running the two of them together">
                <p>
                  The two methods are wrong in different places, and the previous
                  page ended by pointing at the arrangement that follows from that.
                  Find the best path through the word list, look for the stretches
                  of consecutive single characters no entry covered, and hand each
                  of those stretches to the places. The list keeps its near-perfect
                  recall on familiar words and the places are asked only about the
                  characters the list gave up on.
                </p>
                <CorpusSizeCurve corpusKeys={["characters", "letters"]} />
                <p>
                  The green curve is that arrangement, and on both languages and at
                  every size measured it is at least as good as either method
                  alone. On the character language at thirty sentences it reaches
                  0.9262 where the better of the two singles reaches 0.8659; on the
                  English words at eighty sentences it reaches 0.7781 against
                  0.6065. This is what the segmenter most people use in Python
                  actually does, and it is the reason a page on this method belongs
                  after a page on the word lattice rather than instead of it.
                </p>
                <p>
                  On our own sentence it changes nothing, and it is worth saying
                  why rather than leaving the earlier widget to be noticed. The
                  five characters of the transliterated surname are exactly a
                  stretch no entry covers, so they are handed over, and the places
                  answer the same four pieces there that they answered on their
                  own. The combination cannot be better than its second half on the
                  stretch where the first half has nothing.
                </p>
                <KeepInMind>
                  Neither method dominates and the union of them dominates both,
                  because the stretches where a word list gives up are marked out
                  unmistakably by its own answer. That is a property of the word
                  lattice as much as of this method.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Where the Method Stops Being Defined",
          content: (
            <>
              <SubSection title="18. One character at a time, so two languages can leave the same counts">
                <p>
                  The score of the tenth section has one term per character and one
                  per step. No term anywhere reads two characters together, so a
                  boundary whose evidence is a pair of characters has nowhere in
                  the model to be recorded. That is not a shortage of data and more
                  text does not fix it, since the quantity is not in the model&rsquo;s
                  vocabulary.
                </p>
                <p>
                  Here is what that costs, arranged so it can be checked rather
                  than argued. Two languages over the same four characters, one
                  making its words by joining the first character to the second and
                  the other by crossing them over. Every count either language
                  leaves behind is the same count, so the two fits are the same
                  fit.
                </p>
                <TwinLanguages />
                <p>
                  Thirty-six numbers compared and thirty-six equal, so no quantity
                  of text in either language could separate them. And the
                  consequence is not abstract. A fit shown only the first language
                  reads four characters of the second into two words of the second,
                  words that its own language does not contain and never could,
                  with exactly the confidence it reads its own. The mechanism of the
                  thirteenth section, which recovers a genuine word nobody wrote
                  down, is the same mechanism inventing one that does not exist.
                </p>
                <KeepInMind>
                  A model whose terms read one character each is undetermined
                  between any two languages that agree character by character. The
                  repair is a model that scores pairs of characters directly, which
                  is a different model and is the next page in this section.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Characters it has never seen decide nothing at all">
                <p>
                  The eighth section put every unfamiliar character on the same
                  share as every other. Follow that through. If a stretch of a text
                  is made entirely of characters the corpus never contained, then
                  every one of them contributes the same number under every place,
                  those numbers cancel out of every comparison, and the score of a
                  run of letters over that stretch depends only on the steps. So
                  the method answers, and what it answers is a fact about the
                  corpus rather than about the stretch.
                </p>
                <p>
                  The widget above lists what that looks like for each length. A
                  run of five characters no corpus of those five Chinese sentences
                  ever held comes back as B E S S S, four pieces, and it comes back
                  as that for a transliterated surname, for five Latin capitals and
                  for five pictograms alike. That is the wrong answer the
                  thirteenth section left hanging, and it was never an answer about
                  the surname.
                </p>
                <p>
                  There is a genuine choice underneath this and it is worth naming,
                  since it is the sort of thing that is usually left to whoever
                  writes the code. The spare slot could be one share per place, as
                  it is here, or the four places could be given different shares
                  for unfamiliar characters, or a stretch of them could be refused
                  outright and left uncut for something else to look at. Taking
                  the first, as here, gives a confident answer that on the surname
                  is wrong; taking the second means estimating four numbers from
                  the one thing the corpus cannot show; taking the third gives no
                  answer and marks the stretch for whatever comes next. Nothing in
                  the mathematics prefers any of the three.
                </p>
                <KeepInMind>
                  On a stretch of entirely unfamiliar characters the character
                  table falls out of the comparison and only the steps remain, so
                  what comes back describes the corpus&rsquo;s habits about word
                  lengths. Five such characters come back as four pieces whatever
                  the five characters are, and nothing in the output distinguishes
                  that from a reading of the text.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. What has to be decided before any counting begins">
                <p>
                  Two decisions sit in front of every number on this page and
                  neither is settled by anything in the method. The first is that
                  somebody had to cut the training sentences into words. That is
                  the input, it is expensive, and it is an opinion, since whether
                  a Chinese compound is one word or two is unsettled in the
                  language itself, and the annotated corpora built for this problem disagree
                  with one another about the same strings. So a model fitted on one
                  of them is right by that corpus&rsquo;s standard and can be
                  measured wrong by another with nothing having gone amiss.
                </p>
                <p>
                  The second is the helping added to the counts, and the ninth
                  section makes that concrete rather than theoretical. On the same
                  four sentences and the same five characters the answer is the
                  majority reading at 1.0, at 0.5 and at 0.25, and the minority
                  reading at 0.23 and below, turning at 0.238. That is not a
                  rounding difference; it is two different words. There is no
                  quantity inside the method that prefers a value, and the effect
                  shrinks only as the counts grow, which on four sentences leaves
                  it deciding outright.
                </p>
                <WhyThisWorks>
                  <p>
                    It is worth separating the two, because they fail differently.
                    The annotation standard is a definitional question and no amount
                    of data settles it, since the data is what carries the
                    definition. The helping is an estimation question and more data
                    does settle it, in the sense that the counts eventually
                    outweigh whatever is added to them. On a corpus of four
                    sentences they are indistinguishable in their effect, which is
                    exactly why a small measurement cannot tell you which one you
                    are looking at.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  Both of these are choices made before the first count and
                  reported nowhere in the answer. A segmentation quoted without the
                  corpus it was learned from and the helping added to its counts is
                  a number missing two of its inputs.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. Where the method has nothing to say">
                <p>
                  Gathered in one place, these are the inputs and questions on
                  which the method stops being defined rather than becoming
                  approximate, with what has to be decided in each case and what
                  turns on the decision. The decisions are the ones worth a
                  reader&rsquo;s attention, since nothing in the method makes them
                  and each of them changes what comes back.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what the method says"
                  rows={[
                    {
                      expression: "a step that no cutting can contain",
                      reason:
                        "not an outcome, so it takes no count, no helping and no share. Eight of the sixteen pairs are in this position, fixed by what a word is rather than by what was counted, and letting one of them through would produce a run of letters no cut corresponds to.",
                    },
                    {
                      expression: "an outcome the corpus never showed",
                      reason:
                        "undefined as a ratio, since it is zero over a total that may itself be zero. Something has to be added, and how much is a free number, and on four sentences the same five characters read one way at 1.0 and the other at 0.1, turning at 0.238.",
                    },
                    {
                      expression: "a character the corpus never contained",
                      reason:
                        "has no count anywhere, so its share is whatever the spare slot is set to. Set alike for all four places, as here, an unfamiliar character cancels out of every comparison and decides nothing; five such characters come back as four pieces whatever they are.",
                    },
                    {
                      expression: "two languages that agree character by character",
                      reason:
                        "indistinguishable, and that is a fact about the model rather than about the corpus. Thirty-six numbers, thirty-six equal, so a fit taught one of them reads the other’s words with the same confidence as its own.",
                    },
                    {
                      expression: "a boundary whose evidence is a pair of characters",
                      reason:
                        "unrepresentable, since every term of the score reads one character. More text cannot help, because the quantity is not in the model’s vocabulary at all, and the repair is a different model.",
                    },
                    {
                      expression: "where the training sentences were cut",
                      reason:
                        "assumed answered, and answered by a person. Whether a compound is one word or two is unsettled in the language, so two annotated corpora disagree about the same string and a model is only ever right by the standard it was taught.",
                    },
                    {
                      expression: "a word the corpus did contain",
                      reason:
                        "not guaranteed to come back, unlike a word list, which holds it outright. Measured on two hundred held-out sentences, recall on familiar words is 0.9117 against a word list’s 0.9983, and no setting recovers the gap without giving up the unfamiliar words.",
                    },
                    {
                      expression: "a writing system with few characters",
                      reason:
                        "outside what the method can do, and the boundary is measurable in advance. A character removes 0.9207 of the 1.7518 bits of uncertainty about its place in one language and 0.4869 of 1.5590 in the other, and the second tops out at 0.6087 and then falls as more text is added.",
                    },
                    {
                      expression: "whether an answer is right",
                      reason:
                        "outside the method, as it was on both dictionary pages. Any accuracy figure is a figure about one annotated corpus, so the numbers on this page are reported against a generated language whose cutting is known by construction rather than against a standard that could be argued with.",
                    },
                  ]}
                />
                <KeepInMind>
                  Three of these are decisions rather than limits, namely how much
                  to add to the counts, what an unfamiliar character is worth to
                  each place, and whose cutting of the training text to learn. Each
                  has a defensible answer on more than one side and each changes
                  what comes back, so each belongs in whatever describes a
                  segmenter rather than being left to whoever writes one.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
