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
import { BelievabilityStrip } from "@/components/widgets/BelievabilityStrip";
import { ChangedThingSearch } from "@/components/widgets/ChangedThingSearch";
import { HandSizedSearch } from "@/components/widgets/HandSizedSearch";
import { TemplateSearchPlayground } from "@/components/widgets/TemplateSearchPlayground";
import { WhereEachRuleLands } from "@/components/widgets/WhereEachRuleLands";

export const metadata: Metadata = {
  title: "Template Matching · oop_ml",
  description:
    "Carry a known picture across an unknown one, score how well it fits at every position, and keep the best.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function TemplateMatchingPage() {
  return (
    <ConceptPage
      title="Template Matching"
      tagline="Carry a known picture across an unknown one, score how well it fits at every position, and keep the best."
      prerequisites={
        <>
          Nothing is fitted on this page and nothing is learned, so none of the
          modelling ideas elsewhere on the site are needed. A picture here is a
          grid of numbers, one brightness per position, and the only piece of
          mathematics that does real work is the angle between two lists of
          numbers, which the{" "}
          <Link href="/primers/linear-algebra" className={link}>
            linear algebra primer
          </Link>{" "}
          builds up to as the cosine similarity. If you can multiply two lists
          of numbers together and add up the products, you have everything the
          page needs.
        </>
      }
      history={
        <>
          <p>
            The question came from radar rather than from pictures. During the
            second world war a receiver had to decide whether a particular
            pulse, whose shape was known exactly because the transmitter had
            sent it, was buried somewhere in a stretch of noisy voltage, and the
            existing designs were tuned circuits chosen by intuition about
            bandwidth. Dwight North, at RCA Laboratories in Princeton, wrote a
            technical report in 1943 on what determines how well such a receiver
            can discriminate signal from noise, and showed that the filter which
            maximises the ratio at the moment of interest is the one whose
            response is a copy of the signal being looked for. Correlating the
            incoming stream against a stored copy of the pulse was not a
            heuristic that happened to work; it was the answer. The report was
            classified and stayed obscure enough that the idea was rediscovered
            more than once, and it was reprinted in the Proceedings of the IEEE
            twenty years later, by which time the arrangement was called a
            matched filter.
          </p>
          <p>
            Pictures arrived at the same idea from the practical end. Russell
            Kirsch and his colleagues at the National Bureau of Standards
            scanned a photograph into the SEAC computer in 1957, at a hundred
            and seventy-six pixels a side, and once a picture was a grid of
            numbers the question of whether some smaller grid of numbers
            appeared in it became one anybody could program. What is worth
            noticing is which industry adopted it first and what that industry
            did to make it work. The American Bankers Association settled in
            1958 on a font for the routing numbers along the bottom of a cheque,
            E-13B, whose characters are drawn from thick blocks with no
            resemblance to ordinary type. They look the way they do because they
            were designed to be matched against stored copies of themselves,
            printed at a fixed size, in a fixed orientation, at a fixed distance
            from a reader. Rather than build a method that tolerated variation,
            the variation was engineered out of the problem, which is a fair
            summary of where this method is still the right answer.
          </p>
          <p>
            The repair to the scoring rule took much longer to be written down
            plainly than it took to invent. J. P. Lewis&rsquo;s 1995 paper
            &ldquo;Fast Normalized Cross-Correlation&rdquo; opens by saying that
            the unnormalised correlation everyone reaches for first can be
            defeated by a bright patch that has nothing to do with the target,
            and then spends its length on how to compute the normalised version
            cheaply, using running sums, since the reason people kept using the
            broken rule was that the repaired one looked expensive. The last
            piece on this page is younger still. David Lowe&rsquo;s 2004 paper
            on scale-invariant features, whose whole purpose was to escape the
            limitations described here, contains in passing the trick for
            deciding whether a match means anything, which is to compare the
            best candidate against the second best rather than against a
            threshold on its own score.
          </p>
          <p>
            This page asks six questions in order. What does it mean to look for
            a known thing in a larger picture? How is the fit at one position
            scored, and what do the three usual rules actually measure? Why does
            a scene that is lit unevenly break the rule most people try second?
            How do we tell a real match from the best of a bad set? What does
            the search cost? And where does the method stop being defined at
            all?
          </p>
        </>
      }
      playground={<TemplateSearchPlayground />}
      sections={[
        {
          title: "Part 1. Finding A Known Thing In A Larger Picture",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. The question, and the picture we keep asking it of">
                <p>
                  Suppose we already have a small picture of something and we
                  want to know whereabouts it appears in a larger picture. We
                  are not asking what is in the larger picture, and we are not
                  asking whether the thing is the kind of thing it is. We have a
                  particular arrangement of brightness in hand and we want its
                  position.
                </p>
                <p>
                  The scene this page works on is forty-eight pixels on each
                  side and holds a square, a disc, a diagonal bar, and three
                  copies of a small cross, which is the thing we will look for.
                  The whole scene is also lit unevenly, brighter towards the
                  right, and that piece of it is doing more work than anything
                  else on the page. The three copies of the cross are the same
                  seven-by-seven drawing repeated, sitting at row 26 column 26,
                  row 38 column 12, and row 39 column 36, and because the light
                  falls across the scene they are not equally bright. The one on
                  the left is dimmer than the one on the right by an amount that
                  turns out to decide which of them a scoring rule prefers.
                </p>
                <WhereEachRuleLands />
                <p>
                  Every position on this page is named by the top-left pixel of
                  the patch, counting rows down from the top and columns across
                  from the left, both starting at zero. So the copy at row 26,
                  column 26 occupies rows 26 to 32 and columns 26 to 32.
                </p>
                <KeepInMind>
                  The three copies are identical drawings under different
                  amounts of light. Anything that ranks one of them above
                  another is ranking the lighting, since there is nothing else
                  to tell them apart.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. The answer that needs no theory">
                <p>
                  Here is the whole method. Take the small picture, lay it over
                  the large one with its top-left corner at some position, work
                  out a number saying how well the two agree there, and write
                  that number down. Then move along one pixel and do it again,
                  and keep going until every position has been tried. The answer
                  is whichever position scored best.
                </p>
                <p>
                  Nothing is estimated, nothing is optimised, and there are no
                  parameters to choose apart from the scoring rule itself. The
                  answer is exact in the only sense available here, which is
                  that it really is the best-scoring position, because every
                  position was scored. That is why this is where the subject
                  starts and why it predates everything else by decades.
                </p>
                <p>
                  The small picture is called the template, the large one the
                  picture or the scene, and the grid of scores that comes out is
                  the score surface. The surface is worth looking at rather than
                  discarding, since it holds every position and not just the
                  winner, and the difference between a picture that contains the
                  thing and one that does not is visible in its shape long
                  before any number is read off it.
                </p>
              </SubSection>

              <SubSection title="3. Only the positions where the whole template fits">
                <p>
                  A template that hangs half off the edge of the picture cannot
                  be scored honestly. Some of the pixels it would be compared
                  against do not exist, so they would have to be invented, and
                  the position would then win or lose on what was invented
                  rather than on what is there. So a search answers only at the
                  positions where the template fits entirely, and the score
                  surface is correspondingly smaller than the picture.
                </p>
                <Equation>{`positions = (picture height − template height + 1) × (picture width − template width + 1)`}</Equation>
                <p>
                  The scene is forty-eight by forty-eight and the cross is seven
                  by seven, so the surface is forty-two by forty-two and holds
                  1,764 positions. That is the number every later claim about
                  cost is built on, and it is also why a search cannot find
                  something sitting against the frame.
                </p>
                <KeepInMind>
                  A thing lying partly outside the frame is not found by this
                  method, and it is not found quietly rather than loudly. The
                  positions it would have occupied were never scored.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. The same sweep a filter makes, asked a different question">
                <p>
                  Carrying a small grid across a large one and combining the two
                  at every position is not peculiar to this method. It is what a
                  blurring filter does, what an edge operator does, and what a
                  convolutional layer in a network does. The difference is
                  entirely in what the small grid holds and where it came from.
                  Here the small grid is a picture of the thing we are looking
                  for, chosen by hand because we happen to have it; in a network
                  the small grid is a set of weights with no particular meaning
                  at the start, adjusted until it answers well.
                </p>
                <p>
                  That connection is worth carrying forward, because one of the
                  three scoring rules below is exactly the sweep with the
                  template as its weights, and nothing more. The other two are
                  the same sweep with some arithmetic wrapped around it.
                </p>
                <InAModel>
                  A convolutional layer learns what to look for, where this
                  method is handed it. The sweep underneath is the same
                  operation in both, one small grid carried across a large one,
                  and what a network changed was where the small grid came from.
                </InAModel>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 2. Three Ways To Score A Fit",
          content: (
            <>
              <SubSection title="5. How far apart are these two pictures">
                <p>
                  The most literal reading of &ldquo;how well do these fit&rdquo;
                  is to ask how different they are. Line the template up with the
                  patch underneath it, subtract one from the other pixel by
                  pixel, square each difference so that being too dark counts the
                  same as being too bright, and add the squares up. A pair of
                  identical pictures gives zero and nothing else can, so this is
                  the one rule on the page where a lower score is a better one.
                </p>
                <Equation>{`score = sum over every pixel of ( patch − template )²`}</Equation>
                <p>
                  It is the squared distance between the two pictures thought of
                  as long lists of numbers, and it has the pleasant property that
                  a perfect fit is announced by an exact zero rather than by a
                  number that has to be compared against something. Its weakness
                  is that it takes brightness at face value. The same object
                  photographed under a brighter lamp is a long way from the
                  template in this measure although it is plainly the same
                  object, and Part 3 measures how far.
                </p>
              </SubSection>

              <SubSection title="6. Multiply the two together and add up the products">
                <p>
                  The second thing anybody tries is to multiply rather than
                  subtract. Where the template is bright and the patch is bright,
                  the product is large; where the template is bright and the
                  patch is dark, the product is small. Adding those products up
                  gives a number that is large when the two agree, and here a
                  higher score is a better one.
                </p>
                <Equation>{`score = sum over every pixel of ( patch × template )`}</Equation>
                <p>
                  This is the sweep of the previous section with the template
                  used directly as the weights, which is why it is the version
                  that connects to filtering and to convolution. It is also
                  called correlation, and it has no scale of its own. A perfect
                  fit does not score one, or zero, or anything fixed; it scores
                  the template&rsquo;s own sum of squares, which for the cross on
                  this page is 20.3076. There is nothing to compare that against
                  without already knowing the template.
                </p>
                <p>
                  A rule with no fixed perfect score is a warning rather than an
                  inconvenience, and the next two sections are what it is warning
                  about.
                </p>
              </SubSection>

              <SubSection title="7. The whole search on six pixels by six">
                <p>
                  Before the large scene, here is a search small enough to check
                  with a pencil. The picture is six pixels square, three columns
                  of black beside three columns of white, so it holds one edge
                  and nothing else. The template is the three-by-three piece cut
                  out at row 0, column 1, which straddles that edge, so it reads
                  two columns of zero and one column of one.
                </p>
                <p>
                  There are sixteen positions, and since every row of the picture
                  is identical the sixteen scores are four distinct answers
                  repeated four times. Click a row of the table to move the box
                  and see the patch that sat there.
                </p>
                <HandSizedSearch />
                <WorkedExample>
                  <p>
                    Take the position at column 2. The patch there reads zero,
                    one, one across each of its rows, and the template reads
                    zero, zero, one. Under the squared differences the first
                    column contributes nothing, the second contributes one, and
                    the third contributes nothing, which is one per row and 3
                    over the three rows.
                  </p>
                  <p>
                    Under the multiplication the same position gives zero, zero,
                    one per row, which is 3. And at column 1, where the patch is
                    the template exactly, the products are zero, zero, one as
                    well, which is also 3. Two different patches, the same score.
                  </p>
                </WorkedExample>
                <p>
                  The four columns come out at 3, 0, 3 and 6 under the squared
                  differences, so that rule separates them into three distinct
                  answers and puts its zero on the exact copy. The
                  multiplication comes out at 0, 3, 3 and 3.
                </p>
              </SubSection>

              <SubSection title="8. Correlation cannot tell agreement from brightness">
                <p>
                  Those three equal threes are the whole difficulty. The exact
                  copy at column 1, a patch holding only part of the edge at
                  column 2, and a patch of flat white at column 3 all score
                  exactly the same, so the rule has no preference at all among
                  them. The position it reports is decided by which one happened
                  to be read first, and it reports column 1 by that accident
                  rather than by having judged anything.
                </p>
                <p>
                  The reason is easy to see once it is stated. A large sum of
                  products can be had two ways, by agreeing with the template
                  where it is bright, or by being bright everywhere and nothing
                  more than that. The
                  flat white patch takes the second route and gets there just as
                  well. Nothing in the rule distinguishes the two routes, because
                  nothing in the rule ever looks at what the patch would have
                  been without its overall brightness.
                </p>
                <KeepInMind>
                  This is not a corner case arranged to embarrass the rule. Any
                  picture with a highlight in it, or a white wall, or a patch of
                  sky, contains regions that are bright and featureless, and the
                  multiplication prefers them to the thing being looked for.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. Take each patch&rsquo;s own mean away, then divide by what is left">
                <p>
                  Brightness can do two things to a patch. It can add the same
                  amount to every pixel, which is what a second lamp in the room
                  does, and it can multiply every pixel by the same amount, which
                  is what opening the aperture does. The repair removes both, in
                  that order.
                </p>
                <p>
                  Subtract the patch&rsquo;s own mean from every one of its
                  pixels, and the added amount is gone, since it went into the
                  mean and came straight back out. What is left is the
                  patch&rsquo;s deviation pattern, the shape of it rather than
                  the level. Then divide by the length of that pattern, and the
                  multiplying amount is gone too, since it scaled the pattern and
                  now scales the length it is being divided by. Do the same to
                  the template, and what remains is the cosine of the angle
                  between two deviation patterns.
                </p>
                <Equation>{`deviation(patch) = patch − mean(patch)

              deviation(patch) · deviation(template)
score = ─────────────────────────────────────────────────
        |deviation(patch)| × |deviation(template)|`}</Equation>
                <p>
                  The answer lies between −1 and 1, and it reaches exactly 1
                  when the patch is the template multiplied by any positive
                  amount and shifted by any amount at all. That is the property
                  the rule exists for, and it is a statement about a whole family
                  of patches rather than about one. This is normalised
                  cross-correlation.
                </p>
                <WhyThisWorks>
                  <p>
                    Write the patch as g × template + s, for a positive gain g
                    and an offset s. Its mean is g × mean(template) + s, so
                    subtracting it leaves g × deviation(template), with the
                    offset gone entirely. The numerator is then g times the
                    template&rsquo;s deviation dotted with itself, which is g
                    times the squared length. The denominator is the length of g
                    × deviation(template) times the length of
                    deviation(template), which is also g times the squared
                    length, since g is positive and comes out of the length as
                    itself. The two agree and the quotient is 1.
                  </p>
                  <p>
                    A negative gain gives −1 by the same argument, which is why
                    the range runs to −1 rather than stopping at zero. A patch
                    that is the template turned inside out, dark where it is
                    bright, is as strong a statement as an exact copy and points
                    the other way.
                  </p>
                </WhyThisWorks>
                <p>
                  One caution about the name. &ldquo;Normalised
                  cross-correlation&rdquo; is used in the literature for this and
                  also for a weaker version that divides by the lengths without
                  subtracting the means first. That weaker version survives a
                  change of gain and not a change of offset, so a scene
                  photographed against a lighter background defeats it. The
                  centring is the half that matters most here, and everything
                  measured on this page uses it.
                </p>
                <DerivationTable
                  expressionHeading="Rule"
                  reasonHeading="What an exact copy scores, and which way it runs"
                  rows={[
                    {
                      expression: "Sum of squared differences",
                      reason:
                        "Exactly 0, and nothing else can reach it. Lower is better, which is true of this rule and of neither other.",
                    },
                    {
                      expression: "Correlation",
                      reason:
                        "The template’s own sum of squares, 20.3076 for the cross on this page. Higher is better, and a brighter patch can exceed it.",
                    },
                    {
                      expression: "Normalised cross-correlation",
                      reason:
                        "Exactly 1, and so does every brightened or dimmed copy. Higher is better, and the score is bounded by 1.",
                    },
                  ]}
                />
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. What The Uneven Light Does",
          content: (
            <>
              <SubSection title="10. The scene is lit unevenly on purpose">
                <p>
                  The workbench scene has a brightness ramp across it, rising by
                  0.30 from the left edge to the right edge, on top of a
                  background that reads 0.12 and shapes that read 0.78. Without
                  that ramp the three copies of the cross would be identical
                  arrangements of identical numbers, every rule would agree about
                  them, and there would be nothing on this page worth arguing
                  about.
                </p>
                <p>
                  With it, the three copies are the same drawing at three
                  different levels. Averaged over their seven-by-seven patches
                  they read 0.6602 on the left, 0.7496 in the middle and 0.8134
                  on the right. Nothing about the crosses themselves has changed
                  and the differences are entirely the lamp.
                </p>
                <p>
                  The playground at the top of the page has a control for taking
                  the ramp away, which is the honest way to attribute an effect
                  to it. Anything that changes when the ramp is removed was
                  caused by the ramp.
                </p>
              </SubSection>

              <SubSection title="11. Where each rule lands on the workbench">
                <p>
                  One scene, one template, three rules, three different answers.
                  The squared differences report row 38, column 12. The
                  multiplication reports row 9, column 33. The normalised rule
                  reports row 26, column 26.
                </p>
                <NumberTable
                  headings={[
                    "Rule",
                    "Reported position",
                    "Its score",
                    "Left copy",
                    "Middle copy",
                    "Right copy",
                  ]}
                  rows={[
                    [
                      "Squared differences",
                      "row 38, column 12",
                      "0.4572",
                      "0.4572",
                      "1.6869",
                      "3.0445",
                    ],
                    [
                      "Correlation",
                      "row 9, column 33",
                      "27.9307",
                      "22.9559",
                      "25.4276",
                      "27.1932",
                    ],
                    [
                      "Normalised",
                      "row 26, column 26",
                      "0.9992",
                      "0.9992",
                      "0.9992",
                      "0.9992",
                    ],
                  ]}
                  caption="The three copies of the cross are at row 38 column 12, row 26 column 26, and row 39 column 36, written here left to right by column."
                />
                <p>
                  The squared differences land on a real copy, and for a reason
                  worth being clear about. The template carries no ramp, so the
                  copy it is nearest to is the one the ramp has added least to,
                  which is the leftmost. That rule has picked the correct kind of
                  thing by preferring the least brightly lit of them, and the
                  0.4572 it reports is not a small error, it is the light on that
                  copy. The right-hand copy, which is exactly as much a cross,
                  scores 3.0445 and would lose to a great many positions that
                  hold no cross at all.
                </p>
                <p>
                  The multiplication lands at row 9, column 33, which holds no
                  cross. It is a piece of the flat inside of the disc, on the
                  bright side of the ramp, and it beats the brightest of the
                  three genuine copies by 27.9307 against 27.1932.
                </p>
                <p>
                  The normalised rule lands on a copy, and its three scores are
                  the same number three times.
                </p>
                <TemplateSearchPlayground showScenes={false} initialRule={1} />
              </SubSection>

              <SubSection title="12. Why the flat inside of the disc wins the multiplication">
                <p>
                  Look at what is at row 9, column 33. Every pixel of it is part
                  of the disc, so the shape contributes no pattern at all, and
                  the only variation inside the patch is the ramp itself running
                  from 0.9906 on its left edge to 1.0289 on its right. It is, to
                  a very good approximation, a flat bright square.
                </p>
                <p>
                  That is exactly the decoy from the hand-sized example, at
                  scale, and here the arithmetic can be pinned down completely.
                  Multiply a genuinely flat patch of brightness b by the template
                  and add up, and every term carries the same b, so the score is
                  b times the sum of the template&rsquo;s own pixels. The
                  template sums to 27.66, the patch averages 1.0098, and the
                  product is 27.9307, which is the score the search reports at
                  that position with no discrepancy at all.
                </p>
                <Equation>{`a flat patch of brightness b scores b × 27.66

1.0098 × 27.66 = 27.9307`}</Equation>
                <p>
                  So the multiplication has read the patch&rsquo;s average
                  brightness and nothing else whatever. The genuine copy in the
                  middle of the scene scores 25.4276, which is the
                  template&rsquo;s own sum of squares at 20.3076 plus 5.1200 from
                  the light lying across it, and averaging only 0.7496 it cannot
                  reach what a patch averaging 1.0098 reaches. The copy loses
                  because it contains the dark pixels that make it a cross.
                </p>
                <p>
                  Under the normalised rule the same position scores essentially
                  zero, and the reason is more than that the patch is flattish.
                  A ramp running left to right is antisymmetric about the middle
                  once its mean is removed, meaning it is its own negative when
                  read backwards, and the cross is symmetric about the middle. A
                  symmetric pattern multiplied by an antisymmetric one cancels
                  term by term, so the agreement is zero exactly rather than
                  approximately. The measured value is smaller than 10
                  <sup>&minus;15</sup>.
                </p>
                <KeepInMind>
                  The two rules are not disagreeing about how good this position
                  is. They are measuring different things. One asks how much
                  brightness the patch delivers where the template is bright and
                  the other asks whether the patch has the template&rsquo;s
                  shape, and a bright featureless patch scores highly on the
                  first question and not at all on the second.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. All three copies score exactly alike, and why not quite one">
                <p>
                  The normalised rule gives all three copies the same score,
                  0.9991504412, agreeing in every digit that is carried. Two
                  things about that number are worth a moment.
                </p>
                <p>
                  It is the same at all three because the ramp inside a
                  seven-pixel patch is the same slope wherever that patch is cut
                  from. The copies differ in how much brightness was added, and
                  that is an offset, which the centring removes completely. What
                  the centring does not remove is the slope, and the slope is
                  identical at all three positions.
                </p>
                <p>
                  It falls short of 1 because that slope is a pattern the
                  template does not have. Since the slope is perpendicular to the
                  centred cross, by the symmetry argument above, it adds nothing
                  to the agreement in the numerator and adds length to the patch
                  in the denominator. A cosine whose numerator is unchanged and
                  whose denominator has grown is smaller.
                </p>
                <WhyThisWorks>
                  <p>
                    Write the patch as template plus ramp, where ramp is
                    perpendicular to the centred template. The numerator is
                    unchanged at the template&rsquo;s squared length. The
                    patch&rsquo;s length, by the right-angle rule, is the square
                    root of the sum of the two squared lengths. So the cosine is
                    the template&rsquo;s length divided by that, which
                    rearranges to one over the square root of one plus the
                    squared ratio of the two lengths.
                  </p>
                  <Equation>{`|deviation(ramp)| = 0.0894
|deviation(template)| = 2.1665

score = 1 / sqrt( 1 + (0.0894 / 2.1665)² ) = 0.9991504412`}</Equation>
                  <p>
                    Which is the number the search reports, to every digit
                    carried. The shortfall is small because the ramp inside a
                    seven-pixel window is a small pattern beside the cross, and
                    a steeper ramp would push it lower without ever changing
                    which position wins.
                  </p>
                </WhyThisWorks>
                <p>
                  So the winner is row 26, column 26 only because the three tie
                  exactly and something has to be reported. Reading the score
                  surface in order and keeping the first of the best is as good
                  a rule as any, and it means the reported position is the
                  earliest of the three rather than the strongest of them. Part
                  4 is about how a caller finds that out.
                </p>
              </SubSection>

              <SubSection title="14. Turn the lamp up and two of the three answers move">
                <p>
                  The sharpest way to see what the normalising bought is to
                  relight the whole scene and search it again with the same
                  template. Every pixel multiplied by 1.6 and then shifted by
                  0.15, which is roughly what turning a lamp up and adding a
                  second one does to a photograph, and nothing else altered.
                </p>
                <p>
                  The squared differences now report row 0, column 19, which is a
                  patch of empty ground near the top of the scene, scoring
                  4.7145. The three genuine copies score between 21.8990 and
                  40.2612, so they are not close seconds, they are four to nine
                  times worse than a piece of background. The rule has not
                  degraded; it has been broken by a change nobody would call a
                  change to the scene.
                </p>
                <p>
                  The multiplication still reports the inside of the disc, which
                  is not a recovery so much as the same failure surviving a
                  change that made it no worse.
                </p>
                <p>
                  The normalised rule reports the same position with the same
                  scores. Across all 1,764 positions the largest change to any
                  score is 1.7 × 10<sup>&minus;15</sup>, which is the arithmetic
                  rounding differently rather than the answer moving.
                </p>
                <TemplateSearchPlayground
                  initialScene="relit"
                  initialRule={0}
                  showSurface={false}
                />
                <InAModel>
                  Lighting is the variation you get for free and never asked for.
                  A camera moved slightly, a cloud, a different time of day, and
                  the raw brightness of every pixel has changed while the scene
                  has not. A description that moves when the light moves is
                  describing the light, and this is the first place on the site
                  where that costs an answer rather than an accuracy point.
                </InAModel>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Telling A Real Match From The Best Of A Bad Set",
          content: (
            <>
              <SubSection title="15. There is no position at which it answers that nothing is here">
                <p>
                  Every search returns a best position. That is not a
                  shortcoming of any particular scoring rule, it is what taking
                  the maximum of a list means. Hand this method a picture of a
                  brick wall and ask it to find a face, and it will report a
                  position, with a score, and nothing about the answer will look
                  any different from an answer that is right.
                </p>
                <p>
                  Measured over six pictures of random texture containing no
                  copy of the shape at all, the best score reaches between 0.3876
                  and 0.5341 under the normalised rule. Half of the maximum is a
                  number that looks like something to anyone who was hoping, and
                  there is no threshold on that number that separates these six
                  from a genuine match without also throwing away genuine matches
                  in harder pictures.
                </p>
              </SubSection>

              <SubSection title="16. The winner against the best position that does not overlap it">
                <p>
                  Asking how good the winner is has just failed, so ask instead
                  how far clear of everything else it stands. A real match is a
                  sharp peak with mediocrity all around it, and the best of a bad
                  set is one of many mediocre positions whose nearest rivals are
                  almost as good as it is.
                </p>
                <p>
                  There is one trap in putting that into practice. The
                  second-best position of any genuine match is its own
                  neighbour, since a template shifted by one pixel still overlaps
                  itself almost entirely and scores almost as well. A ratio
                  against that would be near one for every match ever made. So
                  the comparison has to be against the best position that does
                  not overlap the winner at all, which means at least the
                  template&rsquo;s own width away in rows or in columns.
                </p>
                <Equation>{`where a higher score is better    ratio = winner / runner-up
where a lower score is better     ratio = runner-up / winner`}</Equation>
                <p>
                  Written that way the ratio is at least one whichever direction
                  the rule runs in, and larger always means the winner stands
                  further clear.
                </p>
              </SubSection>

              <SubSection title="17. Present and absent, over twelve searches">
                <p>
                  Six pictures of random texture, each searched twice, once with
                  a five-by-five shape drawn into it and once without. Twelve
                  searches, twelve ratios.
                </p>
                <BelievabilityStrip showSizes={false} />
                <p>
                  With the shape absent the ratio runs from 1.0179 to 1.3654.
                  With it present the same six pictures give 1.8722 to 2.5797.
                  The two ranges do not touch, and there is a wide gap between
                  them where a threshold can sit. A ratio of 1.5 separates all
                  twelve correctly, where no threshold on the score separates
                  even most of them.
                </p>
                <p>
                  That threshold is fitted to one family of pictures and is worth
                  no more than that. Nothing in the method fixes it at 1.5, it is
                  a starting value chosen because it fell in the gap these twelve
                  searches left, and the next section is about a case where no
                  value works at all.
                </p>
              </SubSection>

              <SubSection title="18. Nine pixels are matched by chance almost anywhere">
                <p>
                  Run the same experiment with a three-by-three template instead
                  of five-by-five and it stops working. Four of the six pictures
                  that genuinely contain the shape fail to clear a threshold of
                  1.5, so a test that was reliable a moment ago now misses most
                  of what it is looking for.
                </p>
                <p>
                  The cause is not the ratio and no better threshold repairs it.
                  It is the template. A three-by-three template holds nine
                  numbers, and the best agreement it finds in a fifteen-by-fifteen
                  picture that contains nothing of the sort averages 0.7752 and
                  reaches 0.8844. Something that good turns up by chance, so the
                  genuine match at 1.0 has stiff competition from noise and
                  cannot stand clear of it.
                </p>
                <BelievabilityStrip />
                <p>
                  Adding pixels fixes it, and quickly. Twenty-five pixels drop
                  the chance agreement to 0.5047 and forty-nine to 0.3326, and at
                  five-by-five all six genuine matches clear the threshold. A
                  template&rsquo;s distinctiveness is a fact about how many
                  pixels it has, settled before any scoring rule is chosen, and
                  no scoring rule repairs having too few.
                </p>
                <KeepInMind>
                  The seven-by-seven row of that table has no ratio at all. In a
                  fifteen-by-fifteen picture the score surface is nine by nine,
                  the winner lies at most four rows or columns from any other
                  position, and two patches must be seven apart before they stop
                  overlapping. Every candidate is the winner shifted, so there is
                  no second candidate and the question cannot be asked.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. A ratio says how distinctive, never how good">
                <p>
                  The ratio and the score answer different questions and neither
                  substitutes for the other. A template that matches nothing at
                  all, in a picture where everything else matches it even less,
                  gets an excellent ratio out of two poor scores. Both numbers
                  have to be read, the score to know that anything was found and
                  the ratio to know that it was found in one place rather than
                  everywhere.
                </p>
                <p>
                  The workbench scene shows the other side of that. The
                  normalised rule scores all three copies at 0.9991504412, so its
                  winner and its best non-overlapping rival are equal and the
                  ratio is exactly 1.0. The test therefore reports that this
                  match is not to be believed, on a picture containing three
                  perfect copies of the thing being looked for.
                </p>
                <p>
                  That is the honest answer to the question actually asked. The
                  ratio asks whether the winning position is the only good one,
                  and with three copies the answer is genuinely no. It is a
                  different question from whether the thing is present, and a
                  caller who wants every occurrence has to read the whole surface
                  rather than its winner.
                </p>
              </SubSection>

              <SubSection title="20. Where the better rule gives the worse answer about itself">
                <p>
                  Put those two facts side by side on the same scene and the
                  recommended rule comes off worse than the one it replaced. The
                  squared differences chose the leftmost copy, and because the
                  ramp gave the other two worse scores, that winner stands 3.6900
                  clear of its nearest non-overlapping rival and is reported as
                  believable. The normalised rule chose a copy too, and because
                  it scored all three alike, its ratio is 1.0 and it is reported
                  as not believable.
                </p>
                <p>
                  So on this picture the rule that was fooled by the lighting
                  hands back the more usable confidence figure, and it does so
                  precisely because it was fooled. Its three scores differ only
                  because the lamp made them differ, and the ratio is reading
                  that difference as evidence of distinctiveness.
                </p>
                <p>
                  It is worth knowing that these two measurements can point in
                  opposite directions on the same input, and worth knowing why,
                  which is that a good score and a distinctive score are not the
                  same property. The remedy is not to prefer the worse rule; it
                  is to read the ratio as the answer to its own narrow question
                  and to notice, when it comes back at exactly 1.0, that an exact
                  tie is what a repeated object looks like.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Only At The Size And Angle It Was Given",
          content: (
            <>
              <SubSection title="21. A quarter turn, and what is reported instead">
                <p>
                  The method compares pixels at fixed offsets from the corner of
                  the patch. Every claim it makes therefore assumes the thing
                  appears at the same angle as the template, and the assumption
                  fails immediately. Saying it fails is worth much less than
                  saying by how much.
                </p>
                <p>
                  The cross on the workbench is unchanged by a quarter turn, so
                  it cannot show this, and the measurements below use a capital F
                  instead, which is unchanged by no rotation and no reflection.
                  An unturned copy scores 1.0 at its own corner, which is the
                  control.
                </p>
                <ChangedThingSearch includeCorner={false} />
                <p>
                  Turned by one right angle, the position the F actually occupies
                  scores 0.0385, and the position reported instead is four pixels
                  away scoring 0.5204. Turned by two, the true position scores
                  −0.1218, which is worse than nothing, since an upside-down F is
                  partly the negative of an F, and the winner is 3.1623 pixels
                  away at 0.6591.
                </p>
                <p>
                  Notice what does not happen. The score at the true position
                  does not fall gently, and the reported position does not drift
                  a little way off. The right answer is discarded and a confident
                  wrong one is put in its place.
                </p>
              </SubSection>

              <SubSection title="22. Twice the size">
                <p>
                  Size behaves the same way. The same F, with every pixel
                  repeated twice in each direction so that the brightnesses are
                  unchanged and only the arrangement has grown, scores 0.1650 at
                  the corner where it begins. The reported position is 5.0990
                  pixels away and scores 0.7806.
                </p>
                <p>
                  The enlargement here is the crudest possible, every pixel
                  repeated rather than smoothly interpolated, and that is
                  deliberate. A smoother enlargement would blur the pattern, and
                  then the failure would be partly about blurring. This way the
                  enlarged shape holds exactly the same brightnesses as the
                  original, arranged over more pixels, so a failure to find it is
                  a failure about size and nothing else.
                </p>
              </SubSection>

              <SubSection title="23. A doubled L holds an unscaled L, at a place the object does not begin">
                <p>
                  This one was a surprise, and it is the most useful thing in
                  Part 5. Take an L, three pixels square, and double it the same
                  way. The doubled L contains an exact copy of the original L,
                  unscaled, pixel for pixel, at rows 2 to 4 and columns 1 to 3 of
                  itself, which is the join where its two arms meet.
                </p>
                <p>
                  So a search for the original L in a picture containing only the
                  doubled one reports a flawless 1.0. The object begins at row 3,
                  column 3, and scores 0.3162 there. The answer given is row 5,
                  column 4.
                </p>
                <ChangedThingSearch />
                <p>
                  And the confidence check endorses it. That winner stands 2.0917
                  clear of anything that does not overlap it, well past the
                  threshold, so the ratio agrees that the match is to be
                  believed. A caller reading the score, the position and the
                  ratio has three numbers that all look right and an answer that
                  is in the wrong place.
                </p>
                <KeepInMind>
                  A method that failed loudly on a change of size would be much
                  easier to live with than one that sometimes succeeds perfectly
                  in the wrong place. A perfect score is evidence that some
                  patch of the picture is the template; it is not evidence that
                  the patch is the object.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. What the rest of the subject went into instead">
                <p>
                  Both failures have the same cause, which is that brightness at
                  a fixed offset is not a property of an object. It is a property
                  of an object photographed from one place, at one distance, at
                  one angle, under one lamp. Change any of those and the numbers
                  change, although a person looking at the two pictures would say
                  the object had not.
                </p>
                <p>
                  The repairs that followed all give up raw brightness in favour
                  of something that survives more. Rates of change rather than
                  levels, since a gradient is unmoved by adding light to
                  everything. Counts of which directions the edges point rather
                  than where they are, since a count survives a small shift.
                  Places found at their own size rather than at a size chosen in
                  advance. Each of those is a separate topic, and each of them is
                  paying for exactly what this page has just measured the cost
                  of.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. What The Search Costs",
          content: (
            <>
              <SubSection title="25. Positions tried and pixels read">
                <p>
                  Two counts describe the whole expense. The first is how many
                  positions there are, which Part 1 gave. The second is how many
                  pixel comparisons those positions add up to, since every
                  position reads the entire template.
                </p>
                <Equation>{`positions = (H − h + 1) × (W − w + 1)

pixels read = positions × h × w`}</Equation>
                <p>
                  The hand-sized search is 16 positions and 144 pixel reads. The
                  workbench is 1,764 positions and 86,436 pixel reads, for one
                  cross, at one angle, at one size.
                </p>
              </SubSection>

              <SubSection title="26. At a size a camera actually produces">
                <p>
                  The counts grow faster than they read. Both are quadratic in
                  the picture&rsquo;s side and quadratic in the
                  template&rsquo;s, so a search that felt free on a
                  forty-eight-pixel scene does not stay free.
                </p>
                <NumberTable
                  headings={[
                    "Picture",
                    "Template",
                    "Positions",
                    "Pixels read",
                  ]}
                  rows={[
                    ["6 by 6", "3 by 3", "16", "144"],
                    ["48 by 48", "7 by 7", "1,764", "86,436"],
                    ["512 by 512", "64 by 64", "201,601", "825,757,696"],
                    ["1024 by 1024", "64 by 64", "923,521", "3,782,742,016"],
                  ]}
                  caption="Looking for one object, at one angle, at one size."
                />
                <p>
                  Eight hundred and twenty-five million pixel reads for one
                  object in one modest photograph is the number a reader
                  underestimates, and it is the honest floor rather than a
                  pessimistic estimate, since every one of those reads is
                  required by the definition of the method.
                </p>
              </SubSection>

              <SubSection title="27. Multiplied by every angle and every size worth trying">
                <p>
                  Part 5 established that a turned or resized copy is not found,
                  so a search that has to cope with either must try several
                  templates rather than one. Twelve angles, which is one every
                  thirty degrees and is coarse, and five sizes, which is a little
                  under a factor of two in each direction and is also coarse,
                  come to sixty passes.
                </p>
                <p>
                  Sixty passes over the five-hundred-and-twelve-pixel picture is
                  49,545,461,760 pixel reads for one object, and the sampling is
                  still coarse enough that a copy turned fifteen degrees falls
                  between two of the angles tried.
                </p>
                <InAModel>
                  This is the practical reason the method was abandoned for
                  anything but the case it is still exactly right for, which is a
                  rigid, unrotated, unscaled thing at a known size. A button on a
                  screen, a fiducial mark on a circuit board, a character in a
                  font drawn to be matched. In those cases there is one angle and
                  one size, the sixty collapses to one, and nothing else is
                  needed.
                </InAModel>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Where The Method Stops Being Defined",
          content: (
            <>
              <SubSection title="28. A template with one brightness has no direction to compare">
                <p>
                  The normalised rule is a cosine between two deviation patterns,
                  and a cosine is an angle between two directions. A template
                  whose pixels are all the same number has a deviation pattern
                  that is the zero vector once its mean is taken away, and the
                  zero vector has no direction. There is no angle to measure,
                  which means the score is undefined at every position at once
                  rather than badly behaved at some of them.
                </p>
                <p>
                  This is a genuine dead end and not a choice about how to handle
                  a hard case. The quantity being asked for does not exist. The
                  other two rules are unaffected, since neither divides by
                  anything, and a search for a flat grey square by squared
                  differences is a perfectly sensible request with a perfectly
                  sensible answer.
                </p>
                <DerivationTable
                  expressionHeading="Degenerate input"
                  reasonHeading="What is undefined, and why"
                  rows={[
                    {
                      expression: "template of one brightness",
                      reason:
                        "Its deviation pattern is the zero vector, which has no direction, so the cosine does not exist at any position. The two rules that do not divide are unaffected.",
                    },
                    {
                      expression: "template larger than the picture",
                      reason:
                        "There is no position at which it fits, so the set being maximised over is empty and there is no best position to name.",
                    },
                    {
                      expression: "picture with no room for a second candidate",
                      reason:
                        "Every position overlaps the winner, so there is no runner-up and how far the winner stands clear cannot be asked. A 7 by 7 template in a 15 by 15 picture leaves a 9 by 9 surface whose furthest position is 4 away, where 7 is needed before two patches come apart.",
                    },
                  ]}
                />
              </SubSection>

              <SubSection title="29. A patch with one brightness, which is a different case">
                <p>
                  A flat patch inside an otherwise varied picture is not the same
                  situation. The template is fine, the search is well posed, and
                  one position among many cannot be scored. There is a real
                  choice here and it is worth naming, since any implementation
                  faces it.
                </p>
                <p>
                  The options are to refuse the whole search, which throws away
                  every other position over one; to answer the position with
                  something meaning &ldquo;not applicable&rdquo;, which then has
                  to survive being compared against numbers; or to state a
                  convention and use it. Zero is the usual convention, chosen
                  because a flat patch really does have no agreement with any
                  pattern, and because it is a value the comparison already knows
                  what to do with.
                </p>
                <p>
                  Whichever is chosen, the number that comes out is a convention
                  rather than a measurement, and a reader who does not know that
                  will read a column of zeros as a column of findings.
                </p>
              </SubSection>

              <SubSection title="30. And a patch that varies by nothing at all is scored in full confidence">
                <p>
                  Between those two lies the case with no protection. A patch
                  that is flat exactly has deviations that are exactly zero. A
                  patch that is flat to within rounding has deviations of about
                  10<sup>&minus;17</sup>, and dividing those by their own length
                  is dividing rounding by rounding.
                </p>
                <p>
                  It happens to stay harmless, and the reason is worth knowing.
                  What is left over when a constant patch fails to average
                  exactly is itself very nearly constant, and a constant is
                  perpendicular to any centred template, so the quotient stays
                  tiny. Measured on twenty-five pixels of one repeated value the
                  answer is exactly 0.0, and on nine pixels of the same value it
                  is 5 × 10<sup>&minus;17</sup>, which is zero for every purpose.
                </p>
                <p>
                  A patch that genuinely varies by that much has no such
                  protection. Its deviation pattern points somewhere real, so the
                  cosine is a real cosine, and it is reported without hesitation.
                  A patch whose brightest and darkest pixels differ by 1.4 ×
                  10<sup>&minus;17</sup>, a difference no instrument records and
                  no scene contains, is scored at 0.7454. The rule divides out the
                  patch&rsquo;s own contrast, and dividing out something that was
                  never there magnifies it to full size.
                </p>
                <KeepInMind>
                  Dividing by the patch&rsquo;s own spread is the same operation
                  in both places, the one that carried the relit scene through
                  unchanged in step 14 and the one that answers 0.7454 here.
                  There is no version of the rule that keeps the first behaviour
                  and drops the second, which is why an implementation usually
                  refuses a patch whose spread falls below some floor the caller
                  has to choose.
                </KeepInMind>
              </SubSection>

              <SubSection title="31. What it never knew in the first place">
                <p>
                  The failures above are all about the arithmetic running out.
                  The limit that matters most is not one of them, and it is not a
                  degenerate input at all.
                </p>
                <p>
                  This method has no notion of what the thing it is looking for
                  is. It has one arrangement of brightness that the thing
                  produced once, from one place, at one size, at one angle, under
                  one lamp. It cannot tell a cross from anything else that
                  happens to have those numbers in those positions, and it cannot
                  recognise a cross that produced different numbers. Everything
                  measured on this page follows from that, and none of it is a
                  defect in the search, which does exactly what it says.
                </p>
                <p>
                  So three things are true at once. It finds only what it was
                  given, exactly, so any change of size, angle or lighting
                  defeats it, in the specific sense that it stops reporting the
                  right position rather than reporting a lower score at the right
                  position. It always returns a best position, whether or not the
                  thing is anywhere in the picture, and the ratio of the winner
                  to its rivals is what turns that answer into a question rather
                  than an assertion. And what it matched was a photograph, not an
                  object, which is why a doubled L can be found perfectly at a
                  place no L begins.
                </p>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
