import { section, appendParts, functionTask, question } from './depth-helpers.mjs';

export function deepenTraining(lessons){
  const q=lessons.find(l=>l.id==='q-learning');
  appendParts(q,[
    section('Give the Environment and the Learner Different Jobs','One table update is not yet a learner. We need something that supplies experience and something that changes its estimates from that experience. In the greenhouse example the environment keeps track of whether a bed is dry or moist. The learner keeps the Q table.\n\nAn environment step receives an action and returns a next state, a reward and a flag saying whether the task ended. It does not return the correct action value. The learner must estimate that value by repeating the task. Keep these roles separate in the code so a known environment rule does not accidentally become the answer.', 'State rows: 0 = dry, 1 = moist\nAction columns: 0 = water, 1 = wait\nWater: next state moist, reward -1, not terminal\nWait while dry: next state dry, reward -2, not terminal\nWait while moist: reward 3, terminal','These are invented rewards for a tiny task. Reward measures the objective we wrote down, not a universal definition of good behaviour.'),
    section('Collect an Episode Instead of Replaying One Supplied Transition','At the start of an episode, reset the environment to dry while retaining the learned Q table. Choose an action, receive a transition, update the visited entry and continue until the task ends. This order matters: the next state used in the target is the state returned by the action just taken.\n\nUse a NumPy array of shape (2,2) for Q. Keep state and action as integer indices. A tuple returned by the environment keeps the next state, reward and terminal flag together. A list of episode returns can record how training changes over time without replacing the table.\n\nAn epsilon-greedy behaviour policy sometimes chooses an action uniformly at random and otherwise chooses the largest entry in the current row. Early mistakes supply information. The greedy action can change after an update, so choose again at every step.', 'For each episode:\n    state = initial state\n    choose action from the current Q row\n    next_state, reward, terminal = environment(state, action)\n    update only Q[state, action]\n    continue from next_state unless terminal','A training step cap prevents an endless toy episode. Reaching that cap is a truncation, not evidence that the environment returned a terminal state.'),
    section('Ask Whether Experience Changes a Later Decision','In the action widget, first water and then wait. The final reward changes the moist/wait entry. Begin another episode and water again. This time the target for the earlier action can use what was learned about the later opportunity. That is how delayed reward moves back through the table.\n\nRun the same experiment in code over many episodes. Inspect the policy, which is the action selected in each state, as well as the numerical entries. A large value for one action is not enough if the competing action has never been tried.', 'For the greedy two-step route, gamma = 0.9:\nReturn from moist/wait = 3\nReturn from dry/water = -1 + 0.9 × 3 = 1.7','The calculation provides an independent check for this deterministic environment. A learned table approaches these values through updates; the numbers are not assigned to it.'),
    section('Evaluate Without Quietly Continuing to Train','Freeze the table and choose greedy actions for evaluation. Do not update Q from those evaluation transitions. Record whether the episode finishes, its reward and its length. For this tiny task, the useful policy waters a dry bed and waits at a moist one.\n\nRepeat training with several seeds. In a stochastic environment, evaluate over multiple episodes too, because one lucky route can hide an unreliable policy. Compare with a simple policy such as always watering; a larger training return alone does not show that learning helped.\n\nA larger state space would make a table impractical. That is the motivation for learning a function that predicts action values. Before introducing a deep Q network, retain the same distinction between experience collection, target calculation and independent evaluation.',null,'The later model changes the representation of values. It does not remove the need to define the environment, explore and evaluate honestly.')
  ]);
  q.practice.push(functionTask('Can Botie learn the two-action greenhouse policy?',[
    'Implement learn_q(episodes, seed), returning a finite NumPy array with shape (2,2). Start at zeros and follow the state/action rules above. Use an epsilon-greedy behaviour policy with epsilon 0.2, learning rate 0.5 and discount 0.9. Break ties with np.argmax, reset to dry each episode, and allow at most 100 transitions per episode.',
    'Reject a nonpositive or non-integer episode count with ValueError. Use np.random.default_rng(seed) for every exploratory draw. Update only the visited entry; a true terminal transition has no continuation. Print the greedy actions after 600 episodes and the greedy action values to one decimal place.',
    'The supplied evaluate_greedy function then tests the frozen table without exploration or updates. Its printed return is the undiscounted sum of rewards, followed by episode length and whether it reached the terminal state. This return and a discounted Q value answer different questions.'
  ],`import numpy as np

def evaluate_greedy(Q):
    state=0
    total=0.
    for step in range(100):
        action=int(np.argmax(Q[state]))
        terminal=state==1 and action==1
        total+=3. if terminal else (-1. if action==0 else -2.)
        state=1 if action==0 else state
        if terminal: return [total,step+1,True]
    return [total,100,False]`,'def learn_q(episodes, seed):',
`    if not isinstance(episodes, (int,np.integer)) or isinstance(episodes,(bool,np.bool_)) or episodes<=0:
        raise ValueError('Use a positive integer episode count')
    rng=np.random.default_rng(seed)
    Q=np.zeros((2,2))
    for _ in range(episodes):
        state=0
        for step in range(100):
            action=int(rng.integers(2)) if rng.random()<.2 else int(np.argmax(Q[state]))
            terminal=state==1 and action==1
            next_state=1 if action==0 else state
            reward=3. if terminal else (-1. if action==0 else -2.)
            target=reward if terminal else reward+.9*Q[next_state].max()
            Q[state,action]+=.5*(target-Q[state,action])
            state=next_state
            if terminal: break
    return Q`,
`Q=learn_q(600,7)
print(np.argmax(Q,axis=1).tolist())
print(np.round(Q.max(axis=1),1).tolist())
print(evaluate_greedy(Q))`, '[0, 1]\n[1.7, 3.0]\n[2.0, 2, True]',[
    'The next state belongs to the environment. Read the continuation from that row, but write the correction to the row and action that produced the transition.',
    'Retain Q between episodes. Resetting Q would make every episode begin without the previous experience.'
  ],[
    ['Different seeds still learn a useful policy','for seed in [2,19,42]:\n    table=learn_q(800,seed)\n    assert isinstance(table,np.ndarray) and table.shape==(2,2)\n    assert np.isfinite(table).all()\n    np.testing.assert_array_equal(table.argmax(axis=1),[0,1])\n    np.testing.assert_allclose(table.max(axis=1),[1.7,3.],atol=.05)'],
    ['The same seed reproduces the table','np.testing.assert_array_equal(learn_q(80,11),learn_q(80,11))'],
    ['Invalid episode counts are rejected','for n in [0,-1,2.5,True]:\n    try: learn_q(n,3)\n    except ValueError: pass\n    else: raise AssertionError("Expected ValueError for invalid episode count")']
  ]));
  q.checkpoints=[{after:q.parts[5].title,title:'Questions on the Environment and the Episode',questions:[
    question('The previous episode has ended. Q contains the estimates learned so far.','What should be reset at the start of the next episode?',['The environment state; keep Q','Both the state and every Q entry','Only the random generator'],0,'Resetting the environment starts another attempt. Keeping Q lets that attempt use earlier experience.'),
    question('You are testing a policy on fresh episodes after training.','Which change would turn this into continued training?',['Updating Q after each evaluation transition','Recording episode returns','Choosing greedy actions'],0,'Evaluation measures the frozen procedure. Updating its estimates changes that procedure during the measurement.')
  ]}];
  const adam=lessons.find(l=>l.id==='adaptive-gradients');
  appendParts(adam,[
    section('Watch a Gradient Change Direction','The first update cannot show why Adam keeps a history. Give one weight a positive gradient, then a negative gradient. The first moment retains some of the old direction instead of changing instantly. The second moment retains squared magnitudes, so a sign change does not cancel it.\n\nWrite the two histories on separate rows. With beta1 equal to 0.5, a first gradient of two produces a first moment of one. A next gradient of minus two brings that moment below zero, but only partway towards the new gradient.', 'm₀ = 0\nm₁ = 0.5 × 0 + 0.5 × 2 = 1\nm₂ = 0.5 × 1 + 0.5 × (-2) = -0.5\n\nThe second moment uses 2² and (-2)², both 4.','A retained direction can disagree with the newest gradient. Inspect that disagreement before assuming the optimizer has made an arithmetic error.'),
    section('Compare the Whole Training Path','Choose a small quadratic loss with coordinates on different scales. Start each optimizer from the same weights and feed it the gradient at its own current position. Those gradients will diverge as the methods take different routes.\n\nRecord loss, parameter values and step size for every update. An adaptive method may make steadier progress on a badly scaled problem, but a badly chosen rate can still make it unstable. Compare several rates on training data and use separate validation behaviour when choosing a procedure for a prediction task.', 'Example loss: L(w) = 0.5 × (w₀² + 10 × w₁²)\nGradient: [w₀, 10 × w₁]','This is a controlled optimization example with a known minimum. It lets us check state handling before blaming a dataset or architecture.'),
    section('Resume the Same Optimizer, Not Just the Same Weights','Saving weights preserves the model’s current prediction rule. Continuing Adam also requires its first moment, second moment and update count. If any are reset, the next update follows a different history.\n\nStore arrays as arrays of the original shape, and restore the counter as an integer. A checkpoint should also state the learning rate, retention factors and epsilon convention. Compare an uninterrupted run with a run stopped and resumed midway. Their next weights should agree within numerical tolerance.',null,'A restart is a useful behavioural test because the final printed output alone can hide an accidental reset of the optimizer state.')
  ]);
  adam.practice.push(functionTask('Can your Adam update resume without changing its path?',[
    'Write adam_step(w, g, m, v, t, rate=0.05). Here t is the number of completed updates. Return new weights, new first moments, new second moments and the incremented count. Use beta1=0.9, beta2=0.999 and epsilon=1e-8 outside the square root. Do not modify the input arrays.',
    'Complete the two-step example below. The additional tests compare multiple updates against an independently computed recurrence and check that retaining the returned state reproduces an uninterrupted run.'
  ],'import numpy as np','def adam_step(w, g, m, v, t, rate=0.05):',
`    t=t+1
    m=.9*m+.1*g
    v=.999*v+.001*g*g
    corrected_m=m/(1-.9**t)
    corrected_v=v/(1-.999**t)
    w=w-rate*corrected_m/(np.sqrt(corrected_v)+1e-8)
    return w,m,v,t`,
`w=np.array([1.,-1.]); m=np.zeros(2); v=np.zeros(2); t=0
for g in [np.array([2.,-4.]),np.array([-1.,2.])]:
    w,m,v,t=adam_step(w,g,m,v,t)
print(t)
print(np.round(w,4).tolist())`, '2\n[0.9367, -0.9367]',[
    'The next count is used in both bias-correction denominators. The stored moments remain uncorrected between calls.',
    'Return new arrays rather than changing w, m or v in place. A caller may keep the previous state for comparison.'
  ],[
    ['Changing gradients follow the full recurrence','w=np.array([2.,-3.]); m=np.zeros(2); v=np.zeros(2); t=0\na=w.copy(); b=m.copy(); c=v.copy()\nfor n,g in enumerate([np.array([1.,4.]),np.array([-2.,0.]),np.array([3.,-1.])],1):\n    w,m,v,t=adam_step(w,g,m,v,t,.02)\n    b=.9*b+.1*g; c=.999*c+.001*g*g\n    a=a-.02*(b/(1-.9**n))/(np.sqrt(c/(1-.999**n))+1e-8)\n    assert t==n\n    np.testing.assert_allclose(w,a,rtol=1e-7)\n    np.testing.assert_allclose(m,b)\n    np.testing.assert_allclose(v,c)'],
    ['Input states stay available for inspection','w=np.array([2.,3.]); g=np.array([1.,-1.]); m=np.zeros(2); v=np.zeros(2)\nsaved=[a.copy() for a in [w,g,m,v]]\nadam_step(w,g,m,v,0)\nfor actual,old in zip([w,g,m,v],saved): np.testing.assert_array_equal(actual,old)'],
    ['A saved state reproduces the next update','state=(np.array([4.]),np.zeros(1),np.zeros(1),0)\nstate=adam_step(*state[:1],np.array([2.]),*state[1:])\nsaved=tuple(value.copy() if isinstance(value,np.ndarray) else value for value in state)\na=adam_step(state[0],np.array([-3.]),state[1],state[2],state[3])\nb=adam_step(saved[0],np.array([-3.]),saved[1],saved[2],saved[3])\nfor actual,expected in zip(a,b): np.testing.assert_allclose(actual,expected)']
  ]));
}
