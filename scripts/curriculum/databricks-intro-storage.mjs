import {
  lesson, p, example, history, source, before, table, challenge, construction,
  sample, s, op, q, tf, journey, diagnose, connection, fresh,
} from './applied-authoring.mjs';

const section = 'Introduction to Databricks';
const topic = 'Databricks Fundamentals';
const checkedOn = '2026-11-02';
const urls = {
  objects: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingMetadata.html',
  parquet: 'https://parquet.apache.org/docs/overview/',
  lakehouse: 'https://www.databricks.com/sites/default/files/2020/12/cidr_lakehouse.pdf',
  log: 'https://delta.io/blog/2023-02-01-delta-lake-time-travel/',
  migration: 'https://docs.delta.io/porting/',
  reads: 'https://docs.delta.io/delta-batch/',
  objectsInCatalog: 'https://docs.databricks.com/aws/en/database-objects',
  catalogs: 'https://docs.databricks.com/aws/en/catalogs',
  schemas: 'https://docs.databricks.com/aws/en/schemas',
  names: 'https://docs.databricks.com/aws/en/query/',
  grants: 'https://docs.databricks.com/aws/en/data-governance/unity-catalog/manage-privileges/',
  managed: 'https://docs.databricks.com/aws/en/tables/managed',
  external: 'https://docs.databricks.com/aws/en/tables/external',
  unityHistory: 'https://www.databricks.com/blog/2022/04/20/announcing-gated-public-preview-of-unity-catalog-on-aws-and-azure.html',
};
const intro = record => {
  const result = lesson({ ...record, section, topic });
  result.checkpoints[0].title = 'Questions on Parts 1 to 2';
  result.reading.practiceTitle = `Practice. ${record.practice[0].title}`;
  return result;
};
const build = (...args) => ({ ...construction(...args), extras: [], draftVersion: 1 });
const reference = (title, code, setup, interpretation, url, language = 'python') => ({
  title, code, language, setup, interpretation: [interpretation],
  description: ['This optional reference uses your own configured Databricks environment. The browser challenge uses local Python data and does not contact a cloud service.'],
  source: source('Official interface documentation', url), checkedOn,
});
const withReference = (part, value) => ({ ...part, references: [value] });

const firstFile = { key: 'readings/batch-0.parquet', rows: [{ pump: 'P7', temperature_c: 12 }, { pump: 'P2', temperature_c: 18 }] };
const pendingFile = { key: 'readings/batch-1.parquet', rows: [{ pump: 'P9', temperature_c: 27 }] };
const correctedFile = { key: 'readings/corrected-0.parquet', rows: [{ pump: 'P7', temperature_c: 14 }, { pump: 'P2', temperature_c: 18 }] };
const firstManifest = { version: 0, files: [firstFile.key] };
const lakeFixture = String.raw`files = [
    {"key": "readings/shift-a.parquet", "rows": [{"pump": "P3", "temperature_c": 16}]},
    {"key": "readings/shift-b.parquet", "rows": [{"pump": "P4", "temperature_c": 22}]},
    {"key": "readings/pending.parquet", "rows": [{"pump": "P8", "temperature_c": 99}]},
]
manifests = [{"version": 3, "files": ["readings/shift-b.parquet", "readings/shift-a.parquet"]}]
result = read_version(files, manifests, 3)
print(result)
print(len(result))`;
const lakeSolution = String.raw`from copy import deepcopy

def read_version(files, manifests, version):
    if type(version) is not int or version < 0:
        raise ValueError("Invalid version")
    versions = {}
    for manifest in manifests:
        number, keys = manifest["version"], manifest["files"]
        if type(number) is not int or number < 0 or number in versions:
            raise ValueError("Version identities must be unique nonnegative integers")
        if not isinstance(keys, list) or any(not isinstance(key, str) or not key for key in keys):
            raise ValueError("A file list contains nonempty object keys")
        if len(set(keys)) != len(keys):
            raise ValueError("Repeated committed object key")
        versions[number] = keys
    if version not in versions:
        raise ValueError("Requested version is not retained")
    stored = {}
    for file in files:
        key, rows = file["key"], file["rows"]
        if not isinstance(key, str) or not key or key in stored:
            raise ValueError("Stored object keys must be unique nonempty text")
        if not isinstance(rows, list) or any(not isinstance(row, dict) for row in rows):
            raise ValueError("Each file contains a list of records")
        stored[key] = rows
    if any(key not in stored for key in versions[version]):
        raise ValueError("A committed file is unavailable")
    return deepcopy([row for key in versions[version] for row in stored[key]])

${lakeFixture}`;

export const databricksDataLakes = intro({
  id: 'databricks-data-lakes',
  title: 'Data Lakes and Lakehouses',
  blurb: 'A data lake keeps datasets as files in shared storage. Table formats add rules for reading a consistent set of those files, while a lakehouse combines that storage approach with table management and analytical queries.',
  openingTitle: 'What Is a Data Lake?',
  opening: [
    'A maintenance team has sensor readings, repair notes and photographs of damaged pumps. They do not all have the same structure, and different programs need to use them. A data lake is a way of keeping datasets such as these in shared storage, often cloud object storage, without first converting everything into the same set of database tables.',
    'The storage still contains actual files with names and formats. Calling it a lake does not decide which readings are valid, which files make up a published table or who may read them. We will work through those distinctions before Botie opens a second batch of readings.',
  ],
  prerequisites: [before('What Databricks provides', 'what-is-databricks')],
  outputLabel: 'Records from the requested committed file list',
  checkpointTitle: 'Which part describes storage, and which part describes the records?',
  history: history(
    'Why Storing the Files Was Not Enough',
    [
      source('Armbrust and colleagues: Lakehouse, CIDR 2021', urls.lakehouse),
      source('Delta Lake: reading versions through the transaction log', urls.log),
      source('Delta Lake: migration precautions', urls.migration),
      source('Amazon S3: object identities', urls.objects),
      source('Apache Parquet: file format overview', urls.parquet),
      source('Delta Lake: retained batch reads', urls.reads),
    ],
    'Data warehouses brought records together so people could ask analytical questions across an organization. A maintenance report might compare repair costs by site using deliberately prepared tables. Keeping a wide variety of source files was another need. File-based lakes let teams retain those inputs for different kinds of processing, but a pile of files did not explain how a reader should handle a partly completed update.',
    'The lakehouse architecture described in the 2021 CIDR paper brought table-management capabilities to data held in open file formats. The aim was to support analytical tables and other data work without always maintaining separate copies in a lake and a warehouse. This is an architectural approach, not a rule that every warehouse or lake must behave the same way.',
    'Delta Lake addresses part of that reliability problem by recording committed table changes. A reader determines which data belongs to a table version from that recorded state. A file can therefore exist in storage without belonging to the version being read. Our workshop isolates that distinction with an already reconstructed file list; it does not implement Delta transactions.',
  ),
  diagram: table(
    'A stored file and a published table are different things',
    'These invented object keys all exist in storage. Version 0 names only batch-0.parquet.',
    ['Object key', 'Contains', 'In version 0?'],
    [
      ['readings/batch-0.parquet', 'P7: 12 °C; P2: 18 °C', 'Yes'],
      ['readings/batch-1.parquet', 'P9: 27 °C', 'No; not committed to this version'],
    ],
    'The requested version determines the file selection. Listing everything under readings/ answers a different question.',
  ),
  parts: [
    p('Files, object keys and shared storage',
      'A file contains bytes. A reader needs to know their format before it can turn those bytes into records. Cloud object storage keeps each object under a key, which identifies it within a container such as an Amazon S3 bucket.\n\nFor our team, readings/batch-0.parquet is an object key. The slashes help organize related names. In a general-purpose S3 bucket, a folder display is based on key prefixes rather than the same directory structure a local filesystem provides. The object store can keep the file without understanding that P7 is a pump.\n\nStorage is where the bytes persist. Compute is the processing that reads and changes them. Stopping a notebook’s compute does not, by itself, mean the stored files should disappear.',
      null,
      'Keep the object key beside the file contents in the small Python model. The key identifies the file; it does not describe the meaning of its rows.',
      [example('Inspect one stored file record',
        'The dictionary represents a file already decoded for this exercise. rows contains the pump records; this is not the binary content of a real Parquet file.',
        'file = {"key": "readings/batch-0.parquet", "rows": [{"pump": "P7", "temperature_c": 12}]}\nprint(file["key"])\nprint(file["rows"][0]["pump"])',
        'readings/batch-0.parquet\nP7',
        'A real storage client retrieves bytes and a format reader decodes them. The local exercise supplies the decoded records so we can focus on choosing the correct files.')]),
    p('CSV and Parquet organize the same values differently',
      'A CSV file stores text records, with a delimiter separating fields. A header can name pump and temperature_c, but a reader still needs rules for interpreting missing values and numerical types. A comma inside a field also needs the format’s quoting rules.\n\nParquet is a binary, column-oriented file format. It divides records into portions called row groups. Within each group, the values of each column are stored together in a column chunk. The file also records a schema, describing the fields and their data types.\n\nA query that needs only temperatures may be able to read less data than one that needs every column. Keeping similar values together also helps compression. The exact saving depends on the files and the query; column storage does not guarantee every operation will be faster.\n\nThese formats describe how values are stored, not whether the values are trustworthy. A well-formed numerical temperature can still use the wrong unit or come from a broken sensor. Our workshop labels files .parquet but receives Python dictionaries that have already been decoded.',
      'CSV illustration:\npump,temperature_c\nP7,12\nP2,18',
      'The two observations keep their row relationships whichever format stores them. Choosing a column does not give permission to reorder its values independently of the pump identifiers.'),
    p('A lake and a warehouse describe different storage arrangements',
      'The team can retain original readings and photographs in a lake, then run different programs over them. A warehouse focuses on managed analytical tables and queries, often after records have been prepared for reporting. These are useful starting distinctions; modern products have overlapping capabilities.\n\nA lakehouse applies table-management and analytical-query capabilities to lake storage, commonly using open table formats. Delta Lake is one such table format. It adds information and rules around data files so compatible engines can treat a changing collection as a table. It is not another name for Databricks or for the object store.\n\nDatabricks provides services for working with these stored datasets. The platform can manage table storage and its maintenance, while Spark and other supported compute perform calculations. Storing files, describing a table and running a query are related responsibilities with different jobs.',
      null,
      'Ask what each layer is doing. A file format explains bytes; a table format explains table state; a computation engine executes work against that state.'),
    p('Publish a complete version before readers use it',
      'Suppose the first batch is ready and a second file is still being prepared. A program that reads every matching filename can include the second file simply because it exists. That does not establish that the producer has published it as part of this table.\n\nWe need an agreed state that says which files a reader should use. In our model, a manifest is a record containing a version number and its complete active file list. Version 0 names batch-0.parquet. A later version may also name batch-1.parquet. The reader asks for a version before opening any of its files.\n\nThe manifest has names of files, not copies of their rows. An empty file list is a valid empty table in this exercise. A missing version is a failed read, not permission to substitute whichever files happen to be available.',
      'version 0: ["readings/batch-0.parquet"]\nversion 1: ["readings/batch-0.parquet", "readings/batch-1.parquet"]',
      'The same stored objects can support more than one table version. The reader must know which version it was asked to use.'),
    p('How Delta keeps track of table changes',
      'Delta records committed table changes in a transaction log. A transaction groups changes into one update. Atomic publication means that a reader sees the completed update or the earlier state, rather than half of the update. From the recorded state, a compatible reader identifies the data files active in the requested version.\n\nIn a file-based Delta table, the _delta_log directory holds transaction information and checkpoints used to reconstruct that state. It is not a second copy of every measurement. A correction can replace an old data file with a new one in a later version. Both files may remain in storage for a time, while each version selects its own active files. Reading all Parquet files directly would bypass that choice and can include superseded or uncommitted data.\n\nOur manifests are already reconstructed file lists, not literal Delta log entries. Real Delta readers also handle table metadata, supported protocol features and concurrency rules. We do not reproduce those responsibilities by reading a list of filenames.',
      'version 0 active files: ["readings/batch-0.parquet"]\nversion 2 active files: ["readings/corrected-0.parquet", "readings/batch-1.parquet"]',
      'A recorded remove means a file stops contributing to that table state. It does not necessarily mean its physical bytes are deleted at that moment.'),
    p('Schema tells us the structure, while a contract explains the meaning',
      'A schema describes fields and their data types. For example, pump is text and temperature_c is numerical. A table can use that information to reject incompatible writes.\n\nThe maintenance team still has to explain which pump an identifier belongs to, whether a reading is Celsius and how a missing reading is represented. Those meanings need a data contract and checks appropriate to the source. A number does not become a good training value merely because it fits a numerical column.\n\nConverting the files to Delta does not decide those policies. The later cleaning and quality lessons will make explicit choices about invalid values. Here, we keep the supplied records intact so that file selection is the only operation being tested.',
      null,
      'A table with a consistent schema can still contain the wrong observations. Inspect structure and meaning separately.'),
    withReference(p('Read a table version through its table interface',
      'A registered table name lets a program ask for the dataset without manually listing its data files. Databricks connects that name to table metadata and storage. We will unpack catalog.schema.table in the upcoming table-names lesson.\n\nThe optional reference requests a retained Delta version by name. The format reader is responsible for interpreting the table state. A bounded display is enough to inspect the example; collecting a complete production dataset into one notebook would be a different operation.',
      null,
      'Use the table interface for the table read. Do not treat a directory scan as a replacement for a Delta reader.'),
    reference('Read an existing retained Delta version',
      'snapshot = (spark.read\n    .option("versionAsOf", 0)\n    .table("operations.maintenance.readings"))\nsnapshot.select("pump", "temperature_c").limit(20).show()',
      [
        'Use your own Databricks notebook with supported Spark compute and access to an existing Delta table operations.maintenance.readings.',
        'The table must have pump and temperature_c columns and a retained readable version 0. Replace the example name and version with an approved dataset. The code performs a read and can incur compute charges.',
      ],
      'The request names a table and a retained version. The reader resolves that table state instead of opening every file with a matching prefix.', urls.reads)),
    p('Retaining a version also requires retaining its files',
      'A version identifier is useful only while the information needed to read it is available. Retention policies and maintenance can remove old data files or old log history. Keep the required files and transaction information for as long as reproducibility requires. A saved version number is not an indefinite backup.\n\nBotie’s floor makes that dependency visible. Select a committed file list, then use it to read exactly those keys from the supplied storage records. The second case adds an uncommitted file. If your machine starts reading that file, the storage listing has replaced the publication rule.\n\nThis local activity does not access object storage, decode Parquet, commit transactions or establish guarantees about concurrent updates and failures. It checks whether your construction respects an explicitly supplied file-selection boundary. Manifest order makes the local output repeatable; a real table query needs explicit sorting when row order matters.',
      null,
      'Predict which pump identifiers will appear before running the changed case. Then inspect the chosen keys before changing any record-processing code.'),
  ],
  questions: [
    q('The maintenance team stores a CSV of readings and photographs of damaged pumps in shared object storage.',
      'Which description fits a data lake?',
      ['A storage arrangement that can retain these datasets for different processing tools', 'A guarantee that every stored reading is correct', 'A requirement that every file already be a relational table'], 0,
      'The lake describes how datasets are retained and made available. Their format, quality rules and processing still need to be specified.'),
    q('A decoded record is {"pump":"P7","temperature_c":12}. The stored object key is readings/batch-0.parquet.',
      'Which item identifies the stored file?',
      ['readings/batch-0.parquet', 'The value 12 by itself', 'Every row with pump P7 across all files'], 0,
      'The key identifies the object within its storage container. P7 identifies a pump inside the file’s records.'),
    tf('A Parquet column named temperature_c accepts numerical values. A producer mistakenly sends a Fahrenheit value as 90.',
      'A numerical schema alone establishes that the unit is correct.', false,
      'A numerical type checks representation. The unit and the producer’s behavior need a contract and appropriate checks.'),
    q('Storage contains a.parquet and pending.parquet. The reconstructed manifest for version 0 names only a.parquet.',
      'Which files should the version-0 reader open?',
      ['Only a.parquet', 'Both files because they exist', 'Only pending.parquet because it arrived later'], 0,
      'The committed version defines the active files. A newly written object does not automatically belong to that version.'),
    tf('The transaction information identifying an old version is saved, but a required data file has been permanently removed.',
      'The transaction record by itself contains every missing measurement.', false,
      'The record identifies table state and files. The data needed for the read must also remain available.'),
    q('Version 0 selects old.parquet. Version 1 selects corrected.parquet instead. Both files still exist.',
      'Why can reading all Parquet files give an incorrect table?',
      ['It can mix superseded records with their replacements', 'Parquet cannot store numerical values', 'A later version always requires changing the pump identifiers'], 0,
      'Table-state selection determines which files contribute. The storage listing does not distinguish the old file from its replacement.'),
    tf('A local program chooses a supplied file list and concatenates the named Python records.',
      'Passing its tests proves that a real multi-writer Delta transaction is atomic.', false,
      'The local model checks file selection. It has no concurrent writers, storage protocol or transaction implementation.'),
    tf('A data lake retains source files. A table format supplies rules and metadata for treating selected files as a changing table.',
      'Those responsibilities can be used together in a lakehouse.', true,
      'A lakehouse combines lake storage with table-management and analytical capabilities. The components remain distinct.'),
  ],
  practice: [challenge('Read a committed version without including pending files',
    [
      'Write read_version(files, manifests, version). files is a list of dictionaries with key and rows; rows is a list of dictionaries. manifests is a list of dictionaries with version and files, where files contains object keys in the required output order. All file and manifest records have those fields. Return a deep copy of the rows from exactly the requested manifest’s files, in file-list order and then row order. Preserve repeated observations inside files.',
      'Require nonnegative integer version identities, with booleans rejected. Every retained version and stored object key must be unique. A manifest’s file list must contain distinct nonempty text keys; stored keys must also be nonempty text. Raise ValueError for a malformed list, duplicate identity, missing requested version or unavailable named file. Validate all supplied manifests and file records. A valid empty committed file list returns an empty result. Do not change the inputs or share nested row objects with the result.',
      'The supplied batch has one pending file. Print the requested committed rows and their count. The dictionaries represent decoded files and reconstructed version manifests; your function does not parse Parquet or Delta logs.',
    ],
    `def read_version(files, manifests, version):\n    pass\n\n${lakeFixture}`,
    lakeSolution,
    "[{'pump': 'P4', 'temperature_c': 22}, {'pump': 'P3', 'temperature_c': 16}]\n2",
    [
      'Index manifests by version and files by key after checking duplicates. The manifest determines the order; the storage listing does not.',
      'An empty manifest is different from a missing version. Copy only rows from its named files and use deepcopy so a later edit cannot change a stored record.',
    ],
    [
      ['Pending file is excluded', 'assert [row["pump"] for row in read_version(files, manifests, 3)] == ["P4", "P3"]'],
      ['Changed commit and retained duplicates', 'f=[{"key":"a","rows":[{"pump":"X"},{"pump":"X"}]},{"key":"b","rows":[{"pump":"Y"}]}]\nm=[{"version":0,"files":["a"]},{"version":1,"files":["b","a"]}]\nassert read_version(f,m,1) == [{"pump":"Y"},{"pump":"X"},{"pump":"X"}]'],
      ['Empty committed state', 'assert read_version(files,[{"version":7,"files":[]}],7) == []'],
      ['Missing file and version are errors', 'for f,m,v in [([], [{"version":0,"files":["missing"]}],0), (files,manifests,99)]:\n    try: read_version(f,m,v)\n    except ValueError: pass\n    else: raise AssertionError("An unavailable read must fail")'],
      ['Invalid manifests are refused', 'for m,v in [([{"version":0,"files":[]},{"version":0,"files":[]}],0),([{"version":0,"files":["x","x"]}],0),([{"version":True,"files":[]}],True),([{"version":-1,"files":[]}],0)]:\n    try: read_version([],m,v)\n    except ValueError: pass\n    else: raise AssertionError("Invalid manifest accepted")'],
      ['Conflicting stored identities are refused', 'try: read_version([{"key":"a","rows":[]},{"key":"a","rows":[]}],[{"version":0,"files":["a"]}],0)\nexcept ValueError: pass\nelse: raise AssertionError("Duplicate object key accepted")'],
      ['Inputs and nested records remain independent', 'from copy import deepcopy\nf=[{"key":"a","rows":[{"pump":"X","details":{"site":"north"}}]}]\nm=[{"version":0,"files":["a"]}]\nbefore=deepcopy((f,m))\nr=read_version(f,m,0)\nr[0]["details"]["site"]="changed"\nassert (f,m) == before'],
    ], { question: 'Which pump readings belong to version 3 when another file is still pending?' })],
  build: build(
    'Read the files belonging to this table version',
    'Botie can read the first batch. A second file now exists, but the producer has not committed it to the requested table version.',
    'Choose the requested version’s reconstructed manifest, then read only the listed object keys from storage. Return their complete records in manifest order. A file that merely exists must not be added to the result.',
    { manifests: 'Retained committed file lists', version: 'Requested version number', files: 'Stored files with decoded records' },
    [
      sample('Only the first batch exists', { manifests: [firstManifest], version: 0, files: [firstFile] }, firstFile.rows),
      sample('A pending file now exists too', { manifests: [firstManifest], version: 0, files: [firstFile, pendingFile] }, firstFile.rows),
      sample('The second file is committed in a new version', { manifests: [firstManifest, { version: 1, files: [firstFile.key, pendingFile.key] }], version: 1, files: [firstFile, pendingFile] }, [...firstFile.rows, ...pendingFile.rows]),
      sample('A correction replaces a file without erasing old bytes', { manifests: [firstManifest, { version: 2, files: [correctedFile.key, pendingFile.key] }], version: 2, files: [firstFile, pendingFile, correctedFile] }, [...correctedFile.rows, ...pendingFile.rows]),
      sample('An intentionally empty committed table', { manifests: [{ version: 4, files: [] }], version: 4, files: [firstFile] }, []),
    ],
    op('dbxReadNamedFiles', op('dbxCommittedFileKeys', s('manifests'), s('version')), s('files')),
    'The active file list is chosen before the records are read. Adding an unrelated stored file cannot change an earlier committed result.',
    'This local model receives decoded Python-like records and already reconstructed manifests. It does not access storage, replay a Delta transaction log or implement the real table format’s transaction and failure guarantees.',
  ),
  journey: journey(
    'The first file gave the expected readings. A second file has appeared before it was included in the published table.',
    'Put publication state before file reading',
    'First choose the requested version’s active file keys. Use those keys to read the supplied stored records, keeping every field of each selected observation.',
    'A pending or superseded file stays outside the requested table even while its bytes remain in storage.',
    diagnose('The pending reading appeared in version 0',
      'Version 0 lists only batch-0.parquet, containing P7 and P2. A new batch-1.parquet contains P9 but is not listed. The output unexpectedly includes P9. What should we inspect first?',
      ['Whether the read uses the manifest’s keys or all stored files', 'The added P9 record belongs to an existing file, but not to the requested committed version.'],
      ['Whether P9 should be renamed to P7', 'Changing a record identifier would hide the wrong-file read rather than repair it.'],
      'Predict the selected file list before opening its records.'),
    [connection('what-is-databricks', 'Separate stored data from the service that works with it', 'A platform can find and process data, but each table read still needs a defined input state.')],
    'If version 0 remains named but its only data file is removed, what should the read do?',
    'Keep the version identity, its active file list and the data needed to read it.',
    { path: [0], title: 'Choose the committed file keys', challenge: 'Return the object keys belonging to the requested version without reading any rows.', why: 'Inspecting the keys separates a publication mistake from a later record-processing mistake.' },
    ['Select a committed file list needs both the retained manifests and the requested version.', 'Connect that key list to Read only the named files. Its other input is the complete supplied storage listing.'],
  ),
  fresh: fresh('A new committed file order and another pending object',
    'Version 5 names evening.parquet before morning.parquet. A pending file is also stored. Return only version 5’s rows in its declared file order.',
    { manifests: [{ version: 5, files: ['evening.parquet', 'morning.parquet'] }], version: 5, files: [{ key: 'morning.parquet', rows: [{ pump: 'P1', temperature_c: 11 }] }, { key: 'pending.parquet', rows: [{ pump: 'P9', temperature_c: 99 }] }, { key: 'evening.parquet', rows: [{ pump: 'P2', temperature_c: 17 }] }] },
    [{ pump: 'P2', temperature_c: 17 }, { pump: 'P1', temperature_c: 11 }],
    'Changing the keys and their order checks that the manifest drives the read rather than a stored answer or a directory listing.'),
});
databricksDataLakes.technicalStart = databricksDataLakes.parts[6].title;

const maintenanceTable = { name: 'operations.maintenance.readings', readers: ['botie'], rows: [{ pump: 'P7', temperature_c: 12 }] };
const commissioningTable = { name: 'operations.commissioning.readings', readers: ['botie'], rows: [{ pump: 'TEST_P7', temperature_c: 80 }] };
const registry = [maintenanceTable, commissioningTable];
const tableFixture = String.raw`registry = [
    {"name": "operations.maintenance.readings", "readers": ["botie"], "rows": [{"pump": "P3", "temperature_c": 16}]},
    {"name": "operations.commissioning.readings", "readers": ["botie"], "rows": [{"pump": "TEST_P3", "temperature_c": 60}]},
]
short = read_table(registry, ["readings"], "operations", "commissioning", "botie")
explicit = read_table(registry, ["operations", "maintenance", "readings"], "operations", "commissioning", "botie")
print(short["name"])
print(explicit)`;
const tableSolution = String.raw`from copy import deepcopy
import re

def read_table(registry, parts, current_catalog, current_schema, principal):
    def simple(value):
        if not isinstance(value, str) or re.fullmatch(r"[a-z_][a-z0-9_]*", value) is None:
            raise ValueError("Use simple lowercase name parts")
        return value
    if not isinstance(parts, list) or not 1 <= len(parts) <= 3:
        raise ValueError("Supply one to three name parts")
    resolved = [simple(part) for part in parts]
    if len(resolved) == 1:
        resolved = [simple(current_catalog), simple(current_schema)] + resolved
    elif len(resolved) == 2:
        resolved = [simple(current_catalog)] + resolved
    name = ".".join(resolved)
    if not isinstance(principal, str) or not principal:
        raise ValueError("Supply a principal identity")
    tables = {}
    for entry in registry:
        registered, readers, rows = entry["name"], entry["readers"], entry["rows"]
        if not isinstance(registered, str) or len(registered.split(".")) != 3:
            raise ValueError("Registered names have three parts")
        for part in registered.split("."):
            simple(part)
        if registered in tables:
            raise ValueError("Duplicate registered name")
        if not isinstance(readers, list) or any(not isinstance(item, str) or not item for item in readers):
            raise ValueError("Reader identities must be nonempty text")
        if len(set(readers)) != len(readers):
            raise ValueError("Repeated reader identity")
        if not isinstance(rows, list) or any(not isinstance(row, dict) for row in rows):
            raise ValueError("Rows must be dictionaries")
        tables[registered] = entry
    if name not in tables:
        raise KeyError(name)
    entry = tables[name]
    if principal not in entry["readers"]:
        raise PermissionError(name)
    return {"name": name, "rows": deepcopy(entry["rows"])}

${tableFixture}`;

export const databricksTableNames = intro({
  id: 'databricks-table-names',
  title: 'Tables and Unity Catalog',
  blurb: 'A table name identifies a dataset without exposing its storage path. Catalogs and schemas organize those names, while Unity Catalog records table metadata and controls supported access to the data.',
  openingTitle: 'Which Table Does This Name Identify?',
  opening: [
    'Both the maintenance team and the commissioning team have a table called readings. One contains measurements from running pumps. The other contains test equipment. Asking for readings is understandable only if we also know where the program is looking.',
    'Databricks uses catalogs and schemas to organize registered tables. A full name can identify the department’s table directly. Before writing a query, we need to understand those names and the difference between finding a table and being allowed to read it.',
  ],
  prerequisites: [before('Workspaces and compute', 'databricks-workspaces-compute'), before('Data lakes and lakehouses', 'databricks-data-lakes')],
  outputLabel: 'Resolved table identity and copied records',
  checkpointTitle: 'What identifies the table?',
  history: history(
    'Why Teams Needed a Shared Record of Their Tables',
    [
      source('Unity Catalog public preview announcement, April 2022', urls.unityHistory),
      source('Databricks database objects', urls.objectsInCatalog),
      source('Databricks catalogs', urls.catalogs),
      source('Databricks schemas', urls.schemas),
      source('Databricks table identifier resolution', urls.names),
      source('Unity Catalog privilege management', urls.grants),
      source('Unity Catalog managed tables', urls.managed),
      source('Unity Catalog external tables', urls.external),
    ],
    'A program can read a file by its storage path, but that path tells a colleague little about the dataset. When several teams keep their own table lists and access rules, the same name can refer to different records and permissions become difficult to inspect together. A shared catalog records the objects people are trying to use and the rules governing access to them.',
    'Databricks announced Unity Catalog at its 2021 Data and AI Summit. Its April 2022 public-preview announcement described the problem of managing access across different data assets and workspaces. Centralized metadata and access management were practical needs created by shared data work. A table name became part of an organized, governed namespace rather than an informal label inside one notebook.',
    'Unity Catalog now organizes tables under catalogs and schemas and manages their metadata and supported access. We will begin with that naming structure. The later permissions lesson works through the required privileges in more detail; recognizing a table and authorizing a request are separate steps.',
  ),
  diagram: table(
    'The same short name can belong to different teams',
    'The final component is readings in both examples. The schema tells us which team’s records are meant.',
    ['Catalog', 'Schema', 'Table', 'Example pump'],
    [['operations', 'maintenance', 'readings', 'P7'], ['operations', 'commissioning', 'readings', 'TEST_P7']],
    'operations.maintenance.readings is one full table name. The dots separate name components, not record values.',
  ),
  parts: [
    p('A registered table gives the dataset a name',
      'A table presents data as rows and named columns. Registering it gives another program a name to request, together with metadata about the table. Metadata is information about the dataset, such as its columns, format and how the system can locate it. It is distinct from the measurements stored in its rows.\n\nA table can contain many data files. A registered table name is therefore not normally the filename of one Parquet object. The catalog entry and the table format help the reader find the appropriate data.',
      null,
      'Keep the table identity beside its rows in the workshop output. That makes a wrong-table read visible even when both tables have the same column names.'),
    p('Catalog, schema and table organize the name',
      'A catalog is a top-level container for related data objects. Inside it, schemas group objects more specifically. A schema can contain tables and other objects. In this naming context, schema means that container; a table’s column schema means its field structure. The word has two related uses.\n\nOur catalog is operations. Within it, maintenance and commissioning are schemas. Each has its own readings table. The three-part name operations.maintenance.readings identifies the maintenance table without requiring someone to guess which group was intended.\n\nThese components organize registered objects. They are not a promise that cloud storage contains matching folders named operations/maintenance/readings.',
      'catalog: operations\nschema:  maintenance\ntable:   readings\n\nfull name: operations.maintenance.readings',
      'Use a name component for the level it describes. The catalog contains the schema; the schema contains the table.'),
    p('Short names depend on the current catalog and schema',
      'A session has a current catalog and a current schema. A session is the context of the current interaction with the compute service. When a query supplies only readings, those defaults fill in the missing parts.\n\nSupplying maintenance.readings uses the current catalog and the named schema. Supplying operations.maintenance.readings gives every component. That fully qualified reference keeps identifying the maintenance table if the current schema changes. It does not change the session defaults itself.\n\nSQL also has rules for temporary views, quoted identifiers and other kinds of name resolution. We keep this workshop narrower: it receives one to three simple lowercase name parts referring only to registered tables. It is not a parser for arbitrary SQL.',
      'current catalog: operations\ncurrent schema: commissioning\n\nreadings                         -> operations.commissioning.readings\nmaintenance.readings             -> operations.maintenance.readings\noperations.maintenance.readings  -> operations.maintenance.readings',
      'Before assuming a calculation is wrong, inspect which full table name the short reference actually selected.',
      [example('Resolve one name from explicit defaults',
        'A Python list keeps the supplied name parts separate. Here the one-part reference needs both defaults.',
        'parts = ["readings"]\ncurrent_catalog = "operations"\ncurrent_schema = "commissioning"\nfull_parts = [current_catalog, current_schema] + parts\nprint(".".join(full_parts))',
        'operations.commissioning.readings',
        'The fuller challenge must also handle two- and three-part references without adding defaults that were already supplied.')]),
    p('What Unity Catalog keeps track of',
      'Unity Catalog is Databricks’ system for organizing and governing supported data and AI assets. For these lessons, its relevant job is to record table identities and metadata and apply access rules to supported requests. Catalog Explorer is an interface for browsing those registered objects.\n\nA workspace notebook is where we write and run code. A registered table is a governed data object that code may request. Putting a notebook in a workspace folder does not move its tables into a schema with that folder’s name.\n\nFinding a visible table and obtaining permission to read its data are different operations. A useful interface should make the resolved identity inspectable before we investigate access or the query’s arithmetic.',
      null,
      "The local registry is a list of dictionaries describing tables. It exposes name lookup for inspection. Unity Catalog is the deployed service responsible for registered metadata and its supported governance functions."),
    p('Reading data requires permission and configured access',
      "A principal is the identity making a request, such as a user or a service identity. For an ordinary table read, Unity Catalog privileges include SELECT on the table and the necessary USE CATALOG and USE SCHEMA privileges on its containers. Ownership, inherited privileges and other supported rules affect how real access is established.\n\nThe compute and storage connection must also be configured appropriately. Granting a principal SELECT does not create a missing cloud storage credential or remove every workspace restriction. Conversely, a person with independent access to raw external files may bypass the catalog path, so cloud storage permissions need their own care.\n\nOur exercise assumes the namespace, compute and cloud connection are already valid. Each registry entry supplies an effective reader list for this local decision. The supplied principal is assumed to be verified; typing a different name in this model is not authentication.",
      null,
      'The final component refuses a local read when the principal is absent from that table’s reader list. The later governance lesson examines more of the real permission hierarchy.'),
    p('Managed and external tables have different storage responsibilities',
      'For a Unity Catalog managed table, Databricks manages the table’s data lifecycle and storage arrangement. A team generally works with the registered name rather than modifying its underlying files directly. Dropping a managed table can ultimately remove its data after the applicable recovery period.\n\nAn external table also has registered metadata, but its data files live at an explicitly configured external location. Removing that table registration does not delete the underlying files. The team responsible for the storage still has to manage them. That does not make an external table ungoverned: Unity Catalog governs supported access through the table, while direct access outside that path depends on the cloud controls.\n\nBoth types can use the same three-part naming structure. A name tells us which registered object was requested; its metadata tells us more about the object’s storage and lifecycle.',
      null,
      'Do not test lifecycle behavior by dropping a real table. Read the object’s metadata and the current platform documentation before making storage changes.'),
    withReference(p('Inspect the context before reading a named table',
      'The optional SQL asks which catalog and schema the session is using, then reads a fully qualified table. The explicit reference avoids relying on those defaults for this read. LIMIT bounds the displayed result; it does not establish the table’s complete contents or a guaranteed row order.\n\nThe browser challenge performs the naming steps with Python lists and dictionaries. Unknown names fail instead of falling back to a table from another schema.',
      null,
      'If an expected table is missing, inspect its full identity and permissions. Do not search other departments until a convenient short-name match appears.'),
    reference('Inspect the session and read one explicit table',
      'SELECT current_catalog(), current_schema();\n\nSELECT pump, temperature_c\nFROM operations.maintenance.readings\nLIMIT 20;',
      [
        'Use the SQL editor or a SQL notebook cell on your own supported Databricks compute, with Unity Catalog enabled.',
        'An approved table operations.maintenance.readings must already exist with pump and temperature_c columns. The principal needs the required table and namespace privileges, and the environment must have configured access to its storage.',
        'The statements only read context and table data. They do not create a table, change grants or modify the current schema. Compute can incur charges.',
      ],
      'The table read names all three components. Changing a default schema does not redirect that explicit reference.', urls.names, 'sql')),
    p('Keep resolution, lookup and authorization visible',
      'Botie’s construction has three decisions to inspect. First resolve missing name parts from the supplied current catalog and schema. Next find that exact full name in the registry. Finally check the named principal against the chosen table’s effective reader list before returning its rows.\n\nThe changed case moves the current schema from maintenance to commissioning while retaining the short reference readings. The resolved identity should change. A later case supplies all three maintenance components, so its identity should stay explicit despite the changed default.\n\nThe model uses exact, simple lowercase names. Real SQL has a broader identifier grammar and resolution rules. It also performs authentication and permission checks this local lookup does not implement. Keep those limits in mind while testing the naming behavior.',
      null,
      'Predict the resolved full name before looking at the row values. Two tables can share a column structure and still answer different questions.'),
  ],
  questions: [
    q('The full name is operations.maintenance.readings.',
      'Which component is the schema?', ['maintenance', 'operations', 'readings'], 0,
      'The schema is the middle container, inside the catalog and containing the table.'),
    tf('A registered table refers to several data files. The table is named operations.maintenance.readings.',
      'That name must be the object key of one physical Parquet file.', false,
      'It identifies a registered table. The table’s metadata and format describe how the data files form its contents.'),
    q('Current catalog: operations. Current schema: commissioning. The supplied registered-table reference is readings.',
      'Which full name does this reference select in the lesson’s naming model?',
      ['operations.commissioning.readings', 'operations.maintenance.readings', 'commissioning.operations.readings'], 0,
      'A one-part reference fills in both the current catalog and current schema.'),
    q('Current catalog: operations. Current schema: commissioning. The reference is maintenance.readings.',
      'Which default is used?',
      ['Only the current catalog', 'Only the current schema', 'Neither; the reference has three parts'], 0,
      'The two supplied parts are schema and table. The current catalog supplies the remaining component.'),
    tf('A query explicitly names operations.maintenance.readings. The current schema later changes to commissioning.',
      'That fully qualified name now identifies operations.commissioning.readings.', false,
      'All components were supplied explicitly. The current schema does not replace a component of a fully qualified reference.'),
    q('A table exists in the registry, but the request’s principal is absent from its local effective reader list.',
      'What should the exercise return?',
      ['A permission error rather than the table rows', 'Rows from a different table with the same short name', 'The requested table after silently changing the principal'], 0,
      'Finding an object does not authorize its read. The model checks the supplied verified identity against that chosen table.'),
    tf('A Unity Catalog external table is dropped. Its underlying cloud files still exist.',
      'That can be expected because dropping the registration does not delete those files.', true,
      'The external storage lifecycle remains separately managed. Supported access through a registered external table can still be governed.'),
    tf('A real environment grants SELECT on a table, but its required namespace access or storage configuration is missing.',
      'The SELECT grant alone establishes that every request can read it successfully.', false,
      'Namespace privileges and a correctly configured execution and storage path are additional requirements. The local reader list assumes those prerequisites.'),
  ],
  practice: [challenge('Resolve the requested table before reading its rows',
    [
      'Write read_table(registry, parts, current_catalog, current_schema, principal). parts is a list of one, two or three simple lowercase name components matching [a-z_][a-z0-9_]*. One component means table; two mean schema and table; three mean catalog, schema and table. Fill only missing components from the declared defaults. The registry is a list of dictionaries with name, readers and rows. name is a three-part full name, readers is a list of distinct nonempty identity strings, and rows is a list of dictionaries. All registry records contain those fields.',
      'Validate the supplied parts and any default actually used. Validate every registry entry and reject repeated full table names or malformed entries with ValueError. A nonempty principal string is required. If the exact resolved name is absent, raise KeyError; do not search another namespace. If principal is not in that table’s readers, raise PermissionError. Return {"name": full_name, "rows": copied_rows}, with a deep copy of nested row data and no changes to any input. An empty table is valid.',
      'Print the name selected by the supplied short reference, then the complete result for the explicit maintenance reference. The current schema is commissioning in both calls. The effective reader lists assume other platform and cloud prerequisites; this is not a replacement for real Unity Catalog authorization.',
    ],
    `def read_table(registry, parts, current_catalog, current_schema, principal):\n    pass\n\n${tableFixture}`,
    tableSolution,
    "operations.commissioning.readings\n{'name': 'operations.maintenance.readings', 'rows': [{'pump': 'P3', 'temperature_c': 16}]}",
    [
      'Inspect how many name parts were supplied before filling in defaults. The three-part case already contains its catalog and schema.',
      'Look up only the resolved full name, then check that entry’s readers. Copy the selected rows so a caller cannot edit the registry through the returned result.',
    ],
    [
      ['A changed schema redirects a short name', 'a=read_table(registry,["readings"],"operations","maintenance","botie")\nb=read_table(registry,["readings"],"operations","commissioning","botie")\nassert a["name"] == "operations.maintenance.readings"\nassert b["name"] == "operations.commissioning.readings"\nassert a["rows"] != b["rows"]'],
      ['An explicit reference survives changed defaults', 'a=read_table(registry,["operations","maintenance","readings"],"elsewhere","other","botie")\nassert a["name"] == "operations.maintenance.readings"\nassert a["rows"][0]["pump"] == "P3"'],
      ['Two parts use the current catalog only', 'assert read_table(registry,["maintenance","readings"],"operations","commissioning","botie")["name"] == "operations.maintenance.readings"'],
      ['Unknown namespace is not a fallback request', 'try: read_table(registry,["unknown","readings"],"operations","maintenance","botie")\nexcept KeyError: pass\nelse: raise AssertionError("Unknown namespace must not use another table")'],
      ['The named principal must be allowed', 'try: read_table(registry,["readings"],"operations","maintenance","visitor")\nexcept PermissionError: pass\nelse: raise AssertionError("Unauthorized read accepted")'],
      ['Invalid and duplicate identities are refused', 'for data,parts in [(registry,[]),(registry,["maintenance.readings"]),(registry+[registry[0]],["readings"])]:\n    try: read_table(data,parts,"operations","maintenance","botie")\n    except ValueError: pass\n    else: raise AssertionError("Invalid naming input accepted")'],
      ['Empty tables and independent nested records', 'from copy import deepcopy\nr=[{"name":"ops.team.empty","readers":["botie"],"rows":[]},{"name":"ops.team.full","readers":["botie"],"rows":[{"details":{"site":"north"}}]}]\nbefore=deepcopy(r)\nassert read_table(r,["empty"],"ops","team","botie") == {"name":"ops.team.empty","rows":[]}\nanswer=read_table(r,["full"],"ops","team","botie")\nanswer["rows"][0]["details"]["site"]="changed"\nassert r == before'],
    ], { question: 'Which readings table will Botie receive after the current schema changes?' })],
  build: build(
    'Find the intended registered table',
    'Two departments use readings as a table name. Botie needs to see which full table the supplied reference actually requests before using its records.',
    'Resolve the supplied one-, two- or three-part name using only the missing session defaults. Find that exact table in the registry, check its effective reader list for the supplied principal, and return its full name beside copied rows. A changed current schema must affect a short name, while a fully qualified reference stays explicit.',
    { parts: 'Requested table-name parts', currentCatalog: 'Current catalog', currentSchema: 'Current schema', registry: 'Registered tables and effective readers', principal: 'Verified principal identity' },
    [
      sample('The short name begins in maintenance', { parts: ['readings'], currentCatalog: 'operations', currentSchema: 'maintenance', registry, principal: 'botie' }, { name: maintenanceTable.name, rows: maintenanceTable.rows }),
      sample('The current schema changes to commissioning', { parts: ['readings'], currentCatalog: 'operations', currentSchema: 'commissioning', registry, principal: 'botie' }, { name: commissioningTable.name, rows: commissioningTable.rows }),
      sample('The maintenance name is fully qualified', { parts: ['operations', 'maintenance', 'readings'], currentCatalog: 'operations', currentSchema: 'commissioning', registry, principal: 'botie' }, { name: maintenanceTable.name, rows: maintenanceTable.rows }),
      sample('Two name parts override only the schema', { parts: ['maintenance', 'readings'], currentCatalog: 'operations', currentSchema: 'commissioning', registry, principal: 'botie' }, { name: maintenanceTable.name, rows: maintenanceTable.rows }),
      sample('A registered table can be empty', { parts: ['empty'], currentCatalog: 'operations', currentSchema: 'maintenance', registry: [{ name: 'operations.maintenance.empty', readers: ['botie'], rows: [] }], principal: 'botie' }, { name: 'operations.maintenance.empty', rows: [] }),
    ],
    op('dbxReadRegisteredTable', op('dbxFindTable', s('registry'), op('dbxResolveTableName', s('parts'), s('currentCatalog'), s('currentSchema'))), s('principal')),
    'The resolved full identity remains visible. Identical short names cannot silently stand in for each other across departments.',
    'This local model uses simple lowercase registered names and explicit effective reader lists. It does not parse SQL, authenticate identities or implement Unity Catalog inheritance, ownership, namespace privileges, workspace restrictions or cloud storage permissions.',
  ),
  journey: journey(
    'The maintenance lookup worked in its original session. A changed current schema now sends the same short name to commissioning’s test readings.',
    'Make the selected table identity visible',
    'Resolve missing name components, find the exact registered table and carry its name into the permitted read. Inspect that name before interpreting its measurements.',
    'The result reports the table selected by the actual reference and session context, with no fallback to a different namespace.',
    diagnose('The same short reference returns test equipment',
      'The reference is readings. The current catalog is operations, but the schema changed from maintenance to commissioning. TEST_P7 now appears. Which explanation fits?',
      ['The one-part name used the new current schema', 'The naming context changed. An explicit operations.maintenance.readings reference would still identify maintenance.'],
      ['Parquet changed P7’s identifier during compression', 'The selected table is different; this is not a file-encoding transformation.'],
      'Predict the complete table name for each supplied reference before running it.'),
    [
      connection('databricks-workspaces-compute', 'Inspect the context in which code runs', 'A query’s current catalog and schema belong to its execution context, not its notebook folder name.'),
      connection('databricks-data-lakes', 'Separate a dataset’s identity from its data files', 'A registered name is an interface to a table, not a single physical object key.'),
    ],
    'Why can a fully qualified table name prevent a naming mistake without guaranteeing permission to read the table?',
    'Keep the requested identity, the session defaults and the actual requesting principal explicit.',
    { path: [0, 1], title: 'Resolve the full name first', challenge: 'Return catalog.schema.table for the supplied parts and current defaults, without reading any records.', why: 'A visible name lets you diagnose a namespace change before inspecting the table contents.' },
    ['Resolve a table name receives a list of name parts and both defaults. It fills only missing components.', 'Find the registered table needs the resolved name and the registry. Read as the named principal then checks that chosen entry before exposing its rows.'],
  ),
  fresh: fresh('A different catalog has the same schema and table names',
    'The current catalog is research. Resolve maintenance.readings there rather than borrowing operations’ table. Keep the resolved identity beside its empty rows.',
    { parts: ['maintenance', 'readings'], currentCatalog: 'research', currentSchema: 'other', principal: 'botie', registry: [{ name: 'operations.maintenance.readings', readers: ['botie'], rows: [{ pump: 'P7', temperature_c: 12 }] }, { name: 'research.maintenance.readings', readers: ['botie'], rows: [] }] },
    { name: 'research.maintenance.readings', rows: [] },
    'Changing the catalog checks whether the resolver treats a two-part request correctly without copying an earlier full name.'),
});
databricksTableNames.technicalStart = databricksTableNames.parts[6].title;
