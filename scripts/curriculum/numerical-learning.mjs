import { lesson,p,example,history,before,table,challenge,construction,sample,s,op,c,q,tf,journey,diagnose,predict,connection,fresh } from './applied-authoring.mjs';

const section = 'Numerical Methods for Learning';
const safeScale = value => op('numericalNonzeroScale', value);
const scaledVector = op('divide', s('vector'), safeScale(op('maximum', op('absolute', s('vector')))));
const unitVector = op('divide', scaledVector, safeScale(op('root', op('total', op('square', scaledVector)))));

const stableNormalisation = lesson({
  id:'numerical-stable-normalisation', title:'A Finite Vector Broke Our Normalisation', section,
  topic:'Where a fitted number can mislead',
  blurb:"The encoder returns a larger version of the same direction, and the calculation loses it. Follow the intermediate values to see where that information disappeared.",
  openingTitle:'Why Did Two Ordinary Directions Become Zero?',
  opening:["Botie compares a query with documents represented by lists of numerical coordinates, called vectors. For this comparison we care about their direction while setting aside their overall size. The small example works. Then the encoder, the model producing those coordinates, returns much larger components, and the same calculation produces zeros.","The direction did not disappear from the input. We lost it while trying to calculate the vector’s length. Let’s follow those operations before deciding that the model gave us a useless result."],
  prerequisites:[before('Directions and similarity','distance-and-similarity'),before('Arrays and their data types','numpy-arrays')],
  outputLabel:'Direction vector after safe normalisation', checkpointTitle:'Which intermediate operation lost the information?',
  history:history("Why a Correct Formula Can Lose Its Answer", [{"title":"David Goldberg: What Every Computer Scientist Should Know About Floating-Point Arithmetic","url":"https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html"},{"title":"NumPy: hypot","url":"https://numpy.org/doc/stable/reference/generated/numpy.hypot.html"}], "Scientific software has long had to calculate with measurements far larger or smaller than everyday whole numbers. A finite computer representation must round values and limit their range. A useful final answer can therefore be lost in an intermediate operation that the format cannot store.", "David Goldberg’s 1991 survey explained these practical problems for people building computer systems. It connected floating-point representation and rounding rules to failures in real calculations. In our NumPy example, float64 uses a fixed 64-bit format: a finite component can fit while its square exceeds the format’s range. That is overflow.", "We only want a direction, so we can change the common scale before squaring. The geometry stays the same, and the products fit in a safer range. We will inspect that change one operation at a time, then test it on a new encoder output."),
  diagram:table('The direction survives a change of scale','Compare the procedure before deciding that the encoder produced a meaningless vector.',
    ['Quantity','Small encoder output','Large encoder output'],
    [['Components','[3, 4]','[3e200, 4e200]'],['Divide by largest magnitude','[0.75, 1]','[0.75, 1]'],['Unit direction','[0.6, 0.8]','[0.6, 0.8]']],
    'Both vectors point in the same direction. The large components overflow if squared directly in ordinary binary64 arithmetic.'),
  parts:[
    p('What is the normalisation trying to preserve?',
      "Picture two arrows pointing in the same direction, with one longer than the other. The coordinate lists [3,4] and [6,8] describe that relationship. When our retrieval comparison uses direction, we want both lists to produce the same length-one vector. Dividing every component by one common positive length preserves their proportions.\n\nThe coordinate positions must still mean the same things. Position zero in the query must match position zero in a document from that encoder. Removing length cannot make unrelated encoder coordinate systems comparable.",
      'length(x) = sqrt(sum of the squared components)\nunit(x) = x / length(x)',
      "For an all-zero vector there is no direction to preserve. We return zeros as an explicit special outcome, so the caller can decide how to handle that document."),
    p('Find the operation that fails before replacing the formula',
      'A floating-point number can be finite while its square is too large to store. At the opposite end, a small nonzero square can round to zero. Neither outcome establishes that the input itself was invalid.\n\nInspect intermediate values and the array dtype. Switching to a wider type may postpone a range problem, but an unsuitable evaluation can still fail. Replacing an infinity with a large constant would also change the result without recovering the lost calculation.',
      'large components: [3e200, 4e200]\ndirect squares: [9e400, 16e400]\nthese squares exceed binary64 range',
      'The mathematical squares exist. The machine format cannot represent them as finite binary64 values.'),
    p('Rescale before the dangerous products',
      'Use the largest absolute component as a common scale. After dividing by that scale, every component has magnitude at most one. Now compute the length of this scaled vector and divide by it.\n\nWe do not need to multiply back by the original scale when the goal is a unit direction. Avoiding that unnecessary multiplication also helps when the original mathematical length itself would exceed the representable range.',
      'scale = max(abs(x))\nz = x / scale\nunit(x) = z / sqrt(sum(z * z))\n\nx = [3e200, 4e200]\nz = [0.75, 1]\nlength(z) = 1.25\nunit(x) = [0.6, 0.8]',
      'Each operation has a reason. The first division protects the products; the second removes the remaining length.'),
    p('Give the zero vector an explicit outcome',
      'A document can produce a nonempty vector whose entries are all zero. Its magnitude is zero, so it has no direction to preserve. Our procedure returns a vector of zeros in that case. It rejects an empty vector, which has no components at all. An application must still decide whether to reject a document represented by zeros, skip it or use a different representation.\n\nIn the workshop, a zero magnitude is replaced with one only when choosing a divisor. That leaves the zero values at zero. We are not asserting that their direction is now known.', null,
      'Using a very small arbitrary constant as every divisor can distort small, meaningful vectors. Handle the actual zero case separately.'),
    p('Work through the values before writing the reusable procedure',
      "Follow one large vector through the program below. The scaled components form a new NumPy array. Taking that array’s dot product with itself gives one number, and the final division applies the same divisor to every component.\n\nPause at the printed scale and scaled coordinates. This is where we avoided forming the enormous squares of the original values.", null,
      "The returned coordinates can now be used for the intended direction comparison. Whether the retrieved document is useful still needs its own evaluation.",),
    p('A batch introduces another choice: which axis belongs to one example?',
      'A table of embeddings usually has one example per row and one coordinate per column. Find a separate scale for every row. Keeping the reduced axis as a length-one dimension lets NumPy broadcast each scale back across its own row.\n\nOne scale for the entire table is mathematically possible in exact arithmetic, but it can lose the small rows when another row is vastly larger. Independent row scaling matches the calculation we actually want.',
      'batch shape: (number_of_documents, encoder_dimensions)\nrow scales shape with keepdims=True: (number_of_documents, 1)',
      'Axes are part of the data contract. Normalising each column answers a different question.'),
    p('Check the direction under a new range of inputs',
      'Test large and tiny positive rescalings of the same nonzero vector. The unit direction should stay close. Test sign changes, zero rows and malformed inputs as separate behaviours.\n\nComparing the norm alone is insufficient: many wrong directions have length one. Keep an expected direction for a simple vector whose geometry we can inspect.', null,
      'This fixes one source of numerical failure. A drifting encoder, an incorrect similarity metric and a poor retrieval corpus still require their own evidence.'),
  ],
  questions:[
    q('The vector is [3e200, 4e200], using binary64. Its components are finite.', 'Which intermediate calculation can overflow?', ['Squaring each component directly','Reading the number of components','Dividing the vector by 4e200'],0,'The squares exceed the format’s range even though each component fits.'),
    q('After common rescaling, z=[0.75,1] and its length is 1.25.', 'Which result keeps the original direction with length one?', ['[0.6,0.8]','[0.75,1]','[0,0]'],0,'Divide both scaled components by the same remaining length.'),
    tf('An input vector is exactly [0,0]. This implementation returns [0,0].','The returned vector now has a known unit direction.',false,'Zero still has no direction; the explicit outcome avoids an undefined division.'),
    q('X has shape (4,3): four documents, three coordinates each.','What should row scales with keepdims=True look like?', ['Shape (4,1)','Shape (1,3)','A scalar for the entire corpus'],0,'Each document gets a separate divisor that broadcasts across its coordinates.'),
    tf('Two encoder versions use different coordinate meanings but both produce unit vectors.','The unit vectors can still use incompatible coordinate meanings.',true,'Removing length does not align different coordinate systems.'),
    q('A test checks that every output has length one. The program accidentally swaps the coordinates.','Which additional test exposes this?', ['Check the expected direction for a known vector','Check only the number of rows again','Increase the printed decimal places'],0,'A wrong direction can still have length one.'),
  ],
  practice:[
    challenge('Normalise a vector before its squares overflow',[
      'Botie needs the direction of a finite real vector, including vectors with very large or tiny components. Write unit_vector(values). Convert to a nonempty one-dimensional float64 NumPy array, reject nonfinite values or the wrong dimensionality with ValueError, and return its unit direction. Return zeros for an all-zero vector.',
      'Scale by the largest absolute component before forming squared products. The return value is an array with the same shape; do not replace an overflow with a guessed constant. Print the starter’s result rounded to three decimal places.',
    ],'import numpy as np\n\ndef unit_vector(values):\n    pass\n\nprint(np.round(unit_vector([8e200,15e200]),3))',
    'import numpy as np\n\ndef unit_vector(values):\n    x = np.asarray(values,dtype=np.float64)\n    if x.ndim != 1 or x.size == 0 or not np.isfinite(x).all():\n        raise ValueError("Expected a nonempty finite vector")\n    scale = np.max(np.abs(x))\n    if scale == 0:\n        return np.zeros_like(x)\n    z = x / scale\n    return z / np.sqrt(z @ z)\n\nprint(np.round(unit_vector([8e200,15e200]),3))',
    '[0.471 0.882]', ['First decide whether the entire vector is zero. A nonzero vector supplies its own positive scale.','The dot product should use the scaled entries, not the original large values.'],[
      ['Tiny direction','np.testing.assert_allclose(unit_vector([3e-200,4e-200]),[.6,.8])'],
      ['Signed direction','np.testing.assert_allclose(unit_vector([0,-5e250]),[0,-1])'],
      ['Zero direction policy','np.testing.assert_array_equal(unit_vector([0,0,0]),[0,0,0])'],
      ['Reject a nonfinite input','try:\n    unit_vector([1,np.inf])\nexcept ValueError:\n    pass\nelse:\n    raise AssertionError("Nonfinite input was accepted")'],
    ],{question:'How can we preserve this vector’s direction without squaring its huge components?'}),
    challenge('Give each document its own scale',[
      'Now Botie receives a rectangular batch with one embedding per row. Write unit_rows(values), accepting a nonempty two-dimensional finite float64 array. Return row-wise unit directions, retaining zero rows as zeros. Reject other shapes or nonfinite values with ValueError.',
      'The first row in the supplied batch is huge and the second is tiny. Each needs its own length. Reduce across columns and keep a separate scale and length for each row. Print the rounded array as a Python list.',
    ],'import numpy as np\n\ndef unit_rows(values):\n    pass\n\nprint(np.round(unit_rows([[3e200,4e200],[5e-200,12e-200]]),3).tolist())',
    'import numpy as np\n\ndef unit_rows(values):\n    x = np.asarray(values,dtype=np.float64)\n    if x.ndim != 2 or min(x.shape) == 0 or not np.isfinite(x).all():\n        raise ValueError("Expected a nonempty finite table")\n    scales = np.max(np.abs(x),axis=1,keepdims=True)\n    scales = np.where(scales == 0,1,scales)\n    z = x / scales\n    lengths = np.sqrt(np.sum(z*z,axis=1,keepdims=True))\n    return z / np.where(lengths == 0,1,lengths)\n\nprint(np.round(unit_rows([[3e200,4e200],[5e-200,12e-200]]),3).tolist())',
    '[[0.6, 0.8], [0.385, 0.923]]', ['Keep each reduced row axis with keepdims=True so that its divisor broadcasts back across that row.','Handle zero scales and zero lengths without changing nonzero rows.'],[
      ['Mixed zero and nonzero rows','np.testing.assert_allclose(unit_rows([[0,0],[0,-8],[3,4]]),[[0,0],[0,-1],[.6,.8]])'],
      ['One coordinate per document','np.testing.assert_allclose(unit_rows([[5],[-2],[0]]),[[1],[-1],[0]])'],
      ['Reject a vector in place of a batch','try:\n    unit_rows([3,4])\nexcept ValueError:\n    pass\nelse:\n    raise AssertionError("The example axis was missing")'],
    ],{question:'Which reductions preserve the separate direction of every document?'}),
  ],
  build:construction('Keep the direction when the encoder changes scale',
    'Botie’s retrieval pipeline turns a valid large embedding into zeros while trying to normalise it.',
    'Build a common scale from the largest absolute component. Divide first, calculate the scaled length, and divide again. Keep an all-zero vector at zero. Return the direction vector.',
    {vector:'Encoder coordinates for one document'},[
      sample('Original encoder',{vector:[3,4]},[.6,.8]),
      sample('The new encoder’s range trips direct squaring',{vector:[3e200,4e200]},[.6,.8]),
      sample('No direction was produced',{vector:[0,0]},[0,0]),
      sample('Tiny coordinates still carry a direction',{vector:[3e-200,4e-200]},[.6,.8]),
    ],unitVector,
    'Rescaling protects the intermediate products while preserving the direction we compare.',
    "The workshop follows small finite binary64 vectors and deliberately returns zeros for an all-zero input. A caller must decide whether a document with that outcome should enter retrieval."),
  journey:journey('A new encoder changes numerical scale and breaks the normalisation Botie used for retrieval.',
    'Protect the products before they are formed',"Start from the vector-length calculation. Find a common scale before its squares, then check that the resulting direction survives the encoder’s larger values.",'The direction stays the same across a large change in magnitude.',
    diagnose('The first length calculation becomes infinite','Which part of the earlier construction lost the direction?',
      ['The squares overflowed before the final division','The original components were finite. Changing their scale before multiplying avoids that intermediate failure.'],
      ['Every large embedding must have zero relevance','Numerical failure is not evidence about whether a document answers the question.'],
      'Repair the calculation before interpreting the retrieval result.'),
    [connection('distance-and-similarity','Separate direction from vector size','We preserve that same geometric comparison while changing its numerical evaluation.')],
    'What other failure could remain even after every output direction has length one?',
    'Keep encoder compatibility and retrieval relevance as separate checks from numerical range.',undefined,
    ["Which single positive number could bring every nonzero component into a manageable range without changing their proportions? Try the largest absolute component.","After rescaling, calculate the remaining length and divide by it. Use the nonzero-divisor tool only to handle actual zero divisors, so a zero vector remains zero."]),
  fresh:fresh('A signed embedding arrives at an even larger scale',
    'Botie receives [0,-5e250]. Predict the direction before running the repaired graph. Neither the sign nor the zero coordinate should disappear.',
    {vector:[0,-5e250]},[0,-1],'A stable calculation preserves direction, including its sign, across numerical scales.'),
});

stableNormalisation.parts[4].examples = [{
  title:'Inspect the scaled calculation on one document',
  paragraphs:['This program inspects one known nonzero vector. The reusable challenges must also handle zero inputs and invalid shapes.'],
  code:'import numpy as np\nx = np.array([3e200,4e200])\nz = x / np.max(np.abs(x))\nprint(z.tolist())\nprint(np.round(z / np.sqrt(z @ z),3))',
  output:'[0.75, 1.0]\n[0.6 0.8]',
  interpretation:['The dangerous large squares never occur. The final vector preserves the direction of the original coordinates.'],
}];

const parameterGaps = op('absolute', op('subtract', op('matvec',s('experiments'),s('first')),op('matvec',s('experiments'),s('second'))));
const experimentSelection = op('numericalPassingPositions',op('gate',parameterGaps,s('resolution')));
const parameterEvidence = lesson({
  id:'numerical-identifiable-models', title:'A Perfect Fit Left Two Different Answers', section,
  topic:'Where a fitted number can mislead',
  blurb:"Two heater models fit every recorded total. Which experiment would let us find out how much each heater actually contributes?",
  openingTitle:'Which Heater Actually Produced the Heat?',
  opening:[
    'Botie is fitting a small physical model to produce simulator training data. Two heaters always ran at the same setting during the recorded experiments. The measured heat is easy to predict, but several different pairs of heater gains fit every observation. Which pair belongs in the simulator?',
    'The fitting program can return a pair of numbers without the measurements determining that pair. We will first see what the observations actually constrain. Then we will design a measurement that can tell two plausible fitted models apart.',
  ],
  prerequisites:[before('Learn a physical gain','simulation-system-identification'),before('Linear algebra','linear-algebra','primers')],
  outputLabel:'Experiment positions that separate the candidate predictions', checkpointTitle:'What can the existing records tell us?',
  history:history("A Good Fit Could Still Leave the Parameters Unknown", [{"title":"NumPy: least-squares solutions, rank and singular values","url":"https://numpy.org/doc/stable/reference/generated/numpy.linalg.lstsq.html"},{"title":"NumPy: matrix condition numbers","url":"https://numpy.org/doc/stable/reference/generated/numpy.linalg.cond.html"},{"title":"Golub and Kahan: singular values and least-squares computation, 1965","url":"https://web.stanford.edu/class/cme324/classics/golub-kahan.pdf"}], "Suppose every calibration test turns two heaters up together. A fitting program can learn their combined heat output while leaving each heater’s contribution unresolved. Repeating that same operating pattern gives it more records of the combined effect, without asking the question that separates the gains.", "A least-squares fit chooses coefficients by minimising the sum of squared prediction errors. Computational work on these fits had to address both noisy equations and weakly determined answers. In 1965, Gene Golub and William Kahan described a numerically stable way to calculate singular values and a matrix’s pseudo-inverse, which extends the idea of an inverse to such fitting problems. These calculations can expose changes to the coefficients that the measurements constrain strongly, weakly or not at all.", "That historical numerical work does not tell us which heater is stronger. It helps us recognise when a returned coefficient is a convention rather than an independently measured effect. We will first design a setting on which two fitting models disagree, then give the missing information its linear-algebra names."),
  diagram:table('Both models explain the experiments we already ran','The settings are recorded in a common unit. Gains convert setting into heat under this simplified additive model.',
    ['Experiment settings','Model A gains [1,2]','Model B gains [2,1]'],
    [['Both at one: [1,1]','3','3'],['Both at two: [2,2]','6','6'],['Only heater one: [1,0]','1','2']],
    'The final row is a proposed new experiment. It distinguishes these two candidates; it does not establish which candidate is correct.'),
  parts:[
    p('Look at what varied in the original experiments',
      'Each row holds the two heater settings for one experiment. The response array holds measured heat in the same row order. If the settings always rise together, the records show their combined effect. They do not show how much each heater contributed independently.\n\nThis can also happen in ordinary ML features. Two recorded inputs may repeat nearly the same information. A fitting routine still produces coefficients, but interpreting each coefficient as a separately measured effect requires care.', null,
      'A shape check can confirm that arrays line up. It cannot establish that the experiments contain independent information.'),
    p('Write the combinations that the data constrain',
      'Our model adds the two setting-times-gain contributions. In the recorded experiments, each setting pair is a multiple of the same row. Changing one gain while compensating with the other leaves every fitted prediction unchanged.\n\nThere is a whole family of fitting answers here. We can predict the old operating pattern without having identified the individual gains.',
      'prediction = setting_one × gain_one + setting_two × gain_two\n\n[1,1] constrains gain_one + gain_two = 3\n[2,2] constrains 2 × (gain_one + gain_two) = 6\n\n[1,2], [2,1] and [1.5,1.5] all satisfy the observed total',
      'Those coefficient pairs are alternative gain estimates, not additional rows of observations.'),
    p('Choose a question on which the fitted models disagree',
      'Evaluate both candidates at each proposed setting pair. Subtract their predicted responses and keep the magnitude. A large gap offers a way to distinguish these candidates if that experiment is feasible and the instrument can resolve the difference.\n\nRunning both heaters together again gives the same answer under both candidates. Running only one heater asks a different question. We are designing evidence, rather than simply collecting a larger file.',
      'candidate settings = [[1,1], [1,0], [0,1]]\nmodel A predictions = [3,1,2]\nmodel B predictions = [3,2,1]\nabsolute gaps = [0,1,1]',
      'The arithmetic ranks disagreement between the supplied candidates. Neither candidate is assumed to be the real physical system.'),
    p('State the measurement resolution before declaring a distinction',
      'A prediction gap can be too small to distinguish with the available instrument. The workshop uses a declared positive minimum gap, in response units, and keeps every candidate experiment reaching it. This is a simple planning rule, not a statistical test.\n\nActual experimental uncertainty may include systematic bias, correlated errors and changing equipment conditions. A planned gap above this threshold does not guarantee that one noisy observation will identify the correct model.',
      'minimum planning gap = 0.5 heat units\ngaps = [0,1,1]\npassing original positions = [1,2]',
      'An empty result means these candidates cannot be separated by the proposed settings at the stated resolution. Do not replace it with an arbitrary experiment.'),
    p('Now name the missing information',
      "An identifiable parameter is one the allowed observations can distinguish from other parameter choices under the stated model. Our old heater tests fail that requirement: we can increase one gain and reduce the other without changing any predicted total for those settings.\n\nLinear algebra describes the missing distinction as a direction in parameter space that these measurements cannot reveal. Rank counts the independent directions represented by the measurement matrix. Full column rank removes this particular linear ambiguity; we still need evidence that the additive heater relationship describes the equipment.", null,
      "More repeated readings can reduce some measurement noise while leaving that same unresolved gain difference."),
    p('Almost the same experiment can still leave a fragile answer',
      'The columns need not be exactly dependent to cause trouble. If they differ only slightly, a small measurement change can require a large coefficient change to maintain the fit. That sensitivity is a conditioning problem. That sensitivity comes from the problem and its representation. A different solver still has to work with the same measurements.\n\nA matrix condition number quantifies worst-direction relative amplification under a stated norm. Its meaning depends on scaling and the mathematical problem. It is not a universal uncertainty interval for the fitted physical parameters.',
      'well-separated rows: [[1,0], [0,1]]\nnearly repeated rows: [[1,1], [1,1.000001]]',
      'Both examples have full rank in exact arithmetic. The second provides much weaker separation of the two gains.'),
    p('Inspect what the numerical fitting routine actually returned',
      "NumPy’s lstsq returns more than a coefficient vector. It also reports numerical rank and singular values, which describe the strength of the matrix’s independent directions. A cutoff tells the routine which very small directions to treat as numerically unresolved.\n\nWhen several coefficient vectors fit equally well, the routine chooses the one with the smallest Euclidean length. That choice is called the minimum-norm solution. It is a useful numerical convention, but it is not a measurement showing that two physical gains are equal.\n\nCalculate prediction errors from the original rows as well. An empty residual array returned by the routine has a specific API meaning and cannot stand in for a complete diagnosis of the fit.", null,
      "A fitting report should preserve how much information the measurements supplied, as well as how closely the chosen coefficients reproduce them."),
    p('Take a new measurement and be willing to reject both models',
      'Keep the proposed experiment separate from the measurement eventually obtained. If the response disagrees with both candidates, inspect the model structure, calibration and experimental conditions instead of forcing the result into one of the old explanations.\n\nThe same discipline matters when a learned simulator becomes training data for an agent. Preserve which operating conditions identified its parameters and test conditions where that evidence was weak.', null,
      'A good training fit, an identified parameter and a model that transfers are different claims. Keep the evidence for each one visible.'),
  ],
  questions:[
    q('Observed settings [[1,1],[2,2]], responses [3,6]. Candidate gains are [1,2] and [2,1].','Which candidate fits both recorded responses?', ['Both candidates','Only [1,2]','Only [2,1]'],0,'The original settings reveal their sum rather than the separate contributions.'),
    q('Candidate gains [1,2] and [2,1]. Proposed settings [1,0].','What responses do the candidates predict?', ['1 and 2','3 and 3','2 and 4'],0,'This experiment changes the first setting without changing the second with it.'),
    tf('A solver chooses [1.5,1.5] for the rank-deficient recorded experiments.','The returned pair proves the physical gains are equal.',false,'A minimum-norm convention can choose that pair without an experiment identifying it.'),
    q('Prediction gaps [0.2,0.8,0.5], declared minimum planning gap 0.5. Equality passes.','Which original experiment positions pass?', ['[1,2]','[0,1]','[1]'],0,'Keep the original positions whose gap reaches the stated threshold.'),
    q('Every candidate experiment has zero prediction gap and the minimum gap is positive.','What should the planning procedure return?', ["An empty list","Every position, because an exact old fit identifies the gains","Position zero automatically"],0,'These proposed experiments do not distinguish these candidates.'),
    tf('A full-rank measurement matrix has two almost dependent columns.','Small measurement changes can still produce large coefficient changes.',true,'Full rank does not guarantee good conditioning.'),
    q('A new experiment gives a response far from both candidate predictions.','What needs investigation?', ['The model and experimental assumptions as well as the candidates','Only which candidate was listed first','The index numbering of a correct response'],0,'The real system need not be one of the proposed explanations.'),
  ],
  practice:[
    challenge('Find the experiments that can separate the fits',[
      'Botie has two plausible coefficient vectors and a table of proposed experiments, one setting vector per row. Write separating_experiments(rows, first, second, resolution). Return the original zero-based row positions whose absolute prediction gap is at least the positive resolution.',
      'Convert to finite float64 arrays. Require a nonempty two-dimensional table, matching one-dimensional coefficient vectors and a finite positive scalar resolution; reject other inputs with ValueError. Both candidates use the same coordinate order. An empty result is a valid outcome.',
    ],'import numpy as np\n\ndef separating_experiments(rows, first, second, resolution):\n    pass\n\nprint(separating_experiments([[1,1],[1,0],[0,1]],[1,2],[2,1],.5))',
    'import numpy as np\n\ndef separating_experiments(rows, first, second, resolution):\n    A = np.asarray(rows,dtype=float)\n    a,b = np.asarray(first,dtype=float),np.asarray(second,dtype=float)\n    if A.ndim != 2 or min(A.shape) == 0 or a.ndim != 1 or b.shape != a.shape or A.shape[1] != a.size:\n        raise ValueError("Incompatible experiment and coefficient shapes")\n    if np.ndim(resolution) != 0 or not np.isfinite(A).all() or not np.isfinite(a).all() or not np.isfinite(b).all() or not np.isfinite(resolution) or resolution <= 0:\n        raise ValueError("Use finite inputs and positive resolution")\n    gaps = np.abs(A @ a - A @ b)\n    return np.flatnonzero(gaps >= resolution).tolist()\n\nprint(separating_experiments([[1,1],[1,0],[0,1]],[1,2],[2,1],.5))',
    '[1, 2]', ['Matrix-times-vector gives one prediction per proposed experiment. Keep those rows aligned between the two models.','The result contains positions, not the gap values. Retain equality at the declared threshold.'],[
      ['No distinguishing experiments','assert separating_experiments([[1,1],[2,2]],[1,2],[2,1],.1) == []'],
      ['Changed order and exact boundary','assert separating_experiments([[0,1],[1,1],[1,0]],[1,2],[2,1],1) == [0,2]'],
      ['Negative prediction differences','assert separating_experiments([[1],[2]],[0],[1],1.5) == [1]'],
      ['Incompatible coordinates','try:\n    separating_experiments([[1,2]],[1],[2],.1)\nexcept ValueError:\n    pass\nelse:\n    raise AssertionError("Mismatched coordinates were accepted")'],
      ['Resolution must be scalar','try:\n    separating_experiments([[1,0]],[1,2],[2,1],np.array([.5]))\nexcept ValueError:\n    pass\nelse:\n    raise AssertionError("An array-valued resolution was accepted")'],
    ],{question:'Which new measurements ask the two fitted models a different question?'}),
    challenge('Keep the rank beside the fit',[
      'Write fit_report(rows, responses) for finite nonempty compatible arrays. Use np.linalg.lstsq with rcond=None. Return (coefficients, numerical_rank, residual_norm), where residual_norm is computed explicitly from the original rows and responses.',
      'This batch has a changed response, so use the starter’s observations rather than the earlier clean totals. The coefficient vector is the solver’s chosen fit. Return the rank beside it, and print the rank and residual norm rounded to six places for these dependent columns.',
    ],'import numpy as np\n\ndef fit_report(rows, responses):\n    pass\n\ncoefficients,rank,error = fit_report([[1,1],[2,2]],[3,7])\nprint(rank,round(error,6))',
    'import numpy as np\n\ndef fit_report(rows, responses):\n    A,y = np.asarray(rows,dtype=float),np.asarray(responses,dtype=float)\n    if A.ndim != 2 or min(A.shape) == 0 or y.ndim != 1 or len(y) != len(A) or not np.isfinite(A).all() or not np.isfinite(y).all():\n        raise ValueError("Expected compatible finite experiments and responses")\n    coefficients,_,rank,_ = np.linalg.lstsq(A,y,rcond=None)\n    error = float(np.linalg.norm(A @ coefficients - y))\n    return coefficients,int(rank),error\n\ncoefficients,rank,error = fit_report([[1,1],[2,2]],[3,7])\nprint(rank,round(error,6))',
    '1 0.447214', ['Do not infer the rank from whether a returned residual array is empty. Read the rank result explicitly.','Recompute prediction-minus-observation and its length, including for rank-deficient inputs.'],[
      ['An identified fit','coefs,rank,error = fit_report([[1,0],[0,1],[1,1]],[1,2,3])\nnp.testing.assert_allclose(coefs,[1,2])\nassert rank == 2 and error < 1e-10'],
      ['Unresolved parameters still predict recorded totals','coefs,rank,error = fit_report([[1,1],[2,2]],[3,6])\nassert rank == 1\nnp.testing.assert_allclose(np.array([[1,1],[2,2]]) @ coefs,[3,6])'],
      ['Keep a genuine residual','_,rank,error = fit_report([[1],[1]],[1,3])\nassert rank == 1\nnp.testing.assert_allclose(error,np.sqrt(2))'],
    ],{question:'What did the solver fit, and how many parameter directions did the records resolve?'}),
  ],
  build:construction('Ask the heaters a question that separates the fits',
    'Botie’s calibration fit predicts the recorded totals, but two different gain vectors explain them equally well.',
    'Apply each gain vector to every proposed experiment row. Compare their absolute prediction gaps with the supplied positive minimum gap. Return the original experiment positions that pass, including an empty list when none do.',
    {experiments:'Proposed heater-setting rows',first:'Candidate gain vector A',second:'Candidate gain vector B',resolution:'Minimum planning gap in heat units'},[
      sample('One experiment changes the heaters independently',{experiments:[[1,1],[1,0],[0,1]],first:[1,2],second:[2,1],resolution:.5},[1,2]),
      sample('More records repeat the unresolved setting',{experiments:[[1,1],[2,2],[3,3]],first:[1,2],second:[2,1],resolution:.5},[]),
      sample('The instrument cannot resolve the smaller gap',{experiments:[[1,0],[0,1],[1,1]],first:[1,2],second:[1.1,1.9],resolution:.2},[]),
    ],experimentSelection,
    'New evidence must distinguish the competing explanations, rather than repeat their shared prediction.',
    "The two candidate gain vectors and additive heater model are supplied. The gap threshold helps plan a distinguishing measurement; the actual equipment, uncertainty and permission to run that experiment still need assessment."),
  journey:journey('The fitted simulator uses two heater gains that the original combined measurements never identified.',
    'Construct a test of the competing fits',"Apply each proposed setting row to both candidate gain vectors. Keep their predictions aligned so that a gap belongs to the experiment that produced it.",'The suggested experiments are tied to a specific unresolved parameter difference.',
    diagnose('The next batch runs the heaters together again','Did the larger record count resolve which heater contributes more?',
      ['No; both candidates still predict the same totals','These new rows repeat the same combination of inputs. More records need not add an independent direction.'],
      ['Yes; every extra row identifies another parameter','Repeated dependent rows can leave the same ambiguity.'],
      'Design a new measurement that can distinguish the fitted explanations.'),
    [connection('simulation-system-identification','Fit a declared physical relationship','A returned parameter estimate now needs a check that the experiments could determine it.'),connection('linear-algebra','Apply one coefficient vector to many rows','The same matrix calculation compares candidate predictions at proposed experiments.')],
    'If a new measurement rejects both candidates, what assumptions would you inspect?',
    'Preserve model alternatives and measurement resolution when planning new evidence.',undefined,
    ['Both branches must use the same candidate experiment rows and the same coordinate order.','Subtract the two prediction vectors before taking absolute values. Compare those gaps with the planning resolution, then retain passing original positions.']),
  fresh:fresh('A different unresolved gain pair changes the useful experiment',
    'The candidates are [1,1] and [1,2]. The proposed rows are [[1,0],[0,2],[1,1]], and the minimum planning gap is 1.5. Predict which original position survives.',
    {experiments:[[1,0],[0,2],[1,1]],first:[1,1],second:[1,2],resolution:1.5},[1],
    'A useful experiment depends on the specific competing parameter difference and the instrument’s declared resolution.'),
});

parameterEvidence.parts[6].examples = [{
  title:'See the unresolved direction in the fit report',
  paragraphs:['This inspection prints numerical rank and the fitted predictions, rather than treating a coefficient vector as a direct measurement of each heater.'],
  code:'import numpy as np\nA = np.array([[1.,1.],[2.,2.]])\ny = np.array([3.,6.])\nfit,_,rank,singular = np.linalg.lstsq(A,y,rcond=None)\nprint(rank)\nprint(np.round(A @ fit,6).tolist())',
  output:'1\n[3.0, 6.0]',
  interpretation:['The recorded totals are fitted while only one independent parameter direction is numerically resolved.'],
}];

const testLoss = weight => op('numericalTestLoss',weight,s('target'),s('kind'));
const leftSlope = op('divide',op('subtract',testLoss(s('weight')),testLoss(op('subtract',s('weight'),s('step')))),s('step'));
const rightSlope = op('divide',op('subtract',testLoss(op('add',s('weight'),s('step'))),testLoss(s('weight'))),s('step'));
const slopeComparison = op('numericalSlopeReport',leftSlope,rightSlope,op('divide',op('add',leftSlope,rightSlope),c(2)));
const gradientChecks = lesson({
  id:'numerical-gradient-checks', title:'Does This Gradient Describe the Loss We Actually Run?', section,
  topic:'Checking derivatives and simulated trajectories',
  blurb:"A training step is supposed to reduce the loss. Check the reported slope against changes in the running program, including a case where averaging hides the problem.",
  openingTitle:'Botie Took a Step in the Wrong Direction',
  opening:["Botie moves a model weight in the direction the training code recommends, yet the prediction error grows. Before replacing the optimiser, can we check whether its reported slope agrees with the loss we actually evaluate? The loss is the number our chosen rule assigns to the prediction errors.","For one weight, the derivative describes that local slope. With several weights, their derivatives form the gradient. We can check one of those claims by moving the weight a little and running the loss again. We will keep the two sides visible, because an average can conceal a change in behaviour between them."],
  prerequisites:[before('Calculus','calculus','primers'),before('Backpropagation','backpropagation'),before('Floating-point range','numerical-stable-normalisation')],
  outputLabel:'Left, right and central numerical slopes', checkpointTitle:'Which slope did we actually measure?',
  history:history("Checking the Derivative Against the Running Calculation", [{"title":"SciPy: finite-difference derivative evaluation","url":"https://docs.scipy.org/doc/scipy/reference/generated/scipy.differentiate.derivative.html"},{"title":"Goldberg: rounding and cancellation","url":"https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html"},{"title":"Rumelhart, Hinton and Williams: learning representations by back-propagating errors, 1986","url":"https://www.cs.toronto.edu/~hinton/absps/naturebp.pdf"}], "Training adjusts a model’s weights to reduce a chosen numerical measure of prediction error. We need to know how that measure changes as each weight moves; a derivative describes this local change. As neural networks gained more trainable weights, calculating those derivatives efficiently became essential. Rumelhart, Hinton and Williams’ 1986 paper showed how back-propagating errors could train internal representations. A sign or indexing mistake in that calculation can send later weight updates the wrong way.", "Finite differences offer another route for a small check: move an input slightly, evaluate the function again and compare the change. This numerical approach predates modern automatic differentiation. It tests the running function rather than repeating the same derivative code, but its answer depends on the interval and on rounding in the two evaluations.", "We will begin with a smoothly changing error measure, called a loss, then give the checker an absolute-error corner. The aim is to understand what a disagreement tells us before treating a neat matching number as proof that the derivative is correct."),
  diagram:table('Keep the two sides visible','The test loss is the square of weight-minus-target. Here the target is zero.',
    ['Evaluation point','Weight','Loss'],[['Left','1.9','3.61'],['Centre','2.0','4.00'],['Right','2.1','4.41']],
    'Both sides show a rising loss, but their finite intervals give slightly different slopes. A smooth quadratic has central slope four at the centre in exact arithmetic.'),
  parts:[
    p('Start with a change we can evaluate',
      "Begin with a tiny model whose prediction is one adjustable weight. Its first loss is squared error relative to a fixed target. We can run that loss at the current weight and at a slightly larger one without needing to trust any derivative code.\n\nDivide the observed loss change by the weight change. This estimates the slope over that finite interval. Holding the target and all other inputs fixed lets us attribute the change to the weight we moved.\n\nA derivative describes the local slope as the interval shrinks at a differentiable point. A finite interval can cross a region where the slope changes, which is why we will inspect both sides.",
      'right slope = (loss(w + h) - loss(w)) / h\nleft slope = (loss(w) - loss(w - h)) / h',
      "Use a positive step of the same size on the left and right before comparing them."),
    p('Compare both sides before averaging them',
      'A central difference compares the right and left perturbed evaluations. It often reduces approximation error for sufficiently smooth functions. On our quadratic, the finite one-sided slopes sit on opposite sides of the derivative and their average gives the exact derivative in exact arithmetic.\n\nThat convenient result is a property of this quadratic example. For a general smooth loss, the central approximation still has a finite-step error.',
      'target = 0, w = 2, h = 0.1\nleft slope = (4 - 3.61) / 0.1 = 3.9\nright slope = (4.41 - 4) / 0.1 = 4.1\ncentral difference = (4.41 - 3.61) / 0.2 = 4',
      'Keep the loss definition and perturbation size with the slope so somebody can reproduce the check.'),
    p('A corner can disappear inside a symmetric calculation',
      'Now change the test loss to the absolute value of weight-minus-target and evaluate exactly at the target. Moving left and moving right approach different slopes. There is no single classical derivative there.\n\nThe central difference averages those opposing slopes to zero. Zero is also a subgradient that an optimisation implementation may deliberately choose at this corner. Such a convention is different from proving that a classical derivative exists, and it is not automatically a bug.',
      'absolute loss at w = target = 0, h = 0.1\nleft slope = -1\nright slope = 1\ncentral difference = 0',
      'Avoid judging an automatic derivative solely by a finite-difference check that straddles a nondifferentiable point.'),
    p('Smaller steps eventually make the subtraction worse',
      "At first, shortening the interval can make a smooth-function approximation more accurate. This is the finite-step approximation error, often called truncation error. Keep shrinking and another problem appears: the two stored loss values become almost equal, so rounding can dominate their subtraction. The moved weight may even round back to the original stored number.\n\nTry several sensible step sizes and inspect where the estimates settle. Their useful range depends on the scale of the weight and on the numerical format used for the calculation.", null,
      "If neither perturbed evaluation changed, the resulting zero tells us very little about the true slope."),
    p('Make the repeated evaluations describe the same program',
      'Hold the example batch, model parameters other than the perturbed coordinate and relevant model state fixed. Random dropout masks, changing data augmentation or an updated running statistic can change the loss for reasons unrelated to the perturbation.\n\nUse controlled evaluation behaviour for the check and restore any state afterwards. Do not silently redefine the training objective just to make a diagnostic pass. Record what was disabled or fixed.', null,
      'The workshop uses explicit deterministic scalar losses. A real training system needs a deliberate policy for stochastic and stateful operations.'),
    p('A model with many weights needs a direction to perturb',
      'Perturbing each parameter separately is useful for a small test but expensive for a large model. Another check moves the whole parameter vector along a chosen direction. The resulting scalar slope should agree with the gradient’s dot product with that same direction on a smooth deterministic case.\n\nDo not normalise the direction on only one side of the comparison. Its magnitude determines how far each parameter moves for a given step.',
      'directional difference = (loss(w + h × v) - loss(w - h × v)) / (2 × h)\nanalytic directional derivative = gradient(w) dot v',
      'A few tested directions cannot certify every coordinate of a large gradient. Keep targeted small fixtures for operations prone to mistakes.'),
    p('Use disagreement to locate a problem',
      'If the estimates disagree on a smooth fixture across sensible step sizes, inspect signs, reductions and parameter indexing. A loss averaged across a batch and a derivative summed across it describe different functions.\n\nIf disagreement appears only near an activation boundary or at very small steps, investigate that numerical or mathematical assumption before rewriting a correct derivative. The diagnostic should narrow the cause of a failure.', null,
      'Finite differences are a development check. They are not a recommendation to replace ordinary gradient-based training with repeated full-model perturbations.'),
  ],
  questions:[
    q('A quadratic loss has values 3.61,4,4.41 at weights 1.9,2,2.1.','What is the slope from the right at step 0.1?', ['4.1','0.41','3.9'],0,'Divide the right-side loss change by the weight step.'),
    q('The absolute loss at weights -0.1,0,0.1 is 0.1,0,0.1.','What does the central difference report at zero?', ['0','1','-1'],0,'The symmetric evaluations are equal even though the one-sided slopes differ.'),
    tf('An absolute loss has different left and right slopes at zero. An optimiser uses a zero subgradient there.','The optimiser’s convention proves that the classical derivative exists.',false,'A selected subgradient is an optimisation convention, not a classical derivative at the corner.'),
    q('Reducing h eventually leaves the stored perturbed weight unchanged.',"How should we investigate a step that changes no stored weight value?", ['Try scale-appropriate steps and inspect rounding','Declare the derivative zero from that evaluation alone','Keep shrinking h indefinitely'],0,'A perturbation that changes no stored value provides little slope information.'),
    q('The loss uses a different random dropout mask on each perturbation.','What is mixed into the comparison?', ['Random variation unrelated to the weight step','Only the requested coordinate derivative','A deterministic central derivative'],0,'The repeated loss evaluations must keep relevant randomness and state controlled.'),
    tf('A numerical directional check agrees along one chosen vector.','An individual gradient error can still be invisible along that direction.',true,'The gradient error may contribute nothing along this chosen movement, so its dot product can be zero. Another direction or a coordinate check can expose it.'),
  ],
  practice:[
    challenge('Keep both sides of the loss check',[
      'Write slope_pair(loss, weight, step) for a deterministic callable returning a finite real scalar. Evaluate it at weight-step, weight and weight+step. Return (left_slope, right_slope). Require finite weight and a finite positive step; reject a nonfinite loss evaluation with ValueError.',
      'The supplied absolute loss has a corner at zero. Preserve both slopes rather than returning only their average. Print the tuple for that case. The function evaluations must not depend on changing random state.',
    ],'import math\n\ndef slope_pair(loss, weight, step):\n    pass\n\nprint(slope_pair(abs,0,.1))',
    'import math\n\ndef slope_pair(loss, weight, step):\n    if not math.isfinite(weight) or not math.isfinite(step) or step <= 0:\n        raise ValueError("Use a finite weight and positive finite step")\n    lower,centre,upper = (float(loss(point)) for point in (weight-step,weight,weight+step))\n    if not all(math.isfinite(value) for value in (lower,centre,upper)):\n        raise ValueError("Loss evaluations must be finite")\n    return (centre-lower)/step,(upper-centre)/step\n\nprint(slope_pair(abs,0,.1))',
    '(-1.0, 1.0)', ['The left numerator uses the centre minus the lower evaluation. Reversing it would change its sign.','Keep the same function and positive step on both sides.'],[
      ['Smooth quadratic','left,right = slope_pair(lambda w:w*w,2,.1)\nassert abs(left-3.9) < 1e-10 and abs(right-4.1) < 1e-10'],
      ['A shifted corner','assert slope_pair(lambda w:abs(w-3),3,.25) == (-1,1)'],
      ['Reject zero step','try:\n    slope_pair(abs,0,0)\nexcept ValueError:\n    pass\nelse:\n    raise AssertionError("A zero perturbation was accepted")'],
      ['Reject nonfinite loss','try:\n    slope_pair(lambda w:math.inf,0,.1)\nexcept ValueError:\n    pass\nelse:\n    raise AssertionError("A nonfinite evaluation was accepted")'],
    ],{question:'Do the two sides of this loss support the same local slope?'}),
    challenge('Check a whole parameter direction',[
      'Botie now checks a model with several parameters. Write directional_check(loss, weights, direction, step). For compatible nonempty finite one-dimensional arrays and a finite positive step, return the central directional difference as a float. Reject invalid shapes, nonfinite inputs or nonfinite scalar evaluations with ValueError.',
      'Do not normalise the direction and do not mutate the input arrays. The direction controls the perturbation of each parameter. Print the rounded result for the supplied quadratic; this check must use the full vector loss on both sides.',
    ],'import numpy as np\n\ndef directional_check(loss, weights, direction, step):\n    pass\n\ndef loss(w):\n    return w[0]**2 + 3*w[1]**2\n\nprint(round(directional_check(loss,[2,1],[1,-2],1e-4),6))',
    'import numpy as np\n\ndef directional_check(loss, weights, direction, step):\n    w,v = np.asarray(weights,dtype=float),np.asarray(direction,dtype=float)\n    if w.ndim != 1 or w.size == 0 or v.shape != w.shape or np.ndim(step) != 0 or not np.isfinite(w).all() or not np.isfinite(v).all() or not np.isfinite(step) or step <= 0:\n        raise ValueError("Use compatible finite vectors and a positive step")\n    lower,upper = float(loss(w-step*v)),float(loss(w+step*v))\n    if not np.isfinite(lower) or not np.isfinite(upper):\n        raise ValueError("Loss evaluations must be finite")\n    return float((upper-lower)/(2*step))\n\ndef loss(w):\n    return w[0]**2 + 3*w[1]**2\n\nprint(round(directional_check(loss,[2,1],[1,-2],1e-4),6))',
    '-8.0', ['Use the same direction in both perturbations, changing only its sign.','The denominator measures movement in the scalar step parameter, not the Euclidean length of the direction.'],[
      ['Direction magnitude is retained','np.testing.assert_allclose(directional_check(lambda w:float(w@w),[2,3],[0,2],1e-4),12,rtol=1e-7)'],
      ['Zero direction','assert directional_check(lambda w:float(w@w),[2,3],[0,0],.1) == 0'],
      ['Inputs survive the check','w = np.array([2.,3.]); copy = w.copy()\ndirectional_check(lambda x:float(x@x),w,[1,0],1e-4)\nnp.testing.assert_array_equal(w,copy)'],
      ['Reject a different coordinate count','try:\n    directional_check(lambda w:float(w@w),[2,3],[1],.1)\nexcept ValueError:\n    pass\nelse:\n    raise AssertionError("The direction had a different shape")'],
      ['Step must be scalar','try:\n    directional_check(lambda w:float(w@w),[2,3],[0,2],np.array([1e-4]))\nexcept ValueError:\n    pass\nelse:\n    raise AssertionError("An array-valued step was accepted")'],
    ],{question:'Does the loss change along this direction agree with the gradient’s directional prediction?'}),
  ],
  build:construction('Find the corner that a central difference concealed',
    'Botie’s gradient checker reports zero after averaging two incompatible sides of a loss.',
    'Evaluate the declared loss at the centre and at weight-minus-step and weight-plus-step. Calculate left and right slopes separately, then their central average. Use Label the slope comparisons to return all of them.',
    {weight:'Weight being checked',target:'Target weight for this test loss',step:'Positive perturbation',kind:'Declared loss kind'},[
      sample('A smooth quadratic',{weight:2,target:0,step:.1,kind:'squared'},{left:3.9,right:4.1,central:4}),
      sample('An absolute-loss corner trips the single-number check',{weight:0,target:0,step:.1,kind:'absolute'},{left:-1,right:1,central:0}),
      sample('Away from the corner',{weight:2,target:0,step:.1,kind:'absolute'},{left:1,right:1,central:1}),
    ],slopeComparison,
    'Separate one-sided evidence explains whether a symmetric numerical estimate is hiding a corner.',
    "The floor uses deterministic scalar losses so each slope can be followed directly. A finite-step comparison is a diagnostic; corners and rounded evaluations still need interpretation."),
  journey:journey('Botie’s symmetric gradient check conceals an absolute-loss corner behind a zero.',
    'Keep the two local comparisons separate',"Build the weight values on each side and evaluate the same loss at all of them. Keep the left and right slopes visible before forming their central average.",'The report explains why a central zero can have different meanings.',
    diagnose('The loss changes to absolute error at its target','Does the central zero establish a classical derivative of zero?',
      ['No; inspect the opposite one-sided slopes','The two sides approach different slopes at this corner.'],
      ['Yes; a central estimate always proves differentiability','Symmetric cancellation can hide a nondifferentiable point.'],
      'Retain both sides before judging the implementation’s derivative convention.'),
    [connection('calculus','Interpret a local slope','We now approximate that local relationship from evaluations of the running program.'),connection('backpropagation','Calculate a model derivative','An independent finite-difference fixture helps diagnose a reported derivative without replacing training.')],
    'Which changes to randomness or state would make these perturbations compare different losses?',
    'Keep the loss definition, numerical scale and derivative convention attached to a gradient-check result.',undefined,
    ['Build weight-minus-step and weight-plus-step before evaluating the loss. Each loss machine uses the same target and kind.','The left slope uses centre-minus-left; the right uses right-minus-centre. Their average is the central difference, which must not replace the separate evidence.']),
  fresh:fresh('The corner moves with the target',
    'The absolute test loss now has target 3 and is checked at weight 3 with step 0.25. Predict the two sides and their central estimate. A shifted target does not remove the corner.',
    {weight:3,target:3,step:.25,kind:'absolute'},{left:-1,right:1,central:0},
    'The checker must follow the actual loss and its target, rather than assuming the only problematic point is numerical zero.'),
});

gradientChecks.parts[3].examples = [{
  title:'Inspect a range of perturbations on a smooth loss',
  paragraphs:['The sine function supplies an independent analytic derivative. The printed estimates show the effect of changing the finite interval on this deterministic example.'],
  code:'import math\nx = 1.0\nfor h in [.1,.01,.001]:\n    estimate = (math.sin(x+h)-math.sin(x-h))/(2*h)\n    print(h,round(estimate,6))\nprint("analytic",round(math.cos(x),6))',
  output:'0.1 0.539402\n0.01 0.540293\n0.001 0.540302\nanalytic 0.540302',
  interpretation:['This range reduces finite-step error. It does not establish that arbitrarily smaller steps keep improving the estimate.'],
}];

const euler = (value,step) => op('subtract',value,op('multiply',op('multiply',s('rate'),value),step));
const halfStep = op('divide',s('dt'),c(2));
const fineState = euler(euler(s('state'),halfStep),halfStep);
const stepError = op('absolute',op('subtract',fineState,euler(s('state'),s('dt'))));
const stepTolerance = op('add',s('atol'),op('multiply',s('rtol'),op('absolute',fineState)));
const adaptiveReport = op('numericalStepReport',fineState,stepError,stepTolerance,op('gate',stepTolerance,stepError));
const adaptiveSteps = lesson({
  id:'numerical-adaptive-steps', title:'Which Simulation Steps Need More Work?', section,
  topic:'Checking derivatives and simulated trajectories',
  blurb:"A cooling curve changes quickly at first and slowly later. Let the proposed calculation show when its time interval needs to be shorter.",
  openingTitle:'Why Use the Same Interval Through the Whole Shift?',
  opening:[
    'Botie generates sequences of cooling temperatures for a learned simulator. A short fixed interval gives useful detail during a rapid change, but repeats unnecessary calculations once the temperature barely moves. A long interval is cheaper and can miss the part the model needed to learn.',
    'We need a way to decide whether a proposed step is accurate enough before accepting it. One inspectable approach evaluates the same interval in two different ways. If their disagreement is too large for our stated tolerance, try a shorter interval from the same starting state.',
  ],
  prerequisites:[before('Inspect a simulation time step','simulation-time-steps'),before('Numerical arithmetic','numerical-stable-normalisation')],
  outputLabel:'Candidate state, local comparison and acceptance decision', checkpointTitle:'Which interval did the comparison actually cover?',
  history:history("Spending Calculation Where the Curve Changes", [{"title":"SciPy: adaptive initial-value solvers and tolerances","url":"https://docs.scipy.org/doc/scipy/reference/generated/scipy.integrate.solve_ivp.html"},{"title":"SciPy: RK45 embedded numerical method","url":"https://docs.scipy.org/doc/scipy/reference/generated/scipy.integrate.RK45.html"}], "A simulation estimates a changing state at a sequence of times. Very short fixed intervals can waste calculations while the state barely changes. Long intervals can miss the change a training example was meant to capture. Numerical differential-equation solvers therefore needed a way to assess a proposed advance before accepting it.", "One approach compares two approximations for the same future time while sharing some of the intermediate rate calculations. Embedded Runge-Kutta methods are a family that uses this arrangement. Dormand and Prince published one such pair in 1980; SciPy’s RK45 uses that pair to control local error and choose its internal steps.", "We will build the idea with the simpler Euler update from the earlier timestep lesson. One full step and two successive half steps give us an inspectable disagreement. That can guide a retry with a shorter interval, while leaving the question of the physical model’s accuracy separate."),
  diagram:table('Compare the same elapsed interval','The state is temperature above ambient, initially ten. The cooling rate is 0.5 per second.',
    ['Route','Intermediate state','State after one second'],
    [['One Euler step','No midpoint evaluation','5'],['Two half steps','7.5 after half a second','5.625']],
    'Both routes cover one second. Their difference is a local numerical diagnostic, not two observations of real equipment.'),
  parts:[
    p('Keep the state and the elapsed interval separate',
      "A hot pump tends to cool toward the surrounding air. Our assumed model makes the cooling rate larger when the temperature difference is larger. The state we follow is that difference, called excess temperature above ambient.\n\nThe nonnegative rate parameter k controls how quickly the difference decays. A timestep h says how much physical time a proposed update would cover. Euler’s method uses the rate at the start of that interval to estimate the next state.\n\nFor now, keep an attempt separate from an accepted advance. If the later check rejects the approximation, the simulated clock and starting state must stay where they were.",
      'rate_of_change = -k × excess_temperature\nEuler(y,h) = y + h × rate_of_change',
      "We are changing how the cooling rule is evaluated. Measurements are still needed to establish whether that rule describes the equipment."),
    p('Reach the same future time by two routes',
      'Calculate one full Euler step from the starting state. Separately calculate a half step, evaluate the rate again at that midpoint, and take another half step. The second half must begin at the midpoint result.\n\nTwo half steps are not two copies of the first half-step value. Recomputing the rate is what gives the refined route additional information about the changing state.',
      'coarse = Euler(y,h)\nmidpoint = Euler(y,h/2)\nfine = Euler(midpoint,h/2)\n\ny = 10, k = 0.5, h = 1\ncoarse = 5\nmidpoint = 7.5\nfine = 5.625',
      'Comparing a full step with only the first half step would compare different physical times.'),
    p('Interpret the disagreement as an estimate',
      "The two routes used different amounts of detail to reach the same future time. Their disagreement gives us information about the approximation. For smooth behaviour at a sufficiently small step, Euler’s error order lets us use the magnitude of fine-minus-coarse as an estimate of the refined step’s leading local error.\n\nThe estimate still has assumptions. At a large step or across a sudden change in the rate, agreement can be misleading. Later we should compare whole trajectories with a reference solution or with a finer independent calculation.",
      'Euler refined local error estimate ≈ abs(fine - coarse)\nthis attempt: abs(5.625 - 5) = 0.625',
      "The error-order factor belongs to the method. This Euler expression should not be copied unchanged into a checker for an arbitrary solver."),
    p('Make the allowed error follow the scale of the state',
      'An absolute tolerance is an allowance in the state’s units. A relative tolerance adds an allowance proportional to the candidate’s magnitude. Combining them lets an application express a useful scale near zero as well as away from it.\n\nChoose tolerances from the downstream question. A display rounding choice is not evidence that a learning target can tolerate the same error. Multiple state variables may need separate absolute tolerances because their units and useful resolutions differ.',
      'allowed local error = atol + rtol × abs(fine)\natol = 0.1, rtol = 0.01\nallowed = 0.1 + 0.01 × 5.625 = 0.15625\n0.625 exceeds 0.15625, so reject this attempt',
      'Our teaching rule compares scalar values. Production solvers can combine scaled component errors using a method-specific norm.'),
    p('Retry from the state before the rejected attempt',
      'On rejection, keep the starting state and starting time. Shorten the proposed interval and recompute both routes. Accepting the already-rejected state and merely shortening the next step would preserve the error we meant to avoid.\n\nThe programming challenge halves the interval until it passes, with a bound on the number of rejections. This simple controller is easy to inspect. Production controllers usually use the method order, error estimate and bounded scale changes to choose steps more efficiently.', null,
      'A rejection bound or an inability to make a representable advance must produce an explicit failure, not an infinite retry loop.'),
    p('A local tolerance is not a global accuracy promise',
      'Accepted local errors can accumulate over a long trajectory. Instability and a wrong physical model are separate sources of failure. Compare complete trajectories against an analytic answer where available, or against independent and refined numerical calculations.\n\nFor the stated constant-rate cooling model, the exponential solution provides a useful reference. Agreement with that solution verifies the numerical treatment of this model, not whether a real pump follows the same law.',
      'exact excess at time t = initial_excess × exp(-k × t)',
      'The learned simulator’s training labels inherit the numerical procedure and the physical assumptions that produced them.'),
    p('Some systems force an explicit method to take tiny steps',
      'A system can contain rapidly decaying behaviour alongside a much slower change we care about. An explicit method may need very short steps to keep the fast part stable even after it looks small. This is one reason a differential equation can be called stiff.\n\nMore function calls alone do not prove stiffness, but persistent difficulty is a reason to inspect the model and solver choice. SciPy offers implicit methods such as Radau and BDF for stiff problems. Replacing the solver still requires checking the resulting trajectory and diagnostics.', null,
      'The workshop demonstrates local comparison and rejection only. It is not an implementation of RK45 or a general-purpose stiff solver.'),
    p('Ask a library for values at the observation times',
      'In a real solver call, inspect success and the diagnostic message before treating the returned values as training data. Record the method, tolerances and initial state with the generated trajectory.\n\nRequested output timestamps are also different from internal solver steps. A solver can take many adaptive internal advances and interpolate its result at the requested times. A small output table does not imply that only a few evaluations were performed.', null,
      'Keep numerical settings in dataset provenance so that a later simulator revision does not silently change what a trained model learned to reproduce.'),
  ],
  questions:[
    q('For one second, coarse Euler gives 5. Two half steps give midpoint 7.5 and final 5.625.','Which values cover the same elapsed interval?', ['5 and 5.625','5 and 7.5','Only the midpoint and initial state'],0,'The full step and the final value of both half steps reach the same time.'),
    q('Fine=5.625, coarse=5, atol=0.1, rtol=0.01. The estimate is 0.625 and tolerance is 0.15625.','What should this local test do?', ['Reject the attempt','Accept because the fine result is positive','Advance first and reject afterwards'],0,'The estimated local discrepancy exceeds the stated allowance.'),
    tf('A proposed step is rejected.','The retry should begin from the state before that rejected attempt.',true,'Otherwise the rejected numerical change is already incorporated into the trajectory.'),
    q('A state approaches zero while the absolute tolerance stays positive.','Why retain an absolute tolerance?', ['It supplies an error scale when a relative allowance becomes very small','It proves the model’s physics','It makes every timestep stable'],0,'A meaningful absolute resolution prevents the relative term alone from demanding an inappropriate near-zero scale.'),
    tf('Every step passed the solver’s local numerical test.',"Passing the local step tests proves that the whole cooling curve agrees with real equipment.",false,'Accumulated numerical error and physical model mismatch remain separate questions.'),
  ],
  practice:[
    challenge('Explain why a proposed step passes or fails',[
      'Write cooling_attempt(state, rate, dt, atol, rtol). The state is temperature above ambient; rate is nonnegative per second. Require finite inputs, positive dt and atol, and nonnegative rtol. Use one full explicit Euler step and two successive half steps from the same starting state.',
      'Return a dictionary with candidate, estimated_error, tolerance and accepted. The candidate is the final result of the two half steps. Estimate its local error by abs(fine-coarse), compare with atol+rtol*abs(fine), and reject nonfinite intermediate results with ValueError. Equality passes this declared test. Print the rounded values and decision for the starter.',
    ],'import math\n\ndef cooling_attempt(state, rate, dt, atol, rtol):\n    pass\n\nr = cooling_attempt(10,.5,1,.1,.01)\nprint(round(r["candidate"],6),round(r["estimated_error"],6),round(r["tolerance"],6),r["accepted"])',
    'import math\n\ndef cooling_attempt(state, rate, dt, atol, rtol):\n    if not all(math.isfinite(v) for v in (state,rate,dt,atol,rtol)) or rate < 0 or dt <= 0 or atol <= 0 or rtol < 0:\n        raise ValueError("Invalid state, rate, interval or tolerance")\n    coarse = state-dt*rate*state\n    midpoint = state-(dt/2)*rate*state\n    fine = midpoint-(dt/2)*rate*midpoint\n    error = abs(fine-coarse)\n    tolerance = atol+rtol*abs(fine)\n    if not all(math.isfinite(v) for v in (coarse,midpoint,fine,error,tolerance)):\n        raise ValueError("The attempted calculation left finite range")\n    return {"candidate":fine,"estimated_error":error,"tolerance":tolerance,"accepted":error <= tolerance}\n\nr = cooling_attempt(10,.5,1,.1,.01)\nprint(round(r["candidate"],6),round(r["estimated_error"],6),round(r["tolerance"],6),r["accepted"])',
    '5.625 0.625 0.15625 False', ['Recompute the second half-step rate at the midpoint result.','A threshold comparison needs the allowed error and estimated error in the correct order.'],[
      ['A shorter interval passes','r = cooling_attempt(10,.5,.1,.1,.01)\nassert r["accepted"] and abs(r["candidate"]-9.50625) < 1e-10'],
      ['An equilibrium stays fixed','r = cooling_attempt(0,.5,10,.001,.01)\nassert r["candidate"] == 0 and r["estimated_error"] == 0 and r["accepted"]'],
      ['Absolute allowance near zero','assert cooling_attempt(.001,.5,1,.0001,.01)["accepted"]'],
      ['Reject an invalid interval','try:\n    cooling_attempt(10,.5,0,.1,.01)\nexcept ValueError:\n    pass\nelse:\n    raise AssertionError("A zero interval was accepted")'],
    ],{question:'Did the refined numerical result earn the right to advance the clock?'}),
    challenge('Retry without carrying the rejected state forward',[
      'Write accepted_cooling_step(state, rate, dt, atol, rtol, max_halvings). Use the same scalar Euler step-doubling comparison as the preceding challenge. On failure, halve the proposed interval and retry from the original state. Return (accepted_dt, accepted_candidate, rejection_count).',
      'Require finite valid inputs as before and a nonnegative integer max_halvings. If the initial attempt and all allowed shortened retries fail, raise RuntimeError. No rejected state advances time. Print the interval, rounded candidate and rejection count for the starter. This is one accepted advance, not an entire adaptive solver.',
    ],'import math\n\ndef accepted_cooling_step(state, rate, dt, atol, rtol, max_halvings):\n    pass\n\nh,y,rejections = accepted_cooling_step(10,.5,1,.01,0,10)\nprint(h,round(y,6),rejections)',
    'import math\n\ndef accepted_cooling_step(state, rate, dt, atol, rtol, max_halvings):\n    if not all(math.isfinite(v) for v in (state,rate,dt,atol,rtol)) or rate < 0 or dt <= 0 or atol <= 0 or rtol < 0 or type(max_halvings) is not int or max_halvings < 0:\n        raise ValueError("Invalid adaptive-step inputs")\n    for rejected in range(max_halvings+1):\n        coarse = state-dt*rate*state\n        midpoint = state-(dt/2)*rate*state\n        fine = midpoint-(dt/2)*rate*midpoint\n        error,tolerance = abs(fine-coarse),atol+rtol*abs(fine)\n        if not all(math.isfinite(v) for v in (coarse,midpoint,fine,error,tolerance)) or dt == 0:\n            raise RuntimeError("A finite advancing calculation was not possible")\n        if error <= tolerance:\n            return dt,fine,rejected\n        dt /= 2\n    raise RuntimeError("Rejection limit reached")\n\nh,y,rejections = accepted_cooling_step(10,.5,1,.01,0,10)\nprint(h,round(y,6),rejections)',
    '0.125 9.384766 3', ['A rejected attempt changes only the proposed dt. Keep the original state for the next attempt.','The initial attempt plus max_halvings shortened attempts are allowed. A failure after that bound must be explicit.'],[
      ['No rejection when already within tolerance','assert accepted_cooling_step(0,.5,1,.01,0,0) == (1,0,0)'],
      ['Retry begins from the unchanged original state','h,y,n = accepted_cooling_step(10,.5,1,.01,0,10)\nassert h == .125 and n == 3 and abs(y-9.384765625) < 1e-12'],
      ['Enforce the work bound','try:\n    accepted_cooling_step(10,.5,1,.01,0,0)\nexcept RuntimeError:\n    pass\nelse:\n    raise AssertionError("A rejected attempt escaped its bound")'],
    ],{question:'Can Botie shorten an unsuccessful interval without accepting its error first?'}),
  ],
  build:construction('Let a cooling step explain its own rejection',
    'Botie’s fixed-step simulator needs to identify intervals that are too coarse before using their states as training targets.',
    'Build a full Euler step and, on a separate branch, two consecutive half steps over the same interval. Compare their difference with the absolute-plus-relative tolerance. Return the candidate, discrepancy, tolerance and zero-or-one acceptance using Show the step comparison.',
    {state:'Temperature above ambient',rate:'Cooling rate per second',dt:'Proposed seconds to advance',atol:'Absolute error allowance',rtol:'Relative error allowance'},[
      sample('A small proposed advance',{state:10,rate:.5,dt:.1,atol:.1,rtol:.01},{candidate:9.50625,estimated_error:.00625,tolerance:.1950625,accepted:1}),
      sample('A full second trips the old fixed-step assumption',{state:10,rate:.5,dt:1,atol:.1,rtol:.01},{candidate:5.625,estimated_error:.625,tolerance:.15625,accepted:0}),
      sample('A state close to equilibrium',{state:.001,rate:.5,dt:1,atol:.0001,rtol:.01},{candidate:.0005625,estimated_error:.0000625,tolerance:.000105625,accepted:1}),
    ],adaptiveReport,
    'The same elapsed interval receives two numerical estimates, and a stated tolerance decides whether this attempted advance is accepted.',
    "This scalar Euler comparison makes a local acceptance decision. A complete trajectory still needs a global error check and evidence for the physical cooling law; RK45 uses a different numerical method."),
  journey:journey('The simulator’s old fixed timestep misses a rapid change that its learned training target must represent.',
    'Build an acceptance test around the old update',"Start with the existing Euler update. Add a branch that evaluates the rate again at a midpoint, then compare both routes before accepting either result.",'A failed attempt has a visible numerical reason rather than silently entering the training trajectory.',
    predict('The proposed interval grows from a tenth of a second to one second','Will the discrepancy remain inside the same absolute-plus-relative tolerance?','The larger interval is rejected. Retry it from the unchanged starting state.'),
    [connection('simulation-time-steps','Expose a finite numerical update','The same update becomes a component inside a check of its local approximation.'),connection('data-artifact-lineage','Keep the procedure that produced training records','Solver method and tolerance belong beside the simulator version and generated data.')],
    'What separate evidence would tell us whether the physical cooling law is wrong?',
    'Track local numerical acceptance separately from complete-trajectory error and agreement with measured equipment.',undefined,
    ['The fine branch must take its second half step from the midpoint output, not from the original state again.','Compute the error magnitude and tolerance on separate branches. For Threshold gate, supply tolerance first and error second so acceptance means the allowance is at least the estimate.']),
  fresh:fresh('A faster cooling rate exposes a shorter acceptable interval',
    'Botie now starts at excess temperature four with rate one per second and proposed interval 0.2 seconds. Absolute tolerance is 0.01 and relative tolerance is zero. Predict the report before running it.',
    {state:4,rate:1,dt:.2,atol:.01,rtol:0},{candidate:3.24,estimated_error:.04,tolerance:.01,accepted:0},
    'Changing the dynamics changes the numerical disagreement; the old accepted interval is not a universal property of the simulator.'),
});

adaptiveSteps.parts[7].references = [{
  title:'Request an adaptive trajectory from SciPy',
  description:['Use this optional library reference after inspecting the teaching comparison. RK45 uses its own embedded method and internal error control; it does not run the Euler controller from the workshop.'],
  language:'python',
  code:'from scipy.integrate import solve_ivp\n\nresult = solve_ivp(\n    lambda t,y: -0.5*y,\n    (0.0,1.0), [10.0],\n    method="RK45", rtol=1e-7, atol=1e-9,\n    t_eval=[0.0,0.5,1.0],\n)\nif not result.success:\n    raise RuntimeError(result.message)\nprint(result.t)\nprint(result.y[0])\nprint("function evaluations",result.nfev)',
  setup:['Run in a separate environment with SciPy installed. The course’s browser challenges use Python and NumPy and do not require SciPy.','The derivative function receives time and the current state array, and returns an array with the same shape.'],
  interpretation:['The returned state array has one row for this single state and one column for each requested output time.','t_eval chooses stored output times; it does not force the adaptive solver to take exactly those internal steps. Check success and preserve the numerical settings with generated records.'],
  source:{title:'SciPy solve_ivp documentation',url:'https://docs.scipy.org/doc/scipy/reference/generated/scipy.integrate.solve_ivp.html'},
  checkedOn:'2026-10-28',
}];

adaptiveSteps.parts[1].examples = [example(
  'Use the midpoint state for the second half step',
  'Each variable below is one floating-point number. The state is excess temperature above the surrounding air, the rate is per second and the half-step interval is in seconds. The second update reads the midpoint value it has just calculated.',
  'temperature = 10.0\ncooling_rate = 0.5\nhalf_step = 0.5\nmidpoint = temperature - half_step * cooling_rate * temperature\nendpoint = midpoint - half_step * cooling_rate * midpoint\nprint(midpoint)\nprint(endpoint)',
  '7.5\n5.625',
  'The first printed state belongs to the midpoint. The second belongs to the end of the full interval. The challenges add a coarse comparison, an acceptance decision and a retry policy around these same updates.',
)];

// Keep the earlier reading bookmark after making its heading more explicit.
adaptiveSteps.parts[7].id = '8-ask-a-library-for-the-trajectory-not-just-its-final-array';

const records = [stableNormalisation,parameterEvidence,gradientChecks,adaptiveSteps];
stableNormalisation.technicalStart = stableNormalisation.parts[2].title;
for (const [record,after] of [[stableNormalisation,3],[parameterEvidence,4],[gradientChecks,3],[adaptiveSteps,4]]) {
  record.checkpoints[0].after = record.parts[after-1].title;
}
for (const record of records) {
  for (const checkpoint of record.checkpoints ?? []) {
    const end = record.parts.findIndex(part => part.title === checkpoint.after) + 1;
    if (end < 1) throw Error(`Missing checkpoint anchor for ${record.id}`);
    checkpoint.title = `Questions on Parts 1 to ${end}`;
  }
  record.reading.practiceTitle = `Practice. ${record.practice[0].title}`;
}
export default records;
