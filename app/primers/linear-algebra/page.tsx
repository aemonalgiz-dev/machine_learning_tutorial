import type { Metadata } from "next";
import Link from "next/link";
import {
  Equation,
  PrimerPage,
  PrimerPlayground,
  PrimerSection,
} from "@/components/concept/PrimerPage";
import { MatrixPlayground } from "@/components/widgets/MatrixPlayground";
import { VectorPlayground } from "@/components/widgets/VectorPlayground";

export const metadata: Metadata = {
  title: "Linear Algebra Primer · oop_ml",
  description:
    "Vectors, the dot product, and a matrix as a machine that moves the whole plane, with every number worked by hand and checkable on the live widgets.",
};

export default function LinearAlgebraPrimerPage() {
  return (
    <PrimerPage
      title="Linear Algebra Primer"
      tagline="Vectors, the dot product, and a matrix as a machine that moves the whole plane."
      prerequisites={
        <>
          You only need to be comfortable reading coordinates in the plane, a
          point written as (x, y). Everything else is built up here, and nothing
          in this primer requires the calculus.
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

      <PrimerSection title="What a Vector Is">
        <p>
          A vector is a list of numbers, and the whole trick of the subject is
          that one list can be read two ways. Take the pair (3, 4). Read it as a
          point, it is a position in the plane, three across and four up. Read it
          as an arrow from the origin to that position, it is a movement, a
          direction with a size. The numbers are identical either way, and we
          switch between the two readings freely, using whichever makes the
          picture clearer.
        </p>
        <p>
          We have been working with vectors all along without the name. A person
          in the regression example was a pair of numbers, their height and their
          weight, which is to say each person <em>is</em> a vector, and the
          scatter of dots was a plane full of them. With more measurements per
          person the list just gets longer, a (height, weight, age) vector lives
          in three dimensions, and nothing about the arithmetic below changes
          except the number of entries. We stay in two dimensions here because
          two dimensions fit on a screen.
        </p>
      </PrimerSection>

      <PrimerSection title="Length and Distance">
        <p>
          An arrow has a size, and for a vector we can compute it exactly. The
          arrow to (3, 4) is the long side of a right triangle whose other two
          sides run 3 across and 4 up, so its length comes straight from
          Pythagoras.
        </p>
        <Equation>{"length of (3, 4) = √(3² + 4²) = √25 = 5"}</Equation>
        <p>
          Distance between two points follows from the same idea. To get from
          the point (1, 2) to the point (4, 6) you move 3 across and 4 up, so the
          difference between them is the vector (3, 4), and the distance between
          them is that difference&rsquo;s length, 5 again.
        </p>
        <Equation>{"distance = length of the difference"}</Equation>
        <p>
          This is worth a moment, because two of the models ahead run almost
          entirely on it. Asking which stored examples are nearest to a new one,
          which is the whole of k-nearest neighbours, and which group centre a
          point belongs to, which is the whole of k-means, both mean computing
          exactly this distance, just with longer lists.
        </p>
        <p>
          The box below has two arrows, a in indigo and b in amber. On load a is
          (3, 4), and its length readout shows the 5 we just computed. Drag the
          tips anywhere and the lengths and the distance between them follow. The
          dot product readout is the subject of the next section.
        </p>
        <PrimerPlayground>
          <VectorPlayground />
        </PrimerPlayground>
      </PrimerSection>

      <PrimerSection title="The Dot Product">
        <p>
          The dot product takes two vectors and produces a single number, and the
          recipe could hardly be shorter. Multiply the entries position by
          position, then add.
        </p>
        <Equation>{"(a₁, a₂) · (b₁, b₂) = a₁·b₁ + a₂·b₂"}</Equation>
        <p>For the two arrows the widget starts with, that is</p>
        <Equation>{"(3, 4) · (4, 3) = 3·4 + 4·3 = 12 + 12 = 24"}</Equation>
        <p>
          matching the a · b readout above. Read as arithmetic, the dot product
          is a weighted sum, each entry of one list weighing the matching entry
          of the other. That is precisely the shape of a model&rsquo;s
          prediction. A regression over many features multiplies each feature by
          its coefficient and adds, which is to say its prediction is one dot
          product, the feature vector dotted with the weight vector. When the
          later pages write a model in one line, this is the line.
        </p>
        <p>
          The geometric reading is the surprising one. The dot product measures
          alignment. Two arrows pointing much the same way give a large positive
          value, and as they swing apart the value falls, reaching exactly zero
          when they are perpendicular and going negative once they oppose each
          other. Try it above. Drag b to (−4, 3), which is a swung a quarter
          turn, and the dot product reads 0. Drag b to point against a and it
          goes negative.
        </p>
        <p>
          One more fact ties the last two sections together. Dot a vector with
          itself and the recipe gives 3·3 + 4·4 = 25, which is the square of its
          length. Length, distance and alignment are all one operation viewed
          from different angles, and that economy is why the dot product is
          everywhere.
        </p>
        <Equation>{"v · v = (length of v)²"}</Equation>
      </PrimerSection>

      <PrimerSection title="What a Matrix Does">
        <p>
          A matrix is a grid of numbers, and like a vector it asks to be read as
          something more. A 2x2 matrix is a machine that takes in a vector and
          puts out a vector, and the recipe is two dot products. The
          matrix&rsquo;s first row dotted with the input gives the first output
          entry, and its second row gives the second.
        </p>
        <Equation>{"[ 2  1 ]   applied to (x, y)   gives   (2x + 1y, 1x + 2y)\n[ 1  2 ]"}</Equation>
        <p>
          Let us run three inputs through this particular machine by hand. The
          arrow (1, 0), one step across, comes out as (2·1 + 1·0, 1·1 + 2·0),
          which is (2, 1). The arrow (0, 1), one step up, comes out as (1, 2).
          And the corner (1, 1) comes out as (2 + 1, 1 + 2), which is (3, 3).
        </p>
        <Equation>{"(1, 0)  →  (2, 1)\n(0, 1)  →  (1, 2)\n(1, 1)  →  (3, 3)"}</Equation>
        <p>
          The first two of those are worth staring at, because (2, 1) is the
          matrix&rsquo;s first column and (1, 2) is its second. That is no
          coincidence, and it is the best way to read any matrix. The columns
          are where the two basis arrows land, and since every other point is
          built from those two arrows, the columns determine where everything
          lands. A matrix is not a table of numbers so much as a before-and-after
          photograph of the plane, compressed to two arrows.
        </p>
        <p>
          The box below applies a matrix to the whole plane at once. The faint
          grid is before, the tinted grid is after, the two heavy arrows are the
          landed basis arrows, the matrix&rsquo;s columns, and the shaded shape
          is what became of the unit square. It loads with our worked matrix, so
          the arrows land on (2, 1) and (1, 2) just as the hand arithmetic said,
          and the square&rsquo;s far corner sits at (3, 3). Edit the entries or
          load a preset and watch the plane follow.
        </p>
        <PrimerPlayground>
          <MatrixPlayground />
        </PrimerPlayground>
      </PrimerSection>

      <PrimerSection title="The Directions a Matrix Keeps">
        <p>
          Watch what the worked matrix did to directions. The arrow (1, 0)
          pointed straight across, and its image (2, 1) points somewhere else,
          up and to the right. The machine did not just stretch that arrow, it
          turned it, and the same is true of almost every direction you could
          feed in.
        </p>
        <p>
          Almost every direction, though not all. We computed above that (1, 1)
          comes out as (3, 3), and (3, 3) points exactly the way (1, 1) does. It
          is the same arrow, three times longer. Run (1, −1) through the machine
          and it comes out as (2 − 1, 1 − 2), which is (1, −1) itself, unchanged.
        </p>
        <Equation>{"(1, 1)   →  (3, 3)   the same direction, stretched by 3\n(1, −1)  →  (1, −1)  the same direction, stretched by 1"}</Equation>
        <p>
          These special directions, the ones the matrix only stretches and never
          turns, are called eigenvectors, and the stretch factors are their
          eigenvalues. The dashed lines in the widget are exactly these
          directions, and the readouts report the factors, ×3.00 along (0.71,
          0.71) and ×1.00 along (0.71, −0.71). Those are our (1, 1) and (1, −1)
          scaled to length one, the same directions in unit form.
        </p>
        <p>
          Not every matrix has them. Load the rotation preset, which turns every
          arrow a quarter turn, and the widget reports that no direction survives
          unturned, which for a rotation is exactly right. Load the shear and
          only one direction holds. Whether these directions exist, and where
          they point, is a fingerprint of what the matrix does.
        </p>
        <p>
          Why care about a matrix&rsquo;s kept directions? Because they are the
          axes along which a complicated transformation becomes simple, just a
          stretch, and one of the models ahead is built on nothing else.
          Principal component analysis takes a cloud of correlated data, builds
          a matrix from how the features vary together, and asks for that
          matrix&rsquo;s eigenvectors, which turn out to be the directions the
          cloud actually spreads along. When that page arrives, the mathematics
          it leans on is what you just watched.
        </p>
      </PrimerSection>

      <PrimerSection title="Why Every Model Speaks This Language">
        <p>
          Here is the primer in one place, pointed forward. A dataset is a
          matrix, one row per example, one column per feature, and each row is a
          vector, one example as a single object. A linear model&rsquo;s
          prediction is a dot product, the row dotted with the weights. Nearness
          between examples is the length of their difference, which is what
          k-nearest neighbours and k-means spend all their time computing. And
          the directions a data-built matrix only stretches are where principal
          component analysis finds the shape of the data. None of the pages
          ahead will re-derive any of this, they will simply speak it, the way
          the{" "}
          <Link
            href="/primers/calculus"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            calculus primer
          </Link>
          &rsquo;s derivative is spoken wherever something is fitted.
        </p>
      </PrimerSection>
    </PrimerPage>
  );
}
