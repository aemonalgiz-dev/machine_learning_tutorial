import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { choice, several, trueFalse } from "@/lib/quizzes";
import { exercise, numberCheck } from "@/lib/exercises";
import { Equation } from "@/components/concept/Equation";
import { KeepInMind, NumberTable, SubSection, WorkedExample } from "@/components/concept/Treatments";
import { ModernLearningExample } from "@/components/widgets/ModernLearningExample";
import { lessonIntuitions } from "@/lib/intuition";

export const metadata: Metadata = {
  title: "Next-Token Prediction · oop_ml",
  description: "Build the training task behind an autoregressive large language model.",
};

export default function Page() {
  return <ConceptPage
      lessonId="next-token-prediction"
    title="Next-Token Prediction"
    tagline="Build the training task behind an autoregressive large language model."
    openingTitle="What Is a Language Model Actually Learning to Predict?"
    intuition={lessonIntuitions["next-token-prediction"]}
    technicalStart="Part 2. From Scores to a Training Signal"
    prerequisites={<>Useful foundations: <Link href="/concepts/what-a-token-is">Tokens</Link>{", "}<Link href="/concepts/transformer-blocks">transformer blocks</Link>{", "}<Link href="/concepts/loss-functions">loss functions</Link>.</>}
    playgroundIntro="Raise the assigned target logit while the other six vocabulary scores stay at zero. Compare the target probability, its negative log probability, and the derivative that would guide an update."
    playground={<ModernLearningExample topic="next-token-prediction" />}
    sections={[
{ title: "Part 1. Make Training Examples From Text", content: <>
<SubSection title="1. Turn a sequence into inputs and targets">
<p>{"A model learns from pairs, an input and the answer it should have given. For most tasks somebody has to write the answers. Text is unusual because it already contains them. Cover the last token of any stretch of text, and the covered token is the answer to the question of what comes next."}</p>
<p>{"Before anything can be calculated, the text has to become numbers. This page’s vocabulary holds seven entries, <start>, the, cat, dog, sat, slept and <end>, numbered 0 to 6 in that order. The word the is token 1, cat is token 2, sat is token 4 and <end> is token 6."}</p>
<p>{"A token ID identifies an entry in the vocabulary. An embedding gives that ID a vector; a transformer processes the vectors using available context. A final projection produces one logit, or unnormalized score, per vocabulary entry."}</p>
<p>{"The training target at each position is the following token in the original text. The example uses explicit start and end tokens to show the boundaries. Real training pipelines also need policies for document boundaries, sequence packing, padding, and truncation."}</p>
<Equation>{"Original sequence:  <start>  the  cat  sat  <end>\nInput positions:    <start>  the  cat  sat\nTarget positions:   the      cat  sat  <end>"}</Equation>
<p>{"Read the two lower rows as columns and each column is one training example. At a given position the model may read every input token up to and including that column, and its target is the token written directly below."}</p>
<NumberTable headings={["position", "what the model may read", "target", "target ID"]} rows={[["1", "<start>", "the", "1"], ["2", "<start> the", "cat", "2"], ["3", "<start> the cat", "sat", "4"], ["4", "<start> the cat sat", "<end>", "6"]]} caption="Five tokens give four examples. The start token is never a target, because nothing comes before it, and the end token is never an input, because nothing follows it." />
<p>{"Two things about this table matter for the rest of the lesson. A target never appears in its own input, so the model cannot answer by copying. And dog and slept are in the vocabulary without being in the sentence. The model still has to score them at every position, which is why each prediction is a row of seven scores and not a single yes or no about the target."}</p>

</SubSection>
<SubSection title="2. Learn from a target without claiming it is the only valid continuation">
<p>{"The target is the continuation that appeared in this example. Another example can have the same prefix and a different next token. Across data, the model is encouraged to assign probability according to the continuations it observes."}</p>
<p>{"Suppose the data holds the cat sat in one example and the cat slept in another. After the cat, the first example says the answer was sat and the second says it was slept. A prediction that puts everything on sat is right about the first example and badly wrong about the second. A prediction that shares between sat and slept is partly right about both. Step 4 puts numbers on the two predictions, and the sharing one comes out well ahead. That is the sense in which the model is fitting the proportions in its data, and it is why the output is a distribution over the vocabulary and not one chosen token."}</p>
<p>{"This is called self-supervised learning because the text supplies the target without a person labeling each position. It still uses a precise training target and a loss. Data selection, duplication, and coverage influence what the model learns."}</p>
<p>{"The table in step 1 shows how little the supervision asks of anybody. It was produced by shifting the sentence one place. Nobody decided what the right continuation ought to be, which also means that whatever the text contains, mistakes and repetitions included, becomes a target."}</p>

</SubSection>

</> },
{ title: "Part 2. From Scores to a Training Signal", content: <>
<SubSection title="3. Calculate the probability of the observed token">
<p>{"Softmax exponentiates each logit and divides by the sum across the vocabulary. For the default table, the observed target has an assigned logit of one and all six alternatives have a logit of zero."}</p>
<Equation>{"Target weight = exp(1)\nEach alternative weight = exp(0) = 1\n\nTotal weight = exp(1) + 6\nTarget probability = exp(1) / (exp(1) + 6)\n\nToken loss = −ln(Target probability)"}</Equation>
<WorkedExample title="The default table, evaluated">
<p>{"The target weight exp(1) is about 2.7183, and the six alternatives contribute one each."}</p>
<Equation>{"Target probability = 2.7183 / (2.7183 + 6) ≈ 0.3118\nEach alternative = 1 / 8.7183 ≈ 0.1147\nToken loss = −ln(0.3118) ≈ 1.1654"}</Equation>
<p>{"Every scored position in the default table has the same assigned scores, so each shows the same probability and the same loss, and the mean scored token loss is 1.1654 as well. The slider moves the target logit while the alternatives stay at zero."}</p>
<NumberTable headings={["assigned target logit", "target probability", "token loss"]} rows={[["0", "0.1429", "1.9459"], ["1", "0.3118", "1.1654"], ["2", "0.5519", "0.5944"], ["4", "0.9010", "0.1043"]]} caption="At a logit of zero all seven entries tie at one seventh and the loss is ln 7. Raising the target logit raises its probability and lowers the loss, and the loss never reaches zero, because the alternatives keep a positive share." />
</WorkedExample>
<p>{"The negative natural logarithm gives a small loss when the target is likely and a large loss when it is unlikely. This does not evaluate whether the sentence is true. It measures how well the distribution predicts the observed text."}</p>
</SubSection>
<SubSection title="4. Average over positions and differentiate">
<p>{"Let p be a vocabulary probability, y the target ID, and N the number of scored positions. The average loss gives each scored position equal weight. The derivative below applies to a logit at one scored position."}</p>
<Equation>{"L = −(1 / N) Σₜ ln pₜ(yₜ)\n\n∂L / ∂logitₜ,ⱼ = (pₜ(j) − 1[j = yₜ]) / N"}</Equation>
<p>{"For the target, the derivative is negative unless its probability is already one. Gradient descent therefore increases that score locally. In a real network, backpropagation carries this derivative through the vocabulary projection, transformer blocks, and embeddings. Shared parameters couple the effects across examples."}</p>
<WorkedExample title="The derivative on the default table">
<p>{"The default table scores four positions, so N is four. At every position the target has a probability of 0.3118 and each of the six alternatives has 0.1147."}</p>
<Equation>{"Target logit:      (0.3118 − 1) / 4 ≈ −0.1721\nEach alternative:  (0.1147 − 0) / 4 ≈ 0.0287\n\nSum over the row:  −0.1721 + (6 × 0.0287) ≈ 0"}</Equation>
<p>{"The probabilities shown are rounded and the derivatives were calculated from the unrounded ones. A descent step moves each score against its derivative. The target’s derivative is negative, so the step raises the target score, and each alternative’s derivative is positive, so the same step lowers it. The seven derivatives in a row sum to zero because the seven probabilities sum to one, so whatever the target gains the alternatives give up between them."}</p>
<NumberTable headings={["assigned target logit", "target probability", "derivative at the target logit"]} rows={[["0", "0.1429", "−0.2143"], ["1", "0.3118", "−0.1721"], ["2", "0.5519", "−0.1120"], ["4", "0.9010", "−0.0248"]]} caption="The derivative shrinks toward zero as the target becomes likely. A position the model already predicts well asks for almost no change, and a position it predicts badly asks for the most." />
</WorkedExample>
<WorkedExample title="Averaging over two continuations of one prefix">
<p>{"Return to the two examples from step 2, where the cat is followed by sat once and by slept once. That is two scored positions with the same prefix and different targets, and the average gives them equal weight. Compare a prediction that commits, with a logit of four on sat and zero on the other six entries, with a prediction that shares, with a logit of four on both sat and slept and zero on the other five."}</p>
<NumberTable headings={["prediction", "probability of sat", "probability of slept", "loss when sat followed", "loss when slept followed", "mean loss"]} rows={[["commits to sat", "0.9010", "0.0165", "0.1043", "4.1043", "2.1043"], ["shares between the two", "0.4781", "0.4781", "0.7379", "0.7379", "0.7379"]]} caption="The same row of scores is used for both examples, because the model reads the same prefix in each." />
<p>{"Committing is cheap when it is right and very expensive when it is wrong, and over the two examples it averages 2.1043 against 0.7379 for sharing. The average loss therefore pulls the prediction toward the proportions in the data. No row of scores can do better on these two examples than a half each, which would cost 0.6931 on both."}</p>
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
              "The training target at each position is the following token in the original text, so the input positions are start, the, cat, sat and the target positions are the, cat, sat, end. Five tokens give four examples, because the start token is never a target and the end token is never an input.",
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
              "Softmax exponentiates each logit and divides by the sum across the whole vocabulary, and each of the six alternatives contributes exp(0), which is 1. That comes to about 0.3118. One seventh is what the target gets at a logit of zero, where all seven entries tie.",
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
<p>{"The untrained decoder does worse than a prediction that knows nothing. Its random parameters produce uneven scores, and the larger ones land on the wrong tokens. At the first position it gives sat a probability of 0.4586 when the token that followed was the. Nothing is broken here. This is a model before the objective has been used on it, and training is the work of bringing 2.4475 down."}</p>
</WorkedExample>
<p>{"Pretraining supplies broad statistical patterns. It does not automatically turn a continuation model into a reliable assistant. Supervised fine-tuning can teach response behavior; retrieval can provide source material at answer time. Neither makes evaluation unnecessary."}</p>
<KeepInMind>
<p>{"A loss is read against the vocabulary it was measured over. Equal scores cost the logarithm of the vocabulary size at every position, which is ln 7, about 1.9459, for the seven entries here, and that starting point rises as the vocabulary grows. A loss of 1.9459 means knowing nothing over seven entries, and the same value over a larger vocabulary would mean the model had learned something."}</p>
</KeepInMind>

</SubSection>
<SubSection title="6. Inspect the objective directly">
<p>{"The SDK example keeps the scores explicit. It calculates the mean loss, individual token losses, probability rows, and exact logit derivatives without fitting a language model."}</p>
<pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm leading-relaxed text-slate-100"><code>{"import numpy as np\nfrom oop_ml.numpy.modern import TokenCrossEntropy\n\nlogits = np.array([[1.0, 0.0, 0.0]])\ntargets = np.array([0])\nresult = TokenCrossEntropy().measure(logits, targets)\nprint(result.value)\nprint(result.gradient)"}</code></pre>
<p>{"During training, earlier input tokens come from the training sequence, so causal positions can be processed together. During generation, the model must use its own selected tokens as the growing context. That difference is the subject of the next lesson."}</p>
<p>{"The first of those claims can be checked on the small decoder. One pass over the four input tokens returns four rows of scores. Running the decoder again on only the first three tokens gives a last row that agrees with the third row of the full pass, and the same holds for the other prefix lengths, to within rounding in the sixteenth decimal place. A position’s scores depend only on the tokens at or before it. So one pass over a training sequence does the work of four separate predictions, and the loss at every position can be calculated from that single pass."}</p>
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
              "A large language model has a large learned parameter set and is trained on substantial language data, and no universal threshold separates the two. What scale changes is model capacity, context length, data and optimization, while the next-token objective stays the same.",
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
              "Supervised fine-tuning can teach response behavior and retrieval can provide source material at answer time. Neither of those makes evaluation unnecessary, and pretraining alone does not turn a continuation model into an assistant.",
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
              ["Build the scores behind the page’s default table, a logit of one on each of the four targets and zero on the other six entries, and measure them with TokenCrossEntropy. Print each target’s probability and token loss to four places, then the mean loss and the derivative at the first target’s logit.", "Part 2 arrived at a probability of 0.3118, a token loss of 1.1654 and a derivative of −0.1721 by hand. The library does the same arithmetic on all four rows at once, so every row should repeat those figures."],
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
              { hints: ["measure takes the block of logits, one row per position, and one target ID per row. It returns a single result object.", "The result holds probabilities with the same shape as the logits, per_token with one loss per position, value for the mean, and gradient with the same shape as the logits.", "A target’s probability at a position is probabilities[position, target], and the derivative at its logit is gradient[position, target]."], check: numberCheck("What mean loss does the default table report, to four places?", 1.1654, 0.0005, "Every position gives its target exp(1) out of a total weight of exp(1) plus 6, which is 0.3118, and the negative logarithm of that is 1.1654. All four positions carry the same scores, so the mean equals each token loss.") },
            ),
            exercise(
              "Share one prefix between two continuations",
              ["Step 4 scored two examples with the same prefix, one followed by sat and one by slept, under a row that commits to sat and a row that shares. Reproduce both mean losses, then add a third row that shares with a logit of eight on sat and on slept, and print the natural logarithm of 2 beside it.", "The lesson says no row of scores can beat a half each. The third row shows how close a stronger shared score gets, which is a number the lesson does not print."],
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
              { hints: ["The model reads the same prefix in both examples, so both rows of the logits block are the same row. Only the targets differ.", "per_token holds the two token losses in order, the first for the example where sat followed and the second for the one where slept followed. value is their mean."], check: numberCheck("What mean loss does sharing with a logit of eight reach, to four places?", 0.694, 0.00025, "Each of the two tokens gets exp(8) out of a total weight of twice exp(8) plus 5, which is just under a half, because the five other entries still hold a small share. The mean loss therefore sits just above the 0.6931 that an exact half each would cost, and no finite score closes the gap.") },
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
              { hints: ["respond_to takes the array of input token IDs and returns a trace of the forward pass. Its logits attribute has one row per input position and one column per vocabulary entry.", "Those logits go to measure exactly as the assigned ones did. Nothing about the loss knows where the scores came from.", "sat is the target at the third position and its vocabulary ID is 4, so its derivative is gradient[2, 4]."], check: numberCheck("What is the derivative at the logit of sat, the third target, to four places?", -0.2401, 0.0005, "The derivative at a target is its probability minus one, divided by the four scored positions. The decoder gave sat a probability of 0.0395, the lowest of the four targets, so its derivative is the most negative. The position predicted worst asks for the largest change.") },
            ),
            exercise(
              "Check that one pass does the work of four",
              ["Part 3 says the positions of a training sequence can be processed together. Run the decoder once over all four input tokens, then once for each prefix length from one to four, and compare the last row of each shorter pass with the matching row of the full pass. Print the largest absolute difference for each length.", "If a position could read anything after it, the row from the full pass would differ from the row computed on the prefix alone. There is no number to check here. The differences should be zero or a rounding error in the sixteenth decimal place."],
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
              { hints: ["inputs[:length] is the prefix. A pass over it returns one row of logits per token in the prefix, and the last row, logits[-1], is the prediction made after reading the whole prefix.", "The matching row of the full pass is full[length - 1], because rows count from zero."] },
            ),
          ],
        },
    ]}
  />;
}

