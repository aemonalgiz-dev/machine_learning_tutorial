import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { Equation } from "@/components/concept/PrimerPage";
import { HebbianPlayground } from "@/components/widgets/HebbianPlayground";

export const metadata: Metadata = {
  title: "Hebbian Principal Components · oop_ml",
  description:
    "Reach the principal components without a matrix or a solver, by a single unit that reads one person at a time and obeys fire together, wire together, with one correction to keep its weights from growing without bound.",
};

export default function HebbianPcaPage() {
  return (
    <ConceptPage
      title="Hebbian Principal Components"
      tagline="A unit obeying a local rule, one row at a time, turns toward the very direction an eigensolver finds."
      prerequisites={
        <>
          The answer being reached is the{" "}
          <Link
            href="/concepts/pca"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            PCA page
          </Link>
          &rsquo;s, and its four people are worked again here. The unit fires
          by the{" "}
          <Link
            href="/primers/linear-algebra"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            linear algebra primer
          </Link>
          &rsquo;s dot product and rests on that primer&rsquo;s eigenvector,
          and the rule that moves it is local in the sense the{" "}
          <Link
            href="/concepts/hopfield-network"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            Hopfield page
          </Link>{" "}
          gave the word, each weight reading only the two ends it joins.
          Nothing here descends a loss.
        </>
      }
      history={
        <>
          <p>
            Donald Hebb&rsquo;s proposal of 1949, that a connection between two
            neurons should strengthen whenever the two fire together, was the
            rule the Hopfield page stored its patterns with, and it has a flaw
            that shows the moment it is used to learn rather than to store.
            Strengthening only ever strengthens. A weight that grows makes the
            neuron fire harder, which grows the weight further, and nothing in
            the rule pushes back, so the weights of a Hebbian neuron run away
            to infinity on any data at all. Biologists could suppose that real
            synapses saturate. Anyone wanting the rule to compute something
            needed a version that stayed bounded, and needed to know what the
            bounded version computed.
          </p>
          <p>
            Erkki Oja, who had done his doctorate under Teuvo Kohonen in
            Helsinki, answered both questions in 1982. He asked what the
            smallest change to Hebb&rsquo;s rule would be that held the weight
            vector at unit length, found that it was a single subtracted term,
            and then showed what a neuron obeying the corrected rule learns,
            which is the first principal component of its inputs, the very
            direction Karl Pearson and Harold Hotelling had reached through
            the covariance matrix. Terence Sanger at MIT extended it in 1989
            to a row of such neurons, each handed only what the ones before it
            had left unexplained, so that they learn every component in order
            of variance, and used the arrangement to code images. The method
            is called the generalised Hebbian algorithm, and it is why a
            biological rule sits beside an eigensolver in the library.
          </p>
        </>
      }
      playground={<HebbianPlayground />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (
            <>
              <p>
                Every direction the PCA page drew came out of a matrix. The
                library built the covariance matrix from the whole cloud at
                once and asked an eigensolver for the directions it only
                stretches, a global calculation in which every person is
                consulted before any answer appears. The box above shows
                those directions again, as the faint lines. The bold lines
                were found another way entirely. A single unit holds a weight
                vector, reads one person at a time, and after each nudges its
                weights by an amount that depends on nothing but that person
                and the weights it already holds. No matrix, no solver, and
                no two people ever looked at together.
              </p>
              <p>
                Drag the epochs slider to the left and the bold line swings
                away from the faint one, back toward where a random start
                left it after a single pass. Drag it right and the bold line
                swings into the faint one until the two cannot be told apart
                and the angle readout reads zero. That is the whole claim of
                the page. A unit obeying a local rule turns toward the very
                direction the eigensolver computed, and the thinner amber
                pair shows a second unit finding the direction perpendicular
                to it.
              </p>
              <p>
                Two honest cautions. Every position of the slider is a fresh
                fit from the same seed rather than a frame of one fit,
                because the rate the rule uses falls across whatever budget
                it is given, so a walk of ten epochs is not the first ten
                epochs of a walk of two hundred. And the second direction
                learns more slowly than the first, at a pace set by how much
                of the spread it carries. On the four people it carries a
                fifth and settles. Press the crowd button and it carries one
                percent, and two hundred epochs leave the thin bold line
                eight degrees off its twin with its weight vector nowhere
                near the length of one, which the length and orthogonality
                readouts report rather than hide.
              </p>
            </>
          ),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>
                Centre the cloud first, subtracting the mean so that every
                person becomes a deviation, the same first move the PCA page
                made. Now give one unit a weight vector w and show it a
                deviation x. The unit fires by the linear algebra
                primer&rsquo;s dot product, and its output is one number.
              </p>
              <Equation>{"y = w · x"}</Equation>
              <p>
                Hebb&rsquo;s rule, cells that fire together wire together,
                says to strengthen each weight in proportion to how strongly
                its input and the output fired at the same moment, so w moves
                by the rate times y times x. The trouble is that this only
                ever lengthens w, since the update always has a positive part
                along w itself. Oja&rsquo;s correction subtracts what the unit
                has already accounted for, the output times the current
                weights, and that one subtraction holds the length near one
                without any normalising step.
              </p>
              <Equation>{"w ← w + rate · y · (x − y · w)"}</Equation>
              <p>
                Present every person in a shuffled order, lower the rate a
                little, and repeat. Where the weights come to rest is the
                first principal component, and the derivation below says why.
                A second unit is handed only what the first left unexplained,
                the deviation with the first unit&rsquo;s reconstruction of it
                removed, which is Sanger&rsquo;s extension and what makes the
                second direction perpendicular to the first.
              </p>
              <Equation>{"w₂ ← w₂ + rate · y₂ · (x − y₁ · w₁ − y₂ · w₂)"}</Equation>
              <p>
                The rate is the one number that needs care. The update carries
                the square of the data&rsquo;s units, so a rate that behaves
                on data of spread one overflows on centimetres, and the
                library refuses a diverged walk by name rather than answering
                with nonsense. The endpoint sets the rate from the cloud, a
                half divided by the square of the longest deviation, falling a
                hundredfold across the walk, which is a single common factor
                and leaves every direction and every share exactly where they
                were.
              </p>
            </>
          ),
        },
        {
          title: "A Worked Example",
          content: (
            <>
              <p>
                Press the measured four button, the PCA page&rsquo;s four
                people with mean (170, 68), and take the first of them, whose
                deviation is x = (10, 10). That is also the longest deviation
                among the four, of squared length 200, so the rule starts at
                a rate of 0.5 / 200 = 0.0025, which the readout confirms.
                Start the weights at w = (1, 0) for the arithmetic&rsquo;s
                sake, pointing along height alone, and take one step.
              </p>
              <Equation>{"y = w · x = 1·10 + 0·10 = 10\nx − y·w = (10, 10) − 10·(1, 0) = (0, 10)\nw ← (1, 0) + 0.0025 · 10 · (0, 10) = (1, 0.25)"}</Equation>
              <p>
                The bracket removed the part of the person the unit already
                explained, the ten along height, and left only the ten along
                weight, so the whole of the step is a turn toward the
                diagonal. Plain Hebb would have added 0.0025 · 10 · (10, 10)
                = (0.25, 0.25) instead, landing at (1.25, 0.25), longer and
                barely turned. Repeat over four people and as many epochs as
                the slider allows, and the library&rsquo;s answer is pinned by
                the API.
              </p>
              <Equation>{"after one epoch        23.1° from the diagonal (1, 1)\nafter twenty            1.0°\nafter two hundred       under 0.000002°, shares 0.800 and 0.200"}</Equation>
              <p>
                At the default two hundred epochs the first bold line lies
                within two millionths of a degree of the diagonal (1, 1)
                scaled to unit length, the eigen direction the PCA page worked
                by hand, and the second within a hundredth of a degree of
                (1, −1). The shares match the PCA page&rsquo;s 0.8 and 0.2 to
                six decimals, and the walk stopped itself at epoch 91 of the
                200 it was allowed, because no weight moved by more than a
                millionth in a whole pass. Nothing was solved. Four people
                were shown to a unit, one at a time, ninety-one times over.
              </p>
            </>
          ),
        },
        {
          title: "Why the Weights Do Not Blow Up",
          content: (
            <>
              <p>
                Take Hebb&rsquo;s rule as written and ask what happens to the
                length of w. The update rate · y · x has a part along w of
                rate · y · (x · w), which is rate · y², a square and so never
                negative. Every person lengthens the vector and nothing ever
                shortens it, and a longer vector fires more strongly, which
                makes the next update larger still. The library measured this
                on one of its own fixtures at a fixed rate, and the length
                does not creep, it runs away by orders of magnitude within a
                couple of dozen epochs. It is not converging to a direction.
                It is exploding along one.
              </p>
              <Equation>{"plain Hebb   w ← w + rate · y · x            part along w is  rate · y²  ≥ 0"}</Equation>
              <p>
                Oja&rsquo;s subtraction changes exactly that part and nothing
                else. Subtracting rate · y² · w leaves the part along w as
                rate · y² · (1 − |w|²), positive while the vector is shorter
                than one, negative while it is longer, and zero at length one
                exactly. A vector that has grown is pulled back harder than
                one that has not, so the length settles at one on its own.
                Nothing divides by the norm, and the library deliberately
                never does, because the length is the evidence that the rule
                works. On the four people the readout shows 1.04 after a
                single epoch, four percent long from the first pass&rsquo;s
                kicks, and 1.0000 after two hundred.
              </p>
              <Equation>{"Oja          w ← w + rate · y · (x − y · w)   part along w is  rate · y² · (1 − |w|²)"}</Equation>
              <p>
                The second unit needs one more idea. Run Oja&rsquo;s rule on
                two units independently and both find the same direction,
                because both are solving the same problem. Sanger&rsquo;s
                extension hands the second unit the deviation with the first
                unit&rsquo;s reconstruction of it removed, x − y₁ · w₁, so the
                second unit can only lean on what the first left unexplained.
                The part of it along the first direction is driven to zero,
                which is what perpendicular means, and the second unit&rsquo;s
                own subtraction keeps its length at one. The worst
                orthogonality readout is the largest dot product between the
                two learned directions, exactly zero for an eigensolver and
                about 0.00004 here after two hundred epochs, which is the
                honest size of what a finite walk leaves.
              </p>
              <p>
                The cost is that the second unit learns at a pace set by the
                variance it chases. On the crowd, where the second direction
                holds one percent of the spread, the walk runs its full two
                hundred epochs and still leaves that direction eight degrees
                off its twin, at length 0.43 with a worst orthogonality of
                0.14, and the readouts say so rather than pretending
                otherwise. An eigensolver hands over every direction at once.
                The local rule pays for each in proportion to how little there
                is to find.
              </p>
            </>
          ),
        },
        {
          title: "How to Derive",
          content: (
            <>
              <p>
                Start from Hebb&rsquo;s rule and ask for the smallest change
                that keeps w at unit length. The blunt fix is to take the
                Hebbian step and then divide by the new length, and for a
                small rate the new length is close to one, so expanding the
                division to first order in the rate is the calculus
                primer&rsquo;s move of keeping the slope and dropping the
                curve.
              </p>
              <Equation>{"w' = (w + rate · y · x) / |w + rate · y · x|\n   ≈ w + rate · y · (x − y · w)        to first order in the rate"}</Equation>
              <p>
                That is Oja&rsquo;s rule, which is why it reads as Hebb&rsquo;s
                rule with a correction rather than as a new idea. The
                subtracted term is the piece that normalising would have
                removed, applied before the length has a chance to drift. Now
                ask where such a unit comes to rest. Over many people the
                update averages, and the averages are quantities the PCA page
                built. The average of y · x is the average of (w · x) · x,
                which is the covariance matrix C applied to w, and the average
                of y² is the variance along w, the PCA page&rsquo;s wᵀCw.
              </p>
              <Equation>{"average update  =  rate · (C w − (wᵀ C w) · w)"}</Equation>
              <p>
                The unit rests where the average update is zero, which says
                C w is a multiple of w, and a vector the matrix only stretches
                is the linear algebra primer&rsquo;s eigenvector, with the
                multiple wᵀCw its eigenvalue, the variance along w. Every
                eigenvector is a resting point, and only the one with the
                largest eigenvalue is a stable one, since a small lean from
                any other toward the largest direction is amplified rather
                than damped. So the unit does not merely rest on an
                eigenvector. It rests on the first principal component, the
                answer the PCA page reached by solving, reached here by a rule
                that never saw the matrix at all.
              </p>
              <Equation>{"C w = λ w,     λ = wᵀ C w"}</Equation>
            </>
          ),
        },
      ]}
    />
  );
}
