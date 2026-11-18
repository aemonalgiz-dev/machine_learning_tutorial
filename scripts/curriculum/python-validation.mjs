import {
  lesson, p, example, history, source, before, table, challenge, construction,
  sample, s, op, q, tf, journey, diagnose, connection, fresh,
} from './applied-authoring.mjs';

const section = 'Python Validation and Error Handling';
const topic = 'Validation and Failure Handling';
const py = lines => lines.join('\n');
const build = (...args) => ({ ...construction(...args), extras: [], draftVersion: 1 });
const accepted = record => ({ accepted: true, record });
const rejected = { accepted: false, record: null };
const writePlan = (values, badPositions = []) => ({ status: badPositions.length ? 'rejected' : 'accepted', writes: badPositions.length ? [] : values, badPositions });
const parseReport = (values, rejectedPositions = []) => ({ values, rejected: rejectedPositions });
const basicSources = [
  source('Python errors and exceptions', 'https://docs.python.org/3.14/tutorial/errors.html'),
  source('Python assert statement', 'https://docs.python.org/3.14/reference/simple_stmts.html#the-assert-statement'),
];

const positiveCheck = py([
  'import math',
  '',
  'def require_positive(value):',
  "    if type(value) not in (int, float):",
  "        raise TypeError('A reading must be a number')",
  '    if (type(value) is float and not math.isfinite(value)) or value <= 0:',
  "        raise ValueError('A reading must be finite and positive')",
  '    return value',
  '',
  'for reading in [4, -2, True]:',
  '    try:',
  '        print(require_positive(reading))',
  '    except (TypeError, ValueError) as error:',
  '        print(type(error).__name__, str(error))',
]);
const validateTotalSolution = py([
  'import math',
  '',
  'def validated_total(values):',
  '    if not isinstance(values, list):',
  "        raise TypeError('Values must be a list')",
  '    if not values:',
  "        raise ValueError('At least one value is required')",
  '    for value in values:',
  '        if type(value) not in (int, float):',
  "            raise TypeError('Every value must be a number')",
  '        if (type(value) is float and not math.isfinite(value)) or value <= 0:',
  "            raise ValueError('Every value must be finite and positive')",
  '    return sum(values)',
  '',
  'print(validated_total([8, 7, 9]))',
]);
const appendBatchSolution = py([
  'import math',
  '',
  'def append_batch(destination, incoming):',
  '    if not isinstance(destination, list) or not isinstance(incoming, list):',
  "        raise TypeError('Both arguments must be lists')",
  '    if destination is incoming:',
  "        raise ValueError('Use distinct destination and incoming lists')",
  '    for value in incoming:',
  '        if type(value) not in (int, float):',
  "            raise TypeError('Every incoming value must be a number')",
  '        if (type(value) is float and not math.isfinite(value)) or value <= 0:',
  "            raise ValueError('Every incoming value must be finite and positive')",
  '    destination.extend(incoming)',
  '    return len(destination)',
  '',
  'saved = [2]',
  'print(append_batch(saved, [4, 8]))',
  'print(saved)',
]);

export const pythonFailFast = lesson({
  id: 'python-fail-fast', title: 'Fail Fast, Fail Early', section, topic,
  blurb: 'A failure is easier to understand before invalid data produces a misleading result or changes saved records. Validate the contract at the boundary, then decide which failures the caller can recover from.',
  openingTitle: 'Why Did Half of the Batch Get Saved?',
  opening: [
    'A program receives a batch of positive measurements and adds them to a saved list. It writes the first measurement, writes the next, then discovers that a later value is text. The request fails, but the saved list has already changed.',
    'We can stop that partial update before it happens. First establish which inputs the operation accepts. Check the entire batch against those requirements. Only then perform the write. Failing early means placing that decision before the work that relies on it.',
  ],
  prerequisites: [before('Functions and their inputs', 'python-function-design'), before('Type hints', 'python-type-hints')],
  appliedIn: [before('Pydantic Models and Optional Fields', 'python-pydantic-models')],
  outputLabel: 'A planned write or the rejected input positions',
  checkpointTitle: 'Questions on Parts 1 and 2',
  history: history('Early Failure and Partial Updates', [
    source('The Pragmatic Programmer: contracts and early failure', 'https://pragprog.com/tips/'), ...basicSources,
  ],
  'Programs can continue running after a mistake while producing increasingly difficult consequences. The Pragmatic Programmer discusses contracts and early failure as ways of stopping that spread. The useful idea is to expose a broken assumption close to where it first becomes visible.',
  'Python gives us explicit exceptions for that decision. A function can reject an unsuitable value before using it, while a caller can handle the failures it expects. Our batch example adds another requirement: validate every incoming measurement before changing the saved list. An early error message alone would not repair a partial write.'),
  diagram: table('Put Validation Before the First Write', 'The same batch is examined in two orders. The saved list begins empty.', ['Order', 'What happens', 'Saved state after failure'], [
    ['Write while checking', 'Save 5, then discover that the next value is invalid', '[5]'],
    ['Check the complete batch first', 'Find the invalid value before starting any write', '[]'],
  ], 'This is an invented in-memory example. A real database transaction provides additional guarantees that a precheck alone cannot supply.'),
  parts: [
    p('State What the Operation Accepts',
      'An error check needs a rule to check against. Here a valid batch is a list of finite, positive numbers. Zero is outside this example’s contract, even though another application might allow it. Text that looks numerical is also outside the contract; conversion, if wanted, belongs in a separate step.\n\nA contract describes the inputs an operation accepts and the result or failure it promises. It also needs to say which effects are allowed. Our batch operation promises that a rejected batch leaves the saved list unchanged. That statement is more useful than saying the function is robust.',
      'Accepted: [5, 8, 2]\nRejected: [5, "eight", 2]\nRejected: [5, 0, 2]\nOn rejection: do not add any item to the saved list.',
      'Choose requirements that fit the actual problem. Failing early is only useful when the condition being enforced is correct.'),
    p('Validate Before Changing State',
      'A side effect is an observable change outside the result a function returns. Appending to a caller’s list is a side effect. Writing a file or updating a database is another. If a later check fails, an earlier effect does not automatically undo itself.\n\nSeparate the validation loop from the write. The first loop inspects every item without changing the destination. If it raises an exception, the function exits before reaching the write. If every item passes, the function can apply the batch.\n\nThis structure also makes the policy visible to someone reading the code. They can locate the point where the program moves from checking a request to changing state.',
      null,
      'For this local list, checking first prevents the declared partial-write problem. Concurrent database changes still need a transaction and appropriate constraints.'),
    p('Distinguish Representation from Allowed Values',
      'The text "4" and the number 4 are different Python objects. A type hint can describe which one a function expects, but Python does not enforce that annotation by itself. An explicit runtime check can reject the wrong representation.\n\nAfter establishing that a value is numeric, we still need to ask whether its value is acceptable. A negative number has the right general representation and fails the positive-value rule. A nonfinite floating-point value also needs an explicit decision.\n\nPython’s bool is a subclass of int. An isinstance(value, int) check therefore accepts True. If a measurement contract excludes booleans, make that choice explicit. The small check below deliberately accepts only the built-in int and float types; it is not a general rule for NumPy scalars or every numerical class.',
      null,
      'Representation checks and domain checks answer different questions. A number can be well typed and still be unusable.', [
        example('Reject the Value Where It Enters', 'Run the same validator on a measurement, a negative value, and a boolean.', positiveCheck,
          '4\nValueError A reading must be finite and positive\nTypeError A reading must be a number',
          'No fallback value is invented. The caller sees which declared condition failed.'),
      ]),
    p('Use Exceptions That Explain the Failure',
      'TypeError is appropriate when an argument has an unsuitable type. ValueError describes an argument of an appropriate type whose value violates the operation’s requirements. Those categories let a caller distinguish a representation problem from a value problem.\n\nAn error message should identify the failed requirement. “Bad input” gives little help. “Every incoming value must be finite and positive” tells us which condition to inspect. A batch validator can also include a row number or field name, provided it avoids disclosing private input in logs or public responses.\n\nDo not catch an exception merely to return a plausible-looking zero. A zero can be a real result. Silently substituting it hides the failure from later code.',
      null,
      'The calling layer decides whether to ask for corrected input, reject a request, or stop a task. The validation function should preserve that choice.'),
    p('Keep Required Checks out of Assertions',
      'An assertion documents an internal condition the programmer expects to hold. Python can omit assert statements when code is compiled with optimization. That makes assert unsuitable for a required check on a file, an API request, or another caller’s data.\n\nUse an ordinary conditional followed by raise for a validation rule that must run. Assertions can still be useful in tests and for internal debugging assumptions. The distinction concerns whether the program depends on the check always being present.',
      null,
      'A required boundary check must not disappear because the interpreter was started differently.'),
    p('Decide What Can Recover',
      'Failing early does not require shutting down an entire application whenever one request is invalid. A web handler might reject that request while continuing to serve other people. A data-import tool might collect invalid rows for correction, if partial acceptance is an explicit part of its contract.\n\nOur first batch policy is all-or-nothing: any invalid item prevents the whole write. Another policy could accept valid records and return errors for the rest. Those are different operations and need different tests. Do not drift from one to the other by putting a broad exception handler around a loop.\n\nInput validation also has limits. It cannot prove that a measurement was taken correctly, that a user is authorized, or that a resource will remain available. Keep those responsibilities visible rather than calling a validated request safe in every sense.',
      null,
      'A reliable failure policy says what stops, what remains unchanged, and what information reaches the caller.'),
    p('Test the Failure Before the Effect',
      'A test that only checks whether an exception was raised can miss a partial update. Keep a copy of the destination, send a batch whose final item is invalid, and compare the destination after failure. The last item matters because it lets earlier valid values tempt a write-while-checking implementation.\n\nAlso test an empty batch, changed batch lengths, a boolean, and a nonfinite number. Decide the empty-batch rule in the contract: the total function below requires at least one reading, while the append function permits an empty incoming list as a no-op. Neither rule should be inferred from a convenient implementation.',
      null,
      'The test needs to observe the state that could have been damaged, as well as the error.'),
  ],
  questions: [
    q('A batch contract accepts positive numbers only. The incoming batch is [5, "six", 2]. No conversion step is part of the contract.', 'Which action matches the contract?', ['Reject the batch before writing any item', 'Replace "six" with zero and continue', 'Accept it because its first item is valid'], 0, 'The full batch must satisfy the declared input rule before its write begins.'),
    tf('A function appends 5 to a saved list, then raises ValueError on the next item. No rollback code or transaction is present.', 'The exception automatically removes the earlier append.', false, 'Raising an exception changes control flow. It does not reverse an earlier list mutation.'),
    q('The contract accepts only built-in int and float measurements, excluding booleans. The input is True.', 'Why does isinstance(value, int) need care here?', ['bool is a subclass of int, so that check accepts True', 'True is the text "1"', 'isinstance never accepts integers'], 0, 'Python’s bool inherits from int. The lesson’s validator makes its narrower representation policy explicit.'),
    tf('A required boundary check is written with if invalid: raise ValueError(...).', 'That conditional remains a required check when Python runs with -O.', true, 'Optimization can omit assert statements, not ordinary if statements and explicit raises.'),
    q('A total function promises one finite positive reading or more. The supplied list is empty.', 'Where should the program decide what this means?', ['In its declared input contract and a matching check', 'By hoping sum([]) is suitable for every application', 'In the formatting of the printed answer'], 0, 'The valid behavior for an empty collection depends on the operation. A convenient arithmetic default is not a contract.'),
    tf('A complete positive-value precheck passes before a real database update begins.', 'That precheck alone replaces database transactions and authorization checks.', false, 'Other state can change concurrently, and permission is a separate question. A data-shape precheck does not supply those guarantees.'),
    tf('The application explicitly promises to accept valid rows and return an error for each invalid row.', 'That partial-acceptance policy can be reasonable if its effects and failures are tested.', true, 'Fail early does not impose one universal batch policy. The stated behavior needs to match the application.'),
  ],
  practice: [
    challenge('Validate a Total Before Calculating It', [
      'Write validated_total(values). Accept a nonempty list whose items are built-in int or float values, finite, and greater than zero. Exclude booleans. Raise TypeError for a non-list argument or an unsuitable item type; raise ValueError for an empty list or a nonfinite/nonpositive number. Return the sum and leave the input unchanged.',
      'Print the result for [8, 7, 9]. The additional checks use other lengths and failure cases.',
    ], py(['def validated_total(values):', '    pass', '', 'print(validated_total([8, 7, 9]))']), validateTotalSolution, '24', [
      'Establish that the argument is a list before iterating. Check the empty-list rule explicitly.',
      'Check the representation before calling math.isfinite. Calculate the sum only after every item passes.',
    ], [
      ['Changed values and lengths', 'assert validated_total([2, 3.5]) == 5.5\nassert validated_total([11]) == 11\nassert validated_total([10**400]) == 10**400'],
      ['The input remains unchanged', 'values = [2, 4, 6]\nassert validated_total(values) == 12\nassert values == [2, 4, 6]'],
      ['Wrong representations fail clearly', 'for values in ((2, 3), [True], ["4"], [None]):\n    try: validated_total(values)\n    except TypeError: pass\n    else: raise AssertionError("An unsuitable representation was accepted")'],
      ['Empty and out-of-range inputs', 'for values in ([], [0], [-1], [float("nan")], [float("inf")]):\n    try: validated_total(values)\n    except ValueError: pass\n    else: raise AssertionError("An invalid value was accepted")'],
    ]),
    challenge('Keep a Rejected Batch out of Saved State', [
      'Write append_batch(destination, incoming). Both arguments must be lists. Reject destination is incoming with ValueError before changing anything; the two containers must be distinct. Every incoming item must satisfy the finite positive built-in int/float contract above, excluding booleans. Validate the complete incoming list before extending destination. On success return the destination’s new length. An empty incoming list is allowed when the containers are distinct.',
      'Use TypeError for wrong representations and ValueError for nonpositive or nonfinite numbers. Every failed call must leave destination unchanged. Do not change incoming. Print the new length and saved list for destination [2] and incoming [4, 8].',
    ], py(['def append_batch(destination, incoming):', '    pass', '', 'saved = [2]', 'print(append_batch(saved, [4, 8]))', 'print(saved)']), appendBatchSolution, '3\n[2, 4, 8]', [
      'The write belongs after the validation loop, not inside it.',
      'Use a late invalid item while checking your implementation. An exception is insufficient if earlier items were already appended.',
    ], [
      ['A changed successful batch', 'saved = [9]\nincoming = [1.5, 2.5, 4]\nassert append_batch(saved, incoming) == 4\nassert saved == [9, 1.5, 2.5, 4]\nassert incoming == [1.5, 2.5, 4]'],
      ['A late error cannot partially append', 'for incoming in ([3, 4, -1], [3, 4, "bad"], [3, True]):\n    saved = [10]\n    try: append_batch(saved, incoming)\n    except (TypeError, ValueError): pass\n    else: raise AssertionError("The invalid batch was accepted")\n    assert saved == [10], "The rejected batch changed saved state"'],
      ['An empty incoming batch is a no-op', 'saved = [2]\nassert append_batch(saved, []) == 1\nassert saved == [2]'],
      ['Both containers have a declared type', 'for destination, incoming in (((), []), ([], ())):\n    try: append_batch(destination, incoming)\n    except TypeError: pass\n    else: raise AssertionError("A non-list container was accepted")'],
      ['Aliased containers are rejected before mutation', 'shared = [3, 4]\ntry: append_batch(shared, shared)\nexcept ValueError: pass\nelse: raise AssertionError("Aliased input/output containers were accepted")\nassert shared == [3, 4]'],
    ]),
  ],
  build: build('Check the Whole Batch Before Writing',
    'Botie receives measurements for one all-or-nothing save. A late invalid item must prevent every planned write.',
    'Check each representation and positive value, combine the aligned flags, and connect the complete decision before the planned write. Return status, writes and badPositions. Positions start at zero.',
    { values: 'Incoming measurements' },
    [sample('A valid batch', { values: [5, 8, 2] }, writePlan([5, 8, 2])), sample('The final item is invalid', { values: [5, 8, 'two'] }, writePlan([], [2])), sample('A nonpositive measurement', { values: [4, 0, 6] }, writePlan([], [1]))],
    op('pyValidationGateWrite', op('pyValidationMaskAnd', op('pyValidationNumberFlags', s('values')), op('pyValidationPositiveFlags', s('values'))), s('values')),
    'Each input reaches its checks before the write decision. A rejected late item leaves the planned write list empty.',
    'This workshop plans an in-memory write. It does not save data, implement a transaction, run Python, or distinguish JSON numeric spellings such as 3 and 3.0.'),
  journey: journey('The saved batch must remain unchanged when any incoming measurement violates its contract.',
    'Place the Decision Before the Write', 'Try the valid batch, then build the checks before connecting a planned write.', 'A late invalid item returns a rejected status and no planned writes.',
    diagnose('The Last Item Fails', 'A construction saves the first values before checking the final item. What needs to change?',
      ['Validate the complete batch before the write', 'The all-or-nothing promise concerns the whole incoming list. Earlier valid items cannot be saved yet.'],
      ['Catch the later error and keep the earlier writes', 'That would leave a partial update despite the stated contract.'],
      'Inspect the complete flag list at the write gate, including the final position.'),
    [connection('python-function-design', 'Separate inputs from effects', 'The validation decision belongs before the operation that changes state.')],
    'What state must a test inspect after a rejected batch?', 'Keep failure checks beside the effect they must prevent.',
    { path: [0], title: 'Inspect the Item Decisions', challenge: 'Return one combined true-or-false decision for each measurement.', why: 'A combined batch decision is easier to diagnose when each item’s check is visible.' },
    ['The numeric and positive checks each return one flag per measurement.', 'Require both checks per item, then send that complete list and the measurements to the planned write.']),
  fresh: fresh('Two Different Invalid Representations', 'The batch now contains a boolean and a negative measurement. Return the rejected write plan and both zero-based bad positions.', { values: [7, true, 3, -4] }, writePlan([], [1, 3]), 'A plan copied from the earlier batch misses the new positions. Inspect every current item.'),
});

const requestExample = py([
  'from pydantic import BaseModel, ValidationError',
  '',
  'class Dispatch(BaseModel):',
  '    title: str',
  '    note: str | None',
  '    copies: int = 2',
  '',
  "for data in [{'title': 'Weekly report', 'note': None}, {'title': 'Weekly report'}]:",
  '    try:',
  '        dispatch = Dispatch.model_validate(data)',
  '        print(dispatch.model_dump())',
  '    except ValidationError as error:',
  "        print([(item['loc'], item['type']) for item in error.errors()])",
]);
const coercionExample = py([
  'from pydantic import BaseModel, ConfigDict, ValidationError',
  '',
  'class FlexibleCount(BaseModel):',
  '    count: int',
  '',
  'class StrictCount(BaseModel):',
  '    model_config = ConfigDict(strict=True)',
  '    count: int',
  '',
  "print(FlexibleCount.model_validate({'count': '3'}).count)",
  'try:',
  "    StrictCount.model_validate({'count': '3'})",
  'except ValidationError as error:',
  "    print(error.errors()[0]['type'])",
]);
const requestClass = py([
  'from pydantic import BaseModel, ConfigDict, ValidationError',
  '',
  'class ReportRequest(BaseModel):',
  "    model_config = ConfigDict(strict=True, extra='forbid')",
  '    title: str',
  '    note: str | None',
  '    copies: int = 1',
]);
const requestSolution = requestClass + '\n\n' + py([
  'def parse_request(data):',
  '    return ReportRequest.model_validate(data).model_dump()',
  '',
  "result = parse_request({'title': 'Inspection notes', 'note': None, 'copies': 3})",
  "print(result['copies'])",
  'print(result)',
]);
const ticketClass = py([
  'from pydantic import BaseModel, ConfigDict, ValidationError',
  '',
  'class TicketRequest(BaseModel):',
  "    model_config = ConfigDict(strict=True, extra='forbid')",
  '    owner: str',
  '    comment: str | None = None',
  '    priority: int = 2',
]);
const ticketSolution = ticketClass + '\n\n' + py([
  'def summarize_ticket(data):',
  '    ticket = TicketRequest.model_validate(data)',
  '    return {',
  "        'owner': ticket.owner,",
  "        'priority': ticket.priority,",
  "        'comment': ticket.comment,",
  "        'comment_supplied': 'comment' in ticket.model_fields_set,",
  '    }',
  '',
  "result = summarize_ticket({'owner': 'Ari', 'priority': 7})",
  "print(result['priority'])",
  'print(result)',
]);

export const pythonPydanticModels = lesson({
  id: 'python-pydantic-models', title: 'Pydantic Models and Optional Fields', section, topic,
  blurb: 'A record can require a field, allow None as its value, or provide a default when the field is omitted. Pydantic turns those declared rules into runtime validation, so the difference stays explicit at a program boundary.',
  openingTitle: 'Does an Empty Note Mean the Field Was Omitted?',
  openingBeforeHistory: true,
  opening: [
    'Pydantic is a Python library that checks incoming data against declared types and other rules. We describe a record in a model class, then ask the library to construct a validated instance or explain why the input does not satisfy it. A Pydantic model here is a data contract, not a machine learning model.',
    'Suppose a report request must include a title and a note field. The note may be None, meaning the requester explicitly has no note. The number of copies may be omitted, in which case we use a declared default. These choices look similar in an informal description, but a program needs to distinguish them.',
  ],
  prerequisites: [before('Type hints', 'python-type-hints'), before('Optional values', 'python-optional-values'), before('Dataclasses', 'python-dataclasses'), before('Fail Fast, Fail Early', 'python-fail-fast')],
  appliedIn: [before('Pydantic Constraints and Validators', 'python-pydantic-constraints')],
  outputLabel: 'An accepted record with an omission default, or a rejected request',
  checkpointTitle: 'Questions on Parts 1 and 2',
  history: history('Required and Nullable Fields in Pydantic v2', [
    source('Pydantic v2 design discussion, 2022', 'https://pydantic.dev/articles/pydantic-v2'),
    source('PEP 484: Type Hints', 'https://peps.python.org/pep-0484/'),
    source('Pydantic v2 field rules', 'https://docs.pydantic.dev/latest/concepts/fields/'),
  ],
  'Python’s type-hint system gave tools a common vocabulary for describing values, while leaving runtime enforcement to other tools. Pydantic uses annotations as part of a runtime data-validation interface. That lets an application check a record before passing it to code that depends on its shape.',
  'The word optional caused a particular ambiguity. It might mean a key can be left out, or that its value can be None. Samuel Colvin’s 2022 plan for Pydantic v2 explicitly discussed separating these cases. In v2, allowing None without declaring a default does not make a field omittable. That distinction is the center of this lesson; older v1 examples can behave differently.'),
  diagram: table('Two Questions for Every Field', 'Ask whether the caller must supply the key, then ask which values that key allows. These are Pydantic v2 declarations.', ['Declaration', 'May omit the key?', 'May supply None?'], [
    ['title: str', 'No', 'No'],
    ['note: str | None', 'No', 'Yes'],
    ['comment: str | None = None', 'Yes; its default is None', 'Yes'],
    ["status: str = 'draft'", "Yes; its default is 'draft'", 'No'],
  ], 'Optional[str] and str | None allow the same value alternatives. Neither spelling supplies a default by itself.'),
  parts: [
    p('Describe One Record with a Model Class',
      'A dictionary can contain any keys. It does not tell the next function which fields to expect. A model class gives those fields a named definition. The class keyword introduces the definition, and BaseModel in parentheses tells Python that our class uses Pydantic’s model behavior.\n\nInside the indented class body, title: str declares a field named title whose validated value is text. It is a field declaration, not a local variable being read from a particular request. After defining the class, Dispatch.model_validate(data) checks one supplied value against it and returns a Dispatch instance when validation succeeds.\n\nThe returned instance represents one request. We read an attribute with dispatch.title, much as the dataclass lesson accessed a named field. Ordinary annotations and dataclasses do not automatically provide Pydantic’s validation. The behavior comes from this library and its BaseModel interface.',
      null,
      'Keep the class definition separate from the incoming record. One describes the contract; the other is data being checked against it.'),
    p('Separate Presence from Nullability',
      'A field is required when the input must supply it. A field is nullable when None is one of its allowed values. A report can require a note field and still accept note=None. The key then communicates an explicit choice, rather than leaving the receiving program to guess.\n\nThe declaration note: str | None describes allowed values. It does not include a default. Pydantic v2 therefore rejects a record with no note key. The declaration comment: str | None = None adds a default and permits omission.\n\nThe typing spelling Optional[str] means str or None. It does not mean an argument or record field can automatically disappear. Keep that distinction consistent with the preceding optional-values lesson.',
      null,
      'In the program below, the first request supplies note with a None value. The second request omits it and fails.', [
        example('Supply None, Then Omit the Key', 'The same model receives both requests. The error is caught so the complete program can show both outcomes.', requestExample,
          "{'title': 'Weekly report', 'note': None, 'copies': 2}\n[(('note',), 'missing')]",
          'The model supplies copies because it has a default. It does not supply note because no default was declared.'),
      ]),
    p('Choose a Default for Omission',
      'A default answers a specific question: what should the receiving program use when the caller leaves this field out? copies: int = 2 supplies an integer when copies is absent. A caller can still provide a different acceptable integer.\n\nThe default does not generally replace an explicitly supplied invalid value. If copies cannot be None, supplying copies=None is a validation failure rather than a request to use the default. Otherwise a caller’s explicit choice could quietly turn into a different operation.\n\nChoose defaults because they make sense for the application, not because a field is inconvenient to require. A default output directory, permission level, or send flag can have consequences. A missing value should sometimes remain an error.',
      null,
      'Omission, an explicit None value, and an invalid value are different inputs. Test each one that your contract distinguishes.'),
    p('Decide Whether Conversion Is Allowed',
      'Data arriving from a text form often contains digits as strings. Pydantic’s ordinary validation can convert some representations, such as the string "3" into an int field. This is useful when conversion is part of the interface. It can also conceal that a producer is sending the wrong representation.\n\nA strict int field or strict model rejects that string instead. ConfigDict(strict=True) in the model_config attribute makes that policy visible for the model. Strictness follows Pydantic’s rules for each type and input mode; it is not a universal exact-Python-type-identity test. For example, a strict float field can accept a Python integer.\n\nThe examples here validate Python dictionaries, not raw JSON. JSON has fewer native types, so some strict-mode rules differ when validating JSON directly. Use the documentation for the type and input mode you actually accept.',
      null,
      'Choose coercion deliberately at the boundary. Later calculation code should not repeatedly guess whether a count is a string.', [
        example('Make the Count Representation a Policy', 'A flexible integer field converts a text count. The strict model rejects the same representation.', coercionExample,
          '3\nint_type',
          'The strict error concerns the representation of the input. A positive-range check would be a separate rule.'),
      ]),
    p('Choose What Happens to Unknown Keys',
      'A request might contain copes instead of copies. Pydantic models ignore extra fields by default. In a contract that is supposed to reject misspelled keys, this can make an input appear to work while a default is used instead of the intended value.\n\nConfigDict(extra="forbid") rejects unknown keys. The alternative extra="allow" deliberately retains them, while extra="ignore" deliberately discards them. Pick the behavior the interface promises. Forbidding extras is useful for a tightly specified request, but a forward-compatible event reader might choose another policy.\n\nRequiredness is independent of this choice. Rejecting unknown keys does not make a declared field required, and allowing an unknown key does not satisfy a missing required one.',
      null,
      'An explicit extra-field policy makes producer mistakes easier to diagnose. It does not prove the allowed fields express the right business operation.'),
    p('Read and Export a Validated Instance',
      'Once validation succeeds, use the returned instance. Read request.title as an attribute. When ordinary Python code needs a dictionary, request.model_dump() produces a representation of the model’s fields. This is different from continuing to process the original unchecked dictionary.\n\nThe model may contain defaults or converted values, so its data can differ from the original input. Returning the raw input after validation would discard that work. For nested models, model_dump also exports their fields into dictionaries; the next lesson uses that behavior explicitly.\n\nmodel_dump is not a promise that every Python value is ready for every external format. Pydantic has separate serialization options, including JSON output. Here the examples contain only ordinary text, integers, and None.',
      null,
      'Use the validated value as the boundary between the producer’s representation and the rest of the program.'),
    p('Keep Track of What the Caller Supplied',
      'A model can show the same final None value for an omitted optional comment and for an explicit comment=None. Sometimes the distinction matters. A patch request might leave an existing comment alone when the key is absent, but clear it when the key is present with None.\n\nThe model_fields_set attribute records which fields were explicitly supplied. Test whether "comment" is in that set instead of inferring presence from the final value. model_dump(exclude_unset=True) is another way to export only explicitly supplied fields when that matches an interface.\n\nThis is a presence distinction, not a truthiness test. Empty text, zero, False and None can each be meaningful values. A condition such as if comment cannot tell you whether the key was present.',
      null,
      'The ticket exercise asks you to return the final comment and a separate presence flag. That keeps the two questions visible.'),
    p('Handle Validation Failure at the Boundary',
      'Pydantic raises ValidationError when input data fails its declared checks. Catch that exception around the validation call when this layer can return useful input feedback. Its errors() method supplies structured details such as the field location and error type.\n\nA validation failure is different from a bug in the code that runs afterward. Keep the try block narrow. If a later calculation contains a NameError or another programming defect, do not label it “invalid request” by catching Exception around the whole handler.\n\nError details can contain submitted values. errors(include_input=False) omits the input entry from the structured error details. ConfigDict(hide_input_in_errors=True) changes the human-readable error display; it does not make the default errors() output input-free. Neither option automatically sanitizes a custom message or context. Select the field locations and error categories a caller needs instead of logging whole payloads or secrets.',
      null,
      'Catching ValidationError gives input failures a deliberate path while allowing unrelated defects to remain visible.'),
    p('What a Successful Model Does Not Establish',
      'This first model checks representations and presence. A title containing only spaces can still satisfy a plain str field. A negative number can satisfy a plain int field. We need additional constraints when those values are unacceptable.\n\nValidation also cannot establish that a requester owns a document or that a measurement is true. Those questions require authorization or knowledge outside this record. In a later lesson, keep a Pydantic request for an agent tool separate from the permission check that decides whether the tool may act.\n\nA successful validation describes the checked instance at that point. Ordinary Pydantic models can subsequently be changed. The constraints lesson explains assignment checks and why trusted update shortcuts are not fresh validation.',
      null,
      'A clear contract names exactly what has been checked, so the next layer knows what remains its responsibility.'),
  ],
  questions: [
    q('Pydantic v2 model field: note: str | None. No default is declared. Input: {"title":"Report"}. Assume title is another valid field.', 'What does this note declaration require?', ['A note key whose value may be text or None', 'No note key, because None is allowed', 'A text note, with None forbidden'], 0, 'The union allows None as a value. Without a default, the note field is still required.'),
    tf('Pydantic v2 field: comment: str | None = None. The input omits comment.', 'The resulting model can use None for comment without reporting a missing field.', true, 'The explicit default permits omission. Nullable values and requiredness have been declared separately.'),
    q('A strict Pydantic model declares count: int. Its input dictionary contains {"count":"3"}.', 'Which result matches the declared representation policy?', ['ValidationError for a string supplied to a strict integer field', 'Always convert the string because it contains digits', 'Silently use a default even though none was declared'], 0, 'Strict integer validation rejects this text representation. The lesson’s flexible example uses a different policy.'),
    tf('A model declares copies: int = 2. No nullable union or validator is present. The caller supplies copies=None.', 'The default automatically replaces the explicit None.', false, 'The default applies when the field is omitted. An explicitly supplied None must pass the field’s allowed-value rules.'),
    q('A request uses ConfigDict(extra="forbid") and declares copies: int = 2. The caller supplies {"copes":5}.', 'What does the extra-field policy help reveal?', ['The undeclared copes key', 'Whether five copies are affordable', 'Whether the caller owns the document'], 0, 'Rejecting unknown keys can expose misspellings. Authorization and business decisions require other checks.'),
    tf('An optional comment defaults to None. Request A omits comment; request B supplies comment=None.', 'Both instances can have comment=None while their model_fields_set values differ.', true, 'The final field value and explicit presence are separate facts. The supplied-field set retains the latter.'),
    q('Validation succeeds after a permitted conversion and the addition of defaults.', 'Which data should the processing code use?', ['The returned validated instance or its intended export', 'Only the original dictionary, discarding converted/defaulted values', 'An unrelated model created for a previous request'], 0, 'Use the result of the validation step so the rest of the program receives the declared representation.'),
    tf('A model accepts a record with a str title and int copies. No other checks exist.', 'Successful validation proves the title is meaningful and the requester is authorized.', false, 'A type/presence contract cannot establish business meaning or permissions.'),
  ],
  practice: [
    challenge('Declare the Report Request Contract', [
      'Define ReportRequest as a Pydantic BaseModel with a strict model and extra="forbid". It has title: str, a required note: str | None, and copies: int with default 1. Do not add a positive-count or nonempty-title rule in this exercise; those are different constraints. Write parse_request(data) to validate the dictionary and return the model_dump dictionary.',
      'Allow Pydantic ValidationError to reach the caller on invalid data. Print copies and the full result for {"title":"Inspection notes","note":None,"copies":3}.',
    ], py(['from pydantic import BaseModel, ConfigDict, ValidationError', '', 'class ReportRequest(BaseModel):', '    pass', '', 'def parse_request(data):', '    pass', '', "result = parse_request({'title': 'Inspection notes', 'note': None, 'copies': 3})", "print(result['copies'])", 'print(result)']), requestSolution,
    "3\n{'title': 'Inspection notes', 'note': None, 'copies': 3}", [
      'A union that allows None does not supply a default. Leave note without an assignment.',
      'Put the model configuration inside the class. Use model_validate, then return model_dump from that instance.',
    ], [
      ['Changed valid values and an omitted count', 'assert parse_request({"title":"New report","note":"Use both pages"}) == {"title":"New report","note":"Use both pages","copies":1}\nassert parse_request({"title":"Other","note":None,"copies":8})["copies"] == 8'],
      ['Missing differs from a supplied None', 'try: parse_request({"title":"Missing note"})\nexcept ValidationError as error: assert any(item["loc"] == ("note",) and item["type"] == "missing" for item in error.errors())\nelse: raise AssertionError("The required note was silently defaulted")'],
      ['Strict representations and unknown keys', 'for data in ({"title":"T","note":None,"copies":"3"}, {"title":"T","note":None,"copies":True}, {"title":"T","note":None,"copes":3}, {"title":"T","note":None,"copies":None}):\n    try: parse_request(data)\n    except ValidationError: pass\n    else: raise AssertionError("The declared contract was not enforced")'],
      ['The input is preserved and only declared rules are applied', 'data = {"title":"","note":None,"copies":-2}\nassert parse_request(data) == data\nassert data == {"title":"","note":None,"copies":-2}'],
    ]),
    challenge('Keep an Omitted Comment Distinct from an Explicit None', [
      'Define strict TicketRequest with extra="forbid". Require owner: str. Give comment: str | None the default None, and priority: int the default 2. Write summarize_ticket(data) returning owner, priority, comment and comment_supplied. The final flag is True exactly when the input explicitly supplied comment, including comment=None.',
      'Read explicit presence from the validated model’s model_fields_set. Preserve the input. Print priority and the summary for {"owner":"Ari","priority":7}. Invalid input must raise ValidationError.',
    ], py(['from pydantic import BaseModel, ConfigDict, ValidationError', '', 'class TicketRequest(BaseModel):', '    pass', '', 'def summarize_ticket(data):', '    pass', '', "result = summarize_ticket({'owner': 'Ari', 'priority': 7})", "print(result['priority'])", 'print(result)']), ticketSolution,
    "7\n{'owner': 'Ari', 'priority': 7, 'comment': None, 'comment_supplied': False}", [
      'The omitted comment gets a value of None. That value alone cannot reveal whether the caller supplied the key.',
      'Use membership in model_fields_set for the presence flag; use attributes for the final values.',
    ], [
      ['Defaulted and explicit None have different presence', 'a = summarize_ticket({"owner":"Bo"})\nb = summarize_ticket({"owner":"Bo","comment":None})\nassert a["comment"] is None and a["comment_supplied"] is False\nassert b["comment"] is None and b["comment_supplied"] is True\nassert a["priority"] == 2'],
      ['A changed explicit comment and priority', 'assert summarize_ticket({"owner":"Cam","comment":"","priority":5}) == {"owner":"Cam","priority":5,"comment":"","comment_supplied":True}'],
      ['Missing owner, coercion, and extras are rejected', 'for data in ({}, {"owner":"A","priority":"4"}, {"owner":"A","comments":"typo"}):\n    try: summarize_ticket(data)\n    except ValidationError: pass\n    else: raise AssertionError("An invalid request was accepted")'],
      ['No producer data is changed', 'data = {"owner":"Dee"}\nsummarize_ticket(data)\nassert data == {"owner":"Dee"}'],
    ]),
  ],
  build: build('Separate Omission from a Nullable Value',
    'Botie receives a report record. The title and note keys are required; note may contain text or null. The unit field defaults to celsius only when its key is absent.',
    'Check required-key presence and the nullable note independently. Add the unit omission default, then return accepted and record. A rejected request has record:null. This small workshop checks only the stated presence and note rules.',
    { request: 'Report record', required: 'Required keys', noteKey: 'Nullable note key', defaultKey: 'Field with an omission default', defaultValue: 'Omission default' },
    [
      sample('A supplied null note', { request: { title: 'North report', note: null }, required: ['title', 'note'], noteKey: 'note', defaultKey: 'unit', defaultValue: 'celsius' }, accepted({ title: 'North report', note: null, unit: 'celsius' })),
      sample('A note key is absent', { request: { title: 'North report' }, required: ['title', 'note'], noteKey: 'note', defaultKey: 'unit', defaultValue: 'celsius' }, rejected),
      sample('An explicit unit is retained', { request: { title: 'South report', note: 'Check later', unit: 'kelvin' }, required: ['title', 'note'], noteKey: 'note', defaultKey: 'unit', defaultValue: 'celsius' }, accepted({ title: 'South report', note: 'Check later', unit: 'kelvin' })),
    ],
    op('pyValidationReport', op('pyValidationDefaultField', s('request'), s('defaultKey'), s('defaultValue')), op('pyValidationAll', op('pyValidationPresence', s('request'), s('required')), op('pyValidationNullableText', s('request'), s('noteKey')))),
    'Presence is checked on the incoming record. The nullable-value check does not turn a missing key into a supplied null.',
    'These components expose presence, nullability and omission defaults. They do not execute Pydantic, reproduce all its type rules, or verify the title’s business meaning. JSON null represents Python None here.'),
  journey: journey('A report can explicitly have no note while still being required to include the note field.',
    'Build the Presence and Value Checks', 'Try the report with note:null, then construct the separate checks and omission default.', 'The first report is accepted while the record without note is rejected.',
    diagnose('The Note Key Disappears', 'A later request contains a title but no note. Which repair keeps the stated required-note contract?',
      ['Keep required-key presence separate from the nullable-value check', 'Allowing null concerns a present value. It does not authorize omitting the required key.'],
      ['Default every absent nullable key to null', 'That changes this interface from required-and-nullable to omittable.'],
      'Inspect the original request’s key list before following the default branch.'),
    [connection('python-optional-values', 'Distinguish None from a missing value', 'The same distinction matters at an input boundary.'), connection('python-fail-fast', 'Check before processing', 'The record is returned only after the declared checks pass.')],
    'Which declaration would you change if the product actually allowed the note key to be omitted?', 'Write default behavior separately from allowed values.',
    { path: [1], title: 'Inspect Requiredness First', challenge: 'Return the combined decision for required presence and the nullable note value.', why: 'This exposes why a present null passes and an absent key fails.' },
    ['Presence checks the original record and required-key list.', 'Apply the unit default to the record, and connect the combined decision to Return the accepted record.']),
  fresh: fresh('A Present but Wrong Note Representation', 'The next record supplies note as a number. Keep the supplied unit, but reject the request because the present note is neither text nor null.', { request: { title: 'Evening report', note: 17, unit: 'celsius' }, required: ['title', 'note'], noteKey: 'note', defaultKey: 'unit', defaultValue: 'celsius' }, rejected, 'Presence alone is insufficient. The current value also needs its own declared check.'),
});

const captureModel = py([
  'from typing import Self',
  'from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator, model_validator',
  '',
  'class Bounds(BaseModel):',
  "    model_config = ConfigDict(strict=True, extra='forbid')",
  '    lower: float = Field(allow_inf_nan=False)',
  '    upper: float = Field(allow_inf_nan=False)',
  '',
  "    @model_validator(mode='after')",
  '    def ordered(self) -> Self:',
  '        if self.lower >= self.upper:',
  "            raise ValueError('lower must be smaller than upper')",
  '        return self',
  '',
  'class CaptureRequest(BaseModel):',
  "    model_config = ConfigDict(strict=True, extra='forbid')",
  '    name: str = Field(min_length=1)',
  '    count: int = Field(gt=0, le=20)',
  '    bounds: Bounds',
  '    labels: list[str] = Field(default_factory=list)',
  '',
  "    @field_validator('name', mode='after')",
  '    @classmethod',
  '    def clean_name(cls, value: str) -> str:',
  '        value = value.strip()',
  '        if not value:',
  "            raise ValueError('name must contain non-whitespace text')",
  '        return value',
]);
const captureExample = captureModel + '\n\n' + py([
  "request = CaptureRequest.model_validate({'name': '  North  ', 'count': 3, 'bounds': {'lower': 2, 'upper': 9}})",
  'print(request.model_dump())',
  'try:',
  "    CaptureRequest.model_validate({'name': 'South', 'count': 3, 'bounds': {'lower': 9, 'upper': 2}})",
  'except ValidationError as error:',
  "    print([(item['loc'], item['type']) for item in error.errors()])",
]);
const factoryExample = py([
  'from pydantic import BaseModel, Field',
  '',
  'class Notes(BaseModel):',
  '    labels: list[str] = Field(default_factory=list)',
  '',
  'first = Notes()',
  'second = Notes()',
  "first.labels.append('review')",
  'print(first.labels)',
  'print(second.labels)',
]);
const assignmentExample = py([
  'from pydantic import BaseModel, ConfigDict, Field, ValidationError',
  '',
  'class OrdinaryCount(BaseModel):',
  '    count: int',
  '',
  'class CheckedCount(BaseModel):',
  '    model_config = ConfigDict(validate_assignment=True)',
  '    count: int = Field(gt=0)',
  '',
  'ordinary = OrdinaryCount(count=2)',
  "ordinary.count = 'many'",
  'print(type(ordinary.count).__name__)',
  'checked = CheckedCount(count=2)',
  'try:',
  '    checked.count = -1',
  'except ValidationError:',
  "    print('assignment rejected')",
  "print(type(CheckedCount.model_construct(count='many').count).__name__)",
  "print(type(checked.model_copy(update={'count': 'many'}).count).__name__)",
]);
const captureSolution = captureModel + '\n\n' + py([
  'def validate_capture(data):',
  '    return CaptureRequest.model_validate(data).model_dump()',
  '',
  "result = validate_capture({'name': '  West  ', 'count': 6, 'bounds': {'lower': -2, 'upper': 12}})",
  "print(result['count'])",
  'print(result)',
]);
const captureBatchSolution = captureModel + '\n\n' + py([
  'def read_capture_batch(rows):',
  '    if not isinstance(rows, list):',
  "        raise TypeError('Rows must be a list')",
  '    accepted = []',
  '    errors = []',
  '    for position, data in enumerate(rows):',
  '        try:',
  '            request = CaptureRequest.model_validate(data)',
  '        except ValidationError as error:',
  "            fields = sorted({'.'.join(map(str, item['loc'])) or '$' for item in error.errors()})",
  "            errors.append({'row': position, 'fields': fields})",
  '        else:',
  '            accepted.append(request.model_dump())',
  "    return {'accepted': accepted, 'errors': errors}",
  '',
  'rows = [',
  "    {'name': 'A', 'count': 4, 'bounds': {'lower': 1, 'upper': 5}},",
  "    {'name': 'B', 'count': 0, 'bounds': {'lower': 1, 'upper': 5}},",
  ']',
  'result = read_capture_batch(rows)',
  "print(len(result['accepted']))",
  "print(result['errors'])",
]);
const rangeRecipe = () => op('pyValidationReport', s('request'),
  op('pyValidationAll',
    op('pyValidationAll',
      op('pyValidationOrdered', op('pyValidationGetField', s('request'), s('lowerKey')), op('pyValidationGetField', s('request'), s('upperKey'))),
      op('pyValidationBoundedInteger', op('pyValidationGetField', s('request'), s('countKey')), s('maximumCount'))),
    op('pyValidationKnownFields', s('request'), s('allowed'))));
const rangeData = request => ({ request, lowerKey: 'lower', upperKey: 'upper', countKey: 'count', maximumCount: 20, allowed: ['lower', 'upper', 'count'] });

export const pythonPydanticConstraints = lesson({
  id: 'python-pydantic-constraints', title: 'Pydantic Constraints and Validators', section, topic,
  blurb: 'A correctly typed request can still ask for an impossible range or an unsuitable count. Express field limits, relationships and normalization explicitly, then route validation errors without hiding defects in the program.',
  openingTitle: 'The Endpoints Are Numbers. Is the Range Usable?',
  opening: [
    'Botie is asked to collect readings within a declared range. The lower endpoint is larger than the upper endpoint. Both values are numbers, so a type check alone accepts their representations. We still have no usable interval.',
    'Some rules concern one field, such as a positive count. Others concern a relationship, such as lower being smaller than upper. We will put each rule where its inputs are available, then decide how the caller receives a rejected request.',
  ],
  prerequisites: [before('Pydantic Models and Optional Fields', 'python-pydantic-models')],
  appliedIn: [before('Python Exceptions', 'python-exceptions')],
  outputLabel: 'A request accepted only after every declared range check',
  checkpointTitle: 'Questions on Parts 1 and 2',
  history: history('Field and Model Validation in Pydantic v2', [
    source('Pydantic v2 design: validator structure', 'https://pydantic.dev/articles/pydantic-v2'),
    source('Pydantic field constraints', 'https://docs.pydantic.dev/latest/concepts/fields/'),
    source('Pydantic field and model validators', 'https://docs.pydantic.dev/latest/concepts/validators/'),
    source('Pydantic v2 migration behavior', 'https://docs.pydantic.dev/latest/migration/'),
  ],
  'A handwritten record check can begin with a few conditions, then grow as records acquire nested fields and relationships. The same rules are easy to scatter across constructors and handlers. A schema-based validator keeps that declared contract together while reporting where an input failed.',
  'Pydantic’s 2022 v2 design described a tree of validators and separate ways to apply custom checks. The resulting v2 interfaces distinguish checks on one field from checks on a completed model. This is a useful engineering distinction even without the library: a rule about one count needs that count, while a rule comparing two endpoints needs both endpoints.'),
  diagram: table('Give Each Rule the Information It Needs', 'The capture request contains a name, a count and a nested bounds record.', ['Requirement', 'Inputs needed', 'Where we declare it'], [
    ['Count is positive and no greater than the limit', 'count', 'Field constraints'],
    ['Name contains text after stripping outer whitespace', 'name', 'A field validator'],
    ['Lower endpoint is smaller than upper endpoint', 'bounds.lower and bounds.upper', 'A model validator on Bounds'],
    ['Every omitted label list starts independently', 'No caller value was supplied', 'A default factory'],
  ], 'These are application requirements. Pydantic cannot decide whether the chosen range fits the real sensor.'),
  parts: [
    p('Give a Nested Record Its Own Contract',
      'A capture request contains a bounds record with lower and upper endpoints. A nested dictionary keeps those values together, but it does not check them. Define Bounds as a BaseModel, then declare bounds: Bounds inside CaptureRequest.\n\nWhen the outer model validates an ordinary input dictionary, Pydantic validates that nested record too. The returned request.bounds is a Bounds instance. Its fields can be accessed as request.bounds.lower and request.bounds.upper.\n\nDefine the nested class before the class that refers to it in these examples. This makes the dependency visible and avoids introducing forward references while we are learning the basic structure.',
      null,
      'The nested contract belongs to the range itself. Another request can reuse it when it genuinely needs the same range rules.'),
    p('Attach Simple Limits to Fields',
      'Field adds constraints to a declaration. count: int = Field(gt=0, le=20) requires an integer greater than zero and no greater than the stated maximum. These comparisons have different boundaries; test a value exactly at each boundary as well as a value outside it.\n\nThe strict model configuration rejects text and booleans for this integer field. The float endpoints use strict float validation and allow_inf_nan=False. Strict floats can accept Python integers and produce float values, so strict does not mean that every field requires literal type identity. Nonfinite endpoints must be rejected because they would not describe this ordinary finite interval.\n\nA constraint is a policy we chose for this capture service. A different service can legitimately allow an empty collection or a larger count. Keep the reason for each limit in the explanation and tests.',
      'Capture count: a whole number above 0 and at most 20\nBounds: finite numeric endpoints\nRelationship: lower < upper',
      'A field can have the right representation while lying outside its permitted range.'),
    p('Normalize One Field with a Field Validator',
      'A name consisting of spaces technically contains characters, but it does not identify this capture. We want to remove surrounding whitespace and reject a name that is then empty. A field validator receives that field’s value and returns its accepted or normalized replacement.\n\nThe @field_validator line decorates the method below it, telling Pydantic which field to process. mode="after" runs the method after the normal field validation, so value is already text here. @classmethod gives the method the class as cls. The method still needs to return the value it wants stored.\n\nRaise ValueError for a deliberate input rejection. Do not raise ValidationError yourself. Pydantic collects appropriate validator failures into its structured validation error. A TypeError caused by a programming mistake inside a v2 validator is not automatically converted into ValidationError.',
      null,
      'A validator is ordinary Python code with a specific role. A missing return or a bad function call is still a programming defect.'),
    p('Compare Fields with a Model Validator',
      'The relationship lower < upper cannot be decided from either endpoint alone. An after model validator receives the constructed Bounds instance and can compare its fields. It returns self when the relationship is acceptable and raises ValueError when it is not.\n\nThe Self return annotation describes an instance of the containing class. It does not perform validation. The comparison and the explicit raise enforce the relationship. Notice that the method is an instance method; it does not use the @classmethod decorator that our field validator used.\n\nKeep validation free of external effects. A range check should not write a file or reserve equipment before another field has finished validating. Validating a request and carrying out the request remain separate operations.',
      null,
      'Run the complete program and compare the accepted range with a reversed one.', [
        example('Validate a Complete Capture Request', 'The name is normalized, the integer endpoints become floats, and the reversed range is reported at its nested location.', captureExample,
          "{'name': 'North', 'count': 3, 'bounds': {'lower': 2.0, 'upper': 9.0}, 'labels': []}\n[(('bounds',), 'value_error')]",
          'The range rule belongs to Bounds. The outer request reports that nested model’s failure instead of starting a capture.'),
      ]),
    p('Create Independent Defaults',
      'A list is mutable. When a caller omits labels, we want a fresh list for that request. Field(default_factory=list) calls list to produce the default instead of expressing an accidentally shared object policy.\n\nPydantic does copy certain non-hashable defaults, so its field behavior is not identical to an ordinary function’s default argument. A default factory still states the intended construction clearly. The mutation lesson examines ordinary Python defaults and shallow copies in more detail.\n\nDefaults are not validated by Pydantic unless default validation is enabled for the field or model. Keep a literal default valid, or deliberately enable validate_default when a generated/default value also needs to pass the contract.',
      null,
      'The two model instances below do not acquire each other’s labels.', [
        example('Add a Label to Only One Request', 'Both instances omit labels. Their default lists are independent.', factoryExample,
          "['review']\n[]", 'The second instance remains empty after the first one changes.'),
      ]),
    p('Return Input Errors without Swallowing Defects',
      'A caller that accepts a batch can validate each record inside a narrow try block. Catch ValidationError for that record, record its position and the relevant field locations, then move on if partial acceptance is the stated policy. Keep successful validated records in a separate collection.\n\nDo not catch every exception and call it an invalid row. A misspelled variable or a broken validator needs to be diagnosed as code, not presented as a producer’s bad input. TypeError escaping a v2 validator is one example of why the exception category matters.\n\nPydantic error details may include the submitted input. Our batch exercise returns row numbers and field paths rather than echoing whole records. A public application should choose its error response and logging policy with the data’s sensitivity in mind.',
      null,
      'A useful batch report tells the producer what needs correction while keeping failures in the program visible to developers.'),
    p('A Validated Instance Can Be Changed Later',
      'Ordinary assignment is not revalidated by default. A model that passed when it was constructed can later receive an unsuitable attribute value. ConfigDict(validate_assignment=True) requests assignment validation, which can help with ordinary attribute updates.\n\nThat setting is not a general immutability or transaction guarantee. Mutating a nested list does not assign the attribute again. Complex model-level update checks also deserve tests for their failure-state behavior. For a critical update, construct and validate a complete candidate from fresh data before replacing the previous accepted value.\n\nmodel_construct deliberately bypasses validation for trusted data. model_copy(update=...) also trusts the update rather than validating it. Do not use those methods to ingest a new external request. The small program below makes the bypass visible even on a class that validates ordinary assignment.',
      null,
      'Choosing a trusted-data shortcut means the caller, not Pydantic, is responsible for that data.', [
        example('Compare Ordinary Assignment with Trusted Updates', 'A simple positive-count rule illustrates the difference. The code catches its expected assignment error.', assignmentExample,
          'str\nassignment rejected\nstr\nstr',
          'The final two values entered through deliberate validation bypasses. They are not evidence of successful count validation.'),
      ]),
    p('Keep the Contract within Its Scope',
      'A well-formed capture request can still name a nonexistent sensor. Its requested interval might be inappropriate for the physical device. A requester might lack permission to start a capture. Those checks depend on information outside this schema.\n\nThe boundary contract gives later code a declared representation and local value rules. Authorization, current device state and the decision to perform the effect remain separate responsibilities. Keeping them separate also makes each one easier to test.\n\nThe workshop below exposes a few local range and count checks as building blocks. The Python exercises use real Pydantic, including a nested model and custom validators. The workshop is not a substitute implementation of the library.',
      null,
      'Name the evidence precisely: this request satisfied these declared validation rules at this point in the program.'),
  ],
  questions: [
    q('A request field declares bounds: Bounds. Bounds declares lower: float and upper: float. The input bounds value is {"lower":2,"upper":9}.', 'What does the nested model declaration allow Pydantic to do?', ['Validate the nested record using the Bounds contract', 'Infer whether the sensor is physically accurate', 'Skip all nested field checks'], 0, 'The outer contract refers to the nested model. Its declared fields and validators are checked as part of constructing the request.'),
    tf('A strict count field uses int = Field(gt=0, le=20). The input supplies count=20.', 'The count satisfies these stated field limits.', true, 'le includes the upper boundary. The count is an integer greater than zero.'),
    q('A Bounds model has finite lower and upper float fields. Its after model validator rejects lower >= upper. The supplied endpoints are lower=9 and upper=2.', 'Which failure is the custom validator addressing?', ['The relationship between two otherwise numeric values', 'A missing class keyword', 'An unknown extra field'], 0, 'The model validator sees both endpoints and enforces the ordering relationship.'),
    tf('A strict float field validates a Python integer such as 2.', 'Strict mode universally requires type(value) to be exactly the annotated class.', false, 'Strictness follows type-specific rules. Pydantic strict float validation can accept Python integers.'),
    q('A field validator for name runs in after mode, strips outer whitespace, rejects an empty result, and returns the result.', 'Why must it return the accepted name?', ['The returned value is what the field keeps after that validator', 'Returning a value automatically authorizes a capture', 'A validator’s return value is always ignored'], 0, 'A field validator can normalize a value. Its return is part of the field’s validation pipeline.'),
    tf('A model declares labels: list[str] = Field(default_factory=list). Two instances omit labels.', 'Appending to one default list does not by itself append to the other instance’s list.', true, 'The factory creates a new default list for each instance.'),
    q('A Pydantic v2 validator accidentally calls a function with an unsuitable argument and raises TypeError.', 'What should the surrounding application avoid?', ['Catching every exception and falsely labeling this as an ordinary rejected input', 'Allowing the defect to remain visible to debugging and monitoring', 'Keeping the validation try block narrow'], 0, 'A TypeError in a v2 validator is not automatically turned into ValidationError. Broad handlers can hide a programming defect.'),
    tf('A class uses validate_assignment=True. New external data is applied using model_copy(update=...).', 'The update dictionary is automatically validated because assignment validation is enabled.', false, 'model_copy updates are trusted-data paths. Assignment validation does not turn that method into fresh input validation.'),
    q('A capture request passes its local schema and range rules. The device registry and permission system have not been consulted.', 'What has been established?', ['The declared local input contract, not device existence or authorization', 'Every condition needed to operate a real device', 'That the values will remain valid after arbitrary mutation'], 0, 'The schema’s scope is limited to the checks actually performed. Other responsibilities need their own checks.'),
  ],
  practice: [
    challenge('Validate a Nested Capture Request', [
      'Implement the Bounds and CaptureRequest contracts shown in the lesson, plus validate_capture(data) returning model_dump(). Both models are strict and forbid extras. Bounds has finite float lower and upper endpoints, with lower < upper. Strict float fields may accept Python integers. CaptureRequest has name: str, count: int in the interval above 0 through 20, bounds: Bounds, and labels: list[str] with an independent empty-list default.',
      'Strip outer whitespace from name and reject an empty result with ValueError in a field validator. Enforce endpoint order with an after model validator. Allow ValidationError to reach the caller. Do not add assignment validation or use validation-bypassing constructors. Print count and the full validated record for the supplied West request.',
    ], py(['from typing import Self', 'from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator, model_validator', '', 'class Bounds(BaseModel):', '    pass', '', 'class CaptureRequest(BaseModel):', '    pass', '', 'def validate_capture(data):', '    pass', '', "result = validate_capture({'name': '  West  ', 'count': 6, 'bounds': {'lower': -2, 'upper': 12}})", "print(result['count'])", 'print(result)']), captureSolution,
    "6\n{'name': 'West', 'count': 6, 'bounds': {'lower': -2.0, 'upper': 12.0}, 'labels': []}", [
      'Give the bounds record its own BaseModel and its own extra-field policy.',
      'Use field constraints for count and finite endpoints. Return the stripped name from the field validator and self from the successful model validator.',
    ], [
      ['Changed valid range and upper count boundary', 'result = validate_capture({"name":"  East ","count":20,"bounds":{"lower":0.5,"upper":8},"labels":["review"]})\nassert result == {"name":"East","count":20,"bounds":{"lower":0.5,"upper":8.0},"labels":["review"]}'],
      ['Counts require strict integers within the limit', 'for count in (0, 21, True, "3", 3.0):\n    try: validate_capture({"name":"A","count":count,"bounds":{"lower":1,"upper":5}})\n    except ValidationError: pass\n    else: raise AssertionError("An invalid count was accepted")'],
      ['Nested constraints and unknown fields', 'for bounds in ({"lower":5,"upper":5}, {"lower":9,"upper":2}, {"lower":1,"upper":float("inf")}, {"lower":1,"upper":5,"unit":"C"}):\n    try: validate_capture({"name":"A","count":2,"bounds":bounds})\n    except ValidationError: pass\n    else: raise AssertionError("Invalid bounds were accepted")'],
      ['Whitespace-only names fail', 'try: validate_capture({"name":"   ","count":1,"bounds":{"lower":1,"upper":2}})\nexcept ValidationError: pass\nelse: raise AssertionError("An empty normalized name was accepted")'],
      ['Fresh defaults and producer data are preserved', 'data = {"name":" A ","count":2,"bounds":{"lower":1,"upper":4}}\na = validate_capture(data)\nb = validate_capture(data)\na["labels"].append("local")\nassert b["labels"] == []\nassert data == {"name":" A ","count":2,"bounds":{"lower":1,"upper":4}}'],
    ]),
    challenge('Return Accepted Requests and Useful Input Errors', [
      'The complete CaptureRequest model is provided. Write read_capture_batch(rows). Require a list, otherwise raise TypeError. For each row, call CaptureRequest.model_validate. Keep successful model_dump dictionaries in accepted, in input order. Catch only ValidationError for a rejected row.',
      'For each rejected row, return {"row": zero_based_position, "fields": sorted_unique_field_paths}. Build each path by joining the errors() location components with dots; use "$" for an empty root location. Return {"accepted": [...], "errors": [...]}. Do not echo submitted values or mutate rows. Print the number of accepted rows and the error list for the supplied batch.',
    ], captureModel + '\n\n' + py(['def read_capture_batch(rows):', '    pass', '', "rows = [{'name': 'A', 'count': 4, 'bounds': {'lower': 1, 'upper': 5}}, {'name': 'B', 'count': 0, 'bounds': {'lower': 1, 'upper': 5}}]", 'result = read_capture_batch(rows)', "print(len(result['accepted']))", "print(result['errors'])"]), captureBatchSolution,
    "1\n[{'row': 1, 'fields': ['count']}]", [
      'Keep the validation call in its own try block. Append a successful export in else so unrelated code defects are not mislabeled.',
      'An error location is a tuple that may include names and integer positions. Convert components to text before joining them.',
    ], [
      ['Changed batch order and nested field locations', 'rows = [{"name":"A","count":2,"bounds":{"lower":1}}, {"name":" B ","count":5,"bounds":{"lower":0,"upper":9}}]\nresult = read_capture_batch(rows)\nassert result["errors"] == [{"row":0,"fields":["bounds.upper"]}]\nassert len(result["accepted"]) == 1 and result["accepted"][0]["name"] == "B"'],
      ['An empty batch is a valid empty report', 'assert read_capture_batch([]) == {"accepted":[],"errors":[]}'],
      ['Multiple failures retain their positions and field paths', 'result = read_capture_batch([{"name":" ","count":0,"bounds":{"lower":1,"upper":2}}, None])\nassert result["accepted"] == []\nassert result["errors"] == [{"row":0,"fields":["count","name"]},{"row":1,"fields":["$"]}]'],
      ['Wrong container type remains a caller error', 'try: read_capture_batch(())\nexcept TypeError: pass\nelse: raise AssertionError("The non-list argument was hidden")'],
    ]),
  ],
  build: build('Check a Capture Range before Accepting It',
    'Botie receives endpoints and a requested count. Every local rule must pass: finite endpoints in increasing order, a positive integer count at most the supplied maximum, and no unknown keys.',
    'Read the named fields, check their range and count rules, and combine those checks with the allowed-key check. Return accepted and record, using record:null on rejection. All sample records contain the named endpoint and count fields.',
    { request: 'Capture request', lowerKey: 'Lower endpoint key', upperKey: 'Upper endpoint key', countKey: 'Requested-count key', maximumCount: 'Maximum count', allowed: 'Allowed field names' },
    [
      sample('An ordinary capture', rangeData({ lower: 2, upper: 9, count: 4 }), accepted({ lower: 2, upper: 9, count: 4 })),
      sample('The endpoints reverse', rangeData({ lower: 9, upper: 2, count: 4 }), rejected),
      sample('An unknown field arrives', rangeData({ lower: -2, upper: 5, count: 8, counts: 3 }), rejected),
      sample('The inclusive count limit', rangeData({ lower: 0, upper: 1, count: 20 }), accepted({ lower: 0, upper: 1, count: 20 })),
    ], rangeRecipe(),
    'The ordering check needs both endpoints. The count check and the allowed-key check are separate requirements; passing one cannot substitute for the others.',
    'This is a local contract-checking construction, not Pydantic. JSON numbers cannot distinguish Python 3 from 3.0. The real strict-integer representation tests run in the Python exercises.'),
  journey: journey('A request with numeric endpoints can still describe an unusable range.',
    'Build the Complete Capture Decision', 'Inspect a valid request, then connect each declared rule before accepting the record.', 'A reversed interval fails even when its count and field names are acceptable.',
    diagnose('A New Key Appears', 'The original range checks pass, but a later producer adds counts beside count. What would the declared extra-forbid policy require?',
      ['Check the supplied keys against the allowed names', 'An otherwise valid count does not make an unknown key part of the contract.'],
      ['Ignore the key because the range is usable', 'That silently changes the promised policy for unknown fields.'],
      'Keep the allowed-key check connected to the final combined decision.'),
    [connection('python-pydantic-models', 'Make the record contract explicit', 'Presence, values, and extra keys remain separate choices.'), connection('python-fail-fast', 'Make the decision before effects', 'A failed local rule prevents the capture request from being accepted.')],
    'Which rules need one field, and which need several fields together?', 'Keep each validator near the information that gives its check meaning.',
    { path: [1, 0], title: 'Inspect Range and Count', challenge: 'Return the combined ordering and count decision before adding the allowed-key check.', why: 'The intermediate result shows why independently valid field representations can still fail a relationship.' },
    ['Read the endpoint fields and connect lower before upper.', 'Require the bounded count and known-key checks as well as the range check before returning the accepted record.']),
  fresh: fresh('A Boolean Is Not a Requested Count', 'The range is now negative to positive, and count is true. Reject the request under the declared integer-count policy.', rangeData({ lower: -5, upper: 5, count: true }), rejected, 'A usable interval does not repair an unsuitable count representation.'),
});

const narrowHandlerExample = py([
  "fields = ['8', 'unknown', ' 3 ']",
  'for position, text in enumerate(fields):',
  '    try:',
  '        count = int(text)',
  '    except ValueError:',
  "        print('rejected position', position)",
  '    else:',
  "        print('accepted count', count)",
]);
const chainedExample = py([
  'class SettingsError(Exception):',
  '    pass',
  '',
  'def read_timeout(text):',
  '    try:',
  '        return int(text)',
  '    except ValueError as error:',
  "        raise SettingsError('timeout must be a whole number') from error",
  '',
  'try:',
  "    read_timeout('later')",
  'except SettingsError as error:',
  '    print(str(error))',
  '    print(type(error.__cause__).__name__)',
]);
const parseCountsSolution = py([
  'def parse_counts(texts):',
  '    if not isinstance(texts, list):',
  "        raise TypeError('Counts must be a list')",
  '    values = []',
  '    rejected = []',
  '    for position, text in enumerate(texts):',
  '        if not isinstance(text, str):',
  "            raise TypeError('Every count field must be text')",
  '        try:',
  '            count = int(text)',
  '            if count < 0:',
  "                raise ValueError('A count cannot be negative')",
  '        except ValueError:',
  '            rejected.append(position)',
  '        else:',
  '            values.append(count)',
  "    return {'values': values, 'rejected': rejected}",
  '',
  "result = parse_counts(['6', 'bad', ' 4 ', '-2'])",
  "print(sum(result['values']))",
  'print(result)',
]);
const limitSolution = py([
  'class LimitError(Exception):',
  '    pass',
  '',
  'def parse_limit(value, maximum):',
  '    if not isinstance(value, str) or type(maximum) is not int:',
  "        raise TypeError('Use text and a whole-number maximum')",
  '    if maximum < 1:',
  "        raise ValueError('The maximum must be positive')",
  '    try:',
  '        result = int(value)',
  '    except ValueError as error:',
  "        raise LimitError('limit must be a whole number') from error",
  '    if not 1 <= result <= maximum:',
  "        raise LimitError('limit outside allowed range')",
  '    return result',
  '',
  'try:',
  "    parse_limit('many', 40)",
  'except LimitError as error:',
  '    print(str(error))',
  '    print(type(error.__cause__).__name__)',
  "print(parse_limit('12', 40))",
]);

export const pythonExceptions = lesson({
  id: 'python-exceptions', title: 'Python Exceptions', section, topic,
  blurb: 'An exception carries a failed operation back to a caller that may be able to handle it. Keep recovery specific, preserve the useful cause, and avoid disguising a defect as a successful result.',
  openingTitle: 'What Should Happen to a Count That Says “Unknown”?',
  opening: [
    'An import contains count fields as text. Most contain digits, while one contains the word unknown. Replacing that field with zero would create a number that the source never supplied. Stopping every future import might also be the wrong policy.',
    'For this lesson, the importer deliberately accepts valid fields and returns the positions that need correction. We will handle that expected conversion failure narrowly. Other failures will still reach the caller instead of being swept into the same error list.',
  ],
  prerequisites: [before('Fail Fast, Fail Early', 'python-fail-fast'), before('Pydantic Constraints and Validators', 'python-pydantic-constraints')],
  appliedIn: [before('Context Managers and Resource Cleanup', 'python-context-managers')],
  outputLabel: 'Parsed values kept beside the positions needing correction',
  checkpointTitle: 'Questions on Parts 1 and 2',
  history: history('Exception Chaining in Python', [
    source('Python errors and exception handling', 'https://docs.python.org/3.14/tutorial/errors.html'),
    source('PEP 3134: Exception Chaining and Embedded Tracebacks', 'https://peps.python.org/pep-3134/'),
  ],
  'A low-level failure can need a higher-level explanation. An integer conversion might fail while reading an application setting, so the caller needs to know which setting failed as well as what the conversion reported. Throwing away the earlier failure makes that harder to diagnose.',
  'PEP 3134, created in 2005 for Python 3.0, addressed lost exception information and explicit exception chaining. Python’s raise ... from ... form can attach the original exception as the cause of a new one. It lets a layer explain its own operation while preserving the failure beneath it.'),
  diagram: table('Choose a Recovery Policy for Each Failure', 'This importer accepts valid count strings and reports invalid count strings. Other callers can choose a different policy.', ['Situation', 'What failed', 'Policy in this lesson'], [
    ['The field contains "unknown"', 'A text-to-integer conversion', 'Record that position for correction'],
    ['The parsed count is negative', 'The declared nonnegative-count rule', 'Record that position for correction'],
    ['The caller supplies a non-text field', 'The parser’s representation contract', 'Raise TypeError to the caller'],
    ['The processing code uses an undefined name', 'The implementation', 'Let the defect remain visible'],
  ], 'An exception class is information for choosing a handler. It does not determine one universal recovery action.'),
  parts: [
    p('Read What the Exception Is Telling You',
      'An exception interrupts the normal path through an operation. If no local handler matches it, Python passes it back through the calls that led to that operation. A traceback shows that chain and the locations involved. The final exception type and message describe the failure that reached the outer caller.\n\nA ValueError from int("unknown") tells us that the supplied text cannot be interpreted as an integer. A TypeError can report an unsuitable argument representation. A NameError identifies a name that the program could not resolve. Read the actual message and the relevant source line rather than treating every traceback as the same kind of problem.\n\nThe caller may have enough context to recover. A small conversion function usually cannot decide whether a whole file should be rejected or a user should be asked to correct one field.',
      null,
      'Handling belongs at a layer that can make a useful decision about the failure.'),
    p('Keep the Try Block Narrow',
      'The try block identifies the operations whose expected failures we intend to handle. Put the conversion there, then name ValueError in the except clause. Code after a successful conversion can live in else, so an unrelated error there is not accidentally included in the conversion handler.\n\nThe example deliberately reports a rejected position and continues. That policy is part of the importer’s contract. It would be wrong for the all-or-nothing write in the previous lesson, where one invalid item must prevent the entire write.\n\nAn except block can itself fail. It should also be ordinary, inspectable code. A complicated recovery routine is not automatically more reliable than allowing a clear failure to reach a caller.',
      null,
      'Each field keeps its own outcome, and the invalid field is not turned into a made-up measurement.', [
        example('Handle Only the Expected Conversion Failure', 'The importer keeps processing after the text field it knows how to reject.', narrowHandlerExample,
          'accepted count 8\nrejected position 1\naccepted count 3',
          'The output reports both accepted values and the position needing correction.'),
      ]),
    p('Catch a Specific Category',
      'Handlers match an exception class and its subclasses. A broad except Exception can therefore catch many failures that a program has no useful way to repair. A bare except catches even more, including exceptions normally used to interrupt or exit a program.\n\nCatching an exception without restoring a valid state or reporting the failure hides information from the caller. Returning None or zero after an unexpected exception can make a failed operation resemble a successful one. If a sentinel result is part of an interface, document it and make sure it cannot be confused with an ordinary result.\n\nSometimes an outer application boundary intentionally catches Exception to return a controlled error response and record a defect. That is different from pretending a low-level operation succeeded. Do not catch BaseException casually or prevent users from interrupting work.',
      null,
      'The right handler is determined by the recovery this layer can perform, not by how many failures one clause can silence.'),
    p('Separate Input Rejection from a Defect',
      'In the Pydantic lessons, ValidationError means data failed the declared validation pipeline. A wrong call inside a custom validator may instead raise TypeError. Catching only ValidationError keeps those paths distinct.\n\nTypeError is not always a programming defect: an external caller can genuinely send the wrong representation. The important question is which representations this boundary is meant to accept, and which errors this layer promises to recover from. Our text-count importer reports invalid text contents but rejects non-text fields as a different caller error.\n\nA test can verify that a known bad field is reported while an unexpected failure still propagates. That protects the failure policy when someone later adds a convenient-looking broad handler.',
      null,
      'Name the specific failure your handler understands. Leave other categories available to the layer that can act on them.'),
    p('Add Context and Preserve the Cause',
      'A setting called timeout is more informative to an application operator than a bare conversion error. Define a small exception class derived from Exception when a caller needs a named application-level category. Raise it with an explanation of the operation that failed.\n\nThe from error clause explicitly links that new exception to the caught failure. The cause remains available through __cause__ and appears in a normal chained traceback. You can communicate the setting-level problem without losing the original conversion information.\n\nDo not include passwords or complete private records merely to make an error more detailed. An internal diagnostic and a public response can need different amounts of information.',
      null,
      'The message explains the setting; the cause explains the conversion.', [
        example('Translate a Configuration Failure', 'The program catches its application-level error and inspects the preserved cause.', chainedExample,
          'timeout must be a whole number\nValueError', 'The handler translated the failure without erasing where it came from.'),
      ]),
    p('Keep Cleanup Independent of Recovery',
      'A parser can fail while a file is open. Whether we recover from that parser error is separate from whether the file must be closed. A finally block runs cleanup as control leaves the protected operation, including when an exception propagates.\n\nPython’s with statement gives resource-owning objects a defined way to participate in that cleanup. The context-manager lesson develops the mechanism using an in-memory text buffer, so you can inspect it without creating files.\n\nAvoid a return statement in cleanup that accidentally suppresses an exception or replaces the result being returned. Cleanup should preserve the failure unless suppressing it is an explicit and justified part of the interface.',
      null,
      'Releasing a resource does not require pretending the operation using it succeeded.'),
    p('Test Both the Error and Its Consequences',
      'For the importer, test that accepted fields keep their order and that rejected positions point to the original input. A changed batch length should not break that correspondence. Include empty input and a field with surrounding spaces.\n\nFor a translated configuration failure, test the exception category, its useful message and its cause. Also test a parsed integer outside the allowed range. That second failure comes from the domain rule, not from a conversion exception, so it should not claim to have a conversion cause.\n\nIf a function changes state, inspect that state after failure. An exception assertion alone does not establish that no partial effect occurred.',
      null,
      'A failure test checks the promised behavior of the operation, including what must remain unchanged.'),
  ],
  questions: [
    q('The importer accepts valid integer strings and records the positions of invalid integer strings. The input is ["4","unknown","7"].', 'Which result matches that explicit policy?', ['Values [4,7] with rejected position [1]', 'Values [4,0,7] with no reported error', 'A result from an earlier batch'], 0, 'The invalid text has no count value. Its original position is retained for correction.'),
    tf('Only int(text) is inside try, with except ValueError. The successful-processing code is in else.', 'An unrelated exception raised inside else is caught by that preceding ValueError handler.', false, 'A try statement’s handlers handle matching failures from its try block. They do not automatically handle failures raised in else.'),
    q('A function catches Exception and returns zero, even for an undefined variable. Zero is also a valid result.', 'What information can this hide?', ['Whether the operation succeeded or failed because of a defect', 'Only the font of the traceback', 'The declared name of the zero value'], 0, 'The caller sees an ordinary valid result instead of the failure.'),
    tf('A handler raises SettingsError("bad timeout") from the caught ValueError.', 'The new error can preserve the original failure in __cause__.', true, 'Explicit exception chaining attaches the cause while allowing the higher layer to explain its own operation.'),
    q('A strict Pydantic validation call raises ValidationError for input data. A later line raises NameError. The boundary only intends to recover from invalid input.', 'What is the appropriate scope of its input-error handler?', ['Catch ValidationError around validation, allowing the unrelated NameError to remain visible', 'Catch every exception and describe it as a bad submitted record', 'Replace both failures with a valid record from a previous request'], 0, 'A narrow input-failure path avoids blaming the submitted data for an implementation defect.'),
    tf('A configuration parser converts "0" successfully, then rejects it because its positive-limit rule excludes zero.', 'The resulting range failure must invent a ValueError conversion cause.', false, 'The conversion succeeded. A domain failure should describe its real cause rather than inventing a failed conversion.'),
    tf('A function closes its open resource in finally and re-raises the original processing error.', 'Cleanup and propagating the failure can both occur.', true, 'Releasing the resource does not require swallowing the error.'),
  ],
  practice: [
    challenge('Report Rejected Count Fields without Inventing Values', [
      'Write parse_counts(texts). Require a list of text fields, raising TypeError for a non-list argument or a non-string item. For each text field, use int() and require the parsed count to be nonnegative. Catch ValueError for those expected content failures, append the original zero-based position to rejected, and continue.',
      'Return {"values": accepted_integer_values, "rejected": rejected_positions}, preserving input order and leaving texts unchanged. Do not catch unrelated exception categories. Print the sum of accepted values and the report for ["6","bad"," 4 ","-2"]. An empty list returns two empty lists.',
    ], py(['def parse_counts(texts):', '    pass', '', "result = parse_counts(['6', 'bad', ' 4 ', '-2'])", "print(sum(result['values']))", 'print(result)']), parseCountsSolution,
    "10\n{'values': [6, 4], 'rejected': [1, 3]}", [
      'Keep the item position with the original field. Rejected positions are not positions in the shorter accepted list.',
      'Perform the non-string check outside the ValueError recovery path. Use else to append a successful parsed count.',
    ], [
      ['Changed fields and positions', 'assert parse_counts(["bad","0","12","-1","8"]) == {"values":[0,12,8],"rejected":[0,3]}'],
      ['Empty and all-rejected batches', 'assert parse_counts([]) == {"values":[],"rejected":[]}\nassert parse_counts(["x","-3"]) == {"values":[],"rejected":[0,1]}'],
      ['Wrong representations are not hidden', 'for values in ((), [None], [True], ["4", 2]):\n    try: parse_counts(values)\n    except TypeError: pass\n    else: raise AssertionError("A non-text caller error was hidden")'],
      ['Original fields are preserved', 'values = [" 2 ","unknown","5"]\nassert parse_counts(values) == {"values":[2,5],"rejected":[1]}\nassert values == [" 2 ","unknown","5"]'],
    ]),
    challenge('Preserve the Cause of an Invalid Limit', [
      'Define LimitError(Exception), then write parse_limit(value, maximum). value must be text and maximum must be a built-in int excluding bool; otherwise raise TypeError. A maximum below 1 raises ValueError. Convert value with int(). If conversion raises ValueError, raise LimitError("limit must be a whole number") from that error.',
      'A successfully parsed value must lie from 1 through maximum, inclusive. Otherwise raise LimitError("limit outside allowed range") without inventing a conversion cause. Return a valid integer. Print the message and cause type for value "many" with maximum 40, then print the valid result for "12" with the same maximum.',
    ], py(['class LimitError(Exception):', '    pass', '', 'def parse_limit(value, maximum):', '    pass', '', 'try:', "    parse_limit('many', 40)", 'except LimitError as error:', '    print(str(error))', '    print(type(error.__cause__).__name__)', "print(parse_limit('12', 40))"]), limitSolution,
    'limit must be a whole number\nValueError\n12', [
      'The conversion try block only needs to surround int(value). Use from error when translating its ValueError.',
      'Check the parsed range after conversion. That failure has a different message and no conversion exception to preserve.',
    ], [
      ['Changed valid limits and inclusive boundaries', 'assert parse_limit("1", 7) == 1\nassert parse_limit(" 7 ", 7) == 7\nassert parse_limit("+4", 9) == 4'],
      ['A failed conversion preserves its cause', 'try: parse_limit("later", 20)\nexcept LimitError as error:\n    assert str(error) == "limit must be a whole number"\n    assert isinstance(error.__cause__, ValueError)\nelse: raise AssertionError("The conversion failure was not translated")'],
      ['Range failures do not invent a cause', 'for value in ("0","-1","21"):\n    try: parse_limit(value, 20)\n    except LimitError as error:\n        assert str(error) == "limit outside allowed range"\n        assert error.__cause__ is None\n    else: raise AssertionError("An out-of-range limit was accepted")'],
      ['Caller contract failures keep their category', 'for value, maximum in ((3, 10), ("3", True), ("3", "10")):\n    try: parse_limit(value, maximum)\n    except TypeError: pass\n    else: raise AssertionError("The representation failure was hidden")\ntry: parse_limit("1", 0)\nexcept ValueError: pass\nelse: raise AssertionError("A nonpositive maximum was accepted")'],
    ]),
  ],
  build: build('Keep Parsed Counts beside Their Rejections',
    'Botie imports count fields as text. The declared local parser accepts small signed decimal strings and keeps an outcome for every original position.',
    'Parse the text fields, reject negative parsed counts, then collect successful values on one branch and rejected positions on another. Return {"values":[...],"rejected":[...]}. Keep the original order in both lists. Zero is an allowed count.',
    { fields: 'Incoming text count fields' },
    [sample('All fields parse', { fields: ['8', '3', '5'] }, parseReport([8, 3, 5])), sample('A middle field needs correction', { fields: ['8', 'unknown', '5'] }, parseReport([8, 5], [1])), sample('More than one rejected position', { fields: ['bad', ' 2 ', 'later', '4'] }, parseReport([2, 4], [0, 2])), sample('A parsed negative count is rejected', { fields: ['4', '-1', '7'] }, parseReport([4, 7], [1]))],
    op('pyValidationParseReport', op('pyValidationSuccessfulValues', op('pyValidationNonnegativeOutcomes', op('pyValidationParseIntegers', s('fields')))), op('pyValidationFailurePositions', op('pyValidationNonnegativeOutcomes', op('pyValidationParseIntegers', s('fields'))))),
    'Both branches come from the same checked outcomes. Conversion failures and negative counts retain their original positions.',
    'These are real local decimal-parsing outcomes, not Python exceptions. The workshop grammar is deliberately narrower than int(), uses safe-sized JS numbers, and does not model exception inheritance or tracebacks.'),
  journey: journey('One text field cannot be read as a count, but the importer has an explicit policy for reporting that field and retaining valid ones.',
    'Build the Import Report', 'Inspect the parse outcomes, apply the nonnegative-count rule, then wire separate successful-value and rejected-position branches.', 'A bad field remains visible as a rejected position instead of becoming a fabricated zero.',
    diagnose('The First Field Is Rejected', 'A later batch starts with invalid text. The report marks the first accepted value as rejected instead. What correspondence was lost?',
      ['Keep failure positions from the original parse outcomes', 'Accepted values form a shorter list. Its positions do not identify the original input fields.'],
      ['Count only the accepted values and reuse those positions', 'That reports locations in the wrong collection.'],
      'Inspect the original position retained beside each parse outcome.'),
    [connection('python-fail-fast', 'Choose a failure policy deliberately', 'This report allows declared partial acceptance; an all-or-nothing save would make a different decision.'), connection('python-pydantic-constraints', 'Separate input failures from defects', 'Recovery handles a named failure category, not every possible failure.')],
    'Why would returning zero for an invalid count make the report less useful?', 'Preserve evidence of a failure instead of disguising it as a valid result.',
    { path: [0], title: 'Inspect the Accepted Branch', challenge: 'Return the successful values from the parse outcomes, preserving input order.', why: 'Then add the rejected-position branch without changing what the successful branch means.' },
    ['The parser returns outcomes with their original positions. Reject negative parsed counts before collecting either branch.', 'Collect values and rejected positions from those same checked outcomes before combining the final report.']),
  fresh: fresh('The Invalid Fields Move', 'A fresh import has invalid fields at different positions and a zero that is valid decimal text. Return values and original rejected positions.', { fields: ['later', '0', '9', 'missing'] }, parseReport([0, 9], [0, 3]), 'A fixed rejected-position list or an invented zero for an invalid field will not describe this import.'),
});

const aliasExample = py([
  "original = {'tags': ['raw'], 'settings': {'reviewed': False}}",
  'alias = original',
  "alias['tags'].append('checked')",
  "print(original['tags'])",
  '',
  'shallow = original.copy()',
  "shallow['settings']['reviewed'] = True",
  "print(original['settings']['reviewed'])",
]);
const deepCopyExample = py([
  'from copy import deepcopy',
  '',
  "original = {'tags': ['raw'], 'settings': {'reviewed': False}}",
  'edited = deepcopy(original)',
  "edited['tags'].append('checked')",
  "edited['settings']['reviewed'] = True",
  'print(original)',
  'print(edited)',
]);
const sharedDefaultExample = py([
  'def keep_note(note, notes=[]):',
  '    notes.append(note)',
  '    return notes',
  '',
  "first = keep_note('A')",
  'print(first)',
  "second = keep_note('B')",
  'print(second)',
  'print(first)',
]);
const addTagSolution = py([
  'from copy import deepcopy',
  '',
  'def with_tag(record, tag):',
  '    if not isinstance(record, dict) or not isinstance(tag, str):',
  "        raise TypeError('Use a record and a text tag')",
  "    if not isinstance(record.get('tags'), list) or not all(isinstance(value, str) for value in record['tags']):",
  "        raise ValueError('The record needs a list of text tags')",
  '    cleaned = tag.strip()',
  '    if not cleaned:',
  "        raise ValueError('The tag cannot be empty')",
  '    result = deepcopy(record)',
  "    result['tags'].append(cleaned)",
  '    return result',
  '',
  "original = {'tags': ['raw', 'daily'], 'meta': {'owner': 'Ari'}}",
  "edited = with_tag(original, ' review ')",
  "print(len(edited['tags']))",
  'print(original)',
  'print(edited)',
]);
const noticeSolution = py([
  'def collect_notice(text, notices=None):',
  '    if not isinstance(text, str):',
  "        raise TypeError('The notice must be text')",
  '    cleaned = text.strip()',
  '    if not cleaned:',
  "        raise ValueError('The notice cannot be empty')",
  '    if notices is None:',
  '        notices = []',
  '    if not isinstance(notices, list) or not all(isinstance(value, str) for value in notices):',
  "        raise TypeError('Notices must be a list of text')",
  '    return [*notices, cleaned]',
  '',
  "first = collect_notice('first')",
  "second = collect_notice('second')",
  "third = collect_notice(' third ', first)",
  'print(len(third))',
  'print(first)',
  'print(second)',
  'print(third)',
]);
const copyResult = (original, tag) => ({ original, edited: { ...original, tags: [...original.tags, tag] } });
const copyRecipe = () => op('pyValidationCopiesReport', s('record'),
  op('pyValidationPutField', s('record'), s('tagKey'), op('pyValidationAppend', op('pyValidationGetField', s('record'), s('tagKey')), s('newTag'))));

export const pythonMutation = lesson({
  id: 'python-mutation', title: 'Mutation and Copies', section, topic,
  blurb: 'Two names can refer to the same mutable object. Make ownership and copying explicit so an edit does not change another caller’s data or leak into a later function call.',
  openingTitle: 'Why Did Editing the Draft Change the Original?',
  opening: [
    'A record has a list of tags and some nested settings. We give it another variable name so we can edit a draft. After adding a tag to the draft, the original displays it too.',
    'The assignment did not create a separate record. Both names referred to the same object. We need to understand that relationship before choosing when to mutate a value, when to copy it, and how far a copy needs to go.',
  ],
  prerequisites: [before('Dataclasses and record ownership', 'python-dataclasses')],
  appliedIn: [before('Context Managers and Resource Cleanup', 'python-context-managers')],
  outputLabel: 'The unchanged source record beside its edited copy',
  checkpointTitle: 'Questions on Parts 1 and 2',
  history: history('Shared State and Default Factories', [
    source('Python names and objects', 'https://docs.python.org/3.14/tutorial/classes.html#a-word-about-names-and-objects'),
    source('Python copying operations', 'https://docs.python.org/3.14/library/copy.html'),
    source('PEP 557: Data Classes', 'https://peps.python.org/pep-0557/'),
  ],
  'Python’s object model lets several names refer to one object. Sharing can be useful: passing a list to a function does not require copying the entire list. The same behavior makes an unexpected mutation visible to every other name that refers to it.',
  'Record helpers need to account for that sharing too. PEP 557, proposed in 2017 for the dataclass feature, discusses the problem of mutable defaults and provides default_factory for creating values per instance. The underlying issue is ownership: a collection intended for one record must not accidentally become state shared by unrelated records.'),
  diagram: table('Choose How Much Must Be Independent', 'The original record contains a nested list and a nested settings dictionary.', ['Operation', 'New outer dictionary?', 'Nested objects independent?'], [
    ['draft = original', 'No', 'No'],
    ['draft = original.copy()', 'Yes', 'No; existing nested values are still shared'],
    ['draft = deepcopy(original)', 'Yes', 'The ordinary nested lists and dictionaries in this example are copied'],
  ], 'Deep copying is an explicit policy, not a requirement for every function. Some resources and custom objects need other ownership rules.'),
  parts: [
    p('Names Refer to Objects',
      'A variable name is a way to refer to an object. Assigning alias = original gives another name to the same object; it does not ask Python to reconstruct that object. With a mutable dictionary or list, changes through either name can be visible through both.\n\nMutation changes an existing object. Rebinding a name makes that name refer to a different object. Those operations can look similar on a short line, but their consequences for other names differ. For example, list.append changes the existing list, while assigning a new list to one local name does not redirect another name automatically.\n\nThe is operator asks whether two references identify the same object. The == operator asks whether their values compare equal. Equal dictionaries need not be the same dictionary.',
      null,
      'Before editing shared data, ask which other names or callers may still depend on the object.'),
    p('A Shallow Copy Keeps References to Nested Values',
      'dict.copy and list.copy create a new outer container. They do not recursively copy every object inside it. If a record’s settings field refers to a dictionary, both outer records can still refer to that same settings dictionary after a shallow copy.\n\nReplacing a top-level field in the copy can leave the original outer dictionary unchanged. Mutating the shared nested value is different. That distinction is why a copy can seem to work for one edit and fail for another.\n\nThe program first creates an alias, then a shallow copy. It shows both kinds of sharing directly.',
      null,
      'The new outer dictionary does not imply a new object at every nested level.', [
        example('Trace an Alias and a Shallow Copy', 'The tag append uses an alias. The settings edit uses a shallow outer copy.', aliasExample,
          "['raw', 'checked']\nTrue", 'Both observations come from mutations visible through a shared object.'),
      ]),
    p('Copy the Data the New Owner Must Control',
      'For a small nested record made from ordinary dictionaries and lists, deepcopy can construct independent nested values. The edited draft can then acquire its own tag and settings without changing the source record.\n\nThat does more work than a shallow copy and may copy data the new owner does not need. Sometimes constructing a new record from selected fields is clearer. Sometimes an immutable representation is suitable. A large array, an open file, or an external connection needs an explicit policy rather than an automatic instruction to deep-copy everything.\n\nThe copy module supports custom behavior, and a deep copy is not a promise to duplicate every possible external resource. This lesson’s independent-copy guarantee applies to the ordinary nested data in its examples and exercises.',
      null,
      'Choose independence based on the intended edits, not on the word copy alone.', [
        example('Give the Draft Independent Nested Data', 'This example starts from a fresh record and changes both nested fields in the copy.', deepCopyExample,
          "{'tags': ['raw'], 'settings': {'reviewed': False}}\n{'tags': ['raw', 'checked'], 'settings': {'reviewed': True}}",
          'The source still contains its original tags and settings.'),
      ]),
    p('Ordinary Function Defaults Are Evaluated Once',
      'A function definition is executed when Python reaches def. Its default argument values are evaluated then, not each time the function is called. If a default is a list, later omitted-argument calls can reuse that same list.\n\nThe example below intentionally keeps a mutable default. Its second call sees the first note. The earlier first result also refers to that same list, so it changes as more notes are appended.\n\nWhen each omitted argument should begin with independent state, use a sentinel such as None and create the collection inside the call. When a caller supplies a collection, also decide whether the function may mutate it or must return a new one. Fixing the default alone does not settle that ownership question.',
      null,
      'The printed first result changes because it still refers to the shared default list.', [
        example('Watch the Earlier Result Change', 'This program demonstrates the bug rather than presenting a recommended default.', sharedDefaultExample,
          "['A']\n['A', 'B']\n['A', 'B']", 'The first and second results refer to the same accumulating list.'),
      ]),
    p('Use the Rules of the Actual Container or Library',
      'A dataclass field can use field(default_factory=list) to create a list for each instance. Pydantic uses its own field rules: it copies certain non-hashable defaults and also supports default_factory. Neither behavior changes how an ordinary function default works.\n\nNumPy arrays add another distinction. Some array operations return a view sharing underlying storage, while others copy. Do not infer array ownership from what a list slice or dict.copy did. The NumPy lessons explain those array-specific cases.\n\nA type hint such as list[str] describes contents; it does not make the list immutable. A frozen record also does not automatically freeze every nested mutable object. Ownership and mutation remain part of the interface.',
      null,
      'Use the documented behavior of the object you have, and test the particular sharing that matters.'),
    p('Make Mutation Part of the Function Contract',
      'Some functions are meant to change state. A function called append_batch can explicitly update the destination after validating the incoming batch. That can be a reasonable interface when the caller owns the destination and expects the change. The earlier dataclass lesson’s add_tag helper also has an explicit mutation agreement.\n\nHere we name the new transformation with_tag because it promises a new record while preserving its input. It is not the same helper with a silently changed agreement. Its tests should compare both the returned record and the original. For nested data, change a nested value in the result after the call and confirm that the original remains independent.\n\nAvoid a global collection that silently accumulates results across calls. It makes a function’s behavior depend on earlier work that its arguments do not show. If persistent state is needed, give it a named owner and a clear lifetime.',
      null,
      'The important distinction is whether the actual change matches what the caller was promised.'),
    p('Test More than Equal Printed Values',
      'Two records can print equal values while still sharing mutable children. A useful independence test edits the returned child and checks the original afterward. That exercise reveals a shallow copy even when the original output looked correct.\n\nCall defaulted functions more than once. A test that runs only a single call cannot reveal state leaking into the next omitted-argument call. Include the case where a caller supplies its own list, because that has a separate mutation policy.\n\nThe workshop returns original and edited records together to make preservation visible. Its JSON data model does not expose Python object identity. The programming exercises test actual Python mutation and nested copies.',
      null,
      'Inspect the relationship after a change, not only the values before the change.'),
  ],
  questions: [
    q('original = {"tags":["raw"]}; draft = original. The program executes draft["tags"].append("checked").', 'What happened to the object named original?', ['Its shared tag list now also contains "checked"', 'It was deep-copied by assignment', 'It became an immutable record'], 0, 'Both names identify the same outer record and nested tag list.'),
    tf('draft = original.copy(), where original contains a nested settings dictionary.', 'The shallow copy always creates an independent settings dictionary too.', false, 'A shallow copy creates the outer container but retains references to its nested values.'),
    q('Two separately created dictionaries have equal fields and values.', 'Which statement can still be false?', ['The dictionaries are the same object under is', 'Their values compare equal under ==', 'Both can contain the same field names'], 0, 'Equality does not establish object identity. Separate objects can have equal values.'),
    tf('A function uses notices=[] as an ordinary default and appends to it whenever notices is omitted.', 'Different omitted-argument calls can share the same accumulating list.', true, 'The default object was created when the function definition executed.'),
    q('A transformation promises an independent nested record. Its initial printed result looks correct.', 'Which additional check can reveal a shallow copy?', ['Mutate a nested child in the result and inspect the original', 'Print the same unchanged values again', 'Rename the result variable'], 0, 'Testing a later nested edit exposes whether the result still shares a mutable child.'),
    tf('A field is annotated list[str]. No runtime mutation restrictions are present.', 'That annotation makes the list immutable.', false, 'A content-type annotation does not remove the list’s mutation operations.'),
    tf('append_batch explicitly promises to update a caller-owned destination only after complete validation.', 'Mutation can be a valid part of that documented interface.', true, 'The issue is whether the effect matches the contract, not a universal prohibition on mutation.'),
    q('A helper uses None for an omitted list, then appends directly to any caller-supplied list. Its contract promises to leave supplied lists unchanged.', 'What remains wrong after fixing the mutable default?', ['The helper still violates its explicit-input mutation policy', 'Using None forces all later lists to be shared', 'Every default factory is invalid'], 0, 'Fresh omitted defaults and preservation of explicitly supplied objects are separate requirements.'),
  ],
  practice: [
    challenge('Add a Tag without Changing the Source Record', [
      'Write with_tag(record, tag). Require a dictionary record and text tag, otherwise raise TypeError. record must contain tags as a list of strings, otherwise raise ValueError. Strip outer whitespace from the new tag and raise ValueError if it becomes empty.',
      'Return a deep-independent copy of the ordinary nested data, with the cleaned tag appended. Preserve every other field and leave record unchanged. The fixtures contain ordinary nested dictionaries, lists, strings, numbers and booleans. Print the new tag count, original, and edited record for the supplied example.',
    ], py(['def with_tag(record, tag):', '    pass', '', "original = {'tags': ['raw', 'daily'], 'meta': {'owner': 'Ari'}}", "edited = with_tag(original, ' review ')", "print(len(edited['tags']))", 'print(original)', 'print(edited)']), addTagSolution,
    "3\n{'tags': ['raw', 'daily'], 'meta': {'owner': 'Ari'}}\n{'tags': ['raw', 'daily', 'review'], 'meta': {'owner': 'Ari'}}", [
      'Validate the declared record shape before editing. The new record must preserve fields other than tags.',
      'A shallow dictionary copy still shares nested values. Test a later edit to the returned meta dictionary.',
    ], [
      ['Changed tags and retained fields', 'original = {"tags":[],"meta":{"owner":"Bo"},"count":4}\nedited = with_tag(original, " new ")\nassert edited == {"tags":["new"],"meta":{"owner":"Bo"},"count":4}\nassert original["tags"] == []'],
      ['Nested data is independent after the return', 'original = {"tags":["a"],"meta":{"names":["Ari"]}}\nedited = with_tag(original, "b")\nedited["meta"]["names"].append("Bo")\nedited["tags"].append("c")\nassert original == {"tags":["a"],"meta":{"names":["Ari"]}}'],
      ['Invalid shapes and empty tags fail', 'for record, tag in (({}, "x"), ({"tags":"raw"}, "x"), ({"tags":[1]}, "x"), ({"tags":[]}, " ")):\n    try: with_tag(record, tag)\n    except ValueError: pass\n    else: raise AssertionError("An invalid shape or empty tag was accepted")'],
      ['Wrong argument types retain their category', 'for record, tag in (([], "x"), ({"tags":[]}, None)):\n    try: with_tag(record, tag)\n    except TypeError: pass\n    else: raise AssertionError("An unsuitable argument type was accepted")'],
    ]),
    challenge('Keep Notice Calls Independent', [
      'Write collect_notice(text, notices=None). Require nonempty text after stripping outer whitespace. Wrong text types raise TypeError; an empty cleaned notice raises ValueError. notices may be None or a list of strings, otherwise raise TypeError.',
      'Return a new list containing any supplied notices followed by the cleaned new notice. Never mutate a supplied list, and never share an accumulating omitted default between calls. Print the length and the three lists produced by the supplied calls.',
    ], py(['def collect_notice(text, notices=None):', '    pass', '', "first = collect_notice('first')", "second = collect_notice('second')", "third = collect_notice(' third ', first)", 'print(len(third))', 'print(first)', 'print(second)', 'print(third)']), noticeSolution,
    "2\n['first']\n['second']\n['first', 'third']", [
      'The None default describes omission. Create or copy the list inside the call.',
      'Returning a new list also protects an explicitly supplied list. Check that first remains unchanged after creating third.',
    ], [
      ['Repeated omitted calls do not accumulate', 'a = collect_notice("A")\nb = collect_notice("B")\nassert a == ["A"] and b == ["B"]\nassert a is not b'],
      ['Supplied lists remain independent', 'earlier = ["old"]\nresult = collect_notice(" new ", earlier)\nassert result == ["old","new"] and earlier == ["old"]\nresult.append("later")\nassert earlier == ["old"]'],
      ['Invalid representations fail', 'for text, notices in ((None, None), ("new", ()), ("new", [1])):\n    try: collect_notice(text, notices)\n    except TypeError: pass\n    else: raise AssertionError("An unsuitable representation was accepted")'],
      ['Empty cleaned notices are rejected', 'try: collect_notice("   ")\nexcept ValueError: pass\nelse: raise AssertionError("An empty notice was accepted")'],
    ]),
  ],
  build: build('Edit the Draft while Preserving Its Source',
    'Botie needs a new tagged draft while keeping the original record available for comparison.',
    'Read the tag list, append into a new list, and replace tags in a new record. Return {"original":...,"edited":...}. Preserve the original and every other nested field.',
    { record: 'Original record', tagKey: 'Tag-list field name', newTag: 'Tag to add' },
    [
      sample('Add one draft tag', { record: { tags: ['raw'], settings: { reviewed: false } }, tagKey: 'tags', newTag: 'checked' }, copyResult({ tags: ['raw'], settings: { reviewed: false } }, 'checked')),
      sample('The next draft has different tags', { record: { tags: ['daily', 'north'], settings: { reviewed: true } }, tagKey: 'tags', newTag: 'archived' }, copyResult({ tags: ['daily', 'north'], settings: { reviewed: true } }, 'archived')),
      sample('Start from no tags', { record: { tags: [], settings: { owner: 'Ari' } }, tagKey: 'tags', newTag: 'new' }, copyResult({ tags: [], settings: { owner: 'Ari' } }, 'new')),
    ], copyRecipe(),
    'The edited tag list is constructed from the current source. Both records remain visible in the final result.',
    'The components implement explicit copies of JSON-compatible data. They do not expose Python object identity, aliasing or arbitrary deepcopy behavior; the Python exercises test those actual semantics.'),
  journey: journey('The draft needs a new tag without changing the record another caller still owns.',
    'Construct the New Draft', 'Follow the source record into a new tag list and a new outer record, retaining the original branch.', 'The comparison shows one added tag in the draft and no change to the original.',
    diagnose('Another Record Arrives', 'The next record has different existing tags. The construction returns only the new tag. What did it lose?',
      ['Read the current record’s tags before appending', 'A copied earlier list or a new empty list discards the current source’s existing data.'],
      ['Always start from the first example’s tags', 'That substitutes a previous record for the current caller’s record.'],
      'Inspect the list entering Append into a new list.'),
    [connection('python-dataclasses', 'Give records named fields', 'A field can contain mutable data whose ownership still needs a policy.'), connection('python-fail-fast', 'State the effect contract', 'This transformation promises preservation instead of a caller-visible mutation.')],
    'What extra test would establish nested independence in actual Python?', 'Test ownership through a later edit, not only an initial printed value.',
    { path: [1, 2], title: 'Inspect the New Tag List', challenge: 'Return the source tags followed by the current new tag.', why: 'Then use that list to replace only the intended field in the new draft.' },
    ['Read the tags field from the current source before appending.', 'Send the unchanged source and the edited copy to the comparison output on separate branches.']),
  fresh: fresh('A Different Nested Record', 'The source now has three existing tags and nested reviewer details. Add the current new tag while preserving those details in both displayed records.', { record: { tags: ['raw', 'north', 'night'], settings: { reviewers: ['Ari', 'Bo'] } }, tagKey: 'tags', newTag: 'ready' }, copyResult({ tags: ['raw', 'north', 'night'], settings: { reviewers: ['Ari', 'Bo'] } }, 'ready'), 'The draft must derive from the current record, with its existing tags and nested settings intact.'),
});

const withExample = py([
  'from io import StringIO',
  '',
  "stream = StringIO('2\\n5\\n')",
  'with stream as opened:',
  '    values = [int(line) for line in opened]',
  '    print(values)',
  '    print(opened.closed)',
  'print(stream.closed)',
]);
const cleanupFailureExample = py([
  'from io import StringIO',
  '',
  "stream = StringIO('2\\nbad\\n')",
  'try:',
  '    with stream:',
  '        values = [int(line) for line in stream]',
  'except ValueError:',
  "    print('conversion failed')",
  'print(stream.closed)',
]);
const stageManagerExample = py([
  'from contextlib import contextmanager',
  '',
  '@contextmanager',
  'def tracked_stage(events):',
  "    events.append('enter')",
  '    try:',
  '        yield',
  '    finally:',
  "        events.append('exit')",
  '',
  'events = []',
  'with tracked_stage(events):',
  "    events.append('work')",
  'print(events)',
  'try:',
  '    with tracked_stage(events):',
  "        events.append('failing work')",
  "        raise ValueError('Cannot finish this stage')",
  'except ValueError:',
  '    pass',
  'print(events)',
]);
const readTotalSolution = py([
  'from io import StringIO',
  '',
  'def read_total(stream):',
  '    with stream:',
  '        total = 0',
  '        for line in stream:',
  '            if line.strip():',
  '                total += int(line)',
  '        return total',
  '',
  "stream = StringIO('4\\n\\n7\\n3\\n')",
  'print(read_total(stream))',
  'print(stream.closed)',
]);
const bufferSolution = py([
  'from contextlib import contextmanager',
  'from io import StringIO',
  '',
  '@contextmanager',
  'def managed_buffer(text, events):',
  '    if not isinstance(text, str) or not isinstance(events, list):',
  "        raise TypeError('Use text and an event list')",
  '    stream = StringIO(text)',
  "    events.append('open')",
  '    try:',
  '        yield stream',
  '    finally:',
  '        stream.close()',
  "        events.append('close')",
  '',
  'events = []',
  "with managed_buffer('4\\n7\\n', events) as stream:",
  '    print(sum(int(line) for line in stream))',
  'print(stream.closed)',
  'print(events)',
]);
const lifetime = (values, error = null) => ({ events: ['open', 'read', 'close'], closed: true, values, error });
const resourceRecipe = () => op('pyValidationResourceReport',
  op('pyValidationCloseResource',
    op('pyValidationReadResource', op('pyValidationOpenResource', s('name')), s('fields'))));

export const pythonContextManagers = lesson({
  id: 'python-context-managers', title: 'Context Managers and Resource Cleanup', section, topic,
  blurb: 'A file or connection needs a defined lifetime even when processing fails. Use with and context managers to keep acquisition and cleanup together without hiding the original error.',
  openingTitle: 'The Read Failed. Is the File Still Open?',
  opening: [
    'A program opens a file of readings, starts converting its lines, and encounters invalid text. Control leaves the calculation before reaching a close call written at the bottom. The read failed, and the resource can remain open.',
    'The cleanup requirement exists whether the calculation succeeds or raises an exception. We will make that lifetime visible with an in-memory text buffer, then use the same structure that files and many connection libraries support.',
  ],
  prerequisites: [before('Python Exceptions', 'python-exceptions'), before('Mutation and Copies', 'python-mutation')],
  appliedIn: [],
  outputLabel: 'The read outcome and the resource’s closed state',
  checkpointTitle: 'Questions on Parts 1 and 2',
  history: history('The with Statement and Resource Lifetimes', [
    source('PEP 343: The with Statement', 'https://peps.python.org/pep-0343/'),
    source('contextlib and generator-based context managers', 'https://docs.python.org/3.14/library/contextlib.html'),
    source('Python file and text I/O', 'https://docs.python.org/3.14/library/io.html'),
  ],
  'Opening and closing a resource creates a paired obligation. Repeating the same cleanup structure throughout a program makes it easy to omit a failure path. Python’s try/finally can express that obligation, but every caller would still need to write the pattern correctly.',
  'PEP 343, created in 2005 for Python 2.5, introduced the with statement to factor out common try/finally patterns. A context manager supplies the entry and exit behavior, while the body still contains the work being performed. The resource-lifetime rules become visible at the place where the resource is used.'),
  diagram: table('A Read Outcome Still Needs Cleanup', 'The resource is an in-memory teaching buffer, so the lifetime can be inspected without reading a real file.', ['Path', 'Event order', 'Final resource state'], [
    ['All fields parse', 'Open, read, close', 'Closed; parsed values remain available'],
    ['A field is invalid', 'Open, attempted read, close', 'Closed; the failure remains visible'],
    ['Cleanup is omitted', 'Open, attempted read', 'Still open under this local model'],
  ], 'The Python examples execute real context-manager behavior. The workshop below makes the corresponding lifetime decisions visible as records.'),
  parts: [
    p('Give a Resource a Lifetime',
      'A resource is something a program acquires and must later release or finish using. An open file, a database connection, and a lock have different operations, but each has a lifetime that code needs to manage.\n\nThe object that represents a resource may remain bound to a variable after it has been closed. Keeping the name does not reopen it or make later reads valid. That is why lifetime is a separate question from whether a variable exists.\n\nStringIO gives us a file-like text buffer in memory. Construct it from text, iterate over its lines, and inspect its closed attribute. It lets us practice acquisition and cleanup without depending on a local path or changing files on the reader’s computer.',
      null,
      'The important observation is whether the resource was released, including on the path where the work could not finish.'),
    p('Use with to Bound the Work',
      'The expression after with produces a context manager. Python calls its entry behavior, runs the indented body, and calls its exit behavior as control leaves the body. For this text buffer, the exit behavior closes it.\n\nThe optional as name receives whatever the entry behavior returns. With StringIO, that is the stream itself. Other context managers can return a different value or no useful value. Do not assume the variable after as is always the manager object.\n\nThe print inside this program shows that the stream is open while the body uses it. The print after the block shows that its lifetime has ended even though the variable name still exists.',
      null,
      'The indentation marks the region allowed to use the open stream.', [
        example('Inspect the Buffer Inside and After with', 'The line conversions use a real in-memory Python stream.', withExample,
          '[2, 5]\nFalse\nTrue', 'The values were obtained while the buffer was open. After the block, the same stream object is closed.'),
      ]),
    p('Let Cleanup Run on Failure',
      'The body can raise an exception. When it does, the manager still gets its exit opportunity. A standard file-like manager closes the file and allows the processing exception to continue outward.\n\nThe caller can then decide whether to handle that error. In the example, the conversion of bad raises ValueError. The outer handler reports the failure, and the closed attribute confirms cleanup occurred.\n\nThe with statement itself does not guarantee success or require every manager to re-raise every error. A context manager can deliberately suppress an exception. We are using managers whose intended policy is cleanup without suppressing a processing failure.',
      null,
      'Closing the stream and reporting the failed conversion are compatible outcomes.', [
        example('A Bad Field Does Not Skip Closing', 'The failing conversion is inside with, and the expected recovery is outside it.', cleanupFailureExample,
          'conversion failed\nTrue', 'The read did not succeed, but the resource was still released.'),
      ]),
    p('Understand Entry and Exit before Writing a Manager',
      'The context-manager protocol consists of entry and exit methods named __enter__ and __exit__. A class can implement those methods directly. That can be useful when a resource object already owns other state and behavior.\n\nFor a small acquisition/cleanup pair, contextlib.contextmanager provides a generator-based interface. The @contextmanager decorator adapts the function into a manager. Code before yield handles entry. The single yielded value is made available to as. When the body finishes or fails, execution resumes around that yield.\n\nPut required cleanup in finally around the yield. The generator must yield exactly once for a normal entry. If it catches a body exception only to log or inspect it, it must re-raise rather than accidentally tell the with statement that the failure was handled.',
      null,
      'A recorded stage makes that entry/body/exit order visible before we manage a real buffer.', [
        example('Follow a Generator Manager through Both Paths', 'This manager records a lifetime; it does not open an external resource.', stageManagerExample,
          "['enter', 'work', 'exit']\n['enter', 'work', 'exit', 'enter', 'failing work', 'exit']",
          'The second body fails, and its exit event is still recorded. The error is caught by the outer caller.'),
      ]),
    p('Say Who Owns Closing',
      'An API accepting an already open stream must say whether it borrows the stream or takes responsibility for closing it. Both policies can be useful. A borrower leaves the stream open for its caller; an owner ends its lifetime when the operation finishes.\n\nThe first exercise explicitly transfers closing responsibility to read_total. Its tests therefore inspect the supplied stream after success and failure. A library function with a different ownership contract would need different behavior and different tests.\n\nAvoid returning a stream from inside a with block as though it were still ready to read. The block exits before the caller gets the result, so a manager that closes that stream will already have closed it. Return the data you meant to read, or design a longer-lived owner deliberately.',
      null,
      'A clear lifetime policy prevents one caller from closing a resource that another still expects to use.'),
    p('Do Not Infer Other Guarantees from with',
      'The with syntax does not by itself make a file update atomic, make a database transaction commit, or grant permission to an external service. The actual manager defines its entry and exit actions. A file manager, transaction manager and lock manager therefore have different contracts.\n\nA cleanup routine can also fail. A new cleanup exception can complicate the original failure, which is one reason exception chaining matters. Keep cleanup small and use the resource library’s documented manager when it already provides one.\n\nIn a browser, our exercises use StringIO rather than a local file. The same control-flow ideas apply, but no real filesystem permissions, durability or database transaction behavior are being tested.',
      null,
      'The syntax makes a lifetime boundary visible. Read the manager’s contract to know what happens at that boundary.'),
    p('Test the Body That Does Not Finish',
      'A success-only test can miss the exact cleanup bug this lesson began with. Raise an exception deliberately inside the managed body, catch it outside, and inspect the resource and event log. The original exception must still reach that outer handler.\n\nAlso check an empty buffer and repeated uses. A new managed_buffer call should produce a fresh stream rather than reuse one that was already closed. Validate arguments before recording an acquisition event if the interface promises that invalid arguments do not start a resource lifetime.\n\nThe workshop’s open, read and close components describe this lifecycle as inspectable data. You must connect cleanup after both a successful and a failed read outcome. The Python exercises then verify the actual with and contextmanager behavior.',
      null,
      'The failure path is part of the interface, not a secondary case to leave unexamined.'),
  ],
  questions: [
    q('A StringIO buffer is opened, used inside with, and the with block completes normally. A variable still refers to the buffer afterward.', 'What does the remaining variable establish?', ['The object can still be referenced, but the buffer may already be closed', 'The buffer must remain open because the variable exists', 'The text was automatically saved to a real file'], 0, 'A variable binding and a resource lifetime are separate facts. StringIO closes when its manager exits.'),
    tf('A StringIO buffer is read inside with, and the block completes normally.', 'The buffer can be open during the body and closed after the block.', true, 'The part’s example prints False for closed inside the body and True after the manager exits. The variable can still refer to the closed object.'),
    q('A function decorated with contextmanager acquires a resource, then yields it inside try/finally.', 'Where should mandatory release code go?', ['In finally around the yield', 'Only after a successful print in the body', 'In an unrelated later caller that does not know the resource exists'], 0, 'finally makes the release part of leaving the managed operation, including the exceptional path.'),
    tf('A contextmanager generator catches an exception from the body and then finishes without raising it again.', 'That always preserves the original error for the outer caller.', false, 'Finishing after catching the exception can signal that it was handled. Re-raise if the policy is inspection or logging without suppression.'),
    q('read_total(stream) explicitly promises to own and close the supplied stream, even when a line is invalid.', 'Which failure test matches its contract?', ['Supply an invalid line, expect ValueError, and confirm stream.closed is True', 'Only check the returned total from a valid file', 'Assume any exception automatically closes any object'], 0, 'The test must observe the cleanup state on the failing path.'),
    tf('A file is opened with with, but no atomic-replacement or transaction mechanism is present.', 'The with syntax alone makes every multi-step file update atomic.', false, 'The manager’s documented actions determine its guarantees. Closing a file does not supply arbitrary transaction behavior.'),
    tf('A borrowing function promises not to close a caller-owned stream.', 'It can reasonably have a different lifetime policy from the owning read_total exercise.', true, 'Ownership must be declared by the interface. There is no universal rule that every function receiving a stream should close it.'),
  ],
  practice: [
    challenge('Close the Supplied Stream on Every Path', [
      'Write read_total(stream). Its contract takes ownership of a supplied open StringIO stream. Use with so the stream closes after success or a conversion failure. Read its remaining lines, ignore whitespace-only lines, convert the other lines using int(), and return their total. An empty stream returns zero.',
      'Do not catch or replace ValueError from an invalid integer line. The outer caller must see it while the stream is still closed. Print the total and closed flag for StringIO containing "4\\n\\n7\\n3\\n".',
    ], py(['from io import StringIO', '', 'def read_total(stream):', '    pass', '', "stream = StringIO('4\\n\\n7\\n3\\n')", 'print(read_total(stream))', 'print(stream.closed)']), readTotalSolution,
    '14\nTrue', [
      'The with block should own the supplied stream, not a separate buffer that the caller cannot inspect.',
      'Keep line conversion inside the block. Let its ValueError leave the block naturally so cleanup can run.',
    ], [
      ['Changed lines and blank lines', 'from io import StringIO\nstream = StringIO("10\\n -2 \\n\\n5\\n")\nassert read_total(stream) == 13\nassert stream.closed is True'],
      ['A conversion failure still closes the stream', 'stream = StringIO("3\\nbad\\n9\\n")\ntry: read_total(stream)\nexcept ValueError: pass\nelse: raise AssertionError("The invalid line was hidden")\nassert stream.closed is True'],
      ['An empty stream returns zero and closes', 'stream = StringIO("")\nassert read_total(stream) == 0\nassert stream.closed is True'],
      ['Read the remaining stream rather than restarting it', 'stream = StringIO("100\\n2\\n5\\n")\nassert stream.readline() == "100\\n"\nassert read_total(stream) == 7\nassert stream.closed is True'],
    ]),
    challenge('Write a Manager That Preserves a Body Failure', [
      'Write managed_buffer(text, events) using contextlib.contextmanager and StringIO. Require text to be a string and events to be a list, raising TypeError before recording any event otherwise. Create a fresh stream, append "open", and yield that stream exactly once.',
      'In finally, close the stream and append "close". Do not suppress an exception raised by the caller’s with body. The event list is the one intentional caller-visible effect. Print the sum from "4\\n7\\n", then the closed flag and event list after the block.',
    ], py(['from contextlib import contextmanager', 'from io import StringIO', '', '@contextmanager', 'def managed_buffer(text, events):', '    pass', '', 'events = []', "with managed_buffer('4\\n7\\n', events) as stream:", '    print(sum(int(line) for line in stream))', 'print(stream.closed)', 'print(events)']), bufferSolution,
    "11\nTrue\n['open', 'close']", [
      'Validate before opening or appending an event. Put the single yield inside try.',
      'Close and record the close event in finally. A handler that quietly consumes a body exception changes the promised behavior.',
    ], [
      ['Successful changed content gets a fresh stream', 'events = []\nwith managed_buffer("8\\n2\\n", events) as stream:\n    assert sum(int(line) for line in stream) == 10\n    assert stream.closed is False\nassert stream.closed is True and events == ["open","close"]'],
      ['The original body error propagates after cleanup', 'events = []\ntry:\n    with managed_buffer("4", events) as failed:\n        raise RuntimeError("body failed")\nexcept RuntimeError as error: assert str(error) == "body failed"\nelse: raise AssertionError("The body failure was suppressed")\nassert failed.closed is True and events == ["open","close"]'],
      ['Repeated calls do not reuse a closed stream', 'events = []\nwith managed_buffer("a", events) as first: assert first.read() == "a"\nwith managed_buffer("b", events) as second: assert second.read() == "b"\nassert first is not second\nassert first.closed and second.closed\nassert events == ["open","close","open","close"]'],
      ['Invalid arguments do not acquire or log a resource', 'events = []\ntry:\n    with managed_buffer(None, events): pass\nexcept TypeError: pass\nelse: raise AssertionError("Non-text content was accepted")\nassert events == []\ntry:\n    with managed_buffer("text", ()): pass\nexcept TypeError: pass\nelse: raise AssertionError("A non-list event sink was accepted")'],
    ]),
  ],
  build: build('Close after Either Read Outcome',
    'Botie opens a teaching resource and reads its decimal fields. A later field can fail, but the resource must still reach cleanup.',
    'Open the resource, attempt the read, close it, and return events, closed, values and error. A failed read returns values:[] and error:"invalid_reading"; it must still include the close event and closed:true.',
    { name: 'Resource name', fields: 'Text fields to read' },
    [sample('A successful read', { name: 'north.txt', fields: ['2', '5'] }, lifetime([2, 5])), sample('A field cannot be read', { name: 'south.txt', fields: ['2', 'bad', '5'] }, lifetime([], 'invalid_reading')), sample('An empty resource', { name: 'empty.txt', fields: [] }, lifetime([]))],
    resourceRecipe(),
    'The read outcome passes through the same cleanup component on both paths. An error remains visible after the resource is marked closed.',
    'This is an explicit local lifetime record, not a filesystem or a simulation of Python exception unwinding. The decimal grammar and JS numbers are limited; real with/contextmanager behavior is exercised in Python.'),
  journey: journey('A resource must be released even when the data read from it cannot be processed.',
    'Build the Complete Resource Lifetime', 'Inspect a successful read, then keep cleanup connected when the read outcome changes.', 'The failed read still produces open, read and close events while retaining its error.',
    diagnose('The Read Does Not Finish', 'The original construction closes only after successful parsing. A bad field leaves the resource open. What is missing?',
      ['Put cleanup after the read outcome, including its error path', 'The cleanup obligation does not disappear when parsing fails.'],
      ['Replace the bad field with a number so cleanup is never tested', 'That hides the failure path instead of handling the resource lifetime.'],
      'Inspect the state after reading and before the closing operation.'),
    [connection('python-exceptions', 'Preserve a failure while acting on it', 'Cleanup and error propagation are separate responsibilities.'), connection('python-mutation', 'Give state an explicit owner', 'The function contract must identify who owns releasing the resource.')],
    'What should a failure-path test inspect besides the exception?', 'Check the resource’s final state as well as the original failure.',
    { path: [0, 0], title: 'Inspect the Read Outcome', challenge: 'Return the resource state immediately after reading, before cleanup.', why: 'The intermediate state shows that an error still needs to pass through closing.' },
    ['The read needs the open resource state and the current text fields.', 'Connect its outcome to Close after the read outcome, then inspect the resource lifetime.']),
  fresh: fresh('A New Resource Fails Later', 'The next resource has more fields, with a later invalid value. Return the complete closed lifetime while preserving the failed-read outcome.', { name: 'evening.txt', fields: ['4', '7', '9', 'unknown'] }, lifetime([], 'invalid_reading'), 'A successful first read does not establish that cleanup works after a later parsing failure.'),
});

const lessons = [
  pythonFailFast,
  pythonPydanticModels,
  pythonPydanticConstraints,
  pythonExceptions,
  pythonMutation,
  pythonContextManagers,
];

// Each worksheet starts with an executable earlier version. Keep the working
// behavior visible while the new tests expose the requirement it cannot meet.
const definitionsBefore = (program, demo) => {
  const position = program.indexOf(demo);
  if (position < 0) throw Error('The worksheet demonstration could not be located.');
  return program.slice(0, position).trimEnd();
};
const worksheet = (...programs) => programs.join('\n\n');
const continueExercise = (record, index, from, summary, changes) => {
  const exercise = record.practice[index];
  Object.assign(exercise, changes, {
    continuation: { lesson: '/concepts/' + from[0], exercise: from[1], summary },
  });
};
const numericalReadings = py([
  'import math', '',
  'def numerical_readings(values: list[object]) -> list[float]:',
  '    result = []',
  '    for value in values:',
  '        if type(value) not in (int, float):',
  '            continue',
  '        try:',
  '            converted = float(value)',
  '        except OverflowError:',
  '            continue',
  '        if math.isfinite(converted):',
  '            result.append(converted)',
  '    return result',
]);
const requirePositive = definitionsBefore(positiveCheck, '\nfor reading in');
const totalDemo = 'print(validated_total([8, 7, 9]))';
const strictTotal = worksheet(numericalReadings, requirePositive, py([
  'def validated_total(values):',
  '    if not isinstance(values, list):',
  "        raise TypeError('Values must be a list')",
  '    if not values:',
  "        raise ValueError('At least one value is required')",
  '    for value in values:',
  '        require_positive(value)',
  '    return sum(values)',
]));
continueExercise(pythonFailFast, 0, ['python-type-hints', 1],
  'Keep the permissive numerical_readings import helper, then add a strict total that rejects a broken batch instead of silently skipping its values.', {
    task: [
      'The earlier numerical_readings helper deliberately skips unusable input and returns finite floats. Keep that helper and its annotations unchanged. The supplied validated_total currently sums its filtered result, so a batch containing text can appear to succeed after losing an item.',
      ...pythonFailFast.practice[0].task,
      'Replace filtering only in validated_total. This new saving boundary requires positive built-in numbers and rejects the whole batch. The original import helper still allows signed readings and zero; these policies belong to different operations. A positive integer need not fit into a float, so validate it without an unnecessary float conversion.',
    ],
    starter: worksheet(numericalReadings, py([
      'def validated_total(values):',
      '    return sum(numerical_readings(values))', '', totalDemo,
    ])),
    solution: worksheet(strictTotal, totalDemo),
    tests: [...pythonFailFast.practice[0].tests, {
      name: 'The earlier permissive import contract remains available',
      code: 'from typing import get_type_hints\nassert numerical_readings([-3,False,2.25,float("inf"),10**400,0]) == [-3.0,2.25,0.0]\nassert get_type_hints(numerical_readings) == {"values":list[object],"return":list[float]}',
    }],
  });
const appendDemo = py(['saved = [2]', 'print(append_batch(saved, [4, 8]))', 'print(saved)']);
const appendChecks = py([
  '    if not isinstance(destination, list) or not isinstance(incoming, list):',
  "        raise TypeError('Both arguments must be lists')",
  '    if destination is incoming:',
  "        raise ValueError('Use distinct destination and incoming lists')",
]);
const appendCore = worksheet(strictTotal, py([
  'def append_batch(destination, incoming):', appendChecks,
  '    for value in incoming:',
  '        require_positive(value)',
  '    destination.extend(incoming)',
  '    return len(destination)',
]));
continueExercise(pythonFailFast, 1, ['python-fail-fast', 0],
  'Reuse the strict positive-value checker and total, then prevent a late rejected value from leaving a partial append.', {
    task: [
      'The strict checker and total from the previous exercise are supplied. append_batch already calls that checker, but it appends inside the same loop. It works for an entirely valid batch and leaves earlier writes behind if a later item fails.',
      ...pythonFailFast.practice[1].task,
      'Retain require_positive and call it for every incoming item before changing destination. Keep validated_total available, including its separate nonempty-list rule. An empty append remains a valid no-op.',
    ],
    starter: worksheet(strictTotal, py([
      'def append_batch(destination, incoming):', appendChecks,
      '    for value in incoming:',
      '        require_positive(value)',
      '        destination.append(value)',
      '    return len(destination)', '', appendDemo,
    ])),
    solution: worksheet(appendCore, appendDemo),
    tests: [...pythonFailFast.practice[1].tests, {
      name: 'The strict total and its checker retain their earlier contracts',
      code: 'assert validated_total([2,3]) == 5\nassert require_positive(10**400) == 10**400\ntry: validated_total([])\nexcept ValueError: pass\nelse: raise AssertionError("The earlier total contract was removed")',
    }],
  });

const requestDemo = py([
  "result = parse_request({'title': 'Inspection notes', 'note': None, 'copies': 3})",
  "print(result['copies'])", 'print(result)',
]);
const requestCore = definitionsBefore(requestSolution, '\nresult = parse_request');
continueExercise(pythonPydanticModels, 0, ['python-dataclasses', 1],
  'Use the earlier dataclass record pattern for a report request, then replace unchecked construction with a runtime Pydantic contract.', {
    task: [
      'The earlier Report dataclass gave review notes named fields and an explicit mutation policy. The starter adapts that record pattern to a report request. Its parse_request constructs a dataclass and exports it, but annotations alone do not reject a text copy count, and the default note hides a missing required field.',
      ...pythonPydanticModels.practice[0].task,
      'Replace the unchecked request record with the Pydantic model while retaining the parse_request(data) interface. A valid request must keep producing the same dictionary so its caller does not need to change.',
    ],
    starter: py([
      'from dataclasses import asdict, dataclass',
      'from pydantic import BaseModel, ConfigDict, ValidationError', '',
      '@dataclass', 'class ReportRequest:',
      '    title: str', '    note: str | None = None', '    copies: int = 1', '',
      'def parse_request(data):', '    return asdict(ReportRequest(**data))', '', requestDemo,
    ]),
  });
const ticketDemo = py([
  "result = summarize_ticket({'owner': 'Ari', 'priority': 7})",
  "print(result['priority'])", 'print(result)',
]);
continueExercise(pythonPydanticModels, 1, ['python-pydantic-models', 0],
  'Retain the strict report request parser, adapt its schema for tickets, and preserve whether a nullable comment was actually supplied.', {
    task: [
      'Keep the completed ReportRequest and parse_request supplied below. TicketRequest adapts that strict model pattern for a support record. The current summary guesses presence from the final comment value, so it treats an explicit None as if the caller omitted the field.',
      ...pythonPydanticModels.practice[1].task,
      'Repair the presence flag without changing how omitted defaults or supplied text are represented. The earlier report request still requires its note key; the new ticket deliberately gives comment an omission default.',
    ],
    starter: worksheet(requestCore, ticketClass, py([
      'def summarize_ticket(data):',
      '    ticket = TicketRequest.model_validate(data)',
      "    return {'owner': ticket.owner, 'priority': ticket.priority,",
      "            'comment': ticket.comment, 'comment_supplied': ticket.comment is not None}",
      '', ticketDemo,
    ])),
    solution: worksheet(requestCore, ticketSolution),
    tests: [...pythonPydanticModels.practice[1].tests, {
      name: 'The earlier required-note model is not weakened',
      code: 'assert parse_request({"title":"T","note":None})["copies"] == 1\ntry: parse_request({"title":"T"})\nexcept ValidationError: pass\nelse: raise AssertionError("The earlier required note was made optional")',
    }],
  });

const captureDemo = py([
  "result = validate_capture({'name': '  West  ', 'count': 6, 'bounds': {'lower': -2, 'upper': 12}})",
  "print(result['count'])", 'print(result)',
]);
const captureCore = definitionsBefore(captureSolution, '\nresult = validate_capture');
continueExercise(pythonPydanticConstraints, 0, ['python-pydantic-models', 1],
  'Retain strict request validation and extend its schema pattern to nested capture bounds, count limits and name normalization.', {
    task: [
      'The strict request models already establish field representations and omission rules. The starter carries ReportRequest forward and applies the same pattern to CaptureRequest. Its basic fields accept a count of zero or a reversed interval because no value or relationship rules have been added yet.',
      ...pythonPydanticConstraints.practice[0].task,
      'Keep parse_request available. Replace the basic capture schema with the nested Bounds model and its constraints while retaining validate_capture(data) as the caller’s entry point.',
    ],
    starter: worksheet(requestCore, py([
      'from typing import Self',
      'from pydantic import Field, field_validator, model_validator', '',
      'class CaptureRequest(BaseModel):',
      "    model_config = ConfigDict(strict=True, extra='forbid')",
      '    name: str', '    count: int', '    bounds: dict[str, float]',
      '    labels: list[str] = Field(default_factory=list)', '',
      'def validate_capture(data):', '    return CaptureRequest.model_validate(data).model_dump()',
      '', captureDemo,
    ])),
    solution: worksheet(requestCore, captureSolution),
  });
const captureBatchDemo = py([
  "rows = [{'name': 'A', 'count': 4, 'bounds': {'lower': 1, 'upper': 5}}, {'name': 'B', 'count': 0, 'bounds': {'lower': 1, 'upper': 5}}]",
  'result = read_capture_batch(rows)', "print(len(result['accepted']))", "print(result['errors'])",
]);
const captureBatchCore = worksheet(captureCore, py([
  'def read_capture_batch(rows):',
  '    if not isinstance(rows, list):', "        raise TypeError('Rows must be a list')",
  '    accepted = []', '    errors = []',
  '    for position, data in enumerate(rows):', '        try:',
  '            request = validate_capture(data)',
  '        except ValidationError as error:',
  "            fields = sorted({'.'.join(map(str, item['loc'])) or '$' for item in error.errors(include_input=False)})",
  "            errors.append({'row': position, 'fields': fields})",
  '        else:', '            accepted.append(request)',
  "    return {'accepted': accepted, 'errors': errors}",
]));
continueExercise(pythonPydanticConstraints, 1, ['python-pydantic-constraints', 0],
  'Call the completed validate_capture helper for each row, retaining valid records and reporting expected input failures without hiding defects.', {
    task: [
      'The completed validate_capture helper is supplied unchanged. The starter’s batch wrapper already reuses it successfully when every row is valid. A rejected row currently stops the wrapper before it can return the accepted records and their separate input errors.',
      ...pythonPydanticConstraints.practice[1].task.map(text => text.replace('For each row, call CaptureRequest.model_validate.', 'For each row, call the supplied validate_capture(data).').replace('Keep successful model_dump dictionaries', 'Keep the helper’s successful dictionaries')),
      'Keep the single-record validation in validate_capture. Add recovery around each call rather than copying the schema or changing its constraints inside the batch loop.',
    ],
    starter: worksheet(captureCore, py([
      'def read_capture_batch(rows):',
      '    if not isinstance(rows, list):', "        raise TypeError('Rows must be a list')",
      "    return {'accepted': [validate_capture(row) for row in rows], 'errors': []}",
      '', captureBatchDemo,
    ])),
    solution: worksheet(captureBatchCore, captureBatchDemo),
    tests: [...pythonPydanticConstraints.practice[1].tests, {
      name: 'The collector actually calls the retained validator',
      code: 'validator_globals = read_capture_batch.__globals__\noriginal_validator = validator_globals["validate_capture"]\nseen = []\ndef tracked(data):\n    seen.append(data)\n    return original_validator(data)\nvalidator_globals["validate_capture"] = tracked\ntry:\n    row = {"name":"A","count":1,"bounds":{"lower":0,"upper":1}}\n    assert len(read_capture_batch([row])["accepted"]) == 1\n    assert seen == [row]\nfinally:\n    validator_globals["validate_capture"] = original_validator',
    }],
  });

const integerParser = py([
  'def parse_integer_text(text):',
  '    if not isinstance(text, str):', "        raise TypeError('The field must be text')",
  '    return int(text)',
]);
const countsDemo = py([
  "result = parse_counts(['6', 'bad', ' 4 ', '-2'])",
  "print(sum(result['values']))", 'print(result)',
]);
const countsCore = worksheet(integerParser, py([
  'def parse_counts(texts):',
  '    if not isinstance(texts, list):', "        raise TypeError('Counts must be a list')",
  '    values = []', '    rejected = []',
  '    for position, text in enumerate(texts):',
  '        if not isinstance(text, str):', "            raise TypeError('Every count field must be text')",
  '        try:', '            count = parse_integer_text(text)',
  '            if count < 0:', "                raise ValueError('A count cannot be negative')",
  '        except ValueError:', '            rejected.append(position)',
  '        else:', '            values.append(count)',
  "    return {'values': values, 'rejected': rejected}",
]));
continueExercise(pythonExceptions, 0, ['python-pydantic-constraints', 1],
  'Adapt the capture batch’s narrow input-error recovery to integer text fields, retaining positions while giving counts their own nonnegative policy.', {
    task: [
      'The capture collector separated accepted records from expected schema failures. The starter adapts that same loop to count text and factors its conversion into parse_integer_text. It still catches Pydantic ValidationError, so a bad integer field escapes through the wrong recovery path.',
      ...pythonExceptions.practice[0].task,
      'Keep parse_integer_text and call it from the loop. It converts signed integer text without choosing a domain policy. parse_counts applies the separate nonnegative-count rule, including zero. This differs deliberately from signed temperature readings and from the earlier positive-only save batch.',
    ],
    starter: worksheet('from pydantic import ValidationError', countsCore.replace('except ValueError:', 'except ValidationError:'), countsDemo),
    solution: worksheet(countsCore, countsDemo),
  });
const limitDemo = py([
  'try:', "    parse_limit('many', 40)", 'except LimitError as error:',
  '    print(str(error))', '    print(type(error.__cause__).__name__)', "print(parse_limit('12', 40))",
]);
const limitChecks = py([
  '    if not isinstance(value, str) or type(maximum) is not int:',
  "        raise TypeError('Use text and a whole-number maximum')",
  '    if maximum < 1:', "        raise ValueError('The maximum must be positive')",
]);
const limitCore = worksheet(countsCore, py([
  'class LimitError(Exception):', '    pass', '',
  'def parse_limit(value, maximum):', limitChecks,
  '    try:', '        result = parse_integer_text(value)',
  '    except ValueError as error:', "        raise LimitError('limit must be a whole number') from error",
  '    if not 1 <= result <= maximum:', "        raise LimitError('limit outside allowed range')",
  '    return result',
]));
continueExercise(pythonExceptions, 1, ['python-exceptions', 0],
  'Reuse the integer-text conversion and count importer, then translate a configuration failure into LimitError while preserving its real cause.', {
    task: [
      'The completed count importer and parse_integer_text are supplied. The new parse_limit already reuses that conversion and checks its allowed interval, but the raw ValueError still escapes when conversion fails. Its caller expects the configuration-specific LimitError.',
      ...pythonExceptions.practice[1].task,
      'Keep parse_counts working and call the same parse_integer_text helper from parse_limit. Only translate the conversion failure. The count importer allows zero, while a configuration limit must start at one; preserve that deliberate policy difference.',
    ],
    starter: worksheet(countsCore, py([
      'class LimitError(Exception):', '    pass', '',
      'def parse_limit(value, maximum):', limitChecks,
      '    result = parse_integer_text(value)',
      '    if not 1 <= result <= maximum:', "        raise LimitError('limit outside allowed range')",
      '    return result', '', limitDemo,
    ])),
    solution: worksheet(limitCore, limitDemo),
    tests: [...pythonExceptions.practice[1].tests, {
      name: 'The shared converter and count-specific policy remain usable',
      code: 'assert parse_integer_text("-2") == -2\nassert parse_counts(["0","-2","bad","3"]) == {"values":[0,3],"rejected":[1,2]}',
    }],
  });

const reportNotes = py([
  'from dataclasses import dataclass, field', '',
  '@dataclass', 'class Report:', '    house: str',
  '    tags: list[str] = field(default_factory=list)',
  '    def __post_init__(self):',
  '        if not isinstance(self.house, str) or not self.house.strip():',
  '            raise ValueError("house must be nonempty text")',
  '        if not isinstance(self.tags, list) or any(not isinstance(tag, str) or not tag.strip() for tag in self.tags):',
  '            raise ValueError("tags must be a list of nonempty strings")',
  '        self.tags = self.tags.copy()', '',
  'def add_tag(report, note):',
  '    if not isinstance(note, str) or not note.strip():',
  '        raise ValueError("note must be nonempty text")',
  '    report.tags.append(note)',
]);
const withTagChecks = py([
  '    if not isinstance(record, dict) or not isinstance(tag, str):',
  "        raise TypeError('Use a record and a text tag')",
  "    if not isinstance(record.get('tags'), list) or not all(isinstance(value, str) for value in record['tags']):",
  "        raise ValueError('The record needs a list of text tags')",
  '    cleaned = tag.strip()',
  '    if not cleaned:', "        raise ValueError('The tag cannot be empty')",
]);
const tagDemo = py([
  "original = {'tags': ['raw', 'daily'], 'meta': {'owner': 'Ari'}}",
  "edited = with_tag(original, ' review ')",
  "print(len(edited['tags']))", 'print(original)', 'print(edited)',
]);
const draftTagCore = worksheet(reportNotes, 'from copy import deepcopy', py([
  'def with_tag(record, tag):', withTagChecks,
  "    review = Report('draft')", '    add_tag(review, cleaned)',
  '    result = deepcopy(record)',
  "    result['tags'].extend(review.tags)", '    return result',
]));
continueExercise(pythonMutation, 0, ['python-dataclasses', 1],
  'Keep Report and its deliberate add_tag mutation, then use that note interface to create a deep-independent draft instead of changing shared source data.', {
    task: [
      'The earlier Report and add_tag intentionally changed one report’s owned note list. They are supplied below. with_tag uses them to create a new review note, then returns an edited dictionary. Its shallow dictionary copy protects the top-level mapping and new tag list but still shares nested metadata.',
      ...pythonMutation.practice[0].task,
      'Keep Report and add_tag unchanged and keep using them for the new review note. Repair the draft’s ownership so later edits to any returned nested list or dictionary cannot change the source. Existing source tags still follow this exercise’s list-of-strings contract, including an empty string; only the newly added tag must be nonempty after stripping.',
    ],
    starter: worksheet(reportNotes, py([
      'def with_tag(record, tag):', withTagChecks,
      "    review = Report('draft')", '    add_tag(review, cleaned)',
      '    result = record.copy()', "    result['tags'] = [*record['tags'], *review.tags]",
      '    return result', '', tagDemo,
    ])),
    solution: worksheet(draftTagCore, tagDemo),
    tests: [...pythonMutation.practice[0].tests, {
      name: 'The earlier note operation still intentionally mutates its owned report',
      code: 'source = ["old"]\nreport = Report("north", source)\nadd_tag(report,"checked")\nassert report.tags == ["old","checked"] and source == ["old"]\nassert with_tag({"tags":[""]},"new")["tags"] == ["","new"]',
    }],
  });
const noticeDemo = py([
  "first = collect_notice('first')", "second = collect_notice('second')",
  "third = collect_notice(' third ', first)",
  'print(len(third))', 'print(first)', 'print(second)', 'print(third)',
]);
const noticeCore = worksheet(draftTagCore, py([
  'def collect_notice(text, notices=None):',
  '    if notices is None:', '        notices = []',
  '    if not isinstance(notices, list) or not all(isinstance(value, str) for value in notices):',
  "        raise TypeError('Notices must be a list of text')",
  "    return with_tag({'tags': notices}, text)['tags']",
]));
continueExercise(pythonMutation, 1, ['python-mutation', 0],
  'Reuse the completed with_tag copy operation through a plain notice-list interface, retaining independence while giving caller errors the promised category.', {
    task: [
      'The completed with_tag is supplied. collect_notice adapts its tagged-record interface to a plain list, so ordinary calls already produce independent lists. However, malformed notices currently reach with_tag’s record-shape ValueError instead of this interface’s promised TypeError.',
      ...pythonMutation.practice[1].task,
      'Keep with_tag unchanged and call it from collect_notice. Check notices at this adapter’s boundary before passing {"tags": notices} to the existing helper. Reuse its copying and cleaned-tag behavior instead of duplicating them.',
    ],
    starter: worksheet(draftTagCore, py([
      'def collect_notice(text, notices=None):',
      '    if notices is None:', '        notices = []',
      "    return with_tag({'tags': notices}, text)['tags']", '', noticeDemo,
    ])),
    solution: worksheet(noticeCore, noticeDemo),
    tests: [...pythonMutation.practice[1].tests, {
      name: 'The adapter actually reuses the existing copy operation',
      code: 'adapter_globals = collect_notice.__globals__\noriginal_with_tag = adapter_globals["with_tag"]\nseen = []\ndef tracked(record,tag):\n    seen.append((record,tag))\n    return original_with_tag(record,tag)\nadapter_globals["with_tag"] = tracked\ntry:\n    assert collect_notice(" new ",["old"]) == ["old","new"]\n    assert seen == [({"tags":["old"]}," new ")]\nfinally:\n    adapter_globals["with_tag"] = original_with_tag',
    }],
  });

const lineTotal = worksheet(integerParser, py([
  'def sum_lines(stream):',
  '    total = 0', '    for line in stream:',
  '        if line.strip():', '            total += parse_integer_text(line)',
  '    return total',
]));
const readDemo = py([
  "stream = StringIO('4\\n\\n7\\n3\\n')", 'print(read_total(stream))', 'print(stream.closed)',
]);
const readCore = worksheet('from io import StringIO', lineTotal, py([
  'def read_total(stream):', '    with stream:', '        return sum_lines(stream)',
]));
continueExercise(pythonContextManagers, 0, ['python-exceptions', 1],
  'Reuse integer-text conversion in sum_lines, then add explicit ownership so a read closes its stream on success and failure.', {
    task: [
      'parse_integer_text comes from the preceding exception exercises. The supplied sum_lines composes it into a working line reader and borrows its stream without closing it. read_total currently delegates to that reader but has not implemented its new ownership obligation.',
      ...pythonContextManagers.practice[0].task,
      'Keep sum_lines and parse_integer_text unchanged. Call sum_lines inside the owning with block. These lines are signed readings, so negative integers are valid here; the nonnegative rule belonged to count imports, not to the shared conversion helper.',
    ],
    starter: worksheet('from io import StringIO', lineTotal, py([
      'def read_total(stream):', '    return sum_lines(stream)', '', readDemo,
    ])),
    solution: worksheet(readCore, readDemo),
    tests: [...pythonContextManagers.practice[0].tests, {
      name: 'The supplied lower-level reader still borrows its stream',
      code: 'borrowed = StringIO("-2\\n5\\n")\nassert sum_lines(borrowed) == 3 and borrowed.closed is False\nborrowed.close()',
    }],
  });
const bufferDemo = py([
  'events = []', "with managed_buffer('4\\n7\\n', events) as stream:",
  '    print(sum_lines(stream))', 'print(stream.closed)', 'print(events)',
]);
const bufferChecks = py([
  '    if not isinstance(text, str) or not isinstance(events, list):',
  "        raise TypeError('Use text and an event list')",
  '    stream = StringIO(text)', "    events.append('open')",
]);
continueExercise(pythonContextManagers, 1, ['python-context-managers', 0],
  'Keep the borrowing sum_lines reader and owning read_total, then move acquisition and cleanup into a reusable manager whose finally path preserves body errors.', {
    task: [
      'The earlier reader and owning wrapper are supplied. The new managed_buffer already works when sum_lines finishes normally. Its cleanup sits after yield, so a failure inside the caller’s with block skips the close operation.',
      ...pythonContextManagers.practice[1].task,
      'Keep sum_lines unchanged and use it in the demonstration body. managed_buffer owns the resource in that example, while sum_lines still borrows it. Put cleanup in finally so a bad integer line and an unrelated body error both leave the same closed resource and preserve their original exceptions.',
    ],
    starter: worksheet(readCore, 'from contextlib import contextmanager', py([
      '@contextmanager', 'def managed_buffer(text, events):', bufferChecks,
      '    yield stream', '    stream.close()', "    events.append('close')", '', bufferDemo,
    ])),
    solution: worksheet(readCore, 'from contextlib import contextmanager', py([
      '@contextmanager', 'def managed_buffer(text, events):', bufferChecks,
      '    try:', '        yield stream',
      '    finally:', '        stream.close()', "        events.append('close')", '', bufferDemo,
    ])),
    tests: [...pythonContextManagers.practice[1].tests, {
      name: 'The earlier reader propagates a conversion failure through the new manager',
      code: 'events = []\ntry:\n    with managed_buffer("2\\nbad\\n",events) as stream:\n        sum_lines(stream)\nexcept ValueError: pass\nelse: raise AssertionError("The reader failure was hidden")\nassert stream.closed and events == ["open","close"]',
    }],
  });

const editTargets = {
  'python-fail-fast': ['def validated_total(', 'def append_batch('],
  'python-pydantic-models': ['class ReportRequest:', 'def summarize_ticket('],
  'python-pydantic-constraints': ['class CaptureRequest(', 'def read_capture_batch('],
  'python-exceptions': ['def parse_counts(', 'def parse_limit('],
  'python-mutation': ['def with_tag(', 'def collect_notice('],
  'python-context-managers': ['def read_total(', 'def managed_buffer('],
};
for (const record of lessons) for (const [index, exercise] of record.practice.entries()) {
  exercise.editTarget = editTargets[record.id][index];
  if (exercise.starter.split(exercise.editTarget).length !== 2) {
    throw Error('The editing target must identify exactly one place in ' + record.id);
  }
}

export default lessons;
