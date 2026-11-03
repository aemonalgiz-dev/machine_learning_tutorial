import {
  lesson, p, example, history, source, before, table, challenge, construction,
  sample, s, op, q, tf, journey, predict, diagnose, connection, fresh,
} from './applied-authoring.mjs';

const section = 'Introduction to Databricks';
const task = (id, ...dependsOn) => ({ id, dependsOn });
const pumpTasks = [task('read'), task('clean', 'read'), task('check', 'clean'), task('publish', 'check')];
const jobRecipe = op('dbxReadyTaskIds', op('dbxTaskReadiness', s('tasks'), s('completed')));
const jobData = `tasks = [
    {"id": "read", "dependsOn": []},
    {"id": "clean", "dependsOn": ["read"]},
    {"id": "check", "dependsOn": ["clean"]},
    {"id": "publish", "dependsOn": ["check"]},
]
print(ready_tasks(tasks, ["read", "clean"]))`;
const jobSolution = `def ready_tasks(tasks, completed):
    ids = [item["id"] for item in tasks]
    if len(set(ids)) != len(ids):
        raise ValueError("Task IDs must be distinct")
    dependencies = {item["id"]: item["dependsOn"] for item in tasks}
    for required in dependencies.values():
        if len(set(required)) != len(required):
            raise ValueError("Repeated dependency")
        if any(key not in dependencies for key in required):
            raise ValueError("Unknown dependency")
    # Check whether every task can eventually be reached from a starting task.
    reached = set()
    while len(reached) < len(tasks):
        available = {key for key in ids if key not in reached
                     and all(parent in reached for parent in dependencies[key])}
        if not available:
            raise ValueError("Dependency cycle")
        reached.update(available)
    done = set(completed)
    if len(done) != len(completed) or any(key not in dependencies for key in done):
        raise ValueError("Unknown or repeated completed task")
    for key in done:
        if any(parent not in done for parent in dependencies[key]):
            raise ValueError("A completed task has an unfinished prerequisite")
    return [key for key in ids if key not in done
            and all(parent in done for parent in dependencies[key])]

${jobData}`;

export const databricksNotebooksJobs = lesson({
  id: 'databricks-notebooks-jobs', title: 'Notebooks and Jobs', section,
  topic: 'Databricks Fundamentals',
  blurb: 'A notebook lets us develop a calculation in small steps. A job gives repeated runs a declared order and inputs, so tomorrow’s result does not depend on someone remembering which cells to execute.',
  openingTitle: 'What Changes When Someone Else Needs to Run the Notebook?',
  openingBeforeHistory: true,
  opening: [
    'We can now find the pump readings and understand where a Spark calculation runs. The next practical question is where to write the code. In Databricks, a notebook keeps code in cells alongside explanations and displayed results. We can run one cell, inspect its output, and continue working.',
    'That convenience can hide a dependency. Suppose we ran a cell that prepared clean_readings, changed the earlier cleaning rule, then reran only the final chart. The chart can still use the old object held in the running session. The saved code and the session’s current values are different things.',
    'When the maintenance team needs a fresh table every morning, remembering yesterday’s click order is not a reliable procedure. We need to state what runs, which inputs it receives, and which earlier work must succeed first. Databricks jobs provide that workflow control. We will build the dependency part before discussing a schedule.',
  ],
  prerequisites: [before('The Basics of Spark', 'databricks-basics'), before('Workspaces and Compute', 'databricks-workspaces-compute')],
  appliedIn: [before('Tracking Experiments with MLflow', 'databricks-mlflow-basics')],
  outputLabel: 'Unfinished tasks whose prerequisites succeeded', checkpointTitle: 'Questions on Parts 1 to 2',
  history: history('From an Interactive Calculation to Repeatable Work', [
    source('Project Jupyter origins', 'https://jupyter.org/about'),
    source('Databricks notebooks', 'https://docs.databricks.com/aws/en/notebooks/'),
    source('Running Databricks notebooks', 'https://docs.databricks.com/aws/en/notebooks/run-notebook'),
    source('Lakeflow Jobs concepts', 'https://docs.databricks.com/aws/en/jobs/'),
    source('A Databricks notebook workflow', 'https://docs.databricks.com/aws/en/jobs/jobs-quickstart'),
  ],
  'Interactive computing lets someone try a calculation and inspect the result while deciding what to do next. Notebook interfaces keep that exploration beside the explanation. Project Jupyter grew out of IPython in 2014 as the work expanded across programming languages. Databricks notebooks address a related need in a shared data platform: colleagues can develop code and inspect results in the same workspace.',
  'A saved notebook does not, by itself, describe every action that produced an interactive session. Running cells out of order can leave values that are no longer explained by the visible code. Repeated work needs an explicit execution procedure. Databricks jobs coordinate tasks and their dependencies, and can start those workflows from schedules or other triggers. That solves when and in what order work runs; the program still has to calculate the right result.'),
  diagram: table('The morning pump update', 'Each task needs the successful output of the task above it.',
    ['Task', 'Reads', 'Produces'], [
      ['read', 'The declared source table', 'The current batch of readings'],
      ['clean', 'The read task’s batch', 'Readings accepted by the declared rule'],
      ['check', 'The cleaned readings', 'A quality decision for this batch'],
      ['publish', 'A successful quality decision', 'The table other programs are allowed to use'],
    ], 'This invented workflow uses an all-prerequisites-successful rule. A real job can use other run conditions, branching and retries.'),
  parts: [
    p('Code cells and the running session',
      'A code cell contains instructions. Executing it changes a running program’s state and may display an output. A text cell explains the work without executing Python. Keeping both nearby makes an investigation easier to follow.\n\nSaving a notebook preserves its authored content. A variable such as clean_readings lives in the current execution session. It can disappear when the session is restarted, and it can remain stale after an earlier cell is edited. A displayed result may therefore describe an earlier execution.\n\nBefore sharing a notebook, check that its intended sequence works in a clean session with its declared inputs. Running from the beginning is useful evidence about hidden state. It still does not prove that the cleaning rule or the resulting data is correct.',
      null, 'A saved notebook is a program we can execute. Its last displayed table should not be mistaken for a newly calculated result.'),
    p('Make the inputs explicit',
      'A calculation needs to know which readings to use. A date typed into a cell can work during exploration, but a repeated run should receive that date as an explicit input. An input supplied for a run is called a parameter.\n\nFor our pump update, input_table and batch_date describe the requested data. Record their values with the run, then have the code read those values deliberately. A new date should cause a new request, rather than require someone to edit several unrelated cells.\n\nDatabricks supports parameters for jobs and their tasks. The way they enter the code depends on the task type. A notebook parameter and a command-line argument are different interfaces even when they represent the same date. Keep that interface documented.',
      null, 'For the local examples, a Python dictionary will hold the named inputs. It is an ordinary data structure, not a connection to Databricks.', [
        example('Keep the requested batch together', 'Read the date from a small input record before using it elsewhere.',
          'parameters = {"input_table": "maintenance.raw.readings", "batch_date": "2026-10-30"}\nprint(parameters["input_table"])\nprint(parameters["batch_date"])',
          'maintenance.raw.readings\n2026-10-30', 'A later run can supply a different date while keeping the same procedure.'),
      ]),
    p('A job describes tasks and their dependencies',
      'A Databricks job coordinates one or more tasks. A task can run a notebook, a Python script or another supported kind of work. A job run is one execution of that configured workflow. These names distinguish the reusable definition from what happened on a particular attempt.\n\nIn our workflow, clean depends on read because it needs the batch that read produced. Publish depends on check because the team has decided not to publish a batch whose quality check failed. A dependency says why one task must wait for another. It is more informative than placing task names in a list.\n\nDraw an arrow from each prerequisite to the task waiting for it. Following the arrows should never bring us back to our starting point. Such a loop is a cycle: every task in that loop would be waiting for work that cannot start. A directed graph without these cycles is called a directed acyclic graph, or DAG.',
      null, 'A chain is only one possible graph. Independent checks can both follow clean, while publish waits for both of them.'),
    p('Decide which tasks may start now',
      'For this workshop, every dependency must have succeeded before its dependent task is ready. Start with the IDs of tasks already completed successfully. For each unfinished task, inspect every ID in its dependsOn list. It is ready only when all those prerequisites are in the completed set.\n\nCompleted tasks do not become ready again. A failed or still-running task is not included in our completed-success set, so its dependents continue waiting. An empty dependency list allows an unfinished task to start at the beginning.\n\nThe workshop first keeps each task beside the prerequisites it is waiting for. A second component collects only the ready IDs. Inspect the intermediate records to see why a tempting task is blocked. Readiness here says nothing about whether a free computer is available.',
      'Completed successes = [read, clean]\ncheck waits for clean: ready\npublish waits for check: waiting\n\nReady task IDs = [check]',
      'When check succeeds, publish becomes ready. Moving a task earlier in the input list does not satisfy its dependencies.'),
    p('Check the plan before trusting its order',
      'A misspelled dependency can leave a task waiting for an ID that will never exist. Reusing an ID can make two different tasks look like one. Check that IDs are distinct and every dependency names a real task. Our teaching format also lists each dependency and each completed ID once.\n\nWe can check for a cycle by repeatedly finding tasks whose prerequisites have already been reached. If unreached tasks remain but none can be reached next, the plan contains a cycle. This checks whether the plan can make progress from its starting tasks; it does not actually execute anything.\n\nThe completed set must also be consistent with our success-only rule. Claiming publish succeeded while check is missing would contradict the supplied dependency graph. The local checker rejects that state instead of inventing a run history to explain it.',
      null, 'In a real job, inspect task states and the configured run conditions. The small checker deliberately leaves out retries, concurrency limits and alternative success or failure conditions.'),
    p('Schedule the procedure and inspect each run',
      'A schedule answers when to request a run. Dependencies answer what may run after other work. Neither one establishes whether the source data arrived on time or whether a published table is useful. Decide what the workflow should do when an input is missing or a quality check fails.\n\nIn a real Databricks workspace, notebooks are saved workspace objects and a notebook task refers to the notebook it should execute. Jobs expose their task graph and run history. Use that history to inspect the input parameters and find which task failed. The official workflow tutorial linked in the sources walks through creating notebooks, configuring tasks and inspecting a run.\n\nFor repeated processing, save outputs deliberately and use stable input identities. A later task should read the table or file the earlier task published, not rely on an interactive variable from someone’s old session. Retrying also needs care when work writes data; we will investigate replay-safe ingestion later.',
      null, 'The browser workshop checks dependency reasoning using supplied records. It creates no jobs, schedules or computing resources in a cloud account.'),
  ],
  questions: [
    q('A notebook cell defines clean_readings. A later chart cell uses it. The cleaning cell is edited but not rerun.',
      'What can the chart still use when only the chart cell runs?', ['The older value held in the current session', 'A new value calculated automatically from the edit', 'Only values written to a cloud table'], 0,
      'Editing saved instructions does not necessarily execute them. The running session may still hold the earlier object.'),
    tf('A daily pump-processing job receives batch_date as a named input for each run.',
      'Keeping that value in the run record helps identify which batch the program was asked to process.', true,
      'The parameter states the requested input. It does not by itself establish that the program read the correct records.'),
    q('Tasks are read -> clean -> check -> publish. Only read and clean have completed successfully.',
      'Which unfinished task is ready under the all-prerequisites-successful rule?', ['check', 'publish', 'read'], 0,
      'Check’s prerequisite clean succeeded. Publish still needs check, while read is already complete.'),
    tf('Two checks depend on clean but not on each other. Clean has succeeded and neither check has run.',
      'The dependency rule can mark both checks ready at once.', true,
      'Their prerequisites are satisfied independently. Actual concurrent execution also requires available resources and an appropriate job configuration.'),
    q('Task A depends on B, and B depends on A. Neither is completed.',
      'What should the teaching checker report?', ['A dependency cycle', 'Both tasks ready', 'The first task in the list ready'], 0,
      'Each task waits for the other. Input order does not create a valid starting point.'),
    tf('A job is scheduled for 02:00 every day. No check confirms whether yesterday’s sensor file has arrived.',
      'The schedule alone establishes that each result uses a complete new batch.', false,
      'A trigger requests execution. Freshness and completeness need explicit checks on the supplied inputs.'),
    q('Publish depends on check. A supplied success set contains publish but does not contain check.',
      'How does our success-only model treat that state?', ['Reject it as inconsistent with the declared dependencies', 'Assume check succeeded without recording it', 'Start publish again immediately'], 0,
      'The model requires successful prerequisites for every completed task and does not invent missing history.'),
  ],
  practice: [challenge('Find the Tasks Ready to Run', [
    'Write ready_tasks(tasks, completed). tasks is a list of dictionaries containing a nonempty text id and a dependsOn list of text task IDs. completed lists successfully completed task IDs. Return the IDs of unfinished tasks whose prerequisites are all completed, in the original tasks order. An empty plan and empty completed list return [].',
    'Raise ValueError for repeated task IDs, repeated dependency IDs within one task, dependencies that name unknown tasks, a dependency cycle, unknown or repeated completed IDs, or a completed task whose prerequisite is not completed. Assume the supplied dictionaries otherwise have the stated fields and types. Do not modify either input. The local model uses all-prerequisites-successful only and does not allocate computers or run code.',
    'The workspace supplies the pump update. Print which task is ready after read and clean have succeeded. Then check a branched workflow and an inconsistent completion record with the tests.',
  ], `def ready_tasks(tasks, completed):\n    pass\n\n${jobData}`, jobSolution, "['check']", [
    'Build a mapping from each task ID to its required IDs. Check the mapping before asking which task is ready.',
    'Keep the validation of the complete graph separate from the current success set. A cycle can be present even if another branch has a ready task.',
    'After validation, keep only tasks absent from completed whose every prerequisite is present in completed. Preserve the input order.',
  ], [
    ['Branches and completed tasks', 'plan=[{"id":"r","dependsOn":[]},{"id":"left","dependsOn":["r"]},{"id":"right","dependsOn":["r"]}]\nassert ready_tasks(plan,[]) == ["r"]\nassert ready_tasks(plan,["r"]) == ["left","right"]\nassert ready_tasks(plan,["r","left","right"]) == []'],
    ['Empty plan and input order', 'assert ready_tasks([],[]) == []\nassert ready_tasks([{"id":"b","dependsOn":[]},{"id":"a","dependsOn":[]}],[]) == ["b","a"]'],
    ['Unknown or repeated identities', 'bad=[([{ "id":"a","dependsOn":["missing"]}],[]),([{ "id":"a","dependsOn":[]},{ "id":"a","dependsOn":[]}],[]),([{ "id":"a","dependsOn":[]}],["missing"]),([{ "id":"a","dependsOn":[]}],["a","a"]),([{ "id":"a","dependsOn":[]},{ "id":"b","dependsOn":["a","a"]}],[])]\nfor plan,done in bad:\n    try: ready_tasks(plan,done)\n    except ValueError: pass\n    else: raise AssertionError("Invalid identity accepted")'],
    ['Cycles and inconsistent success', 'bad=[([{ "id":"a","dependsOn":["b"]},{ "id":"b","dependsOn":["a"]}],[]),([{ "id":"a","dependsOn":[]},{ "id":"b","dependsOn":["a"]}],["b"])]\nfor plan,done in bad:\n    try: ready_tasks(plan,done)\n    except ValueError: pass\n    else: raise AssertionError("Inconsistent dependency state accepted")'],
    ['Inputs remain unchanged', 'import copy\nplan=[{"id":"a","dependsOn":[]},{"id":"b","dependsOn":["a"]}]\ndone=["a"]\nbefore=copy.deepcopy((plan,done))\nready_tasks(plan,done)\nassert (plan,done) == before'],
  ], { question: 'Which parts of the pump update can start now, and which must keep waiting?' })],
  build: { ...construction('Choose the Next Pump-Processing Tasks',
    'Botie’s notebook procedure now needs to run without someone choosing the next cell from memory.',
    'Connect the task plan and successfully completed IDs to a prerequisite check. From that inspection, return only ready, unfinished task IDs in plan order. A task with no prerequisites may start initially; a completed task must not be returned again. The next example changes which work has succeeded.',
    { tasks: 'Pump update task plan', completed: 'Successfully completed tasks' }, [
      sample('The input has been read', { tasks: pumpTasks, completed: ['read'] }, ['clean']),
      sample('The quality check has also succeeded', { tasks: pumpTasks, completed: ['read','clean','check'] }, ['publish']),
      sample('Two inspections can follow cleaning', { tasks: [task('read'),task('clean','read'),task('check-values','clean'),task('check-count','clean'),task('publish','check-values','check-count')], completed: ['read','clean'] }, ['check-values','check-count']),
    ], jobRecipe,
    'A task’s missing prerequisites determine whether it can start. Its position on a drawing does not satisfy those prerequisites.',
    'This local graph model checks an all-prerequisites-successful rule. It does not run notebooks, reserve compute, implement retries or reproduce every Lakeflow Jobs run condition.'), extras: [] },
  journey: journey('The calculation works interactively, but the daily update still depends on remembering which step comes next.',
    'Make the Waiting Conditions Visible', 'Inspect each task’s prerequisites before collecting its ready ID.',
    'Only unfinished tasks with successful prerequisites are returned.',
    predict('The Check Has Finished', 'Read, clean and check have succeeded. Which task becomes ready, and why should the completed tasks stay out of the result?', 'Inspect the readiness records, then compare them with the returned IDs.'),
    [connection('databricks-basics', 'Separate pieces of work from the data they process', 'The task plan describes the procedure; it does not change what a reading means.'), connection('databricks-workspaces-compute', 'Distinguish saved code from the processes running it', 'A repeated job needs explicit task dependencies and inputs instead of an old interactive session.')],
    'What would happen if publish depended only on clean and skipped the quality check?', 'Keep the prerequisites that justify an output attached to the repeated procedure.',
    { path: [0], title: 'Inspect What Each Task Is Waiting For', challenge: 'Return the readiness records for every task before selecting the ready IDs.', why: 'The intermediate records explain why publish must wait.' },
    ['Give the prerequisite checker both the task records and completed IDs.', 'The ready-ID component should read the inspection result, not the original task list.']),
  fresh: fresh('One of Two Checks Is Still Waiting', 'The values check succeeded after cleaning, but the count check has not run. Which task may start next?',
    { tasks: [task('read'),task('clean','read'),task('check-values','clean'),task('check-count','clean'),task('publish','check-values','check-count')], completed: ['read','clean','check-values'] }, ['check-count'],
    'Publish still needs both checks. A partially completed branch cannot be treated as permission to publish.'),
});

const run = (runId, limit, mae, tableName = 'maintenance.prepared.readings', version = 4) => ({ runId, parameters: { limit }, metrics: { mae }, dataset: { table: tableName, version } });
const runManifest = (record, paths) => ({ ...record, artifacts: paths });
const runRecipe = op('dbxAttachIntroArtifacts', op('dbxPickIntroRun', s('runs'), s('requestedRunId')), s('artifacts'));
const runData = `runs = [
    {"runId":"attempt-a", "parameters":{"limit":10}, "metrics":{"mae":2.5},
     "dataset":{"table":"maintenance.prepared.readings", "version":4}},
    {"runId":"attempt-b", "parameters":{"limit":20}, "metrics":{"mae":1.8},
     "dataset":{"table":"maintenance.prepared.readings", "version":5}},
]
artifacts = [
    {"runId":"attempt-b", "path":"model.json"},
    {"runId":"attempt-a", "path":"model.json"},
    {"runId":"attempt-a", "path":"assessment.json"},
]
print(describe_run(runs, "attempt-a", artifacts))`;
const runSolution = `import copy
import math

def describe_run(runs, requested, artifacts):
    ids = [item["runId"] for item in runs]
    if len(set(ids)) != len(ids):
        raise ValueError("Run IDs must be distinct")
    matching = [item for item in runs if item["runId"] == requested]
    if len(matching) != 1:
        raise ValueError("Requested run is missing")
    selected = matching[0]
    for item in runs:
        if any(not isinstance(value, (str, bool, int, float))
               or isinstance(value, (int, float)) and not math.isfinite(value)
               for value in item["parameters"].values()):
            raise ValueError("Invalid parameter")
        if any(isinstance(value, bool) or not isinstance(value, (int, float))
               or not math.isfinite(value) for value in item["metrics"].values()):
            raise ValueError("Invalid metric")
        version = item["dataset"]["version"]
        if isinstance(version, bool) or not isinstance(version, int) or version < 0:
            raise ValueError("Invalid table version")
    paths = [item["path"] for item in artifacts if item["runId"] == requested]
    if len(set(paths)) != len(paths):
        raise ValueError("Repeated path within one run")
    return {"runId": requested,
            "parameters": copy.deepcopy(selected["parameters"]),
            "metrics": copy.deepcopy(selected["metrics"]),
            "dataset": copy.deepcopy(selected["dataset"]),
            "artifacts": paths}

${runData}`;

export const databricksMlflowBasics = lesson({
  id: 'databricks-mlflow-basics', title: 'Tracking Experiments with MLflow', section,
  topic: 'Databricks Fundamentals',
  blurb: 'Changing a model produces new settings, measurements and saved files. MLflow keeps those records associated with the attempt that produced them, so we can inspect a result without guessing what was run.',
  openingTitle: 'Which Attempt Produced This Model File?',
  openingBeforeHistory: true,
  opening: [
    'The scheduled pump workflow can now prepare a dataset and run a calculation. Suppose we try a different model setting and save another file named model.json. A note says the latest error was lower. Which file belongs to that measurement, and which version of the readings did it use?',
    'A useful experiment record keeps that information together. MLflow is an open-source platform with tools for tracking model development. Its tracking service records attempts and their settings, measurements and saved outputs. Databricks provides a managed integration, while MLflow can also be used elsewhere.',
    'We will start by recording an attempt accurately. Choosing the best model is a later question. A lower number cannot tell us much if we have already mixed one attempt’s score with another attempt’s model file.',
  ],
  prerequisites: [before('Notebooks and Jobs', 'databricks-notebooks-jobs'), before('Tables and Unity Catalog', 'databricks-table-names')],
  appliedIn: [before('Connect model scores to their input data', 'databricks-mlflow-lineage')],
  outputLabel: 'The requested attempt with its own saved outputs', checkpointTitle: 'Questions on Parts 1 to 2',
  history: history('Why Experiment Tracking Needed Its Own Record', [
    source('MLflow’s June 2018 introduction', 'https://www.databricks.com/blog/2018/06/05/introducing-mlflow-an-open-source-machine-learning-platform.html'),
    source('MLflow Tracking concepts', 'https://mlflow.org/docs/latest/ml/tracking/'),
    source('MLflow Tracking API concepts', 'https://mlflow.org/docs/latest/ml/tracking/tracking-api/'),
    source('MLflow Tracking quickstart', 'https://mlflow.org/docs/latest/ml/tracking/quickstart/'),
    source('MLflow Model Registry concepts', 'https://mlflow.org/docs/latest/ml/model-registry/'),
  ],
  'Trying a different model setting is easy. Reconstructing which code, data and setting produced an old model can be much harder. The June 2018 MLflow announcement described that difficulty alongside the problem of moving work between different machine-learning libraries and execution environments. The initial project provided an open way to track attempts instead of tying their records to one algorithm.',
  'Tracking makes each recorded attempt something we can inspect later. Its settings, measured results and output files stay connected by the run identity. That connection does not establish that the measurement was fair or that the model is ready to deploy. It gives us the evidence we need to ask those questions without first guessing which attempt a file came from.'),
  diagram: table('One Attempt, Several Kinds of Evidence', 'The run ID connects these records without making their meanings interchangeable.',
    ['Record', 'Example', 'What it tells us'], [
      ['Run identity', 'attempt-a', 'Which execution we are describing'],
      ['Parameter', 'limit = 10', 'A setting supplied to the procedure'],
      ['Metric', 'mae = 2.5', 'A numerical measurement made during that attempt'],
      ['Input identity', 'maintenance.prepared.readings, version 4', 'Which declared dataset the attempt used'],
      ['Artifact', 'model.json owned by attempt-a', 'A saved output associated with this attempt'],
    ], 'These invented records use a small local schema. They are not the JSON format of the MLflow API, and no artifact is loaded.'),
  parts: [
    p('Experiments group related attempts',
      'We may try several approaches to the same pump-prediction problem. An experiment is a named collection that keeps that related work together. A run is one recorded execution within it. Repeating identical settings still produces another execution, so it should have its own run identity.\n\nKeep a useful experiment name, then inspect individual runs inside it. In Databricks, the experiment interface provides that view; notebooks can also record work through the MLflow API. MLflow itself is an independent open-source project, so using its tracking concepts does not require Databricks.\n\nA job run and an MLflow run describe different records. A scheduled job can contain several tasks, and model code within one task can record one or more MLflow runs. Do not assume their identifiers are interchangeable.',
      null, 'Our local problem requests one exact run ID. It is an identity lookup, not a competition between scores.'),
    p('Separate supplied settings from measurements',
      'A parameter records a setting, such as how many times training should process the dataset. A metric records a numerical measurement, such as a prediction error on a named assessment dataset. Writing them in different fields helps us distinguish what we chose from what we observed.\n\nA single metric can have measurements at several steps, for example after successive training passes through the data. Our workshop keeps just one scalar measurement per metric name so the ownership question stays easy to inspect. The real tracking service can retain a metric’s history.\n\nA parameter does not fully describe the procedure. Keep the code identity and required environment information as well. In the workshop’s smaller record, parameters, metrics and the declared input table remain separate dictionaries.',
      null, 'A value of zero may be a real measurement. Preserve it instead of treating it as missing.', [
        example('Read a setting and a measured result separately', 'Both dictionaries belong to the same local attempt record.',
          'attempt = {"runId":"a", "parameters":{"limit":10}, "metrics":{"mae":0.0}}\nprint(attempt["parameters"]["limit"])\nprint(attempt["metrics"]["mae"])',
          '10\n0.0', 'The setting and measured error have different roles even though both happen to be numbers.'),
      ]),
    p('Saved outputs are artifacts',
      'A model file, a chart or a report can be saved alongside a run. Such a saved output is called an artifact. The tracking record needs a way to locate it and associate it with the attempt that produced it. A metric value in the interface and a saved model are different outputs.\n\nTwo runs can each have an artifact named model.json. That shared filename does not mean the files belong to the same attempt. Use the owning run identity and the artifact’s location together. In the workshop, each artifact row has a runId and a path. Match the runId before collecting the paths.\n\nA recorded path is also not proof that the file remains available forever. Storage permissions, retention and whether an output was actually saved affect whether we can retrieve it. Our local problem reads only supplied metadata; it never opens or executes a model file.',
      null, 'A run with no supplied artifact rows returns an empty artifact list. Do not borrow another run’s model to fill that gap.'),
    p('Keep the dataset identity with the attempt',
      'The same code and settings can produce different results when the input records change. Keep enough input information to identify the requested dataset. For a versioned table, a version number belongs to that particular table. Version four of a different table is different evidence.\n\nOur record therefore keeps both the fully qualified table name and its nonnegative version number. Keeping that pair does not retain the underlying data files. Being able to read the same version later also depends on the storage and retention decisions discussed earlier.\n\nMLflow provides dataset-logging interfaces and other ways to record identifying information. Use an appropriate mechanism in real work, and record the assessment inputs as carefully as training inputs. The small teaching format includes one input identity; a production experiment can require more.',
      null, 'Before comparing attempts, establish what each one actually measured. The later model-lineage lesson returns to that comparison.'),
    p('Build a description without mixing attempts',
      'Start with the requested run ID and find its one matching record. Reject a missing ID or repeated run IDs instead of silently choosing the first row. Copy the selected parameters, metrics and dataset identity into the returned description.\n\nThen inspect the artifact records. Keep only paths whose owning runId matches the selected run. Preserve their supplied order, and reject a repeated path within that run in our teaching schema. A path can appear under a different run without creating a conflict between their identities.\n\nReturn a fresh description so later inspection does not edit the source record. The first workshop component selects the attempt; the second attaches its own outputs. Inspect that intermediate selection if the returned model path belongs to the wrong attempt.',
      'Requested run = attempt-a\nSelected input = maintenance.prepared.readings, version 4\n\nmodel.json owned by attempt-b: leave out\nmodel.json owned by attempt-a: include\nassessment.json owned by attempt-a: include',
      'The goal is a faithful record. No step in this lookup establishes which model performs better.'),
    p('From a recorded run to a managed model',
      'MLflow also supports model logging and a model registry. A registry organizes named models and their versions for later use. Registering a model does not turn its run ID into the model-version number, and naming an artifact does not register it automatically. Keep the roles of those identities explicit.\n\nIn a real environment, create an MLflow run around the work being measured, log settings and metrics deliberately, and save its outputs. The official quickstart in the sources shows the API and the experiment interface. It runs in an environment with MLflow installed and suitable access to the tracking service. Our browser exercises do not contact that service.\n\nA complete experiment still needs an appropriate assessment procedure. Recording a low error accurately is a necessary bookkeeping step; whether the error supports a useful model decision depends on the data and experiment design.',
      null, 'After the tracking record is reliable, we can investigate comparable scores, saved model lineage and the evidence needed for a release.'),
  ],
  questions: [
    q('A maintenance team tests three settings for one prediction problem. It needs to inspect each execution separately.',
      'How do experiment and run differ?', ['An experiment groups related work; a run identifies one recorded execution', 'A run is always a whole cloud account', 'An experiment is the model file itself'], 0,
      'Grouping makes related attempts easy to browse without erasing each execution’s identity.'),
    tf('A procedure is supplied limit=10 and later records mae=2.5 on its declared assessment data.',
      'The limit is a supplied parameter, while the error is a metric.', true,
      'The distinction separates a chosen setting from a measured result.'),
    q('Attempt A and attempt B both have an artifact named model.json. The requested run is A.',
      'Which field establishes whether an artifact row belongs in A’s description?', ['Its owning runId', 'Its filename alone', 'Whether its row happens to appear first'], 0,
      'A reused filename is not a unique attempt identity.'),
    tf('A recorded metric is mae=0.0.', 'The local description should preserve zero as a measurement.', true,
      'Zero is a valid finite number. It must not be confused with an absent metric.'),
    q('maintenance.prepared.readings has version 4. maintenance.test.readings also has version 4.',
      'What identifies the declared input unambiguously within this example?', ['The table name together with its version', 'The version number alone', 'The name of the model artifact'], 0,
      'Version identities belong to individual tables.'),
    tf('An MLflow run is recorded accurately and its error is lower than another run’s error.',
      'Tracking alone establishes that it is the better production model.', false,
      'The runs may have used different assessment data or a poor evaluation procedure. Tracking preserves evidence; it does not replace that assessment.'),
    q('The requested attempt has no artifact rows. Another attempt has model.json.',
      'What should its local artifact list contain?', ['No paths', 'The other attempt’s file as a fallback', 'Whichever filename is shortest'], 0,
      'Missing output evidence should stay missing rather than be filled with an unrelated run’s artifact.'),
    tf('A tracking record stores the name and version of a table.', 'That metadata guarantees the underlying files are retained indefinitely.', false,
      'Keeping an identity and retaining the identified data are separate responsibilities.'),
  ],
  practice: [challenge('Describe One Attempt and Its Own Outputs', [
    'Write describe_run(runs, requested, artifacts). runs contains dictionaries with runId, parameters, metrics and dataset. dataset contains table and version. artifacts contains runId and path dictionaries. Assume IDs, table names, field names and paths are nonempty text and all records have the stated field types. Return a new dictionary with runId, parameters, metrics, dataset and artifacts, in that order. The final artifacts field is the path list for the requested run, in the original artifact order. Copy nested dictionaries; do not edit the inputs.',
    'Raise ValueError if run IDs repeat, the requested run is absent, a path repeats within the selected run, a parameter is not a text/boolean/finite numerical scalar, a metric is not a finite number (booleans do not count), or a dataset version is not a nonnegative integer (booleans do not count). Validate the supplied run records before returning a description. An empty selected artifact list is valid. This is a local metadata format, not the MLflow API response format.',
    'The workspace gives two attempts and reuses model.json under both owners. Print the description of attempt-a. No artifact is opened, and neither recorded score is used to choose a winner.',
  ], `def describe_run(runs, requested, artifacts):\n    pass\n\n${runData}`, runSolution,
  "{'runId': 'attempt-a', 'parameters': {'limit': 10}, 'metrics': {'mae': 2.5}, 'dataset': {'table': 'maintenance.prepared.readings', 'version': 4}, 'artifacts': ['model.json', 'assessment.json']}", [
    'Find the exact requested ID before selecting any output path. Reject repeated IDs instead of taking the first match.',
    'Keep parameters, metrics and dataset in their separate dictionaries. The artifact lookup is a different step using the same selected run ID.',
    'A deep copy protects the nested source dictionaries when a caller later changes the returned description.',
  ], [
    ['Output ownership and zero measurements', 'a={"runId":"A","parameters":{},"metrics":{"mae":0.0},"dataset":{"table":"m.s.t","version":0}}\nb={"runId":"B","parameters":{},"metrics":{"mae":2},"dataset":{"table":"m.s.t","version":1}}\nfiles=[{"runId":"B","path":"model"},{"runId":"A","path":"model"},{"runId":"A","path":"report"}]\nactual=describe_run([b,a],"A",files)\nassert actual["artifacts"] == ["model","report"]\nassert actual["metrics"] == {"mae":0.0}\nassert actual["dataset"]["version"] == 0'],
    ['Empty artifact list and missing run', 'a={"runId":"A","parameters":{},"metrics":{},"dataset":{"table":"m.s.t","version":0}}\nassert describe_run([a],"A",[])["artifacts"] == []\ntry: describe_run([a],"missing",[])\nexcept ValueError: pass\nelse: raise AssertionError("Missing run accepted")'],
    ['Repeated identities', 'a={"runId":"A","parameters":{},"metrics":{},"dataset":{"table":"m.s.t","version":0}}\nfor records,files in [([a,a],[]),([a],[{"runId":"A","path":"model"},{"runId":"A","path":"model"}])]:\n    try: describe_run(records,"A",files)\n    except ValueError: pass\n    else: raise AssertionError("Repeated identity accepted")'],
    ['Invalid numerical values', 'import copy\na={"runId":"A","parameters":{},"metrics":{},"dataset":{"table":"m.s.t","version":0}}\nbad=[]\nfor value in [float("nan"),float("inf"),True]:\n    item=copy.deepcopy(a);item["metrics"]={"mae":value};bad.append(item)\nfor value in [-1,0.5,True]:\n    item=copy.deepcopy(a);item["dataset"]["version"]=value;bad.append(item)\nitem=copy.deepcopy(a);item["parameters"]={"limit":float("inf")};bad.append(item)\nfor item in bad:\n    try: describe_run([item],"A",[])\n    except ValueError: pass\n    else: raise AssertionError("Invalid measurement accepted")'],
    ['New description protects the source', 'import copy\na={"runId":"A","parameters":{"limit":2},"metrics":{"mae":1.0},"dataset":{"table":"m.s.t","version":3}}\nrecords=[a];files=[{"runId":"A","path":"model"}]\nbefore=copy.deepcopy((records,files))\nresult=describe_run(records,"A",files)\nresult["parameters"]["limit"]=99\nresult["dataset"]["version"]=99\nresult["artifacts"].append("other")\nassert (records,files) == before'],
  ], { question: 'Can we keep one attempt’s settings, input and saved files together even when filenames repeat?' })],
  build: { ...construction('Keep Each Model Output with Its Attempt',
    'Botie’s scheduled workflow saved two model files with the same name. Their measurements belong to different attempts.',
    'Find the requested run by its exact ID. Keep that run’s parameters, metrics and input table identity together, then attach only the artifact paths owned by the same run. Return the complete manifest in the stated field order. A repeated filename under another owner is not a match.',
    { runs: 'Recorded model attempts', requestedRunId: 'Attempt to inspect', artifacts: 'Saved outputs and their owners' }, [
      sample('The first attempt has one saved model', { runs: [run('A',10,2.5),run('B',20,1.8,'maintenance.prepared.readings',5)], requestedRunId: 'A', artifacts: [{runId:'A',path:'model.json'},{runId:'B',path:'model.json'}] }, runManifest(run('A',10,2.5),['model.json'])),
      sample('The requested attempt changes', { runs: [run('A',10,2.5),run('B',20,1.8,'maintenance.prepared.readings',5)], requestedRunId: 'B', artifacts: [{runId:'A',path:'model.json'},{runId:'B',path:'assessment.json'},{runId:'B',path:'model.json'}] }, runManifest(run('B',20,1.8,'maintenance.prepared.readings',5),['assessment.json','model.json'])),
      sample('No output was supplied for this attempt', { runs: [run('C',5,0)], requestedRunId: 'C', artifacts: [{runId:'B',path:'model.json'}] }, runManifest(run('C',5,0),[])),
    ], runRecipe,
    'An attempt identity connects the requested metadata and output ownership. Neither filename order nor the lowest score can replace that identity.',
    'The manifest is a small local teaching schema. It does not call MLflow, upload artifacts, train a model or establish that a recorded score is a fair comparison.'), extras: [] },
  journey: journey('The workflow repeats successfully, but model files and recorded measurements have become easy to confuse.',
    'Connect the Attempt Before Attaching Its Files', 'Select the requested run, inspect its input identity, then match output ownership to that same ID.',
    'The returned manifest describes only the requested attempt and its own saved outputs.',
    diagnose('The Requested Attempt Changes', 'The request now asks for B, but a construction still returns A’s model.json. Which lookup must follow the changed request?',
      ['The exact run selection and matching artifact owner', 'The same selected run identity must control both metadata and file ownership.'],
      ['The smaller error value', 'This problem asks for one requested attempt. It is not selecting a model by performance.'],
      'Inspect the selected run before attaching its artifact paths.'),
    [connection('databricks-notebooks-jobs', 'Distinguish a reusable procedure from one execution', 'A repeated task may produce a new model attempt that needs its own tracking identity.'), connection('databricks-table-names', 'Keep the full input table identity', 'The table name and its version remain attached to the attempt, even when a short name appears elsewhere.')],
    'What is still unknown about model quality after this manifest has been recorded correctly?', 'Keep evidence linked to the attempt before making a decision from it.',
    { path: [0], title: 'Inspect the Requested Run', challenge: 'Return the exact selected run before attaching artifacts.', why: 'A wrong selection is easier to see before a familiar filename hides the mismatch.' },
    ['Give the selection component both the run collection and the requested ID.', 'The artifact component must read that selected record and the output-owner records.']),
  fresh: fresh('A Familiar Filename Belongs to Another Attempt', 'Inspect attempt D. Other attempts also have model.json. Return only D’s output paths and preserve its different input table identity.',
    { runs: [run('B',20,1.8),run('D',8,3.1,'maintenance.calibrated.readings',2)], requestedRunId: 'D', artifacts: [{runId:'B',path:'model.json'},{runId:'D',path:'model.json'},{runId:'D',path:'plot.png'}] },
    runManifest(run('D',8,3.1,'maintenance.calibrated.readings',2),['model.json','plot.png']),
    'The filename stayed familiar while the owner and input changed. The result must follow the requested identity.'),
});

for (const record of [databricksNotebooksJobs, databricksMlflowBasics]) {
  record.reading.practiceTitle = `Practice. ${record.practice[0].title}`;
}
