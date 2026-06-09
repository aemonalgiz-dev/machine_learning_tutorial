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
import { Word2vecCombinations } from "@/components/widgets/Word2vecCombinations";
import { Word2vecCountingTable } from "@/components/widgets/Word2vecCountingTable";
import { Word2vecLongerTraining } from "@/components/widgets/Word2vecLongerTraining";
import { Word2vecPairStep } from "@/components/widgets/Word2vecPairStep";
import { Word2vecPlayground } from "@/components/widgets/Word2vecPlayground";
import { Word2vecRareWord } from "@/components/widgets/Word2vecRareWord";
import { Word2vecSampler } from "@/components/widgets/Word2vecSampler";
import { Word2vecSeeds } from "@/components/widgets/Word2vecSeeds";
import { Word2vecTree } from "@/components/widgets/Word2vecTree";
import { Word2vecTwoTables } from "@/components/widgets/Word2vecTwoTables";
import { Word2vecWindowPairs } from "@/components/widgets/Word2vecWindowPairs";

export const metadata: Metadata = {
  title: "Word2vec · oop_ml",
  description:
    "Train a model to predict a word from its neighbours, or its neighbours from the word, then throw the model away and keep the weights it needed.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function Word2vecPage() {
  return (
    <ConceptPage
      title="Word2vec"
      tagline="Word2vec trains a model to predict a neighbour, then keeps the weights the prediction needed and throws the predictor away."
      prerequisites={
        <>
          Every score on this page is a dot product turned into a probability by
          the{" "}
          <Link href="/concepts/logistic-regression" className={link}>
            logistic function
          </Link>
          , and every step is one step of{" "}
          <Link href="/concepts/gradient-descent-regression" className={link}>
            gradient descent
          </Link>
          , so both of those are used here without being explained again. Words
          are compared by the{" "}
          <Link href="/concepts/distance-metrics" className={link}>
            cosine
          </Link>{" "}
          between their vectors throughout, which is an angle rather than a
          distance, and it is worth being comfortable with that difference
          before the first fit.
        </>
      }
      history={
        <>
          <p>
            The idea that a word can be described by the company it keeps is
            older than any way of computing it. Zellig Harris argued in 1954, in
            &ldquo;Distributional structure&rdquo;, that the distribution of
            environments a word occurs in is what a linguist can actually
            observe about its meaning, and J. R. Firth put the same thought in a
            sentence in 1957 that has been quoted ever since. Turning that into
            arithmetic gives a table with a row for every word and a column for
            every word it might occur near, and by the 1990s that table was
            being built and squeezed down, which is what latent semantic
            analysis does. The difficulty was that the table is as wide as the
            vocabulary, most of it is zero, and it has to be built before
            anything can be squeezed.
          </p>
          <p>
            Yoshua Bengio and colleagues showed in 2003, in &ldquo;A neural
            probabilistic language model&rdquo;, that a network could learn a
            short vector per word as a side effect of predicting the next word,
            which removed the table but replaced it with a cost of its own,
            since predicting one word out of the whole vocabulary means scoring
            every candidate for every position. Frederic Morin and Bengio
            answered part of that in 2005 by arranging the vocabulary as a
            binary tree, so reaching a word is a sequence of yes-or-no choices
            and the cost falls from the size of the vocabulary to the logarithm
            of it. The tree they used to make that cheap was David
            Huffman&rsquo;s code of 1952, which gives frequent words short paths
            and was invented for a quite different purpose.
          </p>
          <p>
            Tomáš Mikolov had been building recurrent language models at Brno
            University of Technology, and at Google in Mountain View in 2013 he
            and Kai Chen, Greg Corrado and Jeffrey Dean published
            &ldquo;Efficient estimation of word representations in vector
            space&rdquo;, which threw away almost everything in the network
            except the word vectors themselves and gave two ways round the
            window, so that the centre word is predicted from the words around it,
            or the words around it from the centre. A second paper that year with Ilya
            Sutskever added negative sampling, which replaces the choice among
            all words with a handful of yes-or-no questions, and the released C
            program gave the method the name it now has. The analogy result that
            made it famous, that the direction from one word to another can be
            added to a third, was reported by Mikolov, Wen-tau Yih and Geoffrey
            Zweig in the same year. Omer Levy and Yoav Goldberg showed in 2014
            that the first of the two objectives is, underneath, factorising a
            table of exactly the kind the method appeared to have escaped.
          </p>
          <p>
            This page asks six questions in order. What does counting a
            word&rsquo;s neighbours actually give you, and what does it cost?
            What is the change of question that word2vec makes? Which side
            predicts which, and what does swapping the direction change? Why is
            scoring every candidate word unaffordable, and what are the two ways
            round it? What do the four combinations of those choices produce on
            one corpus? And where does the method stop being defined?
          </p>
        </>
      }
      playground={<Word2vecPlayground />}
      sections={[
        {
          title: "Part 1. Counting a Word’s Neighbours",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. Two lists of words that never meet">
                <p>
                  Everything on this page is fitted to one small corpus, and it
                  is worth knowing exactly what is in it before any method
                  touches it. Two hundred sentences of five to eight words each,
                  and every sentence is drawn from one of two word lists and
                  never from both. One list holds twenty forms of five verbs,
                  play, stay, say, walk and talk, in their various endings; the
                  other holds eleven words about money, stock, bond, market,
                  price and so on. That comes to 1,311 word occurrences across
                  31 distinct words, and no word appears in both lists.
                </p>
                <p>
                  The sentences themselves are nonsense, which is the point.
                  Nothing in them is grammatical and nothing means anything, so
                  there is no hidden knowledge of English for a method to
                  exploit, and the only structure available is which words turn
                  up beside which. If a method recovers the two lists it did so
                  from company alone, and if it does not, we can say so with a
                  number rather than an impression.
                </p>
                <KeepInMind>
                  The one thing that is true of this corpus and hidden from every
                  method on this page is that it has two groups. Nobody tells a
                  fit which list a word came from, so the two mean cosines the
                  page keeps reporting, how alike two words of one list are and
                  how alike a word of each are, are the whole score.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. The table counting gives you">
                <p>
                  The oldest way to use that structure is to count it. Walk
                  along every sentence, and for each word write down which words
                  turned up within three positions of it, with a neighbour two
                  away counting a half and one three away a third, since a word
                  next door tells you more than a word at the far end. What
                  comes out is a square table with a row and a column for each
                  of the 31 words, and the row for a word is that word&rsquo;s
                  description.
                </p>
                <Equation>{"row(w)[v] = how often v occurred within reach of w, discounted by how far"}</Equation>
                <Word2vecCountingTable />
                <p>
                  Two things about that table matter for the rest of the page.
                  The first is that it works. Comparing two whole rows by the
                  cosine between them gives 0.8558 on average for two words of
                  the same list and exactly 0.0000 for a word of each, because
                  two words from different lists have no neighbour in common at
                  all and their rows are perpendicular. The second is its shape.
                  It has 961 cells, 440 of which are zero, which is 45.8% of the
                  table holding no information at all, and the blank quarters
                  are exactly the two lists never meeting.
                </p>
                <KeepInMind>
                  Counting works, and on a corpus this size it works very well.
                  What follows is not a repair of a broken method; it is a
                  reaction to what that table costs once the corpus is not thirty
                  one words.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. What a fixed width would have to buy">
                <p>
                  The trouble with describing a word by a row of the counting
                  table is that the row is as wide as the vocabulary. Thirty one
                  words give a row of 31 numbers, and the whole table is 961; a
                  vocabulary of forty thousand words, which is a modest one, gives
                  a row of forty thousand and a table of 1.6 billion. The table
                  grows as the square of the vocabulary while the number of
                  distinct pairs that actually occur grows nothing like as fast,
                  so the zeros take over.
                </p>
                <p>
                  The alternative is to fix the width in advance. Give every word
                  twelve numbers whatever the vocabulary holds, and the whole
                  description of this corpus is 372 numbers rather than 961, and
                  the description of a forty-thousand-word vocabulary is 480,000
                  rather than 1.6 billion. That is only worth having if twelve
                  numbers can carry what thirty one counts carried, and nothing
                  suggests the counts themselves could be read back out of
                  twelve numbers. What has to survive the squeezing is the
                  comparisons rather than the counts, so that words of one list
                  still come out near each other and words of different lists
                  still do not.
                </p>
                <NumberTable
                  headings={["vocabulary", "cells in the counting table", "numbers at a fixed width of 12"]}
                  rows={[
                    ["31", "961", "372"],
                    ["1,000", "1,000,000", "12,000"],
                    ["40,000", "1,600,000,000", "480,000"],
                  ]}
                  caption="The first row is measured on the corpus this page uses; the other two are the same two formulas, the square of the vocabulary against twelve times it."
                />
                <KeepInMind>
                  A fixed width is a promise that the interesting content of a
                  row survives being squeezed into a dozen numbers. Nothing so
                  far says it does. The rest of the page is one way of finding
                  those numbers and a measurement of whether the promise was
                  kept.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 2. Predicting a Neighbour Instead",
          content: (
            <>
              <SubSection title="4. The change of question">
                <p>
                  Word2vec does not squeeze the counting table. It asks a
                  different question altogether, and the answer to that question
                  is thrown away. The question is a prediction task that nobody
                  wants the answer to. Given a word from the corpus, how likely
                  is each other word to have appeared beside it? Set that up as a
                  model with a vector per word, train it until it predicts
                  neighbours reasonably well, then delete the prediction
                  machinery and keep the vectors it needed in order to do the
                  predicting.
                </p>
                <p>
                  The bet is that a model cannot predict which words appear
                  beside walked without having discovered, somewhere in its
                  weights, that walked keeps the same company as walking and
                  none of the company of market. It never gets told there are two
                  lists; it gets told, 19,519 separate times over five passes of
                  this corpus, which word turned up beside which, and the only
                  cheap way to be right about that is to give words with the same
                  neighbours the same vector.
                </p>
                <WhyThisWorks title="Why an impossible task is the right one to set">
                  <p>
                    Predicting neighbours is easy to score and impossible to be
                    right about. Nothing in the corpus determines which of the
                    twenty verb forms follows walked, so the best any model can
                    do is spread its confidence across the twenty, and the way to
                    do that with twelve numbers per word is to put those twenty
                    words in one place. The prediction task is hopeless in a way
                    that is useful, since its irreducible uncertainty is precisely the
                    structure we were after.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  The vectors are a by-product, which is why Part 7 has to come back
                  to how they are judged. Nothing computed during the fit says
                  whether they are any good, because the quantity the fit lowers
                  is about predicting neighbours and nothing else.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. Sliding a window over the corpus">
                <p>
                  The corpus becomes training data by sliding a window along
                  every sentence. At each position one word is the centre and the
                  words within reach on either side are its context, and that
                  pairing is one piece of training. Nothing more elaborate than
                  that happens; there is no parse, no grammar, and no notion of
                  which side a neighbour was on.
                </p>
                <p>
                  The widget below runs that on three short sentences, small
                  enough to check by hand. The corpus is walk walked talks, bond
                  market price, and walked talks walk, which is nine word
                  occurrences over six distinct words, and it is here for the
                  mechanics rather than for any vectors, since nine occurrences
                  teach nothing.
                </p>
                <Word2vecWindowPairs />
                <p>
                  At a reach of one those three sentences give twelve pieces of
                  training one way round and nine the other, and the difference
                  is the whole of Part 3. Widening the reach to two takes the
                  first count to eighteen and leaves the second at nine.
                </p>
                <InAModel title="On the two-list corpus">
                  <p>
                    At a reach of three the same rule gives 3,968 pairs in the
                    first pass, and the reach is redrawn at random between one
                    and three at every position rather than held fixed, which
                    means a word right next door falls inside the window three
                    times as often as a word three away. That is a distance
                    weighting achieved by a coin toss instead of a formula, and
                    it is why the pair count differs slightly from one pass to the
                    next, 3,968 in the first, then 3,865, then 3,901.
                  </p>
                </InAModel>
                <KeepInMind>
                  A window is the whole of what word2vec means by context. Word
                  order inside the window is discarded, sentence boundaries stop
                  the window, and a word that was dropped for being too rare is
                  removed before the windows are formed, so its neighbours become
                  each other&rsquo;s neighbours.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Scoring a pair with a dot product">
                <p>
                  Every word gets two vectors, not one. It has a vector for when
                  it is the word being read, and a row for when it is the word
                  being predicted, and a pair is scored by multiplying the two
                  together coordinate by coordinate and adding up. That number is
                  large and positive when the two vectors point the same way,
                  large and negative when they point opposite ways, and the
                  logistic function turns it into a probability between zero and
                  one.
                </p>
                <Equation>{"score = u · h        probability = 1 / (1 + exp(−score))"}</Equation>
                <p>
                  The training says the probability should be near one when the
                  pair really did occur and near zero when it did not, which is
                  ordinary logistic regression with the vectors playing both the
                  weights and the input. The cost of one such judgement is the
                  usual logarithm, and the step it asks for pushes the two
                  vectors towards each other when they should agree and apart
                  when they should not.
                </p>
                <Equation>{"cost = −log(probability) when the pair occurred,  −log(1 − probability) when it did not"}</Equation>
                <Word2vecPairStep />
                <WorkedExample title="One pair, three rows, by hand">
                  <p>
                    Put the word&rsquo;s vector at half a unit along the first
                    coordinate, the true neighbour&rsquo;s row at one unit along
                    the same coordinate, and two drawn words at one unit
                    backwards and one unit sideways. The three scores are 0.5,
                    −0.5 and 0, so the three probabilities are 0.622459, 0.377541
                    and 0.5. The true pair is asked to be one and costs
                    −log(0.622459) = 0.474077; the backwards row is asked to be
                    zero and, having said 0.377541, costs the same 0.474077; the
                    sideways row scored exactly nothing, so it says a half and
                    costs log 2, which is 0.693147. The three add to 1.641301,
                    and the step the word&rsquo;s own vector is asked to take is
                    (0.755081, −0.5) before the step size shrinks it.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  Two vectors per word is not an accident of the arrangement. A
                  word predicting itself as its own neighbour would score its
                  vector against itself, which is always large and positive, and
                  a single table would make that unavoidable.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. Throwing the model away">
                <p>
                  When the passes are over there are two tables of exactly the
                  same size, 372 numbers each on this corpus. One holds a vector
                  per word for when the word is read; the other holds a row per
                  word for when the word is being predicted. The answer is the
                  first table, and the second is deleted.
                </p>
                <Word2vecTwoTables />
                <p>
                  The right-hand column is the model doing the job it was
                  actually trained for, and it does it. Asked which words belong
                  beside walked, the discarded table names says, player, stays,
                  stayed and walked itself, all of them verb forms, at
                  probabilities between 0.28 and 0.31, while every word about
                  money comes back far lower. Averaged over the whole
                  vocabulary its readiness to say a verb form appeared beside
                  walked is 0.2672 and its readiness to say a word about money
                  did is 0.0061, which is a working, if not very confident,
                  predictor of neighbours. Half of everything the fit learned
                  goes into it, and none of it is kept.
                </p>
                <KeepInMind>
                  Some later methods keep both tables and add or join them, and
                  word2vec keeps only the first, so what is thrown away is
                  something the corpus really did teach. There is no argument
                  from the mathematics that the kept table is the right one to
                  keep; it is a choice the method makes and reports.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Which Side Predicts Which",
          content: (
            <>
              <SubSection title="8. The centre predicting each neighbour">
                <p>
                  The first arrangement is skip-gram. Read the centre
                  word&rsquo;s vector, and use it to predict each of its context
                  words in turn, one piece of training per neighbour. At a
                  position with three words in its window the centre word&rsquo;s
                  vector is read three times, corrected three times, and each of
                  the three neighbours has its row corrected once.
                </p>
                <Equation>{"score for neighbour v of the centre w   =   u(v) · h(w)"}</Equation>
                <p>
                  The consequence worth carrying is arithmetical rather than
                  linguistic. Every occurrence of a word produces as many pieces
                  of training as it has neighbours, so a word that appears rarely
                  still generates several corrections each time it appears, which is
                  why skip-gram is the usual choice where the corpus is small
                  and why it is the slower of the two arrangements.
                </p>
              </SubSection>

              <SubSection title="9. The neighbours predicting the centre">
                <p>
                  The second arrangement runs the same window the other way.
                  Average the vectors of all the context words into one vector,
                  and use that average to predict the centre word. One piece of
                  training per position, whatever the reach, and the correction
                  the average receives is shared out equally among the words that
                  went into it.
                </p>
                <Equation>{"h = the mean of the context vectors        score = u(centre) · h"}</Equation>
                <p>
                  The averaging is where the name comes from, since a mean
                  discards the order of what went into it, and it is also where
                  the behaviour differs. A rare word in the context contributes
                  one summand out of several and receives a share of one
                  correction, which is a much weaker signal than the same word
                  would get as a centre under skip-gram.
                </p>
              </SubSection>

              <SubSection title="10. What swapping the direction changes">
                <p>
                  On this corpus the difference shows up first in the pair count.
                  Skip-gram produces 3,968 pieces of training in a pass and the
                  bag of words 1,311, exactly one per word occurrence, so the
                  bag of words is doing about a third as much work. What it buys
                  with the saving is worse separation at every setting the page
                  tried.
                </p>
                <Word2vecCombinations word="walked" />
                <p>
                  Read the four bars at the doubled first step. Skip-gram with
                  drawn wrong answers separates the lists by 0.8266 and the bag
                  of words by 0.2813, which is the same ordering the counts
                  predict, since the bag of words saw a third of the training. At
                  the published first step, which the next Part comes to, the
                  same pair reads 0.7033 and 0.0034, and that second number is a
                  fit that did not separate anything.
                </p>
                <KeepInMind>
                  The choice of direction is a choice about how much training a
                  given corpus produces, and it matters most when the corpus is
                  small. On a corpus of billions of words the bag of words being
                  three times cheaper is the argument that wins, which is the
                  opposite of what happens here.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Making the Arithmetic Affordable",
          content: (
            <>
              <SubSection title="11. Why scoring every word is out of the question">
                <p>
                  So far a pair has been scored against one row. Asking properly
                  how likely each word is to be the neighbour means scoring the
                  centre word against every row in the table and normalising, so
                  the probabilities add to one across the vocabulary. That is the
                  softmax, it is the honest version of the question, and its
                  gradient touches every row in the table for every pair.
                </p>
                <Equation>{"P(v | w) = exp(u(v) · h(w)) / Σ over every word v′ of exp(u(v′) · h(w))"}</Equation>
                <p>
                  On this corpus that means 31 rows per pair and 19,519 pairs
                  across five passes, which is 605,089 row updates and no trouble
                  at all. On a forty-thousand-word vocabulary the same five
                  passes over a billion words means forty thousand rows touched at
                  every one of five billion word positions, and the sum in the
                  denominator has to be recomputed for each of them. The method is not slightly
                  expensive at that size; it is the only thing the computer would
                  ever do.
                </p>
                <KeepInMind>
                  Everything in the rest of this Part is an answer to that one
                  denominator, and the two answers are answers of different
                  kinds. The first replaces the question with an easier one and
                  gives up the distribution; the second keeps the question and
                  changes the route to the answer, and gives up nothing.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. A handful of wrong answers instead">
                <p>
                  The first answer replaces the question &ldquo;which of the
                  thirty one words is the neighbour&rdquo; with a much easier
                  one. Take the word that really did appear, and take five words
                  drawn at random, and ask of each of the six separately whether
                  it is a real neighbour or a random word. That is six
                  independent yes-or-no judgements, six rows touched, and the
                  number six does not grow when the vocabulary does.
                </p>
                <Equation>{"cost = −log σ(u(v) · h)  −  Σ over the k drawn words of log(1 − σ(u(v′) · h))"}</Equation>
                <p>
                  This is called negative sampling, and the drawn words are the
                  negatives. What the model learns is no longer a distribution
                  over the vocabulary, since the six probabilities do not add to
                  anything in particular, and it does not need to be. What it
                  needs is for the true neighbour&rsquo;s row to be pulled
                  towards the word and the random rows pushed away, repeated
                  often enough that the pulls from words with shared company
                  accumulate in one place.
                </p>
                <WhyThisWorks title="Why contrasting against noise is enough">
                  <p>
                    A model that only ever saw true pairs could satisfy every one
                    of them by making all vectors identical and very long, since
                    then every score is large and every probability near one. The
                    drawn words are what stops that, because the same trick would
                    make their probabilities near one too and they are asked for
                    zero. The pull and the push together force a geometry in
                    which some words are near a given word and others are not,
                    and there is no cheaper way to satisfy both than to put words
                    with the same neighbours in the same place.
                  </p>
                </WhyThisWorks>
              </SubSection>

              <SubSection title="13. Where the wrong answers come from">
                <p>
                  How the negatives are drawn turns out to matter. Draw them in
                  proportion to how often each word appears and nearly every
                  negative is one of the commonest words, so the model spends its
                  effort learning to say no to those. Draw them uniformly and a
                  word seen seventeen times is offered as a wrong answer as often
                  as one seen seventy three, which tells the model little about
                  the words it actually meets.
                </p>
                <p>
                  Word2vec raises each count to the power three quarters before
                  normalising, which sits between the two. The exponent has no
                  derivation behind it; the paper reports it as the value that
                  worked, and it has stayed.
                </p>
                <Equation>{"share of the draw for word w  ∝  count(w) ^ 0.75"}</Equation>
                <Word2vecSampler />
                <WorkedExample title="Three words, counts of a thousand, ten and one">
                  <p>
                    In proportion to frequency the three shares are 0.989120,
                    0.009891 and 0.000989, so the rarest word is drawn about once
                    in a thousand draws. At the three-quarters power they become
                    0.964091, 0.030487 and 0.005421, so the rarest word is drawn
                    five and a half times as often as before and the commonest
                    gives up two and a half points of share. On the two-list
                    corpus the counts are much flatter, running from 73 down to
                    17, so the effect is correspondingly smaller, and the odds
                    between the commonest and rarest word fall from 4.2941 to
                    2.9830.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  The exponent does more where the counts are more spread out.
                  This corpus was built by drawing words uniformly from two
                  lists, so its counts are nearly flat and the flattening has
                  little to flatten; on real text, where the commonest word
                  outnumbers the thousandth by several orders, it is the
                  difference between a useful draw and a useless one.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. A path down a tree instead of a sweep">
                <p>
                  The second answer keeps the honest question and changes how the
                  answer is reached. Arrange the words as the leaves of a binary
                  tree, and reaching a word becomes a sequence of left-or-right
                  choices, one at each branch point on the way down. Give every
                  branch point its own row, ask it the same yes-or-no question
                  the pairs were asked before, and the probability of a word is
                  the product of the probabilities along its path.
                </p>
                <Equation>{"P(v | w) = Π over the branch points on v’s path of σ(±  u(node) · h(w))"}</Equation>
                <p>
                  The probabilities of all the words still add to one, because
                  the probabilities at every branch point add to one and the
                  paths partition the leaves, so nothing has been approximated.
                  What has changed is that the number of rows touched is the
                  length of one path rather than the size of the vocabulary. Any
                  binary tree works; the shape decides the cost, and word2vec
                  uses Huffman&rsquo;s arrangement, which gives frequent words
                  the short paths and is the arrangement with the smallest
                  average path length there is.
                </p>
                <Word2vecTree />
                <WorkedExample title="The six-word corpus, arranged">
                  <p>
                    Walk, walked and talks appear twice each and bond, market and
                    price once each. The tree puts walk and walked two steps from
                    the root and the other four three steps down, so the average
                    number of choices per word occurrence is 2.5556 against the
                    six rows a sweep would touch. Five branch points serve six
                    words, which is the general rule, since a tree over n words has
                    n − 1 branch points, so the table of rows is one row shorter
                    than the table a sweep would need.
                  </p>
                </WorkedExample>
              </SubSection>

              <SubSection title="15. What the tree saves, honestly">
                <p>
                  On the corpus this page uses, the tree saves almost nothing,
                  and it is worth saying so plainly rather than quoting the
                  logarithm and moving on. Thirty one words give an average path
                  of 4.9008 branch points against a sweep of 31, so the saving is
                  a factor of about six, and against the six rows negative
                  sampling touches it is a saving of about one row.
                </p>
                <p>
                  The second disappointment is that Huffman&rsquo;s arrangement
                  is barely earning its keep here either. Its average path is
                  4.9008 where a tree that ignored the counts entirely and split
                  evenly would cost 4.9542, a difference of five hundredths of a
                  branch point, because the counts on this corpus run from 73
                  down to 17 and there is no long tail of rare words to give long
                  paths to. Give the same construction counts that fall as one
                  over the rank, which is roughly how word counts really fall,
                  and at forty thousand words the average path is 10.7469 against
                  the balanced tree&rsquo;s 15.2877.
                </p>
                <NumberTable
                  headings={["vocabulary", "rows a sweep touches", "a path, flat counts", "a path, realistic counts", "drawn wrong answers"]}
                  rows={[
                    ["31", "31", "4.97", "4.14", "6"],
                    ["1,000", "1,000", "9.98", "7.52", "6"],
                    ["40,000", "40,000", "15.36", "10.75", "6"],
                  ]}
                  caption="Rows touched per training pair. Every figure is computed from the arrangement itself; the counts in the realistic column fall as one over the word’s rank."
                />
                <KeepInMind>
                  Negative sampling touches six rows at every vocabulary size while
                  the tree touches a number that grows, so which is cheaper
                  depends on the size. At thirty one words a path costs 4.14
                  against six; at a thousand it costs 7.52 against the same six,
                  and the ordering has reversed. What the tree has that the
                  drawn answers do not is that it is still computing the real
                  distribution, and the next Part shows it producing a visibly
                  different geometry because of that.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Running a Fit",
          content: (
            <>
              <SubSection title="16. The objective falling, pass by pass">
                <p>
                  A fit is a number of passes over the corpus, and after each one
                  the mean cost of a training pair is recorded. That number is
                  the only thing the fit itself knows about how it is doing, and
                  it is a strange quantity, since under negative sampling it
                  depends on which words happened to be drawn as negatives and is
                  therefore not comparable between two runs that drew
                  differently.
                </p>
                <InAModel title="Five passes, skip-gram, drawn wrong answers">
                  <p>
                    The mean cost per pair goes 3.1279, 2.1612, 2.0865, 2.0813
                    and 2.0872 across the five passes, so almost all of the fall
                    happens in the first pass and the last pass is very slightly
                    worse than the one before it. That rise is real and is not a
                    bug, since the walk is stochastic, the negatives are redrawn every
                    time, and a mean over 3,892 pairs of a quantity that depends
                    on the draw moves about a little.
                  </p>
                </InAModel>
                <p>
                  The playground at the top of the page draws that curve for
                  whatever settings are chosen, and the useful habit is to watch
                  the shape rather than the value. A curve that does not fall is
                  a step size too large; a curve that falls and flattens
                  immediately, as this one does, usually means the corpus is
                  small enough that the model has learned everything available in
                  a pass or two.
                </p>
                <KeepInMind>
                  The recorded cost is what the optimiser is lowering and not what
                  anyone wants. Nothing on this page reports it as a measure of
                  quality, and Part 7 shows a case where it falls while the
                  vectors get worse.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. A published default that fails here">
                <p>
                  The step size starts at a stated value and falls linearly
                  towards a floor across every position of every pass, so the
                  first corrections are large and the last are tiny. The value the
                  original program ships with is 0.025, and on this corpus one of
                  the four arrangements does not work at that value.
                </p>
                <p>
                  Fitted at 0.025 with the bag of words and drawn wrong answers,
                  five passes leave the two lists at 0.9907 within a list and
                  0.9873 across the two, a difference of 0.0034. Every vector
                  points very nearly the same way as every other, which is the
                  state a fit starts in and has barely left, and the nearest words
                  to market come back as trade, stock, cash, bond and stays, with
                  a verb form fifth. Doubling the step size to 0.05 takes the same
                  arrangement to 0.9929 and 0.7116, a difference of 0.2813, and
                  the verb form is gone from the list.
                </p>
                <NumberTable
                  headings={["arrangement", "at 0.025, apart by", "at 0.05, apart by"]}
                  rows={[
                    ["skip-gram, drawn wrong answers", "0.7033", "0.8266"],
                    ["skip-gram, a tree", "1.8525", "1.5348"],
                    ["bag of words, drawn wrong answers", "0.0034", "0.2813"],
                    ["bag of words, a tree", "1.7818", "1.9445"],
                  ]}
                  caption="The mean cosine within a list minus the mean cosine across the two, after five passes at a width of twelve and a reach of three."
                />
                <p>
                  This is worth dwelling on because it is a published default
                  producing a result that looks like a working fit. Nothing
                  raises, the cost curve falls from 4.1568 to 2.8830, and the
                  nearest-word list for a verb form is full of verb forms. It is
                  only the second number, how alike two words from different
                  lists came out, that says the fit answered the same thing for
                  everything. The default is not wrong; it was chosen for
                  corpora of billions of words, where five passes is tens of
                  billions of corrections and a small first step is plenty.
                </p>
                <KeepInMind>
                  The value a program ships with was chosen against the data its
                  author had, and this corpus is four orders of magnitude smaller
                  than that. Reading only the within-list number, 0.9907, would
                  have passed this fit, which is why a second number that ought
                  to come out small is worth computing every time.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. The four combinations, side by side">
                <p>
                  Two directions and two ways round the softmax make four
                  arrangements, and they are genuinely four methods rather than
                  four settings. Compare them on the same corpus at the same
                  width, reach, passes and start, and the first thing to notice
                  is that the numbers are not on a common scale.
                </p>
                <p>
                  The two tree fits report negative cosines across the lists,
                  −0.5570 and −0.9618, where the two negative sampling fits report
                  positive ones, 0.1696 and 0.7116. That is not the tree
                  separating the lists four times better; it is a different
                  geometry. Every branch point is trained to say one thing for the
                  words that go left of it and the opposite for the words that
                  go right, so words on different sides of the root are pushed
                  to opposite ends of one direction; drawn wrong answers only
                  ever push a pair towards being unrelated, which is an angle
                  near ninety degrees rather than near a hundred and eighty.
                </p>
                <Word2vecCombinations word="walked" />
                <p>
                  What can be compared is whether the lists came apart, and at
                  the doubled step all four separate them. What can also be
                  compared is the nearest-word lists, and there the four agree on
                  the answer to the question anybody would ask and disagree on
                  everything else. Asked for the five words nearest walked, all
                  four return five verb forms and no word about money; between
                  them they name ten different words, and only one word, talking,
                  appears in all four lists.
                </p>
                <KeepInMind>
                  Two fits that agree completely about which words are alike can
                  disagree about almost every ranking inside that agreement, and
                  here they do, sharing one word of five. What a nearest-word
                  list supports is that the words in it are alike; which of them
                  came first is one of several orderings the corpus permits
                  equally.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. What a seed fixes">
                <p>
                  Four things in the fit are random, namely where every vector starts,
                  how far the window reaches at each position, which words are
                  drawn as negatives, and which occurrences of frequent words
                  are thinned out. One seed fixes all four, so two fits from the same
                  seed are identical to the last bit, and two fits from different
                  seeds are two different answers.
                </p>
                <Word2vecSeeds />
                <p>
                  The twelve coordinates of walked from the two starts have
                  nothing in common. Across the whole table the mean gap
                  coordinate by coordinate is 0.7816 and the largest single gap
                  is 2.5336, which is larger than most of the coordinates
                  themselves. Yet the cosine between any two words comes out
                  almost the same in both, with the two runs&rsquo; lists of
                  pairwise similarities correlating at 0.9996 and differing by
                  0.0073 on average.
                </p>
                <KeepInMind>
                  A seed makes a fit repeatable without making its answer the one
                  the corpus implied. What the corpus determines is the geometry,
                  which the two runs agree on to 0.9996; the coordinates are
                  whatever fell out of where the vectors happened to start, so
                  comparing one run&rsquo;s numbers against another&rsquo;s is
                  comparing two arbitrary choices.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. The Cost, and Where Counting Still Wins",
          content: (
            <>
              <SubSection title="20. What a fit costs, in numbers">
                <p>
                  The training cost is the number of pieces of training times the
                  number of rows each touches. Five passes of skip-gram over this
                  corpus is 19,519 pairs, each touching one word vector and six
                  rows under drawn wrong answers, so 136,633 row corrections. The
                  bag of words makes 1,311 pairs a pass, so 6,555 across five,
                  though each of those corrects every word in its window rather
                  than one.
                </p>
                <p>
                  The storage cost is two tables of one row per word, which is
                  744 numbers here, of which 372 are kept. That is the number to
                  compare against the counting table&rsquo;s 961 cells, and on
                  this corpus the saving is modest, since twelve is not much
                  smaller than thirty one. The comparison is worth making anyway,
                  because both numbers are exact and both scale in known ways, one
                  as the square of the vocabulary and the other as twelve times
                  it.
                </p>
                <NumberTable
                  headings={["what", "measured on this corpus"]}
                  rows={[
                    ["word occurrences", "1,311"],
                    ["distinct words", "31"],
                    ["training pairs, five passes of skip-gram", "19,519"],
                    ["training pairs, five passes of the bag of words", "6,555"],
                    ["rows touched per pair, drawn wrong answers", "6"],
                    ["rows touched per pair, a tree", "4.9008 on average"],
                    ["numbers kept", "372"],
                    ["numbers discarded", "372"],
                    ["cells in the counting table", "961"],
                  ]}
                />
                <KeepInMind>
                  Every one of those figures grows with the corpus except the width,
                  which is chosen before any text is read. That is what is
                  being traded, a training cost that grows with how much text
                  there is, against a description of each word whose size was
                  settled in advance.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. Where counting still wins">
                <p>
                  On this corpus, plain counting beats word2vec, and hiding that
                  would misrepresent what the method is for. Two rows of the
                  counting table compared directly give 0.8558 within a list and
                  exactly 0.0000 across the two, which is a perfect separation
                  reached in one pass with nothing to tune, no random start and no
                  seed. The best of the four word2vec arrangements at the doubled
                  step gives 0.9962 and 0.1696, which separates the lists and
                  does not separate them cleanly.
                </p>
                <p>
                  The zero is not luck. Two words from different lists never share
                  a sentence, so they share no neighbour, so their count rows have
                  no coordinate nonzero in both and the cosine between them is
                  exactly zero by construction. Word2vec cannot reach that,
                  because its vectors are twelve numbers rather than thirty one
                  and it is not trying to reproduce the rows at all.
                </p>
                <NumberTable
                  headings={["method", "same list", "across lists", "numbers per word"]}
                  rows={[
                    ["comparing rows of counts", "0.8558", "0.0000", "31"],
                    ["skip-gram, drawn wrong answers", "0.9962", "0.1696", "12"],
                    ["bag of words, drawn wrong answers", "0.9929", "0.7116", "12"],
                  ]}
                  caption="Mean cosine within a list and across the two, after five passes at a first step of 0.05. Counting takes one pass and has nothing to choose."
                />
                <KeepInMind>
                  A method whose whole argument is about what happens at forty
                  thousand words and a billion occurrences should be expected to
                  lose at thirty one words and thirteen hundred, and it does.
                  The measurement is evidence against demonstrating word2vec on
                  a corpus this size, and it says nothing either way about the
                  method at the size it was built for.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Where Word2vec Stops Being Defined",
          content: (
            <>
              <SubSection title="22. The objective is not what anyone wanted">
                <p>
                  The fit lowers the cost of predicting neighbours. Nobody wants
                  a neighbour predicted, and no quantity computed during the fit
                  says anything about whether the vectors are good. That is not a
                  gap in any particular implementation; it follows from the
                  method being defined as an optimisation of one thing and used
                  for another, and it means the two can move in opposite
                  directions without anything being wrong.
                </p>
                <Word2vecLongerTraining />
                <p>
                  Measured on this corpus, they do. Going from five passes to ten
                  to twenty, the mean cost per pair falls at every step, 2.0872 to
                  2.0617 to 2.0267, exactly as the fit intends. The separation of
                  the two lists rises to 0.8404 at ten passes and then falls back
                  to 0.7397 at twenty, and the mean cosine within a list falls
                  from 0.9962 to 0.8510, so the verb forms are coming apart from
                  each other while the objective keeps improving. A reader
                  watching only the cost curve would have concluded that twenty
                  passes was better than ten.
                </p>
                <KeepInMind>
                  Choosing how long to train, or how wide to make the vectors, or
                  what to draw negatives from, cannot be settled from inside the
                  fit. It needs a judgement made outside the method, on a task
                  someone actually cares about, and where that task does not
                  exist there is no defined notion of a better set of vectors.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. Two runs are both right and not comparable">
                <p>
                  The objective is not convex, and the walk that lowers it is a
                  stochastic one that visits pairs in an order the draws decide.
                  So a fit arrives at a local answer, and a different start
                  arrives at a different local answer, and neither is more correct
                  than the other. There is nothing in the method that would
                  distinguish them.
                </p>
                <p>
                  Worse for anyone hoping to compare two fits, the objective is
                  invariant to a whole family of transformations of the answer.
                  Rotate every vector in the kept table and every row in the
                  discarded table by the same rotation and every dot product is
                  unchanged, so the cost is unchanged, so the rotated answer is
                  exactly as good. The coordinates therefore have no meaning
                  individually, and the fifth coordinate of one run has no
                  relation whatever to the fifth coordinate of another. Measured
                  on the two starts of Part 5, the mean gap coordinate by
                  coordinate is 0.7816 while the pairwise cosines agree to 0.0073.
                </p>
                <KeepInMind>
                  Anything read off a set of these vectors has to survive a
                  rotation, which a cosine or a distance does and a single
                  coordinate does not. Averaging two runs&rsquo; tables together,
                  or feeding one run&rsquo;s vectors to something trained on
                  another&rsquo;s, is undefined rather than approximate, since
                  the two answers were never written in the same coordinates.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. A word seen twice">
                <p>
                  A word&rsquo;s vector is the accumulation of the corrections
                  its occurrences produced. A word that occurs twice produces
                  corrections from two windows, and everything else about where it
                  ends up is where it started, which was a draw. There is no
                  amount of further training that repairs this, since further
                  training visits the same two windows again.
                </p>
                <Word2vecRareWord />
                <p>
                  Put a made-up word into two sentences of the corpus and fit four
                  times from four starts. How alike it comes out to walked is
                  0.8790, 0.9591, 0.9448 and 0.9532, a spread of 0.0801, while the
                  same comparison for walk, which appears 42 times, spreads by
                  0.0025 across the same four starts, thirty one times narrower.
                  The three words the rare one lands nearest change from run to
                  run, naming played first once, saying twice and say once.
                </p>
                <p>
                  Nothing in the answer marks the difference. The rare word gets a
                  vector of the same twelve numbers, and a cosine against it comes
                  back to four decimal places like any other. The usual response
                  is a minimum count, which declines to answer for a rare word
                  rather than answering it better, and where the threshold goes
                  is a judgement rather than a fact. Below it a word has no
                  vector, and it is also removed from the sentences before the
                  windows are formed, so the words on either side of it become
                  neighbours.
                </p>
                <KeepInMind>
                  How much of a vector came from the corpus and how much from the
                  starting draw is a continuous thing that the method does not
                  report. The count of occurrences is the only guide available,
                  and it is available before any fitting, which is why the
                  threshold is applied first.
                </KeepInMind>
              </SubSection>

              <SubSection title="25. Where the method stops being defined">
                <p>
                  Several inputs leave word2vec with nothing to compute rather
                  than something approximate to compute, and a few more leave it
                  with a genuine choice whose cost is worth knowing. The table
                  gathers both, with what the mathematics says in each case.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what the method says"
                  rows={[
                    { expression: "a vocabulary of one word", reason: "there is no pair to train on. A window round the only word contains only itself, and a wrong answer has to be drawn from the words that are not the right one, of which there are none." },
                    { expression: "a word that occurs once", reason: "defined, and determined mostly by where it started. Its vector accumulates the corrections of one window and nothing else, which is why a minimum count exists; the threshold is a judgement, not a fact about the data." },
                    { expression: "a corpus of one-word sentences", reason: "no window ever contains a neighbour, so no pair is ever formed and no correction is ever made. Every vector is exactly where it started, and nothing in the fit distinguishes that from a fit that converged." },
                    { expression: "a reach wider than the sentence", reason: "defined, and the same as a reach of the sentence’s length, since the window stops at the boundary. Wider reaches therefore stop changing the answer, which is not a failure but does make a swept parameter flat for a reason unrelated to the data." },
                    { expression: "the individual coordinates of a vector", reason: "undefined as quantities. Rotating every vector and every scoring row by one rotation leaves every score, and so the whole objective, unchanged, so the coordinates are one arbitrary choice among infinitely many that fit equally well. Only rotation-invariant readings, cosines and distances, mean anything." },
                    { expression: "comparing two runs coordinate by coordinate", reason: "undefined for the same reason. Measured on two starts here the coordinates differ by 0.7816 on average while the cosines they imply agree to 0.0073, so the disagreement is entirely in the part that carries no meaning." },
                    { expression: "the recorded cost, read as quality", reason: "it is not that quantity. It is the mean cost of predicting a neighbour, which under drawn wrong answers also depends on which words were drawn, so it is not even comparable between two runs. Measured here it falls from 2.0872 to 2.0267 across a range over which the separation of the two lists falls from 0.8266 to 0.7397." },
                    { expression: "how long to train, decided from inside the fit", reason: "there is no such decision available. The objective has no stopping point of its own and improves with more passes, so the length has to be set by something outside the method, and where no external task exists there is no defined notion of a better length." },
                    { expression: "the width of the vectors", reason: "a real choice with no principle behind it. Too few numbers and words that should differ are forced together; too many and each word can be described independently of every other, which is what the method was avoiding. There is no quantity inside the fit that turns over as the width passes the right value." },
                    { expression: "a word absent from the corpus", reason: "there is no vector to return. The method learns one row per word it saw, so a word it did not see has no position, and the honest answer is a refusal rather than a default vector, which would be a position the corpus never implied." },
                    { expression: "asking which sense of a word is meant", reason: "outside what the method represents. Every occurrence of a spelling corrects one row, so a word used two ways receives corrections from both and settles somewhere between, and there is no second vector for the second sense to occupy." },
                  ]}
                />
                <KeepInMind>
                  Two of these lines carry most of the weight in practice. The
                  coordinates carry no meaning individually, which rules out
                  comparing or combining runs and rules in cosines and distances;
                  and the recorded cost is not a measure of quality, which rules
                  out every decision a reader would like to make by watching it
                  fall.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
