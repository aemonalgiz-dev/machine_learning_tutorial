import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { test, after } from 'node:test';
import { loadPyodide } from 'pyodide';

const python = await loadPyodide();
python.runPython(await readFile(new URL('../public/python/sql_runner.py', import.meta.url), 'utf8'));
const execute = python.globals.get('run_course_sql');
const describe = python.globals.get('describe_sql_tables');
const setup = 'CREATE TABLE readings(id INTEGER PRIMARY KEY, value REAL); INSERT INTO readings VALUES (1, 12), (2, NULL);';
const run = (sql, initial = setup, expected = null, checks = []) => JSON.parse(execute(sql, initial, expected, JSON.stringify(checks)));
after(() => { execute.destroy(); describe.destroy(); });

test('SQL results preserve column names, missing values and quoted semicolons', () => {
  const result = run("SELECT id, value, 'pump; west' AS location FROM readings ORDER BY id; -- final comment");
  assert.equal(result.error, null);
  assert.deepEqual(result.table, { columns: ['id', 'value', 'location'], rows: [[1, 12, 'pump; west'], [2, null, 'pump; west']] });
  assert.deepEqual(JSON.parse(describe(setup))[0].rows, [[1, 12], [2, null]]);
});

test('learner transactions remain intact and each run starts with a fresh database', () => {
  const sql = 'BEGIN; UPDATE readings SET value = 99 WHERE id = 1; ROLLBACK; SELECT value FROM readings WHERE id = 1;';
  assert.deepEqual(run(sql).table.rows, [[12]]);
  assert.deepEqual(run('DELETE FROM readings; SELECT COUNT(*) FROM readings;').table.rows, [[0]]);
  assert.deepEqual(run('SELECT COUNT(*) FROM readings;').table.rows, [[2]]);
});

test('64-bit identifiers display exactly while native SQL checks keep integer semantics', () => {
  const result = run('SELECT 9007199254740993 AS asset_id;', '', '[[9007199254740993]]', [
    { name: 'the database keeps the integer', code: 'assert rows == [(9007199254740993,)]' },
  ]);
  assert.equal(result.error, null);
  assert.deepEqual(result.table.rows, [['9007199254740993']]);
  assert.ok(result.tests.every(check => check.status === 'passed'));
  const tables = JSON.parse(describe('CREATE TABLE assets(id INTEGER); INSERT INTO assets VALUES (9007199254740993);'));
  assert.deepEqual(tables[0].rows, [['9007199254740993']]);
  assert.match(run('SELECT 1e999;').error, /infinite number/);
});

test('compound trigger statements are not split at their internal semicolons', () => {
  const sql = `CREATE TABLE audit(message TEXT);
    CREATE TRIGGER changed AFTER UPDATE ON readings BEGIN
      INSERT INTO audit VALUES ('first; message');
      INSERT INTO audit VALUES ('second');
    END;
    UPDATE readings SET value = 4 WHERE id = 1;
    SELECT message FROM audit ORDER BY rowid;`;
  const result = run(sql);
  assert.equal(result.error, null);
  assert.deepEqual(result.table.rows, [['first; message'], ['second']]);
});

test('behaviour checks use independent databases and reject a memorised answer', () => {
  const checks = [
    { name: 'test may change its own database', code: "db.execute('DELETE FROM readings')" },
    { name: 'next test still sees the original rows', code: "assert db.execute('SELECT COUNT(*) FROM readings').fetchone() == (2,)" },
    { name: 'new readings change the total', code: "assert query_rows(sql, setup_sql + 'INSERT INTO readings VALUES (3, 8);') == [(20.0,)]" },
  ];
  assert.ok(run('SELECT SUM(value) FROM readings;', setup, '[[12.0]]', checks).tests.every(check => check.status === 'passed'));
  const memorised = run('SELECT 12.0;', setup, '[[12.0]]', checks);
  assert.equal(memorised.tests[1].status, 'passed');
  assert.equal(memorised.tests.at(-1).status, 'failed');
});

test('syntax errors are visible and downstream checks are skipped', () => {
  const result = run('SELECT absent FROM readings;', setup, '[[12]]', [{ name: 'later check', code: 'assert False' }]);
  assert.match(result.error, /no such column/);
  assert.deepEqual(result.tests.map(check => check.status), ['failed', 'skipped', 'skipped']);
  assert.equal(result.table, null);
});

test('foreign keys are enforced and external database attachment is rejected', () => {
  const foreign = 'CREATE TABLE assets(id INTEGER PRIMARY KEY); CREATE TABLE visits(asset_id INTEGER REFERENCES assets(id));';
  assert.match(run('INSERT INTO visits VALUES (99);', foreign).error, /FOREIGN KEY/);
  assert.match(run("ATTACH DATABASE ':memory:' AS second;").error, /authorized/);
});

test('large results and unbounded recursive queries end with useful errors', () => {
  assert.match(run('WITH RECURSIVE n(x) AS (VALUES(1) UNION ALL SELECT x+1 FROM n WHERE x<1001) SELECT x FROM n;').error, /1,000 rows/);
  assert.match(run('WITH RECURSIVE n(x) AS (VALUES(1) UNION ALL SELECT x+1 FROM n) SELECT SUM(x) FROM n;').error, /interrupted/);
});
