import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { ImportanceBars } from "@/components/widgets/ImportanceBars";
import { ScrambleLadder } from "@/components/widgets/ScrambleLadder";

export const metadata: Metadata = {
  title: "Which Feature Mattered · oop_ml",
  description:
    "Two ways to ask a fitted model which columns it leaned on, one reading the tree's own splits and one scrambling a column and watching the score fall, and where the two disagree.",
};

export default function FeatureImportancePage() {
  return (
    <ConceptPage
      title="Which Feature Mattered"
      tagline="Two ways to ask a model which columns it leaned on, and a column of pure noise that only one of them sees through, and only on a model that works."
      prerequisites={
        <>
          The first measure reads the splits of a{" "}
          <Link
            href="/concepts/decision-trees"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            decision tree
          </Link>
          , and the model the two measures disagree about is a{" "}
          <Link
            href="/concepts/random-forests"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            random forest
          </Link>
          , so read those two pages first, and in particular the trees
          page&rsquo;s account of the split search and the gain it scores each
          question by.
        </>
      }
      history={
        <>
          <p>
            Every page under this heading so far asked whether a model works.
            This one asks a different question of a model that does, which of
            its columns it actually used. The answer decides whether a column
            that is expensive to collect can be dropped, whether a column that
            should never have been available has leaked into the fit, and
            whether the model found the structure a person who knows the
            field would expect it to find. A model that scores well by leaning
            on the wrong column is a model that stops working the moment the
            world shifts underneath that column.
          </p>
          <p>
            Trees got their first answer from Leo Breiman, Jerome Friedman,
            Richard Olshen and Charles Stone in their 1984 book on
            classification and regression trees, which added up the impurity
            each feature&rsquo;s splits had removed. When Breiman introduced
            random forests in 2001 he proposed a second answer of a different
            character altogether, scramble one column in the rows a tree never
            saw and measure how far its accuracy falls. In 2007 Carolin
            Strobl, Anne-Laure Boulesteix, Achim Zeileis and Torsten Hothorn
            showed that the first measure favours columns that hand the split
            search many places to cut, which is the bias this page puts on
            display, on a column that carries no information at all.
          </p>
        </>
      }
      playground={<ImportanceBars />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                The data behind the box above is a puzzle built to defeat the
                trees page&rsquo;s search. Two columns are coin flips, and the
                class is 1 exactly when the two flips disagree. Ask about
                either coin alone and both sides of the split come back half
                and half, no better than the node was before, so no single
                question helps, and a search that can only see one question
                at a time has nothing to prefer. A third column is pure noise,
                drawn without any reference to the class, and it offers
                something the coins cannot. With three hundred distinct values
                it hands the search a threshold between every adjacent pair,
                and among hundreds of tries one always lines up with a few
                rows by chance.
              </p>
              <p>
                The two rows of bars put two different questions to the same
                fitted model. The left reads the model&rsquo;s own
                bookkeeping, crediting each feature with the impurity its
                questions removed, weighted by how many rows each question was
                asked of. The right ignores the bookkeeping and runs an
                experiment. Take the fitted model, scramble one column so that
                it keeps every value it had but loses any pairing with the
                class, score the model again, and credit the column with how
                far the score fell.
              </p>
              <p>
                The forest shows by default, and its two readings disagree.
                Reading the splits hands the noise column 0.519 of the
                explanation, more than the two real columns combined.
                Scrambling it costs the forest almost nothing, 0.018, while
                scrambling either coin drops a model that scored 0.993 to a
                coin toss. Switch to the lone tree and the disagreement
                vanishes, both readings hand the noise column most of the
                credit. The rest of this page is about why all four of those
                readings are correct.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                The first measure is called mean decrease in impurity, and a
                fitted tree can report it without touching the data again.
                Walk every decision node. Each one asked a question about one
                feature, and the trees page&rsquo;s search recorded the gain
                that question bought, the impurity of the node minus the
                weighted impurity of its two children. Credit the feature with
                that gain times the number of rows that reached the node, add
                up each feature&rsquo;s credits, and divide by the total so
                the shares sum to one.
              </p>
              <Equation>
                {
                  "credit(feature) = Σ over its nodes of  rows at node × gain at node\nshare(feature)  = credit(feature) / Σ credit over every feature"
                }
              </Equation>
              <p>
                The row weighting is doing real work. A question asked of
                three hundred rows decides where three hundred rows go, a
                question asked of twelve rows near a leaf decides where twelve
                go, and an unweighted count would call those equal. The bias
                lives in the search rather than in the arithmetic. A coin
                offers one threshold, so it gets one chance to show a gain. A
                continuous column offers a threshold between every adjacent
                pair of values, so it gets hundreds, and the search keeps the
                best of them. A forest scores every member&rsquo;s splits by
                the same search, so averaging twenty members steadies the
                reading without correcting it.
              </p>
              <p>
                The second measure, permutation importance, never looks inside
                the model. Score it once with every column intact. Then, for
                each column in turn, shuffle that column&rsquo;s values among
                the rows, leaving every other column and the class where they
                were, and score again. The shuffle preserves the
                column&rsquo;s distribution exactly and destroys its pairing
                with the class, so whatever the score lost is attributable to
                that pairing and to nothing else. One shuffle is one noisy
                draw, so the library shuffles each column five times and
                averages the drops, clamps a negative average to zero, and
                divides by the total the same way.
              </p>
              <Equation>
                {
                  "drop(feature)  = intact score − mean score with that column shuffled\nshare(feature) = max(0, drop) / Σ max(0, drop) over every feature"
                }
              </Equation>
              <p>
                Both readings above are taken on the rows the model was fitted
                to, which is the library&rsquo;s own reading, and it makes the
                question a precise one, which columns did this model lean on
                while it learned. A held-out reading asks instead what the
                model leans on when it is being useful, and for a model that
                scores at chance on rows it never saw, the lone tree here,
                there would be no drop to measure at all.
              </p>
            </>
          ),
        },
        {
          title: "A Worked Example",
          content: (
            <>
              <p>
                Press the worked draw button and switch to the lone tree. It
                grew four decision nodes, and the API reports each one with
                its rows and its gain, so the left bars can be summed by
                hand. The root asked about the noise column, and so did two of
                the three questions beneath it. The one question about a coin
                was asked of twelve rows.
              </p>
              <Equation>
                {
                  "root      distractor   300 rows × 0.00836 = 2.51\ndepth 1   distractor   295 rows × 0.00509 = 1.50\ndepth 2   second        12 rows × 0.11574 = 1.39\ndepth 2   distractor   283 rows × 0.00636 = 1.80"
                }
              </Equation>
              <p>
                The noise column collects 2.51 + 1.50 + 1.80 = 5.81, the
                second coin collects 1.39, the first coin was never asked
                about and collects nothing, and the total is 7.20. Dividing
                gives 5.81 / 7.20 = 0.807 and 1.39 / 7.20 = 0.193, which are
                the left bars. Notice that the question about the second coin
                bought the largest gain of the four by a wide margin, 0.116
                against a few thousandths, and still finished a distant
                second, because it was asked of twelve rows and the noise
                questions were asked of hundreds.
              </p>
              <p>
                Now the forest, and the right bars. Intact, it scores 0.993 on
                its rows. Scramble the first coin and it falls to 0.538,
                scramble the second and it falls to 0.515, scramble the noise
                column and it barely moves, to 0.977. The drops are 0.4553,
                0.4787 and 0.0167, summing to 0.9507, and dividing gives
                0.479, 0.504 and 0.018. The same forest, read from its splits,
                hands the noise column 0.519, so the two bars for that column
                sit at more than half and at nearly nothing, side by side, on
                one model.
              </p>
            </>
          ),
        },
        {
          title: "Reliance Is Not a Lie Detector",
          content: (
            <>
              <p>
                It is tempting to read the forest&rsquo;s result as the
                scramble test seeing through a column that fooled the split
                count, and to expect it to do the same on any model. The lone
                tree says otherwise. It scores 0.537 on its own rows and 0.497
                held out, chance either way, because it rooted on noise and
                never found the two-question structure. Read from its splits,
                the noise column gets 0.807. Scramble that column and the tree
                falls from 0.537 to 0.504, most of the little it had above
                chance, while scrambling the second coin takes it only to
                0.523 and scrambling the first changes nothing, so the
                scramble reading hands the noise column 0.710. Both readings
                name the noise column, and both are right. That tree built
                itself out of noise, and it genuinely relies on it.
              </p>
              <p>
                What the scramble test measures is reliance, which is a fact
                about the fitted model rather than about the world. The
                disagreement needs a model that works, because only a model
                that found the real structure can be leaning on the coins
                while its split count still credits the noise. The forest is
                that model, at 0.993 on its rows and 0.960 held out, and it is
                exactly there that the split count, biased by the hundreds of
                thresholds it was offered in every member, keeps crediting a
                column the model no longer needs.
              </p>
              <p>
                Two more cautions follow from measuring reliance. A column the
                model never consulted scores zero however well it would have
                predicted the class on its own, so a zero is a finding about
                this fit and not a verdict on the column. And two columns
                carrying the same signal hide each other, since scrambling one
                leaves the model free to lean on the other, so both look
                unimportant, which is a failure the split count at least
                softens by dividing the credit between them. The scramble test
                also costs a scoring pass per column per repeat, where the
                split count costs one walk of the tree, and that price is why
                the library keeps both.
              </p>
            </>
          ),
        },
        {
          title: "How to Derive",
          content: (
            <>
              <p>
                The row weighting in the first measure is not a choice, it
                falls out of asking how much impurity the whole tree removed.
                A node holding n of the N training rows has an impurity I,
                and its split sends rows to two children with impurities I
                left and I right. The gain the trees page defined is the fall
                in impurity inside that node, and the node&rsquo;s share of
                the whole tree&rsquo;s fall is that gain scaled by the
                fraction of rows that reached it.
              </p>
              <Equation>
                {
                  "gain = I − (n_left / n)·I_left − (n_right / n)·I_right\ntotal impurity removed by the tree = Σ over nodes of (n / N) × gain"
                }
              </Equation>
              <p>
                Group the sum by which feature each node asked about and the
                N cancels out of every share, leaving each feature&rsquo;s
                credit as the sum of n times gain over its nodes, divided by
                the same sum over all nodes. That is the mechanism&rsquo;s
                formula, and it says precisely what the shares are, the
                fraction of the tree&rsquo;s total impurity removal that each
                feature&rsquo;s questions accounted for. A forest averages its
                members&rsquo; shares rather than their credits, because a
                deeper member removed more impurity in absolute terms without
                that meaning its features mattered more.
              </p>
              <p>
                The second measure is an expectation estimated by sampling.
                Write s for the intact score and s with column j shuffled for
                the score after one random permutation of that column. The
                drop is the difference between the intact score and the
                average of that quantity over every possible permutation, and
                five permutations estimate the average.
              </p>
              <Equation>
                {
                  "drop_j = s − (1 / R) · Σ over R shuffles of s(column j shuffled)\nshare_j = max(0, drop_j) / Σ_k max(0, drop_k)"
                }
              </Equation>
              <p>
                Two details in that formula are deliberate. The clamp comes
                after the average, not inside it, because the five drops are
                five estimates of one number and a negative one should be
                allowed to cancel a positive one. Clamping each draw would
                push a useless column&rsquo;s score upward. And the column is
                shuffled rather than replaced with noise, because replacing
                it would change two things at once, the column&rsquo;s
                pairing with the class and its own distribution, and the drop
                would no longer be attributable to the first alone.
              </p>
              <p>
                The ladder below is the scramble test on the worked draw, both
                models at once. The lone tree&rsquo;s dots huddle at chance,
                since there was little to lose. The forest&rsquo;s two coins
                fall a long way and its noise column barely leaves the line.
              </p>
              <ScrambleLadder />
            </>
          ),
        },
      ]}
    />
  );
}
