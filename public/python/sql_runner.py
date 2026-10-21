"""Run a lesson's SQLite statements in a fresh, in-memory database."""

import json
import math
import sqlite3
import time


def _sql_connection(setup_sql):
    db = sqlite3.connect(":memory:", isolation_level=None)
    db.execute("PRAGMA foreign_keys = ON")
    steps = 0

    def progress():
        nonlocal steps
        steps += 1
        return int(steps > 4000)

    def authorize(action, first, second, database, trigger):
        if action in (sqlite3.SQLITE_ATTACH, sqlite3.SQLITE_DETACH):
            return sqlite3.SQLITE_DENY
        if action == sqlite3.SQLITE_FUNCTION and second == "load_extension":
            return sqlite3.SQLITE_DENY
        if action == sqlite3.SQLITE_PRAGMA and first in ("writable_schema", "temp_store_directory", "data_store_directory"):
            return sqlite3.SQLITE_DENY
        return sqlite3.SQLITE_OK

    db.set_authorizer(authorize)
    db.set_progress_handler(progress, 1000)
    try:
        _sql_statements(db, setup_sql)
        return db
    except BaseException:
        db.close()
        raise


def _sql_statements(db, source):
    """Let SQLite recognise statement boundaries, including quoted semicolons."""
    if not isinstance(source, str) or len(source) > 100_000:
        raise ValueError("Keep the SQL below 100,000 characters.")
    pending, statements = "", []
    for char in source:
        pending += char
        if char == ";" and sqlite3.complete_statement(pending):
            statements.append(pending)
            pending = ""
    if pending.strip():
        statements.append(pending)
    if len(statements) > 256:
        raise ValueError("Keep this exercise to 256 statements or fewer.")
    rows, columns = [], []
    for statement in statements:
        cursor = db.execute(statement)
        if cursor.description is not None:
            rows = cursor.fetchmany(1001)
            if len(rows) > 1000:
                raise ValueError("The result exceeds 1,000 rows. Narrow the query or add an appropriate LIMIT.")
            columns = [column[0] for column in cursor.description]
    return rows, columns


def query_rows(sql, setup_sql):
    """Apply the same learner query to another fresh fixture."""
    db = _sql_connection(setup_sql)
    try:
        return _sql_statements(db, sql)[0]
    finally:
        db.close()


def _sql_json(value):
    return json.dumps(value, ensure_ascii=False, default=lambda item: item.hex() if isinstance(item, bytes) else str(item))


def _sql_table_rows(rows):
    """Preserve SQLite integers that JavaScript cannot represent exactly."""
    displayed = []
    for row in rows:
        cells = []
        for value in row:
            if isinstance(value, float) and not math.isfinite(value):
                raise ValueError("The result contains an infinite number. Check the magnitude of the inputs or calculation.")
            cells.append(str(value) if isinstance(value, int) and abs(value) > 9_007_199_254_740_991 else value)
        displayed.append(cells)
    return displayed


def describe_sql_tables(setup_sql):
    db = _sql_connection(setup_sql)
    try:
        tables = []
        for (name,) in db.execute("SELECT name FROM sqlite_schema WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name").fetchall():
            identifier = '"' + name.replace('"', '""') + '"'
            cursor = db.execute(f"SELECT * FROM {identifier} LIMIT 51")
            rows = cursor.fetchall()
            tables.append({"name": name, "columns": [column[0] for column in cursor.description], "rows": _sql_table_rows(rows[:50]), "truncated": len(rows) > 50})
        return _sql_json(tables)
    finally:
        db.close()


def run_course_sql(source, setup_sql="", expected_output=None, specifications="[]", exports="[]"):
    started = time.perf_counter()
    failure, db = None, None
    rows, columns, output = [], [], ""
    displayed = []
    try:
        db = _sql_connection(setup_sql)
        rows, columns = _sql_statements(db, source)
        displayed = _sql_table_rows(rows)
        output = _sql_json(rows) + "\n"
        if len(output) > 20_000:
            raise ValueError("The result exceeds 20,000 characters. Return a smaller result.")
    except BaseException as error:
        failure = f"{type(error).__name__}: {error}"
    finally:
        if db is not None:
            db.close()

    tests = []
    if expected_output is not None:
        tests.append({"name": "The SQL finishes without an error", "status": "failed" if failure else "passed", "detail": failure or ""})
        try:
            matched = json.loads(output) == json.loads(expected_output) if not failure else False
        except (ValueError, TypeError):
            matched = False
        tests.append({"name": "The query returns the requested rows in order", "status": "skipped" if failure else "passed" if matched else "failed",
                      "expected": expected_output, "actual": output.strip(), "detail": "" if matched else "Compare the columns, values and row order with the requested result."})
        for specification in json.loads(specifications):
            result = {"name": specification["name"], "status": "skipped" if failure else "passed", "detail": ""}
            check_db = None
            if not failure:
                try:
                    check_db = _sql_connection(setup_sql)
                    checked_rows, _ = _sql_statements(check_db, source)
                    namespace = {"sql": source, "setup_sql": setup_sql, "db": check_db, "rows": checked_rows,
                                 "query_rows": query_rows, "sqlite3": sqlite3, "json": json}
                    exec(compile(specification["code"], "sql_check.py", "exec"), namespace)
                except BaseException as error:
                    result.update(status="failed", detail=f"{type(error).__name__}: {error}")
                finally:
                    if check_db is not None:
                        check_db.close()
            tests.append(result)
    return _sql_json({"stdout": output, "stderr": "", "error": failure,
                      "elapsed": round((time.perf_counter() - started) * 1000), "tests": tests,
                      "table": {"columns": columns, "rows": displayed} if not failure else None,
                      "artifacts": []})
