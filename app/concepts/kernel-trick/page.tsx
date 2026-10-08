import { LessonMotivation } from "@/components/concept/LessonProgression";
import { lessonProgressions } from "@/lib/lesson-progressions";
import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { choice, several, trueFalse } from "@/lib/quizzes";
import { exercise, numberCheck } from "@/lib/exercises";
import { Equation } from "@/components/concept/Equation";
import { DerivationTable, KeepInMind, NumberTable, SubSection, WhyThisWorks, WorkedExample } from "@/components/concept/Treatments";
import { AbsorbedInterceptTable } from "@/components/widgets/AbsorbedInterceptTable";
import { ClinicGramMatrix } from "@/components/widgets/ClinicGramMatrix";
import { GammaSweepChart } from "@/components/widgets/GammaSweepChart";
import { KernelIdentityCheck } from "@/components/widgets/KernelIdentityCheck";
import { KernelLiftPlayground } from "@/components/widgets/KernelLiftPlayground";
import { KernelPlayground } from "@/components/widgets/KernelPlayground";
import { KernelSimilarityChart } from "@/components/widgets/KernelSimilarityChart";
import { KernelTransformationStory } from "@/components/widgets/KernelTransformationStory";
import { MarginView } from "@/components/widgets/MarginView";
import { SupportVectorRefit } from "@/components/widgets/SupportVectorRefit";

export const metadata: Metadata = {
  title: "The Kernel Trick · oop_ml",
  description: "A pattern may be difficult to separate with a straight boundary until we change how it is represented. A kernel lets us compare examples in a transformed space without explicitly building every new feature.",
};
const link = "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

// Preserve earlier top-level section URLs after reorganizing the lesson.
function PreviousSection({ id }: { id: string }) {
  return <span id={id} tabIndex={-1} className="block scroll-mt-6" />;
}

export default function KernelTrickPage() {
  return (
    <ConceptPage
      lessonId="kernel-trick"
      title="The Kernel Trick"
      tagline={"A pattern may be difficult to separate with a straight boundary until we change how it is represented. A kernel lets us compare examples in a transformed space without explicitly building every new feature."}
      openingTitle="What If the Middle Belongs to One Class?"
      technicalStart="Part 3. Calculate the Same Comparison Two Ways"
      history={<LessonMotivation lesson={lessonProgressions["kernel-trick"]} />}
      prerequisites={<>The first walkthrough uses pictures and ordinary language. When you reach the calculations, the <Link href="/primers/linear-algebra" className={link}>linear algebra primer</Link> and <Link href="/concepts/polynomial-features" className={link}>polynomial features lesson</Link> provide extra background.</>}
      playgroundIntro="Start with the points in their original positions and use Next step. Watch what stretching, compressing, and rotating can change. Then add a height and try placing a flat divider between the groups. We will explain the picture before introducing the kernel calculation."
      playground={<KernelTransformationStory />}
      sections={[
        {
          title: "Part 1. See Why a Different Shape Helps",
          defaultOpen: true,
          content: <>
            <SubSection title="Start with the divider we want to use">
              <p>Imagine trying to separate two colours of beads on a tabletop with one straight ruler. If the colours occupy opposite ends of the table, we can place the ruler between them. But if one colour surrounds the other, turning or sliding the ruler will leave some beads on the wrong side.</p>
              <p>This is the difficulty in our picture. A simple classifier uses a straight boundary to decide which group a point belongs to. It needs one group on one side and the other group on the other side. The original arrangement does not allow that.</p>
              <p>So, we need to give the classifier a more useful arrangement to work with. In a model, moving a point means changing the numbers used to represent it. Its label stays the same.</p>
            </SubSection>
            <SubSection title="What stretching, compressing, and rotating can do">
              <p>A transformation is a rule for calculating new coordinates from the existing ones. Stretching increases distances along a direction. Compressing decreases them. Rotating turns all the positions by the same angle. These are useful first examples because we can see exactly what changes.</p>
              <p>They can change the relative scales or orientation of a pattern. But in our picture, a wider ring, a flatter ring, and a rotated ring all still surround the middle group. None creates the separation we need.</p>
              <p>There is a reason for this limit. If a straight divider worked after an ordinary stretch, compression, or rotation, undoing that transformation would turn it back into another straight divider. We could already have used that divider in the original picture.</p>
            </SubSection>
            <SubSection title="Add a direction in which the groups can separate">
              <p>Now imagine keeping every bead over its original spot on the table, but giving it a height. A bead near the centre stays low. A bead far from the centre rises higher. The new height represents distance from the centre, with larger distances exaggerated by squaring them.</p>
              <p>This changes the arrangement in a useful way. The two colours were mixed when viewed only across the tabletop. Once height is available, the blue group sits below the amber group. There is now a vertical gap between them.</p>
              <p>We applied the same rule to every point. We did not tell the rule to raise amber points and lower blue ones. It only used position. This matters because we will need to apply it to new observations whose labels we do not know.</p>
            </SubSection>
            <SubSection title="Place a flat sheet in the gap">
              <p>With three coordinates, the equivalent of our straight divider is a <strong>plane</strong>: a flat surface, like a sheet of glass extending in both directions. We can place that sheet above the blue points and below the amber points.</p>
              <p>Use Place a plane in the walkthrough. Move the sheet too low, and some blue points end up above it. Move it too high, and amber points end up below it. Between the groups, there is a range of positions that separate this example successfully.</p>
              <p>This is what a useful transformation gives us: a representation in which a simple boundary can do the job. We are choosing the sheet&apos;s position by hand here. During training, a classifier uses the supplied labels to choose its boundary. Its learning objective determines which separating boundary it prefers, or how to handle mistakes when perfect separation is impossible.</p>
            </SubSection>
            <SubSection title="Read that decision in the original picture">
              <p>Select Original view. A point near the centre would rise only a little, so it would remain below the sheet. A point far from the centre would rise above it. The points that would reach the sheet exactly form a circle in the original view.</p>
              <p>The circle and the plane describe the same decision using different coordinates. The boundary is flat in the representation with height, even though it is circular in the original two-coordinate picture.</p>
              <p>In another dataset, another transformation might help: it could change distances differently in different regions or introduce several additional coordinates. There is no promise that every transformation will produce a useful separation. The purpose is to make the relationships we care about easier for the model to use.</p>
            </SubSection>
            <SubSection title="Only now, where does the kernel enter?">
              <p>We have explained why transformed coordinates can help. But creating and storing those coordinates can become expensive when there are many of them.</p>
              <p>Some learning algorithms only need particular comparisons between points in that transformed representation. A <strong>kernel</strong> supplies those comparisons directly from the original inputs, as though the transformation had been carried out. This is the computational shortcut we call the <strong>kernel trick</strong>.</p>
              <p>Keep the two jobs separate as we continue: the representation makes a useful plane possible; the learning algorithm chooses the plane. The kernel gives a compatible algorithm a way to work with that representation without explicitly building every coordinate.</p>
              <p>Next we will put numbers to the height picture. After that, we will work through one comparison both with and without explicitly transformed coordinates.</p>
            </SubSection>
          </>,
        },
        {
          title: "Part 2. Put Numbers to the Picture",
          content: <>
            <PreviousSection id="part-1-give-the-model-a-useful-measurement" />
            <PreviousSection id="part-1-a-boundary-no-straight-line-can-draw" />
            <SubSection title="1. Why the original inputs can be awkward">
              <p>The original picture gave each point two coordinates. Each coordinate is a <strong>feature</strong>, a number supplied to the model about an observation. The point&apos;s colour represents its <strong>label</strong>, the answer supplied during training.</p>
              <p>In an application, two features could be temperature and heart rate, and the supplied labels could be healthy or unwell. The later clinic playground uses that made-up example. For the calculation here, we will keep simple coordinates so that we can follow the height of each point.</p>
              <p>Our original coordinates describe position along two directions. The pattern we want to express is distance from the middle, regardless of direction. That is the extra feature we are going to calculate.</p>
            </SubSection>
            <SubSection title="2. Ask for distance from the middle">
              <p>We can change what the model receives. Being far below the usual temperature and being far above it have opposite signs, but both are departures from the middle. Squaring a departure gives us a number that grows in either direction.</p>
              <p>Let the two coordinates measure departures from the centre on comparable scales. We will call those coordinates x₁ and x₂. The square of their distance from the centre is called r². This is the height used in the opening picture.</p>
              <Equation>{"r² = x₁² + x₂²"}</Equation>
              <NumberTable headings={["Observation", "Original coordinates", "Calculate the new feature"]} rows={[
                ["Near the middle", "(0.5, 0.5)", "r² = 0.5² + 0.5² = 0.5"],
                ["Far to one side", "(2, 0)", "r² = 2² + 0² = 4"],
                ["Far to the other side", "(−2, 0)", "r² = (−2)² + 0² = 4"],
              ]} caption="Illustrative coordinates chosen to make the arithmetic visible, rather than raw clinic measurements." />
              <p>A <strong>threshold</strong> is the dividing value we compare against. In the picture, it is the height of the sheet. A threshold on the new feature can put the middle observation in one class and both distant observations in the other. We will place the sheet at a height of one.</p>
              <Equation>{"Score = 1 − r²\n\nNear the middle:       1 − 0.5 = 0.5\nEither distant point:  1 − 4   = −3\n\nPredict the middle class when the score is nonnegative."}</Equation>
              <p>The score measures whether the point&apos;s height falls below or above our chosen sheet. A positive score puts it below; a negative score puts it above. This is a linear rule in the new feature: multiply it by a weight, then add a bias. We have now written down the flat divider from the picture.</p>
              <KeepInMind>Creating this feature is not yet the kernel trick. We have explicitly calculated a new input and can train an ordinary model on it.</KeepInMind>
            </SubSection>
            <SubSection title="3. Give the model several derived features">
              <p>Our horizontal sheet gave us a circle around a chosen centre. We may need more choices, such as an oval that is wider in one direction, or one whose long direction lies diagonally across the plot.</p>
              <p>To allow that, we will now use a different transformation. Supply the two squared coordinates separately, together with a feature that multiplies the coordinates. The separate squares let the model treat the two directions differently. The product lets the rule also depend on how the coordinates vary together.</p>
              <p>A <strong>feature map</strong> is the rule that builds this new list of numbers. We write the rule as φ, pronounced phi. Here is the particular map we will use throughout the worked kernel calculation.</p>
              <Equation>{"φ(x₁, x₂) = (x₁², √2 × x₁ × x₂, x₂²)"}</Equation>
              <p>The first and third entries measure squared departures along each coordinate. The middle entry describes the two coordinates together. It can be positive or negative. Its factor of √2 sets the scale of that feature; the next part shows why this factor is needed for our kernel identity.</p>
              <Equation>{"Original observation: x = (1, 2)\n\nFirst feature:  1² = 1\nSecond feature: √2 × 1 × 2 = 2√2\nThird feature:  2² = 4\n\nExpanded observation: φ(x) = (1, 2√2, 4)"}</Equation>
              <p>We now have three inputs where we originally had two. We call the coordinates a model works with its <strong>feature space</strong>. Just as in the height picture, a plane in these transformed coordinates can describe a curved boundary in the original ones. This particular map is useful for our next example because its comparisons have a short, exact kernel formula.</p>
            </SubSection>
          </>,
        },
        {
          title: "Part 3. Calculate the Same Comparison Two Ways",
          content: <>
            <PreviousSection id="part-2-calculate-the-same-comparison-two-ways" />
            <PreviousSection id="part-4-the-kernel" />
            <SubSection title="4. What a dot product actually calculates">
              <p>A dot product combines two equal-length lists into one number. Multiply entries in matching positions, then add the products. For the vectors below, there are two matching pairs.</p>
              <Equation>{"a = (1, 2)\nb = (3, 4)\n\na · b = (1 × 3) + (2 × 4)\n      = 3 + 8\n      = 11"}</Equation>
              <p>Why do we care about this operation? Some learning algorithms can express both their training calculations and their predictions using dot products between observations. If we give those algorithms expanded features, they ask for dot products between the expanded vectors.</p>
              <p>That creates an opportunity. Perhaps we can calculate the number they need without first constructing both expanded vectors.</p>
            </SubSection>
            <WorkedExample title="Route one: build the features, then take their dot product">
              <p>Use the same feature map on both vectors. Corresponding positions must represent the same feature, so the first square is compared with the first square, the product feature with the product feature, and the second square with the second square.</p>
              <Equation>{"φ(a) = (1², √2 × 1 × 2, 2²) = (1, 2√2, 4)\nφ(b) = (3², √2 × 3 × 4, 4²) = (9, 12√2, 16)\n\nφ(a) · φ(b) = (1 × 9) + (2√2 × 12√2) + (4 × 16)\n            = 9 + 48 + 64\n            = 121"}</Equation>
              <p>The algorithm needs the final comparison value. In this route, we built two three-entry vectors to obtain it.</p>
            </WorkedExample>
            <WorkedExample title="Route two: take the original dot product, then square it">
              <p>There is a shorter calculation for this particular feature map. Take the dot product of the original two-entry vectors and square the answer.</p>
              <Equation>{"k(a, b) = (a · b)²\n        = ((1 × 3) + (2 × 4))²\n        = 11²\n        = 121"}</Equation>
              <p>We obtained the same comparison value without constructing either expanded vector. A function that returns this feature-space inner product directly is a <strong>kernel</strong>. It takes two original observations and returns one number.</p>
              <Equation>{"k(a, b) = φ(a) · φ(b)"}</Equation>
              <p>The <strong>kernel trick</strong> is using that function wherever a compatible algorithm needs the expanded dot product. The kernel does not return the expanded features, a class label, or a probability. It supplies one calculation that the learning algorithm uses.</p>
            </WorkedExample>
            <SubSection title="5. Check another pair, then explain the equality">
              <p>Change either vector below. Follow both calculation routes and compare their final values. The feature map stays fixed; only the input observations change.</p>
              <KernelIdentityCheck />
              <p>The agreement is an algebraic identity, not a coincidence in our chosen example. Expanding the square shows why the mixed feature needs its factor of √2.</p>
              <WhyThisWorks>
                <Equation>{"(a · b)² = (a₁b₁ + a₂b₂)²\n         = a₁²b₁² + 2a₁a₂b₁b₂ + a₂²b₂²\n\nφ(a) · φ(b) = a₁²b₁² + (√2a₁a₂)(√2b₁b₂) + a₂²b₂²\n            = a₁²b₁² + 2a₁a₂b₁b₂ + a₂²b₂²"}</Equation>
                <p>Each expanded vector contributes one factor of √2 to the middle product. Together they supply the factor of two in the squared expression. Without that scaling, the two routes would calculate different comparisons.</p>
              </WhyThisWorks>
              <KeepInMind>The two routes are equal in exact arithmetic. Their computed answers can differ slightly because floating-point arithmetic rounds intermediate results.</KeepInMind>
            </SubSection>
          </>,
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            trueFalse(
              "A stretch, a compression or a rotation could make a straight divider work on the ring, given the right amounts.",
              false,
              "If a straight divider worked after one of those, undoing the transformation would turn it back into another straight divider, which we could already have used in the original picture. A wider ring, a flatter ring and a rotated ring all still surround the middle group. What helps is adding a direction the groups can separate along.",
            ),
            trueFalse(
              "The height rule in the opening picture reads only a bead's position, never its colour, which is what lets it be applied to new observations whose labels are unknown.",
              true,
              "The same rule was applied to every point. A bead near the centre stays low and a bead far from the centre rises higher, and nothing in that consults a label, so the rule did not raise the amber points and lower the blue ones. It is the arrangement that separated, and a rule that needed the labels could not be run on a new observation at all.",
            ),
            choice(
              "Why does the middle entry of the feature map carry a factor of the square root of two?",
              [
                "Expanding the square of the original dot product leaves a factor of two on the mixed term, and each expanded vector contributes one square root of two to supply it",
                "It puts the three expanded features on the same scale as one another",
                "It keeps the kernel value from coming out negative",
                "It is a convention and changes nothing in the comparison",
              ],
              0,
              "Without that scaling the two routes would calculate different comparisons. The agreement is an algebraic identity rather than a coincidence of the chosen example, which is what the expansion of the square shows.",
            ),
            choice(
              "On a = (1, 2) and b = (3, 4), what do the two routes give?",
              [
                "121 both ways, one by building two three-entry vectors and one by squaring the original dot product of 11",
                "121 the long way and 11 the short way",
                "Different answers, because the short route leaves out the mixed term",
                "11 both ways",
              ],
              0,
              "The short route obtains the comparison without constructing either expanded vector, which is the whole saving. The two are equal in exact arithmetic, and their computed answers can differ slightly because floating-point arithmetic rounds intermediate results.",
            ),
            several(
              "Which of these does a kernel return?",
              [
                "One number for a pair of original observations",
                "The expanded features of each observation",
                "A class label, or a probability of one",
                "The value a compatible algorithm would have obtained from the expanded dot product",
              ],
              [0, 3],
              "A kernel supplies one calculation that the learning algorithm uses, and nothing else. Replacing the dot products does not remove the need to train the model, which still has to choose its coefficients from the objective and the labels.",
            ),
        ],
        },
        {
          title: "Part 4. How a Model Uses Kernel Values",
          content: <>
            <PreviousSection id="part-3-how-a-model-uses-kernel-values" />
            <PreviousSection id="part-3-what-the-classifier-reads" />
            <SubSection title="6. Separate the comparison from the learned decision">
              <p>A kernel value alone does not decide which class an observation belongs to. A model must learn how to combine comparisons with training observations. In one common form, it stores a coefficient for each training observation and an offset for the final score.</p>
              <ol className="list-decimal space-y-2 pl-6">
                <li><strong>Reference observations:</strong> the training inputs used in the comparisons.</li>
                <li><strong>Kernel values:</strong> the comparisons between a new input and those reference inputs.</li>
                <li><strong>Learned coefficients:</strong> the size and sign of each comparison&apos;s contribution.</li>
                <li><strong>Offset:</strong> a constant added to the combined contributions.</li>
              </ol>
              <Equation>{"score(x) = c₁k(r₁, x) + c₂k(r₂, x) + … + cₙk(rₙ, x) + b"}</Equation>
              <p>Here rᵢ names the i-th reference observation, cᵢ is its coefficient, and b is the offset. The training algorithm chooses the coefficients using its objective and the labels. Replacing the dot products does not remove the need to train the model.</p>
            </SubSection>
            <WorkedExample title="Recover the circular rule using two reference points">
              <p>Choose reference points a and b on the two coordinate axes. With our squared kernel, comparing a new point with these references returns its two squared coordinates.</p>
              <Equation>{"a = (1, 0)\nb = (0, 1)\nx = (x₁, x₂)\n\nk(a, x) = ((1 × x₁) + (0 × x₂))² = x₁²\nk(b, x) = ((0 × x₁) + (1 × x₂))² = x₂²"}</Equation>
              <p>For this illustration, choose both coefficients to be negative one and the offset to be one. These are assigned coefficients to expose the calculation, rather than the output of a fitted classifier.</p>
              <Equation>{"score(x) = 1 − k(a, x) − k(b, x)\n         = 1 − x₁² − x₂²\n\nAt x = (0.5, 0.5): score = 1 − 0.25 − 0.25 = 0.5\nAt x = (2, 0):     score = 1 − 4 − 0       = −3"}</Equation>
              <p>This is the circular rule from the first part, now calculated through kernel comparisons. It connects the shortcut to something the model actually does: produce a prediction score.</p>
            </WorkedExample>
            <SubSection title="7. Training needs a table of comparisons">
              <p>During fitting, a kernel algorithm commonly compares each training input with every training input. We arrange the answers in a square table called the <strong>kernel matrix</strong>, or <strong>Gram matrix</strong>. A row identifies the first input, a column identifies the second, and their cell stores the kernel value.</p>
              <Equation>{"Kᵢⱼ = k(rᵢ, rⱼ)\n\nFor n training observations, K has n rows and n columns."}</Equation>
              <p>Labels remain separate from this table. Two observations can receive a large kernel comparison even if their labels disagree. The learning objective determines what to do with that disagreement.</p>
              <p>For a new input, compute a new set of comparisons against the stored training inputs, using the same preprocessing and kernel. Then apply the learned coefficients. An algorithm that requires explicit coordinates for other operations cannot automatically use this substitution.</p>
              <p>We can now try a fitted classifier. Choose The clinic below, then compare Linear with Squared. Each dot&apos;s colour is its supplied label; the background colour is the model&apos;s prediction. Look for whether the predicted healthy region surrounds the middle group.</p>
              <KernelPlayground />
              <p>Linear shows one fitted straight boundary. Its accuracy measures this fit, rather than establishing the best accuracy of every possible straight boundary. An Ideal Case loads a different arrangement where a straight boundary can separate the groups.</p>
            </SubSection>
            <SubSection title="8. See the two training routes agree on the clinic">
              <PreviousSection id="part-2-lifting-the-clinic-by-hand" />
              <p>The display below applies our three-feature map to the clinic after standardizing its measurements. Its three axes are the three expanded features. The green plane is a linear decision boundary fitted using those features.</p>
              <p>The API also fits the same classifier using the squared dot-product kernel on the standardized original inputs. The reported gaps compare the two fits. Small rounding differences are expected because the calculations take different routes.</p>
              <KernelLiftPlayground />
              <p>Rotate the plot to inspect how the plane separates the observations. A flat boundary in these expanded coordinates corresponds to a quadratic boundary in the original plot. The model did not need to store the three-feature representation on the kernel route.</p>
              <KeepInMind><p>This comparison uses the pure squared kernel. The playground&apos;s Squared button includes an additional constant inside the square, giving a different feature map that also includes linear terms. Both are polynomial kernels, but they should not be described as the same fit.</p><Equation>{"Explicit-map comparison: k(a, b) = (a · b)²\nPlayground Squared:      k(a, b) = (a · b + 1)²"}</Equation></KeepInMind>
            </SubSection>
          </>,
        },
        {
          title: "Part 5. What the Shortcut Saves",
          content: <>
            <PreviousSection id="part-4-what-the-shortcut-saves" />
            <PreviousSection id="part-7-the-same-swap-everywhere" />
            <SubSection title="9. A few extra columns are easy; millions are different">
              <p>For two inputs and a few derived features, explicitly building the features may be the simplest choice. The shortcut becomes more useful as the expansion grows. With many original inputs, a polynomial map can contain a very large number of powers and products.</p>
              <NumberTable headings={["Original features", "Maximum degree", "Expanded features, including lower degrees"]} rows={[["2", "2", "6"], ["10", "3", "286"], ["20", "5", "53,130"], ["20", "10", "30,045,015"]]} caption="Counts include the constant feature. They describe the full expansion used by a polynomial kernel with a positive constant." />
              <p>A polynomial kernel can obtain the corresponding comparison from the original dot product, an added constant, and a power. It avoids constructing those millions of entries for each observation.</p>
              <Equation>{"Polynomial kernel: k(a, b) = (a · b + c)ᵈ\nUse a nonnegative constant c and a positive integer degree d."}</Equation>
              <p>That does not make every kernel model cheap. Storing a full Gram matrix grows with the square of the number of training observations. Predicting also requires comparisons with the reference observations the fitted model retains.</p>
              <Equation>{"10,000 training observations\nFull Gram matrix: 10,000 × 10,000 = 100,000,000 entries\nAt 8 bytes per entry: 800,000,000 bytes, about 800 MB\nThis excludes the solver's other arrays."}</Equation>
            </SubSection>
            <SubSection title="10. The kernel is not tied to one classifier">
              <p>A support vector classifier is one algorithm that can use this arrangement. <Link href="/concepts/kernel-ridge" className={link}>Kernel ridge regression</Link> learns coefficients for a regression prediction. <Link href="/concepts/kernel-pca" className={link}>Kernel PCA</Link> uses the comparison matrix to describe variation in the feature space.</p>
              <p>Each method still has its own training objective and limitations. Choosing a kernel does not turn those methods into the same algorithm. The shared operation is replacing feature-space inner products with kernel evaluations.</p>
              <KeepInMind>A kernel is useful when its comparisons make sense for the task and the algorithm can operate through them. A more elaborate feature space does not guarantee better predictions.</KeepInMind>
            </SubSection>
          </>,
        },
        {
          title: "Part 6. A Kernel Based on Distance",
          content: <>
            <PreviousSection id="part-5-a-kernel-based-on-distance" />
            <PreviousSection id="part-5-the-radial-kernel" />
            <SubSection title="11. Make nearby observations contribute more strongly">
              <p>The squared kernel is one comparison rule. Another useful choice asks how far apart two inputs are. The Gaussian radial basis kernel gives identical inputs a value of one, then decreases smoothly as their squared distance grows.</p>
              <p>It needs the two inputs, a distance calculation, and a positive setting called gamma. Gamma controls how quickly the kernel value decreases with distance.</p>
              <Equation>{"Squared distance = Σⱼ (aⱼ − bⱼ)²\nRadial kernel: k(a, b) = exp(−γ × squared distance)"}</Equation>
              <WorkedExample title="Compare two inputs that are two units apart">
                <p>First square the distance, then multiply by negative gamma, then take the exponential. Here are two gamma settings for the same pair.</p>
                <Equation>{"Squared distance = 2² = 4\n\nAt γ = 0.5: k(a, b) = exp(−0.5 × 4) = exp(−2) ≈ 0.1353\nAt γ = 2:   k(a, b) = exp(−2 × 4)   = exp(−8) ≈ 0.0003"}</Equation>
                <p>The larger gamma gives this pair a much smaller comparison value. In a prediction, that value is still multiplied by a learned coefficient. It is not a probability that the inputs have the same label.</p>
              </WorkedExample>
              <KernelSimilarityChart />
              <p>The graph holds one input fixed and moves the other along a line. Compare how the radial curves decrease away from the reference with how the polynomial and linear comparisons behave. Kernel values need not all lie between zero and one; an ordinary dot product can also be negative.</p>
            </SubSection>
            <SubSection title="12. Choose gamma using predictions on new observations">
              <p>Small gamma makes comparisons change slowly with distance. Large gamma makes them much more local. In this clinic, overly broad comparisons miss the pattern, while overly local comparisons fit the training observations but predict the second clinic poorly.</p>
              <p>The dashed curve below is training accuracy. The green curve measures predictions on another 21 observations excluded from fitting. Compare the curves as gamma increases. The smaller plots show what the corresponding boundaries look like.</p>
              <GammaSweepChart />
              <p>Once we use the second clinic to choose gamma, it is validation data. Its best score is no longer an untouched test of the whole selection procedure. A final evaluation needs another independent test set or an appropriate nested evaluation.</p>
              <p>Feature scales matter here: a difference of one degree and a difference of one heartbeat are not interchangeable. The API fits a standardizer on the training clinic and uses those stored means and scales for subsequent inputs.</p>
              <KeepInMind>Many support vectors alone do not prove memorization. Look at prediction performance on excluded observations, the fitted boundary, and whether the solver actually converged.</KeepInMind>
            </SubSection>
            <SubSection title="13. What features does the radial kernel imply?">
              <p>The Gaussian kernel is also an inner product in a feature space. For inputs over a continuous Euclidean domain, its exact representation generally needs infinitely many coordinates. We can still calculate the kernel value with a finite distance calculation.</p>
              <WhyThisWorks>
                <p>Separate the squared distance into terms involving each input and their dot product. Then expand the exponential containing that dot product.</p>
                <Equation>{"exp(−γ‖a − b‖²) = exp(−γ‖a‖²) exp(−γ‖b‖²) exp(2γ a · b)\n\nexp(2γ a · b) = Σₘ₌₀∞ [(2γ)ᵐ / m!] (a · b)ᵐ"}</Equation>
                <p>Every nonnegative integer power contributes a polynomial-feature inner product. Their nonnegative weights allow them to be combined into one larger inner product. The sequence of powers has no final term.</p>
              </WhyThisWorks>
              <p>Finite feature approximations are possible, but they introduce approximation error. Direct kernel evaluation avoids truncating that feature expansion. It still leaves the costs of the comparison matrix and the learning algorithm.</p>
            </SubSection>
          </>,
        },
        {
          title: "Questions on Parts 4 to 6",
          quiz: [
            trueFalse(
              "Two observations that receive a large kernel comparison have labels that agree.",
              false,
              "Labels remain separate from the comparison table. Two observations can be compared highly and still carry different labels, and what to do about that disagreement is the learning objective's business rather than the kernel's.",
            ),
            choice(
              "With the squared kernel, references at (1, 0) and (0, 1), both coefficients at negative one and the offset at one, what is the score?",
              [
                "1 minus the two squared coordinates, which is the circular rule from the first part",
                "The squared distance from the middle itself",
                "A straight boundary in the original coordinates",
                "Nothing yet, since coefficients have to be learned before a score exists",
              ],
              0,
              "Comparing a new point with each reference returns one of its squared coordinates, so the combination reproduces the circular rule through kernel comparisons alone. Those coefficients were assigned to expose the calculation rather than being the output of a fitted classifier.",
            ),
            trueFalse(
              "The explicit three-feature map matches the pure squared kernel, while the playground's Squared button fits a different feature map because of the constant inside its square.",
              true,
              "The explicit map matches the pure squared kernel, and the playground's button puts an extra constant inside the square, which gives a different feature map that also carries linear terms. Both are polynomial kernels and they should not be described as the same fit.",
            ),
            choice(
              "Which cost does the shortcut not remove?",
              [
                "Storing a full Gram matrix, which grows with the square of the training observations and reaches about 800 MB at ten thousand of them",
                "Building the millions of powers and products a large polynomial map would hold",
                "Obtaining the comparison from the original dot product, an added constant and a power",
                "Evaluating the radial kernel without truncating an endless feature expansion",
              ],
              0,
              "That figure is a hundred million entries at eight bytes each, before the solver's other arrays. Predicting carries its own cost too, since it needs comparisons against the reference observations the fitted model retains, so a kernel model is not thereby a cheap one.",
            ),
            trueFalse(
              "Once gamma has been chosen by the score on the second clinic, that score is still an untouched test of the whole procedure.",
              false,
              "Choosing on it makes it validation data, and a final evaluation needs another independent test set or an appropriate nested evaluation. What the sweep does show is the shape of the tradeoff, since overly broad comparisons miss the pattern while overly local ones fit the training observations and predict the second clinic poorly.",
            ),
        ],
        },
        {
          title: "Part 7. Why the Support Vector Classifier Can Use This",
          content: <>
            <PreviousSection id="part-6-why-the-support-vector-classifier-can-use-this" />
            <PreviousSection id="part-6-the-support-vector-classifier" />
            <p>The kernel trick is already complete: obtain feature-space dot products without building the features. This part derives why the particular classifier in the playground can use it.</p>
            <SubSection title="14. Introduce the margin and its penalty">
              <p>A support vector classifier balances two goals: keep a margin around the decision boundary and penalize observations that violate it. The margin describes the gap between two score levels, one on each side of the boundary.</p>
              <p>On a separable example, maximizing this gap gives a particular separating boundary. It can encourage useful generalization, but does not guarantee it. The widget uses the fever-only clinic, where a straight separator is possible.</p>
              <MarginView initialCapacity={10} />
              <p>For the standard formulation, let xᵢ be a training observation, yᵢ its class label encoded as negative or positive one, w the feature weights, b a separate unpenalized offset, and ξᵢ a nonnegative margin violation. C controls the cost of violations relative to the weight penalty.</p>
              <Equation>{"Minimize:  ½‖w‖² + C Σᵢ ξᵢ\nSubject to: yᵢ(w · φ(xᵢ) + b) ≥ 1 − ξᵢ\n            ξᵢ ≥ 0\n\nDistance between the score levels −1 and +1 = 2 / ‖w‖"}</Equation>
              <p>A larger C gives violations more influence in this objective. A violation can be an observation on the correct side but inside the margin, as well as a misclassification. C and gamma control different things: the fitting tradeoff and the kernel&apos;s distance scale.</p>
            </SubSection>
            <SubSection title="15. Rewrite the training problem using comparisons">
              <p>Introduce one nonnegative multiplier αᵢ for each margin constraint. Eliminating the feature weights gives an equivalent optimization problem in these multipliers, called the dual.</p>
              <DerivationTable expressionHeading="Step" reasonHeading="What it gives us" rows={[
                { expression: "w = Σᵢ αᵢ yᵢ φ(xᵢ)", reason: "At a stationary solution, the feature-weight vector is a weighted combination of mapped training observations." },
                { expression: "Σᵢ αᵢ yᵢ = 0", reason: "Differentiating with respect to the separate unpenalized offset gives this equality constraint." },
                { expression: "maximize Σᵢ αᵢ − ½ ΣᵢΣⱼ αᵢαⱼyᵢyⱼ k(xᵢ, xⱼ)", reason: "Substitution expresses all dependence on the input observations through their kernel comparisons." },
                { expression: "0 ≤ αᵢ ≤ C, and Σᵢ αᵢyᵢ = 0", reason: "Both constraints belong to this standard soft-margin dual." },
              ]} />
              <p>Substituting the same expression for w into the prediction score gives the coefficient form used earlier. Each coefficient is a multiplier combined with its training label.</p>
              <Equation>{"score(x) = Σᵢ αᵢyᵢ k(xᵢ, x) + b\ncᵢ = αᵢyᵢ"}</Equation>
              <p>Training observations with nonzero multipliers are the <strong>support vectors</strong>. Observations with zero multipliers contribute nothing to this sum. The number retained depends on the data, settings, and fitted solution; it can include every training observation.</p>
              <SupportVectorRefit />
              <p>The refitting experiment compares the full clinic with reduced versions. Its reported gap measures the change in decision values. Numerical optimization can leave small differences even when the retained observations support the same boundary.</p>
              <p>Stanford&apos;s <a href="https://see.stanford.edu/materials/aimlcs229/cs229-notes3.pdf" className={link}>CS229 notes on support vector machines</a> develop the standard margin and dual derivation in more detail.</p>
            </SubSection>
            <SubSection title="16. Account for this SDK's offset convention">
              <p>The SDK makes a different choice from the standard formulation above. It appends an always-one feature implicitly by adding one to the selected kernel. The offset becomes the weight on that constant feature and is penalized along with the other weights.</p>
              <Equation>{"k̃(a, b) = k(a, b) + 1\n         = (φ(a), 1) · (φ(b), 1)\n\nSDK score(x) = Σᵢ αᵢyᵢ [k(xᵢ, x) + 1]"}</Equation>
              <p>This removes the equality constraint needed for a separate free offset. The implementation uses projected gradient ascent with box constraints. It is a model with a penalized offset, so it need not match the usual SVM with an unpenalized offset.</p>
              <p>This extra one is outside the chosen kernel. In particular, it is separate from the constant inside the playground&apos;s Squared kernel.</p>
              <Equation>{"Selected Squared kernel: (a · b + 1)²\nSDK classifier uses:     (a · b + 1)² + 1"}</Equation>
              <AbsorbedInterceptTable />
              <p>The four-reading example shows the boundary changing with C. The unpenalized hard-margin midpoint would lie halfway between the middle two readings. Penalizing the offset can shift the result, especially when the penalty dominates.</p>
            </SubSection>
            <SubSection title="17. Read a decision score correctly">
              <p>The score&apos;s sign selects a class. Multiplying the score by a known label gives the functional margin: positive when correctly classified and negative when misclassified. The score is not automatically a geometric distance or a calibrated probability. For a nonzero feature-weight vector, signed distance requires dividing by its norm.</p>
              <Equation>{"Functional margin of a labeled example = y × score(x)\nGeometric signed distance = (w · φ(x) + b) / ‖w‖"}</Equation>
              <p>The SDK also exposes a sigmoid of the decision score. That places the value between zero and one, but does not fit a probability model. If probabilities are needed, calibration must be learned and evaluated separately.</p>
            </SubSection>
          </>,
        },
        {
          title: "Part 8. Check the Kernel and the Result",
          content: <>
            <PreviousSection id="part-7-check-the-kernel-and-the-result" />
            <PreviousSection id="part-8-implementation-and-failure-contracts" />
            <SubSection title="18. Not every similarity can replace an inner product">
              <p>A real-valued kernel must be symmetric and produce a positive-semidefinite Gram matrix on every finite set of inputs. Positive semidefinite means that a certain quadratic combination of its entries can never be negative. Equivalently, its eigenvalues are nonnegative in exact arithmetic.</p>
              <Equation>{"k(a, b) = k(b, a)\nFor every finite input set and every real vector v: vᵀKv ≥ 0"}</Equation>
              <p>This is a condition on the function across possible input sets. Passing one numerical check does not prove that a function is valid everywhere. Finding a substantially negative eigenvalue gives a counterexample.</p>
              <p>The table below shows one kernel value per pair of clinic observations. The first ten rows and columns are the healthy group. Inspect Linear and Radial first, then compare the Sigmoid option with its negative eigenvalues.</p>
              <ClinicGramMatrix />
              <p>A negative matrix entry is allowed: ordinary dot products can be negative. A negative eigenvalue is a different issue. It means this table cannot be an inner-product Gram matrix. Small negatives near numerical precision need a tolerance-aware interpretation.</p>
              <p>The ridge check here attempts Cholesky factorization after adding a small diagonal penalty. It rejects this particular indefinite example. That is not a proof that every accepted kernel function is valid: regularization can make some indefinite matrices positive definite.</p>
              <p>The classifier can return a result on an indefinite table, but the usual concavity guarantee for its dual is lost. A reported prediction score alone does not establish that the intended optimization problem was solved.</p>
              <p>The <a href="https://web.stanford.edu/class/stats202/notes/Support-vector-machines/Kernels.html" className={link}>Stanford kernel notes</a> connect these matrix conditions with the feature-space interpretation.</p>
            </SubSection>
            <SubSection title="19. Check what was gained, and what was assumed">
              <ul className="list-disc space-y-2 pl-6">
                <li>Check that the algorithm can use pairwise inner products for the operations being replaced.</li>
                <li>Fit preprocessing on training data and apply the same transformation to later inputs.</li>
                <li>Choose kernel settings with validation data, then keep the final test separate.</li>
                <li>Inspect convergence as well as accuracy. Reaching an iteration limit can leave a fit unfinished.</li>
                <li>Budget for stored reference inputs, kernel comparisons, and any full Gram matrix.</li>
              </ul>
              <KeepInMind>The useful question is what comparison the model needs. When that comparison is an inner product of transformed inputs, a kernel can supply it directly. The feature representation determines what relationships are available; the learning algorithm determines how to use them.</KeepInMind>
            </SubSection>
          </>,
        },
        {
          title: "Questions on Parts 7 and 8",
          quiz: [
            choice(
              "What does this SDK do differently from the standard support vector formulation?",
              [
                "It adds one to the selected kernel, so the offset becomes the weight on an always-one feature and is penalized along with the others",
                "It drops the margin and penalizes only the violations",
                "It keeps an unpenalized offset by adding an equality constraint",
                "It replaces the kernel with the explicit feature map",
              ],
              0,
              "That removes the equality constraint a separate free offset needs, and the implementation uses projected gradient ascent with box constraints. Being a model with a penalized offset, it need not match the usual classifier. The extra one sits outside the chosen kernel and is separate from the constant inside the playground's Squared kernel.",
            ),
            several(
              "Which of these hold for the decision score?",
              [
                "Its sign selects a class",
                "Multiplying it by a known label gives the functional margin, positive when the observation is correctly classified",
                "Dividing it by the norm of a nonzero feature-weight vector gives a signed geometric distance",
                "The sigmoid of it is a calibrated probability",
              ],
              [0, 1, 2],
              "The sign, the functional margin and the normalised distance all hold, and the raw score on its own is neither a distance nor a probability, since the signed distance needs the score divided by the norm of a nonzero feature weight vector. The sigmoid places the value between zero and one without fitting a probability model, and if probabilities are needed the calibration has to be learned and evaluated separately.",
            ),
            trueFalse(
              "A negative entry in the kernel matrix is allowed, since an ordinary dot product can be negative.",
              true,
              "A negative entry is allowed, since ordinary dot products can be negative. It is a negative eigenvalue that rules the table out, and small negatives near numerical precision need a tolerance-aware interpretation rather than a verdict.",
            ),
            trueFalse(
              "The ridge check accepting a table proves that the kernel function behind it is valid.",
              false,
              "The condition is on the function across every finite input set, so one numerical check proves nothing in general, and adding a diagonal penalty can make some indefinite matrices positive definite. A substantially negative eigenvalue is what gives a counterexample. The classifier can return a result on an indefinite table while the usual concavity guarantee for its dual is lost.",
            ),
        ],
        },
        {
          title: "Practice. Calculate the Comparisons With the Library",
          practice: [
            exercise(
              "Take both routes to 121 with the library’s kernels",
              ["Part 3 compares a = (1, 2) with b = (3, 4) two ways, by lifting both through the feature map and taking the dot product of the three-entry vectors, and by squaring the original dot product of 11. Ask the library’s kernels for all three numbers.", "A kernel here is an object that compares two blocks of rows and answers a matrix with one entry per pair, so a block of one row each gives a single entry. The linear kernel is the plain dot product, and the polynomial kernel of degree 2 with its constant at zero is the pure squared kernel. Finish by asking the playground’s Squared kernel, whose constant is one, for its value on the same pair, which the page does not quote."],
              `import numpy as np
from oop_ml import LinearKernel, PolynomialKernel, RowBlock

a = RowBlock(np.array([[1.0, 2.0]]), ["x1", "x2"])
b = RowBlock(np.array([[3.0, 4.0]]), ["x1", "x2"])
root_two = 2 ** 0.5
lifted_a = RowBlock(np.array([[1.0, root_two * 1.0 * 2.0, 4.0]]), ["u", "v", "w"])
lifted_b = RowBlock(np.array([[9.0, root_two * 3.0 * 4.0, 16.0]]), ["u", "v", "w"])

# Print the original dot product, the dot product of the lifted vectors, the
# pure squared kernel's value on a and b, and the value of the degree-2 kernel
# with its constant at one, each as a whole number.`,
              `import numpy as np
from oop_ml import LinearKernel, PolynomialKernel, RowBlock

a = RowBlock(np.array([[1.0, 2.0]]), ["x1", "x2"])
b = RowBlock(np.array([[3.0, 4.0]]), ["x1", "x2"])
root_two = 2 ** 0.5
lifted_a = RowBlock(np.array([[1.0, root_two * 1.0 * 2.0, 4.0]]), ["u", "v", "w"])
lifted_b = RowBlock(np.array([[9.0, root_two * 3.0 * 4.0, 16.0]]), ["u", "v", "w"])

dot = LinearKernel().between(a, b).values[0, 0]
lifted = LinearKernel().between(lifted_a, lifted_b).values[0, 0]
squared = PolynomialKernel(degree=2, constant=0).between(a, b).values[0, 0]
shifted = PolynomialKernel(degree=2, constant=1).between(a, b).values[0, 0]

print(f"a . b = {dot:.0f}")
print(f"route one, the lifted dot product = {lifted:.0f}")
print(f"route two, the squared kernel = {squared:.0f}")
print(f"the playground's Squared kernel, (a . b + 1) squared = {shifted:.0f}")`,
              `a . b = 11
route one, the lifted dot product = 121
route two, the squared kernel = 121
the playground's Squared kernel, (a . b + 1) squared = 144`,
              { hints: ["between takes two row blocks and answers a kernel matrix. Its values are a two-dimensional array, so the one comparison of a one-row block against another sits at position [0, 0].", "The lifted vectors are the feature map worked by hand in section 3, (1, 2√2, 4) and (9, 12√2, 16), handed to the linear kernel under their own three names.", "The polynomial kernel raises the dot product plus its constant to its degree, so a constant of zero is the pure square and a constant of one is what the playground calls Squared."], check: numberCheck("What does the pure squared kernel return for a and b?", 121, 0.5, "The original dot product is 11 and its square is 121, and the lifted route reaches the same 121 through 9 plus 48 plus 64, which is the identity the √2 on the middle feature makes exact. The playground’s Squared kernel answers 144, since (11 + 1)² is a different comparison with linear terms riding along, which is why Part 4 says the two should not be described as the same fit.") },
            ),
            exercise(
              "Read the radial kernel at two gammas",
              ["Section 14 works the radial kernel on a pair whose squared distance is 4, finding 0.1353 at a gamma of 0.5 and 0.0003 at a gamma of 2. Put the origin and the point (2, 0) to the library’s radial kernel at both gammas, and at a gamma of 0.1, which the page does not work.", "Print each value to four places. The larger gamma gives the pair a far smaller comparison, and the smallest gamma a larger one, since gamma sets how fast the kernel falls with distance."],
              `import numpy as np
from oop_ml import RadialBasisKernel, RowBlock

origin = RowBlock(np.array([[0.0, 0.0]]), ["x1", "x2"])
two_along = RowBlock(np.array([[2.0, 0.0]]), ["x1", "x2"])

# For gammas of 0.5, 2 and 0.1, print the radial kernel's value on the pair
# to four places.`,
              `import numpy as np
from oop_ml import RadialBasisKernel, RowBlock

origin = RowBlock(np.array([[0.0, 0.0]]), ["x1", "x2"])
two_along = RowBlock(np.array([[2.0, 0.0]]), ["x1", "x2"])

for gamma in (0.5, 2, 0.1):
    value = RadialBasisKernel(gamma=gamma).between(origin, two_along).values[0, 0]
    print(f"gamma {gamma}: k = {value:.4f}")`,
              `gamma 0.5: k = 0.1353
gamma 2: k = 0.0003
gamma 0.1: k = 0.6703`,
              { hints: ["The radial kernel is constructed with its gamma and compared the same way as the others, through between on two row blocks.", "The squared distance between the two rows is 4, so each value is exp of minus gamma times 4, which is what the library computes."], check: numberCheck("What does the radial kernel return at a gamma of 0.5, to four places?", 0.1353, 5e-05, "The squared distance is 4, so at a gamma of 0.5 the kernel is exp(−2), about 0.1353, and at a gamma of 2 it is exp(−8), about 0.0003. At 0.1 it is exp(−0.4), about 0.6703, so a smaller gamma keeps distant pairs comparable for longer, which is the broad end of the sweep in section 15 where overly wide comparisons miss the pattern.") },
            ),
            exercise(
              "Fit the clinic under three kernels",
              ["Part 4 fits the support vector classifier on the standardized clinic and compares Linear with Squared, and Part 6 adds the radial kernel. Fit all three yourself on the twenty-four patients, standardizing the two vitals first as every fit on the page does, and read each fit’s training accuracy, how many patients are support vectors, how many of those sit at the capacity, and how many ascent steps the solver took.", "The library’s default step of 0.001 and ceiling of 1000 epochs stop short on this clinic, so use a step of 0.02 and a ceiling of 50000, which is what the page’s widgets run. Finish by fitting the linear kernel at the library’s own defaults and reading its support vector count, which the page does not quote."],
              `from oop_ml import (
    Feature, LinearKernel, PolynomialKernel, RadialBasisKernel, Standardizer, SupportVectorClassifier,
)

temperature = Feature("temperature", [36.6, 36.8, 37.0, 37.2, 36.9, 37.1, 36.7, 37.3, 36.5, 37.0, 35.2, 35.5, 36.0, 38.9, 39.5, 40.2, 39.8, 40.5, 35.4, 38.8, 35.8, 39.9, 35.1, 38.5])
heart_rate = Feature("heart_rate", [68, 74, 70, 78, 64, 84, 80, 72, 76, 88, 48, 120, 130, 132, 120, 110, 66, 90, 90, 50, 58, 140, 72, 44])
healthy = Feature("healthy", [1] * 10 + [0] * 14)

scaler = Standardizer().fit([temperature, heart_rate])
inputs = scaler.transform([temperature, heart_rate])

# For the linear kernel, the degree-2 kernel with constant 1 and the radial
# kernel at gamma 1, fit with capacity 1, learning_rate 0.02 and max_epochs
# 50000, and print the accuracy to four places, the support vector count, the
# count at the capacity and the epochs run. Then fit the linear kernel at the
# library's defaults and print its support vector count and epochs run.`,
              `from oop_ml import (
    Feature, LinearKernel, PolynomialKernel, RadialBasisKernel, Standardizer, SupportVectorClassifier,
)

temperature = Feature("temperature", [36.6, 36.8, 37.0, 37.2, 36.9, 37.1, 36.7, 37.3, 36.5, 37.0, 35.2, 35.5, 36.0, 38.9, 39.5, 40.2, 39.8, 40.5, 35.4, 38.8, 35.8, 39.9, 35.1, 38.5])
heart_rate = Feature("heart_rate", [68, 74, 70, 78, 64, 84, 80, 72, 76, 88, 48, 120, 130, 132, 120, 110, 66, 90, 90, 50, 58, 140, 72, 44])
healthy = Feature("healthy", [1] * 10 + [0] * 14)

scaler = Standardizer().fit([temperature, heart_rate])
inputs = scaler.transform([temperature, heart_rate])

kernels = (("linear", LinearKernel()), ("squared", PolynomialKernel(degree=2, constant=1)), ("radial", RadialBasisKernel(gamma=1)))
for name, kernel in kernels:
    model = SupportVectorClassifier(kernel=kernel, capacity=1, learning_rate=0.02, max_epochs=50000)
    model.fit(inputs, healthy)
    support = model.support_vectors
    print(f"{name}: accuracy {model.score(inputs, healthy):.4f}, support vectors {support.n_vectors} of 24, "
          f"{support.n_at_the_cap(1)} at the capacity, {model.epochs_run} epochs")

default = SupportVectorClassifier(kernel=LinearKernel()).fit(inputs, healthy)
print(f"linear at the defaults: support vectors {default.support_vectors.n_vectors} of 24, {default.epochs_run} epochs")`,
              `linear: accuracy 0.7083, support vectors 20 of 24, 19 at the capacity, 226 epochs
squared: accuracy 1.0000, support vectors 6 of 24, 3 at the capacity, 812 epochs
radial: accuracy 1.0000, support vectors 16 of 24, 4 at the capacity, 5768 epochs
linear at the defaults: support vectors 24 of 24, 1000 epochs`,
              { hints: ["A standardizer is fitted on the two vitals and its transform answers the scaled features, which are what the classifier is fitted on.", "The classifier is constructed with a kernel object, a capacity, a learning_rate and a max_epochs, and fitted on the features and the labels like every classifier here.", "support_vectors on the fitted model knows its count, n_vectors, and how many of them sit at the capacity, n_at_the_cap. epochs_run is the number of ascent steps the solver took, and a count equal to max_epochs means it stopped at the ceiling rather than by converging."], check: numberCheck("What training accuracy does the linear kernel reach on the clinic, to four places?", 0.7083, 5e-05, "No straight line cuts the ten healthy patients out of the fourteen who surround them, so the linear fit gets 17 of 24 right, 0.7083, with twenty support vectors and nineteen of them at the capacity. The squared and radial kernels both reach 1.0, drawing a curved boundary in the original vitals that is flat in their feature spaces. At the library’s defaults the linear solver stops at its 1000-epoch ceiling with every multiplier still moving, which reports all twenty-four patients as support vectors and is why the page runs a larger step and a higher ceiling.") },
            ),
            exercise(
              "Build the Gram matrix under the sigmoid kernel and let the ridge check judge it",
              ["Part 8 says a kernel must produce a positive-semidefinite Gram matrix, that the Sigmoid option on the clinic has negative eigenvalues, and that the ridge check rejects it while the classifier still returns a result. Build the clinic’s 24 by 24 table under the sigmoid kernel with a gamma of 1 and a constant of 0, read its eigenvalues, and then hand the same kernel to the library’s kernel ridge and to the classifier.", "Print the smallest and largest eigenvalue to four places and how many are negative, then the refusal the ridge fit raises, by its name and message, and the classifier’s accuracy and support vector count on the same kernel. The classifier answers, and the page says why that is the weaker guarantee."],
              `import numpy as np
from oop_ml import (
    Feature, KernelRidgeRegression, MLLibError, RowBlock, SigmoidKernel, Standardizer, SupportVectorClassifier,
)

temperature = Feature("temperature", [36.6, 36.8, 37.0, 37.2, 36.9, 37.1, 36.7, 37.3, 36.5, 37.0, 35.2, 35.5, 36.0, 38.9, 39.5, 40.2, 39.8, 40.5, 35.4, 38.8, 35.8, 39.9, 35.1, 38.5])
heart_rate = Feature("heart_rate", [68, 74, 70, 78, 64, 84, 80, 72, 76, 88, 48, 120, 130, 132, 120, 110, 66, 90, 90, 50, 58, 140, 72, 44])
healthy = Feature("healthy", [1] * 10 + [0] * 14)

scaler = Standardizer().fit([temperature, heart_rate])
inputs = scaler.transform([temperature, heart_rate])
rows = RowBlock(np.column_stack([feature.values for feature in inputs]), ["temperature", "heart_rate"])
kernel = SigmoidKernel(gamma=1, constant=0)

# Build the kernel matrix of the rows against themselves, print its smallest
# and largest eigenvalue and how many are negative, then try a kernel ridge
# fit with this kernel and print the refusal, and finally fit the classifier
# with it and print its accuracy and support vector count.`,
              `import numpy as np
from oop_ml import (
    Feature, KernelRidgeRegression, MLLibError, RowBlock, SigmoidKernel, Standardizer, SupportVectorClassifier,
)

temperature = Feature("temperature", [36.6, 36.8, 37.0, 37.2, 36.9, 37.1, 36.7, 37.3, 36.5, 37.0, 35.2, 35.5, 36.0, 38.9, 39.5, 40.2, 39.8, 40.5, 35.4, 38.8, 35.8, 39.9, 35.1, 38.5])
heart_rate = Feature("heart_rate", [68, 74, 70, 78, 64, 84, 80, 72, 76, 88, 48, 120, 130, 132, 120, 110, 66, 90, 90, 50, 58, 140, 72, 44])
healthy = Feature("healthy", [1] * 10 + [0] * 14)

scaler = Standardizer().fit([temperature, heart_rate])
inputs = scaler.transform([temperature, heart_rate])
rows = RowBlock(np.column_stack([feature.values for feature in inputs]), ["temperature", "heart_rate"])
kernel = SigmoidKernel(gamma=1, constant=0)

eigenvalues = np.linalg.eigvalsh(kernel.between(rows, rows).values)
print(f"smallest eigenvalue {eigenvalues.min():.4f}, largest {eigenvalues.max():.4f}")
print(f"negative eigenvalues {int((eigenvalues < -1e-9).sum())} of {len(eigenvalues)}")

try:
    KernelRidgeRegression(kernel=kernel, penalty=1e-6).fit(inputs, heart_rate)
except MLLibError as refusal:
    print(type(refusal).__name__)
    print(refusal)

model = SupportVectorClassifier(kernel=kernel, capacity=1, learning_rate=0.02, max_epochs=50000).fit(inputs, healthy)
print(f"classifier accuracy {model.score(inputs, healthy):.4f}, support vectors {model.support_vectors.n_vectors} of 24")`,
              `smallest eigenvalue -2.6733, largest 12.8993
negative eigenvalues 12 of 24
InvalidValuesError
the system K + penalty I is singular, which a valid kernel cannot produce -- a positive semi-definite Gram matrix plus a positive penalty is always invertible. This kernel (SigmoidKernel(tanh(1.0 a . b + 0.0))) failed Mercer's condition on this data; the sigmoid kernel with a negative constant is the usual way to get here
classifier accuracy 0.7083, support vectors 19 of 24`,
              { hints: ["A row block over the standardized columns, compared with itself through between, is the training Gram matrix, and its values are the square array whose eigenvalues numpy can read.", "Kernel ridge solves a system built from that matrix by a Cholesky route that fails exactly when the matrix is not positive definite, so its refusal is the library’s Mercer check. Every refusal the library makes derives from one base class, so catching that one catches this.", "The classifier runs projected gradient ascent on the same table and never checks it, which is why it returns a result whose concavity guarantee is gone."] },
            ),
          ],
        },
      ]}
    />
  );
}
