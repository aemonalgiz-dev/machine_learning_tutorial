const given = (description, code) => ({ description, code: `import numpy as np\n\n${code}` });
const readings = given("The greenhouse names and Celsius readings use the same order.", `greenhouses = ["north", "middle", "south"]\nreadings = np.array([12, 18, 24])`);
const table = given("Rows are Monday and Tuesday. Columns are north, middle, and south.", `temperatures = np.array([\n    [10, 20, 30],\n    [14, 22, 36],\n])`);
const mask = given("The alert rule includes readings exactly at the limit.", `readings = np.array([20, 27, 25, 18])\nlimit = 25\nmask = readings >= limit`);
export const numpyQuizContext = {
  "numpy-arrays": [readings,
    given("Convert one reading per greenhouse, in north, middle, south order.", `celsius = np.array([12, 18, 24])\nfahrenheit = celsius * 1.8 + 32`),
    given("Our calculation expects every entry to be Celsius. We are checking what information must accompany this report.", `readings = np.array([12, 18, 24])\ngreenhouses = ["north", "middle", "south"]`),
    { description: "This is a Python list, not a NumPy array.", code: "readings = [12, 18, 24]\nrepeated = readings * 2" },
    { description: "Botie needs to retrieve a reading by its greenhouse name.", code: 'by_greenhouse = {"north": 12, "middle": 18, "south": 24}\nreadings = [12, 18, 24]' }
  ],
  "numpy-axes": [table, table, table, table,
    given("The row was selected without calling copy.", `temperatures = np.array([[10, 20, 30], [14, 22, 36]])\nmonday_view = temperatures[0, :]\nmonday_view[0] = 11`)
  ],
  "numpy-broadcasting": [
    given("Rows are days and columns are greenhouses. Each target belongs to a greenhouse.", `readings = np.array([[12, 18, 24], [14, 22, 36]])\ntargets = np.array([10, 20, 30])\ndifferences = readings - targets`),
    given("There are two days and three greenhouses. Each outside reference belongs to one day.", `readings = np.array([[12, 18, 24], [14, 22, 36]])\noutside = np.array([6, 10])`),
    given("This separate example has two days and two greenhouses. The reference belongs to days, not columns.", `readings = np.array([[12, 18], [14, 22]])\noutside = np.array([6, 10])\n# Consider why a shape check alone might miss the wrong alignment.`),
    given("We want to reuse each day's outside temperature across its greenhouse row.", `outside = np.array([6, 10])\noutside_column = outside[:, None]`)
  ],
  "numpy-masks": [mask, mask, mask,
    given("Compare the meaning of the two selectors for the same readings.", `readings = np.array([20, 27, 25, 18])\nmask = np.array([False, True, True, False])\npositions = np.array([0, 1, 1, 0])`)
  ],
  "reproducible-sampling": [
    given("Both draws use the same generator object.", `rng = np.random.Generator(np.random.PCG64(42))\nfirst = rng.integers(0, 4, size=3)\nsecond = rng.integers(0, 4, size=3)`),
    given("These are saved positions from a draw with replacement.", `readings = np.array([10, 20, 30, 40])\nindices = np.array([1, 1, 3])\nselected = readings[indices]`),
    { description: "A method scores well on one saved sample. Running the same calculation on that same sample produces the same score again.", data: "Same method\nSame saved observations\nSame evaluation procedure" },
    given("We have four readings. The upper bound in integers is excluded.", `readings = np.array([10, 20, 30, 40])\nrng = np.random.Generator(np.random.PCG64(42))\npositions = rng.integers(0, 4, size=3)`)
  ]
};
