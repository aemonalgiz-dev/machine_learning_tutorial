import { lessonIntuitions } from "@/lib/intuition";
import { GuidedIntuition, IntuitionConnection } from "@/components/concept/GuidedIntuition";
import type { Metadata } from "next";
import {
  Equation,
  PrimerPage,
  PrimerPlayground,
  PrimerPractice,
  PrimerQuiz,
  PrimerSection,
} from "@/components/concept/PrimerPage";
import { choice, several, trueFalse } from "@/lib/quizzes";
import { exercise, numberCheck } from "@/lib/exercises";
import {
  InAModel,
  KeepInMind,
  NumberTable,
  WhyThisWorks,
  WorkedExample,
} from "@/components/concept/Treatments";
import { EigenPlayground } from "@/components/widgets/EigenPlayground";
import { SingleVectorPlayground } from "@/components/widgets/SingleVectorPlayground";
import { MatrixPlayground } from "@/components/widgets/MatrixPlayground";
import { VectorPlayground } from "@/components/widgets/VectorPlayground";

export const metadata: Metadata = {
  title: "Linear Algebra Primer · oop_ml",
  description:
    "A model often needs to work with many measurements at once. Vectors and matrices let us organise those numbers and repeat useful calculations without writing a separate rule for every example.",
};

export default function LinearAlgebraPrimerPage() {
  return (
    <PrimerPage
      lessonId="linear-algebra"
      technicalStart="12. Matrix-Vector Multiplication"
      title="Linear Algebra Primer"
      tagline={"A model often needs to work with many measurements at once. Vectors and matrices let us organise those numbers and repeat useful calculations without writing a separate rule for every example."}
      prerequisites={
        <>
          Arithmetic and a pair of coordinate axes. Everything else, including
          every piece of notation, is introduced here before it is used.
        </>
      }
    >
      <PrimerSection title="Several Measurements, One Calculation">
{lessonIntuitions["linear-algebra"].opening.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
<GuidedIntuition lesson={lessonIntuitions["linear-algebra"]} />
<IntuitionConnection lesson={lessonIntuitions["linear-algebra"]} />
</PrimerSection>

      <PrimerSection title="1. Several Numbers as One Object">

        <p>
          One observation usually contains several measurements. A person might
          be recorded as a height, a weight and an age, and those three numbers
          describe one example rather than three, so they should travel through a
          model together rather than separately.
        </p>
        <Equation>{"(170, 72, 35)"}</Equation>
        <p>
          That grouping is a vector. Three things are true of it and worth
          fixing now. Each position has a defined meaning, so the first entry is
          the height and stays the height. The order cannot be shuffled, because
          shuffling it would silently change what every entry means. And the
          number of entries is called the dimension, so this is a
          three-dimensional vector.
        </p>
        <p>
          It is tempting to define a vector as &ldquo;a list of numbers&rdquo;
          and stop, though a list is only how it is written down. The useful idea
          is that several related quantities have been packaged into one
          mathematical object, so that one symbol can stand for a whole
          observation and one operation can act on all of it at once.
        </p>
        <p>
          A two-entry vector also has a picture, drawn as a point or an arrow on
          a pair of axes. We stay in two dimensions throughout this primer for
          exactly that reason, and the geometry is worth having because every
          operation we see there keeps working in dimensions nobody can draw.
        </p>
      </PrimerSection>

      <PrimerSection title="2. Points and Movements">
        <p>
          The pair (3, 4) can be read two ways, and both are used constantly.
        </p>
        <p>
          Read as a location, it is a position in the plane, three across and
          four up from the origin. Read as a movement, it is a displacement,
          three across and four up from wherever you happen to be standing. The
          numbers are identical either way.
        </p>
        <KeepInMind>
          <p>
            These are not quite the same thing, and it is worth not saying that
            they are. A point is where something is. A vector is a direction and
            a distance, which is to say a movement, and it can be applied
            starting from anywhere.
          </p>
          <p>
            Coordinates let both be written with the same pair of numbers, which
            is convenient and occasionally confusing. It matters later, when
            transformations move the plane around. A transformation acts on
            movements, and treating a location as a movement is what makes a
            translation behave unlike everything else in section 14.
          </p>
        </KeepInMind>
        <p>
          Below is one arrow on its own. Drag the tip, and watch the two dashed
          walks change. The horizontal walk is the first entry and the vertical
          walk is the second, so moving the tip sideways changes one number and
          leaves the other alone.
        </p>
        <PrimerPlayground>
          <SingleVectorPlayground />
        </PrimerPlayground>
      </PrimerSection>

      <PrimerSection title="3. Adding and Scaling Vectors">
        <p>
          Two things can be done to vectors before anything is measured on them,
          and everything later is built out of the pair. They can be added, and
          they can be scaled.
        </p>
        <p>
          Adding two vectors means doing one movement and then the other, and in
          coordinates it is as simple as it sounds. Add the matching entries.
        </p>
        <Equation>{"(a₁, a₂) + (b₁, b₂) = (a₁ + b₁,  a₂ + b₂)"}</Equation>
        <WorkedExample>
          <p>
            Walk (3, 4), then walk (1, −2) from wherever that left you.
          </p>
          <Equation>{"(3, 4) + (1, −2) = (3 + 1,  4 − 2) = (4, 2)"}</Equation>
          <p>
            Geometrically, put the tail of the second arrow at the tip of the
            first, and the sum is the arrow from the original start to the final
            tip. Doing them in the other order lands in the same place, which is
            worth noticing, since it means addition does not care which movement
            you make first.
          </p>
        </WorkedExample>
        <p>
          Scaling means multiplying a vector by a single number, which stretches
          or shrinks it without changing the line it lies on.
        </p>
        <Equation>{"c·(a₁, a₂) = (c·a₁,  c·a₂)"}</Equation>
        <NumberTable
          headings={["multiplier", "(3, 4) becomes", "what happened"]}
          rows={[
            ["2", "(6, 8)", "twice as long, same direction"],
            ["0.5", "(1.5, 2)", "half as long, same direction"],
            ["1", "(3, 4)", "unchanged"],
            ["−1", "(−3, −4)", "same length, pointing the opposite way"],
            ["0", "(0, 0)", "collapsed to a point"],
          ]}
        />
        <p>
          These two operations are the whole of what makes the rest possible.
          Weighted combinations, matrix transformations, eigenvectors and the
          parameter update every model performs are all additions and scalings
          wearing different names.
        </p>
      </PrimerSection>

      <PrimerSection title="4. Vector Length">
        <p>
          Section 3 could stretch an arrow and could add two of them, and never
          once said how big an arrow is. A model needs that number constantly.
          How far a point sits from the origin, how big a parameter set is, and
          in the next section how far apart two examples are, are all the same
          measurement, and it is called the length.
        </p>
        <p>
          A vector&rsquo;s entries describe its movement along each axis
          separately. Its length is the direct distance from its start to its
          end, and that is a right triangle, so Pythagoras measures it. The
          triangle is right-angled because the horizontal walk and the vertical
          walk run along the two axes, which meet at a right angle, so the arrow
          itself is the hypotenuse.
        </p>
        <WorkedExample>
          <p>Take the arrow to (3, 4).</p>
          <Equation>{"horizontal component  3\nvertical component    4\n\nlength = √(3² + 4²) = √(9 + 16) = √25 = 5"}</Equation>
          <p>
            The box in section 2 is drawing exactly this triangle, and its length
            readout shows 5 on load.
          </p>
        </WorkedExample>
        <p>Written generally, with the bars meaning length,</p>
        <Equation>{"‖v‖ = √(v₁² + v₂²)"}</Equation>
        <p>
          Run the table from section 3 through it and the lengths behave the way
          the table said. Scaling by a number multiplies the length by the size
          of that number, and the sign is invisible to length, which is why the
          table could say same length, pointing the opposite way.
        </p>
        <NumberTable
          headings={["vector", "squares added", "length"]}
          rows={[
            ["(6, 8)", "36 + 64 = 100", "10, twice the 5"],
            ["(1.5, 2)", "2.25 + 4 = 6.25", "2.5, half of it"],
            ["(−3, −4)", "9 + 16 = 25", "5, unchanged by the sign"],
            ["(0, 0)", "0 + 0 = 0", "0, the only vector with no length"],
          ]}
        />
        <p>
          Three dimensions add another squared component under the root, and
          higher dimensions carry on the same way, one squared entry each. The
          picture stops being drawable long before the arithmetic stops working.
        </p>
        <WorkedExample>
          <p>Take the three-dimensional vector (2, 3, 6).</p>
          <Equation>{"‖(2, 3, 6)‖ = √(2² + 3² + 6²) = √(4 + 9 + 36) = √49 = 7"}</Equation>
          <p>
            Nothing new was needed. The third entry is one more squared term
            under the root, and the result is still a single number saying how
            far the arrow reaches.
          </p>
        </WorkedExample>
        <Equation>{"‖v‖ = √(v₁² + v₂² + … + vₙ²)"}</Equation>
      </PrimerSection>

      <PrimerSection title="5. Differences and Distance">
        <p>
          Before measuring the distance between two points, it is worth being
          explicit about subtraction, because distance is built directly on it.
        </p>
        <p>
          Take the points a = (1, 2) and b = (4, 6), and ask what movement
          carries a to b. Subtract the starting coordinates from the ending
          ones.
        </p>
        <WorkedExample>
          <Equation>{"b − a = (4 − 1,  6 − 2) = (3, 4)"}</Equation>
          <p>
            So the movement from a to b is three across and four up. Subtracting
            two positions produces the displacement between them, which is a
            vector even though both inputs were points.
          </p>
        </WorkedExample>
        <p>
          Distance is then one more step. Find the difference, and measure its
          length.
        </p>
        <Equation>{"distance(a, b) = ‖b − a‖"}</Equation>
        <WorkedExample>
          <Equation>{"‖(4, 6) − (1, 2)‖ = ‖(3, 4)‖ = 5"}</Equation>
          <p>
            The same 5 as the last section, because it is the same arrow, moved
            so that its tail sits at the origin.
          </p>
        </WorkedExample>
        <p>
          The box below has two arrows, a in indigo and b in amber. Drag either
          tip and watch the two lengths and the distance between the tips
          follow. The dot product readout is the subject of section 8.
        </p>
        <PrimerPlayground>
          <VectorPlayground />
        </PrimerPlayground>
      </PrimerSection>

      <PrimerQuiz
        title="Questions on Sections 1 to 5"
        questions={[
          trueFalse(
            "Shuffling the entries of a vector leaves it describing the same observation.",
            false,
            "Each position has a defined meaning, so the first entry of (170, 72, 35) is the height and stays the height. Shuffling it would silently change what every entry means, which is why the order is part of what the vector is rather than a convention about how to print it.",
          ),
          trueFalse(
            "The pair (3, 4) can be read as a location in the plane or as a movement three across and four up, and the numbers are identical either way.",
            true,
            "A point is where something is, and a vector is a direction and a distance, which can be applied starting from anywhere. Coordinates let both be written with the same pair, which is convenient and occasionally confusing, and it matters in section 14 where a transformation acts on movements.",
          ),
          choice(
            "What does scaling a vector by −1 do to it?",
            [
              "Leaves its length alone and points it the opposite way",
              "Halves its length and keeps its direction",
              "Collapses it to a point",
              "Reflects it across the horizontal axis",
            ],
            0,
            "The table in section 3 takes (3, 4) to (−3, −4), the same length pointing the opposite way. Scaling never moves a vector off the line it lies on, and only a multiplier of 0 collapses it to a point.",
          ),
          choice(
            "For a = (1, 2) and b = (4, 6), what is the distance between them?",
            ["5", "3", "4", "25"],
            0,
            "Subtracting the positions gives the movement from a to b, which is (3, 4), and the distance is that movement’s length. It is the same 5 as section 4’s arrow, because it is the same arrow moved so its tail sits at the origin. The 3 is only the horizontal part of the trip, and 25 is the sum of the squares before the root is taken.",
          ),
          several(
            "Which of these hold for a vector’s length?",
            [
              "It is measured by Pythagoras on the entries",
              "A third dimension adds one more squared entry under the root",
              "Subtracting one point from another gives something whose length is a distance",
              "It can be defined only where the vector can be drawn",
            ],
            [0, 1, 2],
            "A vector’s entries describe its movement along each axis separately, so its length is the direct distance across a right triangle, and higher dimensions carry on the same way with one squared entry each. The picture stops being drawable long before the arithmetic stops working.",
          ),
        ]}
      />

      <PrimerSection title="6. Distance in Machine Learning">
        <p>
          Two of the models ahead run almost entirely on the previous section. An
          example, once its measurements are collected into a vector, is a point
          in a space with one axis per feature, and examples that resemble each
          other land near each other in it.
        </p>
        <InAModel>
          <p>
            k-nearest neighbours answers a question about a new example by
            finding the stored examples closest to it, which is this distance
            computed once per stored row.
          </p>
          <p>
            k-means groups examples by repeatedly comparing each one against a
            set of candidate centres and keeping the nearest, which is the same
            distance again with the centres standing in for the stored rows.
          </p>
        </InAModel>
        <KeepInMind>
          <p>
            Distance takes the features at face value, and it should not be
            trusted to until they are comparable. A difference of 1 in a column
            of dollars and a difference of 1 in a column of years are both
            written as 1, and the formula adds their squares as though they meant
            the same amount of dissimilarity.
          </p>
          <p>
            They do not, and the consequence is that whichever column happens to
            carry the larger numbers dominates every distance in the dataset.
            Putting the columns on a common footing first is the fix, and it has
            a page of its own under data preparation.
          </p>
        </KeepInMind>
      </PrimerSection>

      <PrimerSection title="7. Weighted Sums">
        <p>
          Here is a calculation that appears inside almost every model, written
          out before it is given a name.
        </p>
        <p>
          A prediction is rarely made from one measurement, and when it is made
          from several there is no reason every one of them should count
          equally. What is missing is a way to let each feature count by its own
          amount. The fix is one number per feature, called its weight, saying
          how strongly that feature should count.
        </p>
        <p>
          Suppose a prediction uses two feature values and carries one weight for
          each.
        </p>
        <WorkedExample>
          <p>Features (3, 4), weights (4, 3).</p>
          <Equation>{"3 × 4  =  12      first feature times its weight\n4 × 3  =  12      second feature times its weight\n         ────\n           24      added together"}</Equation>
          <p>
            Each feature is multiplied by its own weight, and the results are
            added. A larger weight makes its feature count for more, a weight of
            zero removes the feature from the prediction entirely, and a negative
            weight makes the feature push the other way.
          </p>
        </WorkedExample>
        <p>
          The claims in that last sentence are easiest to believe by holding the
          features at (3, 4), keeping the first weight at 4, and changing only
          the second.
        </p>
        <NumberTable
          headings={["weights", "first term", "second term", "sum", "what the second weight did"]}
          rows={[
            ["(4, 3)", "12", "12", "24", "counted the second feature three times over"],
            ["(4, 1)", "12", "4", "16", "passed it through at its measured value"],
            ["(4, 0)", "12", "0", "12", "removed it from the prediction"],
            ["(4, −3)", "12", "−12", "0", "pushed the other way, and cancelled the first exactly"],
          ]}
        />
        <p>
          The features never changed. Everything the prediction did differently
          came from the weights, which is why the weights are what a model has
          to learn and the features are what it is given.
        </p>
        <p>
          That is the shape of a linear model&rsquo;s prediction, and with ten
          features it is ten multiplications and nine additions written out in a
          row. The next section is the notation that compresses it.
        </p>
      </PrimerSection>

      <PrimerSection title="8. The Dot Product">
        <p>
          The operation from the last section has a name. The dot product takes
          two vectors of the same length and produces a single number, by
          multiplying the entries position by position and adding.
        </p>
        <Equation>{"a · b = a₁b₁ + a₂b₂"}</Equation>
        <WorkedExample>
          <Equation>{"(3, 4) · (4, 3) = 3·4 + 4·3 = 12 + 12 = 24"}</Equation>
          <p>
            The same 24 as the weighted sum, because it is the same arithmetic,
            and the same 24 the a · b readout shows in the box above.
          </p>
        </WorkedExample>
        <p>For any number of entries, written with a summation sign,</p>
        <Equation>{"a · b = Σᵢ aᵢbᵢ"}</Equation>
        <p>
          The two vectors must have the same number of entries, and the reason is
          not a technicality. Every feature needs a weight of its own, so a
          feature with no matching weight would have nothing to multiply by and
          no way to contribute.
        </p>
        <InAModel>
          <p>
            A linear model&rsquo;s score for one example is one dot product plus
            an offset.
          </p>
          <Equation>{"score = x · w + b"}</Equation>
          <p>
            When a later page writes a whole model in a single line, this is that
            line.
          </p>
        </InAModel>
      </PrimerSection>

      <PrimerSection title="9. Direction, Magnitude, and Alignment">
        <p>
          The dot product also has a geometric reading, and it needs stating
          carefully, because the loose version of it is misleading.
        </p>
        <p>
          Hold both arrows at fixed lengths and swing one of them. The dot
          product is largest when they point the same way, falls as they open
          out, passes through exactly zero when they are perpendicular, and goes
          negative once they oppose each other. Try it in the box above by
          dragging b to (−4, 3), a quarter turn from a, and the readout shows 0.
        </p>
        <NumberTable
          headings={["arrangement", "dot product"]}
          rows={[
            ["pointing the same way", "positive, and largest"],
            ["at right angles", "exactly zero"],
            ["pointing opposite ways", "negative"],
          ]}
        />
        <p>
          Now change a length rather than an angle, and the value moves too. So
          the dot product is reporting two things at once, how aligned the arrows
          are and how long they are, and it does not separate them.
        </p>
        <Equation>{"a · b = ‖a‖ · ‖b‖ · cos θ"}</Equation>
        <KeepInMind>
          <p>
            A large positive dot product does not, on its own, mean strong
            alignment. Two long arrows that only roughly agree can beat two short
            arrows that agree perfectly.
          </p>
          <Equation>{"(10, 0) · (10, 10) = 100    lengths 10 and 14.14, cos θ = 0.71\n(2, 0)  · (2, 0)   =   4    lengths 2 and 2,      cos θ = 1.00"}</Equation>
          <p>
            The first pair scores twenty-five times higher while being less
            aligned. If alignment alone is what you want, divide the size back
            out, which gives the cosine and nothing else.
          </p>
          <Equation>{"cos θ = (a · b) / (‖a‖ · ‖b‖)"}</Equation>
          <p>
            That quantity is cosine similarity, and the distance metrics page
            takes it up properly.
          </p>
        </KeepInMind>
        <p>
          One consequence ties the sections together. Dot a vector with itself.
          It is perfectly aligned with itself, so the cosine is 1, and the recipe
          multiplies each entry by itself and adds, which is the squared-length
          calculation from section 4.
        </p>
        <Equation>{"v · v = v₁² + v₂² = ‖v‖²"}</Equation>
        <>
          <p>
            For the vector (3, 4), its dot product with itself gives the squared length.
          </p>
          <Equation>{"(3, 4) · (3, 4) = 3² + 4² = 9 + 16 = 25\nlength = √25 = 5"}</Equation>
          <p>
            The dot product therefore connects three ideas: length, distance and
            alignment.
          </p>
        </>
      </PrimerSection>

      <PrimerQuiz
        title="Questions on Sections 6 to 9"
        questions={[
          trueFalse(
            "Because distance adds the squares of the differences in every column, whichever column happens to carry the larger numbers dominates every distance in the dataset.",
            true,
            "A difference of 1 in a column of dollars and a difference of 1 in a column of years are both written as 1, and the formula adds their squares as though they meant the same amount of dissimilarity. They do not, so the column with the bigger numbers decides nearly every distance until the columns are put on a common footing, and since k-nearest neighbours and k-means both run on this distance, it decides those models too.",
          ),
          trueFalse(
            "A large positive dot product means two vectors are strongly aligned.",
            false,
            "The dot product reports alignment and length at once and does not separate them. Section 9’s long pair scores twenty-five times higher than its short pair while being the less aligned of the two, at a cosine of 0.71 against 1.00. Dividing the size back out leaves the cosine and nothing else.",
          ),
          choice(
            "Why must two vectors have the same number of entries to be dotted?",
            [
              "Every feature needs a weight of its own, so a feature with no matching weight has nothing to multiply by",
              "The sum would otherwise grow too large to compute",
              "Lengths can only be compared between vectors of the same dimension",
              "The result would come out as a vector rather than a number",
            ],
            0,
            "The reason is not a technicality. The recipe multiplies the entries position by position, so a feature with no weight opposite it would have no way to contribute to the score at all. A linear model’s score is x · w + b, one weight per feature and one offset, and the rule is what makes that line mean something.",
          ),
          several(
            "What can a weight do to its own feature inside a weighted sum?",
            [
              "Make it count for more",
              "Pass it through at exactly its measured value, when the weight is 1",
              "Remove it from the prediction entirely",
              "Make it push the other way",
            ],
            [0, 1, 2, 3],
            "Section 7’s table holds the features at (3, 4) and changes only the second weight. At 3 the second feature adds 12, at 1 it adds its own value of 4, at 0 it adds nothing and the sum drops to 12, and at −3 it subtracts 12 and cancels the first feature exactly. Every one of the four is something a weight can do, and the features never changed.",
          ),
          choice(
            "What does (3, 4) dotted with itself give?",
            [
              "25, the squared length",
              "5, the length",
              "7, the sum of the entries",
              "12, the product of the entries",
            ],
            0,
            "The recipe multiplies each entry by itself and adds, which is exactly the squared-length calculation from section 4, so the answer is 25 and the length is its root. The geometric reading agrees, since a vector is perfectly aligned with itself and its cosine is 1.",
          ),
        ]}
      />

      <PrimerSection title="10. Several Outputs at Once">
        <p>
          A dot product takes a vector and produces one number. A layer of a
          network, or any transformation of one representation into another,
          needs several numbers out rather than one.
        </p>
        <p>
          The fix is unglamorous. Give each output its own weight vector, and do
          one dot product per output. Suppose two outputs are wanted from two
          inputs.
        </p>
        <Equation>{"o₁ = 2x + 1y\no₂ = 1x + 2y"}</Equation>
        <p>
          Each line is a weighted sum with its own pair of weights, (2, 1) for
          the first and (1, 2) for the second. Collect those pairs as rows, and
          the collection is a matrix.
        </p>
        <Equation>{"A = ⎡ 2  1 ⎤\n    ⎣ 1  2 ⎦"}</Equation>
        <p>
          So a matrix is not a new idea so much as a container. It packages
          several related weighted sums so they can be written, and performed, as
          one operation.
        </p>
        <p>
          Rows rather than columns, because a row is what meets the input. Each
          row is read against the input vector exactly as section 8 read a
          weight vector against a feature vector, so writing the weights as rows
          keeps every one of the dot products visible on its own line.
        </p>
        <InAModel>
          <p>
            A layer of a network is this picture with the rows given a name.
            Each neuron in the layer holds its own weight vector and answers one
            number for the row it reads, so a layer of three neurons answers
            three. Stack the neurons&rsquo; weight vectors as rows and the
            result is the layer&rsquo;s matrix, which is the convention the next
            section writes down.
          </p>
        </InAModel>
      </PrimerSection>

      <PrimerSection title="11. Reading Matrix Shapes">
        <p>
          A matrix is a rectangle of numbers, described by how many rows and
          columns it has, in that order. The matrix above has two rows and two
          columns, so it is a 2 × 2.
        </p>
        <p>
          The shape says what it accepts and what it returns, and the rule falls
          straight out of the last section. Each row is one output&rsquo;s weight
          vector, so the number of rows is the number of outputs. Each row has
          one weight per input, so the number of columns is the number of inputs.
        </p>
        <NumberTable
          headings={["object", "shape", "meaning"]}
          rows={[
            ["input vector", "2", "two input values"],
            ["matrix", "2 × 2", "two outputs, each using two inputs"],
            ["output vector", "2", "two calculated results"],
          ]}
        />
        <p>
          That is the convention used throughout this site and on the neural
          network pages later, rows correspond to outputs and columns
          correspond to inputs. A 3 × 2 matrix would take a two-entry vector and return a
          three-entry one.
        </p>
        <WorkedExample>
          <p>
            Take a matrix with three rows, (1, 0), (0, 1) and (1, 1), each two
            entries long, and apply it to (3, 1).
          </p>
          <Equation>{"⎡ 1  0 ⎤              (1, 0) · (3, 1) = 3\n⎢ 0  1 ⎥ · (3, 1)      (0, 1) · (3, 1) = 1\n⎣ 1  1 ⎦              (1, 1) · (3, 1) = 4\n\nresult (3, 1, 4)"}</Equation>
          <p>
            Three rows, three outputs, and the input had to have exactly two
            entries because every row has exactly two weights to pair them with.
            A three-entry input would leave its third entry with no weight
            opposite it, which is section 8&rsquo;s rule again. So the shape
            says what goes in and what comes out before a single multiplication
            is done, and the two counts need not agree, which is how a layer can
            take a representation of one width and hand on one of another.
          </p>
        </WorkedExample>
      </PrimerSection>

      <PrimerSection title="12. Matrix-Vector Multiplication">
        <p>
          Applying a matrix to a vector is the two dot products of section 10,
          carried out and stacked.
        </p>
        <Equation>{"A = ⎡ 2  1 ⎤        A·(x, y) = (2x + 1y,  1x + 2y)\n    ⎣ 1  2 ⎦"}</Equation>
        <WorkedExample>
          <p>Apply A to the vector (3, 1).</p>
          <Equation>{"first row  (2, 1) · (3, 1) = 2·3 + 1·1 = 7\nsecond row (1, 2) · (3, 1) = 1·3 + 2·1 = 5\n\nA·(3, 1) = (7, 5)"}</Equation>
        </WorkedExample>
        <p>
          Each output came from one row, and each row&rsquo;s contribution was a
          dot product with the input. That is the whole operation, and it is why
          the number of columns has to match the number of entries going in.
        </p>
        <p>
          Written for any shape, the output&rsquo;s entry i is row i dotted with
          the input, and the sum runs along the row, one term per column.
        </p>
        <Equation>{"(A·v)ᵢ = Σⱼ Aᵢⱼ·vⱼ"}</Equation>
        <p>
          Two things fall out of that line. The output has one entry per row of
          A, so its dimension is the row count whatever the input&rsquo;s was.
          And a matrix with a single row is just a weight vector, so the dot
          product of section 8 is the one-output case of this operation rather
          than a different operation.
        </p>
        <InAModel>
          <p>
            A layer of a network does this to every example it is handed and
            then adds one offset per output, which is the plus b of section 8
            carried once per row of the matrix.
          </p>
          <Equation>{"outputs = A·x + b"}</Equation>
          <p>
            When a later page writes a whole layer in a single line, this is
            that line.
          </p>
        </InAModel>
      </PrimerSection>

      <PrimerSection title="13. Basis Vectors and Matrix Columns">
        <p>
          Two particular vectors are worth naming, because everything else is
          built from them. Call them the basis vectors.
        </p>
        <Equation>{"e₁ = (1, 0)      e₂ = (0, 1)"}</Equation>
        <p>
          One step east and one step north. They matter because every vector in
          the plane is a scaled copy of the first plus a scaled copy of the
          second, which is what its coordinates have been saying all along.
        </p>
        <Equation>{"(x, y) = x·e₁ + y·e₂"}</Equation>
        <p>Now send both of them through the matrix.</p>
        <WorkedExample>
          <Equation>{"A·e₁ = A·(1, 0) = (2, 1)\nA·e₂ = A·(0, 1) = (1, 2)"}</Equation>
          <p>
            Those two results are the columns of A, read top to bottom. That is
            not a coincidence, it is what the columns are.
          </p>
        </WorkedExample>
        <p>
          And because a matrix distributes over addition and scaling, the two
          operations from section 3, knowing where the basis vectors land is
          enough to know where anything lands.
        </p>
        <Equation>{"A·(x, y) = x·(A·e₁) + y·(A·e₂)"}</Equation>
        <WhyThisWorks>
          <p>
            Check it against the worked example above. A sends e₁ to (2, 1) and
            e₂ to (1, 2), so for the input (3, 1) the rule says
          </p>
          <Equation>{"3·(2, 1) + 1·(1, 2) = (6, 3) + (1, 2) = (7, 5)"}</Equation>
          <p>
            which is the same (7, 5) the row-by-row calculation produced. The two
            routes are the same arithmetic gathered differently, one grouping by
            output and the other by input.
          </p>
        </WhyThisWorks>
        <p>
          This is what justifies the claim that a matrix is completely described
          by its columns. Two arrows fix the whole transformation.
        </p>
      </PrimerSection>

      <PrimerQuiz
        title="Questions on Sections 10 to 13"
        questions={[
          choice(
            "In the convention this primer uses, what do a matrix’s rows and columns count?",
            [
              "Rows are outputs and columns are inputs",
              "Rows are inputs and columns are outputs",
              "The two counts are interchangeable, since a matrix can be read either way",
              "Both count inputs, so the matrix has to be square",
            ],
            0,
            "Each row is one output’s weight vector, so the number of rows is the number of outputs, and each row carries one weight per input, so the number of columns is the number of inputs. A 3 × 2 matrix therefore takes a two-entry vector and returns a three-entry one.",
          ),
          choice(
            "Apply the matrix with rows (2, 1) and (1, 2) to the vector (3, 1). What comes out?",
            ["(7, 5)", "(6, 3)", "(5, 3)", "(9, 3)"],
            0,
            "Each output comes from one row dotted with the input, the first row giving 7 and the second 5. The (6, 3) option is only the first half of the basis-vector route in section 13, three copies of where e₁ lands, before the second term has been added.",
          ),
          choice(
            "Where do the columns of a matrix come from?",
            [
              "They are where the basis vectors land",
              "They are the weight vector of each output",
              "They are the input values the matrix accepts",
              "They are the directions the matrix leaves unturned",
            ],
            0,
            "Sending e₁ and e₂ through the matrix gives (2, 1) and (1, 2), which are its columns read top to bottom, and that is what the columns are rather than a coincidence. The rows are the output weight vectors, which is the other of the two groupings.",
          ),
          trueFalse(
            "Knowing where the two basis vectors land is enough to know where every vector in the plane lands.",
            true,
            "Every vector is a scaled copy of e₁ plus a scaled copy of e₂, which is what its coordinates have been saying all along, and a matrix distributes over addition and scaling. So the image of (x, y) is x copies of where e₁ went plus y copies of where e₂ went, and two arrows fix the whole transformation.",
          ),
          several(
            "Which of these describe what a matrix is doing in sections 10 to 13?",
            [
              "Packaging several weighted sums so they can be performed as one operation",
              "Giving each output its own weight vector as a row",
              "Turning the whole input into a single number, as the dot product does",
              "Introducing an operation that addition and scaling cannot express",
            ],
            [0, 1],
            "A matrix is not a new idea so much as a container, one row per output, and that is why it exists at all. Section 10 wanted several numbers out rather than one, which is exactly what a dot product cannot give, so a matrix answers with a vector rather than collapsing the input to a number. The row-by-row route and the basis-vector route are the same arithmetic gathered differently, and both are built out of the two operations from section 3.",
          ),
        ]}
      />

      <PrimerSection title="14. Transforming the Plane">
        <p>
          Since the basis vectors fix everything, the natural picture is not one
          arrow moving but the entire plane being carried somewhere. The box
          below draws it. The faint grid is the plane before, the darker one is
          after, the two arrows are where the basis vectors land, and the shaded
          shape is what became of the unit square.
        </p>
        <PrimerPlayground>
          <MatrixPlayground />
        </PrimerPlayground>
        <p>
          The presets are worth walking one at a time, because the four families
          cover most of what a matrix can do. Scaling stretches along the axes.
          Reflection flips the plane across a line. Rotation turns everything
          about the origin by a fixed angle. Shearing slides one axis along
          while leaving the other where it was, which is what turns a square into
          a leaning parallelogram.
        </p>
        <KeepInMind>
          <p>
            Everything a matrix can do to the plane is a linear transformation,
            and that word carries three commitments. The origin does not move.
            Adding two vectors and then transforming gives the same answer as
            transforming both and then adding. Scaling then transforming matches
            transforming then scaling.
          </p>
          <p>
            One familiar operation is missing from that list, which is sliding
            the whole plane sideways. A translation moves the origin, so it is
            not linear and no matrix of this kind performs one. Models that need
            translations get them another way, usually by carrying a separate
            offset, which is exactly the plus b in section 8.
          </p>
        </KeepInMind>
      </PrimerSection>

      <PrimerSection title="15. Directions That Stay on Their Line">
        <p>
          Take one arrow, send it through A, and compare where it pointed with
          where its image points. Usually the two differ, because the matrix has
          both stretched the arrow and turned it.
        </p>
        <p>
          Which raises a question worth asking before any terminology arrives.
          Are there directions this matrix stretches without turning at all?
        </p>
        <WorkedExample>
          <p>Try the arrow (1, 1).</p>
          <Equation>{"A·(1, 1) = (2·1 + 1·1,  1·1 + 2·1) = (3, 3)"}</Equation>
          <p>
            And (3, 3) is 3·(1, 1). The length changed, from √2 to 3√2. The
            coordinates changed, from (1, 1) to (3, 3). The direction did not
            change at all, because the output is just the input scaled.
          </p>
        </WorkedExample>
        <p>
          A direction with that property has a name, and so does the number.
          The direction is an eigenvector of the matrix, and the factor it is
          scaled by, 3 here, is the matching eigenvalue.
        </p>
        <p>
          This matrix has a second one. Try (1, −1) and it comes back as (1, −1)
          exactly, an eigenvector with eigenvalue 1, a direction the matrix
          leaves completely alone.
        </p>
        <p>
          Drag the indigo arrow in the box below and watch the amber image swing
          away from it, then sweep onto one of the dashed lines and see the two
          fall into line.
        </p>
        <PrimerPlayground>
          <EigenPlayground />
        </PrimerPlayground>
      </PrimerSection>

      <PrimerSection title="16. Eigenvalues as Scaling Factors">
        <p>
          &ldquo;Stretch factor&rdquo; undersells the eigenvalue, because its
          size and its sign say different things and it can do more than stretch.
        </p>
        <NumberTable
          headings={["eigenvalue", "what happens to that direction"]}
          rows={[
            ["greater than 1", "stretched"],
            ["between 0 and 1", "shrunk, still pointing the same way"],
            ["exactly 1", "left completely unchanged"],
            ["exactly 0", "collapsed onto the origin"],
            ["negative", "reversed, and scaled by its size"],
          ]}
        />
        <p>
          Every row of that table can be seen in the box in section 14, where
          the two arrows show where the basis vectors land. The matrices below
          are chosen so that the basis vectors themselves are the preserved
          directions, which makes each case checkable by hand from section 13.
        </p>
        <WorkedExample>
          <p>
            Load the Stretch preset, whose four entries are 2, 0, 0 and 0.5.
          </p>
          <Equation>{"⎡ 2   0  ⎤ · (1, 0) = (2, 0)    = 2 · (1, 0)\n⎣ 0  0.5 ⎦ · (0, 1) = (0, 0.5)  = 0.5 · (0, 1)"}</Equation>
          <p>
            The horizontal direction is stretched by 2 and the vertical one is
            shrunk to half, still pointing up, so this one matrix shows the
            first two rows of the table and its eigenvalues are 2 and 0.5.
          </p>
          <p>
            Load the Shear preset, entries 1, 1, 0 and 1, and e₁ comes back as
            (1, 0). The horizontal axis is left exactly where it was, an
            eigenvalue of 1, which is what the worked matrix did to (1, −1).
            Now type the entries 1, 0, 0 and 0. That matrix sends e₂ to (0, 0),
            so the vertical direction is collapsed onto the origin, an
            eigenvalue of exactly 0, and since the basis images fix everything,
            the whole plane is flattened onto the horizontal axis. Finally type
            −1, 0, 0 and 1, which is a reflection across the vertical axis. It
            sends e₁ to (−1, 0), the same line with the arrow reversed, an
            eigenvalue of −1.
          </p>
        </WorkedExample>
        <p>
          The negative case is the one that needs the earlier phrasing tightened.
          An eigenvector is not quite a direction the matrix leaves pointing the
          same way, it is a direction whose <em>line</em> the matrix preserves. A
          negative eigenvalue flips the arrow end for end while leaving it on
          that same line, which still counts.
        </p>
        <p>
          Size and sign are read differently once the matrix comes from data
          rather than from a preset. On the PCA page every eigenvalue is an
          amount of variation along its direction, so there the size is what
          ranks the directions, which is where section 18 ends up.
        </p>
      </PrimerSection>

      <PrimerQuiz
        title="Questions on Sections 14 to 16"
        questions={[
          trueFalse(
            "Sliding the whole plane sideways is one of the things a matrix of this kind can do.",
            false,
            "A translation moves the origin, and a linear transformation leaves the origin where it is, so no matrix of this kind performs one. Models that need a translation carry a separate offset instead, which is exactly the plus b in section 8.",
          ),
          several(
            "Which of these are commitments the word linear carries here?",
            [
              "The origin does not move",
              "Adding two vectors then transforming matches transforming both then adding",
              "Scaling then transforming matches transforming then scaling",
              "Lengths are preserved",
            ],
            [0, 1, 2],
            "Those three are the whole of it. Length is not among them, since scaling stretches along the axes and shearing turns a square into a leaning parallelogram, and both remain linear.",
          ),
          choice(
            "The matrix sends (1, 1) to (3, 3). What changed and what did not?",
            [
              "The length and the coordinates changed, the direction did not",
              "The direction changed, the length did not",
              "Only the coordinates changed",
              "Nothing changed, since (3, 3) lies on the same line",
            ],
            0,
            "The length went from √2 to 3√2 and the coordinates from (1, 1) to (3, 3), while the direction stayed put because the output is just the input scaled. That factor of 3 is the eigenvalue belonging to this direction.",
          ),
          choice(
            "The same matrix sends (1, −1) back to (1, −1) exactly. What does that make (1, −1)?",
            [
              "An eigenvector with eigenvalue 1",
              "Not an eigenvector, since nothing happened to it",
              "An eigenvector with eigenvalue 0",
              "The same eigenvector as (1, 1)",
            ],
            0,
            "An eigenvector is a direction the matrix scales without turning off its line, and a factor of 1 counts, leaving that direction completely alone. An eigenvalue of 0 would instead collapse the direction onto the origin, and (1, 1) is a separate eigenvector of the same matrix with eigenvalue 3.",
          ),
          choice(
            "What is wrong with calling an eigenvector a direction the matrix leaves pointing the same way?",
            [
              "A negative eigenvalue flips the arrow end for end, so it is the line that is preserved rather than the heading",
              "An eigenvector may be turned slightly as well as scaled",
              "The direction survives only when the eigenvalue is exactly 1",
              "Nothing is wrong, that is the definition",
            ],
            0,
            "Section 16 tightens the phrasing for exactly that case. A negative eigenvalue reverses the arrow and scales it by its size, which still leaves it on the same line, so the preserved thing is the line the direction lies on. The reflection in section 16, entries −1, 0, 0 and 1, sends e₁ to (−1, 0), the same line with the arrow pointing the other way, and its eigenvalue is −1.",
          ),
        ]}
      />

      <PrimerSection title="17. The Eigenvector Equation">
        <p>
          Now that the idea has been seen and computed, the notation adds nothing
          new. It says exactly what section 15 observed.
        </p>
        <Equation>{"A·v = λ·v"}</Equation>
        <NumberTable
          headings={["symbol", "what it is"]}
          rows={[
            ["A", "the transformation"],
            ["v", "a candidate direction, not the zero vector"],
            ["λ", "the factor that direction is scaled by"],
          ]}
        />
        <>
          <p>
            The eigenvector equation says that multiplying by the matrix preserves the
            vector’s axis and scales its magnitude. For this matrix, the vector (1, 1)
            is multiplied by three.
          </p>
          <Equation>{"A(1, 1) = (3, 3) = 3(1, 1)"}</Equation>
          <p>
            The eigenvalue is three.
          </p>
        </>
        <p>
          Finding eigenvectors algebraically is a separate skill, and this primer
          does not need it. Recognising what one <em>is</em> is enough for
          everything that follows.
        </p>
        <KeepInMind>
          <p>
            Not every matrix has such a direction to find. A quarter-turn
            rotation turns every arrow in the plane by ninety degrees, so no
            nonzero real arrow ends up back on the line it started on, and the
            rotation has no real eigenvectors at all.
          </p>
          <p>
            It does have eigenvalues and eigenvectors in the complex numbers,
            which is a genuine and useful fact and entirely outside what is
            needed here. Load the rotation preset in the box above and sweep the
            arrow all the way round; nothing ever lines up.
          </p>
        </KeepInMind>
      </PrimerSection>

      <PrimerSection title="18. Eigenvectors in PCA">
        <p>
          Here is why any of the last four sections matter, kept to what the
          later page will actually use.
        </p>
        <p>
          A dataset usually varies more in some directions than others, and those
          directions need not line up with the features that were measured. When
          two features move together, height and weight say, the direction of
          greatest variation runs diagonally between their axes rather than along
          either of them.
        </p>
        <p>
          Principal component analysis builds a matrix describing how each pair
          of features varies together, called a covariance matrix. That matrix
          has eigenvectors, and they turn out to name directions the data varies
          along independently, each eigenvalue saying how much variation lies
          along its direction.
        </p>
        <InAModel>
          <p>
            So the eigenvectors provide a new set of axes chosen by the data
            rather than by whoever collected it, and the eigenvalues rank them.
            Keeping the few directions with the largest eigenvalues keeps most of
            the variation while describing each example with fewer numbers, which
            is the whole of what the PCA page does.
          </p>
        </InAModel>
      </PrimerSection>

      <PrimerSection title="One Language Used Across Machine Learning">
        <p>
          Everything in this primer reappears, in this order, across the pages
          that follow.
        </p>
        <p>
          Read down the table and the pieces chain into one picture of a model.
          A dataset is a matrix whose rows are example vectors. A model&rsquo;s
          parameters are a vector with one entry per feature. A prediction for
          one example is the dot product of the two plus an offset, the line
          from section 8. A layer of a network is a matrix that carries that
          row to a new one, section 12. And principal component analysis takes
          the eigenvectors of a matrix built from the dataset, section 18. Each
          page that follows is one of those, said in its own vocabulary.
        </p>
        <NumberTable
          headings={["idea", "where it shows up"]}
          rows={[
            ["vector", "one example, a parameter set, a prediction, an embedding"],
            ["subtraction", "the difference between two examples"],
            ["length", "the size of a vector, or its distance from the origin"],
            ["distance", "nearness between examples, or to a cluster centre"],
            ["dot product", "a weighted combination of features"],
            ["matrix", "a dataset, or several weighted sums performed together"],
            ["transformation", "a layer mapping one representation to another"],
            ["eigenvectors", "important directions, ranked by their eigenvalues"],
          ]}
        />
        <KeepInMind>
          <p>
            That table gives a matrix two rather different jobs, and they are
            worth keeping apart. A dataset stored as rows and columns is a
            matrix, and so is an operation that transforms an input vector into
            an output vector.
          </p>
          <p>
            Both are grids of numbers and both are called matrices, though one is
            data at rest and the other is a thing that acts. &ldquo;A dataset is
            a matrix&rdquo; is true, and it does not follow that a dataset is a
            transformation.
          </p>
        </KeepInMind>
      </PrimerSection>

      <PrimerQuiz
        title="Questions on Sections 17 and 18 and the Summary"
        questions={[
          trueFalse(
            "Some matrices have no real eigenvector at all.",
            true,
            "A quarter-turn rotation turns every arrow in the plane by ninety degrees, so no nonzero real arrow ends up back on the line it started on, and the rotation preset in section 15’s box never lines up however far the arrow is swept. The rotation does have eigenvalues and eigenvectors in the complex numbers, which is a genuine and useful fact and entirely outside what this primer needs.",
          ),
          choice(
            "In A·v = λ·v, which candidate v is excluded?",
            [
              "The zero vector",
              "Any vector whose length is not 1",
              "Any vector with a negative entry",
              "Any vector that is not a column of A",
            ],
            0,
            "The table naming the symbols says v is a candidate direction and not the zero vector. The equation is about a direction the transformation preserves, and the zero vector names no direction to preserve.",
          ),
          several(
            "What do a covariance matrix’s eigenvectors and eigenvalues give principal component analysis?",
            [
              "A new set of axes chosen by the data rather than by whoever collected it",
              "A ranking of those axes by how much variation lies along each",
              "A guarantee that the direction of greatest variation lies along one of the measured features",
              "The measured features, recovered in the order they were collected",
            ],
            [0, 1],
            "When two features move together, height and weight say, the direction of greatest variation runs diagonally between their axes rather than along either, so the eigenvectors are new axes and not the measured ones, and each eigenvalue says how much variation lies along its direction, which is the ranking. Nothing guarantees the diagonal lines up with a feature, and nothing hands the features back in any order.",
          ),
          choice(
            "What does keeping only the directions with the largest eigenvalues achieve?",
            [
              "Most of the variation is kept while each example is described with fewer numbers",
              "The data is rotated without anything being lost at all",
              "The features carrying the largest values are kept and the rest dropped",
              "The remaining directions become perpendicular to each other",
            ],
            0,
            "The eigenvalues say how much variation lies along each direction, so the few largest carry most of it, and that is the whole of what the PCA page does. The directions are not the measured features, which is why the one with the most variation along it can run diagonally between two axes.",
          ),
          trueFalse(
            "A dataset stored as rows and columns is a matrix, so a dataset is a transformation.",
            false,
            "Both are grids of numbers and both are called matrices, though one is data at rest and the other is a thing that acts. The first half of that sentence is true and the second does not follow from it.",
          ),
        ]}
      />

      <PrimerPractice
        id="practice-vectors-and-matrices-in-the-library"
        title="Practice. Building Vector and Matrix Operations With NumPy"
        exercises={[
          exercise(
            "Measure movement and compare directions",
            [
              "The arrows from section 5 end at a and b below. Subtract their coordinates to find the movement from a to b. Square that movement's entries, add them, and take the square root to find its length.",
              "Distance is one question; direction is another. Complete a cosine function by multiplying matching coordinates and adding them for the dot product, then dividing by both vector lengths. Use np.sum, np.sqrt and array arithmetic so each operation remains visible.",
              "Run it on the two pairs from section 9 and on a and b themselves. The last pair has different lengths but nearly the same direction. Its cosine is a number the primer has not worked out for you.",
            ],
            `import numpy as np

a = np.array([1.0, 2.0])
b = np.array([4.0, 6.0])

movement = None  # TODO: movement from a to b
distance = None  # TODO: length of that movement

def cosine(u, v):
    # TODO: calculate a dot product and divide out both lengths.
    raise NotImplementedError("Compare the two directions")

print(f"b - a = ({movement[0]:.0f}, {movement[1]:.0f})")
print(f"length of b - a {distance:.4f}")
u = np.array([3.0, 4.0])
v = np.array([4.0, 3.0])
print(f"(3, 4) . (4, 3) = {np.sum(u * v):.0f}")
print(f"cosine of (10, 0) and (10, 10) {cosine(np.array([10.0, 0.0]), np.array([10.0, 10.0])):.4f}")
print(f"cosine of (2, 0) and (2, 0) {cosine(np.array([2.0, 0.0]), np.array([2.0, 0.0])):.4f}")
print(f"cosine of a and b {cosine(a, b):.4f}")`,
            `import numpy as np

a = np.array([1.0, 2.0])
b = np.array([4.0, 6.0])

movement = b - a
distance = np.sqrt(np.sum(movement ** 2))

def cosine(u, v):
    dot = np.sum(u * v)
    length_u = np.sqrt(np.sum(u ** 2))
    length_v = np.sqrt(np.sum(v ** 2))
    return dot / (length_u * length_v)

print(f"b - a = ({movement[0]:.0f}, {movement[1]:.0f})")
print(f"length of b - a {distance:.4f}")
u = np.array([3.0, 4.0])
v = np.array([4.0, 3.0])
print(f"(3, 4) . (4, 3) = {np.sum(u * v):.0f}")
print(f"cosine of (10, 0) and (10, 10) {cosine(np.array([10.0, 0.0]), np.array([10.0, 10.0])):.4f}")
print(f"cosine of (2, 0) and (2, 0) {cosine(np.array([2.0, 0.0]), np.array([2.0, 0.0])):.4f}")
print(f"cosine of a and b {cosine(a, b):.4f}")`,
            `b - a = (3, 4)
length of b - a 5.0000
(3, 4) . (4, 3) = 24
cosine of (10, 0) and (10, 10) 0.7071
cosine of (2, 0) and (2, 0) 1.0000
cosine of a and b 0.9923`,
            {
              question: "How far apart are the two arrows, and do they point the same way?",
              hints: [
                "Subtracting arrays subtracts matching entries. The resulting vector describes a movement, so its length is the distance between the two endpoints.",
                "Array multiplication gives the coordinate products. np.sum combines them into the dot product. Length uses the same operation with a vector multiplied by itself, followed by a square root.",
                "Divide the dot product by the product of both lengths. The supplied vectors are nonzero; a zero vector has no direction and its cosine would be undefined.",
              ],
              check: numberCheck("What is the cosine between a and b?", 0.9923, 0.00005, "The endpoints are five units apart, yet their arrows point almost the same way. Distance and cosine answer different questions: one measures separation, the other compares direction after removing length."),
            },
          ),
          exercise(
            "Apply a matrix one weighted sum at a time",
            [
              "Section 10 describes a matrix as one weighted sum per output. Build those sums directly for the worked matrix below. Multiply every row by the input vector, then add across the columns to get one answer per row.",
              "Complete apply_by_rows using multiplication and np.sum before using the matrix multiplication operator. Send the six supplied arrows through it and print each result. Then compare your answers with NumPy's @ operator using np.allclose.",
              "Notice the basis vectors, which reveal the matrix's columns, and the two eigenvector directions from section 15. Those directions keep their orientation while other arrows can change direction. The final input is one the primer did not calculate.",
            ],
            `import numpy as np

matrix = np.array([[2.0, 1.0], [1.0, 2.0]])
inputs = np.array([[3.0, 1.0], [1.0, 0.0], [0.0, 1.0],
                   [1.0, 1.0], [1.0, -1.0], [3.0, 4.0]])

def apply_by_rows(matrix, vector):
    # TODO: multiply by the input coordinates, then add along each row.
    raise NotImplementedError("Build one weighted sum per output")

print(f"matrix has {matrix.shape[0]} rows and {matrix.shape[1]} columns")
agrees = True
for vector in inputs:
    answer = apply_by_rows(matrix, vector)
    print(f"({vector[0]:.0f}, {vector[1]:.0f}) -> ({answer[0]:.0f}, {answer[1]:.0f})")
    agrees = agrees and np.allclose(answer, matrix @ vector)
print(f"all row sums agree with @ {bool(agrees)}")`,
            `import numpy as np

matrix = np.array([[2.0, 1.0], [1.0, 2.0]])
inputs = np.array([[3.0, 1.0], [1.0, 0.0], [0.0, 1.0],
                   [1.0, 1.0], [1.0, -1.0], [3.0, 4.0]])

def apply_by_rows(matrix, vector):
    products = matrix * vector
    return np.sum(products, axis=1)

print(f"matrix has {matrix.shape[0]} rows and {matrix.shape[1]} columns")
agrees = True
for vector in inputs:
    answer = apply_by_rows(matrix, vector)
    print(f"({vector[0]:.0f}, {vector[1]:.0f}) -> ({answer[0]:.0f}, {answer[1]:.0f})")
    agrees = agrees and np.allclose(answer, matrix @ vector)
print(f"all row sums agree with @ {bool(agrees)}")`,
            `matrix has 2 rows and 2 columns
(3, 1) -> (7, 5)
(1, 0) -> (2, 1)
(0, 1) -> (1, 2)
(1, 1) -> (3, 3)
(1, -1) -> (1, -1)
(3, 4) -> (10, 11)
all row sums agree with @ True`,
            {
              question: "What does each row of a matrix do to an arrow?",
              hints: [
                "NumPy can multiply each row of a matrix by the same one-dimensional vector. Each column is multiplied by its matching input coordinate.",
                "np.sum with axis=1 adds across columns, leaving one value for each row. Without an axis it would combine every product into a single number.",
                "The @ operator does matrix multiplication. Comparing it with your explicit row sums checks that the shorter notation performs the operation you have just written.",
              ],
              check: numberCheck("What is the first output for the input (3, 4)?", 10, 0.05, "Every output is a weighted sum of the same input coordinates. The basis vectors select individual columns, while the two eigenvector directions remain on their original lines."),
            },
          ),
          exercise(
            "Join two transformations with matching shapes",
            [
              "The first matrix below takes two coordinates and produces three. Apply it to the arrow from section 11, then read how many coordinates the result contains.",
              "The proposed next matrix has only two columns. Before trying the multiplication, compare its column count with the number of outputs from the first matrix. Print whether those counts match.",
              "Replace that next matrix with one row of three ones so it can add all three intermediate coordinates. Calculate the final answer in two stages, then compose the matrices with @ and check that the composed transformation gives the same result.",
            ],
            `import numpy as np

tall = np.array([[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]])
vector = np.array([3.0, 1.0])
proposed_next = np.array([[1.0, 1.0]])

intermediate = None  # TODO: apply the first transformation
compatible = None  # TODO: compare the joining dimensions
next_matrix = None  # TODO: a matrix that adds three coordinates
answer = None  # TODO: apply the second transformation
combined = None  # TODO: compose them in the correct order

print(f"first matrix shape {tall.shape}")
print(f"intermediate coordinates {intermediate.tolist()}")
print(f"proposed next matrix compatible {compatible}")
print(f"corrected next matrix shape {next_matrix.shape}")
print(f"two-stage answer {answer.tolist()}")
print(f"combined matrix {combined.tolist()}")
print(f"same answer {np.allclose(combined @ vector, answer)}")`,
            `import numpy as np

tall = np.array([[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]])
vector = np.array([3.0, 1.0])
proposed_next = np.array([[1.0, 1.0]])

intermediate = tall @ vector
compatible = proposed_next.shape[1] == tall.shape[0]
next_matrix = np.array([[1.0, 1.0, 1.0]])
answer = next_matrix @ intermediate
combined = next_matrix @ tall

print(f"first matrix shape {tall.shape}")
print(f"intermediate coordinates {intermediate.tolist()}")
print(f"proposed next matrix compatible {compatible}")
print(f"corrected next matrix shape {next_matrix.shape}")
print(f"two-stage answer {answer.tolist()}")
print(f"combined matrix {combined.tolist()}")
print(f"same answer {np.allclose(combined @ vector, answer)}")`,
            `first matrix shape (3, 2)
intermediate coordinates [3.0, 1.0, 4.0]
proposed next matrix compatible False
corrected next matrix shape (1, 3)
two-stage answer [8.0]
combined matrix [[2.0, 2.0]]
same answer True`,
            {
              question: "What has to match before one matrix can follow another?",
              hints: [
                "A matrix's column count says how many coordinates it reads. Its row count says how many weighted sums it returns. NumPy lists rows first in shape.",
                "The intermediate vector has three entries, so the next matrix needs three columns. Keep it two-dimensional by putting the row inside an outer list.",
                "With a vector on the right, the matrix nearest it acts first. Put next_matrix on the left of tall when composing their actions.",
              ],
              check: numberCheck("What is the final output of the composed transformation?", 8, 0.05, "The intermediate coordinates connect the two transformations. Matching that dimension makes composition possible, and the composed matrix packages both steps into a single operation."),
            },
          ),
          exercise(
            "Build a covariance matrix and find its main direction",
            [
              "Section 18 connects eigenvectors with the directions in which a dataset varies. Start with the five paired height and weight measurements below. Subtract each column's mean so the arrows describe deviations rather than positions far from the origin.",
              "Multiply the transpose of that centred table by the table itself. Each entry then sums the products for one pair of columns. Divide by one fewer than the row count to get the sample covariance matrix. The diagonal measures variation within a column; the other entries describe how the columns vary together.",
              "Use np.linalg.eigh for the eigenvalue calculation. It returns values in ascending order and directions as columns. Choose the direction belonging to the largest value, report its share of the total, and check the eigenvector equation with np.allclose. For consistent printing, point the chosen direction toward increasing height by flipping the whole vector if its first entry is negative.",
            ],
            `import numpy as np

people = np.array([[160, 58], [165, 66], [170, 68],
                   [175, 74], [180, 74]], dtype=float)
count = people.shape[0]
means = None  # TODO: one mean per column
centred = None  # TODO: deviations from those means
covariance = None  # TODO: paired products, with the sample denominator
values, directions = None, None  # TODO: solve the symmetric matrix
main_value = None  # TODO: largest eigenvalue
main_direction = None  # TODO: its corresponding column
if main_direction[0] < 0:
    main_direction = -main_direction
share = None  # TODO: fraction of total variance
eigenvector_check = None  # TODO: compare matrix action with scalar multiplication

print(f"covariance matrix {np.round(covariance, 2).tolist()}")
print(f"eigenvalues {np.round(values, 4).tolist()}")
print(f"main direction {np.round(main_direction, 4).tolist()}")
print(f"total variance {np.sum(values):.4f}")
print(f"share of the main direction {share:.4f}")
print(f"eigenvector equation holds {eigenvector_check}")`,
            `import numpy as np

people = np.array([[160, 58], [165, 66], [170, 68],
                   [175, 74], [180, 74]], dtype=float)
count = people.shape[0]
means = np.sum(people, axis=0) / count
centred = people - means
covariance = (centred.T @ centred) / (count - 1)
values, directions = np.linalg.eigh(covariance)
main_value = values[-1]
main_direction = directions[:, -1]
if main_direction[0] < 0:
    main_direction = -main_direction
share = main_value / np.sum(values)
eigenvector_check = np.allclose(covariance @ main_direction, main_value * main_direction)

print(f"covariance matrix {np.round(covariance, 2).tolist()}")
print(f"eigenvalues {np.round(values, 4).tolist()}")
print(f"main direction {np.round(main_direction, 4).tolist()}")
print(f"total variance {np.sum(values):.4f}")
print(f"share of the main direction {share:.4f}")
print(f"eigenvector equation holds {eigenvector_check}")`,
            `covariance matrix [[62.5, 50.0], [50.0, 44.0]]
eigenvalues [2.4016, 104.0984]
main direction [0.7687, 0.6396]
total variance 106.5000
share of the main direction 0.9775
eigenvector equation holds True`,
            {
              question: "Which direction contains most of the variation in the five people?",
              hints: [
                "Summing with axis=0 adds down the people and leaves one total per column. The two means then subtract from every row through broadcasting.",
                "centred.T puts the columns into rows. Matrix multiplication pairs each of them with every original column, including itself.",
                "The last eigenvalue is the largest. The last column of directions belongs to it. A vector and its negative describe the same line, so reversing the whole direction does not change the result being checked.",
              ],
              check: numberCheck("What share of the total variance belongs to the main direction?", 0.9775, 0.00005, "Most of the variation lies along a direction where height and weight increase together. The large variance share describes this table in these units; changing the relative scaling of the columns can change the main direction."),
            },
          ),
        ]}
      />
    </PrimerPage>
  );
}
