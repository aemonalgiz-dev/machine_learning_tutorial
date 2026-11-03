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
import { AssociationGrid } from "@/components/widgets/AssociationGrid";
import { ClippingCensus } from "@/components/widgets/ClippingCensus";
import { MutualInformationPlayground } from "@/components/widgets/MutualInformationPlayground";
import { ReadingComparison } from "@/components/widgets/ReadingComparison";
import { ScoreSpectrum } from "@/components/widgets/ScoreSpectrum";
import { SmoothingTracks } from "@/components/widgets/SmoothingTracks";

export const metadata: Metadata = {
  title: "Pointwise Mutual Information · Perceptron Lab",
  description:
    "Frequent co-occurrence can arise simply because two words are common. Pointwise mutual information compares observed co-occurrence with the level expected under independence, distinguishing frequency from relative association.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function PointwiseMutualInformationPage() {
  return (
    <ConceptPage
      lessonId="pointwise-mutual-information"
      intuition={lessonIntuitions["pointwise-mutual-information"]}
      technicalStart="Part 2. The Score, On One Pair"
      openingTitle="Together More Often Than We Would Expect"
      playgroundTitle="Which word pairs occur more often than chance suggests?"
      playgroundIntro="Compare a pair's observed frequency with its independence baseline. Check how a rare pair can receive a large score despite having little supporting evidence."
      title="Pointwise Mutual Information"
      tagline={"Frequent co-occurrence can arise simply because two words are common. Pointwise mutual information compares observed co-occurrence with the level expected under independence, distinguishing frequency from relative association."}
      prerequisites={
        <>
          Every word here ends up as a short list of numbers, and two words are
          compared by the{" "}
          <Link href="/concepts/a-vector-for-a-word" className={link}>
            cosine
          </Link>{" "}
          {" of their directions. The final dimension-reduction step uses singular-value decomposition, also used by "}{" "}
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

          {" has a negative-sampling objective related to a shifted PMI matrix under the assumptions explained in Part 3."}</>
      }

      playground={<MutualInformationPlayground />}
      sections={[
        {
          title: "Part 1. What A Count Cannot Tell You",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Twenty-four short notes, and two halves that never mix">
                <>
<p>
                  We will measure associations in twenty-four six-word notes, half about cooking and half about sailing. The cooking list is flour, sugar, butter, eggs, oven, bake, stir, whisk, dough and pan. The sailing list is sail, wind, boat, harbour, anchor, tide, mast, rope, deck and crew. These known topic groups give us a reference for interpreting the scores.
                </p>
                <p>
                  The two topic lists do not overlap. Both halves also use and, the and we. In this constructed corpus, those shared words do not identify the topic. That makes them useful for comparing frequent co-occurrence with an association that tells us something about the subject.
                </p>
</>
                <p>The constructed notes contain 144 word occurrences over 23 distinct words. Rotating five of a topic&apos;s ten words through each note makes their contexts deliberately similar. That gives us a known topic distinction to investigate; it does not reproduce all the relationships present in natural writing.</p>
                <p>
                  {"For the hand calculation, use three sentences: the cat sat, the dog sat and the cat ran. Counting adjacent pairs in both directions gives 12 ordered context events over five words. We can reconstruct each count from these sentences."}
                </p>
                <KeepInMind>
                  {"The calculations receive no topic labels. We use the known cooking and sailing groups to inspect within-topic and cross-topic similarities. Those measurements evaluate one property of this constructed representation, rather than its complete quality."}
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Why a count cannot tell a function word from a topic word">
                <p>A context-count row tells us how often other words occur near flour. Raw counts can be dominated by words that are common everywhere. To assess a particular association, we need to compare the observed count with what those overall frequencies would lead us to expect.</p>
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
                  {"Raw counts and relative association answer different questions. Compare both before choosing which one the application needs. On this corpus, normalizing for the marginal frequencies changes the ordering of flour’s context words."}
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Dividing out what frequency alone would predict">
                <p>
                  {"Under an independence baseline, multiply the word and context marginal probabilities to obtain an expected joint probability. Compare the observed joint rate with that baseline. Pointwise mutual information, or PMI, is the logarithm of their ratio. Church and Hanks used this information-theoretic comparison for lexical association in their 1990 paper: frequent words should not receive high association scores merely because they have many opportunities to occur together."}
                </p>
                <p className="text-sm"><Link className="underline underline-offset-4" href="https://aclanthology.org/J90-1003/">{"Church and Hanks: Word Association Norms, Mutual Information, and Lexicography (1990)"}</Link></p>
                <Equation>{"score(w, c) = log( rate of the pair ÷ (rate of w × rate of c) )"}</Equation>
                <>
<p>
                  The rate of the pair is how many times the two were counted together over how many pairings were counted in all; the rate of a word is how much of that same total the word took on its own. The division cancels the part of the count that is explained by either word being common, which is precisely the part that let and tie with dough.
                </p>
                <p>
                  The logarithm is what makes the result a quantity you can add and subtract rather than a ratio you have to multiply, and it puts the value at zero exactly where the ratio is one.
                </p>
</>
                <KeepInMind>
                  Everything else on this page follows from that one line. Part 2
                  works it on a pair small enough to check, Part 3 is about the
                  negative values it produces, Part 4 is about a change to one of
                  the two rates in the denominator, and Part 5 is about what to do
                  with a whole square of these numbers.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. The Score, On One Pair",
          content: (
            <>
              <SubSection title="4. Three sentences, counted by hand">
                <p>

                  The three sentences are the cat sat, the dog sat and the cat
                  ran, and near means the word immediately next door, on either
                  side. From the first sentence, the and cat are neighbors and
                  cat and sat are neighbors. Every pair is counted from both ends,
                  so the row for the records cat and the row for cat records the,
                  and the resulting square is symmetric.
                </p>
                <WorkedExample title="Five words and twelve ordered context events">
                  <>
<p>
                    The row for the reads cat 2 and dog 1. The row for cat reads the 2, sat 1 and ran 1. The row for sat reads cat 1 and dog 1. The row for dog reads the 1 and sat 1, and the row for ran reads cat 1. Adding each row gives 3, 4, 2, 2 and 1, the columns give the same five numbers because the square is symmetric, and everything together adds to 12.
                  </p>
                  <p>

                    Of the 25 cells the five words can form, 10 hold a count and 15 are empty, including all five on the diagonal, since no word here is ever its own neighbor.
                  </p>
</>
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
                  {"Choose the context window and any distance weighting before constructing these counts. To change those choices, recount the text or retain richer positional counts that can be recombined later. The single aggregated table does not retain all that information."}
                </KeepInMind>
              </SubSection>

              <SubSection title="5. Compare one observed word pair with its independence baseline" id="5-one-pair-worked-all-the-way-through">
                <p>
                  {"The ordered event (the,cat) occurs twice among twelve context events. The’s row total is 3 and cat’s column total is 4. Their product of marginal rates gives the independence baseline shown below."}
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
                  {"Exponentiating a natural-log PMI recovers the observed-to-baseline ratio. A score near 0.693 corresponds to twice the independence expectation, and one near 1.099 to three times it. These are empirical association ratios, not evidence that a particular occurrence was caused rather than accidental."}
                </KeepInMind>
              </SubSection>

              <SubSection title="6. What the sign means, and why the zero is exact">
                <p>
                  {"For positive marginal rates, positive PMI means above the independence baseline, negative PMI means below it, and zero means the joint rate equals the product. This is a property of the estimated distribution. It does not establish population independence from a finite sample, and floating-point zero may involve rounding."}
                </p>
                <Equation>{"score > 0  more often than chance      score = 0  exactly chance      score < 0  less often"}</Equation>
                <>
<p>
                  On the twenty-four notes three pairs make the three regions legible. Crew beside deck scores +1.5278, which is the highest score in the corpus, shared with five other pairs of topic words; the two were counted together four times and both are among the words that served as company least. And beside anchor scores +0.0282, which is as close to chance as anything here gets, and it is exactly the reading you would want for a function word against a topic word.
                </p>
                <p>
                  And beside bake scores −0.5108, the lowest in the corpus, which says the two occurred together about three fifths as often as their rates alone would have predicted.
                </p>
</>
                <KeepInMind>
                  {"Interpret the sign against the stated baseline. A value near zero indicates little departure under that estimate; assessing the strength of evidence also requires the counts and sampling conditions."}
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
                <>
<p>
                  {"Among 529 possible ordered word–context pairs, 280 have positive observed counts: 224 score above the independence baseline and 56 below it. The observed range is −0.5108 to 1.5278. That asymmetry describes this corpus; PMI can have very large negative values in other distributions."}
                </p>
                <p>
                  The smallest count a pair can carry and still be on the picture at all is one, so the furthest a score can fall below zero is fixed by how common its two words are, and on a corpus where nothing is very common that is not far. Above zero there is no such squeeze, and two rare words that always occur together can reach a ratio of hundreds.
                </p>
</>
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
                  ran appears once and its only neighbor is cat, so the pair cat
                  and ran attains its ceiling of 1.098612 precisely, and the same
                  ceiling applies to cat and sat, which reaches only 0.405465
                  because sat also stands beside dog.
                </p>
                <WhyThisWorks title="Why the ceiling makes rare words loud">
                  <p>

                    A rare word can receive a very large PMI score from a single co-occurrence because its expected count under independence is so small. A frequent word has a lower ceiling under the corresponding probability constraint. This gives PMI a tendency to favor rare pairs, but it does not guarantee which pair will rank highest in every corpus. We need to inspect the evidence behind a large score.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  {"Different marginals give different upper bounds. The same PMI still represents the same log ratio to independence, but a high score may be supported by very different amounts of data. Interpret the ratio and evidence together instead of treating a different ceiling as a different unit."}
                </KeepInMind>
              </SubSection>

              <SubSection title="9. This score, and the mutual information it is named after">
                <p>
                  Pointwise mutual information assigns a score to one outcome pair. Mutual information averages that score over the joint distribution of two random variables, weighting each pair by its joint probability. Keeping the distinction clear prevents us from treating one large pair score as a summary of the entire relationship.
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
          title: "Questions on Parts 1 and 2",
          quiz: [
            choice(
              "By raw count, flour stood beside and three times and beside dough three times. Why does the score pull the two apart?",
              [
                "Because and served as company 40 times across the corpus where dough served 25, so and had far more chances to fall beside flour",
                "Because and is a function word and the score has a list of them",
                "Because dough is a cooking word and flour is too",
                "Because the three counts were measured at different reaches",
              ],
              0,
              "The score divides the rate of the pair by the product of the two separate rates, which cancels the part of the count explained by either word being common. Flour with dough comes out at +1.0578 against flour with and at +0.5878, and nothing about the counts changed.",
              {"description":"Use these values and conventions.","data":"Pair counts: flour with and = 3; flour with dough = 3\nContext-column totals: and = 40; dough = 25\nThe flour row and total number of pairs are the same in both comparisons."},
            ),
            trueFalse(
              "On the three sentences, 10 of the 25 cells hold a count and all five diagonal cells are empty.",
              true,
              "No word in those three sentences is ever its own neighbor, so the diagonal is empty, and 15 cells in all hold nothing. The row sums are 3, 4, 2, 2 and 1, the column sums are the same five numbers because every pair is counted from both ends, and everything together adds to 12.",
            ),
            choice(
              "A pair scores 0.693147. What does that say about it?",
              [
                "It occurred twice as often as its two separate rates predict",
                "It occurred 0.693147 times more often than chance",
                "It occurred in 69 percent of the windows the two words appeared in",
                "It occurred about seven tenths as often as chance predicts",
              ],
              0,
              "The natural-log score 0.693147 corresponds to an association ratio of about two. For the/cat, the observed count is two while the independence baseline predicts one. Cat/ran has a ratio of about three and score 1.098612. These scores compare observed and baseline rates; they are neither occurrence counts nor probabilities.",
            ),
            trueFalse(
              "The zero of this score is a convention about where the scale was placed.",
              false,
              "Raw PMI has a defined zero: the estimated joint rate matches the product of the estimated marginal rates. Changing the logarithm base changes the scale but preserves that zero. Positive PMI then clips negative scores to zero as a separate operation, so a zero in the clipped table has more than one possible origin.",
            ),
            several(
              "Which choices require rebuilding the context counts in this implementation, rather than changing only later scoring or reduction?",
              [
                "How far near reaches",
                "Whether a word further away counts for less",
                "Whether negative scores are clipped to zero",
                "How many numbers a word is finally described by",
              ],
              [0, 1],
              "Window reach and distance weighting determine which context events enter the stored aggregate counts. This implementation needs the source text again to change those counts. Clipping and retained width operate later and can be changed using the count table. Richer retained statistics could support other recalculations; the limitation here concerns what this table stores.",
            ),
        ],
        },
        {
          title: "Part 3. Throwing Away The Negative Half",
          content: (
            <>
              <SubSection title="10. Why a score below chance is the half you cannot afford">
                <p>
                  {"Church and Hanks discussed why negative association needs substantial evidence: a missing or uncommon pairing is informative only relative to how often both words could have appeared. Positive association can also be unstable when based on a few observations. Compare observed and expected counts before drawing a conclusion from either sign."}
                </p>
                <p>
                  Here the lowest score is −0.5108, and every pair at that score occurred together once. These estimates rely on little evidence. That is a property of this small corpus, however: a pair can occur below its independence expectation even when its observed count is large. We should consider both the observed count and the expected count when interpreting a negative score.
                </p>
                <p>
                  {"A common representation is positive PMI, or PPMI: retain positive values and clip negative ones to zero. That is a further modeling choice, not part of PMI’s definition."}
                </p>
                <Equation>{"kept(w, c) = the larger of  score(w, c)  and  0"}</Equation>
                <KeepInMind>

                  The clip is a judgment about how much a small corpus can
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
                  {"Clipping maps 56 negative scores to zero in this table. That discards their sign and magnitude. Whether the resulting PPMI representation helps the task must be tested; neither corpus size alone nor the word noise proves that every discarded association was unreliable."}
                </KeepInMind>
              </SubSection>

              <SubSection title="12. Two zeros that mean different things">
                <p>
                  {"After clipping, a zero can represent an empirical below-baseline pair, an exactly baseline pair, or an unseen pair assigned zero in PPMI. The clipped matrix alone cannot recover which case produced it. Retaining the counts makes that distinction available."}
                </p>
                <p>A pair observed less often than the independence baseline receives a negative finite PMI. An unobserved pair has zero empirical joint probability, so unsmoothed PMI reaches negative infinity. That does not establish that the words can never occur together. On this corpus of 24 notes, almost half the possible pairs were never observed, including flour and bake within the five-position window. We need the counts and sampling context to judge how much evidence a missing pair provides.</p>
                <InAModel title="The two kinds of zero, counted">
                  <p>
                  {"Of 529 cells, 224 retain positive scores, 56 finite negative scores are clipped, and 249 unobserved pairs receive zero in PPMI. These last two groups are indistinguishable in this matrix alone, even though their empirical counts differ."}
                </p>
                </InAModel>
                <KeepInMind>
                  {"PPMI maps nonpositive PMI values to zero, including the negative-infinity limit for an unseen pair with positive marginals. This loses distinctions the original counts retain. It does not assert that every zero-valued pair is independent."}
                </KeepInMind>
              </SubSection>

              <SubSection title="13. Taking a little more off, and what the emptiness buys">
                <p>
                  {"Subtracting a constant before clipping gives shifted PPMI and can make the matrix sparser. Levy and Goldberg’s 2014 analysis connects SGNS dot-product targets to PMI minus the log number of negative samples when the noise distribution follows the context marginal. Finite-dimensional SGNS is not identical to taking an SVD of this clipped matrix; smoothing the noise distribution changes the relation too."}
                </p>
                <p className="text-sm"><Link className="underline underline-offset-4" href="https://papers.neurips.cc/paper_files/paper/2014/hash/b78666971ceae55a8e87efb7cbfd9ad4-Abstract.html">{"Levy and Goldberg: Neural Word Embedding as Implicit Matrix Factorization (2014)"}</Link></p>
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
                  {"Every tested shift reduces topic separation on this constructed corpus. That result does not establish that the data contain no noise or that every removed association was useful. A shift changes which associations survive and can reduce storage in a sparse implementation. Its value needs evaluation for the corpus and intended comparison."}
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
                  {"A small marginal rate can make a positive observed association score large, but it does not force every pair involving a rare word to have a large score. The joint count still matters. Rare events can produce unstable rate estimates, so one or two co-occurrences may receive a large score without providing strong evidence that the association will persist in new text."}
                </p>
                <p>

                  The published repair is to raise every context count to a power
                  below one before turning the counts into rates. Raising to a
                  power below one pulls large numbers down towards small ones, and
                  after everything is renormalized the rare contexts hold a larger
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
                  {"Flattening raises a rare context’s normalized rate. Since that rate is in the denominator, the adjustment lowers that pair’s score when the other quantities are fixed. Following the formula avoids reversing the effect in a verbal explanation."}
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
                  {"Context smoothing reduces some scores involving rare contexts and increases some involving common contexts. It changes the baseline; it does not directly estimate how trustworthy a pair’s evidence is."}
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
                  {"Levy, Goldberg and Dagan found context-distribution smoothing useful across the evaluations in their 2015 study. On this small constructed corpus, the reported topic-separation measure decreases slightly instead. These are different tasks and data, so inspect the result under its own protocol."}
                </p>
                <p className="text-sm"><Link className="underline underline-offset-4" href="https://aclanthology.org/Q15-1016/">{"Levy, Goldberg and Dagan: Improving Distributional Similarity with Lessons Learned from Word Embeddings (2015)"}</Link></p>
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
                  {"In the third column, cross-topic cosine rises from 0.0016 without context smoothing to 0.0264 at the strongest tested smoothing. On this collection, that setting makes words from the two topics more alike by this measure."}
                </p>
                <p>
                  {"The three shared function words help explain the change. Smoothing reduces their relative context probabilities, raising association scores in those shared columns. Because cooking and sailing rows both use those contexts, increasing their contribution can raise cross-topic similarity. The effect depends on the corpus; it is not a guarantee that context smoothing always reduces useful separation."}
                </p>
                <KeepInMind>
                  {"The tested smoothing settings do not improve this topic-separation measure. That limits the claim we can make for this example; it neither reproduces nor overturns the paper’s broader evaluations. Use development data that reflects the actual application before adopting the setting."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            trueFalse(
              "Subtracting the logarithm of two from every score before the clip leaves 96 entries standing instead of 224, and the two halves of the corpus come apart by 0.5789 instead of 0.6646.",
              true,
              "In this constructed corpus, the tested shifts reduce the topic-separation measure. Subtracting the logarithm of two leaves 96 positive entries and separation 0.5789; a shift of one leaves 64 and 0.4901. A shift larger than every score removes all positive entries. This is evidence about these settings and this task, not proof that small corpora contain no noise or that every discarded association was useful.",
            ),
            choice(
              "Looking only at this experiment’s clipped matrix, what do its zero entries combine?",
              [
                "56 observed below-baseline cells and 249 unseen cells, which the clipped matrix alone cannot distinguish",
                "56 pairs were never seen and 249 scored below chance, and the two are distinguished by the row sums",
                "A cell is zero only when the pair was never seen, so there is no ambiguity",
                "Both groups can be recovered from the counts, which the table keeps alongside the scores",
              ],
              0,
              "An unseen pair and an observed pair below its independence baseline both become zero after clipping. The raw counts distinguish them, but the clipped matrix alone does not. Here 56 observed cells lose their negative scores, with mean −0.2562, while 249 cells were never observed. Retain the counts or another missingness indicator if the later application needs that distinction.",
            ),
            trueFalse(
              "Flattening the context rates lifts the score of a pair whose context is rare.",
              false,
              "It lowers it, and this is the direction that is easy to get backwards. Flattening lifts a rare context’s rate, and the rate sits in the denominator, so the score goes down. Flour and whisk falls from +0.6523 to +0.5933 at the published three quarters while sugar and the rises from +0.4336 to +0.4922, which is the rare context losing and the frequent one gaining.",
            ),
            choice(
              "What does flattening only the context rate do to the table?",
              [
                "It breaks the symmetry, so 88 pairs come out with two different scores depending on which word is read as the context",
                "It leaves the table symmetric, since the counts were made from both ends",
                "It makes the diagonal non-zero",
                "It removes the need to clip, since no score falls below chance",
              ],
              0,
              "The unflattened scores are symmetric here because the counts and the two marginal roles are symmetric. Changing only the context marginal can make the result directional. For and/crew, the two orders become 0.3057 and 0.4232 while the observed pair count stays the same. Directionality comes from the changed baseline, not from a new asymmetry in the raw context events.",
            ),
            choice(
              "The 2015 paper called flattening its most useful adjustment. On the twenty-four notes it makes things slightly worse. What explains that?",
              [
                "The three shared words are the commonest contexts, so lowering their rates raises exactly the part of two rows that makes words of different topics look alike",
                "The corpus has too few words for the three quarters power to be computed accurately",
                "Flattening was applied to the word rate rather than to the context rate",
                "The clip removes every pair the flattening would have helped",
              ],
              0,
              "The shared words are contexts for both topic groups. Flattening raises their contribution in this example, increasing cross-topic similarity from 0.0016 toward 0.0264. The resulting separation change is only 0.0072 on a value around 0.67. This small constructed comparison does not establish how the setting performs on a broader task, and a reported benefit on another evaluation need not hold for every corpus.",
            ),
        ],
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
                  {"Each score row has one coordinate per context word. Such rows can be compared directly, but a large vocabulary makes them wide. Many entries may be zero, so sparse storage is an alternative to reducing dimensions. A direct word pair can be unobserved even when their separate context rows have shared patterns."}
                </p>
                <KeepInMind>
                  {"Dimension reduction changes the comparisons as well as their storage. It can capture shared context patterns while discarding other distinctions. A full-rank representation retains the original matrix geometry; lower rank is useful only when its changes suit the task."}
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Squeezing the table, and the power on the sizes">
                <p>
                  {"Use SVD to express the scored matrix in paired word and context directions with singular values. Keep a selected number of directions, then scale each word coordinate by a chosen power of its singular value. This gives a lower-dimensional representation whose cosine geometry depends on that power."}
                </p>
                <Equation>{"the numbers for word w = (its part of each kept direction) × (that direction’s size)^p"}</Equation>
                <p>
                  {"The four leading singular values are 6.6440,6.1406,2.8430 and2.8325. The exponent p controls their relative contribution. At p=1, word–word dot products reproduce row dot products of the rank-k reconstructed matrix, not its individual word–context entries. Other powers change that geometry. The 2015 study motivates testing such settings; the value used here is a choice for comparison."}
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
                  {"Here p=1 gives greater separation of the constructed topic groups than p=0.5. A setting that performs well on published word-similarity tasks need not maximize this measure. That is a reason to evaluate the choice, not to infer corpus size as the sole cause."}
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
                  {"Flour and bake never occur within the five-position window, but their reduced vectors have cosine near 1. They have strongly aligned context-based representations. This does not mean the algorithm has concluded that they are the same word: their IDs remain distinct and cosine ignores vector length."}
                </p>
                <KeepInMind>
                  {"The reduced representation can connect words through shared context patterns without direct co-occurrence. It may also remove distinctions needed by a later task, so inspect strongly aligned vectors as well as topic separation."}
                </KeepInMind>
              </SubSection>

              <SubSection title="21. Where reading the counts beats scoring them">
                <p>
                  {"Compare raw counts, PPMI rows and reduced PPMI vectors under the same topic measure. An association score can be useful without improving every later similarity statistic."}
                </p>
                <ReadingComparison />
                <>
<p>
                  Compare the first row with the third. Reading a word&rsquo;s raw counts puts two words of one topic at 0.6629 and a word of each at 0.1192, a gap of 0.5438. Scoring those same counts drops the second figure to 0.0292, which is the score doing exactly what it was invented for, since the three shared words are what made the two halves look alike and dividing by their rates removed most of it.
                </p>
                <p>
                  But it drops the first figure as well, from 0.6629 to 0.5228, and the gap narrows to 0.4936. The counts win, at the same width of 23 numbers a word.
                </p>
</>
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
                  {"Ten within-topic pairs have cosine near1 at four dimensions. Their directions become difficult to distinguish under cosine, even when the full score rows differ. This is loss of angular distinction, not proof that the words or complete vectors are identical."}
                </p>
                <p>
                  {"A dense vocabulary-by-vocabulary table stores quadratically many values, and a full dense SVD has cubic-order cost for a square matrix. Sparse storage and truncated solvers can reduce the practical work. Their benefit depends on the nonzero pattern, retained width and algorithm; a sparse representation does not allocate every absent cell."}
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
                  {"The wider fits reconstruct this clipped association matrix more accurately but separate the known topics less clearly by the reported measure. At full width, the reconstruction includes the matrix's substituted zeros as well as its positive scores. A smaller reconstruction error is therefore not automatically a better topic representation. The table shows a task tradeoff; it does not isolate which discarded entries caused the improvement."}
                </p>
                <KeepInMind>
                  {"Choose the width using evidence relevant to the intended task. Known topic labels provide one development criterion here. Other applications may use judged similarities or downstream results; raw corpora do not always lack such evaluation data."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Zero Counts and Scores Supported by Very Little Evidence", id: "part-6-where-the-score-stops-being-defined",
          content: (
            <>
              <SubSection title="23. A pair that never occurred has no logarithm">
                <p>
                  {"With positive marginals and zero joint probability, ordinary real-valued PMI is not finite; its extended limit is negative infinity. That is meaningful as an empirical distribution statement, but a finite vector representation needs a policy such as clipping or smoothing. It does not prove that the pair is impossible in future text."}
                </p>
                <>
<p>
                  {"PPMI clips that negative-infinity limit to zero along with all other nonpositive values. The resulting zero is a clipped value, not a declaration of independence. GloVe instead fits an objective over observed positive-count pairs; its learned factors can still supply comparisons involving pairs absent from that objective."}
                </p>
                <p>
                  Add a small count to every cell before dividing, which makes every score defined and makes the rarest pairs the ones the added count moves most.
                </p>
</>
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
                  {"A high score supported by one event may be unstable, but it is not necessarily an accident or unwanted. Minimum-count filters and context smoothing change how rare observations affect the representation. Check whether they improve the task, and report which rare words or associations they remove."}
                </p>
              </SubSection>

              <SubSection title="25. Zero Counts and Associations Built on Very Little Evidence" id="25-where-the-method-stops-being-defined">
                <p>The logarithmic comparison needs nonzero probabilities. An unseen pair and a word with no count therefore require a stated treatment before the score can be interpreted.</p>
                <DerivationTable
                  expressionHeading="Pair count or clipped value"
                  reasonHeading="What the association score means"
                  rows={[{"expression":"a pair that never occurred together","reason":"With positive marginals, zero empirical joint probability has PMI limit−infinity. PPMI maps it to zero; count smoothing gives a different finite estimate. Here249 of529 cells are unobserved."},{"expression":"a pair scoring below chance","reason":"A below-baseline pair has negative finite PMI. It can be strongly negative or supported by many observations; this corpus’s56 such entries average−0.2562."},{"expression":"a zero in the table after the clip","reason":"A clipped zero can come from an unseen, below-baseline or exactly-baseline pair. The clipped matrix alone loses the distinction; retained counts can recover its provenance."},{"expression":"a word that occurs once in the whole corpus","reason":"One co-occurrence can give a high score relative to a small independence expectation. The context marginal also bounds it, so not every pair involving a singleton reaches the global maximum."},{"expression":"a word that occurs everywhere","reason":"A large marginal lowers the positive ceiling but does not prevent negative PMI. Occurring in every document is also different from having probability1 among ordered context events."},{"expression":"comparing two scores from words of different frequencies","reason":"All unsmoothed PMI scores use the same log-ratio scale. Their ceilings and sample support differ, so equal values need not have equal reliability."},{"expression":"a word absent from the corpus","reason":"The fitted vocabulary provides no row for an absent word. Rejecting it or supplying a documented fallback is an interface choice; the corpus supplies no measured association for it."},{"expression":"which of the two words stood first","reason":"outside what the table represents. Each pair is counted from both ends, so the counts cannot tell the cat sat from sat the cat. Order is discarded when the corpus is counted rather than when it is scored."},{"expression":"the two directions of one pair, once the contexts are flattened","reason":"no longer one number. Only the context rate is adjusted, so the score of a word given a context and the score of the context given the word come apart, here for 88 pairs, the widest by 0.1175. Reading the rows and reading the columns are then two different descriptions and the definition prefers neither."},{"expression":"how far near reaches, and what a distant neighbor is worth","reason":"a real choice made before any score exists and unrevisable afterwards. It decides which cells have a score at all, since a reach of one leaves 112 entries here and separates the halves by 0.4238, five leaves 224 and 0.6646, and beyond five nothing changes, because five positions already reach every word of a six-word note."},{"expression":"how much to subtract before the clip","reason":"a real choice about how sparse the result should be, with nothing inside the calculation to settle it. Every value tried made this corpus worse, from 0.6646 at nothing down to 0.4901 at one; past 1.6094 the table is empty, every word points nowhere, and the angle between two words is undefined rather than large."},{"expression":"how many numbers to give a word","reason":"Rank changes reconstruction and topic separation differently in this experiment. It does not isolate which individual removed entries caused the improvement; evaluate a width against the intended task."},{"expression":"the individual numbers a word ends up with","reason":"Coordinates are defined within a chosen basis. Pairwise cosines survive a shared orthogonal rotation, so a coordinate’s interpretation needs a basis convention and supporting evidence."},{"expression":"which sense of a word is meant","reason":"One static row combines a spelling’s contexts. It does not choose a separate sense for each occurrence, and it need not be a geometric midpoint between sense groups."}]}
                />
                <KeepInMind>
                  {"The empirical counts, clipping and representation choices all affect the result. Keep enough provenance to distinguish a strong association from a high score with little support, then evaluate whether the resulting comparisons answer the intended question."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 and 6",
          quiz: [
            choice(
              "Flour and bake never once fell within five positions of each other, and four numbers a word place them at a cosine of 1.0000. How does the page read that?",
              [
                "As the squeeze earning its keep and overreaching in the same measurement",
                "As proof that the corpus was arranged badly",
                "As evidence that four numbers a word is too wide",
                "As a bug, since an unobserved pair should stay at zero",
              ],
              0,
              "The full score rows have cosine 0.5356, but their four-coordinate projections have cosine one. The reduction removed directions that distinguished their contexts. A cosine of one means their retained vectors point in the same direction; it does not prove the words have identical meanings or that their magnitudes are equal. Inspect what lower rank discarded before treating the resulting neighbors as interchangeable.",
            ),
            trueFalse(
              "At a width of 23 numbers a word, scoring the counts separates the two halves of the corpus better than reading the raw counts does.",
              false,
              "At full width, the raw counts give topic gap 0.5438, compared with 0.4936 for the scored table. Both within-topic and cross-topic means change, so lowering cross-topic similarity alone does not settle the comparison. The four-coordinate scored representation instead reaches 0.6646. Scoring and reducing width have different effects and should be compared through the stated task measure.",
            ),
            choice(
              "Reconstruction error against half-separation, read together across widths. What do the two columns say?",
              [
                "A wider fit reproduces the table more faithfully and separates the two halves less well",
                "A wider fit improves both, so only the cost of computing it argues for a narrow one",
                "The two columns move together, since reproducing the table is the goal",
                "Both turn over at the width that works, which is how the width was chosen",
              ],
              0,
              "The relative reconstruction errors decrease from 0.6579 at width two to 0.5668 at four and 0.4542 at eight, reaching zero at full width. The topic-separation measure does not follow that ordering. Reconstructing the supplied PPMI table and preserving useful topic distinctions are different objectives. Choose width using the intended comparisons and held-out evidence, rather than assume that lower matrix error guarantees a better representation.",
            ),
            several(
              "Which approaches does the lesson discuss for handling an unobserved pair in a finite table or observed-pair fitting objective?",
              [
                "Substitute a PMI target of zero, which is the independence baseline rather than evidence supplied by an unobserved pair",
                "Leave the cell out, which is what GloVe does",
                "Add a small count to every cell before dividing",
                "Take the lowest score in the table and use that"
              ],
              [0, 1, 2],
              "A zero joint count makes the ordinary real-valued logarithm unavailable. The three approaches discussed here substitute a zero target, omit the pair from an observed-pair objective, or add pseudocounts before scoring. Choosing another finite floor would be an additional policy requiring justification, rather than a mathematical impossibility. Clipping negative finite PMI to zero is separate from assuming an unseen pair is independent.",
              {
                "description": "We are discussing design choices for a finite table or an observed-pair fitting objective when a co-occurrence count is zero. No smoothing has yet been applied. “Leave out” means omit that pair from the fitting objective rather than provide it with a numerical target."
              },
            ),
            trueFalse(
              "Stir and whisk were counted together four times and score higher than eggs and oven, which were counted together six times.",
              true,
              "The scores are 1.5278 for stir/whisk and 1.2603 for eggs/oven. PMI compares each joint rate with both marginal rates, so a larger pair count need not have the larger association ratio. Rare observed pairs can receive high scores despite little supporting evidence. Frequency thresholds and context smoothing change that behavior, but neither makes PMI itself a confidence measurement.",
            ),
        ],
        },
        {
          title: "Practice. Scoring The Notes With The Library",
          practice: [
            exercise(
              "Score the and cat on the three sentences",
              [
  "Fit the supplied three-sentence corpus with context window one and context-distribution exponent one, leaving rates unflattened.",
  "Print total context-pair count, the/cat count and PMI scores for the/cat, cat/ran and cat/sat to six decimals. Use the actual count table, including directional pair conventions."
],
              `from oop_ml import PointwiseMutualInformationEmbeddings

sentences = ["the cat sat", "the dog sat", "the cat ran"]

model = PointwiseMutualInformationEmbeddings(
    dimension=2, window=1, context_distribution_smoothing=1.0
).fit(sentences)
counts = model.cooccurrence
scores = model.pointwise_mutual_information
# Print the total of counted neighbourings, how many times the stood
# beside cat, and the scores for the and cat, cat and ran, and cat and sat.`,
              `from oop_ml import PointwiseMutualInformationEmbeddings

sentences = ["the cat sat", "the dog sat", "the cat ran"]

model = PointwiseMutualInformationEmbeddings(
    dimension=2, window=1, context_distribution_smoothing=1.0
).fit(sentences)
counts = model.cooccurrence
scores = model.pointwise_mutual_information

print(f"counted neighbourings {counts.total:.0f}")
print(f"the beside cat, counted {counts.count_between('the', 'cat'):.0f} times")
print(f"score for the and cat {scores.value_between('the', 'cat'):.6f}")
print(f"score for cat and ran {scores.value_between('cat', 'ran'):.6f}")
print(f"score for cat and sat {scores.value_between('cat', 'sat'):.6f}")`,
              `counted neighbourings 12
the beside cat, counted 2 times
score for the and cat 0.693147
score for cat and ran 1.098612
score for cat and sat 0.405465`,
              { hints: [
  "Read cooccurrence counts and scored entries separately.",
  "The PMI comparison uses joint frequency relative to the two marginal frequencies, not the raw pair count alone."
], check: numberCheck("What does the pair cat and sat score?", 0.405465, 5e-06, "Cat/sat scores 0.405465. PMI compares the observed pairing with the pairing expected from separate word/context rates, rather than ranking raw counts alone."), question: "Which word pairs occur more often than their separate frequencies would suggest?" },
            ),
            exercise(
              "Count what the clip throws away",
              [
  "Fit the supplied twenty-four notes at window five with context rates unflattened.",
  "Print vocabulary size, total matrix cells, positive scored cells, unseen count cells and seen pairs clipped to zero. Then show and/bake’s observed count beside its retained score."
],
              `from oop_ml import PointwiseMutualInformationEmbeddings

notes = [
    "flour sugar and butter eggs oven", "sugar butter eggs the oven bake",
    "we butter eggs oven bake stir", "eggs oven and bake stir whisk",
    "oven bake stir the whisk dough", "we bake stir whisk dough pan",
    "stir whisk and dough pan flour", "whisk dough pan the flour sugar",
    "we dough pan flour sugar butter", "pan flour and sugar butter eggs",
    "flour sugar butter the eggs oven", "we sugar butter eggs oven bake",
    "sail wind and boat harbour anchor", "wind boat harbour the anchor tide",
    "we boat harbour anchor tide mast", "harbour anchor and tide mast rope",
    "anchor tide mast the rope deck", "we tide mast rope deck crew",
    "mast rope and deck crew sail", "rope deck crew the sail wind",
    "we deck crew sail wind boat", "crew sail and wind boat harbour",
    "sail wind boat the harbour anchor", "we wind boat harbour anchor tide",
]

model = PointwiseMutualInformationEmbeddings(
    dimension=4, window=5, context_distribution_smoothing=1.0
).fit(notes)
counts = model.cooccurrence
scores = model.pointwise_mutual_information
words = list(counts.vocabulary)
# Print how many words and cells there are, how many entries kept a positive
# score, how many pairs were never seen together, how many scored below
# chance, and the count and the kept score for and beside bake.`,
              `from oop_ml import PointwiseMutualInformationEmbeddings

notes = [
    "flour sugar and butter eggs oven", "sugar butter eggs the oven bake",
    "we butter eggs oven bake stir", "eggs oven and bake stir whisk",
    "oven bake stir the whisk dough", "we bake stir whisk dough pan",
    "stir whisk and dough pan flour", "whisk dough pan the flour sugar",
    "we dough pan flour sugar butter", "pan flour and sugar butter eggs",
    "flour sugar butter the eggs oven", "we sugar butter eggs oven bake",
    "sail wind and boat harbour anchor", "wind boat harbour the anchor tide",
    "we boat harbour anchor tide mast", "harbour anchor and tide mast rope",
    "anchor tide mast the rope deck", "we tide mast rope deck crew",
    "mast rope and deck crew sail", "rope deck crew the sail wind",
    "we deck crew sail wind boat", "crew sail and wind boat harbour",
    "sail wind boat the harbour anchor", "we wind boat harbour anchor tide",
]

model = PointwiseMutualInformationEmbeddings(
    dimension=4, window=5, context_distribution_smoothing=1.0
).fit(notes)
counts = model.cooccurrence
scores = model.pointwise_mutual_information
words = list(counts.vocabulary)
cells = len(words) ** 2
never_seen = sum(
    1 for word in words for context in words if counts.count_between(word, context) == 0
)

print(f"{len(words)} words, {cells} cells")
print(f"kept a positive score {scores.n_positive}")
print(f"never seen together {never_seen}")
print(f"below chance, set to zero {cells - scores.n_positive - never_seen}")
print(f"and beside bake, counted {counts.count_between('and', 'bake'):.0f}, kept {scores.value_between('and', 'bake'):.4f}")`,
              `23 words, 529 cells
kept a positive score 224
never seen together 249
below chance, set to zero 56
and beside bake, counted 1, kept 0.0000`,
              { hints: [
  "The positive clipping merges several causes into the same zero score. Consult the raw count matrix to distinguish them.",
  "Separate unseen cells first, then account for observed cells that did not keep a positive score."
], check: numberCheck("How many pairs scored below chance and were set to zero?", 56, 0.5, "Fifty-six observed cells are clipped to zero. The scored table alone cannot distinguish those below-chance observations from unseen pairs."), question: "Can a zero PPMI score distinguish an unseen pair from a below-chance pair?" },
            ),
            exercise(
              "Flatten the context rates and watch the direction",
              [
  "Fit the notes with context exponents one and 0.75. Print flour/whisk and sugar/the scores for both.",
  "Then print and/crew and crew/and under both fits. Keep target/context order explicit: changing context frequencies can make the smoothed score directional even when raw neighboring counts are symmetric."
],
              `from oop_ml import PointwiseMutualInformationEmbeddings

notes = [
    "flour sugar and butter eggs oven", "sugar butter eggs the oven bake",
    "we butter eggs oven bake stir", "eggs oven and bake stir whisk",
    "oven bake stir the whisk dough", "we bake stir whisk dough pan",
    "stir whisk and dough pan flour", "whisk dough pan the flour sugar",
    "we dough pan flour sugar butter", "pan flour and sugar butter eggs",
    "flour sugar butter the eggs oven", "we sugar butter eggs oven bake",
    "sail wind and boat harbour anchor", "wind boat harbour the anchor tide",
    "we boat harbour anchor tide mast", "harbour anchor and tide mast rope",
    "anchor tide mast the rope deck", "we tide mast rope deck crew",
    "mast rope and deck crew sail", "rope deck crew the sail wind",
    "we deck crew sail wind boat", "crew sail and wind boat harbour",
    "sail wind boat the harbour anchor", "we wind boat harbour anchor tide",
]

plain = PointwiseMutualInformationEmbeddings(
    dimension=4, window=5, context_distribution_smoothing=1.0
).fit(notes).pointwise_mutual_information
# Fit a second model at the published three quarters and keep its scored
# table. Print flour beside whisk and sugar beside the under both, then
# and beside crew in both directions under the flattened fit and under
# the plain one.`,
              `from oop_ml import PointwiseMutualInformationEmbeddings

notes = [
    "flour sugar and butter eggs oven", "sugar butter eggs the oven bake",
    "we butter eggs oven bake stir", "eggs oven and bake stir whisk",
    "oven bake stir the whisk dough", "we bake stir whisk dough pan",
    "stir whisk and dough pan flour", "whisk dough pan the flour sugar",
    "we dough pan flour sugar butter", "pan flour and sugar butter eggs",
    "flour sugar butter the eggs oven", "we sugar butter eggs oven bake",
    "sail wind and boat harbour anchor", "wind boat harbour the anchor tide",
    "we boat harbour anchor tide mast", "harbour anchor and tide mast rope",
    "anchor tide mast the rope deck", "we tide mast rope deck crew",
    "mast rope and deck crew sail", "rope deck crew the sail wind",
    "we deck crew sail wind boat", "crew sail and wind boat harbour",
    "sail wind boat the harbour anchor", "we wind boat harbour anchor tide",
]

plain = PointwiseMutualInformationEmbeddings(
    dimension=4, window=5, context_distribution_smoothing=1.0
).fit(notes).pointwise_mutual_information
flattened = PointwiseMutualInformationEmbeddings(
    dimension=4, window=5, context_distribution_smoothing=0.75
).fit(notes).pointwise_mutual_information

for word, context in (("flour", "whisk"), ("sugar", "the")):
    before = plain.value_between(word, context)
    after = flattened.value_between(word, context)
    print(f"{word} beside {context}: {before:+.4f} unflattened, {after:+.4f} at three quarters")

print(f"flattened, and beside crew {flattened.value_between('and', 'crew'):.4f}")
print(f"flattened, crew beside and {flattened.value_between('crew', 'and'):.4f}")
print(f"unflattened, and beside crew {plain.value_between('and', 'crew'):.4f}")
print(f"unflattened, crew beside and {plain.value_between('crew', 'and'):.4f}")`,
              `flour beside whisk: +0.6523 unflattened, +0.5933 at three quarters
sugar beside the: +0.4336 unflattened, +0.4922 at three quarters
flattened, and beside crew 0.3057
flattened, crew beside and 0.4232
unflattened, and beside crew 0.3646
unflattened, crew beside and 0.3646`,
              { hints: [
  "An exponent below one changes the normalized context baseline in the denominator.",
  "Read both argument orders rather than assuming a matrix remains symmetric after smoothing."
], check: numberCheck("What is the flour/whisk score with context_distribution_smoothing set to 0.75?", 0.5933, 5e-05, "The smoothed score is 0.5933. Flattening the context baseline changes the denominator, so a rare context can lower a pair’s score rather than automatically boost it."), question: "How does smoothing context frequencies change pair scores and direction?" },
            ),
            exercise(
              "Squeeze the table to four numbers a word",
              [
  "Fit the supplied notes at the stated four-dimensional PPMI settings. Print the four retained sizes, flour’s five nearest words and the specified flour/bake and flour/anchor cosines.",
  "Compare within-topic and cross-topic mean cosines and their gap at singular-value powers 0.5 and 1.0. Keep corpus, word groups and context settings fixed."
],
              `from statistics import mean

from oop_ml import PointwiseMutualInformationEmbeddings

notes = [
    "flour sugar and butter eggs oven", "sugar butter eggs the oven bake",
    "we butter eggs oven bake stir", "eggs oven and bake stir whisk",
    "oven bake stir the whisk dough", "we bake stir whisk dough pan",
    "stir whisk and dough pan flour", "whisk dough pan the flour sugar",
    "we dough pan flour sugar butter", "pan flour and sugar butter eggs",
    "flour sugar butter the eggs oven", "we sugar butter eggs oven bake",
    "sail wind and boat harbour anchor", "wind boat harbour the anchor tide",
    "we boat harbour anchor tide mast", "harbour anchor and tide mast rope",
    "anchor tide mast the rope deck", "we tide mast rope deck crew",
    "mast rope and deck crew sail", "rope deck crew the sail wind",
    "we deck crew sail wind boat", "crew sail and wind boat harbour",
    "sail wind boat the harbour anchor", "we wind boat harbour anchor tide",
]
cooking = ["flour", "sugar", "butter", "eggs", "oven", "bake", "stir", "whisk", "dough", "pan"]
sailing = ["sail", "wind", "boat", "harbour", "anchor", "tide", "mast", "rope", "deck", "crew"]

model = PointwiseMutualInformationEmbeddings(dimension=4, window=5).fit(notes)
# Print the four sizes, the five nearest words to flour, and the cosines
# between flour and bake and between flour and anchor. Then, for a power
# of 0.5 and of 1.0, fit the notes and print the mean cosine between two
# words of one topic, between a word of each topic, and the gap.`,
              `from statistics import mean

from oop_ml import PointwiseMutualInformationEmbeddings

notes = [
    "flour sugar and butter eggs oven", "sugar butter eggs the oven bake",
    "we butter eggs oven bake stir", "eggs oven and bake stir whisk",
    "oven bake stir the whisk dough", "we bake stir whisk dough pan",
    "stir whisk and dough pan flour", "whisk dough pan the flour sugar",
    "we dough pan flour sugar butter", "pan flour and sugar butter eggs",
    "flour sugar butter the eggs oven", "we sugar butter eggs oven bake",
    "sail wind and boat harbour anchor", "wind boat harbour the anchor tide",
    "we boat harbour anchor tide mast", "harbour anchor and tide mast rope",
    "anchor tide mast the rope deck", "we tide mast rope deck crew",
    "mast rope and deck crew sail", "rope deck crew the sail wind",
    "we deck crew sail wind boat", "crew sail and wind boat harbour",
    "sail wind boat the harbour anchor", "we wind boat harbour anchor tide",
]
cooking = ["flour", "sugar", "butter", "eggs", "oven", "bake", "stir", "whisk", "dough", "pan"]
sailing = ["sail", "wind", "boat", "harbour", "anchor", "tide", "mast", "rope", "deck", "crew"]

model = PointwiseMutualInformationEmbeddings(dimension=4, window=5).fit(notes)
print(f"sizes {' '.join(f'{size:.4f}' for size in model.singular_values)}")
print(f"nearest to flour {' '.join(model.most_similar('flour', 5).words)}")
print(f"flour and bake {model.similarity('flour', 'bake'):.4f}")
print(f"flour and anchor {model.similarity('flour', 'anchor'):.4f}")

for power in (0.5, 1.0):
    fitted = PointwiseMutualInformationEmbeddings(
        dimension=4, window=5, singular_value_exponent=power
    ).fit(notes)
    within = mean(
        fitted.similarity(first, second)
        for group in (cooking, sailing)
        for position, first in enumerate(group)
        for second in group[position + 1 :]
    )
    across = mean(fitted.similarity(first, second) for first in cooking for second in sailing)
    print(f"power {power}: within {within:.4f}, across {across:.4f}, gap {within - across:.4f}")`,
              `sizes 6.6440 6.1406 2.8430 2.8325
nearest to flour bake sugar oven eggs butter
flour and bake 1.0000
flour and anchor 0.0081
power 0.5: within 0.6732, across 0.0086, gap 0.6646
power 1.0: within 0.8191, across 0.0428, gap 0.7762`,
              { hints: [
  "The factorization’s scaling power changes the representation, not the underlying pair counts.",
  "Exclude shared words from the supplied topic groups when reproducing their pair means."
], check: numberCheck("What is the gap between the two means at a power of one?", 0.7762, 0.0001, "The mean-similarity gap is 0.7762 at power one. The scaling of retained directions changes these vector comparisons even though the underlying context counts stay fixed."), question: "What relationship survives a four-dimensional factorization of the scored table?" },
            ),
          ],
        },
      ]}
    />
  );
}
