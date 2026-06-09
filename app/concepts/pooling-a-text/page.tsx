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
import { BothSubjectsAtOnce } from "@/components/widgets/BothSubjectsAtOnce";
import { CompanyShift } from "@/components/widgets/CompanyShift";
import { ContributionBars } from "@/components/widgets/ContributionBars";
import { OrderBlindPair } from "@/components/widgets/OrderBlindPair";
import { PoolingWorkbench } from "@/components/widgets/PoolingWorkbench";
import { SeparationLadder } from "@/components/widgets/SeparationLadder";
import { SharedDirectionProbe } from "@/components/widgets/SharedDirectionProbe";

export const metadata: Metadata = {
  title: "Pooling a Text · oop_ml",
  description:
    "Turn a whole text into one position by combining the positions of its words, and measure what each way of combining them keeps and throws away.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function PoolingATextPage() {
  return (
    <ConceptPage
      title="Pooling a Text"
      tagline="Pooling turns a whole text into one position by combining the positions of its words, and the three ways of doing it here differ only in how much each word is allowed to count."
      prerequisites={
        <>
          Everything here starts from a table that has already given every word a
          position, which is what the page on{" "}
          <Link href="/concepts/a-vector-for-a-word" className={link}>
            a vector for a word
          </Link>{" "}
          builds and where the angle between two positions is defined. The
          positions used below were found by{" "}
          <Link href="/concepts/pointwise-mutual-information" className={link}>
            counting which words keep company
          </Link>
          , though nothing on this page depends on that, and a table from{" "}
          <Link href="/concepts/word2vec" className={link}>
            word2vec
          </Link>{" "}
          would do as well. The last repair takes a leading direction out of
          every vector, and that direction is found by the same decomposition{" "}
          <Link href="/concepts/pca" className={link}>
            principal component analysis
          </Link>{" "}
          performs, with one step deliberately left out, which Part 5 measures
          rather than asserts.
        </>
      }
      history={
        <>
          <p>
            The counting half of this page is older than the averaging half by
            forty years, and it starts with a cataloguing problem rather than a
            computing one. Karen Sp&auml;rck Jones, at the Cambridge Language
            Research Unit, was working on which words a retrieval system should
            index on, and in &ldquo;A statistical interpretation of term
            specificity and its application in retrieval&rdquo; in 1972 she
            argued that a term&rsquo;s value falls with the number of documents
            that hold it, so that a word appearing in every document in the
            collection distinguishes none of them and should count for nothing.
            Gerard Salton&rsquo;s group at Cornell already had documents written
            as vectors over a vocabulary and compared by the cosine of the angle
            between them, and her measure is what those vectors were missing.
            The same weighting appears twice below, once on counts and once
            inside an average of positions, which is one small piece of evidence
            that the two halves of the page are answering one question.
          </p>
          <p>
            Once a word had a position rather than a column, how to combine
            several of them was genuinely open, and Jeff Mitchell and Mirella
            Lapata, at the University of Edinburgh, put the question directly in
            &ldquo;Vector-based models of semantic composition&rdquo; in 2008.
            They compared adding the words&rsquo; vectors against multiplying
            them coordinate by coordinate, scored both against people&rsquo;s
            judgements of how alike two short phrases were, and found the
            multiplicative form ahead on their task. What the paper settled for
            the field was smaller and more useful than which form won, which is
            that composition is a modelling choice with alternatives that can be
            measured against each other, rather than something a vector space
            comes with. Adding, divided by the number of words, is the plain
            average this page starts from.
          </p>
          <p>
            Sanjeev Arora, Yingyu Liang and Tengyu Ma, at Princeton, published
            &ldquo;A Simple but Tough-to-Beat Baseline for Sentence
            Embeddings&rdquo; in 2017, and its two changes to that average are
            the last two sections of Part 4 and the whole of Part 5. Each word is
            weighted by a small constant divided by that constant plus how
            probable the word is, and then the leading direction of the
            collection&rsquo;s own sentence vectors is subtracted from every one
            of them. The title is the claim, since what they reported was that
            this beat trained recurrent networks on the standard sentence
            similarity benchmarks, and a method with no parameters to fit beating
            one with millions was the result worth publishing. The six questions
            this page works through, in order, are these. Why does a model that
            reads a text need one position rather than a list of them? What can
            counting the words give us, and what can it never see? What does
            averaging the positions buy instead, and what does the average get
            wrong? How much of that does weighting a word by how rare it is
            repair? What is the one direction every text of a collection shares,
            and what turns out to be in it? And what do all of these throw away
            that no weighting puts back?
          </p>
        </>
      }
      playground={<PoolingWorkbench />}
      sections={[
        {
          title: "Part 1. One Position For A Whole Text",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. Why a model needs one position and not a list of them">
                <p>
                  Suppose every word already has a position, so that a text of
                  eight words is eight positions, and suppose we want to ask
                  whether two texts are about the same thing. Nothing about eight
                  positions answers that. We could compare them word against
                  word, but the two texts will not be the same length, and even
                  where they are, the third word of one has no reason to line up
                  with the third word of the other. Anything downstream that
                  reads a fixed number of inputs, which is most things, cannot
                  take a text at all until the text has been reduced to a fixed
                  number of them.
                </p>
                <p>
                  The obvious answer is to lay the positions end to end. Each
                  position here is four numbers, so an eight-word text becomes
                  thirty-two of them and a three-word text becomes twelve, and
                  the two cannot be handed to the same reader. Padding the short
                  one out to the length of the long one buys a fixed width and
                  loses the meaning, because the fourth word of one text now
                  shares a slot with the fourth word of the other and there is no
                  sense in which they belong together. Pooling is the other
                  answer. Combine the positions into one position of the same
                  width, so that a text of three words and a text of thirty both
                  come back as four numbers, and let the combining rule decide
                  what survives.
                </p>
                <Equation>
                  {"one text  ↦  one position of a fixed width"}
                </Equation>
                <KeepInMind>
                  The width of a pooled position is fixed by the word positions
                  it is built from and not by the text, so it is the same four
                  numbers whether the text was three words or three hundred. That
                  is the whole reason to pool, and everything the rest of the page
                  measures is what the fixed width costs.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. The collection everything here is pooled from">
                <p>
                  A word&rsquo;s position is learned from usage, so nothing here
                  can be shown on a single sentence, and every number on this page
                  comes from one of two collections. The larger is twenty-four
                  documents of six words each, twelve about cooking and twelve
                  about sailing, written from ten cooking words and ten sailing
                  words with no content word appearing in both halves. Every
                  document also carries exactly one of three words that carry no
                  subject at all, and, the and we. Twenty-three words in all, and
                  each of them has a position of four numbers, found by counting
                  which words keep company with which inside a short window.
                </p>
                <p>
                  The smaller collection is six documents of four words each,
                  built on a table of seven positions written down by hand rather
                  than fitted. Three of its words point along the first axis and
                  three along the second, so it has two subjects the way the
                  larger one does, and the seventh word, the, points along a third
                  axis and is twice as long as any of the others. It is here
                  because every number that comes out of it can be checked with a
                  pencil, and because it is arranged so that the failure Part 3
                  is about is visible in a single document.
                </p>
                <KeepInMind>
                  Nobody tells any rule below which half a document belongs to.
                  The two numbers this page keeps reporting, how alike two
                  documents of one half come out and how alike a document of each
                  come out, are the whole score.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Three texts that share nothing but the words carrying no subject">
                <p>
                  Three texts run through the page from here on. Two of them are
                  about sailing and one is about cooking, and they were written so
                  that no two of them share a word that carries a subject. What
                  all three do share is and, the and we, in the same numbers, and
                  that is deliberate, because it is the case where a rule that
                  reads only which words a text used has nothing at all to go on.
                </p>
                <NumberTable
                  headings={["text", "about", "words carrying a subject"]}
                  rows={[
                    [
                      "the crew and the boat and we sail",
                      "sailing",
                      "crew, boat, sail",
                    ],
                    [
                      "the flour and the dough and we bake",
                      "cooking",
                      "flour, dough, bake",
                    ],
                    [
                      "the wind and the tide and we anchor",
                      "sailing",
                      "wind, tide, anchor",
                    ],
                  ]}
                  caption="Eight words each, five of them carrying no subject and three of them carrying one. The first and third are about the same thing and have no word of substance in common."
                />
                <p>
                  A reader can try any of this on any text through the panel at
                  the top of the page, which is the same calculation the sections
                  below quote from. The rule to watch is whether the first and
                  third come out nearer to each other than either does to the
                  second, since that is the one fact about them nothing was told.
                </p>
                <KeepInMind>
                  These three texts are the hardest case for counting and an easy
                  one for averaging, which is exactly why they are the running
                  example. A pair of texts that happened to share vocabulary would
                  let counting off.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 2. Counting, Which Needs No Positions At All",
          content: (
            <>
              <SubSection title="4. A text as the words it uses, counted">
                <p>
                  There is an answer to the whole problem that never asks what a
                  word means. Give every word of the vocabulary a slot, and let a
                  text be how many times it used each of them. Order is gone
                  immediately, since a count says nothing about where the word
                  was, and what is left is a fixed-width position after all,
                  because the vocabulary is fixed even though the texts are not.
                  This is the bag of words, and it is the baseline every method
                  below has to beat.
                </p>
                <Equation>
                  {"count(text)₁ , count(text)₂ , … , count(text)ₘ"}
                </Equation>
                <p>
                  Two texts are then compared by the angle between their count
                  vectors. The length of a count vector grows with every word
                  counted, so a long text is a long vector whatever it is about,
                  and dividing each vector by its own length puts every text on
                  the same sphere before any comparison happens. After that the
                  angle and the distance agree, and length has stopped carrying
                  anything.
                </p>
                <KeepInMind>
                  A counted text is as wide as the vocabulary and almost all zero,
                  which is the shape of the answer rather than an accident. Two
                  texts are near each other exactly when they used the same words
                  in the same proportions, and no other kind of nearness is
                  available to this rule.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. Three documents small enough to check with a pencil">
                <p>
                  Take the cat sat, the dog sat and a cat as a collection of
                  three. Counting occurrences, cat, sat and the appear twice each
                  and a and dog once, so with ties broken alphabetically the slots
                  run cat, sat, the, a, dog. Under plain counts the second
                  document is one in the slot for sat, one for the and one for
                  dog, and zero elsewhere.
                </p>
                <WorkedExample title="Counting three documents">
                  <p>
                    Each of cat, sat and the is used by two of the three
                    documents, and each of a and dog by one, so the rarity
                    weights follow from the counts alone. The smoothed form adds
                    one to both the collection size and the document count before
                    the logarithm, and adds one to the result, so a word used by
                    every document weighs exactly one rather than nothing.
                  </p>
                  <Equation>
                    {"idf(w)  =  log( (1 + N) / (1 + documents holding w) )  +  1"}
                  </Equation>
                  <p>
                    With three documents that gives log(4 / 3) + 1 = 1.2877 for
                    cat, sat and the, and log(4 / 2) + 1 = 1.6931 for a and dog.
                    So the dog sat, which is the vector (0, 1, 1, 0, 1) under
                    counts, becomes (0, 1.2877, 1.2877, 0, 1.6931) under the
                    weighting, and dog, being the rarer word, now counts a third
                    more than either of the others.
                  </p>
                </WorkedExample>
                <p>
                  The last thing this small collection shows is what happens to a
                  word it has never seen. The text the zebra sat comes back as (0,
                  1.2877, 1.2877, 0, 0), with zebra contributing nothing at all,
                  because a word with no slot has nowhere to put anything. That is
                  not a refusal and it is not an approximation. It is the rule
                  being honest that it has never met the word.
                </p>
                <KeepInMind>
                  The weights are learned from the collection and then applied
                  unchanged. A text handed to a fitted rule is never allowed to
                  re-estimate how rare its own words are, which would let a
                  held-out text leak into its own description.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Weighting a count by how rare the word is">
                <p>
                  On the larger collection the weighting is the same and its
                  effect is small, because that collection was built so that every
                  content word is used about equally often. The three words
                  carrying no subject are each used eight times across the
                  twenty-four documents and every content word between five and
                  eight times, so the weights run from about 2.02 up to about
                  2.43, a spread of a fifth rather than of an order.
                </p>
                <p>
                  That is worth stating plainly rather than glossing, since the
                  rarity weighting is usually introduced on a collection of real
                  prose where the commonest word is a thousand times commoner than
                  a rare one and the weight really does change the answer. Here it
                  moves the score for the three texts from a margin of 0.0000 to a
                  margin of 0.0040, which is not nothing and is not much.
                </p>
                <KeepInMind>
                  A weighting is only as useful as the spread of what it is
                  weighting. On an evenly used vocabulary every word ends up
                  counting about the same however the weight is defined, and the
                  repair has to come from somewhere else.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. What counting cannot see">
                <p>
                  Now the three texts. Each of them uses the twice, and twice, we
                  once, and three content words no other text shares, so the part
                  of any two of them that overlaps is exactly the same five
                  tokens, and the part that does not overlap is exactly three
                  tokens in each. The angle between any two of them therefore has
                  to be the same angle, and it comes out at three quarters for all
                  three pairs.
                </p>
                <WhyThisWorks>
                  <p>
                    Write one of the texts as its counts. The slot for the holds
                    2, the slot for and holds 2, we holds 1, and three content
                    slots hold 1 each, so the squared length is 4 + 4 + 1 + 1 + 1
                    + 1 = 12. Two of the texts overlap only on the, and and we,
                    and the products there are 2 &times; 2, 2 &times; 2 and 1
                    &times; 1, so the dot product is 9. Nine over twelve is three
                    quarters, and nothing in the calculation ever consulted which
                    content words were involved.
                  </p>
                </WhyThisWorks>
                <NumberTable
                  headings={[
                    "pair",
                    "about the same thing",
                    "counted",
                    "counted, weighted",
                  ]}
                  rows={[
                    ["first against second", "no", "0.7500", "0.6978"],
                    ["first against third", "yes", "0.7500", "0.7107"],
                    ["second against third", "no", "0.7500", "0.7067"],
                  ]}
                  caption="Three quarters, three times over. The weighting spreads the three readings over 0.0129 and does put the right pair on top, by 0.0040."
                />
                <p>
                  The same failure is measurable across the whole collection
                  rather than on three texts. Two documents of one half that
                  happen to share no content word score exactly zero against each
                  other, while two documents of different halves that share a word
                  carrying no subject score 0.1667. So the least alike same-half
                  pair is further apart than the most alike different-half pair,
                  and the gap runs the wrong way by 0.1667. Weighting the counts
                  by rarity does not repair that, since its worst same-half pair
                  is at zero too.
                </p>
                <KeepInMind>
                  A rule that reads only which words a text used cannot tell that
                  crew and sail belong together, because it has no way of knowing
                  anything about a word beyond which slot it owns. Everything
                  after this point buys nearness between words that never appear
                  together.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Averaging The Positions Instead",
          content: (
            <>
              <SubSection title="8. The mean of a text’s word positions">
                <p>
                  If the words already have positions, the cheapest thing to do
                  with a text is to stand at the middle of them. Add the positions
                  of the words the text used, divide by how many there were, and
                  the result is a position of the same width as any word&rsquo;s.
                  A text of three words and a text of thirty both come back as
                  four numbers, and a word the table has never seen is skipped
                  rather than guessed at.
                </p>
                <Equation>
                  {"v(text)  =  (1 / n) · ∑ v(w)   over the n words of the text"}
                </Equation>
                <p>
                  It sounds too crude to work and it is not. What a short text is
                  about is mostly which words it holds, the positions of words
                  about one subject are near each other, and the middle of several
                  nearby positions is near all of them. The mean carries that,
                  which is enough for a great many questions, and the sections
                  after this are about the specific ways it falls short rather
                  than about it failing.
                </p>
                <KeepInMind>
                  The mean is a composition, not a fit. Nothing about a
                  word&rsquo;s position is learned or changed here, and which
                  words have a position at all was settled before pooling started.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. What the average buys over counting">
                <p>
                  Here is the whole argument for pooling in one number. The first
                  and third texts share no content word, so counting scored them
                  at exactly the same 0.7500 it scored every other pair. Averaging
                  their words&rsquo; positions puts them at 0.8737 against each
                  other and at 0.6631 and 0.6142 against the cooking text, so the
                  two that are about the same thing come out ahead by 0.2106.
                  Nothing told the average which texts were about sailing. It
                  reached that because crew, boat and sail sit near wind, tide and
                  anchor in the table it was handed.
                </p>
                <SeparationLadder />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Every rule on the page, scored across the whole of a
                  collection rather than on three texts. Watch the top two rows,
                  which are the counting rules, where the far end of the indigo
                  bar lies to the left of the far end of the amber one, so a pair
                  of documents about the same subject can be further apart than a
                  pair about different ones.
                </p>
                <p>
                  Across all twenty-four documents the same thing shows. Counting
                  puts two same-half documents at 0.4343 on average and two
                  different-half documents at 0.0556, a gap of 0.3788, but its
                  worst same-half pair is at 0.0000 and its best different-half
                  pair at 0.1667, so its margin is negative. The plain average
                  puts the two averages at 0.7947 and 0.1346, a gap of 0.6601, and
                  its worst same-half pair at 0.3202 against a best different-half
                  pair of 0.2581, so the margin is positive for the first time, at
                  0.0622.
                </p>
                <KeepInMind>
                  The gap between the two averages is the comfortable measure and
                  the margin between the two worst cases is the demanding one. A
                  method can improve the first while leaving the second negative,
                  which is what the weighted counting rule does here.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Why the comparison is the angle and not the distance">
                <p>
                  A pooled position has a length, and it is worth asking what the
                  length is a fact about before using it for anything. Under the
                  plain average the three texts come out at lengths 0.4886,
                  0.5083 and 0.5279, close to each other because all three texts
                  are eight words long and the words of each point broadly the
                  same way. Under the smooth weights they come out between 0.0104
                  and 0.0112, because no weight there is above 0.028. Under the
                  last rule they come out between 0.0048 and 0.0062, because most
                  of what was there has been taken out.
                </p>
                <p>
                  None of those lengths says anything about the text. They say
                  which rule produced the vector and how big its weights happened
                  to be, so comparing two texts by the distance between them would
                  mostly be comparing the arithmetic that made them. The direction
                  is where the subject was put, and the cosine of the angle
                  between two directions is what every number on this page
                  measures.
                </p>
                <Equation>
                  {"cos θ  =  (a · b) / ( ‖a‖ · ‖b‖ )"}
                </Equation>
                <KeepInMind>
                  A pooled vector&rsquo;s length is an artefact of the weights and
                  the number of words, so the angle is the comparison throughout.
                  A vector of length zero has no direction and cannot be compared
                  at all, which Part 6 comes back to.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. What the plain average is supposed to get wrong">
                <p>
                  The usual complaint about the plain average is easy to state.
                  Every text has the in it, the has a position like any other
                  word, and the mean of a text&rsquo;s words is pulled towards it
                  as hard as towards anything else, so the words that carry the
                  least about the subject get exactly the same say as the words
                  that carry the most. On the hand-built collection that is
                  visible in one document.
                </p>
                <WorkedExample title="One document, worked all the way through">
                  <p>
                    The document is the cat the dog. The position of cat is (1, 0,
                    0, 0.1) and of dog is (1, 0, 0, &minus;0.1), and the position
                    of the is (0, 0, 2, 0), which is twice as long as either. Four
                    words, two of them the, so the mean adds two copies of (0, 0,
                    2, 0) to one each of the other two and divides by four,
                    landing at (0.5, 0, 1, 0).
                  </p>
                  <p>
                    Read that answer as the third coordinate being twice the
                    first. Two words in four supplied the whole of one coordinate
                    and none of the other, and taking each word&rsquo;s share of
                    the length of the answer along its own direction, the supplies
                    0.8000 of it and cat and dog supply 0.1000 each. Half the
                    tokens and four fifths of the answer, from a word that is in
                    every document of the collection.
                  </p>
                </WorkedExample>
                <ContributionBars corpus="sketch" text="the cat the dog" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  The shares of one document&rsquo;s answer, by word. Switch the
                  rule to see the same three words divide the same answer
                  differently, which is what a weighting does and all it does.
                </p>
                <p>
                  The consequence across the six documents is that they all end up
                  pointing at nearly the same place. The three about animals score
                  at least 0.9990 against each other, which is what we want, but
                  the animal documents and the finance documents score up to
                  0.8349 against each other, which we do not, so the margin is
                  only 0.1640. Two texts with no word in common and nothing to do
                  with each other are eighty-three per cent alike because they
                  both said the twice.
                </p>
                <KeepInMind>
                  The complaint is not that common words are meaningless. It is
                  that they appear in every text, so whatever they contribute is
                  contributed to every text alike, and a quantity added equally to
                  everything cannot help tell anything apart.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. On this collection it does not, and the reason is worth having">
                <p>
                  I expected the same ranking on the twenty-four documents and did
                  not get it. Taking the first of the three texts and asking which
                  of its words supplied most of its average, the answer is crew at
                  0.2069, then sail at 0.1839, then and at 0.1736 across its two
                  uses, then the at 0.1532 across its two. Two tokens of and
                  together supply less than one token of crew. Across all
                  twenty-four documents, the one word in six that carries no
                  subject supplies 0.0649 of its document&rsquo;s average, where an
                  equal share would be 0.1667.
                </p>
                <ContributionBars
                  corpus="documents"
                  text="the crew and the boat and we sail"
                />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  The same division of one answer, on the larger collection. The
                  grey bars are the words carrying no subject, and here they are
                  at the bottom rather than the top.
                </p>
                <p>
                  The reason is in the table of positions rather than in the
                  averaging. The three words carrying no subject own the three
                  shortest positions in it, and at 0.3708, the at 0.3667 and we at
                  0.5770, against content words running from 0.7327 up to
                  1.1628,
                  because the table was fitted by measuring
                  how much more often two words occur together than chance would
                  explain, and a word that occurs with everything has no company
                  worth reporting. The rule that made the positions had already
                  done part of the work the weighting was invented to do.
                </p>
                <KeepInMind>
                  How much a common word distorts a plain average depends on how
                  the word positions were made, not on the averaging. The textbook
                  complaint holds on a table where common words are long and does
                  not hold here, and Part 5 shows that the damage those words do
                  is real anyway and takes a different form.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Weighting A Word By How Rare It Is",
          content: (
            <>
              <SubSection title="13. The rarity weight, inside a mean">
                <p>
                  The repair suggests itself. If a word in every document should
                  count for little and a word in few documents for more, then the
                  weight Part 2 already used on counts can be used again on
                  positions, multiplying each word&rsquo;s position by its weight
                  before adding. Divide by the total weight rather than by the
                  number of words, and the result is a weighted mean, which sits
                  inside the same region the words do rather than being scaled
                  arbitrarily by how many rare words the text happened to hold.
                </p>
                <Equation>
                  {"v(text)  =  ∑ idf(w) · v(w)   /   ∑ idf(w)"}
                </Equation>
                <p>
                  On the hand-built collection the weight of the is exactly one,
                  since it is used by all six documents, and every other word,
                  being in two of six, weighs log(7 / 3) + 1 = 1.8473. So each
                  content word now counts 1.8473 times what the counts, which is a
                  ratio the plain average did not have.
                </p>
                <KeepInMind>
                  Dividing by the total weight rather than by the word count is
                  what makes this a mean. The alternative, dividing by the count,
                  leaves a text of rare words longer than a text of common ones,
                  which matters for anything that reads the length and matters not
                  at all for an angle.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. What that weighting is worth">
                <p>
                  On the hand-built collection it is worth a great deal. The
                  share of the answer supplied by the falls from 0.8000 to 0.5396
                  and each of cat and dog rises from 0.1000 to 0.2302, and the
                  margin between the two subjects goes from 0.1640 to 0.3871,
                  which is more than double. The word furthest apart across the
                  subjects falls from 0.8349 to 0.6105.
                </p>
                <p>
                  On the twenty-four documents it is worth much less, for the
                  reason Part 2 gave, which is that the weights themselves barely
                  differ there. The margin moves from 0.0622 to 0.0819 and the
                  three texts&rsquo; margin from 0.2106 to 0.2331. Both are real
                  improvements and neither is the kind of change that decides
                  whether a method works.
                </p>
                <NumberTable
                  headings={[
                    "collection",
                    "plain average",
                    "weighted by rarity",
                    "change",
                  ]}
                  rows={[
                    ["twenty-four documents", "0.0622", "0.0819", "+0.0197"],
                    ["six two-word documents", "0.1640", "0.3871", "+0.2231"],
                  ]}
                  caption="The margin between the least alike same-subject pair and the most alike different-subject pair, before and after the weighting. The weighting is worth eleven times as much where the common word is genuinely dominant."
                />
                <KeepInMind>
                  A repair is worth measuring on the collection it will be used
                  on, since the same weighting bought 0.2231 in one place and
                  0.0197 in another. Nothing about the method changed between
                  those two numbers.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. The smoother weight the 2017 baseline uses">
                <p>
                  Arora, Liang and Ma weight by a different quantity. Instead of
                  how many documents hold a word, they use how probable the word
                  is across the collection, and instead of a logarithm they use a
                  small constant divided by that constant plus the probability. It
                  is near one for a word that almost never occurs and near zero for
                  a word that is everywhere, and it falls smoothly between.
                </p>
                <Equation>
                  {"weight(w)  =  a / ( a + p(w) )     with a = 0.001"}
                </Equation>
                <p>
                  At the paper&rsquo;s constant, a word filling half of every text
                  weighs 0.001996, and a word appearing about once in a million
                  weighs 0.999001. The common word is held down five hundred times
                  against the rare one, and the sharpness of that is the point of
                  the choice. The paper also divides by the number of words rather
                  than by the total weight, so a text made entirely of common
                  words comes out short rather than rescaled back up, which is a
                  deliberate difference from the previous section and one reason
                  the lengths in section 10 were so small.
                </p>
                <p>
                  On the twenty-four documents that sharpness has nothing to bite
                  on. No word is commoner than an eighteenth of the collection, so
                  the weights run from 0.017682 up to 0.027994, a ratio of 1.5832
                  against the 500 the paper&rsquo;s own illustration reaches.
                  Measured, the weights alone take the margin from 0.0622 to
                  0.1096, which is a little more than the rarity weight managed
                  and is still not the thing that makes the method work.
                </p>
                <KeepInMind>
                  The weight is a function of a word&rsquo;s probability in one
                  collection, so a small collection of evenly used words gives it
                  almost nothing to do. On the hand-built collection, where the is
                  genuinely half of every document, the same weight takes the
                  margin from 0.1640 to 0.7886.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Why the weights alone do not finish the job">
                <p>
                  Look at what is left after the best weighting so far. On the
                  twenty-four documents the average similarity between two
                  documents of different halves is still 0.1070 and the most alike
                  such pair is at 0.2045, so two documents with nothing in common
                  still point substantially the same way. Turning the weights down
                  further would not fix it, because the problem is no longer how
                  much each word counts.
                </p>
                <p>
                  The remaining problem is that every text of the collection is
                  leaning in one shared direction, whatever it is about, and a
                  weighting can only shrink a word&rsquo;s contribution towards
                  zero. It cannot subtract. Measured, the plain average of a
                  document of this collection lies at a cosine of 0.6797 from one
                  particular direction, never below 0.5820 and never above 0.7774,
                  so roughly two thirds of every document&rsquo;s answer is the
                  same answer, and it is the same answer for all twenty-four.
                </p>
                <KeepInMind>
                  Turning a word&rsquo;s weight down can take its contribution
                  to zero and no further, so a quantity that every document has
                  some of survives every weighting that leaves the words in.
                  Getting rid of it means subtracting it, which is what Part 5
                  does.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. The Direction Every Text Shares",
          content: (
            <>
              <SubSection title="17. One direction through a whole collection">
                <p>
                  Put every training document&rsquo;s weighted average into a
                  table, one row per document, and ask which single direction the
                  rows lean along most. That is the leading direction of the
                  table, and once it is known it can be taken out of every vector,
                  leaving each document with only what distinguishes it from the
                  rest.
                </p>
                <Equation>
                  {"v  ←  v − u · (u · v)     where u is the leading direction"}
                </Equation>
                <p>
                  Two details of how the direction is found are decisions rather
                  than consequences. It is found from the table exactly as it
                  stands, without first subtracting each coordinate&rsquo;s mean
                  across the documents, which is what makes this different from
                  the decomposition on the principal components page. Centring
                  would take the mean direction away before the search began, and
                  the mean direction is precisely what is meant to be removed. And
                  a direction found this way is determined only up to its sign,
                  since a direction and its opposite span the same line, so a
                  convention is needed if the answer is to be a function of the
                  collection alone. The projection is the same either way.
                </p>
                <KeepInMind>
                  The direction belongs to the collection and not to any text.
                  Nothing about a particular document decides it, and every
                  document is then measured against the same one.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. What lies along it, probed rather than described">
                <p>
                  Nothing so far has said what that direction contains, and the
                  honest way to find out is to ask every word in the collection how
                  far it leans along it. On the twenty-four documents the answer is
                  not subtle. And leans along it at 0.9897, we at 0.9848 and the at
                  0.9032, and the furthest any word carrying a subject reaches is
                  0.7087. The three words that mean nothing about cooking or
                  sailing are the first three in the list, separated from
                  everything else by nearly two tenths.
                </p>
                <SharedDirectionProbe />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Every word of the collection, ranked by how far it leans along
                  the direction that is about to be removed. The three grey bars
                  at the top are the words carrying no subject, and the dashed
                  line is where the furthest content word reaches. Switching to
                  the smaller collection reorders the list entirely, which the
                  note below is about.
                </p>
                <p>
                  Section 12 found those same three words to be the three shortest
                  positions in the table, supplying less of a plain average than
                  their share of the tokens, so this is not the textbook story
                  about common words being loud. They are quiet and they are
                  aligned. Every text of the collection contains them, they all
                  point the same way, and a small quantity added to every text
                  alike is exactly as useless for telling texts apart as a large
                  one, which is what makes removing the direction worth more here
                  than any weighting was.
                </p>
                <InAModel>
                  The same probe on the hand-built collection returns something
                  else, and the difference is instructive. There the leading
                  direction is (0.6384, 0.6384, 0.4299, 0), which mixes both
                  subjects&rsquo; axes with the axis the sits on, and the word
                  furthest along it is not the at 0.4299 but pet and market at
                  0.7050. With one shared word and two perfectly symmetric halves,
                  the direction the documents most agree on is the average of
                  everything rather than the shared word alone. What is removed is
                  whatever the collection has in common, and only sometimes is
                  that a set of words a person would have named in advance.
                </InAModel>
                <KeepInMind>
                  The words along the shared direction are a finding about a
                  collection, not a definition. On one collection here they are the
                  three words carrying no subject and on the other they are not,
                  and both times what was removed is the same thing, which is
                  whatever every document already agreed on.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Taking it out, and what happens to the three texts">
                <p>
                  With the direction removed, the three texts stop being variations
                  on one theme. The two about sailing come out at 0.3633 against
                  each other, and the sailing texts against the cooking one come
                  out at &minus;0.9016 and &minus;0.5762, which is to say they now
                  point in substantially opposite directions rather than in
                  slightly different ones. The margin goes from 0.2637 under the
                  weights alone to 0.9395.
                </p>
                <NumberTable
                  headings={[
                    "rule",
                    "the two about sailing",
                    "the most alike cross-subject pair",
                    "margin",
                  ]}
                  rows={[
                    ["counted", "0.7500", "0.7500", "0.0000"],
                    ["counted, weighted", "0.7107", "0.7067", "0.0040"],
                    ["averaged", "0.8737", "0.6631", "0.2106"],
                    ["averaged, weighted by rarity", "0.8521", "0.6190", "0.2331"],
                    ["the smooth weights alone", "0.8148", "0.5511", "0.2637"],
                    ["smooth inverse frequency", "0.3633", "−0.5762", "0.9395"],
                  ]}
                  caption="The three texts under all six rules. The last row is the only one where two texts about different subjects come out pointing away from each other rather than merely less towards each other."
                />
                <p>
                  Across the whole collection the same thing happens at scale. Two
                  documents of different halves average &minus;0.6370 against each
                  other, where every rule before this had them positive, and the
                  margin between the worst same-half pair and the best
                  different-half pair reaches 0.2752, four times what the plain
                  average managed.
                </p>
                <KeepInMind>
                  Removing one direction out of four is a large intervention and it
                  is worth more here than every weighting on the page put together.
                  The next section is where that turns out to have a price.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. Where taking it out makes things worse">
                <p>
                  There is a case on this collection where the sharpest method is
                  beaten by the plainest one. The least alike pair of documents
                  from the same half scores 0.3202 under the plain average and
                  &minus;0.0767 after the direction is removed, so two documents
                  genuinely about the same subject have been pushed past
                  perpendicular and now read as unrelated. The plain average kept
                  them together and the repair separated them.
                </p>
                <p>
                  It is the same mechanism as the improvement, seen from the other
                  side. What every document of the collection had in common was
                  also part of what any two documents of one half had in common,
                  so removing it removes some genuine agreement along with the
                  spurious kind. Two documents of one half that share no content
                  word were relying on the shared part more than most, and they are
                  the pair that suffers.
                </p>
                <NumberTable
                  headings={["rule", "least alike same-half pair"]}
                  rows={[
                    ["counted", "0.0000"],
                    ["averaged", "0.3202"],
                    ["smooth inverse frequency", "−0.0767"],
                  ]}
                  caption="The worst case inside one half, which is the quantity the removal makes worse rather than better. On this measure alone the plain average is the best rule on the page."
                />
                <KeepInMind>
                  The removal buys separation between subjects and pays for it in
                  cohesion inside one. On a task where the question is whether two
                  texts are about the same broad subject that is a good trade, and
                  on a task where the question is how alike two texts of one
                  subject are it may not be.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. What all this costs">
                <p>
                  Three costs, in the order they bite. The first is a constraint
                  rather than a quantity, which is that the last two rules cannot
                  score a single text at all until they have seen a collection.
                  Counting needs a collection to fix the vocabulary, the rarity
                  weight needs one to count documents, the smooth weight needs one
                  to estimate probabilities, and the removal needs one to find a
                  direction, so a text arriving on its own can be given a position
                  only by the plain average.
                </p>
                <p>
                  The second is width, and it runs the other way. A counted text is
                  as wide as the vocabulary, which is twenty-three numbers here and
                  tens of thousands on real prose, and almost all of them are zero.
                  A pooled text is as wide as one word&rsquo;s position, which is
                  four numbers here whatever the vocabulary does. That is the trade
                  a fixed width was bought with.
                </p>
                <p>
                  The third is what cannot be got back. A counted vector is the
                  words, so the text&rsquo;s vocabulary can be read straight off
                  it. A pooled vector is not, and asking which six words of the
                  table lie nearest a document&rsquo;s pooled position recovers
                  4.3333 of that document&rsquo;s six words on average under the
                  plain average, and 4.1667 under the sharpest rule, so a little
                  under three quarters of a document is still readable off its
                  position and the rest of it has gone.
                </p>
                <NumberTable
                  headings={[
                    "rule",
                    "numbers per text",
                    "needs a collection first",
                    "words back out of six",
                  ]}
                  rows={[
                    ["counted", "23", "for the vocabulary", "all six, by definition"],
                    ["counted, weighted", "23", "yes", "all six, by definition"],
                    ["averaged", "4", "no", "4.3333"],
                    ["averaged, weighted by rarity", "4", "yes", "4.3333"],
                    ["the smooth weights alone", "4", "yes", "4.2500"],
                    ["smooth inverse frequency", "4", "yes", "4.1667"],
                  ]}
                  caption="Width, what has to be seen before a single text can be scored, and how much of a document is still readable from its position."
                />
                <KeepInMind>
                  Counting keeps every word and gets the ordering of the two
                  halves wrong; pooling gets the ordering right and gives about
                  4.33 words of six back. Which of those is the cost worth paying
                  depends on whether anything downstream needed to know which
                  words the text used.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Where Pooling Stops Being Defined",
          content: (
            <>
              <SubSection title="22. Every rule here is blind to order">
                <p>
                  A sum does not remember the order its terms arrived in. Every
                  rule on this page is a sum over the words of a text, divided by
                  something that depends on the multiset of those words and not on
                  their arrangement, so any two texts built from the same words in
                  any two orders are one position. This is not a limitation of a
                  particular weighting and it cannot be repaired by choosing better
                  weights, because it follows from the shape of the calculation.
                </p>
                <p>
                  Crew sail the boat and boat sail the crew are two English
                  sentences that say opposite things about who is doing the
                  sailing. Under both counting rules they come back as the identical
                  list of numbers, agreeing in every bit. Under the four averaging
                  rules the largest disagreement between the two lists first
                  appears in the seventeenth decimal place, which is the order the
                  additions ran in rather than any difference in what was computed,
                  and the angle between them is one.
                </p>
                <OrderBlindPair />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  The same four words in two orders under every rule. The column to
                  read is the last one, which is the angle between the two answers,
                  and it does not move.
                </p>
                <p>
                  Four words admit twenty-four orderings and all twenty-four
                  land on the same position, and the count of orderings grows
                  faster than any other quantity here as the text lengthens.
                  Whether that matters depends entirely on the question being
                  asked, since it costs nothing when the question is what a text
                  is about and costs everything when the question is who did what
                  to whom.
                </p>
                <KeepInMind>
                  Order blindness is a property of the shape of the calculation
                  rather than of any choice inside it. Keeping order means reading
                  the words in sequence and carrying something forward as they go,
                  which is a different kind of model rather than a further repair
                  to this one.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. A shared direction is a fact about the company">
                <p>
                  A weight learned from a collection is a statement about that
                  collection, and so is a direction. Change the company a text is
                  scored in and both change, which means the same text with the
                  same words and the same word positions has no single answer under
                  the last rule. It has one answer per collection.
                </p>
                <p>
                  Scoring the crew and the boat and we sail against all
                  twenty-four documents and then against the twelve sailing ones
                  gives two positions whose cosine is &minus;0.6124. Not two
                  slightly different readings of one text. Two readings that point
                  substantially away from each other, from a change in nothing but
                  which documents were in the room.
                </p>
                <CompanyShift />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Each word of the text against the direction removed under each of
                  the two collections. Watch sail, which is nearly perpendicular to
                  the whole collection&rsquo;s direction and almost parallel to the
                  sailing half&rsquo;s.
                </p>
                <p>
                  The mechanism is visible word by word. In the whole collection
                  the three words carrying no subject lead the direction, because
                  they are what all twenty-four documents agree on. In the sailing
                  half every document is about sailing, so sail is now something
                  they all agree on too, and it leads at 0.9031 where in the whole
                  collection it reached only 0.6551. The two directions themselves
                  agree only to 0.7812.
                </p>
                <KeepInMind>
                  Under any rule that removes what a collection shares, a
                  text&rsquo;s position is a statement about that text relative to
                  that collection. Two such positions may only be compared when
                  they were produced against the same one.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. One position cannot say two things">
                <p>
                  Take a text with two sailing words and two cooking words in it,
                  and ask where one position could possibly put it. It has to
                  answer with a single direction, so it can lean towards one
                  subject, or lean towards the other, or lean towards something in
                  between that is neither. What it cannot say is both, since being
                  about two things is not a direction.
                </p>
                <BothSubjectsAtOnce />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  A text about both subjects against a text about each, under every
                  rule. The first rules put it near both, and the last one picks a
                  side.
                </p>
                <p>
                  Both failures are on display. Under the plain average the mixed
                  text scores 0.8862 against the sailing text and 0.9202 against
                  the cooking one, both of which are higher than the 0.6631 those
                  two score against each other, so the text reads as more like each
                  of them than they are like each other, which is the answer of
                  something that is vaguely like everything. Under the last rule it
                  scores &minus;0.1187 against sailing and 0.5057 against cooking,
                  and all four of the documents it comes out nearest are cooking
                  documents, so a text holding crew and boat has been placed in the
                  kitchen.
                </p>
                <KeepInMind>
                  This is a limit of the shape of the answer rather than of the
                  rule producing it. Representing a text that is about two things
                  needs more than one position, which is a different design and not
                  a better weighting.
                </KeepInMind>
              </SubSection>

              <SubSection title="25. The cases with nothing to compute">
                <p>
                  Four inputs make one of these calculations undefined rather than
                  merely awkward, and it is worth knowing which quantity fails and
                  why, since each one is a decision anybody implementing this has
                  to make.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what the mathematics says"
                  rows={[
                    {
                      expression: "a text none of whose words has a position",
                      reason:
                        "The sum is over an empty set, so the answer is the zero vector. That is a legitimate position and the comparison is what fails, since the cosine divides by the length and the length is zero. Answering zero similarity would be a claim the calculation never made; answering nothing is the honest reading.",
                    },
                    {
                      expression: "a collection of one document",
                      reason:
                        "One row spans one direction, so the leading direction is that document's own direction and removing it leaves exactly the zero vector, measured here at a length of 4.3 in ten billion billion. Every text scored in that company that leans the same way loses everything, and the residue that remains is rounding rather than content.",
                    },
                    {
                      expression:
                        "a text whose weighted average lies exactly along the shared direction",
                      reason:
                        "The removal takes the whole vector, for the same reason and without needing a degenerate collection. A text is more likely to meet this the more of it consists of words the whole collection agrees on, so it is the texts carrying least that vanish, which is the intended behaviour taken to its limit.",
                    },
                    {
                      expression: "a collection whose documents all pool to zero",
                      reason:
                        "There is no direction to be leading, since every row of the table is the origin and no direction leans more than any other. The quantity does not exist, and choosing one arbitrarily would put a fabricated direction into every vector the fit later produced.",
                    },
                    {
                      expression:
                        "a word the collection used, whose probability is therefore not zero",
                      reason:
                        "The smooth weight is a small constant over that constant plus the probability, which is defined for every probability in the interval and never divides by zero, since the constant is positive. A word the collection never used has probability zero and weight one, which is the largest weight there is, and is a sensible answer only because such a word cannot appear in a document being pooled from that collection.",
                    },
                  ]}
                />
                <p>
                  The first of those is the one that arises in ordinary use rather
                  than in a constructed example. A text of words a collection has
                  never met is not rare, and every rule on this page answers it the
                  same way, which is with a position at the origin and no
                  similarity to anything at all.
                </p>
                <KeepInMind>
                  Three of these five come back to one fact, which is that a
                  direction is undefined at the origin. A position of length zero
                  is not a small answer that can be compared carefully, since the
                  cosine has a zero in its denominator there and there is nothing
                  to compare.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
