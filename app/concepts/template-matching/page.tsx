import { pageMetadata } from "@/lib/seo";
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

export const metadata: Metadata = pageMetadata("/concepts/template-matching", {
  title: "Template Matching · Perceptron Lab",
  description:
    "A known image pattern can be compared with regions of a larger image to locate possible matches. The comparison rule determines how changes in brightness affect the match score.",
});

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function TemplateMatchingPage() {
  return (
    <ConceptPage
      lessonId="template-matching"
      intuition={lessonIntuitions["template-matching"]}
      technicalStart="Part 2. Three Ways To Score A Fit"
      openingTitle="Find This Small Picture Inside That Larger One"
      playgroundTitle="Search an image for a familiar patch"
      playgroundIntro="Inspect the best position and its score, then compare it with competing positions. Try changes in lighting or appearance and check whether the reported match remains convincing."
      title="Template Matching"
      tagline={"A known image pattern can be compared with regions of a larger image to locate possible matches. The comparison rule determines how changes in brightness affect the match score."}
      prerequisites={
        <>

          Nothing is fitted on this page and nothing is learned, so none of the
          modeling ideas elsewhere on the site are needed. A picture here is a
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
                  Suppose we have a small picture of a cross and want to find it in a larger scene. We already know the appearance we are looking for. The question is where a similar arrangement of brightness occurs. We can slide the small picture over the scene and compare the values at each position.
                </p>
                <>
<p>The scene is forty-eight pixels on each side. It contains a square, a disc, a diagonal bar and three copies of our cross template. A gradual brightness increase makes the right side lighter than the left. That uneven lighting will help us compare which matching rules respond to shape and which also respond to brightness.</p>
                <p>The crosses use the same seven-by-seven drawing, placed at row 26, column 26; row 38, column 12; and row 39, column 36. Their shapes match exactly, but the brightness ramp makes their values differ. A useful comparison here should explain why it prefers one location over another.</p>
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
                <p>This scan evaluates every valid placement and returns the best one under the chosen scoring rule. There is no training procedure learning a new appearance from examples. The template, candidate placements and score define the comparison; deciding whether the best result is a real detection requires additional criteria.</p>
                <p>
                  We call the small picture the template. Comparing it at each position in the larger scene gives us a grid of scores, or score surface. Keep that surface in view. It shows whether the best match stands out from the alternatives, or whether many positions look almost equally plausible. A best score alone cannot establish that the object is present.
                </p>
              </SubSection>

              <SubSection title="3. Only the positions where the whole template fits">
                <p>The search here evaluates only placements where the template fits entirely inside the image. Partial placements would require a separate policy for missing pixels and score normalization. Restricting to complete windows keeps each candidate comparison the same size, so the score surface is smaller than the search image.</p>
                <Equation>{`positions = (picture height − template height + 1) × (picture width − template width + 1)`}</Equation>
                <p>A forty-eight-by-forty-eight image and seven-by-seven template give a forty-two-by-forty-two score surface with 1,764 placements. A complete template can touch the frame and still be scored. Only placements extending partly beyond the frame are excluded.</p>
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
                <p>Another score multiplies corresponding template and patch pixels and adds the products. For these nonnegative images, bright patch values under bright template values contribute large products. This raw correlation uses a larger score as the preferred comparison, but brightness alone can also raise it.</p>
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
                <p>The dot-product score has no universal value identifying a perfect match. Brightness and template size can both affect its magnitude. We need to examine those dependencies before interpreting a large score as evidence of matching shape.</p>
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
                  A large sum of products can come from matching the template&apos;s bright regions, but a uniformly bright patch can also produce a large total. The raw score has no separate way to account for the patch&apos;s mean brightness. We need to decide whether that brightness is useful evidence or something the comparison should remove.
                </p>
                <KeepInMind>
                  A bright, featureless patch can compete with a patterned template under the raw dot product. Whether it wins depends on the values and template; the six-pixel example demonstrates the possibility rather than a rule that every bright wall must win.</KeepInMind>
              </SubSection>

              <SubSection title="9. Take each patch&rsquo;s own mean away, then divide by what is left">
                <p>For this comparison, model a lighting change as a common additive offset and positive multiplicative gain. Centering removes the offset; dividing by the deviation length removes the gain. Real camera changes can also alter blur, clipping and noise, which these two operations do not remove.</p>
                <p>First subtract each patch&apos;s own mean. A common additive brightness shift affects that mean by the same amount, so it disappears from the deviations. The patch&apos;s arrangement of brighter and darker positions remains.</p>
              <p>Now divide those deviations by their vector length, provided it is nonzero. A common positive brightness multiplier scales both the deviations and their length, so it cancels too. Apply the same preparation to the template. Their dot product is then the cosine similarity of the two deviation patterns. A constant patch has no deviation direction and needs the explicit policy described here.</p>
                <Equation>{`deviation(patch) = patch − mean(patch)

              deviation(patch) · deviation(template)
score = ─────────────────────────────────────────────────
        |deviation(patch)| × |deviation(template)|`}</Equation>
                <p>

                  The answer lies between −1 and 1, and it reaches exactly 1
                  when the patch is the template multiplied by any positive
                  amount and shifted by any amount at all. That is the property
                  the rule exists for, and it is a statement about a whole family
                  of patches rather than about one. This is normalized
                  cross-correlation.
                </p>
                <WhyThisWorks title="Why centering and normalizing remove offset and positive gain">
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
                <p>The name normalized cross-correlation is also used for a version that divides by vector lengths without first removing the means. That version is invariant to positive gain but can change under an additive offset. This page uses the centered version, so record both operations when comparing implementations.</p>
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
                      expression: "Normalized cross-correlation",
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
              "The top-left template position can range from zero through forty-one in each coordinate:\n\n```math\npositions per side = 48 − 7 + 1 = 42\ntotal positions = 42 × 42 = 1,764\n```\n\nThese are full-overlap positions only. A method intended to compare partial templates at the border would need a different scoring convention.",
            ),
            trueFalse(
              "A copy of the cross lying partly outside the frame would be reported with a low score rather than missed.",
              false,
              "The true top-left position of that partial copy lies outside the full-overlap search surface, so the search never evaluates it as a complete template. It may still report some other matching fragment or background patch. The output alone does not identify the excluded partial occurrence.",
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
              "Mean subtraction cancels a common additive offset in a window. Dividing by the deviation-vector lengths removes a positive multiplicative scale when both patterns have nonzero variation. These are mathematical affine-intensity invariances; clipping, shadows or spatially varying illumination need not follow that model. Normalizing raw lengths without centering removes positive gain but generally remains sensitive to offsets.",
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
                <p>Remove the brightness ramp using the control above, leaving the shapes and matching settings fixed. Comparing the two runs isolates the ramp’s effect in this constructed scene. Check both the score values and which locations rank first.</p>
              </SubSection>

              <SubSection title="11. Where each rule lands on the workbench">
                <p>

                  One scene, one template, three rules, three different answers.
                  The squared differences report row 38, column 12. The
                  multiplication reports row 9, column 33. The normalized rule
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
                      "Normalized",
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

                  The normalized rule lands on a copy, and its three scores are
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

1.0098 × 27.66 ≈ 27.9307`}</Equation>
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

                  Under the normalized rule the same position scores essentially
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

                  The normalized rule gives all three copies the same score,
                  0.9991504412, agreeing in every digit that is carried. Two
                  things about that number are worth a moment.
                </p>
                <p>

                  It is the same at all three because the ramp inside a
                  seven-pixel patch is the same slope wherever that patch is cut
                  from. The copies differ in how much brightness was added, and
                  that is an offset, which the centering removes completely. What
                  the centering does not remove is the slope, and the slope is
                  identical at all three positions.
                </p>
                <p>

                  It falls short of 1 because that slope is a pattern the
                  template does not have. Since the slope is perpendicular to the
                  centered cross, by the symmetry argument above, it adds nothing
                  to the agreement in the numerator and adds length to the patch
                  in the denominator. A cosine whose numerator is unchanged and
                  whose denominator has grown is smaller.
                </p>
                <WhyThisWorks title="How a perpendicular brightness ramp changes the correlation">
                  <p>

                    Write the patch as template plus ramp, where ramp is
                    perpendicular to the centered template. The numerator is
                    unchanged at the template&rsquo;s squared length. The
                    patch&rsquo;s length, by the right-angle rule, is the square
                    root of the sum of the two squared lengths. So the cosine is
                    the template&rsquo;s length divided by that, which
                    rearranges to one over the square root of one plus the
                    squared ratio of the two lengths.
                  </p>
                  <Equation>{`|deviation(ramp)| = 0.0894
|deviation(template)| = 2.1665

score = 1 / sqrt( 1 + (0.0894 / 2.1665)² ) ≈ 0.9991504412`}</Equation>
                  <p>The displayed intermediate lengths are rounded. Using the full values gives the reported correlation. A steeper within-patch ramp reduces the true copies’ scores because it adds a pattern absent from the template. Which candidate wins still depends on all the competing positions.</p>
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

                  The sharpest way to see what the normalizing bought is to
                  relight the whole scene and search it again with the same
                  template. Every pixel multiplied by 1.6 and then shifted by
                  0.15, which is roughly what turning a lamp up and adding a
                  second one does to a photograph, and nothing else altered.
                </p>
                <p>After the affine brightness change, squared differences select background at row zero, column nineteen, with score 4.7145. The genuine copies score from 21.8990 to 40.2612. The unchanged numerical template now favors a different patch, showing that this score is not invariant to the tested lighting transformation.</p>
                <p>
                  The multiplication still reports the inside of the disc, which
                  is not a recovery so much as the same failure surviving a
                  change that made it no worse.
                </p>
                <p>

                  The normalized rule reports the same position with the same
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
                  Lighting changes can alter pixel values while leaving object geometry unchanged. The centered normalized score handles the particular common gain-and-offset model used here. Other changes, such as shadows, blur and clipping, require additional checks rather than the same invariance claim.</InAModel>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Telling A Real Match From The Best Of A Bad Set",
          content: (
            <>
              <SubSection title="15. There is no position at which it answers that nothing is here">
                <p>A nonempty search has a best-scoring position even when the object is absent. Searching a brick wall for a face still returns coordinates. The search result therefore identifies the strongest candidate under its score, rather than confirming that the intended object exists there.</p>
                <p>Across the six random textures without the inserted shape, the best normalized score ranges from 0.3876 to 0.5341. A nonzero or moderately large score therefore does not prove presence. In this exact-paste experiment, the inserted template can score one, so an absolute threshold can separate these easy examples. That does not establish a threshold for noisier or changed appearances.</p>
              </SubSection>

              <SubSection title="16. The winner against the best position that does not overlap it">
                <p>The height of the best score is one piece of evidence. Its separation from competing peaks is another. An isolated strong peak suggests a more distinctive candidate than several similarly strong peaks, but repeated real objects can also produce several peaks. The comparison needs to match the detection problem.</p>
                <p>Nearby placements overlap much of the same image patch and can receive similarly high scores. Comparing only with the immediate runner-up can therefore measure a small shift of the same candidate. Here the comparison excludes placements overlapping the winner and uses the best remaining position. That defines a particular distinctiveness check, rather than a universal confidence measure.</p>
                <Equation>{`where a higher score is better    ratio = winner / runner-up
where a lower score is better     ratio = runner-up / winner`}</Equation>
                <p>For positive scores with a nonzero denominator, these ratios are at least one and a larger value indicates greater relative separation. Zero or negative correlation scores need an explicit convention. The SDK reports a ratio of one when the best higher-is-better score is nonpositive, and handles a positive best score with a nonpositive runner-up as infinite separation. These are scoring policies, not calibrated probabilities.</p>
              </SubSection>

              <SubSection title="17. Present and absent, over twelve searches">
                <p>
                  Six pictures of random texture, each searched twice, once with
                  a five-by-five shape drawn into it and once without. Twelve
                  searches, twelve ratios.
                </p>
                <BelievabilityStrip showSizes={false} />
                <p>The absent-image ratios range from 1.0179 to 1.3654; the exact-paste present-image ratios range from 1.8722 to 2.5797. A ratio threshold of 1.5 separates all twelve. The absolute normalized scores can also separate these exact copies from these random textures. The next examples show why neither result supplies a universal detection rule.</p>
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
                <p>For the three-by-three template, the best chance agreement in twenty fifteen-by-fifteen textures averages 0.7752 and reaches 0.8844. Those competitors make the winner-to-runner-up ratio less decisive, and the displayed present and absent ratio ranges overlap. An exact inserted copy still scores one. This experiment limits the ratio test; it does not prove that no scoring or threshold rule can use a small template.</p>
                <BelievabilityStrip />
                <p>For the larger random templates tested here, average chance agreement falls to 0.5047 with twenty-five pixels and 0.3326 with forty-nine. All six five-by-five present cases clear the ratio threshold. Distinctiveness also depends on the template’s pattern, background, search size and allowed appearance changes, rather than pixel count alone.</p>
                <KeepInMind>
                  For the inserted seven-by-seven template, the winning placement is at row four, column four of the nine-by-nine score surface. Every other placement is within four rows and columns of that winner, so all patches overlap it. This case has no eligible non-overlapping runner-up. A winner closer to an edge of the same surface could have a non-overlapping rival.</KeepInMind>
              </SubSection>

              <SubSection title="19. A ratio says how distinctive, never how good">
                <p>The score measures agreement with the template. The ratio measures separation from another candidate. A distinctive winner can still have poor agreement, and several good copies can have a weak separation ratio. Read the quantities together and choose acceptance criteria using relevant examples of matches and nonmatches.</p>
                <p>In the workbench image, the normalized score is 0.9991504412 at all three copies. The best non-overlapping rival therefore ties the winner and the ratio is 1.0. The SDK’s ratio-based acceptance test rejects that candidate as insufficiently distinct, even though several true copies are present.</p>
                <p>With three copies, a weak separation ratio correctly indicates that the winning location is not unique. That does not indicate that the object is absent. Finding every occurrence requires examining multiple peaks in the score surface rather than returning only one winner.</p>
              </SubSection>

              <SubSection title="20. Where the better rule gives the worse answer about itself">
                <p>

                  Put those two facts side by side on the same scene and the
                  recommended rule comes off worse than the one it replaced. The
                  squared differences chose the leftmost copy, and because the
                  ramp gave the other two worse scores, that winner stands 3.6900
                  clear of its nearest non-overlapping rival and is reported as
                  believable. The normalized rule chose a copy too, and because
                  it scored all three alike, its ratio is 1.0 and it is reported
                  as not believable.
                </p>
                <p>The squared-difference ratio is higher because lighting makes one genuine copy numerically closer to the template than the others. Treating that higher ratio as more reliable object evidence would confuse appearance differences with uniqueness. The normalized tie correctly preserves the ambiguity among the three matching locations.</p>
                <p>
                  A high match score and a distinctive match answer different questions. Several repeated objects can all match well, leaving the best and second-best scores tied and their ratio at 1.0. Inspect the score surface alongside the ratio before interpreting that tie as a poor match.
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
              "The normalized rule gives all three copies the same score because the centering removes the ramp.",
              false,
              "The centering removes the offset, and the three copies differ only by an offset, which is why they tie at 0.9991504412. What the centering does not remove is the slope, and the ramp inside a seven-pixel patch is the same slope wherever that patch is cut from. That leftover slope is also why the common score falls short of 1. Relighting the whole scene, every pixel multiplied by 1.6 and shifted by 0.15, moves no normalized score by more than 1.7 times ten to the minus fifteen, while the squared differences are sent to a patch of empty ground at row 0, column 19.",
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
              "The supplied five-by-five ratio results separate the tested present and absent cases at 1.5. With three-by-three templates, chance matches are much stronger and several genuine occurrences fail that same ratio threshold. That small experiment does not establish a universally valid threshold. The seven-by-seven examples have no ratio because all valid positions overlap their particular central winner, not because a nine-by-nine score surface can never contain two separated corners.",
            ),
            choice(
              "Why is the confidence ratio taken against the best position that does not overlap the winner?",
              [
                "The second-best position of a genuine match is its own neighbor, which overlaps it almost entirely and scores almost as well",
                "Overlapping positions are never scored by the search",
                "An overlapping rival always scores higher than the winner",
                "An overlapping position would be counted twice in the surface",
              ],
              0,
              "Nearby shifted windows often contain much of the same object and can score almost as highly, so comparing only adjacent positions can measure localization rather than distinctiveness. This heuristic excludes overlapping windows before finding its rival. In the seven-by-seven example the winner is central, leaving no non-overlapping candidate; a different winner position in a nine-by-nine surface could have a valid rival.",
            ),
            trueFalse(
              "On the workbench scene the normalized rule’s ratio is exactly 1.0, so the test reports that the match is not to be believed on a picture holding three perfect copies.",
              true,
              "All three copies have equal normalized scores, so the winning location is not distinctive from its best non-overlapping rival. A ratio of one is the expected outcome for that question. It does not mean the copies are absent or invalid. To find every occurrence, inspect multiple peaks in the score surface and apply an appropriate overlap policy.",
            ),
        ],
        },
        {
          title: "Part 5. Only At The Size And Angle It Was Given",
          content: (
            <>
              <SubSection title="21. A quarter turn, and what is reported instead">
                <p>Fixed pixel offsets encode the template’s size and orientation. A rotated or resized object may no longer align with those offsets. The following examples measure that change rather than assuming that the same template search recognizes every appearance of the object.</p>
                <p>The cross is unchanged by a quarter turn, so it cannot demonstrate this orientation change. The next experiment uses a capital F, whose tested rotated and reflected forms differ. The unrotated inserted copy scores 1.0 at its own top-left position.</p>
                <ChangedThingSearch includeCorner={false} />
                <p>After a quarter turn, the F’s actual top-left position scores 0.0385, while the reported position is four pixels away with score 0.5204. After a half turn, the actual position has negative centered correlation, −0.1218; another position wins at 0.6591, 3.1623 pixels away. These values compare the original template pattern, not the identity of the rotated object.</p>
                <p>The scan still returns its best position, but that position need not be the rotated object’s origin. The score and separation checks must be interpreted for the appearances represented by the template.</p>
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
                <p>A doubled three-by-three L contains an exact unscaled copy of the original pattern at its inner corner, rows two to four and columns one to three. This lets us test a different failure: a locally exact pattern can appear inside a larger object without marking that object’s top-left position.</p>
                <p>
                  So a search for the original L in a picture containing only the
                  doubled one reports a flawless 1.0. The object begins at row 3,
                  column 3, and scores 0.3162 there. The answer given is row 5,
                  column 4.
                </p>
                <ChangedThingSearch />
                <p>The inner-corner match also has separation ratio 2.0917, above the default acceptance threshold. Both score and ratio describe a strong local template match. They do not establish that the returned position marks the larger object’s origin.</p>
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
                <p>Other representations retain different information. Gradients reduce sensitivity to a common additive brightness shift. Regional direction histograms discard some exact position detail. Scale-selected keypoints address changes in image size. Each approach needs its own explanation of which changes it tolerates and which information it loses.</p>
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
                <p>For a direct scan, the number of placements grows approximately with image area when the template is small relative to the image. Work per placement also grows with template area. Increasing the template size reduces the valid placement count, so the exact total follows the formula above rather than a separate quadratic increase in both counts.</p>
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
                <p>The 512-by-512 example requires 825,757,696 pixel-pair contributions in this direct calculation. That is not an unavoidable number of physical memory reads or arithmetic operations: fast correlation, shared patch statistics and other optimized methods can reuse work. The table models the straightforward scan.</p>
              </SubSection>

              <SubSection title="27. Multiplied by every angle and every size worth trying">
                <p>One way to search for changed sizes and orientations is to compare several transformed templates. Twelve angles at thirty-degree intervals and five sizes give sixty template variants. This samples those changes rather than covering every possible appearance, and each variant can have a different valid-search cost.</p>
                <p>If every pass had the table’s 64-by-64 template cost, sixty passes would total 49,545,461,760 direct pixel-pair contributions. Actual resized templates change that count. An object at fifteen degrees would also fall between the tested thirty-degree angles, so the score must tolerate or further sample that mismatch.</p>
                <InAModel>
                  Template matching is useful when the expected appearance is controlled, such as a known screen element or a registration mark. Multiple scales, rotations and optimized searches can extend it, with additional cost and ambiguity. Whether it is sufficient depends on the permitted variations and detection criteria.</InAModel>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Flat Patches, Changed Shapes and Ambiguous Matches" , id: "part-7-where-the-method-stops-being-defined",
          content: (
            <>
              <SubSection title="28. A template with one brightness has no direction to compare">
                <p>

                  The normalized rule is a cosine between two deviation patterns,
                  and a cosine is an angle between two directions. A template
                  whose pixels are all the same number has a deviation pattern
                  that is the zero vector once its mean is taken away, and the
                  zero vector has no direction. There is no angle to measure,
                  which means the score is undefined at every position at once
                  rather than badly behaved at some of them.
                </p>
                <p>A centered constant template has zero deviation length, so this normalized score is undefined. Squared differences and raw products do not divide by that length and remain computable. A flat template can therefore be a valid input for one comparison rule and invalid for another.</p>
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
                        "There is no position at which it fits, so the set being maximized over is empty and there is no best position to name.",
                    },
                    {
                      expression: "picture with no room for a second candidate",
                      reason:
                        "no eligible non-overlapping rival exists for this winner. With the 7-by-7 inserted template at position (4, 4), all placements in the 9-by-9 score surface are at most four rows and columns away, so they still overlap it. This depends on the winning position.",
                    },
                  ]}
                />
              </SubSection>

              <SubSection title="29. A patch with one brightness, which is a different case">
                <p>
                  A flat candidate patch inside a varied image is a local problem: the template can still be valid, while this one position has no defined normalized comparison. We need a policy for skipping or marking that candidate without confusing it with a well-defined low score.
                </p>
                <p>An implementation can skip an undefined flat-patch comparison, mark it separately or use a declared fallback value. This SDK uses zero in the relevant case so the score surface remains numeric. That value is a convention, not the result of measuring an angle between a nonzero template and a directionless patch.</p>
                <p>A fallback value communicates the implementation’s policy for an undefined comparison. It should not be interpreted as an observed match score. Without that distinction, a surface of fallback zeros can look like a measured rejection of every candidate.</p>
              </SubSection>

              <SubSection title="30. Very Low Contrast and Numerical Noise" id="30-and-a-patch-that-varies-by-nothing-at-all-is-scored-in-full-confidence">
                <p>
                  Between those two lies the case with no protection. A patch
                  that is flat exactly has deviations that are exactly zero. A
                  patch that is flat to within rounding has deviations of about
                  10<sup>&minus;17</sup>, and dividing those by their own length
                  is dividing rounding by rounding.
                </p>
                <p>In the repeated-value examples, rounding in mean subtraction leaves a nearly constant residual. Its dot product with the centered template largely cancels. The reported values are 0.0 for twenty-five pixels and 5 × 10<sup>−17</sup> for nine. These measurements are small for this use; they are not a guarantee for every nearly flat patch or floating-point path.</p>
                <p>A patch with a very small but nonconstant stored variation can point in a definite numerical direction after normalization. In the displayed example, a brightness range of 1.4 × 10<sup>−17</sup> gives score 0.7454. The normalized score alone cannot establish that this contrast is meaningful relative to measurement precision or noise.</p>
                <KeepInMind>

                  Normalizing contrast makes the score invariant to positive gain, including very small gains. A minimum-contrast check or a regularized denominator can reject or suppress unreliable low-contrast patches, while changing that invariance near the chosen floor. Choose the policy using the image scale and expected noise.</KeepInMind>
              </SubSection>

              <SubSection title="31. What it never knew in the first place">

                <p>The template records one appearance of an object. The scan compares that appearance with candidate patches; it does not reason about the object’s identity. Another shape can produce matching local pixels, and the same object can produce different pixels under changed viewing conditions. The result must be interpreted at that level of comparison.</p>
                <>
<p>The tested size and angle changes show how a fixed template can select the wrong position. Brightness changes depend on the score: the centered normalized rule handles a common positive gain and offset, while the other scores behave differently. Even a robust score still returns a best candidate in an image without the object. A detection decision therefore needs evidence beyond the existence of a winner.</p>

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
                "Minus 0.1218, indicating negative centered-pattern correlation at that location",
                "0.0385",
                "0.1650",
                "0.6591",
              ],
              0,
              "An upside-down F is partly the negative of an F, so the agreement comes out below zero, and the winner is reported 3.1623 pixels away at 0.6591. The other figures belong to the neighboring experiments, 0.0385 to the single right angle and 0.1650 to the doubled F at the corner where it begins.",
            ),
            trueFalse(
              "A search for a three-pixel L in a picture holding only a doubled copy of it reports a flawless 1.0, and the confidence ratio endorses that answer.",
              true,
              "The doubled L contains an exact copy of the original, pixel for pixel, at the join where its two arms meet, so the perfect score is real. The object itself begins at row 3, column 3 and scores 0.3162 there, while the answer given is row 5, column 4, standing 2.0917 clear of anything that does not overlap it. A perfect score is evidence that some patch of the picture is the template, not that the patch is the object.",
            ),
            choice(
              "For the lesson's simple cost estimate, repeat a search costing 825,757,696 pixel comparisons for each of twelve angles and five sizes. What is the total estimated comparison count?",
              [
                "49,545,461,760",
                "About 825 million",
                "86,436",
                "1,764",
              ],
              0,
              "The fixed-cost estimate repeats the baseline search sixty times:\n\n```math\n12 × 5 = 60 searches\n60 × 825,757,696 = 49,545,461,760 pixel comparisons\n```\n\nActual rotated and resized templates can have different dimensions and per-search costs. The finite angle and scale grid is also only a sampled search; intermediate transformations can still give poor matches.",
            ),
            trueFalse(
              "A template whose pixels are all the same number defeats the squared differences, which cannot divide by a spread of zero, while the normalized rule scores it like any other.",
              false,
              "It is the other way round. The normalized rule is a cosine between two deviation patterns, and a flat template’s deviation pattern is the zero vector once the mean is taken away, which has no direction, so there is no angle to measure and the score is undefined at every position at once. The squared differences and the multiplication divide by nothing and are unaffected, so a search for a flat gray square by squared differences is a perfectly sensible request with a perfectly sensible answer.",
            ),
            choice(
              "The supplied patch has a stored brightness range of about 1.4e−17. What does this implementation's normalized matching report?",
              [
                "0.7454, because the rule divides out the patch’s own contrast and dividing out something that was never there magnifies it to full size",
                "Exactly 0.0, because a difference that small is flat for every purpose",
                "Nothing, because the search refuses a patch whose spread falls below a floor",
                "A value near zero, because whatever is left over is itself nearly constant and a constant is perpendicular to any centered template",
              ],
              0,
              "The implementation normalizes the small nonzero deviation pattern and reports correlation 0.7454. A large normalized correlation does not encode how much measured contrast supported it. Near-constant inputs can amplify rounding effects, so an application can add a contrast threshold or another tolerance policy. That is an explicit robustness choice rather than a mathematical impossibility.",
            ),
        ],
        },
        {
          title: "Practice. Searching The Scene With The Library",
          practice: [
            exercise("Score the six by six search under all three rules",["Cut a three-by-three template from the six-by-six image at row 0, column 1. Use every MatchRule to score all positions where the template fits. Print the first score-surface row and each rule's best column and score.", "Print the template values and the search's position and pixel-read counts. Compare the exact copy, partial edge and flat bright window. Their different scores show what each matching rule rewards."],`import numpy as np
from oop_ml.core.computer_vision.matching import MatchRule, MatchScores, score_surface
from oop_ml.core.computer_vision.picture import Picture

picture = Picture([[0.0, 0.0, 0.0, 1.0, 1.0, 1.0]] * 6)
# Cut the three by three template out at row 0, column 1 and print its rows.
# For each rule, score every position, print row 0 of the score surface and
# the column and score of the best position. Then print how many positions
# the search tried and how many pixels it read.`,`import numpy as np
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
print(f"{scores.n_positions} positions, {scores.n_pixels_read} pixels read")`,`template rows [[0.0, 0.0, 1.0], [0.0, 0.0, 1.0], [0.0, 0.0, 1.0]]
sum_of_squared_differences: row 0 of the surface [3.0, 0.0, 3.0, 6.0], best at column 1 scoring 0.0000
correlation: row 0 of the surface [0.0, 3.0, 3.0, 3.0], best at column 1 scoring 3.0000
normalised_cross_correlation: row 0 of the surface [0.0, 1.0, 0.5, 0.0], best at column 1 scoring 1.0000
16 positions, 144 pixels read`,{...{ hints: ["patch_at(row, column, height, width) on a Picture answers the rectangle whose top-left pixel is at that position, and it is how the page cuts the template from the picture.", "score_surface takes the picture, the template and a MatchRule and answers a Picture of scores, smaller than the picture by two in each direction, so np.asarray and row 0 read the four scores of the top row. MatchRule is an enum, so a for loop visits all three.", "MatchScores.of takes the same three arguments and carries the winner as best, with row, column and score, plus n_positions and n_pixels_read."], check: numberCheck("What does the normalized rule score at column 2, the patch holding only part of the edge?", 0.5, 0.001, "The centered patch and reference have partial agreement, below the exact match. Raw multiplication can reward bright flat regions, while normalization compares their contrast patterns under this implementation's constant-patch convention.") },question:"Do the three matching rules select and score the same image windows?"}),
            exercise("Search the workbench three ways and read each winner’s ratio",["Use the supplied 48-by-48 scene and seven-by-seven cross template. For each matching rule, print the exact-copy reference score, winning row and column, winning score and score at each of the three known copies.", "Calculate believability() for each score surface. Print its ratio and is_believable() result. This library compares the winner with the best non-overlapping alternative using a default threshold of 1.5; inspect whether the declared winner is also distinctive."],`import numpy as np
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
# with whether it clears the threshold.`,`import numpy as np
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
    print(f"  ratio against the best non-overlapping rival {clear.ratio:.4f}, believable {clear.is_believable()}")`,`sum_of_squared_differences: an exact copy scores 0.0000
  best at row 38, column 12 scoring 0.4572; the copies score [1.6869, 0.4572, 3.0445]
  ratio against the best non-overlapping rival 3.6900, believable True
correlation: an exact copy scores 20.3076
  best at row 9, column 33 scoring 27.9307; the copies score [25.4276, 22.9559, 27.1932]
  ratio against the best non-overlapping rival 1.0271, believable False
normalised_cross_correlation: an exact copy scores 1.0000
  best at row 26, column 26 scoring 0.9992; the copies score [0.9992, 0.9992, 0.9992]
  ratio against the best non-overlapping rival 1.0000, believable False`,{...{ hints: ["TemplateMatcher takes the template and a rule, and score_of_an_exact_copy is a property of it, 0 for the squared differences, the template’s sum of squares for the multiplication and 1 for the normalized rule.", "scores_on answers a MatchScores whose best is the winner and whose at(row, column) is the score of the patch whose top-left pixel sits there, so the three copies are read at the positions the page names.", "believability() sets the winner against the best position at least the template’s own width away in rows or columns, and answers an object with a ratio and an is_believable() test against the threshold of 1.5."], check: numberCheck("What ratio does the multiplication’s winner stand clear of its best non-overlapping rival by?", 1.0271, 0.0005, "The brightest decoy wins raw multiplication, but its best non-overlapping alternative is close in score. The ratio therefore fails the declared believability threshold. A winning score and a distinctive match are separate checks.") },question:"Can a high matching score distinguish the intended pattern from a decoy?"}),
            exercise("Turn the F, then double the L",["Place the supplied F at row 4, column 4 of the background, first unchanged, then rotated by one and two right angles. Search every image with the original F using normalized cross-correlation. Print the score at the known position, best position and score, and distance between those positions.", "Double the supplied three-by-three L by repeating each pixel twice in both directions. Place it at row 3, column 3 and search with the original L. Print the known-position score, winning position and score, and the believability ratio. Compare finding a matching subwindow with locating the whole resized object."],`import numpy as np
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
# the reported position with its score, and the believability ratio.`,`import numpy as np
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
      f"column {scores.best.column} scoring {scores.best.score:.4f}, ratio {scores.believability().ratio:.4f}")`,`unturned: the true position scores 1.0000; reported row 4, column 4 scoring 1.0000, 0.0000 pixels away
quarter turn: the true position scores 0.0385; reported row 8, column 4 scoring 0.5204, 4.0000 pixels away
half turn: the true position scores -0.1218; reported row 1, column 3 scoring 0.6591, 3.1623 pixels away
doubled L: the object begins at row 3, column 3 scoring 0.3162; reported row 5, column 4 scoring 1.0000, ratio 2.0917`,{...{ hints: ["placed(background, thing, row, column) writes a Picture into another at that top-left position, turned_by_a_right_angle(picture, quarter_turns) rotates one, and scaled_up(picture, 2) repeats every pixel twice each way.", "MatchScores.of(picture, template, rule) scores every position, at(row, column) reads one, best is the winner, and a ScoredPosition answers pixels_away_from another.", "believability() on the doubled L’s scores answers an object whose ratio is the winner over the best position that does not overlap it."], check: numberCheck("How many pixels from the true position is the winner reported after the half turn?", 3.1623, 0.0005, "Rotation changes the reference's pixel arrangement, and a fixed template can prefer the wrong location. A high score and a favorable ratio do not establish robustness to rotations or scale changes outside the search model.") },question:"Does a fixed template still locate an object after rotation or resizing?"}),
            exercise("Find where the normalised rule stops being defined",["Try a constant template under normalized cross-correlation and squared differences. Print any constructor error; otherwise print its exact-copy score. Then inspect the supplied almost-constant patch: print its brightness range and normalized score.", "Finally place the seven-by-seven template in the fifteen-by-fifteen image at row 4, column 4. Search it and request believability(), printing any MLLibError class and message. Check whether a non-overlapping rival exists for that winning location."],`import numpy as np
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
# for it, ask for the believability of the winner, and print the refusal.`,`import numpy as np
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
    print(f"{type(refusal).__name__}: {refusal}")`,`normalised_cross_correlation: AllSameValuesError
sum_of_squared_differences: accepted, an exact copy scores 0.0
a patch whose spread is 1.4e-17 scores 0.7454
UndefinedMetricError: every position within a 9 by 9 search overlaps the winner at row 4, column 4, so there is no second candidate and believability is undefined`,{...{ hints: ["The flat template is refused when the matcher is built rather than when a picture is searched, since the template and the rule are fixed at construction, so the try has to wrap TemplateMatcher itself.", "patch_at(3, 3, 3, 3) cuts the patch, and a Picture carries its brightest and darkest, whose difference is the spread. score_surface indexed at [3, 3] is the score at that position.", "The winning top-left coordinate is (4, 4) within a nine-by-nine score surface. Every other valid top-left position is less than seven pixels away in both coordinates, so each candidate overlaps that winner and believability() has no valid rival."], check: numberCheck("What does the normalized rule score the barely varying patch at?", 0.7454, 0.0005, "Normalization divides out the patch's contrast magnitude, so a minute numerical pattern can receive a substantial correlation score. The score does not encode how much contrast supported it; near-constant data need an explicit tolerance policy.") },question:"Where does normalized matching become undefined or unreliable?"}),
          ],
        },
      ]}
    />
  );
}
