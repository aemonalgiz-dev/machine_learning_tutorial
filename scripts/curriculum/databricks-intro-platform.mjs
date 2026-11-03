import {
  lesson, p, example, history, source, before, table, challenge, construction,
  sample, s, op, q, tf, journey, diagnose, connection, fresh,
} from './applied-authoring.mjs';

const section = 'Introduction to Databricks';
const dataset = (name, location) => ({ name, location });
const manifest = (program, name, location, output) => ({ program, input: { name, location }, output: { name: output } });
const build = (...args) => ({ ...construction(...args), extras: [], draftVersion: 1 });
const introductionFixture = `directory = [
    {"name": "lab.raw.inspections", "location": "s3://maintenance/inspections/"},
    {"name": "lab.raw.readings", "location": "s3://maintenance/readings/"},
]
result = describe_workflow(directory, "lab.raw.readings", "check_temperatures_v1", "lab.prepared.readings")
print(result)`;
const workflowSolution = `import copy

def describe_workflow(directory, input_name, program, output_name):
    def nonempty(value):
        return isinstance(value, str) and bool(value.strip())
    if not all(nonempty(value) for value in (input_name, program, output_name)):
        raise ValueError("Names must be nonempty text")
    if not isinstance(directory, list):
        raise ValueError("The directory must be a list")
    names = set()
    selected = None
    for entry in directory:
        if not isinstance(entry, dict) or not nonempty(entry.get("name")) or not nonempty(entry.get("location")):
            raise ValueError("Each directory entry needs a name and location")
        if entry["name"] in names:
            raise ValueError("Repeated dataset name")
        names.add(entry["name"])
        if entry["name"] == input_name:
            selected = {"name": entry["name"], "location": entry["location"]}
    if selected is None or input_name == output_name:
        raise ValueError("Missing input or an output that would overwrite it")
    return {"program": program, "input": copy.deepcopy(selected), "output": {"name": output_name}}

${introductionFixture}`;

export const databricksPlatformIntroduction = lesson({
  id: 'what-is-databricks',
  title: 'What Is Databricks?',
  section,
  topic: 'Databricks Fundamentals',
  blurb: 'Databricks manages a shared environment for working with data. Its workspace and computing services connect programs to stored datasets, while the team still decides what the records mean and which results to publish.',
  openingTitle: 'What Does Databricks Actually Provide?',
  openingBeforeHistory: true,
  opening: [
    'Databricks is a managed cloud platform for processing data, analyzing it, and building applications and models that use it. People work in a shared workspace, run programs on computing resources, and use data kept in connected storage. It brings those pieces into one environment so a team has less infrastructure to operate separately.',
    'Suppose a maintenance team collects pump readings and inspection reports. One person starts with a Python script on a laptop. Later, analysts need the same readings for reports, engineers need to repeat the cleaning process every morning, and someone needs to check which records produced a model. The calculation itself is only part of the work. They also need a dependable way to connect the programs, their data, and the people allowed to use them.',
    'We will follow that team through the platform one responsibility at a time. Before touching a Spark query, we need to know what Databricks manages, what it connects to, and what remains our job.',
  ],
  prerequisites: [before('Python records and arrays', 'numpy-arrays')],
  appliedIn: [before('Data Lakes and Lakehouses', 'databricks-data-lakes')],
  outputLabel: 'The requested program, input dataset and separate output',
  checkpointTitle: 'Questions on Parts 1 to 3',
  history: history('Why a Processing Engine Became a Shared Platform', [
    source('Databricks platform introduction', 'https://docs.databricks.com/aws/en/introduction/'),
    source('Databricks company history', 'https://www.databricks.com/company/about-us'),
    source('Apache Spark project history', 'https://spark.apache.org/history.html'),
    source('Resilient Distributed Datasets, NSDI 2012', 'https://people.csail.mit.edu/matei/papers/2012/nsdi_spark.pdf'),
    source('The data lakehouse architecture', 'https://docs.databricks.com/aws/en/lakehouse/'),
  ],
  'Spark began as a UC Berkeley research project in 2009 and became open source in 2010. Its researchers were addressing calculations that reused data, including repeated model-training steps and interactive analysis. Repeatedly writing intermediate results to external storage and reading them back could make that work expensive. Spark provided a way to organize distributed calculations and reuse data while retaining information needed to recover lost work.',
  'A processing engine still needs somewhere to run. Teams have to provide computing resources, connect storage, share code and inspect failures. Spark’s creators founded Databricks in 2013. The platform developed around making shared data work easier to operate. Spark remained a separate open-source project, and it can run without Databricks.',
  'As a team’s uses grow, keeping separate copies for reporting and model development can make it difficult to establish which data a result used. The lakehouse approach brings table-management capabilities to data-lake storage. We will explain those storage ideas next, then distinguish them from the engine that calculates over the records.'),
  diagram: table('Follow the Maintenance Team’s Work',
    'The platform connects these responsibilities. Each row answers a different practical question.',
    ['Question', 'What we need', 'How it appears here'], [
      ['Where are the pump readings?', 'Persistent storage', 'Saved files or tables that a program can read'],
      ['What should happen to them?', 'A program', 'A cleaning procedure with a declared rule'],
      ['What executes that program?', 'Compute', 'Processes using memory and processor time'],
      ['How does the team organize the work?', 'A workspace', 'Shared code, notebooks and job definitions'],
      ['Which input and output belong to this request?', 'An explicit processing description', 'Names that remain attached to the selected data'],
    ], 'A name can identify a dataset without exposing every storage detail. That does not remove the need to configure its location and permissions.'),
  parts: [
    p('Start with the Work the Team Needs to Repeat',
      'A local program can read a file, reject unusable readings, and produce a summary. It may be a perfectly good solution for a small workload. The difficulty changes when several people need that result and the files keep arriving.\n\nSomeone must arrange for the program to run again. Another person needs to know which input it read. If a report looks wrong, the team needs to inspect the code and the data from that attempt. These are operational requirements around the calculation. They exist for ordinary reporting as well as for machine learning.\n\nDatabricks supplies an environment in which a team can develop this work and run it on managed computing resources. The team can organize shared notebooks, define repeatable jobs, and connect those jobs to governed data. Different capabilities address different parts of the problem, so we will introduce them when their purpose is clear.',
      null,
      'The first question is what our program should do with the readings. The platform gives us ways to run and organize that work.'),
    p('Separate the Data from the Program That Uses It',
      'The pump files contain observations. A cleaning program contains instructions. The processors and memory executing those instructions are computing resources, usually shortened to compute. Those are different things even if a laptop happens to hold all of them.\n\nIn a cloud workflow, persistent storage can keep the files after a program finishes. Later, a different run reads them again. The running program may also hold temporary values in memory. A value displayed in a notebook is not automatically a saved table that another run can read.\n\nWe can refer to a dataset by a useful name rather than repeat its storage location throughout every program. The connection from the name to the actual data must still be configured. Naming the wrong input does not become harmless because the platform can find it.',
      null,
      'In our local workshop, a small directory pairs dataset names with illustrative locations. It makes this relationship inspectable without contacting cloud storage.'),
    p('What the Workspace Is For',
      'A workspace is the shared environment where people organize their Databricks work. A notebook combines code cells with displayed results and explanatory text. A job describes work to run, including the tasks and computing resources it needs. We will examine the controls and execution choices in the Workspaces and Compute lesson.\n\nOpening a notebook gives us a document to inspect or edit. Running its code requires compute. Finding the notebook, having permission to use the compute, and having permission to read its input data are separate concerns.\n\nThe workspace also provides access to tools for working with named data and inspecting runs. The interface can change over time, so it is more useful to understand those responsibilities than memorize a screenshot of the sidebar.',
      null,
      'A shared workspace helps colleagues find the work. A complete run still needs an input, a program, and a place to execute it.'),
    p('Make the Requested Input and Output Explicit',
      'Suppose Botie is asked to prepare the pump readings. The directory also contains inspection reports. Selecting the first dataset in the directory would quietly change the job whenever that ordering changes. Instead, look up the exact requested name and keep its location attached to it.\n\nWe will describe the work with a small record containing the program name, the resolved input, and the intended output name. A record like this is often called a manifest: a description of what a particular piece of work should use or produce. Our manifest is a local teaching format, not a Databricks API request.\n\nThe workshop has an explicit policy: write to a separate output name so the source is preserved. Databricks does support authorized updates and overwrites; choosing a separate output is our policy for this example. A missing dataset or a repeated directory name must stop the request rather than make an arbitrary selection.',
      'Requested input: lab.raw.readings\nProgram: check_temperatures_v1\nOutput: lab.prepared.readings\n\nDirectory entry:\n  name: lab.raw.readings\n  location: s3://maintenance/readings/',
      'This description does not process a row or create a table. It tells us which work was requested, which is something we must establish before running it.', [
        example('Keep the Dataset Name with Its Location',
          'A Python dictionary keeps related fields together. Read the requested entry by its name rather than by its position in a list.',
          'directory = {"pump_readings": "s3://maintenance/readings/", "inspections": "s3://maintenance/inspections/"}\nrequested = "pump_readings"\nprint({"name": requested, "location": directory[requested]})',
          "{'name': 'pump_readings', 'location': 's3://maintenance/readings/'}",
          'The location is an illustrative string. This program neither opens it nor verifies access to a real bucket.'),
      ]),
    p('What the Platform Abstracts',
      'An abstraction lets us work through a simpler interface while another layer handles some details. We can ask for a named table instead of listing every file that belongs to it. We can request supported compute rather than manually installing and coordinating every machine. The details still exist; the service handles part of the work of managing them.\n\nSpark is the processing engine used for distributed calculations in the later lessons. Delta Lake provides table-management capabilities over data files. Other tools handle access to data or keep records of model-development runs. These components fit into the same environment, but their names do not describe interchangeable products.\n\nThe platform does not decide which temperature is physically plausible for our pump. It cannot infer that a particular validation design answers the question we meant to ask. Our cleaning rules and assessment decisions still require knowledge of the problem.',
      null,
      'When something fails, ask which responsibility failed. A program error, a missing permission, and an unavailable input need different repairs.'),
    p('When a Smaller Setup Makes Sense',
      'A managed platform has costs and configuration of its own. If one person can process a few files reliably with Python or a database, moving that work onto a larger platform may add little value. Shared operations, growing datasets and the need to govern access can make the tradeoff different.\n\nWe can learn the distinctions on a handful of records before dealing with a real workspace. The local workshop models selecting an input and describing a processing request. It does not provision compute, validate a cloud location, check Databricks permissions or run Spark.\n\nNext, we will look at the storage beneath the dataset name. A collection of files, a data lake and a managed table each give us different capabilities.',
      null,
      'The useful question is which responsibilities the team needs help managing, and whether the chosen setup addresses them.'),
  ],
  questions: [
    q('A team stores pump files in cloud storage, writes a cleaning notebook, and runs that notebook on managed compute.',
      'Which description fits Databricks in this workflow?',
      ['The managed platform connecting the shared work, compute and configured data', 'The Python list holding one batch', 'Another name for every cloud storage service'], 0,
      'Databricks supplies the shared managed environment. The files, the notebook and the running process still have distinct roles.'),
    tf('An analyst can open a shared notebook and read its code. The compute is stopped.',
      'The visible notebook proves that its Python code is currently executing.', false,
      'The notebook is a document. Its code executes on compute, so being able to open it does not establish that a program is running.'),
    q('The directory is [{"name":"inspections","location":"reports/"},{"name":"readings","location":"sensors/"}]. The requested input name is readings.',
      'Which input should the processing description retain?',
      ['{"name":"readings","location":"sensors/"}', '{"name":"inspections","location":"reports/"}', 'Whichever entry appeared first'], 0,
      'The request identifies a name. Directory order is unrelated to that meaning.'),
    tf('A user’s Databricks program contains a rule accepting temperatures above a declared minimum.',
      'Choosing Databricks establishes that the minimum is scientifically appropriate.', false,
      'The platform runs the work. The team remains responsible for whether a threshold makes sense for the sensor and the task.'),
    q('Our local manifest contains a program name, input name and location, and a separate output name. No execution component is present.',
      'What has the manifest established?',
      ['Which work is requested and which input it should use', 'That a cleaned table has already been written', 'That the cloud account has permission to read the location'], 0,
      'A description of work is different from its execution and from an access check.'),
    tf('The workshop requires separate input and output names to preserve its source.',
      'This is the example’s declared policy, rather than proof that Databricks forbids all table overwrites.', true,
      'Real authorized workflows can update or overwrite data. Here we deliberately keep the source separate.'),
    q('The input name readings occurs twice in the supplied directory, with different locations.',
      'What should the local teaching workflow do?',
      ['Report the ambiguous directory instead of choosing a location', 'Choose the location whose text is shorter', 'Silently process both and label them one input'], 0,
      'Our directory contract requires distinct names. An ambiguous entry cannot safely identify the requested dataset.'),
    tf('A small dataset can be processed reliably with one local Python program. There is no shared scheduling or access requirement.',
      'Keeping that smaller setup can be a reasonable choice.', true,
      'The choice should follow the actual workload and operational requirements.'),
  ],
  practice: [challenge('Describe the Requested Processing Work', [
    'Write describe_workflow(directory, input_name, program, output_name). directory is a list of dictionaries, each with nonempty text fields name and location. Names must be distinct across the entire directory. The other arguments must be nonempty text. Match input_name exactly, then return a new dictionary with keys program, input and output. input contains only the selected name and location; output contains only name, equal to output_name. Preserve the supplied strings and do not mutate the directory.',
    'Raise ValueError if an argument or directory entry violates those rules, the input is missing, or output_name equals input_name. The separate-output rule is our explicit no-overwrite policy. The function only describes the request and must not read any location or execute the named program. Print the manifest for the supplied maintenance request.',
  ], `def describe_workflow(directory, input_name, program, output_name):\n    pass\n\n${introductionFixture}`,
  workflowSolution,
  "{'program': 'check_temperatures_v1', 'input': {'name': 'lab.raw.readings', 'location': 's3://maintenance/readings/'}, 'output': {'name': 'lab.prepared.readings'}}", [
    'Validate every directory entry and collect its name before selecting the input. A duplicate later in the list must still be detected.',
    'Keep the selected dataset’s name and location together. Construct a separate output record rather than replacing the selected input’s name.',
  ], [
    ['Changed directory order and request', 'd=[{"name":"reports","location":"r/"},{"name":"sensors","location":"s/"}]\nassert describe_workflow(d,"sensors","clean_v2","cleaned") == {"program":"clean_v2","input":{"name":"sensors","location":"s/"},"output":{"name":"cleaned"}}'],
    ['A changed location belongs to the current input', 'assert describe_workflow([{"name":"x","location":"new/"}],"x","p","y")["input"]["location"] == "new/"'],
    ['Missing input and empty directory', 'for d in ([],[{"name":"other","location":"o/"}]):\n    try: describe_workflow(d,"missing","p","out")\n    except ValueError: pass\n    else: raise AssertionError("A missing name was accepted")'],
    ['Duplicate directory identity is ambiguous', 'try: describe_workflow([{"name":"x","location":"a/"},{"name":"x","location":"b/"}],"x","p","y")\nexcept ValueError: pass\nelse: raise AssertionError("Repeated name was accepted")'],
    ['Invalid names and forbidden overwrite', 'for d,i,p,o in [([{"name":"x","location":"a/"}],"x","p","x"),([{"name":"x","location":""}],"x","p","y"),([{"name":"x","location":"a/"}],"x"," ","y")]:\n    try: describe_workflow(d,i,p,o)\n    except ValueError: pass\n    else: raise AssertionError("An invalid request was accepted")'],
    ['Independent result and untouched source', 'import copy\nd=[{"name":"x","location":"a/","note":{"keep":True}}]\noriginal=copy.deepcopy(d)\nr=describe_workflow(d,"x","p","y")\nr["input"]["location"]="changed/"\nassert d == original'],
  ], { question: 'Which dataset and output belong to the program Botie was actually asked to run?' })],
  build: build('Connect the Requested Data to the Processing Description',
    'The maintenance directory contains both inspection reports and pump readings. A program request must retain the identity of its own input.',
    'Find requestedInput in registeredDatasets. Return a record containing program, input with its name and location, and output with its requested name. Use the current request rather than directory order. Our policy requires a separate output name. These are local instructions, not a cloud execution.',
    { requestedInput: 'Requested input dataset name', registeredDatasets: 'Named dataset directory', program: 'Requested program name', outputName: 'Separate output dataset name' }, [
      sample('Readings follow a report entry', { requestedInput: 'lab.raw.readings', registeredDatasets: [dataset('lab.raw.inspections','reports/'),dataset('lab.raw.readings','readings/')], program: 'clean_v1', outputName: 'lab.prepared.readings' }, manifest('clean_v1','lab.raw.readings','readings/','lab.prepared.readings')),
      sample('The requested input changes', { requestedInput: 'lab.raw.inspections', registeredDatasets: [dataset('lab.raw.readings','readings/'),dataset('lab.raw.inspections','reports/')], program: 'extract_dates_v1', outputName: 'lab.prepared.inspection_dates' }, manifest('extract_dates_v1','lab.raw.inspections','reports/','lab.prepared.inspection_dates')),
      sample('A configured location changes', { requestedInput: 'lab.raw.readings', registeredDatasets: [dataset('lab.raw.readings','retained/2026/readings/')], program: 'clean_v2', outputName: 'lab.prepared.readings_v2' }, manifest('clean_v2','lab.raw.readings','retained/2026/readings/','lab.prepared.readings_v2')),
    ], op('dbxIntroManifest',s('program'),op('dbxIntroResolveDataset',s('requestedInput'),s('registeredDatasets')),s('outputName')),
    'The processing description follows the request and current directory while preserving the selected input’s identity.',
    'The directory and manifest are declared local teaching formats. They do not call a Databricks API, prove permissions, read a bucket or run the program.'),
  journey: journey('Botie has a directory of maintenance datasets, but the requested program needs one particular input.',
    'Describe the Right Piece of Work',
    'Resolve the requested dataset name, then connect that result to the program and its separate output name.',
    'The manifest retains the requested input even when directory order or the requested job changes.',
    diagnose('The Requested Input Changes',
      'The first request cleans readings; the next extracts dates from inspections. The machine still returns the readings input. Which connection should we inspect?',
      ['The current requested name reaching dataset lookup', 'The lookup must resolve the current request instead of keeping the first selected dataset.'],
      ['Whether a shorter program name would execute faster', 'This construction describes the work. Text length does not repair selecting the wrong input.'],
      'Trace the requested input into the directory lookup before inspecting the final manifest.'),
    [connection('numpy-arrays','Keep values attached to their meaning','The requested name identifies a dataset; its position in a collection does not.')],
    'What can this manifest tell us before execution, and what would still need to be checked during a real run?',
    'Keep the description of the work separate from evidence that the work actually ran.',
    { path:[1], title:'Resolve the Current Input', challenge:'Return only the selected dataset’s name and location from the supplied directory.', why:'Inspecting the selected input first makes a mistaken dataset visible before it is wrapped into a larger request.' },
    ['Find the requested dataset needs the requested name as well as the directory.', 'Describe the processing step keeps the resolved input beside the program and output. It does not run the program.']),
  fresh: fresh('The Same Name Points to the Current Directory Entry',
    'The request reads lab.raw.readings, but its configured location is now archive/readings/. Return that current input beside clean_v3 and the separate output lab.prepared.readings_v3.',
    { requestedInput:'lab.raw.readings',registeredDatasets:[dataset('lab.raw.inspections','archive/reports/'),dataset('lab.raw.readings','archive/readings/')],program:'clean_v3',outputName:'lab.prepared.readings_v3' },
    manifest('clean_v3','lab.raw.readings','archive/readings/','lab.prepared.readings_v3'),
    'A copied location would describe an earlier request. Resolve the current directory entry while preserving the requested identity.'),
});

const workspaceFixture = `saved = [{"id": "a", "temperature": 12}, {"id": "b", "temperature": -3}]
events = [
    {"kind": "preview", "rows": [{"id": "a", "temperature": 12}]},
    {"kind": "save"},
    {"kind": "restart"},
]
print(run_workspace(saved, events))`;
const workspaceSolution = `import copy

def run_workspace(saved, events):
    def record_list(value):
        if not isinstance(value, list) or not all(isinstance(row, dict) for row in value):
            raise ValueError("Use a list of records")
        return copy.deepcopy(value)
    state = {"saved": record_list(saved), "preview": None}
    if not isinstance(events, list):
        raise ValueError("Events must be a list")
    for event in events:
        if not isinstance(event, dict):
            raise ValueError("Each event must be a record")
        kind = event.get("kind")
        if kind == "preview":
            state["preview"] = record_list(event.get("rows"))
        elif kind == "save":
            if state["preview"] is None:
                raise ValueError("No live preview to save")
            state["saved"] = copy.deepcopy(state["preview"])
        elif kind == "restart":
            state["preview"] = None
        else:
            raise ValueError("Unknown event")
    return state

${workspaceFixture}`;
const sessionResult = saved => ({ saved, preview:null });

export const databricksWorkspaceCompute = lesson({
  id: 'databricks-workspaces-compute',
  title: 'Workspaces and Compute',
  section,
  topic: 'Databricks Fundamentals',
  blurb: "A notebook stores code and displayed results, while compute supplies the resources that execute the program. A result held in a running session needs an explicit storage write before another run can rely on it.",
  openingTitle: 'Where Does the Notebook’s Work Actually Happen?',
  opening: [
    'A notebook can show the cleaned pump readings while the saved table still contains the original records. Looking at the right result is different from saving it for another program to use. That distinction becomes obvious when the process holding the preview restarts.',
    'The workspace keeps the team’s documents and definitions organized. Compute supplies processor time and memory to execute their programs. Storage keeps data that a later run should read. We will follow one result across those boundaries, then choose what needs to happen before the temporary process goes away.',
  ],
  prerequisites: [before('Data Lakes and Lakehouses','databricks-data-lakes')],
  appliedIn: [before('The Basics of Spark','databricks-basics')],
  outputLabel: 'The saved table and the live preview after the restart',
  checkpointTitle: 'Questions on Parts 1 to 3',
  history: history('Why Interactive Work and Repeatable Runs Need Different Controls', [
    source('Databricks company history','https://www.databricks.com/company/about-us'),
    source('Resilient Distributed Datasets, NSDI 2012','https://people.csail.mit.edu/matei/papers/2012/nsdi_spark.pdf'),
    source('Databricks notebooks','https://docs.databricks.com/aws/en/notebooks/'),
    source('Run Databricks notebooks','https://docs.databricks.com/aws/en/notebooks/run-notebook'),
    source('Databricks compute choices','https://docs.databricks.com/aws/en/compute/'),
    source('Manage classic compute','https://docs.databricks.com/aws/en/compute/clusters-manage'),
    source('SQL warehouse compute','https://docs.databricks.com/aws/en/compute/sql-warehouse/'),
    source('Spark application components','https://spark.apache.org/docs/latest/cluster-overview.html'),
  ],
  'Interactive analysis involves asking one question, inspecting the result, then changing the next question. Spark’s early research addressed this reuse of data alongside repeated algorithm steps. A running environment can keep useful intermediate state, which makes exploration convenient. It also creates a dependency on what happened earlier in that environment.',
  'A team sharing that work needs the program to be visible and the result to be reproducible elsewhere. Databricks, founded in 2013 by Spark’s creators, brought managed execution together with a shared development environment. Its notebooks allow code and displayed results to stay together, while jobs provide a way to run defined work repeatedly.',
  'These capabilities expose different lifetimes. The notebook document can remain when a process stops. A table saved in persistent storage can be read by a later process. A value that existed only in the earlier process’s memory must be recreated. Our workshop makes that last distinction explicit instead of treating everything visible in the interface as the same kind of saved work.'),
  diagram: table('Three Places to Inspect',
    'The team’s result can appear in the interface without having been written as a table.',
    ['Place', 'What it holds', 'Question to ask'], [
      ['Workspace notebook', 'Code, explanatory text and displayed output', 'Which code and inputs produced this display?'],
      ['Running process', 'Live variables and intermediate values', 'Could a fresh process reconstruct this result?'],
      ['Persistent table storage', 'Explicitly saved records', 'Which saved version should the next run read?'],
    ], 'A displayed output may be retained with a notebook. That display is still different from a live variable or an explicitly saved data table.'),
  parts: [
    p('The Workspace Is Where We Organize the Work',
      'The workspace lets a team find and organize notebooks, source files and definitions of jobs. A notebook contains cells that hold code or explanatory text. Running a cell displays its result beside the code, which is useful while we investigate a dataset.\n\nThe document and the execution environment have separate roles. A saved notebook can contain code that has not run in the current process. It can also display output from an earlier execution. A displayed table is evidence of that execution, not a guarantee about what a fresh run will return.\n\nFor the maintenance team, opening the cleaning notebook tells us where the procedure is written. To repeat it, we still need to establish its input data and the compute that will execute it. The person running it needs the relevant permissions too.',
      null,
      'Begin by asking whether you are editing a document, inspecting a previous output, or executing code now.'),
    p('Compute Supplies the Running Processes',
      'Compute means the resources used to execute work, including processors and memory. Databricks offers several ways to obtain those resources. The appropriate choice depends on the kind of program, the required controls and whether the work is exploratory or scheduled.\n\nFor a distributed Spark application, the driver coordinates the application and executor processes perform assigned tasks. These roles describe what the processes do. We will explain partitions and task execution in The Basics of Spark; there is no need to configure a cluster to follow the present example.\n\nA classic cluster exposes more of the machine and runtime configuration to the team. A cluster can contain several machines, but a name in the workspace is not itself a running machine. Availability, startup time and resource limits still matter.',
      null,
      'The running process may change even when the notebook document stays exactly the same.'),
    p('Choose Compute for the Work Being Run',
      'Interactive exploration may use all-purpose compute that remains available for successive notebook commands. A scheduled job can use job compute created for that work. Reusing an existing environment can be convenient, while a fresh job environment makes dependence on earlier interactive state easier to notice. The supported choices depend on the workspace and workload.\n\nServerless compute moves more provisioning and operation to Databricks. We request supported work without configuring the underlying machines in the same way. Servers still execute the program, and the service still has limits and charges. Serverless does not mean free or unlimited.\n\nA SQL warehouse is compute intended for SQL queries and analytical workloads. The word warehouse here names a compute resource; it should not make us assume that the running resource is the only place where the queried table is stored. SQL warehouses can use different managed configurations, including serverless options.\n\nChoose according to the required interfaces, runtime support, access boundaries and cost. Choosing a larger environment before identifying a bottleneck can simply make the same mistake more expensive.',
      null,
      'All of these choices answer how the code will execute. They do not replace the need to identify and preserve its data.'),
    p('A Preview Is Not an Explicit Table Write',
      "Imagine the notebook reads two pump records. A cleaning program returns one accepted record, and we inspect it in a live variable. The original saved table can still contain both records because reading and calculating do not automatically overwrite it.\n\nTo make the cleaned result available to a later process, deliberately write it to the intended storage under the chosen table policy. That write also needs permissions and must follow the table format's rules. Assigning the result to a Python variable creates a name in the running session; it does not perform that storage operation.\n\nRestarting the process discards values that existed only in that process’s memory. It does not normally remove tables kept independently in persistent storage. A notebook may retain displayed output, which is why an old visible table can be misleading after a restart.",
      null,
      'Our workshop distinguishes saved records from a live preview. It models the lifetime of these two values, not every kind of Databricks cache or restart behavior.'),
    p('Decide What Must Happen Before the Restart',
      "The teaching session has two named fields. saved contains the records kept for a later run. preview contains the calculated rows currently held in memory, or null when there is no live preview. An empty list is different from null: a calculation may legitimately return no rows.\n\n“Open the teaching session” begins with the supplied saved rows. “Put the calculated rows in memory” attaches the supplied program result as a preview. “Save the preview records” copies that preview into the model’s saved table. “Restart the teaching process” clears the preview and keeps the saved records. Each component returns a new state for the next one.\n\nThe order matters. A save before the preview has been produced is invalid. A restart before an unsaved preview is retained loses that preview in this model. The learner chooses where to place the saving step so the requested records survive the restart.",
      'Initial state:\n  saved = [{id: "a"}, {id: "b"}]\n  preview = null\n\nAfter a preview is calculated:\n  saved = [{id: "a"}, {id: "b"}]\n  preview = [{id: "a"}]\n\nSave, then restart:\n  saved = [{id: "a"}]\n  preview = null',
      'The component called Save performs a declared local state transition. It does not call a cloud storage API or prove that a real distributed write succeeded.', [
        example('Keep Stored Rows Separate from a Working Copy',
          'A deep copy keeps the local working records independent of the saved records. Merely changing a nested value in the working copy should leave the source available to inspect.',
          'import copy\nsaved = [{"id": "a", "temperature": 12}]\npreview = copy.deepcopy(saved)\npreview[0]["temperature"] = 13\nprint(saved)\nprint(preview)',
          "[{'id': 'a', 'temperature': 12}]\n[{'id': 'a', 'temperature': 13}]",
          'This illustrates independent Python values. A real persistent table write requires its storage interface and table-format semantics.'),
      ]),
    p('Access and Cost Still Need Deliberate Choices',
      'Being able to open a notebook does not grant permission to read every dataset it names. The executing identity needs access to the input data and the selected compute. A scheduled job may run under a different identity from the person exploring the notebook.\n\nCompute also consumes resources while it is available. An idle classic environment can continue accumulating charges until it terminates. Automatic termination helps, but its policy and behavior need to fit the actual workload. A long-running stream has different needs from an occasional report.\n\nThe appropriate configuration preserves required access and gives the program enough resources without leaving unnecessary compute running. Inspect actual behavior and current pricing rather than assuming a resource label establishes its cost.',
      null,
      'Our local simulation has no cloud charges or permissions. It isolates the state-lifetime decision so that the real operational questions remain identifiable.'),
    p('A Fresh Run Should Know Where to Begin',
      'An interactive environment makes it easy to keep using a variable that was created earlier and later deleted from the code. A clean run exposes that dependency. The procedure should identify its saved inputs and calculate the values it needs without relying on forgotten commands from another session.\n\nAfter the workshop restarts its process, inspect the saved table and the absent preview separately. If the next step needs a live value, it must read or calculate it again. Remembering the displayed result is not part of the program.\n\nNext, we will see how a registered table name identifies saved data. With that connection in place, we can follow Spark’s execution roles and the calculation performed on those records.',
      null,
      'Keep enough information to reproduce the work in a new process, and save the outputs that later work is supposed to consume.'),
  ],
  questions: [
    q('The cleaning notebook is saved in the workspace. Its previous output is visible, but the Python process that created it has restarted.',
      'What should we avoid assuming?',
      ['That the previously displayed rows still exist as a live Python variable', 'That the notebook document can remain available', 'That saved source data might be read again'], 0,
      'A retained display is different from a live variable. A new process must recreate the values it needs.'),
    tf('A team chooses serverless compute for a supported workload.',
      'Databricks manages more of the underlying infrastructure, while resource limits and charges still apply.', true,
      'Serverless changes who manages provisioning and operation. It does not remove physical resources or their cost.'),
    q('A resource called a SQL warehouse is available in the workspace. The team queries a table kept in persistent storage.',
      'What does SQL warehouse mean here?',
      ['Compute for SQL queries and analytical workloads', 'A guarantee that table files exist only in its running memory', 'A replacement for every storage and permission policy'], 0,
      'The resource executes queries. It should be distinguished from the storage holding the table.'),
    tf('In the teaching model, saved contains two rows and preview contains one calculated row. Restart clears only the preview.',
      'Restart alone changes the saved table to the one-row result.', false,
      'A save must copy the calculated rows into the saved table before the restart. Clearing process memory does not perform that write.'),
    q('The session state is {"saved":[{"id":"a"}],"preview":[]}. The next operation saves the preview.',
      'What should the saved records become under the declared model?',
      ['An empty list', 'The earlier one-row list because empty means no preview', 'The number zero'], 0,
      'An empty result is a valid preview. Null, rather than an empty list, means that no live preview exists.'),
    tf('A notebook user has permission to edit the code, but the job identity lacks permission to read its input table.',
      'Editing the notebook automatically supplies the job with the missing table permission.', false,
      'Code editing, execution and data access have separate permissions and may involve different identities.'),
    q('A valid preview is produced, then the teaching process restarts. The program next tries to save the preview.',
      'What should happen?',
      ['Report that there is no live preview to save', 'Recover the lost preview from its former memory automatically', 'Assume the old displayed rows were already saved'], 0,
      'Restart sets preview to null in this model. The program needs to calculate or load a preview again before saving.'),
    tf('A classic interactive compute resource is idle but has not yet terminated.',
      'It can still accumulate charges during that idle period.', true,
      'The service documentation distinguishes idle time from termination. An appropriate automatic-termination policy can limit unnecessary running time.'),
  ],
  practice: [challenge('Follow Saved Data and Live State Through a Restart', [
    'Write run_workspace(saved, events). saved is a list of record dictionaries. Begin with a deep copy of those records under saved and preview set to None. events is an ordered list of dictionaries. A preview event has kind="preview" and rows containing a list of record dictionaries; copy those rows into preview without changing saved. A save event has kind="save"; deep-copy the current preview into saved, retaining the preview. A restart event has kind="restart"; set preview to None while preserving saved.',
    'Return a new dictionary with keys saved and preview. Empty record lists are valid. Raise ValueError for an invalid record list, an event that is not a dictionary, an unknown or absent kind, a missing or invalid rows field on a preview event, or a save when preview is None. Do not mutate the input saved records or event dictionaries. Print the final state for the supplied sequence. This models local value lifetimes and does not execute Databricks operations.',
  ], `def run_workspace(saved, events):\n    pass\n\n${workspaceFixture}`,
  workspaceSolution,
  "{'saved': [{'id': 'a', 'temperature': 12}], 'preview': None}", [
    'Keep saved and preview as separate fields. Preview changes one field; save deliberately copies it into the other.',
    'Check for None when deciding whether a preview exists. An empty list is a valid calculated result that can be saved.',
    'Apply the events in order. A restart clears the preview, so saving after that point must fail until a new preview exists.',
  ], [
    ['Unsaved preview is lost at restart', 'assert run_workspace([{"id":"old"}],[{"kind":"preview","rows":[{"id":"new"}]},{"kind":"restart"}]) == {"saved":[{"id":"old"}],"preview":None}'],
    ['Saved preview survives restart', 'assert run_workspace([{"id":"old"}],[{"kind":"preview","rows":[{"id":"new"}]},{"kind":"save"},{"kind":"restart"}]) == {"saved":[{"id":"new"}],"preview":None}'],
    ['An empty result is saveable', 'assert run_workspace([{"id":"old"}],[{"kind":"preview","rows":[]},{"kind":"save"},{"kind":"restart"}]) == {"saved":[],"preview":None}\nassert run_workspace([],[]) == {"saved":[],"preview":None}'],
    ['Saving missing or discarded state fails', 'for events in ([{"kind":"save"}],[{"kind":"preview","rows":[]},{"kind":"restart"},{"kind":"save"}]):\n    try: run_workspace([],events)\n    except ValueError: pass\n    else: raise AssertionError("Saved a missing preview")'],
    ['Invalid events and record lists fail', 'for saved,events in [(None,[]),([3],[]),([],[{"kind":"preview"}]),([],[{"kind":"unknown"}]),([],[None])]:\n    try: run_workspace(saved,events)\n    except ValueError: pass\n    else: raise AssertionError("Invalid state was accepted")'],
    ['Independent source and result records', 'import copy\nsaved=[{"id":"old","nested":{"value":1}}]\nevents=[{"kind":"preview","rows":[{"id":"new","nested":{"value":2}}]},{"kind":"save"}]\nbefore=copy.deepcopy((saved,events))\nstate=run_workspace(saved,events)\nstate["preview"][0]["nested"]["value"]=99\nassert state["saved"][0]["nested"]["value"] == 2\nassert (saved,events) == before'],
    ['A new preview after restart can be saved', 'assert run_workspace([],[{"kind":"preview","rows":[{"id":"first"}]},{"kind":"restart"},{"kind":"preview","rows":[{"id":"second"}]},{"kind":"save"}])["saved"] == [{"id":"second"}]'],
  ], { question: 'Which result survives when the process restarts, and which value must be calculated again?' })],
  build: build('Save the Intended Result Before Restarting',
    'Botie can see the cleaned pump rows in a preview. The next process must read those rows from the saved table after the preview’s process has restarted.',
    'Start from savedRows, attach calculatedRows as the live preview, deliberately save that preview, and restart the teaching process. Return the final state with exactly two fields: saved contains calculatedRows, while preview is null. An empty calculated result is valid and must also be saved. The source supplies the program result so this workshop can focus on its lifetime.',
    { savedRows:'Previously saved pump records',calculatedRows:'Rows calculated by the cleaning program' }, [
      sample('Two saved rows become one accepted row', { savedRows:[{id:'a',temperature:12},{id:'b',temperature:-3}],calculatedRows:[{id:'a',temperature:12}] }, sessionResult([{id:'a',temperature:12}])),
      sample('The new calculation legitimately accepts no rows', { savedRows:[{id:'c',temperature:-5}],calculatedRows:[] }, sessionResult([])),
      sample('A later batch has different accepted records', { savedRows:[{id:'d',temperature:6}],calculatedRows:[{id:'e',temperature:14},{id:'f',temperature:9}] }, sessionResult([{id:'e',temperature:14},{id:'f',temperature:9}])),
    ], op('dbxWorkspaceRestart',op('dbxWorkspaceSavePreview',op('dbxWorkspacePreview',op('dbxWorkspaceOpen',s('savedRows')),s('calculatedRows')))),
    'Saving happens while the preview exists. The restart then clears temporary state while leaving the deliberately saved result available.',
    'The saved field is an in-memory representation of persistent storage for this model. These tools neither run a notebook nor establish real write durability, permissions, transactions or cloud behavior.'),
  journey: journey('The cleaning result is visible, but Botie needs it to remain available after a process restart.',
    'Place the Save at the Right Point',
    'Build the state sequence so the calculated preview is saved before the process holding it is restarted.',
    'A later process finds the requested saved records even though the preview has been cleared.',
    diagnose('The Empty Result Is Not Saved',
      'The new calculation accepts no rows. After restart, the saved table still contains yesterday’s rejected row. Which decision needs repairing?',
      ['Treating an empty list as a valid preview that must be saved', 'No accepted rows is still a result. Skipping that save leaves the earlier table unchanged.'],
      ['Keeping the old row because it was once visible', 'The requested output follows the current calculation, not an earlier display.'],
      'Distinguish a live empty preview from null, which means there is no preview to save.'),
    [connection('databricks-data-lakes','Keep persistent storage separate from compute','The saved table remains available independently of the temporary process.'),connection('what-is-databricks','Separate requested work from its execution','A notebook or manifest can describe a result without having saved the calculated records.')],
    'Where would you look if the displayed output was correct but the next run still read the earlier table?',
    'Inspect the explicit write and its destination, rather than assuming a display changed persistent data.',
    { path:[0], title:'Inspect the State Before Restart',challenge:'Return the state after the preview has been saved but before restart clears it.',why:'At this point, both saved and preview should contain the calculated rows. That makes the effect of restart directly visible.' },
    ['Put the calculated rows in memory changes only the preview.', 'Save the preview records must receive that live state. Connect its output to Restart the teaching process.']),
  fresh: fresh('A Fresh Batch Replaces the Earlier Result',
    'The saved table contains a reading from last week. Today’s program returns the supplied two different records. Save that current preview before restarting, then return the saved rows with preview set to null.',
    { savedRows:[{id:'last-week',temperature:20}],calculatedRows:[{id:'today-1',temperature:8},{id:'today-2',temperature:13}] },
    sessionResult([{id:'today-1',temperature:8},{id:'today-2',temperature:13}]),
    'A copied earlier answer would leave the wrong records behind. The saved result must follow the current program output before temporary memory is cleared.'),
});

for (const record of [databricksPlatformIntroduction, databricksWorkspaceCompute]) {
  record.checkpoints[0].after = record.parts[2].title;
  record.reading.practiceTitle = `Practice. ${record.practice[0].title}`;
}
databricksPlatformIntroduction.technicalStart = databricksPlatformIntroduction.parts[3].title;
databricksWorkspaceCompute.technicalStart = databricksWorkspaceCompute.parts[4].title;
