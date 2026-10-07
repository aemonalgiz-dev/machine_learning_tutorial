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
  title: "Diffusion Models · oop_ml",
  description: "Create a learning task from controlled corruption, then use a trained reverse process to generate.",
};

export default function Page() {
  return <ConceptPage
    title="Diffusion Models"
    tagline="Create a learning task from controlled corruption, then use a trained reverse process to generate."
    openingTitle="Can Learning to Remove Noise Teach a Model to Create?"
    intuition={lessonIntuitions["diffusion-models"]}
    technicalStart="Part 2. Calculate a Noisy Training Pair"
    prerequisites={<>Useful foundations: <Link href="/concepts/loss-functions">Loss functions</Link>{", "}<Link href="/concepts/convolutional-networks">convolutional networks</Link>{", "}<Link href="/concepts/u-net">U-Net</Link>.</>}
    playgroundIntro="Increase the forward noise step while the oracle fraction stays at zero. Then supply more of the true noise and compare the estimated clean signal. At fraction one the exact noise is available, so recovery is an algebra check, not a learned denoising result."
    playground={<ModernLearningExample topic="diffusion-models" />}
    sections={[
{ title: "Part 1. Construct the Supervision Ourselves", content: <>
<SubSection title="1. Define a forward corruption schedule">
<p>{"Supervised learning needs inputs paired with correct answers. For generating pictures nobody can supply the answer, because there is no single correct picture to produce. Diffusion gets its answers another way. It damages clean examples itself, in a way it can describe exactly, and keeps a record of the damage. The record is the answer."}</p>
<p>{"A forward step reduces the previous signal slightly and adds Gaussian noise. The schedule sets how much noise enters at each step. After enough corruption, the resulting distribution can become close to a simple Gaussian distribution."}</p>
<p>{"The example on this page is a strip of six pixels, two dark, two bright and two dark, written [0, 0, 1, 1, 0, 0]. Its schedule has twenty steps of equal strength. The first step multiplies the strip by about 0.9487 and adds a Gaussian draw scaled by about 0.3162, which barely changes it. The damage comes from repetition."}</p>
<NumberTable headings={["forward step", "multiplier on the clean strip", "multiplier on the noise"]} rows={[["0", "1", "0"], ["1", "0.9487", "0.3162"], ["5", "0.7684", "0.6399"], ["10", "0.5905", "0.8070"], ["20", "0.3487", "0.9372"]]} caption="What the strip is made of after a given number of steps. Part 2 derives both columns from the schedule." />
<p>{"The model does not need to learn this forward process because we specify it. Its purpose is to supply noisy inputs with known relationships to clean examples. The small schedule on this page demonstrates the relationship but is not long enough to imply that all signal is gone."}</p>
<p>{"The last row of the table is that caveat in numbers. After all twenty steps the clean strip still enters with a multiplier of 0.3487, so the bright pixels are faint and not gone. The same per-step noise would have to run for 44 steps before the retained fraction of the signal, which is the square of that multiplier, fell below one percent."}</p>

</SubSection>
<SubSection title="2. Train a predictor that knows the noise level">
<p>{"A common denoising network reads the noisy sample and the timestep, then predicts the noise used in its construction. A timestep embedding gives the network information about how much corruption to expect."}</p>
<p>{"One training example on this page looks like this. The clean strip and one noise draw are combined at step 5. The network is shown the noisy strip and the number 5, and the answer it is graded against is the draw."}</p>
<NumberTable headings={["pixel", "clean value", "noise draw, the target", "noisy value at step 5, the input"]} rows={[["1", "0", "−0.6518", "−0.4171"], ["2", "0", "−0.1747", "−0.1118"], ["3", "1", "1.6637", "1.8331"], ["4", "1", "0.6591", "1.1902"], ["5", "0", "−1.6414", "−1.0504"], ["6", "0", "−0.0052", "−0.0033"]]} caption="The live example at its default step. The clean column is used to build the input and is then put away." />
<p>{"Nobody labeled anything. The target column came from a random number generator a moment before the input was built from it. A new draw or a new step makes a new training example from the same clean strip, so one clean example supplies as many pairs as we care to construct."}</p>
<p>{"The step has to be an input because the noisy values do not reveal it. On this draw the third pixel reads 1.8331 at step 5 and 1.9080 at step 20, nearly the same number. At step 5 the clean signal entered with a multiplier of 0.7684 and at step 20 with 0.3487, so those two similar readings contain very different amounts of noise. A predictor that was not told the step could not know which case it was looking at."}</p>
<p>{"A U-Net can serve as this predictor because it combines broad image context with fine spatial detail. Its diffusion target is the known added noise. This differs from the semantic segmentation task, where U-Net is trained with labeled images and corresponding target masks. Conditional diffusion can also use text or class labels."}</p>

</SubSection>

</> },
{ title: "Part 2. Calculate a Noisy Training Pair", content: <>
<SubSection title="3. Jump directly to a chosen forward step">
<p>{"Let β be the per-step noise variance, α the retained fraction for that step, and ᾱ the cumulative retained fraction. Independent Gaussian additions can be combined into one draw, so we can sample a chosen training step without simulating every preceding step."}</p>
<Equation>{"αₜ = 1 − βₜ\nᾱₜ = ∏ₛ₌₁ᵗ αₛ\n\nε ~ Normal(0, I)\nxₜ = √ᾱₜ x₀ + √(1 − ᾱₜ) ε\n\nFor this example's constant schedule at step 5:\nᾱ₅ = (1 − 0.1)⁵ = 0.59049"}</Equation>
<p>{"The square-root coefficients control the signal and noise scales. The clean sample is x₀, the noisy sample is xₜ, and ε is the known noise draw. At step zero, cumulative retention is one and the signal is unchanged."}</p>
<WorkedExample title="Step 5 for two of the six pixels">
<p>{"The cumulative retention at step 5 gives both coefficients. The third pixel is bright and its draw was 1.6637. The first pixel is dark and its draw was −0.6518."}</p>
<Equation>{"√ᾱ₅ = √0.59049 ≈ 0.7684\n√(1 − ᾱ₅) = √0.40951 ≈ 0.6399\n\nThird pixel:  x₅ = (0.7684 × 1) + (0.6399 × 1.6637) ≈ 1.8331\nFirst pixel:  x₅ = (0.7684 × 0) + (0.6399 × (−0.6518)) ≈ −0.4171"}</Equation>
<p>{"Those are the values in the table in step 2, and the other four pixels follow the same line of arithmetic. The two coefficients are tied together. Their squares are ᾱ and 1 − ᾱ, which always total one, so whatever scale the signal gives up the noise takes."}</p>
<NumberTable headings={["step", "cumulative retention ᾱ", "signal coefficient √ᾱ", "noise coefficient √(1 − ᾱ)"]} rows={[["0", "1", "1", "0"], ["1", "0.9", "0.9487", "0.3162"], ["5", "0.5905", "0.7684", "0.6399"], ["10", "0.3487", "0.5905", "0.8070"], ["20", "0.1216", "0.3487", "0.9372"]]} caption="The constant schedule of this page, where every step has a noise variance of 0.1." />
<p>{"The jump is what makes training practical. Building a training example takes one clean sample, one step number and one draw, and the noisy input comes out of a single line of arithmetic, however late the step is."}</p>
</WorkedExample>
</SubSection>
<SubSection title="4. Predict noise and estimate the clean sample">
<p>{"Write the network's noise estimate as ε̂. A common simplified training loss compares the predicted noise with the actual draw. Once an estimate is available, the forward expression can be rearranged to estimate the clean sample."}</p>
<Equation>{"L_simple = E_{x₀,t,ε}[‖ε − ε̂_θ(xₜ, t)‖²]\n\nx̂₀ = (xₜ − √(1 − ᾱₜ) ε̂) / √ᾱₜ"}</Equation>
<p>{"If the estimate equals the exact noise, this recovers the clean sample. During generation that exact noise is unavailable. A predictor must infer useful information from the noisy input and what it learned from training data."}</p>
<p>{"As signal retention becomes small, division by its square root amplifies noise-estimation errors in this clean-sample estimate. The live oracle control makes that dependence visible."}</p>
<WorkedExample title="The estimate with all, half and none of the noise">
<p>{"The live control supplies a chosen fraction of the true draw as the noise estimate. Follow the third pixel at step 5, where the noisy value is 1.8331, the true draw is 1.6637 and the clean value is 1."}</p>
<Equation>{"All of the draw:   x̂₀ = (1.8331 − (0.6399 × 1.6637)) / 0.7684 ≈ 1.0000\nHalf of the draw:  x̂₀ = (1.8331 − (0.6399 × 0.8319)) / 0.7684 ≈ 1.6928\nNone of it:        x̂₀ = (1.8331 − 0) / 0.7684 ≈ 2.3855"}</Equation>
<p>{"The inputs shown are rounded and the results were calculated from the unrounded values. With the whole draw the clean value comes back. With half of it the estimate is too high by 0.6928, and with no estimate at all it is too high by 1.3855. The size of the miss depends on the step as well as on the estimate, which the next lines make exact."}</p>
<Equation>{"x̂₀ − x₀ = √((1 − ᾱₜ) / ᾱₜ) × (ε − ε̂)"}</Equation>
<p>{"An error in the noise estimate is multiplied by that square root on its way into the clean estimate. Hold the estimate at half of the true draw and move the step."}</p>
<NumberTable headings={["step", "cumulative retention ᾱ", "error multiplier", "third pixel’s clean estimate"]} rows={[["1", "0.9", "0.3333", "1.2773"], ["5", "0.5905", "0.8328", "1.6928"], ["10", "0.3487", "1.3667", "2.1369"], ["20", "0.1216", "2.6880", "3.2360"]]} caption="The clean value is 1 in every row, and the noise estimate is wrong by the same amount in every row, half of the draw." />
<p>{"The same mistake about the noise costs 0.2773 at step 1 and 2.2360 at step 20. Early in the schedule the multiplier is below one and an imperfect predictor still gives a fair picture of the clean sample. Late in the schedule the multiplier is well above one, and a single leap from a very noisy sample to a clean one magnifies whatever the predictor got wrong."}</p>
</WorkedExample>
</SubSection>

</> },
{ title: "Questions on Parts 1 and 2", quiz: [
  trueFalse(
    "The training target for a noisy sample is the noise draw that was used to build it, so nobody has to label anything.",
    true,
    "The forward schedule is specified rather than learned, and its purpose is to supply noisy inputs whose relationship to clean examples is already known. In the page’s example the third pixel’s target is its draw of 1.6637, which a random number generator produced just before the noisy value of 1.8331 was built from it. What is learned is the predictor that reads a noisy sample and its timestep and estimates that draw.",
  ),
  choice(
    "Why does the denoising network read the timestep as well as the noisy sample?",
    [
      "So it can count how many reverse steps remain",
      "A timestep embedding tells it how much corruption to expect",
      "Because the forward schedule is learned one step at a time",
      "So it can choose which loss to apply",
    ],
    1,
    "The network predicts the noise used in a sample’s construction, and the noisy values do not reveal how much of them is noise. On the page’s draw the third pixel reads 1.8331 at step 5 and 1.9080 at step 20, while the clean signal’s multiplier falls from 0.7684 to 0.3487, so the embedding has to supply the level. The forward schedule is specified and not learned, and the same loss applies at every step.",
  ),
  trueFalse(
    "A chosen training step can be sampled without simulating every preceding step.",
    true,
    "Independent Gaussian additions combine into one draw, so the noisy sample at a step is written from the clean sample and a single noise draw scaled by the cumulative retained fraction. On this page’s constant schedule the cumulative retention at step five is 0.59049, and at step zero it is one, so the signal is unchanged.",
  ),
  choice(
    "What happens to the clean-sample estimate as the signal retention becomes small?",
    [
      "It becomes exact, since the noise now dominates",
      "Dividing by the square root of the retention amplifies errors in the noise estimate",
      "It is undefined, so sampling stops there",
      "Nothing, since the two square-root coefficients cancel",
    ],
    1,
    "The clean estimate is the forward expression rearranged, so an error in the noise estimate is multiplied by the square root of one minus the retention over the retention. That multiplier is 0.3333 at step 1 and 2.6880 at step 20. With half of the draw supplied, the third pixel’s estimate misses by 0.2773 at step 1 and by 2.2360 at step 20. Where the estimate equals the exact noise the clean sample comes back exactly, and during generation that exact noise is unavailable.",
  ),
  trueFalse(
    "A U-Net serving as the predictor here is trained in the same way as one doing semantic segmentation.",
    false,
    "Its diffusion target is the known added noise, where segmentation trains it on labeled images and their corresponding target masks. What makes it suit both jobs is that it combines broad image context with fine spatial detail.",
  ),
] },
{ title: "Part 3. What the Reverse Process Adds", content: <>
<SubSection title="5. Distinguish clean estimation from a reverse sampling step">
<p>{"A full diffusion sampler starts from noise and repeatedly predicts a less corrupted state. In the DDPM formulation, one reverse update has the following form. The reverse variance σ² depends on the chosen schedule or model; ξ is fresh standard Gaussian noise and is set to zero on the last step."}</p>
<Equation>{"μ_θ(xₜ,t) = (1 / √αₜ)\n             [xₜ − (βₜ / √(1 − ᾱₜ)) ε̂_θ(xₜ,t)]\n\nxₜ₋₁ = μ_θ(xₜ,t) + σₜ ξ"}</Equation>
<p>{"This is a sequence of learned reverse transitions, not repeated use of the exact forward noise. Different samplers change the update rule and number of steps. The page's numerical object implements forward noising and clean estimation only."}</p>
<WorkedExample title="One reverse update beside one clean estimate">
<p>{"Both formulas take a noise estimate, and they do different things with it. Take the third pixel at step 5 again, where the noisy value is 1.8331, and give both formulas the exact draw of 1.6637, so that neither is held back by a poor prediction. On this schedule β₅ is 0.1 and α₅ is 0.9."}</p>
<Equation>{"Clean estimate:  x̂₀ = (1.8331 − (0.6399 × 1.6637)) / 0.7684 ≈ 1.0000\n\nReverse mean:    μ = (1 / √0.9) × [1.8331 − ((0.1 / 0.6399) × 1.6637)]\n                   ≈ 1.0541 × [1.8331 − 0.2600]\n                   ≈ 1.6582"}</Equation>
<p>{"The clean estimate goes all the way to 1 in one move. The reverse update takes the pixel from 1.8331 to about 1.6582, a short distance in the right direction, and then adds fresh noise scaled by σ unless it is the last step. In the formulation above, a sampler repeats that update once for each step of the schedule, which would be twenty times here. It asks the predictor for a new estimate every time, because after each move the sample is a different noisy input at a different step."}</p>
<p>{"Step 4 showed the cost of the alternative. A single leap from step 20 to a clean estimate multiplies the predictor’s error by more than two and a half. The reverse mean above was worked by hand from the formula, with the exact draw standing in for a prediction. Nothing on this page runs a reverse sampler."}</p>
</WorkedExample>
</SubSection>
<SubSection title="6. Reproduce the oracle check">
<p>{"Passing the actual added noise into the recovery method is a useful correctness check. It is not a generative shortcut, because it relies on information that we know only while constructing the training example."}</p>
<pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm leading-relaxed text-slate-100"><code>{"import numpy as np\nfrom oop_ml.numpy.modern import GaussianDiffusion\n\nprocess = GaussianDiffusion(np.full(20, 0.1))\nclean = np.array([0.0, 0.0, 1.0, 1.0, 0.0, 0.0])\nnoise = np.random.default_rng(4).normal(size=6)\nnoisy = process.add_noise(clean, noise, step=5)\nrecovered = process.recover_clean(noisy, noise, step=5)\nprint(recovered)"}</code></pre>
<p>{"Run as written, the code returns the clean strip, [0, 0, 1, 1, 0, 0], to within rounding in the sixteenth decimal place. Replace the true draw with zeros, which is what a predictor that had learned nothing might offer, and the same call returns [−0.5428, −0.1455, 2.3855, 1.5489, −1.3669, −0.0043]. Every pixel is wrong, and the pixels whose draws were largest are wrong by the most."}</p>
<p>{"The check passes only because the script still holds the draw it added a line earlier. When generating there is no clean strip, so no draw was ever added to one, and there is nothing to pass in. The only possible source of a noise estimate is a trained predictor."}</p>
<p>{"To build a working generator around these operations, we would need a trained timestep-conditioned predictor and a reverse sampler. Image quality then depends on that learned model, the training distribution, conditioning, and the sampling procedure."}</p>
</SubSection>
<p>{"The paper develops the noise-prediction training formulation and reverse sampling process used in this lesson."}{" "}<a href="https://arxiv.org/abs/2006.11239">Denoising Diffusion Probabilistic Models</a>.</p>
<p>Continue with <Link href="/concepts/evaluating-generative-models">Evaluating Generative Models</Link>.</p>
</> },
{ title: "Questions on Part 3", quiz: [
  trueFalse(
    "Handing the actual added noise to the recovery method is a shortcut to generating a sample.",
    false,
    "It is a correctness check, and it leans on information known only while the training example is being constructed. When generating there is no clean sample, so no draw was ever added to one. A full sampler starts from noise and repeatedly predicts a less corrupted state through learned reverse transitions, with no exact forward noise anywhere in it.",
  ),
  several(
    "At step 5 the third pixel reads 1.8331, and both formulas are handed the exact draw of 1.6637. Which of these hold?",
    [
      "The clean estimate returns 1 in a single move",
      "One reverse update moves the pixel to about 1.6582, not to the clean value",
      "In the DDPM formulation a sampler repeats the reverse update step after step, with a new noise estimate each time",
      "Neither result is available when generating without a trained predictor, because the exact draw is unknown",
    ],
    [0, 1, 2, 3],
    "All four hold. The clean estimate is the forward expression rearranged, so the exact draw returns the clean value at once. The reverse update is one short transition in a sequence, which is why the pixel only reaches about 1.6582. Both were fed the true draw here, and a generator has no such draw, so every estimate has to come from a learned model.",
  ),
  choice(
    "In the reverse update written here, what is ξ?",
    [
      "The network’s noise estimate",
      "Fresh standard Gaussian noise, set to zero on the last step",
      "The cumulative retained fraction",
      "The estimate of the clean sample",
    ],
    1,
    "The update takes the mean the model predicts and adds the reverse standard deviation times fresh noise, and that reverse variance depends on the chosen schedule or model. Different samplers change the update rule and the number of steps.",
  ),
  trueFalse(
    "The numerical object behind this page implements forward noising and clean estimation only.",
    true,
    "Building a working generator around those two operations would still need a trained timestep-conditioned predictor and a reverse sampler. Image quality would then depend on that learned model, the training distribution, the conditioning and the sampling procedure.",
  ),
] }
,
        {
          title: "Practice. Noising and Recovering a Signal With the Library",
          practice: [
            exercise(
              "Build the training pair, then move the step",
              ["Build the page’s schedule with GaussianDiffusion, twenty steps with a noise variance of 0.1 each, and noise the clean strip [0, 0, 1, 1, 0, 0] at step 5 with the draw from a generator seeded at 4. Print the clean value, the draw and the noisy value for each pixel. Then print the third pixel’s noisy value at steps 5, 10 and 20 with the same draw.", "The six rows should match the training pair tabulated in Part 1, and Part 1 also quotes the third pixel at steps 5 and 20. Its value at step 10 is not on the page. Notice how little the three readings differ, which is the reason the step has to be handed to the predictor."],
              `import numpy as np
from oop_ml.numpy.modern import GaussianDiffusion

process = GaussianDiffusion(np.full(20, 0.1))
clean = np.array([0.0, 0.0, 1.0, 1.0, 0.0, 0.0])
noise = np.random.default_rng(4).normal(size=6)

# Noise the clean strip at step 5 and print, for each pixel, the clean
# value, the draw and the noisy value to four places.

for step in [5, 10, 20]:
    # Noise the strip at this step with the same draw and print the
    # third pixel's value to four places.
    pass
`,
              `import numpy as np
from oop_ml.numpy.modern import GaussianDiffusion

process = GaussianDiffusion(np.full(20, 0.1))
clean = np.array([0.0, 0.0, 1.0, 1.0, 0.0, 0.0])
noise = np.random.default_rng(4).normal(size=6)

noisy = process.add_noise(clean, noise, step=5)
for pixel in range(6):
    print(f"pixel {pixel + 1}: clean {clean[pixel]:.0f} draw {noise[pixel]:+.4f} noisy {noisy[pixel]:+.4f}")

for step in [5, 10, 20]:
    third = process.add_noise(clean, noise, step=step)[2]
    print(f"third pixel at step {step}: {third:.4f}")
`,
              `pixel 1: clean 0 draw -0.6518 noisy -0.4171
pixel 2: clean 0 draw -0.1747 noisy -0.1118
pixel 3: clean 1 draw +1.6637 noisy +1.8331
pixel 4: clean 1 draw +0.6591 noisy +1.1902
pixel 5: clean 0 draw -1.6414 noisy -1.0504
pixel 6: clean 0 draw -0.0052 noisy -0.0033
third pixel at step 5: 1.8331
third pixel at step 10: 1.9332
third pixel at step 20: 1.9080`,
              { hints: ["add_noise takes the clean sample, the noise draw and the step, and returns the noisy sample. It jumps straight to that step, so there is no loop over the earlier ones.", "The third pixel is index 2 of the array that comes back."], check: numberCheck("What does the third pixel read at step 10, to four places?", 1.9332, 0.0005, "At step 10 the cumulative retention is 0.3487, so the clean value of 1 enters with a coefficient of 0.5905 and the draw of 1.6637 with 0.8070, which comes to 1.9332. That is close to the readings at step 5 and at step 20, although the share of it that is noise has changed a great deal.") },
            ),
            exercise(
              "Supply a fraction of the true noise",
              ["Noise the strip at step 5 as before. Then ask recover_clean for the clean strip four times, handing it 0, 0.5, 0.9 and 1 times the true draw as the noise estimate. Print the third pixel’s estimate each time.", "Part 2 works three of these by hand. The estimate at nine tenths of the draw is not on the page. It shows how much a predictor that is nearly right still misses by at this step."],
              `import numpy as np
from oop_ml.numpy.modern import GaussianDiffusion

process = GaussianDiffusion(np.full(20, 0.1))
clean = np.array([0.0, 0.0, 1.0, 1.0, 0.0, 0.0])
noise = np.random.default_rng(4).normal(size=6)
noisy = process.add_noise(clean, noise, step=5)

for fraction in [0.0, 0.5, 0.9, 1.0]:
    # Estimate the clean strip from the noisy one, using this fraction
    # of the true draw as the noise estimate. Print the third pixel's
    # estimate to four places.
    pass
`,
              `import numpy as np
from oop_ml.numpy.modern import GaussianDiffusion

process = GaussianDiffusion(np.full(20, 0.1))
clean = np.array([0.0, 0.0, 1.0, 1.0, 0.0, 0.0])
noise = np.random.default_rng(4).normal(size=6)
noisy = process.add_noise(clean, noise, step=5)

for fraction in [0.0, 0.5, 0.9, 1.0]:
    estimate = process.recover_clean(noisy, fraction * noise, step=5)
    print(f"fraction {fraction}: third pixel estimated at {estimate[2]:.4f}")
`,
              `fraction 0.0: third pixel estimated at 2.3855
fraction 0.5: third pixel estimated at 1.6928
fraction 0.9: third pixel estimated at 1.1386
fraction 1.0: third pixel estimated at 1.0000`,
              { hints: ["recover_clean takes the noisy sample, a noise estimate of the same shape, and the step the sample was noised at.", "Multiplying the draw by the fraction scales every pixel’s noise at once, so fraction * noise is the estimate to pass."], check: numberCheck("What is the third pixel’s clean estimate when nine tenths of the draw is supplied, to four places?", 1.1386, 0.0005, "The estimate misses the draw by a tenth of 1.6637, and at step 5 an error in the noise is multiplied by 0.8328 on its way into the clean estimate. That is 0.1386 above the clean value of 1. The same nearly right predictor would miss by more at a later step, where the multiplier is larger.") },
            ),
            exercise(
              "Watch the error multiplier grow",
              ["Hold the noise estimate at half of the true draw and move the step through 1, 5, 10, 15 and 20. At each step read the cumulative retention from the schedule, compute the multiplier from Part 2, the square root of one minus the retention over the retention, and print it beside the third pixel’s clean estimate.", "Part 2 tabulates four of these steps. Step 15 is not on the page. Check for yourself that each estimate is 1 plus the multiplier times half the draw of 1.6637."],
              `import numpy as np
from oop_ml.numpy.modern import GaussianDiffusion

process = GaussianDiffusion(np.full(20, 0.1))
clean = np.array([0.0, 0.0, 1.0, 1.0, 0.0, 0.0])
noise = np.random.default_rng(4).normal(size=6)

for step in [1, 5, 10, 15, 20]:
    retained = process.retention[step]
    # Compute the multiplier from the retention. Noise the strip at this
    # step, estimate the clean strip from half the draw, and print the
    # retention, the multiplier and the third pixel's estimate.
    pass
# Print the multiplier at step 15 on a line of its own, to four places.
`,
              `import numpy as np
from oop_ml.numpy.modern import GaussianDiffusion

process = GaussianDiffusion(np.full(20, 0.1))
clean = np.array([0.0, 0.0, 1.0, 1.0, 0.0, 0.0])
noise = np.random.default_rng(4).normal(size=6)

multipliers = {}
for step in [1, 5, 10, 15, 20]:
    retained = process.retention[step]
    multipliers[step] = np.sqrt((1 - retained) / retained)
    noisy = process.add_noise(clean, noise, step=step)
    estimate = process.recover_clean(noisy, 0.5 * noise, step=step)
    print(
        f"step {step}: retention {retained:.4f} multiplier {multipliers[step]:.4f} "
        f"third pixel estimated at {estimate[2]:.4f}"
    )
print(f"multiplier at step 15: {multipliers[15]:.4f}")
`,
              `step 1: retention 0.9000 multiplier 0.3333 third pixel estimated at 1.2773
step 5: retention 0.5905 multiplier 0.8328 third pixel estimated at 1.6928
step 10: retention 0.3487 multiplier 1.3667 third pixel estimated at 2.1369
step 15: retention 0.2059 multiplier 1.9639 third pixel estimated at 2.6337
step 20: retention 0.1216 multiplier 2.6880 third pixel estimated at 3.2360
multiplier at step 15: 1.9639`,
              { hints: ["retention is an array with one entry per step and an extra entry of 1 at the front for step zero, so retention[step] is the cumulative retention after that many steps.", "The multiplier is np.sqrt((1 - retained) / retained). It depends only on the schedule, not on the strip or the draw.", "The noisy strip has to be rebuilt at each step, and recover_clean has to be told the same step."], check: numberCheck("What is the error multiplier at step 15, to four places?", 1.9639, 0.0005, "After fifteen steps the cumulative retention is 0.2059, so the multiplier is the square root of 0.7941 over 0.2059. An error in the noise estimate is nearly doubled there, where at step 1 it is cut to a third, and half of the draw missing puts the third pixel’s estimate at 2.6337 against a clean value of 1.") },
            ),
            exercise(
              "Ask for a schedule and a step that cannot exist",
              ["Make two requests the library should decline and print what it says. First build a schedule whose every step has a noise variance of 1, which would erase the whole signal in a single step. Then, on the page’s schedule of twenty steps, ask add_noise for step 21.", "There is no number to check here. A retention of zero would put a zero under the division in the clean estimate, and a step beyond the schedule has no retention to look up."],
              `import numpy as np
from oop_ml import MLLibError
from oop_ml.numpy.modern import GaussianDiffusion

try:
    GaussianDiffusion(np.full(20, 1.0))
except MLLibError as refusal:
    # Print the name of the refusal's type and its message.
    pass

process = GaussianDiffusion(np.full(20, 0.1))
clean = np.array([0.0, 0.0, 1.0, 1.0, 0.0, 0.0])
noise = np.random.default_rng(4).normal(size=6)
# Ask add_noise for step 21 inside a try block and print the refusal
# the same way.
`,
              `import numpy as np
from oop_ml import MLLibError
from oop_ml.numpy.modern import GaussianDiffusion

try:
    GaussianDiffusion(np.full(20, 1.0))
except MLLibError as refusal:
    print(f"{type(refusal).__name__}: {refusal}")

process = GaussianDiffusion(np.full(20, 0.1))
clean = np.array([0.0, 0.0, 1.0, 1.0, 0.0, 0.0])
noise = np.random.default_rng(4).normal(size=6)
try:
    process.add_noise(clean, noise, step=21)
except MLLibError as refusal:
    print(f"{type(refusal).__name__}: {refusal}")
`,
              `InvalidValuesError: each beta must be strictly between 0 and 1
InvalidValuesError: step lies outside the schedule`,
              { hints: ["Every refusal the library raises derives from MLLibError, so one except clause catches either. type(refusal).__name__ gives the specific kind.", "The first refusal comes from the constructor, before any sample is involved. The second comes from add_noise."] },
            ),
          ],
        },
    ]}
  />;
}

