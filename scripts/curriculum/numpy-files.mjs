import { view, exercise, s, op, sample, before, construction } from "./authoring.mjs";
import { py, worked, lessonPart as p, question as q, numpyHistory as h, pythonSection as section } from "./numpy-authoring.mjs";

const lessons = [{
  id:"numpy-saving-data",title:"Keep Enough of a Calculation to Run It Again",section,topic:"Keep the Calculation Trustworthy",
  blurb:"A printed table is not a complete experiment record. We will save arrays with their shapes and types, keep related arrays together, and check what survives when a report moves through a text file.",
  openingTitle:"What Will Tomorrow's Program Need From Today's Work?",
  opening:["Botie has prepared a feature table, fitted coefficients, and kept the greenhouse names. Tomorrow's program must load those pieces in the same order. Saving only a screenshot or a rounded list of predictions would not be enough to repeat the calculation.","NumPy can save one array in its native format, keep several arrays in a named archive, or exchange numbers as text. We will try each route and check both the values and the information needed to interpret them."],
  prerequisites:[before("Give a Reusable Calculation a Clear Contract","numpy-functions"),before("Turn Several Measurements Into Several Predictions","numpy-linear-algebra")],
  history:h("Keeping Numerical Results Usable by the Next Program","Scientific programs need to exchange data and repeat earlier calculations. Plain text is inspectable, but it does not automatically preserve every array's type, shape, labels, or full numerical precision.","NumPy's NPY format records an array's dtype and shape with its values. NPZ archives collect named arrays, while text readers and writers serve simpler interchange needs. These formats preserve stored data, not the scientific meaning we forget to record.",[["NumPy binary format","reference/generated/numpy.lib.format.html"],["Saving named arrays","reference/generated/numpy.savez.html"],["Text array input","reference/generated/numpy.loadtxt.html"]]),
  intuition:[view("Keep the model inputs","Observation rows must remain attached to their feature columns.",[["North features",["10","40"]],["South features",["20","60"]]]),view("Keep the rule and the names","Coefficients and labels explain how the table is used.",[["Weights",["2","0.1"]],["Names",["north","south"]]]),view("Recompute after loading","A successful round trip restores the data and lets the same calculation run.",[["Weighted sum",["24","46"]]])],
  parts:[
    p("1. Save the Array, Not Only Its Printed Appearance","np.save writes one array in NPY format. np.load reads it back, including the dtype and shape. A printed string is intended for people; a saved numerical array is intended for another calculation.\n\nThese browser examples use BytesIO, a binary file held in memory. It follows the same read/write interface as a file without writing to your computer. Its contents are temporary and disappear when the Python runtime is reset. For a local Python program, a file path can be supplied instead.",[
      worked("Write an array and read it back","BytesIO comes from Python's io module. Writing advances the file position, so seek(0) returns to the beginning before loading. We disallow pickle because these ordinary numerical arrays do not need Python-object deserialisation.",`from io import BytesIO

readings = np.array([[12.,18.],[14.,22.]], dtype=np.float64)
file = BytesIO()
np.save(file, readings, allow_pickle=False)
file.seek(0)
restored = np.load(file, allow_pickle=False)
print(restored.tolist())
print(restored.shape)
print(restored.dtype)
print(np.array_equal(restored, readings))`,"[[12.0, 18.0], [14.0, 22.0]]\n(2, 2)\nfloat64\nTrue","The restored array has the same values, shape, and numerical representation. That does not tell it whether a column was temperature or humidity; metadata must supply those meanings.")
    ]),
    p("2. Keep Related Arrays Under Explicit Names","An NPZ archive can hold several arrays. Keyword arguments to savez choose names by which they can be retrieved. This is useful when a feature table, a coefficient vector, and observation labels belong to the same calculation.\n\nThe archive is a resource that should be closed after reading. A with statement keeps it open for the indented block and closes it when the block ends. Keep any arrays needed later by assigning them within that block.",[
      worked("Restore the pieces before recomputing the result","The labels are a regular NumPy string array, not arbitrary Python objects. Dictionary-like key lookup retrieves each named array from the archive.",`from io import BytesIO

X = np.array([[10.,40.],[20.,60.]])
weights = np.array([2.,0.1])
names = np.array(["north","south"])
file = BytesIO()
np.savez(file, features=X, weights=weights, names=names)
file.seek(0)
with np.load(file, allow_pickle=False) as saved:
    restored_X = saved["features"]
    restored_weights = saved["weights"]
    restored_names = saved["names"]
print(restored_names.tolist())
print((restored_X @ restored_weights).tolist())`,"['north', 'south']\n[24.0, 46.0]","Names remain aligned with the rows. savez_compressed writes a compressed NPZ archive when reducing stored size is useful, with additional work for compression and decompression.")
    ]),
    p("3. Read a Small Text Table Deliberately","Text is convenient for inspecting and sharing rows, but a reader must know the delimiter, which lines are headers, and what type to use. loadtxt is suitable for a regular numeric table with the stated format. genfromtxt provides additional handling for missing entries.\n\nStringIO is the text counterpart to BytesIO. It lets this example read a tiny CSV entirely in memory. On disk, the reader can take a path instead.",[
      worked("Keep the header separate from the numerical rows","Three quotes enclose a string spanning several lines. The delimiter says that commas separate fields. skiprows skips the one header line; it does not turn those names into automatic labels on the returned array.",`from io import StringIO

csv = StringIO("""temperature,humidity
12,50
18,60
""")
features = np.loadtxt(csv, delimiter=",", skiprows=1, ndmin=2)
print(features.tolist())
print(features.shape)`,"[[12.0, 50.0], [18.0, 60.0]]\n(2, 2)","The feature names still need to be stored separately. ndmin=2 keeps a table-shaped result even if a future report contains just one numerical row.")
    ]),
    p("4. Record What a File Format Cannot Infer","A round-trip check should compare the loaded shape, dtype, values, and label ordering with the originals. Units, feature meanings, random settings, and library versions belong in the experiment record too. A saved array cannot reconstruct assumptions that were never recorded.\n\nWhen writing text with savetxt, the format controls precision. A small number of decimal places may be fine for a human report, but it deliberately discards information needed for an exact numerical replay.",[
      worked("Show the difference between a report and an exact record","We write two decimal places to a text file in memory, then reload it. allclose can accept the stated display error, while exact equality correctly reports that the original values were not fully preserved.",`from io import StringIO

original = np.array([[12.345,50.],[18.765,60.]])
text_file = StringIO()
np.savetxt(text_file, original, delimiter=",", fmt="%.2f")
text_file.seek(0)
restored = np.loadtxt(text_file, delimiter=",", ndmin=2)
print(restored.shape == original.shape)
print(np.array_equal(restored, original))
print(np.allclose(restored, original, rtol=0, atol=0.01))`,"True\nFalse\nTrue","That loss of precision was a choice made by the writer. Use a native array file when exact preservation of the stored numerical entries is required.")
    ])
  ],
  quiz:[q("What must happen before reading this in-memory file from its start?","from io import BytesIO\nfile = BytesIO()\nnp.save(file, np.array([12.,18.]), allow_pickle=False)",["Call file.seek(0)","Sort the array","Convert every value to an integer"],0,"Writing leaves the position after the written data. Seeking to zero puts the reader at the beginning."),q("What identifies the coefficients inside this archive?","from io import BytesIO\nfile = BytesIO()\nnp.savez(file, features=np.array([[10.,40.]]), weights=np.array([2.,0.1]))",["The first greenhouse name","The key 'weights'","The number of columns alone"],1,"The keyword used while saving becomes the name used to retrieve the array."),q("Does loadtxt attach the header names to the resulting array?","from io import StringIO\nfile = StringIO('temperature,humidity\\n12,50\\n')\nX = np.loadtxt(file, delimiter=',', skiprows=1, ndmin=2)",["Yes, it creates labelled columns automatically","Only if the values are floats","No, the header is skipped and labels must be retained separately"],2,"skiprows discards the header line from numerical parsing; it does not attach semantic column names."),q("What information can this two-decimal text report lose?","from io import StringIO\nfile = StringIO()\nnp.savetxt(file, np.array([[12.345,50.]]), fmt='%.2f', delimiter=',')",["The fractional digits beyond the written precision","Only the variable's Python name","No numerical information"],0,"The output format rounds the stored values for display. Reloading cannot restore digits that were not written.")],
  practice:[exercise("Can Botie restore a new numerical report exactly?",["Save readings into the provided binary in-memory file using np.save, then reload it with pickle disabled.","Print the restored nested list, its shape, and whether it exactly equals the original."],py("from io import BytesIO\nreadings = np.array([[9.5,15.],[11.,17.5]])\nfile = BytesIO()\n# Write, return to the beginning, and reload.\n"),py("from io import BytesIO\nreadings = np.array([[9.5,15.],[11.,17.5]])\nfile = BytesIO()\nnp.save(file,readings,allow_pickle=False)\nfile.seek(0)\nrestored = np.load(file,allow_pickle=False)\nprint(restored.tolist())\nprint(restored.shape)\nprint(np.array_equal(restored,readings))"),"[[9.5, 15.0], [11.0, 17.5]]\n(2, 2)\nTrue",["seek(0) resets the file position after writing.","The native array format preserves the shape and stored numerical type."]),exercise("Can the next calculation recover the named inputs it needs?",["Save features and weights as named arrays in an NPZ archive held by file. Reload them and calculate the weighted score per observation.","Print the recovered feature shape, then the scores as a list."],py("from io import BytesIO\nfeatures = np.array([[2.,5.],[4.,1.]])\nweights = np.array([3.,2.])\nfile = BytesIO()\n# Save, load, and recompute from the loaded arrays.\n"),py("from io import BytesIO\nfeatures = np.array([[2.,5.],[4.,1.]])\nweights = np.array([3.,2.])\nfile = BytesIO()\nnp.savez(file,features=features,weights=weights)\nfile.seek(0)\nwith np.load(file,allow_pickle=False) as saved:\n    X = saved['features']\n    w = saved['weights']\nprint(X.shape)\nprint((X @ w).tolist())"),"(2, 2)\n[16.0, 14.0]",["The keywords passed to savez become archive keys.","Calculate using the loaded arrays to check the round trip."])],
  build:construction("Recompute scores from a restored report","Botie has already loaded the saved feature table, coefficient vector, and greenhouse names. We need to check that those pieces still work together.","Compute one weighted score per restored feature row, then collect the scores and the names together, scores first.",{features:"Restored feature table",weights:"Restored coefficients",names:"Restored names in row order"},[sample("Two restored rows",{features:[[10,40],[20,60]],weights:[2,.1],names:["north","south"]},[[24,46],["north","south"]]),sample("A different saved report",{features:[[2,5],[4,1]],weights:[3,2],names:["glass","mesh"]},[[16,14],["glass","mesh"]])],op("pack",op("matvec",s("features"),s("weights")),s("names")),"The restored coefficients produce one score per row, and the restored names retain the row identity.","The workshop starts after loading and checks how the restored data is used. The Python examples and challenges perform the actual file-format round trips in memory.")
}];
export default lessons;
