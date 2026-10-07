"""Regression tests for the learner's Python test runner, using only stdlib."""

import importlib.util
import json
import sys
from pathlib import Path
import unittest


sys.dont_write_bytecode = True
specification = importlib.util.spec_from_file_location(
    "course_runner", Path(__file__).parents[1] / "public" / "python" / "runner.py"
)
runner = importlib.util.module_from_spec(specification)
specification.loader.exec_module(runner)


class RunnerTests(unittest.TestCase):
    def run_code(self, source, expected=None):
        return json.loads(runner.run_course_code(source, expected))

    def test_real_program_passes_every_assertion(self):
        result = self.run_code(
            'values = [2, 3, 5]\nprint("total", sum(values))', "total 10"
        )
        self.assertTrue(all(test["status"] == "passed" for test in result["tests"]))

    def test_wrong_value_fails_and_reports_expected_and_actual(self):
        result = self.run_code('print("total", 9)', "total 10")
        self.assertEqual(result["tests"][-1]["status"], "failed")
        self.assertEqual(result["tests"][-1]["expected"], "total 10")
        self.assertEqual(result["tests"][-1]["actual"], "total 9")

    def test_rounding_and_whitespace_are_allowed_but_wrong_sign_is_not(self):
        runner.assert_output_line("answer   0.33333333", "answer 0.3333")
        with self.assertRaises(AssertionError):
            runner.assert_output_line("answer -0.3333", "answer 0.3333")

    def test_missing_extra_and_reordered_results_fail(self):
        for source in [
            'print("first 1")',
            'print("first 1\\nsecond 2\\nextra 3")',
            'print("second 2\\nfirst 1")',
        ]:
            with self.subTest(source=source):
                result = self.run_code(source, "first 1\nsecond 2")
                self.assertTrue(
                    any(test["status"] == "failed" for test in result["tests"])
                )

    def test_exceptions_keep_printed_output_and_skip_result_tests(self):
        result = self.run_code(
            'print("before")\nraise ValueError("try again")', "after"
        )
        self.assertEqual(result["stdout"], "before\n")
        self.assertIn('File "solution.py", line 2', result["error"])
        self.assertEqual(result["tests"][0]["status"], "failed")
        self.assertEqual(result["tests"][-1]["status"], "skipped")

    def test_runs_have_fresh_variables(self):
        self.run_code("answer = 42")
        self.assertIn("NameError", self.run_code("print(answer)")["error"])

    def test_output_is_bounded(self):
        result = self.run_code('print("x" * 25000)')
        self.assertEqual(len(result["stdout"]), 20000)
        self.assertIn("OutputLimitError", result["error"])

    def test_running_without_tests_does_not_claim_completion(self):
        self.assertEqual(self.run_code('print("done")')["tests"], [])

    def test_nan_does_not_pass_a_numeric_check(self):
        with self.assertRaises(AssertionError):
            runner.assert_output_line("answer nan", "answer 0.0")


if __name__ == "__main__":
    unittest.main()
