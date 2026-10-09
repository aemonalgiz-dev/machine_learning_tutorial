import { view, exercise, s, op, sample, before, construction } from "./authoring.mjs";
import { py, worked, lessonPart as p, question as q, numpyHistory as h, pythonSection as section } from "./numpy-authoring.mjs";

const lessons = [
  {
    id:"numpy-numerical-checks",title:"When Two Calculations Almost Agree",section,topic:"Keep the Calculation Trustworthy",
    blurb:"A tiny rounding difference, a missing observation, and a wrongly shaped result are different problems. We need checks that distinguish them before trusting a numerical answer.",
    openingTitle:"Did the Method Fail, or Did We Ask the Wrong Check?",
    opening:["Botie converts a report, then reverses the conversion to check the original readings. The recovered numbers may differ by a tiny rounding amount. An exact comparison can reject a perfectly useful calculation, but accepting every small-looking difference would also be careless.","We need to choose what agreement means for the task. That includes the arrangement of the result, the kind of numbers it stores, whether its entries are finite, and how much numerical error we allow."],
    prerequisites:[before("One Calculation for a Whole Report","numpy-vectorisation")],
    history:h("Representing Real Quantities With Finite Storage","A computer has a finite number of bits for each stored numerical value. Many decimal fractions therefore cannot be represented exactly in binary floating-point storage. Repeated arithmetic must round intermediate results.","NumPy exposes data types, finite-value checks, and approximate comparisons so a program can account for those limitations. The tolerance is part of our numerical contract, not a way to declare every discrepancy harmless.",[["Numerical data types","user/basics.types.html"],["Approximate comparisons","reference/generated/numpy.isclose.html"],["Comparing complete arrays","reference/generated/numpy.allclose.html"]]),
    intuition:[view("Keep the expected result","We want a converted reading to match its reference closely.",[["Reference",["20"]],["Calculated",["20.0001"]]]),view("State an allowed difference","An absolute tolerance is measured in the result's own units.",[["Allowed absolute error",["0.001"]]]),view("Check the whole contract","Agreement includes layout and usable values, not only a similar printed number.",[["Checks",["shape","finite values","tolerance"]]])],
    parts:[
      p("1. Choose Storage Before Losing Information","The dtype controls the representation used for every entry in an ordinary numerical array. Assigning a fraction into integer storage discards its fractional part. Converting the array afterwards cannot recover information that has already been lost.\n\nFixed-width integer types also have limits, unlike Python's arbitrary-precision integers. Choose a type that can represent the required range. Narrowing a type merely to save memory can change the calculation.",[
        worked("Convert before storing fractional corrections","astype creates a converted array by default. np.iinfo reports the range of an integer type; it does not change that type's limits.",`integer_report = np.array([12,18,24], dtype=int)
integer_report[0] = 12.5
float_report = np.array([12,18,24], dtype=float)
float_report[0] = 12.5
print(integer_report.tolist())
print(float_report.tolist())
print(np.array([12,18]).astype(float).tolist())
print(np.iinfo(np.int8).max)`,"[12, 18, 24]\n[12.5, 18.0, 24.0]\n[12.0, 18.0]\n127","The integer assignment lost the half-degree reading. Choose floating-point storage before the correction. An eight-bit signed integer cannot represent a count above the printed limit.")
      ]),
      p("2. Distinguish Absence From a Measured Zero","NaN means not a number. It can mark an absent numerical observation or result from invalid arithmetic. Infinity can result from an unbounded or invalid numerical calculation. Neither is an ordinary finite thermometer reading.\n\nNaN does not compare equal to itself. Use isnan to identify it and isfinite to require an ordinary finite value. Replacing these values is a modelling decision, so detecting them must come before silently filling them.",[
        worked("Inspect the invalid positions explicitly","We keep a real zero beside a missing marker and an infinity. nanmean ignores NaNs, but it does not generally ignore infinities; we use a separate finite mask when that is the intended selection.",`report = np.array([0., np.nan, 18., np.inf])
print(np.isnan(report).tolist())
print(np.isfinite(report).tolist())
print(report[np.isfinite(report)].tolist())
print(np.nanmean(np.array([0., np.nan, 18.])))`,"[False, True, False, False]\n[True, False, True, False]\n[0.0, 18.0]\n9.0","The measured zero stays in the selected report. Ignoring missing entries changes which observations contribute; it does not prove the remaining observations represent the missing ones. An all-missing mean is still undefined.")
      ]),
      p("3. Choose an Absolute and a Relative Tolerance","An absolute tolerance permits a fixed error in the result's units. A relative tolerance permits an error proportional to the reference value. np.isclose compares the difference with their combined allowance, using the second argument as the reference.\n\nUse an explicit absolute tolerance near zero, and choose it for the required precision. allclose asks whether every aligned comparison passes. array_equal instead checks exact shape and value equality.",[
        worked("Inspect rounding, then apply a stated tolerance","The first comparison exposes a familiar binary rounding difference. For the temperature checks we allow an absolute error of one thousandth of a degree and no relative allowance.",`print(0.1 + 0.2 == 0.3)
print(np.isclose(0.1 + 0.2, 0.3, rtol=0, atol=1e-12))
actual = np.array([20.0001, 18.01])
expected = np.array([20., 18.])
print(np.isclose(actual, expected, rtol=0, atol=0.001).tolist())
print(np.allclose(actual, expected, rtol=0, atol=0.001))`,"False\nTrue\n[True, False]\nFalse","One temperature passes and the other does not. Increasing the tolerance until both pass would change the requirement instead of diagnosing the discrepancy.")
      ]),
      p("4. Check the Shape Before Comparing Values","Approximate comparisons can broadcast compatible inputs. That is useful for some numerical checks but dangerous if a wrong result shape is supposed to fail. Confirm shape and finiteness first, then compare values.\n\nPython's assert raises an AssertionError when a condition is false. It is useful in these learning checks and tests. For validation that must run in a deployed program, use an explicit condition and raise an error, because Python can disable assertions when run with optimisation.",[
        worked("Make three independent expectations explicit","The wrong-shaped reference can broadcast and agree numerically, so agreement alone does not establish that our function returned the required vector. The assertions check the correctly shaped result separately.",`actual = np.array([20., 20.])
wrong_shape = np.array([[20.], [20.]])
print(np.allclose(actual, wrong_shape))
print(actual.shape == wrong_shape.shape)
expected = np.array([20., 20.])
assert actual.shape == expected.shape
assert np.isfinite(actual).all()
np.testing.assert_allclose(actual, expected, rtol=0, atol=0.001)
print("Shape, finite values, and tolerance checked.")`,"True\nFalse\nShape, finite values, and tolerance checked.","The testing helper raises an error when its numerical check fails and returns normally when it passes. A separate shape check makes our intended contract clear regardless of a comparison helper's broadcasting rules.")
      ])
    ],
    quiz:[q("What happens to the fractional part?","readings = np.array([12,18,24], dtype=int)\nreadings[0] = 12.5",["It is stored exactly","It is discarded by integer storage","The whole array automatically becomes floating point"],1,"Assignment uses the existing integer dtype. Convert or create floating-point storage before writing a fraction."),q("Which mask keeps the measured zero but excludes both invalid entries?","report = np.array([0.,np.nan,18.,np.inf])",["report != 0","report == np.nan","np.isfinite(report)"],2,"Zero is finite; NaN and infinity are not. Equality is not how we identify NaN."),q("Which temperature comparison passes the stated tolerance?","actual = np.array([20.0001,18.01])\nexpected = np.array([20.,18.])\n# rtol=0, atol=0.001",["Only the first","Only the second","Both"],0,"The first absolute difference fits the supplied allowance; the second does not."),q("What must we check before accepting these as matching vectors?","actual = np.array([20.,20.])\nexpected = np.array([[20.],[20.]])\nprint(np.allclose(actual,expected))",["Only the number of printed decimal places","That the shapes match our contract","That both arrays contain twenty somewhere"],1,"allclose can broadcast these arrays. A matching numerical comparison does not repair the wrong shape.")],
    practice:[exercise("Which recovered readings meet the precision requirement?",["Use no relative allowance and an absolute tolerance of 0.001. Print the Boolean list of passing entries, then whether all entries pass."],py("actual = np.array([10.0004,20.002,30.0001])\nexpected = np.array([10.,20.,30.])\n# Keep the specified tolerance.\n"),py("actual = np.array([10.0004,20.002,30.0001])\nexpected = np.array([10.,20.,30.])\nclose = np.isclose(actual,expected,rtol=0,atol=0.001)\nprint(close.tolist())\nprint(close.all())"),"[True, False, True]\nFalse",["isclose returns one Boolean per aligned comparison.","Use all to ask whether every position passed."]),exercise("Can Botie keep valid readings without losing zero?",["Select only finite entries. Print the selected list, followed by its mean with one decimal place."],py("report = np.array([0.,np.nan,12.,np.inf,18.])\n# Detect unusable numerical entries before averaging.\n"),py("report = np.array([0.,np.nan,12.,np.inf,18.])\nvalid = report[np.isfinite(report)]\nprint(valid.tolist())\nprint(f'{valid.mean():.1f}')"),"[0.0, 12.0, 18.0]\n10.0",["isfinite excludes both NaN and infinity.","A measured zero belongs in both the total and the count."])],
    build:construction("Check the largest recovery error","Botie has original and recovered temperatures in matching order. Every recovered value must be within a supplied absolute tolerance.","Find the absolute difference at each position, then its largest value. Return 1 if that largest error is no greater than the tolerance, otherwise 0.",{actual:"Recovered readings",expected:"Reference readings",tolerance:"Allowed absolute difference"},[sample("Every entry close",{actual:[20.0001,18.0002],expected:[20,18],tolerance:.001},1),sample("One entry too far",{actual:[20.0001,18.01],expected:[20,18],tolerance:.001},0),sample("Exact boundary",{actual:[2.25,3],expected:[2,3],tolerance:.25},1)],op("gate",s("tolerance"),op("maximum",op("absolute",op("subtract",s("actual"),s("expected"))))),"The largest error represents the worst entry. Putting tolerance first in the threshold comparison includes equality at the boundary.","Workshop inputs are finite, equally sized vectors. Python adds shape, dtype, missing-value, and relative-tolerance checks.")
  },
  {
    id:"numpy-functions",title:"Give a Reusable Calculation a Clear Contract",section,topic:"Keep the Calculation Trustworthy",
    blurb:"Copying a calculation into every exercise makes mistakes hard to repair. We will put the rule in a function, state what its inputs mean, and check it on more than one report.",
    openingTitle:"Can We Explain the Rule Once and Use It Again?",
    opening:["Botie keeps converting new greenhouse reports. If we copy the same calculation into each program, one copy may use a different offset or quietly change the original data. A named function gives the rule one place to live.","The name alone is not enough. The function needs a clear agreement about its inputs, output shape, units, and treatment of invalid data. We will build that agreement as part of the code."],
    prerequisites:[before("When Two Calculations Almost Agree","numpy-numerical-checks")],
    history:h("Making Numerical Routines Reusable Without Losing Their Assumptions","Reusable numerical routines let programmers test one implementation and call it from many calculations. Their usefulness depends on the caller and the routine agreeing about dimensions, units, and valid inputs.","NumPy's array conversion and testing interfaces support those contracts. They let a Python function accept array-like input, validate its layout, and compare a result with a small independently checked example. The function remains responsible for its scientific assumptions.",[["Converting array-like inputs","reference/generated/numpy.asarray.html"],["Testing numerical arrays","reference/routines.testing.html"]]),
    intuition:[view("Name the input meaning","The function receives Celsius readings in their original greenhouse order.",[["Input",["12","18","24"]]]),view("Keep the rule in one place","Scale each entry, then shift the zero point.",[["Scale",["1.8"]],["Offset",["32"]]]),view("Check a second report","A useful function works on values beyond its first demonstration.",[["Reference Celsius",["0","100"]],["Expected Fahrenheit",["32","212"]]])],
    parts:[
      p("1. Separate a Function Definition From a Call","def introduces a function. Its parameters name the inputs inside the function; the indented body describes the work. Defining it does not yet perform the calculation. A call supplies actual arguments. return sends a result back to the caller.\n\nPrinting and returning are different: print displays something; return makes the result available to the next calculation. A function that only prints cannot be used as a numerical result in the same way.",[
        worked("Define the conversion, then use its returned array","asarray accepts a list or array and requests floating-point values. The arithmetic creates the output without modifying the incoming readings.",`def to_fahrenheit(celsius):
    values = np.asarray(celsius, dtype=float)
    return values * 1.8 + 32

first = to_fahrenheit([12,18,24])
reference = to_fahrenheit([0,100])
print(np.round(first,1).tolist())
print(reference.tolist())`,"[53.6, 64.4, 75.2]\n[32.0, 212.0]","The function has one local parameter, but two calls provide different data. Neither call needs a separate copy of the conversion rule.")
      ]),
      p("2. Reject an Input That Does Not Match the Promise","Suppose the function promises one nonempty vector of finite readings. A matrix, an empty vector, or a NaN should produce a useful error. Check these conditions before performing the calculation.\n\nA raise statement stops the function with an exception. ValueError is appropriate when an argument's value or arrangement is unsuitable. A caller can catch a particular exception with try and except when it has a meaningful response.",[
        worked("Make the failed assumption visible","The three checks are separate because their error messages describe different problems. len is not a substitute for ndim: a matrix also has a length.",`def checked_readings(values):
    array = np.asarray(values, dtype=float)
    if array.ndim != 1:
        raise ValueError("Supply one vector of readings.")
    if array.size == 0:
        raise ValueError("Supply at least one reading.")
    if not np.isfinite(array).all():
        raise ValueError("Every reading must be finite.")
    return array

print(checked_readings([0,18]).tolist())
try:
    checked_readings([[12,18]])
except ValueError as error:
    print(str(error))`,"[0.0, 18.0]\nSupply one vector of readings.","The all reduction turns the finite mask into one Boolean, so Python's not is appropriate here. The error describes the input contract instead of letting a later shape failure obscure it.")
      ]),
      p("3. Return the Reference Along With the Result","Some calculations first learn a reference, then apply it elsewhere. If Botie centres each new report on its own average, comparisons no longer share the same reference. Learn from the training readings once and pass that value to the next operation.\n\nA function can return more than one result in a tuple. The caller can unpack that tuple into names that keep their meanings distinct.",[
        worked("Keep the fitted reference separate from the new report","This example accepts already validated, nonempty finite vectors. The training average is learned before the new report is transformed.",`def centre_from_training(training, report):
    training = np.asarray(training, dtype=float)
    report = np.asarray(report, dtype=float)
    reference = training.mean()
    return reference, report - reference

reference, centred = centre_from_training([10,14], [12,18])
print(reference)
print(centred.tolist())`,"12.0\n[0.0, 6.0]","The reference is one scalar and the centred report is an array. Returning both makes it possible to inspect the fitted value and reuse it without recalculating it from later observations.")
      ]),
      p("4. Test More Than the First Demonstration","A check should describe what the function must do, not merely repeat the same implementation. Use reference cases with independently known answers, then include a changed input and a boundary case. Check shapes and whether the input was preserved.\n\nA loop is useful here because we want to run a collection of separate test cases. It is not the numerical operation we are trying to vectorise.",[
        worked("Check familiar reference temperatures and input preservation","A test case is a pair of input and expected-output lists. The loop unpacks each pair, calls the function, and checks its contract. The final report only prints if every assertion succeeds.",`def to_fahrenheit(celsius):
    return np.asarray(celsius, dtype=float) * 1.8 + 32

cases = [([0,100],[32,212]), ([-40],[-40])]
for values, expected in cases:
    original = np.array(values, dtype=float)
    saved = original.copy()
    result = to_fahrenheit(original)
    assert result.shape == original.shape
    np.testing.assert_allclose(result, expected, rtol=0, atol=1e-10)
    assert np.array_equal(original, saved)
print("2 cases passed; inputs preserved.")`,"2 cases passed; inputs preserved.","The tests do not fit a model or prove the conversion for every conceivable input. They check concrete expectations that would catch common mistakes in the rule and its handling of arrays.")
      ])
    ],
    quiz:[q("What does the caller receive?","def convert(values):\n    return np.asarray(values, dtype=float) * 1.8 + 32\n\nresult = convert([0,100])",["Only text printed to the screen","The returned numerical array","The function definition itself"],1,"return gives the numerical result back to the caller. This function does not print."),q("Why does this input violate the vector contract?","values = np.array([[12,18]])\n# The function requires ndim == 1.",["It contains a negative number","It has two axes","It contains no readings"],1,"The extra pair of brackets creates a one-row matrix, still a two-dimensional array."),q("Which observations should determine the shared centring reference?","training = np.array([10.,14.])\nreport = np.array([12.,18.])\n# The fitted transformation must be learned from training.",["The training readings","The new report only","Both collections pooled together"],0,"The reference is learned from training and then reused. Re-estimating it from the new report changes the fitted transformation."),q("What does this check protect?","original = np.array([0.,100.])\nsaved = original.copy()\n# Call the conversion, then check:\nassert np.array_equal(original, saved)",["That the result is sorted","That the function is fast","That the input readings were not changed"],2,"Comparing with a saved independent copy detects changes to the input values.")],
    practice:[exercise("Can Botie reuse a conversion in both directions?",["Define to_celsius(fahrenheit) to undo the offset and scale and return a NumPy array.","Call it on the provided list. Print the returned Celsius list rounded to one decimal and then the unchanged input list."],py("fahrenheit = [50.,68.,86.]\n# Define and call the conversion without modifying fahrenheit.\n"),py("fahrenheit = [50.,68.,86.]\ndef to_celsius(values):\n    return (np.asarray(values,dtype=float)-32)/1.8\nprint(np.round(to_celsius(fahrenheit),1).tolist())\nprint(fahrenheit)"),"[10.0, 20.0, 30.0]\n[50.0, 68.0, 86.0]",["A return statement makes the array available to the caller.","Use floating-point array conversion, then undo the offset before the scale."]),exercise("Can a fitted reference stay fixed for a new report?",["Write a function that returns the training mean and the new report centred on that mean.","Print the scalar mean, then the centred report as a list."],py("training = np.array([8.,12.,16.])\nreport = np.array([11.,17.])\n# Return both results from your function.\n"),py("training = np.array([8.,12.,16.])\nreport = np.array([11.,17.])\ndef centre(training, report):\n    reference = training.mean()\n    return reference, report-reference\nreference, centred = centre(training,report)\nprint(reference)\nprint(centred.tolist())"),"12.0\n[-1.0, 5.0]",["Calculate the reference using only training.","A comma in the return can package the scalar and array in a tuple for unpacking."])],
    build:construction("Reuse the training reference on another report","Botie wants a new report described relative to the training average. Replacing that average with the new report's average would change the comparison.","Calculate the mean of the training readings, subtract it from the new report, and collect the reference and transformed report together in that order.",{training:"Training readings",report:"New report"},[sample("First report",{training:[10,14],report:[12,18]},[12,[0,6]]),sample("Different training",{training:[8,12,16],report:[11,17]},[12,[-1,5]]),sample("Changed reference",{training:[20,24],report:[22,25]},[22,[0,3]])],op("pack",op("mean",s("training")),op("subtract",s("report"),op("mean",s("training")))),"The same fitted reference explains every output. Collecting both results mirrors a function returning its reference and transformed array.","Workshop cases satisfy the finite, nonempty vector contract. Python is where we define functions and handle invalid inputs.")
  }
];
export default lessons;
