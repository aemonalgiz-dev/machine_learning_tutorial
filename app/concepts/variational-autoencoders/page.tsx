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
  title: "Variational Autoencoders · oop_ml",
  description: "Train reconstruction together with a distribution from which new latent codes can be drawn.",
};

export default function Page() {
  return <ConceptPage
      lessonId="variational-autoencoders"
    title="Variational Autoencoders"
    tagline="Train reconstruction together with a distribution from which new latent codes can be drawn."
    openingTitle="Which Hidden Codes Should We Use to Create Something New?"
    intuition={lessonIntuitions["variational-autoencoders"]}
    technicalStart="Part 2. Sampling and the Variational Objective"
    prerequisites={<>Useful foundations: <Link href="/concepts/autoencoders">Autoencoders</Link>{", "}<Link href="/concepts/loss-functions">loss functions</Link>.</>}
    playgroundIntro="Keep the mean at zero and deviation at one, then change the noise draw. The sample changes while KL remains zero. Next change the distribution parameters and inspect how both the sample and KL respond."
    playground={<ModernLearningExample topic="variational-autoencoders" />}
    sections={[
{ title: "Part 1. Describe a Distribution Before Drawing From It", content: <>
<SubSection title="1. Distinguish the inferred distribution from the prior">
<p>{"The encoder's distribution depends on the input. It describes plausible latent codes for that particular observation and is often called an approximate posterior. The prior is a separate distribution chosen as the source of codes before an observation is given."}</p>
<p>{"In the common diagonal Gaussian setup, the encoder supplies a mean and variance for each coordinate. Diagonal means the coordinates are modeled as independent within this conditional Gaussian. Implementations often predict log variance so the variance remains positive after exponentiation."}</p>

</SubSection>
<SubSection title="2. Give reconstruction and regularization different jobs">
<p>{"The decoder describes how an input can be generated from a code. The reconstruction term rewards codes that help account for the observed input. The KL term measures how far the inferred code distribution is from the prior."}</p>
<p>{"These objectives compete. A code that ignores the input can match the prior well but reconstruct poorly. An overly powerful decoder can also learn to ignore its latent code, a failure called posterior collapse. Merely making KL small does not establish a useful representation."}</p>

</SubSection>

</> },
{ title: "Part 2. Sampling and the Variational Objective", content: <>
<SubSection title="3. Separate the random draw from the encoder's parameters">
<p>{"Let μ be the mean, σ the standard deviation, and ε a standard normal noise draw. Instead of asking an opaque sampler to draw directly from the encoder's Gaussian, express the sample as a transformation of independent noise."}</p>
<Equation>{"ε ~ Normal(0, 1)\nz = μ + σ ⊙ ε\n\nIllustrative coordinate:\nμ = 1,  σ = 0.5,  ε = −0.4\nz = 1 + (0.5 × (−0.4)) = 0.8"}</Equation>
<p>{"The symbol ⊙ means coordinate-by-coordinate multiplication. For a fixed noise draw, the code changes smoothly with the mean and deviation, so gradients can pass from the decoder back into those parameters. This is the reparameterization trick."}</p>
</SubSection>
<SubSection title="4. Write the two terms of the loss">
<p>{"Use q for the encoder's approximate posterior and p for the prior and decoder distributions. The following negative evidence lower bound is minimized. The expectation averages reconstruction likelihood over sampled codes."}</p>
<Equation>{"L(x) = E_{z ~ q_φ(z|x)}[−log p_θ(x|z)]\n       + KL(q_φ(z|x) || p(z))\n\nFor a diagonal Gaussian q and standard normal p:\nKL = ½ Σⱼ [μⱼ² + σⱼ² − 1 − log(σⱼ²)]"}</Equation>
<p>{"The first term depends on the decoder's observation model. A fixed-variance Gaussian likelihood leads to a scaled squared-error reconstruction term plus constants. Other observations require different likelihood choices."}</p>
<p>{"For a mean of zero and deviation of one, the approximate posterior matches the standard normal prior and this KL is zero. Changing a particular noise draw does not change KL because KL compares distributions, not sampled points."}</p>
<WorkedExample title="The KL term for the illustrative coordinate">
<p>Take the coordinate from step 3, with a mean of 1 and a deviation of 0.5. Its variance is 0.25, and the logarithm of a number below one is negative, so the last term inside the bracket adds to the total rather than taking from it.</p>
<Equation>{"μ² = 1,  σ² = 0.25,  log(σ²) ≈ −1.3863\n\nKL = ½ (1 + 0.25 − 1 − (−1.3863))\n   = ½ × 1.6363\n   ≈ 0.8181"}</Equation>
<p>Every noise draw leaves this number where it is. A draw of −2 gives a sample of 0, a draw of 0 gives the mean itself, and a draw of 2 gives a sample of 2, while the KL term stays at 0.8181 for all three, because the distribution they were drawn from has not moved.</p>
<p>Holding the deviation at one and moving only the mean, the term grows with the square of the mean. A mean of 1 or −1 costs 0.5, and a mean of 2 or −2 costs 2.0. The term reaches zero only where the mean is zero and the deviation is one together, so a posterior pays for being off-center and for being the wrong width, and the reconstruction term is what has to make either worth paying for.</p>
</WorkedExample>
</SubSection>

</> },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            choice(
              "What does the encoder’s distribution describe?",
              [
                "Plausible latent codes for the particular observation it was given",
                "The source of codes chosen before any observation is given",
                "How an input can be generated from a code",
                "One best code for the whole dataset",
              ],
              0,
              "The encoder’s distribution depends on the input, which is why it is often called an approximate posterior. A source of codes chosen before any observation is given is the prior, a separate distribution, and how an input is generated from a code is the decoder’s description rather than the encoder’s.",
            ),
            several(
              "Which of these hold for writing the sample as z = μ + σ ⊙ ε?",
              [
                "⊙ means coordinate-by-coordinate multiplication",
                "For a fixed noise draw, the code changes smoothly with the mean and the deviation",
                "Gradients can pass from the decoder back into the mean and the deviation",
                "The noise draw ε depends on the encoder’s parameters",
              ],
              [0, 1, 2],
              "The whole purpose of the reparameterization trick is to express the sample as a transformation of independent noise, so ε is standard normal and carries no dependence on the encoder. That is what leaves a smooth route from the code back to the parameters the encoder supplied.",
            ),
            choice(
              "For the illustrative coordinate, with a mean of 1 and a deviation of 0.5, what is the KL term to four places?",
              ["0.8181", "0.5", "0.0", "2.0"],
              0,
              "The variance is 0.25 and its logarithm is about −1.3863, so the bracket comes to 1.6363 and half of it is 0.8181. A mean of 1 with the deviation left at one would cost 0.5 and a mean of 2 would cost 2.0, while 0.0 belongs to a mean of zero with a deviation of one, where the posterior is the prior.",
            ),
            trueFalse(
              "Making the KL term small is enough to establish a useful representation.",
              false,
              "The two objectives compete, so a small KL can be bought by a code that ignores the input and reconstructs poorly. An overly powerful decoder can learn to ignore its latent code as well, which is the failure called posterior collapse.",
            ),
            trueFalse(
              "With the mean at zero and the deviation at one, the KL term stays at zero whatever noise draw is chosen.",
              true,
              "KL compares distributions rather than sampled points, so a different draw moves the sample and leaves KL alone, and at a mean of zero and a deviation of one the approximate posterior is the standard normal prior exactly. The sample is another matter, since it is the mean plus the deviation times the draw and so moves one for one with the draw there.",
            ),
        ],
        },
{ title: "Part 3. From the Latent Operation to a VAE", content: <>
<SubSection title="5. Inspect one posterior directly">
<p>{"The SDK object exposes the reparameterized sample and exact Gaussian KL. The live example keeps the chosen draw visible so the distinction between sample and distribution is testable."}</p>
<pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm leading-relaxed text-slate-100"><code>{"import numpy as np\nfrom oop_ml.numpy.modern import DiagonalGaussian\n\nposterior = DiagonalGaussian(\n    mean=np.array([1.0]), deviation=np.array([0.5]),\n)\nprint(posterior.sample(np.array([-0.4])))\nprint(posterior.kl_to_standard_normal)"}</code></pre>
<p>{"This is the latent-distribution operation, not a trained VAE. A complete implementation must connect it to an encoder and decoder, define the reconstruction likelihood, sample during training, and propagate the resulting gradients."}</p>
</SubSection>
<SubSection title="6. Use the prior when generating">
<p>{"After fitting the model, draw a new code from the prior and decode it. There is no input image to encode on this route. Sampling more codes produces a distribution of outputs rather than a single reconstruction."}</p>
<p>{"A latent coordinate does not automatically have an interpretable meaning such as rotation or color. Those meanings depend on the data, architecture, objective, and learned representation. Inspect them instead of assigning meanings in advance."}</p>

</SubSection>
<p>{"The original VAE paper derives the variational objective and the reparameterized gradient estimator."}{" "}<a href="https://arxiv.org/abs/1312.6114">Auto-Encoding Variational Bayes</a>.</p>
<p>Continue with <Link href="/concepts/generative-adversarial-networks">Generative Adversarial Networks</Link>.</p>
</> },
        {
          title: "Questions on Part 3",
          quiz: [
            several(
              "Which of these must a complete VAE add to the latent-distribution operation shown here?",
              [
                "An encoder and a decoder",
                "A reconstruction likelihood",
                "A separate noise draw for the KL term",
                "An exact Gaussian KL",
              ],
              [0, 1],
              "The object behind the page already exposes the reparameterized sample and the exact Gaussian KL, and the KL needs no draw at all, since it is computed from the mean and the deviation and compares distributions rather than points. What is missing is everything that makes those two numbers part of a trained model, which also means sampling during training and propagating the resulting gradients.",
            ),
            trueFalse(
              "Generating a new output from the prior needs no input image, because a code is drawn from the prior and decoded.",
              true,
              "There is no input to encode on that route, so the encoder is not used. Sampling more codes produces a distribution of outputs rather than a single reconstruction, which is what makes the route a generator rather than a copier.",
            ),
            choice(
              "A latent coordinate turns out to track rotation. What follows from that?",
              [
                "Nothing in general, because such meanings depend on the data, architecture, objective and learned representation",
                "The coordinates are independent in a diagonal Gaussian, so every coordinate must carry one interpretable factor",
                "The KL term forces each coordinate to take a separate meaning",
                "Rotation and color are the meanings the prior supplies",
              ],
              0,
              "A latent coordinate does not automatically have an interpretable meaning, so one found on a particular model is an observation about that model. Meanings of this kind are inspected after fitting rather than assigned in advance.",
            ),
        ],
        },
        {
          title: "Practice. Draw From One Posterior and Score It With the Library",
          practice: [
            exercise(
              "Reproduce the illustrative coordinate",
              ["Build the posterior from step 3, with a mean of 1 and a deviation of 0.5, hand it the noise draw of −0.4, and print the sampled code and the KL term to the standard normal prior.", "Part 2 arrived at a sample of 0.8 by hand and the worked example at a KL term of 0.8181. The library takes the same arithmetic, so both should match to the places printed."],
              `import numpy as np
from oop_ml import DiagonalGaussian

posterior = DiagonalGaussian(mean=np.array([1.0]), deviation=np.array([0.5]))
# Sample a code with the noise draw -0.4 and print it to four places,
# then print the KL term to the standard normal prior to four places.`,
              `import numpy as np
from oop_ml import DiagonalGaussian

posterior = DiagonalGaussian(mean=np.array([1.0]), deviation=np.array([0.5]))

code = posterior.sample(np.array([-0.4]))
print(f"sampled code {code[0]:.4f}")
print(f"KL to the standard normal {posterior.kl_to_standard_normal:.4f}")`,
              `sampled code 0.8000
KL to the standard normal 0.8181`,
              { hints: ["sample takes the noise draw as a one-dimensional array with one entry per code coordinate, so a single coordinate still goes in as an array of one.", "The KL term is a property rather than a method, since it depends only on the mean and the deviation the posterior was built with."], check: numberCheck("What KL term does the posterior report, to four places?", 0.8181, 0.0005, "The variance is 0.25 and its logarithm is about −1.3863, so half of 1 plus 0.25 less 1 less that logarithm is 0.8181. The draw has no part in it, which is the point Part 2 makes about KL comparing distributions rather than sampled points.") },
            ),
            exercise(
              "Move the draw, then widen the code",
              ["Keep the same posterior and sample it with three draws, −2, 0 and 2, printing the sample and the KL term each time. Then build a posterior of two coordinates, both with a mean of 1 and a deviation of 0.5, and print its KL term.", "The worked example says the three draws move the sample from 0 to 2 and leave the term alone. The two-coordinate term is a number the lesson does not print, and the formula sums over coordinates, so there is only one value it can be."],
              `import numpy as np
from oop_ml import DiagonalGaussian

posterior = DiagonalGaussian(mean=np.array([1.0]), deviation=np.array([0.5]))
# For each draw in -2, 0 and 2, print the sample and the KL term.

# Build a two-coordinate posterior, both coordinates at mean 1 and
# deviation 0.5, and print its KL term to four places.`,
              `import numpy as np
from oop_ml import DiagonalGaussian

posterior = DiagonalGaussian(mean=np.array([1.0]), deviation=np.array([0.5]))
for draw in [-2.0, 0.0, 2.0]:
    code = posterior.sample(np.array([draw]))
    print(f"draw {draw:+.1f}  sample {code[0]:.4f}  KL {posterior.kl_to_standard_normal:.4f}")

wider = DiagonalGaussian(mean=np.array([1.0, 1.0]), deviation=np.array([0.5, 0.5]))
print(f"two such coordinates  KL {wider.kl_to_standard_normal:.4f}")`,
              `draw -2.0  sample 0.0000  KL 0.8181
draw +0.0  sample 1.0000  KL 0.8181
draw +2.0  sample 2.0000  KL 0.8181
two such coordinates  KL 1.6363`,
              { hints: ["A posterior of two coordinates takes a mean array of two entries and a deviation array of two entries, and the two arrays have to be the same length.", "The KL formula in Part 2 carries a sum over j, one term per coordinate, so two identical coordinates cost exactly twice one."], check: numberCheck("What KL term does the two-coordinate posterior report, to four places?", 1.6363, 0.0005, "KL is summed over coordinates, so two coordinates each at a mean of 1 and a deviation of 0.5 cost twice 0.8181. The three draws before it moved the sample from 0 to 2 and the term not at all.") },
            ),
            exercise(
              "Find where the deviation is free",
              ["Hold the mean at zero and sweep the deviation over 0.1, 0.5, 1 and 2, printing the KL term at each. Print the logarithm of 0.01 as well, since it explains the first number.", "Part 2 says the term is zero at a deviation of one. The sweep shows what happens on either side of it, and the two sides are not symmetric."],
              `import numpy as np
from oop_ml import DiagonalGaussian

# For each deviation in 0.1, 0.5, 1.0 and 2.0, build a posterior with a mean
# of zero and print its KL term to four places.

print(f"log of 0.01 {np.log(0.01):.4f}")`,
              `import numpy as np
from oop_ml import DiagonalGaussian

for deviation in [0.1, 0.5, 1.0, 2.0]:
    posterior = DiagonalGaussian(mean=np.array([0.0]), deviation=np.array([deviation]))
    print(f"mean 0  deviation {deviation:.1f}  KL {posterior.kl_to_standard_normal:.4f}")

print(f"log of 0.01 {np.log(0.01):.4f}")`,
              `mean 0  deviation 0.1  KL 1.8076
mean 0  deviation 0.5  KL 0.3181
mean 0  deviation 1.0  KL 0.0000
mean 0  deviation 2.0  KL 0.8069
log of 0.01 -4.6052`,
              { hints: ["Each deviation needs its own posterior, since the deviation is fixed at construction and there is nothing to set afterwards.", "With the mean at zero the term is half of the variance, less one, less the logarithm of the variance. The logarithm is what dominates for a narrow posterior."], check: numberCheck("What KL term does a deviation of 0.1 report, to four places?", 1.8076, 0.0005, "A deviation of 0.1 has a variance of 0.01, whose logarithm is −4.6052, so the term is half of 0.01 less 1 plus 4.6052, which is 1.8076. A deviation of 2 costs 0.8069 on the other side, so a posterior is penalised for being too narrow more sharply than for being too wide by the same factor, and only a deviation of one is free.") },
            ),
            exercise(
              "Ask for a deviation of zero",
              ["A deviation of zero would turn the posterior into a single point. Try to build one and see what the library does about it.", "The KL formula takes the logarithm of the variance, and the logarithm of zero has no finite value, so a term reported for this posterior would be a number standing in for nothing. Catch what the library raises, and print its name and its message."],
              `import numpy as np
from oop_ml import DiagonalGaussian, MLLibError

# Try to build a posterior with a mean of zero and a deviation of zero.
# Catch the library's own error, and print the name of its class and its message.`,
              `import numpy as np
from oop_ml import DiagonalGaussian, MLLibError

try:
    DiagonalGaussian(mean=np.array([0.0]), deviation=np.array([0.0]))
except MLLibError as refusal:
    print(type(refusal).__name__)
    print(refusal)`,
              `InvalidValuesError
deviations must be strictly positive`,
              { hints: ["Every refusal the library makes derives from one base class, so catching that one catches whichever specific refusal this turns out to be.", "The refusal comes from the constructor, before any sample is drawn, because a posterior that cannot be scored should not exist at all."] },
            ),
          ],
        },
    ]}
  />;
}

