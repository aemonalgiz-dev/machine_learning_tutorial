import { lesson } from './applied-authoring.mjs';

// Authored problems, examples, checks, journeys and changed cases.
const records = [
  {
    "section": "Python Testing and Project Tools",
    "id": "python-testing",
    "title": "Testing Python Functions",
    "topic": "Checking behavior",
    "blurb": "A program can run without producing the right result. Tests preserve expectations about its behavior, including boundaries and earlier mistakes, so a change can be checked against those expectations.",
    "openingTitle": "The Alert Count Changed After a Cleanup",
    "opening": [
      "Botie counts greenhouse readings at or above a limit. A cleanup changes one comparison. The program still runs, but a reading exactly on the limit no longer creates an alert.",
      "We need a case that distinguishes the intended rule from that plausible mistake. Keeping its expectation executable lets us check the next change too."
    ],
    "prerequisites": [
      {
        "title": "Function design",
        "href": "/concepts/python-function-design"
      },
      {
        "title": "Explicit failures",
        "href": "/concepts/python-fail-fast"
      }
    ],
    "outputLabel": "Names of cases whose actual result differs",
    "checkpointTitle": "Questions on Parts 1 and 2",
    "history": {
      "title": "Python unittest and xUnit Testing",
      "sources": [
        {
          "title": "Python unittest introduction",
          "url": "https://docs.python.org/3.14/library/unittest.html"
        },
        {
          "title": "Kent Beck: Simple Smalltalk Testing",
          "url": "https://web.archive.org/web/20150315073817/http://www.xprogramming.com/testfram.htm"
        },
        {
          "title": "pytest parameterization",
          "url": "https://docs.pytest.org/en/stable/how-to/parametrize.html"
        }
      ],
      "blocks": [
        "Repeated manual checks become difficult to keep consistent as a program changes. Kent Beck's Smalltalk testing framework organized checks around preparation, an action and an expected result. That approach influenced other testing frameworks.",
        "Python's unittest documentation identifies its connection to JUnit. A runner can execute a collection of tests and report failures separately. We use that organization to preserve the alert rule while its implementation changes. Passing a finite case set remains evidence about those cases, rather than proof about every possible input."
      ]
    },
    "diagram": {
      "title": "The boundary belongs to the rule",
      "explanation": "Each expectation follows from the inclusive alert rule, independently of the tested implementation.",
      "rows": [],
      "scene": {
        "kind": "table",
        "rowHeading": "Case",
        "columns": [
          "Readings",
          "Limit",
          "Expected count"
        ],
        "records": [
          {
            "label": "Below",
            "cells": [
              "[19]",
              "20",
              "0"
            ]
          },
          {
            "label": "Boundary",
            "cells": [
              "[20]",
              "20",
              "1"
            ]
          },
          {
            "label": "Empty",
            "cells": [
              "[]",
              "20",
              "0"
            ]
          }
        ],
        "caption": "Invented greenhouse checks. Both inputs and expectations are part of the test."
      }
    },
    "parts": [
      {
        "title": "State observable behavior",
        "paragraphs": [
          "The promise is a count, not a particular loop or variable name. A useful test calls the function with known readings and compares its result with an answer we can establish independently. A refactor can change the implementation while preserving that promise.",
          "An assertion reports a failure when its expectation is false. Assertions are appropriate in tests. Required runtime validation still needs explicit checks and exceptions because Python can omit assert statements under optimization."
        ],
        "interpretation": [],
        "examples": [
          {
            "title": "Check the equality case",
            "paragraphs": [
              "The first check distinguishes >= from >. The second checks an empty report."
            ],
            "code": "def alert_count(readings, limit):\n    return sum(value >= limit for value in readings)\n\nassert alert_count([19, 20, 24], 20) == 2\nassert alert_count([], 20) == 0\nprint(\"Boundary and empty report passed.\")",
            "output": "Boundary and empty report passed.",
            "interpretation": [
              "The expected counts come from the rule, rather than another call to the same implementation."
            ]
          }
        ]
      },
      {
        "title": "Give each failure its own test",
        "paragraphs": [
          "unittest supplies TestCase, a class with assertion methods. Methods whose names start with test are individual checks. A runner collects their outcomes so a failure in one test need not hide the others.",
          "A fixture is the data or setup a test needs. Keep fixtures small enough to explain why a failed expectation matters. This example captures the runner's formatted report and prints stable counts instead of variable timing information."
        ],
        "interpretation": [],
        "examples": [
          {
            "title": "Run independent checks",
            "paragraphs": [
              "Each method asks a different question about the same function."
            ],
            "code": "import io\nimport unittest\n\ndef alert_count(readings, limit):\n    return sum(value >= limit for value in readings)\n\nclass AlertTests(unittest.TestCase):\n    def test_boundary(self):\n        self.assertEqual(alert_count([20], 20), 1)\n\n    def test_empty(self):\n        self.assertEqual(alert_count([], 20), 0)\n\nsuite = unittest.defaultTestLoader.loadTestsFromTestCase(AlertTests)\nresult = unittest.TextTestRunner(stream=io.StringIO()).run(suite)\nprint(result.testsRun)\nprint(result.wasSuccessful())",
            "output": "2\nTrue",
            "interpretation": [
              "The passing run establishes these expectations for these cases. It does not establish complete coverage."
            ]
          }
        ]
      },
      {
        "title": "Choose cases that distinguish mistakes",
        "paragraphs": [
          "Typical input shows ordinary use. Boundary cases test the exact place a rule changes. Empty collections, repeated values and invalid inputs need cases when the contract describes them. For an invalid input, check the specific exception promised by the function.",
          "A regression test retains a case that previously failed. Confirm the test exposes the failure, repair the implementation, then keep the case. Changing its expected answer merely to make a test green removes the evidence."
        ],
        "interpretation": []
      },
      {
        "title": "Separate unit checks from integrations",
        "paragraphs": [
          "A unit test checks a small behavior with controlled inputs. An integration test checks that real components agree, such as a parser reading the format another component actually writes. Replacing a remote client makes arithmetic repeatable but cannot establish real connectivity.",
          "Tests should not depend on their execution order or another test's mutable data. Add meaningful changed inputs rather than repeating a successful demonstration. pytest is another runner: it discovers test functions and supports parameterized cases. In a local project, install it in the project environment and run python -m pytest. The browser exercises use unittest, which is already available.",
          "The practice retains the complete prepare_reports program from the shared-policy lesson. It explicitly introduces a compact per-house adapter and counts-only view, rather than claiming the earlier named-record interface has changed."
        ],
        "interpretation": []
      }
    ],
    "questions": [
      {
        "kind": "choice",
        "prompt": "Which expected count matches the rule?",
        "options": [
          "1",
          "2",
          "3"
        ],
        "answer": 1,
        "because": "The equality case and the higher reading both count.",
        "given": {
          "description": "Question data",
          "data": "Rule: count values >= 20. Readings: [19, 20, 24]."
        }
      },
      {
        "kind": "trueFalse",
        "prompt": "Those cases necessarily detect the change.",
        "answer": false,
        "because": "A boundary reading is needed to expose this difference.",
        "given": {
          "description": "Question data",
          "data": "A function changes >= to >. All existing test readings are strictly below the limit."
        }
      },
      {
        "kind": "choice",
        "prompt": "What does that regression test preserve?",
        "options": [
          "Every possible input",
          "The behavior of a known failing case",
          "One required implementation"
        ],
        "answer": 1,
        "because": "A different implementation may still satisfy the same expectation.",
        "given": {
          "description": "Question data",
          "data": "A repaired input has a permanent test with an independently known answer."
        }
      },
      {
        "kind": "trueFalse",
        "prompt": "The actual remote connection still needs a separate integration check.",
        "answer": true,
        "because": "A controlled substitute checks the caller’s behavior without establishing real connectivity.",
        "given": {
          "description": "Question data",
          "data": "A unit test replaces a remote client with a fixed local object."
        }
      },
      {
        "kind": "choice",
        "prompt": "What should its invalid-input test expect?",
        "options": [
          "Any exception",
          "A printed message",
          "The specific ValueError"
        ],
        "answer": 2,
        "because": "Another exception may indicate a defect rather than the intended rejection.",
        "given": {
          "description": "Question data",
          "data": "A function promises ValueError for an empty report."
        }
      },
      {
        "kind": "choice",
        "prompt": "What is missing?",
        "options": [
          "An independent expectation",
          "More variable names",
          "A faster runner"
        ],
        "answer": 0,
        "because": "The same implementation can reproduce the same mistake.",
        "given": {
          "description": "Question data",
          "data": "A test gets its expected answer by calling the same candidate again."
        }
      }
    ],
    "practice": [
      {
        "title": "Test the shared report rule",
        "question": "Can the shared report rule survive a boundary case and a changed limit?",
        "task": [
          "Keep the complete named-record program from the shared-policy exercise. The supplied project adapters are new: report_counts turns each house’s numerical batch into named Celsius records, calls prepare_reports with an identity calibration, and selects its counts; count_alerts selects the count from summarize_alerts. The original full-report helpers remain available. Extend report_tests(candidate), which currently covers only an ordinary batch, to check the inclusive boundary, an empty named report, a changed shared limit, an empty mapping and rejection of a NaN limit.",
          "Pass each candidate the same keyword-only limit_c interface. Preserve the existing ordinary case. Keep expected counts independent of the candidate. Run the suite with unittest.TestResult and print whether it passed, followed by the displayed changed-limit report. The additional checks supply plausible broken report implementations.",
          "The compact view is for one numerical batch per house. It deliberately constructs the house fields at this boundary rather than pretending the earlier program used unnamed readings. Use ordinary finite thermometer values accepted by the retained conversion/report pipeline."
        ],
        "starter": "import unittest\n\nimport math\n\n# Working earlier report helpers\n\n\ndef convert_report(records):\n    \"\"\"Return named Fahrenheit readings without changing Celsius records.\"\"\"\n    result = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each reading needs a record\")\n        house = row.get(\"house\")\n        temperature_c = row.get(\"temperature_c\")\n        if not isinstance(house, str) or not house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        if type(temperature_c) not in (int, float) or (type(temperature_c) is float and not math.isfinite(temperature_c)):\n            raise ValueError(\"temperature_c must be a finite number\")\n        try:\n            temperature_f = temperature_c * 1.8 + 32\n        except OverflowError:\n            raise ValueError(\"Converted temperature is outside float range\") from None\n        if not math.isfinite(temperature_f):\n            raise ValueError(\"Converted temperature must be finite\")\n        result.append({\"house\": house, \"temperature_f\": temperature_f})\n    return result\n\ndef format_report(records):\n    rows = convert_report(records)\n    return [f\"{row[\"house\"]}: {row[\"temperature_f\"]:.1f} F\" for row in rows]\n\n\ndef summarize_alerts(readings_c, *, limit_c):\n    \"\"\"Return an inclusive Celsius alert count and total excess.\"\"\"\n    if type(limit_c) not in (int, float) or (type(limit_c) is float and not math.isfinite(limit_c)):\n        raise ValueError(\"limit_c must be finite\")\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in readings_c):\n        raise ValueError(\"Readings must be finite numbers\")\n    alerts = [value for value in readings_c if value >= limit_c]\n    try:\n        excess_c = float(sum(value - limit_c for value in alerts))\n    except OverflowError:\n        raise ValueError(\"Total excess is outside float range\") from None\n    if not math.isfinite(excess_c):\n        raise ValueError(\"Total excess must be finite\")\n    return {\"count\": len(alerts), \"excess_c\": excess_c}\n\ndef make_report(records, *, limit_c):\n    rows = convert_report(records)\n    summary = summarize_alerts([row[\"temperature_c\"] for row in records], limit_c=limit_c)\n    return {\"rows\": rows, **summary}\n\n\ndef calibrate(values, *, scale=1.0, offset=0.0):\n    \"\"\"Return calibrated values without changing the input readings.\"\"\"\n    parameters = [scale, offset, *values]\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in parameters):\n        raise ValueError(\"Calibration inputs must be finite numbers\")\n    try:\n        result = [value * scale + offset for value in values]\n    except OverflowError:\n        raise ValueError(\"Calibration is outside float range\") from None\n    if any(type(value) is float and not math.isfinite(value) for value in result):\n        raise ValueError(\"Calibrated values must be finite\")\n    return result\n\ndef calibrate_records(records, *, scale=1.0, offset=0.0):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    for row in records:\n        if not isinstance(row, dict) or not isinstance(row.get(\"house\"), str) or not row[\"house\"].strip():\n            raise ValueError(\"Every record needs a house name\")\n        value = row.get(\"temperature_c\")\n        if type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)):\n            raise ValueError(\"Every record needs a finite Celsius reading\")\n    adjusted = calibrate([row[\"temperature_c\"] for row in records], scale=scale, offset=offset)\n    return [{**row, \"temperature_c\": value} for row, value in zip(records, adjusted)]\n\ndef calibrated_report(records, *, limit_c, scale=1.0, offset=0.0):\n    adjusted = calibrate_records(records, scale=scale, offset=offset)\n    return make_report(adjusted, limit_c=limit_c)\n\ndef grouped_reports(reports, *, limit_c, scale=1.0, offset=0.0):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    calibrated_report([], limit_c=limit_c, scale=scale, offset=offset)\n    result = {}\n    for name, records in reports.items():\n        if not isinstance(name, str) or not name.strip():\n            raise ValueError(\"A report name must be nonempty text\")\n        result[name] = calibrated_report(records, limit_c=limit_c, scale=scale, offset=offset)\n    return result\n\n# Extend the program below\n\ndef prepare_reports(reports, policy):\n    if not isinstance(policy, dict) or set(policy) != {\"limit_c\", \"scale\", \"offset\"}:\n        raise ValueError(\"Policy needs exactly limit_c, scale and offset\")\n    return grouped_reports(reports, limit_c=policy[\"limit_c\"],\n                           scale=policy[\"scale\"], offset=policy[\"offset\"])\n\n\n# New project adapters: a compact per-house input and a counts-only view.\n# The complete named-record report helpers above remain available.\n\ndef count_alerts(readings_c, *, limit_c):\n    return summarize_alerts(readings_c, limit_c=limit_c)[\"count\"]\n\ndef report_counts(reports, *, limit_c):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    groups = {}\n    for house, values in reports.items():\n        if not isinstance(values, list):\n            raise ValueError(\"Each house needs a list of readings\")\n        groups[house] = [{\"house\": house, \"temperature_c\": value} for value in values]\n    prepared = prepare_reports(\n        groups, {\"limit_c\": limit_c, \"scale\": 1, \"offset\": 0})\n    return {name: report[\"count\"] for name, report in prepared.items()}\n\ndef report_tests(candidate):\n    class Checks(unittest.TestCase):\n        def test_ordinary(self):\n            self.assertEqual(candidate({\"north\":[18,29],\"south\":[20]}, limit_c=25),\n                             {\"north\":1,\"south\":0})\n    return unittest.defaultTestLoader.loadTestsFromTestCase(Checks)\n\nresult = unittest.TestResult()\nreport_tests(report_counts).run(result)\nprint(result.wasSuccessful())\nprint(report_counts({\"north\":[25,29],\"south\":[29]}, limit_c=29))",
        "solution": "import unittest\n\nimport math\n\n# Working earlier report helpers\n\n\ndef convert_report(records):\n    \"\"\"Return named Fahrenheit readings without changing Celsius records.\"\"\"\n    result = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each reading needs a record\")\n        house = row.get(\"house\")\n        temperature_c = row.get(\"temperature_c\")\n        if not isinstance(house, str) or not house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        if type(temperature_c) not in (int, float) or (type(temperature_c) is float and not math.isfinite(temperature_c)):\n            raise ValueError(\"temperature_c must be a finite number\")\n        try:\n            temperature_f = temperature_c * 1.8 + 32\n        except OverflowError:\n            raise ValueError(\"Converted temperature is outside float range\") from None\n        if not math.isfinite(temperature_f):\n            raise ValueError(\"Converted temperature must be finite\")\n        result.append({\"house\": house, \"temperature_f\": temperature_f})\n    return result\n\ndef format_report(records):\n    rows = convert_report(records)\n    return [f\"{row[\"house\"]}: {row[\"temperature_f\"]:.1f} F\" for row in rows]\n\n\ndef summarize_alerts(readings_c, *, limit_c):\n    \"\"\"Return an inclusive Celsius alert count and total excess.\"\"\"\n    if type(limit_c) not in (int, float) or (type(limit_c) is float and not math.isfinite(limit_c)):\n        raise ValueError(\"limit_c must be finite\")\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in readings_c):\n        raise ValueError(\"Readings must be finite numbers\")\n    alerts = [value for value in readings_c if value >= limit_c]\n    try:\n        excess_c = float(sum(value - limit_c for value in alerts))\n    except OverflowError:\n        raise ValueError(\"Total excess is outside float range\") from None\n    if not math.isfinite(excess_c):\n        raise ValueError(\"Total excess must be finite\")\n    return {\"count\": len(alerts), \"excess_c\": excess_c}\n\ndef make_report(records, *, limit_c):\n    rows = convert_report(records)\n    summary = summarize_alerts([row[\"temperature_c\"] for row in records], limit_c=limit_c)\n    return {\"rows\": rows, **summary}\n\n\ndef calibrate(values, *, scale=1.0, offset=0.0):\n    \"\"\"Return calibrated values without changing the input readings.\"\"\"\n    parameters = [scale, offset, *values]\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in parameters):\n        raise ValueError(\"Calibration inputs must be finite numbers\")\n    try:\n        result = [value * scale + offset for value in values]\n    except OverflowError:\n        raise ValueError(\"Calibration is outside float range\") from None\n    if any(type(value) is float and not math.isfinite(value) for value in result):\n        raise ValueError(\"Calibrated values must be finite\")\n    return result\n\ndef calibrate_records(records, *, scale=1.0, offset=0.0):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    for row in records:\n        if not isinstance(row, dict) or not isinstance(row.get(\"house\"), str) or not row[\"house\"].strip():\n            raise ValueError(\"Every record needs a house name\")\n        value = row.get(\"temperature_c\")\n        if type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)):\n            raise ValueError(\"Every record needs a finite Celsius reading\")\n    adjusted = calibrate([row[\"temperature_c\"] for row in records], scale=scale, offset=offset)\n    return [{**row, \"temperature_c\": value} for row, value in zip(records, adjusted)]\n\ndef calibrated_report(records, *, limit_c, scale=1.0, offset=0.0):\n    adjusted = calibrate_records(records, scale=scale, offset=offset)\n    return make_report(adjusted, limit_c=limit_c)\n\ndef grouped_reports(reports, *, limit_c, scale=1.0, offset=0.0):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    calibrated_report([], limit_c=limit_c, scale=scale, offset=offset)\n    result = {}\n    for name, records in reports.items():\n        if not isinstance(name, str) or not name.strip():\n            raise ValueError(\"A report name must be nonempty text\")\n        result[name] = calibrated_report(records, limit_c=limit_c, scale=scale, offset=offset)\n    return result\n\n# Extend the program below\n\ndef prepare_reports(reports, policy):\n    if not isinstance(policy, dict) or set(policy) != {\"limit_c\", \"scale\", \"offset\"}:\n        raise ValueError(\"Policy needs exactly limit_c, scale and offset\")\n    return grouped_reports(reports, limit_c=policy[\"limit_c\"],\n                           scale=policy[\"scale\"], offset=policy[\"offset\"])\n\n\n# New project adapters: a compact per-house input and a counts-only view.\n# The complete named-record report helpers above remain available.\n\ndef count_alerts(readings_c, *, limit_c):\n    return summarize_alerts(readings_c, limit_c=limit_c)[\"count\"]\n\ndef report_counts(reports, *, limit_c):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    groups = {}\n    for house, values in reports.items():\n        if not isinstance(values, list):\n            raise ValueError(\"Each house needs a list of readings\")\n        groups[house] = [{\"house\": house, \"temperature_c\": value} for value in values]\n    prepared = prepare_reports(\n        groups, {\"limit_c\": limit_c, \"scale\": 1, \"offset\": 0})\n    return {name: report[\"count\"] for name, report in prepared.items()}\n\ndef report_tests(candidate):\n    class Checks(unittest.TestCase):\n        def test_ordinary(self):\n            self.assertEqual(candidate({\"north\":[18,29],\"south\":[20]}, limit_c=25),\n                             {\"north\":1,\"south\":0})\n        def test_boundary_and_empty_report(self):\n            self.assertEqual(candidate({\"north\":[24,25],\"empty\":[]}, limit_c=25),\n                             {\"north\":1,\"empty\":0})\n        def test_changed_limit(self):\n            self.assertEqual(candidate({\"north\":[25,29]}, limit_c=29), {\"north\":1})\n        def test_empty_mapping(self):\n            self.assertEqual(candidate({}, limit_c=25), {})\n        def test_invalid_limit(self):\n            with self.assertRaises(ValueError):\n                candidate({}, limit_c=float(\"nan\"))\n    return unittest.defaultTestLoader.loadTestsFromTestCase(Checks)\n\nresult = unittest.TestResult()\nreport_tests(report_counts).run(result)\nprint(result.wasSuccessful())\nprint(report_counts({\"north\":[25,29],\"south\":[29]}, limit_c=29))",
        "output": "True\n{'north': 1, 'south': 1}",
        "hints": [
          "The original rule includes equality. A below-limit case cannot distinguish >= from >.",
          "An empty report mapping must still validate its shared limit. Test the failure with assertRaises rather than printing an error."
        ],
        "tests": [
          {
            "name": "Reject a boundary regression",
            "code": "def strict(reports, *, limit_c):\n    count_alerts([], limit_c=limit_c)\n    return {name: sum(value > limit_c for value in values)\n            for name, values in reports.items()}\nresult = unittest.TestResult()\nreport_tests(strict).run(result)\nassert not result.wasSuccessful()"
          },
          {
            "name": "Reject a fixed shared setting",
            "code": "def fixed(reports, *, limit_c):\n    return report_counts(reports, limit_c=25)\nresult = unittest.TestResult()\nreport_tests(fixed).run(result)\nassert not result.wasSuccessful()"
          },
          {
            "name": "Reject skipped empty-map validation",
            "code": "def unchecked_empty(reports, *, limit_c):\n    return {} if not reports else report_counts(reports, limit_c=limit_c)\nresult = unittest.TestResult()\nreport_tests(unchecked_empty).run(result)\nassert not result.wasSuccessful()"
          },
          {
            "name": "Accept the shared implementation",
            "code": "result = unittest.TestResult()\nreport_tests(report_counts).run(result)\nassert result.wasSuccessful()"
          }
        ],
        "continuation": {
          "lesson": "/concepts/python-dry",
          "exercise": 1,
          "summary": "Retain the complete prepare_reports program. Introduce an explicit compact per-house input adapter and counts-only projection, then test that view without changing the underlying report rule."
        },
        "editTarget": "def report_tests("
      },
      {
        "title": "Report the suite’s failures as data",
        "question": "Which report checks failed, without copying their private error details?",
        "task": [
          "Retain the report_tests suite and shared report functions. Extend the existing run_suite(suite) helper so it returns tests_run, passed and failed_tests in that key order. tests_run is the actual count and passed comes from TestResult.wasSuccessful().",
          "failed_tests must contain the sorted distinct final components of test.id() for both assertion failures and unexpected errors. Do not include traceback text or exception messages. Return an empty list on success. Use TestResult rather than a runner that prints a report, and print the result for the retained report suite."
        ],
        "starter": "import unittest\n\nimport math\n\n# Working earlier report helpers\n\n\ndef convert_report(records):\n    \"\"\"Return named Fahrenheit readings without changing Celsius records.\"\"\"\n    result = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each reading needs a record\")\n        house = row.get(\"house\")\n        temperature_c = row.get(\"temperature_c\")\n        if not isinstance(house, str) or not house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        if type(temperature_c) not in (int, float) or (type(temperature_c) is float and not math.isfinite(temperature_c)):\n            raise ValueError(\"temperature_c must be a finite number\")\n        try:\n            temperature_f = temperature_c * 1.8 + 32\n        except OverflowError:\n            raise ValueError(\"Converted temperature is outside float range\") from None\n        if not math.isfinite(temperature_f):\n            raise ValueError(\"Converted temperature must be finite\")\n        result.append({\"house\": house, \"temperature_f\": temperature_f})\n    return result\n\ndef format_report(records):\n    rows = convert_report(records)\n    return [f\"{row[\"house\"]}: {row[\"temperature_f\"]:.1f} F\" for row in rows]\n\n\ndef summarize_alerts(readings_c, *, limit_c):\n    \"\"\"Return an inclusive Celsius alert count and total excess.\"\"\"\n    if type(limit_c) not in (int, float) or (type(limit_c) is float and not math.isfinite(limit_c)):\n        raise ValueError(\"limit_c must be finite\")\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in readings_c):\n        raise ValueError(\"Readings must be finite numbers\")\n    alerts = [value for value in readings_c if value >= limit_c]\n    try:\n        excess_c = float(sum(value - limit_c for value in alerts))\n    except OverflowError:\n        raise ValueError(\"Total excess is outside float range\") from None\n    if not math.isfinite(excess_c):\n        raise ValueError(\"Total excess must be finite\")\n    return {\"count\": len(alerts), \"excess_c\": excess_c}\n\ndef make_report(records, *, limit_c):\n    rows = convert_report(records)\n    summary = summarize_alerts([row[\"temperature_c\"] for row in records], limit_c=limit_c)\n    return {\"rows\": rows, **summary}\n\n\ndef calibrate(values, *, scale=1.0, offset=0.0):\n    \"\"\"Return calibrated values without changing the input readings.\"\"\"\n    parameters = [scale, offset, *values]\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in parameters):\n        raise ValueError(\"Calibration inputs must be finite numbers\")\n    try:\n        result = [value * scale + offset for value in values]\n    except OverflowError:\n        raise ValueError(\"Calibration is outside float range\") from None\n    if any(type(value) is float and not math.isfinite(value) for value in result):\n        raise ValueError(\"Calibrated values must be finite\")\n    return result\n\ndef calibrate_records(records, *, scale=1.0, offset=0.0):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    for row in records:\n        if not isinstance(row, dict) or not isinstance(row.get(\"house\"), str) or not row[\"house\"].strip():\n            raise ValueError(\"Every record needs a house name\")\n        value = row.get(\"temperature_c\")\n        if type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)):\n            raise ValueError(\"Every record needs a finite Celsius reading\")\n    adjusted = calibrate([row[\"temperature_c\"] for row in records], scale=scale, offset=offset)\n    return [{**row, \"temperature_c\": value} for row, value in zip(records, adjusted)]\n\ndef calibrated_report(records, *, limit_c, scale=1.0, offset=0.0):\n    adjusted = calibrate_records(records, scale=scale, offset=offset)\n    return make_report(adjusted, limit_c=limit_c)\n\ndef grouped_reports(reports, *, limit_c, scale=1.0, offset=0.0):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    calibrated_report([], limit_c=limit_c, scale=scale, offset=offset)\n    result = {}\n    for name, records in reports.items():\n        if not isinstance(name, str) or not name.strip():\n            raise ValueError(\"A report name must be nonempty text\")\n        result[name] = calibrated_report(records, limit_c=limit_c, scale=scale, offset=offset)\n    return result\n\n# Extend the program below\n\ndef prepare_reports(reports, policy):\n    if not isinstance(policy, dict) or set(policy) != {\"limit_c\", \"scale\", \"offset\"}:\n        raise ValueError(\"Policy needs exactly limit_c, scale and offset\")\n    return grouped_reports(reports, limit_c=policy[\"limit_c\"],\n                           scale=policy[\"scale\"], offset=policy[\"offset\"])\n\n\n# New project adapters: a compact per-house input and a counts-only view.\n# The complete named-record report helpers above remain available.\n\ndef count_alerts(readings_c, *, limit_c):\n    return summarize_alerts(readings_c, limit_c=limit_c)[\"count\"]\n\ndef report_counts(reports, *, limit_c):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    groups = {}\n    for house, values in reports.items():\n        if not isinstance(values, list):\n            raise ValueError(\"Each house needs a list of readings\")\n        groups[house] = [{\"house\": house, \"temperature_c\": value} for value in values]\n    prepared = prepare_reports(\n        groups, {\"limit_c\": limit_c, \"scale\": 1, \"offset\": 0})\n    return {name: report[\"count\"] for name, report in prepared.items()}\n\ndef report_tests(candidate):\n    class Checks(unittest.TestCase):\n        def test_ordinary(self):\n            self.assertEqual(candidate({\"north\":[18,29],\"south\":[20]}, limit_c=25),\n                             {\"north\":1,\"south\":0})\n        def test_boundary_and_empty_report(self):\n            self.assertEqual(candidate({\"north\":[24,25],\"empty\":[]}, limit_c=25),\n                             {\"north\":1,\"empty\":0})\n        def test_changed_limit(self):\n            self.assertEqual(candidate({\"north\":[25,29]}, limit_c=29), {\"north\":1})\n        def test_empty_mapping(self):\n            self.assertEqual(candidate({}, limit_c=25), {})\n        def test_invalid_limit(self):\n            with self.assertRaises(ValueError):\n                candidate({}, limit_c=float(\"nan\"))\n    return unittest.defaultTestLoader.loadTestsFromTestCase(Checks)\n\ndef run_suite(suite):\n    result = unittest.TestResult()\n    suite.run(result)\n    return {\"tests_run\": result.testsRun, \"passed\": result.wasSuccessful()}\n\nprint(run_suite(report_tests(report_counts)))",
        "solution": "import unittest\n\nimport math\n\n# Working earlier report helpers\n\n\ndef convert_report(records):\n    \"\"\"Return named Fahrenheit readings without changing Celsius records.\"\"\"\n    result = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each reading needs a record\")\n        house = row.get(\"house\")\n        temperature_c = row.get(\"temperature_c\")\n        if not isinstance(house, str) or not house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        if type(temperature_c) not in (int, float) or (type(temperature_c) is float and not math.isfinite(temperature_c)):\n            raise ValueError(\"temperature_c must be a finite number\")\n        try:\n            temperature_f = temperature_c * 1.8 + 32\n        except OverflowError:\n            raise ValueError(\"Converted temperature is outside float range\") from None\n        if not math.isfinite(temperature_f):\n            raise ValueError(\"Converted temperature must be finite\")\n        result.append({\"house\": house, \"temperature_f\": temperature_f})\n    return result\n\ndef format_report(records):\n    rows = convert_report(records)\n    return [f\"{row[\"house\"]}: {row[\"temperature_f\"]:.1f} F\" for row in rows]\n\n\ndef summarize_alerts(readings_c, *, limit_c):\n    \"\"\"Return an inclusive Celsius alert count and total excess.\"\"\"\n    if type(limit_c) not in (int, float) or (type(limit_c) is float and not math.isfinite(limit_c)):\n        raise ValueError(\"limit_c must be finite\")\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in readings_c):\n        raise ValueError(\"Readings must be finite numbers\")\n    alerts = [value for value in readings_c if value >= limit_c]\n    try:\n        excess_c = float(sum(value - limit_c for value in alerts))\n    except OverflowError:\n        raise ValueError(\"Total excess is outside float range\") from None\n    if not math.isfinite(excess_c):\n        raise ValueError(\"Total excess must be finite\")\n    return {\"count\": len(alerts), \"excess_c\": excess_c}\n\ndef make_report(records, *, limit_c):\n    rows = convert_report(records)\n    summary = summarize_alerts([row[\"temperature_c\"] for row in records], limit_c=limit_c)\n    return {\"rows\": rows, **summary}\n\n\ndef calibrate(values, *, scale=1.0, offset=0.0):\n    \"\"\"Return calibrated values without changing the input readings.\"\"\"\n    parameters = [scale, offset, *values]\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in parameters):\n        raise ValueError(\"Calibration inputs must be finite numbers\")\n    try:\n        result = [value * scale + offset for value in values]\n    except OverflowError:\n        raise ValueError(\"Calibration is outside float range\") from None\n    if any(type(value) is float and not math.isfinite(value) for value in result):\n        raise ValueError(\"Calibrated values must be finite\")\n    return result\n\ndef calibrate_records(records, *, scale=1.0, offset=0.0):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    for row in records:\n        if not isinstance(row, dict) or not isinstance(row.get(\"house\"), str) or not row[\"house\"].strip():\n            raise ValueError(\"Every record needs a house name\")\n        value = row.get(\"temperature_c\")\n        if type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)):\n            raise ValueError(\"Every record needs a finite Celsius reading\")\n    adjusted = calibrate([row[\"temperature_c\"] for row in records], scale=scale, offset=offset)\n    return [{**row, \"temperature_c\": value} for row, value in zip(records, adjusted)]\n\ndef calibrated_report(records, *, limit_c, scale=1.0, offset=0.0):\n    adjusted = calibrate_records(records, scale=scale, offset=offset)\n    return make_report(adjusted, limit_c=limit_c)\n\ndef grouped_reports(reports, *, limit_c, scale=1.0, offset=0.0):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    calibrated_report([], limit_c=limit_c, scale=scale, offset=offset)\n    result = {}\n    for name, records in reports.items():\n        if not isinstance(name, str) or not name.strip():\n            raise ValueError(\"A report name must be nonempty text\")\n        result[name] = calibrated_report(records, limit_c=limit_c, scale=scale, offset=offset)\n    return result\n\n# Extend the program below\n\ndef prepare_reports(reports, policy):\n    if not isinstance(policy, dict) or set(policy) != {\"limit_c\", \"scale\", \"offset\"}:\n        raise ValueError(\"Policy needs exactly limit_c, scale and offset\")\n    return grouped_reports(reports, limit_c=policy[\"limit_c\"],\n                           scale=policy[\"scale\"], offset=policy[\"offset\"])\n\n\n# New project adapters: a compact per-house input and a counts-only view.\n# The complete named-record report helpers above remain available.\n\ndef count_alerts(readings_c, *, limit_c):\n    return summarize_alerts(readings_c, limit_c=limit_c)[\"count\"]\n\ndef report_counts(reports, *, limit_c):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    groups = {}\n    for house, values in reports.items():\n        if not isinstance(values, list):\n            raise ValueError(\"Each house needs a list of readings\")\n        groups[house] = [{\"house\": house, \"temperature_c\": value} for value in values]\n    prepared = prepare_reports(\n        groups, {\"limit_c\": limit_c, \"scale\": 1, \"offset\": 0})\n    return {name: report[\"count\"] for name, report in prepared.items()}\n\ndef report_tests(candidate):\n    class Checks(unittest.TestCase):\n        def test_ordinary(self):\n            self.assertEqual(candidate({\"north\":[18,29],\"south\":[20]}, limit_c=25),\n                             {\"north\":1,\"south\":0})\n        def test_boundary_and_empty_report(self):\n            self.assertEqual(candidate({\"north\":[24,25],\"empty\":[]}, limit_c=25),\n                             {\"north\":1,\"empty\":0})\n        def test_changed_limit(self):\n            self.assertEqual(candidate({\"north\":[25,29]}, limit_c=29), {\"north\":1})\n        def test_empty_mapping(self):\n            self.assertEqual(candidate({}, limit_c=25), {})\n        def test_invalid_limit(self):\n            with self.assertRaises(ValueError):\n                candidate({}, limit_c=float(\"nan\"))\n    return unittest.defaultTestLoader.loadTestsFromTestCase(Checks)\n\ndef run_suite(suite):\n    result = unittest.TestResult()\n    suite.run(result)\n    names = {test.id().rsplit(\".\", 1)[-1]\n             for test, _ in result.failures + result.errors}\n    return {\"tests_run\": result.testsRun,\n            \"passed\": result.wasSuccessful(),\n            \"failed_tests\": sorted(names)}\n\nprint(run_suite(report_tests(report_counts)))",
        "output": "{'tests_run': 5, 'passed': True, 'failed_tests': []}",
        "hints": [
          "TestResult keeps failures and errors separately; both represent an unsuccessful check.",
          "Extract only the final dot-separated ID component, then deduplicate and sort names."
        ],
        "tests": [
          {
            "name": "Failures and errors are both reported",
            "code": "class BrokenChecks(unittest.TestCase):\n    def test_mismatch(self):\n        self.assertEqual(1, 2)\n    def test_unexpected(self):\n        raise ValueError(\"private input must not enter the report\")\nsummary = run_suite(unittest.defaultTestLoader.loadTestsFromTestCase(BrokenChecks))\nassert summary == {\"tests_run\":2,\"passed\":False,\n                   \"failed_tests\":[\"test_mismatch\",\"test_unexpected\"]}"
          },
          {
            "name": "An independent passing suite",
            "code": "class GoodChecks(unittest.TestCase):\n    def test_other(self):\n        self.assertEqual(3 * 3, 9)\nsummary = run_suite(unittest.defaultTestLoader.loadTestsFromTestCase(GoodChecks))\nassert summary == {\"tests_run\":1,\"passed\":True,\"failed_tests\":[]}"
          },
          {
            "name": "Empty suite and silence",
            "code": "import io\nfrom contextlib import redirect_stdout, redirect_stderr\nout, err = io.StringIO(), io.StringIO()\nwith redirect_stdout(out), redirect_stderr(err):\n    summary = run_suite(unittest.TestSuite())\nassert summary == {\"tests_run\":0,\"passed\":True,\"failed_tests\":[]}\nassert out.getvalue() == err.getvalue() == \"\""
          }
        ],
        "continuation": {
          "lesson": "/concepts/python-testing",
          "exercise": 0,
          "summary": "Keep the report regression suite and replace its print-only result with a reusable, silent summary of passed checks, failures and errors."
        },
        "editTarget": "def run_suite("
      }
    ],
    "build": {
      "title": "Find the failing alert cases",
      "problem": "Botie has case names, observed results and independent expectations in matching order.",
      "challenge": "Compare actual and expected results, then use mismatch decisions to retain failing names.",
      "sources": {
        "names": "Case names",
        "actual": "Observed results",
        "expected": "Independent expectations"
      },
      "cases": [
        {
          "name": "Boundary regression",
          "data": {
            "names": [
              "below",
              "boundary",
              "above"
            ],
            "actual": [
              0,
              0,
              1
            ],
            "expected": [
              0,
              1,
              1
            ]
          },
          "expected": [
            "boundary"
          ]
        },
        {
          "name": "Two behaviors break",
          "data": {
            "names": [
              "empty",
              "boundary",
              "above"
            ],
            "actual": [
              1,
              1,
              0
            ],
            "expected": [
              0,
              1,
              1
            ]
          },
          "expected": [
            "empty",
            "above"
          ]
        },
        {
          "name": "All agree",
          "data": {
            "names": [
              "below",
              "boundary"
            ],
            "actual": [
              0,
              1
            ],
            "expected": [
              0,
              1
            ]
          },
          "expected": []
        }
      ],
      "recipe": {
        "op": "pyProjectKeep",
        "inputs": [
          {
            "source": "names"
          },
          {
            "op": "pyProjectMismatch",
            "inputs": [
              {
                "source": "actual"
              },
              {
                "source": "expected"
              }
            ]
          }
        ]
      },
      "why": "Failed names come from observed differences rather than whether execution completed.",
      "limitation": "The workshop compares supplied results. It does not execute Python or prove that the cases are sufficient.",
      "extras": [
        "constant",
        "add",
        "multiply",
        "total",
        "count"
      ],
      "draftVersion": 1
    },
    "journey": {
      "premise": "The program runs but excludes a boundary reading.",
      "order": "investigate-first",
      "construction": {
        "title": "Identify the cases that expose the change",
        "start": "Compare the results first, then keep names at those same differing positions.",
        "outcome": "Each output name identifies a specific failed expectation.",
        "hints": [
          "Compare aligned actual and expected entries.",
          "Use the mismatch decisions to select the names."
        ]
      },
      "investigation": {
        "title": "The empty result is 1 instead of 0, and the above-limit result is 0 instead of 1. Which names remain?",
        "caseIndex": 1,
        "kind": "diagnose",
        "question": "The empty result is 1 instead of 0, and the above-limit result is 0 instead of 1. Which names remain?",
        "options": [
          {
            "label": "empty and above",
            "feedback": "Both results differ from their own expectations.",
            "correct": true
          },
          {
            "label": "Only boundary",
            "feedback": "Use the current results rather than the earlier diagnosis."
          }
        ],
        "outcome": "The unchanged boundary case passes in this variation."
      },
      "connections": [
        {
          "lessonId": "python-fail-fast",
          "skill": "Distinguish expected rejection from a defect",
          "why": "A test must check the promised failure as well as valid results."
        }
      ],
      "reflection": {
        "prompt": "Which untested input might still distinguish two implementations?",
        "carryForward": "Keep boundary and regression cases without inferring complete coverage."
      }
    },
    "fresh": {
      "name": "An ordered result changes",
      "prompt": "Find the case whose returned ID order differs from its expectation.",
      "data": {
        "names": [
          "stable tie",
          "empty"
        ],
        "actual": [
          [
            "B",
            "A"
          ],
          []
        ],
        "expected": [
          [
            "A",
            "B"
          ],
          []
        ]
      },
      "expected": [
        "stable tie"
      ],
      "why": "Comparison must preserve the meaning of ordered results."
    }
  },
  {
    "section": "Python Testing and Project Tools",
    "id": "python-test-doubles",
    "title": "Dependency Injection and Test Doubles",
    "topic": "Checking behavior",
    "blurb": "A report test is easier to repeat when its reading source is explicit. Controlled source and sink objects let us inspect data and calls locally, while separate integration checks exercise actual devices or services.",
    "openingTitle": "The Report Test Needed a Live Thermometer",
    "opening": [
      "Botie's shared report rule is tested, but its next test depends on whichever readings a connected device returns. A stopped device or a changed temperature makes the test unreliable before the calculation is even checked.",
      "The composition lesson gave the collector a source with a read method. We can retain that interface and supply a controlled source, then record how the existing collector uses it."
    ],
    "prerequisites": [
      {
        "title": "Composition and interfaces",
        "href": "/concepts/python-composition"
      },
      {
        "title": "Testing functions",
        "href": "/concepts/python-testing"
      }
    ],
    "outputLabel": "Readings collected from the supplied source fixtures",
    "checkpointTitle": "Questions on Parts 1 and 2",
    "history": {
      "title": "unittest.mock and Controlled Dependencies",
      "sources": [
        {
          "title": "Python unittest.mock",
          "url": "https://docs.python.org/3.14/library/unittest.mock.html"
        },
        {
          "title": "Martin Fowler: Mocks Are Not Stubs, 2007",
          "url": "https://martinfowler.com/articles/mocksArentStubs.html"
        }
      ],
      "blocks": [
        "A test inherits the changing behavior of any real clock, database or remote service it uses. Testing terminology developed to distinguish stand-ins with different roles. Fowler's 2007 account separates checks on resulting state from expectations about how collaborators were called.",
        "Python added unittest.mock to the standard library in version 3.3. It can record calls and supply controlled responses. An explicit callable parameter also makes that boundary visible without a mocking library. The resulting test still needs a clear account of what it establishes and which real integrations remain unchecked."
      ]
    },
    "diagram": {
      "title": "Retain the complete source and sink agreements",
      "explanation": "A source supplies named records; the collector builds the complete payload before the sink sees it.",
      "rows": [],
      "scene": {
        "kind": "table",
        "rowHeading": "Boundary",
        "columns": [
          "Data",
          "Controlled check"
        ],
        "records": [
          {
            "label": "ReadingSource.read",
            "cells": [
              "Named Celsius records with optional limits",
              "Snapshot ownership and one read"
            ]
          },
          {
            "label": "collect_report",
            "cells": [
              "Numerical report plus notes",
              "Existing calculation and validation"
            ]
          },
          {
            "label": "ReportSink.send",
            "cells": [
              "One complete payload",
              "Acceptance and acknowledgment"
            ]
          }
        ],
        "caption": "A local source/sink fixture cannot establish a physical device connection or a production delivery guarantee."
      }
    },
    "parts": [
      {
        "title": "Supply the capability the report needs",
        "paragraphs": [
          "The existing collector asks ReadingSource.read for named Celsius records. collect_report then applies calibration, resolves per-record limits and builds its report-and-notes payload. Passing the source explicitly keeps device construction out of that calculation.",
          "Keep the role small. A source can be a local recording, a device client or a test object, provided it supplies the stated operation and data contract. There is no need for an injection framework merely to pass one object."
        ],
        "interpretation": [],
        "examples": [
          {
            "title": "Supply the named-record interface",
            "paragraphs": [
              "The retained collector expects named Celsius records from read(). This small fixture shows only that input boundary."
            ],
            "code": "class FixedSource:\n    def read(self):\n        return [{\"house\":\"north\", \"temperature_c\":18.0}]\n\nprint(FixedSource().read())",
            "output": "[{'house': 'north', 'temperature_c': 18.0}]",
            "interpretation": [
              "The complete collect_report helper keeps calibration, per-record limit rules and report construction separate from this source."
            ]
          }
        ]
      },
      {
        "title": "Observe calls as well as the result",
        "paragraphs": [
          "A result can happen to match even when a collector reads twice or uses the wrong operation. A recording source lets a test inspect that interaction. Check calls when they are part of the requirement, rather than freezing every private implementation detail.",
          "A stub supplies controlled responses. A fake implements a simplified working substitute. Mock libraries can record interactions and assert expectations. These roles describe testing behavior; they do not guarantee that a substitute matches a real device."
        ],
        "interpretation": [],
        "examples": [
          {
            "title": "Record a named-record read",
            "paragraphs": [
              "The fixed source counts use of its method. The challenge adds supplied records and independent ownership."
            ],
            "code": "class FixedSource:\n    def __init__(self):\n        self.calls = 0\n    def read(self):\n        self.calls += 1\n        return [{\"house\":\"north\", \"temperature_c\":12.0}]\n\nsource = FixedSource()\nprint(source.read())\nprint(source.calls)",
            "output": "[{'house': 'north', 'temperature_c': 12.0}]\n1",
            "interpretation": [
              "The count comes from actual method calls. A configurable fixture must also protect its supplied record snapshot."
            ]
          }
        ]
      },
      {
        "title": "Constrain a substitute to the real interface",
        "paragraphs": [
          "A permissive mock can accept a misspelled method such as raed even though the actual source only exposes read. unittest.mock provides spec and autospec controls to restrict attributes or call signatures. They do not validate every runtime reading or establish a working connection.",
          "Exercise known failures too. A source timeout should reach the layer that has a deliberate recovery policy. Silently substituting an empty batch would turn missing data into a successful report with no alerts."
        ],
        "interpretation": []
      },
      {
        "title": "Keep delivery effects local during coordination tests",
        "paragraphs": [
          "The earlier deliver_report function sends one complete payload to ReportSink.send. A recording sink can retain that payload and fail either before acceptance or after accepting it, exposing the difference without contacting a destination.",
          "A raised error after acceptance does not prove that nothing happened. Keep the coordinator’s no-retry policy visible and check both attempted calls and accepted payloads. A real destination still needs its own authorization, acknowledgment and reconciliation behavior."
        ],
        "interpretation": []
      }
    ],
    "questions": [
      {
        "kind": "choice",
        "prompt": "What has the test controlled?",
        "options": [
          "The collector's reading source",
          "Every external device",
          "The Python interpreter"
        ],
        "answer": 0,
        "because": "The test supplies known readings through the existing interface.",
        "given": {
          "description": "Question data",
          "data": "collect_report receives a source whose read() returns a fixed list of named Celsius record dictionaries."
        }
      },
      {
        "kind": "trueFalse",
        "prompt": "The record can expose repeated retrieval even when the returned report matches.",
        "answer": true,
        "because": "A correct-looking result does not establish the intended number of source calls.",
        "given": {
          "description": "Question data",
          "data": "A fake source records how often read() is called."
        }
      },
      {
        "kind": "choice",
        "prompt": "Which practice can expose the interface mismatch?",
        "options": [
          "A longer timeout",
          "A constrained spec or autospec",
          "An empty batch for every unknown method"
        ],
        "answer": 1,
        "because": "A constrained substitute can reject members absent from the real interface.",
        "given": {
          "description": "Question data",
          "data": "The actual source has read(), but a permissive mock accepts raed()."
        }
      },
      {
        "kind": "trueFalse",
        "prompt": "The actual thermometer is therefore reachable and reports valid readings.",
        "answer": false,
        "because": "Signature agreement does not establish connectivity or data validity.",
        "given": {
          "description": "Question data",
          "data": "An autospecced source mock accepts a call."
        }
      },
      {
        "kind": "choice",
        "prompt": "Which policy preserves the failed retrieval?",
        "options": [
          "Silently report zero alerts",
          "Reuse an unrelated old reading",
          "Propagate or deliberately handle the specific failure at a recovery boundary"
        ],
        "answer": 2,
        "because": "No batch was obtained; an empty successful result would change that meaning.",
        "given": {
          "description": "Question data",
          "data": "A reading source raises TimeoutError before returning its batch."
        }
      },
      {
        "kind": "choice",
        "prompt": "What belongs in its no-send coordination test?",
        "options": [
          "A local sink that records payloads and can fail before or after acceptance",
          "A personal mailbox",
          "A real production destination"
        ],
        "answer": 0,
        "because": "A local substitute exposes interactions without an external send.",
        "given": {
          "description": "Question data",
          "data": "deliver_report sends one complete report-and-notes payload through a supplied sink."
        }
      }
    ],
    "practice": [
      {
        "title": "Control and observe the named-record source",
        "question": "Can the complete report be tested with a controlled named-record source?",
        "task": [
          "Keep the complete report program and its actual collect_report interface from composition. ReadingSource.read returns named Celsius record dictionaries, not a list of temperatures. The supplied RecordedSource has that method but shares its input records and does not count calls.",
          "Extend the fixture to deep-copy its supplied record list at construction, initialize calls to zero, and return another deep copy after incrementing calls on each read. This preserves nested record ownership. Do not read a device. Use collect_report(source, default_limit_c=...) unchanged so its calibration, per-record limits and notes remain part of the tested result. Print the converted rows, alert flags and source-call count."
        ],
        "starter": "import math\nfrom dataclasses import dataclass, field\nfrom typing import Protocol\n\n# Working earlier report helpers\n\n\ndef fahrenheit(temperature_c: float) -> float:\n    if type(temperature_c) not in (int, float) or (type(temperature_c) is float and not math.isfinite(temperature_c)):\n        raise ValueError(\"temperature_c must be a finite number\")\n    try:\n        result = float(temperature_c * 1.8 + 32)\n    except OverflowError:\n        raise ValueError(\"Conversion is outside float range\") from None\n    if not math.isfinite(result):\n        raise ValueError(\"Converted temperature must be finite\")\n    return result\n\ndef convert_report(records):\n    result = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each reading needs a record\")\n        house = row.get(\"house\")\n        if not isinstance(house, str) or not house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        result.append({\"house\": house, \"temperature_f\": fahrenheit(row.get(\"temperature_c\"))})\n    return result\n\ndef format_report(records):\n    rows = convert_report(records)\n    return [f\"{row[\"house\"]}: {row[\"temperature_f\"]:.1f} F\" for row in rows]\n\n\ndef summarize_alerts(readings_c, *, limit_c):\n    \"\"\"Return an inclusive Celsius alert count and total excess.\"\"\"\n    if type(limit_c) not in (int, float) or (type(limit_c) is float and not math.isfinite(limit_c)):\n        raise ValueError(\"limit_c must be finite\")\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in readings_c):\n        raise ValueError(\"Readings must be finite numbers\")\n    alerts = [value for value in readings_c if value >= limit_c]\n    try:\n        excess_c = float(sum(value - limit_c for value in alerts))\n    except OverflowError:\n        raise ValueError(\"Total excess is outside float range\") from None\n    if not math.isfinite(excess_c):\n        raise ValueError(\"Total excess must be finite\")\n    return {\"count\": len(alerts), \"excess_c\": excess_c}\n\ndef make_report(records, *, limit_c):\n    rows = convert_report(records)\n    summary = summarize_alerts([row[\"temperature_c\"] for row in records], limit_c=limit_c)\n    return {\"rows\": rows, **summary}\n\n\ndef calibrate(values, *, scale=1.0, offset=0.0):\n    \"\"\"Return calibrated values without changing the input readings.\"\"\"\n    parameters = [scale, offset, *values]\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in parameters):\n        raise ValueError(\"Calibration inputs must be finite numbers\")\n    try:\n        result = [value * scale + offset for value in values]\n    except OverflowError:\n        raise ValueError(\"Calibration is outside float range\") from None\n    if any(type(value) is float and not math.isfinite(value) for value in result):\n        raise ValueError(\"Calibrated values must be finite\")\n    return result\n\ndef calibrate_records(records, *, scale=1.0, offset=0.0):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    for row in records:\n        if not isinstance(row, dict) or not isinstance(row.get(\"house\"), str) or not row[\"house\"].strip():\n            raise ValueError(\"Every record needs a house name\")\n        value = row.get(\"temperature_c\")\n        if type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)):\n            raise ValueError(\"Every record needs a finite Celsius reading\")\n    adjusted = calibrate([row[\"temperature_c\"] for row in records], scale=scale, offset=offset)\n    return [{**row, \"temperature_c\": value} for row, value in zip(records, adjusted)]\n\ndef calibrated_report(records, *, limit_c, scale=1.0, offset=0.0):\n    adjusted = calibrate_records(records, scale=scale, offset=offset)\n    return make_report(adjusted, limit_c=limit_c)\n\ndef grouped_reports(reports, *, limit_c, scale=1.0, offset=0.0):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    calibrated_report([], limit_c=limit_c, scale=scale, offset=offset)\n    result = {}\n    for name, records in reports.items():\n        if not isinstance(name, str) or not name.strip():\n            raise ValueError(\"A report name must be nonempty text\")\n        result[name] = calibrated_report(records, limit_c=limit_c, scale=scale, offset=offset)\n    return result\n\ndef prepare_reports(reports, policy):\n    if not isinstance(policy, dict) or set(policy) != {\"limit_c\", \"scale\", \"offset\"}:\n        raise ValueError(\"Policy needs exactly limit_c, scale and offset\")\n    return grouped_reports(reports, limit_c=policy[\"limit_c\"],\n                           scale=policy[\"scale\"], offset=policy[\"offset\"])\n\n\ndef numerical_readings(values: list[object]) -> list[float]:\n    result = []\n    for value in values:\n        if type(value) not in (int, float):\n            continue\n        try:\n            converted = float(value)\n        except OverflowError:\n            continue\n        if math.isfinite(converted):\n            result.append(converted)\n    return result\n\ndef usable_records(records):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    result = []\n    for row in records:\n        if not isinstance(row, dict) or not isinstance(row.get(\"house\"), str) or not row[\"house\"].strip():\n            raise ValueError(\"Every record needs a house name\")\n        accepted = numerical_readings([row.get(\"temperature_c\")])\n        if accepted:\n            result.append({**row, \"temperature_c\": accepted[0]})\n    return result\n\ndef permissive_report(records, *, limit_c, scale=1.0, offset=0.0):\n    return calibrated_report(usable_records(records), limit_c=limit_c, scale=scale, offset=offset)\n\n\ndef _limit_float(value):\n    if type(value) not in (int, float):\n        raise ValueError(\"A limit must be numerical\")\n    try:\n        converted = float(value)\n    except OverflowError:\n        raise ValueError(\"A limit is outside float range\") from None\n    if not math.isfinite(converted):\n        raise ValueError(\"A limit must be finite\")\n    return converted\n\ndef resolve_limits(records, default_c):\n    default_c = _limit_float(default_c)\n    result = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each setting needs a dictionary\")\n        value = row.get(\"limit\", default_c)\n        if value is None:\n            result.append(None)\n        else:\n            result.append(_limit_float(value))\n    return result\n\ndef report_with_limits(records, *, default_limit_c, scale=1.0, offset=0.0):\n    adjusted = calibrate_records(usable_records(records), scale=scale, offset=offset)\n    limits = resolve_limits(adjusted, default_limit_c)\n    flags, summaries = [], []\n    for row, limit in zip(adjusted, limits):\n        summary = {\"count\": 0, \"excess_c\": 0.0} if limit is None else summarize_alerts([row[\"temperature_c\"]], limit_c=limit)\n        flags.append(summary[\"count\"])\n        summaries.append(summary)\n    excess = sum((summary[\"excess_c\"] for summary in summaries), 0.0)\n    if not math.isfinite(excess):\n        raise ValueError(\"Total excess must be finite\")\n    return {\"rows\": convert_report(adjusted), \"limits\": limits, \"alerts\": flags,\n            \"count\": sum(flags), \"excess_c\": excess}\n\n\n_UNSET = object()\n\ndef update_limit(config, limit=_UNSET):\n    result = dict(config)\n    if limit is _UNSET:\n        return result\n    if limit is not None and (type(limit) not in (int, float) or (type(limit) is float and not math.isfinite(limit))):\n        raise ValueError(\"limit must be finite or None\")\n    result[\"limit\"] = limit\n    return result\n\n\n@dataclass(frozen=True)\nclass Reading:\n    house: str\n    temperature_c: float\n    def __post_init__(self):\n        if not isinstance(self.house, str) or not self.house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        if type(self.temperature_c) not in (int, float) or (type(self.temperature_c) is float and not math.isfinite(self.temperature_c)):\n            raise ValueError(\"temperature_c must be a finite number\")\n\ndef snapshot_report(records, *, default_limit_c, scale=1.0, offset=0.0):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    snapshots = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each reading needs a record\")\n        reading = Reading(row.get(\"house\"), row.get(\"temperature_c\"))\n        snapshots.append({**row, \"house\": reading.house, \"temperature_c\": reading.temperature_c})\n    return report_with_limits(snapshots, default_limit_c=default_limit_c, scale=scale, offset=offset)\n\n\n@dataclass\nclass Report:\n    house: str\n    tags: list[str] = field(default_factory=list)\n    def __post_init__(self):\n        if not isinstance(self.house, str) or not self.house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        if not isinstance(self.tags, list) or any(not isinstance(tag, str) or not tag.strip() for tag in self.tags):\n            raise ValueError(\"tags must be a list of nonempty strings\")\n        self.tags = self.tags.copy()\n\ndef add_tag(report, note):\n    if not isinstance(note, str) or not note.strip():\n        raise ValueError(\"note must be nonempty text\")\n    report.tags.append(note)\n\ndef annotated_report(records, *, default_limit_c, scale=1.0, offset=0.0, notes=None):\n    numerical = snapshot_report(records, default_limit_c=default_limit_c, scale=scale, offset=offset)\n    supplied = {} if notes is None else notes\n    annotations = [Report(row[\"house\"], supplied.get(row[\"house\"], [])) for row in records]\n    return {\"report\": numerical, \"notes\": [{\"house\": item.house, \"tags\": item.tags} for item in annotations]}\n\n\nclass ReadingSource(Protocol):\n    def read(self) -> list[dict[str, object]]: ...\n\ndef collect_report(source: ReadingSource, *, default_limit_c: float, scale: float = 1.0, offset: float = 0.0) -> dict[str, object]:\n    resolve_limits([], default_limit_c)\n    calibrate([], scale=scale, offset=offset)\n    records = source.read()\n    return annotated_report(records, default_limit_c=default_limit_c, scale=scale, offset=offset)\n\n# Extend the program below\n\nclass ReportSink(Protocol):\n    def send(self, report: dict[str, object]) -> None: ...\n\ndef deliver_report(source: ReadingSource, sink: ReportSink, *, default_limit_c: float, scale: float = 1.0, offset: float = 0.0) -> dict[str, object]:\n    report=collect_report(source,default_limit_c=default_limit_c,scale=scale,offset=offset)\n    sink.send(report)\n    return report\n\n\nimport copy\n\nclass RecordedSource:\n    def __init__(self, records):\n        self.records = records\n        self.calls = 0\n\n    def read(self):\n        return self.records\n\nsource = RecordedSource([\n    {\"house\":\"north\",\"temperature_c\":25},\n    {\"house\":\"south\",\"temperature_c\":30,\"limit\":None},\n])\nresult = collect_report(source, default_limit_c=25)\nprint(result[\"report\"][\"rows\"])\nprint(result[\"report\"][\"alerts\"])\nprint(source.calls)",
        "solution": "import math\nfrom dataclasses import dataclass, field\nfrom typing import Protocol\n\n# Working earlier report helpers\n\n\ndef fahrenheit(temperature_c: float) -> float:\n    if type(temperature_c) not in (int, float) or (type(temperature_c) is float and not math.isfinite(temperature_c)):\n        raise ValueError(\"temperature_c must be a finite number\")\n    try:\n        result = float(temperature_c * 1.8 + 32)\n    except OverflowError:\n        raise ValueError(\"Conversion is outside float range\") from None\n    if not math.isfinite(result):\n        raise ValueError(\"Converted temperature must be finite\")\n    return result\n\ndef convert_report(records):\n    result = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each reading needs a record\")\n        house = row.get(\"house\")\n        if not isinstance(house, str) or not house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        result.append({\"house\": house, \"temperature_f\": fahrenheit(row.get(\"temperature_c\"))})\n    return result\n\ndef format_report(records):\n    rows = convert_report(records)\n    return [f\"{row[\"house\"]}: {row[\"temperature_f\"]:.1f} F\" for row in rows]\n\n\ndef summarize_alerts(readings_c, *, limit_c):\n    \"\"\"Return an inclusive Celsius alert count and total excess.\"\"\"\n    if type(limit_c) not in (int, float) or (type(limit_c) is float and not math.isfinite(limit_c)):\n        raise ValueError(\"limit_c must be finite\")\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in readings_c):\n        raise ValueError(\"Readings must be finite numbers\")\n    alerts = [value for value in readings_c if value >= limit_c]\n    try:\n        excess_c = float(sum(value - limit_c for value in alerts))\n    except OverflowError:\n        raise ValueError(\"Total excess is outside float range\") from None\n    if not math.isfinite(excess_c):\n        raise ValueError(\"Total excess must be finite\")\n    return {\"count\": len(alerts), \"excess_c\": excess_c}\n\ndef make_report(records, *, limit_c):\n    rows = convert_report(records)\n    summary = summarize_alerts([row[\"temperature_c\"] for row in records], limit_c=limit_c)\n    return {\"rows\": rows, **summary}\n\n\ndef calibrate(values, *, scale=1.0, offset=0.0):\n    \"\"\"Return calibrated values without changing the input readings.\"\"\"\n    parameters = [scale, offset, *values]\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in parameters):\n        raise ValueError(\"Calibration inputs must be finite numbers\")\n    try:\n        result = [value * scale + offset for value in values]\n    except OverflowError:\n        raise ValueError(\"Calibration is outside float range\") from None\n    if any(type(value) is float and not math.isfinite(value) for value in result):\n        raise ValueError(\"Calibrated values must be finite\")\n    return result\n\ndef calibrate_records(records, *, scale=1.0, offset=0.0):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    for row in records:\n        if not isinstance(row, dict) or not isinstance(row.get(\"house\"), str) or not row[\"house\"].strip():\n            raise ValueError(\"Every record needs a house name\")\n        value = row.get(\"temperature_c\")\n        if type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)):\n            raise ValueError(\"Every record needs a finite Celsius reading\")\n    adjusted = calibrate([row[\"temperature_c\"] for row in records], scale=scale, offset=offset)\n    return [{**row, \"temperature_c\": value} for row, value in zip(records, adjusted)]\n\ndef calibrated_report(records, *, limit_c, scale=1.0, offset=0.0):\n    adjusted = calibrate_records(records, scale=scale, offset=offset)\n    return make_report(adjusted, limit_c=limit_c)\n\ndef grouped_reports(reports, *, limit_c, scale=1.0, offset=0.0):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    calibrated_report([], limit_c=limit_c, scale=scale, offset=offset)\n    result = {}\n    for name, records in reports.items():\n        if not isinstance(name, str) or not name.strip():\n            raise ValueError(\"A report name must be nonempty text\")\n        result[name] = calibrated_report(records, limit_c=limit_c, scale=scale, offset=offset)\n    return result\n\ndef prepare_reports(reports, policy):\n    if not isinstance(policy, dict) or set(policy) != {\"limit_c\", \"scale\", \"offset\"}:\n        raise ValueError(\"Policy needs exactly limit_c, scale and offset\")\n    return grouped_reports(reports, limit_c=policy[\"limit_c\"],\n                           scale=policy[\"scale\"], offset=policy[\"offset\"])\n\n\ndef numerical_readings(values: list[object]) -> list[float]:\n    result = []\n    for value in values:\n        if type(value) not in (int, float):\n            continue\n        try:\n            converted = float(value)\n        except OverflowError:\n            continue\n        if math.isfinite(converted):\n            result.append(converted)\n    return result\n\ndef usable_records(records):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    result = []\n    for row in records:\n        if not isinstance(row, dict) or not isinstance(row.get(\"house\"), str) or not row[\"house\"].strip():\n            raise ValueError(\"Every record needs a house name\")\n        accepted = numerical_readings([row.get(\"temperature_c\")])\n        if accepted:\n            result.append({**row, \"temperature_c\": accepted[0]})\n    return result\n\ndef permissive_report(records, *, limit_c, scale=1.0, offset=0.0):\n    return calibrated_report(usable_records(records), limit_c=limit_c, scale=scale, offset=offset)\n\n\ndef _limit_float(value):\n    if type(value) not in (int, float):\n        raise ValueError(\"A limit must be numerical\")\n    try:\n        converted = float(value)\n    except OverflowError:\n        raise ValueError(\"A limit is outside float range\") from None\n    if not math.isfinite(converted):\n        raise ValueError(\"A limit must be finite\")\n    return converted\n\ndef resolve_limits(records, default_c):\n    default_c = _limit_float(default_c)\n    result = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each setting needs a dictionary\")\n        value = row.get(\"limit\", default_c)\n        if value is None:\n            result.append(None)\n        else:\n            result.append(_limit_float(value))\n    return result\n\ndef report_with_limits(records, *, default_limit_c, scale=1.0, offset=0.0):\n    adjusted = calibrate_records(usable_records(records), scale=scale, offset=offset)\n    limits = resolve_limits(adjusted, default_limit_c)\n    flags, summaries = [], []\n    for row, limit in zip(adjusted, limits):\n        summary = {\"count\": 0, \"excess_c\": 0.0} if limit is None else summarize_alerts([row[\"temperature_c\"]], limit_c=limit)\n        flags.append(summary[\"count\"])\n        summaries.append(summary)\n    excess = sum((summary[\"excess_c\"] for summary in summaries), 0.0)\n    if not math.isfinite(excess):\n        raise ValueError(\"Total excess must be finite\")\n    return {\"rows\": convert_report(adjusted), \"limits\": limits, \"alerts\": flags,\n            \"count\": sum(flags), \"excess_c\": excess}\n\n\n_UNSET = object()\n\ndef update_limit(config, limit=_UNSET):\n    result = dict(config)\n    if limit is _UNSET:\n        return result\n    if limit is not None and (type(limit) not in (int, float) or (type(limit) is float and not math.isfinite(limit))):\n        raise ValueError(\"limit must be finite or None\")\n    result[\"limit\"] = limit\n    return result\n\n\n@dataclass(frozen=True)\nclass Reading:\n    house: str\n    temperature_c: float\n    def __post_init__(self):\n        if not isinstance(self.house, str) or not self.house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        if type(self.temperature_c) not in (int, float) or (type(self.temperature_c) is float and not math.isfinite(self.temperature_c)):\n            raise ValueError(\"temperature_c must be a finite number\")\n\ndef snapshot_report(records, *, default_limit_c, scale=1.0, offset=0.0):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    snapshots = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each reading needs a record\")\n        reading = Reading(row.get(\"house\"), row.get(\"temperature_c\"))\n        snapshots.append({**row, \"house\": reading.house, \"temperature_c\": reading.temperature_c})\n    return report_with_limits(snapshots, default_limit_c=default_limit_c, scale=scale, offset=offset)\n\n\n@dataclass\nclass Report:\n    house: str\n    tags: list[str] = field(default_factory=list)\n    def __post_init__(self):\n        if not isinstance(self.house, str) or not self.house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        if not isinstance(self.tags, list) or any(not isinstance(tag, str) or not tag.strip() for tag in self.tags):\n            raise ValueError(\"tags must be a list of nonempty strings\")\n        self.tags = self.tags.copy()\n\ndef add_tag(report, note):\n    if not isinstance(note, str) or not note.strip():\n        raise ValueError(\"note must be nonempty text\")\n    report.tags.append(note)\n\ndef annotated_report(records, *, default_limit_c, scale=1.0, offset=0.0, notes=None):\n    numerical = snapshot_report(records, default_limit_c=default_limit_c, scale=scale, offset=offset)\n    supplied = {} if notes is None else notes\n    annotations = [Report(row[\"house\"], supplied.get(row[\"house\"], [])) for row in records]\n    return {\"report\": numerical, \"notes\": [{\"house\": item.house, \"tags\": item.tags} for item in annotations]}\n\n\nclass ReadingSource(Protocol):\n    def read(self) -> list[dict[str, object]]: ...\n\ndef collect_report(source: ReadingSource, *, default_limit_c: float, scale: float = 1.0, offset: float = 0.0) -> dict[str, object]:\n    resolve_limits([], default_limit_c)\n    calibrate([], scale=scale, offset=offset)\n    records = source.read()\n    return annotated_report(records, default_limit_c=default_limit_c, scale=scale, offset=offset)\n\n# Extend the program below\n\nclass ReportSink(Protocol):\n    def send(self, report: dict[str, object]) -> None: ...\n\ndef deliver_report(source: ReadingSource, sink: ReportSink, *, default_limit_c: float, scale: float = 1.0, offset: float = 0.0) -> dict[str, object]:\n    report=collect_report(source,default_limit_c=default_limit_c,scale=scale,offset=offset)\n    sink.send(report)\n    return report\n\n\nimport copy\n\nclass RecordedSource:\n    def __init__(self, records):\n        self.records = copy.deepcopy(records)\n        self.calls = 0\n\n    def read(self):\n        self.calls += 1\n        return copy.deepcopy(self.records)\n\nsource = RecordedSource([\n    {\"house\":\"north\",\"temperature_c\":25},\n    {\"house\":\"south\",\"temperature_c\":30,\"limit\":None},\n])\nresult = collect_report(source, default_limit_c=25)\nprint(result[\"report\"][\"rows\"])\nprint(result[\"report\"][\"alerts\"])\nprint(source.calls)",
        "output": "[{'house': 'north', 'temperature_f': 77.0}, {'house': 'south', 'temperature_f': 86.0}]\n[1, 0]\n1",
        "hints": [
          "The existing collector receives named records and returns a complete report-and-notes payload.",
          "An outer list copy alone would still share the record dictionaries and their nested values."
        ],
        "tests": [
          {
            "name": "Actual collection and optional limits",
            "code": "source = RecordedSource([\n    {\"house\":\"zero\",\"temperature_c\":0,\"limit\":0},\n    {\"house\":\"disabled\",\"temperature_c\":30,\"limit\":None},\n])\nresult = collect_report(source, default_limit_c=25)\nassert result[\"report\"][\"alerts\"] == [1,0] and result[\"report\"][\"count\"] == 1\nassert [row[\"house\"] for row in result[\"report\"][\"rows\"]] == [\"zero\",\"disabled\"]\nassert source.calls == 1"
          },
          {
            "name": "Snapshot and returned records are independent",
            "code": "original = [{\"house\":\"north\",\"temperature_c\":20,\"metadata\":{\"tags\":[\"kept\"]}}]\nsource = RecordedSource(original)\noriginal[0][\"temperature_c\"] = 99\nfirst = source.read()\nfirst[0][\"metadata\"][\"tags\"].append(\"changed\")\nfirst[0][\"temperature_c\"] = -1\nsecond = source.read()\nassert second == [{\"house\":\"north\",\"temperature_c\":20,\"metadata\":{\"tags\":[\"kept\"]}}]\nassert source.calls == 2"
          },
          {
            "name": "Earlier policy validation precedes the read",
            "code": "source = RecordedSource([{\"house\":\"north\",\"temperature_c\":20}])\ntry:\n    collect_report(source, default_limit_c=float(\"nan\"))\nexcept ValueError:\n    pass\nelse:\n    raise AssertionError(\"Invalid default accepted\")\nassert source.calls == 0"
          },
          {
            "name": "Calibration and empty result remain available",
            "code": "source = RecordedSource([{\"house\":\"lab\",\"temperature_c\":14}])\nresult = collect_report(source, default_limit_c=20, scale=2, offset=-1)\nassert result[\"report\"][\"alerts\"] == [1]\nassert result[\"report\"][\"rows\"] == [{\"house\":\"lab\",\"temperature_f\":80.6}]\nassert collect_report(RecordedSource([]), default_limit_c=0)[\"report\"][\"count\"] == 0"
          }
        ],
        "continuation": {
          "lesson": "/concepts/python-composition",
          "exercise": 0,
          "summary": "Retain the actual collect_report program, including named records, calibration, optional per-record limits and notes; replace only its source with a controlled recording fixture."
        },
        "editTarget": "class RecordedSource:"
      },
      {
        "title": "Observe a complete-report delivery failure",
        "question": "What if the destination accepted the complete report before the caller saw an error?",
        "task": [
          "Keep the actual deliver_report coordinator and the recording named-record source. The sink receives one complete report-and-notes payload, rather than one send per temperature. Extend RecordingSink with mode=\"ok\", \"before\" or \"after\"; reject other modes with ValueError.",
          "Increment calls on each attempt. In before mode raise OSError before accepting the payload. Otherwise store a deep copy in sent; after mode then raises OSError, modeling acceptance without a successful acknowledgment. Never retry in deliver_report. Earlier acceptance cannot be promised undone. Print the demonstration outcome, accepted-payload count, attempt count and retained alert flags. All effects are local."
        ],
        "starter": "import math\nfrom dataclasses import dataclass, field\nfrom typing import Protocol\n\n# Working earlier report helpers\n\n\ndef fahrenheit(temperature_c: float) -> float:\n    if type(temperature_c) not in (int, float) or (type(temperature_c) is float and not math.isfinite(temperature_c)):\n        raise ValueError(\"temperature_c must be a finite number\")\n    try:\n        result = float(temperature_c * 1.8 + 32)\n    except OverflowError:\n        raise ValueError(\"Conversion is outside float range\") from None\n    if not math.isfinite(result):\n        raise ValueError(\"Converted temperature must be finite\")\n    return result\n\ndef convert_report(records):\n    result = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each reading needs a record\")\n        house = row.get(\"house\")\n        if not isinstance(house, str) or not house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        result.append({\"house\": house, \"temperature_f\": fahrenheit(row.get(\"temperature_c\"))})\n    return result\n\ndef format_report(records):\n    rows = convert_report(records)\n    return [f\"{row[\"house\"]}: {row[\"temperature_f\"]:.1f} F\" for row in rows]\n\n\ndef summarize_alerts(readings_c, *, limit_c):\n    \"\"\"Return an inclusive Celsius alert count and total excess.\"\"\"\n    if type(limit_c) not in (int, float) or (type(limit_c) is float and not math.isfinite(limit_c)):\n        raise ValueError(\"limit_c must be finite\")\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in readings_c):\n        raise ValueError(\"Readings must be finite numbers\")\n    alerts = [value for value in readings_c if value >= limit_c]\n    try:\n        excess_c = float(sum(value - limit_c for value in alerts))\n    except OverflowError:\n        raise ValueError(\"Total excess is outside float range\") from None\n    if not math.isfinite(excess_c):\n        raise ValueError(\"Total excess must be finite\")\n    return {\"count\": len(alerts), \"excess_c\": excess_c}\n\ndef make_report(records, *, limit_c):\n    rows = convert_report(records)\n    summary = summarize_alerts([row[\"temperature_c\"] for row in records], limit_c=limit_c)\n    return {\"rows\": rows, **summary}\n\n\ndef calibrate(values, *, scale=1.0, offset=0.0):\n    \"\"\"Return calibrated values without changing the input readings.\"\"\"\n    parameters = [scale, offset, *values]\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in parameters):\n        raise ValueError(\"Calibration inputs must be finite numbers\")\n    try:\n        result = [value * scale + offset for value in values]\n    except OverflowError:\n        raise ValueError(\"Calibration is outside float range\") from None\n    if any(type(value) is float and not math.isfinite(value) for value in result):\n        raise ValueError(\"Calibrated values must be finite\")\n    return result\n\ndef calibrate_records(records, *, scale=1.0, offset=0.0):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    for row in records:\n        if not isinstance(row, dict) or not isinstance(row.get(\"house\"), str) or not row[\"house\"].strip():\n            raise ValueError(\"Every record needs a house name\")\n        value = row.get(\"temperature_c\")\n        if type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)):\n            raise ValueError(\"Every record needs a finite Celsius reading\")\n    adjusted = calibrate([row[\"temperature_c\"] for row in records], scale=scale, offset=offset)\n    return [{**row, \"temperature_c\": value} for row, value in zip(records, adjusted)]\n\ndef calibrated_report(records, *, limit_c, scale=1.0, offset=0.0):\n    adjusted = calibrate_records(records, scale=scale, offset=offset)\n    return make_report(adjusted, limit_c=limit_c)\n\ndef grouped_reports(reports, *, limit_c, scale=1.0, offset=0.0):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    calibrated_report([], limit_c=limit_c, scale=scale, offset=offset)\n    result = {}\n    for name, records in reports.items():\n        if not isinstance(name, str) or not name.strip():\n            raise ValueError(\"A report name must be nonempty text\")\n        result[name] = calibrated_report(records, limit_c=limit_c, scale=scale, offset=offset)\n    return result\n\ndef prepare_reports(reports, policy):\n    if not isinstance(policy, dict) or set(policy) != {\"limit_c\", \"scale\", \"offset\"}:\n        raise ValueError(\"Policy needs exactly limit_c, scale and offset\")\n    return grouped_reports(reports, limit_c=policy[\"limit_c\"],\n                           scale=policy[\"scale\"], offset=policy[\"offset\"])\n\n\ndef numerical_readings(values: list[object]) -> list[float]:\n    result = []\n    for value in values:\n        if type(value) not in (int, float):\n            continue\n        try:\n            converted = float(value)\n        except OverflowError:\n            continue\n        if math.isfinite(converted):\n            result.append(converted)\n    return result\n\ndef usable_records(records):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    result = []\n    for row in records:\n        if not isinstance(row, dict) or not isinstance(row.get(\"house\"), str) or not row[\"house\"].strip():\n            raise ValueError(\"Every record needs a house name\")\n        accepted = numerical_readings([row.get(\"temperature_c\")])\n        if accepted:\n            result.append({**row, \"temperature_c\": accepted[0]})\n    return result\n\ndef permissive_report(records, *, limit_c, scale=1.0, offset=0.0):\n    return calibrated_report(usable_records(records), limit_c=limit_c, scale=scale, offset=offset)\n\n\ndef _limit_float(value):\n    if type(value) not in (int, float):\n        raise ValueError(\"A limit must be numerical\")\n    try:\n        converted = float(value)\n    except OverflowError:\n        raise ValueError(\"A limit is outside float range\") from None\n    if not math.isfinite(converted):\n        raise ValueError(\"A limit must be finite\")\n    return converted\n\ndef resolve_limits(records, default_c):\n    default_c = _limit_float(default_c)\n    result = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each setting needs a dictionary\")\n        value = row.get(\"limit\", default_c)\n        if value is None:\n            result.append(None)\n        else:\n            result.append(_limit_float(value))\n    return result\n\ndef report_with_limits(records, *, default_limit_c, scale=1.0, offset=0.0):\n    adjusted = calibrate_records(usable_records(records), scale=scale, offset=offset)\n    limits = resolve_limits(adjusted, default_limit_c)\n    flags, summaries = [], []\n    for row, limit in zip(adjusted, limits):\n        summary = {\"count\": 0, \"excess_c\": 0.0} if limit is None else summarize_alerts([row[\"temperature_c\"]], limit_c=limit)\n        flags.append(summary[\"count\"])\n        summaries.append(summary)\n    excess = sum((summary[\"excess_c\"] for summary in summaries), 0.0)\n    if not math.isfinite(excess):\n        raise ValueError(\"Total excess must be finite\")\n    return {\"rows\": convert_report(adjusted), \"limits\": limits, \"alerts\": flags,\n            \"count\": sum(flags), \"excess_c\": excess}\n\n\n_UNSET = object()\n\ndef update_limit(config, limit=_UNSET):\n    result = dict(config)\n    if limit is _UNSET:\n        return result\n    if limit is not None and (type(limit) not in (int, float) or (type(limit) is float and not math.isfinite(limit))):\n        raise ValueError(\"limit must be finite or None\")\n    result[\"limit\"] = limit\n    return result\n\n\n@dataclass(frozen=True)\nclass Reading:\n    house: str\n    temperature_c: float\n    def __post_init__(self):\n        if not isinstance(self.house, str) or not self.house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        if type(self.temperature_c) not in (int, float) or (type(self.temperature_c) is float and not math.isfinite(self.temperature_c)):\n            raise ValueError(\"temperature_c must be a finite number\")\n\ndef snapshot_report(records, *, default_limit_c, scale=1.0, offset=0.0):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    snapshots = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each reading needs a record\")\n        reading = Reading(row.get(\"house\"), row.get(\"temperature_c\"))\n        snapshots.append({**row, \"house\": reading.house, \"temperature_c\": reading.temperature_c})\n    return report_with_limits(snapshots, default_limit_c=default_limit_c, scale=scale, offset=offset)\n\n\n@dataclass\nclass Report:\n    house: str\n    tags: list[str] = field(default_factory=list)\n    def __post_init__(self):\n        if not isinstance(self.house, str) or not self.house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        if not isinstance(self.tags, list) or any(not isinstance(tag, str) or not tag.strip() for tag in self.tags):\n            raise ValueError(\"tags must be a list of nonempty strings\")\n        self.tags = self.tags.copy()\n\ndef add_tag(report, note):\n    if not isinstance(note, str) or not note.strip():\n        raise ValueError(\"note must be nonempty text\")\n    report.tags.append(note)\n\ndef annotated_report(records, *, default_limit_c, scale=1.0, offset=0.0, notes=None):\n    numerical = snapshot_report(records, default_limit_c=default_limit_c, scale=scale, offset=offset)\n    supplied = {} if notes is None else notes\n    annotations = [Report(row[\"house\"], supplied.get(row[\"house\"], [])) for row in records]\n    return {\"report\": numerical, \"notes\": [{\"house\": item.house, \"tags\": item.tags} for item in annotations]}\n\n\nclass ReadingSource(Protocol):\n    def read(self) -> list[dict[str, object]]: ...\n\ndef collect_report(source: ReadingSource, *, default_limit_c: float, scale: float = 1.0, offset: float = 0.0) -> dict[str, object]:\n    resolve_limits([], default_limit_c)\n    calibrate([], scale=scale, offset=offset)\n    records = source.read()\n    return annotated_report(records, default_limit_c=default_limit_c, scale=scale, offset=offset)\n\n# Extend the program below\n\nclass ReportSink(Protocol):\n    def send(self, report: dict[str, object]) -> None: ...\n\ndef deliver_report(source: ReadingSource, sink: ReportSink, *, default_limit_c: float, scale: float = 1.0, offset: float = 0.0) -> dict[str, object]:\n    report=collect_report(source,default_limit_c=default_limit_c,scale=scale,offset=offset)\n    sink.send(report)\n    return report\n\n\nimport copy\n\nclass RecordedSource:\n    def __init__(self, records):\n        self.records = copy.deepcopy(records)\n        self.calls = 0\n\n    def read(self):\n        self.calls += 1\n        return copy.deepcopy(self.records)\n\nclass RecordingSink:\n    def __init__(self, *, mode=\"ok\"):\n        self.mode = mode\n        self.sent = []\n        self.calls = 0\n\n    def send(self, report):\n        self.calls += 1\n        self.sent.append(report)\n\nsource = RecordedSource([\n    {\"house\":\"north\",\"temperature_c\":0},\n    {\"house\":\"south\",\"temperature_c\":20},\n])\nsink = RecordingSink(mode=\"after\")\ntry:\n    deliver_report(source, sink, default_limit_c=15)\nexcept OSError:\n    print(\"Delivery outcome needs review\")\nprint(len(sink.sent))\nprint(sink.calls)\nprint(sink.sent[0][\"report\"][\"alerts\"])",
        "solution": "import math\nfrom dataclasses import dataclass, field\nfrom typing import Protocol\n\n# Working earlier report helpers\n\n\ndef fahrenheit(temperature_c: float) -> float:\n    if type(temperature_c) not in (int, float) or (type(temperature_c) is float and not math.isfinite(temperature_c)):\n        raise ValueError(\"temperature_c must be a finite number\")\n    try:\n        result = float(temperature_c * 1.8 + 32)\n    except OverflowError:\n        raise ValueError(\"Conversion is outside float range\") from None\n    if not math.isfinite(result):\n        raise ValueError(\"Converted temperature must be finite\")\n    return result\n\ndef convert_report(records):\n    result = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each reading needs a record\")\n        house = row.get(\"house\")\n        if not isinstance(house, str) or not house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        result.append({\"house\": house, \"temperature_f\": fahrenheit(row.get(\"temperature_c\"))})\n    return result\n\ndef format_report(records):\n    rows = convert_report(records)\n    return [f\"{row[\"house\"]}: {row[\"temperature_f\"]:.1f} F\" for row in rows]\n\n\ndef summarize_alerts(readings_c, *, limit_c):\n    \"\"\"Return an inclusive Celsius alert count and total excess.\"\"\"\n    if type(limit_c) not in (int, float) or (type(limit_c) is float and not math.isfinite(limit_c)):\n        raise ValueError(\"limit_c must be finite\")\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in readings_c):\n        raise ValueError(\"Readings must be finite numbers\")\n    alerts = [value for value in readings_c if value >= limit_c]\n    try:\n        excess_c = float(sum(value - limit_c for value in alerts))\n    except OverflowError:\n        raise ValueError(\"Total excess is outside float range\") from None\n    if not math.isfinite(excess_c):\n        raise ValueError(\"Total excess must be finite\")\n    return {\"count\": len(alerts), \"excess_c\": excess_c}\n\ndef make_report(records, *, limit_c):\n    rows = convert_report(records)\n    summary = summarize_alerts([row[\"temperature_c\"] for row in records], limit_c=limit_c)\n    return {\"rows\": rows, **summary}\n\n\ndef calibrate(values, *, scale=1.0, offset=0.0):\n    \"\"\"Return calibrated values without changing the input readings.\"\"\"\n    parameters = [scale, offset, *values]\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in parameters):\n        raise ValueError(\"Calibration inputs must be finite numbers\")\n    try:\n        result = [value * scale + offset for value in values]\n    except OverflowError:\n        raise ValueError(\"Calibration is outside float range\") from None\n    if any(type(value) is float and not math.isfinite(value) for value in result):\n        raise ValueError(\"Calibrated values must be finite\")\n    return result\n\ndef calibrate_records(records, *, scale=1.0, offset=0.0):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    for row in records:\n        if not isinstance(row, dict) or not isinstance(row.get(\"house\"), str) or not row[\"house\"].strip():\n            raise ValueError(\"Every record needs a house name\")\n        value = row.get(\"temperature_c\")\n        if type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)):\n            raise ValueError(\"Every record needs a finite Celsius reading\")\n    adjusted = calibrate([row[\"temperature_c\"] for row in records], scale=scale, offset=offset)\n    return [{**row, \"temperature_c\": value} for row, value in zip(records, adjusted)]\n\ndef calibrated_report(records, *, limit_c, scale=1.0, offset=0.0):\n    adjusted = calibrate_records(records, scale=scale, offset=offset)\n    return make_report(adjusted, limit_c=limit_c)\n\ndef grouped_reports(reports, *, limit_c, scale=1.0, offset=0.0):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    calibrated_report([], limit_c=limit_c, scale=scale, offset=offset)\n    result = {}\n    for name, records in reports.items():\n        if not isinstance(name, str) or not name.strip():\n            raise ValueError(\"A report name must be nonempty text\")\n        result[name] = calibrated_report(records, limit_c=limit_c, scale=scale, offset=offset)\n    return result\n\ndef prepare_reports(reports, policy):\n    if not isinstance(policy, dict) or set(policy) != {\"limit_c\", \"scale\", \"offset\"}:\n        raise ValueError(\"Policy needs exactly limit_c, scale and offset\")\n    return grouped_reports(reports, limit_c=policy[\"limit_c\"],\n                           scale=policy[\"scale\"], offset=policy[\"offset\"])\n\n\ndef numerical_readings(values: list[object]) -> list[float]:\n    result = []\n    for value in values:\n        if type(value) not in (int, float):\n            continue\n        try:\n            converted = float(value)\n        except OverflowError:\n            continue\n        if math.isfinite(converted):\n            result.append(converted)\n    return result\n\ndef usable_records(records):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    result = []\n    for row in records:\n        if not isinstance(row, dict) or not isinstance(row.get(\"house\"), str) or not row[\"house\"].strip():\n            raise ValueError(\"Every record needs a house name\")\n        accepted = numerical_readings([row.get(\"temperature_c\")])\n        if accepted:\n            result.append({**row, \"temperature_c\": accepted[0]})\n    return result\n\ndef permissive_report(records, *, limit_c, scale=1.0, offset=0.0):\n    return calibrated_report(usable_records(records), limit_c=limit_c, scale=scale, offset=offset)\n\n\ndef _limit_float(value):\n    if type(value) not in (int, float):\n        raise ValueError(\"A limit must be numerical\")\n    try:\n        converted = float(value)\n    except OverflowError:\n        raise ValueError(\"A limit is outside float range\") from None\n    if not math.isfinite(converted):\n        raise ValueError(\"A limit must be finite\")\n    return converted\n\ndef resolve_limits(records, default_c):\n    default_c = _limit_float(default_c)\n    result = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each setting needs a dictionary\")\n        value = row.get(\"limit\", default_c)\n        if value is None:\n            result.append(None)\n        else:\n            result.append(_limit_float(value))\n    return result\n\ndef report_with_limits(records, *, default_limit_c, scale=1.0, offset=0.0):\n    adjusted = calibrate_records(usable_records(records), scale=scale, offset=offset)\n    limits = resolve_limits(adjusted, default_limit_c)\n    flags, summaries = [], []\n    for row, limit in zip(adjusted, limits):\n        summary = {\"count\": 0, \"excess_c\": 0.0} if limit is None else summarize_alerts([row[\"temperature_c\"]], limit_c=limit)\n        flags.append(summary[\"count\"])\n        summaries.append(summary)\n    excess = sum((summary[\"excess_c\"] for summary in summaries), 0.0)\n    if not math.isfinite(excess):\n        raise ValueError(\"Total excess must be finite\")\n    return {\"rows\": convert_report(adjusted), \"limits\": limits, \"alerts\": flags,\n            \"count\": sum(flags), \"excess_c\": excess}\n\n\n_UNSET = object()\n\ndef update_limit(config, limit=_UNSET):\n    result = dict(config)\n    if limit is _UNSET:\n        return result\n    if limit is not None and (type(limit) not in (int, float) or (type(limit) is float and not math.isfinite(limit))):\n        raise ValueError(\"limit must be finite or None\")\n    result[\"limit\"] = limit\n    return result\n\n\n@dataclass(frozen=True)\nclass Reading:\n    house: str\n    temperature_c: float\n    def __post_init__(self):\n        if not isinstance(self.house, str) or not self.house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        if type(self.temperature_c) not in (int, float) or (type(self.temperature_c) is float and not math.isfinite(self.temperature_c)):\n            raise ValueError(\"temperature_c must be a finite number\")\n\ndef snapshot_report(records, *, default_limit_c, scale=1.0, offset=0.0):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    snapshots = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each reading needs a record\")\n        reading = Reading(row.get(\"house\"), row.get(\"temperature_c\"))\n        snapshots.append({**row, \"house\": reading.house, \"temperature_c\": reading.temperature_c})\n    return report_with_limits(snapshots, default_limit_c=default_limit_c, scale=scale, offset=offset)\n\n\n@dataclass\nclass Report:\n    house: str\n    tags: list[str] = field(default_factory=list)\n    def __post_init__(self):\n        if not isinstance(self.house, str) or not self.house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        if not isinstance(self.tags, list) or any(not isinstance(tag, str) or not tag.strip() for tag in self.tags):\n            raise ValueError(\"tags must be a list of nonempty strings\")\n        self.tags = self.tags.copy()\n\ndef add_tag(report, note):\n    if not isinstance(note, str) or not note.strip():\n        raise ValueError(\"note must be nonempty text\")\n    report.tags.append(note)\n\ndef annotated_report(records, *, default_limit_c, scale=1.0, offset=0.0, notes=None):\n    numerical = snapshot_report(records, default_limit_c=default_limit_c, scale=scale, offset=offset)\n    supplied = {} if notes is None else notes\n    annotations = [Report(row[\"house\"], supplied.get(row[\"house\"], [])) for row in records]\n    return {\"report\": numerical, \"notes\": [{\"house\": item.house, \"tags\": item.tags} for item in annotations]}\n\n\nclass ReadingSource(Protocol):\n    def read(self) -> list[dict[str, object]]: ...\n\ndef collect_report(source: ReadingSource, *, default_limit_c: float, scale: float = 1.0, offset: float = 0.0) -> dict[str, object]:\n    resolve_limits([], default_limit_c)\n    calibrate([], scale=scale, offset=offset)\n    records = source.read()\n    return annotated_report(records, default_limit_c=default_limit_c, scale=scale, offset=offset)\n\n# Extend the program below\n\nclass ReportSink(Protocol):\n    def send(self, report: dict[str, object]) -> None: ...\n\ndef deliver_report(source: ReadingSource, sink: ReportSink, *, default_limit_c: float, scale: float = 1.0, offset: float = 0.0) -> dict[str, object]:\n    report=collect_report(source,default_limit_c=default_limit_c,scale=scale,offset=offset)\n    sink.send(report)\n    return report\n\n\nimport copy\n\nclass RecordedSource:\n    def __init__(self, records):\n        self.records = copy.deepcopy(records)\n        self.calls = 0\n\n    def read(self):\n        self.calls += 1\n        return copy.deepcopy(self.records)\n\nclass RecordingSink:\n    def __init__(self, *, mode=\"ok\"):\n        if mode not in (\"ok\", \"before\", \"after\"):\n            raise ValueError(\"Use ok, before or after\")\n        self.mode = mode\n        self.sent = []\n        self.calls = 0\n\n    def send(self, report):\n        self.calls += 1\n        if self.mode == \"before\":\n            raise OSError(\"Simulated rejection before acceptance\")\n        self.sent.append(copy.deepcopy(report))\n        if self.mode == \"after\":\n            raise OSError(\"Simulated failure after acceptance\")\n\nsource = RecordedSource([\n    {\"house\":\"north\",\"temperature_c\":0},\n    {\"house\":\"south\",\"temperature_c\":20},\n])\nsink = RecordingSink(mode=\"after\")\ntry:\n    deliver_report(source, sink, default_limit_c=15)\nexcept OSError:\n    print(\"Delivery outcome needs review\")\nprint(len(sink.sent))\nprint(sink.calls)\nprint(sink.sent[0][\"report\"][\"alerts\"])",
        "output": "Delivery outcome needs review\n1\n1\n[0, 1]",
        "hints": [
          "The retained coordinator sends the complete payload once. Do not turn it back into per-reading sends.",
          "A raised error does not prove nothing was accepted. Record acceptance separately from the caller's observed outcome."
        ],
        "tests": [
          {
            "name": "Successful complete payload",
            "code": "source = RecordedSource([{\"house\":\"north\",\"temperature_c\":25}])\nsink = RecordingSink()\nresult = deliver_report(source, sink, default_limit_c=25)\nassert sink.calls == 1 and source.calls == 1 and len(sink.sent) == 1\nassert sink.sent[0] == result and result[\"report\"][\"alerts\"] == [1]\nresult[\"report\"][\"rows\"][0][\"house\"] = \"changed\"\nassert sink.sent[0][\"report\"][\"rows\"][0][\"house\"] == \"north\""
          },
          {
            "name": "Failure before acceptance",
            "code": "source = RecordedSource([{\"house\":\"north\",\"temperature_c\":20}])\nsink = RecordingSink(mode=\"before\")\ntry:\n    deliver_report(source, sink, default_limit_c=15)\nexcept OSError:\n    pass\nelse:\n    raise AssertionError(\"Simulated rejection missing\")\nassert sink.calls == 1 and sink.sent == []"
          },
          {
            "name": "Acceptance followed by error is not retried",
            "code": "source = RecordedSource([{\"house\":\"north\",\"temperature_c\":20}])\nsink = RecordingSink(mode=\"after\")\ntry:\n    deliver_report(source, sink, default_limit_c=15)\nexcept OSError:\n    pass\nelse:\n    raise AssertionError(\"Ambiguous outcome hidden\")\nassert sink.calls == 1 and len(sink.sent) == 1\nassert sink.sent[0][\"report\"][\"alerts\"] == [1]"
          },
          {
            "name": "Bad records still prevent every send",
            "code": "source = RecordedSource([{\"house\":\"north\",\"temperature_c\":True}])\nsink = RecordingSink()\ntry:\n    deliver_report(source, sink, default_limit_c=15)\nexcept ValueError:\n    pass\nelse:\n    raise AssertionError(\"Invalid record accepted\")\nassert sink.calls == 0 and sink.sent == []"
          }
        ],
        "continuation": {
          "lesson": "/concepts/python-test-doubles",
          "exercise": 0,
          "summary": "Keep collect_report's named-record source and the earlier deliver_report coordinator; add a sink that separates acceptance from acknowledgment for one complete payload."
        },
        "editTarget": "class RecordingSink:"
      }
    ],
    "build": {
      "title": "Collect the requested named-record batches",
      "problem": "Botie's supplied source fixtures return named Celsius records, including any per-record limit field.",
      "challenge": "Look up each requested source batch and combine them in request order. Keep every record field and repeated request intact.",
      "sources": {
        "houses": "Requested source names",
        "batches": "Controlled named-record batches"
      },
      "cases": [
        {
          "name": "Two recorded sources",
          "data": {
            "houses": [
              "north",
              "south"
            ],
            "batches": {
              "north": [
                {
                  "house": "north",
                  "temperature_c": 18
                }
              ],
              "south": [
                {
                  "house": "south",
                  "temperature_c": 25,
                  "limit": null
                }
              ]
            }
          },
          "expected": [
            {
              "house": "north",
              "temperature_c": 18
            },
            {
              "house": "south",
              "temperature_c": 25,
              "limit": null
            }
          ]
        },
        {
          "name": "Request order changes",
          "data": {
            "houses": [
              "south",
              "north"
            ],
            "batches": {
              "north": [
                {
                  "house": "north",
                  "temperature_c": 0
                }
              ],
              "south": [
                {
                  "house": "south",
                  "temperature_c": 5
                },
                {
                  "house": "south",
                  "temperature_c": 5
                }
              ]
            }
          },
          "expected": [
            {
              "house": "south",
              "temperature_c": 5
            },
            {
              "house": "south",
              "temperature_c": 5
            },
            {
              "house": "north",
              "temperature_c": 0
            }
          ]
        },
        {
          "name": "No requested source",
          "data": {
            "houses": [],
            "batches": {}
          },
          "expected": []
        }
      ],
      "recipe": {
        "op": "pyProjectFlatten",
        "inputs": [
          {
            "op": "pyProjectLookup",
            "inputs": [
              {
                "source": "houses"
              },
              {
                "source": "batches"
              }
            ]
          }
        ]
      },
      "why": "The source preparation preserves the records the actual collector expects, rather than stripping names or optional settings.",
      "limitation": "The lookup is a controlled input fixture. The floor does not execute collect_report, contact a device or promise complete-report delivery.",
      "extras": [
        "constant",
        "add",
        "multiply",
        "total",
        "count"
      ],
      "draftVersion": 1
    },
    "journey": {
      "premise": "The complete report program needs stable named-record inputs during a test.",
      "order": "investigate-first",
      "construction": {
        "title": "Keep the source contract while changing fixtures",
        "start": "Retrieve each recorded batch by source name, then combine its named records without removing fields.",
        "outcome": "The prepared input still carries house identity, Celsius values and optional limits.",
        "hints": [
          "Look up whole record lists instead of extracting bare temperatures.",
          "Combine the selected batches in request order without deduplicating records."
        ]
      },
      "investigation": {
        "title": "South is requested before north. Which source's records should appear first?",
        "caseIndex": 1,
        "kind": "diagnose",
        "question": "South is requested before north. Which source's records should appear first?",
        "options": [
          {
            "label": "south",
            "feedback": "The records follow the current source request order.",
            "correct": true
          },
          {
            "label": "north because it came first previously",
            "feedback": "That retains an old order rather than using the current input."
          }
        ],
        "outcome": "Repeated measurements and per-record limit fields remain attached to their records."
      },
      "connections": [
        {
          "lessonId": "python-composition",
          "skill": "Retain the actual ReadingSource contract",
          "why": "The collector expects named Celsius records and builds its complete report from them."
        },
        {
          "lessonId": "python-testing",
          "skill": "Control test input independently",
          "why": "A fixed source fixture makes the expected preparation repeatable."
        }
      ],
      "reflection": {
        "prompt": "What must a real integration check establish beyond this controlled fixture?",
        "carryForward": "Change the test source without changing the report program's data agreement."
      }
    },
    "fresh": {
      "name": "A named-record source is requested twice",
      "prompt": "Collect north, north and south in that order. Keep the repeated named north record, including its explicit disabled limit, instead of reducing it to an unnamed temperature.",
      "data": {
        "houses": [
          "north",
          "north",
          "south"
        ],
        "batches": {
          "north": [
            {
              "house": "north",
              "temperature_c": 24,
              "limit": null
            }
          ],
          "south": []
        }
      },
      "expected": [
        {
          "house": "north",
          "temperature_c": 24,
          "limit": null
        },
        {
          "house": "north",
          "temperature_c": 24,
          "limit": null
        }
      ],
      "why": "Repeated requests remain separate record positions. A later cache may reduce source calls while preserving those records and their optional settings."
    }
  },
  {
    "section": "Python Testing and Project Tools",
    "id": "python-modules",
    "title": "Modules and Project Structure",
    "topic": "Organizing a project",
    "blurb": "Modules give related code a clear home. Explicit imports and a separate entry point let us reuse a calculation without also starting file reads or service connections.",
    "openingTitle": "Importing a Helper Started the Whole Report",
    "opening": [
      "Botie moves a useful calculation into report.py. Another script imports it, and the import also opens the default file and prints a report. Reusing the helper now starts unrelated application work.",
      "The module should expose behavior its callers need. Choosing inputs and deciding to run the application can remain explicit actions."
    ],
    "prerequisites": [
      {
        "title": "Function design",
        "href": "/concepts/python-function-design"
      },
      {
        "title": "Controlled dependencies",
        "href": "/concepts/python-test-doubles"
      }
    ],
    "outputLabel": "Distinct direct dependencies in first-use order",
    "checkpointTitle": "Questions on Parts 1 and 2",
    "history": {
      "title": "Python Module Namespaces and PEP 328",
      "sources": [
        {
          "title": "Python modules tutorial",
          "url": "https://docs.python.org/3.14/tutorial/modules.html"
        },
        {
          "title": "PEP 328: imports",
          "url": "https://peps.python.org/pep-0328/"
        },
        {
          "title": "PyPA: src layout versus flat layout",
          "url": "https://packaging.python.org/en/latest/discussions/src-layout-vs-flat-layout/"
        }
      ],
      "blocks": [
        "Splitting a program into files creates a naming problem: which module does an import identify, and which names should it expose? Python's module system gives each module its own namespace while allowing another module to import the behavior it needs.",
        "PEP 328, created in 2003, addressed ambiguity between modules within a package and modules elsewhere on the import path. Absolute imports and explicit relative imports express different relationships. This was a documented development in Python's import rules, rather than an invention of modular programming."
      ]
    },
    "diagram": {
      "title": "Keep entry-point work above the calculation",
      "explanation": "The command layer depends on a calculation; the calculation does not need to import the command layer.",
      "rows": [],
      "scene": {
        "kind": "table",
        "rowHeading": "Module",
        "columns": [
          "Imports",
          "Responsibility"
        ],
        "records": [
          {
            "label": "cli",
            "cells": [
              "io, summary",
              "Choose inputs and display output"
            ]
          },
          {
            "label": "io",
            "cells": [
              "csv",
              "Read the file format"
            ]
          },
          {
            "label": "summary",
            "cells": [
              "statistics",
              "Calculate from supplied values"
            ]
          }
        ],
        "caption": "Invented report modules. Import relationships are not execution durations."
      }
    },
    "parts": [
      {
        "title": "A module owns a namespace",
        "paragraphs": [
          "A Python file can be imported as a module. Its namespace contains named objects such as functions and constants. import statistics lets the caller use statistics.mean without copying its implementation. An explicit from import can also be clear when the imported name's origin is apparent.",
          "Avoid wildcard imports in ordinary application code. They hide which module supplied a name and can overwrite another name."
        ],
        "interpretation": [],
        "examples": [
          {
            "title": "Import an explicit calculation",
            "paragraphs": [
              "The caller supplies values rather than allowing the function to choose a file."
            ],
            "code": "import statistics\n\ndef summarize(values):\n    return {\"count\": len(values), \"mean\": statistics.mean(values)}\n\nprint(summarize([6, 10, 14]))",
            "output": "{'count': 3, 'mean': 10}",
            "interpretation": [
              "The module name identifies the source of mean. The report calculation remains independent of input collection."
            ]
          }
        ]
      },
      {
        "title": "Separate importing from running",
        "paragraphs": [
          "Python executes top-level statements when it first imports a module in a process. A function definition creates a callable; it does not run the function body. A top-level function call does run immediately.",
          "Put application work in main and call it under the __name__ == \"__main__\" guard. This condition is true when the module is the entry point and false when another module imports it by its module name. Keep unnecessary work outside the guard out of module initialization too."
        ],
        "interpretation": [],
        "examples": [
          {
            "title": "Make the application call explicit",
            "paragraphs": [
              "The browser runs this program as the entry point."
            ],
            "code": "def format_report(values):\n    return f\"Readings: {len(values)}\"\n\ndef main():\n    print(format_report([8, 12]))\n\nif __name__ == \"__main__\":\n    main()",
            "output": "Readings: 2",
            "interpretation": [
              "A local caller could import format_report without running main. The import still performs normal module initialization."
            ]
          }
        ]
      },
      {
        "title": "Keep dependency direction understandable",
        "paragraphs": [
          "A command-line module can import a calculation and pass its arguments. The calculation should not import the command-line module to discover a filename. That direction keeps the calculation usable from tests and other applications.",
          "Circular imports can expose partially initialized modules. Moving imports inside functions may defer a symptom, but the responsibilities still deserve review. Genuinely shared behavior can live in a module both callers depend on."
        ],
        "interpretation": []
      },
      {
        "title": "Distinguish public interfaces from conventions",
        "paragraphs": [
          "Choose a small set of names callers should rely on. An underscore prefix signals an internal convention, not an access-control mechanism. Documentation should state the promised inputs, outputs and exceptions of the public interface.",
          "A package organizes modules beneath a shared name. Do not create a new file for every function merely to increase the number of modules; related behavior can remain together."
        ],
        "interpretation": []
      },
      {
        "title": "Choose a project layout for how it runs",
        "paragraphs": [
          "A small application can begin with a few clearly named files. A src layout places the importable package under src and normally requires installing the project in its environment. This helps distinguish an installed package from an accidental working-directory import.",
          "A flat layout can also be appropriate. Directory structure alone does not improve a design or establish which copy a test imported. The next lesson explains environments and project metadata. Keep tests separate from application entry-point work."
        ],
        "interpretation": []
      }
    ],
    "questions": [
      {
        "kind": "choice",
        "prompt": "What does the statistics prefix identify in this call?",
        "options": [
          "The module supplying mean",
          "The measurement unit",
          "A separate copy of the data"
        ],
        "answer": 0,
        "because": "The explicit module name identifies where the called function comes from.",
        "given": {
          "description": "Question data",
          "data": "import statistics\nstatistics.mean([6, 10, 14])"
        }
      },
      {
        "kind": "trueFalse",
        "prompt": "Importing the module may execute main.",
        "answer": true,
        "because": "Top-level statements run during module initialization.",
        "given": {
          "description": "Question data",
          "data": "A module has an unguarded top-level main() call."
        }
      },
      {
        "kind": "choice",
        "prompt": "What does the usual guard permit?",
        "options": [
          "Its entry-point call",
          "Access to private files",
          "Automatic dependency installation"
        ],
        "answer": 0,
        "because": "The guard distinguishes entry-point use from import by the module name.",
        "given": {
          "description": "Question data",
          "data": "A file runs directly with __name__ equal to __main__."
        }
      },
      {
        "kind": "trueFalse",
        "prompt": "That convention prevents another module from calling it.",
        "answer": false,
        "because": "The convention communicates intent but is not access control.",
        "given": {
          "description": "Question data",
          "data": "A function name starts with an underscore."
        }
      },
      {
        "kind": "choice",
        "prompt": "Which redesign is worth considering?",
        "options": [
          "Copy everything",
          "Catch every import error",
          "Move shared behavior to a common dependency"
        ],
        "answer": 2,
        "because": "A common responsibility can have one owner without the circular relationship.",
        "given": {
          "description": "Question data",
          "data": "Two modules import one another for shared formatting."
        }
      },
      {
        "kind": "choice",
        "prompt": "What still needs verifying?",
        "options": [
          "Which installed package is imported",
          "The number of directories",
          "Whether every function has its own file"
        ],
        "answer": 0,
        "because": "Layout alone does not establish import resolution.",
        "given": {
          "description": "Question data",
          "data": "A package uses src/ and tests pass from its checkout."
        }
      }
    ],
    "practice": [
      {
        "title": "Separate the report payload from its display",
        "question": "Can the tested report calculation be imported and reused without printing?",
        "task": [
          "Retain the tested report_counts function. Refactor build_report(reports, *, limit_c) so it silently returns {\"limit_c\": limit_c, \"counts\": ...} in that key order, calling the retained shared rule for the named counts.",
          "The caller chooses whether to display the payload. Keep reports unchanged, preserve their insertion order, and propagate the earlier input-validation errors, including an invalid limit with an empty report mapping. Print the payload from the caller, not from build_report. This function can become the public interface of a calculation module."
        ],
        "starter": "import math\n\n# Working earlier report helpers\n\n\ndef convert_report(records):\n    \"\"\"Return named Fahrenheit readings without changing Celsius records.\"\"\"\n    result = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each reading needs a record\")\n        house = row.get(\"house\")\n        temperature_c = row.get(\"temperature_c\")\n        if not isinstance(house, str) or not house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        if type(temperature_c) not in (int, float) or (type(temperature_c) is float and not math.isfinite(temperature_c)):\n            raise ValueError(\"temperature_c must be a finite number\")\n        try:\n            temperature_f = temperature_c * 1.8 + 32\n        except OverflowError:\n            raise ValueError(\"Converted temperature is outside float range\") from None\n        if not math.isfinite(temperature_f):\n            raise ValueError(\"Converted temperature must be finite\")\n        result.append({\"house\": house, \"temperature_f\": temperature_f})\n    return result\n\ndef format_report(records):\n    rows = convert_report(records)\n    return [f\"{row[\"house\"]}: {row[\"temperature_f\"]:.1f} F\" for row in rows]\n\n\ndef summarize_alerts(readings_c, *, limit_c):\n    \"\"\"Return an inclusive Celsius alert count and total excess.\"\"\"\n    if type(limit_c) not in (int, float) or (type(limit_c) is float and not math.isfinite(limit_c)):\n        raise ValueError(\"limit_c must be finite\")\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in readings_c):\n        raise ValueError(\"Readings must be finite numbers\")\n    alerts = [value for value in readings_c if value >= limit_c]\n    try:\n        excess_c = float(sum(value - limit_c for value in alerts))\n    except OverflowError:\n        raise ValueError(\"Total excess is outside float range\") from None\n    if not math.isfinite(excess_c):\n        raise ValueError(\"Total excess must be finite\")\n    return {\"count\": len(alerts), \"excess_c\": excess_c}\n\ndef make_report(records, *, limit_c):\n    rows = convert_report(records)\n    summary = summarize_alerts([row[\"temperature_c\"] for row in records], limit_c=limit_c)\n    return {\"rows\": rows, **summary}\n\n\ndef calibrate(values, *, scale=1.0, offset=0.0):\n    \"\"\"Return calibrated values without changing the input readings.\"\"\"\n    parameters = [scale, offset, *values]\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in parameters):\n        raise ValueError(\"Calibration inputs must be finite numbers\")\n    try:\n        result = [value * scale + offset for value in values]\n    except OverflowError:\n        raise ValueError(\"Calibration is outside float range\") from None\n    if any(type(value) is float and not math.isfinite(value) for value in result):\n        raise ValueError(\"Calibrated values must be finite\")\n    return result\n\ndef calibrate_records(records, *, scale=1.0, offset=0.0):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    for row in records:\n        if not isinstance(row, dict) or not isinstance(row.get(\"house\"), str) or not row[\"house\"].strip():\n            raise ValueError(\"Every record needs a house name\")\n        value = row.get(\"temperature_c\")\n        if type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)):\n            raise ValueError(\"Every record needs a finite Celsius reading\")\n    adjusted = calibrate([row[\"temperature_c\"] for row in records], scale=scale, offset=offset)\n    return [{**row, \"temperature_c\": value} for row, value in zip(records, adjusted)]\n\ndef calibrated_report(records, *, limit_c, scale=1.0, offset=0.0):\n    adjusted = calibrate_records(records, scale=scale, offset=offset)\n    return make_report(adjusted, limit_c=limit_c)\n\ndef grouped_reports(reports, *, limit_c, scale=1.0, offset=0.0):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    calibrated_report([], limit_c=limit_c, scale=scale, offset=offset)\n    result = {}\n    for name, records in reports.items():\n        if not isinstance(name, str) or not name.strip():\n            raise ValueError(\"A report name must be nonempty text\")\n        result[name] = calibrated_report(records, limit_c=limit_c, scale=scale, offset=offset)\n    return result\n\n# Extend the program below\n\ndef prepare_reports(reports, policy):\n    if not isinstance(policy, dict) or set(policy) != {\"limit_c\", \"scale\", \"offset\"}:\n        raise ValueError(\"Policy needs exactly limit_c, scale and offset\")\n    return grouped_reports(reports, limit_c=policy[\"limit_c\"],\n                           scale=policy[\"scale\"], offset=policy[\"offset\"])\n\n\n# New project adapters: a compact per-house input and a counts-only view.\n# The complete named-record report helpers above remain available.\n\ndef count_alerts(readings_c, *, limit_c):\n    return summarize_alerts(readings_c, limit_c=limit_c)[\"count\"]\n\ndef report_counts(reports, *, limit_c):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    groups = {}\n    for house, values in reports.items():\n        if not isinstance(values, list):\n            raise ValueError(\"Each house needs a list of readings\")\n        groups[house] = [{\"house\": house, \"temperature_c\": value} for value in values]\n    prepared = prepare_reports(\n        groups, {\"limit_c\": limit_c, \"scale\": 1, \"offset\": 0})\n    return {name: report[\"count\"] for name, report in prepared.items()}\n\ndef build_report(reports, *, limit_c):\n    counts = report_counts(reports, limit_c=limit_c)\n    print(counts)\n    return {\"counts\": counts}\n\nprint(build_report({\"north\":[18,25],\"south\":[]}, limit_c=20))",
        "solution": "import math\n\n# Working earlier report helpers\n\n\ndef convert_report(records):\n    \"\"\"Return named Fahrenheit readings without changing Celsius records.\"\"\"\n    result = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each reading needs a record\")\n        house = row.get(\"house\")\n        temperature_c = row.get(\"temperature_c\")\n        if not isinstance(house, str) or not house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        if type(temperature_c) not in (int, float) or (type(temperature_c) is float and not math.isfinite(temperature_c)):\n            raise ValueError(\"temperature_c must be a finite number\")\n        try:\n            temperature_f = temperature_c * 1.8 + 32\n        except OverflowError:\n            raise ValueError(\"Converted temperature is outside float range\") from None\n        if not math.isfinite(temperature_f):\n            raise ValueError(\"Converted temperature must be finite\")\n        result.append({\"house\": house, \"temperature_f\": temperature_f})\n    return result\n\ndef format_report(records):\n    rows = convert_report(records)\n    return [f\"{row[\"house\"]}: {row[\"temperature_f\"]:.1f} F\" for row in rows]\n\n\ndef summarize_alerts(readings_c, *, limit_c):\n    \"\"\"Return an inclusive Celsius alert count and total excess.\"\"\"\n    if type(limit_c) not in (int, float) or (type(limit_c) is float and not math.isfinite(limit_c)):\n        raise ValueError(\"limit_c must be finite\")\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in readings_c):\n        raise ValueError(\"Readings must be finite numbers\")\n    alerts = [value for value in readings_c if value >= limit_c]\n    try:\n        excess_c = float(sum(value - limit_c for value in alerts))\n    except OverflowError:\n        raise ValueError(\"Total excess is outside float range\") from None\n    if not math.isfinite(excess_c):\n        raise ValueError(\"Total excess must be finite\")\n    return {\"count\": len(alerts), \"excess_c\": excess_c}\n\ndef make_report(records, *, limit_c):\n    rows = convert_report(records)\n    summary = summarize_alerts([row[\"temperature_c\"] for row in records], limit_c=limit_c)\n    return {\"rows\": rows, **summary}\n\n\ndef calibrate(values, *, scale=1.0, offset=0.0):\n    \"\"\"Return calibrated values without changing the input readings.\"\"\"\n    parameters = [scale, offset, *values]\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in parameters):\n        raise ValueError(\"Calibration inputs must be finite numbers\")\n    try:\n        result = [value * scale + offset for value in values]\n    except OverflowError:\n        raise ValueError(\"Calibration is outside float range\") from None\n    if any(type(value) is float and not math.isfinite(value) for value in result):\n        raise ValueError(\"Calibrated values must be finite\")\n    return result\n\ndef calibrate_records(records, *, scale=1.0, offset=0.0):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    for row in records:\n        if not isinstance(row, dict) or not isinstance(row.get(\"house\"), str) or not row[\"house\"].strip():\n            raise ValueError(\"Every record needs a house name\")\n        value = row.get(\"temperature_c\")\n        if type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)):\n            raise ValueError(\"Every record needs a finite Celsius reading\")\n    adjusted = calibrate([row[\"temperature_c\"] for row in records], scale=scale, offset=offset)\n    return [{**row, \"temperature_c\": value} for row, value in zip(records, adjusted)]\n\ndef calibrated_report(records, *, limit_c, scale=1.0, offset=0.0):\n    adjusted = calibrate_records(records, scale=scale, offset=offset)\n    return make_report(adjusted, limit_c=limit_c)\n\ndef grouped_reports(reports, *, limit_c, scale=1.0, offset=0.0):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    calibrated_report([], limit_c=limit_c, scale=scale, offset=offset)\n    result = {}\n    for name, records in reports.items():\n        if not isinstance(name, str) or not name.strip():\n            raise ValueError(\"A report name must be nonempty text\")\n        result[name] = calibrated_report(records, limit_c=limit_c, scale=scale, offset=offset)\n    return result\n\n# Extend the program below\n\ndef prepare_reports(reports, policy):\n    if not isinstance(policy, dict) or set(policy) != {\"limit_c\", \"scale\", \"offset\"}:\n        raise ValueError(\"Policy needs exactly limit_c, scale and offset\")\n    return grouped_reports(reports, limit_c=policy[\"limit_c\"],\n                           scale=policy[\"scale\"], offset=policy[\"offset\"])\n\n\n# New project adapters: a compact per-house input and a counts-only view.\n# The complete named-record report helpers above remain available.\n\ndef count_alerts(readings_c, *, limit_c):\n    return summarize_alerts(readings_c, limit_c=limit_c)[\"count\"]\n\ndef report_counts(reports, *, limit_c):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    groups = {}\n    for house, values in reports.items():\n        if not isinstance(values, list):\n            raise ValueError(\"Each house needs a list of readings\")\n        groups[house] = [{\"house\": house, \"temperature_c\": value} for value in values]\n    prepared = prepare_reports(\n        groups, {\"limit_c\": limit_c, \"scale\": 1, \"offset\": 0})\n    return {name: report[\"count\"] for name, report in prepared.items()}\n\ndef build_report(reports, *, limit_c):\n    counts = report_counts(reports, limit_c=limit_c)\n    return {\"limit_c\": limit_c, \"counts\": counts}\n\nprint(build_report({\"north\":[18,25],\"south\":[]}, limit_c=20))",
        "output": "{'limit_c': 20, 'counts': {'north': 1, 'south': 0}}",
        "hints": [
          "The existing shared rule already owns count validation; use its returned data.",
          "Remove display work from the reusable function and retain the limit that explains its counts."
        ],
        "tests": [
          {
            "name": "Changed data and empty reports",
            "code": "assert build_report({\"late\":[10,15],\"empty\":[]}, limit_c=15) == {\"limit_c\":15,\"counts\":{\"late\":1,\"empty\":0}}\nassert build_report({}, limit_c=0) == {\"limit_c\":0,\"counts\":{}}"
          },
          {
            "name": "Silence and retained input",
            "code": "import io, copy\nfrom contextlib import redirect_stdout\nreports = {\"west\":[2,2,3]}\nsaved = copy.deepcopy(reports)\nstream = io.StringIO()\nwith redirect_stdout(stream):\n    result = build_report(reports, limit_c=2)\nassert stream.getvalue() == \"\" and reports == saved\nassert result[\"counts\"] == {\"west\":3} and result[\"counts\"] is not reports"
          },
          {
            "name": "Earlier boundary still enforced",
            "code": "try:\n    build_report({}, limit_c=float(\"nan\"))\nexcept ValueError:\n    pass\nelse:\n    raise AssertionError(\"Earlier limit validation lost\")"
          }
        ],
        "continuation": {
          "lesson": "/concepts/python-testing",
          "exercise": 1,
          "summary": "Retain the shared report calculation covered by the regression suite and make its output a silent module interface carrying its limit and named counts."
        },
        "editTarget": "def build_report("
      },
      {
        "title": "Keep the report entry point thin",
        "question": "Can a new command choose its input and limit without changing the calculation module?",
        "task": [
          "Keep build_report as the calculation-module interface. Extend run_report_cli(arguments, read_reports, write_report) to accept exactly [path, limit_text], with a nonblank string path and a string that parses to a finite float. Reject malformed arguments with ValueError before calling either dependency.",
          "Read the named report once, pass the parsed limit to build_report, write that payload once, then return 0. Do not access sys.argv, files or a real sender here; the application entry point can supply those dependencies. Propagate reading/writing failures without retries. Print the result and the recorded output."
        ],
        "starter": "import math\n\n# Working earlier report helpers\n\n\ndef convert_report(records):\n    \"\"\"Return named Fahrenheit readings without changing Celsius records.\"\"\"\n    result = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each reading needs a record\")\n        house = row.get(\"house\")\n        temperature_c = row.get(\"temperature_c\")\n        if not isinstance(house, str) or not house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        if type(temperature_c) not in (int, float) or (type(temperature_c) is float and not math.isfinite(temperature_c)):\n            raise ValueError(\"temperature_c must be a finite number\")\n        try:\n            temperature_f = temperature_c * 1.8 + 32\n        except OverflowError:\n            raise ValueError(\"Converted temperature is outside float range\") from None\n        if not math.isfinite(temperature_f):\n            raise ValueError(\"Converted temperature must be finite\")\n        result.append({\"house\": house, \"temperature_f\": temperature_f})\n    return result\n\ndef format_report(records):\n    rows = convert_report(records)\n    return [f\"{row[\"house\"]}: {row[\"temperature_f\"]:.1f} F\" for row in rows]\n\n\ndef summarize_alerts(readings_c, *, limit_c):\n    \"\"\"Return an inclusive Celsius alert count and total excess.\"\"\"\n    if type(limit_c) not in (int, float) or (type(limit_c) is float and not math.isfinite(limit_c)):\n        raise ValueError(\"limit_c must be finite\")\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in readings_c):\n        raise ValueError(\"Readings must be finite numbers\")\n    alerts = [value for value in readings_c if value >= limit_c]\n    try:\n        excess_c = float(sum(value - limit_c for value in alerts))\n    except OverflowError:\n        raise ValueError(\"Total excess is outside float range\") from None\n    if not math.isfinite(excess_c):\n        raise ValueError(\"Total excess must be finite\")\n    return {\"count\": len(alerts), \"excess_c\": excess_c}\n\ndef make_report(records, *, limit_c):\n    rows = convert_report(records)\n    summary = summarize_alerts([row[\"temperature_c\"] for row in records], limit_c=limit_c)\n    return {\"rows\": rows, **summary}\n\n\ndef calibrate(values, *, scale=1.0, offset=0.0):\n    \"\"\"Return calibrated values without changing the input readings.\"\"\"\n    parameters = [scale, offset, *values]\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in parameters):\n        raise ValueError(\"Calibration inputs must be finite numbers\")\n    try:\n        result = [value * scale + offset for value in values]\n    except OverflowError:\n        raise ValueError(\"Calibration is outside float range\") from None\n    if any(type(value) is float and not math.isfinite(value) for value in result):\n        raise ValueError(\"Calibrated values must be finite\")\n    return result\n\ndef calibrate_records(records, *, scale=1.0, offset=0.0):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    for row in records:\n        if not isinstance(row, dict) or not isinstance(row.get(\"house\"), str) or not row[\"house\"].strip():\n            raise ValueError(\"Every record needs a house name\")\n        value = row.get(\"temperature_c\")\n        if type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)):\n            raise ValueError(\"Every record needs a finite Celsius reading\")\n    adjusted = calibrate([row[\"temperature_c\"] for row in records], scale=scale, offset=offset)\n    return [{**row, \"temperature_c\": value} for row, value in zip(records, adjusted)]\n\ndef calibrated_report(records, *, limit_c, scale=1.0, offset=0.0):\n    adjusted = calibrate_records(records, scale=scale, offset=offset)\n    return make_report(adjusted, limit_c=limit_c)\n\ndef grouped_reports(reports, *, limit_c, scale=1.0, offset=0.0):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    calibrated_report([], limit_c=limit_c, scale=scale, offset=offset)\n    result = {}\n    for name, records in reports.items():\n        if not isinstance(name, str) or not name.strip():\n            raise ValueError(\"A report name must be nonempty text\")\n        result[name] = calibrated_report(records, limit_c=limit_c, scale=scale, offset=offset)\n    return result\n\n# Extend the program below\n\ndef prepare_reports(reports, policy):\n    if not isinstance(policy, dict) or set(policy) != {\"limit_c\", \"scale\", \"offset\"}:\n        raise ValueError(\"Policy needs exactly limit_c, scale and offset\")\n    return grouped_reports(reports, limit_c=policy[\"limit_c\"],\n                           scale=policy[\"scale\"], offset=policy[\"offset\"])\n\n\n# New project adapters: a compact per-house input and a counts-only view.\n# The complete named-record report helpers above remain available.\n\ndef count_alerts(readings_c, *, limit_c):\n    return summarize_alerts(readings_c, limit_c=limit_c)[\"count\"]\n\ndef report_counts(reports, *, limit_c):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    groups = {}\n    for house, values in reports.items():\n        if not isinstance(values, list):\n            raise ValueError(\"Each house needs a list of readings\")\n        groups[house] = [{\"house\": house, \"temperature_c\": value} for value in values]\n    prepared = prepare_reports(\n        groups, {\"limit_c\": limit_c, \"scale\": 1, \"offset\": 0})\n    return {name: report[\"count\"] for name, report in prepared.items()}\n\ndef build_report(reports, *, limit_c):\n    counts = report_counts(reports, limit_c=limit_c)\n    return {\"limit_c\": limit_c, \"counts\": counts}\n\ndef run_report_cli(arguments, read_reports, write_report):\n    reports = read_reports(arguments[0])\n    write_report(build_report(reports, limit_c=25))\n    return 0\n\nwritten = []\ndef read_reports(path):\n    return {\"north\":[18,24], \"south\":[14]}\n\nprint(run_report_cli([\"shift.csv\", \"16\"], read_reports, written.append))\nprint(written)",
        "solution": "import math\n\n# Working earlier report helpers\n\n\ndef convert_report(records):\n    \"\"\"Return named Fahrenheit readings without changing Celsius records.\"\"\"\n    result = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each reading needs a record\")\n        house = row.get(\"house\")\n        temperature_c = row.get(\"temperature_c\")\n        if not isinstance(house, str) or not house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        if type(temperature_c) not in (int, float) or (type(temperature_c) is float and not math.isfinite(temperature_c)):\n            raise ValueError(\"temperature_c must be a finite number\")\n        try:\n            temperature_f = temperature_c * 1.8 + 32\n        except OverflowError:\n            raise ValueError(\"Converted temperature is outside float range\") from None\n        if not math.isfinite(temperature_f):\n            raise ValueError(\"Converted temperature must be finite\")\n        result.append({\"house\": house, \"temperature_f\": temperature_f})\n    return result\n\ndef format_report(records):\n    rows = convert_report(records)\n    return [f\"{row[\"house\"]}: {row[\"temperature_f\"]:.1f} F\" for row in rows]\n\n\ndef summarize_alerts(readings_c, *, limit_c):\n    \"\"\"Return an inclusive Celsius alert count and total excess.\"\"\"\n    if type(limit_c) not in (int, float) or (type(limit_c) is float and not math.isfinite(limit_c)):\n        raise ValueError(\"limit_c must be finite\")\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in readings_c):\n        raise ValueError(\"Readings must be finite numbers\")\n    alerts = [value for value in readings_c if value >= limit_c]\n    try:\n        excess_c = float(sum(value - limit_c for value in alerts))\n    except OverflowError:\n        raise ValueError(\"Total excess is outside float range\") from None\n    if not math.isfinite(excess_c):\n        raise ValueError(\"Total excess must be finite\")\n    return {\"count\": len(alerts), \"excess_c\": excess_c}\n\ndef make_report(records, *, limit_c):\n    rows = convert_report(records)\n    summary = summarize_alerts([row[\"temperature_c\"] for row in records], limit_c=limit_c)\n    return {\"rows\": rows, **summary}\n\n\ndef calibrate(values, *, scale=1.0, offset=0.0):\n    \"\"\"Return calibrated values without changing the input readings.\"\"\"\n    parameters = [scale, offset, *values]\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in parameters):\n        raise ValueError(\"Calibration inputs must be finite numbers\")\n    try:\n        result = [value * scale + offset for value in values]\n    except OverflowError:\n        raise ValueError(\"Calibration is outside float range\") from None\n    if any(type(value) is float and not math.isfinite(value) for value in result):\n        raise ValueError(\"Calibrated values must be finite\")\n    return result\n\ndef calibrate_records(records, *, scale=1.0, offset=0.0):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    for row in records:\n        if not isinstance(row, dict) or not isinstance(row.get(\"house\"), str) or not row[\"house\"].strip():\n            raise ValueError(\"Every record needs a house name\")\n        value = row.get(\"temperature_c\")\n        if type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)):\n            raise ValueError(\"Every record needs a finite Celsius reading\")\n    adjusted = calibrate([row[\"temperature_c\"] for row in records], scale=scale, offset=offset)\n    return [{**row, \"temperature_c\": value} for row, value in zip(records, adjusted)]\n\ndef calibrated_report(records, *, limit_c, scale=1.0, offset=0.0):\n    adjusted = calibrate_records(records, scale=scale, offset=offset)\n    return make_report(adjusted, limit_c=limit_c)\n\ndef grouped_reports(reports, *, limit_c, scale=1.0, offset=0.0):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    calibrated_report([], limit_c=limit_c, scale=scale, offset=offset)\n    result = {}\n    for name, records in reports.items():\n        if not isinstance(name, str) or not name.strip():\n            raise ValueError(\"A report name must be nonempty text\")\n        result[name] = calibrated_report(records, limit_c=limit_c, scale=scale, offset=offset)\n    return result\n\n# Extend the program below\n\ndef prepare_reports(reports, policy):\n    if not isinstance(policy, dict) or set(policy) != {\"limit_c\", \"scale\", \"offset\"}:\n        raise ValueError(\"Policy needs exactly limit_c, scale and offset\")\n    return grouped_reports(reports, limit_c=policy[\"limit_c\"],\n                           scale=policy[\"scale\"], offset=policy[\"offset\"])\n\n\n# New project adapters: a compact per-house input and a counts-only view.\n# The complete named-record report helpers above remain available.\n\ndef count_alerts(readings_c, *, limit_c):\n    return summarize_alerts(readings_c, limit_c=limit_c)[\"count\"]\n\ndef report_counts(reports, *, limit_c):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    groups = {}\n    for house, values in reports.items():\n        if not isinstance(values, list):\n            raise ValueError(\"Each house needs a list of readings\")\n        groups[house] = [{\"house\": house, \"temperature_c\": value} for value in values]\n    prepared = prepare_reports(\n        groups, {\"limit_c\": limit_c, \"scale\": 1, \"offset\": 0})\n    return {name: report[\"count\"] for name, report in prepared.items()}\n\ndef build_report(reports, *, limit_c):\n    counts = report_counts(reports, limit_c=limit_c)\n    return {\"limit_c\": limit_c, \"counts\": counts}\n\ndef run_report_cli(arguments, read_reports, write_report):\n    if (not isinstance(arguments, list) or len(arguments) != 2\n            or any(not isinstance(value, str) for value in arguments)\n            or not arguments[0].strip()):\n        raise ValueError(\"Supply a report path and numerical limit\")\n    try:\n        limit_c = float(arguments[1])\n    except ValueError:\n        raise ValueError(\"Supply a numerical limit\") from None\n    count_alerts([], limit_c=limit_c)\n    reports = read_reports(arguments[0])\n    write_report(build_report(reports, limit_c=limit_c))\n    return 0\n\nwritten = []\ndef read_reports(path):\n    return {\"north\":[18,24], \"south\":[14]}\n\nprint(run_report_cli([\"shift.csv\", \"16\"], read_reports, written.append))\nprint(written)",
        "output": "0\n[{'limit_c': 16.0, 'counts': {'north': 2, 'south': 0}}]",
        "hints": [
          "Validate command arguments before crossing the input or output boundary.",
          "Keep parsing and dependency coordination in this entry layer, then reuse build_report."
        ],
        "tests": [
          {
            "name": "Changed arguments reach both boundaries",
            "code": "reads, writes = [], []\ndef reader(path):\n    reads.append(path)\n    return {\"x\":[0,5]}\nassert run_report_cli([\"other.csv\",\"5\"], reader, writes.append) == 0\nassert reads == [\"other.csv\"]\nassert writes == [{\"limit_c\":5.0,\"counts\":{\"x\":1}}]"
          },
          {
            "name": "Invalid arguments cause no effects",
            "code": "def forbidden(*args):\n    raise AssertionError(\"Dependency called before validation\")\nfor arguments in [[], [\"x\"], [\"\", \"5\"], [\"x\", \"nan\"], [\"x\", \"inf\"], [\"x\", \"bad\"], [\"x\", 5]]:\n    try:\n        run_report_cli(arguments, forbidden, forbidden)\n    except ValueError:\n        pass\n    else:\n        raise AssertionError(\"Invalid command accepted\")"
          },
          {
            "name": "A write failure is not successful completion",
            "code": "writes = []\ndef broken_writer(payload):\n    writes.append(payload)\n    raise OSError(\"Simulated write failure\")\ntry:\n    run_report_cli([\"x\",\"0\"], lambda path: {\"a\":[0]}, broken_writer)\nexcept OSError:\n    pass\nelse:\n    raise AssertionError(\"Write failure hidden\")\nassert len(writes) == 1"
          }
        ],
        "continuation": {
          "lesson": "/concepts/python-modules",
          "exercise": 0,
          "summary": "Retain the silent report payload builder and add a thin, explicitly supplied command boundary that validates before reading or writing."
        },
        "editTarget": "def run_report_cli("
      }
    ],
    "build": {
      "title": "List dependencies for a package",
      "problem": "Botie has direct-import lists for a group of related modules.",
      "challenge": "Read each imports field, combine those lists and retain each dependency's first occurrence.",
      "sources": {
        "modules": "Module records and direct imports"
      },
      "cases": [
        {
          "name": "Report modules",
          "data": {
            "modules": [
              {
                "name": "cli",
                "imports": [
                  "io",
                  "summary"
                ]
              },
              {
                "name": "io",
                "imports": [
                  "csv"
                ]
              },
              {
                "name": "summary",
                "imports": [
                  "statistics"
                ]
              }
            ]
          },
          "expected": [
            "io",
            "summary",
            "csv",
            "statistics"
          ]
        },
        {
          "name": "Shared helper",
          "data": {
            "modules": [
              {
                "name": "a",
                "imports": [
                  "shared",
                  "json"
                ]
              },
              {
                "name": "b",
                "imports": [
                  "shared"
                ]
              }
            ]
          },
          "expected": [
            "shared",
            "json"
          ]
        },
        {
          "name": "No imports",
          "data": {
            "modules": [
              {
                "name": "core",
                "imports": []
              }
            ]
          },
          "expected": []
        }
      ],
      "recipe": {
        "op": "pyProjectUnique",
        "inputs": [
          {
            "op": "pyProjectFlatten",
            "inputs": [
              {
                "op": "pyProjectField",
                "inputs": [
                  {
                    "source": "modules"
                  }
                ],
                "settings": {
                  "field": "imports"
                }
              }
            ]
          }
        ]
      },
      "why": "Repeated use does not create another dependency identity.",
      "limitation": "This inspects an authored description. It neither parses Python nor detects every circular import.",
      "extras": [
        "constant",
        "add",
        "multiply",
        "total",
        "count"
      ],
      "draftVersion": 1
    },
    "journey": {
      "premise": "Importing a helper unexpectedly launched a report.",
      "order": "investigate-first",
      "construction": {
        "title": "Inspect the responsibilities behind imports",
        "start": "Read each direct-import list, combine its names and remove repeated dependency names.",
        "outcome": "The output is a dependency inventory, not an execution plan.",
        "hints": [
          "Read the imports field from every record.",
          "Combine the lists before keeping distinct names."
        ]
      },
      "investigation": {
        "title": "Both a and b import shared. Should the inventory contain shared twice?",
        "caseIndex": 1,
        "kind": "diagnose",
        "question": "Both a and b import shared. Should the inventory contain shared twice?",
        "options": [
          {
            "label": "No; keep one dependency name",
            "feedback": "The inventory names distinct dependencies.",
            "correct": true
          },
          {
            "label": "Yes; each import creates another package",
            "feedback": "An import statement does not create another dependency identity."
          }
        ],
        "outcome": "The original module records still retain their separate relationships."
      },
      "connections": [
        {
          "lessonId": "python-dry",
          "skill": "Assign shared behavior an owner",
          "why": "A common module can serve callers without copied rules."
        },
        {
          "lessonId": "python-test-doubles",
          "skill": "Keep external effects explicit",
          "why": "Reusable calculations need not launch their dependencies during import."
        }
      ],
      "reflection": {
        "prompt": "Which work should happen only at the entry point?",
        "carryForward": "Keep importing a calculation separate from running the application."
      }
    },
    "fresh": {
      "name": "No external helper is needed",
      "prompt": "Two new modules both have empty import lists. Predict the dependency inventory.",
      "data": {
        "modules": [
          {
            "name": "conversion",
            "imports": []
          },
          {
            "name": "thresholds",
            "imports": []
          }
        ]
      },
      "expected": [],
      "why": "An empty dependency inventory is a valid result."
    }
  },
  {
    "section": "Python Testing and Project Tools",
    "id": "python-dependencies",
    "title": "Python Environments and Dependencies",
    "topic": "Organizing a project",
    "blurb": "A program depends on its Python version and installed packages as well as its source. Separate environments and recorded dependencies help recreate a working setup without making unrelated projects share every package change.",
    "openingTitle": "The Same Source Imports Different Packages",
    "opening": [
      "Botie's report works on one computer and fails on another. Both copies have the same source, but they use different package versions. A global installation intended for another project changed the setup.",
      "We need to describe the project's requirements and separate its installed packages. Reproducing a run also depends on the Python version and the resolved indirect dependencies."
    ],
    "prerequisites": [
      {
        "title": "Modules and project structure",
        "href": "/concepts/python-modules"
      }
    ],
    "outputLabel": "Packages that differ from the reviewed version snapshot",
    "checkpointTitle": "Questions on Parts 1 and 2",
    "history": {
      "title": "Virtual Environments and pyproject.toml",
      "sources": [
        {
          "title": "PEP 405: virtual environments",
          "url": "https://peps.python.org/pep-0405/"
        },
        {
          "title": "PEP 518: build requirements",
          "url": "https://peps.python.org/pep-0518/"
        },
        {
          "title": "PyPA environment guide",
          "url": "https://packaging.python.org/en/latest/guides/installing-using-pip-and-virtual-environments/"
        }
      ],
      "blocks": [
        "Third-party virtual environment tools already helped projects retain separate installed packages. PEP 405, created in 2011 for Python 3.3, proposed built-in support that would avoid reproducing fragile interpreter-startup behavior in external tools.",
        "Builds had another dependency problem: a tool could need packages before it could execute the script that described them. PEP 518 introduced pyproject.toml build-system requirements in 2016 so tools could read that setup without first running its build script. Package isolation and declarative build requirements address different parts of reproducibility."
      ]
    },
    "diagram": {
      "title": "Each project can keep its own package set",
      "explanation": "A shared source file can behave differently when its imports resolve to different installations.",
      "rows": [],
      "scene": {
        "kind": "table",
        "rowHeading": "Project",
        "columns": [
          "Environment",
          "Recorded package"
        ],
        "records": [
          {
            "label": "Report A",
            "cells": [
              "A's .venv",
              "parser 2.1"
            ]
          },
          {
            "label": "Report B",
            "cells": [
              "B's .venv",
              "parser 3.0"
            ]
          }
        ],
        "caption": "Names and versions are invented. Separate environments do not provide security isolation."
      }
    },
    "parts": [
      {
        "title": "Choose the interpreter and environment",
        "paragraphs": [
          "A virtual environment has its own interpreter entry point and installation directory for packages. It prevents an ordinary package installation for one project from automatically replacing another project's packages. It commonly shares the base interpreter's standard library.",
          "The environment is not a security sandbox. Installed code runs with the process's permissions. Nor does creating an environment automatically select the right Python version. Start with the interpreter supported by the project."
        ],
        "interpretation": []
      },
      {
        "title": "Keep installation commands tied to that interpreter",
        "paragraphs": [
          "python -m pip runs pip through the named interpreter. Using the environment's interpreter explicitly helps avoid installing a package with one Python and running the program with another.",
          "In your own project, create the environment with python -m venv .venv. On Windows its interpreter is .venv/Scripts/python.exe; on macOS or Linux it is .venv/bin/python. These are local commands, not steps performed inside the browser. Keep the environment directory out of version control and retain the files that recreate its setup."
        ],
        "interpretation": []
      },
      {
        "title": "Separate declarations from a resolved installation",
        "paragraphs": [
          "A project can declare direct runtime requirements in pyproject.toml. Build-system requirements identify tools needed to build it, which differs from packages needed at runtime. Development tools also need a documented installation workflow.",
          "A compatible range states supported choices. An exact pin records one choice. A lock workflow resolves direct and indirect dependencies and records the information its tool uses to recreate that resolution. A few direct pins do not necessarily preserve transitive versions, distribution hashes or platform-specific choices."
        ],
        "interpretation": [],
        "examples": [
          {
            "title": "Read metadata without executing setup code",
            "paragraphs": [
              "tomllib reads a configuration string into ordinary dictionaries and lists."
            ],
            "code": "import tomllib\n\ntext = '''\n[project]\nname = \"greenhouse-report\"\nversion = \"0.1.0\"\nrequires-python = \">=3.12\"\ndependencies = [\"example-parser>=2,<3\"]\n'''\nmetadata = tomllib.loads(text)\nprint(metadata[\"project\"][\"name\"])\nprint(metadata[\"project\"][\"dependencies\"])",
            "output": "greenhouse-report\n['example-parser>=2,<3']",
            "interpretation": [
              "This invented dependency is metadata for inspection. Reading the requirement string does not install or resolve it."
            ]
          }
        ]
      },
      {
        "title": "Check the recreated environment",
        "paragraphs": [
          "A snapshot comparison can reveal drift from a reviewed installation. It cannot establish that all packages behave correctly or that suitable distributions exist on a different platform. Recreate the setup, run imports on the intended platform, then run the relevant tests.",
          "Update dependencies deliberately. Review compatibility and the resolved changes instead of fetching an unreviewed newest package on every run. Keep interpreter, platform and package-source assumptions with the project."
        ],
        "interpretation": [],
        "examples": [
          {
            "title": "Compare an exact version snapshot",
            "paragraphs": [
              "Extra packages do not change whether the requested versions match."
            ],
            "code": "required = {\"parser\": \"2.1\", \"writer\": \"1.4\"}\ninstalled = {\"parser\": \"2.2\", \"writer\": \"1.4\", \"extra\": \"9\"}\ndifferent = sorted(name for name, version in required.items()\n                   if installed.get(name) != version)\nprint(different)",
            "output": "['parser']",
            "interpretation": [
              "This is text equality for a snapshot, not semantic-version compatibility resolution."
            ]
          }
        ]
      }
    ],
    "questions": [
      {
        "kind": "choice",
        "prompt": "What does a virtual environment help separate?",
        "options": [
          "Installed package sets",
          "All operating-system permissions",
          "Every network connection"
        ],
        "answer": 0,
        "because": "Each environment has a package installation location; it is not a security boundary.",
        "given": {
          "description": "Question data",
          "data": "Project A and project B require different package versions."
        }
      },
      {
        "kind": "trueFalse",
        "prompt": "Installed code still runs with the process’s file permissions.",
        "answer": true,
        "because": "The environment separates installed packages; it does not provide operating-system security isolation.",
        "given": {
          "description": "Question data",
          "data": "Third-party code is installed inside .venv."
        }
      },
      {
        "kind": "choice",
        "prompt": "Which describes the application's runtime requirements?",
        "options": [
          "The filename only",
          "project.dependencies",
          "Every globally installed package"
        ],
        "answer": 1,
        "because": "Build requirements support constructing the distribution; runtime requirements support its use.",
        "given": {
          "description": "Question data",
          "data": "pyproject.toml contains build-system.requires and project.dependencies."
        }
      },
      {
        "kind": "trueFalse",
        "prompt": "It necessarily records every indirect dependency version.",
        "answer": false,
        "because": "The workflow must also preserve transitive resolution when reproducibility requires it.",
        "given": {
          "description": "Question data",
          "data": "A file pins direct dependency versions only."
        }
      },
      {
        "kind": "choice",
        "prompt": "What has happened?",
        "options": [
          "A requirement string was read",
          "The package was installed",
          "Compatibility was proven"
        ],
        "answer": 0,
        "because": "Parsing metadata does not resolve or install a requirement.",
        "given": {
          "description": "Question data",
          "data": "tomllib reads \"library>=2,<3\"."
        }
      },
      {
        "kind": "choice",
        "prompt": "Which evidence was missing?",
        "options": [
          "More folder names",
          "A successful target-platform import",
          "An unrelated newest package"
        ],
        "answer": 1,
        "because": "Matching text is not a target-platform runtime check.",
        "given": {
          "description": "Question data",
          "data": "Recorded versions match, but a package fails to import on Linux."
        }
      }
    ],
    "practice": [
      {
        "title": "Keep version evidence with the report",
        "question": "Which environment differences should stay attached to this report run?",
        "task": [
          "Keep build_report unchanged. Extend build_run_record so its report field uses that builder and its version_drift field contains the sorted required package names whose installed exact version is absent or different.",
          "required and installed are supplied dictionaries of exact version strings. Ignore extra installed names, preserve all inputs, and do not inspect or install packages on the host. This records snapshot differences, not compatible-range resolution. Print the report run below."
        ],
        "starter": "import math\n\n# Working earlier report helpers\n\n\ndef convert_report(records):\n    \"\"\"Return named Fahrenheit readings without changing Celsius records.\"\"\"\n    result = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each reading needs a record\")\n        house = row.get(\"house\")\n        temperature_c = row.get(\"temperature_c\")\n        if not isinstance(house, str) or not house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        if type(temperature_c) not in (int, float) or (type(temperature_c) is float and not math.isfinite(temperature_c)):\n            raise ValueError(\"temperature_c must be a finite number\")\n        try:\n            temperature_f = temperature_c * 1.8 + 32\n        except OverflowError:\n            raise ValueError(\"Converted temperature is outside float range\") from None\n        if not math.isfinite(temperature_f):\n            raise ValueError(\"Converted temperature must be finite\")\n        result.append({\"house\": house, \"temperature_f\": temperature_f})\n    return result\n\ndef format_report(records):\n    rows = convert_report(records)\n    return [f\"{row[\"house\"]}: {row[\"temperature_f\"]:.1f} F\" for row in rows]\n\n\ndef summarize_alerts(readings_c, *, limit_c):\n    \"\"\"Return an inclusive Celsius alert count and total excess.\"\"\"\n    if type(limit_c) not in (int, float) or (type(limit_c) is float and not math.isfinite(limit_c)):\n        raise ValueError(\"limit_c must be finite\")\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in readings_c):\n        raise ValueError(\"Readings must be finite numbers\")\n    alerts = [value for value in readings_c if value >= limit_c]\n    try:\n        excess_c = float(sum(value - limit_c for value in alerts))\n    except OverflowError:\n        raise ValueError(\"Total excess is outside float range\") from None\n    if not math.isfinite(excess_c):\n        raise ValueError(\"Total excess must be finite\")\n    return {\"count\": len(alerts), \"excess_c\": excess_c}\n\ndef make_report(records, *, limit_c):\n    rows = convert_report(records)\n    summary = summarize_alerts([row[\"temperature_c\"] for row in records], limit_c=limit_c)\n    return {\"rows\": rows, **summary}\n\n\ndef calibrate(values, *, scale=1.0, offset=0.0):\n    \"\"\"Return calibrated values without changing the input readings.\"\"\"\n    parameters = [scale, offset, *values]\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in parameters):\n        raise ValueError(\"Calibration inputs must be finite numbers\")\n    try:\n        result = [value * scale + offset for value in values]\n    except OverflowError:\n        raise ValueError(\"Calibration is outside float range\") from None\n    if any(type(value) is float and not math.isfinite(value) for value in result):\n        raise ValueError(\"Calibrated values must be finite\")\n    return result\n\ndef calibrate_records(records, *, scale=1.0, offset=0.0):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    for row in records:\n        if not isinstance(row, dict) or not isinstance(row.get(\"house\"), str) or not row[\"house\"].strip():\n            raise ValueError(\"Every record needs a house name\")\n        value = row.get(\"temperature_c\")\n        if type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)):\n            raise ValueError(\"Every record needs a finite Celsius reading\")\n    adjusted = calibrate([row[\"temperature_c\"] for row in records], scale=scale, offset=offset)\n    return [{**row, \"temperature_c\": value} for row, value in zip(records, adjusted)]\n\ndef calibrated_report(records, *, limit_c, scale=1.0, offset=0.0):\n    adjusted = calibrate_records(records, scale=scale, offset=offset)\n    return make_report(adjusted, limit_c=limit_c)\n\ndef grouped_reports(reports, *, limit_c, scale=1.0, offset=0.0):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    calibrated_report([], limit_c=limit_c, scale=scale, offset=offset)\n    result = {}\n    for name, records in reports.items():\n        if not isinstance(name, str) or not name.strip():\n            raise ValueError(\"A report name must be nonempty text\")\n        result[name] = calibrated_report(records, limit_c=limit_c, scale=scale, offset=offset)\n    return result\n\n# Extend the program below\n\ndef prepare_reports(reports, policy):\n    if not isinstance(policy, dict) or set(policy) != {\"limit_c\", \"scale\", \"offset\"}:\n        raise ValueError(\"Policy needs exactly limit_c, scale and offset\")\n    return grouped_reports(reports, limit_c=policy[\"limit_c\"],\n                           scale=policy[\"scale\"], offset=policy[\"offset\"])\n\n\n# New project adapters: a compact per-house input and a counts-only view.\n# The complete named-record report helpers above remain available.\n\ndef count_alerts(readings_c, *, limit_c):\n    return summarize_alerts(readings_c, limit_c=limit_c)[\"count\"]\n\ndef report_counts(reports, *, limit_c):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    groups = {}\n    for house, values in reports.items():\n        if not isinstance(values, list):\n            raise ValueError(\"Each house needs a list of readings\")\n        groups[house] = [{\"house\": house, \"temperature_c\": value} for value in values]\n    prepared = prepare_reports(\n        groups, {\"limit_c\": limit_c, \"scale\": 1, \"offset\": 0})\n    return {name: report[\"count\"] for name, report in prepared.items()}\n\ndef build_report(reports, *, limit_c):\n    counts = report_counts(reports, limit_c=limit_c)\n    return {\"limit_c\": limit_c, \"counts\": counts}\n\ndef build_run_record(reports, *, limit_c, required, installed):\n    return {\"report\": build_report(reports, limit_c=limit_c),\n            \"version_drift\": []}\n\nprint(build_run_record(\n    {\"north\":[18,25]}, limit_c=25,\n    required={\"parser\":\"2.1\",\"writer\":\"1.0\"},\n    installed={\"parser\":\"2.2\"}))",
        "solution": "import math\n\n# Working earlier report helpers\n\n\ndef convert_report(records):\n    \"\"\"Return named Fahrenheit readings without changing Celsius records.\"\"\"\n    result = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each reading needs a record\")\n        house = row.get(\"house\")\n        temperature_c = row.get(\"temperature_c\")\n        if not isinstance(house, str) or not house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        if type(temperature_c) not in (int, float) or (type(temperature_c) is float and not math.isfinite(temperature_c)):\n            raise ValueError(\"temperature_c must be a finite number\")\n        try:\n            temperature_f = temperature_c * 1.8 + 32\n        except OverflowError:\n            raise ValueError(\"Converted temperature is outside float range\") from None\n        if not math.isfinite(temperature_f):\n            raise ValueError(\"Converted temperature must be finite\")\n        result.append({\"house\": house, \"temperature_f\": temperature_f})\n    return result\n\ndef format_report(records):\n    rows = convert_report(records)\n    return [f\"{row[\"house\"]}: {row[\"temperature_f\"]:.1f} F\" for row in rows]\n\n\ndef summarize_alerts(readings_c, *, limit_c):\n    \"\"\"Return an inclusive Celsius alert count and total excess.\"\"\"\n    if type(limit_c) not in (int, float) or (type(limit_c) is float and not math.isfinite(limit_c)):\n        raise ValueError(\"limit_c must be finite\")\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in readings_c):\n        raise ValueError(\"Readings must be finite numbers\")\n    alerts = [value for value in readings_c if value >= limit_c]\n    try:\n        excess_c = float(sum(value - limit_c for value in alerts))\n    except OverflowError:\n        raise ValueError(\"Total excess is outside float range\") from None\n    if not math.isfinite(excess_c):\n        raise ValueError(\"Total excess must be finite\")\n    return {\"count\": len(alerts), \"excess_c\": excess_c}\n\ndef make_report(records, *, limit_c):\n    rows = convert_report(records)\n    summary = summarize_alerts([row[\"temperature_c\"] for row in records], limit_c=limit_c)\n    return {\"rows\": rows, **summary}\n\n\ndef calibrate(values, *, scale=1.0, offset=0.0):\n    \"\"\"Return calibrated values without changing the input readings.\"\"\"\n    parameters = [scale, offset, *values]\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in parameters):\n        raise ValueError(\"Calibration inputs must be finite numbers\")\n    try:\n        result = [value * scale + offset for value in values]\n    except OverflowError:\n        raise ValueError(\"Calibration is outside float range\") from None\n    if any(type(value) is float and not math.isfinite(value) for value in result):\n        raise ValueError(\"Calibrated values must be finite\")\n    return result\n\ndef calibrate_records(records, *, scale=1.0, offset=0.0):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    for row in records:\n        if not isinstance(row, dict) or not isinstance(row.get(\"house\"), str) or not row[\"house\"].strip():\n            raise ValueError(\"Every record needs a house name\")\n        value = row.get(\"temperature_c\")\n        if type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)):\n            raise ValueError(\"Every record needs a finite Celsius reading\")\n    adjusted = calibrate([row[\"temperature_c\"] for row in records], scale=scale, offset=offset)\n    return [{**row, \"temperature_c\": value} for row, value in zip(records, adjusted)]\n\ndef calibrated_report(records, *, limit_c, scale=1.0, offset=0.0):\n    adjusted = calibrate_records(records, scale=scale, offset=offset)\n    return make_report(adjusted, limit_c=limit_c)\n\ndef grouped_reports(reports, *, limit_c, scale=1.0, offset=0.0):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    calibrated_report([], limit_c=limit_c, scale=scale, offset=offset)\n    result = {}\n    for name, records in reports.items():\n        if not isinstance(name, str) or not name.strip():\n            raise ValueError(\"A report name must be nonempty text\")\n        result[name] = calibrated_report(records, limit_c=limit_c, scale=scale, offset=offset)\n    return result\n\n# Extend the program below\n\ndef prepare_reports(reports, policy):\n    if not isinstance(policy, dict) or set(policy) != {\"limit_c\", \"scale\", \"offset\"}:\n        raise ValueError(\"Policy needs exactly limit_c, scale and offset\")\n    return grouped_reports(reports, limit_c=policy[\"limit_c\"],\n                           scale=policy[\"scale\"], offset=policy[\"offset\"])\n\n\n# New project adapters: a compact per-house input and a counts-only view.\n# The complete named-record report helpers above remain available.\n\ndef count_alerts(readings_c, *, limit_c):\n    return summarize_alerts(readings_c, limit_c=limit_c)[\"count\"]\n\ndef report_counts(reports, *, limit_c):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    groups = {}\n    for house, values in reports.items():\n        if not isinstance(values, list):\n            raise ValueError(\"Each house needs a list of readings\")\n        groups[house] = [{\"house\": house, \"temperature_c\": value} for value in values]\n    prepared = prepare_reports(\n        groups, {\"limit_c\": limit_c, \"scale\": 1, \"offset\": 0})\n    return {name: report[\"count\"] for name, report in prepared.items()}\n\ndef build_report(reports, *, limit_c):\n    counts = report_counts(reports, limit_c=limit_c)\n    return {\"limit_c\": limit_c, \"counts\": counts}\n\ndef build_run_record(reports, *, limit_c, required, installed):\n    drift = sorted(name for name, version in required.items()\n                   if installed.get(name) != version)\n    return {\"report\": build_report(reports, limit_c=limit_c),\n            \"version_drift\": drift}\n\nprint(build_run_record(\n    {\"north\":[18,25]}, limit_c=25,\n    required={\"parser\":\"2.1\",\"writer\":\"1.0\"},\n    installed={\"parser\":\"2.2\"}))",
        "output": "{'report': {'limit_c': 25, 'counts': {'north': 1}}, 'version_drift': ['parser', 'writer']}",
        "hints": [
          "Preserve the existing calculation and add evidence about its supplied setup.",
          "Compare only required keys; an absent installed version is a difference."
        ],
        "tests": [
          {
            "name": "Report and version inputs both change",
            "code": "result = build_run_record({\"x\":[0,5]}, limit_c=0,\n                          required={\"z\":\"3\",\"a\":\"2\"}, installed={\"z\":\"3\",\"extra\":\"9\"})\nassert result == {\"report\":{\"limit_c\":0,\"counts\":{\"x\":2}},\"version_drift\":[\"a\"]}"
          },
          {
            "name": "Empty setup and inherited invalid limit",
            "code": "assert build_run_record({}, limit_c=2, required={}, installed={}) == {\n    \"report\":{\"limit_c\":2,\"counts\":{}},\"version_drift\":[]}\ntry:\n    build_run_record({}, limit_c=float(\"nan\"), required={}, installed={})\nexcept ValueError:\n    pass\nelse:\n    raise AssertionError(\"Report boundary was lost\")"
          },
          {
            "name": "Preserved snapshots and exact labels",
            "code": "required, installed = {\"adapter\":\"1.10\"}, {\"adapter\":\"1.1\"}\nresult = build_run_record({\"a\":[]}, limit_c=3, required=required, installed=installed)\nassert result[\"version_drift\"] == [\"adapter\"]\nassert required == {\"adapter\":\"1.10\"} and installed == {\"adapter\":\"1.1\"}"
          }
        ],
        "continuation": {
          "lesson": "/concepts/python-modules",
          "exercise": 0,
          "summary": "Keep the reusable report payload and add supplied dependency-snapshot evidence without changing its numerical calculation."
        },
        "editTarget": "def build_run_record("
      },
      {
        "title": "Read the report project’s declared requirements",
        "question": "Can another installation explain both its declared requirements and the report it produced?",
        "task": [
          "Keep build_run_record and its version evidence. Extend build_project_run to read the supplied TOML text and return project, declared_dependencies and run in that order. Read project.name and project.dependencies; require a nonblank name and a list of nonblank strings. Preserve declaration order. An empty dependency list is valid.",
          "Build run through the retained helper using the supplied exact-version snapshots. Raise ValueError for malformed TOML or invalid selected fields. This reads the fields needed by this report manifest; it is not a complete build-metadata validator, installer or dependency resolver. Print the supplied project run."
        ],
        "starter": "import tomllib\n\nimport math\n\n# Working earlier report helpers\n\n\ndef convert_report(records):\n    \"\"\"Return named Fahrenheit readings without changing Celsius records.\"\"\"\n    result = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each reading needs a record\")\n        house = row.get(\"house\")\n        temperature_c = row.get(\"temperature_c\")\n        if not isinstance(house, str) or not house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        if type(temperature_c) not in (int, float) or (type(temperature_c) is float and not math.isfinite(temperature_c)):\n            raise ValueError(\"temperature_c must be a finite number\")\n        try:\n            temperature_f = temperature_c * 1.8 + 32\n        except OverflowError:\n            raise ValueError(\"Converted temperature is outside float range\") from None\n        if not math.isfinite(temperature_f):\n            raise ValueError(\"Converted temperature must be finite\")\n        result.append({\"house\": house, \"temperature_f\": temperature_f})\n    return result\n\ndef format_report(records):\n    rows = convert_report(records)\n    return [f\"{row[\"house\"]}: {row[\"temperature_f\"]:.1f} F\" for row in rows]\n\n\ndef summarize_alerts(readings_c, *, limit_c):\n    \"\"\"Return an inclusive Celsius alert count and total excess.\"\"\"\n    if type(limit_c) not in (int, float) or (type(limit_c) is float and not math.isfinite(limit_c)):\n        raise ValueError(\"limit_c must be finite\")\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in readings_c):\n        raise ValueError(\"Readings must be finite numbers\")\n    alerts = [value for value in readings_c if value >= limit_c]\n    try:\n        excess_c = float(sum(value - limit_c for value in alerts))\n    except OverflowError:\n        raise ValueError(\"Total excess is outside float range\") from None\n    if not math.isfinite(excess_c):\n        raise ValueError(\"Total excess must be finite\")\n    return {\"count\": len(alerts), \"excess_c\": excess_c}\n\ndef make_report(records, *, limit_c):\n    rows = convert_report(records)\n    summary = summarize_alerts([row[\"temperature_c\"] for row in records], limit_c=limit_c)\n    return {\"rows\": rows, **summary}\n\n\ndef calibrate(values, *, scale=1.0, offset=0.0):\n    \"\"\"Return calibrated values without changing the input readings.\"\"\"\n    parameters = [scale, offset, *values]\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in parameters):\n        raise ValueError(\"Calibration inputs must be finite numbers\")\n    try:\n        result = [value * scale + offset for value in values]\n    except OverflowError:\n        raise ValueError(\"Calibration is outside float range\") from None\n    if any(type(value) is float and not math.isfinite(value) for value in result):\n        raise ValueError(\"Calibrated values must be finite\")\n    return result\n\ndef calibrate_records(records, *, scale=1.0, offset=0.0):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    for row in records:\n        if not isinstance(row, dict) or not isinstance(row.get(\"house\"), str) or not row[\"house\"].strip():\n            raise ValueError(\"Every record needs a house name\")\n        value = row.get(\"temperature_c\")\n        if type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)):\n            raise ValueError(\"Every record needs a finite Celsius reading\")\n    adjusted = calibrate([row[\"temperature_c\"] for row in records], scale=scale, offset=offset)\n    return [{**row, \"temperature_c\": value} for row, value in zip(records, adjusted)]\n\ndef calibrated_report(records, *, limit_c, scale=1.0, offset=0.0):\n    adjusted = calibrate_records(records, scale=scale, offset=offset)\n    return make_report(adjusted, limit_c=limit_c)\n\ndef grouped_reports(reports, *, limit_c, scale=1.0, offset=0.0):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    calibrated_report([], limit_c=limit_c, scale=scale, offset=offset)\n    result = {}\n    for name, records in reports.items():\n        if not isinstance(name, str) or not name.strip():\n            raise ValueError(\"A report name must be nonempty text\")\n        result[name] = calibrated_report(records, limit_c=limit_c, scale=scale, offset=offset)\n    return result\n\n# Extend the program below\n\ndef prepare_reports(reports, policy):\n    if not isinstance(policy, dict) or set(policy) != {\"limit_c\", \"scale\", \"offset\"}:\n        raise ValueError(\"Policy needs exactly limit_c, scale and offset\")\n    return grouped_reports(reports, limit_c=policy[\"limit_c\"],\n                           scale=policy[\"scale\"], offset=policy[\"offset\"])\n\n\n# New project adapters: a compact per-house input and a counts-only view.\n# The complete named-record report helpers above remain available.\n\ndef count_alerts(readings_c, *, limit_c):\n    return summarize_alerts(readings_c, limit_c=limit_c)[\"count\"]\n\ndef report_counts(reports, *, limit_c):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    groups = {}\n    for house, values in reports.items():\n        if not isinstance(values, list):\n            raise ValueError(\"Each house needs a list of readings\")\n        groups[house] = [{\"house\": house, \"temperature_c\": value} for value in values]\n    prepared = prepare_reports(\n        groups, {\"limit_c\": limit_c, \"scale\": 1, \"offset\": 0})\n    return {name: report[\"count\"] for name, report in prepared.items()}\n\ndef build_report(reports, *, limit_c):\n    counts = report_counts(reports, limit_c=limit_c)\n    return {\"limit_c\": limit_c, \"counts\": counts}\n\ndef build_run_record(reports, *, limit_c, required, installed):\n    drift = sorted(name for name, version in required.items()\n                   if installed.get(name) != version)\n    return {\"report\": build_report(reports, limit_c=limit_c),\n            \"version_drift\": drift}\n\ndef build_project_run(reports, metadata_text, *, limit_c, required, installed):\n    metadata = tomllib.loads(metadata_text)\n    return {\"run\": build_run_record(reports, limit_c=limit_c,\n                                    required=required, installed=installed)}\n\nmetadata_text = '''\n[project]\nname = \"greenhouse-report\"\nversion = \"0.1.0\"\ndependencies = [\"parser>=2\"]\n'''\nprint(build_project_run({\"north\":[25]}, metadata_text, limit_c=25,\n                        required={\"parser\":\"2.1\"}, installed={\"parser\":\"2.1\"}))",
        "solution": "import tomllib\n\nimport math\n\n# Working earlier report helpers\n\n\ndef convert_report(records):\n    \"\"\"Return named Fahrenheit readings without changing Celsius records.\"\"\"\n    result = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each reading needs a record\")\n        house = row.get(\"house\")\n        temperature_c = row.get(\"temperature_c\")\n        if not isinstance(house, str) or not house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        if type(temperature_c) not in (int, float) or (type(temperature_c) is float and not math.isfinite(temperature_c)):\n            raise ValueError(\"temperature_c must be a finite number\")\n        try:\n            temperature_f = temperature_c * 1.8 + 32\n        except OverflowError:\n            raise ValueError(\"Converted temperature is outside float range\") from None\n        if not math.isfinite(temperature_f):\n            raise ValueError(\"Converted temperature must be finite\")\n        result.append({\"house\": house, \"temperature_f\": temperature_f})\n    return result\n\ndef format_report(records):\n    rows = convert_report(records)\n    return [f\"{row[\"house\"]}: {row[\"temperature_f\"]:.1f} F\" for row in rows]\n\n\ndef summarize_alerts(readings_c, *, limit_c):\n    \"\"\"Return an inclusive Celsius alert count and total excess.\"\"\"\n    if type(limit_c) not in (int, float) or (type(limit_c) is float and not math.isfinite(limit_c)):\n        raise ValueError(\"limit_c must be finite\")\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in readings_c):\n        raise ValueError(\"Readings must be finite numbers\")\n    alerts = [value for value in readings_c if value >= limit_c]\n    try:\n        excess_c = float(sum(value - limit_c for value in alerts))\n    except OverflowError:\n        raise ValueError(\"Total excess is outside float range\") from None\n    if not math.isfinite(excess_c):\n        raise ValueError(\"Total excess must be finite\")\n    return {\"count\": len(alerts), \"excess_c\": excess_c}\n\ndef make_report(records, *, limit_c):\n    rows = convert_report(records)\n    summary = summarize_alerts([row[\"temperature_c\"] for row in records], limit_c=limit_c)\n    return {\"rows\": rows, **summary}\n\n\ndef calibrate(values, *, scale=1.0, offset=0.0):\n    \"\"\"Return calibrated values without changing the input readings.\"\"\"\n    parameters = [scale, offset, *values]\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in parameters):\n        raise ValueError(\"Calibration inputs must be finite numbers\")\n    try:\n        result = [value * scale + offset for value in values]\n    except OverflowError:\n        raise ValueError(\"Calibration is outside float range\") from None\n    if any(type(value) is float and not math.isfinite(value) for value in result):\n        raise ValueError(\"Calibrated values must be finite\")\n    return result\n\ndef calibrate_records(records, *, scale=1.0, offset=0.0):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    for row in records:\n        if not isinstance(row, dict) or not isinstance(row.get(\"house\"), str) or not row[\"house\"].strip():\n            raise ValueError(\"Every record needs a house name\")\n        value = row.get(\"temperature_c\")\n        if type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)):\n            raise ValueError(\"Every record needs a finite Celsius reading\")\n    adjusted = calibrate([row[\"temperature_c\"] for row in records], scale=scale, offset=offset)\n    return [{**row, \"temperature_c\": value} for row, value in zip(records, adjusted)]\n\ndef calibrated_report(records, *, limit_c, scale=1.0, offset=0.0):\n    adjusted = calibrate_records(records, scale=scale, offset=offset)\n    return make_report(adjusted, limit_c=limit_c)\n\ndef grouped_reports(reports, *, limit_c, scale=1.0, offset=0.0):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    calibrated_report([], limit_c=limit_c, scale=scale, offset=offset)\n    result = {}\n    for name, records in reports.items():\n        if not isinstance(name, str) or not name.strip():\n            raise ValueError(\"A report name must be nonempty text\")\n        result[name] = calibrated_report(records, limit_c=limit_c, scale=scale, offset=offset)\n    return result\n\n# Extend the program below\n\ndef prepare_reports(reports, policy):\n    if not isinstance(policy, dict) or set(policy) != {\"limit_c\", \"scale\", \"offset\"}:\n        raise ValueError(\"Policy needs exactly limit_c, scale and offset\")\n    return grouped_reports(reports, limit_c=policy[\"limit_c\"],\n                           scale=policy[\"scale\"], offset=policy[\"offset\"])\n\n\n# New project adapters: a compact per-house input and a counts-only view.\n# The complete named-record report helpers above remain available.\n\ndef count_alerts(readings_c, *, limit_c):\n    return summarize_alerts(readings_c, limit_c=limit_c)[\"count\"]\n\ndef report_counts(reports, *, limit_c):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    groups = {}\n    for house, values in reports.items():\n        if not isinstance(values, list):\n            raise ValueError(\"Each house needs a list of readings\")\n        groups[house] = [{\"house\": house, \"temperature_c\": value} for value in values]\n    prepared = prepare_reports(\n        groups, {\"limit_c\": limit_c, \"scale\": 1, \"offset\": 0})\n    return {name: report[\"count\"] for name, report in prepared.items()}\n\ndef build_report(reports, *, limit_c):\n    counts = report_counts(reports, limit_c=limit_c)\n    return {\"limit_c\": limit_c, \"counts\": counts}\n\ndef build_run_record(reports, *, limit_c, required, installed):\n    drift = sorted(name for name, version in required.items()\n                   if installed.get(name) != version)\n    return {\"report\": build_report(reports, limit_c=limit_c),\n            \"version_drift\": drift}\n\ndef build_project_run(reports, metadata_text, *, limit_c, required, installed):\n    metadata = tomllib.loads(metadata_text)\n    project = metadata.get(\"project\")\n    if not isinstance(project, dict):\n        raise ValueError(\"Missing project table\")\n    name = project.get(\"name\")\n    dependencies = project.get(\"dependencies\")\n    if not isinstance(name, str) or not name.strip():\n        raise ValueError(\"Project name must be nonempty text\")\n    if not isinstance(dependencies, list) or any(\n        not isinstance(value, str) or not value.strip() for value in dependencies\n    ):\n        raise ValueError(\"Dependencies must be nonempty strings\")\n    return {\"project\": name, \"declared_dependencies\": list(dependencies),\n            \"run\": build_run_record(reports, limit_c=limit_c,\n                                    required=required, installed=installed)}\n\nmetadata_text = '''\n[project]\nname = \"greenhouse-report\"\nversion = \"0.1.0\"\ndependencies = [\"parser>=2\"]\n'''\nprint(build_project_run({\"north\":[25]}, metadata_text, limit_c=25,\n                        required={\"parser\":\"2.1\"}, installed={\"parser\":\"2.1\"}))",
        "output": "{'project': 'greenhouse-report', 'declared_dependencies': ['parser>=2'], 'run': {'report': {'limit_c': 25, 'counts': {'north': 1}}, 'version_drift': []}}",
        "hints": [
          "Parse metadata as data, then validate the fields used by this manifest.",
          "A compatible-range string and a reviewed installed-version snapshot have different roles; retain both without inventing a resolver."
        ],
        "tests": [
          {
            "name": "Changed project and actual report",
            "code": "text = '[project]\\nname=\"other\"\\ndependencies=[\"z>=1\",\"a==2\"]'\nresult = build_project_run({\"x\":[0,2]}, text, limit_c=2,\n                           required={\"a\":\"2\"}, installed={})\nassert result == {\"project\":\"other\",\"declared_dependencies\":[\"z>=1\",\"a==2\"],\n                  \"run\":{\"report\":{\"limit_c\":2,\"counts\":{\"x\":1}},\"version_drift\":[\"a\"]}}"
          },
          {
            "name": "Empty declarations",
            "code": "result = build_project_run({}, '[project]\\nname=\"empty\"\\ndependencies=[]', limit_c=0, required={}, installed={})\nassert result[\"declared_dependencies\"] == [] and result[\"run\"][\"report\"][\"counts\"] == {}"
          },
          {
            "name": "Bad selected metadata",
            "code": "for text in ['name=\"x\"', '[project]\\nname=\"\"\\ndependencies=[]',\n             '[project]\\nname=\"x\"\\ndependencies=\"parser\"',\n             '[project]\\nname=\"x\"\\ndependencies=[1]']:\n    try:\n        build_project_run({}, text, limit_c=1, required={}, installed={})\n    except ValueError:\n        pass\n    else:\n        raise AssertionError(\"Invalid project metadata accepted\")"
          }
        ],
        "continuation": {
          "lesson": "/concepts/python-dependencies",
          "exercise": 0,
          "summary": "Keep the version-aware report record and attach the project's selected TOML metadata, preserving the difference between declarations and exact installed versions."
        },
        "editTarget": "def build_project_run("
      }
    ],
    "build": {
      "title": "Compare a reviewed dependency snapshot",
      "problem": "Botie has package names, reviewed versions and installed versions in matching order.",
      "challenge": "Compare the version entries, then keep package names at differing positions.",
      "sources": {
        "names": "Requested packages",
        "actual": "Installed snapshot",
        "expected": "Reviewed versions"
      },
      "cases": [
        {
          "name": "One package changed",
          "data": {
            "names": [
              "parser",
              "writer"
            ],
            "actual": [
              "2.2",
              "1.0"
            ],
            "expected": [
              "2.1",
              "1.0"
            ]
          },
          "expected": [
            "parser"
          ]
        },
        {
          "name": "A package is absent",
          "data": {
            "names": [
              "writer",
              "parser"
            ],
            "actual": [
              null,
              "2.1"
            ],
            "expected": [
              "1.0",
              "2.1"
            ]
          },
          "expected": [
            "writer"
          ]
        },
        {
          "name": "The snapshot agrees",
          "data": {
            "names": [
              "parser"
            ],
            "actual": [
              "2.1"
            ],
            "expected": [
              "2.1"
            ]
          },
          "expected": []
        }
      ],
      "recipe": {
        "op": "pyProjectKeep",
        "inputs": [
          {
            "source": "names"
          },
          {
            "op": "pyProjectMismatch",
            "inputs": [
              {
                "source": "actual"
              },
              {
                "source": "expected"
              }
            ]
          }
        ]
      },
      "why": "The inventory identifies exact drift before behavior is retested.",
      "limitation": "Snapshot equality does not establish compatibility, trustworthiness or target-platform execution.",
      "extras": [
        "constant",
        "add",
        "multiply",
        "total",
        "count"
      ],
      "draftVersion": 1
    },
    "journey": {
      "premise": "The installed setup changed while the source stayed fixed.",
      "order": "investigate-first",
      "construction": {
        "title": "Identify recorded setup differences",
        "start": "Reuse the comparison and retain the names of differing packages.",
        "outcome": "A missing installation is a difference too.",
        "hints": [
          "Keep version labels as text.",
          "Select package names using the mismatch positions."
        ]
      },
      "investigation": {
        "title": "Writer is absent and parser matches. Which name should remain?",
        "caseIndex": 1,
        "kind": "diagnose",
        "question": "Writer is absent and parser matches. Which name should remain?",
        "options": [
          {
            "label": "writer",
            "feedback": "Absence differs from its reviewed version.",
            "correct": true
          },
          {
            "label": "No names because the source is unchanged",
            "feedback": "Installed dependencies also affect execution."
          }
        ],
        "outcome": "The result identifies a setup difference without claiming to repair it."
      },
      "connections": [
        {
          "lessonId": "python-testing",
          "skill": "Compare an independent expectation",
          "why": "Version snapshots are expectations with different limits from behavior tests."
        }
      ],
      "reflection": {
        "prompt": "What does a matching snapshot leave untested?",
        "carryForward": "Record setup and execute imports and tests on the actual target platform."
      }
    },
    "fresh": {
      "name": "Versions are not decimals",
      "prompt": "Compare the required version labels with the supplied installed labels. Return the package names whose exact text differs, without treating versions as decimal numbers.",
      "data": {
        "names": [
          "adapter",
          "writer"
        ],
        "actual": [
          "1.1",
          "3.0"
        ],
        "expected": [
          "1.10",
          "3.0"
        ]
      },
      "expected": [
        "adapter"
      ],
      "why": "Converting version labels to decimal numbers would erase a distinction in this exact comparison."
    }
  },
  {
    "section": "Python Testing and Project Tools",
    "id": "python-configuration",
    "title": "Configuration and Secrets",
    "topic": "Organizing a project",
    "blurb": "Configuration lets the same program run with different settings. Reading those values at a clear boundary and validating their meaning prevents malformed settings from reaching calculations or leaking into diagnostic output.",
    "openingTitle": "A Timeout Became Text in the Calculation",
    "opening": [
      "Botie moves a timeout out of the source so installations can choose different values. The process receives text, but its worker expects a positive number of seconds. A missing setting and an empty setting also need different decisions.",
      "We need one place to read and validate settings before they are used. That boundary also needs to decide which values may appear in a report or an error message."
    ],
    "prerequisites": [
      {
        "title": "Fail early",
        "href": "/concepts/python-fail-fast"
      },
      {
        "title": "Validated records",
        "href": "/concepts/python-pydantic-models"
      },
      {
        "title": "Environments and dependencies",
        "href": "/concepts/python-dependencies"
      }
    ],
    "outputLabel": "Whether the parsed timeout fits the permitted range",
    "checkpointTitle": "Questions on Parts 1 and 2",
    "history": {
      "title": "Deployment Configuration and Twelve-Factor Config",
      "sources": [
        {
          "title": "The Twelve-Factor App: Config",
          "url": "https://12factor.net/config"
        },
        {
          "title": "Python process environment",
          "url": "https://docs.python.org/3.14/library/os.html#os.environ"
        },
        {
          "title": "Python configparser",
          "url": "https://docs.python.org/3.14/library/configparser.html"
        }
      ],
      "blocks": [
        "Applications needed different connection locations and operating settings across deployments while retaining the same source. Process environments and configuration files provided ways to supply those values separately. The Twelve-Factor App described this distinction and advocated keeping deploy-varying configuration out of application code.",
        "Separating storage does not validate the values or make them secret. A setting still needs a defined representation and a suitable access policy. The examples model this boundary with supplied dictionaries, so they never inspect the reader's actual environment."
      ]
    },
    "diagram": {
      "title": "Absence and invalid text have different meanings",
      "explanation": "The default applies only to a missing key in this example.",
      "rows": [],
      "scene": {
        "kind": "table",
        "rowHeading": "Input",
        "columns": [
          "Meaning",
          "Decision"
        ],
        "records": [
          {
            "label": "Missing key",
            "cells": [
              "Documented default",
              "10 seconds"
            ]
          },
          {
            "label": "\"5\"",
            "cells": [
              "Explicit integer text",
              "5 seconds"
            ]
          },
          {
            "label": "\"\" or \"fast\"",
            "cells": [
              "Invalid supplied text",
              "Reject"
            ]
          }
        ],
        "caption": "The exercise permits whole seconds from 1 through 60."
      }
    },
    "parts": [
      {
        "title": "Read configuration at a boundary",
        "paragraphs": [
          "An environment variable is text supplied to a process. It does not become an integer because the rest of the application expects one. A loader should read the representation, convert it deliberately and check the allowed range before dependent work begins.",
          "Pass validated settings to the code that needs them. Looking up a global setting during every calculation hides the dependency and can make a request use inconsistent settings."
        ],
        "interpretation": []
      },
      {
        "title": "Default absence without hiding invalid input",
        "paragraphs": [
          "A default is a deliberate choice when a value was not supplied. It should not silently replace malformed text that was supplied. For this timeout, absence means ten seconds and an explicit value must be ASCII decimal digit text from one through sixty.",
          "The chosen representation is a contract. Another application could accept fractions or surrounding whitespace, but it needs to document and test that choice."
        ],
        "interpretation": [],
        "examples": [
          {
            "title": "Validate an explicit dictionary",
            "paragraphs": [
              "No real environment variables are read."
            ],
            "code": "def timeout_from(settings):\n    raw = settings.get(\"TIMEOUT_SECONDS\", \"10\")\n    if not isinstance(raw, str) or not raw.isascii() or not raw.isdecimal():\n        raise ValueError(\"Supply integer text\")\n    value = int(raw)\n    if not 1 <= value <= 60:\n        raise ValueError(\"Timeout outside allowed range\")\n    return value\n\nprint(timeout_from({}))\nprint(timeout_from({\"TIMEOUT_SECONDS\":\"5\"}))\ntry:\n    timeout_from({\"TIMEOUT_SECONDS\":\"\"})\nexcept ValueError:\n    print(\"Rejected empty setting\")",
            "output": "10\n5\nRejected empty setting",
            "interpretation": [
              "The error describes the requirement without printing the whole settings object."
            ]
          }
        ]
      },
      {
        "title": "Parse Boolean text explicitly",
        "paragraphs": [
          "bool(\"false\") is True because any nonempty string is truthy. A Boolean setting needs an explicit list of accepted representations, such as the exact strings \"true\" and \"false\". Decide separately whether capitalization or whitespace is accepted.",
          "A Pydantic settings boundary can perform conversion and constraints too. Configure and test its accepted representations rather than assuming its defaults match the application's policy."
        ],
        "interpretation": [],
        "examples": [
          {
            "title": "Truthiness is not configuration parsing",
            "paragraphs": [
              "The table explicitly defines the two accepted strings."
            ],
            "code": "def parse_debug(raw):\n    choices = {\"true\": True, \"false\": False}\n    if raw not in choices:\n        raise ValueError(\"Use true or false\")\n    return choices[raw]\n\nprint(bool(\"false\"))\nprint(parse_debug(\"false\"))",
            "output": "True\nFalse",
            "interpretation": [
              "The same text has different outcomes because these are different operations."
            ]
          }
        ]
      },
      {
        "title": "Choose which settings may be reported",
        "paragraphs": [
          "A token, password or private connection string may be configuration, but that does not authorize displaying it. Environment variables are not automatically a secure secret store. Use the deployment's secret-management mechanism and limit which process can read private values.",
          "Build routine output from reviewed public fields instead of printing an entire object and removing a few familiar secret keys afterward. A new private field could otherwise leak without changing the logging code. Allowed field values still need review; a harmless-looking key does not guarantee harmless content."
        ],
        "interpretation": [],
        "examples": [
          {
            "title": "Produce an allowlisted status record",
            "paragraphs": [
              "The token is a fixed teaching placeholder, not a real credential."
            ],
            "code": "settings = {\"mode\":\"preview\", \"timeout_seconds\":10,\n            \"token\":\"teaching-placeholder\"}\npublic = {name: settings[name] for name in (\"mode\",\"timeout_seconds\")}\nprint(public)",
            "output": "{'mode': 'preview', 'timeout_seconds': 10}",
            "interpretation": [
              "Adding another private key does not automatically add it to the public record."
            ]
          }
        ]
      },
      {
        "title": "Validate before creating dependent work",
        "paragraphs": [
          "Load the settings before constructing a worker that needs them. A validation failure should identify the setting and requirement without echoing private raw values. Then keep the settings' lifetime clear instead of partly reloading configuration during a request.",
          "Dictionary-based tests can check missing, valid and invalid cases without using the host environment. Real deployment checks must establish service reachability and authorization separately. A correctly formatted endpoint does not establish a working connection."
        ],
        "interpretation": []
      }
    ],
    "questions": [
      {
        "kind": "choice",
        "prompt": "What follows the contract?",
        "options": [
          "Use zero",
          "Default to ten silently",
          "Reject the supplied range violation"
        ],
        "answer": 2,
        "because": "The value was supplied and violates the allowed range.",
        "given": {
          "description": "Question data",
          "data": "Timeout must be ASCII decimal text from 1 through 60. Input: \"0\"."
        }
      },
      {
        "kind": "trueFalse",
        "prompt": "Silently applying the default preserves that contract.",
        "answer": false,
        "because": "An invalid supplied value needs its defined failure behavior.",
        "given": {
          "description": "Question data",
          "data": "Only an absent timeout key receives a default. The key is supplied as an empty string."
        }
      },
      {
        "kind": "choice",
        "prompt": "What is the result?",
        "options": [
          "False",
          "True",
          "A parsing error"
        ],
        "answer": 1,
        "because": "A nonempty string is truthy. Parse the documented text representations.",
        "given": {
          "description": "Question data",
          "data": "DEBUG is the string \"false\". Python evaluates bool(DEBUG)."
        }
      },
      {
        "kind": "choice",
        "prompt": "Which routine status policy is safer here?",
        "options": [
          "Print everything and remove known secrets later",
          "Output only reviewed allowed fields",
          "Print everything whenever tests pass"
        ],
        "answer": 1,
        "because": "New private fields will not automatically enter the output.",
        "given": {
          "description": "Question data",
          "data": "Configuration contains mode, timeout_seconds and token."
        }
      },
      {
        "kind": "trueFalse",
        "prompt": "Handling the secret still requires suitable access controls and logging choices.",
        "answer": true,
        "because": "An environment variable can still be exposed through access or diagnostic output.",
        "given": {
          "description": "Question data",
          "data": "A secret is supplied as an environment variable."
        }
      },
      {
        "kind": "choice",
        "prompt": "What remains a separate question?",
        "options": [
          "Whether the actual endpoint is reachable and authorized",
          "Whether strings have length",
          "Whether the file has a name"
        ],
        "answer": 0,
        "because": "Representation validation does not establish actual access.",
        "given": {
          "description": "Question data",
          "data": "The loader accepted an endpoint URL and positive timeout."
        }
      }
    ],
    "practice": [
      {
        "title": "Configure the existing report run",
        "question": "Can another deployment change the report limit without bypassing its settings contract?",
        "task": [
          "Keep build_run_record. Replace run_with_settings' fixed deployment defaults with validated settings from the supplied dictionary. LIMIT_C defaults to \"25\" only when absent, must be a string that parses to a finite float, and becomes the report's limit. Preserve an explicit zero.",
          "TIMEOUT_SECONDS defaults to \"10\" only when absent and must be ASCII decimal digit text from 1 through 60 inclusive. Return settings containing limit_c and timeout_seconds, followed by run from the retained helper. Raise ValueError for invalid supplied settings before processing reports. Do not read the host environment or echo raw settings in errors. The offline worksheet records the validated timeout; it does not start timed device I/O."
        ],
        "starter": "import math\n\n# Working earlier report helpers\n\n\ndef convert_report(records):\n    \"\"\"Return named Fahrenheit readings without changing Celsius records.\"\"\"\n    result = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each reading needs a record\")\n        house = row.get(\"house\")\n        temperature_c = row.get(\"temperature_c\")\n        if not isinstance(house, str) or not house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        if type(temperature_c) not in (int, float) or (type(temperature_c) is float and not math.isfinite(temperature_c)):\n            raise ValueError(\"temperature_c must be a finite number\")\n        try:\n            temperature_f = temperature_c * 1.8 + 32\n        except OverflowError:\n            raise ValueError(\"Converted temperature is outside float range\") from None\n        if not math.isfinite(temperature_f):\n            raise ValueError(\"Converted temperature must be finite\")\n        result.append({\"house\": house, \"temperature_f\": temperature_f})\n    return result\n\ndef format_report(records):\n    rows = convert_report(records)\n    return [f\"{row[\"house\"]}: {row[\"temperature_f\"]:.1f} F\" for row in rows]\n\n\ndef summarize_alerts(readings_c, *, limit_c):\n    \"\"\"Return an inclusive Celsius alert count and total excess.\"\"\"\n    if type(limit_c) not in (int, float) or (type(limit_c) is float and not math.isfinite(limit_c)):\n        raise ValueError(\"limit_c must be finite\")\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in readings_c):\n        raise ValueError(\"Readings must be finite numbers\")\n    alerts = [value for value in readings_c if value >= limit_c]\n    try:\n        excess_c = float(sum(value - limit_c for value in alerts))\n    except OverflowError:\n        raise ValueError(\"Total excess is outside float range\") from None\n    if not math.isfinite(excess_c):\n        raise ValueError(\"Total excess must be finite\")\n    return {\"count\": len(alerts), \"excess_c\": excess_c}\n\ndef make_report(records, *, limit_c):\n    rows = convert_report(records)\n    summary = summarize_alerts([row[\"temperature_c\"] for row in records], limit_c=limit_c)\n    return {\"rows\": rows, **summary}\n\n\ndef calibrate(values, *, scale=1.0, offset=0.0):\n    \"\"\"Return calibrated values without changing the input readings.\"\"\"\n    parameters = [scale, offset, *values]\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in parameters):\n        raise ValueError(\"Calibration inputs must be finite numbers\")\n    try:\n        result = [value * scale + offset for value in values]\n    except OverflowError:\n        raise ValueError(\"Calibration is outside float range\") from None\n    if any(type(value) is float and not math.isfinite(value) for value in result):\n        raise ValueError(\"Calibrated values must be finite\")\n    return result\n\ndef calibrate_records(records, *, scale=1.0, offset=0.0):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    for row in records:\n        if not isinstance(row, dict) or not isinstance(row.get(\"house\"), str) or not row[\"house\"].strip():\n            raise ValueError(\"Every record needs a house name\")\n        value = row.get(\"temperature_c\")\n        if type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)):\n            raise ValueError(\"Every record needs a finite Celsius reading\")\n    adjusted = calibrate([row[\"temperature_c\"] for row in records], scale=scale, offset=offset)\n    return [{**row, \"temperature_c\": value} for row, value in zip(records, adjusted)]\n\ndef calibrated_report(records, *, limit_c, scale=1.0, offset=0.0):\n    adjusted = calibrate_records(records, scale=scale, offset=offset)\n    return make_report(adjusted, limit_c=limit_c)\n\ndef grouped_reports(reports, *, limit_c, scale=1.0, offset=0.0):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    calibrated_report([], limit_c=limit_c, scale=scale, offset=offset)\n    result = {}\n    for name, records in reports.items():\n        if not isinstance(name, str) or not name.strip():\n            raise ValueError(\"A report name must be nonempty text\")\n        result[name] = calibrated_report(records, limit_c=limit_c, scale=scale, offset=offset)\n    return result\n\n# Extend the program below\n\ndef prepare_reports(reports, policy):\n    if not isinstance(policy, dict) or set(policy) != {\"limit_c\", \"scale\", \"offset\"}:\n        raise ValueError(\"Policy needs exactly limit_c, scale and offset\")\n    return grouped_reports(reports, limit_c=policy[\"limit_c\"],\n                           scale=policy[\"scale\"], offset=policy[\"offset\"])\n\n\n# New project adapters: a compact per-house input and a counts-only view.\n# The complete named-record report helpers above remain available.\n\ndef count_alerts(readings_c, *, limit_c):\n    return summarize_alerts(readings_c, limit_c=limit_c)[\"count\"]\n\ndef report_counts(reports, *, limit_c):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    groups = {}\n    for house, values in reports.items():\n        if not isinstance(values, list):\n            raise ValueError(\"Each house needs a list of readings\")\n        groups[house] = [{\"house\": house, \"temperature_c\": value} for value in values]\n    prepared = prepare_reports(\n        groups, {\"limit_c\": limit_c, \"scale\": 1, \"offset\": 0})\n    return {name: report[\"count\"] for name, report in prepared.items()}\n\ndef build_report(reports, *, limit_c):\n    counts = report_counts(reports, limit_c=limit_c)\n    return {\"limit_c\": limit_c, \"counts\": counts}\n\ndef build_run_record(reports, *, limit_c, required, installed):\n    drift = sorted(name for name, version in required.items()\n                   if installed.get(name) != version)\n    return {\"report\": build_report(reports, limit_c=limit_c),\n            \"version_drift\": drift}\n\ndef run_with_settings(reports, raw_settings, *, required, installed):\n    settings = {\"limit_c\": 25.0, \"timeout_seconds\": 10}\n    return {\"settings\": settings,\n            \"run\": build_run_record(reports, limit_c=settings[\"limit_c\"],\n                                    required=required, installed=installed)}\n\nprint(run_with_settings({\"north\":[0,5]}, {\"LIMIT_C\":\"0\",\"TIMEOUT_SECONDS\":\"15\"}, required={}, installed={}))",
        "solution": "import math\n\n# Working earlier report helpers\n\n\ndef convert_report(records):\n    \"\"\"Return named Fahrenheit readings without changing Celsius records.\"\"\"\n    result = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each reading needs a record\")\n        house = row.get(\"house\")\n        temperature_c = row.get(\"temperature_c\")\n        if not isinstance(house, str) or not house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        if type(temperature_c) not in (int, float) or (type(temperature_c) is float and not math.isfinite(temperature_c)):\n            raise ValueError(\"temperature_c must be a finite number\")\n        try:\n            temperature_f = temperature_c * 1.8 + 32\n        except OverflowError:\n            raise ValueError(\"Converted temperature is outside float range\") from None\n        if not math.isfinite(temperature_f):\n            raise ValueError(\"Converted temperature must be finite\")\n        result.append({\"house\": house, \"temperature_f\": temperature_f})\n    return result\n\ndef format_report(records):\n    rows = convert_report(records)\n    return [f\"{row[\"house\"]}: {row[\"temperature_f\"]:.1f} F\" for row in rows]\n\n\ndef summarize_alerts(readings_c, *, limit_c):\n    \"\"\"Return an inclusive Celsius alert count and total excess.\"\"\"\n    if type(limit_c) not in (int, float) or (type(limit_c) is float and not math.isfinite(limit_c)):\n        raise ValueError(\"limit_c must be finite\")\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in readings_c):\n        raise ValueError(\"Readings must be finite numbers\")\n    alerts = [value for value in readings_c if value >= limit_c]\n    try:\n        excess_c = float(sum(value - limit_c for value in alerts))\n    except OverflowError:\n        raise ValueError(\"Total excess is outside float range\") from None\n    if not math.isfinite(excess_c):\n        raise ValueError(\"Total excess must be finite\")\n    return {\"count\": len(alerts), \"excess_c\": excess_c}\n\ndef make_report(records, *, limit_c):\n    rows = convert_report(records)\n    summary = summarize_alerts([row[\"temperature_c\"] for row in records], limit_c=limit_c)\n    return {\"rows\": rows, **summary}\n\n\ndef calibrate(values, *, scale=1.0, offset=0.0):\n    \"\"\"Return calibrated values without changing the input readings.\"\"\"\n    parameters = [scale, offset, *values]\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in parameters):\n        raise ValueError(\"Calibration inputs must be finite numbers\")\n    try:\n        result = [value * scale + offset for value in values]\n    except OverflowError:\n        raise ValueError(\"Calibration is outside float range\") from None\n    if any(type(value) is float and not math.isfinite(value) for value in result):\n        raise ValueError(\"Calibrated values must be finite\")\n    return result\n\ndef calibrate_records(records, *, scale=1.0, offset=0.0):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    for row in records:\n        if not isinstance(row, dict) or not isinstance(row.get(\"house\"), str) or not row[\"house\"].strip():\n            raise ValueError(\"Every record needs a house name\")\n        value = row.get(\"temperature_c\")\n        if type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)):\n            raise ValueError(\"Every record needs a finite Celsius reading\")\n    adjusted = calibrate([row[\"temperature_c\"] for row in records], scale=scale, offset=offset)\n    return [{**row, \"temperature_c\": value} for row, value in zip(records, adjusted)]\n\ndef calibrated_report(records, *, limit_c, scale=1.0, offset=0.0):\n    adjusted = calibrate_records(records, scale=scale, offset=offset)\n    return make_report(adjusted, limit_c=limit_c)\n\ndef grouped_reports(reports, *, limit_c, scale=1.0, offset=0.0):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    calibrated_report([], limit_c=limit_c, scale=scale, offset=offset)\n    result = {}\n    for name, records in reports.items():\n        if not isinstance(name, str) or not name.strip():\n            raise ValueError(\"A report name must be nonempty text\")\n        result[name] = calibrated_report(records, limit_c=limit_c, scale=scale, offset=offset)\n    return result\n\n# Extend the program below\n\ndef prepare_reports(reports, policy):\n    if not isinstance(policy, dict) or set(policy) != {\"limit_c\", \"scale\", \"offset\"}:\n        raise ValueError(\"Policy needs exactly limit_c, scale and offset\")\n    return grouped_reports(reports, limit_c=policy[\"limit_c\"],\n                           scale=policy[\"scale\"], offset=policy[\"offset\"])\n\n\n# New project adapters: a compact per-house input and a counts-only view.\n# The complete named-record report helpers above remain available.\n\ndef count_alerts(readings_c, *, limit_c):\n    return summarize_alerts(readings_c, limit_c=limit_c)[\"count\"]\n\ndef report_counts(reports, *, limit_c):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    groups = {}\n    for house, values in reports.items():\n        if not isinstance(values, list):\n            raise ValueError(\"Each house needs a list of readings\")\n        groups[house] = [{\"house\": house, \"temperature_c\": value} for value in values]\n    prepared = prepare_reports(\n        groups, {\"limit_c\": limit_c, \"scale\": 1, \"offset\": 0})\n    return {name: report[\"count\"] for name, report in prepared.items()}\n\ndef build_report(reports, *, limit_c):\n    counts = report_counts(reports, limit_c=limit_c)\n    return {\"limit_c\": limit_c, \"counts\": counts}\n\ndef build_run_record(reports, *, limit_c, required, installed):\n    drift = sorted(name for name, version in required.items()\n                   if installed.get(name) != version)\n    return {\"report\": build_report(reports, limit_c=limit_c),\n            \"version_drift\": drift}\n\ndef run_with_settings(reports, raw_settings, *, required, installed):\n    raw_limit = raw_settings.get(\"LIMIT_C\", \"25\")\n    raw_timeout = raw_settings.get(\"TIMEOUT_SECONDS\", \"10\")\n    if not isinstance(raw_limit, str):\n        raise ValueError(\"LIMIT_C must be numerical text\")\n    try:\n        limit_c = float(raw_limit)\n    except ValueError:\n        raise ValueError(\"LIMIT_C must be numerical text\") from None\n    if not math.isfinite(limit_c):\n        raise ValueError(\"LIMIT_C must be finite\")\n    if (not isinstance(raw_timeout, str) or not raw_timeout.isascii()\n            or not raw_timeout.isdecimal()):\n        raise ValueError(\"TIMEOUT_SECONDS must be decimal integer text\")\n    timeout_seconds = int(raw_timeout)\n    if not 1 <= timeout_seconds <= 60:\n        raise ValueError(\"TIMEOUT_SECONDS must be from 1 through 60\")\n    settings = {\"limit_c\": limit_c, \"timeout_seconds\": timeout_seconds}\n    return {\"settings\": settings,\n            \"run\": build_run_record(reports, limit_c=limit_c,\n                                    required=required, installed=installed)}\n\nprint(run_with_settings({\"north\":[0,5]}, {\"LIMIT_C\":\"0\",\"TIMEOUT_SECONDS\":\"15\"}, required={}, installed={}))",
        "output": "{'settings': {'limit_c': 0.0, 'timeout_seconds': 15}, 'run': {'report': {'limit_c': 0.0, 'counts': {'north': 2}}, 'version_drift': []}}",
        "hints": [
          "Absence receives a default. A supplied invalid value must not silently become that default.",
          "Validate representation and range before invoking the existing report pipeline."
        ],
        "tests": [
          {
            "name": "Defaults and explicit zero",
            "code": "default = run_with_settings({\"x\":[24,25]}, {}, required={}, installed={})\nassert default[\"settings\"] == {\"limit_c\":25.0,\"timeout_seconds\":10}\nassert default[\"run\"][\"report\"][\"counts\"] == {\"x\":1}\nzero = run_with_settings({\"x\":[-1,0]}, {\"LIMIT_C\":\"0\",\"TIMEOUT_SECONDS\":\"60\"}, required={}, installed={})\nassert zero[\"run\"][\"report\"][\"counts\"] == {\"x\":1} and zero[\"settings\"][\"timeout_seconds\"] == 60"
          },
          {
            "name": "Invalid settings fail before report iteration",
            "code": "class UnreadableReports(dict):\n    def items(self):\n        raise AssertionError(\"Reports processed before settings validation\")\nfor settings in [{\"LIMIT_C\":None},{\"LIMIT_C\":\"nan\"},{\"TIMEOUT_SECONDS\":\"\"},\n                 {\"TIMEOUT_SECONDS\":\"0\"},{\"TIMEOUT_SECONDS\":\"61\"},\n                 {\"TIMEOUT_SECONDS\":True},{\"TIMEOUT_SECONDS\":\"٥\"}]:\n    try:\n        run_with_settings(UnreadableReports(), settings, required={}, installed={})\n    except ValueError:\n        pass\n    else:\n        raise AssertionError(\"Invalid settings accepted\")"
          },
          {
            "name": "Input settings and version evidence retained",
            "code": "settings = {\"LIMIT_C\":\"5\",\"TIMEOUT_SECONDS\":\"1\",\"TOKEN\":\"placeholder\"}\nresult = run_with_settings({\"x\":[5]}, settings, required={\"a\":\"1\"}, installed={})\nassert result[\"run\"][\"version_drift\"] == [\"a\"]\nassert settings == {\"LIMIT_C\":\"5\",\"TIMEOUT_SECONDS\":\"1\",\"TOKEN\":\"placeholder\"}\nassert \"TOKEN\" not in result[\"settings\"]"
          }
        ],
        "continuation": {
          "lesson": "/concepts/python-dependencies",
          "exercise": 0,
          "summary": "Keep the version-aware report builder and replace fixed deployment settings with explicitly parsed and validated report configuration."
        },
        "editTarget": "def run_with_settings("
      },
      {
        "title": "Publish only the approved report fields",
        "question": "Can the same run be reported without copying newly attached private metadata?",
        "task": [
          "Keep the configured report run. Extend public_run_record(record), which currently copies every top-level field. Return only settings.limit_c, settings.timeout_seconds, run.report.limit_c, run.report.counts and run.version_drift in the demonstrated structure and order. Ignore every other attached field.",
          "The input is a valid earlier run with possible private metadata attached. Copy the approved dictionaries and drift list so edits to the returned structure do not mutate that run. In this teaching policy, greenhouse names and counts are approved for this output; another application must review that disclosure choice. Print the approved record without its fixed placeholder credentials."
        ],
        "starter": "import math\n\n# Working earlier report helpers\n\n\ndef convert_report(records):\n    \"\"\"Return named Fahrenheit readings without changing Celsius records.\"\"\"\n    result = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each reading needs a record\")\n        house = row.get(\"house\")\n        temperature_c = row.get(\"temperature_c\")\n        if not isinstance(house, str) or not house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        if type(temperature_c) not in (int, float) or (type(temperature_c) is float and not math.isfinite(temperature_c)):\n            raise ValueError(\"temperature_c must be a finite number\")\n        try:\n            temperature_f = temperature_c * 1.8 + 32\n        except OverflowError:\n            raise ValueError(\"Converted temperature is outside float range\") from None\n        if not math.isfinite(temperature_f):\n            raise ValueError(\"Converted temperature must be finite\")\n        result.append({\"house\": house, \"temperature_f\": temperature_f})\n    return result\n\ndef format_report(records):\n    rows = convert_report(records)\n    return [f\"{row[\"house\"]}: {row[\"temperature_f\"]:.1f} F\" for row in rows]\n\n\ndef summarize_alerts(readings_c, *, limit_c):\n    \"\"\"Return an inclusive Celsius alert count and total excess.\"\"\"\n    if type(limit_c) not in (int, float) or (type(limit_c) is float and not math.isfinite(limit_c)):\n        raise ValueError(\"limit_c must be finite\")\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in readings_c):\n        raise ValueError(\"Readings must be finite numbers\")\n    alerts = [value for value in readings_c if value >= limit_c]\n    try:\n        excess_c = float(sum(value - limit_c for value in alerts))\n    except OverflowError:\n        raise ValueError(\"Total excess is outside float range\") from None\n    if not math.isfinite(excess_c):\n        raise ValueError(\"Total excess must be finite\")\n    return {\"count\": len(alerts), \"excess_c\": excess_c}\n\ndef make_report(records, *, limit_c):\n    rows = convert_report(records)\n    summary = summarize_alerts([row[\"temperature_c\"] for row in records], limit_c=limit_c)\n    return {\"rows\": rows, **summary}\n\n\ndef calibrate(values, *, scale=1.0, offset=0.0):\n    \"\"\"Return calibrated values without changing the input readings.\"\"\"\n    parameters = [scale, offset, *values]\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in parameters):\n        raise ValueError(\"Calibration inputs must be finite numbers\")\n    try:\n        result = [value * scale + offset for value in values]\n    except OverflowError:\n        raise ValueError(\"Calibration is outside float range\") from None\n    if any(type(value) is float and not math.isfinite(value) for value in result):\n        raise ValueError(\"Calibrated values must be finite\")\n    return result\n\ndef calibrate_records(records, *, scale=1.0, offset=0.0):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    for row in records:\n        if not isinstance(row, dict) or not isinstance(row.get(\"house\"), str) or not row[\"house\"].strip():\n            raise ValueError(\"Every record needs a house name\")\n        value = row.get(\"temperature_c\")\n        if type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)):\n            raise ValueError(\"Every record needs a finite Celsius reading\")\n    adjusted = calibrate([row[\"temperature_c\"] for row in records], scale=scale, offset=offset)\n    return [{**row, \"temperature_c\": value} for row, value in zip(records, adjusted)]\n\ndef calibrated_report(records, *, limit_c, scale=1.0, offset=0.0):\n    adjusted = calibrate_records(records, scale=scale, offset=offset)\n    return make_report(adjusted, limit_c=limit_c)\n\ndef grouped_reports(reports, *, limit_c, scale=1.0, offset=0.0):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    calibrated_report([], limit_c=limit_c, scale=scale, offset=offset)\n    result = {}\n    for name, records in reports.items():\n        if not isinstance(name, str) or not name.strip():\n            raise ValueError(\"A report name must be nonempty text\")\n        result[name] = calibrated_report(records, limit_c=limit_c, scale=scale, offset=offset)\n    return result\n\n# Extend the program below\n\ndef prepare_reports(reports, policy):\n    if not isinstance(policy, dict) or set(policy) != {\"limit_c\", \"scale\", \"offset\"}:\n        raise ValueError(\"Policy needs exactly limit_c, scale and offset\")\n    return grouped_reports(reports, limit_c=policy[\"limit_c\"],\n                           scale=policy[\"scale\"], offset=policy[\"offset\"])\n\n\n# New project adapters: a compact per-house input and a counts-only view.\n# The complete named-record report helpers above remain available.\n\ndef count_alerts(readings_c, *, limit_c):\n    return summarize_alerts(readings_c, limit_c=limit_c)[\"count\"]\n\ndef report_counts(reports, *, limit_c):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    groups = {}\n    for house, values in reports.items():\n        if not isinstance(values, list):\n            raise ValueError(\"Each house needs a list of readings\")\n        groups[house] = [{\"house\": house, \"temperature_c\": value} for value in values]\n    prepared = prepare_reports(\n        groups, {\"limit_c\": limit_c, \"scale\": 1, \"offset\": 0})\n    return {name: report[\"count\"] for name, report in prepared.items()}\n\ndef build_report(reports, *, limit_c):\n    counts = report_counts(reports, limit_c=limit_c)\n    return {\"limit_c\": limit_c, \"counts\": counts}\n\ndef build_run_record(reports, *, limit_c, required, installed):\n    drift = sorted(name for name, version in required.items()\n                   if installed.get(name) != version)\n    return {\"report\": build_report(reports, limit_c=limit_c),\n            \"version_drift\": drift}\n\ndef run_with_settings(reports, raw_settings, *, required, installed):\n    raw_limit = raw_settings.get(\"LIMIT_C\", \"25\")\n    raw_timeout = raw_settings.get(\"TIMEOUT_SECONDS\", \"10\")\n    if not isinstance(raw_limit, str):\n        raise ValueError(\"LIMIT_C must be numerical text\")\n    try:\n        limit_c = float(raw_limit)\n    except ValueError:\n        raise ValueError(\"LIMIT_C must be numerical text\") from None\n    if not math.isfinite(limit_c):\n        raise ValueError(\"LIMIT_C must be finite\")\n    if (not isinstance(raw_timeout, str) or not raw_timeout.isascii()\n            or not raw_timeout.isdecimal()):\n        raise ValueError(\"TIMEOUT_SECONDS must be decimal integer text\")\n    timeout_seconds = int(raw_timeout)\n    if not 1 <= timeout_seconds <= 60:\n        raise ValueError(\"TIMEOUT_SECONDS must be from 1 through 60\")\n    settings = {\"limit_c\": limit_c, \"timeout_seconds\": timeout_seconds}\n    return {\"settings\": settings,\n            \"run\": build_run_record(reports, limit_c=limit_c,\n                                    required=required, installed=installed)}\n\ndef public_run_record(record):\n    return dict(record)\n\ninternal = run_with_settings({\"north\":[25]}, {}, required={}, installed={})\ninternal[\"token\"] = \"teaching-placeholder\"\ninternal[\"settings\"][\"private_key\"] = \"teaching-placeholder\"\ninternal[\"run\"][\"raw_environment\"] = {\"TOKEN\":\"teaching-placeholder\"}\nprint(public_run_record(internal))",
        "solution": "import math\n\n# Working earlier report helpers\n\n\ndef convert_report(records):\n    \"\"\"Return named Fahrenheit readings without changing Celsius records.\"\"\"\n    result = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each reading needs a record\")\n        house = row.get(\"house\")\n        temperature_c = row.get(\"temperature_c\")\n        if not isinstance(house, str) or not house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        if type(temperature_c) not in (int, float) or (type(temperature_c) is float and not math.isfinite(temperature_c)):\n            raise ValueError(\"temperature_c must be a finite number\")\n        try:\n            temperature_f = temperature_c * 1.8 + 32\n        except OverflowError:\n            raise ValueError(\"Converted temperature is outside float range\") from None\n        if not math.isfinite(temperature_f):\n            raise ValueError(\"Converted temperature must be finite\")\n        result.append({\"house\": house, \"temperature_f\": temperature_f})\n    return result\n\ndef format_report(records):\n    rows = convert_report(records)\n    return [f\"{row[\"house\"]}: {row[\"temperature_f\"]:.1f} F\" for row in rows]\n\n\ndef summarize_alerts(readings_c, *, limit_c):\n    \"\"\"Return an inclusive Celsius alert count and total excess.\"\"\"\n    if type(limit_c) not in (int, float) or (type(limit_c) is float and not math.isfinite(limit_c)):\n        raise ValueError(\"limit_c must be finite\")\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in readings_c):\n        raise ValueError(\"Readings must be finite numbers\")\n    alerts = [value for value in readings_c if value >= limit_c]\n    try:\n        excess_c = float(sum(value - limit_c for value in alerts))\n    except OverflowError:\n        raise ValueError(\"Total excess is outside float range\") from None\n    if not math.isfinite(excess_c):\n        raise ValueError(\"Total excess must be finite\")\n    return {\"count\": len(alerts), \"excess_c\": excess_c}\n\ndef make_report(records, *, limit_c):\n    rows = convert_report(records)\n    summary = summarize_alerts([row[\"temperature_c\"] for row in records], limit_c=limit_c)\n    return {\"rows\": rows, **summary}\n\n\ndef calibrate(values, *, scale=1.0, offset=0.0):\n    \"\"\"Return calibrated values without changing the input readings.\"\"\"\n    parameters = [scale, offset, *values]\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in parameters):\n        raise ValueError(\"Calibration inputs must be finite numbers\")\n    try:\n        result = [value * scale + offset for value in values]\n    except OverflowError:\n        raise ValueError(\"Calibration is outside float range\") from None\n    if any(type(value) is float and not math.isfinite(value) for value in result):\n        raise ValueError(\"Calibrated values must be finite\")\n    return result\n\ndef calibrate_records(records, *, scale=1.0, offset=0.0):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    for row in records:\n        if not isinstance(row, dict) or not isinstance(row.get(\"house\"), str) or not row[\"house\"].strip():\n            raise ValueError(\"Every record needs a house name\")\n        value = row.get(\"temperature_c\")\n        if type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)):\n            raise ValueError(\"Every record needs a finite Celsius reading\")\n    adjusted = calibrate([row[\"temperature_c\"] for row in records], scale=scale, offset=offset)\n    return [{**row, \"temperature_c\": value} for row, value in zip(records, adjusted)]\n\ndef calibrated_report(records, *, limit_c, scale=1.0, offset=0.0):\n    adjusted = calibrate_records(records, scale=scale, offset=offset)\n    return make_report(adjusted, limit_c=limit_c)\n\ndef grouped_reports(reports, *, limit_c, scale=1.0, offset=0.0):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    calibrated_report([], limit_c=limit_c, scale=scale, offset=offset)\n    result = {}\n    for name, records in reports.items():\n        if not isinstance(name, str) or not name.strip():\n            raise ValueError(\"A report name must be nonempty text\")\n        result[name] = calibrated_report(records, limit_c=limit_c, scale=scale, offset=offset)\n    return result\n\n# Extend the program below\n\ndef prepare_reports(reports, policy):\n    if not isinstance(policy, dict) or set(policy) != {\"limit_c\", \"scale\", \"offset\"}:\n        raise ValueError(\"Policy needs exactly limit_c, scale and offset\")\n    return grouped_reports(reports, limit_c=policy[\"limit_c\"],\n                           scale=policy[\"scale\"], offset=policy[\"offset\"])\n\n\n# New project adapters: a compact per-house input and a counts-only view.\n# The complete named-record report helpers above remain available.\n\ndef count_alerts(readings_c, *, limit_c):\n    return summarize_alerts(readings_c, limit_c=limit_c)[\"count\"]\n\ndef report_counts(reports, *, limit_c):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    groups = {}\n    for house, values in reports.items():\n        if not isinstance(values, list):\n            raise ValueError(\"Each house needs a list of readings\")\n        groups[house] = [{\"house\": house, \"temperature_c\": value} for value in values]\n    prepared = prepare_reports(\n        groups, {\"limit_c\": limit_c, \"scale\": 1, \"offset\": 0})\n    return {name: report[\"count\"] for name, report in prepared.items()}\n\ndef build_report(reports, *, limit_c):\n    counts = report_counts(reports, limit_c=limit_c)\n    return {\"limit_c\": limit_c, \"counts\": counts}\n\ndef build_run_record(reports, *, limit_c, required, installed):\n    drift = sorted(name for name, version in required.items()\n                   if installed.get(name) != version)\n    return {\"report\": build_report(reports, limit_c=limit_c),\n            \"version_drift\": drift}\n\ndef run_with_settings(reports, raw_settings, *, required, installed):\n    raw_limit = raw_settings.get(\"LIMIT_C\", \"25\")\n    raw_timeout = raw_settings.get(\"TIMEOUT_SECONDS\", \"10\")\n    if not isinstance(raw_limit, str):\n        raise ValueError(\"LIMIT_C must be numerical text\")\n    try:\n        limit_c = float(raw_limit)\n    except ValueError:\n        raise ValueError(\"LIMIT_C must be numerical text\") from None\n    if not math.isfinite(limit_c):\n        raise ValueError(\"LIMIT_C must be finite\")\n    if (not isinstance(raw_timeout, str) or not raw_timeout.isascii()\n            or not raw_timeout.isdecimal()):\n        raise ValueError(\"TIMEOUT_SECONDS must be decimal integer text\")\n    timeout_seconds = int(raw_timeout)\n    if not 1 <= timeout_seconds <= 60:\n        raise ValueError(\"TIMEOUT_SECONDS must be from 1 through 60\")\n    settings = {\"limit_c\": limit_c, \"timeout_seconds\": timeout_seconds}\n    return {\"settings\": settings,\n            \"run\": build_run_record(reports, limit_c=limit_c,\n                                    required=required, installed=installed)}\n\ndef public_run_record(record):\n    settings = record[\"settings\"]\n    run = record[\"run\"]\n    report = run[\"report\"]\n    return {\n        \"settings\": {\"limit_c\": settings[\"limit_c\"],\n                     \"timeout_seconds\": settings[\"timeout_seconds\"]},\n        \"run\": {\"report\": {\"limit_c\": report[\"limit_c\"],\n                           \"counts\": dict(report[\"counts\"])},\n                \"version_drift\": list(run[\"version_drift\"])}\n    }\n\ninternal = run_with_settings({\"north\":[25]}, {}, required={}, installed={})\ninternal[\"token\"] = \"teaching-placeholder\"\ninternal[\"settings\"][\"private_key\"] = \"teaching-placeholder\"\ninternal[\"run\"][\"raw_environment\"] = {\"TOKEN\":\"teaching-placeholder\"}\nprint(public_run_record(internal))",
        "output": "{'settings': {'limit_c': 25.0, 'timeout_seconds': 10}, 'run': {'report': {'limit_c': 25.0, 'counts': {'north': 1}}, 'version_drift': []}}",
        "hints": [
          "Build output from approved paths instead of deleting a few familiar secret names.",
          "Copy the counts dictionary and version list rather than retaining mutable aliases."
        ],
        "tests": [
          {
            "name": "New nested private fields stay excluded",
            "code": "record = run_with_settings({\"x\":[0]}, {\"LIMIT_C\":\"0\"}, required={\"a\":\"1\"}, installed={})\nrecord[\"new_secret\"] = \"placeholder\"\nrecord[\"run\"][\"report\"][\"raw_input\"] = \"placeholder\"\nresult = public_run_record(record)\nassert result == {\"settings\":{\"limit_c\":0.0,\"timeout_seconds\":10},\n                  \"run\":{\"report\":{\"limit_c\":0.0,\"counts\":{\"x\":1}},\"version_drift\":[\"a\"]}}"
          },
          {
            "name": "Approved mutable containers are independent",
            "code": "record = run_with_settings({\"x\":[1]}, {}, required={\"a\":\"1\"}, installed={})\nresult = public_run_record(record)\nresult[\"settings\"][\"timeout_seconds\"] = 1\nresult[\"run\"][\"report\"][\"counts\"][\"x\"] = 99\nresult[\"run\"][\"version_drift\"].append(\"other\")\nassert record[\"settings\"][\"timeout_seconds\"] == 10\nassert record[\"run\"][\"report\"][\"counts\"] == {\"x\":0}\nassert record[\"run\"][\"version_drift\"] == [\"a\"]"
          },
          {
            "name": "No mutation or diagnostic output",
            "code": "import copy, io\nfrom contextlib import redirect_stdout\nrecord = run_with_settings({}, {}, required={}, installed={})\nrecord[\"token\"] = \"placeholder\"\nsaved = copy.deepcopy(record)\nstream = io.StringIO()\nwith redirect_stdout(stream):\n    public_run_record(record)\nassert record == saved and stream.getvalue() == \"\""
          }
        ],
        "continuation": {
          "lesson": "/concepts/python-configuration",
          "exercise": 0,
          "summary": "Keep the configured report artifact and add a publication boundary that selects approved nested fields and separates their mutable containers."
        },
        "editTarget": "def public_run_record("
      }
    ],
    "build": {
      "title": "Check a timeout before use",
      "problem": "Botie receives raw timeout text and explicit allowed limits.",
      "challenge": "Parse the integer, then require it to lie within the supplied inclusive range. An unparsed value must fail.",
      "sources": {
        "raw": "Raw timeout",
        "minimum": "Minimum seconds",
        "maximum": "Maximum seconds"
      },
      "cases": [
        {
          "name": "Valid text",
          "data": {
            "raw": "12",
            "minimum": 1,
            "maximum": 60
          },
          "expected": true
        },
        {
          "name": "Too small",
          "data": {
            "raw": "0",
            "minimum": 1,
            "maximum": 60
          },
          "expected": false
        },
        {
          "name": "Not integer text",
          "data": {
            "raw": "fast",
            "minimum": 1,
            "maximum": 60
          },
          "expected": false
        },
        {
          "name": "Upper boundary",
          "data": {
            "raw": "60",
            "minimum": 1,
            "maximum": 60
          },
          "expected": true
        }
      ],
      "recipe": {
        "op": "pyProjectInRange",
        "inputs": [
          {
            "op": "pyProjectParseInteger",
            "inputs": [
              {
                "source": "raw"
              }
            ]
          },
          {
            "source": "minimum"
          },
          {
            "source": "maximum"
          }
        ]
      },
      "why": "Parsing and the permitted range answer separate questions.",
      "limitation": "The workshop parser is a small decimal-integer teaching model and returns null on failure. It is not Python's full parser or Pydantic. The coding task has a narrower ASCII-digit contract.",
      "extras": [
        "constant",
        "add",
        "multiply",
        "total",
        "count"
      ],
      "draftVersion": 1
    },
    "journey": {
      "premise": "A setting changed representation when it moved outside source code.",
      "order": "investigate-first",
      "construction": {
        "title": "Separate parsing from the allowed range",
        "start": "Connect raw text to the parser, then give its result and both limits to the range check.",
        "outcome": "Invalid representation and range both prevent acceptance.",
        "hints": [
          "Parsing can produce null for an invalid representation.",
          "The range check must reject null as well as out-of-range numbers."
        ]
      },
      "investigation": {
        "title": "The value is \"0\" and the range is 1 through 60. Is parsing enough?",
        "caseIndex": 1,
        "kind": "diagnose",
        "question": "The value is \"0\" and the range is 1 through 60. Is parsing enough?",
        "options": [
          {
            "label": "No; zero fails the range",
            "feedback": "Application meaning adds a requirement beyond representation.",
            "correct": true
          },
          {
            "label": "Yes; every integer is an acceptable timeout",
            "feedback": "The minimum remains part of the contract."
          }
        ],
        "outcome": "Try malformed text and the exact upper boundary."
      },
      "connections": [
        {
          "lessonId": "python-pydantic-models",
          "skill": "Separate structural validation from constraints",
          "why": "The consuming operation still determines which values are acceptable."
        }
      ],
      "reflection": {
        "prompt": "Which values may safely appear in a settings diagnostic?",
        "carryForward": "Validate before dependent work and choose public output explicitly."
      }
    },
    "fresh": {
      "name": "A narrower deployment limit",
      "prompt": "The raw value remains \"12\", but the range becomes 2 through 8. Predict acceptance.",
      "data": {
        "raw": "12",
        "minimum": 2,
        "maximum": 8
      },
      "expected": false,
      "why": "The same construction must follow supplied limits rather than remembering the first range."
    }
  },
  {
    "section": "Python Testing and Project Tools",
    "id": "python-code-checks",
    "title": "Formatting, Linting, and Type Checks",
    "topic": "Checking a project",
    "blurb": "Formatting, linting, static type analysis and behavior tests answer different questions. Automating them catches routine problems while leaving design decisions and application requirements visible.",
    "openingTitle": "The Formatter Passed a Wrong Calculation",
    "opening": [
      "Botie formats an alert function and sees a successful check. The function still excludes a reading on the boundary. The formatter never promised to check that rule.",
      "We need to choose checks for the questions they answer, run each required check, and keep a skipped job distinct from a passing one."
    ],
    "prerequisites": [
      {
        "title": "Readable code",
        "href": "/concepts/python-readable-code"
      },
      {
        "title": "Type hints",
        "href": "/concepts/python-type-hints"
      },
      {
        "title": "Behavior tests",
        "href": "/concepts/python-testing"
      },
      {
        "title": "Project configuration",
        "href": "/concepts/python-configuration"
      }
    ],
    "outputLabel": "Whether every required check ran and passed",
    "checkpointTitle": "Questions on Parts 1 and 2",
    "history": {
      "title": "Python Style Checks and Static Analysis",
      "sources": [
        {
          "title": "PEP 8: Python style",
          "url": "https://peps.python.org/pep-0008/"
        },
        {
          "title": "PEP 484: type hints",
          "url": "https://peps.python.org/pep-0484/"
        },
        {
          "title": "Ruff linter",
          "url": "https://docs.astral.sh/ruff/linter/"
        },
        {
          "title": "Running mypy",
          "url": "https://mypy.readthedocs.io/en/stable/running_mypy.html"
        }
      ],
      "blocks": [
        "PEP 8, created in 2001, documented conventions intended to make Python readable and consistent. Rechecking routine conventions manually consumes reviewer attention. Formatters and linters automate selected parts of that repeated work, while projects still choose which conventions suit their code.",
        "PEP 484, proposed in 2014 for Python 3.5, standardized a vocabulary for optional static type analysis. A checker can follow those declarations without executing the application. This adds evidence about interfaces, while behavior tests still check requirements on actual executions. The tools have complementary scopes, rather than interchangeable definitions of correctness."
      ]
    },
    "diagram": {
      "title": "Choose the check for the question",
      "explanation": "Interpret each success within the check's scope.",
      "rows": [],
      "scene": {
        "kind": "table",
        "rowHeading": "Check",
        "columns": [
          "Question",
          "Still needed"
        ],
        "records": [
          {
            "label": "Formatter",
            "cells": [
              "Configured layout?",
              "Behavior"
            ]
          },
          {
            "label": "Linter",
            "cells": [
              "Selected code patterns?",
              "Application requirements"
            ]
          },
          {
            "label": "Type checker",
            "cells": [
              "Declared interfaces agree?",
              "Runtime validation"
            ]
          },
          {
            "label": "Tests",
            "cells": [
              "Specified cases behave?",
              "Untested inputs and integrations"
            ]
          }
        ],
        "caption": "A role description does not guarantee that every tool catches every possible defect in its category."
      }
    },
    "parts": [
      {
        "title": "Distinguish format from behavior",
        "paragraphs": [
          "A formatter makes configured layout choices consistently, including spacing and line wrapping. It reduces routine formatting debate, but does not decide whether a formula matches the requirement. A formatting pass can preserve an incorrect program perfectly.",
          "A linter inspects selected code patterns, such as an unused import or undefined name. Configure rules for the project rather than enabling every available convention without reviewing its effects. Tool success should not be renamed complete correctness."
        ],
        "interpretation": []
      },
      {
        "title": "Follow types without executing the application",
        "paragraphs": [
          "A static checker uses annotations and inference to inspect operations and interfaces. It can identify incompatible arguments or a path that may return None where a number is expected. Its evidence depends on available type information, including untyped dependencies and Any.",
          "It does not validate a received JSON document at runtime. Keep the boundary checks introduced earlier even when internal interfaces are annotated."
        ],
        "interpretation": [],
        "examples": [
          {
            "title": "Annotations do not perform validation",
            "paragraphs": [
              "Both arguments are strings, so ordinary concatenation succeeds despite the annotations."
            ],
            "code": "def combine(left: int, right: int) -> int:\n    return left + right\n\nprint(combine(\"12\", \"3\"))",
            "output": "123",
            "interpretation": [
              "A configured static checker should flag these argument types. Python execution alone does not enforce the annotations."
            ]
          }
        ]
      },
      {
        "title": "Run repeatable project commands",
        "paragraphs": [
          "Expose a documented set of development commands and run the same checks locally and in continuous integration, meaning automated checks triggered by a proposed change. Use the project's recorded tool versions and environment.",
          "Ruff provides linting and formatting. A type checker such as mypy examines declared interfaces. pytest or unittest runs behavior checks. Configure their scope and review automatic fixes rather than accepting every edit unexamined."
        ],
        "interpretation": [],
        "references": [
          {
            "title": "Local checks with separate outcomes",
            "description": [
              "Run these commands from your own project root with its development environment active. They are not browser installations."
            ],
            "language": "bash",
            "code": "python -m ruff format --check .\npython -m ruff check .\npython -m mypy src\npython -m pytest",
            "setup": [
              "Install the selected tools through the project's recorded development dependency workflow.",
              "Configure Ruff and mypy for the supported Python version and checked paths.",
              "Use src only if the project has that layout; otherwise supply its actual importable package path."
            ],
            "interpretation": [
              "Each command has its own result. A skipped command provides no successful evidence."
            ],
            "source": {
              "title": "Ruff documentation",
              "url": "https://docs.astral.sh/ruff/"
            },
            "checkedOn": "2026-11-18"
          }
        ]
      },
      {
        "title": "Keep missing evidence distinct from a pass",
        "paragraphs": [
          "A release gate should require every mandatory check to have run and passed. A missing job, skipped command or stale result is not a new success. Associate recorded evidence with the source revision under review.",
          "Inspect a failure before changing code to silence it. Removing assertions or replacing useful types with Any can hide the original problem. A justified narrow suppression should explain the actual reason and retain the relevant behavior check."
        ],
        "interpretation": [],
        "examples": [
          {
            "title": "Check execution and success separately",
            "paragraphs": [
              "The test job did not run, even though its stale passed field is true."
            ],
            "code": "statuses = [\n    {\"name\":\"format\", \"ran\":True, \"passed\":True},\n    {\"name\":\"tests\", \"ran\":False, \"passed\":True},\n]\nready = bool(statuses) and all(\n    item[\"ran\"] is True and item[\"passed\"] is True for item in statuses\n)\nprint(ready)",
            "output": "False",
            "interpretation": [
              "This gate lacks passing evidence from every required check. It does not diagnose the code repair."
            ]
          }
        ]
      }
    ],
    "questions": [
      {
        "kind": "choice",
        "prompt": "What has its pass established?",
        "options": [
          "Configured formatting was satisfied",
          "Every threshold case works",
          "Incoming data was validated"
        ],
        "answer": 0,
        "because": "Formatting concerns presentation, not the application's behavior.",
        "given": {
          "description": "Question data",
          "data": "A formatter accepts an incorrect threshold comparison."
        }
      },
      {
        "kind": "trueFalse",
        "prompt": "A static checker can report argument-type errors in this code.",
        "answer": true,
        "because": "The declared parameters are integers and the supplied arguments are strings. Static analysis can identify that mismatch without executing the application.",
        "given": {
          "description": "Question data",
          "data": "def combine(left: int, right: int) -> int:\n    return left + right\n\ncombine(\"12\", \"3\")"
        }
      },
      {
        "kind": "choice",
        "prompt": "How should a release gate treat it?",
        "options": [
          "A pass because no failure was observed",
          "Missing evidence",
          "Proof that tests are unnecessary"
        ],
        "answer": 1,
        "because": "The required job must actually run and pass.",
        "given": {
          "description": "Question data",
          "data": "A mandatory test job did not run."
        }
      },
      {
        "kind": "trueFalse",
        "prompt": "Those results automatically verify a newer revision.",
        "answer": false,
        "because": "Check evidence must belong to the source being considered.",
        "given": {
          "description": "Question data",
          "data": "All checks passed for an older source revision."
        }
      },
      {
        "kind": "choice",
        "prompt": "What is reasonable?",
        "options": [
          "Review a narrow documented exception",
          "Disable every check",
          "Change behavior without inspection"
        ],
        "answer": 0,
        "because": "A tool supports judgment rather than replacing it.",
        "given": {
          "description": "Question data",
          "data": "An intentional convention violation has a well-understood reason."
        }
      },
      {
        "kind": "choice",
        "prompt": "What is still needed?",
        "options": [
          "Runtime boundary validation",
          "Assume annotations inspected it",
          "Only formatting"
        ],
        "answer": 0,
        "because": "Static analysis does not validate arbitrary incoming runtime data.",
        "given": {
          "description": "Question data",
          "data": "A typed application receives an untrusted document."
        }
      }
    ],
    "practice": [
      {
        "title": "Combine real report tests with project checks",
        "question": "Does a passing report suite justify releasing when another required check never ran?",
        "task": [
          "Keep run_suite and the report regression suite. Their actual pass result now supplies the tests status. Extend release_ready(statuses, required) so a nonempty required set is accepted only when every required name has a record with ran and passed exactly True.",
          "Reject duplicate status names or required names with ValueError, ignore extra status names, and fail when a required record is missing. Do not change the earlier report calculation or replace its test result with a constant. The other statuses are supplied fixtures; the worksheet does not pretend to run Ruff or a static checker. Print the gate decision."
        ],
        "starter": "import unittest\n\nimport math\n\n# Working earlier report helpers\n\n\ndef convert_report(records):\n    \"\"\"Return named Fahrenheit readings without changing Celsius records.\"\"\"\n    result = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each reading needs a record\")\n        house = row.get(\"house\")\n        temperature_c = row.get(\"temperature_c\")\n        if not isinstance(house, str) or not house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        if type(temperature_c) not in (int, float) or (type(temperature_c) is float and not math.isfinite(temperature_c)):\n            raise ValueError(\"temperature_c must be a finite number\")\n        try:\n            temperature_f = temperature_c * 1.8 + 32\n        except OverflowError:\n            raise ValueError(\"Converted temperature is outside float range\") from None\n        if not math.isfinite(temperature_f):\n            raise ValueError(\"Converted temperature must be finite\")\n        result.append({\"house\": house, \"temperature_f\": temperature_f})\n    return result\n\ndef format_report(records):\n    rows = convert_report(records)\n    return [f\"{row[\"house\"]}: {row[\"temperature_f\"]:.1f} F\" for row in rows]\n\n\ndef summarize_alerts(readings_c, *, limit_c):\n    \"\"\"Return an inclusive Celsius alert count and total excess.\"\"\"\n    if type(limit_c) not in (int, float) or (type(limit_c) is float and not math.isfinite(limit_c)):\n        raise ValueError(\"limit_c must be finite\")\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in readings_c):\n        raise ValueError(\"Readings must be finite numbers\")\n    alerts = [value for value in readings_c if value >= limit_c]\n    try:\n        excess_c = float(sum(value - limit_c for value in alerts))\n    except OverflowError:\n        raise ValueError(\"Total excess is outside float range\") from None\n    if not math.isfinite(excess_c):\n        raise ValueError(\"Total excess must be finite\")\n    return {\"count\": len(alerts), \"excess_c\": excess_c}\n\ndef make_report(records, *, limit_c):\n    rows = convert_report(records)\n    summary = summarize_alerts([row[\"temperature_c\"] for row in records], limit_c=limit_c)\n    return {\"rows\": rows, **summary}\n\n\ndef calibrate(values, *, scale=1.0, offset=0.0):\n    \"\"\"Return calibrated values without changing the input readings.\"\"\"\n    parameters = [scale, offset, *values]\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in parameters):\n        raise ValueError(\"Calibration inputs must be finite numbers\")\n    try:\n        result = [value * scale + offset for value in values]\n    except OverflowError:\n        raise ValueError(\"Calibration is outside float range\") from None\n    if any(type(value) is float and not math.isfinite(value) for value in result):\n        raise ValueError(\"Calibrated values must be finite\")\n    return result\n\ndef calibrate_records(records, *, scale=1.0, offset=0.0):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    for row in records:\n        if not isinstance(row, dict) or not isinstance(row.get(\"house\"), str) or not row[\"house\"].strip():\n            raise ValueError(\"Every record needs a house name\")\n        value = row.get(\"temperature_c\")\n        if type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)):\n            raise ValueError(\"Every record needs a finite Celsius reading\")\n    adjusted = calibrate([row[\"temperature_c\"] for row in records], scale=scale, offset=offset)\n    return [{**row, \"temperature_c\": value} for row, value in zip(records, adjusted)]\n\ndef calibrated_report(records, *, limit_c, scale=1.0, offset=0.0):\n    adjusted = calibrate_records(records, scale=scale, offset=offset)\n    return make_report(adjusted, limit_c=limit_c)\n\ndef grouped_reports(reports, *, limit_c, scale=1.0, offset=0.0):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    calibrated_report([], limit_c=limit_c, scale=scale, offset=offset)\n    result = {}\n    for name, records in reports.items():\n        if not isinstance(name, str) or not name.strip():\n            raise ValueError(\"A report name must be nonempty text\")\n        result[name] = calibrated_report(records, limit_c=limit_c, scale=scale, offset=offset)\n    return result\n\n# Extend the program below\n\ndef prepare_reports(reports, policy):\n    if not isinstance(policy, dict) or set(policy) != {\"limit_c\", \"scale\", \"offset\"}:\n        raise ValueError(\"Policy needs exactly limit_c, scale and offset\")\n    return grouped_reports(reports, limit_c=policy[\"limit_c\"],\n                           scale=policy[\"scale\"], offset=policy[\"offset\"])\n\n\n# New project adapters: a compact per-house input and a counts-only view.\n# The complete named-record report helpers above remain available.\n\ndef count_alerts(readings_c, *, limit_c):\n    return summarize_alerts(readings_c, limit_c=limit_c)[\"count\"]\n\ndef report_counts(reports, *, limit_c):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    groups = {}\n    for house, values in reports.items():\n        if not isinstance(values, list):\n            raise ValueError(\"Each house needs a list of readings\")\n        groups[house] = [{\"house\": house, \"temperature_c\": value} for value in values]\n    prepared = prepare_reports(\n        groups, {\"limit_c\": limit_c, \"scale\": 1, \"offset\": 0})\n    return {name: report[\"count\"] for name, report in prepared.items()}\n\ndef report_tests(candidate):\n    class Checks(unittest.TestCase):\n        def test_ordinary(self):\n            self.assertEqual(candidate({\"north\":[18,29],\"south\":[20]}, limit_c=25),\n                             {\"north\":1,\"south\":0})\n        def test_boundary_and_empty_report(self):\n            self.assertEqual(candidate({\"north\":[24,25],\"empty\":[]}, limit_c=25),\n                             {\"north\":1,\"empty\":0})\n        def test_changed_limit(self):\n            self.assertEqual(candidate({\"north\":[25,29]}, limit_c=29), {\"north\":1})\n        def test_empty_mapping(self):\n            self.assertEqual(candidate({}, limit_c=25), {})\n        def test_invalid_limit(self):\n            with self.assertRaises(ValueError):\n                candidate({}, limit_c=float(\"nan\"))\n    return unittest.defaultTestLoader.loadTestsFromTestCase(Checks)\n\ndef run_suite(suite):\n    result = unittest.TestResult()\n    suite.run(result)\n    names = {test.id().rsplit(\".\", 1)[-1]\n             for test, _ in result.failures + result.errors}\n    return {\"tests_run\": result.testsRun,\n            \"passed\": result.wasSuccessful(),\n            \"failed_tests\": sorted(names)}\n\ndef release_ready(statuses, required):\n    return all(item[\"passed\"] for item in statuses)\n\nreport_check = run_suite(report_tests(report_counts))\nstatuses = [\n    {\"name\":\"format\",\"ran\":True,\"passed\":True},\n    {\"name\":\"tests\",\"ran\":True,\"passed\":report_check[\"passed\"]},\n    {\"name\":\"typing\",\"ran\":False,\"passed\":True},\n]\nprint(release_ready(statuses, [\"format\",\"tests\",\"typing\"]))",
        "solution": "import unittest\n\nimport math\n\n# Working earlier report helpers\n\n\ndef convert_report(records):\n    \"\"\"Return named Fahrenheit readings without changing Celsius records.\"\"\"\n    result = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each reading needs a record\")\n        house = row.get(\"house\")\n        temperature_c = row.get(\"temperature_c\")\n        if not isinstance(house, str) or not house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        if type(temperature_c) not in (int, float) or (type(temperature_c) is float and not math.isfinite(temperature_c)):\n            raise ValueError(\"temperature_c must be a finite number\")\n        try:\n            temperature_f = temperature_c * 1.8 + 32\n        except OverflowError:\n            raise ValueError(\"Converted temperature is outside float range\") from None\n        if not math.isfinite(temperature_f):\n            raise ValueError(\"Converted temperature must be finite\")\n        result.append({\"house\": house, \"temperature_f\": temperature_f})\n    return result\n\ndef format_report(records):\n    rows = convert_report(records)\n    return [f\"{row[\"house\"]}: {row[\"temperature_f\"]:.1f} F\" for row in rows]\n\n\ndef summarize_alerts(readings_c, *, limit_c):\n    \"\"\"Return an inclusive Celsius alert count and total excess.\"\"\"\n    if type(limit_c) not in (int, float) or (type(limit_c) is float and not math.isfinite(limit_c)):\n        raise ValueError(\"limit_c must be finite\")\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in readings_c):\n        raise ValueError(\"Readings must be finite numbers\")\n    alerts = [value for value in readings_c if value >= limit_c]\n    try:\n        excess_c = float(sum(value - limit_c for value in alerts))\n    except OverflowError:\n        raise ValueError(\"Total excess is outside float range\") from None\n    if not math.isfinite(excess_c):\n        raise ValueError(\"Total excess must be finite\")\n    return {\"count\": len(alerts), \"excess_c\": excess_c}\n\ndef make_report(records, *, limit_c):\n    rows = convert_report(records)\n    summary = summarize_alerts([row[\"temperature_c\"] for row in records], limit_c=limit_c)\n    return {\"rows\": rows, **summary}\n\n\ndef calibrate(values, *, scale=1.0, offset=0.0):\n    \"\"\"Return calibrated values without changing the input readings.\"\"\"\n    parameters = [scale, offset, *values]\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in parameters):\n        raise ValueError(\"Calibration inputs must be finite numbers\")\n    try:\n        result = [value * scale + offset for value in values]\n    except OverflowError:\n        raise ValueError(\"Calibration is outside float range\") from None\n    if any(type(value) is float and not math.isfinite(value) for value in result):\n        raise ValueError(\"Calibrated values must be finite\")\n    return result\n\ndef calibrate_records(records, *, scale=1.0, offset=0.0):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    for row in records:\n        if not isinstance(row, dict) or not isinstance(row.get(\"house\"), str) or not row[\"house\"].strip():\n            raise ValueError(\"Every record needs a house name\")\n        value = row.get(\"temperature_c\")\n        if type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)):\n            raise ValueError(\"Every record needs a finite Celsius reading\")\n    adjusted = calibrate([row[\"temperature_c\"] for row in records], scale=scale, offset=offset)\n    return [{**row, \"temperature_c\": value} for row, value in zip(records, adjusted)]\n\ndef calibrated_report(records, *, limit_c, scale=1.0, offset=0.0):\n    adjusted = calibrate_records(records, scale=scale, offset=offset)\n    return make_report(adjusted, limit_c=limit_c)\n\ndef grouped_reports(reports, *, limit_c, scale=1.0, offset=0.0):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    calibrated_report([], limit_c=limit_c, scale=scale, offset=offset)\n    result = {}\n    for name, records in reports.items():\n        if not isinstance(name, str) or not name.strip():\n            raise ValueError(\"A report name must be nonempty text\")\n        result[name] = calibrated_report(records, limit_c=limit_c, scale=scale, offset=offset)\n    return result\n\n# Extend the program below\n\ndef prepare_reports(reports, policy):\n    if not isinstance(policy, dict) or set(policy) != {\"limit_c\", \"scale\", \"offset\"}:\n        raise ValueError(\"Policy needs exactly limit_c, scale and offset\")\n    return grouped_reports(reports, limit_c=policy[\"limit_c\"],\n                           scale=policy[\"scale\"], offset=policy[\"offset\"])\n\n\n# New project adapters: a compact per-house input and a counts-only view.\n# The complete named-record report helpers above remain available.\n\ndef count_alerts(readings_c, *, limit_c):\n    return summarize_alerts(readings_c, limit_c=limit_c)[\"count\"]\n\ndef report_counts(reports, *, limit_c):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    groups = {}\n    for house, values in reports.items():\n        if not isinstance(values, list):\n            raise ValueError(\"Each house needs a list of readings\")\n        groups[house] = [{\"house\": house, \"temperature_c\": value} for value in values]\n    prepared = prepare_reports(\n        groups, {\"limit_c\": limit_c, \"scale\": 1, \"offset\": 0})\n    return {name: report[\"count\"] for name, report in prepared.items()}\n\ndef report_tests(candidate):\n    class Checks(unittest.TestCase):\n        def test_ordinary(self):\n            self.assertEqual(candidate({\"north\":[18,29],\"south\":[20]}, limit_c=25),\n                             {\"north\":1,\"south\":0})\n        def test_boundary_and_empty_report(self):\n            self.assertEqual(candidate({\"north\":[24,25],\"empty\":[]}, limit_c=25),\n                             {\"north\":1,\"empty\":0})\n        def test_changed_limit(self):\n            self.assertEqual(candidate({\"north\":[25,29]}, limit_c=29), {\"north\":1})\n        def test_empty_mapping(self):\n            self.assertEqual(candidate({}, limit_c=25), {})\n        def test_invalid_limit(self):\n            with self.assertRaises(ValueError):\n                candidate({}, limit_c=float(\"nan\"))\n    return unittest.defaultTestLoader.loadTestsFromTestCase(Checks)\n\ndef run_suite(suite):\n    result = unittest.TestResult()\n    suite.run(result)\n    names = {test.id().rsplit(\".\", 1)[-1]\n             for test, _ in result.failures + result.errors}\n    return {\"tests_run\": result.testsRun,\n            \"passed\": result.wasSuccessful(),\n            \"failed_tests\": sorted(names)}\n\ndef release_ready(statuses, required):\n    by_name = {}\n    for item in statuses:\n        if item[\"name\"] in by_name:\n            raise ValueError(\"Duplicate check\")\n        by_name[item[\"name\"]] = item\n    if len(set(required)) != len(required):\n        raise ValueError(\"Duplicate required check\")\n    return bool(required) and all(\n        name in by_name and by_name[name][\"ran\"] is True\n        and by_name[name][\"passed\"] is True for name in required\n    )\n\nreport_check = run_suite(report_tests(report_counts))\nstatuses = [\n    {\"name\":\"format\",\"ran\":True,\"passed\":True},\n    {\"name\":\"tests\",\"ran\":True,\"passed\":report_check[\"passed\"]},\n    {\"name\":\"typing\",\"ran\":False,\"passed\":True},\n]\nprint(release_ready(statuses, [\"format\",\"tests\",\"typing\"]))",
        "output": "False",
        "hints": [
          "A successful report suite supplies one check, not every check required by the project.",
          "Separate ran from passed before combining all required names."
        ],
        "tests": [
          {
            "name": "Passing and missing requirements",
            "code": "assert release_ready([{\"name\":\"tests\",\"ran\":True,\"passed\":True}], [\"tests\"]) is True\nassert release_ready([], [\"tests\"]) is False\nassert release_ready([], []) is False"
          },
          {
            "name": "Skipped or truthy fields cannot pass",
            "code": "assert release_ready([{\"name\":\"typing\",\"ran\":False,\"passed\":True}], [\"typing\"]) is False\nassert release_ready([{\"name\":\"tests\",\"ran\":True,\"passed\":\"true\"}], [\"tests\"]) is False"
          },
          {
            "name": "Duplicate names rejected",
            "code": "for statuses, required in [([{\"name\":\"x\",\"ran\":True,\"passed\":True}]*2, [\"x\"]), ([], [\"x\",\"x\"])]:\n    try:\n        release_ready(statuses, required)\n    except ValueError:\n        pass\n    else:\n        raise AssertionError(\"Duplicate evidence accepted\")"
          },
          {
            "name": "Extra checks do not replace the required one",
            "code": "assert release_ready([{\"name\":\"format\",\"ran\":True,\"passed\":True}], [\"tests\"]) is False"
          }
        ],
        "continuation": {
          "lesson": "/concepts/python-testing",
          "exercise": 1,
          "summary": "Keep the structured result from the report regression suite and combine it with explicit execution and success records for the other required project checks."
        },
        "editTarget": "def release_ready("
      },
      {
        "title": "Explain why the project gate is closed",
        "question": "Which required checks failed, never ran, or supplied no record at all?",
        "task": [
          "Keep release_ready as the authoritative gate. Extend check_summary(statuses, required) to return ready, passed, failed, not_run and missing in that order. ready comes from the retained gate. Classify only required names, preserving their required-list order within each group.",
          "A missing record belongs to missing. A record whose ran is not exactly True belongs to not_run regardless of passed. Otherwise passed exactly True means passed and any other value means failed. Preserve the earlier duplicate-name errors, ignore extra records, and leave all inputs unchanged. Print the supplied report."
        ],
        "starter": "def release_ready(statuses, required):\n    by_name = {}\n    for item in statuses:\n        if item[\"name\"] in by_name:\n            raise ValueError(\"Duplicate check\")\n        by_name[item[\"name\"]] = item\n    if len(set(required)) != len(required):\n        raise ValueError(\"Duplicate required check\")\n    return bool(required) and all(\n        name in by_name and by_name[name][\"ran\"] is True\n        and by_name[name][\"passed\"] is True for name in required\n    )\n\ndef check_summary(statuses, required):\n    return {\"ready\": release_ready(statuses, required),\n            \"passed\": [item[\"name\"] for item in statuses if item[\"passed\"]],\n            \"failed\": [item[\"name\"] for item in statuses if not item[\"passed\"]]}\n\nstatuses = [\n    {\"name\":\"format\",\"ran\":True,\"passed\":True},\n    {\"name\":\"typing\",\"ran\":False,\"passed\":True},\n    {\"name\":\"tests\",\"ran\":True,\"passed\":False},\n]\nprint(check_summary(statuses, [\"format\",\"typing\",\"tests\",\"security\"]))",
        "solution": "def release_ready(statuses, required):\n    by_name = {}\n    for item in statuses:\n        if item[\"name\"] in by_name:\n            raise ValueError(\"Duplicate check\")\n        by_name[item[\"name\"]] = item\n    if len(set(required)) != len(required):\n        raise ValueError(\"Duplicate required check\")\n    return bool(required) and all(\n        name in by_name and by_name[name][\"ran\"] is True\n        and by_name[name][\"passed\"] is True for name in required\n    )\n\ndef check_summary(statuses, required):\n    ready = release_ready(statuses, required)\n    by_name = {item[\"name\"]: item for item in statuses}\n    result = {\"ready\": ready, \"passed\": [], \"failed\": [], \"not_run\": [], \"missing\": []}\n    for name in required:\n        if name not in by_name:\n            result[\"missing\"].append(name)\n        elif by_name[name][\"ran\"] is not True:\n            result[\"not_run\"].append(name)\n        elif by_name[name][\"passed\"] is True:\n            result[\"passed\"].append(name)\n        else:\n            result[\"failed\"].append(name)\n    return result\n\nstatuses = [\n    {\"name\":\"format\",\"ran\":True,\"passed\":True},\n    {\"name\":\"typing\",\"ran\":False,\"passed\":True},\n    {\"name\":\"tests\",\"ran\":True,\"passed\":False},\n]\nprint(check_summary(statuses, [\"format\",\"typing\",\"tests\",\"security\"]))",
        "output": "{'ready': False, 'passed': ['format'], 'failed': ['tests'], 'not_run': ['typing'], 'missing': ['security']}",
        "hints": [
          "Use the earlier gate for readiness rather than inventing another release policy.",
          "Check missing and not-run states before looking at the success flag."
        ],
        "tests": [
          {
            "name": "Missing and skipped remain distinct",
            "code": "result = check_summary([{\"name\":\"b\",\"ran\":False,\"passed\":True}], [\"a\",\"b\"])\nassert result == {\"ready\":False,\"passed\":[],\"failed\":[],\"not_run\":[\"b\"],\"missing\":[\"a\"]}"
          },
          {
            "name": "Required order and ignored extras",
            "code": "rows = [{\"name\":\"a\",\"ran\":True,\"passed\":True},\n        {\"name\":\"b\",\"ran\":True,\"passed\":True},\n        {\"name\":\"extra\",\"ran\":True,\"passed\":False}]\nresult = check_summary(rows, [\"b\",\"a\"])\nassert result[\"ready\"] is True and result[\"passed\"] == [\"b\",\"a\"]\nassert result[\"failed\"] == []"
          },
          {
            "name": "No input mutation and empty policy",
            "code": "import copy\nrows = [{\"name\":\"x\",\"ran\":True,\"passed\":False}]\nsaved = copy.deepcopy(rows)\nassert check_summary(rows, [\"x\"])[\"failed\"] == [\"x\"] and rows == saved\nassert check_summary([], []) == {\"ready\":False,\"passed\":[],\"failed\":[],\"not_run\":[],\"missing\":[]}"
          },
          {
            "name": "Duplicate policy retained",
            "code": "try:\n    check_summary([], [\"x\",\"x\"])\nexcept ValueError:\n    pass\nelse:\n    raise AssertionError(\"Earlier duplicate policy lost\")"
          }
        ],
        "continuation": {
          "lesson": "/concepts/python-code-checks",
          "exercise": 0,
          "summary": "Keep the project release gate and turn its single Boolean into a structured explanation that distinguishes failed, skipped and missing evidence."
        },
        "editTarget": "def check_summary("
      }
    ],
    "build": {
      "title": "Keep execution and success separate",
      "problem": "Botie receives every mandatory check record for one source revision.",
      "challenge": "Read ran and passed on separate branches. Require both per position, then accept only a nonempty set of passing decisions.",
      "sources": {
        "checks": "Mandatory check records"
      },
      "cases": [
        {
          "name": "One check skipped",
          "data": {
            "checks": [
              {
                "name": "format",
                "ran": true,
                "passed": true
              },
              {
                "name": "tests",
                "ran": false,
                "passed": true
              }
            ]
          },
          "expected": false
        },
        {
          "name": "A check failed",
          "data": {
            "checks": [
              {
                "name": "format",
                "ran": true,
                "passed": true
              },
              {
                "name": "tests",
                "ran": true,
                "passed": false
              }
            ]
          },
          "expected": false
        },
        {
          "name": "All required checks passed",
          "data": {
            "checks": [
              {
                "name": "typing",
                "ran": true,
                "passed": true
              },
              {
                "name": "tests",
                "ran": true,
                "passed": true
              }
            ]
          },
          "expected": true
        },
        {
          "name": "No evidence",
          "data": {
            "checks": []
          },
          "expected": false
        }
      ],
      "recipe": {
        "op": "pyProjectAll",
        "inputs": [
          {
            "op": "pyProjectAnd",
            "inputs": [
              {
                "op": "pyProjectField",
                "inputs": [
                  {
                    "source": "checks"
                  }
                ],
                "settings": {
                  "field": "ran"
                }
              },
              {
                "op": "pyProjectField",
                "inputs": [
                  {
                    "source": "checks"
                  }
                ],
                "settings": {
                  "field": "passed"
                }
              }
            ]
          }
        ]
      },
      "why": "Running and passing are separate conditions before checks are combined.",
      "limitation": "The fixture is the complete required set for one revision. A real build system must establish required names and revision identity.",
      "extras": [
        "constant",
        "add",
        "multiply",
        "total",
        "count"
      ],
      "draftVersion": 1
    },
    "journey": {
      "premise": "A formatting pass was mistaken for a correct calculation.",
      "order": "investigate-first",
      "construction": {
        "title": "Combine different evidence carefully",
        "start": "Branch check records into ran and passed lists, then require both before combining all decisions.",
        "outcome": "A skipped check cannot authorize the release.",
        "hints": [
          "Read ran and passed separately.",
          "Require both per position, then a nonempty all-true set."
        ]
      },
      "investigation": {
        "title": "Formatting passes but tests run and fail. Should the release gate accept?",
        "caseIndex": 1,
        "kind": "diagnose",
        "question": "Formatting passes but tests run and fail. Should the release gate accept?",
        "options": [
          {
            "label": "No; a mandatory behavior check failed",
            "feedback": "The formatter cannot replace that missing passing evidence.",
            "correct": true
          },
          {
            "label": "Yes; one successful tool is enough",
            "feedback": "Every mandatory check needs its own pass."
          }
        ],
        "outcome": "Try the fully passing set and the empty set."
      },
      "connections": [
        {
          "lessonId": "python-testing",
          "skill": "Keep evidence scoped to behavior",
          "why": "Tests answer requirements that formatting does not."
        },
        {
          "lessonId": "python-type-hints",
          "skill": "Use annotations with appropriate tools",
          "why": "Declarations need analysis and runtime boundaries."
        }
      ],
      "reflection": {
        "prompt": "Which tool would expose the defect you want to prevent?",
        "carryForward": "Automate complementary checks without confusing their scopes."
      }
    },
    "fresh": {
      "name": "A later job is skipped",
      "prompt": "The first check failed and the second never ran. Predict readiness.",
      "data": {
        "checks": [
          {
            "name": "lint",
            "ran": true,
            "passed": false
          },
          {
            "name": "tests",
            "ran": false,
            "passed": false
          }
        ]
      },
      "expected": false,
      "why": "A skipped job is missing evidence, while an earlier failure remains a failure."
    }
  },
  {
    "section": "Python Testing and Project Tools",
    "id": "python-logging",
    "title": "Logging and Debugging",
    "topic": "Observing a running program",
    "blurb": "A traceback shows where an exception traveled. Logging records selected events while a program runs. Appropriate context helps diagnose failures without flooding output or exposing unrelated private data.",
    "openingTitle": "The Worker Said Only “Something Went Wrong”",
    "opening": [
      "Botie's worker skipped a report, but the message identifies neither the batch nor the failed operation. Printing the whole request would reveal data the diagnosis does not need.",
      "We need a useful account of the event and a way to follow the failure to its cause. The information should be chosen for that purpose rather than recorded indiscriminately."
    ],
    "prerequisites": [
      {
        "title": "Exception handling",
        "href": "/concepts/python-exceptions"
      },
      {
        "title": "Configuration disclosure",
        "href": "/concepts/python-configuration"
      },
      {
        "title": "Project checks",
        "href": "/concepts/python-code-checks"
      }
    ],
    "outputLabel": "Selected events with only allowed fields",
    "checkpointTitle": "Questions on Parts 1 and 2",
    "history": {
      "title": "Python Logging and PEP 282",
      "sources": [
        {
          "title": "PEP 282: A Logging System",
          "url": "https://peps.python.org/pep-0282/"
        },
        {
          "title": "Python Logging HOWTO",
          "url": "https://docs.python.org/3.14/howto/logging.html"
        },
        {
          "title": "Python traceback",
          "url": "https://docs.python.org/3.14/library/traceback.html"
        }
      ],
      "blocks": [
        "Programs needed event reporting that could be configured without editing every function that produced a message. PEP 282, created in 2002, proposed named loggers, importance levels and configurable handlers for a shared logging system. Python added logging in version 2.3.",
        "The application can then choose an event destination and detail level while library code describes what happened. A traceback provides different evidence: an exception type and call path. More recorded text does not automatically make either form more useful; the context must explain the operation."
      ]
    },
    "diagram": {
      "title": "Record useful context without the whole payload",
      "explanation": "Severity and an appropriate batch identity can describe the event while private fields stay out.",
      "rows": [],
      "scene": {
        "kind": "table",
        "rowHeading": "Field",
        "columns": [
          "Example",
          "Routine output"
        ],
        "records": [
          {
            "label": "level",
            "cells": [
              "ERROR",
              "Include"
            ]
          },
          {
            "label": "batch_id",
            "cells": [
              "batch-7",
              "Include if appropriate"
            ]
          },
          {
            "label": "payload",
            "cells": [
              "Private record content",
              "Exclude"
            ]
          }
        ],
        "caption": "Even an identifier needs review if it can identify a person or reveal private activity."
      }
    },
    "parts": [
      {
        "title": "Follow the traceback before guessing",
        "paragraphs": [
          "A traceback shows the call path leading to an exception. Read the type and message, then inspect the frames connecting it to your code. The last line may describe a failed conversion while earlier frames explain which operation supplied that value.",
          "Reproduce the failure with a suitable small input, then retain a regression test. A debugger can pause execution to inspect local state. Avoid leaving permanent output that prints every record merely to locate one defect. Tracebacks and exception messages can themselves contain private values."
        ],
        "interpretation": []
      },
      {
        "title": "Separate the event from its destination",
        "paragraphs": [
          "A logger names an event source. A level describes its severity. A handler sends accepted records to a destination such as a stream or file. The application normally configures these decisions; a reusable library should not repeatedly reconfigure global logging.",
          "The standard levels progress from DEBUG through INFO, WARNING, ERROR and CRITICAL. A WARNING threshold includes more severe errors. print remains appropriate for ordinary command-line results; operational logging has a different role."
        ],
        "interpretation": [],
        "examples": [
          {
            "title": "Capture operational events in memory",
            "paragraphs": [
              "The example configures one named logger temporarily and restores its settings."
            ],
            "code": "import io\nimport logging\n\nstream = io.StringIO()\nlogger = logging.getLogger(\"course.report.example\")\nprevious_level = logger.level\nprevious_propagation = logger.propagate\nhandler = logging.StreamHandler(stream)\nhandler.setFormatter(logging.Formatter(\"%(levelname)s %(message)s\"))\nlogger.addHandler(handler)\nlogger.setLevel(logging.INFO)\nlogger.propagate = False\ntry:\n    logger.debug(\"Detailed calculation\")\n    logger.info(\"Batch %s accepted\", \"batch-7\")\n    logger.warning(\"Batch %s needs review\", \"batch-8\")\n    print(stream.getvalue(), end=\"\")\nfinally:\n    logger.removeHandler(handler)\n    handler.close()\n    logger.setLevel(previous_level)\n    logger.propagate = previous_propagation",
            "output": "INFO Batch batch-7 accepted\nWARNING Batch batch-8 needs review",
            "interpretation": [
              "DEBUG is below the selected level. No file or remote logging service is used."
            ]
          }
        ]
      },
      {
        "title": "Preserve the failure without leaking its input",
        "paragraphs": [
          "An appropriate operation or event ID can connect records without copying a request. Inside an except block, logger.exception includes exception information. Use that only when the full diagnostic trace is suitable for the destination and its access policy.",
          "A validation exception may include the rejected input. Logging its whole string can expose credentials or private records. Select an error category and reviewed fields for routine diagnostics. Avoid logging the same failure at every layer and then again at the application boundary."
        ],
        "interpretation": [],
        "examples": [
          {
            "title": "Report a category and invented batch ID",
            "paragraphs": [
              "The rejected field is not copied into the diagnostic."
            ],
            "code": "def parse_count(text):\n    return int(text)\n\ntry:\n    parse_count(\"not-a-count\")\nexcept ValueError as error:\n    diagnostic = {\"batch_id\":\"batch-7\", \"error_type\":type(error).__name__}\n    print(diagnostic)",
            "output": "{'batch_id': 'batch-7', 'error_type': 'ValueError'}",
            "interpretation": [
              "A protected diagnostic system could preserve a separately reviewed traceback. Logging also does not replace recovery or propagation behavior."
            ]
          }
        ]
      },
      {
        "title": "Test the information contract",
        "paragraphs": [
          "Capture records with an in-memory handler or unittest's assertLogs. Check useful facts such as level and selected context rather than requiring an uncontrolled timestamp. Test that private fields are excluded as well as checking which event is present.",
          "A level is not a privacy policy. ERROR can leak a token just as DEBUG can. Keep access and retention appropriate, and choose event volume for actual diagnosis rather than logging every successful row without a reason. The workshop models severity and field selection, not every detail of Python's logger hierarchy."
        ],
        "interpretation": []
      }
    ],
    "questions": [
      {
        "kind": "choice",
        "prompt": "Which pass that threshold?",
        "options": [
          "WARNING only",
          "WARNING and ERROR",
          "DEBUG and WARNING"
        ],
        "answer": 1,
        "because": "ERROR is more severe, while DEBUG is below the threshold.",
        "given": {
          "description": "Question data",
          "data": "Minimum level: WARNING. Events: DEBUG, WARNING, ERROR."
        }
      },
      {
        "kind": "trueFalse",
        "prompt": "Using print for that ordinary result is appropriate.",
        "answer": true,
        "because": "Normal command-line results can use print; operational event reporting has a different purpose.",
        "given": {
          "description": "Question data",
          "data": "A command-line program displays its normal final result."
        }
      },
      {
        "kind": "choice",
        "prompt": "What needs review before logging its complete string?",
        "options": [
          "The message and input details",
          "Only the logger variable name",
          "Its punctuation"
        ],
        "answer": 0,
        "because": "Exception text can carry private data.",
        "given": {
          "description": "Question data",
          "data": "A validation exception can contain rejected input."
        }
      },
      {
        "kind": "trueFalse",
        "prompt": "Logging alone has correctly handled the failure.",
        "answer": false,
        "because": "Recovery or propagation still needs an explicit policy.",
        "given": {
          "description": "Question data",
          "data": "The function logs a failure and continues as if it succeeded."
        }
      },
      {
        "kind": "choice",
        "prompt": "What usually gives a more stable behavior check?",
        "options": [
          "Require the identical wall-clock time",
          "Check level and appropriate context",
          "Remove all events"
        ],
        "answer": 1,
        "because": "Test the information contract rather than uncontrolled time.",
        "given": {
          "description": "Question data",
          "data": "Captured events contain a changing timestamp."
        }
      },
      {
        "kind": "choice",
        "prompt": "What should this example's public record contain?",
        "options": [
          "Every field because severity is ERROR",
          "Only reviewed level and batch_id",
          "The token without its name"
        ],
        "answer": 1,
        "because": "Severity does not authorize disclosure.",
        "given": {
          "description": "Question data",
          "data": "An event contains level, batch_id and token."
        }
      }
    ],
    "practice": [
      {
        "title": "Log the existing report’s useful metrics",
        "question": "Which metrics explain this report run without copying its record into the log?",
        "task": [
          "Keep public_run_record as the earlier disclosure boundary. Extend log_report_status(record, logger) to read the approved counts, then emit exactly one event with template \"Report completed: houses=%s alerts=%s\", passing the number of houses and sum of alert counts as formatting arguments.",
          "Use warning when the total is positive and info when it is zero. Do not print, log the whole public record, or include house names, tokens or other attached data. Return None. The supplied record is a valid earlier run; these metrics are the reviewed logging policy for this example. The recorder demonstrates Python logging's message-and-arguments interface without an external destination."
        ],
        "starter": "def public_run_record(record):\n    settings = record[\"settings\"]\n    run = record[\"run\"]\n    report = run[\"report\"]\n    return {\n        \"settings\": {\"limit_c\": settings[\"limit_c\"],\n                     \"timeout_seconds\": settings[\"timeout_seconds\"]},\n        \"run\": {\"report\": {\"limit_c\": report[\"limit_c\"],\n                           \"counts\": dict(report[\"counts\"])},\n                \"version_drift\": list(run[\"version_drift\"])}\n    }\n\nclass RecordingLogger:\n    def __init__(self):\n        self.events = []\n    def info(self, template, *args):\n        self.events.append((\"INFO\", template % args))\n    def warning(self, template, *args):\n        self.events.append((\"WARNING\", template % args))\n    def error(self, template, *args):\n        self.events.append((\"ERROR\", template % args))\n\ndef log_report_status(record, logger):\n    safe = public_run_record(record)\n    logger.info(\"Report completed: %s\", safe)\n\nrecord = {\n    \"settings\":{\"limit_c\":25.0,\"timeout_seconds\":10},\n    \"run\":{\"report\":{\"limit_c\":25.0,\"counts\":{\"north\":2,\"south\":1}},\n           \"version_drift\":[]},\n    \"token\":\"teaching-placeholder\",\n}\nlogger = RecordingLogger()\nlog_report_status(record, logger)\nprint(logger.events)",
        "solution": "def public_run_record(record):\n    settings = record[\"settings\"]\n    run = record[\"run\"]\n    report = run[\"report\"]\n    return {\n        \"settings\": {\"limit_c\": settings[\"limit_c\"],\n                     \"timeout_seconds\": settings[\"timeout_seconds\"]},\n        \"run\": {\"report\": {\"limit_c\": report[\"limit_c\"],\n                           \"counts\": dict(report[\"counts\"])},\n                \"version_drift\": list(run[\"version_drift\"])}\n    }\n\nclass RecordingLogger:\n    def __init__(self):\n        self.events = []\n    def info(self, template, *args):\n        self.events.append((\"INFO\", template % args))\n    def warning(self, template, *args):\n        self.events.append((\"WARNING\", template % args))\n    def error(self, template, *args):\n        self.events.append((\"ERROR\", template % args))\n\ndef log_report_status(record, logger):\n    safe = public_run_record(record)\n    counts = safe[\"run\"][\"report\"][\"counts\"]\n    total_alerts = sum(counts.values())\n    log = logger.warning if total_alerts else logger.info\n    log(\"Report completed: houses=%s alerts=%s\", len(counts), total_alerts)\n\nrecord = {\n    \"settings\":{\"limit_c\":25.0,\"timeout_seconds\":10},\n    \"run\":{\"report\":{\"limit_c\":25.0,\"counts\":{\"north\":2,\"south\":1}},\n           \"version_drift\":[]},\n    \"token\":\"teaching-placeholder\",\n}\nlogger = RecordingLogger()\nlog_report_status(record, logger)\nprint(logger.events)",
        "output": "[('WARNING', 'Report completed: houses=2 alerts=3')]",
        "hints": [
          "The approved publication record can still contain more detail than an operational event needs.",
          "Select the level from the computed total, then pass values as logging arguments."
        ],
        "tests": [
          {
            "name": "Actual logging API and warning level",
            "code": "import logging, unittest\nrecord = {\"settings\":{\"limit_c\":0.0,\"timeout_seconds\":10},\n          \"run\":{\"report\":{\"limit_c\":0.0,\"counts\":{\"private-house\":2}},\n                 \"version_drift\":[]},\"token\":\"private-placeholder\"}\nlogger = logging.getLogger(\"course.report.challenge.warning\")\nwith unittest.TestCase().assertLogs(logger, level=\"INFO\") as captured:\n    result = log_report_status(record, logger)\nassert result is None and len(captured.records) == 1\nassert captured.records[0].levelname == \"WARNING\"\nassert captured.records[0].getMessage() == \"Report completed: houses=1 alerts=2\""
          },
          {
            "name": "Zero alerts select info",
            "code": "import logging, unittest\nrecord = {\"settings\":{\"limit_c\":25.0,\"timeout_seconds\":10},\n          \"run\":{\"report\":{\"limit_c\":25.0,\"counts\":{\"a\":0,\"b\":0}},\n                 \"version_drift\":[]}}\nlogger = logging.getLogger(\"course.report.challenge.info\")\nwith unittest.TestCase().assertLogs(logger, level=\"INFO\") as captured:\n    log_report_status(record, logger)\nassert len(captured.records) == 1 and captured.records[0].levelname == \"INFO\"\nassert captured.records[0].getMessage() == \"Report completed: houses=2 alerts=0\""
          },
          {
            "name": "No console output or input mutation",
            "code": "import io, copy\nfrom contextlib import redirect_stdout\nrecord = {\"settings\":{\"limit_c\":25.0,\"timeout_seconds\":10},\n          \"run\":{\"report\":{\"limit_c\":25.0,\"counts\":{}},\"version_drift\":[]}}\nsaved = copy.deepcopy(record)\nlogger = RecordingLogger()\nstream = io.StringIO()\nwith redirect_stdout(stream):\n    log_report_status(record, logger)\nassert stream.getvalue() == \"\" and record == saved\nassert logger.events == [(\"INFO\",\"Report completed: houses=0 alerts=0\")]"
          }
        ],
        "continuation": {
          "lesson": "/concepts/python-configuration",
          "exercise": 1,
          "summary": "Keep the approved report record and add an operational event with a deliberate level and a narrower, metrics-only disclosure policy."
        },
        "editTarget": "def log_report_status("
      },
      {
        "title": "Diagnose a rejected report without leaking its input",
        "question": "Can the next invalid batch produce a useful diagnosis without hiding a different defect?",
        "task": [
          "Keep the report builder and log_report_status. Extend diagnose_run(run_id, operation, logger), which currently assumes the operation succeeds. operation is this report pipeline's validation boundary: its ValueError means an expected input rejection. Call it exactly once.",
          "On that rejection, emit one error event with template \"Report rejected: run=%s error=ValueError\" and the reviewed nonsecret run ID, then return {\"status\":\"rejected\",\"run_id\":run_id}. Never copy the exception message or input. Other exceptions propagate. On success, use the retained status logger and return {\"status\":\"ok\",\"record\":record}. Only the operation belongs inside the validation try block; logging failures are not input rejections."
        ],
        "starter": "import math\n\n# Working earlier report helpers\n\n\ndef convert_report(records):\n    \"\"\"Return named Fahrenheit readings without changing Celsius records.\"\"\"\n    result = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each reading needs a record\")\n        house = row.get(\"house\")\n        temperature_c = row.get(\"temperature_c\")\n        if not isinstance(house, str) or not house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        if type(temperature_c) not in (int, float) or (type(temperature_c) is float and not math.isfinite(temperature_c)):\n            raise ValueError(\"temperature_c must be a finite number\")\n        try:\n            temperature_f = temperature_c * 1.8 + 32\n        except OverflowError:\n            raise ValueError(\"Converted temperature is outside float range\") from None\n        if not math.isfinite(temperature_f):\n            raise ValueError(\"Converted temperature must be finite\")\n        result.append({\"house\": house, \"temperature_f\": temperature_f})\n    return result\n\ndef format_report(records):\n    rows = convert_report(records)\n    return [f\"{row[\"house\"]}: {row[\"temperature_f\"]:.1f} F\" for row in rows]\n\n\ndef summarize_alerts(readings_c, *, limit_c):\n    \"\"\"Return an inclusive Celsius alert count and total excess.\"\"\"\n    if type(limit_c) not in (int, float) or (type(limit_c) is float and not math.isfinite(limit_c)):\n        raise ValueError(\"limit_c must be finite\")\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in readings_c):\n        raise ValueError(\"Readings must be finite numbers\")\n    alerts = [value for value in readings_c if value >= limit_c]\n    try:\n        excess_c = float(sum(value - limit_c for value in alerts))\n    except OverflowError:\n        raise ValueError(\"Total excess is outside float range\") from None\n    if not math.isfinite(excess_c):\n        raise ValueError(\"Total excess must be finite\")\n    return {\"count\": len(alerts), \"excess_c\": excess_c}\n\ndef make_report(records, *, limit_c):\n    rows = convert_report(records)\n    summary = summarize_alerts([row[\"temperature_c\"] for row in records], limit_c=limit_c)\n    return {\"rows\": rows, **summary}\n\n\ndef calibrate(values, *, scale=1.0, offset=0.0):\n    \"\"\"Return calibrated values without changing the input readings.\"\"\"\n    parameters = [scale, offset, *values]\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in parameters):\n        raise ValueError(\"Calibration inputs must be finite numbers\")\n    try:\n        result = [value * scale + offset for value in values]\n    except OverflowError:\n        raise ValueError(\"Calibration is outside float range\") from None\n    if any(type(value) is float and not math.isfinite(value) for value in result):\n        raise ValueError(\"Calibrated values must be finite\")\n    return result\n\ndef calibrate_records(records, *, scale=1.0, offset=0.0):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    for row in records:\n        if not isinstance(row, dict) or not isinstance(row.get(\"house\"), str) or not row[\"house\"].strip():\n            raise ValueError(\"Every record needs a house name\")\n        value = row.get(\"temperature_c\")\n        if type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)):\n            raise ValueError(\"Every record needs a finite Celsius reading\")\n    adjusted = calibrate([row[\"temperature_c\"] for row in records], scale=scale, offset=offset)\n    return [{**row, \"temperature_c\": value} for row, value in zip(records, adjusted)]\n\ndef calibrated_report(records, *, limit_c, scale=1.0, offset=0.0):\n    adjusted = calibrate_records(records, scale=scale, offset=offset)\n    return make_report(adjusted, limit_c=limit_c)\n\ndef grouped_reports(reports, *, limit_c, scale=1.0, offset=0.0):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    calibrated_report([], limit_c=limit_c, scale=scale, offset=offset)\n    result = {}\n    for name, records in reports.items():\n        if not isinstance(name, str) or not name.strip():\n            raise ValueError(\"A report name must be nonempty text\")\n        result[name] = calibrated_report(records, limit_c=limit_c, scale=scale, offset=offset)\n    return result\n\n# Extend the program below\n\ndef prepare_reports(reports, policy):\n    if not isinstance(policy, dict) or set(policy) != {\"limit_c\", \"scale\", \"offset\"}:\n        raise ValueError(\"Policy needs exactly limit_c, scale and offset\")\n    return grouped_reports(reports, limit_c=policy[\"limit_c\"],\n                           scale=policy[\"scale\"], offset=policy[\"offset\"])\n\n\n# New project adapters: a compact per-house input and a counts-only view.\n# The complete named-record report helpers above remain available.\n\ndef count_alerts(readings_c, *, limit_c):\n    return summarize_alerts(readings_c, limit_c=limit_c)[\"count\"]\n\ndef report_counts(reports, *, limit_c):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    groups = {}\n    for house, values in reports.items():\n        if not isinstance(values, list):\n            raise ValueError(\"Each house needs a list of readings\")\n        groups[house] = [{\"house\": house, \"temperature_c\": value} for value in values]\n    prepared = prepare_reports(\n        groups, {\"limit_c\": limit_c, \"scale\": 1, \"offset\": 0})\n    return {name: report[\"count\"] for name, report in prepared.items()}\n\ndef build_report(reports, *, limit_c):\n    counts = report_counts(reports, limit_c=limit_c)\n    return {\"limit_c\": limit_c, \"counts\": counts}\n\ndef public_run_record(record):\n    settings = record[\"settings\"]\n    run = record[\"run\"]\n    report = run[\"report\"]\n    return {\n        \"settings\": {\"limit_c\": settings[\"limit_c\"],\n                     \"timeout_seconds\": settings[\"timeout_seconds\"]},\n        \"run\": {\"report\": {\"limit_c\": report[\"limit_c\"],\n                           \"counts\": dict(report[\"counts\"])},\n                \"version_drift\": list(run[\"version_drift\"])}\n    }\n\nclass RecordingLogger:\n    def __init__(self):\n        self.events = []\n    def info(self, template, *args):\n        self.events.append((\"INFO\", template % args))\n    def warning(self, template, *args):\n        self.events.append((\"WARNING\", template % args))\n    def error(self, template, *args):\n        self.events.append((\"ERROR\", template % args))\n\ndef log_report_status(record, logger):\n    safe = public_run_record(record)\n    counts = safe[\"run\"][\"report\"][\"counts\"]\n    total_alerts = sum(counts.values())\n    log = logger.warning if total_alerts else logger.info\n    log(\"Report completed: houses=%s alerts=%s\", len(counts), total_alerts)\n\ndef diagnose_run(run_id, operation, logger):\n    record = operation()\n    log_report_status(record, logger)\n    return {\"status\": \"ok\", \"record\": record}\n\ndef invalid_report():\n    return build_report({\"north\":[True]}, limit_c=25)\n\nlogger = RecordingLogger()\ntry:\n    result = diagnose_run(\"run-7\", invalid_report, logger)\nexcept ValueError:\n    print(\"Validation failure escaped\")\nelse:\n    print(result)\nprint(logger.events)",
        "solution": "import math\n\n# Working earlier report helpers\n\n\ndef convert_report(records):\n    \"\"\"Return named Fahrenheit readings without changing Celsius records.\"\"\"\n    result = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each reading needs a record\")\n        house = row.get(\"house\")\n        temperature_c = row.get(\"temperature_c\")\n        if not isinstance(house, str) or not house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        if type(temperature_c) not in (int, float) or (type(temperature_c) is float and not math.isfinite(temperature_c)):\n            raise ValueError(\"temperature_c must be a finite number\")\n        try:\n            temperature_f = temperature_c * 1.8 + 32\n        except OverflowError:\n            raise ValueError(\"Converted temperature is outside float range\") from None\n        if not math.isfinite(temperature_f):\n            raise ValueError(\"Converted temperature must be finite\")\n        result.append({\"house\": house, \"temperature_f\": temperature_f})\n    return result\n\ndef format_report(records):\n    rows = convert_report(records)\n    return [f\"{row[\"house\"]}: {row[\"temperature_f\"]:.1f} F\" for row in rows]\n\n\ndef summarize_alerts(readings_c, *, limit_c):\n    \"\"\"Return an inclusive Celsius alert count and total excess.\"\"\"\n    if type(limit_c) not in (int, float) or (type(limit_c) is float and not math.isfinite(limit_c)):\n        raise ValueError(\"limit_c must be finite\")\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in readings_c):\n        raise ValueError(\"Readings must be finite numbers\")\n    alerts = [value for value in readings_c if value >= limit_c]\n    try:\n        excess_c = float(sum(value - limit_c for value in alerts))\n    except OverflowError:\n        raise ValueError(\"Total excess is outside float range\") from None\n    if not math.isfinite(excess_c):\n        raise ValueError(\"Total excess must be finite\")\n    return {\"count\": len(alerts), \"excess_c\": excess_c}\n\ndef make_report(records, *, limit_c):\n    rows = convert_report(records)\n    summary = summarize_alerts([row[\"temperature_c\"] for row in records], limit_c=limit_c)\n    return {\"rows\": rows, **summary}\n\n\ndef calibrate(values, *, scale=1.0, offset=0.0):\n    \"\"\"Return calibrated values without changing the input readings.\"\"\"\n    parameters = [scale, offset, *values]\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in parameters):\n        raise ValueError(\"Calibration inputs must be finite numbers\")\n    try:\n        result = [value * scale + offset for value in values]\n    except OverflowError:\n        raise ValueError(\"Calibration is outside float range\") from None\n    if any(type(value) is float and not math.isfinite(value) for value in result):\n        raise ValueError(\"Calibrated values must be finite\")\n    return result\n\ndef calibrate_records(records, *, scale=1.0, offset=0.0):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    for row in records:\n        if not isinstance(row, dict) or not isinstance(row.get(\"house\"), str) or not row[\"house\"].strip():\n            raise ValueError(\"Every record needs a house name\")\n        value = row.get(\"temperature_c\")\n        if type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)):\n            raise ValueError(\"Every record needs a finite Celsius reading\")\n    adjusted = calibrate([row[\"temperature_c\"] for row in records], scale=scale, offset=offset)\n    return [{**row, \"temperature_c\": value} for row, value in zip(records, adjusted)]\n\ndef calibrated_report(records, *, limit_c, scale=1.0, offset=0.0):\n    adjusted = calibrate_records(records, scale=scale, offset=offset)\n    return make_report(adjusted, limit_c=limit_c)\n\ndef grouped_reports(reports, *, limit_c, scale=1.0, offset=0.0):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    calibrated_report([], limit_c=limit_c, scale=scale, offset=offset)\n    result = {}\n    for name, records in reports.items():\n        if not isinstance(name, str) or not name.strip():\n            raise ValueError(\"A report name must be nonempty text\")\n        result[name] = calibrated_report(records, limit_c=limit_c, scale=scale, offset=offset)\n    return result\n\n# Extend the program below\n\ndef prepare_reports(reports, policy):\n    if not isinstance(policy, dict) or set(policy) != {\"limit_c\", \"scale\", \"offset\"}:\n        raise ValueError(\"Policy needs exactly limit_c, scale and offset\")\n    return grouped_reports(reports, limit_c=policy[\"limit_c\"],\n                           scale=policy[\"scale\"], offset=policy[\"offset\"])\n\n\n# New project adapters: a compact per-house input and a counts-only view.\n# The complete named-record report helpers above remain available.\n\ndef count_alerts(readings_c, *, limit_c):\n    return summarize_alerts(readings_c, limit_c=limit_c)[\"count\"]\n\ndef report_counts(reports, *, limit_c):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    groups = {}\n    for house, values in reports.items():\n        if not isinstance(values, list):\n            raise ValueError(\"Each house needs a list of readings\")\n        groups[house] = [{\"house\": house, \"temperature_c\": value} for value in values]\n    prepared = prepare_reports(\n        groups, {\"limit_c\": limit_c, \"scale\": 1, \"offset\": 0})\n    return {name: report[\"count\"] for name, report in prepared.items()}\n\ndef build_report(reports, *, limit_c):\n    counts = report_counts(reports, limit_c=limit_c)\n    return {\"limit_c\": limit_c, \"counts\": counts}\n\ndef public_run_record(record):\n    settings = record[\"settings\"]\n    run = record[\"run\"]\n    report = run[\"report\"]\n    return {\n        \"settings\": {\"limit_c\": settings[\"limit_c\"],\n                     \"timeout_seconds\": settings[\"timeout_seconds\"]},\n        \"run\": {\"report\": {\"limit_c\": report[\"limit_c\"],\n                           \"counts\": dict(report[\"counts\"])},\n                \"version_drift\": list(run[\"version_drift\"])}\n    }\n\nclass RecordingLogger:\n    def __init__(self):\n        self.events = []\n    def info(self, template, *args):\n        self.events.append((\"INFO\", template % args))\n    def warning(self, template, *args):\n        self.events.append((\"WARNING\", template % args))\n    def error(self, template, *args):\n        self.events.append((\"ERROR\", template % args))\n\ndef log_report_status(record, logger):\n    safe = public_run_record(record)\n    counts = safe[\"run\"][\"report\"][\"counts\"]\n    total_alerts = sum(counts.values())\n    log = logger.warning if total_alerts else logger.info\n    log(\"Report completed: houses=%s alerts=%s\", len(counts), total_alerts)\n\ndef diagnose_run(run_id, operation, logger):\n    try:\n        record = operation()\n    except ValueError:\n        logger.error(\"Report rejected: run=%s error=ValueError\", run_id)\n        return {\"status\": \"rejected\", \"run_id\": run_id}\n    log_report_status(record, logger)\n    return {\"status\": \"ok\", \"record\": record}\n\ndef invalid_report():\n    return build_report({\"north\":[True]}, limit_c=25)\n\nlogger = RecordingLogger()\ntry:\n    result = diagnose_run(\"run-7\", invalid_report, logger)\nexcept ValueError:\n    print(\"Validation failure escaped\")\nelse:\n    print(result)\nprint(logger.events)",
        "output": "{'status': 'rejected', 'run_id': 'run-7'}\n[('ERROR', 'Report rejected: run=run-7 error=ValueError')]",
        "hints": [
          "Catch the known validation failure narrowly around the operation call.",
          "Preserve useful context through the selected run ID and category, not str(error)."
        ],
        "tests": [
          {
            "name": "Private validation details stay out",
            "code": "calls = []\ndef invalid():\n    calls.append(\"called\")\n    raise ValueError(\"TOKEN=private-placeholder\")\nlogger = RecordingLogger()\nassert diagnose_run(\"r2\", invalid, logger) == {\"status\":\"rejected\",\"run_id\":\"r2\"}\nassert calls == [\"called\"]\nassert logger.events == [(\"ERROR\",\"Report rejected: run=r2 error=ValueError\")]"
          },
          {
            "name": "Success retains the earlier event policy",
            "code": "record = {\"settings\":{\"limit_c\":5.0,\"timeout_seconds\":10},\n          \"run\":{\"report\":{\"limit_c\":5.0,\"counts\":{\"north\":1}},\"version_drift\":[]}}\nlogger = RecordingLogger()\nresult = diagnose_run(\"ok\", lambda: record, logger)\nassert result[\"status\"] == \"ok\" and result[\"record\"] is record\nassert logger.events == [(\"WARNING\",\"Report completed: houses=1 alerts=1\")]"
          },
          {
            "name": "Unexpected operation failure propagates",
            "code": "def broken():\n    raise RuntimeError(\"Program defect\")\nlogger = RecordingLogger()\ntry:\n    diagnose_run(\"broken\", broken, logger)\nexcept RuntimeError:\n    pass\nelse:\n    raise AssertionError(\"Unexpected defect was hidden\")\nassert logger.events == []"
          },
          {
            "name": "Logger failures are not validation failures",
            "code": "record = {\"settings\":{\"limit_c\":5.0,\"timeout_seconds\":10},\n          \"run\":{\"report\":{\"limit_c\":5.0,\"counts\":{}},\"version_drift\":[]}}\nclass BrokenLogger:\n    def info(self, *args):\n        raise ValueError(\"Logger configuration failure\")\n    def error(self, *args):\n        raise AssertionError(\"Logger error mislabeled as rejected input\")\ntry:\n    diagnose_run(\"logger\", lambda: record, BrokenLogger())\nexcept ValueError:\n    pass\nelse:\n    raise AssertionError(\"Logger failure hidden\")"
          }
        ],
        "continuation": {
          "lesson": "/concepts/python-logging",
          "exercise": 0,
          "summary": "Keep the successful-report event policy and add a narrow rejection path when the existing report validation fails, preserving unexpected defects and private inputs."
        },
        "editTarget": "def diagnose_run("
      }
    ],
    "build": {
      "title": "Choose diagnostic events and fields",
      "problem": "Botie receives event records with severity, batch IDs and private placeholder fields.",
      "challenge": "Apply severity decisions to keep events, then produce records with only the supplied allowed fields.",
      "sources": {
        "events": "Operational events",
        "minimum": "Minimum level",
        "fields": "Allowed field names"
      },
      "cases": [
        {
          "name": "Warnings and errors",
          "data": {
            "events": [
              {
                "level": "INFO",
                "batch_id": "A",
                "token": "placeholder"
              },
              {
                "level": "WARNING",
                "batch_id": "B",
                "token": "placeholder"
              },
              {
                "level": "ERROR",
                "batch_id": "C",
                "token": "placeholder"
              }
            ],
            "minimum": "WARNING",
            "fields": [
              "level",
              "batch_id"
            ]
          },
          "expected": [
            {
              "level": "WARNING",
              "batch_id": "B"
            },
            {
              "level": "ERROR",
              "batch_id": "C"
            }
          ]
        },
        {
          "name": "Only errors",
          "data": {
            "events": [
              {
                "level": "WARNING",
                "batch_id": "B",
                "token": "placeholder"
              },
              {
                "level": "ERROR",
                "batch_id": "C",
                "token": "placeholder"
              }
            ],
            "minimum": "ERROR",
            "fields": [
              "batch_id"
            ]
          },
          "expected": [
            {
              "batch_id": "C"
            }
          ]
        },
        {
          "name": "No matching event",
          "data": {
            "events": [
              {
                "level": "DEBUG",
                "batch_id": "D",
                "token": "placeholder"
              }
            ],
            "minimum": "CRITICAL",
            "fields": [
              "level"
            ]
          },
          "expected": []
        }
      ],
      "recipe": {
        "op": "pyProjectSelectFields",
        "inputs": [
          {
            "op": "pyProjectKeep",
            "inputs": [
              {
                "source": "events"
              },
              {
                "op": "pyProjectSeverityMask",
                "inputs": [
                  {
                    "source": "events"
                  },
                  {
                    "source": "minimum"
                  }
                ]
              }
            ]
          },
          {
            "source": "fields"
          }
        ]
      },
      "why": "A selected event need not copy its attached private fields.",
      "limitation": "These operations inspect invented records locally. They do not send logs or reproduce the full logger and handler hierarchy.",
      "extras": [
        "constant",
        "add",
        "multiply",
        "total",
        "count"
      ],
      "draftVersion": 1
    },
    "journey": {
      "premise": "A vague diagnostic was useless, while dumping the whole request would disclose too much.",
      "order": "investigate-first",
      "construction": {
        "title": "Choose events before their output fields",
        "start": "Select events using the minimum severity, then apply the allowed field list.",
        "outcome": "The output has useful selected context without the attached token.",
        "hints": [
          "Severity decisions align with the original event list.",
          "Select those records, then apply allowed output fields."
        ]
      },
      "investigation": {
        "title": "The threshold becomes ERROR. Which batch ID remains?",
        "caseIndex": 1,
        "kind": "diagnose",
        "question": "The threshold becomes ERROR. Which batch ID remains?",
        "options": [
          {
            "label": "C",
            "feedback": "Only the error event reaches this threshold.",
            "correct": true
          },
          {
            "label": "B and C",
            "feedback": "WARNING was selected earlier but not under the new threshold."
          }
        ],
        "outcome": "Inspect which fields remain as well as which event passed."
      },
      "connections": [
        {
          "lessonId": "python-configuration",
          "skill": "Use explicit disclosure allowlists",
          "why": "A diagnostic needs the same content review as a settings report."
        },
        {
          "lessonId": "python-exceptions",
          "skill": "Preserve a failure's meaning",
          "why": "The error category and appropriate context can explain a problem without swallowing it."
        }
      ],
      "reflection": {
        "prompt": "Which fields are necessary to investigate this failure?",
        "carryForward": "Choose event content deliberately, regardless of severity."
      }
    },
    "fresh": {
      "name": "More detail without token disclosure",
      "prompt": "Use the INFO threshold to select the recorded events, then return only each selected event’s batch_id in its original order, excluding the attached token fields.",
      "data": {
        "events": [
          {
            "level": "DEBUG",
            "batch_id": "X",
            "token": "placeholder"
          },
          {
            "level": "INFO",
            "batch_id": "Y",
            "token": "placeholder"
          }
        ],
        "minimum": "INFO",
        "fields": [
          "batch_id"
        ]
      },
      "expected": [
        {
          "batch_id": "Y"
        }
      ],
      "why": "A changed event threshold still preserves the output field policy."
    }
  },
  {
    "section": "Python Testing and Project Tools",
    "id": "python-profiling",
    "title": "Profiling and Optimization",
    "topic": "Observing a running program",
    "blurb": "Optimization needs a specific cost to reduce and evidence of where it occurs. Profiling locates expensive work, focused benchmarks compare alternatives, and tests protect the behavior a change must preserve.",
    "openingTitle": "The Short Loop Was Not the Slow Part",
    "opening": [
      "Botie rewrites a small loop because it looks inefficient. The report barely changes speed. Repeated lookups elsewhere consumed most of the work, and the rewrite made the calculation harder to read.",
      "We need to measure the operation that matters before choosing a repair, then check that the change preserves the report's meaning."
    ],
    "prerequisites": [
      {
        "title": "Behavior checks",
        "href": "/concepts/python-testing"
      },
      {
        "title": "Explicit dependencies",
        "href": "/concepts/python-test-doubles"
      },
      {
        "title": "Mutation and state",
        "href": "/concepts/python-mutation"
      }
    ],
    "outputLabel": "Operation with the largest estimated self cost",
    "checkpointTitle": "Questions on Parts 1 and 2",
    "history": {
      "title": "Python Profilers and timeit",
      "sources": [
        {
          "title": "Python profilers",
          "url": "https://docs.python.org/3.14/library/profile.html"
        },
        {
          "title": "Python timeit",
          "url": "https://docs.python.org/3.14/library/timeit.html"
        }
      ],
      "blocks": [
        "Source alone does not reliably reveal which operation dominates a complete run. Profilers record execution costs so expensive or repeated work can be investigated. Python's documentation distinguishes its original profile implementation from cProfile, a lower-overhead C implementation based on lsprof.",
        "The documentation also separates profiling from benchmarking. A profiler instruments a program to locate costs; timeit supports focused timing experiments. The tools address different questions. Neither makes one workload or machine representative of every deployment."
      ]
    },
    "diagram": {
      "title": "Call count and call cost both matter",
      "explanation": "The supplied self costs exclude child work, avoiding overlap between these estimates.",
      "rows": [],
      "scene": {
        "kind": "table",
        "rowHeading": "Operation",
        "columns": [
          "Calls",
          "Self milliseconds per call"
        ],
        "records": [
          {
            "label": "parse",
            "cells": [
              "100",
              "0.1"
            ]
          },
          {
            "label": "lookup",
            "cells": [
              "1000",
              "0.02"
            ]
          },
          {
            "label": "format",
            "cells": [
              "1",
              "5"
            ]
          }
        ],
        "caption": "Invented measurements supplied for teaching, not a benchmark of the reader's machine."
      }
    },
    "parts": [
      {
        "title": "Choose the cost you intend to reduce",
        "paragraphs": [
          "A response-time goal differs from a memory limit or a throughput target. Record the workload and constraint before changing code. A fast run on tiny input may miss the behavior that matters for a large report.",
          "Establish a baseline on representative input. Keep correctness checks so a faster program cannot silently omit required work. Measure again under comparable conditions after the change."
        ],
        "interpretation": []
      },
      {
        "title": "Read call counts and costs together",
        "paragraphs": [
          "A profile records calls and execution time. Self time excludes child work; cumulative time includes it. Adding the cumulative time of a caller and its child counts overlapping work twice.",
          "A cheap operation repeated often can dominate one costly-looking call. The workshop multiplies supplied counts by supplied mean self costs to make this relationship visible. Actual profilers already report aggregated statistics."
        ],
        "interpretation": [
          "The lookup branch has the largest estimated self cost despite a small individual cost."
        ],
        "calculation": "parse: 100 × 0.1 ms = 10 ms\nlookup: 1000 × 0.02 ms = 20 ms\nformat: 1 × 5 ms = 5 ms"
      },
      {
        "title": "Locate executed work with a profiler",
        "paragraphs": [
          "cProfile can run a callable while recording its calls. pstats can organize those records by self or cumulative time. This example inspects a deterministic count instead of printing machine-dependent durations.",
          "A profile describes the workload that ran and adds overhead. It may not account for work inside another process or a remote service. Keep end-to-end measurement separate when that is the application constraint."
        ],
        "interpretation": [],
        "examples": [
          {
            "title": "Count calls during a controlled run",
            "paragraphs": [
              "Inspect the entry for square itself, rather than variable-duration statistics."
            ],
            "code": "import cProfile\n\ndef square(value):\n    return value * value\n\ndef report(values):\n    return sum(square(value) for value in values)\n\nprofiler = cProfile.Profile()\nresult = profiler.runcall(report, [2, 3, 4])\nentry = next(item for item in profiler.getstats() if item.code is square.__code__)\nprint(result)\nprint(entry.callcount)",
            "output": "29\n3",
            "interpretation": [
              "square ran once per supplied input. The count alone does not establish a system bottleneck."
            ]
          }
        ]
      },
      {
        "title": "Benchmark a repair without changing meaning",
        "paragraphs": [
          "timeit repeats a focused operation to reduce the influence of one noisy timing. Include setup work when it belongs to the question. Benchmarking a lookup alone does not include building a large lookup table first.",
          "A report-local cache can avoid repeated retrieval when the source is stable for that report. It changes meaning if values should change midway or the cache outlives the source version. Optimization therefore needs an explicit state lifetime."
        ],
        "interpretation": [],
        "examples": [
          {
            "title": "A cached absence is still a result",
            "paragraphs": [
              "Membership distinguishes saved None from a key that has not been queried."
            ],
            "code": "cache = {\"north\": None}\nprint(\"north\" in cache)\nprint(cache[\"north\"])\nprint(\"south\" in cache)",
            "output": "True\nNone\nFalse",
            "interpretation": [
              "Checking cache.get(name) is None would confuse an already retrieved absence with an unqueried name."
            ]
          }
        ]
      },
      {
        "title": "Make local measurements reproducible",
        "paragraphs": [
          "Use the actual project environment and representative inputs. Record enough context to repeat the measurement, including Python and relevant package versions. Repeat experiments and inspect variation rather than reporting one favorable result.",
          "If a change does not improve the measured constraint, prefer clearer correct code. Caching, parallelism and compiled code have costs and assumptions of their own."
        ],
        "interpretation": [],
        "references": [
          {
            "title": "Two local measurement questions",
            "description": [
              "These commands run in your own project environment. Their numeric timing output varies by workload and machine."
            ],
            "language": "bash",
            "code": "python -m cProfile -s cumulative report.py\npython -m timeit -s \"values = list(range(1000))\" \"sum(values)\"",
            "setup": [
              "Replace report.py with the actual entry point and representative input.",
              "Include setup inside the timed operation when it belongs to the question.",
              "Compare equivalent operations under comparable conditions."
            ],
            "interpretation": [
              "The first command locates execution costs. The second measures a focused operation rather than the entire report."
            ],
            "source": {
              "title": "Python profilers",
              "url": "https://docs.python.org/3.14/library/profile.html"
            },
            "checkedOn": "2026-11-18"
          }
        ]
      }
    ],
    "questions": [
      {
        "kind": "choice",
        "prompt": "What is the estimated total?",
        "options": [
          "0.02 ms",
          "20 ms",
          "1000 ms"
        ],
        "answer": 1,
        "because": "Multiply count by mean self cost.\n\n```text\n1000 × 0.02 ms = 20 ms\n```",
        "given": {
          "description": "Question data",
          "data": "An operation runs 1000 times at a supplied mean self cost of 0.02 ms."
        }
      },
      {
        "kind": "trueFalse",
        "prompt": "Adding both cumulative times avoids overlap.",
        "answer": false,
        "because": "The child is already included in the caller's cumulative value.",
        "given": {
          "description": "Question data",
          "data": "A caller's cumulative time includes a child's execution."
        }
      },
      {
        "kind": "choice",
        "prompt": "Which tool fits?",
        "options": [
          "cProfile",
          "A formatter",
          "A version snapshot"
        ],
        "answer": 0,
        "because": "The profiler records execution statistics within the run.",
        "given": {
          "description": "Question data",
          "data": "The question is which functions consume time in a representative report."
        }
      },
      {
        "kind": "choice",
        "prompt": "Which tool fits?",
        "options": [
          "tomllib",
          "timeit",
          "unittest.mock"
        ],
        "answer": 1,
        "because": "timeit supports setup and repeated timing.",
        "given": {
          "description": "Question data",
          "data": "The question is a focused timing comparison of equivalent operations."
        }
      },
      {
        "kind": "trueFalse",
        "prompt": "The cache can return a stale value after its source changes.",
        "answer": true,
        "because": "A retained result can outlive the data version it describes.",
        "given": {
          "description": "Question data",
          "data": "A global cache remains while its source changes."
        }
      },
      {
        "kind": "choice",
        "prompt": "What should guide the decision?",
        "options": [
          "Keep it because it is shorter",
          "Prefer clearer correct code and inspect the real cost",
          "Remove behavior tests"
        ],
        "answer": 1,
        "because": "An optimization needs relevant evidence and preserved behavior.",
        "given": {
          "description": "Question data",
          "data": "A shorter rewrite does not improve the measured constraint."
        }
      }
    ],
    "practice": [
      {
        "title": "Profile the existing report rule",
        "question": "Which calls does the tested report actually make before an optimization?",
        "task": [
          "Keep the shared report_counts implementation. Extend profile_rule_calls(operation, rule) to run the zero-argument operation exactly once under a new cProfile.Profile, returning result and rule_calls. rule is a Python function; identify its entry by rule.__code__. Return zero when that code did not execute.",
          "Count executions of that code during this operation, not a remembered count from a previous call. Propagate operation failures. Do not print timing values or change the report calculation. The retained prepare_reports pipeline calls summarize_alerts once while validating the shared policy on an empty batch and once per named report; inspect that actual execution."
        ],
        "starter": "import cProfile\n\nimport math\n\n# Working earlier report helpers\n\n\ndef convert_report(records):\n    \"\"\"Return named Fahrenheit readings without changing Celsius records.\"\"\"\n    result = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each reading needs a record\")\n        house = row.get(\"house\")\n        temperature_c = row.get(\"temperature_c\")\n        if not isinstance(house, str) or not house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        if type(temperature_c) not in (int, float) or (type(temperature_c) is float and not math.isfinite(temperature_c)):\n            raise ValueError(\"temperature_c must be a finite number\")\n        try:\n            temperature_f = temperature_c * 1.8 + 32\n        except OverflowError:\n            raise ValueError(\"Converted temperature is outside float range\") from None\n        if not math.isfinite(temperature_f):\n            raise ValueError(\"Converted temperature must be finite\")\n        result.append({\"house\": house, \"temperature_f\": temperature_f})\n    return result\n\ndef format_report(records):\n    rows = convert_report(records)\n    return [f\"{row[\"house\"]}: {row[\"temperature_f\"]:.1f} F\" for row in rows]\n\n\ndef summarize_alerts(readings_c, *, limit_c):\n    \"\"\"Return an inclusive Celsius alert count and total excess.\"\"\"\n    if type(limit_c) not in (int, float) or (type(limit_c) is float and not math.isfinite(limit_c)):\n        raise ValueError(\"limit_c must be finite\")\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in readings_c):\n        raise ValueError(\"Readings must be finite numbers\")\n    alerts = [value for value in readings_c if value >= limit_c]\n    try:\n        excess_c = float(sum(value - limit_c for value in alerts))\n    except OverflowError:\n        raise ValueError(\"Total excess is outside float range\") from None\n    if not math.isfinite(excess_c):\n        raise ValueError(\"Total excess must be finite\")\n    return {\"count\": len(alerts), \"excess_c\": excess_c}\n\ndef make_report(records, *, limit_c):\n    rows = convert_report(records)\n    summary = summarize_alerts([row[\"temperature_c\"] for row in records], limit_c=limit_c)\n    return {\"rows\": rows, **summary}\n\n\ndef calibrate(values, *, scale=1.0, offset=0.0):\n    \"\"\"Return calibrated values without changing the input readings.\"\"\"\n    parameters = [scale, offset, *values]\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in parameters):\n        raise ValueError(\"Calibration inputs must be finite numbers\")\n    try:\n        result = [value * scale + offset for value in values]\n    except OverflowError:\n        raise ValueError(\"Calibration is outside float range\") from None\n    if any(type(value) is float and not math.isfinite(value) for value in result):\n        raise ValueError(\"Calibrated values must be finite\")\n    return result\n\ndef calibrate_records(records, *, scale=1.0, offset=0.0):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    for row in records:\n        if not isinstance(row, dict) or not isinstance(row.get(\"house\"), str) or not row[\"house\"].strip():\n            raise ValueError(\"Every record needs a house name\")\n        value = row.get(\"temperature_c\")\n        if type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)):\n            raise ValueError(\"Every record needs a finite Celsius reading\")\n    adjusted = calibrate([row[\"temperature_c\"] for row in records], scale=scale, offset=offset)\n    return [{**row, \"temperature_c\": value} for row, value in zip(records, adjusted)]\n\ndef calibrated_report(records, *, limit_c, scale=1.0, offset=0.0):\n    adjusted = calibrate_records(records, scale=scale, offset=offset)\n    return make_report(adjusted, limit_c=limit_c)\n\ndef grouped_reports(reports, *, limit_c, scale=1.0, offset=0.0):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    calibrated_report([], limit_c=limit_c, scale=scale, offset=offset)\n    result = {}\n    for name, records in reports.items():\n        if not isinstance(name, str) or not name.strip():\n            raise ValueError(\"A report name must be nonempty text\")\n        result[name] = calibrated_report(records, limit_c=limit_c, scale=scale, offset=offset)\n    return result\n\n# Extend the program below\n\ndef prepare_reports(reports, policy):\n    if not isinstance(policy, dict) or set(policy) != {\"limit_c\", \"scale\", \"offset\"}:\n        raise ValueError(\"Policy needs exactly limit_c, scale and offset\")\n    return grouped_reports(reports, limit_c=policy[\"limit_c\"],\n                           scale=policy[\"scale\"], offset=policy[\"offset\"])\n\n\n# New project adapters: a compact per-house input and a counts-only view.\n# The complete named-record report helpers above remain available.\n\ndef count_alerts(readings_c, *, limit_c):\n    return summarize_alerts(readings_c, limit_c=limit_c)[\"count\"]\n\ndef report_counts(reports, *, limit_c):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    groups = {}\n    for house, values in reports.items():\n        if not isinstance(values, list):\n            raise ValueError(\"Each house needs a list of readings\")\n        groups[house] = [{\"house\": house, \"temperature_c\": value} for value in values]\n    prepared = prepare_reports(\n        groups, {\"limit_c\": limit_c, \"scale\": 1, \"offset\": 0})\n    return {name: report[\"count\"] for name, report in prepared.items()}\n\ndef profile_rule_calls(operation, rule):\n    return {\"result\": operation(), \"rule_calls\": 0}\n\nprint(profile_rule_calls(\n    lambda: report_counts({\"north\":[18,25],\"south\":[29]}, limit_c=25),\n    summarize_alerts))",
        "solution": "import cProfile\n\nimport math\n\n# Working earlier report helpers\n\n\ndef convert_report(records):\n    \"\"\"Return named Fahrenheit readings without changing Celsius records.\"\"\"\n    result = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each reading needs a record\")\n        house = row.get(\"house\")\n        temperature_c = row.get(\"temperature_c\")\n        if not isinstance(house, str) or not house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        if type(temperature_c) not in (int, float) or (type(temperature_c) is float and not math.isfinite(temperature_c)):\n            raise ValueError(\"temperature_c must be a finite number\")\n        try:\n            temperature_f = temperature_c * 1.8 + 32\n        except OverflowError:\n            raise ValueError(\"Converted temperature is outside float range\") from None\n        if not math.isfinite(temperature_f):\n            raise ValueError(\"Converted temperature must be finite\")\n        result.append({\"house\": house, \"temperature_f\": temperature_f})\n    return result\n\ndef format_report(records):\n    rows = convert_report(records)\n    return [f\"{row[\"house\"]}: {row[\"temperature_f\"]:.1f} F\" for row in rows]\n\n\ndef summarize_alerts(readings_c, *, limit_c):\n    \"\"\"Return an inclusive Celsius alert count and total excess.\"\"\"\n    if type(limit_c) not in (int, float) or (type(limit_c) is float and not math.isfinite(limit_c)):\n        raise ValueError(\"limit_c must be finite\")\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in readings_c):\n        raise ValueError(\"Readings must be finite numbers\")\n    alerts = [value for value in readings_c if value >= limit_c]\n    try:\n        excess_c = float(sum(value - limit_c for value in alerts))\n    except OverflowError:\n        raise ValueError(\"Total excess is outside float range\") from None\n    if not math.isfinite(excess_c):\n        raise ValueError(\"Total excess must be finite\")\n    return {\"count\": len(alerts), \"excess_c\": excess_c}\n\ndef make_report(records, *, limit_c):\n    rows = convert_report(records)\n    summary = summarize_alerts([row[\"temperature_c\"] for row in records], limit_c=limit_c)\n    return {\"rows\": rows, **summary}\n\n\ndef calibrate(values, *, scale=1.0, offset=0.0):\n    \"\"\"Return calibrated values without changing the input readings.\"\"\"\n    parameters = [scale, offset, *values]\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in parameters):\n        raise ValueError(\"Calibration inputs must be finite numbers\")\n    try:\n        result = [value * scale + offset for value in values]\n    except OverflowError:\n        raise ValueError(\"Calibration is outside float range\") from None\n    if any(type(value) is float and not math.isfinite(value) for value in result):\n        raise ValueError(\"Calibrated values must be finite\")\n    return result\n\ndef calibrate_records(records, *, scale=1.0, offset=0.0):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    for row in records:\n        if not isinstance(row, dict) or not isinstance(row.get(\"house\"), str) or not row[\"house\"].strip():\n            raise ValueError(\"Every record needs a house name\")\n        value = row.get(\"temperature_c\")\n        if type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)):\n            raise ValueError(\"Every record needs a finite Celsius reading\")\n    adjusted = calibrate([row[\"temperature_c\"] for row in records], scale=scale, offset=offset)\n    return [{**row, \"temperature_c\": value} for row, value in zip(records, adjusted)]\n\ndef calibrated_report(records, *, limit_c, scale=1.0, offset=0.0):\n    adjusted = calibrate_records(records, scale=scale, offset=offset)\n    return make_report(adjusted, limit_c=limit_c)\n\ndef grouped_reports(reports, *, limit_c, scale=1.0, offset=0.0):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    calibrated_report([], limit_c=limit_c, scale=scale, offset=offset)\n    result = {}\n    for name, records in reports.items():\n        if not isinstance(name, str) or not name.strip():\n            raise ValueError(\"A report name must be nonempty text\")\n        result[name] = calibrated_report(records, limit_c=limit_c, scale=scale, offset=offset)\n    return result\n\n# Extend the program below\n\ndef prepare_reports(reports, policy):\n    if not isinstance(policy, dict) or set(policy) != {\"limit_c\", \"scale\", \"offset\"}:\n        raise ValueError(\"Policy needs exactly limit_c, scale and offset\")\n    return grouped_reports(reports, limit_c=policy[\"limit_c\"],\n                           scale=policy[\"scale\"], offset=policy[\"offset\"])\n\n\n# New project adapters: a compact per-house input and a counts-only view.\n# The complete named-record report helpers above remain available.\n\ndef count_alerts(readings_c, *, limit_c):\n    return summarize_alerts(readings_c, limit_c=limit_c)[\"count\"]\n\ndef report_counts(reports, *, limit_c):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    groups = {}\n    for house, values in reports.items():\n        if not isinstance(values, list):\n            raise ValueError(\"Each house needs a list of readings\")\n        groups[house] = [{\"house\": house, \"temperature_c\": value} for value in values]\n    prepared = prepare_reports(\n        groups, {\"limit_c\": limit_c, \"scale\": 1, \"offset\": 0})\n    return {name: report[\"count\"] for name, report in prepared.items()}\n\ndef profile_rule_calls(operation, rule):\n    profiler = cProfile.Profile()\n    result = profiler.runcall(operation)\n    calls = next((entry.callcount for entry in profiler.getstats()\n                  if entry.code is rule.__code__), 0)\n    return {\"result\": result, \"rule_calls\": calls}\n\nprint(profile_rule_calls(\n    lambda: report_counts({\"north\":[18,25],\"south\":[29]}, limit_c=25),\n    summarize_alerts))",
        "output": "{'result': {'north': 1, 'south': 1}, 'rule_calls': 3}",
        "hints": [
          "Run the operation through profiler.runcall, keeping its original returned result.",
          "Find the matching code entry in getstats; not every operation calls the supplied rule."
        ],
        "tests": [
          {
            "name": "A different operation and rule",
            "code": "def square(value):\n    return value * value\ndef operation():\n    return [square(value) for value in [2,3,4]]\nassert profile_rule_calls(operation, square) == {\"result\":[4,9,16],\"rule_calls\":3}"
          },
          {
            "name": "No calls and independent runs",
            "code": "def identity(value):\n    return value\nassert profile_rule_calls(lambda: 17, identity) == {\"result\":17,\"rule_calls\":0}\nassert profile_rule_calls(lambda: identity(2), identity) == {\"result\":2,\"rule_calls\":1}\nassert profile_rule_calls(lambda: identity(3), identity) == {\"result\":3,\"rule_calls\":1}"
          },
          {
            "name": "Operation runs once and failures remain visible",
            "code": "calls = []\ndef operation():\n    calls.append(\"called\")\n    raise ValueError(\"Rejected report\")\ndef rule(value):\n    return value\ntry:\n    profile_rule_calls(operation, rule)\nexcept ValueError:\n    pass\nelse:\n    raise AssertionError(\"Operation failure hidden\")\nassert calls == [\"called\"]"
          }
        ],
        "continuation": {
          "lesson": "/concepts/python-testing",
          "exercise": 1,
          "summary": "Keep the tested report adapter and complete prepare_reports program, then measure calls to the actual summarize_alerts helper without changing its result."
        },
        "editTarget": "def profile_rule_calls("
      },
      {
        "title": "Avoid repeating stable report-source work",
        "question": "Can the same report preserve every result while making fewer stable source requests?",
        "task": [
          "Keep the shared alert rule and the profiler from the preceding challenge. The current resolve_report reads a house again whenever its name repeats. For this one call, readings_for(name) is stable. Cache each house's computed alert count locally, while returning a new {\"house\": name, \"alert_count\": count} record for every original name position.",
          "Request each distinct house at most once, preserve repeated output positions and valid zero counts, and start a new cache for every resolve_report call. Validate limit_c before any source request, even for an empty name list. Propagate source or reading errors, leave inputs unchanged, and use the profiler to print the resulting report and actual read_house call count."
        ],
        "starter": "import cProfile\n\nimport math\n\n# Working earlier report helpers\n\n\ndef convert_report(records):\n    \"\"\"Return named Fahrenheit readings without changing Celsius records.\"\"\"\n    result = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each reading needs a record\")\n        house = row.get(\"house\")\n        temperature_c = row.get(\"temperature_c\")\n        if not isinstance(house, str) or not house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        if type(temperature_c) not in (int, float) or (type(temperature_c) is float and not math.isfinite(temperature_c)):\n            raise ValueError(\"temperature_c must be a finite number\")\n        try:\n            temperature_f = temperature_c * 1.8 + 32\n        except OverflowError:\n            raise ValueError(\"Converted temperature is outside float range\") from None\n        if not math.isfinite(temperature_f):\n            raise ValueError(\"Converted temperature must be finite\")\n        result.append({\"house\": house, \"temperature_f\": temperature_f})\n    return result\n\ndef format_report(records):\n    rows = convert_report(records)\n    return [f\"{row[\"house\"]}: {row[\"temperature_f\"]:.1f} F\" for row in rows]\n\n\ndef summarize_alerts(readings_c, *, limit_c):\n    \"\"\"Return an inclusive Celsius alert count and total excess.\"\"\"\n    if type(limit_c) not in (int, float) or (type(limit_c) is float and not math.isfinite(limit_c)):\n        raise ValueError(\"limit_c must be finite\")\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in readings_c):\n        raise ValueError(\"Readings must be finite numbers\")\n    alerts = [value for value in readings_c if value >= limit_c]\n    try:\n        excess_c = float(sum(value - limit_c for value in alerts))\n    except OverflowError:\n        raise ValueError(\"Total excess is outside float range\") from None\n    if not math.isfinite(excess_c):\n        raise ValueError(\"Total excess must be finite\")\n    return {\"count\": len(alerts), \"excess_c\": excess_c}\n\ndef make_report(records, *, limit_c):\n    rows = convert_report(records)\n    summary = summarize_alerts([row[\"temperature_c\"] for row in records], limit_c=limit_c)\n    return {\"rows\": rows, **summary}\n\n\ndef calibrate(values, *, scale=1.0, offset=0.0):\n    \"\"\"Return calibrated values without changing the input readings.\"\"\"\n    parameters = [scale, offset, *values]\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in parameters):\n        raise ValueError(\"Calibration inputs must be finite numbers\")\n    try:\n        result = [value * scale + offset for value in values]\n    except OverflowError:\n        raise ValueError(\"Calibration is outside float range\") from None\n    if any(type(value) is float and not math.isfinite(value) for value in result):\n        raise ValueError(\"Calibrated values must be finite\")\n    return result\n\ndef calibrate_records(records, *, scale=1.0, offset=0.0):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    for row in records:\n        if not isinstance(row, dict) or not isinstance(row.get(\"house\"), str) or not row[\"house\"].strip():\n            raise ValueError(\"Every record needs a house name\")\n        value = row.get(\"temperature_c\")\n        if type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)):\n            raise ValueError(\"Every record needs a finite Celsius reading\")\n    adjusted = calibrate([row[\"temperature_c\"] for row in records], scale=scale, offset=offset)\n    return [{**row, \"temperature_c\": value} for row, value in zip(records, adjusted)]\n\ndef calibrated_report(records, *, limit_c, scale=1.0, offset=0.0):\n    adjusted = calibrate_records(records, scale=scale, offset=offset)\n    return make_report(adjusted, limit_c=limit_c)\n\ndef grouped_reports(reports, *, limit_c, scale=1.0, offset=0.0):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    calibrated_report([], limit_c=limit_c, scale=scale, offset=offset)\n    result = {}\n    for name, records in reports.items():\n        if not isinstance(name, str) or not name.strip():\n            raise ValueError(\"A report name must be nonempty text\")\n        result[name] = calibrated_report(records, limit_c=limit_c, scale=scale, offset=offset)\n    return result\n\n# Extend the program below\n\ndef prepare_reports(reports, policy):\n    if not isinstance(policy, dict) or set(policy) != {\"limit_c\", \"scale\", \"offset\"}:\n        raise ValueError(\"Policy needs exactly limit_c, scale and offset\")\n    return grouped_reports(reports, limit_c=policy[\"limit_c\"],\n                           scale=policy[\"scale\"], offset=policy[\"offset\"])\n\n\n# New project adapters: a compact per-house input and a counts-only view.\n# The complete named-record report helpers above remain available.\n\ndef count_alerts(readings_c, *, limit_c):\n    return summarize_alerts(readings_c, limit_c=limit_c)[\"count\"]\n\ndef report_counts(reports, *, limit_c):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    groups = {}\n    for house, values in reports.items():\n        if not isinstance(values, list):\n            raise ValueError(\"Each house needs a list of readings\")\n        groups[house] = [{\"house\": house, \"temperature_c\": value} for value in values]\n    prepared = prepare_reports(\n        groups, {\"limit_c\": limit_c, \"scale\": 1, \"offset\": 0})\n    return {name: report[\"count\"] for name, report in prepared.items()}\n\ndef profile_rule_calls(operation, rule):\n    profiler = cProfile.Profile()\n    result = profiler.runcall(operation)\n    calls = next((entry.callcount for entry in profiler.getstats()\n                  if entry.code is rule.__code__), 0)\n    return {\"result\": result, \"rule_calls\": calls}\n\ndef resolve_report(names, readings_for, *, limit_c):\n    count_alerts([], limit_c=limit_c)\n    result = []\n    for name in names:\n        result.append({\"house\": name,\n                       \"alert_count\": count_alerts(readings_for(name), limit_c=limit_c)})\n    return result\n\ncatalog = {\"north\":[24,25], \"south\":[29]}\ndef read_house(name):\n    return catalog[name]\n\nmeasurement = profile_rule_calls(\n    lambda: resolve_report([\"south\",\"north\",\"south\"], read_house, limit_c=25),\n    read_house)\nprint(measurement[\"result\"])\nprint(measurement[\"rule_calls\"])",
        "solution": "import cProfile\n\nimport math\n\n# Working earlier report helpers\n\n\ndef convert_report(records):\n    \"\"\"Return named Fahrenheit readings without changing Celsius records.\"\"\"\n    result = []\n    for row in records:\n        if not isinstance(row, dict):\n            raise ValueError(\"Each reading needs a record\")\n        house = row.get(\"house\")\n        temperature_c = row.get(\"temperature_c\")\n        if not isinstance(house, str) or not house.strip():\n            raise ValueError(\"house must be nonempty text\")\n        if type(temperature_c) not in (int, float) or (type(temperature_c) is float and not math.isfinite(temperature_c)):\n            raise ValueError(\"temperature_c must be a finite number\")\n        try:\n            temperature_f = temperature_c * 1.8 + 32\n        except OverflowError:\n            raise ValueError(\"Converted temperature is outside float range\") from None\n        if not math.isfinite(temperature_f):\n            raise ValueError(\"Converted temperature must be finite\")\n        result.append({\"house\": house, \"temperature_f\": temperature_f})\n    return result\n\ndef format_report(records):\n    rows = convert_report(records)\n    return [f\"{row[\"house\"]}: {row[\"temperature_f\"]:.1f} F\" for row in rows]\n\n\ndef summarize_alerts(readings_c, *, limit_c):\n    \"\"\"Return an inclusive Celsius alert count and total excess.\"\"\"\n    if type(limit_c) not in (int, float) or (type(limit_c) is float and not math.isfinite(limit_c)):\n        raise ValueError(\"limit_c must be finite\")\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in readings_c):\n        raise ValueError(\"Readings must be finite numbers\")\n    alerts = [value for value in readings_c if value >= limit_c]\n    try:\n        excess_c = float(sum(value - limit_c for value in alerts))\n    except OverflowError:\n        raise ValueError(\"Total excess is outside float range\") from None\n    if not math.isfinite(excess_c):\n        raise ValueError(\"Total excess must be finite\")\n    return {\"count\": len(alerts), \"excess_c\": excess_c}\n\ndef make_report(records, *, limit_c):\n    rows = convert_report(records)\n    summary = summarize_alerts([row[\"temperature_c\"] for row in records], limit_c=limit_c)\n    return {\"rows\": rows, **summary}\n\n\ndef calibrate(values, *, scale=1.0, offset=0.0):\n    \"\"\"Return calibrated values without changing the input readings.\"\"\"\n    parameters = [scale, offset, *values]\n    if any(type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)) for value in parameters):\n        raise ValueError(\"Calibration inputs must be finite numbers\")\n    try:\n        result = [value * scale + offset for value in values]\n    except OverflowError:\n        raise ValueError(\"Calibration is outside float range\") from None\n    if any(type(value) is float and not math.isfinite(value) for value in result):\n        raise ValueError(\"Calibrated values must be finite\")\n    return result\n\ndef calibrate_records(records, *, scale=1.0, offset=0.0):\n    if not isinstance(records, list):\n        raise ValueError(\"Records must be a list\")\n    for row in records:\n        if not isinstance(row, dict) or not isinstance(row.get(\"house\"), str) or not row[\"house\"].strip():\n            raise ValueError(\"Every record needs a house name\")\n        value = row.get(\"temperature_c\")\n        if type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)):\n            raise ValueError(\"Every record needs a finite Celsius reading\")\n    adjusted = calibrate([row[\"temperature_c\"] for row in records], scale=scale, offset=offset)\n    return [{**row, \"temperature_c\": value} for row, value in zip(records, adjusted)]\n\ndef calibrated_report(records, *, limit_c, scale=1.0, offset=0.0):\n    adjusted = calibrate_records(records, scale=scale, offset=offset)\n    return make_report(adjusted, limit_c=limit_c)\n\ndef grouped_reports(reports, *, limit_c, scale=1.0, offset=0.0):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    calibrated_report([], limit_c=limit_c, scale=scale, offset=offset)\n    result = {}\n    for name, records in reports.items():\n        if not isinstance(name, str) or not name.strip():\n            raise ValueError(\"A report name must be nonempty text\")\n        result[name] = calibrated_report(records, limit_c=limit_c, scale=scale, offset=offset)\n    return result\n\n# Extend the program below\n\ndef prepare_reports(reports, policy):\n    if not isinstance(policy, dict) or set(policy) != {\"limit_c\", \"scale\", \"offset\"}:\n        raise ValueError(\"Policy needs exactly limit_c, scale and offset\")\n    return grouped_reports(reports, limit_c=policy[\"limit_c\"],\n                           scale=policy[\"scale\"], offset=policy[\"offset\"])\n\n\n# New project adapters: a compact per-house input and a counts-only view.\n# The complete named-record report helpers above remain available.\n\ndef count_alerts(readings_c, *, limit_c):\n    return summarize_alerts(readings_c, limit_c=limit_c)[\"count\"]\n\ndef report_counts(reports, *, limit_c):\n    if not isinstance(reports, dict):\n        raise ValueError(\"Reports must be a dictionary\")\n    groups = {}\n    for house, values in reports.items():\n        if not isinstance(values, list):\n            raise ValueError(\"Each house needs a list of readings\")\n        groups[house] = [{\"house\": house, \"temperature_c\": value} for value in values]\n    prepared = prepare_reports(\n        groups, {\"limit_c\": limit_c, \"scale\": 1, \"offset\": 0})\n    return {name: report[\"count\"] for name, report in prepared.items()}\n\ndef profile_rule_calls(operation, rule):\n    profiler = cProfile.Profile()\n    result = profiler.runcall(operation)\n    calls = next((entry.callcount for entry in profiler.getstats()\n                  if entry.code is rule.__code__), 0)\n    return {\"result\": result, \"rule_calls\": calls}\n\ndef resolve_report(names, readings_for, *, limit_c):\n    count_alerts([], limit_c=limit_c)\n    cache = {}\n    result = []\n    for name in names:\n        if name not in cache:\n            cache[name] = count_alerts(readings_for(name), limit_c=limit_c)\n        result.append({\"house\": name, \"alert_count\": cache[name]})\n    return result\n\ncatalog = {\"north\":[24,25], \"south\":[29]}\ndef read_house(name):\n    return catalog[name]\n\nmeasurement = profile_rule_calls(\n    lambda: resolve_report([\"south\",\"north\",\"south\"], read_house, limit_c=25),\n    read_house)\nprint(measurement[\"result\"])\nprint(measurement[\"rule_calls\"])",
        "output": "[{'house': 'south', 'alert_count': 1}, {'house': 'north', 'alert_count': 1}, {'house': 'south', 'alert_count': 1}]\n2",
        "hints": [
          "The output still has one position per request. Cache only the stable repeated work, not the output list.",
          "A cached zero is present. Test key membership instead of truthiness, and keep the cache inside the call."
        ],
        "tests": [
          {
            "name": "Duplicate zero-count result is cached",
            "code": "calls = []\ndef read_house(name):\n    calls.append(name)\n    return []\nassert resolve_report([\"x\",\"x\"], read_house, limit_c=25) == [\n    {\"house\":\"x\",\"alert_count\":0},{\"house\":\"x\",\"alert_count\":0}]\nassert calls == [\"x\"]"
          },
          {
            "name": "Each report observes fresh source data",
            "code": "state = {\"x\":[24]}\nassert resolve_report([\"x\"], state.__getitem__, limit_c=25) == [{\"house\":\"x\",\"alert_count\":0}]\nstate[\"x\"] = [25,26]\nassert resolve_report([\"x\"], state.__getitem__, limit_c=25) == [{\"house\":\"x\",\"alert_count\":2}]"
          },
          {
            "name": "Preserved order and earlier validation",
            "code": "names = [\"b\",\"a\",\"b\"]\ncatalog = {\"a\":[0],\"b\":[0,1]}\nassert resolve_report(names, catalog.__getitem__, limit_c=0) == [\n    {\"house\":\"b\",\"alert_count\":2},{\"house\":\"a\",\"alert_count\":1},{\"house\":\"b\",\"alert_count\":2}]\nassert names == [\"b\",\"a\",\"b\"] and catalog == {\"a\":[0],\"b\":[0,1]}\ndef forbidden(name):\n    raise AssertionError(\"Source read before limit validation\")\ntry:\n    resolve_report([], forbidden, limit_c=float(\"nan\"))\nexcept ValueError:\n    pass\nelse:\n    raise AssertionError(\"Invalid limit accepted\")"
          },
          {
            "name": "Source failure is not cached as a result",
            "code": "def unavailable(name):\n    raise OSError(\"Simulated source failure\")\ntry:\n    resolve_report([\"x\"], unavailable, limit_c=25)\nexcept OSError:\n    pass\nelse:\n    raise AssertionError(\"Source failure hidden\")"
          }
        ],
        "continuation": {
          "lesson": "/concepts/python-profiling",
          "exercise": 0,
          "summary": "Keep the report call-count profiler and shared alert rule, then repair repeated stable source reads with a cache whose lifetime is one report."
        },
        "editTarget": "def resolve_report("
      }
    ],
    "build": {
      "title": "Find expensive repeated work",
      "problem": "Botie has operation names, counts and mean self milliseconds per call from an invented profile.",
      "challenge": "Multiply aligned counts and mean self costs. Find the largest product's position, then retrieve its operation name.",
      "sources": {
        "names": "Operation names",
        "calls": "Calls per operation",
        "per_call": "Mean self milliseconds per call"
      },
      "cases": [
        {
          "name": "Repeated lookup dominates",
          "data": {
            "names": [
              "parse",
              "lookup",
              "format"
            ],
            "calls": [
              100,
              1000,
              1
            ],
            "per_call": [
              0.1,
              0.02,
              5
            ]
          },
          "expected": "lookup"
        },
        {
          "name": "One call becomes expensive",
          "data": {
            "names": [
              "parse",
              "lookup",
              "format"
            ],
            "calls": [
              100,
              1000,
              1
            ],
            "per_call": [
              0.1,
              0.002,
              15
            ]
          },
          "expected": "format"
        },
        {
          "name": "Ties preserve order",
          "data": {
            "names": [
              "first",
              "second"
            ],
            "calls": [
              2,
              1
            ],
            "per_call": [
              1,
              2
            ]
          },
          "expected": "first"
        }
      ],
      "recipe": {
        "op": "pyProjectAt",
        "inputs": [
          {
            "source": "names"
          },
          {
            "op": "pyProjectArgMax",
            "inputs": [
              {
                "op": "multiply",
                "inputs": [
                  {
                    "source": "calls"
                  },
                  {
                    "source": "per_call"
                  }
                ]
              }
            ]
          }
        ]
      },
      "why": "The name follows total estimated cost rather than call count alone.",
      "limitation": "Supplied self-cost fixtures do not measure a real execution or establish that the selected operation can be improved.",
      "extras": [
        "constant",
        "add",
        "multiply",
        "total",
        "count"
      ],
      "draftVersion": 1
    },
    "journey": {
      "premise": "A loop rewrite did not reduce the dominant work.",
      "order": "investigate-first",
      "construction": {
        "title": "Locate the cost before choosing a repair",
        "start": "Calculate totals while preserving operation positions, then retrieve the largest-cost name.",
        "outcome": "The result follows supplied costs rather than which code looked awkward.",
        "hints": [
          "Multiply each count by its corresponding mean self cost.",
          "Use the maximum product's position to retrieve its name."
        ]
      },
      "investigation": {
        "title": "Counts stay at 100, 1000 and 1; costs become 0.1, 0.002 and 15 ms. Which operation dominates?",
        "caseIndex": 1,
        "kind": "diagnose",
        "question": "Counts stay at 100, 1000 and 1; costs become 0.1, 0.002 and 15 ms. Which operation dominates?",
        "options": [
          {
            "label": "format",
            "feedback": "Its estimated self cost is now largest.",
            "correct": true
          },
          {
            "label": "lookup because it runs most often",
            "feedback": "The per-call cost changes the total."
          }
        ],
        "outcome": "The target changes with the workload."
      },
      "connections": [
        {
          "lessonId": "python-testing",
          "skill": "Preserve independently checked behavior",
          "why": "The faster report must still produce the intended results."
        },
        {
          "lessonId": "python-mutation",
          "skill": "Choose a state lifetime",
          "why": "A cache is useful only while its values match the source."
        }
      ],
      "reflection": {
        "prompt": "What measurement would establish an improvement for this workload?",
        "carryForward": "Measure the relevant constraint and keep correctness tests."
      }
    },
    "fresh": {
      "name": "Fewer calls dominate",
      "prompt": "The remote operation runs twice at 40 ms. The local operation runs 1000 times at 0.01 ms. Predict which dominates.",
      "data": {
        "names": [
          "local",
          "remote"
        ],
        "calls": [
          1000,
          2
        ],
        "per_call": [
          0.01,
          40
        ]
      },
      "expected": "remote",
      "why": "Choosing by call count alone would identify the wrong operation."
    }
  }
];

export default records.map(record => {
  const result = lesson(record);
  result.reading.practiceTitle = `Practice. ${result.reading.practiceTitle}`;
  return result;
});
