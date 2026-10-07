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
import { BelievabilityStrip } from "@/components/widgets/BelievabilityStrip";
import { ChangedThingSearch } from "@/components/widgets/ChangedThingSearch";
import { HandSizedSearch } from "@/components/widgets/HandSizedSearch";
import { TemplateSearchPlayground } from "@/components/widgets/TemplateSearchPlayground";
import { WhereEachRuleLands } from "@/components/widgets/WhereEachRuleLands";

export const metadata: Metadata = {
  title: "Template Matching · oop_ml",
  description:
    "Slide a known template over an image and compare the match score at each position.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function TemplateMatchingPage() {
  return (
    <ConceptPage
      intuition={lessonIntuitions["template-matching"]}
      technicalStart="Part 2. Three Ways To Score A Fit"
      openingTitle="Find This Small Picture Inside That Larger One"
      playgroundIntro="Inspect the best position and its score, then compare it with competing positions. Try changes in lighting or appearance and check whether the reported match remains convincing."
      title="Template Matching"
      tagline="Slide a known template over an image and compare the match score at each position."
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

      playground={<TemplateSearchPlayground />}
      sections={[
        {
          title: "Part 1. Finding A Known Thing In A Larger Picture",
          defaultOpen: true,
          content: (<>
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
                <>
<p>
                  The scene this page works on is forty-eight pixels on each side and holds a square, a disc, a diagonal bar, and three copies of a small cross, which is the thing we will look for. The whole scene is also lit unevenly, brighter towards the right, and that piece of it is doing more work than anything else on the page.
                </p>
                <p>
                  The three copies of the cross are the same seven-by-seven drawing repeated, sitting at row 26 column 26, row 38 column 12, and row 39 column 36, and because the light falls across the scene they are not equally bright. The one on the left is dimmer than the one on the right by an amount that turns out to decide which of them a scoring rule prefers.
                </p>
</>
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
                <>
<p>
                  Carrying a small grid across a large one and combining the two at every position is not peculiar to this method. It is what a blurring filter does, what an edge operator does, and what a convolutional layer in a network does. The difference is entirely in what the small grid holds and where it came from.
                </p>
                <p>
                  Here the small grid is a picture of the thing we are looking for, chosen by hand because we happen to have it; in a network the small grid is a set of weights with no particular meaning at the start, adjusted until it answers well.
                </p>
</>
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
</>),
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
                  <>
                    <p>
                      At column two, each patch row reads (0, 1, 1), while each template
                      row reads (0, 0, 1). Only the middle position differs.
                    </p>
                    <Equation>{"squared difference per row = (0 − 0)² + (1 − 0)² + (1 − 1)² = 1\nthree-row total = 3 × 1 = 3"}</Equation>
                  </>
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
                  <>
<p>
                    Write the patch as g × template + s, for a positive gain g and an offset s. Its mean is g × mean(template) + s, so subtracting it leaves g × deviation(template), with the offset gone entirely. The numerator is then g times the template&rsquo;s deviation dotted with itself, which is g times the squared length.
                  </p>
                  <p>
                    The denominator is the length of g × deviation(template) times the length of deviation(template), which is also g times the squared length, since g is positive and comes out of the length as itself. The two agree and the quotient is 1.
                  </p>
</>
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
          title: "Questions on Parts 1 and 2",
          quiz: [
            choice(
              "The scene is forty-eight pixels on each side and the cross is seven by seven. How many positions does a search score?",
              ["1,764", "1,681", "2,116", "2,304"],
              0,
              "A template hanging half off the edge would be compared against pixels that do not exist, so a search answers only where the template fits entirely. That makes the score surface forty-two by forty-two, and every later claim about cost on the page is built on that count.",
            ),
            trueFalse(
              "A copy of the cross lying partly outside the frame would be reported with a low score rather than missed.",
              false,
              "It is not found at all, and it is not found quietly rather than loudly. The positions it would have occupied were never scored, so nothing in the output marks the omission.",
            ),
            choice(
              "Under the multiplication rule, what does a perfect fit score?",
              [
                "The template’s own sum of squares, which for this cross is 20.3076",
                "Exactly one",
                "Exactly zero",
                "The template’s own sum of pixels, which for this cross is 27.66",
              ],
              0,
              "The rule has no scale of its own, so a perfect fit scores nothing fixed and there is nothing to compare the number against without already knowing the template. The squared differences are the rule that announces a perfect fit with an exact zero, and a sum of pixels is what a flat patch of brightness one would score rather than what a copy scores.",
            ),
            trueFalse(
              "In the six-pixel example the multiplication gives the same score of 3 to the exact copy of the template, to a patch holding only part of the edge, and to a patch of flat white.",
              true,
              "Those three equal threes are the whole difficulty, and the position reported is decided by which was read first rather than by having judged anything. A large sum of products can be had by agreeing with the template where it is bright, or by being bright everywhere and nothing more, and nothing in the rule distinguishes the two routes.",
            ),
            several(
              "The repair removes two effects of brightness in order. Which of these hold?",
              [
                "Subtracting the patch’s own mean removes an amount added equally to every pixel",
                "Dividing by the length of the deviation pattern removes a multiplying amount",
                "The score reaches exactly 1 when the patch is the template multiplied by any positive amount and shifted by any amount at all",
                "The weaker version that divides by the lengths without subtracting the means survives a change of offset",
              ],
              [0, 1, 2],
              "Adding light to a room adds the same amount to every pixel and opening the aperture multiplies every pixel, and the two halves of the repair remove them in that order. The weaker version survives a change of gain and not a change of offset, so a scene photographed against a lighter background defeats it, which is why the centring is the half that matters most here.",
            ),
        ],
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
                <>
<p>
                  The squared differences land on a real copy, and for a reason worth being clear about. The template carries no ramp, so the copy it is nearest to is the one the ramp has added least to, which is the leftmost. That rule has picked the correct kind of thing by preferring the least brightly lit of them, and the 0.4572 it reports is not a small error, it is the light on that copy.
                </p>
                <p>
                  The right-hand copy, which is exactly as much a cross, scores 3.0445 and would lose to a great many positions that hold no cross at all.
                </p>
</>
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
                <>
                  <p>
                    The raw dot product responds to brightness as well as shape. At the
                    true copy, its score contains a template contribution and an
                    additional lighting contribution.
                  </p>
                  <Equation>{"true-copy score ≈ 20.3076 + 5.1200 = 25.4276"}</Equation>
                  <p>
                    A brighter patch elsewhere can score higher even if its pattern is
                    less similar. The dark pixels that help define the cross reduce its
                    raw brightness total.
                  </p>
                </>
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
          title: "Questions on Parts 3 and 4",
          quiz: [
            choice(
              "One scene, one template, three rules, three answers. Which position does the multiplication report?",
              [
                "Row 9, column 33, a piece of the flat inside of the disc",
                "Row 26, column 26, the middle copy of the cross",
                "Row 38, column 12, the leftmost copy of the cross",
                "Row 39, column 36, the rightmost copy of the cross",
              ],
              0,
              "That patch holds no cross at all. It sits on the bright side of the ramp and beats the brightest of the three genuine copies by 27.9307 against 27.1932. The arithmetic can be pinned down completely, since the template sums to 27.66, the patch averages 1.0098, and the product is the score the search reports with no discrepancy.",
            ),
            trueFalse(
              "The normalised rule gives all three copies the same score because the centring removes the ramp.",
              false,
              "The centring removes the offset, and the three copies differ only by an offset, which is why they tie at 0.9991504412. What the centring does not remove is the slope, and the ramp inside a seven-pixel patch is the same slope wherever that patch is cut from. That leftover slope is also why the common score falls short of 1. Relighting the whole scene, every pixel multiplied by 1.6 and shifted by 0.15, moves no normalised score by more than 1.7 times ten to the minus fifteen, while the squared differences are sent to a patch of empty ground at row 0, column 19.",
            ),
            several(
              "Six pictures of random texture were each searched twice, with a five by five shape drawn in and without, and the experiment was repeated at three template sizes. Which of these did it find?",
              [
                "With the shape absent the ratio runs from 1.0179 to 1.3654, and with it present from 1.8722 to 2.5797, two ranges that do not touch",
                "With a three by three template four of the six pictures that genuinely contain the shape fail to clear a ratio of 1.5",
                "A better threshold than 1.5 repairs the three by three case",
                "The seven by seven template gives the best ratio of the three sizes",
              ],
              [0, 1],
              "A ratio of 1.5 separates all twelve of the five by five searches, where no threshold on the score separates even most of them, since the best score with the shape absent reaches between 0.3876 and 0.5341. Nine pixels are matched by chance almost anywhere, the best agreement in a picture that holds nothing of the sort averaging 0.7752 and reaching 0.8844, so the genuine match at 1.0 cannot stand clear and no threshold repairs that; twenty-five pixels drop the chance agreement to 0.5047 and forty-nine to 0.3326. The seven by seven row has no ratio at all, because in a nine by nine surface every candidate is the winner shifted and there is no second candidate to ask about.",
            ),
            choice(
              "Why is the confidence ratio taken against the best position that does not overlap the winner?",
              [
                "The second-best position of a genuine match is its own neighbour, which overlaps it almost entirely and scores almost as well",
                "Overlapping positions are never scored by the search",
                "An overlapping rival always scores higher than the winner",
                "An overlapping position would be counted twice in the surface",
              ],
              0,
              "A ratio against a neighbour would be near one for every match ever made, which would tell a caller nothing. So the rival has to be at least the template’s own width away in rows or in columns. That is also why the seven-by-seven row of the template-size table has no ratio at all, since in a nine-by-nine surface no two positions are seven apart.",
            ),
            trueFalse(
              "On the workbench scene the normalised rule’s ratio is exactly 1.0, so the test reports that the match is not to be believed on a picture holding three perfect copies.",
              true,
              "Its winner and its best non-overlapping rival are equal, since all three copies score 0.9991504412. That is the honest answer to the question actually asked, because the ratio asks whether the winning position is the only good one and with three copies the answer is genuinely no. A caller who wants every occurrence has to read the whole surface rather than its winner.",
            ),
        ],
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
                <>
<p>
                  So three things are true at once. It finds only what it was given, exactly, so any change of size, angle or lighting defeats it, in the specific sense that it stops reporting the right position rather than reporting a lower score at the right position. It always returns a best position, whether or not the thing is anywhere in the picture, and the ratio of the winner to its rivals is what turns that answer into a question rather than an assertion.
                </p>
                <p>
                  And what it matched was a photograph, not an object, which is why a doubled L can be found perfectly at a place no L begins.
                </p>
</>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 to 7",
          quiz: [
            choice(
              "A capital F turned by two right angles. What does the position the F actually occupies score?",
              [
                "Minus 0.1218, which is worse than nothing",
                "0.0385",
                "0.1650",
                "0.6591",
              ],
              0,
              "An upside-down F is partly the negative of an F, so the agreement comes out below zero, and the winner is reported 3.1623 pixels away at 0.6591. The other figures belong to the neighbouring experiments, 0.0385 to the single right angle and 0.1650 to the doubled F at the corner where it begins.",
            ),
            trueFalse(
              "A search for a three-pixel L in a picture holding only a doubled copy of it reports a flawless 1.0, and the confidence ratio endorses that answer.",
              true,
              "The doubled L contains an exact copy of the original, pixel for pixel, at the join where its two arms meet, so the perfect score is real. The object itself begins at row 3, column 3 and scores 0.3162 there, while the answer given is row 5, column 4, standing 2.0917 clear of anything that does not overlap it. A perfect score is evidence that some patch of the picture is the template, not that the patch is the object.",
            ),
            choice(
              "Twelve angles and five sizes over the five-hundred-and-twelve-pixel picture come to how many pixel reads for one object?",
              [
                "49,545,461,760",
                "About 825 million",
                "86,436",
                "1,764",
              ],
              0,
              "Sixty passes are needed because a turned or resized copy is not found at all, and one pass over that picture is already the eight hundred and twenty-five million the previous step gave. The sampling is still coarse enough that a copy turned fifteen degrees falls between two of the angles tried.",
            ),
            trueFalse(
              "A template whose pixels are all the same number defeats the squared differences, which cannot divide by a spread of zero, while the normalised rule scores it like any other.",
              false,
              "It is the other way round. The normalised rule is a cosine between two deviation patterns, and a flat template’s deviation pattern is the zero vector once the mean is taken away, which has no direction, so there is no angle to measure and the score is undefined at every position at once. The squared differences and the multiplication divide by nothing and are unaffected, so a search for a flat grey square by squared differences is a perfectly sensible request with a perfectly sensible answer.",
            ),
            choice(
              "A patch whose brightest and darkest pixels differ by 1.4 times ten to the minus seventeen, a difference no instrument records and no scene contains. What does the normalised rule report?",
              [
                "0.7454, because the rule divides out the patch’s own contrast and dividing out something that was never there magnifies it to full size",
                "Exactly 0.0, because a difference that small is flat for every purpose",
                "Nothing, because the search refuses a patch whose spread falls below a floor",
                "A value near zero, because whatever is left over is itself nearly constant and a constant is perpendicular to any centred template",
              ],
              0,
              "A patch that genuinely varies by that much has a deviation pattern pointing somewhere real, so the cosine is a real cosine and is reported without hesitation. The option promising a value near zero describes the neighbouring case, a patch of one repeated value, where the leftover really is nearly constant and the answer stays tiny. Dividing by the patch’s own spread is the same operation that carried the relit scene through unchanged, and there is no version of the rule that keeps one behaviour and drops the other.",
            ),
        ],
        },
        {
          title: "Practice. Searching The Scene With The Library",
          practice: [
            exercise(
              "Score the six by six search under all three rules",
              ["Part 2 cut a three by three template out of the six by six picture at row 0, column 1 and scored its sixteen positions by hand, finding 3, 0, 3 and 6 across the four columns under the squared differences and 0, 3, 3 and 3 under the multiplication, which cannot tell the exact copy from a patch of flat white. Run the same search with the library under all three rules.", "The normalised rule’s four scores are ones the page does not print. The exact copy at column 1 should score 1, the flat white at column 3 has no deviation pattern and is scored by the convention Part 7 describes, and the patch holding only part of the edge at column 2 lands somewhere between."],
              `import numpy as np
from oop_ml.core.computer_vision.matching import MatchRule, MatchScores, score_surface
from oop_ml.core.computer_vision.picture import Picture

picture = Picture([[0.0, 0.0, 0.0, 1.0, 1.0, 1.0]] * 6)
# Cut the three by three template out at row 0, column 1 and print its rows.
# For each rule, score every position, print row 0 of the score surface and
# the column and score of the best position. Then print how many positions
# the search tried and how many pixels it read.`,
              `import numpy as np
from oop_ml.core.computer_vision.matching import MatchRule, MatchScores, score_surface
from oop_ml.core.computer_vision.picture import Picture

picture = Picture([[0.0, 0.0, 0.0, 1.0, 1.0, 1.0]] * 6)
template = picture.patch_at(0, 1, 3, 3)
print(f"template rows {np.asarray(template).tolist()}")

for rule in MatchRule:
    surface = np.asarray(score_surface(picture, template, rule))
    scores = MatchScores.of(picture, template, rule)
    best = scores.best
    print(f"{rule.value}: row 0 of the surface {np.round(surface[0], 4).tolist()}, best at column {best.column} scoring {best.score:.4f}")
print(f"{scores.n_positions} positions, {scores.n_pixels_read} pixels read")`,
              `template rows [[0.0, 0.0, 1.0], [0.0, 0.0, 1.0], [0.0, 0.0, 1.0]]
sum_of_squared_differences: row 0 of the surface [3.0, 0.0, 3.0, 6.0], best at column 1 scoring 0.0000
correlation: row 0 of the surface [0.0, 3.0, 3.0, 3.0], best at column 1 scoring 3.0000
normalised_cross_correlation: row 0 of the surface [0.0, 1.0, 0.5, 0.0], best at column 1 scoring 1.0000
16 positions, 144 pixels read`,
              { hints: ["patch_at(row, column, height, width) on a Picture answers the rectangle whose top-left pixel is at that position, and it is how the page cuts the template from the picture.", "score_surface takes the picture, the template and a MatchRule and answers a Picture of scores, smaller than the picture by two in each direction, so np.asarray and row 0 read the four scores of the top row. MatchRule is an enum, so a for loop visits all three.", "MatchScores.of takes the same three arguments and carries the winner as best, with row, column and score, plus n_positions and n_pixels_read."], check: numberCheck("What does the normalised rule score at column 2, the patch holding only part of the edge?", 0.5, 0.001, "Every row of that patch reads 0, 1, 1 and every row of the template 0, 0, 1. Centred, the patch rows become −2/3, 1/3, 1/3 and the template rows −1/3, −1/3, 2/3, whose products add to one over the three rows while each centred pattern has length root two, so the cosine is a half. The exact copy at column 1 scores exactly 1 and the flat white at column 3 is scored 0 by convention, where the multiplication gave all three of them the same 3.") },
            ),
            exercise(
              "Search the workbench three ways and read each winner’s ratio",
              ["Part 3 found that one scene, one template and three rules give three different answers, the squared differences landing on the leftmost copy at row 38, column 12, the multiplication on the flat inside of the disc at row 9, column 33, and the normalised rule on row 26, column 26 with all three copies tied at 0.9991504412. Part 4 then found the squared differences standing 3.6900 clear of their rival and the normalised rule’s ratio sitting at exactly 1.0. The scene is rebuilt here from the numbers behind the page, with the three copies at the positions the page names.", "What the multiplication’s winner scores against its own best non-overlapping rival is a number the page does not print, and it says whether the decoy is reported as believable."],
              `import numpy as np
from oop_ml.core.computer_vision.matching import MatchRule, TemplateMatcher
from oop_ml.core.computer_vision.picture import Picture

scene = np.full((48, 48), 0.12)
scene[6:17, 5:16] = 0.78
rows, columns = np.ogrid[:48, :48]
scene[(rows - 12) ** 2 + (columns - 34) ** 2 <= 36] = 0.78
for step in range(14):
    scene[30 - step, 6 + step:9 + step] = 0.78
cross = np.full((7, 7), 0.12)
cross[2:5, :] = 0.78
cross[:, 2:5] = 0.78
copies = ((26, 26), (38, 12), (39, 36))
for row, column in copies:
    scene[row:row + 7, column:column + 7] = np.maximum(scene[row:row + 7, column:column + 7], cross)
scene = scene + np.linspace(0.0, 0.30, 48)
picture, template = Picture(scene), Picture(cross)

# For each rule, build a matcher for the cross, search the scene, and print
# what an exact copy would score, the best position and its score, the score
# at each of the three copies, and the believability ratio of the winner
# with whether it clears the threshold.`,
              `import numpy as np
from oop_ml.core.computer_vision.matching import MatchRule, TemplateMatcher
from oop_ml.core.computer_vision.picture import Picture

scene = np.full((48, 48), 0.12)
scene[6:17, 5:16] = 0.78
rows, columns = np.ogrid[:48, :48]
scene[(rows - 12) ** 2 + (columns - 34) ** 2 <= 36] = 0.78
for step in range(14):
    scene[30 - step, 6 + step:9 + step] = 0.78
cross = np.full((7, 7), 0.12)
cross[2:5, :] = 0.78
cross[:, 2:5] = 0.78
copies = ((26, 26), (38, 12), (39, 36))
for row, column in copies:
    scene[row:row + 7, column:column + 7] = np.maximum(scene[row:row + 7, column:column + 7], cross)
scene = scene + np.linspace(0.0, 0.30, 48)
picture, template = Picture(scene), Picture(cross)

for rule in MatchRule:
    matcher = TemplateMatcher(template=template, rule=rule)
    scores = matcher.scores_on(picture)
    at_copies = [round(scores.at(row, column).score, 4) for row, column in copies]
    clear = scores.believability()
    print(f"{rule.value}: an exact copy scores {matcher.score_of_an_exact_copy:.4f}")
    print(f"  best at row {scores.best.row}, column {scores.best.column} scoring {scores.best.score:.4f}; the copies score {at_copies}")
    print(f"  ratio against the best non-overlapping rival {clear.ratio:.4f}, believable {clear.is_believable()}")`,
              `sum_of_squared_differences: an exact copy scores 0.0000
  best at row 38, column 12 scoring 0.4572; the copies score [1.6869, 0.4572, 3.0445]
  ratio against the best non-overlapping rival 3.6900, believable True
correlation: an exact copy scores 20.3076
  best at row 9, column 33 scoring 27.9307; the copies score [25.4276, 22.9559, 27.1932]
  ratio against the best non-overlapping rival 1.0271, believable False
normalised_cross_correlation: an exact copy scores 1.0000
  best at row 26, column 26 scoring 0.9992; the copies score [0.9992, 0.9992, 0.9992]
  ratio against the best non-overlapping rival 1.0000, believable False`,
              { hints: ["TemplateMatcher takes the template and a rule, and score_of_an_exact_copy is a property of it, 0 for the squared differences, the template’s sum of squares for the multiplication and 1 for the normalised rule.", "scores_on answers a MatchScores whose best is the winner and whose at(row, column) is the score of the patch whose top-left pixel sits there, so the three copies are read at the positions the page names.", "believability() sets the winner against the best position at least the template’s own width away in rows or columns, and answers an object with a ratio and an is_believable() test against the threshold of 1.5."], check: numberCheck("What ratio does the multiplication’s winner stand clear of its best non-overlapping rival by?", 1.0271, 0.0005, "The decoy at row 9, column 33 scores 27.9307 and the best position that does not overlap it is the rightmost copy at 27.1932, a ratio of 1.0271, far below 1.5, so the multiplication’s answer is reported as not believable as well as wrong. The squared differences stand 3.6900 clear only because the ramp gave the other two copies worse scores, and the normalised rule ties all three copies for a ratio of exactly 1.0, which is what a repeated object looks like.") },
            ),
            exercise(
              "Turn the F, then double the L",
              ["Part 5 drew a capital F into plain ground and searched for it after turning it, finding that a quarter turn leaves the true position scoring 0.0385 with a confident wrong answer four pixels away at 0.5204, and a half turn scores −0.1218 at the truth with the winner 3.1623 pixels away at 0.6591. It then doubled a three pixel L and found the search reporting a flawless 1.0 at row 5, column 4, where no L begins, endorsed by a ratio of 2.0917. Reproduce all of it.", "The F and the L are the page’s own, five by five and three by three, on ground of 0.1. The unturned F is the control and should score 1.0 at its own corner."],
              `import numpy as np
from oop_ml.core.computer_vision.matching import MatchRule, MatchScores, placed, scaled_up, turned_by_a_right_angle
from oop_ml.core.computer_vision.picture import Picture

glyph = Picture([[1, 1, 1, 1, 1], [1, 0, 0, 0, 0], [1, 1, 1, 1, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0]])
ground = Picture(np.full((15, 15), 0.1))
rule = MatchRule.NORMALISED_CROSS_CORRELATION

# For the F unturned, turned a quarter and turned a half, place it on the
# ground at row 4, column 4, search for the unturned F, and print the score
# at the true position, the reported position with its score, and how many
# pixels away the report is.

corner = Picture([[1.0, 0.0, 0.0], [1.0, 0.0, 0.0], [1.0, 1.0, 1.0]])
# Double the L, place it on a twelve by twelve ground at row 3, column 3,
# search for the original L, and print the score where the object begins,
# the reported position with its score, and the believability ratio.`,
              `import numpy as np
from oop_ml.core.computer_vision.matching import MatchRule, MatchScores, placed, scaled_up, turned_by_a_right_angle
from oop_ml.core.computer_vision.picture import Picture

glyph = Picture([[1, 1, 1, 1, 1], [1, 0, 0, 0, 0], [1, 1, 1, 1, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0]])
ground = Picture(np.full((15, 15), 0.1))
rule = MatchRule.NORMALISED_CROSS_CORRELATION

for label, drawn in (("unturned", glyph), ("quarter turn", turned_by_a_right_angle(glyph, 1)), ("half turn", turned_by_a_right_angle(glyph, 2))):
    scores = MatchScores.of(placed(ground, drawn, 4, 4), glyph, rule)
    truth, best = scores.at(4, 4), scores.best
    print(f"{label}: the true position scores {truth.score:.4f}; reported row {best.row}, column {best.column} "
          f"scoring {best.score:.4f}, {best.pixels_away_from(truth):.4f} pixels away")

corner = Picture([[1.0, 0.0, 0.0], [1.0, 0.0, 0.0], [1.0, 1.0, 1.0]])
doubled = scaled_up(corner, 2)
scores = MatchScores.of(placed(Picture(np.full((12, 12), 0.1)), doubled, 3, 3), corner, rule)
print(f"doubled L: the object begins at row 3, column 3 scoring {scores.at(3, 3).score:.4f}; reported row {scores.best.row}, "
      f"column {scores.best.column} scoring {scores.best.score:.4f}, ratio {scores.believability().ratio:.4f}")`,
              `unturned: the true position scores 1.0000; reported row 4, column 4 scoring 1.0000, 0.0000 pixels away
quarter turn: the true position scores 0.0385; reported row 8, column 4 scoring 0.5204, 4.0000 pixels away
half turn: the true position scores -0.1218; reported row 1, column 3 scoring 0.6591, 3.1623 pixels away
doubled L: the object begins at row 3, column 3 scoring 0.3162; reported row 5, column 4 scoring 1.0000, ratio 2.0917`,
              { hints: ["placed(background, thing, row, column) writes a Picture into another at that top-left position, turned_by_a_right_angle(picture, quarter_turns) rotates one, and scaled_up(picture, 2) repeats every pixel twice each way.", "MatchScores.of(picture, template, rule) scores every position, at(row, column) reads one, best is the winner, and a ScoredPosition answers pixels_away_from another.", "believability() on the doubled L’s scores answers an object whose ratio is the winner over the best position that does not overlap it."], check: numberCheck("How many pixels from the true position is the winner reported after the half turn?", 3.1623, 0.0005, "The upside-down F is partly the negative of an F, so the true position scores −0.1218, worse than nothing, and the winner is reported at row 1, column 3, which is three rows and one column from the truth, the square root of ten pixels away, scoring 0.6591. The right answer is not reported with a lower score; it is discarded and a confident wrong one is put in its place, which is the same shape of failure as the doubled L found perfectly at a place no L begins.") },
            ),
            exercise(
              "Find where the normalised rule stops being defined",
              ["Part 7 names three places the arithmetic runs out. A template of one brightness has no deviation pattern, so the normalised rule is undefined at every position while the squared differences are unaffected; a patch whose pixels differ by 1.4 times ten to the minus seventeen is scored at 0.7454 in full confidence; and a seven by seven template in a fifteen by fifteen picture leaves no position that fails to overlap the winner, so its believability cannot be asked. Make all three happen.", "The refusals are the library’s own, so each is caught as an MLLibError and printed by its class name. The barely varying patch is built the way the page builds it, a small cross scaled down to the seventeenth decimal place on flat ground."],
              `import numpy as np
from oop_ml.core.computer_vision.matching import MatchRule, MatchScores, TemplateMatcher, placed, score_surface
from oop_ml.core.computer_vision.picture import Picture
from oop_ml.core.exceptions import MLLibError

flat = Picture(np.full((5, 5), 0.5))
# Try to build a matcher for the flat template under the normalised rule
# and under the squared differences. Print the refusal's class name where
# there is one, and what an exact copy scores where there is not.

small_cross = Picture([[1.0, 0.0, 1.0], [0.0, 1.0, 0.0], [1.0, 0.0, 1.0]])
barely = np.full((9, 9), 0.1)
barely[3:6, 3:6] = 0.1 + np.asarray(small_cross) * 1e-17
# Cut the three by three patch at row 3, column 3, print its spread, and
# print the normalised score the search reports at that position.

crowded = Picture(np.random.default_rng(99).random((7, 7)))
texture = Picture(np.random.default_rng(0).random((15, 15)))
# Place the seven by seven thing on the texture at row 4, column 4, search
# for it, ask for the believability of the winner, and print the refusal.`,
              `import numpy as np
from oop_ml.core.computer_vision.matching import MatchRule, MatchScores, TemplateMatcher, placed, score_surface
from oop_ml.core.computer_vision.picture import Picture
from oop_ml.core.exceptions import MLLibError

flat = Picture(np.full((5, 5), 0.5))
for rule in (MatchRule.NORMALISED_CROSS_CORRELATION, MatchRule.SUM_OF_SQUARED_DIFFERENCES):
    try:
        matcher = TemplateMatcher(template=flat, rule=rule)
        print(f"{rule.value}: accepted, an exact copy scores {matcher.score_of_an_exact_copy}")
    except MLLibError as refusal:
        print(f"{rule.value}: {type(refusal).__name__}")

small_cross = Picture([[1.0, 0.0, 1.0], [0.0, 1.0, 0.0], [1.0, 0.0, 1.0]])
barely = np.full((9, 9), 0.1)
barely[3:6, 3:6] = 0.1 + np.asarray(small_cross) * 1e-17
patch = Picture(barely).patch_at(3, 3, 3, 3)
score = np.asarray(score_surface(Picture(barely), small_cross, MatchRule.NORMALISED_CROSS_CORRELATION))[3, 3]
print(f"a patch whose spread is {patch.brightest - patch.darkest:.1e} scores {score:.4f}")

crowded = Picture(np.random.default_rng(99).random((7, 7)))
texture = Picture(np.random.default_rng(0).random((15, 15)))
scores = MatchScores.of(placed(texture, crowded, 4, 4), crowded, MatchRule.NORMALISED_CROSS_CORRELATION)
try:
    scores.believability()
except MLLibError as refusal:
    print(f"{type(refusal).__name__}: {refusal}")`,
              `normalised_cross_correlation: AllSameValuesError
sum_of_squared_differences: accepted, an exact copy scores 0.0
a patch whose spread is 1.4e-17 scores 0.7454
UndefinedMetricError: every position within a 9 by 9 search overlaps the winner at row 4, column 4, so there is no second candidate and believability is undefined`,
              { hints: ["The flat template is refused when the matcher is built rather than when a picture is searched, since the template and the rule are fixed at construction, so the try has to wrap TemplateMatcher itself.", "patch_at(3, 3, 3, 3) cuts the patch, and a Picture carries its brightest and darkest, whose difference is the spread. score_surface indexed at [3, 3] is the score at that position.", "believability() raises when no position is at least the template’s own side away from the winner, which in a nine by nine surface is every position, and the message says so."], check: numberCheck("What does the normalised rule score the barely varying patch at?", 0.7454, 0.0005, "Its deviation pattern points somewhere real, however small it is, so the cosine is a real cosine and is reported without hesitation. The rule divides out the patch’s own contrast, and dividing out something that was never there magnifies it to full size. A patch that is flat to within rounding is protected only because its leftover is itself nearly constant and a constant is perpendicular to any centred template, which is why twenty-five pixels of one value score exactly 0.0 and nine score 5 times ten to the minus seventeen.") },
            ),
          ],
        },
      ]}
    />
  );
}
