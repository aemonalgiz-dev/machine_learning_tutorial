import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { LeakageBarsPlayground } from "@/components/widgets/LeakageBarsPlayground";
import { PipelineDegreeChart } from "@/components/widgets/PipelineDegreeChart";

export const metadata: Metadata = {
  title: "Pipelines · oop_ml",
  description:
    "Scale the columns, then fit the model, is two steps that must happen in that order on every fold, and a pipeline is the object that makes the order a fact rather than a habit.",
};

export default function PipelinesPage() {
  return (
    <ConceptPage
      title="Pipelines"
      tagline="Preprocessing and a model as one object, so the fold cannot be got wrong and a preprocessing setting can be searched."
      prerequisites={
        <>
          The folds come from the{" "}
          <Link
            href="/concepts/held-out-evaluation"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            held-out evaluation page
          </Link>
          , the standardizer from the{" "}
          <Link
            href="/concepts/feature-scaling"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            feature scaling page
          </Link>{" "}
          and the search from the{" "}
          <Link
            href="/concepts/grid-search"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            grid search page
          </Link>
          . This page puts the three in one object and measures what it saves.
        </>
      }
      history={
        <>
          <p>
            In 2002 Christophe Ambroise and Geoffrey McLachlan went back over
            a run of published cancer classifiers built from microarray data,
            a few dozen tumour samples described by thousands of genes each.
            The papers had cross-validated their classifiers and reported
            error rates close to zero, and the two of them showed where the
            zero came from. The genes had been chosen for their association
            with the diagnosis using every sample, including the ones each
            fold was about to hold out, and only then had the folds been
            dealt. Choosing the genes inside each fold instead, on that
            fold&rsquo;s training samples alone, lifted the colon cancer
            error from almost nothing to roughly one sample in six. The
            classifiers had not learned the disease. They had been handed the
            answers by the step that picked their columns.
          </p>
          <p>
            The remedy is not a warning but an object. Lars Buitinck and the
            scikit-learn contributors set it down in 2013, describing the
            design their project had settled on since its first release in
            2010, a chain of transformers ending in a model that behaves, from
            the outside, as one model. Cross-validation and grid search then
            need no special case at all, because fitting the chain fits every
            transformer on the training rows as a matter of course. Their
            chain addresses a setting inside a step by a string, the step
            name and the field name joined by a double underscore. The
            library on this site keeps the object and drops the string, for a
            reason the last section gives.
          </p>
        </>
      }
      playground={<LeakageBarsPlayground />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                Every pair of bars above is the same model judged two ways.
                The model is the k-nearest neighbours page&rsquo;s regressor,
                five neighbours, scored by five-fold cross-validation, and the
                only thing that differs between amber and indigo is when one
                preprocessing step was fitted. Amber fitted it on every row
                first and dealt the folds afterwards, so each training fold
                had already been told something about the rows it was about
                to be scored on. Indigo refitted it inside each fold on that
                fold&rsquo;s training rows alone, which is what a pipeline
                does without being asked. The figure over the pair is amber
                less indigo, the amount the shortcut flattered the score,
                averaged over thirty seeds.
              </p>
              <p>
                The upper panel fits a standardizer, which reads each
                column&rsquo;s centre and spread and never looks at the
                target. Its gap is a few thousandths either way, and pressing
                the button for another thirty seeds is as likely to flip its
                sign as not. The lower panel fits something the library
                deliberately does not ship, a step that keeps whichever of
                twenty noise columns correlates best with a target that is
                itself noise. There the gap is a bias. It comes out near a
                third of a unit of R², it flatters twenty-five or more of
                every thirty seeds, and no family of seeds has yet made it
                vanish.
              </p>
              <p>
                Hold both pictures together and the page&rsquo;s claim reads
                cleanly. The leak is real, its size depends entirely on
                whether the leaking step consulted the answers, and the
                pipeline is not a fix for one case but the object that makes
                the question stop being the caller&rsquo;s to remember.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                A pipeline holds an ordered list of named steps and a model,
                and it is itself a regressor, with the same fit and predict as
                any other on this site. Fit runs the steps in order, and each
                step is fitted on what the step before it produced rather than
                on the raw input, because that is what it will see at predict
                time. A scaler placed after a polynomial expansion has to
                learn the expanded columns&rsquo; centres, not the original
                ones. When the last step has run, the model is fitted on its
                output.
              </p>
              <Equation>{"fit      z = scaler fitted on training rows, applied to them\n         model fitted on (z, training targets)\npredict  z = the same fitted scaler, applied to the new rows\n         model.predict(z)"}</Equation>
              <p>
                Predict applies the steps the fit learned and learns nothing.
                That is the whole of the leak protection, and it is structural
                rather than remembered. There is no second call site that
                could fit a transformer on held-out rows, because the only
                place a transformer is ever fitted is inside fit.
              </p>
              <p>
                Inside cross-validation nothing special happens, which is the
                point. The library&rsquo;s fold loop calls fit on the training
                half and evaluate on the held-out half, five times, and since
                the pipeline is a regressor that loop needs no knowledge of
                what the pipeline contains. The standardizer is refitted on
                each fold&rsquo;s training rows because fit fits it, and for
                no other reason. The bars above compare that arrangement
                against the one where the caller reached for the standardizer
                by hand before folding, which is the mistake every fold loop
                written by hand eventually makes.
              </p>
            </>
          ),
        },
        {
          title: "A Worked Example",
          content: (
            <>
              <p>
                Press the button for the first thirty seeds and read the
                thirty-row column, seeds 0 to 29. Each seed draws thirty rows
                of three columns on three scales, rooms near five, age in
                years to sixty and distance in kilometres to twenty-five, with
                a price that is a plain line through them plus a little
                noise. The standardizer fitted on every row and then folded
                scores a mean held-out R² of 0.5836. Refitted inside each
                fold it scores 0.5912. The shortcut did not flatter the score
                at all here. It cost a little.
              </p>
              <Equation>{"standardizer, 30 rows   outside 0.5836   inside 0.5912   gap −0.0076\n                        12 of 30 seeds flattered"}</Equation>
              <p>
                Twelve of thirty is the number that matters. A step that
                leaked something worth having would flatter most seeds, and
                this one flatters fewer than half. At sixty rows the gap is
                −0.0009 with ten of thirty flattered, and at two hundred it is
                −0.0001 with fifteen of thirty, a coin toss shrinking toward
                nothing.
              </p>
              <p>
                Now the lower panel on the same seeds. Each seed draws twenty
                columns of noise beside a target of noise, so no column
                deserves any score above zero, and a k-nearest neighbours fit
                on any one of them should do worse than answering the mean.
                Both arrangements do exactly that. Choosing the column inside
                each fold scores −0.8867, and choosing it on every row first
                scores −0.5979, which looks less bad by a margin that survives
                every seed family this page has run.
              </p>
              <Equation>{"chosen column, 30 rows   outside −0.5979   inside −0.8867   gap +0.2888\n                         27 of 30 seeds flattered"}</Equation>
              <p>
                The gap shrinks with rows, +0.1556 at sixty and +0.0407 at
                two hundred, and never changes sign. Neither arrangement found
                anything, because there was nothing to find. What the shortcut
                bought was a column that had been chosen partly by the answers
                it was then judged against, and a third of a unit of R² for a
                model that is worthless is exactly the shape of the
                microarray result from the history above.
              </p>
            </>
          ),
        },
        {
          title: "The Configuration Is Never Fitted",
          content: (
            <>
              <p>
                One pipeline object was handed to every fold of every seed
                above, one hundred and fifty fits in the thirty-row column
                alone, and the sentence under the readouts says what became
                of it. It comes back fitted, to the last fold it saw. The
                steps and the model it was configured with come back
                unfitted. Fit deep-copies both before touching either, so the
                configuration is a description and the fitted parts are a
                separate result, and five folds get five independent fits
                with no learned state carried from one to the next.
              </p>
              <p>
                That separation is what lets a search vary a preprocessing
                setting at all. Degree is a field of the polynomial step, not
                of the ridge model behind it, so a grid over the model alone
                could never ask which degree to use. Wrapped in a pipeline the
                whole configuration is one model, and each candidate is a
                whole steps object, expand to this degree then standardize,
                built and validated by its own constructor when it was
                written. A misspelt field name in such a candidate is an error
                in the caller&rsquo;s own source, where a misspelt
                double-underscore string is a setting silently left at its
                default, which is the failure the grid search page measured
                for the model&rsquo;s own fields and the pipeline extends to
                the steps.
              </p>
              <PipelineDegreeChart />
              <p>
                On the thrown ball the search runs five candidates on the
                same seeded folds and keeps degree 2 at a mean held-out R² of
                0.9116, with degree 1 far below the chart at −1.2250, a spread
                of 2.1366 that says the setting genuinely mattered. On the
                straight line it keeps degree 5 at 0.9749 over degree 1 at
                0.9703, and the spread of 0.0047 says the five finished within
                noise of one another and the winner is a coin toss. The search
                reports both numbers, because a winner without its spread is a
                number that cannot be trusted.
              </p>
            </>
          ),
        },
        {
          title: "How to Derive",
          content: (
            <>
              <p>
                Why does a transformer fitted on every row leak at all, and why
                is the leak a coin toss for a standardizer and a bias for a
                chosen column. Take the standardizer first. With five folds
                each training fold holds four fifths of the rows, so a
                column&rsquo;s centre over every row is a weighted average of
                the centre the fold should have used and the centre of the
                rows it is about to be scored on.
              </p>
              <Equation>{"centre over all rows = (4/5)·centre of the training fold + (1/5)·centre of the held-out fold"}</Equation>
              <p>
                That is the leak, written down, and for this model it is
                weaker still. Nearest neighbours reads only distances, and a
                distance between two standardized rows subtracts the same
                centre from both, so the centre cancels entirely and only the
                spread survives.
              </p>
              <Equation>{"d(a, b)² = Σⱼ ((aⱼ − bⱼ) / sⱼ)²      the centre mⱼ appears in neither term"}</Equation>
              <p>
                What leaks is the ratio of each column&rsquo;s spread over all
                rows to its spread over the training fold, a number close to
                one that reweights the three columns by a fraction shrinking
                like one over the row count. Nothing about that ratio knows
                the price, so it cannot lean the fit toward the held-out
                answers any more than away from them. A leak that is blind to
                the target can change the score in either direction, which is
                why twelve of thirty seeds were flattered and eighteen were
                not, and why doubling the rows divided the gap by eight.
              </p>
              <p>
                The chosen column is different in kind. It is the one of
                twenty whose correlation with the target was largest, and
                when that correlation is computed over every row the
                held-out fold&rsquo;s targets took part in the vote. The
                column the model is then judged on was selected partly for
                agreeing with the answers it is judged against, and among
                twenty columns of noise the winning chance correlation on
                thirty rows is substantial. That is why the gap keeps its sign
                on every seed. It shrinks with rows because the largest of
                twenty chance correlations shrinks as the rows grow, and it
                never crosses zero because the vote always favours the column
                that flatters. A mean can leak only a little and in no
                particular direction. A step that consults the target leaks
                the target.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
