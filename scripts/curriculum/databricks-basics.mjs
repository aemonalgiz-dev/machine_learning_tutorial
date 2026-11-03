import {
  lesson, p, example, history, source, before, table, challenge, construction,
  sample, s, op, q, tf, journey, predict, connection, fresh,
} from './applied-authoring.mjs';

const reading = (id, temperature) => ({ id, pump: 'P7', temperature });
const partitionCounts = op('dbxPartitionSizes', s('partitions'));
const recipe = op('pack', partitionCounts, op('total', partitionCounts));

const practiceData = `partitions = [
    [{"id": "a", "temperature": 8}, {"id": "b", "temperature": 11}],
    [],
    [{"id": "c", "temperature": -3}],
    [{"id": "d", "temperature": 14}, {"id": "e", "temperature": 9}],
]
print(partition_counts(partitions))`;

export const databricksBasics = lesson({
  id: 'databricks-basics',
  title: 'The Basics of Spark',
  section: 'Introduction to Databricks',
  topic: 'Databricks Fundamentals',
  blurb: "Spark coordinates calculations over portions of a dataset called partitions. The driver plans the work, and executor processes carry out its tasks. Combining partition results lets one calculation work across data stored in separate portions.",
  openingTitle: 'What Does Spark Do?',
  openingId: 'what-does-spark-do',
  bookmarkRedirects: {
    'what-is-databricks': '/concepts/what-is-databricks',
    '1-files-object-storage-and-data-lakes': '/concepts/databricks-data-lakes',
    '2-from-a-collection-of-files-to-a-table': '/concepts/databricks-data-lakes',
    '5-what-databricks-manages': '/concepts/databricks-workspaces-compute',
    '6-access-lineage-and-model-runs': '/concepts/databricks-table-names',
  },
  openingBeforeHistory: true,
  opening: [
    'Apache Spark is an open-source engine for processing data. We describe a calculation, and Spark organizes the tasks that produce its result. Those tasks can run across several computers, although Spark also runs on one machine for smaller workloads.',
    'Our maintenance team has a named table of pump readings. Before calculating an average or preparing a model input, we want to know how many records arrived. On one computer, we could count every row in a list. If the records are divided into portions, each portion can contribute a count and those counts can be combined.',
    'We will follow that calculation before using Spark’s programming interface. It gives a concrete meaning to partitions, tasks and the processes that run them. Databricks manages the computing environment in this sequence; Spark supplies the processing engine.',
  ],
  prerequisites: [before('Workspaces and Compute', 'databricks-workspaces-compute'), before('Tables and Unity Catalog', 'databricks-table-names')],
  appliedIn: [before('Notebooks and Jobs', 'databricks-notebooks-jobs'), before('Building and Running Spark Queries', 'databricks-lazy-dataframes')],
  outputLabel: 'Record counts by partition, followed by the total record count',
  checkpointTitle: 'Questions on Parts 1 to 3',
  history: history('Why Spark Was Developed', [
    source('Apache Spark project history', 'https://spark.apache.org/history.html'),
    source('Resilient Distributed Datasets, NSDI 2012', 'https://people.csail.mit.edu/matei/papers/2012/nsdi_spark.pdf'),
    source('Spark application components', 'https://spark.apache.org/docs/latest/cluster-overview.html'),
    source('Spark DataFrame quickstart', 'https://spark.apache.org/docs/latest/api/python/getting_started/quickstart_df.html'),
  ],
  'Large calculations often revisit the same records. A model may pass over its training data repeatedly, and an analyst may ask several questions of the same dataset. Writing each intermediate result to external storage and reading it back adds work every time. Spark began at UC Berkeley in 2009 and became open source in 2010. Its researchers described a way to reuse distributed data in memory while keeping enough information about its transformations to recover lost partitions.',
  'Dividing data between machines creates a recovery problem. If one process disappears, its portion of the calculation may need to run again. The researchers described a distributed dataset whose transformation history allowed missing partitions to be reconstructed. Reusing data and recovering lost work were both part of the design.',
  'Our count does not need an in-memory training loop, but it lets us inspect the same division of work on a small example. We can calculate a result for each portion and combine the results. Later, operations that need matching records to meet will explain why some distributed calculations also move data between partitions.'),
  diagram: table('Follow a Count Through Spark',
    'Start with the records and the work, then attach each process name to its responsibility.',
    ['Question', 'Component', 'Its job in this example'], [
      ['What data is available?', 'Partitions', 'Each portion contains some of the pump readings'],
      ['What does one portion contribute?', 'A counting task', 'Produces a partial count for that partition'],
      ['What executes the task?', 'An executor process', 'Works on its assigned partition and returns a result'],
      ['What coordinates the application?', 'The driver', 'Schedules the work needed to produce the requested result'],
      ['What answer did we request?', 'The combined count', 'Adds the partial counts without dropping any records'],
    ], 'The local workshop exposes partial counts. It does not run Spark or predict task timing.'),
  parts: [
    p('Describe the Calculation Over a Table',
      'The named table from the earlier lesson gives us pump readings with fields such as pump and temperature. A row represents one reading. A column contains the values for one named field across those readings.\n\nSpark offers a table-shaped programming interface called a DataFrame. It represents data with named columns and types, together with the operations that describe a result. We might request rows above a temperature threshold, select their pump identifiers, or count all the readings.\n\nDescribe the required answer first. Counting rows asks how many observations are present. Adding temperatures asks for a different quantity, and counting distinct pumps asks another question again. Distribution must preserve the meaning of whichever calculation we requested.',
      null,
      'For this workshop, count every supplied row. A repeated value is still a row, and deciding which readings to reject belongs to a later filtering calculation.'),
    p('Divide the Data into Partitions',
      'A large table need not arrive in one process as one enormous list. Spark divides its work over portions of the data called partitions. The rows of a partition can be processed by one task in a stage of the calculation.\n\nA partition is not a computer or necessarily one source file. The number and arrangement of partitions depend on how Spark reads and transforms the data. Several partitions may be processed on the same machine, and the arrangement can change during a calculation.\n\nOur local model supplies the partition arrangement explicitly as a list of lists. That lets us inspect exactly which rows each partial calculation receives. We will change the arrangement while keeping the same logical records.',
      null,
      'Changing the number of partitions changes how we divide the work. It does not by itself add or remove a pump reading.'),
    p('Drivers, Executors, and Tasks',
      'A Spark application needs a process to coordinate its work. That process is called the driver. It plans and schedules the tasks needed for a requested result. Executor processes perform the assigned tasks and hold data used by the application.\n\nA worker machine supplies computing resources; an executor is a process using those resources. Data partitions, executor processes and physical machines therefore describe different things. Two executors can work through many partitions over time. Having twelve partitions does not require twelve computers.\n\nSome tasks can run independently at the same time. Others must wait for an earlier stage to supply their inputs. If a task loses needed data, Spark can recompute work from the recorded operations where recovery is possible. Distributed execution still depends on the available resources and successful completion of the required work.',
      null,
      'Adding computers helps only when useful work can be divided among them. Coordination, data transfer and limited resources still take time.'),
    p('Count Records Without Losing the Partition Boundaries',
      'Our local example represents partitions as a list of lists. The outer list contains the partitions; each inner list contains complete reading records. Counting the outer list tells us how many partitions we have. It does not tell us how many readings they contain.\n\nCount the records inside each partition first. Then add those counts. An empty partition contributes zero, and an unevenly sized partition contributes its actual number of records. This is a small example of combining partial results into one answer.',
      'Partition 0: two readings\nPartition 1: no readings\nPartition 2: three readings\n\nPartial counts = [2, 0, 3]\nTotal readings = 2 + 0 + 3 = 5',
      'Moving these same readings into a different number of partitions changes the partial counts. It should leave the total unchanged. The workshop asks your construction to preserve both pieces of information.', [
        example('Inspect a Nested List of Readings',
          'The first lookup selects a partition. The second selects a complete record within it. The example only inspects that structure; the challenge will count an arbitrary arrangement.',
          'partitions = [[{"id": "r0", "temperature": 12}], [], [{"id": "r1", "temperature": 9}]]\nprint(partitions[0][0]["temperature"])\nprint(len(partitions))\nprint(len(partitions[1]))',
          '12\n3\n0',
          'The three printed values describe a temperature, the number of partitions, and the number of records in the empty partition. Those quantities have different meanings.'),
      ]),
    p('Transformations and Actions',
      'Suppose we ask for readings above a declared minimum. Spark can describe that filtered result before calculating all its rows. An operation that describes a new dataset from an earlier one is called a transformation. Filtering and selecting columns are examples.\n\nMany transformations are lazy: Spark builds a plan and delays the full calculation until a result is needed. An action requests that result. Counting the rows or asking to display a few rows are examples of actions. Analysis and metadata work can still occur earlier, so lazy does not mean that absolutely nothing happens.\n\nPlanning several operations together gives the engine an opportunity to choose how to execute them. The requested meaning stays fixed even when Spark changes an execution detail. We will examine the actual programming interface after the introductory platform lessons.',
      null,
      'Writing down a filter and requesting its count are different steps. The engine has to perform the work needed to answer that count.'),
    p('Combine Results and Move Related Data',
      'A total record count can combine partial counts by addition. Each task counts its own rows, and adding those counts gives the number of supplied records. It is useful because the partial calculation retains exactly the information needed for the final answer.\n\nSome questions require related contributions to meet. Counting readings for each pump needs all contributions for the same pump identifier to be combined, even when they began in separate partitions. Moving records or partial results between partitions for an operation like this is called a shuffle.\n\nData transfer adds work. One very large group can also leave a task with much more to process than the others. Those consequences are easier to investigate after we understand which records belong together. The later pipeline section examines the movement and the uneven workloads in detail.',
      null,
      'Check that an execution change preserves the requested result. Moving the same readings between partitions should preserve their total count.'),
    p('Choose the Amount of Machinery the Problem Needs',
      'A few files and a quick local calculation may be easier to handle with ordinary Python, a database query or NumPy. Distributed work adds coordination and operational costs. The useful question is whether the workload and the team’s needs justify them.\n\nOur workshop uses small local lists so every partial count can be inspected. It does not create a Spark application, start cloud compute or simulate execution time. The structure shows why the result must combine the records in each partition; it cannot establish how fast a production system will run.\n\nThe next lesson explains how notebook code becomes a repeatable job. We will then connect the data and calculations to recorded model experiments before moving into the practical pipeline tutorials.',
      null,
      'Build a count that continues to work when the partition arrangement changes. Its result should describe the records, not the number of portions we happened to create.'),
  ],
  questions: [
    q('A Spark application needs work scheduled, and a task must count rows within one data partition.',
      'Which process performs that assigned counting task?',
      ['An executor process', 'A saved notebook heading', 'The data lake directory name'], 0,
      'Executors perform assigned tasks. The driver coordinates the application, while a partition describes the data being processed.'),
    tf('A team runs Apache Spark on machines it manages rather than through Databricks.',
      'It can still divide a calculation into partitions and execute Spark tasks.', true,
      'Apache Spark is an independent open-source engine. Databricks supplies a managed environment in which it can run.'),
    q('The partitions are [[{"id":"a"},{"id":"b"}], [], [{"id":"c"}]].',
      'What should the partition counts and total record count be?',
      ['[2, 0, 1], with total 3', '[1, 1, 1], with total 3', '[2, 1], with total 2'], 0,
      'Each inner list contributes its own record count, including zero for the empty partition. Adding those counts gives the number of records.'),
    tf('A Spark application has twelve data partitions and two executor processes.',
      'The application requires twelve separate computers, one for every partition.', false,
      'A partition is a portion of data. An executor can process tasks for different partitions over time; the number of partitions is not a computer count.'),
    q('A program describes a filtered Spark DataFrame, then asks for its row count.',
      'Which step requests a calculated result?',
      ['The count action', 'Giving the filtered DataFrame a variable name', 'Writing a notebook title'], 0,
      'The transformation describes the filtered data. Count asks Spark to perform the work needed to return a result; analysis and metadata work can happen earlier.'),
    tf('A local model supplies two partitions containing two records each. It then moves the same four records into one partition.',
      'Counting only the outer list still reports the total number of records.', false,
      'The outer list reports partition count. It changes with the layout even when the number of records stays fixed.'),
    q('A table contains readings from pump P7 in several partitions. We want one total count for P7.',
      'What must the distributed calculation combine?',
      ['Contributions belonging to the same pump identifier', 'Only the first partition that finishes', 'The number of executor names'], 0,
      'The requested group is the pump identifier. Combining its contributions preserves that meaning across partition boundaries.'),
    tf('The same five reading records are moved from two partitions to four partitions without adding or removing a record.',
      'A correct total record count remains five.', true,
      'The partial counts change with the arrangement, but their total still counts the same records.'),
  ],
  practice: [challenge('Count the Records in Each Partition', [
    'Write partition_counts(partitions). The input is a list of partitions, each represented by a list of record dictionaries. Return a tuple (counts, total): counts is a new list containing the length of every partition in order, including empty partitions, and total is the sum of those lengths. An empty outer list returns ([], 0). Do not change the input lists or records. Count every supplied record; this exercise does not filter temperatures or deduplicate repeated records.',
    'The workspace supplies a new batch with four partitions. Print the returned tuple. Then test your function on different partition arrangements. Ordinary Python lists are enough for this calculation; no Spark installation or cloud account is needed.',
  ], `def partition_counts(partitions):
    pass

${practiceData}`, `def partition_counts(partitions):
    counts = [len(partition) for partition in partitions]
    return counts, sum(counts)

${practiceData}`, '([2, 0, 1, 2], 5)', [
    'The outer list describes the partition arrangement. Look inside every inner list to find how many records it contributes.',
    'Keep those individual counts in order, then add them to get the total. An empty partition needs an explicit zero in counts.',
  ], [
    ['Uneven partitions keep their positions', 'assert partition_counts([[{"id":"a"}], [], [{"id":"b"},{"id":"c"},{"id":"d"}]]) == ([1,0,3],4)'],
    ['Empty arrangements', 'assert partition_counts([]) == ([],0)\nassert partition_counts([[],[],[]]) == ([0,0,0],0)'],
    ['Repeated rows still count as records', 'row={"id":"a"}\nassert partition_counts([[row,row],[row]]) == ([2,1],3)'],
    ['Repartitioning preserves the total', 'rows=[{"id":str(i)} for i in range(7)]\nassert partition_counts([rows])[1] == 7\nassert partition_counts([rows[:2],[],rows[2:6],rows[6:]]) == ([2,0,4,1],7)'],
    ['Source records remain unchanged', 'import copy\nsource=[[{"id":"a","temperature":-3}],[]]\noriginal=copy.deepcopy(source)\ncounts,total=partition_counts(source)\ncounts.append(99)\nassert source == original\nassert total == 1'],
  ], { question: 'How many readings are in each partition, and how many do we have altogether?' })],
  build: {
    ...construction('Count Readings Across Partitions',
      'Botie has the pump readings divided into portions. The number of portions alone does not tell him how many readings arrived.',
      'The input is a list of partitions, each containing reading records. Return two results together: first a list of record counts in partition order, then the total number of records. Keep zero for an empty partition. Count all supplied records, including repeated values. Your construction must work when the same records are arranged into a different number of partitions.',
      { partitions: 'Pump readings divided into partitions' }, [
        sample('Two equally sized partitions', { partitions: [[reading('r0',12),reading('r1',9)],[reading('r2',-3),reading('r3',14)]] }, [[2,2],4]),
        sample('The same records occupy uneven partitions', { partitions: [[reading('r0',12)],[],[reading('r1',9),reading('r2',-3),reading('r3',14)]] }, [[1,0,3],4]),
        sample('No readings arrived', { partitions: [[],[]] }, [[0,0],0]),
      ], recipe,
      'Each partition contributes its own count. Adding those partial counts preserves the total even when the partition boundaries move.',
      'These are local lists representing partition contents. No actual Spark tasks or cloud computers run here, and the workshop does not measure parallel speed or recovery behavior.'),
    extras: ['count'],
    hints: [
      'Count records in each partition keeps one result per inner list. Count items applied to the outer list would count partitions instead.',
      'Use Add a list on the partial counts, then Collect two results to keep the count list beside its total.',
    ],
  },
  journey: journey('The readings are divided into partitions. Botie needs a count that describes the records rather than the layout.',
    'Combine the Partial Counts',
    'Count records within each partition, add the partial counts, and return both the individual counts and their total.',
    'Changing partition boundaries changes the partial counts while preserving the count of the same records.',
    predict('Move the Same Records into Different Partitions',
      'The first arrangement has two partitions with two records each. The next has one record, an empty partition, and three records. Predict both the new count list and the total before running.',
      'Compare the list of partial counts as well as the total. Counting only the outer list would change the answer even though no reading changed.'),
    [connection('databricks-workspaces-compute', 'Separate saved data from the processes calculating a result', 'Spark tasks use the selected compute while the table remains a persistent input.'), connection('databricks-table-names', 'Identify the table before asking for a calculation', 'The count describes the requested table’s records, even when execution divides them into partitions.')],
    'Which result should change if we move the same records between partitions, and which should stay the same?',
    'Separate the logical data from the way the calculation divides it.',
    { path: [0], title: 'Inspect the Partial Counts', challenge: 'Return one record count for every supplied partition, preserving empty partitions.', why: 'Inspect the partial results before adding them so a mistaken partition count is visible.' },
    ['Follow the nesting: the outer list contains partitions and the inner lists contain readings.', 'Keep the partial count list on one branch. Add those counts on another branch, then collect the two results.']),
  fresh: fresh('The Same Four Readings Are Repartitioned Again',
    'The original four readings now occupy four partitions: one reading, two readings, no readings, and one reading. Return all four partial counts and the total.',
    { partitions: [[reading('r0',12)],[reading('r1',9),reading('r2',-3)],[],[reading('r3',14)]] },
    [[1,2,0,1],4],
    'The arrangement has changed again. The construction must count its current records rather than return an earlier list of partial counts.'),
});

databricksBasics.technicalStart = databricksBasics.parts[2].title;
databricksBasics.checkpoints[0].after = databricksBasics.parts[2].title;
databricksBasics.reading.practiceTitle = `Practice. ${databricksBasics.practice[0].title}`;
// Keep relevant Spark bookmarks; moved platform topics have redirects above.
const partIds = [
  '1-describe-the-calculation-over-a-table',
  '2-divide-the-data-into-partitions',
  '3-what-spark-does',
  '4-count-records-without-losing-the-partition-boundaries',
  '5-transformations-and-actions',
  '6-combine-results-and-move-related-data',
  '7-choose-the-amount-of-machinery-the-problem-needs',
];
databricksBasics.parts.forEach((part, index) => { part.id = partIds[index]; });
