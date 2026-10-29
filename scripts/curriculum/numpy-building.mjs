import { view, exercise, s, op, sample, before, construction } from "./authoring.mjs";
import { py, worked, lessonPart as p, question as q, pythonSection as section } from "./numpy-authoring.mjs";

const lessons = [
  {
    id: "numpy-creation", title: "Preparing the Arrays We Need", section, topic: "From a measurement to a calculation",
    blurb: "Botie needs a place for tomorrow's readings and a set of times at which to collect them. We can describe those arrangements directly instead of typing every repeated value ourselves.",
    openingTitle: "Do We Have to Type Every Entry?",
    opening: ["Suppose Botie plans to check three greenhouses on two mornings. We know how many entries the report will need before we know the temperatures. We also want a regular schedule of checks. Neither task should require copying the same number over and over.", "NumPy can create arrays from a shape, a repeated value, or a sequence rule. The choice matters: an empty place in a report is not evidence that the thermometer measured zero."],
    prerequisites: [before("Giving Measurements a Place", "numpy-arrays"), before("Which Direction Are We Adding?", "numpy-axes")],
    history: {
  "title": "When the Layout Was Known Before the Measurements",
  "sources": [
    {
      "title": "Creating arrays",
      "url": "https://numpy.org/doc/stable/user/basics.creation.html"
    },
    {
      "title": "Evenly spaced samples",
      "url": "https://numpy.org/doc/stable/reference/generated/numpy.linspace.html"
    },
    {
      "title": "Oliphant: Guide to NumPy (December 2006)",
      "url": "https://web.mit.edu/dvp/Public/numpybook.pdf"
    }
  ],
  "blocks": [
    "A simulation needs places to accumulate results before those results exist. It also needs repeatable grids of proposed times or settings. Asking a person to type every initial value would make both jobs fragile.",
    "Oliphant’s 2006 Guide to NumPy documented distinct constructors for filled storage, uninitialised storage and regularly spaced values. That distinction makes the programmer’s intention visible: reserving room is different from assigning meaningful starting values. Our schedule will use those separate choices so an uninitialised entry cannot be mistaken for a sensor reading."
  ]
},
    intuition: [view("Decide what a row means", "Each row belongs to a morning and each column to a greenhouse.", [["Monday", ["north", "middle", "south"]], ["Tuesday", ["north", "middle", "south"]]]), view("Choose the initial meaning", "Zero is appropriate for a count of checks made so far. It is not a replacement for an unmeasured temperature.", [["Checks so far", ["0", "0", "0"]]]), view("Generate the schedule", "A start, stop, and spacing rule determine which times Botie will inspect.", [["Hour", ["6", "8", "10", "12"]]])],
    parts: [
      p("1. Start With a Shape and a Meaning", "Our check sheet needs one row for each morning and one column for each greenhouse. Before entering measurements, we can ask NumPy to create that layout. We pass the shape as a tuple, an ordered group written in parentheses, with the row count first and the column count second.\n\nThe creation function decides what initially occupies those positions: zeros supplies zero, ones supplies one, and full supplies a value we choose. None of those initial values is a thermometer reading until our program records an actual measurement there.\n\nA zero-filled array is useful for a counter before any events have occurred. A constant target table is useful for a shared rule. Neither is a table of observations merely because it has the right shape.", [
        worked("Create counts and targets separately", "We specify integer storage for counts and floating-point storage for temperatures. The zeros and full functions allocate new arrays.", `checks = np.zeros((2, 3), dtype=int)
targets = np.full((2, 3), 20.0)
print(checks.tolist())
print(targets.tolist())
print(np.ones(3, dtype=int).tolist())`, "[[0, 0, 0], [0, 0, 0]]\n[[20.0, 20.0, 20.0], [20.0, 20.0, 20.0]]\n[1, 1, 1]", "The arrays have deliberate initial values. NumPy also offers empty, which leaves numerical contents uninitialised. Those contents must be written before reading them; empty does not mean a safe table of zeros.")
      ]),
      p("2. Reuse a Layout Without Guessing Its Size", "Suppose the number of greenhouses changes. Hard-coding three columns in every calculation invites mistakes. The functions ending in _like can take their shape from an existing array. Their default dtype also follows that array, so override it when the new meaning needs a different type.", [
        worked("Make a counter that matches the incoming report", "Here zeros_like gives each observed position a corresponding counter, and full_like creates a target table with the same layout.", `readings = np.array([[12., 18., 24.], [14., 22., 36.]])
counts = np.zeros_like(readings, dtype=int)
targets = np.full_like(readings, 20.0)
print(counts.shape)
print(counts.tolist())
print(targets.tolist())`, "(2, 3)\n[[0, 0, 0], [0, 0, 0]]\n[[20.0, 20.0, 20.0], [20.0, 20.0, 20.0]]", "The layout now follows the data. ones_like provides the corresponding all-ones array when every position starts with one contribution.")
      ]),
      p("3. Choose a Step or Choose a Count", "A schedule may specify a time interval, while a graph may specify how many points to draw between two limits. Those are different requests. arange uses a step and excludes the stopping boundary. linspace uses a count and includes both endpoints by default.\n\nFor fractional spacings, linspace is often clearer when the intended count matters. Floating-point steps in arange can make boundary behaviour surprising.", [
        worked("Make an inspection schedule and a trial grid", "The first call starts at six, stops before fourteen, and advances by two. The second requests five equally spaced trial settings including zero and one.", `hours = np.arange(6, 14, 2)
settings = np.linspace(0, 1, 5)
print(hours.tolist())
print(settings.tolist())`, "[6, 8, 10, 12]\n[0.0, 0.25, 0.5, 0.75, 1.0]", "The final argument has a different meaning in these two functions. Treating the count in linspace as a step would give the wrong experiment.")
      ]),
      p("4. Preserve a Measurement When No Change Is Intended", "Later we will use matrices to combine measurements. We also need a matrix that expresses leaving each measurement alone. An identity matrix has ones on its diagonal and zeros elsewhere, so each output keeps its matching input and ignores the others.", [
        worked("Create the identity pattern", "eye creates this pattern. With three inputs, we request a three-by-three matrix. The matrix-calculation lesson will show how it acts on readings.", `identity = np.eye(3, dtype=int)
print(identity.tolist())
print(identity.shape)`, "[[1, 0, 0], [0, 1, 0], [0, 0, 1]]\n(3, 3)", "This is a rule we constructed, not a matrix fitted from data. Keep that distinction when using initial arrays in later model exercises.")
      ])
    ],
    quiz: [
      q("What shape does this allocation request?", "counts = np.zeros((2, 3), dtype=int)", ["Two rows and three columns", "Three rows and two columns", "One sequence of five entries"], 0, "The first shape entry describes rows and the second columns."),
      q("Which hours will be included?", "hours = np.arange(6, 14, 2)", ["6, 8, 10, 12, 14", "6, 8, 10, 12", "6 and 14 only"], 1, "arange excludes its stop, so fourteen does not appear."),
      q("What does the final argument request?", "settings = np.linspace(0, 1, 5)", ["A step of five", "Five intervals plus both endpoints", "Five equally spaced values including the endpoints"], 2, "linspace takes the number of values, not the spacing."),
      q("Does this tell us the greenhouse temperature was measured as zero?", "report = np.zeros((2, 3))", ["Yes, allocation performs a measurement", "No, the zeros are initial contents we requested", "Only when the dtype is float"], 1, "Constructing an array does not collect observations. We must distinguish initial contents from recorded measurements.")
    ],
    practice: [exercise("Can Botie prepare a larger check sheet?", [
  "Botie needs an empty count sheet and a temperature target sheet with one row per day and one column per greenhouse. Use three days and two greenhouses.",
  "Create integer zero counts and floating-point targets filled with 18.5. Print the two nested lists on separate lines, counts first."
], py("# Prepare both arrays from the requested layout.\n"), py("counts = np.zeros((3, 2), dtype=int)\ntargets = np.full_like(counts, 18.5, dtype=float)\nprint(counts.tolist())\nprint(targets.tolist())"), "[[0, 0], [0, 0], [0, 0]]\n[[18.5, 18.5], [18.5, 18.5], [18.5, 18.5]]", [
  "Both sheets need shape (3, 2), because their row and column meanings must agree.",
  "np.zeros creates the empty counts and np.full fills the targets. Choose each dtype to retain the required whole or fractional values."
]), exercise("Which settings should Botie try?", [
  "The logger needs scheduled check hours and a separate set of trial temperature settings. These requests describe different kinds of sequence.",
  "Print check hours starting at 5 in steps of 3, stopping before 15. Then print five evenly spaced trial temperatures from 10 through 20, including both endpoints. Use Python lists."
], py("# Choose the right sequence constructor for each request.\n"), py("print(np.arange(5, 15, 3).tolist())\nprint(np.linspace(10, 20, 5).tolist())"), "[5, 8, 11, 14]\n[10.0, 12.5, 15.0, 17.5, 20.0]", ["The hour rule specifies a step; the temperature rule specifies a count.", "arange excludes its stop, while linspace includes its endpoints by default."])],
    build: construction("Prepare the greenhouse target sheet", "The greenhouse report already has a layout. Botie now needs the same target beside every recorded temperature, without treating an unfilled measurement as zero.", "Create a rectangular target sheet from the supplied day count, greenhouse count and target. Return targets minus readings in the same day-by-greenhouse layout. Positive means warmer is needed; negative means the reading is already above target.", {days:"Number of days", greenhouses:"Number of greenhouses", target:"Target temperature", readings:"Recorded temperatures"}, [sample("Two mornings",{days:2,greenhouses:3,target:20,readings:[[12,18,24],[14,22,36]]},[[8,2,-4],[6,-2,-16]]),sample("Different layout",{days:3,greenhouses:2,target:18.5,readings:[[10,20],[18.5,17],[21,16]]},[[8.5,-1.5],[0,1.5],[-2.5,2.5]])],op("subtract",op("fillGrid",s("days"),s("greenhouses"),s("target")),s("readings")),"The shape comes from the requested report. The filled sheet supplies references, while subtraction compares them with actual observations.","The workshop uses small positive dimensions. It does not expose uninitialised storage.")
  },
  {
    id:"numpy-indexing", title:"Choose the Readings Without Losing Their Place", section, topic:"Working with whole arrays",
    blurb:"Botie may need one morning, a run of mornings, or selected greenhouses. We need to express each request precisely and know whether editing the selection will change the original report.",
    openingTitle:"Which Part of the Report Did We Ask For?",
    opening:["A report with hundreds of rows is useful only if we can retrieve the observations we need. Sometimes they are adjacent. Sometimes we need particular positions in a particular order. Those requests should not be confused.","We will follow a small temperature table through slices and explicit index selections, then check which results share storage with the original. This matters whenever we prepare data while keeping the original measurements available."],
    prerequisites:[before("Which Direction Are We Adding?","numpy-axes")],
    history:{
  "title": "Working on Part of a Large Scientific Record",
  "sources": [
    {
      "title": "Indexing arrays",
      "url": "https://numpy.org/doc/stable/user/basics.indexing.html"
    },
    {
      "title": "Copies and views",
      "url": "https://numpy.org/doc/stable/user/basics.copies.html"
    },
    {
      "title": "Van der Walt, Colbert and Varoquaux: The NumPy array (2011)",
      "url": "https://arxiv.org/abs/1102.1523"
    }
  ],
  "blocks": [
    "Copying a large image whenever a program inspects one region can cost more than the calculation on that region. Numerical array implementations therefore needed to describe a subset without automatically duplicating its stored values.",
    "Van der Walt, Colbert and Varoquaux’s 2011 account explained NumPy’s array structure and the importance of avoiding copies. A view describes how to reach values in existing storage; its shape and steps through memory can differ from the original array’s. That saving also explains why editing a slice can change its source. We will contrast that shared view with a separately gathered result."
  ]
},
    intuition:[view("Keep the original order visible","Rows are mornings; columns are north, middle, south.",[["Monday",["10","20","30"]],["Tuesday",["14","22","36"]],["Wednesday",["16","24","38"]]]),view("A range follows existing positions","Taking the first two mornings keeps their order and stops before the third.",[["Rows",["0","1"]]]),view("A gather follows requested positions","Requesting row two and then row zero deliberately changes the order.",[["Requested rows",["2","0"]]])],
    parts:[
      p("1. Read a Slice From Start to Stop", "Suppose we need the first two mornings from a longer report. We can describe that uninterrupted portion by where it begins and where it stops. NumPy calls this selection a slice.\n\nA slice has a start, a stop, and an optional step. The stop position is excluded, so the first position outside our requested portion supplies the boundary. Leaving a boundary empty uses the corresponding end of the axis. A negative index counts back from the end; minus one selects the last entry.\n\nIn a matrix we supply a selector for each axis, separated by a comma. Selecting with a single integer removes that axis; selecting a one-entry slice keeps it.",[
        worked("Keep a row, or keep a one-row table", "These selections contain the same first-day readings, but the resulting shapes differ. The last expression selects every other greenhouse from the final day.",`a = np.array([[10,20,30],[14,22,36],[16,24,38]])
print(a[0].tolist())
print(a[0].shape)
print(a[0:1].shape)
print(a[-1, ::2].tolist())`,"[10, 20, 30]\n(3,)\n(1, 3)\n[16, 38]","Keeping an axis can make a later calculation easier to align. The step of two selects columns zero and two; it does not multiply the temperatures.")
      ]),
      p("2. Choose Positions in an Explicit Order","An integer index array requests positions rather than a continuous range. It can reorder entries or repeat them. For multiple axes, two index lists normally identify pairs of coordinates. If we want every combination of chosen rows and chosen columns, we need to express that different request.",[
        worked("Pairs of coordinates or a rectangular selection", "The paired request retrieves row two, column one and row zero, column two. ix_ creates selectors for all combinations of those row and column choices.",`a = np.array([[10,20,30],[14,22,36],[16,24,38]])
print(a[[2, 0]].tolist())
print(a[[2, 0], [1, 2]].tolist())
print(a[np.ix_([2, 0], [1, 2])].tolist())`,"[[16, 24, 38], [10, 20, 30]]\n[24, 30]\n[[24, 38], [20, 30]]","The rectangle has two selected rows and two selected columns. Pairwise selection has only two entries. Neither operation is a mistake by itself; they answer different questions.")
      ]),
      p("3. Decide Whether an Edit Should Reach the Original","A name is not a copy. Assigning a second name to an array gives both names the same object. A basic slice also shares the underlying numerical storage. An advanced selection gathers into independent storage. Use copy when independence is part of the task.",[
        worked("Inspect sharing before editing", "shares_memory reports whether these arrays overlap in memory. A slice and an integer-index selection can show the same values while behaving differently when changed.",`a = np.array([10, 20, 30])
view = a[:2]
gathered = a[[0, 1]]
independent = a.copy()
print(np.shares_memory(a, view))
print(np.shares_memory(a, gathered))
view[0] = 11
gathered[1] = 99
print(a.tolist())
print(independent.tolist())`,"True\nFalse\n[11, 20, 30]\n[10, 20, 30]","The slice changed the original first reading. The gathered array and explicit copy did not. np.asarray is useful for accepting an input as an array, but it may return an existing array unchanged; it is not a promise to make a copy.")
      ]),
      p("4. Count Repeated Positions Deliberately","Repeated retrieval is straightforward, but repeated updates need care. When advanced indexing gathers a temporary array, an in-place-looking update can lose repeated contributions. If every occurrence should add to a count, NumPy's add.at performs an update at each supplied position.",[
        worked("Two alerts for the same greenhouse", "Our saved alert IDs contain greenhouse one twice. We compare an indexed increment with accumulation that processes every occurrence.",`ids = np.array([1, 1, 2])
buffered = np.zeros(3, dtype=int)
buffered[ids] += 1
counts = np.zeros(3, dtype=int)
np.add.at(counts, ids, 1)
print(buffered.tolist())
print(counts.tolist())`,"[0, 1, 1]\n[0, 2, 1]","The second result records all three alerts. This distinction will matter when later lessons accumulate repeated token IDs or category observations.")
      ])
    ],
    quiz:[q("How many axes survive the slice?","a = np.array([[10,20,30],[14,22,36]])\nselected = a[0:1]",["One axis of length three","Two axes with shape (1, 3)","No axes"],1,"A one-row slice keeps the row axis. A single integer row index would remove it."),q("Which values does this paired selection request?","a = np.array([[10,20,30],[14,22,36],[16,24,38]])\nselected = a[[2, 0], [1, 2]]",["24 and 30","All entries in rows two and zero","A two-by-two rectangle"],0,"The row and column indices are paired: the first pair selects 24, and the second selects 30."),q("Which change reaches the original?","a = np.array([10,20,30])\nv = a[:2]\nc = a[[0,1]]",["Changing c changes a","Changing v changes a","Neither can change a"],1,"The basic slice shares storage. The advanced selection is a copy."),q("How many alerts should greenhouse one receive?","ids = np.array([1, 1, 2])\ncounts = np.zeros(3, dtype=int)\nnp.add.at(counts, ids, 1)",["One","Three","Two"],2,"Both occurrences of index one contribute, so that greenhouse receives two increments.")],
    practice:[exercise("Can you take the requested mornings in their requested order?",[
  "Rows are mornings and columns are greenhouses. Botie requests morning indices 2 then 0, and greenhouse columns 0 then 2 from each selected morning. These are zero-based indices.",
  "Print the resulting two-by-two nested list, preserving that requested row and column order."
],py("readings = np.array([[8,12,16],[10,14,18],[11,15,19]])\n# Select the rectangle, keeping the requested order.\n"),py("readings = np.array([[8,12,16],[10,14,18],[11,15,19]])\nprint(readings[np.ix_([2,0],[0,2])].tolist())"),"[[11, 19], [8, 16]]",[
  "You need every selected row paired with every selected column, giving a rectangle.",
  "Two index lists used together select paired coordinates. np.ix_ instead constructs the row-column combinations needed here."
]),exercise("Can every alert contribute to its greenhouse count?",[
  "Each alert ID identifies one of four greenhouses, numbered 0 through 3. Repeated IDs mean separate alerts, so every occurrence must count.",
  "Create an integer counter for each greenhouse and print the four counts as a list in ID order."
],py("ids = np.array([0, 2, 2, 3, 2, 0])\n# Accumulate one contribution per occurrence.\n"),py("ids = np.array([0,2,2,3,2,0])\ncounts = np.zeros(4, dtype=int)\nnp.add.at(counts, ids, 1)\nprint(counts.tolist())"),"[2, 0, 3, 1]",[
  "Begin with one zero for each greenhouse, including greenhouses with no alerts.",
  "np.add.at adds once for each supplied index occurrence. Repeated advanced-index assignment can behave differently."
])],
    build:construction("Retrieve the requested mornings","Botie saved the row numbers needed for a comparison. The output must preserve the requested order and repeated requests.","The requested days are zero-based row positions in the supplied table. Retrieve them in the given order, including repeats. Return one row per greenhouse, with its readings from those requested days kept in that order.",{readings:"Days by greenhouse",days:"Requested day indices"},[sample("Last then first",{readings:[[10,20,30],[14,22,36],[16,24,38]],days:[2,0]},[[16,10],[24,20],[38,30]]),sample("Repeated request",{readings:[[8,12],[10,14]],days:[1,1,0]},[[10,10,8],[14,14,12]])],op("transpose",op("gather",s("readings"),s("days"))),"Gather chooses the days; transpose changes which meaning occupies a row. Neither step averages or sorts the selected temperatures.","These workshop wires carry values rather than shared NumPy storage. Copy and view behaviour is demonstrated and checked in Python.")
  }
];
export default lessons;
