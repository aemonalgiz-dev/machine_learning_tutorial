import { lessonIntuitions } from "@/lib/intuition";
import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { choice, several, trueFalse } from "@/lib/quizzes";
import { exercise, numberCheck } from "@/lib/exercises";
import { Equation } from "@/components/concept/Equation";
import { KeepInMind, SubSection, WorkedExample } from "@/components/concept/Treatments";
import { PositionExplorer } from "@/components/widgets/NetworkBuildingBlocks";

export const metadata: Metadata = { title: "Positional Encoding · oop_ml", description: "Explain why token order needs a representation, then construct a sinusoidal position vector." };

export default function PositionalEncodingPage() {
  return <ConceptPage
      lessonId="positional-encoding"
      intuition={lessonIntuitions["positional-encoding"]} title="Positional Encoding" tagline="Tell a sequence model where each token occurs."
    openingTitle="The Same Words Can Say Something Different"
    technicalStart="Part 2. Building a Position Vector"
    prerequisites={<>Read <Link href="/concepts/embedding-layers">embedding layers</Link> for token vectors and <Link href="/concepts/attention">attention</Link> for how tokens gather information from one another.</>}

    playgroundIntro="Every row begins with the same token vector. Compare the added pattern at positions zero and one. Then change the frequency base and see which columns change more quickly across positions."
    playground={<PositionExplorer />}
    sections={[
      { title: "Part 1. Keep Content and Position Available", defaultOpen: true, content: <>
        <SubSection title="1. Add information without adding coordinates">
          <p>An attention layer compares every token with every other token at once, and nothing in that comparison says which token came first. Hand it the same tokens in another order and it answers the same rows in that other order, because all it ever saw was a set of vectors. The words of a sentence are not a set. Which token precedes which is information the input has to carry, and an embedding alone does not carry it, since a token looks up the same vector wherever it occurs.</p>
          <p>What is missing is a vector that depends on where a token sits and on nothing else. We make that position vector the same width as the token vector, then add corresponding entries. This keeps the shape expected by the next layer. It also means the next layer sees a mixture of content and position, and must learn to use that mixture.</p>
          <p>Adding a position vector is a design choice. A model could instead learn a table of position vectors, or encode relative positions in another way. We start with a fixed pattern because every value can be reproduced without training another table, and because a position the training data never reached still gets a vector, since the vector is a function of the position rather than an entry looked up in a table.</p>
        </SubSection>
        <WorkedExample title="The same token at three positions">
          <p>For a four-coordinate vector, the first sine-cosine pair changes faster than the second. At position zero, all the sine entries are zero and the cosine entries are one.</p>
          <Equation>{`Token vector = [1, 0, 1, 0]\nPosition 0   = [0, 1, 0, 1]\nCombined     = [1 + 0, 0 + 1, 1 + 0, 0 + 1]\n             = [1, 1, 1, 1]\n\nPosition 1 ≈ [0.8415, 0.5403, 0.0100, 0.99995]\nCombined   ≈ [1.8415, 0.5403, 1.0100, 0.99995]\n\nPosition 2 ≈ [0.9093, −0.4161, 0.0200, 0.9998]\nCombined   ≈ [1.9093, −0.4161, 1.0200, 0.9998]`}</Equation>
          <p>The token has not changed. The different sums indicate that its occurrences occupy different places in the sequence. Subtract any two combined rows and the token cancels, leaving the difference of two position vectors, which is the same whatever token stood at those two places. That is what lets a later layer read a distance off the mixture without knowing what the content was.</p>
        </WorkedExample>
      </> },
      { title: "Part 2. Building a Position Vector", content: <>
        <SubSection title="2. Use pairs that change at different rates">
          <p>Let p be the position, starting at zero. Let d be the vector width and k identify a pair of coordinates. B controls the spread of frequencies. Each pair has its own rate, one over B raised to a power that grows with k, so the first pair turns by one radian per position and every later pair turns more slowly. With the default base used here, a width of four has two pairs.</p>
          <Equation>{`B = 10000\nangle(p, k) = p / B^(2k/d)\nPE[p, 2k]   = sin(angle(p, k))\nPE[p, 2k+1] = cos(angle(p, k))\n\nFor d = 4 at p = 1:\nFirst pair angle  = 1 / 10000^0   = 1\nSecond pair angle = 1 / 10000^0.5 = 0.01`}</Equation>
          <p>A single sine value repeats and can be ambiguous. Pairing sine and cosine gives the phase of one oscillation, which is a point on a circle, and moving forward by a fixed number of positions turns that point by a fixed angle wherever the move started. A layer above can therefore read a distance as a rotation, and the rotation for a given distance is the same everywhere in the sequence.</p>
          <p>Using several pairs at different frequencies provides patterns over different distances. The first pair completes a turn every 2π positions, which is about 6.28, and the second needs a hundred times as many. The fast pair on its own would nearly confuse position six with position zero, since by then it has come most of the way round.</p>
          <Equation>{`Position 0, first pair  = (0, 1)\nPosition 6, first pair  ≈ (−0.2794, 0.9602)\n\nPosition 0, second pair = (0, 1)\nPosition 6, second pair ≈ (0.0600, 0.9982)`}</Equation>
          <p>The slow pair has barely moved, and that small movement is what keeps the two positions apart. Lowering the base speeds the slow pairs up. At a base of 2 the second pair&rsquo;s angle at position one is 1 over the square root of 2, about 0.7071, and its entries become 0.6496 and 0.7602 instead of 0.0100 and 0.99995, which is what the frequency base control in the playground shows. None of this makes the finite-width encoding a guarantee of uniquely identifying arbitrarily distant positions.</p>
        </SubSection>
        <SubSection title="3. Add the pattern to every sequence">
          <p>The SDK constructs the pattern once, freezes it, and broadcasts it over the batch. Position zero has the same positional vector in every sequence, because position means where a token sits inside its own sequence and not which sequence it belongs to. If the vector width is odd, the last coordinate contains a sine value without its paired cosine.</p>
          <Equation>{`output[batch, position, coordinate]\n    = input[batch, position, coordinate] + pattern[position, coordinate]`}</Equation>
          <p>The pattern has no trainable parameters. Adding a constant has derivative one with respect to the input, so the backward pass returns the arriving input gradient unchanged, and a training step leaves the layer exactly as it was.</p>
        </SubSection>
      </> },
      { title: "Part 3. Order Is Different from Permission to Look", content: <>
        <p>A positional encoding gives information about location. A causal mask restricts which locations can contribute. They solve different problems and can be used together. The attention playground lets you enable them separately, and the two controls change different things, since the mask changes which columns of a row may be used and the encoding changes what every row holds.</p>
        <WorkedExample title="Two identical tokens, with and without positions">
          <p>Take the attention lesson&rsquo;s default example, the tokens red, blue, red with projections that leave every vector unchanged, and read the row of shares each red token produces over the three tokens.</p>
          <Equation>{`Positions off, mask off\n  first red = [0.3837, 0.2327, 0.3837]\n  last red  = [0.3837, 0.2327, 0.3837]\n\nPositions on, mask off\n  first red = [0.3349, 0.4053, 0.2599]\n  last red  = [0.2013, 0.1547, 0.6440]\n\nPositions off, mask on\n  first red = [1, 0, 0]\n  last red  = [0.3837, 0.2327, 0.3837]`}</Equation>
          <p>Without positions the two red tokens are the same input, so their rows are identical and nothing downstream can tell them apart. Adding the pattern makes them different inputs, and the rows differ with no training at all. The mask does something else. It leaves the last red&rsquo;s row exactly as it was, because that token may read everything before it, and it empties the entries the first red is not allowed to use while the remaining shares still total one.</p>
        </WorkedExample>
        <KeepInMind><p>Being able to calculate a position vector for a longer sequence does not guarantee that a trained model will work well at that length. Position information also does not impose grammatical understanding. It gives the model information from which useful order-dependent behavior can be learned.</p></KeepInMind>
        <p>The sinusoidal construction appears in <a href="https://arxiv.org/abs/1706.03762">Attention Is All You Need</a>. The parameter called <code>wavelength</code> in this SDK supplies the frequency base B in the equations above.</p>
      </> },
      { title: "Questions on Parts 1 to 3", quiz: [
        trueFalse(
          "At position zero the added pattern leaves the token vector unchanged.",
          false,
          "At position zero all the sine entries are zero and all the cosine entries are one, so a token vector of [1, 0, 1, 0] comes out as [1, 1, 1, 1]. The token has not changed, and the different sums are what indicate that its occurrences occupy different places in the sequence.",
        ),
        choice(
          "Why is each coordinate paired with another at the same frequency rather than used on its own?",
          [
            "A single sine value repeats and can be ambiguous, while a sine and cosine together give the phase of one oscillation",
            "A single value would make the position vector half the width of the token vector",
            "Cosine is needed so that position zero is not all zeros",
            "Pairing is what makes the pattern trainable",
          ],
          0,
          "Using several pairs at different frequencies then provides patterns over different distances. None of that makes a finite-width encoding a guarantee of uniquely identifying arbitrarily distant positions.",
        ),
        several(
          "Which of these hold for the pattern this SDK builds?",
          [
            "It is constructed once, frozen, and broadcast over the batch",
            "It has no trainable parameters",
            "The backward pass returns the arriving input gradient unchanged",
            "Position zero gets a different positional vector in each sequence",
          ],
          [0, 1, 2],
          "Adding a constant has derivative one with respect to the input, which is why the gradient passes straight through. Position zero has the same positional vector in every sequence, and if the vector width is odd the last coordinate holds a sine value without its paired cosine.",
        ),
        trueFalse(
          "A positional encoding and a causal mask solve different problems, so a model can use both at once.",
          true,
          "A positional encoding gives information about location and a causal mask restricts which locations can contribute, which is why the attention playground lets you enable them separately. In the worked example the mask leaves the last red’s row exactly as it was and empties what the first red may not use, while the encoding changes what every row holds, so the two reds’ rows differ with no training at all. Position information also does not impose grammatical understanding; it gives the model information from which useful order-dependent behavior can be learned.",
        ),
        choice(
          "For a width of four at position one, what are the two pair angles?",
          [
            "1 and 0.01",
            "1 and 0.5",
            "0 and 1",
            "10000 and 100",
          ],
          0,
          "The first pair’s angle is the position over B to the power zero, which is the position itself, and the second pair’s is the position over B to the power one half, which at a base of 10000 is one over 100. That is why the first pair turns by one radian per position and completes a turn every 6.28 positions while the second needs a hundred times as many, and why lowering the base to 2 takes the second angle at position one up to about 0.7071.",
        ),
      ] },
        {
          title: "Practice. Building the Pattern With the Library",
          practice: [
            exercise(
              "Build the pattern and add it to one token",
              ["Part 1 adds the position vector to the token vector [1, 0, 1, 0] at positions zero, one and two. Build the layer for four positions of width four, read its pattern, and add the pattern to that same token at every position by passing a block of four copies through the layer.", "Print the pattern row and the combined row for each position to four places. The first three rows should match the worked example, and the fourth is the one it did not show."],
              `import numpy as np

from oop_ml import PositionalEncoding

token = np.array([1.0, 0.0, 1.0, 0.0])
inputs = np.tile(token, (1, 4, 1))

layer = PositionalEncoding((4, 4))
# Pass the block through the layer, then print the pattern row and the
# combined row for each of the four positions, to four places.`,
              `import numpy as np

from oop_ml import PositionalEncoding

token = np.array([1.0, 0.0, 1.0, 0.0])
inputs = np.tile(token, (1, 4, 1))

layer = PositionalEncoding((4, 4))
outputs = layer.respond_to(inputs).outputs[0]

for position in range(4):
    pattern = ", ".join(f"{value:.4f}" for value in layer.pattern[position])
    combined = ", ".join(f"{value:.4f}" for value in outputs[position])
    print(f"position {position}  pattern  [{pattern}]")
    print(f"            combined [{combined}]")`,
              `position 0  pattern  [0.0000, 1.0000, 0.0000, 1.0000]
            combined [1.0000, 1.0000, 1.0000, 1.0000]
position 1  pattern  [0.8415, 0.5403, 0.0100, 1.0000]
            combined [1.8415, 0.5403, 1.0100, 1.0000]
position 2  pattern  [0.9093, -0.4161, 0.0200, 0.9998]
            combined [1.9093, -0.4161, 1.0200, 0.9998]
position 3  pattern  [0.1411, -0.9900, 0.0300, 0.9996]
            combined [1.1411, -0.9900, 1.0300, 0.9996]`,
              { hints: ["The layer reads a block of (sequences, positions, coordinates), so one sequence of four copies of the token is a block of shape (1, 4, 4), which is what np.tile builds.", "pattern is a property of the layer, one row per position, built at construction. It needs no input to exist.", "respond_to answers a response object whose outputs is the input block plus the pattern, so the first sequence of it is the four combined rows."], check: numberCheck("What is the first coordinate of the combined vector at position three?", 1.1411, 0.0005, "The first pair turns by one radian per position, and the sine of three radians is 0.1411, so the token’s leading 1 becomes 1.1411. The sine has already fallen back from 0.9093 at position two, because three radians is past the top of the circle, which is why the fast pair on its own cannot keep positions apart for long and a slower pair is needed beside it.") },
            ),
            exercise(
              "Lower the base and watch the slow pair speed up",
              ["Part 2 says lowering the frequency base speeds up the slow pairs, and that at a base of 2 the second pair’s entries at position one become 0.6496 and 0.7602 instead of 0.0100 and 0.99995. Build the layer at bases of 10000, 100 and 2, and print the pattern row for position one at each, to five places.", "Watch which entries change. The first pair’s angle is the position itself whatever the base, so its two entries should not move at all."],
              `from oop_ml import PositionalEncoding

for base in (10000, 100, 2):
    layer = PositionalEncoding((4, 4), wavelength=base)
    # Print the base and the pattern row for position one, to five places.`,
              `from oop_ml import PositionalEncoding

for base in (10000, 100, 2):
    layer = PositionalEncoding((4, 4), wavelength=base)
    row = ", ".join(f"{value:.5f}" for value in layer.pattern[1])
    print(f"base {base}  position 1 = [{row}]")`,
              `base 10000  position 1 = [0.84147, 0.54030, 0.01000, 0.99995]
base 100  position 1 = [0.84147, 0.54030, 0.09983, 0.99500]
base 2  position 1 = [0.84147, 0.54030, 0.64964, 0.76024]`,
              { hints: ["The constructor’s wavelength keyword is the frequency base B in Part 2’s equations, and the lesson’s final paragraph says so.", "Position one is the second row of the pattern, since positions start at zero."], check: numberCheck("At a base of 2, what is the sine entry of the second pair at position one?", 0.6496, 0.0005, "The second pair’s angle is the position over the base to the power one half, so at a base of 2 and position one it is 1 over the square root of 2, about 0.7071, and the sine of that is 0.6496. At the default base the same angle is 0.01, so the base alone decides how quickly the slower pairs turn, while the first pair’s angle is the position itself at every base.") },
            ),
            exercise(
              "Tell two identical tokens apart",
              ["Part 3 reads the attention lesson’s default example, the tokens red, blue, red with projections that leave every vector unchanged, and finds the two red tokens produce the same row of shares until positions are added. Reproduce it. Look the three tokens up through an embedding whose table is the identity, build an attention layer with identity projections, and read the shares with and without the pattern added.", "Print each token’s row of shares to four places under both settings. Without positions the two red rows should be identical, and with positions they should not be."],
              `import numpy as np

from oop_ml import Embedding, MultiHeadAttention, PositionalEncoding

tokens = ["red", "blue", "red"]
vocabulary = ["red", "blue", "green"]
identifiers = np.array([[vocabulary.index(token) for token in tokens]])

inputs = Embedding(3, 4, 3).with_parameters(np.eye(3, 4)).respond_to(identifiers).outputs
layer = MultiHeadAttention(reads=(3, 4)).with_parameters(np.tile(np.eye(4), (4, 1)), np.zeros(16))
# Read the attention shares for the inputs as they are, then for the inputs
# with the positional pattern added, and print each token's row under both.`,
              `import numpy as np

from oop_ml import Embedding, MultiHeadAttention, PositionalEncoding

tokens = ["red", "blue", "red"]
vocabulary = ["red", "blue", "green"]
identifiers = np.array([[vocabulary.index(token) for token in tokens]])

inputs = Embedding(3, 4, 3).with_parameters(np.eye(3, 4)).respond_to(identifiers).outputs
layer = MultiHeadAttention(reads=(3, 4)).with_parameters(np.tile(np.eye(4), (4, 1)), np.zeros(16))
with_positions = PositionalEncoding((3, 4)).respond_to(inputs).outputs

for label, block in (("positions off", inputs), ("positions on", with_positions)):
    shares = layer.respond_to(block).attention[0][0]
    print(label)
    for position, token in enumerate(tokens):
        row = ", ".join(f"{value:.4f}" for value in shares[position])
        print(f"  {token} at {position}  [{row}]")`,
              `positions off
  red at 0  [0.3837, 0.2327, 0.3837]
  blue at 1  [0.2741, 0.4519, 0.2741]
  red at 2  [0.3837, 0.2327, 0.3837]
positions on
  red at 0  [0.3349, 0.4053, 0.2599]
  blue at 1  [0.3435, 0.4872, 0.1692]
  red at 2  [0.2013, 0.1547, 0.6440]`,
              { hints: ["The attention response carries attention as a block of (sequences, heads, from token, to token), so with one sequence and one head the rows of shares are attention[0][0].", "The positional layer reads the same (3, 4) arrangement the attention layer reads, so its outputs can go straight into respond_to.", "The projections are the identity, so nothing here is learned. Any difference between the two settings comes from the pattern alone."], check: numberCheck("With positions on, what share does the last red token give to itself?", 0.644, 0.0005, "Without positions the two red tokens are the same input, so their rows are the same, 0.3837, 0.2327 and 0.3837. Adding the pattern makes the two reds different inputs, and the one at position two now keeps 0.6440 of its row for itself while the first red keeps only 0.3349. The projections were never trained, so the position vector alone is what separated them.") },
            ),
          ],
        },
    ]} />;
}
