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
import { BucketSharers } from "@/components/widgets/BucketSharers";
import { CharacterHashExplorer } from "@/components/widgets/CharacterHashExplorer";
import { SeparationChart } from "@/components/widgets/SeparationChart";
import { TrigramFingerprints } from "@/components/widgets/TrigramFingerprints";
import { WidthTradeChart } from "@/components/widgets/WidthTradeChart";

export const metadata: Metadata = {
  title: "Hashing Characters · oop_ml",
  description:
    "Turn a character straight into a position with arithmetic, so the table has the height we chose and nothing has to be stored, learned or looked up.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

const SENTENCE = "Dr. Alvarez didn't expect the low-cost re-analysis.";

export default function HashingCharactersPage() {
  return (
    <ConceptPage
      title="Hashing Characters"
      tagline="Turn a character straight into a position with arithmetic, so the table has the height we chose and nothing has to be stored, learned or looked up."
      prerequisites={
        <>
          One page from earlier in this section. The page on{" "}
          <Link href="/concepts/bytes-and-characters" className={link}>
            bytes and characters
          </Link>{" "}
          reads a text as the units it is already made of and finishes by ruling
          out the one table that would make the character reading complete,
          because a row for every character Unicode has room for comes to
          855,638,016 numbers. This page starts from that number and takes the
          other way out of it. The sentence and the eighteen English sentences
          here are the ones that page uses, so the two sets of figures can be
          read together, and the page on{" "}
          <Link href="/concepts/what-a-token-is" className={link}>
            what a token is
          </Link>{" "}
          sets out the table that everything here is refusing to build.
        </>
      }
      history={
        <>
          <p>
            Kilian Weinberger, Anirban Dasgupta, John Langford, Alex Smola and
            Josh Attenberg had a storage problem at Yahoo! Research in 2009, and
            it was not the one people expected. They were building spam filters
            personalised to individual users, which meant one set of weights per
            user over a shared vocabulary of words, and the weights were
            affordable. What was not affordable was the dictionary that turned a
            word into a position in those weights, since it had to be built, kept
            in memory, shipped alongside every model and rebuilt whenever the
            vocabulary changed. In &ldquo;Feature Hashing for Large Scale
            Multitask Learning&rdquo; they replaced it with a hash function, so
            the position of a word became something a machine computes in a few
            instructions from the word itself, and they showed that with a second
            hash deciding a sign the inner products a linear model reads are
            preserved on average despite the collisions.
          </p>
          <p>
            Po-Sen Huang, Xiaodong He, Jianfeng Gao, Li Deng, Alex Acero and
            Larry Heck applied the same move to a piece of a word at Microsoft
            Research in 2013. Their problem was web search, where a query
            regularly contains a word no vocabulary of any size holds, and their
            answer in &ldquo;Learning Deep Structured Semantic Models for Web
            Search using Clickthrough Data&rdquo; was to wrap each word in a
            boundary mark, cut it into overlapping runs of three letters, and
            hash those. A vocabulary of half a million words became a table of
            letter triples an order of magnitude smaller, misspellings landed
            near their intended words because most of their triples survived the
            error, and the whole thing needed no list of known words at all. Part
            5 here is that idea, and it came back for generative models in 2024
            in the work of Björn Deiseroth and colleagues at Aleph Alpha.
          </p>
          <p>
            The version this page is mostly about is Jonathan Clark, Dan
            Garrette, Iulia Turc and John Wieting&rsquo;s, at Google Research in
            2021. Multilingual models of that period shared one learned subword
            vocabulary across the hundred or so languages they were trained on,
            and a shared vocabulary spends its entries where the training text
            is, so a language with little of it is spelled out in fragments while
            a language with a great deal of it gets whole words. Their model
            CANINE dropped the learned vocabulary and read characters, which
            immediately raised the 855,638,016 the previous page ends on, and
            they answered that by hashing a character into a fixed number of
            buckets and giving the model a row per bucket rather than a row per
            character. They used 16,384 buckets and eight hashes at once, and the
            argument for the eight is what Part 4 here measures.
          </p>
          <p>
            The page answers six questions in order. What does a table with a row
            for every character actually cost, and why can a corpus not rescue
            it? What does it mean to compute a position instead of storing one,
            and what does the arithmetic look like on our own sentence? What is a
            collision, and what does one cost a model that has no way of noticing
            it? Does hashing several times into the same space defend against
            that, and by how much when it is counted rather than argued? What is
            the whole arrangement worth against the obvious alternative of
            reading bytes? And where does the method stop being defined at all?
          </p>
        </>
      }
      playground={<CharacterHashExplorer />}
      sections={[
        {
          title: "Part 1. The Table That Cannot Be Built",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. Where this picks up, and the number that rules the complete table out">
                <p>
                  The previous page ends on a table nobody builds. Reading a text
                  as its characters means giving every character an entry, and a
                  table with an entry for every character Unicode has room for is
                  complete in the way the byte table is complete, so nothing can
                  ever be unfamiliar to it. The arithmetic is what stops it. A
                  model gives every entry a row of numbers to learn, and at an
                  ordinary width of 768 those 1,114,112 entries come to
                  855,638,016 numbers, which is more than many whole models, for
                  a table almost every row of which no text will ever reach.
                </p>
                <p>
                  Fitting the table to a corpus instead is what the previous page
                  measured, and it is the failure this page starts from. Every
                  character of our eighteen English sentences gives a table of 37
                  entries, which is cheap and covers English. Put one short
                  sentence of Greek to it and 17 of the 21 characters come back as
                  the stand-in, so the sentence arrives at the model as the fact
                  that something unreadable was there, seventeen times over. That
                  gap does not close with a bigger corpus, since Han alone has
                  tens of thousands of characters and whatever text we gather is
                  finite.
                </p>
                <NumberTable
                  headings={["one row per", "rows", "numbers at a width of 768"]}
                  rows={[
                    ["character those eighteen sentences used", "37", "28,416"],
                    ["piece merged from those sentences", "137", "105,216"],
                    ["byte value", "256", "196,608"],
                    ["character Unicode has room for", "1,114,112", "855,638,016"],
                  ]}
                  caption="The first two are fitted to eighteen English sentences and the last two are the same whatever has been read. The last row is the one this page is trying to avoid paying."
                />
                <KeepInMind>
                  There are two ways of getting a table small enough to afford,
                  and only one of them has been tried so far. Fitting it to a
                  corpus makes it small and leaves it surprised by whatever the
                  corpus lacked. This page makes it small by choosing its height
                  in advance and accepting what that forces.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Computing the position instead of storing one">
                <p>
                  A table has two jobs, and it is worth separating them, because
                  only one of them is expensive. It holds what a model learned
                  about each entry, which is the rows of numbers, and it holds the
                  mapping from a piece of writing to which row that is. The
                  mapping is the part that has to be built from a corpus, saved,
                  shipped and kept in step with the model, and it is the part that
                  can be unfamiliar with something.
                </p>
                <p>
                  Hashing removes the second job entirely. A character already has
                  a number, the one Unicode gave it, and there is a piece of
                  arithmetic that turns any whole number into a position inside a
                  range we chose. Multiply it by a fixed odd number and take the
                  remainder on dividing by the height of the table. That is the
                  whole mapping. It is a handful of instructions, it stores
                  nothing, it was fitted to nothing, and it answers for a
                  character from a script nobody has ever put to it in exactly the
                  same time it answers for the letter e.
                </p>
                <Equation>
                  {"bucket  =  ((character number + 1) × multiplier)  mod  buckets"}
                </Equation>
                <p>
                  The height of the table, which the rest of this page calls the
                  number of buckets, is now a setting rather than a discovery. It
                  is fixed before any writing is read and it does not move when
                  more is. That is the change worth holding on to, since the size
                  of every table on the page above was decided by what some text
                  happened to contain.
                </p>
                <KeepInMind>
                  Nothing here is learned, so there is nothing to save beside the
                  model and nothing that ages as the writing does. The model still
                  learns a row per bucket; what has gone is the list saying which
                  character owns which row.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. What is given up, stated before anything is bought">
                <p>
                  Two characters can be sent to the same bucket, and when that
                  happens the model sees one row where there were two characters.
                  A table built by listing what a corpus contained never does
                  this, since it gives each entry its own position by
                  construction. So the trade is set out from the beginning. We are
                  buying a table whose height we chose and which is never
                  surprised, and we are paying for it with characters that become
                  one thing.
                </p>
                <p>
                  How many of them do that depends only on the height, and
                  Part 3 counts them. What matters at this point is that the loss is
                  invisible from inside. A learned table announces an unfamiliar
                  piece by handing back a stand-in, so a reader can count them and
                  see the damage; a hash hands back a perfectly ordinary-looking
                  bucket whether or not something else is already living there.
                </p>
                <KeepInMind>
                  Both failures are real and only one of them is reported. That
                  asymmetry, rather than the size of either, is the thing to carry
                  into the rest of the page.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 2. One Character, Eight Numbers",
          content: (
            <>
              <SubSection title="4. The rule, worked on one letter">
                <p>
                  Take the letter a. Unicode calls it 97, the rule adds one to
                  give 98, and then 98 is multiplied by each of eight fixed odd
                  numbers and each product is reduced by the height of the table.
                  The eight multipliers are the small primes 31, 43, 59, 61, 73,
                  97, 103 and 113, and at 16,384 buckets none of the eight
                  products reaches the height, so none of them is reduced at all
                  and the buckets are the products themselves.
                </p>
                <WorkedExample title="The letter a, all eight ways">
                  <Equation>
                    {"98 × 31  =   3038      98 × 73  =   7154\n" +
                      "98 × 43  =   4214      98 × 97  =   9506\n" +
                      "98 × 59  =   5782      98 × 103 =  10094\n" +
                      "98 × 61  =   5978      98 × 113 =  11074"}
                  </Equation>
                  <p>
                    Every one of those is under 16,384, so the remainder step
                    changes nothing here and the letter a lands in buckets 3038,
                    4214, 5782, 5978, 7154, 9506, 10094 and 11074. A character
                    further up the space does get reduced, and so does any
                    character at all once the table is narrowed, which the
                    playground at the top of the page will do on request.
                  </p>
                </WorkedExample>
                <p>
                  Eight numbers for one character needs explaining, and section 12
                  is where the reason is examined properly. The short version is
                  that the model is given eight tables of 96 numbers each
                  rather than one table of 768, and a character&rsquo;s row
                  is the eight slices joined end to end, so the total width is the
                  same and the hope is that two characters agreeing in one slice
                  still differ in the other seven.
                </p>
                <KeepInMind>
                  Adding one before multiplying is there so the character numbered
                  zero does not land in bucket zero under every multiplier at
                  once. It is a small thing and it is the only part of the rule
                  that is not the arithmetic it looks like.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. The running sentence, taken all the way through">
                <p>
                  Our sentence is 51 characters long. Every one of them goes
                  through the same short piece of arithmetic, and here are the
                  first four,
                  with each character&rsquo;s number and the bucket the first
                  multiplier sent it to.
                </p>
                <Equation>{SENTENCE}</Equation>
                <WorkedExample title="The first four characters, under the first multiplier">
                  <Equation>
                    {"D    69 × 31  =  2139\n" +
                      "r   115 × 31  =  3565\n" +
                      ".    47 × 31  =  1457\n" +
                      "␣    33 × 31  =  1023"}
                  </Equation>
                  <p>
                    The capital D is character number 68, so 69 goes into the
                    multiplication and 2139 comes out, and its remaining seven
                    buckets are 2967, 4071, 4209, 5037, 6693, 7107 and 7797. The
                    space is a character like any other and gets buckets like any
                    other. Nothing in these four numbers depended on the rest of
                    the sentence, which is the difference from every table on the
                    previous page.
                  </p>
                </WorkedExample>
                <p>
                  Across the whole sentence that comes to 51 positions and 408
                  numbers, since each position carries eight. The table behind
                  them has 16,384 rows whatever we put in the box, and at a width
                  of 768 those rows come to 12,582,912 numbers, which is a
                  sixty-eighth of what the complete character table would have
                  cost and is the same figure for a page of Greek. Twenty-four distinct characters appear in
                  the sentence and they produce twenty-four distinct sets of
                  buckets, so at this width nothing in it was lost.
                </p>
                <KeepInMind>
                  The eight tables each hold 16,384 rows of 96 numbers, so the
                  8 × 16,384 × 96 they come to is exactly the 16,384 × 768 a
                  single table would have cost. Asking for more hashes does not
                  make the model bigger, which is why the count looks free and why
                  Part 4 has to ask what it is worth.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Nothing is fitted, so nothing is unfamiliar">
                <p>
                  Put the Greek sentence through the same arithmetic and the
                  contrast with section 1 is complete. All 21 characters get
                  buckets, none of them is a stand-in, and the text comes back
                  character for character. The same holds for the Chinese
                  sentence, for a script invented next year, and for a character
                  Unicode has assigned nothing to at all, since the rule takes a
                  number and returns a number and has no opinion about what the
                  number stands for.
                </p>
                <p>
                  It is worth being careful about what has been settled there,
                  because the previous page drew the same line and it matters more
                  here. Every character can be turned into buckets and every text
                  can be given back, since the character numbers are kept beside
                  the buckets and it is those that decoding reads. What has not
                  been settled is whether a model trained on English knows
                  anything about the rows a Greek letter lit. Representable and
                  learnable are separate questions, and only the first of them has
                  an answer here.
                </p>
                <InAModel>
                  <p>
                    A model reads the buckets and nothing else, and it cannot
                    consult the character numbers, which travel alongside for
                    decoding. So the fact that this arrangement never fails to
                    produce a reading does not mean the reading carries what a
                    reader would want. It means the failure has moved from before
                    the model to inside it, where more training text can still
                    change the answer.
                  </p>
                </InAModel>
                <KeepInMind>
                  A learned table announces what it cannot spell and this
                  announces nothing, which reads as an improvement and is only
                  half of one. Section 10 is the other half.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. What a text costs in positions">
                <p>
                  Sequence length is what everything downstream is charged in, so
                  it is the first number to check. This arrangement gives one
                  position per character, which is what the character reading on
                  the previous page gave and is not what the byte reading gives,
                  since a character can take up to four bytes. On English the two
                  agree and on nothing else do they.
                </p>
                <NumberTable
                  headings={[
                    "text",
                    "positions here",
                    "numbers here",
                    "positions as bytes",
                    "unspellable by a fitted character table",
                  ]}
                  rows={[
                    ["the running sentence", "51", "408", "51", "0"],
                    ["one sentence of English", "24", "192", "24", "0"],
                    ["one sentence of Greek", "21", "168", "38", "17"],
                    ["one sentence of Russian", "20", "160", "37", "17"],
                    ["one sentence of Hindi", "18", "144", "48", "15"],
                    ["one sentence of Japanese", "11", "88", "33", "11"],
                    ["one sentence of Chinese", "6", "48", "18", "6"],
                  ]}
                  caption="The same short sentence in six languages, with the running sentence at the top. The last column is what the table fitted to eighteen English sentences could not spell, which is a fact about those sentences."
                />
                <p>
                  The Chinese sentence is where the difference is widest. It costs
                  6 positions here and 18 as bytes, so anything that compares
                  every position with every other position does a ninth of the
                  work, and the fitted character table would have spelled all six
                  of its characters as the stand-in. Hindi goes from 48 down to
                  18. English pays exactly the same either way and gains nothing
                  from any of this.
                </p>
                <KeepInMind>
                  The 408 numbers in the third column are lookups rather than
                  positions. A character is one place in the sequence and eight
                  rows fetched from eight tables, and the expensive part of a
                  model counts places rather than lookups.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. What a Collision Costs",
          content: (
            <>
              <SubSection title="8. Two characters, one set of numbers">
                <p>
                  Here is the thing section 3 warned about, at the published
                  settings and with the two characters named. The capital letter A
                  is character number 65. The Han ideograph 䁁 is character
                  number 16,449. At 16,384 buckets those two produce the identical
                  eight numbers, in the same order, and a ninth hash from the same
                  family would not separate them either.
                </p>
                <Equation>
                  {"A       2046  2838  3894  4026  4818  6402  6798  7458\n" +
                    "䁁      2046  2838  3894  4026  4818  6402  6798  7458"}
                </Equation>
                <p>
                  What a model can no longer do is worth spelling out. It cannot
                  learn that one of these begins an English sentence and the other
                  does not. It cannot give them different rows, since they ask for
                  the same rows. Whatever it learns about the sequence
                  &ldquo;A&rdquo; it also learns about &ldquo;䁁&rdquo;, and any
                  gradient that would push the two apart pushes on one set of
                  numbers and moves both. The two characters have become one
                  character as far as everything above the tokenizer is concerned.
                </p>
                <BucketSharers />
                <KeepInMind>
                  Nothing about 65 and 16,449 is special except their difference,
                  which is exactly 16,384. That is the whole condition, and the
                  next section is what follows from it.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. Exactly sixty-seven others, every time">
                <p>
                  Since each hash multiplies and then takes a remainder, two
                  character numbers land in the same bucket under a given hash
                  exactly when their difference is a multiple of the height, or of
                  a divisor of the height where the multiplier and the height
                  share a factor. At 16,384 the multipliers share nothing with the
                  height, so the condition is the same for all eight hashes at
                  once, and two characters agree everywhere or nowhere.
                </p>
                <WhyThisWorks title="Why the multiplier drops out of the condition">
                  <p>
                    Multiplying the difference of two character numbers by an odd
                    number cannot make it a multiple of 16,384 unless it already
                    was one, because 16,384 is a power of two and an odd
                    multiplier contributes no factor of two. So the multiplier
                    changes which bucket a character lands in and changes nothing
                    about which pairs of characters land together, and every one
                    of the eight hashes partitions the characters in the identical
                    way.
                  </p>
                </WhyThisWorks>
                <p>
                  The count follows immediately and it is exact. Unicode has room
                  for 1,114,112 characters and 1,114,112 divided by 16,384 is 68,
                  so every set of buckets stands for exactly 68 characters and
                  every character shares its whole set with exactly 67 others. The
                  letter A shares with 67, of which 10 are characters Unicode has
                  actually assigned, the ideograph above among them. The letter z
                  shares with 67 as well, and so does the Greek eta and the full
                  stop.
                </p>
                <NumberTable
                  headings={[
                    "buckets",
                    "numbers the rows cost",
                    "characters sharing one set",
                  ]}
                  rows={[
                    ["256", "196,608", "4,352"],
                    ["1,024", "786,432", "1,088"],
                    ["4,096", "3,145,728", "272"],
                    ["16,384", "12,582,912", "68"],
                    ["65,536", "50,331,648", "17"],
                    ["262,144", "201,326,592", "4.25"],
                  ]}
                  caption="Each step up the table multiplies the cost by four and divides the crowd by four. The published setting is the fourth row."
                />
                <KeepInMind>
                  The crowd is not a probability and it is not an average. It is a
                  count, fixed by the height before any text arrives, and it is
                  the same 68 for a character in daily use and for a character
                  nobody has ever typed.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. A collision is silent, and permanent">
                <p>
                  Compare the two ways a reading can lose something. A table
                  fitted to a corpus meets a character it does not hold, returns
                  the stand-in, and the stand-in is visible in the numbers, so a
                  caller can count them, decode the text and see exactly what came
                  back wrong. On the Greek sentence there were 17 of them, and
                  reading the numbers back gave 17 stand-ins where letters had
                  been.
                </p>
                <p>
                  A hash produces no such signal. Bucket 2046 looks the same
                  whether one character sends something there or a hundred do, and
                  nothing in the eight numbers a model reads says how crowded they
                  are. The text still comes back exactly, because the character
                  numbers travelled alongside; it is the model&rsquo;s view that
                  lost the distinction, and the model has no way of asking. So a
                  collision is not detected, not reported and not repaired at
                  training time, and the ceiling it puts on what the model can
                  learn was fixed by an arithmetic accident before the first text
                  arrived.
                </p>
                <InAModel>
                  <p>
                    The practical version of this is that a model trained on
                    English will never notice the collision above, since 䁁 does
                    not occur in its training text and the row it shares is
                    entirely A&rsquo;s. The trouble appears when the same model is
                    later given Chinese, at which point the two characters are
                    already tied together in weights that were fitted without
                    either of them being separable. The collision was there all
                    along and only becomes visible when both halves of it are
                    used.
                  </p>
                </InAModel>
                <KeepInMind>
                  A learned table&rsquo;s failure is loud, local and fixable with
                  more text. This one is quiet, global and fixable only by
                  choosing a different height and starting again.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Where a collision would show up in our sentence">
                <p>
                  It is fair to ask whether any of this touches ordinary writing,
                  and on the running sentence at the published height it does not.
                  The sentence uses 24 distinct characters, they produce 24
                  distinct sets of buckets, and every one of the 68 characters
                  sharing any of those sets is somewhere else in the space
                  entirely. A collision needs two characters 16,384 apart and the
                  sentence spans about a hundred.
                </p>
                <p>
                  Narrowing the table brings it into view. At 64 buckets the full
                  stop and the letter n land on the same eight numbers, so the 24
                  distinct characters come out as 23 distinct sets. At 32 buckets
                  three pairs go, D with d, the full stop with n, and A with a, and
                  the sentence arrives at the model with 21 kinds of character in
                  it rather than 24. Set the playground to those widths and the
                  merged characters are marked in the strip.
                </p>
                <NumberTable
                  headings={[
                    "buckets",
                    "distinct characters in the sentence",
                    "distinct sets they produce",
                    "which merged",
                  ]}
                  rows={[
                    ["16,384", "24", "24", "none"],
                    ["64", "24", "23", "the full stop with n"],
                    ["32", "24", "21", "D with d, the full stop with n, A with a"],
                  ]}
                  caption="Measured on the running sentence at three heights, with eight hashes throughout."
                />
                <KeepInMind>
                  Losing the difference between A and a is the kind of damage that
                  reads as a subtle modelling problem later. It arrives here as an
                  arithmetic coincidence at a width somebody chose, and nothing
                  anywhere in the arrangement reports it.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Eight Hashes, and What They Buy",
          content: (
            <>
              <SubSection title="12. The defence, as it is usually stated">
                <p>
                  The standard answer to everything in Part 3 is to hash more than
                  once. Give a character eight buckets from eight different hashes
                  and let the model join eight narrow slices into one row. Two
                  characters that collide under one hash are then still separated
                  by the other seven, and the chance of two characters agreeing in
                  all eight is the chance of agreeing in one raised to the eighth
                  power, which at 16,384 buckets is a number with thirty-three
                  zeros after the point.
                </p>
                <p>
                  That argument is correct for hashes whose collisions are
                  independent, and it is the argument the eight in the published
                  arrangement rest on. It costs nothing in parameters, as section 5
                  showed, so it looks like eight chances for the price of one, and
                  it is the sort of thing a reader accepts without checking.
                </p>
                <KeepInMind>
                  Every word of that paragraph turns on the collisions being
                  independent. The next section is what happened when I counted
                  instead of assuming it.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. What the count says instead">
                <p>
                  The measurement that settles it is a count rather than an
                  estimate. Run every one of the 1,114,112 characters through the
                  arrangement, collect the set of buckets each one produces, and
                  count how many different sets come out. That number is exactly
                  how many kinds of character the arrangement can tell apart, and
                  a defence that works should raise it.
                </p>
                <p>
                  At 16,384 buckets, one hash produces 16,384 distinct sets. Two
                  hashes produce 16,384. Four produce 16,384, and eight produce
                  16,384. The eight hashes buy no separation whatever at the
                  published settings, and the seven extra ones leave the
                  arrangement exactly where the first one left it.
                </p>
                <SeparationChart />
                <p>
                  The chart is the sweep across seven heights, with four bars to a
                  height. In three of the seven the four bars are identical
                  because one hash already reaches the most any arrangement of
                  that height could reach. In the other four the first bar falls
                  short and the second reaches the edge, and in none of the seven
                  does anything change after the second bar.
                </p>
                <KeepInMind>
                  This is a measurement of one hash family and not of the idea of
                  hashing several times. Multiplicative hashes sharing a modulus
                  are not independent, and the section after next is exactly where
                  that shows.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. Why, in one line of arithmetic">
                <p>
                  The reason is visible in the rule and does not need the
                  experiment, though the experiment is what made me look. Every
                  hash multiplies the same quantity, the character number plus
                  one, and reduces by the same height. Reducing by the height at
                  the end means the product only ever depended on the character
                  number through its own remainder on dividing by the height, so
                  every hash reads the character through the same small window.
                </p>
                <Equation>
                  {"two characters differ by a multiple of the height\n" +
                    "  ⇒  every multiplier sends them to one bucket\n" +
                    "  ⇒  no number of hashes tells them apart"}
                </Equation>
                <p>
                  Which gives a ceiling rather than a probability. Whatever the
                  number of hashes, the arrangement can distinguish at most as
                  many kinds of character as there are buckets, because each
                  character is read only through a value in that range. Eight
                  hashes at 16,384 buckets cannot see more than 16,384 kinds of
                  thing, and one hash already sees all of them, which is why the
                  bars are the same length.
                </p>
                <WhyThisWorks title="Why the first hash reaches the ceiling here">
                  <p>
                    A multiplier that shares no factor with the height merely
                    shuffles the remainders, sending each of the possible
                    remainders to a different bucket and none to the same one. At
                    16,384, which is a power of two, every odd multiplier does
                    that, so the first hash on its own already separates every
                    remainder from every other and there is no ground left for the
                    second hash to recover.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  The claim being corrected is narrow and worth stating carefully.
                  Several independent hashes really do multiply the protection.
                  These eight are not independent, and being drawn from eight
                  different primes does not make them so, because it is the shared
                  remainder step rather than the multiplier that decides which
                  characters collide.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. The height where a second hash does buy something">
                <p>
                  The condition is now precise enough to construct a case where
                  the defence works, which is the honest way to show what it
                  actually depends on. Take 93 buckets, which is 3 times 31, and
                  the first multiplier 31 shares that factor. Multiplying the
                  remainders by 31 and reducing by 93 collapses them onto just
                  three values, so one hash at that height distinguishes 3 kinds
                  of character out of a possible 93.
                </p>
                <p>
                  Now bring in the second multiplier, 43, which shares nothing
                  with 93. It shuffles the remainders rather than collapsing them,
                  so the pair of hashes together distinguishes all 93, which is
                  the ceiling. The second hash took the arrangement from 3 to 93
                  and the third through eighth took it no further, because there
                  was nowhere further to go.
                </p>
                <NumberTable
                  headings={["buckets", "1 hash", "2 hashes", "4 hashes", "8 hashes"]}
                  rows={[
                    ["93", "3", "93", "93", "93"],
                    ["256", "256", "256", "256", "256"],
                    ["961", "31", "961", "961", "961"],
                    ["1,333", "43", "1,333", "1,333", "1,333"],
                    ["2,048", "2,048", "2,048", "2,048", "2,048"],
                    ["3,999", "129", "3,999", "3,999", "3,999"],
                    ["16,384", "16,384", "16,384", "16,384", "16,384"],
                  ]}
                  caption="Kinds of character told apart, counted over all 1,114,112 of them. Every row reaches its own height by the second column at the latest."
                />
                <KeepInMind>
                  The extra hashes are worth something exactly when the first one
                  was badly matched to the height, and what they buy back is the
                  ground it lost rather than any new ground. A single well-chosen
                  multiplier reaches the same place.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. How often that happens, and where it stops">
                <p>
                  One case proves the condition is real and says nothing about how
                  often it bites, so I counted that too, over every height from 2
                  to 2,000. A single hash falls short of its ceiling at 64 of
                  those 1,999 heights, and all 64 are multiples of 31, which is
                  the first multiplier and is what the argument in section 14
                  predicts. That is a little over three per cent of the widths
                  anybody might choose.
                </p>
                <p>
                  Two hashes fall short at none of them. Not a few, not a handful,
                  none, across all 1,999 heights. So for this family the third
                  hash and every hash after it are provably worth nothing at any
                  width whatever, and the second is worth something only where the
                  first multiplier happens to divide the height. The published
                  arrangement chose a power of two, which no odd multiplier
                  divides, so it is in the ninety-seven per cent where even the
                  second buys nothing.
                </p>
                <NumberTable
                  headings={["heights from 2 to 2,000", "count"]}
                  rows={[
                    ["where one hash falls short of the ceiling", "64"],
                    ["of those, multiples of 31", "64"],
                    ["where two hashes fall short of the ceiling", "0"],
                  ]}
                  caption="Counted at every height in the range rather than sampled, with the eight published multipliers."
                />
                <KeepInMind>
                  The eight hashes are not doing harm and they are not doing
                  nothing at all, since they give the model eight narrow tables
                  rather than one wide one and that is a real difference in how
                  the row is assembled. What they are not doing is protecting
                  against collisions, which is the reason they were there.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. The Same Idea on a Piece of a Word",
          content: (
            <>
              <SubSection title="17. A word as the set of buckets its pieces light">
                <p>
                  The same move applies one level up, and it is worth a section
                  because it buys something the character version cannot. Wrap a
                  word in a boundary mark, cut it into every run of three
                  characters, hash each of those runs into a bucket, and let the
                  word be the set of buckets that came up. A word of n characters
                  gives n runs, so the word cat wrapped as _cat_ gives _ca, cat
                  and at_.
                </p>
                <p>
                  What arrives at the model is a set rather than a sequence, and a
                  word&rsquo;s row is the sum of the rows of its active buckets.
                  Two words spelled alike share pieces, so they share buckets, so
                  they share rows before any training has happened at all. That
                  overlap is the point of doing it this way, and it is free.
                </p>
                <TrigramFingerprints />
                <KeepInMind>
                  The boundary mark has to be a character the words do not
                  contain, or an inner run of three will be mistaken for one at an
                  edge. An underscore is the usual choice and is exactly wrong for
                  identifiers written in snake case.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. cat and cats, worked">
                <p>
                  At 8,192 buckets and one hash, cat lights three buckets and cats
                  lights four, and two of them are the same two. The shared ones
                  are the pieces the two words share, _ca and cat, and the
                  difference is that cat ends with at_ where cats has ats and ts_.
                </p>
                <WorkedExample title="Two words, five pieces between them">
                  <Equation>
                    {"cat    _ca  cat  at_          2002   5665   6052\n" +
                      "cats   _ca  cat  ats  ts_    1676   2002   5665   6072"}
                  </Equation>
                  <p>
                    The overlap is 2 of the 3 and 4. Nothing was learned to
                    produce that, and no list anywhere records that cats is a form
                    of cat; the two words share rows because they share letters
                    and the hash is a function of the letters. Put cat beside dog
                    and the overlap is 0, which is what it should be.
                  </p>
                </WorkedExample>
                <p>
                  The effect survives longer words and heavier changes. The word
                  analysis lights 8 buckets and reanalysis lights 10, and 7 of
                  them are shared, so a model meeting reanalysis for the first
                  time already holds seven of the eight rows it built for
                  analysis. Cost and costs share 3 of 4 and 5.
                </p>
                <KeepInMind>
                  This is the thing a learned subword vocabulary does not give.
                  Merging spells cat and cats as two entries with unrelated
                  numbers, and the model has to learn from data that they mean
                  nearly the same thing, once for every inflection and once for
                  every language.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. What it costs, and where the pieces pile up">
                <p>
                  In positions this is the cheapest reading on either of these two
                  pages. Our sentence becomes 7 positions, one per whitespace
                  word, against 25 under a vocabulary merged from the eighteen
                  sentences and 51 under either character reading. What is spent
                  instead is lookups, since those 7 positions light 45 buckets
                  between them and each one is a row fetched and added.
                </p>
                <NumberTable
                  headings={["reading", "positions the sentence becomes"]}
                  rows={[
                    ["a set of buckets per word", "7"],
                    ["pieces merged from eighteen sentences", "25"],
                    ["one bucket set per character", "51"],
                    ["one number per byte", "51"],
                  ]}
                  caption="The same sentence under four readings. The whitespace split keeps the full stops attached, so Dr. and re-analysis. are one word each."
                />
                <p>
                  The pieces do not spread evenly, and the count is worth having
                  because it is the collision question again in a new place.
                  Twenty-six lowercase letters and the boundary mark make 19,683
                  possible runs of three, and at 8,192 buckets those fall into 8,122 of the
                  8,192, with 2.423 to a bucket on average and 5 in the heaviest.
                  The run nal, which is inside our own word re-analysis, shares
                  bucket 3245 with yme and with aaa.
                </p>
                <p>
                  Whether that matters depends on whether the collisions land in
                  the same word, and mostly they do not. Across all 17,576
                  three-letter words at a deliberately narrow 512 buckets there
                  are 17,570 distinct fingerprints, so 6 pairs of words are
                  genuinely indistinguishable, fek with hab among them. A word
                  lights several buckets and two words have to agree on all of
                  them, which is a much harder coincidence than one piece landing
                  on another.
                </p>
                <KeepInMind>
                  A shared bucket between two pieces is not the same failure as a
                  shared set between two characters. A word is several buckets, so
                  one collision blurs a word slightly and it takes an agreement
                  across the whole set to lose a word entirely.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. The two things this one cannot do">
                <p>
                  A set of buckets is not a word, and nothing reads one back. Many
                  words produce a given fingerprint and the method holds no list
                  of which, so recovering the word means keeping a list of
                  candidate words, fingerprinting each and answering with whichever
                  candidate matches best. That list is a fact about the task rather
                  than about the method, which is why the method offers a way of
                  comparing two fingerprints and no way of decoding one.
                </p>
                <p>
                  And a set cannot count. The word aaa gives the pieces _aa, aaa
                  and aa_, and aaaa gives _aa, aaa, aaa and aa_, which is the same
                  three once the repeat is dropped, so those two words have exactly
                  the same fingerprint at any width whatever and aaaaa has it too.
                  The boundary is precise rather than general. The words baa and
                  baaa do differ, because the extra letter there produced the run
                  aaa which the shorter word did not have.
                </p>
                <NumberTable
                  headings={["word", "pieces", "distinct buckets", "same as aaa"]}
                  rows={[
                    ["aaa", "_aa, aaa, aa_", "3", "itself"],
                    ["aaaa", "_aa, aaa, aaa, aa_", "3", "yes"],
                    ["aaaaa", "_aa, aaa, aaa, aaa, aa_", "3", "yes"],
                    ["baa", "_ba, baa, aa_", "3", "no"],
                    ["baaa", "_ba, baa, aaa, aa_", "4", "no"],
                  ]}
                  caption="Measured at 262,144 buckets. The last column is decided by which pieces each word holds rather than by where the hash sent them, which is why baaa parts from aaa despite the repeated letters."
                />
                <KeepInMind>
                  Nothing about the loss in the middle three rows is a collision,
                  and calling it one would hide the cause. A set records which
                  pieces occurred and never how many times, so any two words made
                  of the same pieces are one word here.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Where the Method Stops Being Defined",
          content: (
            <>
              <SubSection title="21. Reading a bucket back is undefined, and by exactly how much">
                <p>
                  Every other reading in this section can be run backwards. A byte
                  number names one byte, an entry of a merged vocabulary names one
                  piece of writing, and reading the numbers back is a lookup. Ask
                  which character a set of buckets stands for and the question has
                  no single answer, since the map from characters to sets is many
                  to one by construction, and at 16,384 buckets it is exactly 68 to
                  one.
                </p>
                <p>
                  So there is nothing here to argue about and no implementation
                  choice to make. The information was destroyed by the remainder
                  step and no procedure recovers it. Any arrangement that wants its
                  text back has to carry the character numbers alongside the
                  buckets, which is what happens in practice, and it means the
                  claim &ldquo;no vocabulary&rdquo; is a claim about the
                  model&rsquo;s table rather than about the pipeline. The
                  characters are still there; they are simply not what the model
                  reads.
                </p>
                <KeepInMind>
                  The 68 is a fact about the arithmetic rather than about any
                  particular text, so it holds for a character in constant use and
                  for one nobody has typed, and it is the same 68 before any
                  training and after all of it.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. The height has no setting the mathematics prefers">
                <p>
                  Everything on this page turns on one number and nothing on this
                  page determines it. Raising the height multiplies the rows and
                  divides the crowd in exact proportion, and the two move smoothly
                  against each other with no corner anywhere, so there is no
                  height at which something changes character and no height a
                  derivation arrives at.
                </p>
                <WidthTradeChart />
                <p>
                  What can be said is what each end costs. At 256 buckets the rows
                  cost the same 196,608 as the byte table and every set of buckets
                  stands for 4,352 characters, which is a model that cannot tell
                  most letters apart. At 262,144 the crowd is down to 4.25
                  characters to a set and the rows have reached 201,326,592, which
                  is nearly a quarter of the complete table this page set out to
                  avoid. Somewhere in between is a choice, and it is a choice about
                  which scripts the model is expected to read rather than a fact
                  about hashing.
                </p>
                <KeepInMind>
                  A number chosen by measurement on the writing at hand is a
                  perfectly good answer. A number quoted from a published
                  arrangement is a fact about that arrangement&rsquo;s intended
                  languages, and the crowd it implies is the number worth checking
                  before adopting it.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. Nothing two characters have in common survives">
                <p>
                  There is one limit here that no width fixes and it is not a
                  degenerate input at all. Characters are related to one another in
                  ways a table could hold. The capital and lowercase forms of a
                  letter behave alike, the ten digits behave alike, the accented
                  variants of a Latin letter behave more like it than like
                  anything else. A learned table can put those rows near each
                  other and a character usually seen in one context can drift
                  towards the characters it appears beside.
                </p>
                <p>
                  The hash destroys every one of those relationships on the way in.
                  A and a differ by 32 in their character numbers, so at 16,384
                  buckets they land 32 multiplied by each multiplier apart, in
                  positions with no more in common than any other pair. Two
                  characters that behave identically gain nothing whatever from
                  that, and the model has to learn each of their rows from scratch
                  and separately. Whatever regularity the writing system had is
                  outside what this arrangement can express.
                </p>
                <p>
                  The arithmetic is orderly even so, which turns out not to help.
                  Consecutive characters land in buckets exactly one multiplier
                  apart, so a is 3038 under the first hash and b is 3069, and every
                  run of the alphabet is an evenly spaced run of buckets. Rows of a
                  table have no order among themselves, so a model reading row 3038
                  has no way of noticing that b sits 31 rows further on, and the
                  twenty-six letters lie in an arithmetic progression that nothing
                  above the table can see.
                </p>
                <KeepInMind>
                  This is where the method is worse than the fitted character
                  table it replaced, on a corpus that fitted table covers. That
                  table gives every character its own row and can arrange those
                  rows however the data suggests, and it pays for that only on
                  characters the corpus never showed it.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. The cases where the arithmetic decides nothing">
                <p>
                  Gathered in one place, these are the inputs and the settings on
                  which the method stops being defined rather than becoming
                  approximate, together with what has to be decided in each case
                  and what turns on the decision. The ones with a genuine choice
                  attached are the ones worth attention, since nothing in the
                  arithmetic makes them and somebody has to.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what is undefined, or what must be decided"
                  rows={[
                    {
                      expression: "which character a bucket stands for",
                      reason:
                        "undefined, with no choice attached. The map from characters to sets of buckets is many to one, and at 16,384 buckets exactly 68 characters answer to every set, so the question names 68 characters rather than one. Any reading that must reproduce its input carries the character numbers alongside.",
                    },
                    {
                      expression: "how many buckets",
                      reason:
                        "a decision the mathematics does not make. Cost and crowd move in exact proportion with no corner between them, so 256 buckets cost 196,608 numbers and put 4,352 characters on every set, and 262,144 cost 201,326,592 and put 4.25. Measure the crowd against the scripts the model is meant to read; a figure taken from somebody else’s arrangement is a fact about their languages.",
                    },
                    {
                      expression: "how many hashes",
                      reason:
                        "settled above two, for this family. Every hash reads the character through its remainder on dividing by the height, so the height is a ceiling nothing passes, and two hashes reach it at all 1,999 heights from 2 to 2,000. The choice matters only for how the row is assembled from slices.",
                    },
                    {
                      expression: "a multiplier sharing a factor with the height",
                      reason:
                        "defined and badly behaved, which is the one case where the count of hashes earns anything. At 93 buckets the multiplier 31 collapses the whole space onto 3 kinds of character where 93 were available, and a second multiplier coprime to 93 restores all 93. Choose the height and the multipliers to be coprime and one hash is enough.",
                    },
                    {
                      expression: "two characters that behave alike",
                      reason:
                        "outside the method entirely. A and a land in unrelated positions, so nothing they share is expressible and the model learns each row separately. A learned table can place related rows near each other and this cannot, which is the price of computing the position rather than storing it.",
                    },
                    {
                      expression: "a character Unicode has assigned nothing to",
                      reason:
                        "defined, and this is the case the whole method exists for. The rule takes a number and returns a number, so an unassigned position gets buckets exactly as a letter does, and it shares them with the same 68. Nothing has to be refitted when Unicode assigns it later.",
                    },
                    {
                      expression: "a repeated piece inside a word",
                      reason:
                        "defined and lossy, in the word version only. A word is the set of buckets its three-character runs light and a set cannot count, so aaa, aaaa and aaaaa produce the identical fingerprint at every width. The alternative is to record how often each bucket was lit, which makes the representation a count rather than a set and changes what the model reads.",
                    },
                    {
                      expression: "the boundary mark around a word",
                      reason:
                        "a decision, and the natural default is wrong for some text. It must be a character the words never contain, or an inner run of three is read as one at an edge, and the usual underscore is contained by anything written in snake case. A space serves where a whitespace split guarantees the words hold none.",
                    },
                    {
                      expression: "a word with nothing in it",
                      reason:
                        "undefined in the word version, where a word of n characters has n runs of three and a word of none has none, so there is no set to hand back at all. A single character is fine and gives one run, the mark on both sides of it at once.",
                    },
                  ]}
                />
                <KeepInMind>
                  Two of these are worth carrying. The height is a free choice with
                  a measured trade and no principled setting, so any arrangement
                  has to say which height it used and what crowd that implies. And
                  the number of hashes is not the defence it is usually taken for,
                  because these hashes share the step that decides which characters
                  collide.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
