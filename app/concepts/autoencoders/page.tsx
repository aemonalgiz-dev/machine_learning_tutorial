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
  title: "Autoencoders · Perceptron Lab",
  description: "An autoencoder learns to reconstruct an input through an intermediate representation. Restricting that representation forces choices about which details to preserve, measured by the error in the reconstruction.",
};

export default function Page() {
  return <ConceptPage
      lessonId="autoencoders"
    title="Autoencoders"
    tagline={"An autoencoder learns to reconstruct an input through an intermediate representation. Restricting that representation forces choices about which details to preserve, measured by the error in the reconstruction."}
    openingTitle="What Can We Keep When We Cannot Keep Everything?"
    intuition={lessonIntuitions["autoencoders"]}
    technicalStart="Part 2. Calculate a Bottleneck We Can See"
    prerequisites={<>Useful foundations: <Link href="/concepts/dense-layers">Dense layers</Link>{", "}<Link href="/concepts/loss-functions">loss functions</Link>{", "}<Link href="/concepts/pca">principal components</Link>.</>}
    playgroundTitle="What can the model recover from a smaller code?"
    playgroundIntro="Start with equal readings, then move the offset slider. The average and compressed code stay fixed. Compare the input with the reconstruction to see which information the bottleneck discarded."
    playground={<ModernLearningExample topic="autoencoders" />}
    sections={[
{ title: "Part 1. Three Components of Reconstruction", content: <>
<SubSection title="1. Give the encoder, code, and decoder separate jobs">
<p>{"Suppose we ask a model to reconstruct the same measurements we give it. Copying them would be easy. But what if every observation must first pass through a representation with fewer coordinates? The model has to choose what to retain. Comparing its reconstruction with the original lets us investigate what that restricted representation can carry."}</p>
<p>{"The encoder maps an observation to a representation called a latent code. The code is the information passed through the middle of the system. The decoder maps that code back into the input's original arrangement."}</p>
<p>{"Take the two sensors from the opening and one observation in which they read 3 and −1. The encoder on this page keeps their average, so the code is the single number 1, and the decoder copies that number into both outputs."}</p>
<Equation>{"Observation:     [3, −1]    two numbers\nCode:            [1]        one number\nReconstruction:  [1, 1]     two numbers"}</Equation>
<p>
                  {"Only the code reaches the decoder in this example. Once the encoder maps different observations to the same code, the decoder must give them the same reconstruction. It cannot recover their difference from information it never receives."}
                </p>
<p>{"For an image, the input and reconstructed output may have the same height, width, and channels. Their shapes matching does not mean their pixel values match. Reconstruction error measures the difference."}</p>
<p>{"The sensor trace shows the same thing in two numbers. The reconstruction [1, 1] has the same arrangement as the observation [3, −1] and a different value in both places. The reconstruction error is the size of that difference, and Part 2 calculates it."}</p>

</SubSection>
<SubSection title="2. Make preserving everything difficult">
<p>{"An unrestricted network can learn to copy inputs without discovering a useful representation. A bottleneck limits the code width, forcing the model to choose what information it can preserve. Other autoencoders use constraints such as sparsity or corruption of the input."}</p>
<p>
                  {"If the code is as wide as the observation, the encoder can pass both readings through unchanged and the decoder can copy them back. The observation [3, −1] then reconstructs as [3, −1] with zero error, just as any other observation would. This identity solution does not require learning how the two sensors relate."}
                </p>
<p>
                  {"The reconstruction error is useful alongside the restriction on the code. With only one code coordinate, we need to decide which aspect of the two readings to retain."}
                </p>
<p>{"Compression is useful when the data has structure that a compact code can capture. A smaller code does not guarantee that the preserved information will help a later classifier or search task. That must be checked separately."}</p>
<p>
                  {"Our fixed encoder maps both [1, 1] and [3, −1] to code 1. Copying that code back reconstructs the agreeing readings but loses the sensors’ difference in the second observation. A trained encoder’s choices depend on the data and loss: even an infrequent difference can matter if discarding it produces large errors."}
                </p>

</SubSection>

</> },
{ title: "Part 2. Calculate a Bottleneck We Can See", content: <>
<SubSection title="3. Compress two readings into their average">
<p>{"Our chosen encoder averages two sensor readings. The decoder copies the average into both outputs. For an input whose readings differ, the steps are:"}</p>
<Equation>{"Input x = [3, −1]\n\nCode z = (3 + (−1)) / 2 = 1\nReconstruction = [z, z] = [1, 1]\n\nSquared errors = [(3 − 1)², (−1 − 1)²]\n               = [4, 4]\nMean squared error = (4 + 4) / 2 = 4"}</Equation>
<p>{"The reconstructed pair retains the average but loses the difference. Moving the live slider changes that difference while holding the average constant."}</p>
<NumberTable headings={["offset on the live slider", "input", "code", "reconstruction", "mean squared error"]} rows={[["0", "[1, 1]", "1", "[1, 1]", "0"], ["0.5", "[1.5, 0.5]", "1", "[1, 1]", "0.25"], ["1", "[2, 0]", "1", "[1, 1]", "1"], ["2", "[3, −1]", "1", "[1, 1]", "4"], ["−2", "[−1, 3]", "1", "[1, 1]", "4"]]} caption="Five settings of the live slider. The last row swaps which sensor reads high." />
<p>
                  {"Every row has the same code and reconstruction despite the different inputs. The decoder receives 1 each time and cannot distinguish which observation produced it. Mean squared error varies with the square of the slider offset, as the table shows."}
                </p>
<p>
                  {"With two code coordinates, we can store both the shared level and how the sensors differ. Let the encoder keep their average and half their difference. The decoder adds that second coordinate to one output and subtracts it from the other."}
                </p>
                <Equation>{"input = [3, −1]\naverage = 1\nhalf the difference = 2\ncode = [1, 2]\nreconstruction = [1 + 2, 1 − 2] = [3, −1]\nmean squared error = 0"}</Equation>
</SubSection>
<SubSection title="4. Replace fixed rules with trainable transformations">
<p>{"The encoder's parameters θ determine the code, and the decoder's parameters φ determine what is reconstructed from it. The reconstruction loss therefore depends on both sets. Backpropagation follows that whole route so the encoder can learn which information the decoder needs, rather than treating the code as a fixed input."}</p>
<Equation>{"z = encoder_θ(x)\nx̂ = decoder_φ(z)\n\nL_reconstruction = mean over examples and coordinates of (x − x̂)²"}</Equation>
<WorkedExample title="Three fixed choices scored on five readings">
<p>
                  {"Now evaluate fixed encoder and decoder rules on five observations. Four are the agreeing pairs from the opening picture: [0, 0], [1, 1], [2, 2] and [3, 3]. The fifth is [2, 0]. The loss averages squared error over all ten coordinates. The table compares three choices of a one-number code and reconstruction rule."}
                </p>
<NumberTable headings={["the encoder keeps", "the decoder writes", "codes for the five readings", "mean squared error"]} rows={[["the average of A and B", "the code into both outputs", "0, 1, 2, 3, 1", "0.2"], ["sensor A alone", "the code into both outputs", "0, 1, 2, 3, 2", "0.4"], ["sensor A alone", "the code into A and zero into B", "0, 1, 2, 3, 2", "1.4"]]} />
<p>
                  {"Averaging has the smallest mean squared error of these three fixed choices. Its only error is on the fifth reading, where it differs by one in each output. Keeping sensor A and copying it differs by two in one output of that reading. Writing zero for sensor B is wrong whenever its observed reading is nonzero."}
                </p>
<p>
                  {"Training uses loss gradients to adjust the encoder and decoder parameters. It need not improve the loss on every finite update. For these five readings, the best rank-one linear reconstruction through the origin has mean squared error about 0.1858, below the average rule’s 0.2. Its line leans slightly toward sensor A because the differing observation has A above B. This is an uncentered subspace fit; ordinary centered PCA first subtracts the data mean."}
                </p>
</WorkedExample>
<p>{"Mean squared error is one possible reconstruction objective for real-valued inputs. A binary or probabilistic observation model can call for a different loss. The loss defines which reconstruction mistakes the model is encouraged to avoid."}</p>
<p>{"A linear bottleneck trained with squared error is closely related to finding a low-dimensional subspace, as in PCA. Nonlinear encoders and decoders can represent more complex relationships, but they also make training and interpretation less direct."}</p>
</SubSection>

</> },
{ title: "Questions on Parts 1 and 2", quiz: [
trueFalse(
  "If the reconstruction has the same height, width and channels as the input, the information in the input has been preserved.",
  false,
  "Shapes matching is a statement about arrangement and not about content. The observation [3, −1] and its reconstruction [1, 1] are both two numbers and differ in both places. Reconstruction error is what measures whether the values agree, which is why it is the quantity the training objective is built from.",
),
choice(
  "What problem does limiting the width of the code solve?",
  [
    "It makes the network faster to train",
    "An unrestricted network can learn to copy its inputs without discovering a useful representation",
    "It guarantees the code will help a later classifier",
    "It drives the reconstruction error to zero",
  ],
  1,
  "With a code as wide as the observation, passing both readings straight through reconstructs [3, −1] and every other input at an error of zero, and the code is only the data under another name. A bottleneck forces the model to choose what it can preserve. A smaller code does not guarantee that the preserved information helps a later classifier or search task, which has to be checked separately, and it does not drive the error to zero either.",
),
choice(
  "The chosen encoder averages two readings and the decoder copies the average into both outputs. For the input [3, −1], what survives?",
  [
    "The average survives and the difference is lost, at a mean squared error of 4",
    "The first reading survives and the second is lost",
    "Both readings survive to within rounding",
    "The difference survives and the average is lost",
  ],
  0,
  "The code is a single number here, so the pair cannot be rebuilt. Moving the live slider changes the difference between the two readings while holding the average constant, and the reconstruction does not move at all.",
),
trueFalse(
  "With the averaging encoder, the inputs [1, 1], [2, 0] and [3, −1] all produce the same code.",
  true,
  "Each pair averages to 1, so the code is 1 and the reconstruction is [1, 1] for all three. The decoder cannot tell which observation it came from. Only the error separates them, at 0 for the first, 1 for the second and 4 for the third, growing with the square of the offset from the shared average.",
),
several(
              "Take the five readings [0, 0], [1, 1], [2, 2], [3, 3] and [2, 0]. Which of these hold?",
              [
                  "Keeping the average and copying it into both outputs scores a mean squared error of 0.2",
                  "Keeping sensor A alone and copying it into both outputs scores worse than averaging",
                  "The best one-number linear code brings the error on these readings to zero",
                  "Mean squared error is the only loss a reconstruction can be scored with",
                ],
              [0, 1],
              "The averaging design reconstructs the first four observations exactly and misses the fifth by one in each coordinate, giving mean squared error 0.2. Copying sensor A gives 0.4. The best one-coordinate linear reconstruction through the origin reaches about 0.1858. These observations do not all lie on one line, so that linear code cannot reconstruct them all exactly. This connects to a principal-component approximation, with the additional choice here that the reconstruction line must pass through the origin.",
              {
                "description": "Sensor A is the first entry and sensor B the second. Compare a code that keeps their average with one that keeps A. Each decoder copies its one stored number into both reconstructed entries. Average squared error over all ten scalar entries, not just the five rows. The best linear code is restricted to one stored number per row."
              },
            ),
] },
{ title: "Part 3. Reconstruction Is Not Yet a Sampling Rule", content: <>
<SubSection title="5. Reproduce the chosen transformation">
<p>
                  {"Each input row contains two sensor readings. The encoder matrix has two rows and one column, producing one code value per observation. The decoder has one row and two columns, rebuilding two readings from each code. The SDK class calculates these codes, reconstructed rows and mean squared error from the supplied matrices; it does not fit them."}
                </p>
<pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm leading-relaxed text-slate-100"><code>{"import numpy as np\nfrom oop_ml.numpy.modern import LinearAutoencoder\n\nmodel = LinearAutoencoder(\n    encoder=np.array([[0.5], [0.5]]),\n    decoder=np.array([[1.0, 1.0]]),\n)\nresult = model.respond_to(np.array([[3.0, -1.0]]))\nprint(result.code)\nprint(result.reconstructed)\nprint(result.mean_squared_error)"}</code></pre>
<p>{"Run as written, it reports a code of 1, a reconstruction of [1, 1] and a mean squared error of 4, the figures from step 3. Given the five readings from step 4 in one call, it returns five codes and a single error averaged over all of them, 0.2. Everything the lesson has calculated so far is a reconstruction, which means it started from an observation."}</p>

</SubSection>
<SubSection title="6. Ask where a new code would come from">
<p>
                  {"For generation, we ask the decoder for a sample without first encoding an observed input. That requires a rule for choosing a code. The resulting sample might resemble or even reproduce a training observation; this route does not guarantee novelty."}
                </p>
<p>{"Once we have a decoder, it is tempting to feed it a random code and call the output a generated example. But a plain autoencoder has not necessarily organized its code space so arbitrary random codes produce useful outputs."}</p>
<WorkedExample title="A thousand codes nobody encoded">
<p>{"The five readings from step 4 produce codes of 0, 1, 2, 3 and 1. Those are the only codes this decoder has ever been checked on. Now pick codes by a rule that ignores the data. A common first guess is a standard normal distribution, the bell curve centered on zero with a spread of one. In one seeded run of 1,000 draws from it, 534 codes were negative."}</p>
<p>{"The copying decoder accepts every one of them. A code of −1.5 comes back as the readings [−1.5, −1.5]. Nothing fails, and nothing says whether a pair of negative readings is something these sensors ever report. None of the five observations looked like that."}</p>
<p>{"The reconstruction loss checks codes produced from the observed inputs. Here it stays at 0.2 even if the decoder behaves badly at other codes, because those locations never enter that calculation. Generation needs an additional rule for which codes to draw and how often. Drawing only the five observed codes would supply such a rule, but could only replay the recorded examples."}</p>
</WorkedExample>
<p>{"A variational autoencoder introduces an explicit prior distribution and a training objective connecting inferred codes to that prior. That gives the next lesson a specific problem to solve: choosing codes for generation."}</p>
<p>
                  {"In the next model, the encoder describes a distribution of possible codes for each input. We choose a prior distribution for generation before training. The objective balances reconstruction against a penalty for differing from that prior. This encourages the decoder to handle codes from the region used in generation, without guaranteeing a useful result for every draw."}
                </p>

</SubSection>
<p>{"Hinton and Salakhutdinov describe learning low-dimensional codes by reconstructing high-dimensional inputs."}{" "}<a href="https://pubmed.ncbi.nlm.nih.gov/16873662/">Reducing the Dimensionality of Data with Neural Networks</a>.</p>
<p>Continue with <Link href="/concepts/variational-autoencoders">Variational Autoencoders</Link>.</p>
</> },
{ title: "Questions on Part 3", quiz: [
trueFalse(
  "The SDK class shown takes its encoder and decoder as given and does not fit them from the rows it is handed.",
  true,
  "It takes explicit encoder and decoder matrices and deliberately does not fit them in this example. What it calculates is the code, the reconstructed rows and the mean squared error, which for the input [3, −1] are 1, [1, 1] and 4. That is enough to follow the chosen transformation without training entering the picture.",
),
trueFalse(
  "Once an autoencoder is trained, handing its decoder a random code produces a useful example.",
  false,
  "Reconstruction training evaluates codes produced by the encoder. It does not by itself specify a distribution for drawing useful new codes. In the supplied experiment, 534 of 1,000 standard-normal draws are negative, and the fixed copying decoder maps them to pairs of negative readings. Those outputs are unlike the five observed inputs. This illustrates a mismatch between the chosen sampling distribution and the code values used in reconstruction.",
),
choice(
  "The five readings produce codes of 0, 1, 2, 3 and 1. What does the reconstruction error of 0.2 say about decoding a code of −1.5?",
  [
    "Nothing, because the error is measured only at codes that came from real inputs",
    "That the output will be about 0.2 away from a real reading",
    "That the decoder will refuse it, since no input produced it",
    "That it decodes to the average of the five readings",
  ],
  0,
  "The reconstruction error of 0.2 summarizes the five observed inputs; it does not evaluate a new code of −1.5. The fixed linear decoder maps that code to [−1.5, −1.5], but the reported training error does not establish whether that output is useful. A generative setup also needs a rule for selecting codes, including how often different regions should be sampled.",
),
choice(
  "What does a variational autoencoder add to address that?",
  [
    "A wider code, so more information survives the bottleneck",
    "An explicit prior distribution and a training objective connecting inferred codes to it",
    "A second decoder trained on random codes",
    "A reconstruction loss suited to binary observations",
  ],
  1,
  "A variational autoencoder defines a prior distribution for drawing codes and trains an input-dependent distribution of codes. Its objective combines a reconstruction term with a penalty for divergence from that prior. This changes the training loss as well as the code-space model. It encourages a more usable sampling arrangement, but it does not guarantee good generated outputs.",
),
] }
,
        {
          title: "Practice. Following a Bottleneck With the Library",
          practice: [
            exercise(
              "Move the offset and watch the code stay put",
              [
  "Build the fixed LinearAutoencoder in the starter: the encoder averages two sensor readings, and the decoder copies that one-number code to both outputs.",
  "Keep average 1 while moving the readings in opposite directions by offsets 0, 0.5, 1, 1.5 and 2. Print each input, code, reconstruction and mean squared error, then the error at offset 1.5 separately.",
  "These weights are chosen by hand. The experiment isolates information lost by averaging rather than demonstrating a trained encoder."
],
              `import numpy as np
from oop_ml.numpy.modern import LinearAutoencoder

model = LinearAutoencoder(
    encoder=np.array([[0.5], [0.5]]),  # two readings in, their average out
    decoder=np.array([[1.0, 1.0]]),  # one code in, copied to both outputs
)

for offset in [0.0, 0.5, 1.0, 1.5, 2.0]:
    readings = np.array([[1 + offset, 1 - offset]])  # one observation, as a row
    # Pass the readings through the model and print the input, the code,
    # the reconstruction and the mean squared error.
    pass
# Print the error at an offset of 1.5 on a line of its own, to two places.
`,
              `import numpy as np
from oop_ml.numpy.modern import LinearAutoencoder

model = LinearAutoencoder(
    encoder=np.array([[0.5], [0.5]]),  # two readings in, their average out
    decoder=np.array([[1.0, 1.0]]),  # one code in, copied to both outputs
)

errors = {}
for offset in [0.0, 0.5, 1.0, 1.5, 2.0]:
    readings = np.array([[1 + offset, 1 - offset]])  # one observation, as a row
    result = model.respond_to(readings)
    errors[offset] = result.mean_squared_error
    print(
        f"offset {offset}: input {readings[0]} code {result.code[0]} "
        f"reconstruction {result.reconstructed[0]} error {result.mean_squared_error:.2f}"
    )
print(f"error at an offset of 1.5: {errors[1.5]:.2f}")
`,
              `offset 0.0: input [1. 1.] code [1.] reconstruction [1. 1.] error 0.00
offset 0.5: input [1.5 0.5] code [1.] reconstruction [1. 1.] error 0.25
offset 1.0: input [2. 0.] code [1.] reconstruction [1. 1.] error 1.00
offset 1.5: input [ 2.5 -0.5] code [1.] reconstruction [1. 1.] error 2.25
offset 2.0: input [ 3. -1.] code [1.] reconstruction [1. 1.] error 4.00
error at an offset of 1.5: 2.25`,
              { hints: [
  "The code can remain fixed while the two individual readings separate.",
  "Compute error against both reconstructed coordinates using the same mean-squared convention as the starter."
], check: numberCheck("What is the mean squared error at an offset of 1.5, to two places?", 2.25, 0.005, "The mean squared error is 2.25. The single average code cannot distinguish opposite sensor deviations that preserve that average."), question: "Which differences are lost when two sensor readings share one average?" },
            ),
            exercise(
              "Remove the bottleneck, then keep only what was lost",
              [
  "Send the supplied observation [3, -1] through two fixed two-coordinate autoencoders: identity encoding/decoding, and encoding by average plus half-difference with its matching decoder.",
  "Print each code, reconstruction and error. Finish with the half-difference value. Compare how the two codes represent the same reconstructable information.",
  "Both codes are as wide as the input. Zero reconstruction error here does not show that either compressed the observation."
],
              `import numpy as np
from oop_ml.numpy.modern import LinearAutoencoder

observation = np.array([[3.0, -1.0]])

copying = LinearAutoencoder(encoder=np.eye(2), decoder=np.eye(2))
# Each column of the encoder builds one code entry from the two readings.
# Each row of the decoder says what one code entry adds to the two outputs.
splitting = LinearAutoencoder(
    encoder=np.array([[0.5, 0.5], [0.5, -0.5]]),
    decoder=np.array([[1.0, 1.0], [1.0, -1.0]]),
)

for label, model in [("copying", copying), ("average and half difference", splitting)]:
    # Pass the observation through the model and print the code, the
    # reconstruction and the mean squared error.
    pass
`,
              `import numpy as np
from oop_ml.numpy.modern import LinearAutoencoder

observation = np.array([[3.0, -1.0]])

copying = LinearAutoencoder(encoder=np.eye(2), decoder=np.eye(2))
# Each column of the encoder builds one code entry from the two readings.
# Each row of the decoder says what one code entry adds to the two outputs.
splitting = LinearAutoencoder(
    encoder=np.array([[0.5, 0.5], [0.5, -0.5]]),
    decoder=np.array([[1.0, 1.0], [1.0, -1.0]]),
)

for label, model in [("copying", copying), ("average and half difference", splitting)]:
    result = model.respond_to(observation)
    print(
        f"{label}: code {result.code[0]} reconstruction {result.reconstructed[0]} "
        f"error {result.mean_squared_error:.2f}"
    )
print(f"half the difference between the readings: {splitting.respond_to(observation).code[0, 1]:.1f}")
`,
              `copying: code [ 3. -1.] reconstruction [ 3. -1.] error 0.00
average and half difference: code [1. 2.] reconstruction [ 3. -1.] error 0.00
half the difference between the readings: 2.0`,
              { hints: [
  "The identity route simply copies both entries.",
  "The second decoder adds and subtracts its second code entry around the stored average. Use the corresponding encoder and decoder together."
], check: numberCheck("What is the second entry of the code that keeps the average and half the difference, for the observation [3, −1]?", 2.0, 0.05, "The second code entry is 2.0. Retaining the half-difference beside the average restores the information the narrower code discarded."), question: "What extra information lets a wider code reconstruct both readings?" },
            ),
            exercise(
              "Rank four codes on the five readings",
              [
  "Compare the three supplied fixed encoders/decoders on the five two-sensor observations. Add the fourth pair using weights 0.7555 and 0.6552 in both encoder and decoder.",
  "For each print the five codes and mean squared reconstruction error. Keep the full five-row input and the same error convention for every pair.",
  "The fourth weights approximate the best origin-passing linear direction for these observations. A code need not be a numerical average if its decoder is designed to match it."
],
              `import numpy as np
from oop_ml.numpy.modern import LinearAutoencoder

readings = np.array([[0.0, 0.0], [1.0, 1.0], [2.0, 2.0], [3.0, 3.0], [2.0, 0.0]])
candidates = {
    "average, copied into both": ([[0.5], [0.5]], [[1.0, 1.0]]),
    "sensor A, copied into both": ([[1.0], [0.0]], [[1.0, 1.0]]),
    "sensor A, zero for B": ([[1.0], [0.0]], [[1.0, 0.0]]),
    # Add the code that leans toward sensor A.
}
for label, (encoder, decoder) in candidates.items():
    # Build the autoencoder from the two lists, pass all five readings
    # through it at once, and print the five codes to two places and
    # the mean squared error to four.
    pass
`,
              `import numpy as np
from oop_ml.numpy.modern import LinearAutoencoder

readings = np.array([[0.0, 0.0], [1.0, 1.0], [2.0, 2.0], [3.0, 3.0], [2.0, 0.0]])
candidates = {
    "average, copied into both": ([[0.5], [0.5]], [[1.0, 1.0]]),
    "sensor A, copied into both": ([[1.0], [0.0]], [[1.0, 1.0]]),
    "sensor A, zero for B": ([[1.0], [0.0]], [[1.0, 0.0]]),
    "leaning toward sensor A": ([[0.7555], [0.6552]], [[0.7555, 0.6552]]),
}
for label, (encoder, decoder) in candidates.items():
    model = LinearAutoencoder(np.array(encoder), np.array(decoder))
    result = model.respond_to(readings)
    codes = ", ".join(f"{code:.2f}" for code in result.code[:, 0])
    print(f"{label}: codes {codes}")
    print(f"    error {result.mean_squared_error:.4f}")
`,
              `average, copied into both: codes 0.00, 1.00, 2.00, 3.00, 1.00
    error 0.2000
sensor A, copied into both: codes 0.00, 1.00, 2.00, 3.00, 2.00
    error 0.4000
sensor A, zero for B: codes 0.00, 1.00, 2.00, 3.00, 2.00
    error 1.4000
leaning toward sensor A: codes 0.00, 1.41, 2.82, 4.23, 1.51
    error 0.1858`,
              { hints: [
  "Evaluate the encoder and its matching decoder as a pair, rather than comparing code magnitudes alone.",
  "Average the squared reconstruction differences over the same observations and coordinates for every design."
], check: numberCheck("What mean squared error does the code leaning toward sensor A score, to four places?", 0.1858, 0.0005, "The tilted encoder/decoder gives error about 0.1858. Its direction fits this particular five-row cloud slightly better than the fixed average-copy design."), question: "Which fixed one-coordinate code reconstructs these five readings best?" },
            ),
            exercise(
              "Hand it shapes that do not fit",
              [
  "Inspect two deliberate shape errors. First construct an encoder reading two inputs with a decoder returning three outputs. Then send the valid two-input autoencoder a flat one-dimensional observation.",
  "Catch the library’s errors and print each class name and message in that order. The decoder must return to the input width, and the input block must retain its explicit observation axis."
],
              `import numpy as np
from oop_ml import MLLibError
from oop_ml.numpy.modern import LinearAutoencoder

try:
    LinearAutoencoder(encoder=np.array([[0.5], [0.5]]), decoder=np.array([[1.0, 1.0, 1.0]]))
except MLLibError as refusal:
    # Print the name of the refusal's type and its message.
    pass

model = LinearAutoencoder(encoder=np.array([[0.5], [0.5]]), decoder=np.array([[1.0, 1.0]]))
# Pass np.array([3.0, -1.0]) to respond_to inside a try block and print
# the refusal the same way.
`,
              `import numpy as np
from oop_ml import MLLibError
from oop_ml.numpy.modern import LinearAutoencoder

try:
    LinearAutoencoder(encoder=np.array([[0.5], [0.5]]), decoder=np.array([[1.0, 1.0, 1.0]]))
except MLLibError as refusal:
    print(f"{type(refusal).__name__}: {refusal}")

model = LinearAutoencoder(encoder=np.array([[0.5], [0.5]]), decoder=np.array([[1.0, 1.0]]))
try:
    model.respond_to(np.array([3.0, -1.0]))
except MLLibError as refusal:
    print(f"{type(refusal).__name__}: {refusal}")
`,
              `ShapeMismatchError: decoder must return to the input width
ShapeMismatchError: inputs must have 2 dimensions`,
              { hints: [
  "Reconstruction compares corresponding input and output coordinates, so their feature widths must agree.",
  "A single two-feature observation still needs shape (1, 2). Catch the specified library error instead of suppressing every exception."
], question: "Can the autoencoder reject a reconstruction with the wrong shape?" },
            ),
          ],
        },
    ]}
  />;
}
