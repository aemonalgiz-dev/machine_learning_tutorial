import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { NormalisationPlayground } from "@/components/widgets/NormalisationPlayground";

export const metadata: Metadata = {
  title: "Normalisation Layers · oop_ml",
  description:
    "Standardise inside a model on every pass rather than once before it, and see that the whole difference between batch, layer and RMS normalisation is which way the mean runs.",
};

export default function NormalisationLayersPage() {
  return (
    <ConceptPage
      title="Normalisation Layers"
      tagline="The standardising move from feature scaling, made inside a model on every pass, and three layers that differ only in which way the mean runs."
      prerequisites={
        <>
          The move itself is the first row of the{" "}
          <Link
            href="/concepts/feature-scaling"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            feature scaling page
          </Link>
          , subtract a mean and divide by a deviation, and the mean and the
          deviation are the{" "}
          <Link
            href="/primers/statistics"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            statistics primer
          </Link>
          &rsquo;s. It helps to picture a network as a stack of layers, each
          reading the block of numbers the one beneath it answered with, though
          nothing here needs the arithmetic of a layer.
        </>
      }
      history={
        <>
          <p>
            By 2015 the networks being trained at Google were dozens of layers
            deep, and they were slow to train for a reason Sergey Ioffe and
            Christian Szegedy put a name to. Every layer learns against the
            distribution of numbers the layer beneath hands it, and that layer
            is changing at the same time, so each one is chasing a target that
            moves on every step. They called it internal covariate shift, and
            their fix was to standardise each feature across the mini-batch
            inside the network, then hand the layer back a learned scale and
            shift so that nothing it could express was lost. The same
            classifier reached its previous accuracy in a fourteenth of the
            training steps. Whether the diagnosis was right is still argued.
            In 2018 Shibani Santurkar, Dimitris Tsipras, Andrew Ilyas and
            Aleksander Madry made the case that the benefit was a smoother
            loss surface rather than any steadier distribution, though the
            argument is about why the layer works and not about whether.
          </p>
          <p>
            The trouble with reading a statistic across the batch showed up the
            moment the batch stopped being a natural unit. Jimmy Lei Ba, Jamie
            Ryan Kiros and Geoffrey Hinton were training recurrent networks in
            2016, where the batch statistic differs at every step of a sequence
            and a model is routinely run on a single example, and their answer
            was to read the mean and the deviation along the row instead, from
            the numbers one example already holds. Biao Zhang and Rico
            Sennrich then asked in 2019 which half of that move was doing the
            work, and found it was the dividing rather than the subtracting.
            Their RMS normalisation keeps only the scale, and most of the large
            language models built since use it.
          </p>
        </>
      }
      playground={<NormalisationPlayground />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                The grid above is a batch, four rows of three features, the
                kind of block that flows between two layers of a network. The
                feature scaling page took a column like these and put it on a
                fixed footing once, before any model saw it. A normalisation
                layer makes the same move inside the model, on whatever block
                is passing through at that moment, and hands the result on to
                the next layer. The band shows what the move is being applied
                to. Under the batch layer it runs down each column, and the
                margin at the foot of the column prints the mean and deviation
                read from those four numbers, 8 and 3.0000017 for the first.
              </p>
              <p>
                Click the layer button and the bands turn sideways. Now each
                row is standardised by its own three numbers, and the margin at
                its right end prints a mean and a deviation that belong to that
                row alone. Click RMS and the bands stay sideways but the mean
                leaves the margin, because this layer divides without
                subtracting anything first. Three layers, one grid, and the
                only thing that changed is which numbers were averaged
                together.
              </p>
              <p>
                Click any cell and change it. Under the batch layer the whole
                column answers differently, because the mean it was
                standardised by has moved. Under the row layers only that row
                moves, and every other row&rsquo;s answer stays exactly where it
                was. That difference is not a detail of these three layers, it
                is the entire reason there are three.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                Every normalisation layer computes one line per number, and
                then a second line that undoes as much of the first as the
                network turns out to want.
              </p>
              <Equation>{"normalised = (value − mean) / √(variance + ε)\nanswer = scale · normalised + shift"}</Equation>
              <p>
                The mean and the variance are read off the block in front of
                the layer, in the direction the band shows, and ε is a small
                constant, 0.00001 in the library, added inside the root so that
                a band whose numbers are all the same normalises to zeros
                rather than dividing by zero. It is why the margins print
                3.0000017 rather than 3. The scale and the shift are learned,
                one pair per feature, and they begin at one and zero, so a
                fresh layer standardises and does nothing more.
              </p>
              <p>
                Why learn them at all, when the point was to standardise. They
                give back what standardising took away. A layer that could only
                answer with mean zero and spread one would be forbidden from
                ever passing on an off-centre signal, and the next layer
                sometimes needs exactly that. With a scale and a shift the
                layer can set the scale to the deviation and the shift to the
                mean and undo its own normalisation exactly, so nothing it
                could represent before is lost. What changed is how the
                numbers are parameterised, not what they can be.
              </p>
              <p>
                For the batch layer there is one more piece. Its mean and
                variance run down the column across the batch, so a
                row&rsquo;s answer depends on which other rows travelled with
                it, and that is unusable at prediction time, when a request may
                hold one row or a thousand. So while training the layer also
                keeps a running mean and a running variance, moved a little
                toward each batch on every step, and while predicting it
                standardises by those instead.
              </p>
              <Equation>{"running = 0.9 · running + 0.1 · batch"}</Equation>
              <p>
                The toggle above swaps between the two answers, and the worked
                example says how far apart they sit after a single step.
              </p>
            </>
          ),
        },
        {
          title: "A Worked Example",
          content: (
            <>
              <p>
                Press the worked example button, four rows of two features,
                (1, 7), (1, 9), (7, 1) and (23, 7), chosen so that every
                statistic comes out whole. Take the second column under the
                batch layer. Its mean first.
              </p>
              <Equation>{"7 + 9 + 1 + 7 = 24,   24 / 4 = 6"}</Equation>
              <p>
                The deviations from 6 are 1, 3, −5 and 1, whose squares are 1,
                9, 25 and 1. The library divides their total by the number of
                rows rather than one fewer, and adds its epsilon before taking
                the root.
              </p>
              <Equation>{"1 + 9 + 25 + 1 = 36,   36 / 4 = 9,   √(9 + 0.00001) = 3.0000017"}</Equation>
              <p>
                The margin prints a mean of 6 and a deviation of 3.0000017. The
                first column runs the same way to a mean of 8 and a deviation
                of 9.0000006. Now the values, each one its distance from the
                mean over the deviation.
              </p>
              <Equation>{"(7 − 6) / 3.0000017 =  0.3333331\n(9 − 6) / 3.0000017 =  0.9999994\n(1 − 6) / 3.0000017 = −1.6666657"}</Equation>
              <p>
                The grid prints 0.3333, 1.0000, −1.6667 and 0.3333 under that
                column, and the 1.0000 is 0.9999994 rounded, the epsilon
                showing in the seventh place. Now press the layer button and
                read the first row, 1 and 7, across instead. Its mean is 4, its
                deviations are −3 and 3, the mean of their squares is 9 and the
                deviation is 3.0000017 again. Under RMS nothing is subtracted,
                the mean of the squares is (1 + 49) / 2 = 25 and its root is
                5.0000010.
              </p>
              <Equation>{"layer   (1 − 4) / 3.0000017 = −0.9999994,   (7 − 4) / 3.0000017 = 0.9999994\nrms      1 / 5.0000010     =  0.2000000,    7 / 5.0000010     = 1.3999997"}</Equation>
              <p>
                Last, the toggle. Go back to the batch layer and flip to
                predicting. The running figures began at a mean of 0 and a
                variance of 1 and, after one pass and one step, have moved a
                tenth of the way toward the batch, so the second column now
                standardises by a mean of 0.6 and a variance of 1.8, a
                deviation of 1.3416445.
              </p>
              <Equation>{"running mean     = 0.9 · 0 + 0.1 · 6 = 0.6\nrunning variance = 0.9 · 1 + 0.1 · 9 = 1.8,   √(1.8 + 0.00001) = 1.3416445\n(7 − 0.6) / 1.3416445 = 4.7702651"}</Equation>
              <p>
                The 7 that answered 0.3333 while training answers 4.7703 while
                predicting. Same layer, same row, different statistics, and
                only many more steps would bring the two answers together,
                which is why a batch layer is trained for a long time before
                anyone trusts its predictions.
              </p>
            </>
          ),
        },
        {
          title: "Which Way the Mean Runs",
          content: (
            <>
              <p>
                Batch normalisation reaches across rows. Every statistic it
                uses is a fact about the batch rather than about the row being
                answered, and everything awkward about the layer follows from
                that one choice. It needs a batch at all, so a single row on its
                own, whose variance is zero, cannot be answered honestly. It
                needs a training mode, because standardising by the batch at
                prediction time would make one row&rsquo;s answer depend on who
                else was in the request. And it therefore needs the running
                figures, a kind of state that is neither a setting chosen up
                front nor a weight learned by gradient, nudged toward each
                batch by a momentum and consulted only when predicting.
              </p>
              <Equation>{"batch   the answer at (row i, feature j) reads column j, every row\nlayer   the answer at (row i, feature j) reads row i, every feature\nrms     the answer at (row i, feature j) reads row i, and subtracts nothing"}</Equation>
              <p>
                Layer normalisation and RMS normalisation stay inside one row.
                The mean and the deviation are read along the row, from
                numbers the row already holds, so the answer is the same
                whether the row arrives alone or among a thousand others, and
                it is the same while training and while predicting because
                there is nothing that could differ. No running figures, no
                mode, no batch. Take rows away in the widget under those
                layers, down to the two it keeps, and the first row&rsquo;s
                answer does not move by a digit. That is why sequence models, which read rows of wildly
                different lengths and are routinely run on one example, use
                these and not the batch layer.
              </p>
              <p>
                RMS normalisation goes one step further and drops the
                centring. It divides the row by its root mean square as it
                stands, so the row&rsquo;s level survives and only its size is
                fixed. The finding behind it was empirical, the re-scaling was
                doing the work and the re-centring was not, and the reward is
                one reduction instead of two on the way forward and one route
                fewer for the gradient on the way back, which at the scale of
                a language model is worth having.
              </p>
            </>
          ),
        },
        {
          title: "How to Derive",
          content: (
            <>
              <p>
                Start with one feature under the batch layer, n rows holding
                values x₁ to xₙ. Standardising is the feature scaling
                page&rsquo;s map, and the same three lines show what it fixes,
                with one change for the epsilon.
              </p>
              <Equation>{"m = (1/n) Σᵢ xᵢ,   v = (1/n) Σᵢ (xᵢ − m)²\nzᵢ = (xᵢ − m) / √(v + ε)\nmean(z) = 0,   var(z) = v / (v + ε)"}</Equation>
              <p>
                The mean of z is zero because deviations from a mean always
                cancel, the statistics primer&rsquo;s balance point once more.
                The variance is v over v plus ε, which is one to within the
                epsilon rather than exactly one, 9 / 9.00001 on the worked
                column, and that small shortfall is the price of never dividing
                by zero.
              </p>
              <p>
                Now the scale and the shift. Write γ for the scale and β for
                the shift, and ask what the layer answers if it learns to set
                them to the very numbers it just standardised by.
              </p>
              <Equation>{"yᵢ = γ · zᵢ + β\nγ = √(v + ε),   β = m     ⇒     yᵢ = (xᵢ − m) + m = xᵢ"}</Equation>
              <p>
                Two learned numbers per feature can undo the normalisation
                completely, so the layer is not a constraint on what the
                network can express. It is a re-parameterisation. The weights
                beneath used to have to produce a signal at the right level and
                the right spread by themselves, and now they produce a
                standardised one while γ and β set the level and the spread,
                which is a gentler surface to descend, and that gentleness
                rather than the original diagnosis is what later work credits
                for the speed.
              </p>
              <p>
                The whole difference between the three layers is the index the
                sum runs over. Write the block as xᵢⱼ, row i and feature j,
                with n rows and d features.
              </p>
              <Equation>{"batch   mⱼ = (1/n) Σᵢ xᵢⱼ,   vⱼ = (1/n) Σᵢ (xᵢⱼ − mⱼ)²     over the rows, one figure per feature\nlayer   mᵢ = (1/d) Σⱼ xᵢⱼ,   vᵢ = (1/d) Σⱼ (xᵢⱼ − mᵢ)²     over the features, one figure per row\nrms     mᵢ = 0,               vᵢ = (1/d) Σⱼ xᵢⱼ²                the same sum, nothing subtracted"}</Equation>
              <p>
                The bands in the widget are a picture of those three sums.
                Everything else on this page, the training mode, the running
                figures, the zeros a lone row would come back as, is a
                consequence of whether i or j was the index that got summed
                away.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
