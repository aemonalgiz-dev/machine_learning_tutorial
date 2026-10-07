import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { choice, several, trueFalse } from "@/lib/quizzes";
import { exercise, numberCheck } from "@/lib/exercises";
import { Equation } from "@/components/concept/Equation";
import { NumberTable, SubSection, WhyThisWorks } from "@/components/concept/Treatments";
import { ModernLearningExample } from "@/components/widgets/ModernLearningExample";
import { lessonIntuitions } from "@/lib/intuition";

export const metadata: Metadata = {
  title: "Reinforcement Learning · oop_ml",
  description: "Learn why an agent needs rewards, follow one policy update, and connect the feedback loop to language models and LoRA.",
};

export default function Page() {
  return (
    <ConceptPage
      lessonId="reinforcement-learning"
      title="Reinforcement Learning"
      tagline="Let an agent try an action, observe its consequences, and use that experience to improve its next decision."
      openingTitle="How Can a Model Learn When We Can Judge the Result?"
      intuition={lessonIntuitions["reinforcement-learning"]}
      technicalStart="Part 3. Calculate One Policy Update"
      prerequisites={<>Begin with the robot example. For the calculations, revisit <Link href="/concepts/sampling-and-temperature">how scores become probabilities</Link>. The language-model connection builds on <Link href="/concepts/supervised-fine-tuning">supervised fine-tuning</Link> and <Link href="/concepts/low-rank-adaptation">LoRA</Link>.</>}
      playgroundIntro="Set training episodes to zero to inspect the equal starting policy. Raise it to one to see a single sampled action and its feedback, then increase it to collect more experience. Change the sampling seed to try a different sequence. Each change starts a fresh run."
      playground={<ModernLearningExample topic="reinforcement-learning" />}
      sections={[
        {
          title: "Part 1. What Does the Agent Need?",
          content: <>
            <SubSection title="1. Separate the decision from its consequences">
              <p>In supervised learning, we supply examples of the answer we want. For our robot, that could mean labeling each junction with the turn it should take. But sometimes it is easier to judge an outcome than to describe every decision needed to reach it. We can recognize a successful delivery without writing a rule for every possible route.</p>
              <p>Reinforcement learning gives us a way to learn from those outcomes. The learner acts, receives feedback, and adjusts its future choices. We need a few distinct components to make that loop work:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li><strong>Agent:</strong> the decision maker. Here, it is the robot and the rule that chooses its route.</li>
                <li><strong>Environment:</strong> what the agent interacts with. Our simulator responds to a route choice with an outcome.</li>
                <li><strong>Observation:</strong> the information available when deciding. Here, the robot always sees the same junction. In a larger task it might see its location, nearby obstacles, and battery level.</li>
                <li><strong>Action:</strong> a choice the agent can make. Our choices are Left, Straight, and Right.</li>
                <li><strong>Reward:</strong> a numerical score supplied after an action. It expresses which outcomes the task designer values.</li>
                <li><strong>Policy:</strong> the rule that turns an observation into a choice. Our policy assigns each action a probability, then samples one.</li>
              </ul>
              <p>The environment has a state: the information needed to describe its situation and how it can change. The observation may reveal all of that state or only part of it. Our fixed junction removes this complication so we can concentrate on learning one choice.</p>
            </SubSection>
            <SubSection title="2. Learn from the route that was actually tried">
              <p>One attempt from start to finish is an <strong>episode</strong>. Our episode contains one route choice and one reward. This is a bandit problem, a simple setting with no later decisions to plan.</p>
              <p>The table in the live example exposes all three payoffs so you can understand the environment. The learner does not use the table to look up the best route. It samples an action and receives only that action&apos;s reward. The policy then changes through the feedback from repeated attempts.</p>
              <p>Those payoffs are the whole of this environment. Each route leads to one outcome, and the task designer has given each outcome a score.</p>
              <NumberTable headings={["Action", "Outcome", "Assigned reward"]} rows={[["Left", "Slow delivery", "0.2"], ["Straight", "Quick delivery", "1"], ["Right", "Blocked route", "-1"]]} caption="The simulated junction. The learner is never shown this table." />
              <p>The scores say what we value. A quick delivery scores well above a slow one, and a blocked route scores below zero. Nothing in them tells the robot which turn to take. It has to find that out by turning.</p>
              <p>Here is what the first five episodes of the live example look like at its default settings. Each row is one complete trip round the loop. The policy offers its probabilities, one action is sampled, the environment answers with that action&rsquo;s reward, and the probability of the sampled action changes.</p>
              <NumberTable headings={["Episode", "Sampled action", "Observed reward", "Its probability before", "Its probability after"]} rows={[["1", "Straight", "1", "0.333", "0.356"], ["2", "Left", "0.2", "0.322", "0.327"], ["3", "Left", "0.2", "0.327", "0.331"], ["4", "Left", "0.2", "0.331", "0.335"], ["5", "Right", "-1", "0.316", "0.294"]]} caption="The first five of the sixty episodes the live example runs, at a learning rate of 0.1 and a sampling seed of zero." />
              <p>Read down the last two columns. A positive reward raised the probability of the route that earned it, and the reward of one raised it further than the rewards of 0.2 did. The negative reward lowered it. Episode 1 taught the robot nothing about what Left or Right would have paid, because it took neither. It learned only that Straight, tried once, went well. Part 3 calculates the size of these changes.</p>
              <p>Trying uncertain actions is <strong>exploration</strong>. Using what has already worked is <strong>exploitation</strong>. Sampling lets this example explore while increasingly favoring rewarding routes. If a probability becomes tiny, however, that route may rarely be tried. Random sampling alone does not guarantee enough exploration.</p>
              <p>The sixty-episode run shows this in small form. By its end Right has a probability of 0.053, after being sampled 9 times. Here that is the right outcome, because Right pays the same poor reward every time it is taken. In a task whose rewards vary from one try to the next, a route that did badly on its first few tries would be treated the same way, and at a probability that small it would seldom get another chance.</p>
            </SubSection>
          </>,
        },
        {
          title: "Part 2. What If the Reward Arrives Later?",
          content: <>
            <SubSection title="3. Judge a sequence, not just the next step">
              <p>Now imagine the robot must make several moves before delivering its package. Each move uses energy, so it receives a small negative reward. Reaching the destination brings a larger positive reward. Judging only the next reward could teach it to avoid moving, even when moving makes the delivery possible.</p>
              <p>The <strong>return</strong> combines rewards from a decision onward. A discount factor, called gamma, controls how much weight a reward keeps as it lies further into the future. Gamma of one keeps the full value; smaller values give less weight to more distant rewards.</p>
              <p>For a separate three-step example, suppose the observed rewards are negative one, negative one, and five. Use a discount factor of 0.9. Work backward from the final reward:</p>
              <Equation>{"Rewards: [-1, -1, 5]\nDiscount γ = 0.9\n\nG₂ = 5\nG₁ = -1 + (0.9 × 5) = 3.5\nG₀ = -1 + (0.9 × 3.5) = 2.15"}</Equation>
              <p>The first move had an immediate cost but a positive return. It helped begin a sequence that reached the destination. This is why a learner may reinforce an action even when its immediate reward is negative.</p>
              <p>Whether it does so depends on the discount. The same three rewards give the first move a different return at each value of gamma, and only the weights change. Work the undiscounted case and a heavier discount the same way, backward from the final reward:</p>
              <Equation>{"γ = 1:    G₁ = -1 + (1 × 5) = 4\n          G₀ = -1 + (1 × 4) = 3\n\nγ = 0.5:  G₁ = -1 + (0.5 × 5) = 1.5\n          G₀ = -1 + (0.5 × 1.5) = -0.25"}</Equation>
              <p>With no discount the delivery counts in full and the first move is worth three. At 0.5 the delivery two steps away is worth a quarter of its five by the time it reaches the first decision, and 1.25 does not cover the immediate cost of one plus the second cost discounted to a half. The return turns negative, and the same successful episode would now discourage the move that began it. So the discount is not a detail of the arithmetic. It decides how far ahead a cost can be repaid, and with that whether this first move is reinforced or discouraged.</p>
            </SubSection>
            <SubSection title="4. Recognize the credit-assignment problem">
              <p>A good final result does not reveal exactly which earlier choices made it happen. A useful turn and an unnecessary detour can occur in the same successful episode. Working out which decisions deserve credit is the <strong>credit-assignment problem</strong>.</p>
              <p>Reward-to-go gives each action feedback from the rewards that follow it. It is a learning signal across many attempts, not proof that every action in one successful attempt was useful. The live bandit example avoids this difficulty deliberately: its only action receives its only reward immediately.</p>
            </SubSection>
          </>,
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            several(
              "Which of these hold for the live bandit example?",
              [
                "The robot always sees the same junction, so the observation never changes",
                "An episode contains one route choice and one reward",
                "The learner reads the table of payoffs and picks the best route from it",
                "There are no later decisions to plan for",
              ],
              [0, 1, 3],
              "The table in the live example exposes all three payoffs so a reader can understand the environment, but the learner samples an action and receives only that action’s reward. A fixed junction and one choice per episode are what make this a bandit problem, which is also what lets the lesson concentrate on learning one choice.",
            ),
            trueFalse(
              "Sampling from the policy guarantees that every route keeps being tried.",
              false,
              "Sampling lets the example explore while increasingly favoring rewarding routes, which is the balance between exploration and exploitation. If a probability becomes tiny, though, that route may rarely be tried. In the sixty-episode run Right ends at a probability of 0.053, so random sampling alone does not guarantee enough exploration.",
            ),
            choice(
              "In the first five episodes of the live example, Left is sampled three times for a reward of 0.2 and Right once for a reward of negative one. What happens to the probabilities of those two routes?",
              [
                "Left’s rises a little each time, from 0.322 to 0.335 over its three episodes, and Right’s falls from 0.316 to 0.294",
                "Both fall, because neither is the best route at the junction",
                "Left’s rises and Right’s is unchanged, since a blocked route returns no feedback",
                "Both rise, because any route that is sampled is reinforced",
              ],
              0,
              "With a zero baseline the sign of the reward sets the direction, so a reward of 0.2 raises the sampled route’s probability and a reward of negative one lowers it. The learner is never shown that Straight pays more than Left. It receives only the reward of the route it took, which is why Left is reinforced in these episodes although it is not the best route.",
            ),
            trueFalse(
              "Reward-to-go is a learning signal across many attempts, not proof that every action in one successful attempt was useful.",
              true,
              "A good final result does not reveal which earlier choices made it happen, and a useful turn and an unnecessary detour can occur in the same successful episode. Reward-to-go hands each action the rewards that followed it, which is evidence that accumulates over many episodes rather than a verdict on any one of them. The live bandit example avoids the question deliberately, because its only action receives its only reward immediately.",
            ),
            choice(
              "With the same rewards of negative one, negative one and five, what happens to the first move’s return when the discount falls from 0.9 to 0.5?",
              [
                "It falls from 2.15 to negative 0.25, so the costly first move would be discouraged rather than reinforced",
                "It stays at 2.15, since the discount applies only to the final reward",
                "It rises to 3, since the energy costs are discounted as well",
                "It becomes negative one, since only the immediate reward is left",
              ],
              0,
              "At 0.5 the delivery two steps away is worth a quarter of its five by the time it reaches the first decision, and 1.25 does not cover the immediate cost of one plus the second cost discounted to a half, so the return is negative 0.25. The return of 3 belongs to no discount at all, where the delivery counts in full. The discount decides how far ahead a cost can be repaid, which is why it is part of what the task asks for rather than a detail of the arithmetic.",
            ),
        ],
        },
        {
          title: "Part 3. Calculate One Policy Update",
          content: <>
            <SubSection title="5. Give each action a trainable score">
              <p>We now need a precise rule for changing the probabilities. Give each route a score, called a logit. Softmax converts the scores into positive probabilities that sum to one. Raising one score relative to the others raises that route&apos;s probability.</p>
              <p>Our initial logits are all zero. The order throughout these calculations is Left, Straight, Right.</p>
              <Equation>{"pⱼ = exp(zⱼ) / Σₖ exp(zₖ)\n\nz = [0, 0, 0]\nexp(z) = [1, 1, 1]\np = [1/3, 1/3, 1/3]"}</Equation>
              <p>Suppose we sample Straight and receive a reward of one. Because the episode has only one step, its return is also one. We want an update that increases the probability of this sampled action.</p>
            </SubSection>
            <SubSection title="6. Weight the update by the feedback">
              <p>A policy-gradient method changes the policy parameters in a direction estimated to improve expected return. The REINFORCE rule weights the gradient of a sampled action&apos;s log probability by its return. This allows learning without differentiating through the environment or its reward function.</p>
              <p>We can subtract a <strong>baseline</strong> from the return. It provides a reference for judging the outcome. When the baseline estimates the usual return from this state, the difference tells us how much better or worse this attempt was than expected. That difference is an estimate of the <strong>advantage</strong>.</p>
              <p>Our example uses a fixed zero baseline to keep the calculation visible. Positive rewards therefore reinforce the chosen action and negative rewards discourage it. A suitable baseline can reduce noise in the gradient estimate; it must not depend on which action was sampled for this update. See the <a href="https://spinningup.openai.com/en/latest/spinningup/rl_intro3.html">policy-gradient derivation and baseline explanation</a>.</p>
              <Equation>{"A = G - b\n\nFor action a and logit j:\n∂ log(pₐ) / ∂ zⱼ = 1[j = a] - pⱼ\n\ngⱼ = A × (1[j = a] - pⱼ)\nz_new = z_old + η g\n\nG: observed return\nb: baseline\nA: return relative to the baseline\nη: learning rate\n1[j = a]: one for the selected action, zero otherwise"}</Equation>
              <WhyThisWorks title="Why the derivative is the indicator less the probability">
                <p>The log probability of the sampled action is its own logit less the log of the sum of every exponential, because softmax divides by that sum:</p>
                <Equation>{"log(pₐ) = zₐ - log(Σₖ exp(zₖ))"}</Equation>
                <p>Differentiate with respect to one logit zⱼ. The first term contributes one when j is the sampled action and zero otherwise, which is the indicator. The second term contributes the exponential of zⱼ divided by the sum, and that ratio is exactly pⱼ, the probability softmax gives action j:</p>
                <Equation>{"∂ log(pₐ) / ∂ zⱼ = 1[j = a] - exp(zⱼ) / Σₖ exp(zₖ)\n                 = 1[j = a] - pⱼ"}</Equation>
                <p>Two things follow. The sampled action&rsquo;s entry is one less its probability, which is positive, and every other entry is the negative of that action&rsquo;s probability. One experience therefore moves every logit, not only the chosen one. And since the indicator sums to one and the probabilities sum to one, the three entries add up to zero. In the worked update they are minus one third, two thirds and minus one third. The step shifts probability toward the sampled action and away from the rest rather than raising or lowering all three scores together.</p>
              </WhyThisWorks>
              <p>The indicator creates a positive direction for the selected action and negative directions for the others. The advantage sets the sign and size of that feedback. The learning rate controls the size of the parameter change. This is gradient ascent, so we add the update.</p>
              <p>Use the sampled Straight action, a zero baseline, and a learning rate of 0.1:</p>
              <Equation>{"A = 1 - 0 = 1\n\nSelected-action indicator = [0, 1, 0]\ng = 1 × ([0, 1, 0] - [1/3, 1/3, 1/3])\n  = [-1/3, 2/3, -1/3]\n\nz_new = [0, 0, 0] + 0.1 × [-1/3, 2/3, -1/3]\n      = [-1/30, 1/15, -1/30]\n\nexp(z_new) ≈ [0.967216, 1.068939, 0.967216]\nSum of exponentials ≈ 3.003371\np_new ≈ [0.322043, 0.355913, 0.322043]"}</Equation>
              <p>Straight is now more likely, and the other routes remain possible. The reported probabilities use full-precision logits; intermediate exponentials are rounded for display. One update reflects one experience. It does not establish which route will be best across all future situations.</p>
            </SubSection>
          </>,
        },
        {
          title: "Questions on Part 3",
          quiz: [
            choice(
              "Straight is sampled with a reward of one, a zero baseline and a learning rate of 0.1. What happens to Left and Right after that single update?",
              [
                "Their probabilities fall to about 0.322 each and both remain possible",
                "Their probabilities fall to zero",
                "They stay at one third, since only the sampled action is touched",
                "They rise, because their logits were not sampled",
              ],
              0,
              "The indicator creates a positive direction for the selected action and negative directions for the others, so one update moves all three logits. The new probabilities come out near 0.322, 0.356 and 0.322, so Straight is more likely and the other routes remain possible.",
            ),
            choice(
              "What does the REINFORCE rule need derivatives of?",
              [
                "The policy’s own log probabilities",
                "The reward function",
                "The rule by which the environment responds",
                "The evaluator that supplies the score",
              ],
              0,
              "The rule weights the gradient of a sampled action’s log probability by its return, so what is differentiated is the policy and nothing else. That is what allows learning without differentiating through the environment or its reward function, and it is why a language model can learn from a test runner.",
            ),
            trueFalse(
              "A baseline may be chosen using which action was sampled for this update.",
              false,
              "A baseline gives a reference for judging the outcome and a suitable one can reduce noise in the gradient estimate, but it must not depend on the sampled action. This example uses a fixed zero baseline to keep the calculation visible, so positive rewards reinforce the chosen action and negative rewards discourage it.",
            ),
            trueFalse(
              "In one update the three gradient entries add up to zero, so the step moves probability toward the sampled action and away from the others rather than raising all three scores.",
              true,
              "The derivative of the sampled action’s log probability is the indicator less the probability, and the indicator and the probabilities each sum to one. In the worked update the entries are minus one third, two thirds and minus one third. The step is gradient ascent, so the scaled gradient is added, and Straight’s logit rises by a fifteenth while the other two fall by a thirtieth each.",
            ),
        ],
        },
        {
          title: "Part 4. How Does This Apply to a Language Model?",
          content: <>
            <SubSection title="7. Replace route choices with token choices">
              <p>Suppose a language model writes a small function in response to a prompt. We can run tests on the completed function and score the outcome. Those tests tell us something about the result without providing the exact response the model should have written.</p>
              <p>The model is the agent. The prompt and tokens generated so far form its observation. Its next-token distribution is the policy, and a sampled token is an action. The response forms a sequence of actions. A test runner or another evaluator supplies feedback, possibly only when the response is complete.</p>
              <p>The policy-gradient idea connects that feedback to the probabilities of the tokens the model chose. The model does not need a derivative of the test runner. It needs the score and the derivatives of its own log probabilities. Assigning credit over a whole response is much harder than updating our three route scores.</p>
            </SubSection>
            <SubSection title="8. Distinguish demonstrations from preferences">
              <p>Supervised fine-tuning supplies a demonstrated response and trains the model to predict its tokens. Reinforcement learning can instead sample a response from the current policy and use an assessment of its outcome. The assessment might come from executable checks or from a model trained to predict human judgments.</p>
              <p>In the InstructGPT approach to <strong>reinforcement learning from human feedback</strong>, or RLHF, human demonstrations first support supervised fine-tuning. People then compare generated responses. Those comparisons train a reward model, and its scores guide policy optimization. A penalty relative to a reference policy discourages excessive drift during that optimization. See <a href="https://arxiv.org/abs/2203.02155">Training language models to follow instructions with human feedback</a>.</p>
              <p>A reward model predicts a judgment; it does not establish truth. A policy can discover responses that receive high scores while missing the intended goal. Executable checks also cover only the properties they test. Evaluation must examine whether higher reward corresponds to better results on the actual task.</p>
            </SubSection>
            <SubSection title="9. Put LoRA and the training objective in their places">
              <p>LoRA describes a way to represent trainable parameter changes while keeping a base matrix fixed. Reinforcement learning describes learning from actions and rewards. You can train LoRA factors using a supervised loss, or use them as the trainable parameters in a reinforcement-learning setup. Choosing an adapter does not determine the feedback signal.</p>
              <p>The same distinction applies to algorithms. <strong>Proximal Policy Optimization</strong>, or PPO, addresses how to update a policy from sampled experience. Its clipped objective limits the incentive for some large probability-ratio changes, which can make optimization more stable. It does not guarantee that every update improves behavior. See <a href="https://arxiv.org/abs/1707.06347">Proximal Policy Optimization Algorithms</a>.</p>
              <p><strong>Direct Preference Optimization</strong>, or DPO, is a related way to adapt a language model using preferred and rejected response pairs. It optimizes a preference objective directly, without a separately trained reward model and the online sampling loop used by the RLHF approach above. It belongs in the broader preference-learning picture, but it is not the REINFORCE loop implemented on this page. See <a href="https://arxiv.org/abs/2305.18290">Direct Preference Optimization</a>.</p>
            </SubSection>
          </>,
        },
        {
          title: "Part 5. Run the Small Example and Know Its Limits",
          content: <>
            <SubSection title="10. Inspect actual updates in NumPy">
              <p>The SDK stores three trainable logits. Each episode samples from the current policy, obtains the selected route&apos;s payoff, and applies one update. This snippet uses the same rewards and default settings as the live example.</p>
              <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm leading-relaxed text-slate-100"><code>{"import numpy as np\nfrom oop_ml.numpy.modern import SoftmaxPolicy, discounted_returns\n\npolicy = SoftmaxPolicy(np.zeros(3))\nrun = policy.train_bandit(\n    rewards=np.array([0.2, 1.0, -1.0]),\n    episodes=60,\n    learning_rate=0.1,\n    seed=0,\n)\n\nprint(run.initial)\nprint(run.final)\nprint(run.counts)\nfirst = run.updates[0]\nprint(first.action, first.return_value)\nprint(first.before, first.gradient, first.after)\n\n# Separate three-step return calculation, not part of the bandit.\nprint(discounted_returns(np.array([-1.0, -1.0, 5.0]), gamma=0.9))"}</code></pre>
              <p>Run as written, the sixty episodes sample Straight 38 times, Left 13 times and Right 9 times, and the final probabilities come out near 0.120, 0.826 and 0.053 from the equal thirds they started at. The first recorded update is the one worked in Part 3, since with this seed the first sampled action is Straight and its reward is one, so the probability of Straight moves from a third to about 0.356. Seeds one, two and three end with Straight at 0.846, 0.840 and 0.850, a different sequence of experiences arriving at the same preference. The last line prints the 2.15, 3.5 and 5 of Part 2.</p>
              <p>With zero episodes, the run reports the starting probabilities and no observations. Repeating a fresh policy with the same seed reproduces the run. Calling training again on the same policy continues from its learned logits.</p>
            </SubSection>
            <SubSection title="11. Keep the demonstration in proportion">
              <p>The example performs real policy updates in a deliberately small environment. It has one observation, deterministic rewards, and one action per episode. It does not train a navigation network, solve delayed credit assignment, or fine-tune a language model. The discounted-return helper illustrates the longer-episode calculation separately.</p>
              <p>Policy gradients are one family of reinforcement-learning methods. Value-based methods, such as Q-learning, instead estimate the return associated with an action in a state and use those estimates to choose. Actor-critic methods combine a policy with a learned value estimate. Each adds machinery to address problems that our single-junction example removes.</p>
              <p>For a larger task, inspect reward design, exploration, the cost of collecting experience, and performance on situations outside the training runs. A higher reward on this fixed junction measures progress on this fixed junction.</p>
            </SubSection>
            <p>Continue with <Link href="/concepts/retrieval-augmented-generation">Retrieval-Augmented Generation</Link>.</p>
          </>,
        },
        {
          title: "Questions on Parts 4 and 5",
          quiz: [
            several(
              "Which of these does the lesson claim?",
              [
                "In the InstructGPT approach, comparisons of generated responses train a reward model whose scores guide policy optimization",
                "A penalty relative to a reference policy discourages excessive drift during that optimization",
                "DPO is the REINFORCE loop implemented on this page, applied to preference pairs",
                "The clipped objective in PPO guarantees that every update improves behavior",
              ],
              [0, 1],
              "Human demonstrations first support supervised fine-tuning, then comparisons train the reward model whose scores guide the policy, with a penalty against a reference policy limiting drift. DPO optimizes a preference objective directly, without a separately trained reward model or the online sampling loop, and is not the loop here. The clipped objective limits the incentive for some large probability-ratio changes, which can make optimization more stable without guaranteeing anything about a single update.",
            ),
            trueFalse(
              "A high score from a reward model establishes that the response was good.",
              false,
              "A reward model predicts a judgment rather than establishing truth, and a policy can discover responses that receive high scores while missing the intended goal. Executable checks have the same limit, since they cover only the properties they test, so evaluation has to examine whether higher reward corresponds to better results on the actual task.",
            ),
            choice(
              "What does choosing LoRA factors as the trainable parameters settle?",
              [
                "Nothing about the feedback signal",
                "That the loss will be a supervised one",
                "That the method will be a policy gradient",
                "That a reward model will be needed",
              ],
              0,
              "LoRA describes a way to represent trainable parameter changes while keeping a base matrix fixed, and reinforcement learning describes learning from actions and rewards. The factors can be trained with a supervised loss or used as the trainable parameters in a reinforcement-learning setup, so the adapter and the feedback signal are separate choices.",
            ),
            several(
              "Which of these does the small example on this page actually do?",
              [
                "It performs real policy updates",
                "It reproduces a run when a fresh policy is given the same seed",
                "It continues from the learned logits when training is called again on the same policy",
                "It reports the starting probabilities and no observations when given zero episodes",
              ],
              [0, 1, 2, 3],
              "All four hold. The updates are real, in an environment with one observation, deterministic rewards and one action per episode, and a run is reproducible because the random stream restarts at the seed. What the example does not do is train a navigation network, solve delayed credit assignment or fine-tune a language model, and the discounted-return helper illustrates the longer-episode calculation separately. A higher reward on this fixed junction measures progress on this fixed junction.",
            ),
            trueFalse(
              "Q-learning estimates the return associated with an action in a state and chooses from those estimates, rather than changing a policy’s parameters directly.",
              true,
              "Policy gradients are one family, changing the policy parameters in a direction estimated to improve expected return. Value-based methods such as Q-learning instead estimate the return of an action in a state and use those estimates to choose, and actor-critic methods combine a policy with a learned value estimate. Each adds machinery for problems the single-junction example removes.",
            ),
        ],
        },
        {
          title: "Practice. Run the Policy Updates With the Library",
          practice: [
            exercise(
              "Reproduce the single update of Part 3",
              ["Part 3 worked one update by hand. Start a policy from three zero logits, apply one REINFORCE step for a sampled Straight with a return of one and a learning rate of 0.1, and print the probabilities before, the gradient and the probabilities after, each to four places.", "The page arrived at probabilities near 0.322, 0.356 and 0.322 and a gradient of negative one third, two thirds and negative one third. Confirm both, then print the total of the three gradient entries, which the derivation in Part 3 says is zero."],
              `import numpy as np
from oop_ml.numpy.modern import SoftmaxPolicy

actions = ["Left", "Straight", "Right"]
policy = SoftmaxPolicy(np.zeros(3))
# Apply one update for Straight, which is action index 1, with a return
# of 1.0 and a learning rate of 0.1. Then print, for each action, the
# probability before, the gradient entry and the probability after, to
# four places, and finally the total of the three gradient entries.`,
              `import numpy as np
from oop_ml.numpy.modern import SoftmaxPolicy

actions = ["Left", "Straight", "Right"]
policy = SoftmaxPolicy(np.zeros(3))
update = policy.learn_from(1, 1.0, learning_rate=0.1)

for name, before, slope, after in zip(actions, update.before, update.gradient, update.after):
    print(f"{name:9s} before {before:.4f}  gradient {slope:+.4f}  after {after:.4f}")
print(f"gradient total {update.gradient.sum():.4f}")`,
              `Left      before 0.3333  gradient -0.3333  after 0.3220
Straight  before 0.3333  gradient +0.6667  after 0.3559
Right     before 0.3333  gradient -0.3333  after 0.3220
gradient total 0.0000`,
              { hints: ["learn_from takes the sampled action as an index into the three logits, then the return and the learning rate. It applies the step and answers an object describing it.", "That object carries before, gradient and after, each an array of three in the order Left, Straight, Right.", "The policy changes in place, so a second call to learn_from would continue from the new logits. Build a fresh policy if you want to start again from zeros."], check: numberCheck("What probability does the policy give Straight after the update?", 0.3559, 0.0005, "The gradient entry for Straight is one less its probability of a third, which is two thirds, and the learning rate of 0.1 adds a fifteenth to its logit while the other two logits fall by a thirtieth each. Softmax of those three logits puts about 0.356 on Straight. The three gradient entries add to zero, so the step moved probability toward Straight rather than raising every score.") },
            ),
            exercise(
              "Run the sixty episodes and then keep going",
              ["Part 5 says the snippet uses the same rewards and default settings as the live example. Train a fresh policy on the rewards 0.2, 1.0 and negative 1.0 for sixty episodes at a learning rate of 0.1 with seed zero, and print each action’s initial probability, final probability and the number of times it was sampled.", "Then call the training method again on the same policy with the same settings, and print where Straight’s probability starts and ends. The lesson says a second call continues from the learned logits rather than from zeros, and the figure it ends at is one the page does not quote."],
              `import numpy as np
from oop_ml.numpy.modern import SoftmaxPolicy

actions = ["Left", "Straight", "Right"]
rewards = np.array([0.2, 1.0, -1.0])
policy = SoftmaxPolicy(np.zeros(3))
# Train for sixty episodes at a learning rate of 0.1 with seed 0, and print
# each action's initial probability, final probability and sample count.
# Then train the same policy again with the same settings and print where
# Straight's probability starts and ends on that second call.`,
              `import numpy as np
from oop_ml.numpy.modern import SoftmaxPolicy

actions = ["Left", "Straight", "Right"]
rewards = np.array([0.2, 1.0, -1.0])
policy = SoftmaxPolicy(np.zeros(3))
run = policy.train_bandit(rewards, episodes=60, learning_rate=0.1, seed=0)

for name, start, end, times in zip(actions, run.initial, run.final, run.counts):
    print(f"{name:9s} initial {start:.4f}  final {end:.4f}  sampled {times:2d} times")

again = policy.train_bandit(rewards, episodes=60, learning_rate=0.1, seed=0)
print(f"second call starts Straight at {again.initial[1]:.4f} and ends at {again.final[1]:.4f}")`,
              `Left      initial 0.3333  final 0.1204  sampled 13 times
Straight  initial 0.3333  final 0.8264  sampled 38 times
Right     initial 0.3333  final 0.0532  sampled  9 times
second call starts Straight at 0.8264 and ends at 0.9295`,
              { hints: ["train_bandit takes the reward array, then episodes, learning_rate and seed as keywords. It answers a run holding initial, final and counts, each an array of three in the order Left, Straight, Right.", "counts holds integers, so format those entries with d rather than f.", "The policy keeps its logits between calls. The second run’s initial is therefore the first run’s final, which is the comparison the task asks for."], check: numberCheck("After the first sixty episodes, what probability does the policy give Straight?", 0.8264, 0.0005, "Straight pays one, the largest reward in the table, so each of the 38 episodes that sampled it raised its logit, while the nine blocked routes, paying negative one, pushed Right’s logit down and the thirteen slow deliveries, paying 0.2, raised Left’s only a little. The second call starts from that 0.8264 rather than from a third, which is the lesson’s claim that training again on the same policy continues from its learned logits.") },
            ),
            exercise(
              "Discount the three-step return more heavily",
              ["Part 2 worked the rewards negative one, negative one and five at a discount of 0.9 and found returns of 2.15, 3.5 and 5. Compute the return of every step at discounts of 1, 0.9 and 0.5 with the library’s helper, printing each to two places.", "Watch the first move. The lesson says the discount decides whether a costly first move is reinforced or discouraged, and at 0.5 its return changes sign."],
              `import numpy as np
from oop_ml.numpy.modern import discounted_returns

rewards = np.array([-1.0, -1.0, 5.0])
# For each discount of 1.0, 0.9 and 0.5, compute the returns and print the
# three of them on one line, each to two places.`,
              `import numpy as np
from oop_ml.numpy.modern import discounted_returns

rewards = np.array([-1.0, -1.0, 5.0])
for gamma in [1.0, 0.9, 0.5]:
    returns = discounted_returns(rewards, gamma=gamma)
    print(f"discount {gamma:.1f}  returns {returns[0]:.2f}, {returns[1]:.2f}, {returns[2]:.2f}")`,
              `discount 1.0  returns 3.00, 4.00, 5.00
discount 0.9  returns 2.15, 3.50, 5.00
discount 0.5  returns -0.25, 1.50, 5.00`,
              { hints: ["discounted_returns takes the reward array and gamma as a keyword, and answers one return per step, worked backward from the final reward.", "The final reward is terminal, so its return is itself at every discount. Only the earlier steps change."], check: numberCheck("What return does the first move receive at a discount of 0.5?", -0.25, 0.005, "At 0.5 the delivery two steps away is worth a quarter of its five by the time it reaches the first decision, and 1.25 does not cover the immediate cost of one plus the second cost discounted to a half. The same episode that gives the first move a return of 2.15 at 0.9 would discourage it at 0.5, which is why the discount belongs to the task’s definition.") },
            ),
            exercise(
              "Hand the policy a reward table of the wrong size",
              ["The bandit needs one reward per action, and the policy has three. Give the training method only two rewards and see what the library does. Then ask for an update on action index 3, which a three-action policy does not have.", "Neither call should answer anything. Catch what the library raises in each case and print its class name and its message, then print the probabilities to confirm the policy is still at equal thirds."],
              `import numpy as np
from oop_ml import MLLibError
from oop_ml.numpy.modern import SoftmaxPolicy

policy = SoftmaxPolicy(np.zeros(3))
# Try to train with the two rewards 0.2 and 1.0, then try learn_from with
# action 3 and a return of 1.0. Catch the library's own error each time and
# print the name of its class and its message. Finish by printing the
# policy's probabilities.`,
              `import numpy as np
from oop_ml import MLLibError
from oop_ml.numpy.modern import SoftmaxPolicy

policy = SoftmaxPolicy(np.zeros(3))
try:
    policy.train_bandit(np.array([0.2, 1.0]), episodes=60, learning_rate=0.1, seed=0)
except MLLibError as refusal:
    print(type(refusal).__name__, refusal)

try:
    policy.learn_from(3, 1.0, learning_rate=0.1)
except MLLibError as refusal:
    print(type(refusal).__name__, refusal)

print("probabilities after both refusals", np.round(policy.probabilities, 4))`,
              `ShapeMismatchError supply one reward per action
InvalidValuesError action is outside the policy
probabilities after both refusals [0.3333 0.3333 0.3333]`,
              { hints: ["Every refusal the library makes derives from one base class, so catching that one catches whichever specific refusal each call turns out to be.", "The reward table is checked against the number of logits before any episode is sampled, and the action index before any logit is touched, so neither refusal leaves a half-applied update behind."] },
            ),
          ],
        },
      ]}
    />
  );
}
