import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { choice, several, trueFalse } from "@/lib/quizzes";
import { exercise, numberCheck } from "@/lib/exercises";
import { Equation } from "@/components/concept/Equation";
import { NumberTable, SubSection, WhyThisWorks, WorkedExample } from "@/components/concept/Treatments";
import { ModernLearningExample } from "@/components/widgets/ModernLearningExample";
import { lessonIntuitions } from "@/lib/intuition";

export const metadata: Metadata = {
  title: "Low-Rank Adaptation · oop_ml",
  description: "Adapting every weight in a large model can be expensive. LoRA keeps the original weights fixed and learns a smaller correction through two narrow matrices, reducing the number of parameters that need updating.",
};

export default function Page() {
  return <ConceptPage
      lessonId="low-rank-adaptation"
    title="Low-Rank Adaptation"
    tagline={"Adapting every weight in a large model can be expensive. LoRA keeps the original weights fixed and learns a smaller correction through two narrow matrices, reducing the number of parameters that need updating."}
    openingTitle="Do We Need to Change Every Weight to Teach a New Task?"
    intuition={lessonIntuitions["low-rank-adaptation"]}
    technicalStart="Part 2. Calculate the Factored Update"
    prerequisites={<>Useful foundations: <Link href="/concepts/dense-layers">Dense layers</Link>{", "}<Link href="/concepts/supervised-fine-tuning">supervised fine-tuning</Link>.</>}
    playgroundIntro="Start with rank one and inspect the assembled update and parameter counts. Raise the rank before changing alpha. The four-by-four example is intentionally small enough to show when an adapter stops saving parameters."
    playground={<ModernLearningExample topic="low-rank-adaptation" />}
    sections={[
{ title: "Part 1. Freeze the Base and Describe a Correction", content: <>
<SubSection title="1. Separate what stays fixed from what learns">
<p>{"The previous lesson fine-tuned by letting every weight move. A projection that carries one layer’s values to the next has one weight for every pairing of an input coordinate with an output coordinate. A model built from many wide projections therefore has a great many weights, and a fully fine-tuned copy for each task has to store all of them again. The question in the title is whether a task’s change really needs that many numbers."}</p>
<p>{"LoRA freezes a pretrained weight matrix and adds a trainable low-rank update. During task training, gradients update the adapter factors while the base matrix stays fixed. The full model still runs a forward and backward computation through the relevant paths."}</p>
<p>{"It helps to name the two things separately. The base is the pretrained matrix. It is frozen, which means the optimizer never writes to it. The correction is a second matrix of the same shape that is added to the base. The adapted projection is their sum, and only the correction is learned."}</p>
<Equation>{"Adapted projection = base     + correction\n                     (frozen)   (learned)"}</Equation>
<p>{"The tiny projection on this page maps four coordinates to four, so it has 16 weights. Full fine-tuning would learn and store 16 changed numbers for a task. The adapter worked through below describes its correction with 8."}</p>
<p>{"Reducing trainable parameters can reduce optimizer-state storage and make task-specific checkpoints smaller. It does not remove the need to load the base model or store the activations needed for training."}</p>
<p>{"Both halves of that follow from what is frozen and what is not. Many optimizers keep running numbers of their own for each parameter they update, so fewer trainable parameters means less of that state, and a saved task holds only the adapter. But the adapter’s gradient is found by running the whole model forward and then backward. That needs the base weights in memory, and it needs the values each layer produced on the way through."}</p>

</SubSection>
<SubSection title="2. Make rank a limit on the possible update">
<p>{"The adapter maps an input through a narrow intermediate space and then back to the output width. If that intermediate space has one coordinate, all output corrections are scaled versions of one learned direction. More coordinates allow combinations of more directions."}</p>
<p>{"Follow that with numbers. Take an adapter whose intermediate space has one coordinate. Its first factor reads only the first input coordinate. Its second factor writes one half of whatever it is handed into the second output coordinate. The base is the identity, which returns its input unchanged, so anything different in the output is the adapter’s doing."}</p>
<NumberTable headings={["Input", "The one intermediate number", "Correction added to the output"]} rows={[["[1, 0, 0, 0]", "1", "[0, 0.5, 0, 0]"], ["[0, 1, 0, 0]", "0", "[0, 0, 0, 0]"], ["[3, 1, 0, 0]", "3", "[0, 1.5, 0, 0]"], ["[−2, 0, 1, 4]", "−2", "[0, −1, 0, 0]"]]} caption="Four inputs through one rank-one adapter. These are the factors used in the code of Part 3." />
<p>{"Every correction in the last column is a multiple of [0, 0.5, 0, 0]. The input decides the multiple and nothing else. Four numbers went in, one number came through the middle, and one number cannot carry more than a single direction of change out the other side. That is what a rank of one means. With two intermediate coordinates the adapter could add any combination of two directions, and with r of them, r directions."}</p>
<p>{"Rank constrains the update, not the rank of the frozen base matrix. A small-rank correction can be added to a full-rank base. Whether that restriction is sufficient depends on the task and the projections being adapted."}</p>
<p>{"The example shows this as well. Its correction has a rank of one, and the identity it is added to has the full rank of four. Their sum still has a rank of four. A low-rank update adjusts a matrix. It does not flatten it."}</p>

</SubSection>

</> },
{ title: "Part 2. Calculate the Factored Update", content: <>
<SubSection title="3. Fix the matrix convention before multiplying">
<p>{"Our code uses row-vector inputs. W maps the input width to the output width, A maps into rank r, and B maps back out. The scalar α controls the adapter scale."}</p>
<Equation>{"W: (d_in, d_out)\nA: (d_in, r)\nB: (r, d_out)\n\nΔW = (α / r) A B\ny = x W + (α / r) (x A) B\n  = x (W + ΔW)"}</Equation>
<p>{"The second expression shows the separate base and adapter routes. The third shows why this linear update can be merged into a copy of the base matrix for inference. Merging does not require another task-training step."}</p>
<WorkedExample title="One input through both routes">
<p>{"Use the adapter from Part 1 on the input [1, 0, 0, 0], with α set to 1. The base W is the four-by-four identity, A is the column [1, 0, 0, 0] and B is the row [0, 0.5, 0, 0], so r is 1."}</p>
<Equation>{"Base route:     x W = [1, 0, 0, 0]\n\nAdapter route:  x A = (1 × 1) + (0 × 0) + (0 × 0) + (0 × 0) = 1\n                (x A) B = 1 × [0, 0.5, 0, 0] = [0, 0.5, 0, 0]\n                α / r = 1 / 1 = 1\n\nSum:            y = [1, 0, 0, 0] + (1 × [0, 0.5, 0, 0])\n                  = [1, 0.5, 0, 0]"}</Equation>
<p>{"The merged form reaches the same output by doing the work in another order. Multiply the factors first, and ΔW is a four-by-four matrix whose only nonzero entry is 0.5, in the first row and second column. Add it to the identity, and that single matrix sends [1, 0, 0, 0] to [1, 0.5, 0, 0] in one multiplication."}</p>
</WorkedExample>
<p>{"The two forms suit different moments. During training the routes are kept apart, because A and B are the things being updated. Afterward a merged copy costs nothing extra to run, while a separate adapter lets one stored base serve several tasks by swapping a small pair of factors."}</p>
<p>{"A common initialization makes one factor zero so the initial correction is zero while the other factor is nonzero. Setting both factors to zero would give both a zero first derivative through their product. The live example instead uses nonzero chosen factors so the correction is visible immediately."}</p>
<WhyThisWorks title="Why both factors cannot start at zero">
<p>{"The correction is a product, and the slope of a product with respect to one factor is the other factor. The gradient that reaches A is the loss’s gradient multiplied by B, and the gradient that reaches B is multiplied by x A. If both factors are zero, both gradients are zero, and neither factor ever leaves zero."}</p>
<p>{"If only B starts at zero, the correction is still zero at the start, so the adapted model begins as exactly the pretrained one. But x A is not zero, so B receives a gradient on the first step. Once B has moved, A receives one too."}</p>
</WhyThisWorks>
</SubSection>
<SubSection title="4. Count parameters instead of assuming a saving">
<p>{"The full projection has one parameter for each input-output pair. The adapter has one matrix on each side of the rank bottleneck."}</p>
<Equation>{"Full projection: d_in × d_out\nAdapter:         (d_in × r) + (r × d_out)\n\nFor a four-by-four projection:\nFull update = 4 × 4 = 16\nRank one adapter = (4 × 1) + (1 × 4) = 8\nRank two adapter = (4 × 2) + (2 × 4) = 16\nRank three adapter = (4 × 3) + (3 × 4) = 24"}</Equation>
<p>{"The default rank-one case saves trainable parameters. Rank two breaks even on this tiny matrix; rank three uses more. Large projection widths allow useful low ranks to be a much smaller fraction of a full update."}</p>
<p>{"The break-even point can be read off the two formulas. For a square projection of width d the full update has d × d parameters and the adapter has 2 × d × r, so the adapter is the smaller of the two only while r is less than half of d. At a width of four that leaves rank one and nothing else, which is what the counts above show. The same two formulas at larger widths give the picture the method was designed for."}</p>
<NumberTable headings={["Width d", "Rank r", "Full update, d × d", "Adapter, 2 × d × r", "Adapter as a share of full"]} rows={[["4", "1", "16", "8", "50%"], ["64", "4", "4,096", "512", "12.5%"], ["256", "4", "65,536", "2,048", "3.1%"], ["1,024", "8", "1,048,576", "16,384", "1.6%"]]} caption="Parameter counts for square projections. They are counts from the two formulas, and they say nothing about whether a given rank is enough for a task." />
<p>{"The adapter’s count grows in step with the width, and the full update’s grows with the width squared. So the wider the projection, the smaller the share a fixed rank takes."}</p>
</SubSection>

</> },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            trueFalse(
              "Because only the adapter factors are trained, a LoRA run no longer needs the base model loaded.",
              false,
              "It still does. Freezing the base matrix can reduce optimizer-state storage and make task-specific checkpoints smaller, and it removes neither the base model nor the activations a backward pass needs. The full model still runs a forward and backward computation through the relevant paths.",
            ),
            choice(
              "The adapter maps an input into an intermediate space with one coordinate. What corrections can it then express?",
              [
                "Scaled versions of a single learned direction",
                "Any correction whose entries are small enough",
                "Any correction at all, provided alpha is large enough",
                "Corrections to one row of the base matrix and no others",
              ],
              0,
              "One coordinate in the bottleneck leaves one direction, and every output correction is that direction scaled. More coordinates allow combinations of more directions. Alpha only sets the scale of the correction, so no value of it widens what the bottleneck can express.",
            ),
            trueFalse(
              "A rank-one correction can be added to a base matrix of full rank, and the sum can still have full rank.",
              true,
              "Rank constrains the update and says nothing about the base. The page’s own example adds a correction of rank one to the four-by-four identity, and the sum still has a rank of four. Whether so narrow a correction is sufficient is a separate question, which depends on the task and on which projections are being adapted.",
            ),
            choice(
              "On the four-by-four projection the page uses, which is the first rank that does not save trainable parameters against a full update?",
              ["Rank one", "Rank two", "Rank three", "Every rank saves on a projection this size"],
              1,
              "The full update has sixteen parameters and a rank-two adapter has sixteen as well, so it breaks even, while rank three uses twenty-four. Rank one is the only saving at this width. Large projection widths are what let a useful low rank be a much smaller fraction of a full update.",
            ),
            trueFalse(
              "With the identity base and the factors of the worked example, the two-route calculation and the merged matrix both send [1, 0, 0, 0] to [1, 0.5, 0, 0].",
              true,
              "The update is linear, so the base route and the adapter route add up to the output of a single matrix. The adapter route passes the number 1 through the middle and writes [0, 0.5, 0, 0], and the merged matrix is the identity with one extra entry of 0.5. Merging is a rewriting of the same arithmetic, so it needs no further training step.",
            ),
        ],
        },
{ title: "Part 3. Connect the Operation to Fine-Tuning", content: <>
<SubSection title="5. Inspect an explicit adapter">
<p>{"The SDK takes a base matrix, both factors, and alpha. It returns the adapted output and exposes the assembled update and parameter count. The chosen factors in this snippet are for arithmetic, not a trained task."}</p>
<pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm leading-relaxed text-slate-100"><code>{"import numpy as np\nfrom oop_ml.numpy.modern import LowRankAdapter\n\nadapter = LowRankAdapter(\n    base=np.eye(4),\n    down=np.array([[1.0], [0.0], [0.0], [0.0]]),\n    up=np.array([[0.0, 0.5, 0.0, 0.0]]),\n    alpha=1.0,\n)\nprint(adapter.respond_to(np.array([[1.0, 0.0, 0.0, 0.0]])))\nprint(adapter.trainable_parameters)"}</code></pre>
<p>{"The snippet builds the adapter traced in Part 2 and prints two things. The first is the adapted output [1, 0.5, 0, 0]. The second is the trainable count of 8, which is four numbers in each factor."}</p>
<p>{"Change alpha to 2.0 and run it again. The output becomes [1, 1, 0, 0]. The correction has doubled from 0.5 to 1, it still lands on the second coordinate alone, and the count is still 8. Alpha sets how large the correction is along a direction the factors have already chosen. It adds nothing to what the adapter can express."}</p>
<p>{"The live example runs the same operation on different chosen factors. They are drawn at random from a fixed seed, so the update has no convenient zeros, and the input is [1, 0, 0.5, −0.5]. The base is again the identity, so the change in each coordinate is the adapter’s contribution."}</p>
<NumberTable headings={["Coordinate", "Input", "Output at rank one", "Change"]} rows={[["1", "1", "1.0007", "0.0007"], ["2", "0", "−0.0355", "−0.0355"], ["3", "0.5", "0.4884", "−0.0116"], ["4", "−0.5", "−0.5039", "−0.0039"]]} caption="The live example at rank one and an alpha of 1." />
<p>{"All four coordinates moved this time, and it is still one direction. The table of the assembled update in the live example shows why. Its second, third and fourth rows are the first row multiplied by −0.817, −0.536 and 1.074. Sixteen entries are on display, and eight numbers produced them. Raise the rank to two and the rows stop being multiples of one another, while the count reaches the 16 of a full update. At rank three it passes that with 24."}</p>

</SubSection>
<SubSection title="6. Choose and evaluate the adaptation">
<p>{"Nothing so far has been trained, so it is worth saying where this operation meets the previous lesson. Training runs the model forward with the adapted output y in place of the base output, computes the response loss, and the gradient of that loss travels back along both routes. On the base route it arrives at W, which is frozen, so nothing is written. On the adapter route it arrives at A and B, and those are updated."}</p>
<p>{"A real setup chooses which projections receive adapters, a rank and scaling policy, the training examples, and the optimizer. The response loss can be the same supervised objective used for full fine-tuning. The difference is which parameters are allowed to change."}</p>
<p>{"Each of those choices has a cost that the tiny example makes visible. Every projection given an adapter adds another pair of factors to train and store. A higher rank allows more directions and costs more parameters, and past the break-even point it costs more than the full update it was meant to replace. The scaling sets how large the correction is beside the frozen base."}</p>
<p>{"LoRA is not quantization. Quantization changes how numerical values are represented or computed. The two techniques can be combined, but parameter rank and numeric precision solve different storage and computation problems."}</p>
<p>{"Evaluate the adapted task and the behavior worth retaining. A smaller checkpoint is a resource property; it does not by itself prove that an adapter learned the intended behavior."}</p>

</SubSection>
<p>{"The paper proposes freezing pretrained weights and learning low-rank changes to selected model projections."}{" "}<a href="https://arxiv.org/abs/2106.09685">LoRA: Low-Rank Adaptation of Large Language Models</a>.</p>
<p>Continue with <Link href="/concepts/reinforcement-learning">Reinforcement Learning</Link>.</p>
</> },
        {
          title: "Questions on Part 3",
          quiz: [
            trueFalse(
              "LoRA is a form of quantization.",
              false,
              "They answer different questions. Quantization changes how numerical values are represented or computed, while rank limits how much of a projection is allowed to change. The two can be combined, and neither substitutes for the other.",
            ),
            trueFalse(
              "A smaller task checkpoint is evidence that the adapter learned the intended behavior.",
              false,
              "A smaller checkpoint is a resource property and nothing more. What has to be evaluated is the adapted task together with the behavior worth retaining, since an adapter that saves storage can still have learned the wrong thing.",
            ),
            choice(
              "While an adapter is being trained on the response loss, which numbers does the gradient update?",
              [
                "The two adapter factors, and nothing in the base matrix",
                "The base matrix, with the factors rebuilt from it afterward",
                "The base matrix and both factors",
                "Only alpha, since it sets the scale of the correction",
              ],
              0,
              "The gradient travels back along both routes. On the base route it arrives at a frozen matrix, so nothing is written there, and on the adapter route it arrives at the two factors, which are updated. The objective can be the same one full fine-tuning uses. What differs is the set of numbers allowed to move.",
            ),
            several(
              "The snippet in step 5 is rerun with alpha changed from 1 to 2. Which of these change?",
              [
                "The size of the correction, which goes from 0.5 to 1",
                "The printed output, which becomes [1, 1, 0, 0]",
                "The coordinate the correction lands on",
                "The trainable parameter count",
              ],
              [0, 1],
              "Alpha multiplies the assembled update, so the correction doubles and the output’s second coordinate goes from 0.5 to 1. It still lands on the second coordinate alone, because the direction was fixed by the two factors, and the count is still 8, because alpha is not one of the factors’ entries.",
            ),
            several(
              "Which of these does a real setup still have to choose once LoRA is in use?",
              [
                "Which projections receive adapters",
                "A rank and a scaling policy",
                "The training examples and the optimizer",
                "A new objective, since the supervised objective used for full fine-tuning cannot be reused",
              ],
              [0, 1, 2],
              "Which projections receive adapters, the rank and scaling, and the examples and optimizer are all still open decisions. The response loss can be the same supervised objective used for full fine-tuning, so the objective is the one thing that does not have to change. What the method changes is which parameters are allowed to move.",
            ),
        ],
        },
        {
          title: "Practice. Assemble and Count an Adapter With the Library",
          practice: [
            exercise(
              "Send four inputs through the rank-one adapter",
              ["Part 1 tabulated four inputs through one adapter and found every correction to be a multiple of [0, 0.5, 0, 0]. Build that adapter on an identity base and print, for each input, the adapted output and the correction, which is the output minus the input because the base returns its input unchanged.", "Then print the assembled update and the trainable parameter count. The update should hold a single nonzero entry, and the count should be the 8 the page gives for rank one."],
              `import numpy as np
from oop_ml.numpy.modern import LowRankAdapter

down = np.array([[1.0], [0.0], [0.0], [0.0]])
up = np.array([[0.0, 0.5, 0.0, 0.0]])
inputs = np.array([
    [1.0, 0.0, 0.0, 0.0],
    [0.0, 1.0, 0.0, 0.0],
    [3.0, 1.0, 0.0, 0.0],
    [-2.0, 0.0, 1.0, 4.0],
])
# Build the adapter on a four-by-four identity base with an alpha of 1.
# Send all four inputs through it at once, and for each row print the
# output and the correction. Then print the assembled update and the
# trainable parameter count.`,
              `import numpy as np
from oop_ml.numpy.modern import LowRankAdapter

down = np.array([[1.0], [0.0], [0.0], [0.0]])
up = np.array([[0.0, 0.5, 0.0, 0.0]])
inputs = np.array([
    [1.0, 0.0, 0.0, 0.0],
    [0.0, 1.0, 0.0, 0.0],
    [3.0, 1.0, 0.0, 0.0],
    [-2.0, 0.0, 1.0, 4.0],
])
adapter = LowRankAdapter(base=np.eye(4), down=down, up=up, alpha=1.0)
outputs = adapter.respond_to(inputs)

for row, output in zip(inputs, outputs):
    print(f"output {output}  correction {output - row}")
print(adapter.delta)
print(f"trainable parameters {adapter.trainable_parameters}")`,
              `output [1.  0.5 0.  0. ]  correction [0.  0.5 0.  0. ]
output [0. 1. 0. 0.]  correction [0. 0. 0. 0.]
output [3.  2.5 0.  0. ]  correction [0.  1.5 0.  0. ]
output [-2. -1.  1.  4.]  correction [ 0. -1.  0.  0.]
[[0.  0.5 0.  0. ]
 [0.  0.  0.  0. ]
 [0.  0.  0.  0. ]
 [0.  0.  0.  0. ]]
trainable parameters 8`,
              { hints: ["LowRankAdapter takes base, down, up and alpha. The base here is np.eye(4).", "respond_to takes a two-dimensional array with one input per row, so all four inputs can go through in one call. It answers one output row for each.", "delta is the assembled update, already scaled by alpha over the rank, and trainable_parameters is the count of entries in the two factors."], check: numberCheck("What is the second coordinate of the correction for the input [3, 1, 0, 0]?", 1.5, 0.0005, "The first factor reads only the first input coordinate, so the one number that crosses the middle is 3. The second factor writes half of it into the second output coordinate, which is 1.5. Every other correction in the list is the same direction, [0, 0.5, 0, 0], multiplied by whatever its input put through the middle, and that is what a rank of one allows.") },
            ),
            exercise(
              "Rebuild the live example and check that the two routes agree",
              ["The live example draws its factors from a fixed seed and keeps the first columns up to the chosen rank. With the rank at one, compute the adapted output for the page’s input with the library, which uses the merged matrix.", "Then compute the same output the two-route way from Part 2, the base route plus alpha over the rank times the adapter route, in plain NumPy. Print both to four places and the largest difference between them."],
              `import numpy as np
from oop_ml.numpy.modern import LowRankAdapter

rank, alpha = 1, 1.0
rng = np.random.default_rng(9)
down = rng.normal(0, 0.3, (4, 3))[:, :rank]
up = rng.normal(0, 0.3, (3, 4))[:rank]
base = np.eye(4)
inputs = np.array([[1.0, 0.0, 0.5, -0.5]])
# Build the adapter and print its output for these inputs to four places.
# Then compute x W + (alpha / rank) (x A) B yourself, print it the same
# way, and print the largest absolute difference between the two.`,
              `import numpy as np
from oop_ml.numpy.modern import LowRankAdapter

rank, alpha = 1, 1.0
rng = np.random.default_rng(9)
down = rng.normal(0, 0.3, (4, 3))[:, :rank]
up = rng.normal(0, 0.3, (3, 4))[:rank]
base = np.eye(4)
inputs = np.array([[1.0, 0.0, 0.5, -0.5]])

merged = LowRankAdapter(base, down, up, alpha).respond_to(inputs)
two_routes = inputs @ base + (alpha / rank) * (inputs @ down) @ up

print("merged    ", " ".join(f"{value:.4f}" for value in merged[0]))
print("two routes", " ".join(f"{value:.4f}" for value in two_routes[0]))
print(f"largest difference {np.abs(merged - two_routes).max():.1e}")`,
              `merged     1.0007 -0.0355 0.4884 -0.5039
two routes 1.0007 -0.0355 0.4884 -0.5039
largest difference 2.2e-16`,
              { hints: ["The library call is one line, LowRankAdapter(base, down, up, alpha).respond_to(inputs), and it answers an array with one row.", "In NumPy the @ operator is the matrix product. The base route is inputs @ base, and the adapter route is (inputs @ down) @ up.", "The scale on the adapter route is alpha divided by the rank, and the two routes are added."], check: numberCheck("What is the second coordinate of the adapted output, to four places?", -0.0355, 5e-05, "The input’s second coordinate is zero and the identity base leaves it zero, so the whole −0.0355 is the adapter’s contribution. The two calculations agree to about the sixteenth decimal place, which is the rounding of two orders of the same arithmetic. That is the page’s claim that the merged matrix and the two routes are one linear operation written two ways.") },
            ),
            exercise(
              "Find where a width of 64 stops saving",
              ["Part 2 counted parameters for a four-by-four projection, where only rank one saves anything. Do the same for a projection 64 wide, at ranks of 1, 4, 8, 16, 32 and 48. The library counts the adapter for you, so the factors can be filled with ones.", "For each rank print the adapter’s count, the full count and the adapter’s share of the full update as a percentage to one place. Find the rank at which the share reaches 100."],
              `import numpy as np
from oop_ml.numpy.modern import LowRankAdapter

width = 64
for rank in [1, 4, 8, 16, 32, 48]:
    down = np.ones((width, rank))
    up = np.ones((rank, width))
    # Build an adapter on an identity base of this width. Print the rank,
    # its trainable parameter count, the size of the base, and the first
    # as a percentage of the second to one place.`,
              `import numpy as np
from oop_ml.numpy.modern import LowRankAdapter

width = 64
for rank in [1, 4, 8, 16, 32, 48]:
    down = np.ones((width, rank))
    up = np.ones((rank, width))
    adapter = LowRankAdapter(np.eye(width), down, up, 1.0)
    share = 100 * adapter.trainable_parameters / adapter.base.size
    print(f"rank {rank:2d}  adapter {adapter.trainable_parameters:4d}  full {adapter.base.size}  share {share:.1f}%")`,
              `rank  1  adapter  128  full 4096  share 3.1%
rank  4  adapter  512  full 4096  share 12.5%
rank  8  adapter 1024  full 4096  share 25.0%
rank 16  adapter 2048  full 4096  share 50.0%
rank 32  adapter 4096  full 4096  share 100.0%
rank 48  adapter 6144  full 4096  share 150.0%`,
              { hints: ["The base of a projection 64 wide is np.eye(width), and its number of entries is adapter.base.size.", "trainable_parameters is an integer, the entries of down plus the entries of up.", "Multiply the ratio by 100 before formatting it with .1f."], check: numberCheck("How many trainable parameters does the rank-8 adapter have at a width of 64?", 1024, 0.5, "Each factor has 64 times 8 entries, which is 512, and there are two of them. That is a quarter of the 4,096 entries of a full update. The share reaches 100 percent at a rank of 32, half the width, which is the break-even rule from Part 2, and at 48 the adapter is half as large again as the update it was meant to replace.") },
            ),
            exercise(
              "Hand the adapter factors that do not join",
              ["Part 2 fixed the shapes before multiplying. The first factor maps the input width into the rank, and the second maps the rank back out. Give the library a first factor of rank two and a second factor of rank one, and see what it does.", "It should not guess which rank was meant. Catch what the library raises and print the name of its class and its message."],
              `import numpy as np
from oop_ml import MLLibError
from oop_ml.numpy.modern import LowRankAdapter

down = np.ones((4, 2))
up = np.ones((1, 4))
# Try to build an adapter on a four-by-four identity base from these two
# factors. Catch the library's own error and print the name of its class
# and its message.`,
              `import numpy as np
from oop_ml import MLLibError
from oop_ml.numpy.modern import LowRankAdapter

down = np.ones((4, 2))
up = np.ones((1, 4))
try:
    LowRankAdapter(base=np.eye(4), down=down, up=up, alpha=1.0)
except MLLibError as refusal:
    print(type(refusal).__name__)
    print(refusal)`,
              `ShapeMismatchError
adapter factors must join the base projection`,
              { hints: ["Every refusal the library makes derives from MLLibError, so catching that one class catches whichever specific refusal this turns out to be.", "The refusal comes from the constructor, before any input has been supplied, so the try block only needs to build the adapter."] },
            ),
          ],
        },
    ]}
  />;
}
