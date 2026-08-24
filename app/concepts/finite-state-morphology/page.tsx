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
import { ManyReadings } from "@/components/widgets/ManyReadings";
import { MorphologyPlayground } from "@/components/widgets/MorphologyPlayground";
import { TheMachine } from "@/components/widgets/TheMachine";
import { WalkThroughAWord } from "@/components/widgets/WalkThroughAWord";
import { WhatItCanRead } from "@/components/widgets/WhatItCanRead";
import { WordsAnalysed, WordsNotRead } from "@/components/widgets/WordsAnalysed";
import { WrittenAgainstLearned } from "@/components/widgets/WrittenAgainstLearned";

export const metadata: Metadata = {
  title: "Finite-State Morphology · oop_ml",
  description:
    "Write a language’s stems and endings down as a machine, and a word walked through it comes back with its parts named. What that buys over a vocabulary learned by counting, and what it costs to write.",
};

const SENTENCE = "Dr. Alvarez didn't expect the low-cost re-analysis.";

export default function FiniteStateMorphologyPage() {
  return (
    <ConceptPage
      title="Finite-State Morphology"
      tagline="Write a language’s stems and endings down as a machine, and a word walked through it comes back with its parts named. What that buys over a vocabulary learned by counting, and what it costs to write."
      prerequisites={
        <>
          It helps to have met one method that learns its pieces from a corpus,
          since this page is written against that family; byte pair encoding or
          the unigram language model will do, and either one is enough. Nothing
          else is needed. There is no training here at all, no probability and
          no counting, and the only arithmetic on the page is counting up what a
          grammar accepts once somebody has written it.
        </>
      }
      history={
        <>
          <p>
            Kimmo Koskenniemi was working on Finnish at the University of
            Helsinki at the start of the 1980s, and Finnish is the language that
            makes the problem impossible to avoid. A Finnish noun has thousands
            of written forms, so nobody can list them, and a system that reads
            Finnish has to take a word apart instead of looking it up. The
            machinery available for taking words apart at the time came from
            generative phonology, where a form is derived by applying rewrite
            rules one after another in a fixed order, and running that backwards
            to recover the parts from the spelling meant undoing an ordered
            derivation, which is slow and awkward. Koskenniemi&rsquo;s 1983
            doctoral thesis, Two-Level Morphology, replaced the ordered
            derivation with a set of constraints that all hold at once between
            two levels of representation, the spelling a reader sees and the
            analysis underneath it, and each constraint is a finite-state
            machine.
          </p>
          <p>
            What made that practical was a result from Xerox PARC. Ronald Kaplan
            and Martin Kay had shown that phonological rewrite rules of the
            ordered kind are themselves finite-state relations and can be
            compiled into transducers, work they had been presenting since the
            early 1980s and published in full in Computational Linguistics in
            1994. If the rules are transducers and the lexicon is a transducer,
            then composing them gives one machine that reads a word and writes
            its analysis, and it runs in time proportional to the length of the
            word rather than to the size of the vocabulary. Xerox built the
            toolchain around that, a lexicon compiler and a rule compiler, and
            Kenneth Beesley and Lauri Karttunen wrote it up in Finite State
            Morphology in 2003. Helsinki later produced an open reimplementation
            of the same tools, and Tim Buckwalter&rsquo;s Arabic analyser,
            released through the Linguistic Data Consortium in 2002, is the same
            object in a plainer form, three tables of prefixes, stems and
            suffixes with a fourth saying which of them may join.
          </p>
          <p>
            This page asks six questions in order. What do all the methods
            earlier in this section have in common, and what does that commit
            them to? What does it mean to write a language down as a machine,
            and what is the machine? What comes back when a word is walked
            through it, and how is that more than a place to cut? What do the
            written lines buy, measured against a vocabulary of the same size
            learned by counting? What happens to a word the grammar has never
            been told about? And what happens to a word it can read in more than
            one way? The sentence this section carries is where the last two
            questions land hardest, since a grammar written by hand reads almost
            none of it, and the one word it does read it reads correctly and
            with the parts named.
          </p>
        </>
      }
      playground={<MorphologyPlayground />}
      sections={[
        {
          title: "Part 1. Where the Pieces Have Come From Until Now",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. Every piece so far was found by counting">
                <p>
                  Byte pair encoding merges the pair of symbols that occurs most
                  often. The unigram model starts from a large set of pieces and
                  drops whichever is least missed. The method that searches for
                  the set of pieces describing a corpus in the fewest bits is
                  measuring the corpus too, and so is the one that picks the
                  pieces covering the most text. Every one of them arrives at a
                  vocabulary by asking a body of text a question and reading the
                  answer off, which means every one of them inherits whatever
                  that body of text happened to contain.
                </p>
                <p>
                  That is not a criticism, and it is the reason those methods
                  work on languages nobody on the team speaks. It is a
                  commitment, though, and it is worth being precise about what
                  is being committed to. The pieces are wherever the counts fall.
                  Nothing in any of those methods knows that{" "}
                  <span className="font-mono">re</span> is a prefix, that{" "}
                  <span className="font-mono">ed</span> makes a past tense, or
                  that <span className="font-mono">bake</span> and{" "}
                  <span className="font-mono">bak</span> are the same word
                  spelled two ways, and if the counts put a boundary in the
                  middle of a suffix then the middle of a suffix is where the
                  boundary is.
                </p>
                <KeepInMind>
                  A learned vocabulary is a summary of a corpus. Everything it
                  knows came from there, everything it does not know was absent
                  from there, and it has no way of telling those two apart.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Where the counts put the cut">
                <p>
                  I wanted a fair look at this and not a rigged one, so instead
                  of fitting a vocabulary on a scrap of text I gave it
                  the friendliest corpus I could construct. The grammar this page
                  builds later accepts 1,074 different words; I put every one of
                  those words in a corpus exactly once and fitted a vocabulary of
                  178 pieces on it, which is the same number of lines the grammar
                  takes to write. Nothing was held back, nothing was rare, and
                  the words were all inflections of one another.
                </p>
                <p>
                  On three of the six words I looked at the two answers agree.
                  On the other three they part company in a specific way.{" "}
                  <span className="font-mono">recovers</span> comes back from the
                  counting as <span className="font-mono">recov</span> and{" "}
                  <span className="font-mono">ers</span>, and{" "}
                  <span className="font-mono">bakes</span> comes back as{" "}
                  <span className="font-mono">bak</span> and{" "}
                  <span className="font-mono">es</span>. Both cuts fall one
                  character to the left of where the word is jointed, because{" "}
                  <span className="font-mono">ers</span> and{" "}
                  <span className="font-mono">es</span> are frequent endings of
                  written words and the counts have no opinion about which
                  characters belong to the stem.{" "}
                  <span className="font-mono">measured</span> misses in the other
                  direction, as <span className="font-mono">measure</span> and{" "}
                  <span className="font-mono">d</span>, where the grammar says{" "}
                  <span className="font-mono">measur</span> and{" "}
                  <span className="font-mono">ed</span> because the stem drops its
                  final e.
                </p>
                <p>
                  The other half of it is that the answer moves when the budget
                  moves. At 178 pieces,{" "}
                  <span className="font-mono">measured</span> is cut as{" "}
                  <span className="font-mono">measure</span> and{" "}
                  <span className="font-mono">d</span>; at 356 it is one piece
                  and is not cut at all, and{" "}
                  <span className="font-mono">unnamed</span> goes from three
                  pieces to two by absorbing the prefix into the stem. A written
                  grammar answers the same thing at every size, since nothing in
                  it was chosen by counting.
                </p>
                <WrittenAgainstLearned />
                <p>
                  The widget above is used again in section 15 for the numbers
                  down its left-hand side. For now the column worth looking at is
                  the right-hand one, which does not change when the button
                  changes.
                </p>
                <KeepInMind>
                  A learned boundary is a fact about a corpus at a chosen size.
                  Ask for a different size and you get a different boundary in
                  the same word, and neither answer is wrong on its own terms,
                  since what those terms measure is how often two characters
                  turn up together and never how the word was built.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. The other way to get the pieces">
                <p>
                  The alternative is old and it is not complicated. Somebody who
                  knows the language writes down its stems, writes down its
                  endings, and writes down which endings may follow which stems.
                  A word is then read by finding a way of spelling it out of
                  those pieces in an order the writer allowed, and what comes
                  back is not only where the word divides but what each division
                  is doing.
                </p>
                <p>
                  Our sentence has a word of exactly this shape.
                </p>
                <Equation>{SENTENCE}</Equation>
                <p>
                  A reader who knows English sees{" "}
                  <span className="font-mono">re-analysis</span> as{" "}
                  <span className="font-mono">re</span> in front of{" "}
                  <span className="font-mono">analysis</span>, and would say
                  without hesitating that the prefix means again. That reading
                  does not depend on having seen the word before, which is the
                  whole point, and it is the thing a person can write down and a
                  count cannot discover. What follows is what happens when
                  somebody does write it down.
                </p>
                <KeepInMind>
                  A learned vocabulary holds what its corpus held. A written
                  grammar holds what somebody knew about the language, so the
                  cost of the method is the work of getting that out of them and
                  into a file, and that work is done by hand and by one language
                  at a time.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 2. A Grammar Is a Machine",
          content: (
            <>
              <SubSection title="4. States, and steps that read something">
                <p>
                  Writing the pieces down is one thing and writing down the
                  order they may come in is another, and the second is what turns
                  a list into a machine. Think of reading a word as standing
                  somewhere, taking some characters, and arriving somewhere else.
                  Where you are standing is not a position in the word; it is a
                  summary of what may legitimately come next, which is why there
                  are only a handful of places to stand however long the word is.
                </p>
                <p>
                  A place to stand is a state. A step out of a state carries four
                  things, and every step reads at least one character.
                </p>
                <Equation>
                  {"a step  =  ( state,  spelling,  label,  next state )"}
                </Equation>
                <p>
                  One state is where every word starts. One more is the end, and
                  it is not a place with steps out of it; it is the condition
                  that the word has finished exactly here. So reading a word
                  means finding a run of steps that begins at the start, spells
                  the word out with nothing left over, and stops at the end.
                </p>
                <Equation>
                  {
                    "a reading  =  steps s₁ … sₖ  with  spelling(s₁) + … + spelling(sₖ) = the word"
                  }
                </Equation>
                <WhyThisWorks>
                  <p>
                    The requirement that every step reads at least one character
                    is the reason the search finishes. Each step moves strictly
                    to the right in the word, so no run of steps can be longer
                    than the word is, and a state that leads back to itself
                    cannot be visited forever. Machines of this kind normally
                    allow a step that reads nothing, and then a loop of such
                    steps has to be detected and removed before anything can be
                    walked. Forbidding them costs one thing, which section 8 is
                    about, and buys termination with no check at all.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  The states are the grammar&rsquo;s claim about what may follow
                  what. A machine with one state says nothing may not follow
                  anything; a machine with a state per part of speech says a
                  plural ending may follow a noun and not a verb.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. The whole grammar, written out">
                <p>
                  Here is a grammar small enough to print completely. It has
                  three verbs in it, one of which is also a noun, and their
                  endings. It is 16 lines and 5 states, and I am showing it whole
                  because everything on the rest of this page is this object made
                  larger.
                </p>
                <TheMachine grammarKey="small" />
                <p>
                  Read one line of the table as a sentence. Standing in the start
                  state, read the characters{" "}
                  <span className="font-mono">walk</span>, call them the verb
                  walk, and go to the verb ending state. Standing in the verb
                  ending state, read <span className="font-mono">ed</span>, call
                  it a past tense, and the word ends here. That is two steps and
                  it is the whole of reading{" "}
                  <span className="font-mono">walked</span>.
                </p>
                <p>
                  Two things in the table are worth noticing now because they are
                  the subjects of sections 8 and 13. Every stem appears twice,
                  once going to an ending and once going straight to the end. And{" "}
                  <span className="font-mono">bake</span> appears a third time
                  spelled <span className="font-mono">bak</span>, going to a state
                  of its own.
                </p>
                <KeepInMind>
                  Sixteen lines accept exactly twelve words. That is a small
                  number, and section 14 is about how fast it stops being small
                  when the same three columns hold a real stem list.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Walking a word through it">
                <p>
                  Now take <span className="font-mono">walked</span> and walk it.
                  The machine begins in the start state at the first character.
                  It looks for a line whose spelling begins there, finds{" "}
                  <span className="font-mono">walk</span>, takes it, and is now in
                  the verb ending state at the fifth character. It looks again,
                  finds <span className="font-mono">ed</span>, takes it, and that
                  line says the word ends here, which it does.
                </p>
                <p>
                  The widget below shows that as two rows. The first is each
                  character of the word with the state it was read in written
                  underneath, so the machine stops being an abstraction and
                  becomes something running along the word. The first four
                  characters are read in the start state and the last two in the
                  verb ending state, and the place where the label changes is the
                  place the word divides.
                </p>
                <WalkThroughAWord word="walked" />
                <WorkedExample>
                  <p>
                    Five lines are tried to read{" "}
                    <span className="font-mono">walked</span> and two of them
                    lead anywhere. The three that do not are the other lines
                    whose spelling is also{" "}
                    <span className="font-mono">walk</span>, since the start
                    state holds four of those, one going to the verb ending, one
                    going to the noun ending, and two saying the word could end
                    after the stem. All three of those are perfectly good steps
                    and none of them can be completed, because there is an{" "}
                    <span className="font-mono">ed</span> still to account for
                    and neither the noun ending nor the end of the word can
                    account for it.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  Reading a word means trying lines and abandoning the ones
                  that cannot be completed, so the machine has no way of knowing
                  which line was the right one until it has tried finishing the
                  word from there.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. The search backs out of dead ends">
                <p>
                  Press <span className="font-mono">bakes</span> in the widget
                  above and the search does something more interesting. Four lines
                  are tried. The first takes{" "}
                  <span className="font-mono">bake</span> into the state of
                  endings beginning with a consonant, finds{" "}
                  <span className="font-mono">s</span> there, and finishes. The
                  second takes <span className="font-mono">bake</span> as a whole
                  word and cannot, since there is an{" "}
                  <span className="font-mono">s</span> left. The third takes{" "}
                  <span className="font-mono">bak</span> into the state of endings
                  beginning with a vowel, and nothing in that state spells{" "}
                  <span className="font-mono">es</span>, so the search backs out.
                </p>
                <p>
                  That third branch is the one worth watching, because it is the
                  machine considering a reading a reader would never entertain
                  and rejecting it for a reason written into the grammar rather
                  than guessed at. Backing out costs nothing here and the section
                  on ambiguity is about the case where it costs a great deal.
                </p>
                <InAModel>
                  <p>
                    A real analyser does not search. Its lexicons are compiled
                    into one machine and then minimised, so that reading a word
                    is a single pass through it taking time proportional to the
                    number of characters rather than to the number of lines.
                    That compilation is exactly what makes this method usable on
                    a lexicon of a quarter of a million stems. Walking the lines
                    directly, as here, answers the same question and is the same
                    grammar; it is slower by whatever the search costs, and it
                    shows the reasoning, which a compiled machine cannot.
                  </p>
                </InAModel>
                <KeepInMind>
                  Every line the search tries and abandons is a reading the
                  grammar allows locally and forbids as a whole. There is no
                  probability involved in the abandonment and no threshold; the
                  path simply does not reach the end of the word.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. Why a bare stem is written twice">
                <p>
                  In the printed grammar,{" "}
                  <span className="font-mono">walk</span> appears once going to
                  the verb ending state and once going straight to the end. That
                  looks like a redundancy and it is not, and the reason is the
                  rule that every step reads at least one character.
                </p>
                <p>
                  English marks the present tense of most verbs with nothing at
                  all, so the natural way to write it is a step that reads no
                  characters and calls them a present tense. Allowing steps like
                  that means allowing a run of them, which means a machine can go
                  round a loop forever without moving along the word, and every
                  walk then needs a check for that. Writing the stem a second
                  time with the end as its next state says the same thing and
                  cannot loop.
                </p>
                <WhyThisWorks>
                  <p>
                    The two are the same claim. A step reading nothing from the
                    verb ending state to the end says a word may finish after the
                    stem; a second copy of the stem line going to the end says a
                    word may finish after the stem. What is lost is that the
                    second version cannot label the absence, so a bare{" "}
                    <span className="font-mono">walk</span> comes back as the
                    verb walk rather than as the verb walk in the present tense.
                    Where that label matters, the usual repair is a step that
                    reads some character the surrounding system agrees is
                    invisible, which is trading one awkwardness for another.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  Anything a grammar wants to say about a piece that is not there
                  has to be said by a line that is. That is a real constraint and
                  it shows up in the shape of every lexicon written this way.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. What a grammar accepts is a list you could print">
                <p>
                  Because every step reads a character and none of these states
                  can be reached from itself, the set of words a grammar accepts
                  is finite, and it can be worked out with no word in hand at all
                  by walking every path from the start to the end. The small
                  grammar accepts twelve words, which the widget in section 5
                  lists in full.
                </p>
                <p>
                  Doing the same to those twelve paths turns up something else.
                  There are fourteen paths and twelve words, so two of the words
                  are spelled by two different paths each. Those two are{" "}
                  <span className="font-mono">walk</span> and{" "}
                  <span className="font-mono">walks</span>, and they are the
                  subject of section 20.
                </p>
                <NumberTable
                  headings={["grammar", "states", "lines", "words accepted", "readings"]}
                  rows={[
                    ["three verbs and their endings", "5", "16", "12", "14"],
                    ["the same, before the spelling change", "3", "12", "12", "14"],
                    ["thirty-six verbs, forty nouns, three prefixes", "6", "178", "1074", "1184"],
                  ]}
                  caption="Every path from the start state to the end, counted for the three grammars this page uses. Two of the small grammar’s twelve words have two readings each, and 108 of the larger grammar’s have more than one."
                />
                <KeepInMind>
                  A grammar is a compressed statement of a word list. The
                  compression is the point, and section 14 measures it.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. An Analysis Says What Each Piece Is",
          content: (
            <>
              <SubSection title="10. The labels are the answer">
                <p>
                  Every method earlier in this section answers with places. Here
                  is a word, here is where it divides, get on with it. This method
                  answers with places and with names, because every line of the
                  grammar carries a label and a reading is a run of lines, so the
                  labels come out with the pieces at no extra cost.
                </p>
                <p>
                  Set the two side by side on{" "}
                  <span className="font-mono">walked</span>. A learned vocabulary
                  says the word is <span className="font-mono">walk</span>{" "}
                  followed by <span className="font-mono">ed</span>. The grammar
                  says the word is the verb walk in the past tense, and that the
                  past tense is spelled with the second piece. Those are different
                  kinds of answer, and the second is the one a system doing
                  anything grammatical downstream actually wants.
                </p>
                <Equation>{"walked   →   walk+V +PAST"}</Equation>
                <p>
                  The notation is the one this tradition has used since the
                  Xerox tools, a stem with a part of speech on it followed by the
                  features the endings contributed. It is a string and not a
                  structure because that is what analysers in this family report,
                  and because it sorts, which section 12 needs.
                </p>
                <KeepInMind>
                  The labels are not derived from the pieces. They were written
                  down beside them by the person who wrote the grammar, which is
                  why no amount of counting produces them.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Several words read">
                <p>
                  Four words, read by the grammars on this page, with what every
                  piece was identified as underneath it. The last of them,{" "}
                  <span className="font-mono">reopeners</span>, is read by the
                  larger grammar of Part 4 and not by the small one, because the
                  small one has no prefixes in it.
                </p>
                <WordsAnalysed />
                <p>
                  The fourth is the one to look at. It has four pieces and each
                  of them carries a different kind of claim, since a prefix
                  meaning again, a verb, an ending that turns the verb into the
                  person who does it and a plural on the result are four
                  different sorts of thing to know. Nothing about that reading
                  needed the word to have been seen, and{" "}
                  <span className="font-mono">reopeners</span> is not a word I
                  would expect to find in a corpus of any size.
                </p>
                <KeepInMind>
                  A grammar reads words nobody has written, and reads them
                  correctly, because a stem it holds and an ending it holds
                  combine whether or not the combination was ever used. That is
                  the same property section 14 counts, which is how 178 lines
                  come to accept 1,074 words.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. Cutting a word by its reading, and which reading is taken">
                <p>
                  A tokenizer downstream wants pieces and not labels, so the
                  analyser has to be able to hand a word on as a cut. When a word
                  has one reading that is unambiguous. When it has several, one
                  of them has to be chosen, and nothing in the grammar chooses.
                </p>
                <p>
                  So a rule is imported from outside. The reading with the fewest
                  pieces wins; if several tie, the one whose label string sorts
                  first wins; if several still tie, the one whose pieces sort
                  first wins. On <span className="font-mono">walks</span>, both
                  readings have two pieces, and{" "}
                  <span className="font-mono">walk+N +PL</span> sorts before{" "}
                  <span className="font-mono">walk+V +3SG</span> because the
                  letter N comes before V, so the plural noun is what is handed
                  on.
                </p>
                <WorkedExample>
                  <p>
                    That is arbitrary and it is written down, which are the two
                    things that matter about it. It is arbitrary because there is
                    no sense in which the plural noun is the better reading of{" "}
                    <span className="font-mono">walks</span> in isolation, and
                    there is no context here to settle it. It is written down
                    because the alternative is a rule that depends on which line
                    of the grammar happened to be tried first, and then reordering
                    two lines that say the same thing would change what a word is
                    cut into.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  Reporting every reading is the honest answer and handing on one
                  cut is the useful one. Where the two disagree, the choice is a
                  convention rather than a fact, and it belongs beside the answer.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. Spelling changes have to be written out">
                <p>
                  <span className="font-mono">bake</span> plus{" "}
                  <span className="font-mono">ed</span> is{" "}
                  <span className="font-mono">bakeed</span>, and English writes{" "}
                  <span className="font-mono">baked</span>. A grammar that lists
                  the stem, lists the ending and lets them join has just accepted
                  a word that does not exist and refused one that does, and that
                  is not a small failure since it happens to every verb in the
                  language whose stem ends in an e.
                </p>
                <p>
                  I built the smaller grammar both ways to see it. Before the
                  repair it has 3 states and 12 lines, and it reads{" "}
                  <span className="font-mono">bakeed</span> as the past tense of
                  bake while returning nothing whatever for{" "}
                  <span className="font-mono">baked</span>. After the repair it
                  has 5 states and 16 lines and does exactly the reverse.
                </p>
                <NumberTable
                  headings={["word", "before the repair", "after the repair"]}
                  rows={[
                    ["baked", "no reading at all", "bake+V +PAST, cut as bak and ed"],
                    ["bakeed", "bake+V +PAST", "no reading at all"],
                    ["bakes", "bake+V +3SG", "bake+V +3SG, unchanged"],
                    ["walked", "walk+V +PAST", "walk+V +PAST, unchanged"],
                  ]}
                  caption="The same four words under the two versions of the small grammar. The repair reverses the first two rows and leaves the regular stems exactly as they were."
                />
                <p>
                  The repair is four lines. A second spelling of the stem,{" "}
                  <span className="font-mono">bak</span>, labelled as the verb
                  bake, going to a new state holding only the endings that begin
                  with a vowel; and the full stem redirected to a state holding
                  only the endings that begin with a consonant. What comes back is
                  still <span className="font-mono">bake+V +PAST</span>, so the
                  analysis is right even though the piece on the page is{" "}
                  <span className="font-mono">bak</span>.
                </p>
                <InAModel>
                  <p>
                    This is where the real tools do something I have not built.
                    Koskenniemi&rsquo;s two-level rules, and the rule compilers
                    that came after them, let you write the alternation once as a
                    constraint saying a stem-final e disappears before a
                    vowel-initial ending, compile that into a machine, and
                    compose it onto the lexicon. The result is a machine in which
                    the <span className="font-mono">bak</span> step exists
                    although nobody typed it. Here there is no rule compiler, so
                    the alternation is written as it would come out of one, one
                    extra spelling at a time. The analyses are identical; the cost
                    is that a language with many alternations needs many lines
                    where a rule would need one, and it is a cost that falls on
                    the person writing rather than on the machine.
                  </p>
                </InAModel>
                <KeepInMind>
                  The pieces a grammar cuts a word into are the characters
                  actually on the page, so a spelling change makes the pieces and
                  the morphemes stop matching one to one. What comes back for
                  baked is still the verb bake in the past tense even though no
                  four characters of it spell bake, and that holds only because
                  the label was written beside the spelling rather than read off
                  it.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. What a Hundred and Seventy-Eight Lines Buy",
          content: (
            <>
              <SubSection title="14. Lines against forms">
                <p>
                  The small grammar is too small to say anything about cost, so I
                  wrote a larger one. Twenty-four verbs whose stem never changes,
                  twelve more that drop a final e, forty nouns, three prefixes,
                  and the endings. Thirteen of the words are both a noun and a
                  verb, which is ordinary English and not a device. That is
                  178 lines across 6 states.
                </p>
                <p>
                  Those 178 lines accept 1,074 different words, by 1,184 distinct
                  readings. The ratio is the whole argument for the method, and it
                  is not a coincidence or a property of the numbers I chose; it is
                  what composition does. Every verb reaches every ending, every
                  prefix reaches every stem, and the count of accepted words is
                  therefore roughly a product where the count of lines is a sum.
                </p>
                <Equation>
                  {"178 lines,  6 states   →   1074 words,  1184 readings"}
                </Equation>
                <p>
                  It is worth saying where the 178 comes from, because the machine
                  actually has 342 steps in it. The stems are written once and
                  named, and a prefix has to lead somewhere, so the stem list
                  appears in two states instead of one. In a real toolchain you
                  write it once and the compiler makes the copy, and a step
                  reading nothing would remove the duplication entirely; here it
                  is a consequence of the rule from section 4.
                </p>
                <KeepInMind>
                  A word list of a thousand forms is a thousand lines to write and
                  a thousand to maintain. The same thousand forms as a grammar is
                  178 lines, and the saving grows with the number of endings
                  rather than staying fixed.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. The same budget spent on counting">
                <p>
                  So 178 lines is what the grammar costs. The fair question is
                  what 178 pieces of a learned vocabulary buy on the same words,
                  and the fairest possible setting for that comparison is the one
                  from section 2, where the corpus is the grammar&rsquo;s own
                  language with every word in it once.
                </p>
                <p>
                  The grammar reads those 1,074 words in a mean of 2.648 pieces,
                  and never in more than 4. A learned vocabulary of 178 pieces
                  spells them in a mean of 2.943, and holds none of them whole.
                  Those two numbers are close, and their closeness is the finding
                  worth taking away, because it means the sequence length a model
                  downstream would pay is about the same either way. What differs
                  is that every piece in the first number has a label on it and
                  none of the pieces in the second does.
                </p>
                <WrittenAgainstLearned />
                <p>
                  The numbers to read this time are the four along the top,
                  which describe the grammar, against the two underneath the
                  buttons, which describe whichever learned vocabulary is
                  selected.
                </p>
                <KeepInMind>
                  At equal size the two methods produce sequences of nearly the
                  same length, 2.648 pieces against 2.943, so whatever the
                  grammar is worth here it is not worth it for brevity. What the
                  extra 0.295 of a piece buys is a label under every piece, and
                  the real cost of the grammar was paid before any of this, by
                  the person who wrote it.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Where counting wins">
                <p>
                  Double the learned budget and the comparison turns over. At 356
                  pieces the mean falls to 2.071, which is shorter than the
                  grammar&rsquo;s 2.648, and 37 of the 1,074 words are held whole.
                  Buying that from the grammar is not possible, because the
                  grammar&rsquo;s pieces are the morphemes and there are as many
                  of them as the words have.
                </p>
                <p>
                  This is the honest place where the method is worse than the
                  obvious alternative, and it is worth stating plainly instead of
                  burying it. If what you want is short sequences, a learned
                  vocabulary gets them by spending memory, and spending memory is
                  easy. A grammar cannot be made to produce a shorter cut without
                  making it describe the language differently, which is not a
                  setting anybody can turn.
                </p>
                <NumberTable
                  headings={["method", "size", "pieces per word", "words held whole"]}
                  rows={[
                    ["written grammar", "178 lines", "2.648", "n/a, the pieces are morphemes"],
                    ["learned by counting", "178 pieces", "2.943", "0 of 1074"],
                    ["learned by counting", "356 pieces", "2.071", "37 of 1074"],
                  ]}
                  caption="Measured on the 1,074 words the grammar accepts, with the learned vocabularies fitted on exactly those words. At the same size the grammar is slightly shorter; at twice the size the learned vocabulary is shorter than the grammar can be made."
                />
                <KeepInMind>
                  A learned vocabulary shortens its sequences by holding more
                  pieces, and 356 pieces already beat the grammar at 2.071
                  against 2.648. A grammar has no equivalent setting, so any case
                  for it has to rest on what the pieces are called, since on how
                  many of them there are it loses as soon as the other side
                  spends anything.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. The Two Ways It Fails",
          content: (
            <>
              <SubSection title="17. A word outside the grammar produces nothing at all">
                <p>
                  Hand the larger grammar{" "}
                  <span className="font-mono">busiest</span> and it returns
                  nothing. Not a poor cut, not a cut with a piece marked unknown,
                  not a low score. There is no path through the grammar that
                  spells those seven characters, so the set of readings is empty,
                  and the word is handed on whole because there is nothing else to
                  do with it.
                </p>
                <WordsNotRead />
                <p>
                  This is a different failure from every other method on this
                  site, and the difference is worth being sharp about. A learned
                  vocabulary always answers, because it can always fall back on
                  the characters, so its failures are quiet and look like
                  successes. This one is loud. A word it has not been told about
                  produces an empty answer, and an empty answer is trivially
                  detectable, which means a system built on this can count exactly
                  how often it is failing.
                </p>
                <p>
                  Whether that is better depends entirely on what happens next. If
                  something downstream can fall back on another method, an empty
                  answer is a gift, since it says precisely where the fallback is
                  needed. If nothing can, an empty answer is worse than a rough
                  guess, because a rough guess is at least a sequence a model can
                  read.
                </p>
                <KeepInMind>
                  This method cannot represent a word it was not told about,
                  and it says so plainly every time, so a system built on it can
                  count its own failures exactly. A method that spells anything
                  out of characters never returns an empty answer and therefore
                  never reports a failure it did have.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. How much of our sentence it reads">
                <p>
                  Our sentence has seven words in it by the simplest reckoning,
                  and the grammar reads one of them. That one is{" "}
                  <span className="font-mono">expect</span>, and it reads it
                  correctly, as the verb expect with nothing after it.
                </p>
                <WhatItCanRead showParagraph={false} />
                <p>
                  Changing how the words are found does not help. Handing the
                  sentence to the annotation rules for English instead of to a
                  rule about spaces gives nine pieces instead of seven, since it
                  separates the contraction and the final stop, and the count of
                  readable pieces is still one. That is because what is stopping
                  the grammar is not the boundaries. It is that{" "}
                  <span className="font-mono">Alvarez</span> is a name,{" "}
                  <span className="font-mono">Dr.</span> is an abbreviation,{" "}
                  <span className="font-mono">the</span> is a word with no parts,
                  and <span className="font-mono">analysis</span> is a stem I did
                  not write down.
                </p>
                <p>
                  Take the punctuation off, lower-case everything and treat a
                  hyphen as a join, and the sentence becomes nine ordinary words
                  of which the grammar reads two, since{" "}
                  <span className="font-mono">cost</span> is in the noun list.
                  Every one of those three operations is a decision made outside
                  the grammar and every one of them changes the number, which is
                  worth knowing before quoting any coverage figure at all.
                </p>
                <KeepInMind>
                  A morphological analyser is handed words rather than text, so
                  everything a page of text does to its words happens before the
                  grammar is reached and is somebody else&rsquo;s problem. Both
                  of the ways of finding words tried here leave it with the same
                  one readable piece.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. How much of ordinary prose it reads, and what fifty lines buy">
                <p>
                  One sentence is too short to measure, so I wrote a paragraph of
                  seventy-six words of plain English about an ordinary subject,
                  wrote it before measuring anything, and did not touch it
                  afterwards. Of the 76 words the grammar reads 7, which is 9.2%;
                  of the 57 different words it reads 7, which is 12.3%.
                </p>
                <Equation>
                  {"coverage  =  words the grammar reads  ÷  words in the text"}
                </Equation>
                <p>
                  That number is worse than it sounds, and the reason is
                  instructive. The commonest words in English carry no morphology
                  at all. There is nothing in{" "}
                  <span className="font-mono">the</span> to analyse, nothing in{" "}
                  <span className="font-mono">and</span>, nothing in{" "}
                  <span className="font-mono">of</span>, and a grammar of stems
                  and endings has no way to say anything about them except by
                  listing them one at a time. So I listed fifty of them, which is
                  fifty more lines and no more structure, and measured again.
                </p>
                <WhatItCanRead showSentence={false} />
                <p>
                  Coverage by occurrence goes from 9.2% to 60.5%, and coverage by
                  distinct word from 12.3% to 47.4%. Fifty lines that say nothing
                  interesting bought more than the 178 lines that say something
                  did, on this text, because those fifty words are the ones a text
                  repeats. And 30 different words are still left over, among them{" "}
                  <span className="font-mono">busiest</span>,{" "}
                  <span className="font-mono">thinned</span>,{" "}
                  <span className="font-mono">gone</span> and{" "}
                  <span className="font-mono">stallholder</span>, and each of them
                  needs a line, or a spelling rule, or both.
                </p>
                <KeepInMind>
                  Coverage is bought line by line and the curve does not bend on
                  its own. A learned vocabulary reaches complete coverage the
                  moment it is fitted, because it can spell anything out of
                  characters, and that difference is the reason this method is
                  rare outside languages with a lot of morphology and a lot of
                  linguists.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. A word it reads more than one way">
                <p>
                  The other failure runs in the opposite direction. Hand the
                  larger grammar <span className="font-mono">recovers</span> and
                  it returns three readings. It is the verb recover with a third
                  person ending; it is the prefix meaning again in front of the
                  verb cover with a third person ending; it is the same prefix in
                  front of the noun cover with a plural ending.
                </p>
                <ManyReadings />
                <p>
                  All three are real English and I can put each in a sentence.
                  Nothing in the six characters chooses between them, so this is
                  not a defect in the grammar and adding lines will not fix it;
                  more lines produce more readings, not fewer. Across the whole
                  language the larger grammar accepts, 108 of the 1,074 words are
                  read more than one way, which is 10.1%, and that is a grammar
                  with three prefixes and no derivational depth to speak of.
                </p>
                <p>
                  How fast it can grow is easiest to see on a grammar of four
                  lines, a piece of one character and a piece of two, each of
                  which may be followed by another. A word of six characters has
                  13 readings, of ten has 89, and of twelve has 233. The counts
                  are the Fibonacci numbers, for the reason the widget gives.
                </p>
                <Equation>
                  {"readings(n)  =  readings(n − 1) + readings(n − 2)"}
                </Equation>
                <KeepInMind>
                  Three readings of recovers is the grammar describing English
                  accurately, since all three are things the word can mean.
                  Choosing between them needs a sentence, and a grammar of stems
                  and endings never sees one.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Where the Method Stops Being Defined",
          content: (
            <>
              <SubSection title="21. There is no fact the grammar can be checked against">
                <p>
                  Every method earlier in this section has an objective. Byte pair
                  encoding maximises a merge count, the unigram model maximises a
                  likelihood, the description-length method minimises a number of
                  bits. Two people running any of those on the same corpus get the
                  same answer, and if they do not, one of them has a bug.
                </p>
                <p>
                  This method has no objective at all. A grammar is a claim about
                  a language, and the question of whether a claim about a language
                  is correct is a question in linguistics rather than in
                  arithmetic. Two competent people will write different grammars
                  for English, and their disagreements will be real disagreements
                  about the language and not differences of tuning. Is{" "}
                  <span className="font-mono">recover</span> one morpheme or two?
                  Both answers are defensible, and the grammar on this page holds
                  both at once, which is why it reads the word three ways.
                </p>
                <p>
                  So there is nothing to optimise and nothing to converge to. What
                  can be measured is coverage on a text, and coverage measures the
                  grammar against a text rather than against the language, so a
                  grammar can gain coverage by listing words while getting worse
                  at describing how the language works.
                </p>
                <KeepInMind>
                  A learned vocabulary can be evaluated by rerunning the
                  procedure. A written grammar can only be evaluated by asking
                  somebody who knows the language, and there is no procedure that
                  substitutes for that.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. Outside the grammar is not the same as wrong about">
                <p>
                  The set of words this method can return an answer for is
                  exactly the set its lines spell. That is a definition rather
                  than a limitation discovered by testing, and it has a
                  consequence that is easy to state and easy to forget. For a word
                  outside that set, the method is not approximately right and it
                  is not wrong. It is undefined, in the way a function is
                  undefined outside its domain.
                </p>
                <p>
                  Every other method on this site is total. Handed anything at
                  all, a learned vocabulary returns pieces, because character
                  pieces are always available underneath. That totality is what
                  lets those methods be scored, since a score needs an answer to
                  score. Here there is nothing to score on{" "}
                  <span className="font-mono">busiest</span>, and a system built
                  on this has to decide what an empty answer means before it meets
                  one.
                </p>
                <p>
                  There is a genuine decision attached and it is worth naming.
                  Either the analyser is the whole answer, in which case an
                  unreadable word stops the pipeline and the grammar has to grow
                  until it does not; or the analyser is one of two methods and
                  something else takes over where it returns nothing, in which
                  case what reaches the model downstream is a mixture of labelled
                  and unlabelled pieces, and whatever consumes it has to be built
                  to cope with both.
                </p>
                <KeepInMind>
                  The reading a grammar cannot produce was never considered and
                  rejected. It was never among the things the method was able to
                  say, in the way that a function is not merely inaccurate
                  outside its domain, and that is why there is nothing to score
                  on busiest.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. Ambiguity has no bound the method can supply">
                <p>
                  The other end is undefined in a different way. When a word has
                  several readings, the method is complete and correct and has
                  nothing to say about which of them is meant, because meaning
                  which reading is a fact about the sentence and the grammar
                  never sees a sentence.
                </p>
                <p>
                  Two things follow, and only the second is usually noticed. The
                  first is that a system needing one answer has to import a rule
                  from outside, and the tie rule in section 12 is such a rule and
                  has no argument behind it. The second is that the number of
                  readings is not bounded by anything in the method. It is bounded
                  by the grammar, and a grammar with a stem that is also a prefix
                  plus another stem multiplies rather than adds; the four-line
                  grammar reaching 233 readings on twelve characters is the
                  extreme case of exactly that shape.
                </p>
                <p>
                  Where the choice matters, the answer is not more lines. It is a
                  model of what words are likely in context, which is a probability
                  and therefore something learned from a corpus, and so the
                  grammar and the counting turn out to be complements rather than
                  rivals. That is what the systems in this tradition do; they
                  produce every reading and rank them with something trained.
                </p>
                <KeepInMind>
                  A grammar answers what is possible. Which possibility is meant is
                  a different question, it needs different evidence, and no amount
                  of care in writing the grammar produces it.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. A language moves and a grammar does not">
                <p>
                  A grammar is written once, by a person, for one language. Three
                  separate costs follow from that sentence, and they are the ones
                  that decide whether anybody uses this method instead of the
                  ones earlier in this section.
                </p>
                <p>
                  It does not transfer. The 178 lines here describe English and
                  say nothing at all about any other language, and the work of
                  writing them again for Finnish or Arabic or Swahili is the same
                  work, done by somebody who knows that language. A learned method
                  is retrained by pointing it at a different corpus, which is an
                  afternoon.
                </p>
                <p>
                  Nor does it fill itself in. Coverage is bought a line at a
                  time, as section 19 measured, and no amount of writing reaches
                  a point where the rest follows. Fifty lines took coverage on
                  one paragraph from 9.2% to 60.5%, and the 30 words still left
                  over need 30 more decisions about English, each made by
                  somebody able to make them.
                </p>
                <p>
                  And it goes stale where nothing has been edited. New words
                  arrive in a language continuously, old ones acquire new senses
                  and new parts of speech, and a grammar written five years ago
                  returns nothing for every one of them while reporting no error
                  and looking exactly as correct as it did the day it was written.
                  A learned vocabulary goes stale too, but the repair is to refit
                  it, and here the repair is to find the person again.
                </p>
                <KeepInMind>
                  The cost of this method is human effort that does not transfer,
                  does not compound and has to be repeated as the language moves.
                  Everything good about it on this page has to be weighed against
                  that one sentence.
                </KeepInMind>
              </SubSection>

              <SubSection title="25. Where the method has nothing to say">
                <p>
                  Gathered in one place, these are the inputs and questions on
                  which the method stops being defined rather than becoming
                  approximate, with what has to be decided in each case and what
                  turns on the decision. The ones worth a reader&rsquo;s attention
                  are the decisions, since those are what anybody writing a grammar
                  has to make and nothing in the method makes them.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what the method says"
                  rows={[
                    {
                      expression: "a word no path spells",
                      reason:
                        "undefined rather than wrong. The set of readings is empty and there is nothing to score, since the method returns readings and there are none. Measured on a paragraph of ordinary prose, that is 69 of 76 words at 178 lines and 30 of 76 once fifty structureless words are listed. What has to be decided is what an empty answer means downstream, and the two answers are that the grammar must grow until it does not happen, or that a second method takes over and the pieces reaching the model are then a mixture of labelled and unlabelled.",
                    },
                    {
                      expression: "a word several paths spell",
                      reason:
                        "every reading, and no ranking. The grammar is complete and correct here and simply does not contain the information a choice would need, since which reading is meant depends on the sentence and the grammar never sees one. 108 of the 1,074 words the larger grammar accepts are read more than once, and recovers is read three ways, all three of them real English.",
                    },
                    {
                      expression: "which of several readings to hand on",
                      reason:
                        "a convention imported from outside. Fewest pieces, then the label string in alphabetical order, then the pieces in alphabetical order. On walks that makes the plural noun beat the third person verb because the letter N precedes V, which is not an argument, and the reason it is written down rather than left to the order of the lines is that reordering two lines saying the same thing would otherwise change what a word is cut into.",
                    },
                    {
                      expression: "whether the grammar is correct",
                      reason:
                        "outside the method, and outside arithmetic. There is no objective to optimise and no answer two people are guaranteed to agree on, because whether recover is one morpheme or two is a question about English rather than about the procedure. Coverage can be measured, but coverage compares a grammar against a text and a grammar can gain it by listing words while describing the language worse.",
                    },
                    {
                      expression: "a spelling change between a stem and an ending",
                      reason:
                        "not handled by the grammar at all, and the decision is where to handle it. Either it is written out as extra spellings of the stem, which is four lines for one English alternation here and many more for a language with several, or a rule compiler states it once and composes the result onto the lexicon. Both give the same analyses; only the second stays readable when there are thirty alternations instead of one.",
                    },
                    {
                      expression: "a piece that is spelled with nothing",
                      reason:
                        "not expressible, once every step is required to read a character. A present tense marked by nothing has to be written as a second copy of the stem going straight to the end, which says the same thing and cannot carry the label. Allowing steps that read nothing recovers the label and costs the guarantee that a walk terminates without a check for loops.",
                    },
                    {
                      expression: "what counts as a word before the grammar is reached",
                      reason:
                        "settled elsewhere, and every choice moves the coverage figure. Our sentence is seven pieces by whitespace and nine by the annotation rules for English, and both leave exactly one piece the grammar can read; taking the punctuation off, lower-casing and splitting on the hyphen makes it nine ordinary words of which two are readable. None of those three operations is part of the method and all of them change the number.",
                    },
                    {
                      expression: "a word that entered the language yesterday",
                      reason:
                        "the same empty answer as any other unknown word, with nothing marking it as a new kind of failure. A grammar has no notion of its own age and reports no drift, so coverage falls as the language moves and nothing in the method observes it falling. The repair is a person, which is the one input this method needs that no amount of compute substitutes for.",
                    },
                  ]}
                />
                <KeepInMind>
                  Four of these are decisions rather than limits, namely what an
                  empty answer means downstream, how a tie between readings is
                  settled, whether spelling changes are written out or compiled,
                  and what counts as a word in the first place. Each has a
                  defensible answer on more than one side and each changes what
                  comes back, so each belongs in whatever describes an analyser
                  rather than being left to whoever writes one.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
