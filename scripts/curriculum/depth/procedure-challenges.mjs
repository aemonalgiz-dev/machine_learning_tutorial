import { functionTask } from '../depth-helpers.mjs';
const reject = expression => `try:\n    ${expression}\nexcept ValueError:\n    pass\nelse:\n    raise AssertionError('Expected ValueError for an invalid input')`;
const task = (title, instructions, signature, body, demo, output, hints, tests) => functionTask(title, instructions, 'import numpy as np', signature, body, demo, output, hints, tests);

export default {
 'numpy-functions': [task('Can one transformation serve any valid batch?',
  ['Write standardise(X, mean, scale). X is a finite two-dimensional numerical table; mean and scale are finite one-dimensional arrays with one entry per column. Scales must be positive. Return a new floating-point array without changing any input. Raise ValueError when those requirements fail.', 'Subtract the saved means and divide by the saved scales. An empty batch with the correct number of columns is valid. Print the demonstration result as a nested list.'],
  'def standardise(X, mean, scale):', `    X = np.asarray(X, dtype=float)
    mean = np.asarray(mean, dtype=float)
    scale = np.asarray(scale, dtype=float)
    if X.ndim != 2 or mean.shape != (X.shape[1],) or scale.shape != mean.shape:
        raise ValueError('Wrong feature layout')
    if not np.isfinite(X).all() or not np.isfinite(mean).all() or not np.isfinite(scale).all() or np.any(scale <= 0):
        raise ValueError('Finite values and positive scales required')
    return (X-mean)/scale`,
  'print(standardise([[12.,60.],[8.,40.]], [10.,50.], [2.,10.]).tolist())', '[[1.0, 1.0], [-1.0, -1.0]]',
  ['Inspect dimensions before broadcasting.', 'A subtraction expression creates a separate result; in-place subtraction would change the caller\'s array.'],
  [['Unequal dimensions and batch agreement', 'X=np.array([[1.,2.,3.],[4.,5.,6.]])\nm=np.array([1.,1.,1.]); s=np.array([1.,2.,5.])\nassert np.allclose(standardise(X,m,s), [[0,.5,.4],[3,2,1]])\nassert np.allclose(standardise(X,m,s), np.concatenate([standardise(row[None,:],m,s) for row in X]))'], ['Preserve inputs and empty batches', 'X=np.array([[2.,4.]])\nsaved=X.copy()\nstandardise(X,[1,2],[1,2])\nassert np.array_equal(X,saved)\nassert standardise(np.empty((0,2)),[1,2],[1,2]).shape==(0,2)'], ['Reject a zero scale', reject('standardise([[1,2]], [0,0], [1,0])')], ['Reject incorrect means', reject('standardise([[1,2]], [0], [1,1])')]])],
 'missing-measurements': [task('Can you fill a new table without learning from it?',
  ['Write fill_missing(X, reference). X is a two-dimensional float-compatible table whose missing entries are NaN. reference is a finite vector with one saved replacement per column. Return the filled table and a Boolean missingness table. Preserve X.', 'Reject infinite input values, non-finite references and incompatible shapes with ValueError. Print both demonstration arrays as lists.'],
  'def fill_missing(X, reference):', `    X = np.asarray(X, dtype=float)
    reference = np.asarray(reference, dtype=float)
    if X.ndim != 2 or reference.shape != (X.shape[1],):
        raise ValueError('Wrong feature layout')
    if np.isinf(X).any() or not np.isfinite(reference).all():
        raise ValueError('Invalid measurements or reference')
    missing = np.isnan(X)
    return np.where(missing, reference, X), missing`,
  'filled, missing = fill_missing([[30.,np.nan],[np.nan,60.]], [12.,50.])\nprint(filled.tolist())\nprint(missing.tolist())', '[[30.0, 50.0], [12.0, 60.0]]\n[[False, True], [True, False]]',
  ['Find NaN positions before filling them.', 'Broadcast only the saved reference; do not calculate a new incoming mean.'],
  [['Changed incoming values keep the same replacement', 'a,m=fill_missing([[999.,np.nan]], [4.,7.])\nassert np.array_equal(a,[[999,7]]) and np.array_equal(m,[[False,True]])'], ['Preserve NaNs in the original', 'X=np.array([[np.nan,2.]])\nfill_missing(X,[1,1])\nassert np.isnan(X[0,0]) and X[0,1]==2'], ['Reject infinity', reject('fill_missing([[np.inf]], [1])')], ['Reject a missing reference', reject('fill_missing([[np.nan]], [np.nan])')]])],
 'naive-bayes': [task('Can a fitted sign model score several new sensors?',
  ['Write bernoulli_probabilities(X, rate, prior). X contains binary rows; rate has one row per class and one probability per feature; prior has one strictly positive probability per class and sums to one. Require finite rates strictly between zero and one, compatible shapes, and at least one class and feature. Return one normalised class-probability row per sensor.', 'Use log scores and stable normalisation. Raise ValueError for invalid inputs. Print the demonstration probabilities rounded to four places.'],
  'def bernoulli_probabilities(X, rate, prior):', `    X, rate, prior = np.asarray(X), np.asarray(rate, dtype=float), np.asarray(prior, dtype=float)
    if X.ndim != 2 or rate.ndim != 2 or rate.shape[0] < 1 or rate.shape[1] < 1 or X.shape[1] != rate.shape[1] or prior.shape != (rate.shape[0],):
        raise ValueError('Incompatible model tables')
    if not np.isin(X,[0,1]).all() or not np.isfinite(rate).all() or np.any((rate<=0)|(rate>=1)) or not np.isfinite(prior).all() or np.any(prior<=0) or not np.isclose(prior.sum(),1):
        raise ValueError('Invalid probabilities or signs')
    score = X@np.log(rate).T + (1-X)@np.log1p(-rate).T + np.log(prior)
    weight = np.exp(score-score.max(axis=1, keepdims=True))
    return weight/weight.sum(axis=1, keepdims=True)`,
  'print(np.round(bernoulli_probabilities([[1,0],[0,1]], [[.2,.3],[.8,.7]], [.5,.5]),4).tolist())', '[[0.3684, 0.6316], [0.6316, 0.3684]]',
  ['Absent signs contribute log(1-rate).', 'Normalise across classes separately for every sensor.'],
  [['Match independent direct products', 'r=np.array([[.1,.4],[.6,.8],[.3,.5]]); prior=np.array([.2,.3,.5]); X=np.array([[0,0],[1,1],[0,1]])\nraw=np.array([prior*np.prod(np.where(row,r,1-r),axis=1) for row in X])\nassert np.allclose(bernoulli_probabilities(X,r,prior),raw/raw.sum(axis=1,keepdims=True))'], ['Many unlikely signs remain finite', 'out=bernoulli_probabilities(np.ones((1,2000)), np.array([[.01]*2000,[.02]*2000]),[.5,.5])\nassert np.isfinite(out).all() and np.allclose(out.sum(axis=1),1) and out[0,1]>.99'], ['Reject zero rates', reject('bernoulli_probabilities([[1]], [[0],[.5]], [.5,.5])')]])],
 'density-based-clustering': [task('Can you finish the clustering after finding the cores?',
  ['Write density_labels(x, radius, minimum) for a finite one-dimensional array, a positive radius and a positive integer minimum. Include each point itself and neighbours exactly at the radius. Start clusters in input order and label them from zero. Noise is minus one.', 'Expand only through core points. A border point reachable from several clusters keeps the first assignment. Return an integer label array and preserve x. Empty input returns an empty array. Raise ValueError for invalid inputs. Print the demonstration labels.'],
  'def density_labels(x, radius, minimum):', `    x = np.asarray(x, dtype=float)
    if x.ndim != 1 or not np.isfinite(x).all() or not np.isfinite(radius) or radius <= 0 or isinstance(minimum, bool) or not isinstance(minimum, (int,np.integer)) or minimum < 1:
        raise ValueError('Invalid positions or neighbourhood rule')
    near = np.abs(x[:,None]-x[None,:]) <= radius
    core = near.sum(axis=1) >= minimum
    labels = np.full(len(x), -1, dtype=int)
    cluster = 0
    for start in range(len(x)):
        if not core[start] or labels[start] >= 0:
            continue
        labels[start] = cluster
        frontier = [start]
        while frontier:
            current = frontier.pop()
            for nxt in np.flatnonzero(near[current]):
                if labels[nxt] < 0:
                    labels[nxt] = cluster
                    if core[nxt]:
                        frontier.append(int(nxt))
        cluster += 1
    return labels`,
  'print(density_labels([0.,.1,.2,.4,2.], .21, 3).tolist())', '[0, 0, 0, 0, -1]',
  ['Build the radius table and core mask first.', 'An assigned border point joins the cluster but does not add its own neighbours to the frontier.'],
  [['Two regions and noise', 'assert np.array_equal(density_labels([0,.1,.2,2,2.1,2.2,9],.25,3),[0,0,0,1,1,1,-1])'], ['A border cannot extend a sparse chain', 'assert np.array_equal(density_labels([0,.05,.1,.3,.52],.21,3),[0,0,0,0,-1])'], ['Duplicates, empty input and preservation', 'x=np.array([1.,1.,3.]); saved=x.copy()\nassert np.array_equal(density_labels(x,.1,2),[0,0,-1])\nassert np.array_equal(x,saved) and density_labels([],1,1).size==0'], ['Reject an invalid radius', reject('density_labels([1,2], 0, 2)')]])],
 'hidden-state-filtering': [task('Can the pump retain its belief across any valid report sequence?',
  ['Write filter_reports(initial, transition, likelihoods). initial is a probability vector. transition is a square row-stochastic matrix. Each likelihood row contains the nonnegative likelihood of one successive report under each state, with values at most one. Return the posterior belief after every report.', 'Predict with belief @ transition, multiply by the report likelihood and normalise. Reject incompatible shapes, invalid probability inputs and a report with zero predictive probability using ValueError. An empty report table returns shape (0, number_of_states). Print the demonstration history rounded to four places.'],
  'def filter_reports(initial, transition, likelihoods):', `    belief = np.asarray(initial, dtype=float).copy()
    transition = np.asarray(transition, dtype=float)
    likelihoods = np.asarray(likelihoods, dtype=float)
    n = belief.size
    if belief.ndim != 1 or n == 0 or transition.shape != (n,n) or likelihoods.ndim != 2 or likelihoods.shape[1] != n:
        raise ValueError('Incompatible state shapes')
    if any(not np.isfinite(a).all() or np.any(a<0) or np.any(a>1) for a in [belief,transition,likelihoods]) or not np.isclose(belief.sum(),1) or not np.allclose(transition.sum(axis=1),1):
        raise ValueError('Invalid probabilities')
    history = []
    for likelihood in likelihoods:
        weight = (belief@transition)*likelihood
        total = weight.sum()
        if total <= 0:
            raise ValueError('Report has zero probability')
        belief = weight/total
        history.append(belief.copy())
    return np.array(history).reshape(-1,n)`,
  'print(np.round(filter_reports([.5,.5], np.eye(2), [[.2,.8],[.5,.5]]),4).tolist())', '[[0.2, 0.8], [0.2, 0.8]]',
  ['A report changes the relative weights after the transition.', 'Save a copy of each posterior before processing the next report.'],
  [['Transitions precede observation', 'out=filter_reports([1,0],[[.75,.25],[.2,.8]],[[1,1]])\nassert np.allclose(out,[[.75,.25]])'], ['Three-state model and input preservation', 'initial=np.array([.2,.3,.5]); saved=initial.copy()\nout=filter_reports(initial,np.eye(3),[[1,0,1]])\nassert np.allclose(out,[[2/7,0,5/7]]) and np.array_equal(initial,saved)\nassert filter_reports(initial,np.eye(3),np.empty((0,3))).shape==(0,3)'], ['Reject an impossible report', reject('filter_reports([1,0],np.eye(2),[[0,1]])')], ['Reject a non-stochastic transition', reject('filter_reports([1,0],[[1,1],[0,1]],[[1,1]])')]])],
 'lagged-features': [task('Can you build lag rows for a chosen horizon?',
  ['Write lag_table(y, lags, horizon). y is a finite one-dimensional numerical series; lags and horizon are positive integers. Each row contains lags consecutive observations from oldest to newest. Its target lies horizon positions after the newest input.', 'Return the two-dimensional input table and one-dimensional targets. Require enough observations for at least one row, preserve y and raise ValueError for invalid input. Print the demonstration arrays as lists.'],
  'def lag_table(y, lags, horizon):', `    y = np.asarray(y, dtype=float)
    if y.ndim != 1 or not np.isfinite(y).all() or any(isinstance(v,bool) or not isinstance(v,(int,np.integer)) or v < 1 for v in [lags,horizon]):
        raise ValueError('Invalid series or window')
    count = len(y)-lags-horizon+1
    if count < 1:
        raise ValueError('Insufficient history')
    X = np.array([y[start:start+lags] for start in range(count)])
    target = np.array([y[start+lags+horizon-1] for start in range(count)])
    return X, target`,
  'X, y = lag_table([3,5,8,12,17,23], 2, 2)\nprint(X.tolist())\nprint(y.tolist())', '[[3.0, 5.0], [5.0, 8.0], [8.0, 12.0]]\n[12.0, 17.0, 23.0]',
  ['The newest input is at start + lags - 1.', 'Add horizon to that position to locate its target.'],
  [['One-step and long-horizon alignment', 'X,y=lag_table([1,4,9,16,25],1,3)\nassert np.array_equal(X,[[1],[4]]) and np.array_equal(y,[16,25])\nX,y=lag_table([1,4,9,16],3,1)\nassert np.array_equal(X,[[1,4,9]]) and np.array_equal(y,[16])'], ['Independent output storage', 'source=np.arange(5.,dtype=float)\nX,y=lag_table(source,2,1)\nX[0,0]=99; y[0]=99\nassert np.array_equal(source,np.arange(5.))'], ['Reject an unavailable target', reject('lag_table([1,2],2,1)')], ['Reject a zero horizon', reject('lag_table([1,2,3],1,0)')]])],
 'discounted-returns': [task('Can you distinguish a terminal end from a truncated rollout?',
  ['Write returns_from(rewards, discount, continuation=0). rewards is a finite one-dimensional sequence; discount is finite and between zero and one; continuation is a finite estimate immediately after the last reward. Return one discounted return per reward without changing rewards.', 'Use continuation zero for a true terminal end. A truncated continuing rollout may supply a nonzero continuation. Empty rewards return an empty array. Raise ValueError for invalid inputs. Print both demonstration paths.'],
  'def returns_from(rewards, discount, continuation=0):', `    rewards = np.asarray(rewards, dtype=float)
    if rewards.ndim != 1 or not np.isfinite(rewards).all() or not np.isfinite(discount) or not 0 <= discount <= 1 or not np.isfinite(continuation):
        raise ValueError('Invalid return inputs')
    result = np.empty_like(rewards)
    future = float(continuation)
    for t in range(len(rewards)-1,-1,-1):
        future = rewards[t] + discount*future
        result[t] = future
    return result`,
  'print(returns_from([1,2], .5).tolist())\nprint(returns_from([1,2], .5, 4).tolist())', '[2.0, 2.0]\n[3.0, 4.0]',
  ['Initialise the backward accumulator with the supplied continuation.', 'The continuation is discounted once when moving back through the last reward.'],
  [['Compare with direct sums', 'r=np.array([2.,-1.,3.]); gamma=.8; tail=4.\nexpected=[sum(gamma**(j-i)*r[j] for j in range(i,len(r)))+gamma**(len(r)-i)*tail for i in range(len(r))]\nassert np.allclose(returns_from(r,gamma,tail),expected)'], ['Boundary discounts and empty input', 'assert np.array_equal(returns_from([2,3],0,99),[2,3])\nassert np.array_equal(returns_from([2,3],1,4),[9,7])\nassert returns_from([], .5).size==0'], ['Reject invalid discount', reject('returns_from([1],1.2)')]])],
 'bellman-value-iteration': [task('Can you plan with stochastic transitions?',
  ['Write value_iteration(reward, transition, discount). reward has shape (states, actions), transition has shape (states, actions, next_states), and each transition row sums to one. Both arrays must be finite, transition entries nonnegative, and discount must be in [0,1). Return a value vector and greedy action indices.', 'Start values at zero and use synchronous sweeps. Stop below a maximum change of 1e-10 or after 10000 sweeps. Raise ValueError for invalid shapes or values; raise RuntimeError if the limit is reached. Break action ties with the lowest index. Print values rounded to four places and the policy.'],
  'def value_iteration(reward, transition, discount):', `    reward = np.asarray(reward, dtype=float)
    transition = np.asarray(transition, dtype=float)
    if reward.ndim != 2 or min(reward.shape) < 1 or transition.shape != (*reward.shape,reward.shape[0]):
        raise ValueError('Incompatible model shapes')
    if not np.isfinite(reward).all() or not np.isfinite(transition).all() or np.any(transition<0) or not np.allclose(transition.sum(axis=2),1) or not np.isfinite(discount) or not 0 <= discount < 1:
        raise ValueError('Invalid model or discount')
    value = np.zeros(reward.shape[0])
    for _ in range(10000):
        action_value = reward + discount*(transition@value)
        updated = action_value.max(axis=1)
        change = np.max(np.abs(updated-value))
        value = updated
        if change < 1e-10:
            return value, (reward+discount*(transition@value)).argmax(axis=1)
    raise RuntimeError('Iteration limit reached')`,
  'v, policy = value_iteration([[0.,1.],[2.,0.]], [[[1,0],[0,1]],[[0,1],[1,0]]], .5)\nprint(np.round(v,4).tolist())\nprint(policy.tolist())', '[3.0, 4.0]\n[1, 0]',
  ['Multiplying the transition tensor by the old value vector produces one continuation per state and action.', 'Extract the policy using the final value vector.'],
  [['Stochastic policy agrees with an independent linear solve', 'R=np.array([[1.],[2.]])\nP=np.array([[[.5,.5]],[[.25,.75]]])\nv,policy=value_iteration(R,P,.8)\nexpected=np.linalg.solve(np.eye(2)-.8*P[:,0,:],R[:,0])\nassert np.allclose(v,expected) and np.array_equal(policy,[0,0])'], ['Zero discount and ties', 'v,p=value_iteration([[3,3]],[[[1],[1]]],0)\nassert np.array_equal(v,[3]) and np.array_equal(p,[0])'], ['Reject missing transition mass', reject('value_iteration([[1]], [[[.2]]], .5)')], ['Reject undiscounted task', reject('value_iteration([[1]], [[[1]]], 1)')]])],
 'graph-convolution': [task('Can you prepare any valid undirected graph for mixing?',
  ['Write normalised_graph(A). A is a nonempty square, finite, symmetric, nonnegative adjacency matrix with a zero diagonal. Add one self-loop per node, compute degrees from that augmented matrix, and return the symmetric degree-normalised matrix.', 'Preserve A and reject violations with ValueError. An isolated node is valid and should retain its own value through its self-loop. Print the demonstration matrix rounded to four places.'],
  'def normalised_graph(A):', `    A = np.asarray(A, dtype=float)
    if A.ndim != 2 or A.shape[0] == 0 or A.shape[0] != A.shape[1] or not np.isfinite(A).all() or np.any(A<0) or not np.allclose(A,A.T) or np.any(np.diag(A)!=0):
        raise ValueError('Expected a simple undirected weighted adjacency')
    augmented = A + np.eye(len(A))
    degree = augmented.sum(axis=1)
    return augmented/np.sqrt(degree[:,None]*degree[None,:])`,
  'print(np.round(normalised_graph([[0,1,0],[1,0,0],[0,0,0]]),4).tolist())', '[[0.5, 0.5, 0.0], [0.5, 0.5, 0.0], [0.0, 0.0, 1.0]]',
  ['Use the augmented graph when calculating degrees.', 'The denominator for entry i,j combines the degree of i with the degree of j.'],
  [['Unequal degrees and weighted edges', 'A=np.array([[0.,2.,0.],[2.,0.,1.],[0.,1.,0.]])\nB=A+np.eye(3); D=np.diag(1/np.sqrt(B.sum(axis=1)))\nassert np.allclose(normalised_graph(A),D@B@D)'], ['Permutation equivariance and preservation', 'A=np.array([[0.,1.,0.],[1.,0.,1.],[0.,1.,0.]]); old=A.copy(); order=[2,0,1]\nassert np.allclose(normalised_graph(A[np.ix_(order,order)]),normalised_graph(A)[np.ix_(order,order)])\nassert np.array_equal(A,old)'], ['Reject directed adjacency', reject('normalised_graph([[0,1],[0,0]])')], ['Reject existing self-loops', reject('normalised_graph([[1]])')]])],
 'attention': [task('Can masked attention handle every permitted query row?',
  ['Write masked_attention(scores, values, allowed). scores is a finite (queries, keys) table; values is a finite (keys, features) table; allowed is a Boolean table matching scores. Every query must allow at least one key, and both tables must have positive dimensions.', 'Apply stable softmax only over allowed keys and return the weighted value table. Preserve inputs and raise ValueError for invalid layouts, non-Boolean masks or an all-masked query. Print the demonstration output rounded to four places.'],
  'def masked_attention(scores, values, allowed):', `    scores = np.asarray(scores, dtype=float)
    values = np.asarray(values, dtype=float)
    allowed = np.asarray(allowed)
    if scores.ndim != 2 or values.ndim != 2 or min(scores.shape) < 1 or min(values.shape) < 1 or scores.shape[1] != values.shape[0] or allowed.shape != scores.shape or allowed.dtype != bool:
        raise ValueError('Incompatible attention inputs')
    if not np.isfinite(scores).all() or not np.isfinite(values).all() or not allowed.any(axis=1).all():
        raise ValueError('Invalid score or all-masked query')
    masked = np.where(allowed,scores,-np.inf)
    weight = np.exp(masked-masked.max(axis=1,keepdims=True))
    weight /= weight.sum(axis=1,keepdims=True)
    return weight@values`,
  'print(np.round(masked_attention([[0,0,9],[1,2,3]], [[2,0],[0,6],[8,8]], [[True,True,False],[False,False,True]]),4).tolist())', '[[1.0, 3.0], [8.0, 8.0]]',
  ['Exclude unavailable scores before finding the row maximum.', 'Normalise on the key axis, then multiply by values.'],
  [['Excluded values cannot change an answer', 's=np.array([[1000.,1001.,9000.]])\nv=np.array([[1.],[3.],[999.]])\nm=np.array([[True,True,False]])\nexpected=(1+3*np.e)/(1+np.e)\nassert np.allclose(masked_attention(s,v,m),[[expected]])\nv[2]=100000\nassert np.allclose(masked_attention(s,v,m),[[expected]])'], ['Independent query rows', 'assert np.allclose(masked_attention([[0,0],[0,0]],[[2],[4]],[[True,False],[False,True]]),[[2],[4]])'], ['Reject an all-masked query', reject('masked_attention([[1,2]],[[1],[2]],[[False,False]])')], ['Reject a numeric mask', reject('masked_attention([[1]],[[1]],[[1]])')]])],
 'next-token-prediction': [task('Can you fit the token transitions without crossing documents?',
  ['Write bigram_table(documents, vocabulary_size, smoothing). documents is a sequence of one-dimensional integer token sequences; token IDs must be in range. vocabulary_size is a positive integer and smoothing is finite and positive. Empty documents are valid.', 'Start every transition count at smoothing, count adjacent pairs within each document only, and return a row-normalised probability table. Raise ValueError for invalid IDs or settings. Print the demonstration probabilities rounded to four places.'],
  'def bigram_table(documents, vocabulary_size, smoothing):', `    if isinstance(vocabulary_size,bool) or not isinstance(vocabulary_size,(int,np.integer)) or vocabulary_size < 1 or not np.isfinite(smoothing) or smoothing <= 0:
        raise ValueError('Invalid vocabulary or smoothing')
    count = np.full((vocabulary_size,vocabulary_size), float(smoothing))
    for document in documents:
        ids = np.asarray(document)
        if ids.ndim != 1 or (ids.size and (not np.issubdtype(ids.dtype,np.integer) or np.any(ids<0) or np.any(ids>=vocabulary_size))):
            raise ValueError('Invalid token IDs')
        if ids.size > 1:
            np.add.at(count,(ids[:-1],ids[1:]),1)
    return count/count.sum(axis=1,keepdims=True)`,
  'print(np.round(bigram_table([[0,1,1],[1,2]],3,1),4).tolist())', '[[0.25, 0.5, 0.25], [0.2, 0.4, 0.4], [0.3333, 0.3333, 0.3333]]',
  ['Count pairs separately inside each document.', 'Repeated transitions must accumulate, including repeated self-transitions.'],
  [['Document boundaries do not invent transitions', 'assert np.allclose(bigram_table([[0],[1]],2,1),np.full((2,2),.5))'], ['Repeated transitions and unused rows', 'p=bigram_table([[0,0,0,0],[]],2,.5)\nassert np.allclose(p[0],[3.5/4,.5/4]) and np.allclose(p[1],[.5,.5])'], ['Reject out-of-range IDs', reject('bigram_table([[0,2]],2,1)')], ['Reject fractional IDs', reject('bigram_table([[0.,1.]],2,1)')]])],
 'supervised-fine-tuning': [task('Can you score only the intended response targets?',
  ['Write response_loss(logits, targets, mask). logits has shape (positions, vocabulary), targets is an integer vector with one valid ID per position, and mask is a Boolean vector selecting scored targets. Require finite logits, compatible nonempty dimensions and at least one selected target.', 'Return the mean negative log probability over selected positions, using stable log normalisation. Raise ValueError for invalid inputs. Print the demonstration loss with four decimal places.'],
  'def response_loss(logits, targets, mask):', `    logits = np.asarray(logits, dtype=float)
    targets, mask = np.asarray(targets), np.asarray(mask)
    if logits.ndim != 2 or min(logits.shape) < 1 or targets.shape != (len(logits),) or mask.shape != targets.shape or mask.dtype != bool or not np.issubdtype(targets.dtype,np.integer):
        raise ValueError('Incompatible target layout')
    if not np.isfinite(logits).all() or np.any(targets<0) or np.any(targets>=logits.shape[1]) or not mask.any():
        raise ValueError('Invalid target or empty objective')
    shifted = logits-logits.max(axis=1,keepdims=True)
    log_probability = shifted-np.log(np.exp(shifted).sum(axis=1,keepdims=True))
    return float(-log_probability[np.arange(len(targets)),targets][mask].mean())`,
  "print(f'{response_loss([[1000.,1000.],[0.,np.log(3.)]],[0,1],[False,True]):.4f}')", '0.2877',
  ['Subtract each row maximum before exponentiating.', 'Gather target log probabilities, select by the shifted-target mask, then average.'],
  [['Unscored prompt logits do not affect loss', 'a=response_loss([[0,100],[0,0]],[0,1],[False,True])\nb=response_loss([[999,-999],[0,0]],[0,1],[False,True])\nassert np.isclose(a,np.log(2)) and np.isclose(a,b)'], ['Large-score stability and token averaging', 'assert np.isclose(response_loss([[1000,1000,1000],[0,0,0]],[0,2],[True,True]),np.log(3))'], ['Reject an all-masked objective', reject('response_loss([[0,0]],[0],[False])')], ['Reject out-of-range targets', reject('response_loss([[0,0]],[2],[True])')]])],
 'low-rank-adaptation': [task('Can you differentiate both adapter factors?',
  ['Write adapter_gradients(X, A, B, upstream, scale). The row-input adapter is scale * X @ A @ B. X has shape (batch, inputs), A is (inputs, rank), B is (rank, outputs), and upstream is the derivative of the scalar loss with respect to the adapter output.', 'Return dA and dB without changing inputs. Require finite two-dimensional compatible arrays with positive dimensions and a finite scale; raise ValueError otherwise. Do not average the gradients again: upstream already carries the loss convention. Print both demonstration gradients.'],
  'def adapter_gradients(X, A, B, upstream, scale):', `    X,A,B,upstream = [np.asarray(v,dtype=float) for v in [X,A,B,upstream]]
    if any(v.ndim != 2 or min(v.shape) < 1 or not np.isfinite(v).all() for v in [X,A,B,upstream]) or X.shape[1] != A.shape[0] or A.shape[1] != B.shape[0] or upstream.shape != (X.shape[0],B.shape[1]) or not np.isfinite(scale):
        raise ValueError('Incompatible adapter inputs')
    return scale*X.T@(upstream@B.T), scale*(X@A).T@upstream`,
  'dA,dB = adapter_gradients([[1,2]],[[1],[1]],[[2]],[[3]],.5)\nprint(dA.tolist())\nprint(dB.tolist())', '[[3.0], [6.0]]\n[[4.5]]',
  ['Differentiate the final matrix product first.', 'Use the old A and B for both gradients.'],
  [['Finite differences for every factor entry', 'X=np.array([[1.,2.],[-1.,.5]]); A=np.array([[.2,.1],[.3,-.4]]); B=np.array([[.5],[-.2]]); U=np.array([[2.],[-1.]])\ndA,dB=adapter_gradients(X,A,B,U,.7)\nfor matrix,gradient in [(A,dA),(B,dB)]:\n    for index in np.ndindex(matrix.shape):\n        old=matrix[index]; eps=1e-6\n        matrix[index]=old+eps; plus=np.sum((.7*X@A@B)*U)\n        matrix[index]=old-eps; minus=np.sum((.7*X@A@B)*U)\n        matrix[index]=old\n        assert np.isclose(gradient[index],(plus-minus)/(2*eps))'], ['Zero-initialised output factor', 'dA,dB=adapter_gradients([[1,2]],[[.1],[.2]],[[0]],[[3]],1)\nassert np.allclose(dA,0) and np.allclose(dB,[[1.5]])'], ['Reject incorrect upstream shape', reject('adapter_gradients([[1]],[[1]],[[1]],[[1,2]],1)')]])],
};
