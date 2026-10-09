import { view, exercise, s, op, sample, before, construction } from "./authoring.mjs";
import { py, worked, lessonPart as p, question as q, numpyHistory as h, pythonSection as section } from "./numpy-authoring.mjs";

const lessons = [
  {
    id:"numpy-reshaping",title:"Put the Same Readings Into the Right Arrangement",section,topic:"Working with whole arrays",
    blurb:"A sensor may send one long sequence while a calculation expects rows. We need to change the arrangement without changing which measurements belong to each day and greenhouse.",
    openingTitle:"Where Does One Day End and the Next Begin?",
    opening:["Botie's logger sends six readings in order: all three greenhouses on Monday, then all three on Tuesday. The message has no row breaks. We need to restore the table before asking for a daily or greenhouse summary.","Reshaping changes how existing entries are grouped. Transposing exchanges axes. Joining combines separate collections. These operations can produce similar-looking shapes while assigning very different meanings to their positions."],
    prerequisites:[before("Choose the Readings Without Losing Their Place","numpy-indexing")],
    history:h("Separating Stored Order From the Shape of a Calculation","Scientific instruments and file formats often deliver observations in a flat sequence. Numerical calculations need arrangements that identify time, location, and measurement channels.","NumPy's manipulation routines describe shape and axis changes explicitly. This makes array-oriented calculations possible without treating every change of layout as a new measurement. The documented distinction between reshape, transpose, and joining is the mechanism we use here.",[["Changing array shapes","reference/routines.array-manipulation.html"],["Reshaping an array","reference/generated/numpy.reshape.html"]]),
    intuition:[view("Read the logger's order","The first three values belong to Monday and the next three to Tuesday.",[["Sequence",["10","20","30","14","22","36"]]]),view("Restore the day boundary","Group consecutive triples into day rows.",[["Monday",["10","20","30"]],["Tuesday",["14","22","36"]]]),view("Then follow a greenhouse instead","Swapping axes puts each greenhouse's two readings together.",[["North",["10","14"]],["Middle",["20","22"]],["South",["30","36"]]])],
    parts:[
      p("1. Restore Boundaries With reshape","The default reshape order reads the original entries in row order and puts them into the requested row order. It cannot create or discard entries. The product of the new dimensions must match the number of existing entries.\n\nOne dimension may be minus one, meaning infer this length from the remaining dimensions and the number of entries. It does not mean a missing observation.",[
        worked("Recover two days from six readings","We know that each day contains three readings, so either give both dimensions or let NumPy infer the day count.",`flat = np.array([10,20,30,14,22,36])
days = flat.reshape(2, 3)
print(days.tolist())
print(flat.reshape(-1, 3).shape)
print(days.ravel().tolist())`,"[[10, 20, 30], [14, 22, 36]]\n(2, 3)\n[10, 20, 30, 14, 22, 36]","ravel returns a flat array in row order. It can return a view or a copy depending on the layout. flatten always copies. Neither operation recovers labels that were never stored.")
      ]),
      p("2. Exchange Axes With Transpose","Regrouping the sequence into three pairs is not the same as following each greenhouse across days. A transpose exchanges the roles of rows and columns while keeping each value attached to its original coordinates.\n\nThe T attribute is a convenient transpose for a matrix. On arrays with more axes, name the intended axis order explicitly rather than assuming that reversing all axes is what the task needs.",[
        worked("Compare a reshape with an axis exchange","Both outputs below have three rows and two columns. Inspect their values to see why shape alone cannot establish meaning.",`days = np.array([[10,20,30],[14,22,36]])
print(days.reshape(3, 2).tolist())
print(days.T.tolist())`,"[[10, 20], [30, 14], [22, 36]]\n[[10, 14], [20, 22], [30, 36]]","Only the transpose places the north greenhouse's two readings together, then the middle's, then the south's. reshape has no knowledge of greenhouse identity.")
      ]),
      p("3. Add Observations or Add an Axis","concatenate extends an existing axis. stack creates a new axis to keep its inputs separate. Suppose we have two daily vectors. Concatenating them makes a longer vector; stacking them makes a table of days.\n\nWhen joining tables, all dimensions other than the concatenation axis must match. When stacking, the input shapes must match because each becomes a slice along the new axis.",[
        worked("Keep the day boundary when combining reports","We stack two same-length vectors into rows, then append a third row to the resulting table. The third day's extra brackets preserve its row axis.",`monday = np.array([10,20,30])
tuesday = np.array([14,22,36])
print(np.concatenate([monday, tuesday]).shape)
days = np.stack([monday, tuesday], axis=0)
print(days.tolist())
wednesday = np.array([[16,24,38]])
print(np.concatenate([days, wednesday], axis=0).tolist())`,"(6,)\n[[10, 20, 30], [14, 22, 36]]\n[[10, 20, 30], [14, 22, 36], [16, 24, 38]]","The first operation discards the day boundary unless we record it elsewhere. The last operation extends an existing day axis.")
      ]),
      p("4. Keep Features and Batches Distinct","A model often receives a table with observations in rows and features in columns. column_stack turns equally long vectors into feature columns. A batch adds another meaning: a group of observations processed together.\n\nWhen there are three or more axes, write down what each one means before manipulating the shape. Equal lengths do not make two axes interchangeable.",[
        worked("Build feature columns, then preserve a batch axis","Here each row describes a greenhouse. We keep temperature and humidity in separate columns. expand_dims introduces a new axis of length one; squeeze removes a named axis only if its length is one.",`temperature = np.array([12., 18., 24.])
humidity = np.array([50., 60., 70.])
features = np.column_stack([temperature, humidity])
batch = np.expand_dims(features, axis=0)
print(features.tolist())
print(batch.shape)
print(np.squeeze(batch, axis=0).shape)`,"[[12.0, 50.0], [18.0, 60.0], [24.0, 70.0]]\n(1, 3, 2)\n(3, 2)","The batch shape means one batch, three observations, and two features. Specifying the squeeze axis avoids accidentally removing other meaningful length-one axes.")
      ])
    ],
    quiz:[q("Which operation groups one greenhouse's readings together?","days = np.array([[10,20,30],[14,22,36]])",["days.reshape(3, 2)","days.T","days.ravel()"],1,"The columns are greenhouses. Transpose makes those columns into rows without regrouping unrelated consecutive entries."),q("What does the inferred dimension become?","flat = np.array([10,20,30,14,22,36])\ndays = flat.reshape(-1, 3)",["Two","Three","Minus one"],0,"Six values grouped in triples require two rows."),q("Which result keeps one row per day?","monday = np.array([10,20,30])\ntuesday = np.array([14,22,36])",["np.concatenate([monday, tuesday])","np.stack([monday, tuesday], axis=0)","monday + tuesday"],1,"Stack introduces an axis to distinguish the days. Concatenation makes one longer vector; addition combines readings."),q("What does the final dimension describe?","# Axes: batch, greenhouse, feature\nbatch = np.zeros((1, 3, 2))",["One batch","Three greenhouses","Two features per greenhouse"],2,"The supplied axis meanings identify the last dimension as the feature count.")],
    practice:[exercise("Can Botie recover a different logger layout?",["The flat report contains three consecutive days, with two greenhouse readings per day. Recover that table, then transpose it.","Print the day table first and the greenhouse table second as nested lists."],py("flat = np.array([8,12,10,14,11,15])\n# Restore days, then follow each greenhouse.\n"),py("flat = np.array([8,12,10,14,11,15])\ndays = flat.reshape(-1,2)\nprint(days.tolist())\nprint(days.T.tolist())"),"[[8, 12], [10, 14], [11, 15]]\n[[8, 10, 11], [12, 14, 15]]",["Each day must have two columns.","Use transpose after restoring the day boundaries."]),exercise("Can each greenhouse keep both of its measurements?",["Create feature columns from temperature and humidity. Add one batch axis at the front.","Print the feature table as a nested list and the batched array's shape on the next line."],py("temperature = np.array([15,21])\nhumidity = np.array([45,65])\n# Keep measurements paired by greenhouse.\n"),py("temperature = np.array([15,21])\nhumidity = np.array([45,65])\nfeatures = np.column_stack([temperature,humidity])\nprint(features.tolist())\nprint(features[None, :, :].shape)"),"[[15, 45], [21, 65]]\n(1, 2, 2)",["column_stack gives each input vector its own column.","A new leading axis distinguishes a batch from its observations."])],
    build:construction("Recover the greenhouse columns from a logger stream","Botie's flat logger output contains complete days in sequence. We need one row per greenhouse for a comparison over time.","Group the sequence into day rows using the supplied number of greenhouses, then swap axes to follow each greenhouse.",{readings:"Flat logger sequence",width:"Greenhouses per day"},[sample("Three greenhouses",{readings:[10,20,30,14,22,36],width:3},[[10,14],[20,22],[30,36]]),sample("Two greenhouses",{readings:[8,12,10,14,11,15],width:2},[[8,10,11],[12,14,15]])],op("transpose",op("reshapeRows",s("readings"),s("width"))),"Grouping restores the day boundaries. Transpose then follows greenhouse identity across those days.","The logger order and row width are supplied. The construction cannot infer missing labels or repair an incomplete day.")
  },
  {
    id:"numpy-reductions",title:"Summarise a Report Without Losing the Question",section,topic:"Calculations We Will Reuse",
    blurb:"Botie needs totals, typical readings, and the greenhouse that needs attention first. A value, a position, and an ordered report answer different questions, even when they come from the same array.",
    openingTitle:"Do We Need the Hottest Reading or the Greenhouse That Produced It?",
    opening:["A maximum temperature tells Botie how hot a greenhouse became. It does not by itself identify which greenhouse to inspect. An average answers another question, and an average alone can hide a large spread.","We will calculate these summaries with NumPy, keep their axis meanings explicit, and use returned positions to preserve the connection between values and labels."],
    prerequisites:[before("One Reference for Many Rows","numpy-broadcasting"),before("Ask Each Row a Question","numpy-masks")],
    history:h("Turning a Large Report Into a Specific Answer","Scientists needed summaries long before NumPy: totals, central values, and measures of variation compress observations into answers to particular questions. Array libraries must make clear which observations each summary combines.","NumPy's statistical reductions accept axes, while functions such as argmax return positions instead of measurements. Keeping that distinction explicit lets a numerical summary remain connected to its original observation.",[["Statistical routines","reference/routines.statistics.html"],["Sorting and searching","reference/routines.sort.html"]]),
    intuition:[view("Keep labels beside readings","The order is north, middle, south, annex.",[["Temperature",["20","27","25","18"]]]),view("A value and its position are different answers","The highest reading is attached to position one in the supplied order.",[["Largest value",["27"]],["Position",["1"]]]),view("Ordering should move labels with values","Sorting the readings alone would detach them from their greenhouse names.",[["Ascending positions",["3","0","2","1"]]])],
    parts:[
      p("1. Choose the Summary and the Axis","sum adds values; mean shares their total across the entries; min and max keep an extreme value. Each can reduce a selected axis. The keepdims argument retains a length-one version of the reduced axis, which makes the result easier to align with the original table.",[
        worked("Subtract each day's own average","We preserve the greenhouse axis as length one in the daily mean. Broadcasting can then subtract each day's reference from its whole row.",`days = np.array([[10.,20.,30.],[14.,22.,36.]])
daily_mean = days.mean(axis=1, keepdims=True)
print(days.sum(axis=0).tolist())
print(daily_mean.tolist())
print((days - daily_mean).tolist())`,"[24.0, 42.0, 66.0]\n[[20.0], [24.0]]\n[[-10.0, 0.0, 10.0], [-10.0, -2.0, 12.0]]","Keeping the axis does not change the average. It records where that average belongs when we reuse it.")
      ]),
      p("2. Describe the Centre and the Spread","A mean describes a centre; variance and standard deviation describe spread around it. NumPy's default variance divides squared deviations by the number of entries. Setting ddof to one instead uses one fewer in the divisor, the usual sample-variance convention when estimating from a sample.\n\nThe median selects the middle of ordered observations, averaging the two middle values for an even count. Quantiles locate other fractions of the ordered data. Their interpolation rule matters for small samples; we use NumPy's default linear rule here.",[
        worked("Keep the convention beside the result","For these four readings, compare the population variance, sample variance, and middle half of the ordered values.",`readings = np.array([18.,20.,25.,27.])
print(readings.mean())
print(np.median(readings))
print(readings.var())
print(np.round(readings.var(ddof=1), 4))
print(np.round(readings.std(), 4))
print(np.quantile(readings, [0.25, 0.75]).tolist())`,"22.5\n22.5\n13.25\n17.6667\n3.6401\n[19.5, 25.5]","The two variance results use different denominators on the same observations. Choose the convention for the question, rather than changing ddof until a desired number appears. Standard deviation returns to the original temperature units.")
      ]),
      p("3. Retrieve the Observation Behind an Extreme","max returns the largest value. argmax returns its position. If values tie, argmax returns the first occurrence along the chosen axis. The position can retrieve a greenhouse name or a complete record.\n\nargsort returns all positions in sorted order. Apply that same order to every aligned array. np.sort returns sorted values instead; the array's sort method sorts that array in place.",[
        worked("Move names and readings together","We request a stable sort so ties keep their original order. These readings are distinct, but making the rule explicit prevents ambiguity later.",`names = np.array(["north","middle","south","annex"])
readings = np.array([20,27,25,18])
print(readings.max())
print(readings.argmax())
print(names[readings.argmax()])
order = np.argsort(readings, kind="stable")
print(names[order].tolist())
print(readings[order].tolist())`,"27\n1\nmiddle\n['annex', 'north', 'south', 'middle']\n[18, 20, 25, 27]","The index array carries the ordering rule to both collections. Sorting each collection independently would destroy the measurement-to-name relationship.")
      ]),
      p("4. Count Decisions and Repeated Values","A Boolean comparison can be summarised too. count_nonzero counts true entries, any asks whether at least one is true, and all asks whether every entry is true. Use those operations to reduce an array of decisions to one answer.\n\nunique can return distinct values together with their counts. Its usual sorted result differs from preserving the first occurrence order. Later, category IDs must use a vocabulary whose ordering we deliberately maintain.",[
        worked("How many alerts, and which values repeated?","The alert comparison includes the boundary. Tuple unpacking gives the two returned arrays separate names: values and counts.",`readings = np.array([20,27,27,18])
alerts = readings >= 25
print(np.count_nonzero(alerts))
print(alerts.any())
print(alerts.all())
values, counts = np.unique(readings, return_counts=True)
print(values.tolist())
print(counts.tolist())`,"2\nTrue\nFalse\n[18, 20, 27]\n[1, 1, 2]","There are two alert observations, even though both have the same value. Counting distinct alert temperatures would answer a different question.")
      ])
    ],
    quiz:[q("Which value identifies the hottest greenhouse's position?","readings = np.array([20,27,25,18])",["readings.max()","readings.argmax()","readings.mean()"],1,"argmax gives a position that can retrieve the corresponding greenhouse label."),q("What shape lets each daily mean align with its row?","days = np.array([[10.,20.,30.],[14.,22.,36.]])\nreference = days.mean(axis=1, keepdims=True)",["(2, 1)","(3,)","(1, 2)"],0,"The reduced greenhouse axis survives with length one, leaving one reference per day."),q("How many individual readings meet the rule?","readings = np.array([20,27,27,18])\nalerts = readings >= 25",["One","Two","Three"],1,"Both occurrences of 27 are observations that satisfy the rule."),q("What changes when ddof becomes one?","readings = np.array([18.,20.,25.,27.])\npopulation = readings.var()\nsample = readings.var(ddof=1)",["The observations are sorted","The mean is replaced by a median","The divisor changes from four to three"],2,"ddof subtracts from the number of observations in the variance divisor. It does not change the input readings.")],
    practice:[exercise("Which names belong beside the sorted readings?",["Order the readings from smallest to largest using stable sorting. Apply the same order to names.","Print the ordered names, then the ordered readings, as lists."],py('names = np.array(["north","middle","south"])\nreadings = np.array([23,17,20])\n# Keep each label attached to its reading.\n'),py('names = np.array(["north","middle","south"])\nreadings = np.array([23,17,20])\norder = np.argsort(readings, kind="stable")\nprint(names[order].tolist())\nprint(readings[order].tolist())'),"['middle', 'south', 'north']\n[17, 20, 23]",["Compute one index ordering from readings.","Use the same index array for names and readings."]),exercise("How far is each reading from its day's average?",["Rows are days. Compute a daily mean while preserving its axis, then subtract it from the report.","Print the mean's shape and the centred nested list."],py("days = np.array([[6.,10.],[12.,18.],[8.,12.]])\n# Keep one reference for each row.\n"),py("days = np.array([[6.,10.],[12.,18.],[8.,12.]])\nreference = days.mean(axis=1, keepdims=True)\nprint(reference.shape)\nprint((days-reference).tolist())"),"(3, 1)\n[[-2.0, 2.0], [-3.0, 3.0], [-2.0, 2.0]]",["Combining columns reduces axis one.","keepdims retains a one-column axis so broadcasting aligns correctly."])],
    build:construction("Order the inspection report without losing its names","Botie wants the greenhouse names from coolest to warmest. Sorting names alphabetically would detach them from the temperatures.","Find the ascending order of the readings, then use those indices to retrieve the names.",{names:"Greenhouse names",readings:"Temperature in the same order"},[sample("Four greenhouses",{names:["north","middle","south","annex"],readings:[20,27,25,18]},["annex","north","south","middle"]),sample("A tie preserves order",{names:["glass","mesh","foil"],readings:[22,18,22]},["mesh","glass","foil"])],op("gather",s("names"),op("rank",s("readings"))),"One ordering is computed from measurements and applied to their labels. Stable ties keep the earlier report order.","Ordering is not a measure of danger. These temperatures only illustrate preserving aligned records.")
  }
];
export default lessons;
