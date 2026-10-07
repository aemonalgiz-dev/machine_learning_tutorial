import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { choice, several, trueFalse } from "@/lib/quizzes";
import { exercise, numberCheck } from "@/lib/exercises";
import { Equation } from "@/components/concept/Equation";
import { SubSection, WorkedExample } from "@/components/concept/Treatments";
import { ModernLearningExample } from "@/components/widgets/ModernLearningExample";
import { lessonIntuitions } from "@/lib/intuition";

export const metadata: Metadata = {
  title: "Transformer Blocks · oop_ml",
  description: "Combine attention, residual connections, and local processing into one reusable component.",
};

export default function Page() {
  return <ConceptPage
      lessonId="transformer-blocks"
    title="Transformer Blocks"
    tagline="Combine attention, residual connections, and local processing into one reusable component."
    openingTitle="How Do We Build a Model Around Attention?"
    intuition={lessonIntuitions["transformer-blocks"]}
    technicalStart="Part 2. Calculating One Decoder Block"
    prerequisites={<>Useful foundations: <Link href="/concepts/attention">Attention</Link>{", "}<Link href="/concepts/positional-encoding">positional encoding</Link>{", "}<Link href="/concepts/residual-connections">residual connections</Link>{", "}<Link href="/concepts/normalisation-layers">normalization</Link>.</>}
    playgroundIntro="Change the last token from cat to dog. Follow its row through the block, then check that the earlier rows remain unchanged. Read the attention tables by row: each row says which positions that position reads."
    playground={<ModernLearningExample topic="transformer-blocks" />}
    sections={[
{ title: "Part 1. Two Jobs Inside the Block", content: <>
<SubSection title="1. Gather context, then process the result">
<p>{"Attention and the feed-forward network do different work. Attention lets each token row gather information from other positions. The feed-forward network then transforms the coordinates within each row, using the same weights at every position."}</p>
<p>{"Why both? Attention compares a row with the rows it is allowed to read and combines their value vectors in proportion to the shares it computes, which sum to one across the positions read. In the live block the row for cat reads <start>, the and itself, and the first head gives those three positions shares of 0.3988, 0.3307 and 0.2705. What the row receives is a mixture in those proportions, and a mixture can only contain what went into it. Making something new out of the gathered content is the second job. The feed-forward network widens the row into a larger intermediate one, replaces every negative intermediate value with zero, and narrows the result back to the row’s width. The zeroing gives the network a changing slope, so what it answers is not simply another weighted sum of the row it read."}</p>
<p>{"The same weights serve every position because the network’s question is the same wherever a row came from. Where a token sits is already written into its row by the position step, so the network reads the position out of the row rather than needing a separate set of weights for each place. That is also what lets one block read a longer prefix with the same parameters. The live example reads three tokens, and a fourth token would meet the same expansion and contraction matrices."}</p>
<p>{"Separate heads give attention several independently learned comparison spaces. They are not assigned grammatical roles in advance. A head might learn a useful relationship, but its role must be investigated rather than inferred from its name."}</p>

</SubSection>
<SubSection title="2. Preserve a route for the incoming representation">
<p>{"Each branch produces a contribution that is added to its input. These residual additions preserve a direct route for information and gradients. The branch can learn an adjustment without needing to recreate the entire incoming representation."}</p>
<WorkedExample title="The cat row through both additions">
<p>{"Follow the third row of the live tables at the default prompt. After the position step the row for cat reads 0.6632, -0.7264, 0.2649, 1.1782. Attention’s contribution to it, which is the difference between the second and fourth tables, is 0.1897, -0.1005, -0.1018, -0.2512, and the feed-forward contribution in the fifth table is -0.5318, -0.1214, -0.1309, 0.3195. Each addition works coordinate by coordinate, and the second coordinate shows the pattern."}</p>
<Equation>{"-0.7264 + (-0.1005) = -0.8269\n-0.8269 + (-0.1214) = -0.9483"}</Equation>
<p>{"The first sum is the second entry of the row after attention and the second sum is the second entry of the row that leaves the block, exactly as the fourth and sixth tables print them. The inputs shown are rounded to four places, so on another coordinate the last digit of a sum can differ from the table by one. Nothing in the second addition removed what the first had put there, and nothing in either removed the row the position step produced. That surviving row is the route the residual additions preserve."}</p>
</WorkedExample>
<p>{"Layer normalization standardizes coordinates within each token row. Our block normalizes before attention and before the feed-forward network. This is a pre-normalization arrangement; the original Transformer paper placed normalization after its residual additions."}</p>
<p>{"Each addition can change the scale of a row, so a branch reads a standardized copy and meets values on the same scale whatever the earlier additions did. The copy is only what the branch reads. Its contribution is added to the un-normalized row, so the direct route is never rescaled inside the block, and the row is normalized once more only before the vocabulary projection in Part 3."}</p>

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
              "It uses the same weights at every position and transforms the coordinates within each row, because its question is the same wherever a row came from and the position is already written into the row. Moving information between positions is attention’s job, not the feed-forward network’s.",
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
              "The block is H = X + Attention(LN(X)) and then Y = H + F with F computed from LN(H), so both branches read a normalized copy, and attention reading X directly contradicts the first line. Heads are several independently learned comparison spaces, and whether one learned a useful relationship has to be investigated after training rather than read off a name.",
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
<p>{"Set the last token to dog. The rows for <start> and the keep their values exactly in every table, not only to the displayed digits, because the causal mask stops those two positions reading the third one and so nothing they read has changed. The third row is the only one that moves. In the first head its shares across <start>, the and the last token go from 0.3988, 0.3307 and 0.2705 with cat to 0.1624, 0.4041 and 0.4335 with dog, and the third row of every later table follows."}</p>
</WorkedExample>
<p>{"This object implements inference with fixed seeded parameters. It does not implement whole-decoder training, cross-attention, padding masks, or a key/value cache. The attention primitive itself already supports differentiation; composing a complete training pipeline is a further step."}</p>
</SubSection>
<SubSection title="6. Distinguish the architecture from the learned behavior">
<p>{"Stacking blocks creates repeated opportunities to gather and transform information. Training determines which representations and comparisons are useful. Randomly initialized blocks have the structure of the computation but have not learned grammar, facts, or instruction following."}</p>
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
              "Causal self-attention is the restriction that makes this block a decoder, and lifting it is what an encoder can do. Adding cross-attention to another sequence is the encoder-decoder arrangement rather than what makes something an encoder.",
            ),
        ],
        },
        {
          title: "Practice. Running One Block With the Library",
          practice: [
            exercise(
              "Follow the cat row through the block",
              ["Build the lesson’s decoder, a seven-token vocabulary read with four coordinates and two heads, and run the default prompt <start> the cat through it with respond_to. The trace it answers holds the rows at every connection. Read the third row out of it after the position step, after the attention addition, in the feed-forward contribution and in the final hidden row.", "Part 1 followed the second coordinate of that row from -0.7264 to -0.8269 to -0.9483. The trace holds every coordinate, so add the feed-forward contribution to the row after attention yourself and print the largest difference from the hidden row the block answers."],
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
              { hints: ["The decoder has no fit. Constructing it draws its fixed parameters from a seed, and respond_to takes the prefix as an integer array of token ids.", "The trace is a frozen record with one array per connection, named positioned, after_attention, feed_forward and hidden. Each is three rows by four coordinates, so the cat row is index 2.", "The residual addition is hidden = after_attention + feed_forward, coordinate by coordinate, so your own sum should match to the last bit and the gap should print as zero."], check: numberCheck("What is the first coordinate of the hidden row for cat?", 0.321, 0.0005, "The row after attention starts at 0.8529 and the feed-forward contribution at -0.5318, and their sum is the first entry of the row that leaves the block, which the sixth live table prints as 0.3210. The rounded inputs sum to 0.3211; the full-precision ones to 0.3210, which is the one-digit difference Part 1 warns about.") },
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
              { hints: ["One model serves both prompts, because its parameters are fixed at construction. Only the id array changes, 2 for cat and 3 for dog.", "hidden is three rows by four coordinates, so hidden[:2] is the <start> and the rows and hidden[2] is the last one. np.abs of a difference followed by .max() is the largest gap.", "attention is shaped heads by positions by positions, so attention[0][2] is the first head’s row for the last position, one share per position it can read."], check: numberCheck("What is the largest absolute difference in the third hidden row between the cat and dog prompts?", 0.3249, 0.0005, "Only the third position can read the token that changed, so only its row moves. The first two rows agree to the last bit and print as 0.0000, which is the causal relationship Part 3 says the trace exists to check. The third row moves by up to 0.3249, a number the page does not show, and its first-head shares shift from 0.3988, 0.3307 and 0.2705 to 0.1624, 0.4041 and 0.4335, which the live tables show with the control set each way.") },
            ),
            exercise(
              "Check the shapes and count the parameters",
              ["Part 2 states the expansion matrix as (4, 8) and the contraction as (8, 4). Read the shape of every parameter array off the decoder and confirm those two, then add up how many numbers the whole model holds.", "The lesson never gives that total. The five arrays are the token embeddings, the attention projections, the two feed-forward matrices and the vocabulary projection, and the attention projections stack their output units as rows, which is why that array is taller than it is wide."],
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
              { hints: ["Every parameter array is a plain attribute of the decoder, and a numpy array answers its own shape and size.", "The attention projections are (16, 4) because four projections of four output units each are stacked as rows, with the four input coordinates as columns. Part 2 notes that the SDK stores output units as matrix rows."], check: numberCheck("How many parameters does the lesson’s decoder hold in total?", 184, 0.5, "Seven tokens by four coordinates is 28, the stacked attention projections are 16 rows of 4 for 64, the two feed-forward matrices are 32 each, and the vocabulary projection is 4 by 7 for 28 more. That total of 184 is not on the page, and it is small enough that the whole model can be inspected by eye, which is the point of a teaching decoder.") },
            ),
            exercise(
              "Ask for heads that cannot share the width",
              ["The live block has four coordinates per token and two heads, so each head works in two of the four. Ask the library for three heads over the same four coordinates and see what it does.", "A block whose heads cannot divide the width evenly cannot be built, and the refusal should come at construction, before any token is read. Catch the library’s own error and print the name of its class and its message."],
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
              { hints: ["Every refusal the library makes derives from one base class, so catching that one catches whichever specific refusal this turns out to be.", "The check is in the constructor, so there is no respond_to to call. The error names the rule it applied rather than the arithmetic that would have failed later."] },
            ),
          ],
        },
    ]}
  />;
}

