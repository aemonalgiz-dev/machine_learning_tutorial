import { numpyParts, numpyStructureQuestions } from "./numpy-parts.mjs";
import { numpyQuizContext } from "./numpy-quiz-context.mjs";
import building from "./numpy-building.mjs";
import arranging from "./numpy-arranging.mjs";
import calculating from "./numpy-calculating.mjs";
import reliable from "./numpy-reliable.mjs";
import files from "./numpy-files.mjs";
import { deepenNumpyLessons, numpyApplications } from "./numpy-continuations.mjs";
import { view, choice, truth, exercise, s, op, c, sample, before, construction } from "./authoring.mjs";

const section = "Python and NumPy";
const numpyLessons = [
  {
    id: "numpy-arrays", title: "Giving Measurements a Place", section, topic: "From a measurement to a calculation",
    blurb: "Three thermometers give us three readings. Before we can calculate with them, we need to decide how those readings are stored, which position belongs to which thermometer, and what an operation should do to the collection.",
    openingTitle: "How Do We Give the Computer Our Measurements?",
    opening: ["Suppose Botie checks three greenhouses each morning. Today the thermometers read 12, 18, and 24 degrees Celsius. We can write those readings on paper, but a program needs them in a form it can work with.", "Let's start with one reading, then work out how to keep all three together. Python gives us several ways to organise information. We will see why a list is useful for keeping entries in order, a dictionary is useful for finding a named reading, and a NumPy array is useful for calculating with the readings."],
    prerequisites: [before("The statistics primer", "statistics", "primers")],
    history: {
  "title": "When One Calculation Needed to Work on Many Measurements",
  "sources": [
    {
      "title": "Harris and colleagues: Array programming with NumPy (2020)",
      "url": "https://doi.org/10.1038/s41586-020-2649-2"
    },
    {
      "title": "Python: lists, tuples, sets and dictionaries",
      "url": "https://docs.python.org/3/tutorial/datastructures.html"
    },
    {
      "title": "NumPy's beginner guide",
      "url": "https://numpy.org/doc/stable/user/absolute_beginners.html"
    }
  ],
  "blocks": [
    "Physicists and astronomers wanted to try a calculation interactively, then apply it to a large set of measurements. Rewriting the whole experiment in a low-level language made that awkward. Python was useful for describing the procedure, but ordinary Python containers were not a substitute for efficient numerical arrays.",
    "Numeric brought compiled array operations to Python in the mid-1990s. Numarray later addressed large astronomical images. Their differences split scientific Python software between two array packages; NumPy united their strengths in 2005.",
    "That history explains the combination we will use: a readable Python instruction working on a numerical collection whose repeated arithmetic is handled by compiled routines. Our greenhouse readings let us begin with what each position means before asking the whole array to calculate."
  ]
},
    intuition: [view("Give every greenhouse a position", "Keep the same greenhouse order throughout the calculation. A result in the first position still belongs to the first greenhouse.", [["Greenhouse", ["North", "Middle", "South"]], ["Celsius", ["12", "18", "24"]]]), view("Apply the conversion to each reading", "The conversion needs a scale and an offset. Neither depends on which greenhouse supplied the reading.", [["Scale", ["1.8", "1.8", "1.8"]], ["Offset", ["32", "32", "32"]]]), view("Read the answers in the original order", "We now have the same observations in Fahrenheit. Changing the units has not changed the temperature in any greenhouse.", [["Fahrenheit", ["53.6", "64.4", "75.2"]]])],
    parts: numpyParts["numpy-arrays"],
    quiz: [choice("What does position zero identify in our temperature array?", ["The north greenhouse's reading", "A temperature of zero", "The average of all greenhouses"], 0, "We assigned the north greenhouse the first position. The value stored there is 12; the index and the measurement are different things."), truth("After the conversion we should still have one result per greenhouse.", true, "The scale and offset change each reading's units. They do not combine different observations."), choice("Which mistake could produce plausible numbers with the wrong meaning?", ["Keeping the greenhouse order", "Mixing Celsius and Fahrenheit without recording the units", "Checking a known reference temperature"], 1, "The arithmetic cannot tell us that the input units were inconsistent. We must establish their meaning before calculating.")],
    practice: [exercise("What does Botie read in Fahrenheit?", [
  "The greenhouse logger records Celsius, but the display needs Fahrenheit. Convert every supplied reading with the same scale of 1.8 and offset of 32.",
  "Print one Python list in the original reading order, rounded to one decimal place."
], "import numpy as np\ncelsius = np.array([12., 18., 24.])\n# Convert the readings and print the result.\n", "import numpy as np\ncelsius = np.array([12., 18., 24.])\nprint(np.round(celsius * 1.8 + 32, 1).tolist())", "[53.6, 64.4, 75.2]", [
  "The scale and offset apply to each reading, so NumPy can use the same arithmetic across the array.",
  "Multiply first, then add the offset. Round the resulting array and use .tolist() for the requested display."
]), exercise("Can we recover the original temperatures?", ["A different instrument gives Fahrenheit readings of 41, 68, and 86. Undo the offset first, then undo the scale.", "Print the recovered Celsius readings as a list rounded to one decimal place."], "import numpy as np\nfahrenheit = np.array([41., 68., 86.])\n# Undo the conversion.\n", "import numpy as np\nfahrenheit = np.array([41., 68., 86.])\nprint(np.round((fahrenheit - 32) / 1.8, 1).tolist())", "[5.0, 20.0, 30.0]", ["The last operation in the forward conversion was adding 32. Undo that first.", "Dividing by 1.8 reverses the remaining scale."])],
    build: construction("Convert the greenhouse thermometers", "Botie's greenhouses record Celsius, but the display expects Fahrenheit. We need to convert each reading while preserving its greenhouse position.", "Build a Celsius-to-Fahrenheit converter. Multiply each reading by 1.8, then add 32. It must work on every supplied list.", { readings: "Greenhouse readings in Celsius" }, [sample("Three greenhouses", {readings:[12,18,24]}, [53.6,64.4,75.2]), sample("Reference readings", {readings:[0,100]}, [32,212]), sample("A colder morning", {readings:[-10,5]}, [14,41])], op("add",op("multiply",s("readings"),c(1.8)),c(32)), "Each wire still carries one entry per greenhouse. The multiplication changes the degree size; the addition changes the reference point.", "This is a unit conversion, not a fitted prediction rule.")
  },
  {
    id:"numpy-axes", title:"Which Direction Are We Adding?", section, topic:"From a measurement to a calculation",
    blurb:"A table can hold several greenhouses across several days. Adding across a row answers a different question from adding down a column. We need to keep that distinction when we ask an array to calculate.",
    openingTitle:"Which Average Did We Actually Ask For?",
    opening:["Botie now has two days of temperatures for three greenhouses. We could ask for the average temperature of each greenhouse, or the average across all greenhouses on each day. Both are reasonable questions, but they have different answers.","The entries alone cannot tell the computer which question we mean. We need to describe the table's layout and say which direction the calculation should combine."],
    prerequisites:[before("Giving Measurements a Place","numpy-arrays")],
    history:{
  "title": "Keeping the Meaning of a Scientific Table",
  "sources": [
    {
      "title": "Python: lists, tuples, sets and dictionaries",
      "url": "https://docs.python.org/3/tutorial/datastructures.html"
    },
    {
      "title": "NumPy's array axes and reductions",
      "url": "https://numpy.org/doc/stable/user/quickstart.html"
    },
    {
      "title": "NumPy copies and views",
      "url": "https://numpy.org/doc/stable/user/basics.copies.html"
    },
    {
      "title": "Falkoff and Iverson: APL/360 User’s Manual (1968)",
      "url": "https://softwarepreservation.computerhistory.org/apl/book/196808_APL360%20Users%20Manual.pdf"
    }
  ],
  "blocks": [
    "Once a program could operate on a whole table, it needed a way to say which direction an operation should follow. Combining readings across days answers a different question from combining greenhouses on the same day.",
    "The 1968 APL/360 manual already described reductions along specified array axes. Array languages made the direction part of the operation instead of requiring a separate hand-written loop for each layout. NumPy continues that general approach with its axis argument. We will give the directions ordinary names first: days and greenhouses."
  ]
},
    intuition:[view("Name both directions","Rows are days; columns are greenhouses. Keep these labels in view before reducing anything.",[["Monday",["10","20","30"]],["Tuesday",["14","22","36"]]]),view("Keep the greenhouses separate","Combine the two days within each column. We should end with three answers.",[["North across days",["10","14"]],["Middle across days",["20","22"]],["South across days",["30","36"]]]),view("Or keep the days separate","Combining each row gives a daily summary instead. That leaves two answers.",[["Monday's mean",["20"]],["Tuesday's mean",["24"]]])],
    parts: numpyParts["numpy-axes"],
    quiz:[choice("Which axis must disappear to leave one mean per greenhouse?",["The greenhouse axis","The day axis","Both axes"],1,"We combine observations from different days while keeping greenhouse columns separate."),truth("A result with two entries answers the question about three greenhouse means.",false,"There are three greenhouses. Two entries fit the number of days instead."),choice("What does shape alone tell us?",["Which greenhouse is warmest","The units used","The number of entries along each axis"],2,"Shape gives sizes. We still supply the interpretation of rows, columns, and units.")],
    practice:[exercise("Can you report both kinds of average?",[
  "The table contains two days of measurements from three greenhouses. Rows are days and columns are greenhouses.",
  "Print mean temperature per greenhouse as one list, then mean temperature per day as a second list. Retain the original greenhouse/day order."
],"import numpy as np\ntemperatures = np.array([[10.,20.,30.],[14.,22.,36.]])\n# Print the two summaries.\n","import numpy as np\ntemperatures = np.array([[10.,20.,30.],[14.,22.,36.]])\nprint(temperatures.mean(axis=0).tolist())\nprint(temperatures.mean(axis=1).tolist())","[12.0, 21.0, 33.0]\n[20.0, 24.0]",[
  "For a greenhouse average, combine its measurements across days while keeping one value per column.",
  "mean(axis=0) combines rows; mean(axis=1) combines columns. Convert each result to a list."
]),exercise("What changes when Botie checks two greenhouses for three days?",["Rows still represent days. Print the mean per greenhouse, then the mean per day as lists.","Do not assume that the longer axis is always the greenhouse axis."],"import numpy as np\ntemperatures = np.array([[8.,12.],[10.,16.],[12.,20.]])\n# Keep the meaning of the axes.\n","import numpy as np\ntemperatures = np.array([[8.,12.],[10.,16.],[12.,20.]])\nprint(temperatures.mean(axis=0).tolist())\nprint(temperatures.mean(axis=1).tolist())","[10.0, 16.0]\n[10.0, 13.0, 16.0]",["Changing the number of rows does not change what a row represents.","The first printed list should have two entries; the second should have three."])],
    build:construction("Keep each greenhouse's average", "Botie wants to compare greenhouses over several days. Our rows are days, so a row average would answer a different question.","Build one average per greenhouse. You can swap the table's rows and columns, then average within each resulting row.",{temperatures:"Days by greenhouses"},[sample("Two days",{temperatures:[[10,20,30],[14,22,36]]},[12,21,33]),sample("Three days",{temperatures:[[8,12],[10,16],[12,20]]},[10,16])],op("rowmean",op("transpose",s("temperatures"))),"Swapping rows and columns puts one greenhouse's readings together. Each row average then keeps that greenhouse separate.","All days receive equal weight, and every greenhouse has a reading on every day.")
  },
  {
    id:"numpy-broadcasting", title:"One Reference for Many Rows", section, topic:"Working with whole arrays",
    blurb:"Each greenhouse has its own target temperature. We want to compare every day's readings with those three targets without copying the targets into a new table by hand.",
    openingTitle:"Do We Need to Repeat the Same Reference Every Day?",
    opening:["Suppose the north, middle, and south greenhouses have target temperatures of 10, 20, and 30 degrees. Botie checks them on two days. Each day needs the same three references, in the same order.","We could write those targets beside every row. Instead, we can tell the array calculation that this one target row applies to every day. NumPy calls this matching of compatible shapes broadcasting."],
    prerequisites:[before("Which Direction Are We Adding?","numpy-axes")],
    history:{
  "title": "Repeating a Calculation Without Repeating Its Data",
  "sources": [
    {
      "title": "NumPy broadcasting rules",
      "url": "https://numpy.org/doc/stable/user/basics.broadcasting.html"
    },
    {
      "title": "Oliphant: Guide to NumPy (December 2006)",
      "url": "https://web.mit.edu/dvp/Public/numpybook.pdf"
    }
  ],
  "blocks": [
    "Suppose every row needs the same set of reference temperatures. Storing a complete repeated reference table would hide the fact that those rows share one reference and would use unnecessary memory.",
    "By the 2006 NumPy guide, broadcasting was an established part of how its array operations combined compatible shapes. A small operand could be reused while the calculation moved through the larger one. The reuse is governed by dimensions, so the program still needs us to place the greenhouse references along the correct axis. Matching sizes alone cannot establish that meaning."
  ]
},
    intuition:[view("Start with two days of readings","The greenhouse order is north, middle, south in every row.",[["Monday",["12","18","24"]],["Tuesday",["14","22","36"]]]),view("Supply one target per greenhouse","The target belongs to a column. It does not change with the day.",[["Target",["10","20","30"]]]),view("Keep a difference for every reading","Positive means above target; negative means below target. We still have both days and all three greenhouses.",[["Monday difference",["2","-2","-6"]],["Tuesday difference",["4","2","6"]]])],
    parts: numpyParts["numpy-broadcasting"],
    quiz:[truth("Subtracting our three targets should leave two rows and three columns.",true,"We change each reading independently. We have not averaged or discarded an axis."),choice("Which shape represents one reference per day in this two-day table?",["(3,)","(2, 1)","(1, 2)"],1,"Two rows align with the days. A one-column axis lets each day's reference apply to all three greenhouses."),choice("Why might a square table hide an alignment mistake?",["All square tables have identical entries","Broadcasting adds instead of subtracting","The row count and column count match, so the wrong meaning may still fit the shape"],2,"Shape compatibility checks sizes, not the real-world meaning of the axes.")],
    practice:[exercise("How far is each reading from its greenhouse's target?",[
  "Each column belongs to one greenhouse and targets holds that greenhouse’s reference temperature. Subtract the matching target from every reading in the column.",
  "Print the differences as a nested Python list, keeping day rows and greenhouse columns unchanged. Positive values mean above target; negative values mean below."
],"import numpy as np\nreadings = np.array([[12.,18.,24.],[14.,22.,36.]])\ntargets = np.array([10.,20.,30.])\n# Find each difference.\n","import numpy as np\nreadings = np.array([[12.,18.,24.],[14.,22.,36.]])\ntargets = np.array([10.,20.,30.])\nprint((readings - targets).tolist())","[[2.0, -2.0, -6.0], [4.0, 2.0, 6.0]]",["The last axis in both inputs belongs to greenhouses.","Subtracting the vector directly gives the intended row-wise reuse."]),exercise("What if the reference belongs to each day?",[
  "Rows are Monday and Tuesday; columns are the three greenhouses. The outside reference is 8 on Monday and 15 on Tuesday.",
  "Subtract each day’s outside value from all greenhouse readings in its row. Print the nested differences with the same row and column order."
],"import numpy as np\nreadings = np.array([[12.,18.,24.],[14.,22.,36.]])\noutside = np.array([8.,15.])\n# Give outside an explicit column axis.\n","import numpy as np\nreadings = np.array([[12.,18.,24.],[14.,22.,36.]])\noutside = np.array([8.,15.])\nprint((readings - outside[:, None]).tolist())","[[4.0, 10.0, 16.0], [-1.0, 7.0, 21.0]]",["Each outside reading belongs to a row, so make a column-shaped array.","outside[:, None] keeps the two day entries and adds a one-column axis."])],
    build:construction("Compare greenhouse readings with their targets","Botie needs the difference from each greenhouse's target on every day. The target order matches the greenhouse columns.","Subtract one target per greenhouse from every day's readings. Preserve both the day rows and greenhouse columns.",{readings:"Days by greenhouses",targets:"Target for each greenhouse"},[sample("Two days",{readings:[[12,18,24],[14,22,36]],targets:[10,20,30]},[[2,-2,-6],[4,2,6]]),sample("Two greenhouses",{readings:[[7,15],[9,11],[8,13]],targets:[8,12]},[[-1,3],[1,-1],[0,1]])],op("columnshift",s("readings"),s("targets")),"Each target stays attached to its column as the rows pass through the calculation.","The workshop tool handles a reference vector across rows. It does not implement every possible NumPy broadcasting pattern.")
  },
  {
    id:"numpy-masks", title:"Ask Each Row a Question", section, topic:"Working with whole arrays",
    blurb:"Botie needs the greenhouse readings that reached a temperature limit. A yes-or-no decision for each reading lets us select the relevant observations without losing their order.",
    openingTitle:"Which Readings Need Our Attention?",
    opening:["A greenhouse report includes comfortable temperatures and readings that need attention. We want to see only the readings at or above 25 degrees, while keeping the original collection available.","We can ask the same question of every entry. The answers form another array, containing true or false at each position. This array of decisions is called a mask."],
    prerequisites:[before("Giving Measurements a Place","numpy-arrays"), before("Which Direction Are We Adding?", "numpy-axes")],
    history:{
  "title": "Selecting Observations Without Rewriting the Table",
  "sources": [
    {
      "title": "Python: lists, tuples, sets and dictionaries",
      "url": "https://docs.python.org/3/tutorial/datastructures.html"
    },
    {
      "title": "NumPy indexing and Boolean selection",
      "url": "https://numpy.org/doc/stable/user/basics.indexing.html"
    },
    {
      "title": "Iverson: A Programming Language (1962), original book",
      "url": "https://softwarepreservation.computerhistory.org/apl/book/APROGRAMMINGLANGUAGE.pdf"
    }
  ],
  "blocks": [
    "A numerical record often needs a selection rule: keep observations from one interval, or choose readings that pass a stated check. We need that decision to stay aligned with the observation it describes.",
    "Iverson’s 1962 A Programming Language described compression using a vector of membership decisions to select entries from another vector. That provides an earlier concrete example of array selection expressed through aligned decisions. Our NumPy Boolean mask uses the same useful picture: one true-or-false decision per entry being selected. The result is a selection, so we still have to explain why its condition is appropriate."
  ]
},
    intuition:[view("Keep the full report","Each position belongs to one greenhouse reading. The threshold includes the boundary itself.",[["Reading",["20","27","25","18"]]]),view("Ask the same question four times","A true decision means this reading meets the rule. It is a selection instruction, not a replacement temperature.",[["At least 25?",["false","true","true","false"]]]),view("Keep the selected observations","Only the two readings whose decisions were true survive, in their original order.",[["Selected temperatures",["27","25"]]])],
    parts: numpyParts["numpy-masks"],
    quiz:[truth("The reading at exactly 25 qualifies under our rule.",true,"The rule says at or above 25. A strict greater-than comparison would ask a different question."),choice("What is the right count for the selected mean?",["All four readings","The two readings kept by the mask","The threshold value"],1,"Only the two selected readings contributed to that total."),truth("The mean of the warm subset describes the whole report without qualification.",false,"Selection changed the population being summarised. The result describes only readings meeting the stated rule.")],
    practice:[exercise("Which readings meet Botie's alert rule?",["Select readings at or above 25. Print the selected list, then its count on a separate line."],"import numpy as np\nreadings = np.array([20,27,25,18])\n# Build a mask and select the readings.\n","import numpy as np\nreadings = np.array([20,27,25,18])\nselected = readings[readings >= 25]\nprint(selected.tolist())\nprint(selected.size)","[27, 25]\n2",["The comparison should include equality.","Use the Boolean comparison inside square brackets to select positions."]),exercise("How warm were the readings that needed attention tomorrow?",[
  "Tomorrow’s readings need the same alert threshold: include every value at or above 25.",
  "Print the selected readings in their original order, then their mean with one decimal place. This supplied selection is nonempty."
],"import numpy as np\nreadings = np.array([24,26,30,22,28])\n# Select first, then summarise the selected readings.\n","import numpy as np\nreadings = np.array([24,26,30,22,28])\nselected = readings[readings >= 25]\nprint(selected.tolist())\nprint(f'{selected.mean():.1f}')","[26, 30, 28]\n28.0",["The total and count must both come from the selected array.","This selection is nonempty, so its mean is defined."])],
    build:construction("Find the greenhouse alerts","Botie needs the readings at or above the chosen limit. We should keep the measurements that satisfy the rule, not multiply them by the limit.","Build a mask using the threshold, then use it to select the original readings. Preserve their order and allow an empty result.",{readings:"Greenhouse temperatures",limit:"Alert temperature"},[sample("Boundary included",{readings:[20,27,25,18],limit:25},[27,25]),sample("No alerts",{readings:[19,21],limit:25},[]),sample("New limit",{readings:[23,20,24,22],limit:22},[23,24,22])],op("mask",s("readings"),op("gate",s("readings"),s("limit"))),"The comparison makes the decisions; selection applies those decisions to the original temperatures.","The alert limit is a supplied greenhouse policy. The comparison selects readings under that policy; it neither learns a threshold nor establishes which temperatures are suitable for a particular crop.")
  },
  {
    id:"reproducible-sampling", title:"Can We Repeat the Same Experiment?", section, topic:"Working with whole arrays",
    blurb:"Changing both a model and its sampled observations makes it difficult to explain a changed result. We need to keep track of the random choices so we can repeat a comparison.",
    openingTitle:"Did Our New Method Help, or Did We Draw Easier Examples?",
    opening:["Botie compares two ways of checking greenhouse sensors. If each method sees a different selection of readings, a changed score could come from the method or from the selection. We have changed two things at once.","A reproducible draw lets us hold the selection still while we investigate a change. It does not make that one selection representative of every possible draw. We need both repeatability and an honest account of variation."],
    prerequisites:[before("Ask Each Row a Question","numpy-masks")],
    history:{
  "title": "Giving Simulated Experiments a Repeatable Starting Point",
  "sources": [
    {
      "title": "NumPy random sampling",
      "url": "https://numpy.org/doc/stable/reference/random/index.html"
    },
    {
      "title": "PCG64 and reproducible streams",
      "url": "https://numpy.org/doc/stable/reference/random/bit_generators/pcg64.html"
    },
    {
      "title": "Kern: NEP 19, random number generator policy (2018)",
      "url": "https://numpy.org/neps/nep-0019-rng-policy.html"
    }
  ],
  "blocks": [
    "Simulation users wanted a saved seed to reproduce earlier results, while library developers wanted to improve random-sampling algorithms. Those goals can conflict when a new algorithm consumes the random stream differently.",
    "Robert Kern’s 2018 NumPy proposal described how strict cross-version stream compatibility had obstructed such improvements. It proposed a different compatibility policy alongside the newer separation between the underlying bit generator and distribution sampling. A seed identifies a starting state within a specified setup; it is not a complete record of that setup.",
    "We will keep the generator and sampling procedure explicit. The workshop receives chosen indices so we can inspect how they select records; the Python example is where an actual generator produces the draws."
  ]
},
    intuition:[view("Name the observations before drawing","An index identifies a reading. Keeping the indices makes the selected observations inspectable.",[["Index",["0","1","2","3"]],["Reading",["10","20","30","40"]]]),view("Record a particular draw","A draw with replacement can ask for the same observation twice. Position one therefore appears twice here.",[["Drawn indices",["1","1","3"]]]),view("Follow the indices back to the data","The selected report contains the actual readings at those positions, including the repeated observation.",[["Selected readings",["20","20","40"]]])],
    parts: numpyParts["reproducible-sampling"],
    quiz:[truth("Calling the same generator again automatically restarts the original sequence.",false,"A draw advances its state. Reinitialising a separate generator with the same setup is different from making another request to the current one."),choice("Why does the workshop's selected report contain 20 twice?",["Sampling with replacement selected its position twice","The thermometer was read twice independently","The average requires duplicate entries"],0,"The repeated index is visible in the supplied draw. It represents repeated selection of the same observation."),truth("A repeatable high score proves the method works equally well on other samples.",false,"Repeatability concerns the same experiment. Generalisation requires appropriate independent evaluation.")],
    practice:[exercise("Can you replay the same draw?",["Create two independent NumPy generators using PCG64 with seed 42. Draw five integers from 0 through 99 with each.","Print whether the two arrays are exactly equal. Use the explicit generator construction so the choice is documented."],"import numpy as np\n# Construct both generators, make both draws, and compare.\n","import numpy as np\na = np.random.Generator(np.random.PCG64(42)).integers(0,100,size=5)\nb = np.random.Generator(np.random.PCG64(42)).integers(0,100,size=5)\nprint(np.array_equal(a,b))","True",[
  "A seeded generator has internal state that advances after a draw. Replaying starts from a fresh copy of that initial state.",
  "Construct np.random.Generator(np.random.PCG64(42)) separately for each draw. Use integers(0, 100, size=5) and compare with np.array_equal."
]),exercise("How much did two recorded draws change the average?",[
  "The supplied index rows record two draws from readings, with repeated positions allowed. Retrieve the measurements for both draws.",
  "Print the selected two-by-three nested list, then one mean per draw as a list rounded to four decimal places. These are recorded draws; do not resample them."
],"import numpy as np\nreadings = np.array([10.,20.,30.,40.])\nindices = np.array([[0,2,2],[1,3,3]])\n# Retrieve the observations and summarise each draw.\n","import numpy as np\nreadings = np.array([10.,20.,30.,40.])\nindices = np.array([[0,2,2],[1,3,3]])\nselected = readings[indices]\nprint(selected.tolist())\nprint(np.round(selected.mean(axis=1),4).tolist())","[[10.0, 30.0, 30.0], [20.0, 40.0, 40.0]]\n[23.3333, 33.3333]",["An array of indices can retrieve the entries for both draws.","Each draw is a row, so average along axis one."])],
    build:construction("Replay a recorded greenhouse sample","Botie has saved the indices from a resample. We need to retrieve those readings, including repeats, and calculate their average.","Gather the readings at the supplied zero-based indices, then return the mean of that selected list.",{readings:"Original greenhouse readings",indices:"Recorded sample indices"},[sample("A repeated reading",{readings:[10,20,30,40],indices:[1,1,3]},26.6666666667),sample("A different draw",{readings:[10,20,30,40],indices:[0,2,2]},23.3333333333),sample("One observation",{readings:[5,15,25],indices:[2]},25)],op("mean",op("gather",s("readings"),s("indices"))),"Gather preserves the recorded choices. The mean describes that resample, so changing the indices can change the result even when the underlying report stays the same.","The indices are supplied. This construction does not generate randomness or establish that a sample is representative.")
  }
];
const introduced = numpyLessons.map(lesson => ({
  ...lesson,
  quiz: [...lesson.quiz, ...numpyStructureQuestions[lesson.id]].map((question, index) => ({
    ...question, given: numpyQuizContext[lesson.id][index],
  })),
}));
const order = ["numpy-arrays", "numpy-axes", "numpy-creation", "numpy-indexing", "numpy-reshaping", "numpy-broadcasting", "numpy-masks", "numpy-reductions", "numpy-vectorisation", "numpy-linear-algebra", "numpy-numerical-checks", "reproducible-sampling", "numpy-functions", "numpy-saving-data"];
const lessons = [...introduced, ...building, ...arranging, ...calculating, ...reliable, ...files];
deepenNumpyLessons(lessons);
const sampling = lessons.find(lesson => lesson.id === "reproducible-sampling");
sampling.topic = "Keep the Calculation Trustworthy";
export default order.map(id => {
  const lesson = lessons.find(lesson => lesson.id === id);
  if (!lesson) throw Error(`Missing NumPy lesson: ${id}`);
  return { ...lesson, appliedIn: numpyApplications[id].map(([title, href]) => ({ title, href })) };
});
