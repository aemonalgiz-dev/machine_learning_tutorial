import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { choice, several, trueFalse } from "@/lib/quizzes";
import { exercise, numberCheck } from "@/lib/exercises";
import { Equation } from "@/components/concept/Equation";
import { KeepInMind, NumberTable, SubSection } from "@/components/concept/Treatments";
import { ModernLearningExample } from "@/components/widgets/ModernLearningExample";
import { lessonIntuitions } from "@/lib/intuition";

export const metadata: Metadata = {
  title: "Supervised Fine-Tuning · oop_ml",
  description: "Use prompt-response examples to adapt the behavior of an already trained model.",
};

export default function Page() {
  return <ConceptPage
      lessonId="supervised-fine-tuning"
    title="Supervised Fine-Tuning"
    tagline="Use prompt-response examples to adapt the behavior of an already trained model."
    openingTitle="How Do We Teach a Text Predictor to Respond the Way We Need?"
    intuition={lessonIntuitions["supervised-fine-tuning"]}
    technicalStart="Part 2. Calculate Response-Only Loss"
    prerequisites={<>Useful foundations: <Link href="/concepts/next-token-prediction">Next-token prediction</Link>{", "}<Link href="/concepts/backpropagation">backpropagation</Link>.</>}
    playgroundIntro="Compare response-only scoring with scoring all targets. The prompt stays available in both cases. Inspect which target derivatives become zero when prompt predictions are excluded from the loss."
    playground={<ModernLearningExample topic="supervised-fine-tuning" />}
    sections={[
{ title: "Part 1. Define the Behavior Before Training", content: <>
<SubSection title="1. Start with a pretrained model and target responses">
<p>{"A pretrained language model has learned one thing, which is to continue text. Nothing in that training says a question should be followed by its answer, or that an answer should stop when it is complete. A question followed by another question is also a plausible continuation. What the model is missing is a demonstration of the continuation we want."}</p>
<p>{"Supervised fine-tuning continues training from existing parameters using examples selected for a task or behavior. A prompt-response pair might demonstrate answering a question, extracting fields, summarizing a passage, or following a required output format."}</p>
<p>{"The target response is labeled data: it specifies what the model should be encouraged to produce. More examples are not automatically better if their responses conflict, contain errors, or fail to represent the intended use."}</p>
<p>{"This page follows one pair all the way through. The prompt is a start token and two words, and the response is one word and an end token."}</p>
<Equation>{"Prompt:    <start>  the  cat\nResponse:  sat  <end>"}</Equation>
<p>{"Small as it is, the pair demonstrates two behaviors. The first is which word should follow the prompt. The second is that the response then stops. The end token is part of the target, so a model that produces sat and carries on has not reproduced the demonstrated response."}</p>
<p>{"That is why the behavior has to be defined before training and not discovered afterward. Training pulls the model toward whatever the responses contain, and it cannot tell an intended pattern from an accidental one. If some responses end with the end token and others trail off, both are being taught. If two responses answer the same kind of prompt in different formats, the model is pulled toward each in turn. Deciding what a good response looks like, including its format and where it stops, is the part of fine-tuning that happens before any gradient is computed. The collection of pairs is where that decision is written down."}</p>

</SubSection>
<SubSection title="2. Keep the prompt visible while scoring the response">
<p>{"The prompt needs to remain available because it tells the model what response is appropriate. The causal attention mask prevents a response position from reading future response tokens. A separate loss mask decides which next-token predictions contribute to the training objective."}</p>
<p>{"Response-only loss excludes prompt-token predictions while including the assistant response targets. Some training setups score additional positions; this is an explicit objective choice rather than a universal requirement. The checkbox exposes that choice."}</p>
<p>{"The two masks are easy to confuse, because both are rows of zeros and ones laid over the same sequence. They answer different questions."}</p>
<NumberTable headings={["Mask", "The question it answers", "In the pair above"]} rows={[["Causal attention mask", "What may this position read?", "itself and everything before it"], ["Loss mask", "Is this prediction graded?", "only the predictions of sat and <end>"]]} caption="Neither mask does the other’s job. Changing the loss mask leaves what every position reads exactly as it was." />
<p>{"Why leave the prompt predictions ungraded? In use, the prompt is written by someone else and handed to the model. The model is never asked to produce it. Grading the predictions of the two prompt words, the and cat, would spend part of every update on teaching the model to guess the wording of prompts, which is not the behavior being defined. The response predictions are the ones the model will have to make by itself, so those are the ones this objective grades."}</p>
<p>{"The prompt still does its work either way. The prediction of sat is made by a position that has read the whole prompt, and the prediction of the end token is made by a position that has read the prompt and sat. Removing the prompt would leave those predictions with nothing to respond to."}</p>

</SubSection>

</> },
{ title: "Part 2. Calculate Response-Only Loss", content: <>
<SubSection title="3. Align the mask with targets, not input positions">
<p>{"The toy prompt ends at cat, and the target response is sat followed by an end token. Remember that a next-token target is shifted one position beyond its input. The output at the cat position predicts the first response token."}</p>
<Equation>{"Input positions:   <start>  the  cat  sat\nTarget positions:  the      cat  sat  <end>\nLoss mask:         0        0    1    1"}</Equation>
<p>{"A prompt token can therefore appear at an input position whose output is scored. Masking every output merely because its input token belongs to the prompt would wrongly exclude the first response prediction."}</p>
<p>{"Laying the four predictions out one per row makes the alignment easier to see. Each row is one position. It reads the prefix on the left and is asked for the target beside it."}</p>
<NumberTable headings={["Prefix the position has read", "Target it predicts", "The target belongs to", "Scored"]} rows={[["<start>", "the", "the prompt", "no"], ["<start> the", "cat", "the prompt", "no"], ["<start> the cat", "sat", "the response", "yes"], ["<start> the cat sat", "<end>", "the response", "yes"]]} caption="The four next-token predictions of the toy pair. The mask follows the third column." />
<p>{"The row that predicts sat is the one that goes wrong. Its input token, cat, is a prompt token, and its target, sat, is a response token. A mask built from the input row would mark that position as prompt and switch it off."}</p>
<Equation>{"Mask by input token (wrong):   0  0  0  1\nMask by target token (right):  0  0  1  1"}</Equation>
<p>{"The wrong mask keeps only the prediction of the end token. The prediction it throws away is the decision about how the response begins, which is the first thing a fine-tuned model has to get right."}</p>
</SubSection>
<SubSection title="4. Average over the included targets">
<p>{"Let m indicate whether a target is scored, and p give the probability assigned to that target. Divide by the number of included positions, not the full sequence length."}</p>
<Equation>{"L = −Σₜ [mₜ log pₜ(yₜ)] / Σₜ mₜ\n\nFor this response-only mask:\nL = [−log p(sat | <start> the cat)\n     −log p(<end> | <start> the cat sat)] / 2"}</Equation>
<p>{"The live example fills in the numbers. Its vocabulary has seven tokens. At every position it assigns the target a logit of 1 and each of the other six tokens a logit of zero, which is where its slider starts. Softmax turns those seven logits into probabilities, and the token loss is the negative logarithm of the target’s share."}</p>
<Equation>{"p(target) = e¹ / (e¹ + 6) ≈ 0.312\nToken loss = −log(0.312) ≈ 1.165\n\nResponse-only mean = (1.165 + 1.165) / 2 ≈ 1.165\nAll-targets mean   = (1.165 + 1.165 + 1.165 + 1.165) / 4 ≈ 1.165"}</Equation>
<p>{"The two means agree, and that is a property of this example and not of the mask. Every target was assigned the same score, so every token loss is the same and any mean of them is 1.165. The denominator still matters. Dividing the two included losses by the sequence length of four would report a different number."}</p>
<Equation>{"(1.165 + 1.165) / 4 ≈ 0.583"}</Equation>
<p>{"That is half the true mean, and it would shrink again with every token added to the prompt, although the response had not changed. Dividing by the count of included targets keeps the loss a statement about the response alone."}</p>
<p>{"Where the mask does show is in the derivatives, which are what training acts on. The derivative of the mean loss with respect to a scored target’s own logit is its probability minus one, divided by the number of included targets. For an excluded target it is zero."}</p>
<Equation>{"Response-only:  (0.312 − 1) / 2 ≈ −0.344\nAll targets:    (0.312 − 1) / 4 ≈ −0.172"}</Equation>
<NumberTable headings={["Target", "Token loss", "Derivative, response only", "Derivative, all targets"]} rows={[["the", "1.165", "0", "−0.172"], ["cat", "1.165", "0", "−0.172"], ["sat", "1.165", "−0.344", "−0.172"], ["<end>", "1.165", "−0.344", "−0.172"]]} caption="The derivative of the mean loss with respect to each target’s own logit, at an assigned target logit of 1. The two derivative columns are the two settings of the live example’s checkbox." />
<p>{"A negative derivative says that raising the logit lowers the loss, so descent raises it. Under response-only scoring the two response targets are each pulled twice as hard as under all-targets scoring, because the same mean is now shared between two positions and not four. The two prompt targets are not pulled at all. The whole update goes toward the response."}</p>
<p>{"The derivative with respect to an excluded position’s output logits is zero. This does not mean prompt embeddings or earlier hidden states receive no gradient: scored response positions can depend on them through attention and other shared computation."}</p>
<p>{"The example uses assigned logits and calculates the objective only. Updating a real model requires backpropagating this loss to the selected parameters, followed by optimizer steps."}</p>
</SubSection>

</> },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            trueFalse(
              "Under response-only loss the prompt still enters the model, and the position that predicts sat has read all of it.",
              true,
              "The loss mask decides which predictions are graded and changes nothing about what a position may read, which is the causal attention mask’s job. The prediction of sat is made after reading the start token, the and cat. Dropping the prompt would leave that prediction with nothing to respond to.",
            ),
            choice(
              "The toy prompt ends at cat and the loss mask over the four target positions is 0 0 1 1. Which input position is the first whose output is scored?",
              [
                "The cat position, whose output predicts the first response token",
                "The sat position, since sat is the first response token",
                "The start position, since scoring begins at the beginning of the sequence",
                "None of them, because every input position up to cat belongs to the prompt",
              ],
              0,
              "A next-token target sits one position beyond its input, so a prompt token can appear at an input position whose output is scored. Masking every output merely because its input token belongs to the prompt would wrongly exclude the first response prediction, which is the alignment this section exists to fix.",
            ),
            choice(
              "At an assigned logit of 1 every target has a probability of about 0.312. Under the response-only mask, what is the derivative of the mean loss at the sat target’s own logit?",
              [
                "About −0.344, which is 0.312 minus one, divided by the two included targets",
                "About −0.172, which is 0.312 minus one, divided by the four positions",
                "About −0.688, which is 0.312 minus one with no division",
                "Zero, because the position that predicts sat reads a prompt token",
              ],
              0,
              "The objective is a mean over the targets the mask included, so the denominator is two. Dividing by the full sequence length gives −0.172, which is the derivative when all four targets are scored, and it would also report a loss of 0.583 where the response-only mean is 1.165. The sat prediction is scored because the mask follows the target row, and sat is a response token.",
            ),
            trueFalse(
              "The derivative with respect to an excluded position’s output logits is zero, so the prompt embeddings receive no gradient at all.",
              false,
              "The claim about the output logits holds, and the conclusion drawn from it does not follow. Scored response positions can depend on the prompt embeddings and on earlier hidden states through attention and other shared computation, so gradient still reaches them by that route. What the mask zeroes is the contribution from the excluded position’s own output logits.",
            ),
            trueFalse(
              "Gathering more prompt-response pairs reliably improves a fine-tuned model.",
              false,
              "More examples are not automatically better if their responses conflict, contain errors, or fail to represent the intended use. Training pulls the model toward whatever the responses contain and cannot tell an intended pattern from an accidental one, so the errors are taught along with everything else.",
            ),
        ],
        },
{ title: "Part 3. Adapt Without Confusing the Different Routes", content: <>
<SubSection title="5. Reproduce the target mask in NumPy">
<p>{"The SDK accepts one boolean per target row and rejects an all-excluded batch because its mean would have no denominator."}</p>
<pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm leading-relaxed text-slate-100"><code>{"import numpy as np\nfrom oop_ml.numpy.modern import TokenCrossEntropy\n\nlogits = np.zeros((4, 7))\ntargets = np.array([1, 2, 4, 6])\nscored = np.array([False, False, True, True])\nresult = TokenCrossEntropy().measure(logits, targets, scored)\nprint(result.value)\nprint(result.gradient)"}</code></pre>
<p>{"All 28 logits in that snippet are zero, so every position spreads its probability evenly over the seven tokens. Both things it prints can be worked out before running it."}</p>
<Equation>{"p(target) = 1 / 7 ≈ 0.143\nLoss = −log(1 / 7) = log 7 ≈ 1.946\n\nDerivative at a scored target   = ((1 / 7) − 1) / 2 ≈ −0.429\nDerivative at each other token  = (1 / 7) / 2 ≈ 0.071"}</Equation>
<p>{"The printed gradient has one row for each of the four positions and one column for each of the seven tokens. The rows for the two prompt targets are all zero. In each of the two response rows the target’s entry is −0.429 and the other six entries are 0.071, so the row sums to zero. Read as an instruction to an optimizer, a response row says to raise the target’s logit and lower the other six by the same total amount. A prompt row says nothing."}</p>
<p>{"Real training also needs an unambiguous chat or completion format, boundary tokens, padding handling, held-out examples, and an optimizer. These define the concrete learning task around the objective."}</p>
</SubSection>
<SubSection title="6. Separate fine-tuning, prompting, and retrieval">
<p>{"Fine-tuning changes parameters. Prompting supplies instructions or demonstrations as input for the current response. Retrieval supplies selected source passages as additional input. These approaches can be combined, but they modify different parts of the system."}</p>
<NumberTable headings={["Route", "What it changes", "How long the change lasts"]} rows={[["Fine-tuning", "the model’s parameters", "every later request"], ["Prompting", "the input, by adding instructions or demonstrations", "the current response"], ["Retrieval", "the input, by adding selected source passages", "the current response"]]} caption="Three ways to change what a model produces. Only fine-tuning leaves the model itself different afterward." />
<p>{"The toy behavior shows how the routes differ. A prompt could ask for one more word and then a stop, and it would have to ask again on every request. Fine-tuning trains on pairs like the one above until the model does that without being asked, which costs a training run and removes the instruction from every later prompt. Retrieval does not fit this behavior at all, because a habit of formatting is not a fact that some source passage states. It suits answers that live in documents."}</p>
<p>{"Supervised fine-tuning imitates demonstrated target responses. Preference training uses comparisons or feedback about outputs and introduces a different training objective. A few demonstrations of good behavior do not guarantee that behavior on unfamiliar inputs."}</p>
<p>{"Imitation has a blind spot, and the loss in Part 2 shows where it is. Every term asks how much probability the model gave the one demonstrated token. A different response that would have served the reader equally well earns no credit, because it is not the response in the pair. Preference training exists for the cases where it is easier to say which of two outputs is better than to write the single best one."}</p>
<p>{"Evaluate both the target task and capabilities the original model should retain. Repeated training on a narrow dataset can overfit or weaken other behavior. Full-parameter updates are one option; the next lesson describes a smaller trainable update."}</p>
<KeepInMind>
<p>{"Nothing on this page was trained. The example assigns logits and computes the objective and its derivatives, which is the part of fine-tuning that can be checked by hand. A real model’s logits all come from shared parameters, so pulling on the response targets also moves everything else those parameters produce. That is the reason to evaluate capabilities the examples never mention."}</p>
</KeepInMind>

</SubSection>
<p>{"The InstructGPT paper uses supervised demonstrations as one training stage before preference-based stages. This lesson isolates supervised fine-tuning."}{" "}<a href="https://arxiv.org/abs/2203.02155">Training Language Models to Follow Instructions with Human Feedback</a>.</p>
<p>Continue with <Link href="/concepts/low-rank-adaptation">Low-Rank Adaptation</Link>.</p>
</> },
        {
          title: "Questions on Part 3",
          quiz: [
            choice(
              "Why does the SDK reject a batch in which every target row is excluded?",
              [
                "Its mean would have no denominator",
                "The causal mask would be left undefined",
                "The targets would no longer be shifted one position",
                "The gradient would be unbounded",
              ],
              0,
              "The objective divides by the number of included positions, and with nothing included that count is zero. Rejecting the batch is the honest answer, since there is no loss to report rather than a loss of zero.",
            ),
            choice(
              "Of fine-tuning, prompting and retrieval, which change the model’s parameters?",
              [
                "Fine-tuning only",
                "Fine-tuning and prompting",
                "Fine-tuning and retrieval",
                "All three",
              ],
              0,
              "Prompting supplies instructions or demonstrations as input for the current response, and retrieval supplies selected source passages as additional input, so both act on what the model reads rather than on what it holds. The three can be combined, but they modify different parts of the system.",
            ),
            several(
              "Which of these does the lesson say a real training run needs around the objective?",
              [
                "An unambiguous chat or completion format with boundary tokens",
                "Padding handling",
                "Held-out examples and an optimizer",
                "A preference comparison attached to every demonstration",
              ],
              [0, 1, 2],
              "The example assigns logits and calculates the objective only, so everything that turns it into a concrete learning task is still outside it. Preference training is a separate stage with a different objective, built on comparisons or feedback about outputs rather than on demonstrated targets, and supervised fine-tuning does not require it.",
            ),
            trueFalse(
              "With every logit at zero over the seven-token vocabulary, the snippet in step 5 reports a loss of about 1.946, which is log 7.",
              true,
              "Equal logits give every token a probability of one seventh, so every token loss is −log(1 / 7), and a mean of equal losses is that same number whichever targets the mask includes. The mask shows in the gradient instead. The two prompt rows are all zero, and each response row holds −0.429 at its target and 0.071 at each of the other six tokens.",
            ),
            trueFalse(
              "Evaluating the target task alone is enough, since that is what the demonstrations describe.",
              false,
              "Capabilities the original model should retain have to be evaluated too. Repeated training on a narrow dataset can overfit or weaken other behavior, and a few demonstrations of good behavior do not guarantee that behavior on unfamiliar inputs.",
            ),
        ],
        },
        {
          title: "Practice. Calculate the Masked Loss With the Library",
          practice: [
            exercise(
              "Score the toy pair with and without the mask",
              ["Part 2 worked the live example at its starting setting, a logit of 1 on each target and zero on the other six tokens. Build those logits, measure the loss once with the response-only mask and once with every target scored, and print both means to four places.", "Then print, for each of the four targets, the derivative at its own logit under both settings. The page arrived at −0.344 and −0.172 for the response targets, and zero for the prompt targets under the mask."],
              `import numpy as np
from oop_ml.numpy.modern import TokenCrossEntropy

vocabulary = ["<start>", "the", "cat", "dog", "sat", "slept", "<end>"]
targets = np.array([1, 2, 4, 6])
rows = np.arange(4)
logits = np.zeros((4, 7))
logits[rows, targets] = 1.0
response_only = np.array([False, False, True, True])
# Measure the loss with the response-only mask, and again with no mask.
# Print the two means to four places. Then, for each target, print its
# derivative at its own logit under both settings, to four places.`,
              `import numpy as np
from oop_ml.numpy.modern import TokenCrossEntropy

vocabulary = ["<start>", "the", "cat", "dog", "sat", "slept", "<end>"]
targets = np.array([1, 2, 4, 6])
rows = np.arange(4)
logits = np.zeros((4, 7))
logits[rows, targets] = 1.0
response_only = np.array([False, False, True, True])

masked = TokenCrossEntropy().measure(logits, targets, response_only)
everything = TokenCrossEntropy().measure(logits, targets)
print(f"response-only mean {masked.value:.4f}")
print(f"all-targets mean {everything.value:.4f}")

for row, target in zip(rows, targets):
    print(
        f"{vocabulary[target]:6s} response only {masked.gradient[row, target] + 0.0:+.4f}  "
        f"all targets {everything.gradient[row, target]:+.4f}"
    )`,
              `response-only mean 1.1654
all-targets mean 1.1654
the    response only +0.0000  all targets -0.1721
cat    response only +0.0000  all targets -0.1721
sat    response only -0.3441  all targets -0.1721
<end>  response only -0.3441  all targets -0.1721`,
              { hints: ["measure takes the logits, the target ids and, as an optional third argument, one boolean per row saying whether that row is scored. Leave the third argument out to score every row.", "The answer carries value, which is the mean over the scored rows, and gradient, which has the same shape as the logits.", "The derivative at a target’s own logit is the gradient entry in that target’s row and that target’s column, so gradient[row, target].", "A masked entry is a negative number multiplied by zero, which Python prints with a minus sign in front of the zero. Adding 0.0 to the entry before formatting prints it as a plain zero."], check: numberCheck("What derivative does the sat target’s own logit receive under the response-only mask?", -0.3441, 0.0005, "Each target has a probability of about 0.312, and the derivative at a scored target’s logit is that probability minus one, divided by the number of scored targets. The mask scores two, so the figure is −0.688 halved. With all four scored the same quantity is divided by four and comes to −0.172, and the two prompt targets under the mask get zero. The two means are both 1.1654 only because every target was given the same logit.") },
            ),
            exercise(
              "Build the mask from the input row and see what it drops",
              ["Part 2 warned against masking a prediction because its input token belongs to the prompt. The input tokens are the start token, the, cat and sat, and only sat is a response token, so that mask scores the last row alone. Measure the same logits under it.", "Print the mean and each target’s derivative at its own logit to four places. Look at what happened to sat, and at how hard the end token is now pulled. Neither figure is on the page."],
              `import numpy as np
from oop_ml.numpy.modern import TokenCrossEntropy

vocabulary = ["<start>", "the", "cat", "dog", "sat", "slept", "<end>"]
targets = np.array([1, 2, 4, 6])
rows = np.arange(4)
logits = np.zeros((4, 7))
logits[rows, targets] = 1.0
# Build the mask that scores only the last row, which is what masking by
# the input token gives. Measure the loss under it, then print the mean
# and each target's derivative at its own logit, to four places.`,
              `import numpy as np
from oop_ml.numpy.modern import TokenCrossEntropy

vocabulary = ["<start>", "the", "cat", "dog", "sat", "slept", "<end>"]
targets = np.array([1, 2, 4, 6])
rows = np.arange(4)
logits = np.zeros((4, 7))
logits[rows, targets] = 1.0

by_input_token = np.array([False, False, False, True])
result = TokenCrossEntropy().measure(logits, targets, by_input_token)
print(f"mean under the wrong mask {result.value:.4f}")
for row, target in zip(rows, targets):
    print(f"{vocabulary[target]:6s} derivative {result.gradient[row, target] + 0.0:+.4f}")`,
              `mean under the wrong mask 1.1654
the    derivative +0.0000
cat    derivative +0.0000
sat    derivative +0.0000
<end>  derivative -0.6882`,
              { hints: ["The mask is one boolean per row, in the order of the targets. Scoring only the last row is three False values and then True.", "Read the derivatives the same way as in the first problem, with gradient[row, target], and add 0.0 before formatting so that a masked zero prints without a minus sign."], check: numberCheck("What derivative does the end token’s own logit receive under the wrong mask?", -0.6882, 0.0005, "Only one target is scored, so its probability minus one, about −0.688, is divided by one and the whole update lands on the end token. The sat target’s derivative is zero, so nothing teaches the model how the response begins. The mean is still 1.1654, which is why this mistake does not show in the loss. It shows in what the model is trained to do.") },
            ),
            exercise(
              "Give the prompt targets an easy time",
              ["On the page every target had the same logit, so the two means could not differ. Give the two prompt targets a logit of 4 and the two response targets a logit of 1, as if the model predicted the prompt well and the response poorly. Measure with every target scored and with the response-only mask.", "Print each target’s token loss and the two means, all to four places. The response is the same in both measurements. See which mean says so."],
              `import numpy as np
from oop_ml.numpy.modern import TokenCrossEntropy

vocabulary = ["<start>", "the", "cat", "dog", "sat", "slept", "<end>"]
targets = np.array([1, 2, 4, 6])
rows = np.arange(4)
logits = np.zeros((4, 7))
logits[rows, targets] = [4.0, 4.0, 1.0, 1.0]
response_only = np.array([False, False, True, True])
# Measure with every target scored and with the response-only mask.
# Print each target's token loss, then the two means, to four places.`,
              `import numpy as np
from oop_ml.numpy.modern import TokenCrossEntropy

vocabulary = ["<start>", "the", "cat", "dog", "sat", "slept", "<end>"]
targets = np.array([1, 2, 4, 6])
rows = np.arange(4)
logits = np.zeros((4, 7))
logits[rows, targets] = [4.0, 4.0, 1.0, 1.0]
response_only = np.array([False, False, True, True])

everything = TokenCrossEntropy().measure(logits, targets)
masked = TokenCrossEntropy().measure(logits, targets, response_only)
for row, target in zip(rows, targets):
    print(f"{vocabulary[target]:6s} token loss {everything.per_token[row]:.4f}")
print(f"all-targets mean {everything.value:.4f}")
print(f"response-only mean {masked.value:.4f}")`,
              `the    token loss 0.1043
cat    token loss 0.1043
sat    token loss 1.1654
<end>  token loss 1.1654
all-targets mean 0.6348
response-only mean 1.1654`,
              { hints: ["per_token on the answer holds one loss per row, whether or not the mask scored that row.", "value is the mean of per_token over the scored rows only, so the two calls differ in which rows they average."], check: numberCheck("What mean does the loss report when all four targets are scored?", 0.6348, 0.0005, "The two prompt targets cost 0.1043 each and the two response targets 1.1654 each, and the mean of all four is 0.6348. The response-only mean is 1.1654, the same as on the page, because the response has not changed. Scoring the prompt nearly halved the reported loss without the model answering any better, which is the reason Part 2 gives for keeping the loss a statement about the response alone.") },
            ),
            exercise(
              "Exclude every target",
              ["Part 3 says the library rejects a batch in which no target is scored, because the mean would have no denominator. Hand the loss a mask of four False values and see what it does.", "It should not answer a loss of zero. Catch what the library raises and print the name of its class and its message."],
              `import numpy as np
from oop_ml import MLLibError
from oop_ml.numpy.modern import TokenCrossEntropy

targets = np.array([1, 2, 4, 6])
logits = np.zeros((4, 7))
nothing = np.array([False, False, False, False])
# Try to measure the loss under this mask. Catch the library's own error
# and print the name of its class and its message.`,
              `import numpy as np
from oop_ml import MLLibError
from oop_ml.numpy.modern import TokenCrossEntropy

targets = np.array([1, 2, 4, 6])
logits = np.zeros((4, 7))
nothing = np.array([False, False, False, False])
try:
    TokenCrossEntropy().measure(logits, targets, nothing)
except MLLibError as refusal:
    print(type(refusal).__name__)
    print(refusal)`,
              `InvalidValuesError
at least one position must be scored`,
              { hints: ["Every refusal the library makes derives from MLLibError, so catching that one class catches whichever specific refusal this turns out to be.", "type(refusal).__name__ gives the name of the class that was raised."] },
            ),
          ],
        },
    ]}
  />;
}

