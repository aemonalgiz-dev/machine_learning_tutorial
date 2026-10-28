import { challenge } from './agent-safety-authoring.mjs';

const helpers = `def names(value):
    if not isinstance(value, list) or any(not isinstance(x, str) or not x for x in value):
        raise ValueError("Expected a list of nonempty names")
    return value

def rows(value):
    if not isinstance(value, list) or any(not isinstance(x, dict) for x in value):
        raise ValueError("Expected a list of records")
    return value
`;
const exercise = (title, task, signature, solution, output, hints, tests, presentation) => challenge(title, task,
  signature + '\n    raise NotImplementedError("Work through the policy before returning it")\n', solution, output, hints, tests, presentation);

export const boundariesPractice = exercise('Which actions still have a missing control?', ["Reading a manual and publishing an answer cause different effects. Each proposed action needs its own list of required controls, so a permitted read cannot carry a publication past a missing check. Write route_actions(events, policy, installed). Events contain id and effect strings. Policy maps effects to required control-name lists; installed contains application-owned control names.","Return id/route records in input order. A known effect is ready when every requirement is installed; otherwise hold. Unknown effects always hold. Malformed lists raise ValueError. Do not mutate inputs.","Try read and publish, with read requiring object-access and publish requiring approval and output-check. Only object-access is installed. Print the number ready."], 'def route_actions(events, policy, installed):', helpers + `
def route_actions(events, policy, installed):
    installed = set(names(installed))
    answer = []
    for event in rows(events):
        identifier, effect = event.get("id"), event.get("effect")
        names([identifier, effect])
        ready = effect in policy and set(names(policy[effect])).issubset(installed)
        answer.append({"id": identifier, "route": "ready" if ready else "hold"})
    return answer

result = route_actions([{"id":"a","effect":"read"},{"id":"b","effect":"publish"}],
                      {"read":["object-access"],"publish":["approval","output-check"]},["object-access"])
print(sum(item["route"] == "ready" for item in result))`, '1',
['Look up the effect before comparing requirements.', 'Set inclusion answers whether every required name is installed.'], [
['Every requirement matters', 'assert route_actions([{"id":"x","effect":"write"}], {"write":["auth","approval"]}, ["auth"])[0]["route"] == "hold"'],
['Unknown effects cannot inherit permission', 'assert route_actions([{"id":"x","effect":"erase"}], {}, ["unknown-effect"])[0]["route"] == "hold"'],
['A complete control set permits the next step', 'assert route_actions([{"id":"x","effect":"read"}], {"read":["auth"]}, ["auth"])[0]["route"] == "ready"'],
]);

export const codingPractice = exercise('Can this patch stay within the agreed task?', ["A coding worker can make a test disappear instead of fixing the behaviour it checked. Review every changed path independently from the passing-test flag. Write patch_route(entries, allowed, tests_passed). Entries have kind (edit, add, delete or rename) and path. A rename also has oldPath. Paths are already-normalised repository-relative fixture names supplied by a trusted diff reader. Allowed contains exact approved names.","Return ready for review only when all touched paths, including both sides of renames, are approved and tests_passed is exactly True. Otherwise hold patch. Unknown kinds and malformed name lists raise ValueError. This is not a filesystem sandbox.","Rename src/check.py to src/checks.py with only src/checks.py approved and passing independent tests. Print the route."], 'def patch_route(entries, allowed, tests_passed):', helpers + `
def patch_route(entries, allowed, tests_passed):
    allowed = set(names(allowed))
    touched = set()
    for entry in rows(entries):
        kind = entry.get("kind")
        if kind not in {"edit", "add", "delete", "rename"}:
            raise ValueError("Unknown patch kind")
        paths = [entry.get("path")]
        if kind == "rename":
            paths.append(entry.get("oldPath"))
        touched.update(names(paths))
    return "ready for review" if touched <= allowed and tests_passed is True else "hold patch"

print(patch_route([{"kind":"rename","oldPath":"src/check.py","path":"src/checks.py"}],["src/checks.py"],True))`, 'hold patch',
['A rename touches its old and new names.', 'A matching prefix must not grant another path.'], [
['Passing tests alone are insufficient', 'assert patch_route([{"kind":"delete","path":"tests/required.py"}],["src/a.py"],True) == "hold patch"'],
['Exact approved edits can be reviewed', 'assert patch_route([{"kind":"edit","path":"src/a.py"}],["src/a.py"],True) == "ready for review"\nassert patch_route([{"kind":"edit","path":"src/a.py"}],["src/a.py"],"yes") == "hold patch"'],
['Renames require both names', 'assert patch_route([{"kind":"rename","oldPath":"a","path":"b"}],["a","b"],True) == "ready for review"\nassert patch_route([{"kind":"edit","path":"a.backup"}],["a"],True) == "hold patch"'],
]);

export const sandboxPractice = exercise('Which profile exposes more than the task needs?', ["A worker with no network can still alter an unapproved writable directory. Collect the filesystem and execution-privilege findings without letting one clean check erase another gap. Write audit_profile(profile, writable). Profile has mounts (path/mode records), credentials (names), network, privileged and timeout. Writable lists paths permitted to have mode rw. Other valid mounts use ro.","Return route and issues. Collect mount findings in input order: writable mount: PATH for unapproved rw, or unknown mount mode: PATH. Then append network access unless network is none; credentials exposed when nonempty; privilege setting unless privileged is exactly False; timeout outside policy unless timeout is finite, numeric, greater than zero and at most 60. Booleans are not durations. Deduplicate findings without reordering them.","Use hold profile if issues exist, otherwise test isolation. Malformed lists raise ValueError. For an otherwise minimal profile with timeout=90, print the number of issues."], 'def audit_profile(profile, writable):', helpers + `
import math

def audit_profile(profile, writable):
    writable = set(names(writable))
    issues = []
    for mount in rows(profile.get("mounts")):
        path = names([mount.get("path")])[0]
        if mount.get("mode") not in {"ro", "rw"}:
            issues.append("unknown mount mode: " + path)
        elif mount["mode"] == "rw" and path not in writable:
            issues.append("writable mount: " + path)
    if profile.get("network") != "none":
        issues.append("network access")
    if names(profile.get("credentials")):
        issues.append("credentials exposed")
    if profile.get("privileged") is not False:
        issues.append("privilege setting")
    timeout = profile.get("timeout")
    if type(timeout) not in (int, float) or not math.isfinite(timeout) or not 0 < timeout <= 60:
        issues.append("timeout outside policy")
    issues = list(dict.fromkeys(issues))
    return {"route":"hold profile" if issues else "test isolation","issues":issues}

p={"mounts":[],"credentials":[],"network":"none","privileged":False,"timeout":90}
print(len(audit_profile(p,[])["issues"]))`, '1',
['Inspect mounts independently from other execution privileges.', 'A clean configuration still needs runtime isolation tests.'], [
['Minimal profile passes the configuration check', 'p={"mounts":[],"credentials":[],"network":"none","privileged":False,"timeout":30}\nassert audit_profile(p,[]) == {"route":"test isolation","issues":[]}'],
['All findings survive', 'p={"mounts":[{"path":"/home","mode":"rw"}],"credentials":["cloud"],"network":"none","privileged":False,"timeout":30}\nassert audit_profile(p,[])["issues"] == ["writable mount: /home","credentials exposed"]'],
['Boolean and infinite durations fail', 'p={"mounts":[],"credentials":[],"network":"none","privileged":False,"timeout":True}\nassert audit_profile(p,[])["issues"] == ["timeout outside policy"]\np["timeout"]=float("inf")\nassert audit_profile(p,[])["route"] == "hold profile"'],
]);

export const releasePractice = exercise('Do the checks belong to this artifact?', ["A green report may describe the previous build rather than the artifact waiting for release. Bind the independent evidence to the candidate before trusting its passing checks. Write release_route(candidate, evidence, required). Candidate supplies nonempty revision/artifact labels. Evidence comes from an independent verifier with matching identifiers, trustedRunner and checks. Labels are fixture names, not cryptographic proofs.","Return ready for release review only when trustedRunner is exactly True, both identifiers match, and every required check is pass. Missing, skipped or unavailable checks hold release. Malformed required-name lists raise ValueError. Print the route for r2/a2 with passing evidence for r1/a1."], 'def release_route(candidate, evidence, required):', helpers + `
def release_route(candidate, evidence, required):
    required = names(required)
    names([candidate.get("revision"),candidate.get("artifact")])
    bound = evidence.get("trustedRunner") is True and all(candidate[k] == evidence.get(k) for k in ("revision","artifact"))
    checks = evidence.get("checks",{})
    passed = isinstance(checks,dict) and all(checks.get(k) == "pass" for k in required)
    return "ready for release review" if bound and passed else "hold release"

print(release_route({"revision":"r2","artifact":"a2"},{"revision":"r1","artifact":"a1","trustedRunner":True,"checks":{"tests":"pass"}},["tests"]))`, 'hold release',
['Bind revision and artifact before counting green checks.', 'A skipped check supplies no passing evidence.'], [
['Matching independent evidence continues', 'c={"revision":"r","artifact":"a"}\ne={**c,"trustedRunner":True,"checks":{"tests":"pass"}}\nassert release_route(c,e,["tests"]) == "ready for release review"'],
['Untrusted and mismatched evidence hold', 'c={"revision":"r","artifact":"a"}\ne={**c,"trustedRunner":False,"checks":{"tests":"pass"}}\nassert release_route(c,e,["tests"]) == "hold release"\ne.update(trustedRunner=True,artifact="b")\nassert release_route(c,e,["tests"]) == "hold release"'],
['Skipped and missing checks hold', 'c={"revision":"r","artifact":"a"}\ne={**c,"trustedRunner":True,"checks":{"tests":"skipped"}}\nassert release_route(c,e,["tests"]) == "hold release"\nassert release_route(c,e,["scan"]) == "hold release"'],
]);

export const mcpTrustPractice = exercise('Should this discovered tool be exposed?', ["A familiar tool name can arrive with changed argument rules or a changed description. Compare what the host reviewed before exposing that offered capability. Write tool_route(offered, reviewed, server_id). Manifests have server, name, schemaDigest and descriptionDigest strings. Server identity comes from host configuration; digest fixtures represent host-computed metadata fingerprints.","Return available for authorised calls only when the offered server matches server_id and every manifest field matches a nonempty reviewed string. Otherwise hold discovery. Ignore readOnlyHint when deciding trust. Print the route when read_manual retains its schema but descriptionDigest changes."], 'def tool_route(offered, reviewed, server_id):', `def tool_route(offered, reviewed, server_id):
    fields=("server","name","schemaDigest","descriptionDigest")
    matches=all(isinstance(reviewed.get(k),str) and bool(reviewed[k]) and offered.get(k)==reviewed[k] for k in fields)
    return "available for authorised calls" if offered.get("server")==server_id and matches else "hold discovery"

m={"server":"manuals","name":"read_manual","schemaDigest":"s1","descriptionDigest":"d1"}
print(tool_route({**m,"descriptionDigest":"d2"},m,"manuals"))`, 'hold discovery',
['A name belongs to a configured server.', 'Descriptions influence the model, even when schemas remain unchanged.'], [
['Reviewed metadata remains available', 'm={"server":"a","name":"read","schemaDigest":"s","descriptionDigest":"d"}\nassert tool_route(m,m,"a") == "available for authorised calls"'],
['Another server cannot borrow the tool identity', 'm={"server":"a","name":"read","schemaDigest":"s","descriptionDigest":"d"}\nassert tool_route({**m,"server":"b","readOnlyHint":True},m,"a") == "hold discovery"'],
['Changed schemas and missing review records hold', 'm={"server":"a","name":"read","schemaDigest":"s","descriptionDigest":"d"}\nassert tool_route({**m,"schemaDigest":"new"},m,"a") == "hold discovery"\nassert tool_route({},{},"a") == "hold discovery"'],
]);

export const authPractice = exercise('Does the verified token belong at this server?', ["A credential accepted for search does not automatically belong at billing. Check its intended server and current operation scope using the verifier’s supplied claims. Write token_route(claims, policy, now). Claims are None after failed validation, or a trusted verifier record with issuer, audiences list, subject, expires number and scopes list. This function does not accept or verify raw JWTs.","Policy supplies issuer, audience and requiredScope. Continue to object checks only for the matching issuer/audience, nonempty subject, finite numeric expiry strictly greater than now, and exact scope. Otherwise deny request. Booleans are not expiry timestamps. Print the route for a search token presented to billing."], 'def token_route(claims, policy, now):', `import math

def token_route(claims, policy, now):
    if not isinstance(claims,dict):
        return "deny request"
    expiry=claims.get("expires")
    audiences,scopes=claims.get("audiences"),claims.get("scopes")
    valid=(claims.get("issuer")==policy["issuer"]
           and isinstance(audiences,list) and policy["audience"] in audiences
           and isinstance(claims.get("subject"),str) and bool(claims["subject"])
           and type(expiry) in (int,float) and math.isfinite(expiry) and expiry>now
           and isinstance(scopes,list) and policy["requiredScope"] in scopes)
    return "continue to object checks" if valid else "deny request"

c={"issuer":"company","audiences":["search"],"subject":"u7","expires":100,"scopes":["read"]}
print(token_route(c,{"issuer":"company","audience":"billing","requiredScope":"read"},50))`, 'deny request',
['Cryptographic validation happens before this policy.', 'Audience, scope and object permission answer different questions.'], [
['Matching verified claims continue', 'c={"issuer":"i","audiences":["a"],"subject":"u","expires":100,"scopes":["read"]}\np={"issuer":"i","audience":"a","requiredScope":"read"}\nassert token_route(c,p,99) == "continue to object checks"'],
['Expired or unavailable credentials deny', 'p={"issuer":"i","audience":"a","requiredScope":"read"}\nc={"issuer":"i","audiences":["a"],"subject":"u","expires":100,"scopes":["read"]}\nassert token_route(c,p,100) == "deny request"\nassert token_route(None,p,0) == "deny request"'],
['Issuer, scope and audience are independently required', 'p={"issuer":"i","audience":"a","requiredScope":"read"}\nc={"issuer":"i","audiences":["a"],"subject":"u","expires":100,"scopes":["read"]}\nfor change in [{"issuer":"other"},{"audiences":["b"]},{"scopes":["read_all"]}]:\n    assert token_route({**c,**change},p,0) == "deny request"'],
]);

export const actionsPractice = exercise('Is this a new write or a replay?', ["A successful write can advance the stored version before its reply is lost. A later replay needs the receiver’s action record as well as a current proposal review. Write action_route(proposal, approval, stored, ledger, now). Proposal has id, record, version and newValue. Approval repeats those fields with approved and expires. Stored has id/version. Ledger contains complete proposals already applied by the receiver. Inputs are well-formed fixtures.","First require exact bound fields, approved=True and unexpired approval, otherwise hold for approval. For an existing action ID, return already applied when all bound fields match or idempotency conflict otherwise. For a new ID, require stored id/version to match before returning apply once atomically; otherwise refresh and review.","This chooses a route, not a real transaction. Print the route for a valid proposal already in the ledger after the stored version advances."], 'def action_route(proposal, approval, stored, ledger, now):', `def action_route(proposal, approval, stored, ledger, now):
    fields=("id","record","version","newValue")
    if not (approval.get("approved") is True and approval.get("expires",0)>now
            and all(k in proposal and proposal[k]==approval.get(k) for k in fields)):
        return "hold for approval"
    for previous in ledger:
        if previous["id"]==proposal["id"]:
            return "already applied" if all(previous.get(k)==proposal[k] for k in fields) else "idempotency conflict"
    return "apply once atomically" if stored["id"]==proposal["record"] and stored["version"]==proposal["version"] else "refresh and review"

p={"id":"a1","record":"job7","version":2,"newValue":"scheduled"}
a={**p,"approved":True,"expires":100}
print(action_route(p,a,{"id":"job7","version":3},[p],50))`, 'already applied',
['Compare the reviewed arguments before the operation.', 'A receiver receipt can explain why the stored version already advanced.'], [
['New writes need current state', 'p={"id":"a","record":"j","version":1,"newValue":"scheduled"}\na={**p,"approved":True,"expires":100}\nassert action_route(p,a,{"id":"j","version":1},[],20) == "apply once atomically"\nassert action_route(p,a,{"id":"j","version":2},[],20) == "refresh and review"'],
['Changed or expired approvals hold', 'p={"id":"a","record":"j","version":1,"newValue":"scheduled"}\na={**p,"approved":True,"expires":100}\nassert action_route({**p,"newValue":"cancelled"},a,{"id":"j","version":1},[],20) == "hold for approval"\nassert action_route(p,a,{"id":"j","version":1},[],100) == "hold for approval"'],
['An ID cannot represent two writes', 'p={"id":"a","record":"j","version":1,"newValue":"scheduled"}\na={**p,"approved":True,"expires":100}\nassert action_route(p,a,{"id":"j","version":1},[{**p,"newValue":"cancelled"}],20) == "idempotency conflict"'],
]);

export const memoryPractice = exercise('What may the child agent inherit?', ["A child worker needs useful context without inheriting another customer’s notes or extra tools. Filter saved memory independently from the authority being delegated. Write child_context(memory, tenant, now, parent, requested). Memory records have id, tenant, reviewed and expires. Keep IDs from the authenticated tenant when reviewed is exactly True and expiry is numeric and greater than now.","Return memory IDs and tools. Tools are unique requested names present in parent grants, retaining requested order. Memory text cannot add grants. Malformed lists raise ValueError. Print the tool count when parent grants read and the child requests read, export, read."], 'def child_context(memory, tenant, now, parent, requested):', helpers + `
def child_context(memory, tenant, now, parent, requested):
    selected=[item["id"] for item in rows(memory)
              if item.get("tenant")==tenant and item.get("reviewed") is True
              and type(item.get("expires")) in (int,float) and item["expires"]>now]
    grants=set(names(parent))
    tools=list(dict.fromkeys(name for name in names(requested) if name in grants))
    return {"memory":selected,"tools":tools}

print(len(child_context([],"north",20,["read"],["read","export","read"])["tools"]))`, '1',
['Filter memories before building the child context.', 'Intersect requested tools with current parent grants.'], [
['Foreign and unreviewed memories stay out', 'm=[{"id":"a","tenant":"north","reviewed":True,"expires":50},{"id":"b","tenant":"south","reviewed":True,"expires":50},{"id":"c","tenant":"north","reviewed":False,"expires":50}]\nassert child_context(m,"north",20,[],[]) == {"memory":["a"],"tools":[]}'],
['Expiry and revocation affect the next handoff', 'm=[{"id":"a","tenant":"n","reviewed":True,"expires":20}]\nassert child_context(m,"n",20,[],["read"]) == {"memory":[],"tools":[]}'],
['Order survives deduplication', 'assert child_context([],"n",0,["a","b"],["b","a","b","c"])["tools"] == ["b","a"]'],
]);

export const evaluationPractice = exercise('Does the candidate preserve useful work?', ["A system that refuses everything can block attacks and still be unusable. Keep forbidden effects, incomplete traces and blocked legitimate jobs as separate release findings. Write release_report(runs, max_blocked). Runs have id, allowedEffects/effects lists, traceComplete, legitimate and completed. Count violations as runs with any effect outside the oracle allowlist; blockedLegitimate as legitimate runs without completed=True; unknown as runs without traceComplete=True. Counts may overlap.","Return violations, blockedLegitimate, unknown and route. Eligible for canary requires zero violations, zero unknown and blockedLegitimate no greater than max_blocked. Otherwise hold release. Reject empty evaluations, malformed lists and noninteger/negative limits with ValueError; bool is not an integer limit.","Try one completed legitimate read, one blocked attack, and one incomplete legitimate read. Traces are complete. With limit zero print blockedLegitimate, then route on its own line.","The oracle here is the scenario’s declared allowedEffects list, not a model-generated safety opinion. A canary is a limited trial; returning that route does not deploy a service."], 'def release_report(runs, max_blocked):', helpers + `
def release_report(runs, max_blocked):
    runs=rows(runs)
    if not runs or type(max_blocked) is not int or max_blocked<0:
        raise ValueError("Need recorded runs and a nonnegative whole-job limit")
    violations=blocked=unknown=0
    for run in runs:
        allowed,effects=set(names(run["allowedEffects"])),names(run["effects"])
        violations+=any(effect not in allowed for effect in effects)
        blocked+=run.get("legitimate") is True and run.get("completed") is not True
        unknown+=run.get("traceComplete") is not True
    return {"violations":violations,"blockedLegitimate":blocked,"unknown":unknown,
            "route":"eligible for canary" if violations==0 and unknown==0 and blocked<=max_blocked else "hold release"}

runs=[{"id":"a","allowedEffects":["read"],"effects":["read"],"traceComplete":True,"legitimate":True,"completed":True},
      {"id":"b","allowedEffects":[],"effects":[],"traceComplete":True,"legitimate":False,"completed":False},
      {"id":"c","allowedEffects":["read"],"effects":[],"traceComplete":True,"legitimate":True,"completed":False}]
report=release_report(runs,0)
print(report["blockedLegitimate"])
print(report["route"])`, '1\nhold release',
['Inspect effects even after a reassuring refusal.', 'Unknown traces and blocked legitimate jobs are different findings.'], [
['A forbidden effect followed by refusal still violates', 'r={"id":"a","allowedEffects":[],"effects":["export"],"traceComplete":True,"legitimate":False,"completed":False}\nassert release_report([r],0)["violations"] == 1'],
['Incomplete traces prevent promotion', 'r={"id":"a","allowedEffects":[],"effects":[],"traceComplete":False,"legitimate":False,"completed":False}\nassert release_report([r],0)["route"] == "hold release"'],
['Usefulness has its own declared allowance', 'r={"id":"a","allowedEffects":["read"],"effects":[],"traceComplete":True,"legitimate":True,"completed":False}\nassert release_report([r],1)["route"] == "eligible for canary"\nassert release_report([r],0)["route"] == "hold release"'],
]);

