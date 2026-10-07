import { lessonIntuitions } from "@/lib/intuition";
import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { choice, several, trueFalse } from "@/lib/quizzes";
import { exercise, numberCheck } from "@/lib/exercises";
import { Equation } from "@/components/concept/Equation";
import { KeepInMind, SubSection, WorkedExample, WhyThisWorks } from "@/components/concept/Treatments";
import { AttentionExplorer } from "@/components/widgets/NetworkBuildingBlocks";

export const metadata: Metadata = { title: "Attention · oop_ml", description: "Build attention from the need for context, then follow queries, keys, values, and learned comparisons." };

export default function AttentionPage() {
  return <ConceptPage
      intuition={lessonIntuitions["attention"]} title="Attention" tagline="Let each token gather the information it needs from the surrounding tokens."
    openingTitle="Which Words Help Us Understand This One?"
    technicalStart="Part 2. Calculating Attention"
    prerequisites={<>Start with <Link href="/concepts/embedding-layers">embedding layers</Link> for how a token gets a vector. <Link href="/concepts/dense-layers">Dense layers</Link> explain the weighted sums used to transform those vectors.</>}

    playgroundIntro="Start with one head and both checkboxes off. Compare the rows for the two red tokens, change one token, then block future tokens. Inspect the role vectors to see the numbers each head actually reads."
    playground={<AttentionExplorer />}
    sections={[
      { title: "Part 1. From Context to a Weighted Combination", defaultOpen: true, content: <>
        <SubSection title="1. Give the three roles different jobs">
          <p>A token&rsquo;s starting vector is the same wherever the token appears. In the example on this page, red begins as [1, 0, 0, 0] at the first position and again at the last. Nothing in those four numbers says that a blue token sits between them. What is missing is a way for each token to take in information from the others, in amounts the tokens themselves decide.</p>
          <p>Attention builds that from three vectors per token, and each has one job. The query belongs to the token doing the gathering. It describes what that token is looking for. The key belongs to a token that might be read. It is what a query is compared with. The value belongs to the same token as the key. It is the information that token hands over, in whatever amount the comparison decides.</p>
          <p>A token starts with an input vector. Three separate sets of weights transform it into a query, a key, and a value. Separate weights matter because the features useful for comparing two tokens need not be the same features we want to pass forward.</p>
          <p>For example, a model might learn a comparison useful for connecting a pronoun with an earlier noun. The value can then carry information from that noun. This is a possible learned use of the operation, not a role we assign to a particular head in advance.</p>
          <KeepInMind><p>The colour example sets all three sets of weights so that they leave a vector unchanged. A token&rsquo;s query, key and value are then all equal to its input vector, which lets us check every number by hand. A trained layer learns three different transformations.</p></KeepInMind>
        </SubSection>
        <SubSection title="2. Compare first, then decide the shares">
          <p>The calculation for one gathering token has four steps. We will follow the first red token through them, and the worked example below shows the arithmetic.</p>
          <p>First, compare. We use a dot product to compare a query with each key. That means multiplying corresponding entries and adding the products. The red query scores 1 against each red key and 0 against the blue key, so its row of scores is 1, 0, 1.</p>
          <p>Second, scale. Each score is divided by the square root of the vector width. The width is 4 here, so the row becomes 0.5, 0, 0.5. Part 2 explains what the division is for.</p>
          <p>Third, turn the scores into shares. A function called softmax raises e to the power of each score, then divides each result by the total for the row. Every share is therefore positive, and the row totals one. A larger score receives a larger share. A score of zero still receives a share, because e to the power of zero is 1 and not 0.</p>
          <p>Fourth, combine. The model does not have to select a single token. It can combine information from several. Each share multiplies the corresponding value vector, and we add those contributions to get the result for the querying token.</p>
        </SubSection>
        <WorkedExample title="One red token reads three colour vectors">
          <p>In the default example, the role projections leave the assigned vectors unchanged. The first red query matches both red keys equally. Its comparison with the blue key is smaller.</p>
          <Equation>{`red  = [1, 0, 0, 0]\nblue = [0, 1, 0, 0]\n\nred · red  = (1 × 1) + (0 × 0) + (0 × 0) + (0 × 0) = 1\nred · blue = (1 × 0) + (0 × 1) + (0 × 0) + (0 × 0) = 0\n\nScaled scores = [1, 0, 1] / √4 = [0.5, 0, 0.5]\nShares = [exp(0.5), exp(0), exp(0.5)] / (2 × exp(0.5) + 1)\n       ≈ [0.3837, 0.2327, 0.3837]\n\nResult ≈ (0.3837 × red) + (0.2327 × blue) + (0.3837 × red)\n       ≈ [0.7673, 0.2327, 0, 0]`}</Equation>
          <p>Both red occurrences contribute. There is no rule saying that the largest share must take everything. Displayed values are rounded; the calculation uses full precision.</p>
        </WorkedExample>
        <WorkedExample title="The blue token reads the same three vectors">
          <p>Now let the blue token gather. Its query matches its own key and neither red key, so its row of scores has a single 1, in the middle.</p>
          <Equation>{`blue · red  = 0\nblue · blue = 1\n\nScaled scores = [0, 1, 0] / √4 = [0, 0.5, 0]\nShares = [exp(0), exp(0.5), exp(0)] / (exp(0.5) + 2)\n       ≈ [0.2741, 0.4519, 0.2741]\n\nResult ≈ (0.2741 × red) + (0.4519 × blue) + (0.2741 × red)\n       ≈ [0.5481, 0.4519, 0, 0]`}</Equation>
          <p>Blue gives its largest share to itself, yet its result holds more red than blue. Each red token contributes 0.2741, and two of them outweigh blue&rsquo;s own 0.4519. The result is a combination of everything the token read. It is not a copy of the best match.</p>
        </WorkedExample>
        <KeepInMind><p>Look at what the two red tokens received. Each started as [1, 0, 0, 0] and each ends as about [0.7673, 0.2327, 0, 0]. Their vectors now record that a blue token is in the sequence, which the starting vector could not do. They are also still identical to each other, because nothing in the calculation used where a token sits. Part 3 returns to that.</p></KeepInMind>
      </> },
      { title: "Part 2. Calculating Attention", content: <>
        <SubSection title="3. Write the sequence as rows">
          <p>Part 1 followed one token at a time. A layer does the same work for every token at once, and writing the sequence as a matrix is what makes that possible. Let X contain one input vector per row, so three tokens of four numbers each give three rows and four columns. Q, K, and V hold the projected queries, keys, and values, one row per token. The SDK stores one output unit per row of each weight matrix, so its projections use the transposes shown below.</p>
          <Equation>{`Q = X W_Qᵀ + b_Q\nK = X W_Kᵀ + b_K\nV = X W_Vᵀ + b_V\n\nScores = Q Kᵀ / √d_k\nA = softmax(Scores), applied separately to each row\nContext = A V`}</Equation>
          <p>Read the six lines in order. The first three build a query, a key and a value for every token. The product Q Kᵀ takes the dot product of every query with every key, so Scores has one row per gathering token and one column per token being read. Softmax turns each row into shares. The product A V then combines the value rows using those shares, which gives one result row per token.</p>
          <WorkedExample title="The colour example as whole matrices">
            <p>The example&rsquo;s projections leave every vector unchanged, so Q, K and V all equal X. The two worked examples from Part 1 are the first two rows of each matrix below. The third row repeats the first because the third token is red again.</p>
            <Equation>{`X = Q = K = V =\n  [1, 0, 0, 0]   red\n  [0, 1, 0, 0]   blue\n  [1, 0, 0, 0]   red\n\nQ Kᵀ =\n  [1, 0, 1]\n  [0, 1, 0]\n  [1, 0, 1]\n\nScores = Q Kᵀ / √4 =\n  [0.5, 0,   0.5]\n  [0,   0.5, 0  ]\n  [0.5, 0,   0.5]\n\nA ≈\n  [0.3837, 0.2327, 0.3837]\n  [0.2741, 0.4519, 0.2741]\n  [0.3837, 0.2327, 0.3837]\n\nContext = A V ≈\n  [0.7673, 0.2327, 0, 0]\n  [0.5481, 0.4519, 0, 0]\n  [0.7673, 0.2327, 0, 0]`}</Equation>
            <p>Each row of A totals one, because softmax was applied to that row by itself. A column is under no such rule. The middle column totals about 0.9173, which is how much of the blue value the three results hold between them.</p>
          </WorkedExample>
          <p>The head width is denoted by d_k. Dividing by its square root controls the growth in dot-product variance as the width increases, under the usual assumption of roughly independent, centered coordinates with unit variance. It does not normalize every possible input distribution.</p>
          <p>The division matters because softmax responds to the size of the scores as well as their order. Larger gaps between scores push the shares further apart. A dot product over more coordinates adds more products, so without the division a wider head would tend to produce larger scores and more one-sided rows of shares for no reason other than its width. The two-head example in the next section shows the same comparison divided by a different width.</p>
        </SubSection>
        <SubSection title="4. Keep several combinations separate">
          <p>One row of shares can express one way of reading the sequence. A token may need more than one. It might need to find the noun a pronoun refers to and, separately, the verb that governs it, and a single row of shares has to trade one off against the other.</p>
          <p>One head produces one weighted combination per token. Multiple heads calculate separate combinations in smaller vector spaces. Their results are placed side by side, then an output projection mixes their coordinates.</p>
          <Equation>{`head_i = softmax(Q_i K_iᵀ / √d_k) V_i\nOutput = concatenate(head_1, …, head_h) W_Oᵀ + b_O`}</Equation>
          <p>Each head has its own queries, keys and values, so each head has its own table of shares. The total width is divided among the heads. With a width of four, one head compares in four coordinates and two heads compare in two coordinates each.</p>
          <WorkedExample title="The same three tokens with two heads">
            <p>Set the head count to two and keep the tokens as red, blue, red. The first head reads the first two coordinates of every vector, and the second head reads the last two.</p>
            <Equation>{`First head sees:    red = [1, 0]    blue = [0, 1]\nSecond head sees:   red = [0, 0]    blue = [0, 0]\n\nFirst head, red row:\n  Scaled scores = [1, 0, 1] / √2 ≈ [0.7071, 0, 0.7071]\n  Shares ≈ [0.4011, 0.1978, 0.4011]\n\nSecond head, red row:\n  Scaled scores = [0, 0, 0]\n  Shares = [1/3, 1/3, 1/3]\n\nOutput for red ≈ [0.8022, 0.1978, 0, 0]`}</Equation>
            <p>The two heads reached different rows of shares from the same tokens. The first head still tells red from blue. Its shares are further apart than the one-head row of 0.3837, 0.2327, 0.3837, because the same scores were divided by √2 and not by √4. The second head sees nothing that separates the tokens, so it reads all three equally. Its values are all zero in this example, so its equal shares add nothing, and the output keeps the first head&rsquo;s result in its first two coordinates.</p>
          </WorkedExample>
          <p>Changing the head count in this example changes which coordinates share a comparison. Real models learn the projections; the example keeps identity projections so the effect of splitting the coordinates is visible.</p>
        </SubSection>
        <WhyThisWorks title="How the gradient passes through softmax">
          <p>Increasing one share necessarily changes the others because the row must still total one. If G is the arriving derivative with respect to the shares, the derivative with respect to the scaled scores is:</p>
          <Equation>{`dScores = A ⊙ (G − sum(G ⊙ A, over the row))`}</Equation>
          <p>The symbol ⊙ multiplies matching entries. The sum inside the bracket is the average of G over the row, weighted by the shares, so the bracket measures how far each share&rsquo;s derivative sits above or below that average. If every entry of G in a row is the same number, the bracket is zero and nothing passes back to that row&rsquo;s scores. No change to the scores can raise every share together when the row must total one.</p>
          <p>The NumPy backward pass then differentiates both sides of the query-key comparison, the value combination, and all four projections. Numerical gradient tests check the weights, biases, and inputs with one or several heads and with both masking settings.</p>
        </WhyThisWorks>
      </> },
      { title: "Questions on Parts 1 and 2", quiz: [
        trueFalse(
          "The query, key and value projections could share one set of weights without changing what the layer can learn.",
          false,
          "Separate weights matter because the features useful for comparing two tokens need not be the features we want to pass forward. A comparison that connects a pronoun with an earlier noun is not itself the information the value then carries from that noun.",
        ),
        choice(
          "In the worked example the first red query meets two red keys and one blue key. What comes out?",
          [
            "The nearer red value whole, since the largest share takes everything",
            "Both red occurrences contributing about 0.3837 each, with blue still contributing about 0.2327",
            "Three equal shares, since softmax spreads a row evenly",
            "Nothing from blue, since its unscaled comparison with red is zero",
          ],
          1,
          "Softmax turns the row of scores into positive numbers that total one, so a comparison of zero still receives a positive share. There is no rule saying the largest share must take everything, and the model is free to combine information from several tokens rather than selecting one.",
        ),
        choice(
          "Why are the dot products divided by the square root of the head width?",
          [
            "To keep each share between zero and one",
            "To make the shares in a row total one",
            "To control the growth in dot-product variance as the width increases",
            "To normalize whatever distribution the inputs happen to have",
          ],
          2,
          "Softmax is what bounds the shares and makes a row total one, so neither of those needs the scaling. The scaling rests on the usual assumption of roughly independent, centered coordinates with unit variance, and it does not normalize every possible input distribution.",
        ),
        trueFalse(
          "With two heads in the colour example, each head compares in two coordinates and the two heads reach different rows of shares for the red token.",
          true,
          "The width of four is divided among the heads, so each compares in a smaller space. The first head reads the two coordinates where red and blue differ and gives red about 0.4011, 0.1978, 0.4011. The second head reads two coordinates that are zero for both colours, so every score is zero and every share is one third. Their results are placed side by side before an output projection mixes them.",
        ),
        choice(
          "The blue token gives its largest share, about 0.4519, to itself. What does its result hold?",
          [
            "More red than blue, about 0.5481 against 0.4519, because the two red shares of 0.2741 add",
            "Only blue, since the token with the largest share supplies the result",
            "Equal amounts of red and blue, since softmax evens a row out",
            "More blue than red, since blue received the largest single share",
          ],
          0,
          "Each share multiplies its value vector and the contributions are added, so two smaller shares for the same colour count together. The result is a combination of everything the token read and not a copy of its best match. That is why the row is a set of shares and not a choice.",
        ),
      ] },
      { title: "Part 3. Order, Causality, and the Larger Network", content: <>
        <SubSection title="5. Prevent a token from reading the future">
          <p>When training a next-token predictor, a position must not see the tokens it is meant to help predict. A causal mask excludes later positions. It sets their scores to negative infinity before softmax, which gives them zero contribution while keeping the allowed shares normalized.</p>
          <p>This example allows each position to read itself. The first position therefore reads only itself when the mask is enabled. Padding masks are a separate concern and are not implemented by this layer.</p>
          <p>The mask has to act on the scores and not on the finished shares. If we set a share to zero after softmax, the shares left in that row would total less than one, and the result would be a shrunken combination. Removing the score first means softmax divides by the total of the allowed entries only, so the allowed shares fill the whole row.</p>
          <WorkedExample title="Blocking the future in the colour example">
            <p>Tick Block future tokens with the tokens at red, blue, red. A blocked score is written −∞ below, and e raised to that power is zero.</p>
            <Equation>{`Scaled scores with the mask =\n  [0.5, −∞,  −∞ ]\n  [0,   0.5, −∞ ]\n  [0.5, 0,   0.5]\n\nA ≈\n  [1,      0,      0     ]\n  [0.3775, 0.6225, 0     ]\n  [0.3837, 0.2327, 0.3837]\n\nContext ≈\n  [1,      0,      0, 0]\n  [0.3775, 0.6225, 0, 0]\n  [0.7673, 0.2327, 0, 0]`}</Equation>
            <p>The first token may read only itself, so its one allowed share is 1 and its result is its own vector. The blue token has lost the red that follows it. Its two remaining shares still total one, which raises its share for itself from 0.4519 to 0.6225. The last token has no future to block, so its row is the one Part 1 calculated.</p>
            <p>The two red tokens now receive different results, [1, 0, 0, 0] and about [0.7673, 0.2327, 0, 0]. The mask did not tell either token where it sits. It changed what each one was allowed to read.</p>
          </WorkedExample>
        </SubSection>
        <SubSection title="6. Attention is one component of a transformer">
          <p>Go back to the example with the mask off. The two red tokens received the same row of shares and the same result. That follows from the calculation and not from the choice of tokens. A score depends only on the two vectors being compared, and the result is a sum, which keeps no record of the order of its terms.</p>
          <p>We can check by moving the tokens. Set them to blue, red, red, and each token gets the result it had before. Blue still receives about [0.5481, 0.4519, 0, 0] and each red still receives about [0.7673, 0.2327, 0, 0]. The results moved with their tokens and nothing else changed, so the layer gives a token the same result wherever in the sequence it is placed.</p>
          <p>Unmasked attention by itself does not encode sequence order. <Link href="/concepts/positional-encoding">Positional encoding</Link> supplies that information. <Link href="/concepts/residual-connections">Residual connections</Link>, normalization, and feed-forward transformations help build a larger network around attention.</p>
          <p>The example can show the first of those. Tick Add positional encoding, and a different pattern of four numbers is added to the vector at each position before attention reads it. The two red tokens then enter as [1, 1, 0, 1] and about [1.9093, −0.4161, 0.02, 0.9998], which are no longer the same vector. Their rows of shares differ as well, about [0.3349, 0.4053, 0.2599] for the first and [0.2013, 0.1547, 0.6440] for the last.</p>
          <p>Those rows are harder to read than the colour-only ones, and that is worth noticing. The projections in this example leave vectors unchanged, so the dot product compares the position numbers and the colour numbers together. A trained layer learns projections that decide how much of each kind of information a comparison uses.</p>
          <p>The cost of the layer is set by the table of shares. Every token is compared with every token, so three tokens need nine shares per head and six tokens need thirty-six. Doubling the sequence multiplies the table by four.</p>
          <KeepInMind><p>This layer implements self-attention, where queries, keys, and values come from the same sequence. Its explicit attention matrix grows quadratically with sequence length. The <Link href="/concepts/transformer-blocks">transformer-block lesson</Link> now combines it with normalization, residual connections, and a feed-forward network in a small decoder forward pass. That example does not implement cross-attention or full language-model training.</p></KeepInMind>
          <p>The scaled dot-product and multi-head construction is described in <a href="https://arxiv.org/abs/1706.03762">Attention Is All You Need</a>. Attention shares show how values were combined in a layer; they do not, on their own, establish why a complete model made a decision.</p>
        </SubSection>
      </> },
      { title: "Questions on Part 3", quiz: [
        choice(
          "How does the causal mask stop a position reading the tokens it is meant to help predict?",
          [
            "It zeroes the later shares once softmax has produced them",
            "It sets the later scores to negative infinity before softmax",
            "It removes the later tokens from the sequence for that position",
            "It reverses the sequence so later tokens are seen first",
          ],
          1,
          "Driving a score to negative infinity before softmax gives that position zero contribution while the allowed shares are still normalized among themselves. Zeroing shares afterwards would leave the row totalling less than one, which is a different operation.",
        ),
        trueFalse(
          "With the mask enabled in this example, the first position gives itself a share of 1.",
          true,
          "This example allows each position to read itself, and the first position has nothing earlier to read, so its row of shares is 1, 0, 0 and its result is its own vector. Whether a position may attend to itself is a choice the mask makes, not a consequence of causality.",
        ),
        several(
          "Blocking future tokens in the red, blue, red example changes which of these?",
          [
            "The blue token’s share for itself, which rises from about 0.4519 to 0.6225",
            "The first red token’s result, which becomes its own vector [1, 0, 0, 0]",
            "The last red token’s row of shares",
            "The total of each row of shares, which falls below one",
          ],
          [0, 1],
          "The blue token loses the red that follows it, and its two remaining shares are calculated from the allowed scores only, so they still total one and its share for itself rises. The first token may read only itself. The last token has no future to block, so its row stays at about 0.3837, 0.2327, 0.3837. Every row still totals one, which is the reason the mask acts on the scores and not on the finished shares.",
        ),
        several(
          "Which of these does this layer leave to something else?",
          [
            "Encoding where each token sits in the sequence",
            "Padding masks",
            "Turning a row of comparisons into shares that total one",
            "Attending from one sequence to a different sequence",
          ],
          [0, 1, 3],
          "Unmasked attention by itself does not encode sequence order, and positional encoding supplies that. Padding masks are a separate concern this layer does not implement, and the layer implements self-attention, where queries, keys and values come from the same sequence. The softmax is the one item on the list that happens inside it.",
        ),
        trueFalse(
          "Reading off the attention shares establishes why the complete model made the decision it made.",
          false,
          "The shares show how values were combined in one layer, which is a narrower claim. A complete model stacks that layer with normalization, residual connections and feed-forward transformations, so a single layer’s shares do not on their own account for the decision at the end.",
        ),
      ] },
        {
          title: "Practice. Running the Colour Example With the Library",
          practice: [
            exercise(
              "Reproduce the three colour tokens",
              ["The starter builds the inputs of the page’s example, red, blue, red, and a layer of one head whose projections leave every vector unchanged. Pass the inputs through the layer with respond_to.", "Print the table of shares, one row per reading token, and then the result for each token, all to four places. Find the two rows Part 1 worked by hand."],
              `import numpy as np
from oop_ml import Embedding, MultiHeadAttention

colours = ["red", "blue", "green"]
tokens = ["red", "blue", "red"]

# One row of four numbers per token: red is [1, 0, 0, 0], blue is [0, 1, 0, 0].
identifiers = np.array([[colours.index(token) for token in tokens]])
inputs = Embedding(3, 4, len(tokens)).with_parameters(np.eye(3, 4)).respond_to(identifiers).outputs

# Four identity matrices, for the query, key, value and output projections, and no biases.
identities = np.tile(np.eye(4), (4, 1))
layer = MultiHeadAttention(reads=(len(tokens), 4), n_heads=1, looks_ahead=True)
layer = layer.with_parameters(identities, np.zeros(16))

# Pass the inputs through the layer.

# Print each token beside its row of response.attention[0][0], to four places.

# Print each token beside its row of response.outputs[0], to four places.`,
              `import numpy as np
from oop_ml import Embedding, MultiHeadAttention

colours = ["red", "blue", "green"]
tokens = ["red", "blue", "red"]

# One row of four numbers per token: red is [1, 0, 0, 0], blue is [0, 1, 0, 0].
identifiers = np.array([[colours.index(token) for token in tokens]])
inputs = Embedding(3, 4, len(tokens)).with_parameters(np.eye(3, 4)).respond_to(identifiers).outputs

# Four identity matrices, for the query, key, value and output projections, and no biases.
identities = np.tile(np.eye(4), (4, 1))
layer = MultiHeadAttention(reads=(len(tokens), 4), n_heads=1, looks_ahead=True)
layer = layer.with_parameters(identities, np.zeros(16))

response = layer.respond_to(inputs)

print("shares")
for token, row in zip(tokens, response.attention[0][0]):
    print(f"  {token:5s}", "  ".join(f"{share:.4f}" for share in row))
print("results")
for token, row in zip(tokens, response.outputs[0]):
    print(f"  {token:5s}", "  ".join(f"{value:.4f}" for value in row))`,
              `shares
  red   0.3837  0.2327  0.3837
  blue  0.2741  0.4519  0.2741
  red   0.3837  0.2327  0.3837
results
  red   0.7673  0.2327  0.0000  0.0000
  blue  0.5481  0.4519  0.0000  0.0000
  red   0.7673  0.2327  0.0000  0.0000`,
              { hints: ["layer.respond_to(inputs) answers a response. Its attention holds the shares and its outputs holds the results.", "Both carry a leading axis for the sequences in the batch, and attention carries a second one for the head, so the table for this one sequence and one head is response.attention[0][0].", "zip(tokens, table) pairs each token with its row, and an f-string with :.4f prints a number to four places."], check: numberCheck("How much red does the blue token’s result hold, to four places?", 0.5481, 5e-05, "Blue gives each red token a share of 0.2741 and itself 0.4519. The two red shares multiply the same value vector, so they add, and the result holds more red than blue although blue received the largest single share.") },
            ),
            exercise(
              "Block the future and read the rows that changed",
              ["Part 3 says the mask removes later positions before softmax, so the shares that remain still total one. Build the same layer with looks_ahead=False and pass the same three tokens through it.", "Print the table of shares to four places and the total of each row. Compare each row with the table from the first problem."],
              `import numpy as np
from oop_ml import Embedding, MultiHeadAttention

colours = ["red", "blue", "green"]
tokens = ["red", "blue", "red"]

# One row of four numbers per token: red is [1, 0, 0, 0], blue is [0, 1, 0, 0].
identifiers = np.array([[colours.index(token) for token in tokens]])
inputs = Embedding(3, 4, len(tokens)).with_parameters(np.eye(3, 4)).respond_to(identifiers).outputs

# Four identity matrices, for the query, key, value and output projections, and no biases.
identities = np.tile(np.eye(4), (4, 1))

# Build the layer as in the first problem, with looks_ahead=False,
# and give it the same identity parameters.

# Pass the inputs through it.

# Print each token beside its row of shares and the row's total, to four places.`,
              `import numpy as np
from oop_ml import Embedding, MultiHeadAttention

colours = ["red", "blue", "green"]
tokens = ["red", "blue", "red"]

# One row of four numbers per token: red is [1, 0, 0, 0], blue is [0, 1, 0, 0].
identifiers = np.array([[colours.index(token) for token in tokens]])
inputs = Embedding(3, 4, len(tokens)).with_parameters(np.eye(3, 4)).respond_to(identifiers).outputs

# Four identity matrices, for the query, key, value and output projections, and no biases.
identities = np.tile(np.eye(4), (4, 1))

layer = MultiHeadAttention(reads=(len(tokens), 4), n_heads=1, looks_ahead=False)
layer = layer.with_parameters(identities, np.zeros(16))

response = layer.respond_to(inputs)

for token, row in zip(tokens, response.attention[0][0]):
    shares = "  ".join(f"{share:.4f}" for share in row)
    print(f"{token:5s} {shares}   total {row.sum():.4f}")`,
              `red   1.0000  0.0000  0.0000   total 1.0000
blue  0.3775  0.6225  0.0000   total 1.0000
red   0.3837  0.2327  0.3837   total 1.0000`,
              { hints: ["looks_ahead is the field that says whether a position may read later ones. False is the causal mask.", "with_parameters answers a new layer, so keep what it returns.", "Each row of response.attention[0][0] is an array, and row.sum() is its total."], check: numberCheck("With the future blocked, what share does the blue token give itself, to four places?", 0.6225, 5e-05, "Blue may read the first red token and itself, with scaled scores of 0 and 0.5. Softmax divides by the total of those two allowed entries only, so the share that was 0.4519 among three becomes 0.6225 between two, and the row still totals one.") },
            ),
            exercise(
              "Give the second head something to read",
              ["In Part 2 the second head saw only zeros, because red and blue live in the first two coordinates. Green is [0, 0, 1, 0], which the second head can see. Pass red, green, red through a layer of two heads.", "Print each head’s table of shares and then the results, to four places. The lesson quotes none of these numbers for a sequence holding green."],
              `import numpy as np
from oop_ml import Embedding, MultiHeadAttention

colours = ["red", "blue", "green"]
tokens = ["red", "green", "red"]

# One row of four numbers per token: red is [1, 0, 0, 0], blue is [0, 1, 0, 0].
identifiers = np.array([[colours.index(token) for token in tokens]])
inputs = Embedding(3, 4, len(tokens)).with_parameters(np.eye(3, 4)).respond_to(identifiers).outputs

# Four identity matrices, for the query, key, value and output projections, and no biases.
identities = np.tile(np.eye(4), (4, 1))

# Build a layer of two heads with the identity parameters, looking ahead.

# Pass the inputs through it.

# For each of the two heads, print its table of shares, response.attention[0][head].

# Print each token beside its result.`,
              `import numpy as np
from oop_ml import Embedding, MultiHeadAttention

colours = ["red", "blue", "green"]
tokens = ["red", "green", "red"]

# One row of four numbers per token: red is [1, 0, 0, 0], blue is [0, 1, 0, 0].
identifiers = np.array([[colours.index(token) for token in tokens]])
inputs = Embedding(3, 4, len(tokens)).with_parameters(np.eye(3, 4)).respond_to(identifiers).outputs

# Four identity matrices, for the query, key, value and output projections, and no biases.
identities = np.tile(np.eye(4), (4, 1))

layer = MultiHeadAttention(reads=(len(tokens), 4), n_heads=2, looks_ahead=True)
layer = layer.with_parameters(identities, np.zeros(16))

response = layer.respond_to(inputs)

for head in range(2):
    print(f"head {head + 1}, reading {layer.head_size} coordinates")
    for token, row in zip(tokens, response.attention[0][head]):
        print(f"  {token:5s}", "  ".join(f"{share:.4f}" for share in row))
print("results")
for token, row in zip(tokens, response.outputs[0]):
    print(f"  {token:5s}", "  ".join(f"{value:.4f}" for value in row))`,
              `head 1, reading 2 coordinates
  red   0.4011  0.1978  0.4011
  green 0.3333  0.3333  0.3333
  red   0.4011  0.1978  0.4011
head 2, reading 2 coordinates
  red   0.3333  0.3333  0.3333
  green 0.2483  0.5035  0.2483
  red   0.3333  0.3333  0.3333
results
  red   0.8022  0.0000  0.3333  0.0000
  green 0.6667  0.0000  0.5035  0.0000
  red   0.8022  0.0000  0.3333  0.0000`,
              { hints: ["n_heads=2 splits the width of four into two heads of two coordinates each, and layer.head_size reports the width of one head.", "response.attention[0] now holds two tables, one per head, so loop over range(2)."], check: numberCheck("In the second head, what share does the green token give itself, to four places?", 0.5035, 5e-05, "The second head reads the last two coordinates, where green is [1, 0] and red is [0, 0]. Green scores 1 against itself and 0 against each red, and the score is divided by √2 because the head is two wide, which gives 0.5035 for itself and 0.2483 for each red. The first head cannot tell green from nothing, so green reads all three tokens equally there.") },
            ),
          ],
        },
    ]} />;
}
