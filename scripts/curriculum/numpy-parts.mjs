import { part, example, choice, truth } from "./authoring.mjs";

export const numpyStructureQuestions = {
  "numpy-arrays": [
    choice("Botie multiplies a Python list of three readings by two. What does the result contain?", ["Three doubled temperatures", "Six entries with the original sequence repeated", "One total temperature"], 1, "For a Python list, multiplication by a whole number repeats the sequence. A numerical NumPy array would multiply each entry instead."),
    choice("Which structure lets Botie look up a temperature using the key 'north'?", ["A dictionary associating greenhouse names with readings", "A numerical array that automatically knows the greenhouse names", "A scalar containing all three readings"], 0, "A dictionary keeps a value under a key. Our numerical array only knows positions; we supply their greenhouse meaning.")
  ],
  "numpy-axes": [
    choice("Our table's shape is the tuple (2, 3). What does its first entry describe?", ["The first temperature", "The number of day rows", "The total number of readings"], 1, "Shape contains axis lengths, not measurements. Axis zero has two day rows, while axis one has three greenhouse columns."),
    truth("Changing an entry in Monday's NumPy row view can change the original table.", true, "The view shares numerical storage with the original array. We used copy when we wanted independent storage for an experimental change.")
  ],
  "numpy-broadcasting": [
    choice("What does None do in outside[:, None]?", ["Replaces an outside temperature with an unknown value", "Adds an axis of length one", "Removes all outside readings"], 1, "The colon keeps the day entries. None adds a new axis, arranging those entries as one column without inserting new temperatures.")
  ],
  "numpy-masks": [
    truth("An integer index array containing zeros and ones selects readings in the same way as a Boolean mask.", false, "NumPy treats those integers as positions to retrieve. Boolean values instead decide whether each corresponding position should be kept. The lesson's two selections therefore returned different results.")
  ],
  "reproducible-sampling": [
    choice("What is stored in the array returned by rng.integers in our first example?", ["The generator's entire internal state", "The three greenhouse temperatures themselves", "Three integer positions we can use to retrieve readings"], 2, "The generator produces integer choices. We still need to use those positions to retrieve the actual temperatures from the readings array.")
  ]
};

// These examples are complete programs. check-lesson-examples.mjs runs each
// one in a fresh namespace and checks the output displayed beside it.
export const numpyParts = {
  "numpy-arrays": [
    part("1. A Value, a Name, and a Collection",
      "Suppose we only had one thermometer. We could keep its reading under one name and use that name whenever we needed the temperature. Now suppose Botie has a hundred thermometers. Giving every reading its own variable would make even a simple calculation tedious. We need a way to keep related readings together.\n\nA data structure is a way of organising information so that we can find it and work with it. Python gives us several choices. We will start with a list, which keeps items in a sequence. The position of an item is called its index.",
      "Position:      0    1    2\nGreenhouse: North Middle South\nCelsius:      12   18   24",
      "Positions start at zero. Position zero identifies the first reading; it does not mean that the temperature is zero. We have decided that the first position belongs to the north greenhouse.", [
        example("Start with one reading, then keep three together",
          "The equals sign assigns a value to a name. Here, north refers to one number, which we call a scalar. Square brackets with comma-separated items create a list. Putting square brackets after the list's name retrieves an item instead.\n\nThe print function displays what we give it. The len function tells us how many items the list contains. Parentheses hold the information passed to a function.",
          `north = 12
readings = [north, 18, 24]

print(north)
print(readings)
print(readings[0])
print(len(readings))`,
          "12\n[12, 18, 24]\n12\n3",
          "The first line is one number. The second is our collection. The third retrieves the north greenhouse's reading, and the fourth counts the entries. A list can contain other kinds of values too, but this one contains only temperatures."),
        example("Correct one entry without replacing the whole report",
          "Suppose the middle thermometer was misread, and Botie also checks a fourth greenhouse. A list is mutable: we can change its contents after creating it. Assigning to an index replaces that item. Calling append adds an item at the end. An operation attached to an object with a dot, such as append, is called a method.\n\nA slice retrieves a range of positions. The starting position is included and the stopping position is excluded. This example asks for positions one and two.",
          `readings = [12, 18, 24]
readings[1] = 19
readings.append(21)

print(readings)
print(readings[1:3])`,
          "[12, 19, 24, 21]\n[19, 24]",
          "The corrected reading stays in the middle greenhouse's position. The fourth greenhouse goes at the end. Taking the slice does not remove entries from the original list. Each worked example on these pages starts with its own data, so this correction does not carry into the next example.")
      ]),
    part("2. Apply the Rule One Reading at a Time",
      "Before asking Python to calculate for a whole collection, let's work through one reading. Celsius and Fahrenheit use different sized degrees and different zero points. We first multiply by the scale between their degree sizes. Then we add the offset between their zero points.",
      "North:  (12 × 1.8) + 32 = 53.6\nMiddle: (18 × 1.8) + 32 = 64.4\nSouth:  (24 × 1.8) + 32 = 75.2",
      "These are three separate conversions. We are changing the units of each observation, so we still need one answer per greenhouse.", [
        example("Give each step a name",
          "In Python, the asterisk means multiplication. We can store the intermediate result under a name, then use it in the next instruction. This lets us inspect each step before applying the rule to all three readings.",
          `celsius = 12
scaled = celsius * 1.8
fahrenheit = scaled + 32

print(scaled)
print(fahrenheit)`,
          "21.6\n53.6",
          "The scaled value is only an intermediate result. We must also shift the zero point before reporting Fahrenheit. Both variables here refer to single numbers, not lists.")
      ]),
    part("3. Tell the Computer Which Kind of Number We Need",
      "Our list keeps the readings together, but Python does not interpret every list operation as arithmetic on its entries. We need a numerical collection whose operations have that meaning. NumPy supplies one: the array, whose Python type is called ndarray.\n\nFor the ordinary numerical arrays in these lessons, every entry uses the same data type, or dtype. Integers store whole numbers. Floating-point numbers allow fractional readings, although many decimals are represented approximately. The data type describes how values are stored; it does not record their units.",
      null,
      "We will explicitly request floating-point storage because temperatures and their conversions may contain fractions.", [
        example("Turn the list into a numerical array",
          "Importing NumPy makes its tools available. The name np is a short name we choose for it. The array function takes our Python list and creates an array. The named argument dtype tells it which kind of values to store.\n\nThe dtype attribute reports that choice. The tolist method returns an ordinary Python list, which gives us a convenient way to print the entries. It does not change the array into a list in place.",
          `import numpy as np

readings = [12, 18, 24]
celsius = np.array(readings, dtype=float)

print(celsius.tolist())
print(celsius.dtype)`,
          "[12.0, 18.0, 24.0]\nfloat64",
          "The decimal points show the floating-point values in the returned list. The reported float64 is NumPy's 64-bit floating-point type used here. The three positions still belong to the same three greenhouses."),
        example("The same multiplication sign can do two different things",
          "Let's multiply a list and an array by the same whole number. Before reading the output, consider what each collection is designed to do: the list supports repeating a sequence; the numerical array supports multiplying its entries.",
          `import numpy as np

readings = [12, 18, 24]
celsius = np.array(readings)

print(readings * 2)
print((celsius * 2).tolist())`,
          "[12, 18, 24, 12, 18, 24]\n[24, 36, 48]",
          "Repeating the list gives six entries. Multiplying the array gives three doubled values. If we want to calculate a new temperature for each greenhouse, we need the second behaviour."),
        example("Convert the collection and prepare it for display",
          "Now we can apply the two conversion steps to the array. NumPy performs the arithmetic for each entry. NumPy's round function takes the result and a number of decimal places. We keep that rounded result separately, then turn it into a list for printing.",
          `import numpy as np

celsius = np.array([12, 18, 24], dtype=float)
scaled = celsius * 1.8
fahrenheit = scaled + 32
displayed = np.round(fahrenheit, 1)

print(displayed.tolist())
print(celsius.tolist())`,
          "[53.6, 64.4, 75.2]\n[12.0, 18.0, 24.0]",
          "We have one converted value per greenhouse. These arithmetic expressions produce new arrays, so the original Celsius readings are still available. Rounding is a display choice; it does not make floating-point arithmetic exact.")
      ]),
    part("4. Check the Meaning as Well as the Numbers",
      "A plausible number is not enough. We need the right units, the right order, and the right number of results. A familiar reference temperature helps us check the conversion.",
      "Freezing point: (0 × 1.8) + 32 = 32\nBoiling point at standard atmospheric pressure: (100 × 1.8) + 32 = 212",
      "There is another question our array cannot answer on its own: which entry belongs to which greenhouse? We must keep that information with the report.", [
        example("Use a dictionary when the name is how we find the reading",
          "A dictionary associates a key with a value. Here each key is a greenhouse name, written as a quoted string of text. Its value is the temperature. Curly braces contain the entries, and a colon separates each key from its value.\n\nA list lookup uses a position. This dictionary lookup uses a name. When we later need a numerical array, we can first request the readings in an explicit order.",
          `by_greenhouse = {
    "north": 12,
    "middle": 18,
    "south": 24,
}

print(by_greenhouse["north"])
ordered_readings = [
    by_greenhouse["north"],
    by_greenhouse["middle"],
    by_greenhouse["south"],
]
print(ordered_readings)`,
          "12\n[12, 18, 24]",
          "The dictionary is useful for looking up a named reading; the array is useful for numerical calculations across readings. Neither structure knows that these numbers are Celsius. That meaning still belongs in our variable names, labels, and explanation.")
      ])
  ],
  "numpy-axes": [
    part("1. Give Each Axis a Job",
      "One list was enough for one morning. With several mornings, a flat list would make us remember where each day begins and ends. Instead, let's keep one list per day and put those lists inside another list. This is a nested list.\n\nWe can use this arrangement to create a two-dimensional NumPy array. Its first axis follows the days and its second follows the greenhouses. An axis is a direction in the organisation of an array.",
      "                  North  Middle  South\nMonday              10      20     30\nTuesday             14      22     36",
      "A scalar is one value. A one-dimensional array is a sequence of values. Our two-dimensional array is a table of values, which we can also interpret as a matrix. The number of axes is different from the number of entries.", [
        example("Build the table one row at a time",
          "The outer list contains two items, each of which is itself a list. The first lookup chooses Tuesday's list. The second lookup chooses the middle greenhouse within that list. NumPy accepts these equally long rows as a rectangular numerical array.",
          `import numpy as np

days = [
    [10, 20, 30],
    [14, 22, 36],
]
print(days[1])
print(days[1][1])

temperatures = np.array(days, dtype=float)
print(temperatures.tolist())`,
          "[14, 22, 36]\n22\n[[10.0, 20.0, 30.0], [14.0, 22.0, 36.0]]",
          "The double square brackets in the final output preserve the rows: this is a list containing lists. A Python nested list could have unequal row lengths, but those rows would not form the regular numerical table we need here."),
        example("Read the shape as a tuple of axis lengths",
          "A tuple is an ordered collection whose entries cannot be replaced after it is created. Python commonly writes tuples with parentheses. NumPy reports an array's shape as a tuple: one length for each axis, in axis order.\n\nThe ndim attribute counts axes. The size attribute counts all entries. These describe different things, so let's print each one separately.",
          `import numpy as np

temperatures = np.array([
    [10, 20, 30],
    [14, 22, 36],
])
shape = temperatures.shape

print(shape)
print(shape[0])
print(shape[1])
print(temperatures.ndim)
print(temperatures.size)`,
          "(2, 3)\n2\n3\n2\n6",
          "There are two day rows, three greenhouse columns, two axes, and six temperatures. The shape tuple records the lengths; it contains none of the temperatures. We can index that tuple to read a length, but we cannot replace one of its entries as we could with a list."),
        example("Ask for one reading, one day, or one greenhouse",
          "In a two-dimensional array, the comma inside square brackets separates the row selection from the column selection. A colon by itself means all positions along that axis. So we can choose one row and one column, all columns of a row, or all rows of a column.",
          `import numpy as np

temperatures = np.array([
    [10, 20, 30],
    [14, 22, 36],
])

print(temperatures[1, 1])
print(temperatures[0, :].tolist())
print(temperatures[:, 1].tolist())`,
          "22\n[10, 20, 30]\n[20, 22]",
          "The first result is Tuesday's middle greenhouse reading. The second is all of Monday. The third follows the middle greenhouse across both days. Selecting one row or one column this way leaves a one-dimensional array.")
      ]),
    part("2. Remove the Direction We Combine",
      "To find one mean per greenhouse, we need to combine the days while keeping the greenhouses separate. The days occupy axis zero, so that is the axis we reduce. A reduction combines several entries into a summary.",
      "North:  (10 + 14) / 2 = 12\nMiddle: (20 + 22) / 2 = 21\nSouth:  (30 + 36) / 2 = 33\nResult shape: (3,)",
      "The day axis disappears because its readings have been combined. The remaining entries belong to the three greenhouses.", [
        example("Keep one answer per greenhouse",
          "The mean method calculates an average. Its axis argument says which direction to combine. The result's shape is a one-entry tuple. The trailing comma is how Python distinguishes a one-entry tuple from parentheses around a single number.",
          `import numpy as np

temperatures = np.array([
    [10, 20, 30],
    [14, 22, 36],
])
per_greenhouse = temperatures.mean(axis=0)

print(per_greenhouse.tolist())
print(per_greenhouse.shape)`,
          "[12.0, 21.0, 33.0]\n(3,)",
          "The result has one axis of length three. It is not a table with three rows and an unspecified number of columns. It has no second axis.")
      ]),
    part("3. Ask the Other Question",
      "For one mean per day, we combine the greenhouse axis instead. Reducing axis one leaves the day axis. The same six temperatures now answer a different question.",
      "Monday:  (10 + 20 + 30) / 3 = 20\nTuesday: (14 + 22 + 36) / 3 = 24\nResult shape: (2,)",
      "Neither summary is inherently better. The useful one depends on whether Botie needs a greenhouse comparison or a daily report.", [
        example("Compare a daily summary with a single overall value",
          "Providing axis one gives a result for each day. Leaving out axis asks mean to combine every entry into one scalar. That single number no longer keeps either day or greenhouse separate.",
          `import numpy as np

temperatures = np.array([
    [10, 20, 30],
    [14, 22, 36],
])
per_day = temperatures.mean(axis=1)

print(per_day.tolist())
print(per_day.shape)
print(temperatures.mean())`,
          "[20.0, 24.0]\n(2,)\n22.0",
          "The list has two daily means. The final number averages all six readings. Before writing a reduction, say what one answer should represent and how many answers you need.")
      ]),
    part("4. Predict the Shape Before Running the Code",
      "We now have a way to check whether an operation left us the right kind of result: inspect its shape. That check is useful before reading any particular number. The right shape does not prove the numbers are correct, but the wrong shape can reveal that we answered a different question.\n\nThere is one more detail to understand before editing a selected row. A NumPy slice can be a view, meaning it refers to part of the original array's storage. Giving that view a new variable name does not give it independent data.",
      null,
      "If Botie wants to try a correction without altering the saved readings, we need a copy.", [
        example("A view shares readings; a copy keeps its own",
          "We select Monday's row twice. One selection remains a view. For the other, we call copy to give it its own numerical storage. Then we change the first entry of each selection.",
          `import numpy as np

temperatures = np.array([
    [10, 20, 30],
    [14, 22, 36],
])
monday_view = temperatures[0, :]
monday_copy = temperatures[0, :].copy()

monday_view[0] = 11
monday_copy[0] = 99

print(temperatures[0, :].tolist())
print(monday_copy.tolist())`,
          "[11, 20, 30]\n[99, 20, 30]",
          "Changing the view changed Monday in the original table. Changing the copy did not. The workshop will summarise the readings, and the challenges will calculate both kinds of mean without modifying their inputs.")
      ])
  ],
  "numpy-broadcasting": [
    part("1. Match the Reference to Its Meaning",
      "Each greenhouse needs its own target. We could keep those three targets as a one-dimensional array, as one row of a table, or as three rows with one column. Those arrangements contain the same numbers, but they do not tell NumPy to align them in the same way.\n\nA one-dimensional array has positions along one axis. It has no separate row and column axes, even though printing it may put the entries on one line.",
      null,
      "Let's make all three arrangements explicitly before deciding which one belongs beside our readings.", [
        example("The same values in three different shapes",
          "A flat list creates one axis. A list containing one inner list creates one row. Three inner lists containing one item each create three rows and one column. Printing the shapes makes this distinction visible.",
          `import numpy as np

targets = np.array([10, 20, 30])
target_row = np.array([[10, 20, 30]])
target_column = np.array([[10], [20], [30]])

print(targets.shape)
print(target_row.shape)
print(target_column.shape)
print(target_row.tolist())
print(target_column.tolist())`,
          "(3,)\n(1, 3)\n(3, 1)\n[[10, 20, 30]]\n[[10], [20], [30]]",
          "Our greenhouse targets belong to the columns of the readings table. Both the one-dimensional target array and the one-row version can align those three entries with the three columns. The column version would arrange them along the wrong direction for this example.")
      ]),
    part("2. Subtract the Same Targets From Every Day",
      "We want each target to stay with its greenhouse as Botie moves from Monday to Tuesday. That means subtracting the first target from the first greenhouse on both days, then doing the same for the other greenhouses.",
      "Monday:  [12 - 10, 18 - 20, 24 - 30] = [2, -2, -6]\nTuesday: [14 - 10, 22 - 20, 36 - 30] = [4, 2, 6]",
      "A positive difference means the reading was above target; a negative difference means it was below. We still need a difference for every reading.", [
        example("Keep the reference array small",
          "The subtraction below reuses the targets for both rows. This is broadcasting: NumPy aligns compatible shapes so an operation can use a smaller input across a larger one. We do not need to write a second copy of the targets.",
          `import numpy as np

readings = np.array([
    [12, 18, 24],
    [14, 22, 36],
])
targets = np.array([10, 20, 30])
differences = readings - targets

print(differences.tolist())
print(differences.shape)`,
          "[[2, -2, -6], [4, 2, 6]]\n(2, 3)",
          "The two day rows and three greenhouse columns survive. Broadcasting has reused a reference, not combined observations into a summary.")
      ]),
    part("3. Read the Shape Rule From the Right",
      "NumPy compares axis lengths starting from the right of each shape. Two lengths can work together if they match or if one is one. A missing leading axis acts like an axis of length one. This lets our three targets apply to both day rows.\n\nNow suppose the reference is the outside temperature for each day. Each reference must apply across a whole row. We therefore need two rows with one entry each. A flat two-entry array would instead try to align with our three greenhouse columns.",
      "Greenhouse targets: (2, 3) with    (3,) → (2, 3)\nDay references:     (2, 3) with (2, 1) → (2, 3)\nWrong alignment:    (2, 3) with    (2,) → incompatible",
      "The computer checks the lengths, not the meaning. A square table can conceal an alignment mistake because its row and column counts happen to match.", [
        example("Give each day's reference a column axis",
          "We already used a colon to keep all positions along an axis. In the indexing expression below, None adds a new axis of length one. It does not insert an unknown temperature. The comma separates these two indexing instructions.\n\nWe keep the two day entries, give them a one-column axis, and inspect the result before subtracting. These illustrative outside readings differ from the ones you will use in the challenge.",
          `import numpy as np

readings = np.array([
    [12, 18, 24],
    [14, 22, 36],
])
outside = np.array([6, 10])
outside_column = outside[:, None]

print(outside.shape)
print(outside_column.shape)
print(outside_column.tolist())
print((readings - outside_column).tolist())`,
          "(2,)\n(2, 1)\n[[6], [10]]\n[[6, 12, 18], [4, 12, 26]]",
          "The first outside temperature now aligns with Monday and the second with Tuesday. Adding the axis gives a new view of the same two stored values. It does not copy either temperature three times.")
      ]),
    part("4. Keep Reuse Separate From Reduction",
      "Subtracting a target and averaging the resulting differences answer two different questions. The subtraction asks how far each reading is from its target. The average asks for a summary across several readings.\n\nFollow the shapes as well as the values. Broadcasting can preserve our table, whereas a reduction combines entries along the axis we name.",
      null,
      "The workshop asks for the full table of differences. This next example goes a step further to show what would happen if Botie also requested one summary per greenhouse.", [
        example("One table of differences, then one summary per column",
          "We subtract first, then average over days. The first shape still describes a day-by-greenhouse table. The second describes one entry per greenhouse.",
          `import numpy as np

readings = np.array([[12, 18, 24], [14, 22, 36]])
targets = np.array([10, 20, 30])
differences = readings - targets
average_difference = differences.mean(axis=0)

print(differences.shape)
print(average_difference.shape)
print(average_difference.tolist())`,
          "(2, 3)\n(3,)\n[3.0, 0.0, 0.0]",
          "An average difference of zero does not tell us that every reading was on target. Above-target and below-target readings can cancel. Keep the individual differences when that distinction matters.")
      ])
  ],
  "numpy-masks": [
    part("1. Build One Decision per Observation",
      "Botie needs to know which greenhouses have readings at or above the alert temperature. We could inspect each reading ourselves, but a program needs an explicit decision rule. A comparison asks a question about a value and returns a Boolean: either True or False.\n\nApplying the comparison to an array produces another array with a Boolean at each position. This array of decisions is called a mask. Its entries answer whether to keep a reading; they are not temperatures.",
      "20 ≥ 25 → false\n27 ≥ 25 → true\n25 ≥ 25 → true\n18 ≥ 25 → false",
      "Our boundary counts. A strictly greater-than comparison would omit the reading exactly at the threshold.", [
        example("Compare once, then compare at every position",
          "The Python operator below means greater than or equal to. First we use it on one number, then on an array. The array's dtype is bool because the stored entries are decisions.",
          `import numpy as np

print(27 >= 25)
readings = np.array([20, 27, 25, 18])
mask = readings >= 25

print(mask.tolist())
print(mask.dtype)
print(mask.shape)`,
          "True\n[False, True, True, False]\nbool\n(4,)",
          "The mask has four entries because there are four readings to decide about. We have only created the decisions so far. The original temperatures are still in readings.")
      ]),
    part("2. Use the Decisions to Select Values",
      "We now have two aligned collections: the temperatures and the decisions. Putting the Boolean mask inside the readings' square brackets tells NumPy to keep the positions marked True. For this one-dimensional selection, the mask must have one decision per reading.\n\nA Boolean mask and an array of integer indices are different structures for making a selection. The Boolean array asks yes or no at each position. The integer array names the positions to retrieve, in the order requested.",
      null,
      "The workshop displays decisions as zero and one. In NumPy we must actually use Boolean values for a mask. A numerical array containing zeros and ones would instead be interpreted as positions.", [
        example("Decisions are different from numbered positions",
          "Both selections below are valid Python, but only the first applies our alert rule. In the second, each zero requests the first reading and each one requests the second reading.",
          `import numpy as np

readings = np.array([20, 27, 25, 18])
mask = np.array([False, True, True, False])
positions = np.array([0, 1, 1, 0])

print(readings[mask].tolist())
print(readings[positions].tolist())`,
          "[27, 25]\n[20, 27, 27, 20]",
          "The mask selects two readings. The index array retrieves four entries, including repeats. Using the right values with the wrong data type can therefore ask an entirely different question.")
      ]),
    part("3. Summarise the Selected Group",
      "After selecting the readings, we can count them or calculate their average. Both the total and the count must come from the selected group. The original report's count would give us the wrong denominator.",
      "Selected total = 27 + 25 = 52\nSelected count = 2\nSelected mean = 52 / 2 = 26",
      "An empty selection still has a count of zero, but it has no mean. There are no temperatures to average, so a displayed zero would wrongly suggest an observed temperature.", [
        example("The selection is another numerical array",
          "The selected array has the same numerical data type as the readings. It can have fewer entries, so inspect its size before treating it as the whole report.\n\nIn the last print, an f before a quoted string lets us put an expression inside braces. Python evaluates the expression before the colon. The .1f after the colon asks for its value with one digit after the decimal point.",
          `import numpy as np

readings = np.array([20, 27, 25, 18])
selected = readings[readings >= 25]

print(selected.tolist())
print(selected.size)
print(f"{selected.mean():.1f}")`,
          "[27, 25]\n2\n26.0",
          "The list shows which observations contributed. The next line counts them, and the last summarises them. Boolean selection here creates a copy, so changing this selected array later would not edit readings."),
        example("Keep an empty result distinguishable from a measured zero",
          "On this cooler day, no reading meets the rule. The result is still an array, just one with no entries. The if statement chooses what to do when the count is zero. The double equals sign compares two values; it does not assign a value to a name.",
          `import numpy as np

readings = np.array([19, 21])
selected = readings[readings >= 25]

print(selected.tolist())
print(selected.shape)
if selected.size == 0:
    print("No readings met the alert rule.")
else:
    print(selected.mean())`,
          "[]\n(0,)\nNo readings met the alert rule.",
          "The empty list display and the zero-length shape both say that no items were selected. The indented instruction under if runs when the comparison is true; the instruction under else runs otherwise. We never ask for an average of the empty array.")
      ]),
    part("4. A Filter Changes the Question",
      "The mean of readings above the limit does not describe the whole report without qualification. We deliberately chose warmer readings. That is useful for inspecting alerts, but someone reading the result needs to know which observations contributed.\n\nAnother Python structure, the set, keeps distinct items. It is useful when we care whether a value occurred, but it discards repeated occurrences and does not give us positions to index like a list. That would lose information if we used it to store repeated measurements.",
      null,
      "Let's distinguish asking which temperatures occurred from asking how many readings triggered an alert.", [
        example("Distinct temperatures are not the same as individual readings",
          "These are three separate alert readings, two of which happen to have the same value. Constructing a set keeps that value only once. We use sorted to produce a list for predictable display; the set itself has no sequence order to rely on. The in operator checks membership.",
          `alert_readings = [27, 27, 25]
distinct_temperatures = set(alert_readings)

print(len(alert_readings))
print(sorted(distinct_temperatures))
print(len(distinct_temperatures))
print(27 in distinct_temperatures)`,
          "3\n[25, 27]\n2\nTrue",
          "There were three readings but only two distinct temperatures. A set is appropriate for the second question. Keep the list or numerical array for calculations in which each observation should count.")
      ])
  ],
  "reproducible-sampling": [
    part("1. A Seed Starts a Sequence",
      "We have stored readings in arrays and named readings in dictionaries. Generating random choices requires a different kind of object. A random generator contains a changing internal state and provides methods that use it to produce values. It is not itself the list of values it produces.\n\nA seed gives us a repeatable way to initialise that state. Each draw advances it. Another call to the same generator continues the sequence; creating a new generator with the same setup starts a replay.",
      null,
      "We will create the generator in separate steps so that each piece has a clear purpose.", [
        example("Separate the seed, the generator, and the drawn array",
          "Our seed is one integer. PCG64 is the algorithm that maintains the state and produces random bits. Generator supplies methods for turning those bits into the kinds of draws we request.\n\nThe integers method below requests three positions. Its lower limit is included and its upper limit is excluded. With four readings, the valid positions therefore run from zero through three. The size argument sets the number of requested entries.",
          `import numpy as np

seed = 42
bit_generator = np.random.PCG64(seed)
rng = np.random.Generator(bit_generator)
positions = rng.integers(0, 4, size=3)

print(positions.tolist())
print(positions.shape)`,
          "[0, 3, 2]\n(3,)",
          "The result is an integer array containing three positions. The generator remains a separate object, ready for another request. This output is from the Python environment used by the site's challenges; record the library version and generator when preserving an experiment."),
        example("A new draw and a replay are different requests",
          "First we draw twice from one generator. Then we initialise another with the same algorithm and seed. Passing the PCG64 object directly into Generator combines the two construction steps from the previous example.\n\nThe array_equal function compares two arrays' shapes and entries and returns one Boolean result.",
          `import numpy as np

rng = np.random.Generator(np.random.PCG64(42))
first = rng.integers(0, 4, size=3)
second = rng.integers(0, 4, size=3)

replay_rng = np.random.Generator(np.random.PCG64(42))
replayed = replay_rng.integers(0, 4, size=3)

print(first.tolist())
print(second.tolist())
print(np.array_equal(first, replayed))`,
          "[0, 3, 2]\n[1, 1, 3]\nTrue",
          "The second request continued the first generator's sequence. The separate generator reproduced the first request. Consecutive draws can happen to contain the same values, so inequality is not the definition of a fresh draw. Advancing the generator's state is what makes it a new request.")
      ]),
    part("2. Draw Positions, Then Retrieve Readings",
      "Keeping the positions separates the choice of observations from the retrieval of their values. Once we have the positions, the lookup is completely determined. An integer index array can request the same position more than once, which is useful for sampling with replacement.\n\nSampling without replacement does not repeat a selected position. Bootstrapping deliberately allows repeats; splitting data into disjoint groups should not put the same observation in both groups.",
      "Readings: [10, 20, 30, 40]\nIndices:  [ 1,  1,  3]\nSelected: [20, 20, 40]\nSelected mean = (20 + 20 + 40) / 3 ≈ 26.6667",
      "The repeated reading counts twice in this resample because its position was selected twice. It is not evidence that Botie independently measured that greenhouse twice.", [
        example("Retrieve values in the order the indices request them",
          "The first array holds temperatures. The second holds integer positions into that array. Square brackets apply the recorded choices, including their order and repetitions. We round the displayed mean to four decimal places.",
          `import numpy as np

readings = np.array([10, 20, 30, 40], dtype=float)
indices = np.array([1, 1, 3])
selected = readings[indices]

print(indices.tolist())
print(selected.tolist())
print(np.round(selected.mean(), 4))`,
          "[1, 1, 3]\n[20.0, 20.0, 40.0]\n26.6667",
          "The positions are whole numbers because they identify entries. The selected temperatures are floating-point values because that is what readings stores. We should not turn the index array into a set, since doing so would discard the repeated selection.")
      ]),
    part("3. Keep a Fair Comparison Repeatable",
      "If Botie compares two methods, both should see the same recorded draws before we attribute a changed result to the method. We can keep several draws in one two-dimensional index array: one row per draw, one position per selected observation.\n\nIndexing a one-dimensional readings array with this index table produces a table of readings in the same arrangement. Each index is replaced by the value it selects.",
      null,
      "The two rows below are illustrative draws. The coding challenge will ask you to summarise a different pair.", [
        example("An index table becomes a table of selected readings",
          "The integer table has two draws with three selections each. After retrieval, averaging along axis one combines the selections within each draw. It leaves one mean per draw.",
          `import numpy as np

readings = np.array([10, 20, 30, 40], dtype=float)
indices = np.array([
    [0, 1, 2],
    [1, 2, 3],
])
selected = readings[indices]

print(indices.shape)
print(selected.tolist())
print(selected.shape)
print(selected.mean(axis=1).tolist())`,
          "(2, 3)\n[[10.0, 20.0, 30.0], [20.0, 30.0, 40.0]]\n(2, 3)\n[20.0, 30.0]",
          "The same original readings gave different averages under these two selections. Saving the indices lets us repeat either calculation exactly, provided we also keep the original data and its order.")
      ]),
    part("4. Do Not Select the Seed That Flatters the Model",
      "Trying many seeds and reporting only the best score includes the luck of choosing that run. Decide how to evaluate a method before inspecting those outcomes, and keep final test data separate from development choices.\n\nA reproducible experiment needs more than a seed. Preserve the input data, its ordering, the generator and library version, and the sequence of requests. Keeping the actual selected indices also makes the experiment easier to inspect.",
      "Seed: one starting value\nGenerator: an object with changing state\nIndices: an array of selected positions\nSelected readings: the values at those positions",
      "Those four things play different roles. In practice, we will first replay a draw, then summarise saved selections. A successful replay confirms that we repeated the calculation; it does not establish that the selection represents all the situations our method will face.")
  ]
};
