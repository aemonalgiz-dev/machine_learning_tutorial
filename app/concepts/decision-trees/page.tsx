import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { TreePlayground } from "@/components/widgets/TreePlayground";
import { RootGainChart } from "@/components/widgets/RootGainChart";

export const metadata: Metadata = {
  title: "Decision Trees · oop_ml",
  description:
    "A sequence of yes-or-no questions, each chosen from the data to split the classes as cleanly as it can, readable as a flowchart.",
};

export default function DecisionTreesPage() {
  return (
    <ConceptPage
      title="Decision Trees"
      tagline="Yes-or-no questions, each chosen from the data, readable top to bottom as a flowchart."
      prerequisites={
        <>
          Only the idea of classifying, predicting which of two groups someone
          belongs to, which{" "}
          <Link
            href="/concepts/logistic-regression"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            logistic regression
          </Link>{" "}
          established. No calculus appears anywhere on this page, which is
          itself worth noticing.
        </>
      }
      history={
        <>
          <p>
            The models so far answer with arithmetic. A logistic fit hands a
            doctor a slope of 1.68 and an intercept of −7.14, and however
            accurate it is, no one reads meaning off it directly, or checks it
            against their own judgement, or explains it to the patient. Fields
            where decisions carry consequences kept asking for something a
            person could follow, a chain of plain questions ending in an
            answer, the way a field guide keys out a mushroom or a triage
            nurse works a checklist.
          </p>
          <p>
            Statisticians obliged by teaching the questions to write
            themselves. Work on automatic splitting goes back to survey
            researchers in the 1960s, and it matured in two independent
            strands, the CART work of Leo Breiman, Jerome Friedman, Richard
            Olshen and Charles Stone published in 1984, and Ross
            Quinlan&rsquo;s ID3 family in machine learning. Both strands
            settled on the same recipe. Ask the data which single yes-or-no
            question best separates the classes, split on it, and repeat inside
            each half. The result is a model that is also its own explanation,
            and it became the building block a later page will stack into
            forests.
          </p>
        </>
      }
      playground={<TreePlayground />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                The dots are children and adults again, and the tree plays
                twenty questions with them. Its first question splits the
                whole plane in two, everyone with height below some threshold
                one way, everyone else the other. Within each half it may ask
                a follow-up question, splitting again, and so on until each
                region is settled enough to answer.
              </p>
              <p>
                Because every question compares one measurement against one
                threshold, each cut is a straight vertical or horizontal
                slice, and the shaded regions are always a patchwork of
                rectangles. That is the tree&rsquo;s accent. Where logistic
                regression drew one straight boundary at any angle, the tree
                builds staircases out of boxes.
              </p>
              <p>
                The panel under the plot prints the same model as text, each
                question with its yes and no branches, each branch ending in
                an answer. Read it top to bottom with a person in mind and
                you are doing exactly what the model does. That readability
                is the whole reason trees exist.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                The only real machinery is how a question gets chosen, and it
                is a search scored by purity. A candidate question splits the
                people into two sides, and a side is pure when it holds one
                class only. The standard purity score is the Gini impurity,
                the chance that two people drawn from a group belong to
                different classes.
              </p>
              <Equation>{"G = 1 − p₀² − p₁²"}</Equation>
              <p>
                A pure group scores 0, since two draws always match, and a
                fifty-fifty group scores one half, the worst case for two
                classes. Work it once on the worked crowd, five children and
                six adults.
              </p>
              <Equation>{"G = 1 − (5/11)² − (6/11)²\n  = 1 − 25/121 − 36/121\n  = 60/121 ≈ 0.496"}</Equation>
              <p>
                Nearly the worst possible, which is right, since the group is
                nearly half and half. The search then tries every candidate
                question, every threshold between two neighbouring values on
                every feature, and scores each by how much it lowers the
                impurity, weighting the two sides by their sizes. The question
                with the biggest drop wins, the split is made, and the same
                search runs again inside each side, stopping when a region is
                pure, too small to split, or the depth cap is reached.
              </p>
              <p>
                Notice there is no derivative anywhere in that. The search
                does not walk a slope, it exhaustively checks a finite list of
                questions and keeps the best, which is why this page needed no
                calculus. It is also greedy. Each question is chosen as if it
                were the last, with no lookahead, so the grown tree is not
                guaranteed to be the best possible tree, only a reasonable one
                found quickly.
              </p>
            </>
          ),
        },
        {
          title: "Reading the Tree",
          content: (
            <>
              <p>
                Press the ideal case button, which loads the clean crowd of
                eleven, and the whole model comes out as a single question.
              </p>
              <Equation>{"height < 151.5?   yes, answer child   no, answer adult"}</Equation>
              <p>
                The search found that one threshold on height separates these
                five children from these six adults perfectly, so both sides
                come out pure, the impurity drops from 0.496 to zero, and no
                follow-up question would gain anything. The readouts agree,
                accuracy 1.000 with two leaves and a depth of one, and the
                shaded plane is just two rectangles.
              </p>
              <p>
                Now press the muddled crowd, the same people plus a crowd of
                teenagers in the overlap, and one question stops sufficing.
                Watch the printed tree grow follow-up questions as you raise
                the depth cap, each asking about height or weight inside the
                region its parent carved, and watch the rectangles multiply to
                match. Every box in the plane is one path down the printed
                tree, and following a person through the questions lands them
                in exactly the box that contains them.
              </p>
            </>
          ),
        },
        {
          title: "When Trees Memorise",
          content: (
            <>
              <p>
                Keep the muddled crowd loaded and push the depth cap to six.
                The accuracy readout climbs toward 1.000, and the picture
                shows the price. Slivers of rectangle appear around individual
                people, a box of amber carved inside indigo territory to
                rescue one child, and the printed tree sprouts questions whose
                only job is to fence off a single person. The tree has stopped
                describing children and adults and started memorising this
                particular crowd.
              </p>
              <p>
                This is the polynomial page&rsquo;s degree 9 and the
                neighbour page&rsquo;s k of 1 again, the same failure in its
                tree costume, and the depth cap plays the same role the
                penalty played for ridge, a restraint that trades training
                accuracy for believable regions. Trees are unusually prone to
                the failure because every extra level of depth doubles the
                questions available, and unusually blunt to restrain, since
                depth moves in whole steps.
              </p>
              <p>
                The repair the field settled on is less obvious than a better
                dial, and it deserves its own page. Grow many deep trees on
                deliberately varied views of the data and let them vote,
                which somehow turns a crowd of memorisers into a model that
                generalises. That is bagging and random forests, where these
                trees are headed next.
              </p>
            </>
          ),
        },
        {
          title: "How to Derive",
          content: (
            <>
              <p>
                The Gini formula was handed over without ceremony, and it
                comes from one small thought experiment. Draw two people from
                a group at random, independently, and ask how often they
                belong to different classes. The first draw is a child with
                probability p₀ and so is the second, so both are children
                with probability p₀², both adults with probability p₁², and
                the draws agree with the sum of those two.
              </p>
              <Equation>{"P(two draws agree) = p₀² + p₁²\nG = P(two draws differ) = 1 − p₀² − p₁²"}</Equation>
              <p>
                The formula is that thought experiment written down. A pure
                group cannot produce a disagreeing pair, so it scores zero,
                and a fifty-fifty group disagrees half the time, the worst
                two classes can manage, which is why those two facts could be
                used earlier without proof.
              </p>
              <p>
                The split score follows from the same drawing game. After a
                split, a random person lands on the left side with
                probability n_left over n, so the impurity a split leaves
                behind is each side&rsquo;s Gini weighted by its share of the
                people, and a candidate&rsquo;s gain is the parent&rsquo;s
                impurity minus that expectation.
              </p>
              <Equation>{"gain = G_parent − (n_left/n)·G_left − (n_right/n)·G_right"}</Equation>
              <p>
                On the clean crowd the parent scored 60/121 and the winning
                question left two pure sides scoring zero, so the whole 0.496
                was the gain, the number the worked example found.
              </p>
              <p>
                The sweep is drawn below, every question the root weighed
                with the gain it earned, and the winning split is simply the
                tallest mark.
              </p>
              <RootGainChart />
            </>
          ),
        },
      ]}
    />
  );
}
