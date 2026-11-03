import { lessonIntuitions } from "@/lib/intuition";
import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { choice, several, trueFalse } from "@/lib/quizzes";
import { exercise, numberCheck } from "@/lib/exercises";
import { Equation } from "@/components/concept/Equation";
import { KeepInMind, SubSection, WorkedExample } from "@/components/concept/Treatments";
import { PositionExplorer } from "@/components/widgets/NetworkBuildingBlocks";

export const metadata: Metadata = { title: "Positional Encoding · Perceptron Lab", description: "Word order affects meaning, even when the words themselves stay the same. Positional information lets a model distinguish where tokens occur and use that order in its calculations." };

export default function PositionalEncodingPage() {
  return <ConceptPage
      lessonId="positional-encoding"
      intuition={lessonIntuitions["positional-encoding"]} title="Positional Encoding" tagline={"Word order affects meaning, even when the words themselves stay the same. Positional information lets a model distinguish where tokens occur and use that order in its calculations."}
    openingTitle="The Same Words Can Say Something Different"
    technicalStart="Part 2. Building a Position Vector"
    prerequisites={<>Read <Link href="/concepts/embedding-layers">embedding layers</Link> for token vectors and <Link href="/concepts/attention">attention</Link> for how tokens gather information from one another.</>}

    playgroundTitle="Give identical tokens different positions"

    playgroundIntro="Every row begins with the same token vector. Compare the added pattern at positions zero and one. Then change the frequency base and see which columns change more quickly across positions."
    playground={<PositionExplorer />}
    sections={[
      { title: "Part 1. Keep Content and Position Available", defaultOpen: true, content: <>
        <SubSection title="1. Add information without adding coordinates">
          <p>Compare “the dog chased the cat” with “the cat chased the dog”. They contain the same words, but the animal doing the chasing has changed. Looking up a vector for each word tells the model which word it received. That lookup alone does not tell it where the word appeared.</p>
          <p>Ordinary unmasked self-attention without positional information rearranges its outputs when we rearrange its inputs. It does not gain a new description of who came first. We therefore add information about position. A causal mask also imposes an order by limiting which positions may contribute, but it does not replace the positional representation used in this example.</p>
          <p>What is missing is a vector that depends on where a token sits and on nothing else. We make that position vector the same width as the token vector, then add corresponding entries. This keeps the shape expected by the next layer. It also means the next layer sees a mixture of content and position, and must learn to use that mixture.</p>
          <p>Adding a position vector is a design choice. A model could instead learn a table of position vectors, or encode relative positions in another way. We start with a fixed pattern because every value can be reproduced without training another table, and because a position the training data never reached still gets a vector, since the vector is a function of the position rather than an entry looked up in a table.</p>
        </SubSection>
        <WorkedExample title="The same token at three positions">
          <p>For a four-coordinate vector, the first sine-cosine pair changes faster than the second. At position zero, all the sine entries are zero and the cosine entries are one.</p>
          <Equation>{`Token vector = [1, 0, 1, 0]\nPosition 0   = [0, 1, 0, 1]\nCombined     = [1 + 0, 0 + 1, 1 + 0, 0 + 1]\n             = [1, 1, 1, 1]\n\nPosition 1 ≈ [0.8415, 0.5403, 0.0100, 0.99995]\nCombined   ≈ [1.8415, 0.5403, 1.0100, 0.99995]\n\nPosition 2 ≈ [0.9093, −0.4161, 0.0200, 0.9998]\nCombined   ≈ [1.9093, −0.4161, 1.0200, 0.9998]`}</Equation>
          <p>The repeated token still has the same content vector, but its combined rows differ because of their positions. For these two occurrences of the same token, subtracting the rows cancels the content and leaves the positional difference. With different tokens, the content difference remains too. The next layer must learn to use the mixture; we have not handed it a separate, automatically decoded distance.</p>
        </WorkedExample>
      </> },
      { title: "Part 2. Building a Position Vector", content: <>
        <SubSection title="2. Use pairs that change at different rates">
          <p>Let p be the position, starting at zero. Let d be the vector width and k identify a pair of coordinates. B controls the spread of frequencies. Each pair has its own rate, one over B raised to a power that grows with k, so the first pair turns by one radian per position and every later pair turns more slowly. With the default base used here, a width of four has two pairs.</p>
          <Equation>{`B = 10000\nangle(p, k) = p / B^(2k/d)\nPE[p, 2k]   = sin(angle(p, k))\nPE[p, 2k+1] = cos(angle(p, k))\n\nFor d = 4 at p = 1:\nFirst pair angle  = 1 / 10000^0   = 1\nSecond pair angle = 1 / 10000^0.5 = 0.01`}</Equation>
          <p>
                  {"A sine value alone cannot identify the phase of an oscillation. The sine–cosine pair records a point on its circle. Moving by a fixed offset applies the same rotation to that pair wherever the move begins. This provides a relation a model can learn to use; it does not automatically decode an arbitrary distance from a mixed token-and-position row."}
                </p>
          <p>{"The sine-cosine pairs vary at different rates, letting the position vector distinguish distances at several scales. The first pair completes a turn every 2π positions, about 6.28; the second takes a hundred times as many positions. Near position six, the fast pair is already close to where it started at position zero. The slower pair supplies additional information that the fast pair alone would nearly lose."}</p>
          <Equation>{`Position 0, first pair  = (0, 1)\nPosition 6, first pair  ≈ (−0.2794, 0.9602)\n\nPosition 0, second pair = (0, 1)\nPosition 6, second pair ≈ (0.0600, 0.9982)`}</Equation>
          <p>
                  {"The slow pair keeps position six distinct from position zero while the fast pair nearly returns to its start. For bases above one, lowering the base speeds the later pairs relative to their default rates. The playground shows that change. Finite precision and limited width still prevent a guarantee of uniquely identifying arbitrarily distant positions."}
                </p>
                <Equation>{"For B = 2, d = 4, k = 1 and p = 1:\nangle = 1 / √2 ≈ 0.7071\n(sin(angle), cos(angle)) ≈ (0.6496, 0.7602)"}</Equation>
        </SubSection>
        <SubSection title="3. Add the pattern to every sequence">
          <p>The SDK constructs the pattern once, freezes it, and broadcasts it over the batch. Position zero has the same positional vector in every sequence, because position means where a token sits inside its own sequence and not which sequence it belongs to. If the vector width is odd, the last coordinate contains a sine value without its paired cosine.</p>
          <Equation>{`output[batch, position, coordinate]\n    = input[batch, position, coordinate] + pattern[position, coordinate]`}</Equation>
          <p>The pattern has no trainable parameters. Adding a constant has derivative one with respect to the input, so the backward pass returns the arriving input gradient unchanged, and a training step leaves the layer exactly as it was.</p>
        </SubSection>
      </> },
      { title: "Part 3. Order Is Different from Permission to Look", content: <>
        <p>{"Position encoding changes the information stored in each token's row. A causal mask changes which source columns that row may use during attention. The playground exposes them separately because knowing a token's position and preventing access to future tokens are different requirements."}</p>
        <WorkedExample title="Two identical tokens, with and without positions">
          <p>Take the attention lesson&rsquo;s default example, the tokens red, blue, red with projections that leave every vector unchanged, and read the row of shares each red token produces over the three tokens.</p>
          <Equation>{`Positions off, mask off\n  first red = [0.3837, 0.2327, 0.3837]\n  last red  = [0.3837, 0.2327, 0.3837]\n\nPositions on, mask off\n  first red = [0.3349, 0.4053, 0.2599]\n  last red  = [0.2013, 0.1547, 0.6440]\n\nPositions off, mask on\n  first red = [1, 0, 0]\n  last red  = [0.3837, 0.2327, 0.3837]`}</Equation>
          <p>
                  {"With neither positions nor a causal mask, the identical red inputs produce identical attention rows in this example. Adding positions changes those rows. Applying the mask instead restricts the first red to itself, while the last red can still use every input. These results distinguish positional input from permitted attention; they do not rule out other sources of order information elsewhere in a model."}
                </p>
        </WorkedExample>
        <KeepInMind><p>Being able to calculate a position vector for a longer sequence does not guarantee that a trained model will work well at that length. Position information also does not impose grammatical understanding. It gives the model information from which useful order-dependent behavior can be learned.</p></KeepInMind>
        <p>The sinusoidal construction appears in <a href="https://arxiv.org/abs/1706.03762">Attention Is All You Need</a>. The parameter called <code>wavelength</code> in this SDK supplies the frequency base B in the equations above.</p>
      </> },
      { title: "Questions on Parts 1 to 3", quiz: [
        trueFalse(
          "At position zero the added pattern leaves the token vector unchanged.",
          false,
          "The token's identity stays the same, but the vector passed to the next layer changes. At position zero the sine entries are zero and the cosine entries are one. Adding that pattern to [1, 0, 1, 0] produces [1, 1, 1, 1]. Position zero therefore has a nonzero positional contribution.",
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
          "At a shared frequency, sine and cosine describe the phase together. A fixed position offset can be expressed as a rotation of that pair, independent of the starting position. Several frequencies provide patterns that change over different distances. Finite precision and finite width still prevent this from guaranteeing a unique representation for arbitrarily distant positions.",
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
          "For width four, the first pair uses angle one radian at position one. The second pair divides the position by the square root of the base.\n\n```math\nθ₀ = 1\nθ₁ = 1 / √10000 = 0.01\n```\n\nThe second pair therefore changes a hundred times more slowly. Lowering the base to two increases its angle at position one to about 0.7071 radians.",
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
              { hints: ["The layer reads a block of (sequences, positions, coordinates), so one sequence of four copies of the token is a block of shape (1, 4, 4), which is what np.tile builds.", "pattern is a property of the layer, one row per position, built at construction. It needs no input to exist.", "respond_to answers a response object whose outputs is the input block plus the pattern, so the first sequence of it is the four combined rows."], check: numberCheck("What is the first coordinate of the combined vector at position three?", 1.1411, 0.0005, "The token vector stays fixed while the positional contribution changes. A sine coordinate can decrease again as position increases, so one coordinate alone is not a steadily increasing position counter. The accompanying cosine and the slower pair provide the rest of this positional pattern.") , question: "How can four copies of the same token carry different positions?" },
            ),
            exercise(
              "Lower the base and watch the slow pair speed up",
              ["Compare positional patterns at frequency bases 10000, 100 and 2. For each base, build a four-position layer with vector width four and print the pattern at position one to five decimal places. This lets us change the frequency spacing while keeping the position and width fixed.", "Watch which entries change. The first pair’s angle is the position itself whatever the base, so its two entries should not move at all."],
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
              { hints: ["Pass the frequency base with the wavelength keyword. It is the B used in the positional-encoding equations.", "Position one is the second row of the pattern, since positions start at zero."], check: numberCheck("At a base of 2, what is the sine entry of the second pair at position one?", 0.6496, 0.0005, "The base controls the rate of the slower coordinate pair. Lowering it changes that pair’s angle at a given position, while the first pair keeps the same angle. Comparing the printed rows isolates this frequency choice from any learned token representation.") , question: "Which parts of the positional pattern change when we lower the frequency base?" },
            ),
            exercise(
              "Tell two identical tokens apart",
              ["Use the sequence red, blue, red from the attention lesson. Look up its vectors from an identity embedding table and build attention with identity projections. Compare attention shares for the original vectors with shares after adding positional encoding. Keep the weights fixed so positions are the only change.", "Print each token’s row of shares to four places under both settings. Without positions the two red rows should be identical, and with positions they should not be."],
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
              { hints: ["The attention response carries attention as a block of (sequences, heads, from token, to token), so with one sequence and one head the rows of shares are attention[0][0].", "The positional layer reads the same (3, 4) arrangement the attention layer reads, so its outputs can go straight into respond_to.", "The projections are the identity, so nothing here is learned. Any difference between the two settings comes from the pattern alone."], check: numberCheck("With positions on, what share does the last red token give to itself?", 0.644, 0.0005, "The repeated red tokens have identical embeddings. With fixed identity projections and no positional contribution, their query rows therefore agree. Adding different position vectors changes the queries and keys without training them, which is why their attention rows can now differ.") , question: "Can attention distinguish the two red tokens using position alone?" },
            ),
          ],
        },
    ]} />;
}
