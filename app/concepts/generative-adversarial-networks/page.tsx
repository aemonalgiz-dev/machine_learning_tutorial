import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { choice, several, trueFalse } from "@/lib/quizzes";
import { exercise, numberCheck } from "@/lib/exercises";
import { Equation } from "@/components/concept/Equation";
import { KeepInMind, NumberTable, SubSection, WhyThisWorks } from "@/components/concept/Treatments";
import { ModernLearningExample } from "@/components/widgets/ModernLearningExample";
import { lessonIntuitions } from "@/lib/intuition";

export const metadata: Metadata = {
  title: "Generative Adversarial Networks · oop_ml",
  description: "Learn a generator by training another model to distinguish its outputs from real examples.",
};

export default function Page() {
  return <ConceptPage
    title="Generative Adversarial Networks"
    tagline="Learn a generator by training another model to distinguish its outputs from real examples."
    openingTitle="Who Can Tell a Generator What It Is Getting Wrong?"
    intuition={lessonIntuitions["generative-adversarial-networks"]}
    technicalStart="Part 2. Calculate the Adversarial Feedback"
    prerequisites={<>Useful foundations: <Link href="/concepts/neurons-and-activations">Neurons and activations</Link>{", "}<Link href="/concepts/backpropagation">backpropagation</Link>{", "}<Link href="/concepts/loss-functions">loss functions</Link>.</>}
    playgroundIntro="Set training steps to zero to inspect the starting game. Increase the steps and follow the generator’s shift and the discriminator’s two scores. Then compare learning rates. Either loss can rise as the opponent changes."
    playground={<ModernLearningExample topic="generative-adversarial-networks" />}
    sections={[
{ title: "Part 1. Give the Two Models Different Objectives", content: <>
<SubSection title="1. Create examples from random inputs">
<p>Suppose we want a model to draw handwritten digits. A classifier can say which digit an existing picture most resembles, but that does not tell a generator which pixels to produce, and a brand new picture has no labeled answer to be compared against. The generator needs feedback on the examples it creates, and a GAN learns that feedback with a second model rather than writing a rule for it by hand.</p>
<p>{"The generator transforms a random latent input into a candidate observation. A model for images could output a grid of pixel values. The random input provides variation, while the generator’s parameters determine how that variation becomes an output."}</p>
<p>{"Our example removes image complexity. The input is a scalar Gaussian noise draw, and the generator adds a trainable shift. It can move the distribution left or right, but cannot change its shape or represent several distinct modes."}</p>
<p>{"The live experiment makes the task that small on purpose. The real collection is 128 numbers centred near 1.5. The generator starts with a shift of −1.5, so its 128 outputs are centred near −1.5, three units to the left of where they should be. Both collections are built from the same noise draws, so they have the same spread, and the generator would reproduce the real collection exactly if its shift reached 1.5. Nothing tells it that number. It has to find it from feedback."}</p>

</SubSection>
<SubSection title="2. Learn to distinguish sources">
<p>{"The discriminator takes an observation and returns a score interpreted as the probability that it came from the real collection. Its training examples mix real observations with outputs of the current generator."}</p>
<p>{"The basic GAN uses source labels, real or generated, which the training procedure knows automatically. Class labels such as digit identity are optional additional information in a conditional GAN. A conditional generator and discriminator both receive the condition."}</p>
<p>{"The discriminator in the live experiment is as small as the generator. It multiplies the number it is shown by one weight, adds one bias, and passes the result through a sigmoid, which turns any number into a score between zero and one. A positive weight means that larger numbers look more real to it. It starts with a weight of 0.5 and a bias of zero, which is already a rough guess in the right direction. With those values it gives the real collection a mean score of 0.667 and the generated collection a mean score of 0.329."}</p>
<p>{"Now the two objectives can be stated, and they are not the same objective. The discriminator is trained to be right about sources. That means raising its score on real examples and lowering its score on generated ones. The generator is trained to be mistaken for real. That means raising the discriminator’s score on generated examples. The second row of the table is where the two collide."}</p>
<NumberTable headings={["Quantity", "At the start", "The discriminator wants it", "The generator wants it"]} rows={[["Mean score on real examples", "0.667", "higher", "cannot change it"], ["Mean score on generated examples", "0.329", "lower", "higher"]]} caption="The starting scores of the live experiment, with a discriminator weight of 0.5, a bias of zero and a generator shift of −1.5." />
<p>{"This is how a second model can stand in for the rule nobody could write. The discriminator’s score is a calculation, so the generator can ask how that score would change if its output changed a little, and the answer is a direction to move in. Here the weight is positive, so a larger number earns a higher score, and the generator learns to raise its shift. That is toward the real collection, because a discriminator that is doing its job has a weight that points from the generated numbers toward the real ones."}</p>
<KeepInMind>
<p>{"The generator is never shown a real example. Everything it learns about the real collection reaches it through the discriminator’s score, so its feedback is only as good as the discriminator giving it. Part 3 returns to what happens when that opponent is too weak, or changes too quickly."}</p>
</KeepInMind>

</SubSection>

</> },
{ title: "Part 2. Calculate the Adversarial Feedback", content: <>
<SubSection title="3. Define the two losses separately">
<p>{"Part 1 said what each model wants. Training needs that written as a number to make smaller, one number for each model. Both are built from the same ingredient, the negative logarithm of a probability. It is close to zero when the probability is close to one, and it grows without limit as the probability falls toward zero. So it charges a model for giving a low probability to the answer it should have given."}</p>
<p>{"Let G map noise z to a generated observation and D return a real-source probability. The discriminator should give real examples high probabilities and generated examples low probabilities. This SDK uses the average of the real and generated binary cross-entropies."}</p>
<Equation>{"L_D = −½ (E_real[log D(x)]\n          + E_noise[log(1 − D(G(z)))])\n\nL_G = −E_noise[log D(G(z))]"}</Equation>
<p>{"Read the first line one term at a time. The term log D(x) is charged on real examples, and it costs least when the real score is near one. The term log(1 − D(G(z))) is charged on generated examples, and it costs least when the generated score is near zero. The second line charges the generator on those same generated examples for the opposite outcome, which is a generated score that is not near one. E means an average, over the real examples in one case and over the noise draws in the other."}</p>
<p>{"The generator uses the non-saturating objective shown in the second line. It encourages a higher real score for generated examples and provides a stronger learning signal when the discriminator initially rejects them confidently. It differs from minimizing the generator term in the original minimax expression."}</p>
<WhyThisWorks title="Why the generator does not minimize log(1 − D(G(z)))">
<p>{"The original minimax expression has the generator minimize the very term the discriminator is charged on, log(1 − D(G(z))), pulled the other way. Both that term and the non-saturating one fall as the generated score rises, so both point the generator in the same direction. They differ in how hard they push. Write s for the discriminator’s logit, so that D is the sigmoid of s, and take the slope of each with respect to s."}</p>
<Equation>{"d/ds log(1 − sigmoid(s)) = −sigmoid(s)       = −D\nd/ds (−log sigmoid(s))   = −(1 − sigmoid(s)) = −(1 − D)"}</Equation>
<p>{"The first slope is the generated score itself, and the second is one minus it. Early in training the discriminator rejects generated examples, so D is small. A small D leaves the minimax slope close to zero, which is the saturation the name refers to, while the non-saturating slope stays close to one in size. At the draw traced in the next step D is about 0.321, so the two slopes are 0.321 and 0.679 in size, and the gap widens as D falls."}</p>
</WhyThisWorks>
<p>{"The factor of one half sets the discriminator gradient scale in this implementation. It does not combine the generator and discriminator into a single loss that both minimize."}</p>
</SubSection>
<SubSection title="4. Trace a single generated number">
<p>{"For an illustrative zero noise draw, use the initial generator shift and discriminator parameters. Sigmoid converts the discriminator’s weighted sum into its real score."}</p>
<Equation>{"G(z) = z + m\nD(x) = sigmoid(w x + b)\n\nz = 0,  m = −1.5,  w = 0.5,  b = 0\nGenerated value = 0 + (−1.5) = −1.5\nDiscriminator logit = (0.5 × (−1.5)) + 0 = −0.75\nD(G(z)) = 1 / (1 + exp(0.75))\nGenerator loss for this draw = −log D(G(z))"}</Equation>
<p>{"Carrying the arithmetic through gives the two numbers the trace ends on."}</p>
<Equation>{"D(G(z)) = 1 / (1 + exp(0.75)) ≈ 0.321\nGenerator loss = −log(0.321) ≈ 1.137"}</Equation>
<p>{"A score of 0.321 says the discriminator thinks this value is probably generated, and it is right. The loss of 1.137 is what the generator is charged for that."}</p>
<p>{"The feedback is the slope of that loss with respect to the shift. Raising the shift by a small amount raises the generated value by the same amount. The weight of 0.5 passes half of that on to the logit, and the loss falls as the logit rises. With a learning rate of 0.1, one descent step on this single draw works out as follows."}</p>
<Equation>{"d(loss)/d(logit) = −(1 − D(G(z))) = −(1 − 0.321) ≈ −0.679\nd(logit)/d(m)    = w = 0.5\nd(loss)/d(m)     ≈ (−0.679) × 0.5 ≈ −0.340\n\nNew shift = −1.5 − (0.1 × (−0.340)) ≈ −1.466"}</Equation>
<p>{"The slope is negative, so the loss falls as the shift rises, and the step moves the shift up from −1.5 to about −1.466. That is the adversarial feedback in the title of this part. No rule said the generated numbers should be larger. The discriminator’s weight said it."}</p>
<p>{"The discriminator’s loss needs a real example as well as a generated one. The real collection is the noise with 1.5 added, so the real partner of this zero draw is 1.5."}</p>
<Equation>{"Real logit = (0.5 × 1.5) + 0 = 0.75\nD(x) = 1 / (1 + exp(−0.75)) ≈ 0.679\n\nL_D = −½ (log(0.679) + log(1 − 0.321))\n    ≈ −½ ((−0.387) + (−0.387))\n    ≈ 0.387"}</Equation>
<p>{"The two terms are equal because the real value and the generated value sit the same distance either side of zero, so this discriminator is exactly as sure of one as of the other. Its loss is smaller than the generator’s because it is the model that is currently right."}</p>
<p>{"The live experiment averages over a fixed batch of Gaussian draws, not just this zero draw. During the discriminator update, generated values are treated as fixed examples. During the generator update, the gradient passes through the fixed discriminator to the generator shift."}</p>
<NumberTable headings={["Quantity", "The zero draw alone", "Mean over the 128 draws"]} rows={[["Score on the real value", "0.679", "0.667"], ["Score on the generated value", "0.321", "0.329"], ["Discriminator loss", "0.387", "0.418"], ["Generator loss", "1.137", "1.173"]]} caption="The starting game, before any update. The right-hand column is what the live example reports at step zero." />
<p>{"One full alternation at a learning rate of 0.1 then moves the discriminator’s weight from 0.5 to 0.538 and the generator’s shift from −1.5 to −1.463. The shift moved a little further than the −1.466 worked above, and the order of the alternation is the reason. The discriminator is updated first, so the generator stepped against a weight of 0.538 and not 0.5."}</p>
</SubSection>

</> },
{ title: "Questions on Parts 1 and 2", quiz: [
choice(
  "At the start of the live experiment the discriminator gives generated examples a mean score of 0.329. What does each model want that number to do?",
  [
    "The discriminator wants it lower and the generator wants it higher",
    "Both want it lower, since both are minimizing a loss",
    "Both want it at one half, where neither model is wrong",
    "The discriminator wants it higher and the generator wants it lower",
  ],
  0,
  "The discriminator is trained to be right about sources, so it pushes its score on generated examples down, and the generator is trained to be mistaken for real, so it pushes the same score up. Both models do minimize a loss, but they are two losses that charge for opposite outcomes on this number. The real score of 0.667 is not contested in the same way, because the generator’s shift cannot change it.",
),
trueFalse(
  "The basic GAN needs class labels, such as which digit an image shows.",
  false,
  "It uses source labels, real or generated, which the training procedure knows automatically. Class labels are optional additional information in a conditional GAN, where the generator and the discriminator both receive the condition.",
),
choice(
  "Why does the generator use the non-saturating objective rather than minimizing the generator term of the original minimax expression?",
  [
    "Because it combines the two models into one loss that both minimize",
    "Because it gives a stronger learning signal when the discriminator initially rejects generated examples confidently",
    "Because it removes the need to train the discriminator at all",
    "Because it sets the scale of the discriminator’s gradient",
  ],
  1,
  "Early on the discriminator rejects generated examples, so their score D is small, and the minimax term’s slope with respect to the logit is D itself while the non-saturating slope is one minus D. At the traced draw that is 0.321 against 0.679. The factor of one half is a separate thing, since it sets the discriminator gradient scale in this implementation and does not fold the two objectives into a single loss.",
),
choice(
  "With z = 0, a generator shift of −1.5, w = 0.5 and b = 0, the generator’s loss has a slope of about −0.340 with respect to the shift. What does one descent step at a learning rate of 0.1 do?",
  [
    "It raises the shift from −1.5 to about −1.466",
    "It lowers the shift from −1.5 to about −1.534",
    "It raises the shift from −1.5 to about −1.160",
    "It leaves the shift alone and changes the discriminator’s weight",
  ],
  0,
  "The generated value is −1.5, the logit is 0.5 times that, and the score of about 0.321 costs the generator 1.137. A negative slope means the loss falls as the shift rises, so descent subtracts 0.1 times −0.340 and the shift goes up by 0.034. Moving by the whole slope would ignore the learning rate, and the weight belongs to the discriminator, which the generator update holds fixed.",
),
trueFalse(
  "During the discriminator update, the generated values are treated as fixed examples.",
  true,
  "The gradient reaches the generator shift during the generator update instead, passing through the discriminator while the discriminator itself is held fixed. The live experiment also averages over a fixed batch of Gaussian draws rather than over the single zero draw traced by hand.",
),
] },
{ title: "Part 3. Train a Small Game and Inspect Its Limits", content: <>
<SubSection title="5. Run the actual alternating updates">
<p>{"The training distribution is the same fixed Gaussian noise batch shifted toward the positive side. Reusing the noise keeps before-and-after comparisons from changing merely because a fresh batch was sampled."}</p>
<pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm leading-relaxed text-slate-100"><code>{"import numpy as np\nfrom oop_ml.numpy.modern import AdversarialGaussian\n\nnoise = np.random.default_rng(3).normal(size=128)\nreal = noise + 1.5\nhistory = AdversarialGaussian(generator_mean=-1.5).train(\n    real, noise, steps=30, learning_rate=0.1,\n)\nprint(history[-1])"}</code></pre>
<p>{"Each recorded state reports both losses and both mean discriminator scores after a complete alternation. A discriminator score near one half can indicate confusion, but by itself cannot prove that a rich data distribution has been matched."}</p>
<NumberTable headings={["Step", "Generator shift", "Mean D(real)", "Mean D(fake)", "D loss", "G loss"]} rows={[["0", "−1.500", "0.667", "0.329", "0.418", "1.173"], ["15", "−0.755", "0.747", "0.355", "0.407", "1.199"], ["30", "0.081", "0.744", "0.483", "0.552", "0.861"]]} caption="Thirty alternations at a learning rate of 0.1, which are the live example’s default settings. The target shift is 1.5." />
<p>{"Read the shift column first. It rises at every one of the thirty steps, from −1.5 to 0.081, so the generator is being pushed the right way throughout. It is also far from finished. The real collection sits at 1.5, and after thirty steps the shift is still 1.42 short of it."}</p>
<p>{"Now read the two loss columns, and notice that neither tells that story. The generator loss rose during each of the first seven steps, and at step 15 it is 1.199, higher than the 1.173 it started at, although the shift had improved at every step. It rose because the discriminator was improving faster than the generator was. The discriminator’s weight went from 0.5 to 0.878 over those fifteen steps, so it had become more confident about the same generated values. From step 8 to step 30 it is the discriminator loss that rises, because the generated values are moving in among the real ones and are harder to reject. Each loss measures one model against its opponent as that opponent currently stands, and the opponent keeps changing."}</p>
<p>{"The last row also carries a small warning about reading the scores. At step 30 the mean score on generated values is 0.483, close to one half, while the shift is still 1.42 away from the target."}</p>
<p>{"A longer run shows something a single falling loss never would. The table below gives the state after 150 alternations at the smallest, the default and the largest learning rate the live example offers."}</p>
<NumberTable headings={["Learning rate", "Generator shift", "Mean D(real)", "Mean D(fake)", "D loss", "G loss"]} rows={[["0.01", "−0.776", "0.746", "0.352", "0.405", "1.207"], ["0.1", "2.006", "0.446", "0.443", "0.697", "0.813"], ["0.3", "1.491", "0.500", "0.500", "0.693", "0.693"]]} caption="The state after 150 alternations, the most the live example allows. The target shift is 1.5." />
<p>{"At 0.01 the steps are too small to get far. At 0.1 the shift has gone past the target. It reached 1.5 at step 74, kept going, and peaked at 2.012 at step 141. It can overshoot because the generator does not know where the real collection is. It follows the discriminator’s weight, and that weight was still positive when the shift passed 1.5. Once the generated values sit to the right of the real ones, larger numbers begin to look less real, the weight falls through zero, and the feedback turns around. By step 150 the weight is −0.022 and the shift has started back."}</p>
<p>{"At 0.3 the same excursion happened sooner. The shift peaked at 2.007 at step 46 and had come back to 1.491 by step 150. That last row is what a settled game looks like here. Both mean scores are 0.500 and both losses are 0.693, which is not an accident."}</p>
<Equation>{"−log(0.5) = log 2 ≈ 0.693"}</Equation>
<p>{"A discriminator that answers one half to everything is charged log 2 on every example, real or generated, and the generator is charged the same. So 0.693 is the sign that the discriminator has nothing left to go on. It is not zero, and neither loss was ever heading for zero."}</p>
<KeepInMind>
<p>{"These are measurements on this page’s one batch of 128 draws. They do not say that 0.3 is a better learning rate than 0.1 in general. They say that this game overshoots its answer and comes back before it settles, and that 150 steps at the larger rate get through more of that."}</p>
</KeepInMind>
</SubSection>
<SubSection title="6. Look for missing variety and changing opponents">
<p>{"A mode is a region where the data concentrates. A collection of handwritten digits has one for each digit, and a generator that draws only convincing sevens has settled on a single one of them."}</p>
<p>{"Mode collapse occurs when a generator produces only a narrow subset of the data’s variety. Several attractive examples can hide that failure. A discriminator that is too weak can also give unhelpful feedback, while a rapidly improving one can make the generator’s task difficult."}</p>
<p>{"A collapse is easy to miss because of how samples are usually judged, which is one at a time. Each of those sevens looks real, and nothing in a judgment of one picture counts how many kinds of picture were produced. Variety is a property of the whole generated collection, and it has to be checked on the collection."}</p>
<p>{"Both warnings about the opponent appeared in step 5 in small form. The rising generator loss of the first seven steps was a discriminator improving faster than the generator. The overshoot past 1.5 was a discriminator whose advice was out of date, since its weight still pointed right after the generated values had arrived."}</p>
<p>{"Our scalar family cannot demonstrate image realism or mode coverage. It does expose the two objectives and actual alternating gradients. Evaluating a full GAN requires checking the generated distribution, variety, and task-specific quality beyond its training losses."}</p>
<p>{"The reason it cannot is worth spelling out. The generator adds one number to every draw, so its outputs always form a single cluster with the spread of the noise. If the real collection were two separate clusters, no shift would cover both. The discriminator is limited in a matching way. One weight and one bias can only say that larger numbers look more real, or that they look less real, so it has no way to describe real values lying on both sides of the generated ones. The last practice problem runs that case and reports what both models end up saying."}</p>

</SubSection>
<p>{"The original paper introduces the two-model game and discusses the non-saturating generator objective."}{" "}<a href="https://arxiv.org/abs/1406.2661">Generative Adversarial Nets</a>.</p>
<p>Continue with <Link href="/concepts/diffusion-models">Diffusion Models</Link>.</p>
</> },
{ title: "Questions on Part 3", quiz: [
trueFalse(
  "The same fixed Gaussian noise batch is reused so that a before-and-after comparison cannot change merely because a fresh batch was sampled.",
  true,
  "The training distribution is that same batch shifted toward the positive side, so the only thing moving between two recorded states is the training. Each state reports both losses and both mean discriminator scores after a complete alternation.",
),
trueFalse(
  "A mean discriminator score near one half proves the generator has matched the data distribution.",
  false,
  "It can indicate confusion, and by itself it cannot prove that a rich data distribution has been matched. Mode collapse hides behind several attractive examples, so evaluating a full GAN means checking the generated distribution, its variety and task-specific quality beyond the two training losses.",
),
trueFalse(
  "In the thirty-step run the generator loss rose during the first seven steps, although the shift moved toward the target at every one of them.",
  true,
  "The discriminator was improving faster than the generator. Its weight went from 0.5 to 0.878 by step 15, so it grew more confident about the same generated values and charged the generator more, 1.199 at step 15 against 1.173 at the start. Each loss measures one model against its current opponent, so neither is a progress score for the pair.",
),
choice(
  "After 150 alternations at a learning rate of 0.3 both mean scores are 0.500. What do the two losses read?",
  [
    "Both read about 0.693, which is log 2",
    "Both read zero, because neither model is making a mistake",
    "The discriminator loss reads zero and the generator loss reads 0.693",
    "Both read 1.173, the generator’s starting loss",
  ],
  0,
  "A discriminator that answers one half to everything is charged −log(0.5) on every example, real or generated, and the generator is charged the same, so both losses sit at log 2. That value is the sign that the discriminator has nothing left to go on. Neither loss was heading for zero, since a discriminator loss of zero would need every generated value rejected with certainty.",
),
several(
  "Which of these does the page say about the two opponents during training?",
  [
    "A discriminator that is too weak can give unhelpful feedback",
    "A discriminator that improves rapidly can make the generator’s task difficult",
    "Either loss can rise as the opponent changes",
    "This scalar family can demonstrate mode coverage on a small scale",
  ],
  [0, 1, 2],
  "The two models have separate objectives rather than one loss that both minimize, so neither loss is obliged to fall. The scalar family cannot demonstrate image realism or mode coverage, and what it does expose is the two objectives and the actual alternating gradients.",
),
] }
,
        {
          title: "Practice. Run the Game With the Library",
          practice: [
            exercise(
              "Score the single draw of Part 2",
              ["Part 2 traced one zero noise draw by hand. Build the game with a generator shift of −1.5, and inspect it on a real collection holding only the value 1.5 and a noise batch holding only the value 0.0. Print the score on the real value, the score on the generated value and both losses, each to four places.", "The page arrived at scores near 0.679 and 0.321 and losses near 0.387 and 1.137. Inspecting changes nothing, so these are the starting discriminator’s answers, with its weight of 0.5 and bias of zero."],
              `import numpy as np
from oop_ml.numpy.modern import AdversarialGaussian

game = AdversarialGaussian(generator_mean=-1.5)
real = np.array([1.5])
noise = np.array([0.0])
# Inspect the game on this one real value and this one noise draw, then
# print the real score, the generated score, the discriminator loss and
# the generator loss, each to four places.`,
              `import numpy as np
from oop_ml.numpy.modern import AdversarialGaussian

game = AdversarialGaussian(generator_mean=-1.5)
real = np.array([1.5])
noise = np.array([0.0])
state = game.inspect(real, noise)

print(f"score on the real value       {state.real_score:.4f}")
print(f"score on the generated value  {state.fake_score:.4f}")
print(f"discriminator loss            {state.discriminator_loss:.4f}")
print(f"generator loss                {state.generator_loss:.4f}")`,
              `score on the real value       0.6792
score on the generated value  0.3208
discriminator loss            0.3869
generator loss                1.1369`,
              { hints: ["inspect takes the real collection and then the noise batch, both as one-dimensional arrays, and answers one state. It applies no update.", "The state carries real_score, fake_score, discriminator_loss and generator_loss as plain numbers.", "The generated value never appears in your script. The game adds its shift to the noise itself, so a noise of 0.0 becomes the −1.5 the page traced."], check: numberCheck("What generator loss does the library report for this one draw?", 1.1369, 0.0005, "The generated value is −1.5, the logit is half of it, and the sigmoid of −0.75 is about 0.321. The generator is charged the negative logarithm of that score, which is the 1.137 Part 2 reached by hand. The discriminator loss is the smaller 0.387 because it is the model that is currently right about both values.") },
            ),
            exercise(
              "Run the thirty alternations and find where the generator loss peaks",
              ["Part 3 printed the run at steps 0, 15 and 30. Train the game on the page’s own batch for thirty alternations at a learning rate of 0.1 and print those three rows, with the shift, both mean scores and both losses to four places.", "Then search the whole history for the step with the highest generator loss, and print that step, the loss and the shift at it. The page says the generator loss rose for the first seven steps while the shift improved. This is the figure it rose to, which the page does not quote."],
              `import numpy as np
from oop_ml.numpy.modern import AdversarialGaussian

noise = np.random.default_rng(3).normal(size=128)
real = noise + 1.5
game = AdversarialGaussian(generator_mean=-1.5)
# Train for 30 steps at a learning rate of 0.1 and keep the history.
# Print the shift, both mean scores and both losses at steps 0, 15 and 30.
# Then find the step whose generator loss is highest and print the step,
# that loss to four places and the shift at that step.`,
              `import numpy as np
from oop_ml.numpy.modern import AdversarialGaussian

noise = np.random.default_rng(3).normal(size=128)
real = noise + 1.5
game = AdversarialGaussian(generator_mean=-1.5)
history = game.train(real, noise, steps=30, learning_rate=0.1)

for step in [0, 15, 30]:
    state = history[step]
    print(
        f"step {step:2d}  shift {state.generator_mean:7.4f}  "
        f"D(real) {state.real_score:.4f}  D(fake) {state.fake_score:.4f}  "
        f"D loss {state.discriminator_loss:.4f}  G loss {state.generator_loss:.4f}"
    )

losses = [state.generator_loss for state in history]
peak = losses.index(max(losses))
print(f"generator loss peaks at step {peak}")
print(f"peak generator loss {history[peak].generator_loss:.4f}")
print(f"shift at the peak {history[peak].generator_mean:.4f}")`,
              `step  0  shift -1.5000  D(real) 0.6675  D(fake) 0.3292  D loss 0.4176  G loss 1.1732
step 15  shift -0.7552  D(real) 0.7474  D(fake) 0.3553  D loss 0.4072  G loss 1.1988
step 30  shift  0.0808  D(real) 0.7442  D(fake) 0.4828  D loss 0.5523  G loss 0.8609
generator loss peaks at step 7
peak generator loss 1.2826
shift at the peak -1.1944`,
              { hints: ["train takes the real collection, the noise batch, then steps and learning_rate. It answers a list of states.", "The list holds one more state than there were steps, because its first entry is the game before any update. So history[30] is the state after the thirtieth alternation.", "Each state carries generator_mean, real_score, fake_score, discriminator_loss and generator_loss.", "Collect the generator_loss of every state into a list. The list’s index method, given the list’s max, answers the step at which the highest loss sits."], check: numberCheck("What is the highest generator loss the thirty-step run records?", 1.2826, 0.0005, "The loss climbs from 1.173 to 1.2826 over the first seven steps and falls from there. Over those same steps the shift went from −1.5 to about −1.194, so the generator was improving while its loss said otherwise. The discriminator’s weight was growing faster than the shift was moving, and a more confident opponent charges more for the same generated values.") },
            ),
            exercise(
              "Give the generator a collection it cannot match",
              ["Part 3 said this generator can only slide one cluster left or right. Build a real collection of two clusters, one centred at −2 and one at 2, by adding 0.3 times the page’s noise to those centres. Train the game on it for 150 alternations at a learning rate of 0.3.", "Print the final shift and both mean scores to four places, then the standard deviation of the real collection and of the generated values to two places. Look at what the discriminator reports, and then at whether the two collections look alike."],
              `import numpy as np
from oop_ml.numpy.modern import AdversarialGaussian

noise = np.random.default_rng(3).normal(size=128)
centres = np.where(np.arange(128) % 2 == 0, -2.0, 2.0)
real = centres + 0.3 * noise
game = AdversarialGaussian(generator_mean=-1.5)
# Train for 150 steps at a learning rate of 0.3 and take the last state.
# Print its shift and both mean scores to four places. Then rebuild the
# generated values as the noise plus that shift, and print the standard
# deviation of the real collection and of the generated values.`,
              `import numpy as np
from oop_ml.numpy.modern import AdversarialGaussian

noise = np.random.default_rng(3).normal(size=128)
centres = np.where(np.arange(128) % 2 == 0, -2.0, 2.0)
real = centres + 0.3 * noise
game = AdversarialGaussian(generator_mean=-1.5)
final = game.train(real, noise, steps=150, learning_rate=0.3)[-1]

print(f"final shift {final.generator_mean:.4f}")
print(f"mean score on real values {final.real_score:.4f}")
print(f"mean score on generated values {final.fake_score:.4f}")

generated = noise + final.generator_mean
print(f"spread of the real collection {real.std():.2f}")
print(f"spread of the generated values {generated.std():.2f}")`,
              `final shift 0.0120
mean score on real values 0.5000
mean score on generated values 0.5000
spread of the real collection 2.03
spread of the generated values 1.08`,
              { hints: ["train answers the whole history, so the state you want is its last entry.", "The generated values are not stored on the state. The generator is the noise plus its shift, so adding generator_mean to the noise array rebuilds them.", "An array’s std method gives its standard deviation."], check: numberCheck("What mean score does the discriminator give the generated values after the 150 steps?", 0.5, 0.0005, "Both mean scores end at 0.5000, the settled reading from Part 3, and here it means nothing of the kind. The shift stops near zero, between the two clusters, where a single weight can no longer say whether larger numbers look more real or less. The real collection has a spread of 2.03 and the generated one 1.08, so one cluster is sitting in the gap between two. A score of one half shows that this discriminator cannot tell the sources apart, and it does not show that the generator matched the data.") },
            ),
          ],
        },
    ]}
  />;
}

