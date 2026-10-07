import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { choice, several, trueFalse } from "@/lib/quizzes";
import { exercise, numberCheck } from "@/lib/exercises";
import { Equation } from "@/components/concept/Equation";
import { NumberTable, SubSection, WorkedExample } from "@/components/concept/Treatments";
import { ModernLearningExample } from "@/components/widgets/ModernLearningExample";
import { lessonIntuitions } from "@/lib/intuition";

export const metadata: Metadata = {
  title: "Autoregressive Generation · oop_ml",
  description: "Turn a next-token distribution into a response by extending the context one choice at a time.",
};

export default function Page() {
  return <ConceptPage
    title="Autoregressive Generation"
    tagline="Turn a next-token distribution into a response by extending the context one choice at a time."
    openingTitle="How Does One Predicted Token Become a Paragraph?"
    intuition={lessonIntuitions["autoregressive-generation"]}
    technicalStart="Part 2. The Probability of a Sequence"
    prerequisites={<>Useful foundations: <Link href="/concepts/next-token-prediction">Next-token prediction</Link>.</>}
    playgroundIntro="Inspect the first prefix, then follow the token appended at each step. Change the sampling seed to repeat the loop with different draws, or enable greedy selection. The end token can stop the loop before the requested length."
    playground={<ModernLearningExample topic="autoregressive-generation" />}
    sections={[
{ title: "Part 1. Follow One Complete Loop", content: <>
<SubSection title="1. Read the prefix and select the next token">
<p>{"A next-token model answers one question, which is what token is likely to follow this text. A response is many tokens long. The loop in this part is how one answer at a time becomes a sequence, and following it once with real numbers shows everything it does."}</p>
<p>{"Tokenize the prompt and run a forward pass. The final position's vocabulary scores describe what may follow the whole prefix. Convert them to a distribution, then apply the chosen selection rule."}</p>
<p>{"The live example uses the seven-entry vocabulary from the previous lesson and the prompt <start> the cat. A forward pass returns a row of seven scores at each of the three positions. The first two rows are predictions about tokens the prompt already contains, so generation has no use for them. Only the last row, the one read after the whole prefix, is turned into a distribution."}</p>
<NumberTable headings={["candidate", "probability after <start> the cat"]} rows={[["<start>", "0.1756"], ["the", "0.1208"], ["cat", "0.1815"], ["dog", "0.2334"], ["sat", "0.0395"], ["slept", "0.1728"], ["<end>", "0.0763"]]} caption="The decoder is untrained, so these shares say nothing about language. They are the distribution the loop has to choose from." />
<p>{"Greedy decoding selects a highest-probability token. Sampling draws according to the selection distribution. Both operate on a model prediction; neither modifies the learned parameters."}</p>
<p>{"On this row greedy decoding takes dog, the largest share at 0.2334. Sampling draws one token with the seven shares as its odds. Dog is the likeliest single outcome, and it is still more likely than not that the draw lands somewhere else. With the default seed the draw happens to be dog as well."}</p>

</SubSection>
<SubSection title="2. Append, then predict with the new context">
<p>{"The selected ID is appended to the prefix before another forward pass. A later distribution depends on the earlier selections. The model does not first write a whole answer in a hidden buffer and reveal it one token at a time."}</p>
<p>{"Autoregressive describes this dependence on earlier sequence elements. A token can be a word part, so a generated step need not correspond to a complete word."}</p>
<Equation>{"Initial prefix:       the cat\nIllustrative choice:  sat\nNext prefix:          the cat sat\nNext prediction:      distribution after the cat sat"}</Equation>
<p>{"The displayed continuation is an illustration of the loop. The live example uses an untrained decoder and can produce incoherent sequences."}</p>
<WorkedExample title="The default run, one pass per row">
<p>{"With sampling, the default seed and five new tokens, the live example runs as follows. Each row is one forward pass, and each prefix is the previous prefix with the previous selection appended."}</p>
<NumberTable headings={["step", "prefix read", "selected token", "selection probability"]} rows={[["1", "<start> the cat", "dog", "0.2334"], ["2", "<start> the cat dog", "the", "0.1179"], ["3", "<start> the cat dog the", "<start>", "0.2015"], ["4", "<start> the cat dog the <start>", "<start>", "0.0938"], ["5", "<start> the cat dog the <start> <start>", "slept", "0.2696"]]} caption="The start token is an ordinary vocabulary entry to this untrained decoder, so it can be selected again." />
<p>{"Now run the same prompt with greedy selection. Step 1 is identical, because dog is both the largest share and the token the default seed drew. At step 2 the distribution after <start> the cat dog gives dog the largest share again, 0.2388, and greedy decoding takes it, where the draw landed on the at 0.1179. From that point the two runs read different prefixes, so each later pass is answering a different question. The greedy run continues dog, slept, slept, with selection probabilities of 0.2450, 0.2495 and 0.3438."}</p>
<p>{"Nothing about the model changed between the two runs or between any two steps. The parameters are fixed. The only thing that moves is the prefix, and one different selection at step 2 was enough to change every prefix after it."}</p>
</WorkedExample>
</SubSection>

</> },
{ title: "Part 2. The Probability of a Sequence", content: <>
<SubSection title="3. Combine conditional predictions">
<p>{"A conditional probability describes a token given the prefix before it. The chain rule writes the probability of a whole continuation as a product of these next-token probabilities. Here x names tokens and T names the sequence length."}</p>
<Equation>{"p(x₁, …, x_T) = ∏ₜ p(xₜ | x₁, …, xₜ₋₁)\n\nFor an illustrative two-token continuation:\np(sat | the cat) = 0.5\np(<end> | the cat sat) = 0.4\n\np(sat, <end> | the cat) = 0.5 × 0.4 = 0.2"}</Equation>
<p>{"These are assigned probabilities to expose the multiplication. If a sampler changes probabilities through temperature or filtering, the sampling policy's sequence probability uses those changed distributions."}</p>
<WorkedExample title="The probability of each default run">
<p>{"The table in step 2 supplies real factors. Each selection probability there is the probability of that token given the prefix beside it, which is exactly the term the chain rule asks for. Multiply the five from the sampled run, and separately the five from the greedy run."}</p>
<Equation>{"Sampled run:  0.2334 × 0.1179 × 0.2015 × 0.0938 × 0.2696 ≈ 0.000140\nGreedy run:   0.2334 × 0.2388 × 0.2450 × 0.2495 × 0.3438 ≈ 0.001171"}</Equation>
<p>{"The factors shown are rounded and the products were calculated from the unrounded ones. Both products are small, and that is ordinary. Every factor is below one, so a sequence probability shrinks with each token, and a long sequence has a tiny probability even when every step was a likely one. Two sequences are compared fairly only at the same length. At five tokens the greedy run is roughly eight times as probable as the sampled one."}</p>
<p>{"The caution about changed distributions applies as soon as a control moves. At a temperature of 0.5 the first distribution gives dog a share of 0.3202 in place of 0.2334. A run sampled at that temperature was drawn from the 0.3202 row, so that is the factor its probability under the sampling policy uses."}</p>
</WorkedExample>
</SubSection>
<SubSection title="4. Understand why greedy choices are local">
<p>{"Choosing the largest probability at one step does not guarantee the highest-probability complete sequence. That choice also selects which future distributions become available. A locally less likely first token can lead to much more probable later tokens."}</p>
<WorkedExample title="Where the greedy run is overtaken">
<p>{"Compare two continuations of four tokens from the same prompt. They share their first two selections and part at the third, where the distribution after <start> the cat dog dog gives dog a share of 0.2450 and <start> a share of 0.1921. Greedy decoding takes dog."}</p>
<Equation>{"Greedy:       dog      dog      dog      slept\n              0.2334 × 0.2388 × 0.2450 × 0.2495 ≈ 0.003405\n\nAlternative:  dog      dog      <start>  slept\n              0.2334 × 0.2388 × 0.1921 × 0.3835 ≈ 0.004104"}</Equation>
<p>{"Taking <start> at the third step gives up some probability there. The fourth step repays it. After the alternative prefix, slept has a share of 0.3835, and after the greedy prefix the best share on offer is 0.2495. The greedy rule never sees that trade, because at the third step it compares 0.2450 with 0.1921 and looks no further."}</p>
<p>{"Seven candidates at each of four steps make 2,401 possible continuations. Scoring every one of them on this decoder puts the alternative first and the greedy continuation fourth. At two and at three tokens the greedy continuation is the most probable of all, so the gap opens only at the fourth step. A greedy choice can be the best one for a while and then stop being so."}</p>
</WorkedExample>
<p>{"Beam search keeps several partial sequences to explore this issue, but search and open-ended writing are different objectives. A more probable sequence is not necessarily a more useful response. The lesson's controls focus on greedy selection and sampling."}</p>

</SubSection>

</> },
{ title: "Questions on Parts 1 and 2", quiz: [
trueFalse(
  "The model writes a whole answer in a hidden buffer and reveals it one token at a time.",
  false,
  "Each selected ID is appended to the prefix before another forward pass runs, so a later distribution depends on the earlier selections. There is no completed answer waiting anywhere, which is what autoregressive names.",
),
trueFalse(
  "Sampling updates the learned parameters as the sequence grows, which is why later steps behave differently from earlier ones.",
  false,
  "Greedy decoding and sampling both operate on a model prediction and neither modifies the learned parameters. What changes between steps is the prefix the forward pass reads. In the default run the share given to the start token falls from 0.2015 at step 3 to 0.0938 at step 4, and the only thing that differed was one more token in the prefix.",
),
choice(
  "Why does taking the largest probability at every step fail to guarantee the highest-probability complete sequence?",
  [
    "Sampling noise accumulates across the steps",
    "Each choice also selects which future distributions become available",
    "The distribution stops totalling one once a token has been appended",
    "The end token carries a fixed probability the model cannot change",
  ],
  1,
  "A locally less likely token can lead to much more probable later tokens, which is what makes a greedy choice local. On the page’s decoder the greedy four-token continuation has a probability of 0.003405, and taking the start token at the third step, at 0.1921 against 0.2450 for dog, leads to slept at 0.3835 and a product of 0.004104. Beam search keeps several partial sequences to explore that, although a more probable sequence is not necessarily a more useful response.",
),
choice(
  "Taking the illustrative figures, p(sat | the cat) of 0.5 and p(<end> | the cat sat) of 0.4, what does the chain rule give the two-token continuation?",
  ["0.9", "0.5", "0.4", "0.2"],
  3,
  "The chain rule writes the probability of a whole continuation as the product of the next-token probabilities, each conditioned on the prefix before it. The figures here are assigned rather than predicted, so that the multiplication is visible. The same rule applied to the five selection probabilities of the default sampled run gives about 0.000140.",
),
trueFalse(
  "If a sampler changes the distribution through temperature or filtering, the sequence probability under that sampling policy is computed from the changed distributions.",
  true,
  "The chain rule multiplies whatever distribution the tokens were actually drawn from. At a temperature of 0.5 the first distribution gives dog a share of 0.3202 in place of 0.2334, so a run sampled there uses 0.3202 as its first factor. A sampling policy that alters the distribution has a sequence probability of its own, which is not the one the unmodified model assigns.",
),
] },
{ title: "Part 3. Stop, Reproduce, and Inspect", content: <>
<SubSection title="5. Give the loop explicit limits">
<p>{"A loop that appends a token and predicts again has no natural end. Something has to say when the response is finished, and something else has to guarantee the loop halts when the first thing never happens."}</p>
<p>{"The SDK stops at an optional end token, the requested number of new tokens, or its context bound. The end token is a model selection, so an untrained model may select it immediately or fail to select it. A length bound makes the loop finite regardless."}</p>
<WorkedExample title="Four runs and how each one ended">
<p>{"All four runs start from the prompt <start> the cat and treat <end> as the end token. After the prompt its share is 0.0763, so a draw can select it at the very first step."}</p>
<NumberTable headings={["selection", "new tokens requested", "tokens selected", "what stopped the loop"]} rows={[["sampling, seed 0", "5", "dog the <start> <start> slept", "the length bound"], ["sampling, seed 1", "5", "dog <end>", "the end token, at step 2"], ["sampling, seed 4", "5", "<end>", "the end token, at step 1"], ["greedy", "12", "dog dog dog, then slept nine times", "the length bound"]]} caption="Across the 101 seeds the control offers, at the default temperature, 25 runs of five new tokens stop early on the end token." />
<p>{"The seed 4 run produced a response with nothing in it, and the greedy run never selected the end token in the twelve steps the control allows, because <end> never held the largest share. Neither is a fault in the loop. An untrained model has not learned where a response should end, and the length bound is what keeps the second case finite."}</p>
<p>{"The context bound is the third limit. It is the longest prefix the model can read. With that bound set to five tokens, the seed 0 run stops after two new tokens however many are requested, because the three prompt tokens and two selections fill it."}</p>
</WorkedExample>
<p>{"A fixed random seed reproduces sampling when model parameters, inputs, and selection settings are fixed. Greedy decoding does not use the seed. Different full-scale hardware and numerical implementations may need additional controls for reproducibility."}</p>
<p>{"Both statements can be checked on the live example. Running the default settings twice gives the same five tokens both times. Greedy decoding gives dog, dog, dog, slept, slept whichever seed is set, because it never draws anything."}</p>
<pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm leading-relaxed text-slate-100"><code>{"import numpy as np\nfrom oop_ml.numpy.modern import CausalLanguageModel\n\nmodel = CausalLanguageModel(n_vocab=7)\nsteps = model.generate(\n    np.array([0, 1, 2]), max_new_tokens=5,\n    seed=0, end_id=6,\n)\nfor step in steps:\n    print(step.context, step.token_id)"}</code></pre>

</SubSection>
<SubSection title="6. Recognize what an inference cache changes">
<p>{"This reference implementation recomputes the prefix on each step. A key/value cache can reuse attention keys and values from earlier positions, avoiding repeated work. It preserves information from earlier computation; it does not train the model or retrieve facts from an external database."}</p>
<p>{"The table in step 2 shows how much is repeated. Its five passes read prefixes of three, four, five, six and seven tokens, and every pass starts again from the first token."}</p>
<Equation>{"Positions read without a cache = 3 + 4 + 5 + 6 + 7 = 25\nDistinct positions in the longest prefix read = 7"}</Equation>
<p>{"The reuse is safe because of the causal mask. A position reads only the tokens at or before it, so appending a token leaves the keys and values of every earlier position exactly as they were. Only the new position has to be computed. The selected tokens and their probabilities come out the same with or without a cache, and the gap between the two counts widens as the sequence grows."}</p>
<p>{"Generation can continue an early mistake because that mistake becomes context. Inspect output for the task that matters rather than treating fluent continuation or a high selection probability as evidence of truth."}</p>
<p>{"The default run shows the mechanism with no notion of truth involved. One unlikely draw at step 2, the at a share of 0.1179, changed every prefix after it, and no later step had a way to go back. A trained model is in the same position when an early token is wrong. It continues from what is there."}</p>

</SubSection>
<p>{"The paper describes an autoregressive model used through text prompts without parameter updates at inference time."}{" "}<a href="https://arxiv.org/abs/2005.14165">Language Models are Few-Shot Learners</a>.</p>
<p>Continue with <Link href="/concepts/sampling-and-temperature">Sampling and Temperature</Link>.</p>
</> },
{ title: "Questions on Part 3", quiz: [
several(
  "Which of these can bring the SDK generation loop to a stop?",
  [
    "An optional end token",
    "The requested number of new tokens",
    "The model’s context bound",
    "Every token in the distribution falling below a probability threshold",
  ],
  [0, 1, 2],
  "The end token is a model selection, so an untrained model may select it immediately, as the seed 4 run does at step 1, or fail to select it at all, as the greedy run does through twelve steps. That is exactly why a length bound is worth having, since it makes the loop finite regardless. No threshold on the distribution enters the stopping rule.",
),
trueFalse(
  "Fixing the random seed makes greedy decoding reproducible where it otherwise would not be.",
  false,
  "Greedy decoding does not use the seed, because it selects a highest-probability token rather than drawing one, and on the live example it gives dog, dog, dog, slept, slept whichever seed is set. The seed reproduces sampling, and only when model parameters, inputs and selection settings are fixed as well.",
),
choice(
  "What does a key/value cache change about the loop?",
  [
    "It trains the model on the tokens generated so far",
    "It retrieves facts from an external database",
    "It reuses attention keys and values from earlier positions, avoiding repeated work",
    "It changes which token is selected at each step",
  ],
  2,
  "The reference implementation recomputes the whole prefix on each step, so the five passes of the default run read 25 positions where the longest prefix holds 7. The cache is what removes that repeated work. It preserves information from earlier computation and nothing else, so the sequence it produces is the same one.",
),
trueFalse(
  "An early mistake can carry through the rest of a generated sequence.",
  true,
  "The mistake becomes context for every later step, so the model continues from it rather than from what was intended. In the default run one unlikely draw at step 2 changed every prefix after it. Fluent continuation and a high selection probability are not evidence of truth, which is why output has to be inspected for the task that matters.",
),
] }
,
        {
          title: "Practice. Running the Generation Loop With the Library",
          practice: [
            exercise(
              "Run the default loop and multiply it out",
              ["Build the page’s decoder with CausalLanguageModel and generate five new tokens from the prompt <start> the cat with seed 0 and <end> as the end token. Print what each step read, which token it selected and at what probability, then the probability of the whole run to six places.", "Part 1 lists the five steps and Part 2 multiplies their selection probabilities. Your rows should match the table, and the product should match the chain rule figure for the sampled run."],
              `import numpy as np
from oop_ml.numpy.modern import CausalLanguageModel

vocabulary = ["<start>", "the", "cat", "dog", "sat", "slept", "<end>"]
model = CausalLanguageModel(len(vocabulary))
prompt = np.array([0, 1, 2])  # <start> the cat

# Generate five new tokens with seed 0 and end_id 6. For each step print
# the prefix it read, the token it selected and that token's probability
# to four places. Multiply the probabilities as you go and print the
# product to six places.
`,
              `import numpy as np
from oop_ml.numpy.modern import CausalLanguageModel

vocabulary = ["<start>", "the", "cat", "dog", "sat", "slept", "<end>"]
model = CausalLanguageModel(len(vocabulary))
prompt = np.array([0, 1, 2])  # <start> the cat

steps = model.generate(prompt, max_new_tokens=5, seed=0, end_id=6)
probability = 1.0
for number, step in enumerate(steps, start=1):
    read = " ".join(vocabulary[token] for token in step.context)
    chosen = step.distribution[step.token_id]
    probability *= chosen
    print(f"step {number}: read [{read}] selected {vocabulary[step.token_id]} at {chosen:.4f}")
print(f"probability of the run {probability:.6f}")
`,
              `step 1: read [<start> the cat] selected dog at 0.2334
step 2: read [<start> the cat dog] selected the at 0.1179
step 3: read [<start> the cat dog the] selected <start> at 0.2015
step 4: read [<start> the cat dog the <start>] selected <start> at 0.0938
step 5: read [<start> the cat dog the <start> <start>] selected slept at 0.2696
probability of the run 0.000140`,
              { hints: ["generate returns a list with one entry per new token, in order. Sampling is the default, so only the seed, the length and the end token need stating.", "Each entry holds context, the token IDs that pass read, distribution, the seven probabilities it chose from, and token_id, the one it selected.", "The selection probability at a step is distribution[token_id]. The chain rule multiplies those across the steps."], check: numberCheck("What is the probability of the whole sampled run, to six places?", 0.00014, 1e-06, "The chain rule multiplies the five selection probabilities, 0.2334, 0.1179, 0.2015, 0.0938 and 0.2696, each one conditioned on the prefix read at its step. Every factor is below one, so five of them already bring the product down to about 0.000140.") },
            ),
            exercise(
              "Overrule the greedy third step",
              ["Part 2 found a four-token continuation more probable than the greedy one, by taking <start> at the third step. Extend the comparison to five tokens. Get the greedy continuation from generate, copy it with the third token replaced by <start>, and score both by asking the model for one distribution at a time. Print each running product after the fourth and the fifth token.", "The four-token products are on the page. The five-token product of the alternative is not. See whether the alternative is still ahead once both runs have taken a fifth token."],
              `import numpy as np
from oop_ml.numpy.modern import CausalLanguageModel

vocabulary = ["<start>", "the", "cat", "dog", "sat", "slept", "<end>"]
model = CausalLanguageModel(len(vocabulary))
prompt = [0, 1, 2]  # <start> the cat

greedy = [step.token_id for step in model.generate(np.array(prompt), max_new_tokens=5, greedy=True)]
alternative = greedy[:2] + [0] + greedy[3:]  # <start> at the third step

for label, continuation in [("greedy", greedy), ("alternative", alternative)]:
    prefix = list(prompt)
    probability = 1.0
    for count, token in enumerate(continuation, start=1):
        # Ask the model for the distribution after this prefix, multiply
        # in the probability of \`token\`, and append the token.
        if count >= 4:
            print(f"{label} after {count} tokens {probability:.6f}")
`,
              `import numpy as np
from oop_ml.numpy.modern import CausalLanguageModel

vocabulary = ["<start>", "the", "cat", "dog", "sat", "slept", "<end>"]
model = CausalLanguageModel(len(vocabulary))
prompt = [0, 1, 2]  # <start> the cat

greedy = [step.token_id for step in model.generate(np.array(prompt), max_new_tokens=5, greedy=True)]
alternative = greedy[:2] + [0] + greedy[3:]  # <start> at the third step

for label, continuation in [("greedy", greedy), ("alternative", alternative)]:
    print(label, "is", " ".join(vocabulary[token] for token in continuation))
    prefix = list(prompt)
    probability = 1.0
    for count, token in enumerate(continuation, start=1):
        step = model.generate(np.array(prefix), max_new_tokens=1, greedy=True)[0]
        probability *= step.distribution[token]
        prefix.append(token)
        if count >= 4:
            print(f"{label} after {count} tokens {probability:.6f}")
`,
              `greedy is dog dog dog slept slept
greedy after 4 tokens 0.003405
greedy after 5 tokens 0.001171
alternative is dog dog <start> slept slept
alternative after 4 tokens 0.004104
alternative after 5 tokens 0.001395`,
              { hints: ["generate with max_new_tokens=1 returns a list of one step, and that step’s distribution is the model’s prediction after the prefix you handed it. Which token it selected does not matter here.", "The probability of the token you want is distribution[token], whether or not it was the one selected.", "Append the token to the prefix before the next pass, so the next distribution is conditioned on it."], check: numberCheck("What is the five-token probability of the alternative continuation, to six places?", 0.001395, 1e-06, "The alternative gives up probability at the third step, 0.1921 for the start token against 0.2450 for dog, and is repaid at the fourth, where slept has 0.3835. It is still ahead after a fifth token, at 0.001395 against 0.001171 for the greedy run, so the lead it took at four tokens was not undone by the next step.") },
            ),
            exercise(
              "Count how the seeds end",
              ["Run the loop once for each seed from 0 to 100, asking for five new tokens with <end> as the end token, and record how many tokens each run produced. Print how many runs there were of each length, how many stopped before the fifth token, and how many ended at the very first step.", "Part 3 says 25 of these runs stop early. The number that stop at the first step is not on the page. Compare it with the share the end token has after the prompt, which Part 1 gives as 0.0763."],
              `import numpy as np
from oop_ml.numpy.modern import CausalLanguageModel

model = CausalLanguageModel(7)
prompt = np.array([0, 1, 2])  # <start> the cat

lengths = []
for seed in range(101):
    # Generate up to five new tokens with this seed and end_id 6, and
    # record how many tokens came back.
    pass

for length in range(1, 6):
    print(f"runs of {length} new tokens: {lengths.count(length)}")
# Print how many runs stopped before the fifth token, and how many
# ended at the first step.
`,
              `import numpy as np
from oop_ml.numpy.modern import CausalLanguageModel

model = CausalLanguageModel(7)
prompt = np.array([0, 1, 2])  # <start> the cat

lengths = []
for seed in range(101):
    steps = model.generate(prompt, max_new_tokens=5, seed=seed, end_id=6)
    lengths.append(len(steps))

for length in range(1, 6):
    print(f"runs of {length} new tokens: {lengths.count(length)}")
print(f"stopped before the fifth token: {sum(1 for length in lengths if length < 5)}")
print(f"ended at the first step: {lengths.count(1)}")
`,
              `runs of 1 new tokens: 9
runs of 2 new tokens: 7
runs of 3 new tokens: 2
runs of 4 new tokens: 7
runs of 5 new tokens: 76
stopped before the fifth token: 25
ended at the first step: 9`,
              { hints: ["The loop stops as soon as it selects the end token, so a run that ended early simply returns a shorter list. Its length is the number of tokens it produced.", "A run of length one selected <end> straight after the prompt."], check: numberCheck("How many of the 101 runs select the end token at the first step?", 9, 0, "After the prompt the end token has a share of 0.0763, so each run has about that chance of ending at once, which over 101 runs is an expectation of nearly eight. Nine did. The count is a tally of draws, so it sits near the share without having to equal it.") },
            ),
            exercise(
              "Fill the context bound, then exceed it",
              ["Build the decoder with max_context=5 and ask it for twelve new tokens from the same prompt with seed 0. Print how many it produced and which. Then hand the same model a prompt of six tokens and catch what the library raises, printing the name of the refusal and its message.", "Part 3 names the context bound as the third thing that stops the loop. There is no number to check here. Notice that running into the bound during generation ends the loop quietly, while starting beyond it is refused."],
              `import numpy as np
from oop_ml import MLLibError
from oop_ml.numpy.modern import CausalLanguageModel

vocabulary = ["<start>", "the", "cat", "dog", "sat", "slept", "<end>"]
model = CausalLanguageModel(len(vocabulary), max_context=5)

# Generate up to twelve new tokens from [0, 1, 2] with seed 0 and
# end_id 6. Print how many tokens came back and what they were.

try:
    model.generate(np.array([0, 1, 2, 3, 3, 3]), max_new_tokens=1)
except MLLibError as refusal:
    # Print the name of the refusal's type and its message.
    pass
`,
              `import numpy as np
from oop_ml import MLLibError
from oop_ml.numpy.modern import CausalLanguageModel

vocabulary = ["<start>", "the", "cat", "dog", "sat", "slept", "<end>"]
model = CausalLanguageModel(len(vocabulary), max_context=5)

steps = model.generate(np.array([0, 1, 2]), max_new_tokens=12, seed=0, end_id=6)
selected = " ".join(vocabulary[step.token_id] for step in steps)
print(f"asked for 12 new tokens, received {len(steps)}: {selected}")

try:
    model.generate(np.array([0, 1, 2, 3, 3, 3]), max_new_tokens=1)
except MLLibError as refusal:
    print(f"{type(refusal).__name__}: {refusal}")
`,
              `asked for 12 new tokens, received 2: dog the
ShapeMismatchError: supply a nonempty prefix within max_context`,
              { hints: ["max_context is set when the model is built, not when generate is called. It is the longest prefix a forward pass will read.", "The three prompt tokens leave room for two more, so the loop ends after two selections without raising anything.", "Every refusal the library raises derives from MLLibError, so one except clause catches it. type(refusal).__name__ gives the specific kind."] },
            ),
          ],
        },
    ]}
  />;
}

