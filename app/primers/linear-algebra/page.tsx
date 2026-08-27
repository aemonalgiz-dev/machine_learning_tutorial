import type { Metadata } from "next";
import {
  Equation,
  PrimerPage,
  PrimerPlayground,
  PrimerSection,
} from "@/components/concept/PrimerPage";
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
    "Vectors, distance, the dot product, matrices and eigen directions, built up in the order the models actually need them.",
};

export default function LinearAlgebraPrimerPage() {
  return (
    <PrimerPage
      title="Linear Algebra Primer"
      tagline="Vectors, distance, the dot product and the directions a matrix leaves alone, built up in the order the models need them."
      prerequisites={
        <>
          Arithmetic and a pair of coordinate axes. Everything else, including
          every piece of notation, is introduced here before it is used.
        </>
      }
    >
      <PrimerSection title="Where This Came From">
        <p>
          The same measurement problems that produced least squares also produced
          this subject. An astronomer or a surveyor in the 1800s did not have one
          unknown to find, they had several at once, an orbit&rsquo;s tilt and
          shape and timing, say, tangled together in dozens of equations, and
          solving such systems by substitution was slow and error-prone enough
          that Gauss systematised the bookkeeping into a procedure. Over the
          following century mathematicians noticed that the bookkeeping itself
          was the interesting object. A grid of coefficients does something, it
          takes in one list of numbers and puts out another, and the moves it can
          make, stretching, turning, shearing, could be studied in their own
          right. The grid is a matrix, the lists are vectors, and the study of
          what matrices do to vectors is linear algebra.
        </p>
        <p>
          For us the motivation is nearer to hand. A model with one input was
          manageable with ordinary arithmetic, though the models ahead take many
          inputs at once, and writing every equation out coordinate by coordinate
          stops scaling almost immediately. Linear algebra is the notation that
          keeps many numbers moving together readable, and two of its ideas, the
          dot product and the eigen direction, turn out to carry whole models on
          their backs.
        </p>
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
          A vector&rsquo;s entries describe its movement along each axis
          separately. Its length is the direct distance from its start to its
          end, and that is a right triangle, so Pythagoras measures it.
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
          Three dimensions add another squared component under the root, and
          higher dimensions carry on the same way, one squared entry each. The
          picture stops being drawable long before the arithmetic stops working.
        </p>
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
          Suppose a prediction uses two feature values and carries one weight for
          each, saying how strongly that feature should count.
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
        <p>
          For (3, 4) that is 9 + 16 = 25, and its square root is the length 5.
          Length, distance and alignment turn out to be one operation seen from
          three directions, and that economy is why the dot product is
          everywhere.
        </p>
      </PrimerSection>

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
          The negative case is the one that needs the earlier phrasing tightened.
          An eigenvector is not quite a direction the matrix leaves pointing the
          same way, it is a direction whose <em>line</em> the matrix preserves. A
          negative eigenvalue flips the arrow end for end while leaving it on
          that same line, which still counts.
        </p>
      </PrimerSection>

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
        <p>
          Reading it aloud, sending v through A gives back v itself, scaled. For
          our matrix and v = (1, 1) the equation reads (3, 3) = 3·(1, 1), which
          is the arithmetic already done.
        </p>
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
    </PrimerPage>
  );
}
