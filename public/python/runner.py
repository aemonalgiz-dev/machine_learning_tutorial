"""Execute a course script in a fresh namespace inside the browser worker."""

import contextlib
import io
import json
import linecache
import math
import re
import time
import traceback


TOKEN = re.compile(r"[A-Za-z_][\w]*|[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?|[^\s]")
NUMBER = re.compile(r"^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$")


def assert_output_line(actual: str, expected: str) -> None:
    """Check text and values, allowing whitespace and printed rounding."""
    wanted = TOKEN.findall(expected)
    received = TOKEN.findall(actual)
    assert len(wanted) == len(received), "This result has missing or extra values."
    for target, given in zip(wanted, received):
        if target == given:
            continue
        if NUMBER.fullmatch(target) and NUMBER.fullmatch(given):
            mantissa, _, exponent = target.lower().partition("e")
            decimals = len(mantissa.partition(".")[2])
            tolerance = (
                max(1e-12, 0.5 * 10 ** (int(exponent or 0) - decimals))
                if "." in target or "e" in target.lower()
                else 1e-12
            )
            assert math.isclose(
                float(given), float(target), rel_tol=0, abs_tol=tolerance + 1e-12
            ), f"Expected {target}, received {given}."
        else:
            assert given == target, f"Expected {target!r}, received {given!r}."


def output_tests(actual: str, expected: str, failure: str | None) -> list[dict]:
    """Run a separate assertion for every requested result, in order."""
    wanted = [line for line in expected.splitlines() if line.strip()]
    received = [line for line in actual.splitlines() if line.strip()]
    tests = [
        {
            "name": "The program finishes without a Python error",
            "status": "failed" if failure else "passed",
            "detail": "Fix the error above before checking the results."
            if failure
            else "",
        }
    ]
    tests.append(
        {
            "name": "Every requested result is printed",
            "status": "skipped"
            if failure
            else "passed"
            if len(wanted) == len(received)
            else "failed",
            "expected": f"{len(wanted)} non-empty lines",
            "actual": f"{len(received)} non-empty lines",
            "detail": "Print one line per expected result, without extra debugging output.",
        }
    )
    for position, target in enumerate(wanted):
        given = received[position] if position < len(received) else ""
        test = {
            "name": f"Result {position + 1}",
            "status": "skipped" if failure else "passed",
            "expected": target,
            "actual": given,
            "detail": "",
        }
        if not failure:
            try:
                assert_output_line(given, target)
            except AssertionError as error:
                test.update(status="failed", detail=str(error))
        tests.append(test)
    return tests


class OutputLimitError(Exception):
    """A script printed more than the output panel can usefully display."""


class LimitedOutput(io.StringIO):
    def write(self, text: str) -> int:
        remaining = 20_000 - self.tell()
        if len(text) > remaining:
            super().write(text[:remaining])
            raise OutputLimitError(
                "Output stopped at 20,000 characters. Print a smaller result."
            )
        return super().write(text)


def run_course_code(source: str, expected_output: str | None = None) -> str:
    output = LimitedOutput()
    errors = LimitedOutput()
    started = time.perf_counter()
    failure = None
    namespace = {"__name__": "__main__"}
    linecache.cache["solution.py"] = (
        len(source),
        None,
        source.splitlines(True),
        "solution.py",
    )
    with contextlib.redirect_stdout(output), contextlib.redirect_stderr(errors):
        try:
            exec(compile(source, "solution.py", "exec"), namespace)
        except BaseException as error:
            failure = "".join(
                traceback.format_exception(type(error), error, error.__traceback__)
            ).strip()
    return json.dumps(
        {
            "stdout": output.getvalue(),
            "stderr": errors.getvalue(),
            "error": failure,
            "elapsed": round((time.perf_counter() - started) * 1000),
            "tests": output_tests(output.getvalue(), expected_output, failure)
            if expected_output is not None
            else [],
        }
    )
