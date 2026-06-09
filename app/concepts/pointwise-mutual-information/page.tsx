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
import { AssociationGrid } from "@/components/widgets/AssociationGrid";
import { ClippingCensus } from "@/components/widgets/ClippingCensus";
import { MutualInformationPlayground } from "@/components/widgets/MutualInformationPlayground";
import { ReadingComparison } from "@/components/widgets/ReadingComparison";
import { ScoreSpectrum } from "@/components/widgets/ScoreSpectrum";
import { SmoothingTracks } from "@/components/widgets/SmoothingTracks";

export const metadata: Metadata = {
  title: "Pointwise Mutual Information · oop_ml",
  description:
    "Score a pair of words by how much more often they occurred together than their separate rates alone would predict, and read the sign of that score.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function PointwiseMutualInformationPage() {
  return (
    <ConceptPage
      title="Pointwise Mutual Information"
      tagline="Pointwise mutual information scores a pair of words by how much more often they occurred together than their two separate rates alone would predict, and its zero is the one number on this site that means something exact."
      prerequisites={
        <>
          Every word here ends up as a short list of numbers, and two words are
          compared by the{" "}
          <Link href="/concepts/a-vector-for-a-word" className={link}>
            cosine
          </Link>{" "}
          between their lists, which is an angle rather than a distance. The last
          step of the method squeezes a wide table down to a few directions, the
          same operation{" "}
          <Link href="/concepts/pca" className={link}>
            principal components
          </Link>{" "}
          performs on a table of measurements, so that is used without being
          derived again. The table being scored is the one{" "}
          <Link href="/concepts/glove" className={link}>
            GloVe
          </Link>{" "}
          fits directly, and the method{" "}
          <Link href="/concepts/word2vec" className={link}>
            word2vec
          </Link>{" "}
          turns out to be factorising a shifted version of the very matrix built
          here, which Part 3 comes back to.
        </>
      }
      history={
        <>
          <p>
            Lexicographers writing a dictionary in the 1980s wanted to know which
            words genuinely belong together. Doctor and nurse do; doctor and
            sofa do not. The evidence available was word association norms
            collected by asking people what word came to mind, of the kind
            David Palermo and James Jenkins had gathered from thousands of
            schoolchildren and students in 1964, and those are expensive, small,
            and say nothing about the word senses a dictionary has to
            distinguish. Kenneth Church, at AT&amp;T Bell Laboratories, and
            Patrick Hanks, a lexicographer, wanted the same evidence from text
            instead, and the obvious statistic, how often two words appear near
            each other, is dominated by whichever words are common.
          </p>
          <p>
            Their answer was already in the information theory literature. Robert
            Fano, in <em>Transmission of Information</em> in 1961, had defined a
            quantity for one particular pair of outcomes, the logarithm of how
            likely the two are together against how likely they would be if they
            had nothing to do with each other. Church and Hanks applied it to
            pairs of words in a corpus of Associated Press newswire and published
            it as &ldquo;Word Association Norms, Mutual Information, and
            Lexicography&rdquo; in 1990, calling their version the association
            ratio. In the same paper they said plainly that the negative side of
            the scale is not to be trusted without a very large corpus, since the
            evidence that two words avoid each other is much thinner than the
            evidence that they seek each other out. That caution is the reason
            for the clip in Part 3.
          </p>
          <p>
            What turned a lexicographer&rsquo;s statistic into a way of
            positioning words was the observation that a whole matrix of these
            scores can be squeezed. John Bullinaria and Joseph Levy compared a
            long list of ways of weighting co-occurrence counts in 2007 and found
            the positive half of this score the best of them. Then Omer Levy and
            Yoav Goldberg showed in 2014 that word2vec, trained with negative
            samples, is implicitly factorising this same matrix with a constant
            subtracted, which connected the two families that had been treated as
            rivals; and Levy, Goldberg and Ido Dagan followed in 2015 with a
            paper of adjustments, of which flattening the context rates is the
            one Part 4 is about, and reported that a plain decomposition of this
            matrix does as well as word2vec once both are tuned alike.
          </p>
          <p>
            This page asks six questions in order. Why can a raw count not say
            whether two words have anything to do with each other? What exactly is
            the score, and what does its sign mean? Why is the negative half
            almost always thrown away, and what is lost with it? Why does the
            published adjustment to the context rates move a rare
            context&rsquo;s score down rather than up? How does a table of scores
            become a handful of numbers a word, and is that better than reading
            the table? And where does the score stop being defined?
          </p>
        </>
      }
      playground={<MutualInformationPlayground />}
      sections={[
        {
          title: "Part 1. What A Count Cannot Tell You",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. Twenty-four short notes, and two halves that never mix">
                <p>
                  Everything on this page is measured on one corpus, and it is
                  worth knowing what is in it before any score touches it.
                  Twenty-four notes of six words each, twelve about cooking and
                  twelve about sailing. The cooking half is spelled from flour,
                  sugar, butter, eggs, oven, bake, stir, whisk, dough and pan;
                  the sailing half from sail, wind, boat, harbour, anchor, tide,
                  mast, rope, deck and crew. No word of one half ever appears in
                  the other. What the two halves do share is three words that
                  carry no topic at all, and, the and we, and those three turn out
                  to matter more here than any of the twenty.
                </p>
                <p>
                  That comes to 144 word occurrences over 23 distinct words. The
                  notes are arranged rather than written, so that each note uses
                  five of its topic&rsquo;s ten words in a rotating order and
                  every topic word therefore keeps the same company as every
                  other. The arrangement matters because it removes any structure
                  inside a half that might be stronger than the difference between
                  the halves, which is what would otherwise be found first and
                  reported as a success.
                </p>
                <p>
                  A second, much smaller corpus turns up wherever the arithmetic
                  has to be followed by hand. It is three sentences, the cat sat,
                  the dog sat and the cat ran, and it has five words and twelve
                  counted neighbourings in all, so every number on the page can be
                  checked with a pencil.
                </p>
                <KeepInMind>
                  The one fact hidden from every calculation here is that the
                  corpus has two halves. Nothing is told which half a word came
                  from, so the two quantities this page keeps reporting, how alike
                  two words of one half come out and how alike a word of each come
                  out, are the whole score.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Why a count cannot tell a function word from a topic word">
                <p>
                  Take the word flour and ask what it keeps company with. Walking
                  the notes and counting every word that falls within five
                  positions of it gives a row of counts, and reading that row
                  from the top is the obvious way to answer the question. It is
                  also wrong in a way that a small corpus makes easy to see.
                </p>
                <p>
                  The word and stood beside flour three times, and so did dough.
                  The word the stood beside flour twice, and so did whisk. By
                  count alone the four are two ties, and there is nothing in the
                  counts to prefer one member of each tie to the other. But and
                  and the served as company 40 times each across the whole
                  corpus, where dough and whisk served as company 25 times each,
                  so a function word had far more chances to fall beside flour and
                  took them.
                </p>
                <InAModel title="The two ties, scored">
                  <p>
                    Once the score of this page is applied, the ties come apart.
                    Both pairs counted three, and flour with dough scores +1.0578
                    against flour with and at +0.5878. Both pairs counted two, and
                    flour with whisk scores +0.6523 against flour with the at
                    +0.1823. Nothing about the counts changed; what changed is
                    that the score asks how often the pair occurred against how
                    often it would have occurred anyway.
                  </p>
                </InAModel>
                <KeepInMind>
                  A raw count answers how often, and the question worth asking is
                  how much more often than nothing in particular would explain. On
                  this corpus the difference between those two questions is
                  already large enough to reorder a word&rsquo;s company, and on
                  real text, where the commonest word occurs thousands of times
                  more often than the rarest, it decides the whole ordering.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Dividing out what frequency alone would predict">
                <p>
                  Suppose the two words had nothing whatever to do with each
                  other. They would still fall near each other sometimes, and how
                  often is a question with an answer. If one word takes a fifth of
                  all the company handed out in the corpus and the other takes a
                  tenth, then a fiftieth of all the pairings would involve both of
                  them by accident alone. Compare what actually happened against
                  that number, and what is left is what the two words have to do
                  with each other.
                </p>
                <Equation>{"score(w, c) = log( rate of the pair ÷ (rate of w × rate of c) )"}</Equation>
                <p>
                  The rate of the pair is how many times the two were counted
                  together over how many pairings were counted in all; the rate of
                  a word is how much of that same total the word took on its own.
                  The division cancels the part of the count that is explained by
                  either word being common, which is precisely the part that let
                  and tie with dough. The logarithm is what makes the result a
                  quantity you can add and subtract rather than a ratio you have
                  to multiply, and it puts the value at zero exactly where the
                  ratio is one.
                </p>
                <KeepInMind>
                  Everything else on this page follows from that one line. Part 2
                  works it on a pair small enough to check, Part 3 is about the
                  negative values it produces, Part 4 is about a change to one of
                  the two rates in the denominator, and Part 5 is about what to do
                  with a whole square of these numbers.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 2. The Score, On One Pair",
          content: (
            <>
              <SubSection title="4. Three sentences, counted by hand">
                <p>
                  The three sentences are the cat sat, the dog sat and the cat
                  ran, and near means the word immediately next door, on either
                  side. From the first sentence, the and cat are neighbours and
                  cat and sat are neighbours. Every pair is counted from both ends,
                  so the row for the records cat and the row for cat records the,
                  and the resulting square is symmetric.
                </p>
                <WorkedExample title="Five words, twelve counted neighbourings">
                  <p>
                    The row for the reads cat 2 and dog 1. The row for cat reads
                    the 2, sat 1 and ran 1. The row for sat reads cat 1 and dog 1.
                    The row for dog reads the 1 and sat 1, and the row for ran
                    reads cat 1. Adding each row gives 3, 4, 2, 2 and 1, the
                    columns give the same five numbers because the square is
                    symmetric, and everything together adds to 12. Of the 25 cells
                    the five words can form, 10 hold a count and 15 are empty,
                    including all five on the diagonal, since no word here is ever
                    its own neighbour.
                  </p>
                </WorkedExample>
                <AssociationGrid />
                <p>
                  The widget above opens on those three sentences, so every cell
                  in it can be checked against the paragraph, and clicking one
                  shows the four numbers behind it. Switch to the twenty-four
                  notes and the same rule is applied at a reach of five, 23 words
                  wide.
                </p>
                <KeepInMind>
                  Two decisions have already been taken before a single score
                  exists, how far near reaches and whether a word further away
                  counts for less. Nothing computed afterwards can revisit either,
                  and changing one means counting the corpus again from the start.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. One pair, worked all the way through">
                <p>
                  Take the and cat. They were counted together twice out of twelve
                  counted neighbourings in all. The word the took three of those
                  twelve on its own, and cat took four. So chance alone, with the
                  two words having nothing to do with each other, would put them
                  together a quarter of a third of the time.
                </p>
                <DerivationTable
                  expressionHeading="Quantity"
                  reasonHeading="Where it comes from"
                  rows={[
                    {
                      expression: "rate of the pair = 2 ÷ 12 = 0.166667",
                      reason:
                        "The two words were counted next to each other twice, out of twelve counted neighbourings in the whole of the three sentences.",
                    },
                    {
                      expression: "rate of the = 3 ÷ 12 = 0.25",
                      reason:
                        "The word the took three of those twelve, which is the whole of its row added up and divided by the total.",
                    },
                    {
                      expression: "rate of cat = 4 ÷ 12 = 0.333333",
                      reason:
                        "The same for cat, whose column adds to four. On an unflattened table the row total and the column total of a word are the same number, since the square is symmetric.",
                    },
                    {
                      expression: "chance alone = 0.25 × 0.333333 = 0.083333",
                      reason:
                        "What the pair’s rate would have been if the two words were placed independently of each other, which is the quantity the score is a comparison against.",
                    },
                    {
                      expression: "the ratio = 0.166667 ÷ 0.083333 = 2",
                      reason:
                        "Twice as often as chance alone predicts. This is the number that means something; everything after it is a change of scale.",
                    },
                    {
                      expression: "score = log 2 = 0.693147",
                      reason:
                        "The logarithm, which sends a ratio of one to zero, ratios above one to positive numbers and ratios below one to negative ones.",
                    },
                  ]}
                />
                <KeepInMind>
                  Read the ratio rather than the score whenever the score is hard
                  to feel. A score of 0.693147 says the pair occurred twice as
                  often as it would have by accident, and a score of 1.098612 says
                  three times as often, since the score is only the logarithm of
                  that multiplier.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. What the sign means, and why the zero is exact">
                <p>
                  A positive score says the two words were found together more
                  often than their separate rates predict, a negative score says
                  less often, and zero says exactly as often. That last statement
                  is stronger than it sounds. Most quantities on this site have a
                  zero that is a convention or an artefact of where a scale was
                  put; this one has a zero that is a statement about the corpus,
                  namely that the rate of the pair is the product of the two
                  rates, to the last decimal place.
                </p>
                <Equation>{"score > 0  more often than chance      score = 0  exactly chance      score < 0  less often"}</Equation>
                <p>
                  On the twenty-four notes three pairs make the three regions
                  legible. Crew beside deck scores +1.5278, which is the highest
                  score in the corpus, shared with five other pairs of topic
                  words; the two were counted together four times and both are
                  among the words that served as company least. And beside anchor
                  scores +0.0282, which is as close to chance as anything here
                  gets, and it is exactly the reading you would want for a
                  function word against a topic word. And beside bake scores
                  −0.5108, the lowest in the corpus, which says the two occurred
                  together about three fifths as often as their rates alone would
                  have predicted.
                </p>
                <KeepInMind>
                  The sign is interpretable in a way that almost nothing else here
                  is, which is why the rest of the page spends so much effort on
                  what happens when half of it is thrown away. A pair scoring near
                  zero is not a pair the corpus is silent about; it is a pair the
                  corpus has spoken about and found unremarkable.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. Every score in the corpus, on one scale">
                <p>
                  Two questions are worth asking of a whole corpus at once. How
                  many pairs come out above chance and how many below, and how far
                  does the scale reach in each direction? Both are visible when
                  every score is placed on one line.
                </p>
                <ScoreSpectrum />
                <p>
                  Of the 529 pairs 23 words can form, 280 were actually seen
                  together and have a score. Of those, 224 are above chance and 56
                  below, so four fifths of what the corpus said is a statement
                  that two words seek each other out. The positive side reaches
                  +1.5278 and the negative side only −0.5108, and that lopsidedness
                  is in the arithmetic rather than in this corpus. The smallest
                  count a pair can carry and still be on the picture at all is one,
                  so the furthest a score can fall below zero is fixed by how
                  common its two words are, and on a corpus where nothing is very
                  common that is not far. Above zero there is no such squeeze, and
                  two rare words that always occur together can reach a ratio of
                  hundreds.
                </p>
                <KeepInMind>
                  The 249 pairs that were never seen together are on that picture
                  nowhere at all, and they are almost half of everything the
                  vocabulary can form. Part 6 is about what the mathematics says
                  for them, which is not that they scored low.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. There is a ceiling, and the commoner word sets it">
                <p>
                  How high can a score go? The pair can never be counted more
                  often than the rarer of its two words was counted at all, since
                  every one of that word&rsquo;s occurrences is available for the
                  pair and no more. So the ratio can never exceed one over the
                  larger of the two rates, and the score has a ceiling set by
                  whichever of the two words is commoner.
                </p>
                <Equation>{"score(w, c) ≤ −log( the larger of the two rates )"}</Equation>
                <p>
                  The ceiling is reached exactly when the rarer word occurs
                  nowhere except beside the commoner one. In the three sentences,
                  ran appears once and its only neighbour is cat, so the pair cat
                  and ran attains its ceiling of 1.098612 precisely, and the same
                  ceiling applies to cat and sat, which reaches only 0.405465
                  because sat also stands beside dog.
                </p>
                <WhyThisWorks title="Why the ceiling makes rare words loud">
                  <p>
                    A word counted once has a tiny rate, so one over that rate is
                    large, so its ceiling is high and one single co-occurrence is
                    enough to reach it. A word counted five hundred times has a
                    low ceiling and cannot reach a large score with anything. The
                    consequence is that the highest scores in any corpus belong to
                    the rarest words, on the thinnest evidence, and that is what
                    the last part of this page comes back to.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  The ceiling is a fact about the arithmetic rather than about
                  language, and it means two scores computed from words of very
                  different frequencies are not on comparable scales. A score of
                  1.0 between two rare words is unremarkable; the same score
                  between two of the commonest words in the corpus would be
                  impossible.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. This score, and the mutual information it is named after">
                <p>
                  The name causes trouble and it is worth spending a paragraph on.
                  Mutual information is a single number describing two whole
                  distributions, and it is the average of the quantity on this page
                  taken over every pair, weighted by how likely each pair is. The
                  score here is one term of that average, before it is averaged,
                  which is what the word pointwise is doing in the name.
                </p>
                <Equation>{"mutual information = Σ over every pair of  rate(w, c) × score(w, c)"}</Equation>
                <p>
                  Two consequences follow. Mutual information cannot be negative,
                  because it is an average that the arithmetic of probability
                  keeps at or above zero, whereas a single term of it can be
                  negative and 56 of them are here. And mutual information is one
                  number for a corpus where this page needs one number for every
                  pair, since the whole purpose is to tell pairs apart.
                </p>
                <KeepInMind>
                  The base of the logarithm is a choice with no consequence for
                  anything ordered. Natural logarithms are used throughout this
                  page, so a score of 0.693147 means twice as often as chance; the
                  same pair in base two would read exactly 1, which is where the
                  phrase one bit of association comes from.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Throwing Away The Negative Half",
          content: (
            <>
              <SubSection title="10. Why a score below chance is the half you cannot afford">
                <p>
                  Church and Hanks warned about the negative side of the scale in
                  the paper that introduced the score, and the argument is about
                  evidence rather than about arithmetic. To observe that two words
                  occur together far more often than chance, you need to see them
                  together a few times, which a modest corpus provides. To observe
                  that two words avoid each other, you need to have seen enough of
                  both words that their absence together is surprising, and that
                  takes far more text.
                </p>
                <p>
                  The lowest score in the whole of the twenty-four notes is
                  −0.5108, and every pair sitting at it was seen together exactly
                  once. That is the shape of the problem. A pair below chance is
                  by definition a pair with few observations, so the very score
                  that says the two words avoid each other is the score computed
                  from the least evidence.
                </p>
                <p>
                  The usual response is to keep the positive half and set
                  everything else to zero, which is what the rest of this page
                  does and what almost every published use of the score does.
                </p>
                <Equation>{"kept(w, c) = the larger of  score(w, c)  and  0"}</Equation>
                <KeepInMind>
                  The clip is a judgement about how much a small corpus can
                  support rather than a step in the derivation. Nothing in the
                  definition of the score asks for it, and the two things it buys,
                  a matrix with no negative entries and a matrix with a great many
                  zeros, are both conveniences of the machinery that reads it
                  afterwards.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. What the clip costs, counted">
                <p>
                  On this corpus the clip discards 56 scores. That is a fifth of
                  everything the corpus actually observed, and the values thrown
                  away average −0.2562, so they are not all sitting close to zero
                  where the loss would be small.
                </p>
                <ClippingCensus />
                <p>
                  The bar above splits all 529 pairs three ways. What matters is
                  the middle block and the right one. Both end up holding zero,
                  and after the clip 305 of the 529 cells are zero, which is 57.7%
                  of a table that is about to be handed to something that reads
                  every cell of it.
                </p>
                <KeepInMind>
                  A fifth of the observations discarded is the cost of the clip on
                  a corpus of 144 words. The published argument is that on a corpus
                  of billions the negative half is mostly noise anyway, which
                  cannot be checked here, so the honest reading of this measurement
                  is that the clip is expensive at small sizes and defended at
                  large ones.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. Two zeros that mean different things">
                <p>
                  There is a second cost, and it is not a quantity. After the clip,
                  a cell holding zero can have arrived there two ways. Either the
                  two words were seen together and scored below chance, which is
                  the corpus saying something, or they were never seen together at
                  all, which is the corpus saying nothing. Nothing downstream can
                  tell the 56 from the 249.
                </p>
                <p>
                  That distinction is real and it points in opposite directions. A
                  pair below chance is evidence, however thin, that the two words
                  keep apart. A pair never seen together is the absence of
                  evidence, and on a corpus of 24 notes almost half of every
                  possible pair is in that state, including flour and bake, which
                  are both cooking words and simply never landed within five
                  positions of each other.
                </p>
                <InAModel title="The two kinds of zero, counted">
                  <p>
                    Of the 529 cells, 224 keep a score, 56 held a score below
                    chance and were set to zero, and 249 never had a score to set.
                    The first group is what the method works with; the other two
                    are indistinguishable to everything that comes afterwards, and
                    together they are more than half the table.
                  </p>
                </InAModel>
                <KeepInMind>
                  Substituting zero for undefined is the single most consequential
                  decision on this page, and it is made in one line. Part 6 says
                  what the alternatives to it are and what each would cost, since
                  every implementation has to decide something there and none of
                  the choices is derived from the definition.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. Taking a little more off, and what the emptiness buys">
                <p>
                  Once the clip is in place, a natural knob appears. Subtract a
                  constant from every score before clipping and more of the table
                  goes to zero, so the amount subtracted controls how sparse the
                  result is. This is not an arbitrary invention; word2vec trained
                  against a certain number of drawn negatives is, in effect,
                  factorising this matrix with the logarithm of that number taken
                  off, which is what Levy and Goldberg showed in 2014.
                </p>
                <Equation>{"kept(w, c) = the larger of  score(w, c) − s  and  0"}</Equation>
                <p>
                  The rows under the bar in step 11 are what that costs here. At
                  nothing subtracted, 224 entries survive and the two halves of the
                  corpus come apart by 0.6646. Taking off the logarithm of two
                  leaves 96 entries and 0.5789; taking off 1.0 leaves 64 and
                  0.4901; and taking off the logarithm of five, which is 1.6094 and
                  larger than every score in the table, leaves nothing at all, so
                  every word ends up pointing nowhere and there is no angle between
                  two words to report.
                </p>
                <KeepInMind>
                  Every amount subtracted made this corpus worse, monotonically,
                  which is what a corpus of 144 words should be expected to show,
                  since there is no noise here to suppress and every entry
                  discarded is evidence removed. The setting exists for corpora
                  where the matrix is too large to hold and most of its small
                  entries really are noise.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Flattening The Context Rates",
          content: (
            <>
              <SubSection title="14. A rare word in the denominator is flattered">
                <p>
                  Look again at where the two rates sit. Both are in the
                  denominator, so a word with a small rate makes the whole ratio
                  large, and the rarest words in a corpus therefore produce the
                  largest scores whatever they do. That is the ceiling of step 8
                  seen from the other side, and it is a genuine problem, because a
                  word counted twice has an estimated rate that is mostly an
                  accident of which text was collected.
                </p>
                <p>
                  The published repair is to raise every context count to a power
                  below one before turning the counts into rates. Raising to a
                  power below one pulls large numbers down towards small ones, and
                  after everything is renormalised the rare contexts hold a larger
                  share than they did and the common ones a smaller share. The
                  power used is three quarters, which is the same three quarters
                  word2vec uses when it draws its negative samples.
                </p>
                <Equation>{"flattened rate of c = count(c)^0.75 ÷ Σ over every word of count^0.75"}</Equation>
                <KeepInMind>
                  Only the context rate is flattened. The rate of the word itself
                  and the rate of the pair are left alone, which is a detail that
                  looks like an omission and turns out in step 16 to change the
                  character of the whole table.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Which way the score actually moves">
                <p>
                  Here is where I got it wrong, and where writing down the
                  direction before computing it would have left a plausible
                  sentence in place of a true one. Flattening lifts a rare
                  context&rsquo;s rate. It is easy to read that as lifting a rare
                  context&rsquo;s score, and I did. The rate is in the
                  denominator, so lifting it pushes the score down.
                </p>
                <SmoothingTracks />
                <p>
                  The lines are measured on the twenty-four notes. Flour and
                  whisk, where whisk served as company 25 times, scores +0.6523
                  unflattened and falls to +0.5933 at the published three quarters.
                  Sugar and the, where the served as company 40 times, scores
                  +0.4336 unflattened and rises to +0.4922. The rare context lost
                  and the frequent one gained, which is the direction the
                  adjustment exists for and the opposite of the one the word lifted
                  suggests.
                </p>
                <p>
                  The same reasoning applies below zero and the widget draws that
                  too. And beside bake was already at −0.5108, and flattening
                  takes it to −0.5242, further below chance, because bake is
                  another of the rarer contexts.
                </p>
                <KeepInMind>
                  What the adjustment does is hold back pairs whose only
                  distinction is that one of the two words is rare. It reads as a
                  correction for thin evidence, and it is applied through the
                  denominator, so the description of it has to be read carefully in
                  either direction.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. What the flattening breaks">
                <p>
                  Every count in this table is made from both ends, so the counts
                  are symmetric, and while nothing is flattened the scores are
                  symmetric too. The score of a word given a context and the score
                  of the context given the word are the same number, because the
                  same three quantities appear in both. Flatten one of the two
                  rates and that stops being true.
                </p>
                <p>
                  Measured at the published three quarters, 88 pairs of words come
                  out with two different scores depending on which of the two is
                  read as the word and which as the context, which is 176 of the
                  224 surviving entries. The largest disagreement is and beside
                  crew, which keeps 0.3057 in one direction and 0.4232 in the
                  other, a gap of 0.1175.
                </p>
                <WhyThisWorks title="Why the two directions come apart">
                  <p>
                    Reading and as the word and crew as the context divides by
                    crew&rsquo;s flattened rate, which the flattening lifted
                    because crew is one of the rarer words. Reading crew as the
                    word and and as the context divides by and&rsquo;s flattened
                    rate, which the flattening lowered because and is one of the
                    commonest. The count in the numerator is the same both ways,
                    so the whole of the difference is which of the two rates was
                    adjusted.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  A symmetric quantity has become an asymmetric one, and the row
                  for a word and the column for the same word are now different
                  descriptions of it. Everything after this reads the rows, which
                  is a choice; reading the columns would give different answers,
                  and nothing in the definition prefers one.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. What the flattening is worth on this corpus">
                <p>
                  The 2015 paper reported this as the single most useful of its
                  adjustments. On the twenty-four notes it makes things very
                  slightly worse, and both halves of that are worth reporting.
                </p>
                <NumberTable
                  headings={[
                    "the context rates",
                    "two words of one topic",
                    "a word of each topic",
                    "how far the halves came apart",
                  ]}
                  rows={[
                    ["left alone", "0.6734", "0.0016", "0.6718"],
                    ["flattened at 0.90", "0.6733", "0.0043", "0.6690"],
                    ["flattened at 0.75, the published value", "0.6732", "0.0086", "0.6646"],
                    ["flattened at 0.50", "0.6738", "0.0169", "0.6569"],
                    ["flattened at 0.25", "0.6752", "0.0264", "0.6488"],
                  ]}
                  caption="Every row is a fit at a width of four on the twenty-four notes. The last column is the second figure taken from the first, and a larger number means the two halves of the corpus were told further apart."
                />
                <p>
                  The interesting column is the third rather than the last. Words
                  of different topics come out at 0.0016 with nothing flattened
                  and drift up to 0.0264 as the flattening is pushed, so flattening
                  is pulling the two halves of this corpus together. The reason it
                  can is the three shared words. They are the commonest contexts,
                  so flattening lowers their rates and therefore raises the score
                  of every pair whose context is one of them, and those three
                  columns are the only company a cooking word and a sailing word
                  have in common, so raising them is raising exactly the part of
                  two rows that makes words of different topics look alike.
                </p>
                <KeepInMind>
                  The published claim did not hold here, and the size of the effect
                  is 0.0072 on a quantity of 0.67, so this is a corpus too small
                  and too clean to test the claim on rather than evidence against
                  it. The measurement is worth reporting because the direction is
                  consistent across the whole sweep and because it is the sort of
                  adjustment that gets carried from paper to paper without being
                  checked at the size it is being applied at.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. From A Table Of Scores To A Handful Of Numbers",
          content: (
            <>
              <SubSection title="18. A row of scores is already a description of a word">
                <p>
                  Nothing so far has produced a position for a word, and yet a
                  description is already there. The row of the table belonging to
                  flour holds one number for every word in the vocabulary, saying
                  how much more than chance flour was found beside that word, and
                  two words can be compared by the angle between their two rows
                  without any further machinery.
                </p>
                <p>
                  That description is 23 numbers wide here and would be four
                  hundred thousand wide on a real vocabulary, which is the first
                  reason to squeeze it. The second is that the row is mostly zero.
                  Flour was never seen beside twelve of the 23 words, so twelve of
                  its 23 numbers carry nothing, and two cooking words that never
                  happened to fall near each other have no direct evidence
                  connecting them at all.
                </p>
                <KeepInMind>
                  The squeeze is doing two jobs and only one of them is about size.
                  Filling in the pairs the corpus never saw, from the pairs it did
                  see, is the job that changes the answers, and the widest fit on
                  this page loses that job entirely by keeping every direction.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Squeezing the table, and the power on the sizes">
                <p>
                  The square of kept scores is broken into directions, each with a
                  size attached, ordered so the first direction accounts for as
                  much of the table as any single direction can. Keeping the first
                  few and discarding the rest gives every word a short list of
                  numbers, and the discarded directions are the ones the table
                  leans on least.
                </p>
                <Equation>{"the numbers for word w = (its part of each kept direction) × (that direction’s size)^p"}</Equation>
                <p>
                  On this corpus the four largest sizes are 6.6440, 6.1406, 2.8430
                  and 2.8325, so two directions stand well clear of the rest,
                  which is what a table made of two blocks with almost nothing
                  between them would be expected to give. The power p
                  is a choice with no derivation behind it. At p of one, the
                  products of two words&rsquo; numbers reproduce the table&rsquo;s
                  own entries; at p of zero the directions are kept at equal
                  strength; the 2015 paper reports a half as consistently best on
                  word similarity and that is the value the rest of this page uses.
                </p>
                <NumberTable
                  headings={[
                    "the power on the sizes",
                    "two words of one topic",
                    "a word of each topic",
                    "how far the halves came apart",
                  ]}
                  rows={[
                    ["0.00", "0.4864", "−0.0142", "0.5005"],
                    ["0.25", "0.5826", "−0.0044", "0.5870"],
                    ["0.50, the published value", "0.6732", "0.0086", "0.6646"],
                    ["0.75", "0.7530", "0.0246", "0.7284"],
                    ["1.00", "0.8191", "0.0428", "0.7762"],
                  ]}
                  caption="A fit at a width of four on the twenty-four notes, at five powers. The published half is in the middle of the range and is not the best of the five here."
                />
                <KeepInMind>
                  A power of one separates these two halves furthest, and it is not
                  the published choice. That is a second published setting this
                  corpus disagrees with, and the reason is the same in both cases,
                  since a setting chosen to work across many corpora of billions of
                  words is not the setting that works on 144.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. What the four numbers put near what">
                <p>
                  With four numbers a word, the nearest words to flour are bake,
                  sugar, oven, eggs and butter, all five from the cooking half.
                  Averaged across every pair, two words of one topic come out at
                  0.6732 and a word of each at 0.0086, so the two halves of the
                  corpus have been told apart by something that was never told
                  they existed.
                </p>
                <p>
                  The first of those neighbours is worth pausing on. Flour and bake
                  never once fell within five positions of each other in the whole
                  corpus, so their cell in the table is one of the 249 that never
                  had a score. Four numbers a word place them at a cosine of
                  1.0000, which is to say the squeeze has concluded they are the
                  same word from the company they each keep separately.
                </p>
                <KeepInMind>
                  That is the squeeze earning its keep and overreaching in the same
                  measurement. Connecting two words the corpus never put together
                  is the job; concluding they are identical is more than the
                  evidence supports, and step 22 counts how often it happens.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. Where reading the counts beats scoring them">
                <p>
                  The whole argument for this page is that a count is a poor
                  measure of association and a score is a good one. On a corpus
                  this size that argument loses, on one of the two questions, and
                  it would be dishonest to leave it out.
                </p>
                <ReadingComparison />
                <p>
                  Compare the first row with the third. Reading a word&rsquo;s raw
                  counts puts two words of one topic at 0.6629 and a word of each
                  at 0.1192, a gap of 0.5438. Scoring those same counts drops the
                  second figure to 0.0292, which is the score doing exactly what it
                  was invented for, since the three shared words are what made the
                  two halves look alike and dividing by their rates removed most of
                  it. But it drops the first figure as well, from 0.6629 to 0.5228,
                  and the gap narrows to 0.4936. The counts win, at the same width
                  of 23 numbers a word.
                </p>
                <p>
                  What recovers it is the squeeze. Four numbers a word give 0.6732
                  and 0.0086, a gap of 0.6646, better than either 23-wide reading,
                  and the same ordering holds without the flattening, where the
                  scores alone reach 0.5015 against the counts&rsquo; 0.5438.
                </p>
                <KeepInMind>
                  Scoring lowered both figures rather than only the second. The
                  three shared words are company for every word here, so they
                  inflate the angle between any two rows at all, and dividing by
                  their rates deflates it whether the two words come from one
                  topic or from two. The within-topic figure fell by 0.1401 and
                  the across-topic figure by 0.0900, which is why the gap
                  narrowed, and the decomposition is what turns it back into an
                  advantage.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. What the squeeze costs">
                <p>
                  Three costs are worth naming and all three are numbers. The
                  first is what is lost from the table. The kept scores are 529
                  numbers, the fitted vectors are 92, and at a width of four the
                  reconstruction misses the table by 0.5668 of its own size. At a
                  width of two it misses by 0.6579, at eight by 0.4542, and only at
                  the full 23 does it reproduce the table exactly.
                </p>
                <p>
                  The second is the collapse. Five pairs of cooking words and five
                  pairs of sailing words come out at a cosine of exactly 1.0000
                  under four numbers, which means the fit cannot tell them apart at
                  all. Flour and bake are one such pair, and their full rows of
                  scores sit at a cosine of 0.5356, so the squeeze has taken two
                  words that were half alike and declared them identical. That is
                  the price of describing 23 words with four directions, and it is
                  paid whether or not the collapse is noticed.
                </p>
                <p>
                  The third is what it costs to compute. The table is as wide as
                  the vocabulary on both sides, so it holds the square of the
                  vocabulary size whether or not the cells are filled, and breaking
                  it into directions costs the cube. At 23 words that is 529
                  numbers and no time worth measuring; at four hundred thousand
                  words, which is the vocabulary a published set of vectors covers,
                  the same square would hold a hundred and sixty billion cells, and
                  every implementation at that size holds the filled cells alone
                  and asks a solver for a few directions rather than all of them.
                </p>
                <NumberTable
                  headings={[
                    "numbers a word",
                    "how much of the table is missed",
                    "how far the halves came apart",
                  ]}
                  rows={[
                    ["2", "0.6579", "0.9885"],
                    ["4", "0.5668", "0.6646"],
                    ["8", "0.4542", "0.4503"],
                    ["12", "0.3376", "0.3128"],
                    ["23", "0.0000", "0.1997"],
                  ]}
                  caption="Measured on the twenty-four notes at the published flattening and power. The two columns move in opposite directions, which is the whole difficulty of choosing a width."
                />
                <p>
                  Read those two columns together. A wider fit reproduces the table
                  more faithfully and separates the two halves less well, and at
                  the full width, where the table is reproduced exactly, the halves
                  are barely apart at all. Reproducing the table is not the goal,
                  since the table is mostly substituted zeros; the narrow fits do
                  better precisely because they are unable to reproduce them.
                </p>
                <KeepInMind>
                  Nothing computed during the fit turns over as the width passes a
                  good value. The width that works here was found by trying widths
                  and looking at a quantity that depends on knowing which half each
                  word came from, which is exactly the fact a real corpus does not
                  come with.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Where The Score Stops Being Defined",
          content: (
            <>
              <SubSection title="23. A pair that never occurred has no logarithm">
                <p>
                  The score is the logarithm of a ratio whose numerator is the rate
                  of the pair. If the two words were never seen together, that rate
                  is zero, the ratio is zero, and the logarithm of zero is not a
                  number. It does not fall off towards a large negative value in
                  any useful sense either; it is undefined, and every implementation
                  has to decide something in its place.
                </p>
                <p>
                  There are three honest choices and each costs something. Put zero
                  there, which is what almost everybody does, and the cell then
                  says the two words are independent, which is a claim the corpus
                  never made and is the same value a pair scoring slightly below
                  chance receives. Leave the cell out, keeping only the pairs that
                  occurred, which is what GloVe does, and the objective then makes
                  no claim about those pairs at all, though nothing downstream that
                  wants a square table can be handed the result. Add a small count
                  to every cell before dividing, which makes every score defined
                  and makes the rarest pairs the ones the added count moves most.
                </p>
                <p>
                  The size of the decision is what makes it worth stating. On the
                  twenty-four notes, 249 of the 529 cells have no score, so 47.1% of
                  the table is whatever was substituted, and the shortfall grows
                  with the vocabulary rather than shrinking, since the number of
                  possible pairs grows as the square while the number of observed
                  ones grows roughly with the amount of text.
                </p>
              </SubSection>

              <SubSection title="24. A pair seen once is where the score is loudest">
                <p>
                  The score rewards rarity, and it does so by design rather than by
                  accident. Both words&rsquo; rates sit in the denominator, so two
                  words counted once each that happened to fall beside each other
                  produce the largest score the corpus can express, and no amount of
                  evidence about a common pair can match it.
                </p>
                <p>
                  On the three sentences, cat and ran were counted together once
                  and score 1.098612, while the and cat were counted together twice
                  and score 0.693147. On the twenty-four notes, stir and whisk were
                  counted together four times and score 1.5278, while eggs and oven
                  were counted together six times and score 1.2603. In both cases
                  the pair with fewer observations scores higher, and in both cases
                  the arithmetic is correct.
                </p>
                <p>
                  It is correct and it is not what anyone wants, because a pair
                  seen once is mostly an accident of which text was collected. The
                  usual responses are to drop words below a count threshold before
                  scoring anything, which declines to answer for a rare word rather
                  than answering badly, and to flatten the context rates as Part 4
                  does, which holds back the pairs whose only distinction is
                  rarity. Neither removes the effect and neither is derived from
                  the definition.
                </p>
              </SubSection>

              <SubSection title="25. Where the method stops being defined">
                <p>
                  Several inputs leave the score with nothing to compute rather
                  than something approximate to compute, and several more leave a
                  genuine choice whose cost is worth knowing before it is made. The
                  table gathers both, with what the mathematics says in each case.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what the method says"
                  rows={[
                    {
                      expression: "a pair that never occurred together",
                      reason:
                        "undefined. The rate of the pair is zero and the logarithm of zero is not a number, so there is nothing to compute and something has to be put in its place. Here that is 249 of 529 cells, which is 47.1% of the table.",
                    },
                    {
                      expression: "a pair scoring below chance",
                      reason:
                        "defined, and the value is negative and small in size, since the ratio is bounded below by zero and cannot carry the score far down. It is also the value computed from the thinnest evidence, which is the argument for discarding it. Here it is 56 of the 280 scores that exist, averaging −0.2562.",
                    },
                    {
                      expression: "a zero in the table after the clip",
                      reason:
                        "ambiguous by construction. It stands for a pair below chance and for a pair never seen at all, and nothing afterwards can separate the 56 from the 249. The clip is what creates the ambiguity; the score itself distinguishes them perfectly.",
                    },
                    {
                      expression: "a word that occurs once in the whole corpus",
                      reason:
                        "defined, and its scores are the largest the corpus can produce, because its rate sits in the denominator and is as small as a rate can be. The ceiling on a score is one over the larger of the two rates, so a rare word’s ceiling is high and one co-occurrence reaches it.",
                    },
                    {
                      expression: "a word that occurs everywhere",
                      reason:
                        "defined, and its scores are pressed towards zero from above, since its own rate is large and the ceiling on any score involving it is correspondingly low. That is the score working as intended rather than a limitation.",
                    },
                    {
                      expression: "comparing two scores from words of different frequencies",
                      reason:
                        "permitted by the arithmetic and misleading. The two are bounded by different ceilings, so the same number means something different in each case, and an ordering of scores across a whole table is partly an ordering by rarity.",
                    },
                    {
                      expression: "a word absent from the corpus",
                      reason:
                        "no row and no column, so no score with anything. The refusal is the honest answer, since a default position would be one the corpus never implied.",
                    },
                    {
                      expression: "which of the two words stood first",
                      reason:
                        "outside what the table represents. Each pair is counted from both ends, so the counts cannot tell the cat sat from sat the cat. Order is discarded when the corpus is counted rather than when it is scored.",
                    },
                    {
                      expression: "the two directions of one pair, once the contexts are flattened",
                      reason:
                        "no longer one number. Only the context rate is adjusted, so the score of a word given a context and the score of the context given the word come apart, here for 88 pairs, the widest by 0.1175. Reading the rows and reading the columns are then two different descriptions and the definition prefers neither.",
                    },
                    {
                      expression: "how far near reaches, and what a distant neighbour is worth",
                      reason:
                        "a real choice made before any score exists and unrevisable afterwards. It decides which cells have a score at all, since a reach of one leaves 112 entries here and separates the halves by 0.4238, five leaves 224 and 0.6646, and beyond five nothing changes, because five positions already reach every word of a six-word note.",
                    },
                    {
                      expression: "how much to subtract before the clip",
                      reason:
                        "a real choice about how sparse the result should be, with nothing inside the calculation to settle it. Every value tried made this corpus worse, from 0.6646 at nothing down to 0.4901 at one; past 1.6094 the table is empty, every word points nowhere, and the angle between two words is undefined rather than large.",
                    },
                    {
                      expression: "how many numbers to give a word",
                      reason:
                        "a real choice with no quantity turning over at a good value. Reproducing the table and separating the topics pull opposite ways, 0.6579 missed and 0.9885 apart at two numbers against 0.0000 missed and 0.1997 apart at all 23, and the faithful end is the worse end precisely because the table is mostly substituted values.",
                    },
                    {
                      expression: "the individual numbers a word ends up with",
                      reason:
                        "undefined as quantities. Turning every word’s numbers by one rotation leaves every angle between two words where it was, so the coordinates are one arbitrary choice among infinitely many, and only readings that survive a rotation, such as a cosine, mean anything.",
                    },
                    {
                      expression: "which sense of a word is meant",
                      reason:
                        "outside what the method represents. One row per spelling, so a word used two ways contributes both sets of company to one row and settles somewhere between them, and there is no second row for the second sense.",
                    },
                  ]}
                />
                <KeepInMind>
                  Two of those lines carry most of the weight. Nearly half the
                  table has no score at all and is filled with a substituted value
                  that the machinery reading it cannot distinguish from a real one,
                  and the score rewards rarity strongly enough that its largest
                  values sit on its thinnest evidence. Everything the method does
                  well, it does in spite of both.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
