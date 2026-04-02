import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { GapCurveChart } from "@/components/widgets/GapCurveChart";
import { HoldOutPlayground } from "@/components/widgets/HoldOutPlayground";
import { ValidationCurveChart } from "@/components/widgets/ValidationCurveChart";

export const metadata: Metadata = {
  title: "Held-Out Evaluation · oop_ml",
  description:
    "Hide some of the data from the fit, then let the hidden share judge it, which is the only score on this site that cannot flatter.",
};

export default function HeldOutEvaluationPage() {
  return (
    <ConceptPage
      title="Held-Out Evaluation"
      tagline="Hide some data from the fit, then let the hidden share be the judge."
      prerequisites={
        <>
          This page settles a debt. Page after page here has ended by saying
          the honest judge is data the fit never saw, and here that sentence
          finally gets its machinery. The running example is the{" "}
          <Link
            href="/concepts/multiple-polynomial-regression"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            polynomial page
          </Link>
          &rsquo;s noisy throw and its degree dial, so read that page first.
        </>
      }
      history={
        <>
          <p>
            The problem announced itself as soon as fitted equations left the
            rooms they were fitted in. In the 1920s and 30s, psychologists
            and education researchers were building regression equations to
            predict things like college performance from entrance tests, and
            they kept observing the same embarrassment. An equation that
            scored impressively on the students it was fitted to predicted
            noticeably worse for the next cohort, every time, so reliably
            that the field gave the effect a name, shrinkage. The equation
            had partly learned its own students, and that part travelled
            nowhere.
          </p>
          <p>
            The remedy they reached for is the one this page teaches, judge
            the equation on people it has never met, and the refinement took
            its modern form in the mid 1970s, when Mervyn Stone and then
            Seymour Geisser, working independently, formalised
            cross-validation, the version where every row takes a turn at
            being the judge. It has since
            become the nearest thing machine learning has to a universal
            court. Whatever the model, whatever the dials, the verdict that
            counts is computed this way.
          </p>
        </>
      }
      playground={<HoldOutPlayground />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                Think of a student preparing for an exam from a booklet of
                practice questions. Score them on those same practice
                questions and you cannot tell two very different students
                apart, the one who understood the subject and the one who
                memorised the answer key, since both score perfectly. The
                only way to separate them is a question they have not seen.
                Everything on this page is that idea applied to fits.
              </p>
              <p>
                The box above holds the polynomial page&rsquo;s fifteen noisy
                measurements of the thrown ball, with four of them, drawn by
                a seeded shuffle, hidden from the fit and ringed in amber.
                The curve is fitted to the eleven indigo points alone, and
                then both groups score it. Walk the degree upward and watch
                the two readouts. Around degree 2 they agree, since a
                parabola is what a thrown ball actually does. Past degree 6
                they part company, the training score creeping upward while
                the held-out score falls off a cliff, and by degree 9 the fit
                threads its eleven training points beautifully while missing
                the four hidden ones by street widths.
              </p>
              <p>
                That divergence is the whole lesson. The training score
                measures how well the curve fits where it was told to fit,
                and the held-out score measures whether it learned anything
                that travels. Only the second is about the future.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                The recipe is almost embarrassingly small. Shuffle the rows
                once, with a seed so the deal can be repeated. Cut them into
                two shares, eleven for training and four held out here. Fit
                on the training share only, so the held-out rows touch
                nothing, not the coefficients, and just as importantly not
                the manufactured columns either, since the polynomial terms
                are rebuilt from the training share alone. Then score the
                one fitted curve twice.
              </p>
              <Equation>{"degree 2   R² on the training share  0.995\n           R² on the held-out share  0.989"}</Equation>
              <p>
                At an honest degree the two verdicts nearly agree, and their
                small gap is the honest price of fitting to one sample of a
                noisy world. Now the same recipe at the far end of the dial.
              </p>
              <Equation>{"degree 9   R² on the training share  0.999\n           R² on the held-out share  about −5480"}</Equation>
              <p>
                A held-out R² below zero means the fit predicts the hidden
                people worse than the regression page&rsquo;s flat baseline,
                the average answered for everyone, and this one is not
                mildly below. Nothing about the
                fit changed between those two lines except what we asked of
                it. The training share answers how well it bent, the held-out
                share answers what it learned, and a difference this size is
                the word memorisation written in numbers.
              </p>
            </>
          ),
        },
        {
          title: "Reading the Gap",
          content: (
            <>
              <p>
                Running that comparison at every degree at once produces the
                most important chart on this site. The training curve can
                only climb or hold still, for a reason the derivation below
                makes exact,
                while the held-out curve rises, levels, turns, and finally
                collapses, and the degree where it turns is where honest
                capacity ends for this data.
              </p>
              <GapCurveChart />
              <p>
                Every earlier page&rsquo;s warning is one region of this
                picture. The polynomial page&rsquo;s wiggling curve lives on
                the right where the amber line has collapsed. Ridge and
                lasso&rsquo;s penalty dial, the tree&rsquo;s depth cap,
                boosting&rsquo;s rounds and learning rate, the number of
                neighbours in a vote, all of them are ways of moving a model
                left along this curve, and every one of those dials should
                be set by the amber line, never the indigo one.
              </p>
            </>
          ),
        },
        {
          title: "Every Row Takes a Turn",
          content: (
            <>
              <p>
                A single split has a weakness the mechanism section quietly
                accepted, the verdict depends on which four rows the shuffle
                happened to hide. Deal again and the numbers move. The repair
                is to let no row be special. Cut the data into five folds,
                and five times over, hold one fold out, fit on the other
                four, and score on the hidden one. Every row is judged
                exactly once by a fit that never saw it, and the five
                verdicts are averaged.
              </p>
              <p>
                This is cross-validation, run below by the library at every
                degree, refitting the whole pipeline inside every fold. Two
                numbers come back per degree, the mean of the five scores
                and their spread, and the spread is the one readers skip at
                their peril, since it prices how much the mean deserves to
                be believed.
              </p>
              <ValidationCurveChart />
              <Equation>{"degree 2   mean R²  0.989    spread  0.03\ndegree 8   mean R²  −1.44    spread  11.3"}</Equation>
              <p>
                At degree 2 the five folds nearly agree, so the mean stands
                on firm ground. At degree 8 the folds disagree by eleven
                whole units of R², which means the mean above that band is
                an average of verdicts that have nothing in common, and the
                only honest reading is that the model has become a gamble on
                which rows it gets. One more debt closes here, the bagging
                page&rsquo;s out-of-bag score is this same idea collected
                free of charge, every person judged only by the committee
                members whose resample happened to miss them.
              </p>
            </>
          ),
        },
        {
          title: "How to Derive",
          content: (
            <>
              <p>
                One claim on this page deserves a proof, that the training
                score can never fall as the degree climbs, and the argument
                needs no calculus at all. Every curve of degree d is also a
                curve of degree d + 1, namely the one whose top coefficient
                is zero. So the collection of curves the degree d + 1 fit
                may choose from contains the entire collection the degree d
                fit chose from.
              </p>
              <Equation>{"best RSS at degree d + 1  ≤  best RSS at degree d\nso   R² at degree d + 1  ≥  R² at degree d"}</Equation>
              <p>
                Least squares picks the best curve in its collection, and a
                larger collection cannot have a worse best. The winner either
                keeps the old champion, coefficient of zero and all, or finds
                something strictly better, and either way the residual sum
                cannot rise, so the training R² cannot fall.
              </p>
              <p>
                Now read what the argument does not say. Nothing in it
                mentions the hidden rows. The guarantee binds only the data
                the fit is optimised on, which is exactly why the training
                curve climbs by mathematical necessity while the held-out
                curve stays free to turn around and testify. A score that is
                guaranteed never to fall as the model grows more capable is
                structurally incapable of saying when to stop, and that
                sentence is the reason this page exists.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
