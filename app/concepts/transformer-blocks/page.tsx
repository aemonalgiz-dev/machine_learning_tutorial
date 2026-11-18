import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { choice, several, trueFalse } from "@/lib/quizzes";
import { exercise, numberCheck } from "@/lib/exercises";
import { Equation } from "@/components/concept/Equation";
import { SubSection, WorkedExample } from "@/components/concept/Treatments";
import { ModernLearningExample } from "@/components/widgets/ModernLearningExample";
import { lessonIntuitions } from "@/lib/intuition";

export const metadata: Metadata = pageMetadata("/concepts/transformer-blocks", {
  title: "Transformer Blocks · Perceptron Lab",
  description: "A transformer block combines attention with processing applied to individual positions. Residual connections and normalization regulate how those operations change the representations passed between blocks.",
});

export default function Page() {
  return <ConceptPage
      lessonId="transformer-blocks"
    title="Transformer Blocks"
    tagline={"A transformer block combines attention with processing applied to individual positions. Residual connections and normalization regulate how those operations change the representations passed between blocks."}
    openingTitle="How Do We Build a Model Around Attention?"
    intuition={lessonIntuitions["transformer-blocks"]}
    technicalStart="Part 2. Calculating One Decoder Block"
    prerequisites={<>Useful foundations: <Link href="/concepts/attention">Attention</Link>{", "}<Link href="/concepts/positional-encoding">positional encoding</Link>{", "}<Link href="/concepts/residual-connections">residual connections</Link>{", "}<Link href="/concepts/normalisation-layers">normalization</Link>.</>}
    playgroundTitle="Follow token information through one transformer block"
    playgroundIntro="Change the last token from cat to dog. Follow its row through the block, then check that the earlier rows remain unchanged. Read the attention tables by row: each row says which positions that position reads."
    playground={<ModernLearningExample topic="transformer-blocks" />}
    sections={[
{ title: "Part 1. Two Jobs Inside the Block", content: <>
<SubSection title="1. Gather context, then process the result">
<p>{"After attention, the row for cat contains information gathered from the available positions. We still need to calculate with the coordinates inside that row. A small neural network does that at each position, using the same weights for every row. It is called the feed-forward network because values pass through its layers in order without feeding an output back into an earlier step. Attention moves information between positions; this network processes the mixture at one position."}</p>
<p>Let&apos;s follow the row for cat. It can read the start token, the word the, and itself. Attention decides how much information to take from each available position. Keep the shares beside the value vectors they multiply.</p>
<Equation>{"Available position     Share from the first head\n<start>                0.3988\nthe                    0.3307\ncat                    0.2705\n\nGathered row ≈ 0.3988 × value(<start>)\n             + 0.3307 × value(the)\n             + 0.2705 × value(cat)"}</Equation>
<p>Attention has mixed information from the available positions into this row. What should we calculate from that mixture? The feed-forward network transforms the row&apos;s coordinates before the next block uses them.</p>
<ol className="list-decimal space-y-3 pl-5"><li>A learned projection makes a wider intermediate row. Each entry can combine several coordinates from the input.</li><li>In this example, ReLU replaces negative intermediate entries with zero. Which entries survive depends on the row.</li><li>Another learned projection combines the surviving entries into a row with the original width.</li></ol>
<p>The input-dependent activation matters. Without it, the two projections could be combined into one affine transformation. With it, changing the input can change which intermediate contributions reach the output.</p>
<p>
                  {"The feed-forward weights are shared across positions. Each token row uses the same expansion, activation and contraction, while its values carry the content and positional information available there. Training can learn to use those differences. Sharing parameters avoids a separate network for each location and allows the same row operation at another sequence length."}
                </p>
<p>{"Separate heads give attention several independently learned comparison spaces. They are not assigned grammatical roles in advance. A head might learn a useful relationship, but its role must be investigated rather than inferred from its name."}</p>

</SubSection>
<SubSection title="2. Preserve a route for the incoming representation">
<p>{"Each branch produces a contribution that is added to its input. These residual additions preserve a direct route for information and gradients. The branch can learn an adjustment without needing to recreate the entire incoming representation."}</p>
<WorkedExample title="The cat row through both additions">
<p>{"Follow the third row of the live tables at the default prompt. It belongs to cat. The positioned row and the two contributions are shown separately below. Attention's contribution is the change between the second and fourth tables; the fifth table supplies the feed-forward contribution."}</p>
<Equation>{"Positioned cat row:        [ 0.6632, -0.7264,  0.2649,  1.1782]\nAttention contribution:    [ 0.1897, -0.1005, -0.1018, -0.2512]\nFeed-forward contribution: [-0.5318, -0.1214, -0.1309,  0.3195]"}</Equation>
<p>Each addition works coordinate by coordinate. Follow the second coordinate through both:</p>
<Equation>{"-0.7264 + (-0.1005) = -0.8269\n-0.8269 + (-0.1214) = -0.9483"}</Equation>
<p>{"The first sum is the second entry after attention; the second is the entry leaving the block. The inputs shown are rounded to four places, so another coordinate's final digit can differ from the table by one. The residual route means the incoming row is added directly to each branch's contribution. It does not guarantee that every piece of information survives: a contribution can oppose or cancel a value already present. The direct addition is what distinguishes this arrangement from replacing the entire row with the branch output."}</p>
</WorkedExample>
<p>{"Layer normalization standardizes coordinates within each token row. Our block normalizes before attention and before the feed-forward network. This is a pre-normalization arrangement; the original Transformer paper placed normalization after its residual additions."}</p>
<p>
                  {"Residual additions can change a row’s scale. In this pre-normalization block, each branch reads a normalized copy, while the shortcut bypasses that normalization and adds the branch contribution to the original row. The resulting row can still have a different scale. Part3 applies a final normalization before vocabulary projection."}
                </p>

</SubSection>

</> },
{ title: "Part 2. Calculating One Decoder Block", content: <>
<SubSection title="3. Write the connections in their execution order">
<p>{"Let X contain the positioned token rows. LN means layer normalization, applied independently to each row. Attention is causal self-attention: each query can read its own position and earlier positions. The first addition produces H."}</p>
<Equation>{"H = X + Attention(LN(X))\n\nF = ReLU(LN(H) W₁ + b₁) W₂ + b₂\nY = H + F"}</Equation>
<p>{"The first feed-forward matrix expands the row into a wider intermediate representation. ReLU replaces negative intermediate values with zero. The second matrix returns to the model width so its contribution can be added to H. This implementation uses zero biases."}</p>
<p>{"The SDK's attention projections store output units as matrix rows. The two feed-forward matrices shown here use input coordinates as rows, so they multiply on the right without a transpose. Their shapes, rather than their letters, determine the multiplication."}</p>
</SubSection>
<SubSection title="4. Check the dimensions before adding">
<p>{"The live block uses four coordinates per token, two attention heads, and eight intermediate feed-forward coordinates. For one token row, the transformations have these shapes:"}</p>
<Equation>{"Input row:           (1, 4)\nExpansion W₁:        (4, 8)\nIntermediate row:   (1, 8)\nContraction W₂:     (8, 4)\nBranch output:      (1, 4)\nResidual output:    (1, 4)"}</Equation>
<p>{"The final row can enter another block with the same model width. A vocabulary projection after the final block turns these hidden coordinates into next-token scores."}</p>
</SubSection>

</> },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            trueFalse(
              "The feed-forward network uses a different set of weights at each position in the sequence.",
              false,
              "The position-wise feed-forward network uses the same weights for every token row. It transforms the coordinates within that row; attention is the part that combines information from different positions. Sharing weights is an architectural choice, not a consequence of positional encoding being present.",
            ),
            trueFalse(
              "Because each branch’s contribution is added to its input, the branch can learn an adjustment rather than recreating the whole incoming representation.",
              true,
              "The addition leaves the incoming row in place alongside the contribution, which is the direct route the residual arrangement preserves for information and for gradients. In the live tables the second coordinate of the cat row goes from -0.7264 to -0.8269 after attention and to -0.9483 after the feed-forward network, each step adding to what was there rather than replacing it.",
            ),
            choice(
              "Where does this block apply layer normalization?",
              [
                "Before attention and before the feed-forward network",
                "After each residual addition",
                "Once, at the end of the block",
                "Inside the feed-forward network, between the two matrices",
              ],
              0,
              "This is the pre-normalization arrangement, and the lesson states it as a choice rather than the only option. Normalizing after each residual addition is what the original Transformer paper did, so that option describes a different block, not this one. Here each branch reads a standardized copy and its contribution is added to the un-normalized row, so the direct route is never rescaled inside the block.",
            ),
            several(
              "Which of these hold for the block as Parts 1 and 2 write it?",
              [
                "The feed-forward branch reads LN(H), the normalized copy of the row after the attention addition",
                "ReLU replaces every negative intermediate value with zero",
                "The attention branch reads X directly, without normalization",
                "Each attention head is assigned a grammatical role before training",
              ],
              [0, 1],
              "Each branch reads a normalized copy, while its output is added to the state before that normalization.\n\n```math\nH = X + Attention(LN(X))\nF = FFN(LN(H))\nY = H + F\n```\n\nAttention therefore does not read raw X in this arrangement. The heads have separate learned projections, but useful relationships must be established by training and evaluation rather than assigned by a head's name.",
            ),
            choice(
              "The live block uses four coordinates per token and eight intermediate feed-forward coordinates. What shape is the contraction matrix W₂?",
              ["(4, 8)", "(8, 4)", "(4, 4)", "(1, 8)"],
              1,
              "The expansion W₁ is (4, 8) and widens the row to eight intermediate coordinates, so the contraction has to take those eight back to the model width of four. Only then is the branch output (1, 4) and able to be added to H.",
            ),
        ],
        },
{ title: "Part 3. From a Block to a Language Model", content: <>
<SubSection title="5. Follow a NumPy forward pass">
<p>{"The reference decoder combines embeddings, sinusoidal positions, one pre-normalized block, final row normalization, and a vocabulary projection. It exposes its intermediate arrays so the causal relationship can be checked."}</p>
<pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm leading-relaxed text-slate-100"><code>{"import numpy as np\nfrom oop_ml.numpy.modern import CausalLanguageModel\n\nmodel = CausalLanguageModel(n_vocab=7, n_model=4, n_heads=2)\ntrace = model.respond_to(np.array([0, 1, 2]))\nprint(trace.attention)\nprint(trace.logits)"}</code></pre>
<WorkedExample title="The check the live tables let you make">
<p>{"Set the last token to dog. The earlier rows for <start> and the remain unchanged in this example because the causal mask prevents them from reading the third position. The third row changes. In the first head, its weights move from [0.3988, 0.3307, 0.2705] for cat to [0.1624, 0.4041, 0.4335] for dog. Follow that row through the later tables to see how the changed context representation propagates."}</p>
</WorkedExample>
<p>{"This object implements inference with fixed seeded parameters. It does not implement whole-decoder training, cross-attention, padding masks, or a key/value cache. The attention primitive itself already supports differentiation; composing a complete training pipeline is a further step."}</p>
</SubSection>
<SubSection title="6. Distinguish the architecture from the learned behavior">
<p>{"Stacking blocks repeats two kinds of work: gathering information across positions and transforming the resulting coordinates at each position. Training determines which comparisons and features help the task. Random parameters let us inspect this structure, but the resulting outputs have not learned grammar, facts or instruction following."}</p>
<p>{"A decoder-only language model is one transformer arrangement. Encoders can use unmasked attention, and encoder-decoder models add cross-attention to another sequence. The causal decoder here is the arrangement we need for the next lessons."}</p>

</SubSection>
<p>{"The original paper introduces the attention-based encoder-decoder architecture. Our one-block causal example uses the pre-normalization variant described above."}{" "}<a href="https://arxiv.org/abs/1706.03762">Attention Is All You Need</a>.</p>
<p>Continue with <Link href="/concepts/next-token-prediction">Next-Token Prediction</Link>.</p>
</> },
        {
          title: "Questions on Part 3",
          quiz: [
            several(
              "Which of these does the reference decoder leave unimplemented?",
              [
                "Whole-decoder training",
                "Inference with fixed seeded parameters",
                "Exposing its intermediate arrays",
                "A key/value cache",
              ],
              [0, 3],
              "Inference with fixed seeded parameters is what the object implements, and exposing the intermediate arrays is what lets the causal relationship be checked. Training, cross-attention, padding masks and a key/value cache are named as absent. The attention primitive supports differentiation, but composing a whole training pipeline is a further step.",
            ),
            trueFalse(
              "A stack of randomly initialized blocks has the structure of the computation, so it can already follow instructions.",
              false,
              "The structure and the learned behavior are separate things. Stacking blocks creates repeated opportunities to gather and transform information, and training is what determines which representations and comparisons turn out to be useful.",
            ),
            trueFalse(
              "If the last token changes from cat to dog, the rows for <start> and the leave the block unchanged.",
              true,
              "Causal self-attention lets a position read only itself and earlier positions, so nothing those two rows read has changed and they keep their values exactly in every table. The third row is the only one that moves, and its first-head shares go from 0.3988, 0.3307 and 0.2705 to 0.1624, 0.4041 and 0.4335.",
            ),
            choice(
              "What distinguishes an encoder arrangement from the causal decoder built here?",
              [
                "Its attention can be unmasked, so a position is not restricted to itself and earlier positions",
                "It has no feed-forward network",
                "It adds cross-attention to another sequence",
                "It has no residual additions",
              ],
              0,
              "The encoder arrangement discussed here allows attention to use positions on both sides of a token. This decoder uses a causal mask so each position reads only itself and earlier positions. Cross-attention to an encoder's outputs is an additional feature of an encoder-decoder model; it is not required by this decoder-only example.",
            ),
        ],
        },
        {
          title: "Practice. Running One Block With the Library",
          practice: [
            exercise(
              "Follow the cat row through the block",
              ["Run <start> the cat through the supplied decoder. It uses a seven-token vocabulary, four coordinates per token and two attention heads. Read the trace arrays for the third token, cat: positioned, after_attention, feed_forward and hidden. Print each four-coordinate row.", "Add cat's feed_forward contribution to its after_attention row yourself. Compare the full-precision sum with its hidden row and print the largest absolute difference. Also print the first hidden coordinate to four decimal places."],
              `import numpy as np
from oop_ml import CausalLanguageModel

np.set_printoptions(precision=4, suppress=True)
VOCABULARY = ["<start>", "the", "cat", "dog", "sat", "slept", "<end>"]
model = CausalLanguageModel(len(VOCABULARY))
trace = model.respond_to(np.array([0, 1, 2]))
row = 2
# Print the third row of positioned, after_attention, feed_forward and
# hidden. Then add feed_forward to after_attention yourself and print
# the largest absolute difference from hidden, and the first
# coordinate of the hidden row, both to four places.
`,
              `import numpy as np
from oop_ml import CausalLanguageModel

np.set_printoptions(precision=4, suppress=True)
VOCABULARY = ["<start>", "the", "cat", "dog", "sat", "slept", "<end>"]
model = CausalLanguageModel(len(VOCABULARY))
trace = model.respond_to(np.array([0, 1, 2]))
row = 2

print("after the position step ", trace.positioned[row])
print("after attention         ", trace.after_attention[row])
print("feed-forward contribution", trace.feed_forward[row])
print("hidden                  ", trace.hidden[row])

own_sum = trace.after_attention[row] + trace.feed_forward[row]
gap = float(np.abs(own_sum - trace.hidden[row]).max())
print(f"largest gap between my sum and hidden {gap:.4f}")
print(f"first hidden coordinate {trace.hidden[row][0]:.4f}")
`,
              `after the position step  [ 0.6632 -0.7264  0.2649  1.1782]
after attention          [ 0.8529 -0.8269  0.1632  0.9271]
feed-forward contribution [-0.5318 -0.1214 -0.1309  0.3195]
hidden                   [ 0.321  -0.9483  0.0323  1.2465]
largest gap between my sum and hidden 0.0000
first hidden coordinate 0.3210`,
              { hints: ["The decoder has no fit. Constructing it draws its fixed parameters from a seed, and respond_to takes the prefix as an integer array of token ids.", "The trace is a frozen record with one array per connection, named positioned, after_attention, feed_forward and hidden. Each is three rows by four coordinates, so the cat row is index 2.", "The residual addition is hidden = after_attention + feed_forward, coordinate by coordinate, so your own sum should match to the last bit and the gap should print as zero."], check: numberCheck("What is the first coordinate of the hidden row for cat?", 0.321, 0.0005, "The outgoing hidden row combines the state after attention with the feed-forward contribution, coordinate by coordinate. Use full-precision arrays for this check. Adding values rounded for display can differ in the last printed digit even when the underlying residual calculation agrees.") , question: "Where does cat’s outgoing row come from inside the block?" },
            ),
            exercise(
              "Change the last token and measure what moved",
              ["Run <start> the cat and <start> the dog through the same decoder and compare the two traces’ hidden rows position by position.", "Part 3 says the causal mask keeps the first two positions from reading the third, so their rows should agree exactly and only the last row should move. Print the largest absolute difference in the first two rows and in the third, and the first head’s shares for the last position under both prompts."],
              `import numpy as np
from oop_ml import CausalLanguageModel

np.set_printoptions(precision=4, suppress=True)
VOCABULARY = ["<start>", "the", "cat", "dog", "sat", "slept", "<end>"]
model = CausalLanguageModel(len(VOCABULARY))
cat = model.respond_to(np.array([0, 1, 2]))
dog = model.respond_to(np.array([0, 1, 3]))
# Print the largest absolute difference between the two hidden arrays
# over the first two rows, then over the third row, to four places.
# Then print the first head's attention shares for the last position
# from each trace.
`,
              `import numpy as np
from oop_ml import CausalLanguageModel

np.set_printoptions(precision=4, suppress=True)
VOCABULARY = ["<start>", "the", "cat", "dog", "sat", "slept", "<end>"]
model = CausalLanguageModel(len(VOCABULARY))
cat = model.respond_to(np.array([0, 1, 2]))
dog = model.respond_to(np.array([0, 1, 3]))

first_two = float(np.abs(cat.hidden[:2] - dog.hidden[:2]).max())
third = float(np.abs(cat.hidden[2] - dog.hidden[2]).max())
print(f"largest gap in the first two hidden rows {first_two:.4f}")
print(f"largest gap in the third hidden row {third:.4f}")
print("head 1 shares for the last position, cat", cat.attention[0][2])
print("head 1 shares for the last position, dog", dog.attention[0][2])
`,
              `largest gap in the first two hidden rows 0.0000
largest gap in the third hidden row 0.3249
head 1 shares for the last position, cat [0.3988 0.3307 0.2705]
head 1 shares for the last position, dog [0.1624 0.4041 0.4335]`,
              { hints: ["One model serves both prompts, because its parameters are fixed at construction. Only the id array changes, 2 for cat and 3 for dog.", "hidden is three rows by four coordinates, so hidden[:2] is the <start> and the rows and hidden[2] is the last one. np.abs of a difference followed by .max() is the largest gap.", "attention is shaped heads by positions by positions, so attention[0][2] is the first head’s row for the last position, one share per position it can read."], check: numberCheck("What is the largest absolute difference in the third hidden row between the cat and dog prompts?", 0.3249, 0.0005, "Only the final input token changes. Earlier rows cannot attend to that later position, so they remain unchanged in this comparison. The last row reads a different token and forms different attention shares. That makes this a useful check of the supplied decoder’s causal boundary.") , question: "Which positions can notice that cat was replaced by dog?" },
            ),
            exercise(
              "Check the shapes and count the parameters",
              ["Inspect the shapes and sizes of the five parameter arrays supplied in arrays. Confirm that expansion maps four coordinates to eight and contraction maps eight back to four. Print each array's name, shape and size, then the total number of stored scalar parameters.", "Count stored parameters rather than intermediate token activations. The attention array stacks four projection matrices with output units as rows; the feed-forward arrays use the row-vector multiplication shapes shown in the lesson."],
              `from oop_ml import CausalLanguageModel

model = CausalLanguageModel(7, n_model=4, n_heads=2)
arrays = {
    "embeddings": model.embeddings,
    "attention projections": model.projections,
    "expansion": model.expand,
    "contraction": model.contract,
    "vocabulary projection": model.output,
}
# Print each array's name, shape and size, and then the total size
# across all five.
`,
              `from oop_ml import CausalLanguageModel

model = CausalLanguageModel(7, n_model=4, n_heads=2)
arrays = {
    "embeddings": model.embeddings,
    "attention projections": model.projections,
    "expansion": model.expand,
    "contraction": model.contract,
    "vocabulary projection": model.output,
}
total = 0
for name, array in arrays.items():
    print(f"{name:22s} shape {array.shape} holds {array.size}")
    total += array.size
print(f"total parameters {total}")
`,
              `embeddings             shape (7, 4) holds 28
attention projections  shape (16, 4) holds 64
expansion              shape (4, 8) holds 32
contraction            shape (8, 4) holds 32
vocabulary projection  shape (4, 7) holds 28
total parameters 184`,
              { hints: ["Every parameter array is a plain attribute of the decoder, and a numpy array answers its own shape and size.", "The attention projections are (16, 4) because four projections of four output units each are stacked as rows, with the four input coordinates as columns. Part 2 notes that the SDK stores output units as matrix rows."], check: numberCheck("How many parameters does the lesson’s decoder hold in total?", 184, 0.5, "Count entries in the stored embedding table, the stacked attention projections, both feed-forward matrices and the vocabulary projection. Hidden activations are intermediate results and do not belong in this parameter total. This count describes this teaching decoder’s arrays, not every transformer architecture.") , question: "Which parameter arrays does this small decoder actually store?" },
            ),
            exercise(
              "Ask for heads that cannot share the width",
              ["The live block has four coordinates per token and two heads, so each head works in two of the four. Ask the library for three heads over the same four coordinates and see what it does.", "This SDK requires the model width to divide evenly among its configured heads. The four-coordinate, three-head request should fail at construction, before a token is read. Catch the library’s error and print its class name and message."],
              `from oop_ml import CausalLanguageModel, MLLibError

# Try to build a decoder with n_model=4 and n_heads=3. Catch the
# library's own error, and print the name of its class and its message.
`,
              `from oop_ml import CausalLanguageModel, MLLibError

try:
    CausalLanguageModel(7, n_model=4, n_heads=3)
except MLLibError as refusal:
    print(type(refusal).__name__)
    print(refusal)
`,
              `ShapeMismatchError
head count must divide model width`,
              { hints: ["The check is in the constructor, so there is no respond_to to call. The error names the rule it applied rather than the arithmetic that would have failed later."] , question: "Can three attention heads divide a four-coordinate model width?" },
            ),
          ],
        },
    ]}
  />;
}

