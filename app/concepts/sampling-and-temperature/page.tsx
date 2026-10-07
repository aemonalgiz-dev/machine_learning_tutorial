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
  title: "Sampling and Temperature · oop_ml",
  description: "Control how predictions become choices while keeping the model's learned weights fixed.",
};

export default function Page() {
  return <ConceptPage
    title="Sampling and Temperature"
    tagline="Control how predictions become choices while keeping the model's learned weights fixed."
    openingTitle="Must a Model Always Choose Its Favorite Word?"
    intuition={lessonIntuitions["sampling-and-temperature"]}
    technicalStart="Part 2. Calculate Temperature and Nucleus Filtering"
    prerequisites={<>Useful foundations: <Link href="/concepts/autoregressive-generation">Autoregressive generation</Link>{", "}<Link href="/concepts/loss-functions">softmax and cross-entropy</Link>.</>}
    playgroundIntro="First move temperature while top-p stays at one. Then lower top-p and inspect which candidates are retained. The final column is the distribution a sampler would use."
    playground={<ModernLearningExample topic="sampling-and-temperature" />}
    sections={[
{ title: "Part 1. Distinguish Scores, Probabilities, and Choices", content: <>
<SubSection title="1. A score is not a probability">
<p>{"Three different things are easy to run together here. A model produces scores. The scores are turned into probabilities. A selection rule turns the probabilities into one chosen token. The controls in this lesson act on the second step, and they are easier to follow once the three are held apart."}</p>
<p>{"A logit can be any finite real number. Softmax compares all vocabulary logits to produce nonnegative shares that total one. The absolute size of a score is less important than its difference from other scores."}</p>
<p>{"The live example holds four candidates and their scores fixed. The candidate sat has a logit of 2, slept has 1, ran has 0 and sang has −1. None of those is a probability. They do not total one, and one of them is negative. Softmax turns them into the shares in the last column."}</p>
<NumberTable headings={["candidate", "logit", "probability"]} rows={[["sat", "2", "0.6439"], ["slept", "1", "0.2369"], ["ran", "0", "0.0871"], ["sang", "−1", "0.0321"]]} caption="The live table at a temperature of one with top-p at one. Part 2 shows the arithmetic." />
<p>{"Only the gaps between the scores matter. Add 1,000 to every logit and the four probabilities come out the same, because each candidate is exactly as far from the others as before."}</p>
<p>{"Sampling uses these shares to make a random selection. One draw can select a relatively unlikely token. Over many independent draws from an unchanged distribution, selection frequencies approach the assigned probabilities. In text generation, the distribution normally changes after every appended token."}</p>
<WorkedExample title="Ten draws, then ten thousand">
<p>{"Drawing from the four shares above with one seeded random stream, the first ten selections were sat, sat, sat, sat, slept, ran, sat, slept, sat, ran. The candidate ran was drawn twice in ten with a share under nine percent, and sang was not drawn at all. Keep drawing from the same stream and the counts settle."}</p>
<NumberTable headings={["draws", "sat", "slept", "ran", "sang"]} rows={[["10", "6", "2", "2", "0"], ["100", "57", "24", "14", "5"], ["1,000", "620", "261", "86", "33"], ["10,000", "6,404", "2,436", "838", "322"], ["shares × 10,000", "6,439", "2,369", "871", "321"]]} caption="Counts of each candidate as the draws accumulate. The last row is what the shares predict for 10,000 draws." />
<p>{"A probability describes the long run of this table and promises nothing about its first row. Text generation rarely gets beyond the first row with any one distribution, because the next token is drawn from a new one."}</p>
</WorkedExample>

</SubSection>
<SubSection title="2. Use temperature to control concentration">
<p>{"Temperature divides the logits before softmax. A low positive value magnifies score differences and makes the distribution more concentrated. A high value reduces their influence and makes the distribution more even."}</p>
<NumberTable headings={["temperature", "sat", "slept", "ran", "sang"]} rows={[["0.1", "1.0000", "0.0000", "0.0000", "0.0000"], ["0.5", "0.8650", "0.1171", "0.0158", "0.0021"], ["1", "0.6439", "0.2369", "0.0871", "0.0321"], ["2", "0.4551", "0.2760", "0.1674", "0.1015"], ["3", "0.3849", "0.2758", "0.1976", "0.1416"]]} caption="The same four logits at five temperatures, from the lowest setting the control offers to the highest. Every row is in the same order." />
<p>{"Reading down a column shows what the control does. The favorite, sat, holds 0.8650 at a temperature of 0.5 and 0.3849 at 3. The least likely candidate, sang, moves the other way, from 0.0021 to 0.1416. The scores are the same in every row. What changes is how strongly the preference they express is acted on."}</p>
<p>{"For finite logits, positive temperature preserves ranking. At very low temperature, sampling concentrates on the maximum-score choices. Greedy decoding is implemented separately here, so there is no division by zero."}</p>
<p>{"Both statements are visible in the table. No row changes the order of the four candidates. And at 0.1 the favorite has everything to four decimal places, so sampling at that setting behaves like always taking the largest share, without a temperature of zero ever being needed."}</p>

</SubSection>

</> },
{ title: "Part 2. Calculate Temperature and Nucleus Filtering", content: <>
<SubSection title="3. Scale, exponentiate, and normalize">
<p>{"Let T be a strictly positive temperature, and let l contain the logits. Subtracting the maximum before exponentiating leaves the distribution unchanged and avoids overflow from large positive scores. The example holds the following four logits fixed."}</p>
<Equation>{"l = [2, 1, 0, −1]\n\nAt T = 1:\nshifted scores = [0, −1, −2, −3]\nweights = [1, exp(−1), exp(−2), exp(−3)]\nprobabilities = weights / sum(weights)\n\nIn general:\npᵢ = exp((lᵢ − max(l)) / T)\n     / Σⱼ exp((lⱼ − max(l)) / T)"}</Equation>
<p>{"The table calculates the normalized probabilities. The same scores and vocabulary remain in place while the temperature changes."}</p>
<WorkedExample title="Three temperatures, evaluated">
<p>{"The shifted scores are divided by the temperature, each result is exponentiated into a weight, and each weight is divided by the sum of the four."}</p>
<Equation>{"T = 1:    shifted scores / T = [0, −1, −2, −3]\n          weights ≈ [1, 0.3679, 0.1353, 0.0498],  sum ≈ 1.5530\n          probabilities ≈ [0.6439, 0.2369, 0.0871, 0.0321]\n\nT = 0.5:  shifted scores / T = [0, −2, −4, −6]\n          weights ≈ [1, 0.1353, 0.0183, 0.0025],  sum ≈ 1.1561\n          probabilities ≈ [0.8650, 0.1171, 0.0158, 0.0021]\n\nT = 2:    shifted scores / T = [0, −0.5, −1, −1.5]\n          weights ≈ [1, 0.6065, 0.3679, 0.2231],  sum ≈ 2.1975\n          probabilities ≈ [0.4551, 0.2760, 0.1674, 0.1015]"}</Equation>
<p>{"Dividing by a temperature below one stretches the gaps between the shifted scores, and dividing by a temperature above one shrinks them. The largest score always shifts to zero and keeps a weight of exactly one, so what temperature sets is how small the other weights are beside it."}</p>
<p>{"The logits of sat and slept are one apart, so the ratio of their probabilities is exp(1 / T). That is about 7.39 at a temperature of 0.5, 2.72 at 1 and 1.65 at 2. It stays above one at every positive temperature, which is the ranking being preserved."}</p>
<p>{"The subtraction earns its place when scores are large. With every logit raised by 1,000, exponentiating directly overflows and the division has nothing finite to work with. The shifted calculation returns the same four probabilities as before."}</p>
</WorkedExample>
</SubSection>
<SubSection title="4. Retain enough candidates to reach the threshold">
<p>{"Top-p, also called nucleus sampling, orders tokens by probability. Keep the smallest prefix whose cumulative probability reaches the threshold. Retain the token that crosses it, remove later tokens, and normalize again."}</p>
<p>{"Using the assigned distribution from the guided illustration gives a simple calculation:"}</p>
<Equation>{"Sorted probabilities = [0.50, 0.30, 0.15, 0.05]\nTop-p threshold = 0.80\n\nFirst candidate:   cumulative probability = 0.50\nSecond candidate:  cumulative probability = 0.50 + 0.30 = 0.80\nRetained shares = [0.50, 0.30]\n\nFinal distribution = [0.50 / 0.80, 0.30 / 0.80, 0, 0]\n                   = [0.625, 0.375, 0, 0]"}</Equation>
<p>{"These illustrative shares differ from the live table's softmax values. They show the filtering arithmetic without rounding ambiguity. A fixed top-p threshold can retain many tokens for an uncertain distribution and very few for a concentrated one."}</p>
<WorkedExample title="The same filter on the live table">
<p>{"At a temperature of one the live table’s probabilities are already in descending order, so the running total can be read straight down."}</p>
<NumberTable headings={["candidate", "probability", "cumulative probability"]} rows={[["sat", "0.6439", "0.6439"], ["slept", "0.2369", "0.8808"], ["ran", "0.0871", "0.9679"], ["sang", "0.0321", "1.0000"]]} />
<p>{"A threshold of 0.80 is not reached by sat alone and is reached once slept is added, so two candidates are retained and their shares are divided by what the two hold together."}</p>
<Equation>{"Retained shares = [0.6439, 0.2369],  total = 0.8808\n\nFinal distribution = [0.6439 / 0.8808, 0.2369 / 0.8808, 0, 0]\n                   ≈ [0.7311, 0.2689, 0, 0]"}</Equation>
<p>{"Moving the threshold along the control at this temperature, any setting up to 0.60 keeps sat alone, 0.65 to 0.85 keeps two candidates, 0.90 and 0.95 keep three, and only 1.00 keeps all four."}</p>
<p>{"Now hold the threshold at 0.80 and move the temperature instead."}</p>
<NumberTable headings={["temperature", "probabilities after temperature", "candidates retained", "final distribution"]} rows={[["0.5", "[0.8650, 0.1171, 0.0158, 0.0021]", "1", "[1, 0, 0, 0]"], ["1", "[0.6439, 0.2369, 0.0871, 0.0321]", "2", "[0.7311, 0.2689, 0, 0]"], ["2", "[0.4551, 0.2760, 0.1674, 0.1015]", "3", "[0.5065, 0.3072, 0.1863, 0]"]]} caption="One threshold and three different candidate sets. The more even the distribution, the further down the order the running total has to go." />
<p>{"This is the sense in which top-p adapts to the distribution, and it is also why the two controls have to be read together. Temperature is applied first, so it decides how many candidates a given threshold will reach."}</p>
</WorkedExample>
</SubSection>

</> },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            trueFalse(
              "Raising the temperature can change which token the model scores highest.",
              false,
              "For finite logits, positive temperature preserves ranking. A low value magnifies the differences between scores and a high value reduces their influence, and neither reorders the candidates. On the live table sat holds 0.8650 at a temperature of 0.5 and 0.3849 at 3, and it leads the other three at both.",
            ),
            choice(
              "Why is the maximum logit subtracted before exponentiating?",
              [
                "It leaves the distribution unchanged and avoids overflow from large positive scores",
                "It is what makes the probabilities total one",
                "It is how the temperature is applied",
                "It removes the lowest-scoring tokens from the vocabulary",
              ],
              0,
              "Softmax compares all vocabulary logits, and only the gaps between scores matter, so shifting every score by the same amount changes nothing about the answer. With every logit on the page raised by 1,000, exponentiating directly overflows, and the shifted calculation still returns 0.6439, 0.2369, 0.0871 and 0.0321. Dividing by the sum of the weights is the separate step that makes the shares total one.",
            ),
            choice(
              "Sorted probabilities are 0.50, 0.30, 0.15 and 0.05 and the top-p threshold is 0.80. What is the final distribution?",
              [
                "[0.625, 0.375, 0, 0]",
                "[0.50, 0.30, 0, 0]",
                "[0.50, 0.30, 0.15, 0]",
                "[0.625, 0.375, 0.1875, 0.0625]",
              ],
              0,
              "The smallest prefix whose cumulative probability reaches the threshold is the first two candidates, and the token that crosses it is retained rather than dropped. What is left is then normalized again, which is why the two shares total one instead of 0.80.",
            ),
            trueFalse(
              "With the top-p threshold held at 0.80, the live table retains one candidate at a temperature of 0.5, two at a temperature of 1 and three at a temperature of 2.",
              true,
              "Top-p keeps the smallest prefix whose cumulative probability reaches the threshold, so the count depends on the shape of the distribution. At 0.5 the favorite alone holds 0.8650. At 1 it holds 0.6439 and needs the second candidate to reach 0.8808. At 2 the first two reach only 0.7311, so a third is retained. A fixed threshold is not a fixed number of tokens.",
            ),
            trueFalse(
              "Over many independent draws from an unchanged distribution, selection frequencies approach the assigned probabilities.",
              true,
              "One draw can select a relatively unlikely token, so a single sample says very little about the shares. In the seeded run on the page, ran came up twice in the first ten draws with a share of 0.0871, and after 10,000 draws sat had been selected 6,404 times against a share of 0.6439. In text generation the distribution normally changes after every appended token, so the long run is rarely reached.",
            ),
        ],
        },
{ title: "Part 3. What the Controls Can and Cannot Do", content: <>
<SubSection title="5. Apply the selection policy explicitly">
<p>{"A selection policy is a short list of decisions, and each one changes the distribution the sampler finally draws from. Stating them in order is what makes a result repeatable and makes two results comparable."}</p>
<p>{"The SDK applies temperature first and top-p second. Its stable sort preserves vocabulary order when probabilities tie. Passing a random generator into sample keeps ownership of the random stream explicit."}</p>
<p>{"The code below asks for a temperature of 0.8 and a top-p of 0.9 on the page’s four logits, and then draws once from a seeded generator. Followed by hand, it goes like this."}</p>
<Equation>{"After temperature 0.8:  [0.7183, 0.2058, 0.0590, 0.0169]\nRunning total:          0.7183, then 0.9241\nRetained:               sat and slept\nFinal distribution:     [0.7773, 0.2227, 0, 0]\nSeeded draw:            slept"}</Equation>
<p>{"The order of the two controls changed the answer here. On the unscaled distribution a threshold of 0.9 is reached only at the third candidate, at 0.9679, so filtering first would have kept ran as well. The draw is worth a second look too. It selected slept, which held 0.2227 against 0.7773 for sat. The same policy with a different seed can return sat, and both are correct outputs of the policy."}</p>
<pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm leading-relaxed text-slate-100"><code>{"import numpy as np\nfrom oop_ml.numpy.modern import TokenDistribution\n\ndistribution = TokenDistribution.from_logits(\n    np.array([2.0, 1.0, 0.0, -1.0]),\n    temperature=0.8, top_p=0.9,\n)\ntoken_id = distribution.sample(np.random.default_rng(4))\nprint(distribution.probabilities)\nprint(token_id)"}</code></pre>

</SubSection>
<SubSection title="6. Evaluate the resulting behavior">
<p>{"Lower temperature can reduce variation, but it cannot remove an error already favored by the model. Higher temperature can surface alternatives, including unsuitable ones. Neither should be treated as a direct correctness control."}</p>
<WorkedExample title="When the favorite is the mistake">
<p>{"Suppose that for some prompt slept is the suitable continuation, and the model’s scores are the four on this page. Its favorite, sat, is then the mistake. The table follows the mistake, the suitable token and the two weakest candidates as the temperature moves."}</p>
<NumberTable headings={["temperature", "sat, the favored mistake", "slept, the suitable token", "ran or sang"]} rows={[["0.1", "1.0000", "0.0000", "0.0000"], ["0.5", "0.8650", "0.1171", "0.0180"], ["1", "0.6439", "0.2369", "0.1192"], ["2", "0.4551", "0.2760", "0.2689"], ["3", "0.3849", "0.2758", "0.3392"]]} caption="The last column is the combined share of the two weakest candidates." />
<p>{"Lowering the temperature makes the output steadier and makes it steadily wrong. At 0.1 the mistake is selected essentially every time. Raising it does give slept more room, from 0.2369 to 0.2760 at a temperature of 2, and it gives the two weakest candidates far more, from 0.1192 to 0.2689. At 3 they are together more likely than slept."}</p>
<p>{"At no setting does slept overtake sat, because temperature preserves ranking. Top-p cannot help either. It removes candidates from the bottom of the order, and this mistake sits at the top. Changing which token the model prefers takes a change to the scores, which means different context or different parameters."}</p>
</WorkedExample>
<p>{"A model's reported next-token probability, the probability after sampling adjustments, and the probability that an answer is factually correct are different quantities. Choose a policy by evaluating complete responses for the task."}</p>

</SubSection>
<p>{"This paper introduces nucleus sampling and studies how decoding choices affect generated text."}{" "}<a href="https://arxiv.org/abs/1904.09751">The Curious Case of Neural Text Degeneration</a>.</p>
<p>Continue with <Link href="/concepts/supervised-fine-tuning">Supervised Fine-Tuning</Link>.</p>
</> },
        {
          title: "Questions on Part 3",
          quiz: [
            choice(
              "In what order does the SDK apply the two controls, and how are ties settled?",
              [
                "Temperature first and top-p second, with a stable sort preserving vocabulary order on ties",
                "Top-p first and temperature second, with ties broken at random",
                "Temperature first and top-p second, with ties broken at random",
                "Either order, since the two commute",
              ],
              0,
              "The order is stated rather than left to the caller, and it changes the result. At a temperature of 0.8 and a top-p of 0.9 the page’s logits keep two candidates, where the same threshold measured on the unscaled distribution would have kept three. The stable sort means a tie is settled by vocabulary order rather than by whatever the sort happened to do.",
            ),
            trueFalse(
              "Lowering the temperature removes an error the model already favors.",
              false,
              "Lower temperature can reduce variation, but the error was favored by the model and concentrating the distribution only makes it more likely to be chosen. With sat as the favored mistake, it holds 0.6439 at a temperature of 1, 0.8650 at 0.5 and all of the distribution to four places at 0.1. Higher temperature can surface alternatives, including unsuitable ones, so neither direction is a correctness control.",
            ),
            several(
              "Take sat as a favored mistake and slept as the suitable token, on the page’s four logits. Which of these hold?",
              [
                "Raising the temperature from 1 to 2 adds more to ran and sang together than it adds to slept",
                "At no temperature does slept hold a larger share than sat",
                "At a temperature of 3, slept has overtaken sat",
                "A top-p of 0.80 at a temperature of 1 removes sat and keeps slept",
              ],
              [0, 1],
              "From a temperature of 1 to 2, slept goes from 0.2369 to 0.2760 while the two weakest candidates together go from 0.1192 to 0.2689. Temperature preserves ranking, so at 3 sat still leads slept by 0.3849 to 0.2758. Top-p removes candidates from the bottom of the order, so at 0.80 it keeps sat and slept and drops the other two, and the mistake stays at the top.",
            ),
            choice(
              "After a temperature of 0.8 and a top-p of 0.9, sat holds 0.7773 of the page’s final distribution. What does that figure establish?",
              [
                "The share sat holds in the distribution the sampler draws from",
                "The probability the model gave sat before the controls were applied",
                "The probability that sat is the factually correct continuation",
                "That a draw from the distribution will select sat",
              ],
              0,
              "The model’s own next-token probability, the probability after sampling adjustments and the probability that an answer is correct are three different quantities. Before the controls sat held 0.6439, and nothing in either number says whether sat is right. A share is also not an outcome, since the seeded draw on the page selected slept at 0.2227. A policy is chosen by evaluating complete responses for the task.",
            ),
        ],
        },
        {
          title: "Practice. Shaping a Selection Distribution With the Library",
          practice: [
            exercise(
              "Rebuild the temperature table, then shift the scores",
              ["Turn the page’s four logits into a distribution with TokenDistribution.from_logits at temperatures of 0.5, 1 and 2, and print each row of probabilities to four places. Then add 1,000 to every logit, build the distribution at a temperature of 1 again, and print it beside the first.", "The three rows should match the table in Part 1. The shifted row tests the claim that only the gaps between scores matter, on numbers large enough that exponentiating them directly would overflow."],
              `import numpy as np
from oop_ml.numpy.modern import TokenDistribution

candidates = ["sat", "slept", "ran", "sang"]
logits = np.array([2.0, 1.0, 0.0, -1.0])

for temperature in [0.5, 1.0, 2.0]:
    # Build the distribution at this temperature and print its four
    # probabilities to four places.
    pass

# Build it once more from logits + 1000 at a temperature of 1 and print
# that row, then print the probability of sat on a line of its own.
`,
              `import numpy as np
from oop_ml.numpy.modern import TokenDistribution

candidates = ["sat", "slept", "ran", "sang"]
logits = np.array([2.0, 1.0, 0.0, -1.0])

for temperature in [0.5, 1.0, 2.0]:
    distribution = TokenDistribution.from_logits(logits, temperature)
    row = "  ".join(f"{name} {share:.4f}" for name, share in zip(candidates, distribution.probabilities))
    print(f"temperature {temperature}: {row}")

shifted = TokenDistribution.from_logits(logits + 1000, 1.0)
row = "  ".join(f"{name} {share:.4f}" for name, share in zip(candidates, shifted.probabilities))
print(f"logits + 1000:   {row}")
print(f"sat at a temperature of 1: {shifted.probabilities[0]:.4f}")
`,
              `temperature 0.5: sat 0.8650  slept 0.1171  ran 0.0158  sang 0.0021
temperature 1.0: sat 0.6439  slept 0.2369  ran 0.0871  sang 0.0321
temperature 2.0: sat 0.4551  slept 0.2760  ran 0.1674  sang 0.1015
logits + 1000:   sat 0.6439  slept 0.2369  ran 0.0871  sang 0.0321
sat at a temperature of 1: 0.6439`,
              { hints: ["from_logits is called on the class, not on an instance. It takes the logits and then the temperature.", "The object it returns holds probabilities, one share per candidate in the order the logits were given.", "Adding 1000 to a numpy array adds it to every entry, so logits + 1000 is the shifted row of scores."], check: numberCheck("What probability does sat hold at a temperature of 1 after every logit is raised by 1,000, to four places?", 0.6439, 0.0005, "Softmax subtracts the largest logit before exponentiating, so the shifted scores are 0, −1, −2 and −3 whether the logits started at 2 or at 1,002. The weights and their sum are unchanged, and sat keeps the 0.6439 it has on the live table.") },
            ),
            exercise(
              "Hold top-p at 0.80 and move the temperature",
              ["With top_p fixed at 0.80, build the distribution at temperatures of 0.5, 1, 2 and 3. For each, print how many candidates were retained and the final probabilities to four places.", "Part 2 tabulates the first three temperatures. The row at 3 is not on the page. Before running it, decide from the table in Part 1 how many candidates a running total of 0.80 will need at that temperature."],
              `import numpy as np
from oop_ml.numpy.modern import TokenDistribution

logits = np.array([2.0, 1.0, 0.0, -1.0])

for temperature in [0.5, 1.0, 2.0, 3.0]:
    # Build the distribution at this temperature with top_p=0.8.
    # Print the number of candidates retained and the final
    # probabilities to four places.
    pass
# Print the final share of sat at a temperature of 3 on a line of its own.
`,
              `import numpy as np
from oop_ml.numpy.modern import TokenDistribution

logits = np.array([2.0, 1.0, 0.0, -1.0])

for temperature in [0.5, 1.0, 2.0, 3.0]:
    distribution = TokenDistribution.from_logits(logits, temperature, top_p=0.8)
    kept = int(distribution.retained.sum())
    shares = ", ".join(f"{share:.4f}" for share in distribution.probabilities)
    print(f"temperature {temperature}: {kept} retained, final [{shares}]")
print(f"sat at a temperature of 3: {distribution.probabilities[0]:.4f}")
`,
              `temperature 0.5: 1 retained, final [1.0000, 0.0000, 0.0000, 0.0000]
temperature 1.0: 2 retained, final [0.7311, 0.2689, 0.0000, 0.0000]
temperature 2.0: 3 retained, final [0.5065, 0.3072, 0.1863, 0.0000]
temperature 3.0: 3 retained, final [0.4484, 0.3213, 0.2302, 0.0000]
sat at a temperature of 3: 0.4484`,
              { hints: ["top_p is the third argument of from_logits. Temperature is applied before it, so the threshold is measured on the scaled distribution.", "retained is an array of booleans, one per candidate. Summing it counts the candidates that survived.", "The probabilities on the returned object are the final ones, already rescaled to total one over the retained candidates."], check: numberCheck("What final share does sat hold at a temperature of 3 with top-p at 0.80, to four places?", 0.4484, 0.0005, "At a temperature of 3 the four shares are 0.3849, 0.2758, 0.1976 and 0.1416. The first two total 0.6608, short of 0.80, and the third brings the running total to 0.8584, so three are retained. Dividing 0.3849 by 0.8584 gives sat 0.4484.") },
            ),
            exercise(
              "Draw ten thousand times from a filtered policy",
              ["Build the policy from the code in Part 3, a temperature of 0.8 with top_p at 0.9, and draw from it 10,000 times with one generator seeded at 0. Count how often each candidate was selected, and print the counts beside what the final shares predict.", "Part 3 gives the final distribution as 0.7773 for sat and 0.2227 for slept, with ran and sang removed. Check that the two removed candidates are never drawn, and see how close the count for slept comes to its share of 10,000."],
              `import numpy as np
from oop_ml.numpy.modern import TokenDistribution

candidates = ["sat", "slept", "ran", "sang"]
policy = TokenDistribution.from_logits(np.array([2.0, 1.0, 0.0, -1.0]), temperature=0.8, top_p=0.9)
generator = np.random.default_rng(0)

counts = [0, 0, 0, 0]
# Draw from the policy 10,000 times with the one generator, adding one
# to the count of whichever candidate each draw selects.

for name, count, share in zip(candidates, counts, policy.probabilities):
    print(f"{name}: drawn {count} times, share predicts {share * 10000:.0f}")
print(f"slept was drawn {counts[1]} times")
`,
              `import numpy as np
from oop_ml.numpy.modern import TokenDistribution

candidates = ["sat", "slept", "ran", "sang"]
policy = TokenDistribution.from_logits(np.array([2.0, 1.0, 0.0, -1.0]), temperature=0.8, top_p=0.9)
generator = np.random.default_rng(0)

counts = [0, 0, 0, 0]
for _ in range(10000):
    counts[policy.sample(generator)] += 1

for name, count, share in zip(candidates, counts, policy.probabilities):
    print(f"{name}: drawn {count} times, share predicts {share * 10000:.0f}")
print(f"slept was drawn {counts[1]} times")
`,
              `sat: drawn 7763 times, share predicts 7773
slept: drawn 2237 times, share predicts 2227
ran: drawn 0 times, share predicts 0
sang: drawn 0 times, share predicts 0
slept was drawn 2237 times`,
              { hints: ["sample takes the generator and returns the position of the selected candidate as an integer, so it can index the counts directly.", "Pass the same generator to every draw. A fresh generator with the same seed would return the same first draw 10,000 times."], check: numberCheck("How many of the 10,000 draws selected slept?", 2237, 0, "After a temperature of 0.8 and a top-p of 0.9, slept holds 0.2227 of the final distribution, which predicts 2,227 selections in 10,000 draws. The seeded run selects it 2,237 times, ten more than that, which is ordinary variation for a count of draws. It never selects ran or sang, because a removed candidate has a share of exactly zero.") },
            ),
            exercise(
              "Ask for a temperature of zero",
              ["Part 1 says greedy selection is implemented separately, so there is no division by zero. Ask from_logits for a temperature of 0 on the page’s logits, catch what the library raises, and print the name of the refusal and its message. Then get the greedy choice the supported way and print which candidate it is.", "There is no number to check here. A temperature of zero would divide every shifted score by zero, and the library declines to guess what was meant."],
              `import numpy as np
from oop_ml import MLLibError
from oop_ml.numpy.modern import TokenDistribution

candidates = ["sat", "slept", "ran", "sang"]
logits = np.array([2.0, 1.0, 0.0, -1.0])

try:
    TokenDistribution.from_logits(logits, temperature=0.0)
except MLLibError as refusal:
    # Print the name of the refusal's type and its message.
    pass

# Build the distribution at a temperature of 1 and print the candidate
# its greedy method selects.
`,
              `import numpy as np
from oop_ml import MLLibError
from oop_ml.numpy.modern import TokenDistribution

candidates = ["sat", "slept", "ran", "sang"]
logits = np.array([2.0, 1.0, 0.0, -1.0])

try:
    TokenDistribution.from_logits(logits, temperature=0.0)
except MLLibError as refusal:
    print(f"{type(refusal).__name__}: {refusal}")

distribution = TokenDistribution.from_logits(logits, temperature=1.0)
print(f"greedy selects {candidates[distribution.greedy()]}")
`,
              `InvalidValuesError: temperature must be finite and positive
greedy selects sat`,
              { hints: ["Every refusal the library raises derives from MLLibError, so one except clause catches it. type(refusal).__name__ gives the specific kind.", "greedy takes no arguments and no generator. It returns the position of the largest share, and temperature cannot change which position that is."] },
            ),
          ],
        },
    ]}
  />;
}

