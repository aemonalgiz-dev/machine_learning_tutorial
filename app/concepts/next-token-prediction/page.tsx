import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { choice, several, trueFalse } from "@/lib/quizzes";
import { exercise, numberCheck } from "@/lib/exercises";
import { Equation } from "@/components/concept/Equation";
import { KeepInMind, NumberTable, SubSection, WorkedExample } from "@/components/concept/Treatments";
import { ModernLearningExample } from "@/components/widgets/ModernLearningExample";
import { lessonIntuitions } from "@/lib/intuition";

export const metadata: Metadata = pageMetadata("/concepts/next-token-prediction", {
  title: "Next-Token Prediction · Perceptron Lab",
  description: "Text provides examples of which tokens follow earlier tokens. Training a next-token model uses those continuations as targets while restricting each prediction to the preceding context.",
});

export default function Page() {
  return <ConceptPage
      lessonId="next-token-prediction"
    title="Next-Token Prediction"
    tagline={"Text provides examples of which tokens follow earlier tokens. Training a next-token model uses those continuations as targets while restricting each prediction to the preceding context."}
    openingTitle="What Is a Language Model Actually Learning to Predict?"
    intuition={lessonIntuitions["next-token-prediction"]}
    technicalStart="Part 2. From Scores to a Training Signal"
    prerequisites={<>Useful foundations: <Link href="/concepts/what-a-token-is">Tokens</Link>{", "}<Link href="/concepts/transformer-blocks">transformer blocks</Link>{", "}<Link href="/concepts/loss-functions">loss functions</Link>.</>}
    playgroundTitle="Which next-token guesses earn the smaller loss?"
    playgroundIntro="Raise the assigned target logit while the other six vocabulary scores stay at zero. Compare the target probability, its negative log probability, and the derivative that would guide an update."
    playground={<ModernLearningExample topic="next-token-prediction" />}
    sections={[
{ title: "Part 1. Make Training Examples From Text", content: <>
<SubSection title="1. Turn a sequence into inputs and targets">
<p>{"Suppose we show a model the beginning of a sentence and hide the next token. The original text already tells us which token followed, so we can compare the model's prediction with that observation. Repeating this throughout a corpus gives us training examples without asking someone to label each continuation by hand."}</p>
<p>{"Before anything can be calculated, the text has to become numbers. This page’s vocabulary holds seven entries, <start>, the, cat, dog, sat, slept and <end>, numbered 0 to 6 in that order. The word the is token 1, cat is token 2, sat is token 4 and <end> is token 6."}</p>
<p>{"The ID tells us which vocabulary entry we have, but its numerical size does not describe meaning. The model looks up a list of learned coordinates for it; that list is its embedding vector. The transformer lets those rows gather information from the available context. A final calculation produces one score for each possible next token. Such an unnormalized score is called a logit."}</p>
<p>{"The training target at each position is the following token in the original text. The example uses explicit start and end tokens to show the boundaries. Real training pipelines also need policies for document boundaries, sequence packing, padding, and truncation."}</p>
<Equation>{"Original sequence:  <start>  the  cat  sat  <end>\nInput positions:    <start>  the  cat  sat\nTarget positions:   the      cat  sat  <end>"}</Equation>
<p>{"Read the two lower rows as columns and each column is one training example. At a given position the model may read every input token up to and including that column, and its target is the token written directly below."}</p>
<NumberTable headings={["position", "what the model may read", "target", "target ID"]} rows={[["1", "<start>", "the", "1"], ["2", "<start> the", "cat", "2"], ["3", "<start> the cat", "sat", "4"], ["4", "<start> the cat sat", "<end>", "6"]]} caption="These five tokens produce four input/target pairs. In this isolated sequence, the start marker is used only as input and the end marker only as a target." />
<p>{"The target occurrence is one position beyond the text that position may read. A word can appear earlier in the prefix too, but the model cannot inspect this unseen occurrence to obtain the answer. Dog and slept are also in the vocabulary without being in this sentence. The model must still score them at every position, which is why each prediction is a row of seven scores."}</p>

</SubSection>
<SubSection title="2. Learn from a target without claiming it is the only valid continuation">
<p>{"The target is the continuation that appeared in this example. Another example can have the same prefix and a different next token. Across data, the model is encouraged to assign probability according to the continuations it observes."}</p>
<p>
                  {"Suppose the data includes the cat sat once and the cat slept once. The shared prefix the cat is followed by sat in one example and slept in the other. A prediction that commits all probability to sat cannot account for the second observation."}
                </p>
                <p>
                  {"For these equally weighted examples, the lowest possible mean log loss assigns one half to each observed continuation. Step 4 compares finite score tables approaching that distribution. The model learns a distribution from observed continuations; choosing one token is a separate decoding step."}
                </p>
<p>{"This is called self-supervised learning because the text supplies the target without a person labeling each position. It still uses a precise training target and a loss. Data selection, duplication, and coverage influence what the model learns."}</p>


</SubSection>

</> },
{ title: "Part 2. From Scores to a Training Signal", content: <>
<SubSection title="3. Calculate the probability of the observed token">
<p>{"Softmax exponentiates each logit and divides by the sum across the vocabulary. For the default table, the observed target has an assigned logit of one and all six alternatives have a logit of zero."}</p>
<Equation>{"Target weight = exp(1)\nEach alternative weight = exp(0) = 1\n\nTotal weight = exp(1) + 6\nTarget probability = exp(1) / (exp(1) + 6)\n\nToken loss = −ln(Target probability)"}</Equation>
<WorkedExample title="The default table, evaluated">
<p>
                  {"The target weight is about 2.7183, and each of the six alternative weights is one."}
                </p>
<Equation>{"Target probability = 2.7183 / (2.7183 + 6) ≈ 0.3118\nEach alternative = 1 / 8.7183 ≈ 0.1147\nToken loss = −ln(0.3118) ≈ 1.1654"}</Equation>
<p>{"Every scored position in the default table has the same assigned scores, so each shows the same probability and the same loss, and the mean scored token loss is 1.1654 as well. The slider moves the target logit while the alternatives stay at zero."}</p>
<NumberTable headings={["assigned target logit", "target probability", "token loss"]} rows={[["0", "0.1429", "1.9459"], ["1", "0.3118", "1.1654"], ["2", "0.5519", "0.5944"], ["4", "0.9010", "0.1043"]]} caption="At a logit of zero all seven entries tie at one seventh and the loss is ln 7. Raising the target logit raises its probability and lowers the loss, and the loss never reaches zero, because the alternatives keep a positive share." />
</WorkedExample>
<p>{"The negative natural logarithm gives a small loss when the target is likely and a large loss when it is unlikely. This does not evaluate whether the sentence is true. It measures how well the distribution predicts the observed text."}</p>
</SubSection>
<SubSection title="4. Average over positions and differentiate">
<p>{"The average treats each scored position as one contribution to the objective. Let p denote a vocabulary probability, y the target ID, and N the number of positions being scored. The derivative below describes one vocabulary score at one such position; averaging scales that position's contribution by the total count."}</p>
<Equation>{"L = −(1 / N) Σₜ ln pₜ(yₜ)\n\n∂L / ∂logitₜ,ⱼ = (pₜ(j) − 1[j = yₜ]) / N"}</Equation>
<p>
                  {"If we adjusted each logit directly, gradient descent would raise the target’s score because its derivative is negative. In a network, backpropagation converts those score derivatives into updates for shared parameters. One parameter can affect several scores and examples, so that combined step need not raise every target score."}
                </p>
<WorkedExample title="The derivative on the default table">
<p>{"The default table scores four positions, so N is four. At every position the target has a probability of 0.3118 and each of the six alternatives has 0.1147."}</p>
<Equation>{"Target logit:      (0.3118 − 1) / 4 ≈ −0.1721\nEach alternative:  (0.1147 − 0) / 4 ≈ 0.0287\n\nSum over the row:  −0.1721 + (6 × 0.0287) ≈ 0"}</Equation>
<p>
                  {"The displayed probabilities are rounded; these derivatives use the unrounded values. If we adjust the logits directly, a descent step raises the target logit and lowers the alternatives. The derivatives sum to zero because the probabilities sum to one, so those direct logit changes also sum to zero. This balance does not mean that a shared network-parameter update moves each output score independently."}
                </p>
<NumberTable headings={["assigned target logit", "target probability", "derivative at the target logit"]} rows={[["0", "0.1429", "−0.2143"], ["1", "0.3118", "−0.1721"], ["2", "0.5519", "−0.1120"], ["4", "0.9010", "−0.0248"]]} caption="For the target logit, a lower target probability makes this derivative more negative. As the target probability approaches one, the derivative approaches zero." />
</WorkedExample>
<WorkedExample title="Averaging over two continuations of one prefix">
<p>{"Return to the two examples from step 2, where the cat is followed by sat once and by slept once. That is two scored positions with the same prefix and different targets, and the average gives them equal weight. Compare a prediction that commits, with a logit of four on sat and zero on the other six entries, with a prediction that shares, with a logit of four on both sat and slept and zero on the other five."}</p>
<NumberTable headings={["prediction", "probability of sat", "probability of slept", "loss when sat followed", "loss when slept followed", "mean loss"]} rows={[["commits to sat", "0.9010", "0.0165", "0.1043", "4.1043", "2.1043"], ["shares between the two", "0.4781", "0.4781", "0.7379", "0.7379", "0.7379"]]} caption="The same row of scores is used for both examples, because the model reads the same prefix in each." />
<p>
                  {"On these two targets, the preference for sat has mean loss 2.1043, while the shared preference has mean loss 0.7379. For these equally weighted continuations, the lowest possible loss corresponds to probability one half for each. Its loss is about 0.6931. Finite logits over all seven entries can approach that distribution, but they leave some probability for the five unobserved alternatives."}
                </p>
</WorkedExample>
</SubSection>

</> },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            choice(
              "In the sequence start, the, cat, sat, end, what is the target at the position holding sat?",
              [
                "The end token",
                "sat",
                "cat",
                "The start token",
              ],
              0,
              "The target for sat is the following token, <end>. For this training example, the inputs are <start>, the, cat, sat and the targets are the, cat, sat, <end>. The boundary tokens are used this way in the supplied sequence; other dataset conventions may handle boundaries differently.",
            ),
            trueFalse(
              "The target at a position is the only valid continuation of the prefix before it.",
              false,
              "The target is the continuation that appeared in this example, and another example can carry the same prefix with a different next token. With the cat followed by sat once and by slept once, a prediction committed to sat averages a loss of 2.1043 where one sharing between the two averages 0.7379, so the objective itself rewards leaving room for both.",
            ),
            choice(
              "The observed target has an assigned logit of one and all six alternatives have a logit of zero. What probability does softmax give the target?",
              [
                "exp(1) divided by exp(1) plus 6",
                "One seventh, since the vocabulary holds seven entries",
                "exp(1) divided by 7",
                "One, because its logit is the largest",
              ],
              0,
              "Softmax divides the target's exponentiated score by the total across all seven tokens.\n\n```math\np(target) = exp(1) / [exp(1) + 6 × exp(0)] ≈ 0.3118\n```\n\nA logit is a score, not a probability. If all seven scores were equal, each token would receive one seventh.",
            ),
            several(
              "Which of these hold on the default table, where every target has a logit of one and the six alternatives have zero?",
              [
                "Every target has a probability of about 0.3118 and a token loss of about 1.1654",
                "The mean scored token loss equals each token loss, because all four positions carry the same scores",
                "Raising the target logit to four brings the token loss to zero",
                "A token loss of 1.1654 says the sentence is more likely true than false",
              ],
              [0, 1],
              "At a logit of four the target probability is 0.9010 and the loss is 0.1043, and it never reaches zero because the alternatives keep a positive share. The loss is the negative natural logarithm of the probability given to the observed token, so it measures how well the distribution predicts the text and says nothing about whether the text is true.",
            ),
            trueFalse(
              "For the target token the derivative is negative unless its probability is already one, so gradient descent raises that score locally.",
              true,
              "The derivative with respect to a logit is the predicted probability minus one at the target entry, divided by the number of scored positions, which is −0.1721 on the default table. It shrinks as the target becomes likely, reaching −0.0248 at a logit of four, so a position already predicted well asks for almost no change.",
            ),
        ],
        },
{ title: "Part 3. What Changes When the Model Is Large?", content: <>
<SubSection title="5. Separate the objective from the scale">
<p>{"A large language model has a large learned parameter set and is trained on substantial language data. There is no universal parameter count at which a model becomes large. The next-token objective stays the same while model capacity, context length, data, and optimization become major design choices."}</p>
<p>{"What stays the same is everything Part 2 calculated. Each position still gets one score per vocabulary entry, softmax still turns the scores into shares, and the loss is still the negative logarithm of the share given to the token that followed. What changes is where the scores come from. In the table on this page they were assigned, one number per cell, and each could be moved without disturbing the others. In a model they are computed from parameters, and the same parameters produce the scores at every position of every example."}</p>
<WorkedExample title="The same loss on scores a network produced">
<p>{"The transformer block lesson built a small decoder whose parameters are fixed random values. Give it the four input tokens <start>, the, cat and sat and it returns seven scores at each position. Those rows can be scored against the same four targets exactly as the assigned table was."}</p>
<NumberTable headings={["what the model may read", "target", "target probability", "token loss"]} rows={[["<start>", "the", "0.0988", "2.3145"], ["<start> the", "cat", "0.2438", "1.4114"], ["<start> the cat", "sat", "0.0395", "3.2310"], ["<start> the cat sat", "<end>", "0.0588", "2.8330"]]} caption="The mean scored token loss is 2.4475. Seven equal scores would cost 1.9459 at every position." />
<p>
                  {"On these four positions, the untrained decoder’s mean loss of 2.4475 is higher than the uniform baseline. Its random parameters favor some alternatives over the observed targets. At the first position it gives sat probability 0.4586, although the observed target is the. Training would adjust these shared parameters to reduce the next-token objective across the training data."}
                </p>
</WorkedExample>
<p>{"Pretraining supplies broad statistical patterns. It does not automatically turn a continuation model into a reliable assistant. Supervised fine-tuning can teach response behavior; retrieval can provide source material at answer time. Neither makes evaluation unnecessary."}</p>
<KeepInMind>
<p>{"The vocabulary determines the uniform-probability baseline for this loss. With seven equally scored entries, that baseline is ln 7, about 1.9459. It rises with vocabulary size. A loss of 1.9459 matches the uniform baseline for these seven entries; the same value over a larger vocabulary would improve on that larger uniform baseline. Neither comparison by itself measures factual knowledge."}</p>
</KeepInMind>

</SubSection>
<SubSection title="6. Inspect the objective directly">
<p>
                  {"The SDK example below uses one scored position and a three-entry vocabulary, rather than the four-position, seven-entry table above. TokenCrossEntropy receives a two-dimensional logits array with one row per position and a target-ID array with one entry per row. The result contains the mean loss, per-token losses, probabilities and logit derivatives. This program prints the mean loss and gradient; it does not fit a model."}
                </p>
<pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm leading-relaxed text-slate-100"><code>{"import numpy as np\nfrom oop_ml.numpy.modern import TokenCrossEntropy\n\nlogits = np.array([[1.0, 0.0, 0.0]])\ntargets = np.array([0])\nresult = TokenCrossEntropy().measure(logits, targets)\nprint(result.value)\nprint(result.gradient)"}</code></pre>
<p>{"During training, earlier input tokens come from the training sequence, so causal positions can be processed together. During generation, the model must use its own selected tokens as the growing context. That difference is the subject of the next lesson."}</p>
<p>
                  {"We can check the causal restriction on the small decoder. One pass over all four input tokens returns four rows of scores. Run it again on only the first three tokens: its last row agrees with the third row of the full pass. The other prefix lengths agree in the same way, within rounding in the sixteenth decimal place. Future tokens are blocked, so the full pass produces all four training predictions without revealing a later target occurrence to an earlier position."}
                </p>
</SubSection>
<p>{"The GPT-3 paper provides a concrete example of a large autoregressive language model and distinguishes prompting from gradient-based fine-tuning."}{" "}<a href="https://arxiv.org/abs/2005.14165">Language Models are Few-Shot Learners</a>.</p>
<p>Continue with <Link href="/concepts/autoregressive-generation">Autoregressive Generation</Link>.</p>
</> },
        {
          title: "Questions on Part 3",
          quiz: [
            trueFalse(
              "There is a parameter count above which a model counts as large.",
              false,
              "There is no universal parameter threshold for the term large language model. Parameter count describes one aspect of scale. Training data, context limits and optimization are separate design choices; increasing the parameter count does not automatically enlarge the context window. The next-token objective can be used by small and large models alike.",
            ),
            trueFalse(
              "Scored on the lesson’s sentence, the small decoder with fixed random parameters has a higher mean loss than seven equal scores would.",
              true,
              "Its mean scored token loss is 2.4475 against 1.9459 for seven equal scores. Random parameters produce uneven scores and the larger ones land on the wrong tokens, as at the first position, where sat gets 0.4586 and the token that followed was the. Bringing that figure down is what training is for.",
            ),
            choice(
              "What does pretraining on next-token prediction supply?",
              [
                "Broad statistical patterns, which do not by themselves make a reliable assistant",
                "Response behavior, since the targets are real text written by people",
                "Source material to quote at answer time",
                "Enough coverage that evaluation becomes unnecessary",
              ],
              0,
              "Pretraining adjusts parameters to predict tokens from language examples, which can produce reusable representations and continuation behavior. It does not by itself guarantee useful instruction following or factual answers. Supervised fine-tuning can train response behavior, and retrieval can supply source material at answer time. Each still needs evaluation for the intended task.",
            ),
            choice(
              "Why can causal positions be processed together while training but not while generating?",
              [
                "While training, the earlier input tokens come from the training sequence, where generation has to use the tokens the model itself selected as the growing context",
                "Training runs with a larger batch size",
                "Generation has no loss to average over the positions",
                "Softmax is only normalized during training",
              ],
              0,
              "The whole sequence is already known while training, so every scored position has its context in hand before any prediction is made. On the small decoder, the scores at a position from one pass over all four tokens agree with the scores from a pass over that prefix alone, so one pass does the work of four predictions. Generation has no such sequence to read and has to build it a token at a time.",
            ),
        ],
        },
        {
          title: "Practice. Scoring Next-Token Targets With the Library",
          practice: [
            exercise(
              "Score the default table",
              ["Create four rows of seven logits, using one at each row's target and zero at its six alternatives. Measure them with TokenCrossEntropy. Print each target's probability and per-token loss to four decimal places. Then print the mean loss and the derivative at the first target's logit.", "Part 2 arrived at a probability of 0.3118, a token loss of 1.1654 and a derivative of −0.1721 by hand. The library does the same arithmetic on all four rows at once, so every row should repeat those figures."],
              `import numpy as np
from oop_ml.numpy.modern import TokenCrossEntropy

vocabulary = ["<start>", "the", "cat", "dog", "sat", "slept", "<end>"]
targets = np.array([1, 2, 4, 6])  # the, cat, sat, <end>

logits = np.zeros((4, len(vocabulary)))
logits[np.arange(4), targets] = 1.0  # a logit of one on each target

# Measure the logits against the targets. For each position print the
# target's probability and token loss, then print the mean loss and the
# derivative at the first target's logit, all to four places.
`,
              `import numpy as np
from oop_ml.numpy.modern import TokenCrossEntropy

vocabulary = ["<start>", "the", "cat", "dog", "sat", "slept", "<end>"]
targets = np.array([1, 2, 4, 6])  # the, cat, sat, <end>

logits = np.zeros((4, len(vocabulary)))
logits[np.arange(4), targets] = 1.0  # a logit of one on each target

result = TokenCrossEntropy().measure(logits, targets)
for position, target in enumerate(targets):
    probability = result.probabilities[position, target]
    loss = result.per_token[position]
    print(f"{vocabulary[target]:6s} probability {probability:.4f} loss {loss:.4f}")
print(f"mean loss {result.value:.4f}")
print(f"derivative at the first target {result.gradient[0, targets[0]]:.4f}")
`,
              `the    probability 0.3118 loss 1.1654
cat    probability 0.3118 loss 1.1654
sat    probability 0.3118 loss 1.1654
<end>  probability 0.3118 loss 1.1654
mean loss 1.1654
derivative at the first target -0.1721`,
              { hints: ["measure takes the block of logits, one row per position, and one target ID per row. It returns a single result object.", "The result holds probabilities with the same shape as the logits, per_token with one loss per position, value for the mean, and gradient with the same shape as the logits.", "A target’s probability at a position is probabilities[position, target], and the derivative at its logit is gradient[position, target]."], check: numberCheck("What mean loss does the default table report, to four places?", 1.1654, 0.0005, "Each row boosts its own target by the same amount against the same vocabulary size, so the target probabilities and losses agree across positions. The mean therefore equals an individual token loss. This is a measurement of supplied scores; no model parameters change.") , question: "How much probability does each intended next token receive?" },
            ),
            exercise(
              "Share one prefix between two continuations",
              ["Step 4 scored two examples with the same prefix, one followed by sat and one by slept, under a row that commits to sat and a row that shares. Reproduce both mean losses, then add a third row that shares with a logit of eight on sat and on slept, and print the natural logarithm of 2 beside it.", "Both examples have the same prefix, with sat observed once and slept once. Compare the measured mean losses with the ideal distribution that assigns each continuation probability one half. The finite shared logits leave some probability on the other five tokens, so their loss remains slightly higher."],
              `import numpy as np
from oop_ml.numpy.modern import TokenCrossEntropy

targets = np.array([4, 5])  # sat followed once, slept followed once
rows = {
    "commits to sat, logit 4": [0, 0, 0, 0, 4, 0, 0],
    "shares, logit 4 on both": [0, 0, 0, 0, 4, 4, 0],
    # Add a row that shares with a logit of 8 on both.
}
for label, row in rows.items():
    logits = np.array([row, row], dtype=float)  # the same scores for both examples
    # Measure the logits against the targets and print the two token
    # losses and their mean to four places.
print(f"a half each would cost {np.log(2):.4f}")
`,
              `import numpy as np
from oop_ml.numpy.modern import TokenCrossEntropy

targets = np.array([4, 5])  # sat followed once, slept followed once
rows = {
    "commits to sat, logit 4": [0, 0, 0, 0, 4, 0, 0],
    "shares, logit 4 on both": [0, 0, 0, 0, 4, 4, 0],
    "shares, logit 8 on both": [0, 0, 0, 0, 8, 8, 0],
}
for label, row in rows.items():
    logits = np.array([row, row], dtype=float)  # the same scores for both examples
    result = TokenCrossEntropy().measure(logits, targets)
    first, second = result.per_token
    print(f"{label}: losses {first:.4f} and {second:.4f}, mean {result.value:.4f}")
print(f"a half each would cost {np.log(2):.4f}")
`,
              `commits to sat, logit 4: losses 0.1043 and 4.1043, mean 2.1043
shares, logit 4 on both: losses 0.7379 and 0.7379, mean 0.7379
shares, logit 8 on both: losses 0.6940 and 0.6940, mean 0.6940
a half each would cost 0.6931`,
              { hints: ["The model reads the same prefix in both examples, so both rows of the logits block are the same row. Only the targets differ.", "per_token holds the two token losses in order, the first for the example where sat followed and the second for the one where slept followed. value is their mean."], check: numberCheck("What mean loss does sharing with a logit of eight reach, to four places?", 0.694, 0.00025, "Both examples supply the same prefix, so they must share a predicted distribution. Splitting probability equally between their two targets is optimal for these equally weighted observations. Finite softmax scores still leave some probability on the other vocabulary entries, keeping the measured loss just above that ideal.") , question: "What should a model predict when the same prefix has two observed continuations?" },
            ),
            exercise(
              "Score a network’s own scores",
              ["Part 3 scored the small untrained decoder on the lesson’s sentence. Build it with CausalLanguageModel, run it over the four input tokens, and measure its logits against the four targets. Print each target’s probability, loss and derivative, then the mean loss, the loss seven equal scores would give, and the derivative at the logit of sat on a line of its own.", "The probabilities and losses should match the table in Part 3. The derivatives are not on the page. Look at which position has the most negative one."],
              `import numpy as np
from oop_ml.numpy.modern import CausalLanguageModel, TokenCrossEntropy

vocabulary = ["<start>", "the", "cat", "dog", "sat", "slept", "<end>"]
inputs = np.array([0, 1, 2, 4])  # <start> the cat sat
targets = np.array([1, 2, 4, 6])  # the cat sat <end>

model = CausalLanguageModel(len(vocabulary))
# Run the decoder over the inputs and take the logits from its trace.
# Measure them against the targets, then print each target's probability,
# loss and derivative, the mean loss, and the loss of seven equal scores.
`,
              `import numpy as np
from oop_ml.numpy.modern import CausalLanguageModel, TokenCrossEntropy

vocabulary = ["<start>", "the", "cat", "dog", "sat", "slept", "<end>"]
inputs = np.array([0, 1, 2, 4])  # <start> the cat sat
targets = np.array([1, 2, 4, 6])  # the cat sat <end>

model = CausalLanguageModel(len(vocabulary))
logits = model.respond_to(inputs).logits
result = TokenCrossEntropy().measure(logits, targets)
for position, target in enumerate(targets):
    probability = result.probabilities[position, target]
    loss = result.per_token[position]
    derivative = result.gradient[position, target]
    print(f"{vocabulary[target]:6s} probability {probability:.4f} loss {loss:.4f} derivative {derivative:.4f}")
print(f"mean loss {result.value:.4f}")
print(f"seven equal scores {np.log(len(vocabulary)):.4f}")
print(f"derivative at sat {result.gradient[2, 4]:.4f}")
`,
              `the    probability 0.0988 loss 2.3145 derivative -0.2253
cat    probability 0.2438 loss 1.4114 derivative -0.1890
sat    probability 0.0395 loss 3.2310 derivative -0.2401
<end>  probability 0.0588 loss 2.8330 derivative -0.2353
mean loss 2.4475
seven equal scores 1.9459
derivative at sat -0.2401`,
              { hints: ["respond_to takes the array of input token IDs and returns a trace of the forward pass. Its logits attribute has one row per input position and one column per vocabulary entry.", "Those logits go to measure exactly as the assigned ones did. Nothing about the loss knows where the scores came from.", "sat is the target at the third position and its vocabulary ID is 4, so its derivative is gradient[2, 4]."], check: numberCheck("What is the derivative at the logit of sat, the third target, to four places?", -0.2401, 0.0005, "For these equally weighted positions, a lower target probability gives a more negative derivative at that target’s logit. The sat prediction is the least likely observed target, so its logit receives the strongest upward pressure under a small gradient descent step. This describes the logit derivative; parameter updates also depend on the decoder’s earlier calculations.") , question: "Which target gives this untrained decoder the strongest loss signal?" },
            ),
            exercise(
              "Check that one pass does the work of four",
              ["Run the decoder once over all four input tokens. Then run it separately on each prefix, from one through four tokens. Compare each prefix's final logit row with the row at the same position in the full pass, and print the largest absolute difference.","Use the same model for every pass. Later input tokens should not affect earlier rows because of the causal mask. Floating-point roundoff can leave tiny differences; this comparison checks the supplied model and inputs rather than proving correctness for every sequence."],
              `import numpy as np
from oop_ml.numpy.modern import CausalLanguageModel

inputs = np.array([0, 1, 2, 4])  # <start> the cat sat
model = CausalLanguageModel(7)
full = model.respond_to(inputs).logits  # four rows from one pass

for length in range(1, 5):
    # Run the decoder on the first \`length\` tokens only, take the last
    # row of its logits, and print the largest absolute difference from
    # row \`length - 1\` of the full pass.
    pass
`,
              `import numpy as np
from oop_ml.numpy.modern import CausalLanguageModel

inputs = np.array([0, 1, 2, 4])  # <start> the cat sat
model = CausalLanguageModel(7)
full = model.respond_to(inputs).logits  # four rows from one pass

for length in range(1, 5):
    alone = model.respond_to(inputs[:length]).logits[-1]
    gap = np.abs(alone - full[length - 1]).max()
    print(f"prefix of {length}: largest difference {gap:.1e}, same to 12 places {np.allclose(alone, full[length - 1], atol=1e-12)}")
`,
              `prefix of 1: largest difference 2.2e-16, same to 12 places True
prefix of 2: largest difference 0.0e+00, same to 12 places True
prefix of 3: largest difference 0.0e+00, same to 12 places True
prefix of 4: largest difference 0.0e+00, same to 12 places True`,
              { hints: ["inputs[:length] is the prefix. A pass over it returns one row of logits per token in the prefix, and the last row, logits[-1], is the prediction made after reading the whole prefix.", "The matching row of the full pass is full[length - 1], because rows count from zero."] , question: "Does the full sequence agree with predictions made from its prefixes alone?" },
            ),
          ],
        },
    ]}
  />;
}

