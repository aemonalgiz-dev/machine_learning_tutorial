import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { MulticlassPlayground } from "@/components/widgets/MulticlassPlayground";
import { RowSumChart } from "@/components/widgets/RowSumChart";

export const metadata: Metadata = {
  title: "More Than Two Classes · oop_ml",
  description:
    "Logistic regression chooses between two. With three or more classes there are two honest ways to extend it, one that shares the probability out across every class and one that asks each class a yes-or-no question, and the two do not agree about whether the answers should add up.",
};

const linkClass =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function MulticlassClassificationPage() {
  return (
    <ConceptPage
      title="More Than Two Classes"
      tagline="Two honest extensions of one model, and only one of them answers with probabilities."
      prerequisites={
        <>
          Both routes are built out of the{" "}
          <Link href="/concepts/logistic-regression" className={linkClass}>
            logistic regression
          </Link>{" "}
          page&rsquo;s model, one fitted once with a wider squash and one fitted
          several times over. The walk that fits them is the{" "}
          <Link href="/primers/calculus" className={linkClass}>
            calculus primer
          </Link>
          &rsquo;s.
        </>
      }
      history={
        <>
          <p>
            The two-class case came first and the extension was not obvious. The
            dataset everybody learns on has three classes, Ronald Fisher&rsquo;s
            1936 measurements of three species of iris, and for decades the
            standard move was to reduce the problem rather than solve it: fit one
            yes-or-no model per class and let them argue. That reduction is what
            this page calls one-vs-rest, and it is still competitive. Ryan Rifkin
            and Aldebaro Klautau published a paper in 2004 with the title
            &ldquo;In Defense of One-Vs-All Classification&rdquo;, whose entire
            argument was that the simple reduction matches the elaborate schemes
            that had been proposed to replace it.
          </p>
          <p>
            The other route came from economics. Daniel McFadden, modelling how
            commuters in the San Francisco Bay Area chose between car and bus and
            train, needed a model where the alternatives competed for one
            traveller&rsquo;s decision, so that making the bus more attractive
            necessarily made the car less so. His conditional logit, published in
            1973 and 1974, does exactly that, and it won him the Nobel prize in
            economics in 2000. When neural networks needed the same competition
            among output units, John Bridle described it in 1989 and gave it the
            name everyone now uses, the softmax.
          </p>
        </>
      }
      playground={<MulticlassPlayground />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                The crowd in the box above has three colours rather than two,
                children, teenagers and adults, and the shaded map is what the
                model would call a person standing anywhere on the plane. Switch
                the route between softmax and one-vs-rest and the map changes
                shape. Both routes get every person right, so accuracy tells you
                nothing about the difference between them.
              </p>
              <p>
                The difference is in the readout underneath, which shows one
                chosen person&rsquo;s three scores and, next to them, what those
                three scores add up to. Under softmax the total is 1.000, always,
                for every person, on every crowd. Under one-vs-rest it is
                whatever it happens to be. That is not a bug in one of the two
                routes. It is the whole distinction, and it is worth
                understanding before choosing between them.
              </p>
              <p>
                The reason is that the two routes are answering different
                questions. Softmax asks which of these three this person is, and
                a question of that shape has answers that must total one because
                the person is exactly one of them. One-vs-rest asks, three
                separate times, is this person a child, is this person a teenager,
                is this person an adult, and three independent questions have no
                reason for their answers to total anything in particular.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                Softmax fits one model with a set of weights per class. Each
                class gets a linear score from the features, and then all the
                scores are squashed together: exponentiate each one and divide by
                the total of all of them.
              </p>
              <Equation>{"score for class k        z_k = w_k · x + b_k\nprobability of class k   e^(z_k) / Σ e^(z_j)"}</Equation>
              <p>
                The division is what couples them. Because every probability is
                divided by the same total, raising one class&rsquo;s score
                necessarily lowers every other class&rsquo;s probability, and the
                answers sum to one by construction rather than by luck. That is
                the property McFadden wanted, and it is the reason the classes
                are said to compete.
              </p>
              <p>
                One-vs-rest never builds anything that wide. It fits the ordinary
                two-class model three times over. The first fit relabels the data
                so children are yes and everyone else is no. The second does the
                same for teenagers, the third for adults. Each fit is squashed on
                its own by the ordinary sigmoid, which knows nothing about the
                other two.
              </p>
              <Equation>{"fit k        yes = class k,  no = everything else\nscore        1 / (1 + e^(−(w_k · x + b_k)))"}</Equation>
              <p>
                To predict, both routes take the largest of the three scores.
                That is why the accuracy can be identical while the numbers
                underneath are so different: the ranking survives, and only the
                interpretation of the individual scores is lost.
              </p>
            </>
          ),
        },
        {
          title: "A Worked Example",
          content: (
            <>
              <p>
                Press the three people button. It loads the smallest crowd that
                shows everything, one person per class sitting evenly spaced on a
                line, at 120 centimetres and 25 kilograms, 150 and 50, and 180
                and 75. Because the features are standardised before fitting, the
                middle person sits at exactly zero in both columns, so their
                linear scores are the intercepts alone with nothing added.
              </p>
              <Equation>{"middle person, softmax\n\n  z  =  0.0000,  3.9602,  −0.7918      (the intercepts)\n  e^z =  1.00,    52.47,    0.45         total 53.92\n\n  probabilities  1.00/53.92,  52.47/53.92,  0.45/53.92\n               =  0.0185,      0.9731,       0.0084     total 1.0000"}</Equation>
              <p>
                Now switch to one-vs-rest and look at the same person. The three
                scores become 0.0101, 0.3333 and 0.0101, and they total 0.3535.
                The two people at the ends fare differently again, each totalling
                1.3293. One person&rsquo;s answers add to about a third and
                another&rsquo;s to about four thirds, from the same fitted model
                on the same three people.
              </p>
              <p>
                The middle score of exactly one third is the interesting one, and
                it is not a coincidence. Consider what the teenager fit is being
                asked to do: separate the middle person from the two on either
                side of them, with a straight line. No line can do that, because
                the yes case sits between the two no cases. Unable to separate
                them, the fit gives up on the features entirely, sets its slope to
                zero, and answers the same thing for everybody. What it answers is
                the base rate, one yes out of three people.
              </p>
              <Equation>{"the teenager fit's intercept  =  log(1/2)  =  −0.6931\n  sigmoid(−0.6931)            =  1/3\n  and its slope               =  0"}</Equation>
              <p>
                So one of the three fits converged, in 49 passes, by discovering
                that it should ignore its inputs. The other two never converged at
                all, running out at the 500-pass limit, because a single yes
                against two nos that can be separated cleanly lets the weights
                grow forever with the likelihood still improving. Softmax&rsquo;s
                own walk hits the same limit on this crowd, and for the same
                reason.
              </p>
            </>
          ),
        },
        {
          title: "When the Answers Do Not Add Up",
          content: (
            <>
              <p>
                The chart below is every person&rsquo;s row total under both
                routes. Softmax is a flat line at one. One-vs-rest is not a line
                at all.
              </p>
              <RowSumChart />
              <p>
                This distinction is carried in the library&rsquo;s types rather
                than left to a docstring, and the reason is worth stating. There
                are two return types available to a model that answers with a
                score per class. One promises a table of numbers between zero and
                one. The other promises that and, in addition, that every row
                totals one. Softmax returns the stronger type. One-vs-rest is
                unable to, so it returns the weaker one, and a caller who needs
                genuine probabilities finds out when the types disagree rather
                than when a downstream sum comes out wrong.
              </p>
              <p>
                That mattered in practice. The one-vs-rest specification asserted
                in its prose that its rows deliberately do not sum to one, and
                went on returning the type that promises they do. The prose was
                right and unenforced, which is the state a type is meant to
                replace.
              </p>
              <p>
                For choosing between the routes, the practical guidance follows
                from the mechanism rather than from accuracy. Softmax when you
                need a probability, because a number that will be multiplied by a
                cost, thresholded, or reported to somebody has to mean what it
                says. One-vs-rest when a thing can belong to more than one class
                at once, since three independent yes-or-no questions handle that
                natively and a softmax cannot represent it at all. And
                one-vs-rest when the classes are many and you would rather fit
                many small models than one wide one.
              </p>
            </>
          ),
        },
        {
          title: "How to Derive",
          content: (
            <>
              <p>
                Two things on this page deserve deriving, and the second explains
                the odd third.
              </p>
              <p>
                First, softmax is the two-class sigmoid wearing more indices.
                Write out the two-class softmax and divide through by the top of
                the first term.
              </p>
              <Equation>{"e^(z_0) / (e^(z_0) + e^(z_1))\n    =  1 / (1 + e^(z_1 − z_0))\n    =  sigmoid(z_0 − z_1)"}</Equation>
              <p>
                So with two classes, softmax is exactly the logistic
                page&rsquo;s squash applied to the difference between the two
                scores. Only the difference matters, which is also why adding the
                same constant to every class&rsquo;s score changes nothing, and
                why one class&rsquo;s weights can be pinned at zero without
                losing anything at all.
              </p>
              <p>
                Second, the third. The teenager fit has no useful slope, so its
                only remaining parameter is the intercept, and it will choose the
                intercept that makes the data most likely. One person is a yes
                and two are nos, and with a flat model every person gets the same
                probability p, so the likelihood is p for the yes and one minus p
                for each no.
              </p>
              <Equation>{"likelihood   L(p) = p (1 − p)²\nlog          log p + 2 log(1 − p)\nslope        1/p − 2/(1 − p) = 0\n             1 − p = 2p        so   p = 1/3"}</Equation>
              <p>
                A third is the answer, and the intercept that produces it is
                whatever the sigmoid needs to land there, which is the log of a
                third over two thirds, or the log of a half. Both figures are in
                the readout above and both are pinned by a test. It is a small
                derivation with a useful moral: a fit that cannot use its features
                does not fail loudly, it quietly reports the base rate, and a
                score of exactly one third among three classes is worth
                recognising as that rather than mistaking for a finding.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
