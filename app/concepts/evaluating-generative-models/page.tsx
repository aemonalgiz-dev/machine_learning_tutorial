import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { choice, several, trueFalse } from "@/lib/quizzes";
import { exercise, numberCheck } from "@/lib/exercises";
import { Equation } from "@/components/concept/Equation";
import { NumberTable, SubSection } from "@/components/concept/Treatments";
import { ModernLearningExample } from "@/components/widgets/ModernLearningExample";
import { lessonIntuitions } from "@/lib/intuition";

export const metadata: Metadata = {
  title: "Evaluating Generative Models · oop_ml",
  description: "A fluent answer or convincing picture is not enough to show that a model does its job well. We need evaluation examples and criteria that reflect the task, including failures an overall average might conceal.",
};

export default function Page() {
  return <ConceptPage
      lessonId="evaluating-generative-models"
    title="Evaluating Generative Models"
    tagline={"A fluent answer or convincing picture is not enough to show that a model does its job well. We need evaluation examples and criteria that reflect the task, including failures an overall average might conceal."}
    openingTitle="A Response Looks Convincing. How Do We Know the Model Improved?"
    intuition={lessonIntuitions["evaluating-generative-models"]}
    technicalStart="Part 2. Calculate Loss and Perplexity"
    prerequisites={<>Useful foundations: <Link href="/concepts/next-token-prediction">Next-token prediction</Link>{", "}<Link href="/concepts/retrieval-augmented-generation">retrieval-augmented generation</Link>{", "}<Link href="/concepts/generative-adversarial-networks">GANs</Link>.</>}
    playgroundIntro="Raise the logit boost while it favors the observed target. Then enable Boost the wrong token and repeat. Compare both metrics. At zero boost, all three tokens are equally probable."
    playground={<ModernLearningExample topic="evaluating-generative-models" />}
    sections={[
{ title: "Part 1. Choose the Question Before the Metric", content: <>
<SubSection title="1. Separate predictive fit from task success">
<p>{"A fluent response is not evidence that a model improved. Fluency is what these models produce most reliably, so it is present in the good answers and in the bad ones. To find out whether a change helped, we need a question narrow enough for a measurement to answer. The question has to be chosen first, because each measurement answers only one."}</p>
<p>{"A language model can be evaluated by how much probability it assigns to text that it did not train on. That asks whether its continuation distribution fits held-out language. It does not directly ask whether an answer follows instructions, cites evidence correctly, or solves the user’s problem."}</p>
<p>{"For a factual question with a known answer, correctness may be checked against a reference. Exact string matching can be useful for rigid outputs but rejects valid paraphrases. Open-ended responses need a rubric that states what counts as correct, complete, and useful."}</p>
<NumberTable headings={["The question", "A measurement that fits it", "What it leaves unanswered"]} rows={[["Does the model predict text it has not seen?", "The probability it gave the observed next tokens", "Whether any answer is correct or useful"], ["Is a factual answer right?", "Comparison with a reference answer", "Whether a valid paraphrase was rejected"], ["Is an open-ended response good?", "A rubric applied to the response", "Anything the rubric did not name"]]} caption="Three questions about one model. A good result on one row says nothing about the other two." />
<p>{"The paraphrase problem is easy to meet. Take the previous lesson’s question about when the library opens on Saturday, with a reference answer of ten. A response of ten in the morning is right, and it does not match the reference character for character. Exact matching suits outputs that have one correct form, such as a date in a fixed format or a label from a short list."}</p>
<p>{"The first row is the one this page calculates, and it is the one most easily mistaken for the others. A model can become better at predicting ordinary text without becoming more accurate, more obedient to instructions or more careful with sources. Part 2 measures predictive fit. Part 3 returns to the rest."}</p>

</SubSection>
<SubSection title="2. Keep the comparison fair">
<p>{"A comparison is a claim that one thing changed. If the model changed and the prompt changed with it, the difference in score belongs to both, and there is no way to divide it between them afterward. That is the reason for recording every setting, including the ones that seem incidental."}</p>
<p>{"Use comparable test inputs and record the prompt, sampling settings, model version, and scoring procedure. A model that receives source passages is being tested under different conditions from one answering from its parameters alone."}</p>
<p>{"Keep final test examples separate from training and model selection. Repeatedly tuning against the test set turns it into another selection set. Check for near duplicates and shared source material as well as exact overlap."}</p>
<p>{"The usual arrangement gives each part of the data one job."}</p>
<NumberTable headings={["Split", "What it is used for", "How often it is consulted"]} rows={[["Training", "Learning the parameters", "Throughout training"], ["Validation", "Choosing settings and comparing versions", "As often as needed"], ["Test", "Estimating final performance", "As rarely as possible"]]} caption="Three roles for three separate sets of examples." />
<p>{"A test set loses its value gradually, not all at once. Each time a change is kept because it scored better on the test examples, the choice has been fitted a little to those particular examples. After enough rounds a high test score partly reports how well the choices suit that set, and the set can no longer say how the model will do on examples nobody has looked at."}</p>
<p>{"Overlap does the same damage from the other side. A test question that also appears in the training data, or appears there with a word changed, or is drawn from the same source document, can be answered from memory. It then measures recall of the training data where it was meant to measure ability on new inputs."}</p>

</SubSection>

</> },
{ title: "Part 2. Calculate Loss and Perplexity", content: <>
<SubSection title="3. Penalize confidence in the wrong continuation">
<p>{"Start with what the model hands us. At each position of a held-out text it produced a probability for every token in its vocabulary, and we know which token actually came next. The probability it gave that token is the whole of the raw material. A probability near one is a good prediction, and a probability near zero is a bad one."}</p>
<p>{"For every held-out position, record the probability of the observed target. Take its negative natural logarithm and average over scored positions. Perplexity is the exponential of that mean."}</p>
<p>{"The negative logarithm turns those probabilities into a cost. It is zero for a probability of one and grows without limit as the probability falls toward zero, so a confident miss costs far more than a hesitant one. Averaging gives a cost per token, and the exponential converts that average back to a scale that reads like a number of choices."}</p>
<Equation>{"Mean negative log likelihood = −(1 / N) Σₜ ln pₜ(yₜ)\nPerplexity = exp(Mean negative log likelihood)\n\nFor three equally probable vocabulary tokens:\np(target) = 1 / 3\nMean loss = −ln(1 / 3) = ln(3)\nPerplexity = exp(ln(3)) = 3"}</Equation>
<p>{"Lower values mean the model assigned more probability to the observed targets on this evaluation. Perplexity can be understood as an effective average uncertainty, not a literal count of choices considered at every position."}</p>
<p>{"Raising the wrong token’s logit reduces the target probability and increases both metrics. A confidently wrong model can therefore score worse than a less certain one."}</p>
<p>{"The live example makes these numbers by hand. It scores three positions over a vocabulary of three tokens, starts every logit at zero, and adds a boost to one logit in each row. With the boost on the target the model is confidently right. With the boost on another token it is confidently wrong. At a boost of 1 on the target, which is where the example starts, the calculation runs as follows."}</p>
<Equation>{"p(target) = e¹ / (e¹ + 2) ≈ 0.576\nMean loss = −ln(0.576) ≈ 0.551\nPerplexity = exp(0.551) ≈ 1.736"}</Equation>
<NumberTable headings={["Boost", "Placed on", "Target probability", "Mean loss", "Perplexity"]} rows={[["0", "no token", "0.333", "1.099", "3.000"], ["1", "the target", "0.576", "0.551", "1.736"], ["2", "the target", "0.787", "0.240", "1.271"], ["4", "the target", "0.965", "0.036", "1.037"], ["1", "a wrong token", "0.212", "1.551", "4.718"], ["2", "a wrong token", "0.107", "2.240", "9.389"], ["4", "a wrong token", "0.018", "4.036", "56.598"]]} caption="Seven settings of the live example. All three positions receive the same boost, so every position has the same target probability." />
<p>{"Read the perplexity column against the vocabulary of three. A value of 3 is what spreading probability evenly over the three tokens earns. Confidence in the right token brings it down toward 1, which is the floor, reached only by giving the target all of the probability. Confidence in a wrong token sends it past 3, to 4.7, then 9.4, then 56.6."}</p>
<p>{"That last figure is the reason for the warning about counts. There are three tokens, so no model is choosing among 56 of them. When every position has the same target probability, perplexity is one divided by that probability, and 56.6 is one divided by the 0.018 the target was left with. Perplexity reports how surprised the model was by what actually came next. A model can be more surprised than an even guess would have been, and the uniform row at 3 beats every row in which the confidence went to a wrong token."}</p>
</SubSection>
<SubSection title="4. Preserve the units of comparison">
<p>{"Perplexity is measured per token under a particular tokenizer and scoring protocol. Comparing values across different tokenizations or differently masked datasets can be misleading because the prediction units changed."}</p>
<p>{"The dependence on units is arithmetic, and the three-token example shows it. Suppose a text is scored as three tokens at a probability of one third each. Suppose a second tokenizer cuts the same text into six pieces, and the text as a whole receives the same total probability. The total cost is unchanged. The cost per token is halved, because there are twice as many tokens to share it."}</p>
<Equation>{"Total negative log likelihood = 3 × ln(3) ≈ 3.296\n\nScored as 3 tokens:  exp(3.296 / 3) = 3\nScored as 6 tokens:  exp(3.296 / 6) ≈ 1.732"}</Equation>
<p>{"Nothing about the model’s grasp of the text differs between those two lines. Only the size of the pieces differs, so a comparison of 3 against 1.732 would be a comparison of tokenizers. The same thing happens when two evaluations score different positions, since a mean over the easy positions and a mean over all of them are different means."}</p>
<p>{"A lower perplexity on one corpus does not establish a better assistant or image generator. Report the data and protocol beside the score, and use task-specific tests for the behaviors that matter."}</p>
<pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm leading-relaxed text-slate-100"><code>{"import numpy as np\nfrom oop_ml.numpy.modern import TokenCrossEntropy\n\nresult = TokenCrossEntropy().measure(\n    np.zeros((3, 3)), np.array([0, 1, 2]),\n)\nprint(result.value)\nprint(result.perplexity)"}</code></pre>
<p>{"The snippet scores the uniform case. It prints a mean loss of about 1.0986, which is ln 3, and a perplexity of 3."}</p>

</SubSection>

</> },
{ title: "Questions on Parts 1 and 2", quiz: [
choice(
  "With three equally probable vocabulary tokens, what is the perplexity at a scored position?",
  ["1 / 3", "ln(3)", "3", "1"],
  2,
  "The probability of the observed target is 1 / 3, so the mean negative log likelihood is ln(3) and the perplexity is its exponential, which is 3. Perplexity is best read as an effective average uncertainty rather than as a literal count of the choices the model considered at that position.",
),
trueFalse(
  "A confidently wrong model can score worse on these metrics than a less certain one.",
  true,
  "Raising the wrong token’s logit lowers the probability left for the observed target, and both the mean loss and the perplexity rise with it. What is being recorded is how much probability went to the observed targets, not how decisive the model sounded.",
),
several(
  "Which of these does keeping the comparison fair require?",
  [
    "Comparable test inputs, with the prompt, sampling settings, model version and scoring procedure recorded",
    "Final test examples kept separate from training and from model selection",
    "A check for near duplicates and shared source material, not only for exact overlap",
    "Each model scored under its own tokenizer, so none is disadvantaged",
  ],
  [0, 1, 2],
  "Repeatedly tuning against the test set turns it into another selection set, and a model that receives source passages is being tested under different conditions from one answering from its parameters alone. Perplexity is measured per token under a particular tokenizer, so scoring two models under different tokenizations compares different prediction units.",
),
choice(
  "With a boost of 4 placed on a wrong token, the live example reports a perplexity of about 56.6 over a vocabulary of three tokens. What does that figure mean?",
  [
    "It is one divided by the 0.018 the target was left with, a measure of surprise and not a count of choices",
    "The model was choosing among about 56 candidate tokens at each position",
    "The calculation has gone wrong, since perplexity cannot exceed the size of the vocabulary",
    "Each of the three positions contributed about 19 to a total",
  ],
  0,
  "When every position has the same target probability, perplexity is one divided by that probability. Spreading probability evenly over three tokens earns exactly 3, and a model that puts its confidence on a wrong token is more surprised by the target than an even guess would have been, so its perplexity passes 3. That is why the page reads perplexity as an effective average uncertainty.",
),
trueFalse(
  "A lower perplexity on one corpus establishes that a model is the better assistant.",
  false,
  "Perplexity asks how much probability a model assigns to held-out text under a particular tokenizer and scoring protocol. It does not ask whether an answer follows instructions, cites evidence correctly or solves the problem, so the data and protocol belong beside the score and the behaviors that matter need task-specific tests.",
),
] },
{ title: "Part 3. Evaluate the Generated Output as Well", content: <>
<SubSection title="5. Check grounded answers and open-ended responses">
<p>{"Everything in Part 2 scored text that someone else wrote. The model was asked how probable it found a continuation, and it never produced one. Once a model generates, there is a new thing to judge, which is the output itself, and the quality of an output is not a probability."}</p>
<p>{"For RAG, ask whether the necessary evidence was retrieved, whether the answer is correct, and whether each cited source supports its claim. These checks distinguish a retrieval miss from an answer-generation error."}</p>
<p>{"Take the previous lesson’s question again, when the library opens on Saturday, and suppose the answer comes with a citation. The three checks are separate, and an answer can pass one and fail another. If the Saturday passage was never retrieved, the first check fails and the model had nothing to work from. If it was retrieved and the answer says nine, the second check fails. If the answer says ten and cites the weekday passage, the answer is correct and the third check fails, because the cited source says nine."}</p>
<p>{"Human evaluators need concrete criteria and examples of how to apply them. Model-based judges also need validation: their preferences can depend on wording, answer order, and response length. Inspect disagreements and error categories instead of treating one judge’s score as ground truth."}</p>
<p>{"A judge is a measuring instrument and can be tested like one. Show it the same two answers in both orders. If its preference follows the position and not the answer, then order is part of what it measures. Rewording the instructions, or padding one answer with empty sentences, tests the other two dependencies the same way. Where the judge and a careful human reader disagree, the disagreements show what the judge is really responding to."}</p>
<p>{"For random generation, evaluate multiple samples and report variation when it matters. A cherry-picked response shows that a behavior is possible, not how reliably it occurs."}</p>
<p>{"The remedy is to count. Draw several samples from the same prompt with the same settings, record how many show the behavior, and report that count beside any example. One good sample among many failures and one good sample among many successes look the same when only the sample is shown."}</p>

</SubSection>
<SubSection title="6. Inspect image quality and distribution coverage">
<p>{"For an image generator, individual realism and coverage of the data distribution are separate concerns. A generator that produces one convincing picture repeatedly has little diversity. Inspect random samples and look for memorization, missing categories, and repeated structures."}</p>
<p>{"The lesson on adversarial networks met this as mode collapse. A generator that has learned to draw one convincing digit passes every inspection of a single picture and fails as a model of handwritten digits. Realism is a property of one picture. Coverage is a property of the whole set of pictures a generator produces, and it can only be judged on a set."}</p>
<p>{"Fréchet Inception Distance, or FID, compares summary statistics of real and generated image features from a particular pretrained network. It is a distribution-level comparison, not a correctness score for one picture. Sample count, preprocessing, reference data, and feature extraction need to be consistent."}</p>
<p>{"Unpacking that helps. A pretrained image network turns each picture into a list of numbers called features. Over many pictures those features have a mean and a spread. The distance compares the mean and spread of the real pictures’ features with the mean and spread of the generated pictures’ features, and a smaller distance says the two sets are distributed more alike. No single picture has a distance, so the measure cannot say which pictures are wrong."}</p>
<p>{"It shares perplexity’s weakness about units. Change the number of samples, the resizing, the reference pictures or the network that extracts the features, and the value changes although the generator has not. Two distances can be compared only when all of those were held the same."}</p>
<p>{"For a conditional generator, also evaluate whether the output matches the requested condition. Neither a low image-distribution distance nor attractive examples alone establishes that the model obeys a text prompt."}</p>
<p>{"The page calculates language-model loss and perplexity only. It does not present FID results or benchmark claims for any trained generator."}</p>

</SubSection>
<p>{"Heusel and colleagues introduce FID for comparing generated and real image distributions."}{" "}<a href="https://arxiv.org/abs/1706.08500">GANs Trained by a Two Time-Scale Update Rule Converge to a Local Nash Equilibrium</a>.</p>
</> },
{ title: "Questions on Part 3", quiz: [
choice(
  "What does Fréchet Inception Distance compare?",
  [
    "The correctness of one generated picture against a reference",
    "Summary statistics of real and generated image features from a particular pretrained network",
    "How closely a generated image matches the text prompt it was given",
    "How much probability the generator assigns to held-out images",
  ],
  1,
  "It is a distribution-level comparison rather than a correctness score for one picture, and sample count, preprocessing, reference data and feature extraction all have to be held consistent. Whether a conditional generator obeyed the requested condition is a separate evaluation that a low distance does not settle.",
),
choice(
  "An answer says the library opens at ten on Saturday, which is right, and cites the passage about weekday hours. Which check does it fail?",
  [
    "Whether the cited source supports the claim",
    "Whether the answer is correct",
    "None, since a correct answer has passed evaluation",
    "Whether the answer was the most probable continuation",
  ],
  0,
  "The answer is correct and the weekday passage says nine, so the citation does not support it. The checks are separate, and an answer can pass one and fail another. Correctness alone would have hidden that the model could not show where its answer came from, and probability is not among the checks at all.",
),
several(
  "Beyond whether the answer is correct, what does evaluating a retrieval-augmented answer involve?",
  [
    "Whether the necessary evidence was retrieved",
    "Whether each cited source supports its claim",
    "Whether the answer has the lowest perplexity among the candidates",
    "Taking a model judge’s score as ground truth",
  ],
  [0, 1],
  "Those two checks are what separate a retrieval miss from an answer-generation error. A model-based judge needs validation of its own, since its preferences can depend on wording, answer order and response length, so the disagreements and the error categories are what to inspect rather than the score.",
),
trueFalse(
  "For an image generator, individual realism and coverage of the data distribution are separate concerns.",
  true,
  "A generator that produces one convincing picture repeatedly has little diversity, which is why random samples are inspected for memorization, missing categories and repeated structures. Neither a low image-distribution distance nor a set of attractive examples establishes that the model obeys a text prompt.",
),
trueFalse(
  "The page reports Fréchet Inception Distance results for a trained image generator.",
  false,
  "It calculates language-model loss and perplexity only, and presents no such results or benchmark claims for any trained generator. The distance is described as the distribution-level comparison it is, with its paper cited, and nothing here measures one.",
),
] }
,
        {
          title: "Practice. Calculate Loss and Perplexity With the Library",
          practice: [
            exercise(
              "Boost the target, then boost a wrong token",
              ["Part 2 tabulated the live example at several boosts. Reproduce two of its rows. Score three positions over three tokens with a boost of 1 on each target, and again with the boost of 1 moved to the token after each target.", "For each case print the probability the first position gave its target, the mean loss and the perplexity, all to four places. The page arrived at perplexities of 1.736 and 4.718."],
              `import numpy as np
from oop_ml.numpy.modern import TokenCrossEntropy

targets = np.array([0, 1, 2])
rows = np.arange(3)
wrong = (targets + 1) % 3
for name, boosted in [("boost on the target", targets), ("boost on a wrong token", wrong)]:
    logits = np.zeros((3, 3))
    logits[rows, boosted] = 1.0
    # Measure the loss of these logits against the targets. Print the name,
    # the probability the first position gave its target, the mean loss
    # and the perplexity, to four places.`,
              `import numpy as np
from oop_ml.numpy.modern import TokenCrossEntropy

targets = np.array([0, 1, 2])
rows = np.arange(3)
wrong = (targets + 1) % 3
for name, boosted in [("boost on the target", targets), ("boost on a wrong token", wrong)]:
    logits = np.zeros((3, 3))
    logits[rows, boosted] = 1.0
    result = TokenCrossEntropy().measure(logits, targets)
    print(name)
    print(f"  target probability {result.probabilities[0, targets[0]]:.4f}")
    print(f"  mean loss {result.value:.4f}")
    print(f"  perplexity {result.perplexity:.4f}")`,
              `boost on the target
  target probability 0.5761
  mean loss 0.5514
  perplexity 1.7358
boost on a wrong token
  target probability 0.2119
  mean loss 1.5514
  perplexity 4.7183`,
              { hints: ["measure takes the logits and then the target ids, one per row. With no third argument every row is scored.", "The answer carries probabilities, which has the shape of the logits, value, which is the mean loss, and perplexity, which is the exponential of value.", "The probability the first position gave its target is the entry in row 0 and in the column of that row’s target."], check: numberCheck("What perplexity does the library report with the boost on a wrong token?", 4.7183, 0.0005, "With the boost on another token the target is left with 1 part in e plus 2, about 0.2119, and perplexity is one divided by that when every position has the same target probability. The value is above 3, the size of the vocabulary, because a model that is confident in the wrong token is more surprised by the target than an even guess would be. With the boost on the target the same arithmetic gives 1.7358.") },
            ),
            exercise(
              "Let one confident mistake into three predictions",
              ["The page’s tagline says to inspect what averages conceal. Build a case the live example cannot show. Give the first two positions a boost of 4 on their targets, and give the third position a boost of 4 on a wrong token. Score all three.", "Print each position’s token loss, then the mean loss and the perplexity, to four places. Two of the three predictions are nearly certain and right. Compare the perplexity with the 3 that an even guess earns, and find the position responsible."],
              `import numpy as np
from oop_ml.numpy.modern import TokenCrossEntropy

targets = np.array([0, 1, 2])
logits = np.zeros((3, 3))
logits[0, 0] = 4.0
logits[1, 1] = 4.0
logits[2, 0] = 4.0
# Measure the loss. Print each position's own token loss to four places,
# then the mean loss and the perplexity.`,
              `import numpy as np
from oop_ml.numpy.modern import TokenCrossEntropy

targets = np.array([0, 1, 2])
logits = np.zeros((3, 3))
logits[0, 0] = 4.0
logits[1, 1] = 4.0
logits[2, 0] = 4.0
result = TokenCrossEntropy().measure(logits, targets)

for position, loss in enumerate(result.per_token):
    print(f"position {position}  token loss {loss:.4f}")
print(f"mean loss {result.value:.4f}")
print(f"perplexity {result.perplexity:.4f}")`,
              `position 0  token loss 0.0360
position 1  token loss 0.0360
position 2  token loss 4.0360
mean loss 1.3693
perplexity 3.9326`,
              { hints: ["per_token on the answer holds one loss for each row, before any averaging.", "value is the mean of those losses, and perplexity is its exponential."], check: numberCheck("What perplexity do the three predictions have together?", 3.9326, 0.0005, "The two confident and correct positions cost 0.0360 each, and the confident mistake costs 4.0360, so the mean is 1.3693 and its exponential is 3.9326. That is worse than the 3 of a model that knows nothing, although two predictions out of three could hardly be better. The single number does not say which reading is right. The three token losses do, which is the case for inspecting what an average is made of.") },
            ),
            exercise(
              "Score the same predictions under two masks",
              ["Part 2 warned that perplexities from differently masked datasets are not comparable. Take one set of predictions in which the first position has a boost of 4 on its target and the other two positions are even guesses. Score every position, and then score only the last two.", "Print the mean loss and the perplexity for each to four places. The model and its predictions are identical in both measurements."],
              `import numpy as np
from oop_ml.numpy.modern import TokenCrossEntropy

targets = np.array([0, 1, 2])
logits = np.zeros((3, 3))
logits[0, 0] = 4.0
last_two = np.array([False, True, True])
# Measure once with every position scored and once with only the last
# two. Print the mean loss and the perplexity of each, to four places.`,
              `import numpy as np
from oop_ml.numpy.modern import TokenCrossEntropy

targets = np.array([0, 1, 2])
logits = np.zeros((3, 3))
logits[0, 0] = 4.0
last_two = np.array([False, True, True])

everything = TokenCrossEntropy().measure(logits, targets)
masked = TokenCrossEntropy().measure(logits, targets, last_two)
print(f"all positions   mean loss {everything.value:.4f}  perplexity {everything.perplexity:.4f}")
print(f"last two only   mean loss {masked.value:.4f}  perplexity {masked.perplexity:.4f}")`,
              `all positions   mean loss 0.7444  perplexity 2.1052
last two only   mean loss 1.0986  perplexity 3.0000`,
              { hints: ["The optional third argument of measure is one boolean per row, saying whether that row is scored.", "Both answers carry value and perplexity, each computed over the scored rows only."], check: numberCheck("What perplexity does the library report when every position is scored?", 2.1052, 0.0005, "The easy first position costs 0.0360 and the two even guesses cost ln 3 each, so the mean over all three is 0.7444 and the perplexity is 2.1052. Leave the easy position out and the same predictions score exactly 3. Nothing about the model changed between the two lines. Which positions were counted changed, so the two perplexities are measured in different units and cannot be set side by side.") },
            ),
          ],
        },
    ]}
  />;
}

