import { lessonIntuitions } from "@/lib/intuition";
import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { choice, several, trueFalse } from "@/lib/quizzes";
import { exercise, numberCheck } from "@/lib/exercises";
import { Equation } from "@/components/concept/Equation";
import { KeepInMind, NumberTable, SubSection, WorkedExample } from "@/components/concept/Treatments";
import { EmbeddingExplorer } from "@/components/widgets/NetworkBuildingBlocks";

export const metadata: Metadata = { title: "Embedding Layers · oop_ml", description: "A token ID needs to lead to the vector associated with that token. An embedding layer provides the lookup table, and training adjusts its rows so the retrieved vectors become useful for the task." };

export default function EmbeddingLayersPage() {
  return <ConceptPage
      lessonId="embedding-layers"
      intuition={lessonIntuitions["embedding-layers"]} title="Embedding Layers" tagline={"A token ID needs to lead to the vector associated with that token. An embedding layer provides the lookup table, and training adjusts its rows so the retrieved vectors become useful for the task."}
    openingTitle="An ID Tells Us Which Word, but What Can We Do with It?"
    technicalStart="Part 2. Training the Table"
    prerequisites={<>Begin with <Link href="/concepts/what-a-token-is">what a token is</Link>. An ID identifies a piece of text; it does not measure its meaning.</>}

    playgroundTitle="Look up the row belonging to each token"

    playgroundIntro="Keep cat in both the first and third positions. Compare the two lookups, then examine how their gradients combine in the cat row. Replace one occurrence with mat to see which rows receive an update."
    playground={<EmbeddingExplorer />}
    sections={[
      { title: "Part 1. A Lookup Before the Network", defaultOpen: true, content: <>
        <SubSection title="1. Separate an identifier from a measurement">
          <p>A tokenizer hands a model whole numbers. In this lesson&rsquo;s small vocabulary cat is 0, dog is 1 and mat is 2. Those numbers say which word is meant and nothing else. Hand them to a neuron as they are and the arithmetic treats them as amounts. Mat would count for twice as much as dog, and cat, at zero, would add nothing to any weighted sum, although the three words could have been numbered in any other order.</p>
          <p>We need numerical values that training can adjust independently of the arbitrary IDs. An embedding layer stores a vector for each ID in a table. Reading it is a lookup: ID zero selects row zero, and ID two selects row two. The selected values then enter the model&apos;s calculations, where a training signal can tell us how to change them.</p>
          <p>For a small example, use three vocabulary entries: cat, dog, and mat. Assign each a two-number vector. The entries begin as chosen values here; another model might initialize them randomly or start from pretrained vectors.</p>
          <Equation>{`ID  Word  Starting vector\n0   cat   [ 0.2,  0.0]\n1   dog   [-0.2,  0.0]\n2   mat   [ 0.0, -0.2]\n\nInput IDs: [0, 1, 0]\nLookups:   [[0.2, 0.0], [-0.2, 0.0], [0.2, 0.0]]`}</Equation>
          <p>No arithmetic happens in the lookup. Row 0 is copied out wherever ID 0 appears, so three IDs become three vectors of two numbers each. The layers that follow work with those vectors and not with the IDs.</p>
          <p>The two cat occurrences initially receive exactly the same vector. This layer has not read their neighbors. Later layers, such as <Link href="/concepts/attention">attention</Link>, can use the context to produce different representations for those occurrences.</p>
        </SubSection>
        <SubSection title="2. Give the table a reason to change">
          <p>A lookup alone cannot discover useful relationships. The network must make a prediction, compare it with a target, and calculate how its error depends on the embedding values. Those derivatives tell us how to update the table.</p>
          <p>To make that update visible without introducing a second network, the playground supplies a target vector for each word. These targets are chosen for the exercise. Their coordinates are not measured properties of cats or dogs.</p>
          <p>The targets are [1, 1] for cat, [−1, 1] for dog and [0, −1] for mat. The loss is half the sum of the squared differences between every looked-up coordinate and its target, taken over the whole sequence as one observation. For the default sequence of cat, dog, cat the starting table is a long way from those targets.</p>
          <Equation>{`cat   [0.2, 0.0] − [1, 1]     = [−0.8, −1.0]\ndog   [−0.2, 0.0] − [−1, 1]   = [0.8, −1.0]\ncat   [0.2, 0.0] − [1, 1]     = [−0.8, −1.0]\n\nLoss = ½ × (0.64 + 1 + 0.64 + 1 + 0.64 + 1)\n     = ½ × 4.92 = 2.46`}</Equation>
          <p>That 2.46 is the loss the playground reports before its step. The table now has a reason to change, since moving a row toward its word&rsquo;s target lowers the loss, and Part 2 follows how far each row moves.</p>
        </SubSection>
      </> },
      { title: "Part 2. Training the Table", content: <>
        <WorkedExample title="Two appearances contribute to one update">
          <p>The target for cat is a vector with both entries equal to one. With half the sum of squared errors, the derivative at each looked-up coordinate is its current value minus its target. Both cat occurrences contribute to the same row.</p>
          <Equation>{`One cat occurrence: [0.2, 0.0] − [1.0, 1.0] = [−0.8, −1.0]\nTwo occurrences:    [−0.8, −1.0] + [−0.8, −1.0] = [−1.6, −2.0]\n\nLearning rate = 0.1\nNew cat row = [0.2, 0.0] − 0.1 × [−1.6, −2.0]\n            = [0.36, 0.2]`}</Equation>
          <p>The mat row receives no gradient in the default sequence because it was never read. The example measures one sequence as one training observation; it sums the coordinate errors within that observation.</p>
          <p>Dog appears once, so its row receives one contribution, and the whole step can be read off the playground&rsquo;s second table.</p>
          <NumberTable headings={["Word", "Row before", "Gradient", "Row after"]} rows={[["cat", "[0.2, 0.0]", "[−1.6, −2.0]", "[0.36, 0.2]"], ["dog", "[−0.2, 0.0]", "[0.8, −1.0]", "[−0.28, 0.1]"], ["mat", "[0.0, −0.2]", "[0, 0]", "[0.0, −0.2]"]]} caption="One step at a learning rate of 0.1 on the sequence cat, dog, cat." />
          <p>Looking the three words up again in the updated table gives a loss of 1.7138, down from 2.46. Replace the third word with mat and the cat row has one occurrence to learn from. Its gradient halves to [−0.8, −1.0] and the row lands on [0.28, 0.1]. The mat row, now read once, moves from [0.0, −0.2] to [0.0, −0.28].</p>
        </WorkedExample>
        <SubSection title="3. Accumulate by ID">
          <p>In the general case, each occurrence can have a different arriving gradient because its context and prediction differ. We still add all contributions for a particular ID. In NumPy, repeated advanced indices require explicit accumulation.</p>
          <Equation>{`table_slopes = np.zeros_like(table)\nnp.add.at(table_slopes, token_ids, arriving_gradients)\nupdated_table = table - learning_rate * table_slopes`}</Equation>
          <p>Ordinary indexed addition can lose contributions at repeated indices. On the default sequence it would leave the cat row&rsquo;s slope at [−0.8, −1.0], one occurrence&rsquo;s worth, and the row would land on [0.28, 0.1] where the correct step lands on [0.36, 0.2]. Nothing would fail and the loss would still fall, only by less. This is why the implementation is checked both with repeated tokens and by numerical differentiation of the table entries.</p>
        </SubSection>
        <SubSection title="4. Stop the derivative at the discrete ID">
          <p>The table entries are continuous numbers, so we can differentiate with respect to them. A token ID is a discrete selection. Moving a little from one ID toward the next is not a meaningful operation for this lookup. The SDK therefore passes zeros back to the ID inputs while returning the gradient of the embedding table.</p>
        </SubSection>
      </> },
      { title: "Questions on Parts 1 and 2", quiz: [
        trueFalse(
          "In the sequence [0, 1, 0] the two cat occurrences come back as different vectors, since they sit in different positions.",
          false,
          "This layer has not read their neighbours, so both occurrences receive exactly the same row. Later layers, attention among them, can use the context to produce different representations for the two.",
        ),
        choice(
          "The targets are [1, 1] for cat and [−1, 1] for dog. With the starting table and the sequence cat, dog, cat, what loss does the playground report before its step?",
          ["2.46", "4.92", "1.64", "1.7138"],
          0,
          "Each cat lookup misses its target by [−0.8, −1.0] and the dog lookup by [0.8, −1.0], so the six squared differences add to 4.92 and half of that is 2.46. One lookup on its own contributes 1.64 to the sum, and 1.7138 is the loss after the step. The targets are chosen for the exercise so that an update can be made visible without a second network, since a lookup alone has nothing to compare itself with.",
              {"description":"Use these values and conventions.","data":"Starting rows: cat = [0.2,0.0]; dog = [-0.2,0.0]\nTarget rows: cat = [1,1]; dog = [-1,1]\nSequence: cat, dog, cat\nLoss rule: half the sum of squared coordinate errors across all occurrences."},
        ),
        choice(
          "With the target for cat a vector of ones, half the sum of squared errors, and a learning rate of 0.1, where does the cat row move from [0.2, 0.0]?",
          ["[0.28, 0.1]", "[0.36, 0.2]", "[0.12, −0.2]", "[1.0, 1.0]"],
          1,
          "The derivative at each looked-up coordinate is its current value minus its target, and both occurrences of cat contribute to the same row, so the contribution of [−0.8, −1.0] is added to itself before the step is taken. [0.28, 0.1] is where one occurrence alone would have left it. The mat row receives nothing in that sequence, because it was never read.",
              {"description":"Use these values and conventions.","data":"Sequence: cat, dog, cat\nStarting cat row: [0.2,0.0]\nTarget at each cat occurrence: [1,1]\nLoss: half the sum of squared errors over occurrences\nLearning rate: 0.1"},
        ),
        choice(
          "Why does the implementation accumulate explicitly rather than index and add?",
          [
            "Because the table is too large to index directly",
            "Because ordinary indexed addition can lose contributions at repeated indices",
            "Because the IDs arrive unsorted",
            "Because the learning rate has to be applied once per occurrence",
          ],
          1,
          "In the general case each occurrence arrives with a different gradient, since its context and its prediction differ, and every contribution for one ID still has to be added. On the default sequence indexed addition would leave the cat row’s slope at [−0.8, −1.0], one occurrence’s worth, and the row would land on [0.28, 0.1] where it should land on [0.36, 0.2]. The implementation is checked both with repeated tokens and by numerical differentiation of the table entries.",
        ),
        trueFalse(
          "The layer passes zeros back to the ID inputs while still returning the gradient of the table.",
          true,
          "The table entries are continuous numbers, so a derivative with respect to them means something. A token ID is a discrete selection, and moving a little from one ID toward the next is not a meaningful operation for a lookup.",
        ),
      ] },
      { title: "Part 3. What the Vectors Can Represent", content: <>
        <p>Vector similarity becomes useful when the training objective makes it useful. For example, predicting neighboring words can encourage related contexts to produce related representations. The <Link href="/concepts/word2vec">word2vec</Link> lesson studies one way to learn such a table. An embedding layer can also learn directly inside a classifier.</p>
        <WorkedExample title="The rows go where the objective sends them">
          <p>The starting rows for cat and dog are [0.2, 0.0] and [−0.2, 0.0], which point in exactly opposite directions. Nothing about cats and dogs put them there. The values were chosen for the exercise. The playground&rsquo;s targets describe a different arrangement, in which cat at [1, 1] and dog at [−1, 1] agree in their second coordinate and differ in their first. Repeat the playground&rsquo;s step on the sequence cat, dog, cat, each time starting from the table the last step left.</p>
          <NumberTable headings={["Steps taken", "cat row", "dog row", "mat row", "Loss"]} rows={[["0", "[0.2, 0.0]", "[−0.2, 0.0]", "[0.0, −0.2]", "2.4600"], ["1", "[0.36, 0.2]", "[−0.28, 0.1]", "[0.0, −0.2]", "1.7138"], ["5", "[0.7379, 0.6723]", "[−0.5276, 0.4095]", "[0.0, −0.2]", "0.4620"], ["20", "[0.9908, 0.9885]", "[−0.9027, 0.8784]", "[0.0, −0.2]", "0.0123"]]} caption="The same step repeated at a learning rate of 0.1. The playground itself takes the first of these steps." />
      <p>In this example the cat row receives two identical contributions because the sequence reads it twice and both occurrences are given the same target. Both contributions update the same stored row, while the dog row receives one contribution. Repeated IDs generally accumulate all their gradient contributions, but those contributions need not be equal or even point the same way in a larger model. The unused mat row receives no update from this lookup. What a rare word learns depends on its training signals, not its count alone.</p>
          <p>The second coordinate came to hold something cat and dog share only because these targets were written that way. Turn every target by the same angle and the rows would settle on different numbers with the same distances between them, so no single coordinate can be said to mean anything by itself.</p>
        </WorkedExample>
        <KeepInMind><p>There is no fixed dictionary meaning for each coordinate. Changing the vocabulary order requires changing the corresponding table rows. Unknown tokens need an explicit vocabulary policy, and sequence position requires additional information. The layer itself only performs lookup and learning of the selected rows.</p></KeepInMind>
        <p>The SDK fixes the number of tokens per sequence when the layer is constructed. Its output has one vector per token, with a leading axis for the batch. For the default sequence that is one sequence of three vectors of two numbers each, an arrangement of 1 by 3 by 2. Padding and the treatment of padding tokens belong to the surrounding data and model design.</p>
      </> },
      { title: "Questions on Part 3", quiz: [
        trueFalse(
          "Each coordinate of an embedding vector carries a fixed dictionary meaning.",
          false,
          "There is no such meaning to read off a coordinate. Vector similarity becomes useful when the training objective makes it useful, as predicting neighbouring words does by encouraging related contexts to produce related representations. Changing the vocabulary order means changing the corresponding table rows.",
        ),
        several(
              "Which jobs belong to a plain trainable embedding lookup?",
              [
                          "Looking up the selected rows",
                          "Learning the selected rows",
                          "Deciding what happens to an unknown token",
                          "Supplying where in the sequence a token sat",
                        ],
              [0, 1],
              "The layer only performs the lookup and the learning of the rows it selected. Unknown tokens need an explicit vocabulary policy, and sequence position requires additional information. Padding and the treatment of padding tokens belong to the surrounding data and model design as well.",
              {
                "description": "The surrounding tokenizer supplies valid integer row IDs. This layer selects rows from a trainable matrix, returns their vectors and accumulates gradients for the selected rows. It has no positional-encoding component or unknown-token policy."
              },
            ),
        choice(
          "With the number of tokens per sequence fixed at construction, what does the layer answer with?",
          [
            "One vector for the whole sequence",
            "One vector per token, with a leading axis for the batch",
            "One number per token",
            "The token IDs, unchanged",
          ],
          1,
          "The lookup is per token, so the answer keeps a vector for each one and carries the batch on the leading axis. For the default sequence that is an arrangement of 1 by 3 by 2. What to do about padding rows, and whether they should count at all, sits with the surrounding data and model design.",
        ),
        choice(
          "After twenty repeated steps on the sequence cat, dog, cat the mat row is still [0.0, −0.2]. Why?",
          [
            "The sequence never read mat, so no gradient reached its row",
            "Its target is the vector it started with",
            "The learning rate of 0.1 was too small to move it",
            "The table is updated in vocabulary order and the steps ran out first",
          ],
          0,
          "A row is changed only by the occurrences that looked it up, and this sequence holds cat twice, dog once and mat never. Mat has a target of [0, −1] like any other word, and with mat in the third position one step moves its row to [0.0, −0.28]. A word the training data never contains keeps the vector it started with.",
        ),
        trueFalse(
          "After twenty repeated steps on cat, dog, cat the cat row is closer to its target than the dog row is to its own.",
          true,
          "Cat is at [0.9908, 0.9885] against a target of [1, 1], and dog at [−0.9027, 0.8784] against [−1, 1]. Both cat occurrences add to the same row, so its gradient is twice one occurrence’s and each step closes a fifth of what remains, where the dog row, read once, closes a tenth. How often a word is read is part of what decides where its row ends up.",
        ),
      ] },
        {
          title: "Practice. Stepping the Table With the Library",
          practice: [
            exercise(
              "Take the playground’s step",
              [
  "Look up the supplied cat/dog/cat sequence from the three-row embedding table. Measure SquaredError against the supplied targets, treating the full sequence as one observation.",
  "Take one step at learning rate 0.1. Print initial loss, each row’s gradient and updated value, then remeasure loss using the updated layer."
],
              `import numpy as np
from oop_ml import Embedding, SquaredError

table = np.array([[0.2, 0.0], [-0.2, 0.0], [0.0, -0.2]])
target_table = np.array([[1.0, 1.0], [-1.0, 1.0], [0.0, -1.0]])
identifiers = np.array([[0, 1, 0]])
targets = target_table[identifiers].reshape(1, -1)

layer = Embedding(3, 2, 3).with_parameters(table)
# Look the identifiers up, and measure the squared error of the lookups,
# flattened to one row, against the targets. Send the measurement's gradient
# back through the layer in the shape of its outputs, take one step at a
# learning rate of 0.1, and measure the loss again with the updated layer.
# Print the loss before, each word's gradient and its row after the step,
# and the loss after.`,
              `import numpy as np
from oop_ml import Embedding, SquaredError

table = np.array([[0.2, 0.0], [-0.2, 0.0], [0.0, -0.2]])
target_table = np.array([[1.0, 1.0], [-1.0, 1.0], [0.0, -1.0]])
identifiers = np.array([[0, 1, 0]])
targets = target_table[identifiers].reshape(1, -1)

layer = Embedding(3, 2, 3).with_parameters(table)
response = layer.respond_to(identifiers)
measurement = SquaredError().measure(response.outputs.reshape(1, -1), targets)
arriving = measurement.gradient.reshape(response.outputs.shape)
correction = layer.correction_for(response, arriving)
updated = layer.stepped_by(correction.gradient, 0.1)
after = SquaredError().measure(updated.respond_to(identifiers).outputs.reshape(1, -1), targets)

print(f"loss before the step {measurement.value:.4f}")
for word, slope, row in zip(["cat", "dog", "mat"], correction.gradient.weights, updated.table):
    print(word)
    print(f"  gradient {np.round(slope, 4).tolist()}")
    print(f"  row after {np.round(row, 4).tolist()}")
print(f"loss after the step {after.value:.4f}")`,
              `loss before the step 2.4600
cat
  gradient [-1.6, -2.0]
  row after [0.36, 0.2]
dog
  gradient [0.8, -1.0]
  row after [-0.28, 0.1]
mat
  gradient [0.0, 0.0]
  row after [0.0, -0.2]
loss after the step 1.7138`,
              { hints: [
  "Flatten the lookup output for the loss convention, then reshape its gradient back to response.outputs.shape for correction_for.",
  "The repeated cat lookups contribute to the same table row; mat is not looked up in this sequence."
], check: numberCheck("What is the loss after the step?", 1.7138, 5e-05, "The updated loss is 1.7138. Repeated cat lookups accumulate into the same table-row gradient, while the unused mat row stays unchanged."), question: "How does a repeated token combine its two embedding updates?" },
            ),
            exercise(
              "Replace the second cat with mat",
              [
  "Start separately from the same supplied embedding table for cat/dog/cat and cat/dog/mat. Take one learning-rate-0.1 step against the same position targets.",
  "For each sequence print every updated row, loss before the step and loss after it. Do not carry the first experiment’s updated layer into the second."
],
              `import numpy as np
from oop_ml import Embedding, SquaredError

vocabulary = ["cat", "dog", "mat"]
table = np.array([[0.2, 0.0], [-0.2, 0.0], [0.0, -0.2]])
target_table = np.array([[1.0, 1.0], [-1.0, 1.0], [0.0, -1.0]])

for words in (["cat", "dog", "cat"], ["cat", "dog", "mat"]):
    identifiers = np.array([[vocabulary.index(word) for word in words]])
    targets = target_table[identifiers].reshape(1, -1)
    # Take one step at a learning rate of 0.1 from the starting table on this
    # sequence, exactly as in the first problem. Print the words, every row
    # of the table after the step, and the loss before and after.`,
              `import numpy as np
from oop_ml import Embedding, SquaredError

vocabulary = ["cat", "dog", "mat"]
table = np.array([[0.2, 0.0], [-0.2, 0.0], [0.0, -0.2]])
target_table = np.array([[1.0, 1.0], [-1.0, 1.0], [0.0, -1.0]])

for words in (["cat", "dog", "cat"], ["cat", "dog", "mat"]):
    identifiers = np.array([[vocabulary.index(word) for word in words]])
    targets = target_table[identifiers].reshape(1, -1)

    layer = Embedding(3, 2, 3).with_parameters(table)
    response = layer.respond_to(identifiers)
    measurement = SquaredError().measure(response.outputs.reshape(1, -1), targets)
    arriving = measurement.gradient.reshape(response.outputs.shape)
    updated = layer.stepped_by(layer.correction_for(response, arriving).gradient, 0.1)
    after = SquaredError().measure(updated.respond_to(identifiers).outputs.reshape(1, -1), targets)

    print(" ".join(words))
    for word, row in zip(vocabulary, updated.table):
        print(f"  {word} row after {np.round(row, 4).tolist()}")
    print(f"  loss before {measurement.value:.4f}")
    print(f"  loss after {after.value:.4f}")`,
              `cat dog cat
  cat row after [0.36, 0.2]
  dog row after [-0.28, 0.1]
  mat row after [0.0, -0.2]
  loss before 2.4600
  loss after 1.7138
cat dog mat
  cat row after [0.28, 0.1]
  dog row after [-0.28, 0.1]
  mat row after [0.0, -0.28]
  loss before 1.9600
  loss after 1.5876`,
              { hints: [
  "Rebuild with with_parameters(table) inside the comparison loop.",
  "Keep positional targets fixed while changing only the third lookup ID."
], check: numberCheck("On cat, dog, mat, what is the loss after the step?", 1.5876, 5e-05, "The cat/dog/mat loss after its step is 1.5876. Replacing a lookup changes both which row receives a derivative and the initial loss being compared."), question: "Which table rows change when the last cat becomes mat?" },
            ),
            exercise(
              "Take ten steps instead of one",
              [
  "Train the supplied cat/dog/cat lookup for ten consecutive steps, carrying each updated layer into the next step.",
  "Print loss immediately before each update. Then make a fresh lookup to print loss after all ten updates and the final cat, dog and mat rows."
],
              `import numpy as np
from oop_ml import Embedding, SquaredError

table = np.array([[0.2, 0.0], [-0.2, 0.0], [0.0, -0.2]])
target_table = np.array([[1.0, 1.0], [-1.0, 1.0], [0.0, -1.0]])
identifiers = np.array([[0, 1, 0]])
targets = target_table[identifiers].reshape(1, -1)

layer = Embedding(3, 2, 3).with_parameters(table)
for step in range(1, 11):
    # Take one step at a learning rate of 0.1, keeping the stepped layer as
    # the layer for the next pass, and print the loss measured before it.
    pass

# Measure the loss once more with the final layer, and print it with the
# three rows of the final table.`,
              `import numpy as np
from oop_ml import Embedding, SquaredError

table = np.array([[0.2, 0.0], [-0.2, 0.0], [0.0, -0.2]])
target_table = np.array([[1.0, 1.0], [-1.0, 1.0], [0.0, -1.0]])
identifiers = np.array([[0, 1, 0]])
targets = target_table[identifiers].reshape(1, -1)

layer = Embedding(3, 2, 3).with_parameters(table)
for step in range(1, 11):
    response = layer.respond_to(identifiers)
    measurement = SquaredError().measure(response.outputs.reshape(1, -1), targets)
    arriving = measurement.gradient.reshape(response.outputs.shape)
    layer = layer.stepped_by(layer.correction_for(response, arriving).gradient, 0.1)
    print(f"step {step:2d}, loss before it {measurement.value:.4f}")

final = SquaredError().measure(layer.respond_to(identifiers).outputs.reshape(1, -1), targets)
print(f"loss after ten steps {final.value:.4f}")
for word, row in zip(["cat", "dog", "mat"], layer.table):
    print(f"{word} row {np.round(row, 4).tolist()}")`,
              `step  1, loss before it 2.4600
step  2, loss before it 1.7138
step  3, loss before it 1.2097
step  4, loss before it 0.8657
step  5, loss before it 0.6281
step  6, loss before it 0.4620
step  7, loss before it 0.3443
step  8, loss before it 0.2597
step  9, loss before it 0.1981
step 10, loss before it 0.1526
loss after ten steps 0.1186
cat row [0.9141, 0.8926]
dog row [-0.7211, 0.6513]
mat row [0.0, -0.2]`,
              { hints: [
  "stepped_by returns a new layer; assign it back to the variable used next.",
  "The last in-loop loss precedes the tenth update. Evaluate once more afterward for the requested final loss."
], check: numberCheck("What is the loss after ten steps?", 0.1186, 5e-05, "The final loss is 0.1186. It is measured after the tenth update, whereas the last line inside the loop reports the loss before that update."), question: "What happens when embedding updates continue from the previous step?" },
            ),
          ],
        },
    ]} />;
}
