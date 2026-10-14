import { p, worked, withProgram as show, supplement as add } from './shared.mjs';

export default {
 'numpy-arrays': add('Explain collection behaviour, mutation and rectangular storage before learners use arrays as model inputs.', [
  show(p('Why a List and an Array Give Different Answers', "Suppose Botie wants to double three temperature differences. We put the numbers in a Python list and multiply by two. That sounds reasonable, but Python repeats the list instead of doubling its entries. Why? A list stores references to objects, and its multiplication operation means repeat the collection.\n\nA NumPy array gives multiplication a different meaning: apply it to each entry. We will see both results below. Lists are useful while collecting entries, including records of different lengths. For a rectangular numerical table, an array lets us give the entries a common data type and calculate across them."), worked('Repeat a collection or double its measurements', 'The same three differences go through two operations. Compare the lengths as well as the values.', `readings = [2, 3, 5]
print(readings * 2)
array = np.array(readings, dtype=float)
print((array * 2).tolist())
print(array.shape, array.dtype.kind)`, '[2, 3, 5, 2, 3, 5]\n[4.0, 6.0, 10.0]\n(3,) f', 'The array still represents three measurements. The letter f identifies a floating-point dtype family; it is not a unit such as degrees Celsius.')),
  p('A Second Name Is Not a Second Set of Readings', "Botie saves his readings under another variable name, then changes one value. Both names now show the change. Assignment gave the existing array another name; it did not make a second array.\n\nIf we want to keep the original while trying a correction, we need copy. Give the saved copy a name that tells us what it holds. Later we will look at views, which can also share data, but here we have only one array with two names.", 'original = np.array([12., 18.])\nalias = original\nsaved = original.copy()\nalias[0] = 99\n# original is now [99., 18.]; saved is still [12., 18.]'),
  p('What Should One Position Represent?', `Before building a table, decide whether a row means a greenhouse, a day, or a sensor event. Keep identifiers alongside it. If a sensor has no reading for one day, silently shortening that row does not produce the same measurement table.

A regular numerical array needs a consistent layout. Represent a missing measurement explicitly, or keep irregular records in a more suitable structure until they can be aligned. The array's shape describes the storage layout. Our record of the row and column meanings gives that layout its interpretation.`),
 ]),
 'numpy-axes': add('Carry axis reasoning through retained dimensions and more than two axes.', [
  show(p('Keep the Greenhouse Axis When Subtracting Its Mean', "We have each greenhouse's average. Now we want to subtract it from that greenhouse's reading on every day. There is a small layout problem: a reduction normally removes the axis it combines.\n\nUsing keepdims=True leaves that axis in place with length one. Here we combine the days and keep the greenhouse columns. The result is one row of averages that NumPy can reuse down the table, with each average still in the correct column."), worked('Daily readings relative to each greenhouse', 'Rows are days and columns are north and south greenhouses.', `readings = np.array([[10., 20.], [14., 26.], [12., 20.]])
reference = readings.mean(axis=0, keepdims=True)
print(reference.shape)
print((readings - reference).tolist())`, '(1, 2)\n[[-2.0, -2.0], [2.0, 4.0], [0.0, -2.0]]', 'Each column now measures departure from its own reference. Reducing axis one would answer a different question: the average across greenhouses on each day.')),
  p('Give a Third Axis a Meaning Before Reducing It', `Suppose the report contains two weeks, seven days per week, and three greenhouses. Its axes can mean week, day and greenhouse, in that order. Averaging over days leaves one row of greenhouse averages per week. Averaging over week and day together leaves one average per greenhouse.

There is no universal rule that axis zero means observations. That is a convention we choose for a particular array. Write the axis meanings beside new data, especially when a library expects channels or batches in a particular position.`, 'readings.shape = (2, 7, 3)\nreadings.mean(axis=1).shape = (2, 3)\nreadings.mean(axis=(0, 1)).shape = (3,)'),
 ]),
 'numpy-creation': add('Explain safe allocation and construct a measurement grid rather than merely list constructors.', [
  p('Unfilled Storage Is Not a Measurement', `Botie reserves a table before receiving tomorrow's readings. zeros supplies a known value, but zero could be mistaken for an actual measurement. full can fill the table with NaN to mark that it has not been measured yet. That choice requires a floating-point dtype.

empty has a different purpose: it allocates storage without initialising the values. Use it only when every position will be written before being read. Whatever numbers happen to appear there are not random samples and must never enter an average as observations.`),
  show(p('Build Coordinates and Measurements Separately', "Botie plans to place thermometers along a bed. Before any thermometer reports, we already know where its reading will belong. We can store the positions in one array and reserve a second array for the measurements.\n\nIf we know the endpoints and how many positions we want, linspace gives us that arrangement. If we know the step between positions, arange may be more convenient, though floating-point steps need care near the endpoint. For a fixed sampling schedule, we can also start with integer indices and convert them to times or positions."), worked('Reserve three thermometer positions', 'Botie places thermometers at both ends and the centre of a four-metre bed.', `positions = np.linspace(0, 4, 3)
temperature = np.full(positions.shape, np.nan)
temperature[1] = 21.5
print(positions.tolist())
print(np.isfinite(temperature).tolist())`, '[0.0, 2.0, 4.0]\n[False, True, False]', 'Only the centre has reported. The coordinate at zero metres is legitimate; a zero temperature would not mean unmeasured.')),
 ]),
 'numpy-indexing': add('Resolve paired versus rectangular indexing and the repeated-index update trap.', [
  show(p('Choose Two Cells or a Rectangular Subtable', "Botie asks for the first and last days from the first and last greenhouses. Do we want two particular cells, or every combination of those days and greenhouses? Both are sensible requests.\n\nTwo index arrays used together select pairs: first with first, last with last. To get the rectangular subtable, we can use np.ix_ to make the row and column selections independent. The example below shows both. NumPy accepts either expression, so we need to decide which request we mean before writing it."), worked('Pairs and all combinations', 'Rows are three days; columns are three greenhouse readings.', `a = np.array([[10, 11, 12], [20, 21, 22], [30, 31, 32]])
print(a[[0, 2], [0, 2]].tolist())
print(a[np.ix_([0, 2], [0, 2])].tolist())`, '[10, 32]\n[[10, 12], [30, 32]]', 'The first request returns two cells. The second returns four cells arranged as two rows and two columns.')),
  p('Repeated Destinations Need an Accumulation Rule', `Later, several token positions may refer to the same embedding row. An update must add every contribution to that row. Ordinary advanced-index assignment can read a temporary array and write it back, so repeated positions do not behave like a sequence of additions.

np.add.at performs accumulation at repeated destinations. It is useful when the meaning is explicitly to collect contributions. It does not replace every indexed assignment: assigning a final value and accumulating several changes are different operations.`, 'counts = np.zeros(3, dtype=int)\nnp.add.at(counts, [0, 0, 2], 1)\n# counts: [2, 0, 1]'),
 ]),
 'numpy-reshaping': add('Follow observation identity through reshaping and distinguish stack from concatenate.', [
  show(p('A Valid Shape Can Still Mix Up Our Records', "Botie's logger sent two days of readings from three greenhouses. We can reshape those six numbers into several valid tables. But reshape only follows the sequence of entries and gives it new boundaries. It has no way to know which readings belong to Monday.\n\nTranspose does a different job: it exchanges the existing axes, so the relationships between days and greenhouses remain attached to their positions. This becomes important when we flatten an image or a batch for a model. We need to remember the original axis order to reconstruct it; getting the dimensions right alone does not put every value back where it belongs."), worked('Two different three-by-two tables', 'Use visibly different daily values so we can follow their positions.', `a = np.array([[10, 11, 12], [20, 21, 22]])
print(a.reshape(3, 2).tolist())
print(a.T.tolist())`, '[[10, 11], [12, 20], [21, 22]]\n[[10, 20], [11, 21], [12, 22]]', 'Only the transposed table puts one greenhouse in each row with its two days beside each other.')),
  p('Add a Batch Without Erasing Its Boundary', `concatenate joins along an existing axis. If its inputs are daily tables, joining along axis zero makes a longer table of days. stack creates a new axis, so equal-shaped weekly tables can remain separate weeks.

The choice affects later reductions. A mean over the new week axis compares corresponding positions between weeks; a mean over concatenated days treats all days as one collection. Neither is automatically correct. Use the structure required by the question, and keep calendar labels when a position alone does not identify the observation.`),
 ]),
 'numpy-broadcasting': add('Expose pairwise dimensions and memory costs in a complete distance calculation.', [
  show(p('Compare Every Reading with Every Reference', "For centring, each column needed one reference. Now suppose we want the nearest stored reading to each new reading. We need to compare every query with every reference. How can we keep track of all those pairs?\n\nGive the queries a new reference axis, and give the references a new query axis. Subtracting then produces a table with a position for every pair. NumPy can reuse the inputs without physically repeating them, but it still creates the subtraction result. With many queries and references, that result can take a lot of memory."), worked('Distances between two queries and three references', 'These are one-dimensional positions along the greenhouse bed.', `queries = np.array([1., 4.])
references = np.array([0., 2., 5.])
distance = np.abs(queries[:, None] - references[None, :])
print(distance.tolist())
print(distance.argmin(axis=1).tolist())`, '[[1.0, 1.0, 4.0], [4.0, 2.0, 1.0]]\n[0, 2]', 'Each row belongs to one query. The first query ties between two references, and argmin selects the first minimum. A downstream method needs to decide whether that tie convention is suitable.')),
  p('Estimate the Result Before Allocating It', `For multi-feature observations, the intermediate differences can have query, reference and feature axes. Multiplying those sizes tells us how many numbers the result needs, before considering its dtype.

When that intermediate is too large, process queries in chunks or use an algebraic distance formula that avoids retaining every feature difference. Keep the smaller calculation as a reference test. A shorter expression is not necessarily a smaller calculation.`),
 ]),
 'numpy-masks': add('Distinguish selection from replacement and make empty selections explicit.', [
  show(p('Keep the Day Even When Its Reading Is Missing', "Suppose Wednesday's reading is missing. If we select only the valid readings, Wednesday's position disappears. That is convenient for some summaries, but a plot or forecast could now mistake Thursday for Wednesday.\n\nWe can use np.where to supply a replacement while keeping every position. We also keep the validity mask, which records where the real measurements were. The replacement lets a calculation proceed; the mask tells us which value we still don't know."), worked('Filter for a summary, preserve positions for a report', 'Negative temperatures are allowed here. Only non-finite entries are unavailable.', `readings = np.array([12., np.nan, -2., 18.])
valid = np.isfinite(readings)
print(readings[valid].tolist())
print(np.where(valid, readings, 0.).tolist())
print(valid.tolist())`, '[12.0, -2.0, 18.0]\n[12.0, 0.0, -2.0, 18.0]\n[True, False, True, True]', 'The zero is a chosen placeholder. The mask is what prevents us from treating it as a measurement.')),
  p('What If No Reading Meets the Rule?', `An empty selection is a possible result, not necessarily a broken mask. Botie might ask for temperatures above a threshold on a cool day and find none. Count the selected readings before calculating a mean that requires at least one.

Choose a policy for the caller: return an explicit missing summary, or raise an error if a summary is required. Do not silently report zero. Also keep the original sample size beside group summaries; a mean based on one selected reading has different support from a mean based on a hundred.`),
 ]),
 'numpy-reductions': add('Explain weighted summaries and why averages of averages can fail.', [
  p('Two Daily Means Do Not Tell Us How Many Readings Arrived', `On Monday one sensor reports. On Tuesday three sensors report. Averaging the two daily means gives each day equal influence. Averaging all four measurements gives each reading equal influence. Those answer different questions.

When combining summaries, retain both the sum and the count, or retain a mean and its count. Without that count, we cannot reconstruct the mean across observations. The same mistake appears when averaging scores across unequal batches during training.`),
  show(p('Choose the Weight That Matches the Question', "How much should each daily average contribute? If we want the mean across all the original readings, a day with more readings must count for more. The number of readings provides its weight.\n\nWeighting by a sensor's reliability would answer a different question, so we shouldn't substitute those weights just because we have them. Keep each weight beside the value it belongs to and check that the total weight is positive. We also need to check whether the supplied weights make sense for the question. NumPy can do the arithmetic once we have made that choice."), worked('Combine days with different sample counts', 'Monday has one reading at 10 degrees. Tuesday has three readings whose mean is 20 degrees.', `means = np.array([10., 20.])
counts = np.array([1, 3])
print(float(means.mean()))
print(float(np.average(means, weights=counts)))`, '15.0\n17.5', 'The first number gives equal weight to each day. The second gives equal weight to each underlying reading.')),
 ]),
 'numpy-vectorisation': add('Teach a loop as an executable specification and handle conditional arithmetic safely.', [
  show(p('A Conditional Result Does Not Always Prevent a Bad Calculation', "Botie needs a ratio only where the denominator is nonzero. It is tempting to put the division inside np.where and expect the unwanted positions to be skipped. But Python evaluates that division before where chooses which results to keep. We can still get a division-by-zero warning.\n\nInstead, put the condition on np.divide itself. It accepts a where mask and an output array. We first fill that output with our chosen missing value, then divide only at the allowed positions. The other positions keep the value we supplied."), worked('Divide only where a reading is available', 'A zero denominator is deliberately marked unavailable in this example.', `amount = np.array([6., 8., 10.])
count = np.array([2., 0., 5.])
result = np.full(amount.shape, np.nan)
np.divide(amount, count, out=result, where=count != 0)
print(result.tolist())`, '[3.0, nan, 2.0]', 'The middle output remains the explicit missing value we supplied. No division by zero is needed.')),
  p('Keep the Plain Loop as a Check', `Before replacing a loop, write down what one iteration consumes and produces. Test the array expression against that loop on unequal dimensions, negative values and boundary cases. Two expressions agreeing on a square table is weak evidence when an axis could be wrong.

Vectorisation is useful when it expresses a repeated numerical operation clearly or removes Python iteration overhead. It does not require converting every control-flow decision into a large temporary array. A chunked loop around vectorised arithmetic can be both readable and economical.`),
 ]),
 'numpy-linear-algebra': add('Connect least squares to residuals and distinguish non-uniqueness from solver failure.', [
  show(p('When No Coefficient Can Satisfy Every Measurement', "An exact solve asks for coefficients that satisfy every equation. What if the measurements contain noise and the equations disagree? Then we can look for predictions whose squared residuals have the smallest total. That is the least-squares problem.\n\nWe arrange one observation per row of the design matrix, with a column for each coefficient. A column of ones allows the model to fit an intercept. Once the solver returns its coefficients, let's use them to calculate the predictions and residuals. Those show how the fitted rule behaves on our actual measurements."), worked('Fit a level and a slope to three readings', 'The final observation prevents a perfect straight-line fit.', `x = np.array([0., 1., 2.])
y = np.array([1., 2., 5.])
X = np.column_stack([np.ones(x.size), x])
w, _, rank, _ = np.linalg.lstsq(X, y, rcond=None)
print(np.round(w, 3).tolist())
print(np.round(y - X @ w, 3).tolist())
print(int(rank))`, '[0.667, 2.0]\n[0.333, -0.667, 0.333]\n2', 'Both columns contribute independent information. The nonzero residuals describe disagreement with the fitted line, not a failure to solve the least-squares problem.')),
  p('Repeated Columns Cannot Identify Separate Effects', `If two feature columns are identical, changing one coefficient and compensating with the other can leave every prediction unchanged. A solver can still return a useful prediction rule, but the individual coefficients are not uniquely determined by those rows.

Inspect rank and singular values when this distinction matters. More decimal places do not recover missing information. A regularisation rule can choose among possible coefficients, but that is an additional modelling choice. It does not make the data identify two independent effects.`),
 ]),
 'numpy-numerical-checks': add('Make overflow, scale and numerical stability concrete.', [
  p('A Small Dtype Can Change the Arithmetic', "Image values often arrive as unsigned eight-bit integers. Those integers have a limited range and cannot represent a negative difference. If we subtract before changing the dtype, we may already have lost the answer we wanted. Converting the result afterwards cannot undo that overflow.\n\nWe need a signed or floating-point representation before the subtraction. When adding many values, we also need a type large enough for their total. Python finishing the calculation without an exception does not tell us whether the chosen representation was suitable."),
  show(p('Move Exponentials into a Safe Range', `Later, probabilities will be calculated from exponentials of model scores. Large positive scores can overflow even when the final probabilities are ordinary numbers. Subtracting the largest score leaves every probability ratio unchanged while making the largest exponential one.

This is an example of changing the numerical route while keeping the mathematical quantity. A tolerance check belongs after such a calculation, together with checks for finiteness and the expected shape.`), worked('Normalise two large scores', 'The absolute level of the scores is unnecessary for this normalisation.', `scores = np.array([1000., 1001.])
weights = np.exp(scores - scores.max())
probabilities = weights / weights.sum()
print(np.round(probabilities, 4).tolist())
print(bool(np.isfinite(probabilities).all()))`, '[0.2689, 0.7311]\nTrue', 'The difference between the scores determines their relative probabilities. Computing exp(1001) directly would add a numerical problem without adding information.')),
 ]),
 'reproducible-sampling': add('Separate random streams and sampling uncertainty from seed selection.', [
  show(p('An Extra Draw Can Change the Rest of an Experiment', `A random generator retains state. Drawing a diagnostic example advances that state, so a later training permutation may change even when the initial seed is unchanged. Reproducibility includes the order of requests, not only the seed.

Give independent activities separate generators when we want changes in one activity not to alter another. Record those choices. This is particularly useful when comparing data splits and model initialisations.`), worked('Keep display draws separate from the split', 'The split generator is recreated with the same seed. The display uses another generator.', `split_rng = np.random.default_rng(8)
first = split_rng.permutation(8)
display_rng = np.random.default_rng(9)
_ = display_rng.normal(size=100)
repeat = np.random.default_rng(8).permutation(8)
print(bool(np.array_equal(first, repeat)))`, 'True', 'Extra display draws cannot advance split_rng because the generators have separate state.')),
  p('A Repeatable Estimate Can Still Be Noisy', "A seed lets us repeat one simulated run. How much did that particular run influence our conclusion? To compare training methods, we can use a set of seeds or repeated splits chosen in advance and report how the results vary.\n\nKeep the evaluation question the same across those runs. Drawing again until our preferred method wins would change the comparison. Repetition helps us understand sensitivity to random choices, but a biased dataset or a leaking split still needs to be fixed."),
 ]),
 'numpy-functions': add('Teach mutation contracts and batch-safe function interfaces.', [
  p('Does Calling the Function Change Its Input?', "Botie centres a training array in a function, then gives the original array to a second model. If the function changed its input in place, that second model now receives centred data too. The first function can return the right result and still cause this surprise.\n\nWe need to decide whether changing the caller's array is part of the function's job. If it promises to leave the input alone, create the result separately. If an in-place change is deliberate, say so in the function's documentation so its caller can keep a copy when needed."),
  show(p('Use the Same Reference for Every Incoming Batch', `A reusable transformation should receive the reference it needs rather than quietly learning a new one on every call. Separate fitting the mean from subtracting it. The same transformation can then handle a full test table or one row at a time.

Test that those two routes agree. This catches a common hidden dependency on the current batch, which would make one greenhouse's prediction change when an unrelated greenhouse is submitted beside it.`), worked('Transform together or separately', 'These means were learned previously and remain fixed.', `def centre(X, mean):
    X = np.asarray(X, dtype=float)
    mean = np.asarray(mean, dtype=float)
    if X.ndim != 2 or mean.shape != (X.shape[1],):
        raise ValueError('Expected rows and one mean per column')
    return X - mean

X = np.array([[12., 20.], [18., 22.]])
mean = np.array([10., 18.])
batch = centre(X, mean)
separate = np.concatenate([centre(X[i:i+1], mean) for i in range(len(X))])
print(batch.tolist())
print(bool(np.array_equal(batch, separate)))`, '[[2.0, 2.0], [8.0, 4.0]]\nTrue', 'The function applies the supplied reference. Learning that reference belongs to an earlier step with its own training data.')),
 ]),
 'numpy-saving-data': add('Verify round trips and preserve schema alongside array values.', [
  show(p('Loading Successfully Is Only the First Check', `A file can load and still be the wrong version, have the wrong column order, or contain the wrong dtype. Compare a saved and loaded array's shape, dtype and values. Then check its meaning against the metadata that names its columns and units.

For numerical arrays, prefer formats that preserve these numerical properties directly. Avoid object arrays when plain numeric or string arrays express the data. Loading pickled objects requires trust in the file and is unnecessary for the measurements here.`), worked('Check a numerical round trip in memory', 'BytesIO stands in for a file so this example works in the browser without choosing a local path.', `import io
original = np.array([[12., 50.], [18., 65.]], dtype=np.float64)
buffer = io.BytesIO()
np.save(buffer, original, allow_pickle=False)
buffer.seek(0)
restored = np.load(buffer, allow_pickle=False)
print(restored.shape == original.shape)
print(restored.dtype == original.dtype)
print(bool(np.array_equal(restored, original)))`, 'True\nTrue\nTrue', 'These checks establish numerical preservation. A companion description must still say that the columns are temperature and humidity, in that order.')),
  p('Save the Information Needed to Use the Array Tomorrow', "Imagine opening this dataset in a fresh Python process a month from now. Would we still know which column is temperature, what its units are, and how a missing reading was recorded? Keep those details beside the arrays, along with the period the records came from. For a fitted transformation, save the training reference in its feature order too.\n\nGive changes to the file layout a version that the loader can check. If a version is unsupported, report that explicitly. Guessing the meaning of an unfamiliar two-column file could give us convincing numbers for the wrong calculation."),
 ]),
};
