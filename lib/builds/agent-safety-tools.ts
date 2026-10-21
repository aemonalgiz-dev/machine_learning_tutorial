import type { Data, Tool } from './engine';

const record = (value: Data): Record<string, Data> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Connect a record with named fields.');
  return value;
};
const rows = (value: Data) => {
  if (!Array.isArray(value)) throw Error('Connect a list of records.');
  return value.map(record);
};
const strings = (value: Data): string[] => {
  if (!Array.isArray(value) || !value.every(x => typeof x === 'string' && x.length)) throw Error('Connect a list of nonempty names.');
  return value as string[];
};
const text = (value: Data) => { if (typeof value !== 'string' || !value) throw Error('A name is missing.'); return value; };
const number = (value: Data) => { if (typeof value !== 'number' || !Number.isFinite(value)) throw Error('Use a finite number.'); return value; };
const boolean = (value: Data) => { if (typeof value !== 'boolean') throw Error('Connect a true-or-false check.'); return value; };
const tool = (title: string, why: string, inputs: string[], run: Tool['run']): Tool => ({ title, why, inputs, run });
const own = (item: Record<string, Data>, key: string) => Object.hasOwn(item, key);
const boundFields = ['id', 'record', 'version', 'newValue'];

export const agentSafetyTools: Record<string, Tool> = {
  sgRequired: tool('Find the required controls', 'Look up each proposed effect in the application policy. An unknown effect gets an unsatisfied requirement.', ['Proposed effects', 'Application policy'], ([events, rules]) => {
    const policy = record(rules);
    return rows(events).map(event => ({ id: text(event.id), required: own(policy, text(event.effect)) ? strings(policy[text(event.effect)]) : ['unknown-effect'] }));
  }),
  sgMissing: tool('Find missing controls', 'Keep the requirements the installed controls have not satisfied.', ['Required controls per action', 'Installed controls'], ([required, installed]) => {
    const names = strings(installed);
    return rows(required).map(row => ({ id: text(row.id), missing: strings(row.required).filter(name => name === 'unknown-effect' || !names.includes(name)) }));
  }),
  sgRoutes: tool('Hold actions with gaps', 'A proposed action can continue only when its required controls are present. This does not execute it.', ['Missing controls per action'], ([items]) => rows(items).map(row => ({ id: text(row.id), route: strings(row.missing).length ? 'hold' : 'ready' }))),
  sgPatchPaths: tool('Read every changed path', 'A rename touches its old and new paths. These are already normalised fixture paths, not filesystem authorisation.', ['Proposed patch entries'], ([patch]) => [...new Set(rows(patch).flatMap(entry => {
    const kind = text(entry.kind), path = text(entry.path);
    if (!['edit', 'add', 'delete', 'rename'].includes(kind)) throw Error('Unknown patch operation.');
    return kind === 'rename' ? [text(entry.oldPath), path] : [path];
  }))]),
  sgOutside: tool('Compare with the task scope', 'Exact reviewed path names belong to this task. A matching filename prefix does not grant another path.', ['Touched paths', 'Approved paths'], ([touched, allowed]) => {
    const scope = strings(allowed); return strings(touched).filter(path => !scope.includes(path));
  }),
  sgPatchDecision: tool('Send a checked patch for review', 'The protected test result and the path check must both pass. Review still precedes merging.', ['Paths outside scope', 'Independent tests passed?'], ([outside, passed]) => !strings(outside).length && boolean(passed) ? 'ready for review' : 'hold patch'),
  sgMountAudit: tool('Inspect writable mounts', 'Only explicitly approved locations can be writable in this fixture. Read-only mounts still need a separate data-exposure review.', ['Execution profile', 'Approved writable paths'], ([raw, paths]) => {
    const allowed = strings(paths);
    return rows(record(raw).mounts).flatMap(mount => {
      const path = text(mount.path);
      if (!['ro', 'rw'].includes(text(mount.mode))) return [`unknown mount mode: ${path}`];
      return mount.mode === 'rw' && !allowed.includes(path) ? [`writable mount: ${path}`] : [];
    });
  }),
  sgRuntimeAudit: tool('Inspect execution privileges', 'This exercise requires no network, no injected credentials, no privilege escalation and a positive bounded timeout.', ['Execution profile'], ([raw]) => {
    const profile = record(raw), issues: string[] = [];
    if (profile.network !== 'none') issues.push('network access');
    if (strings(profile.credentials).length) issues.push('credentials exposed');
    if (profile.privileged !== false) issues.push('privilege setting');
    if (typeof profile.timeout !== 'number' || !Number.isFinite(profile.timeout) || profile.timeout <= 0 || profile.timeout > 60) issues.push('timeout outside policy');
    return issues;
  }),
  sgCombineIssues: tool('Collect configuration gaps', 'Preserve the findings from both reviews instead of letting one overwrite the other.', ['Mount findings', 'Privilege findings'], ([a, b]) => [...new Set([...strings(a), ...strings(b)])]),
  sgProfileVerdict: tool('Keep the profile findings', 'An empty list makes this profile eligible for an isolation test. It does not prove that a runtime enforces it.', ['Configuration gaps'], ([value]) => ({ route: strings(value).length ? 'hold profile' : 'test isolation', issues: strings(value) })),
  sgEvidenceMatch: tool('Bind evidence to the artifact', 'Accept evidence only from the trusted verifier and for this exact revision and artifact digest.', ['Current candidate', 'Verified build evidence'], ([a, b]) => {
    const current = record(a), evidence = record(b);
    return evidence.trustedRunner === true && text(current.revision) === evidence.revision && text(current.artifact) === evidence.artifact;
  }),
  sgChecksMissing: tool('Check every required result', 'Absent, skipped, failed and unavailable results all leave a required check unsatisfied.', ['Verified build evidence', 'Required check names'], ([raw, names]) => {
    const checks = record(record(raw).checks); return strings(names).filter(name => !own(checks, name) || checks[name] !== 'pass');
  }),
  sgReleaseDecision: tool('Hold unverified releases', 'Both the artifact binding and all required checks must pass before human release review.', ['Evidence matches?', 'Unsatisfied checks'], ([bound, missing]) => boolean(bound) && !strings(missing).length ? 'ready for release review' : 'hold release'),
  sgServerIdentity: tool('Match the configured server', 'Match the locally configured server ID. The server cannot choose a trusted identity by writing it in its description.', ['Discovered tool', 'Configured server ID'], ([raw, id]) => record(raw).server === text(id)),
  sgManifestMatch: tool('Compare reviewed tool metadata', 'Compare tool name and both reviewed digests. These fixture strings represent hashes computed by the host.', ['Discovered tool', 'Reviewed manifest'], ([a, b]) => {
    const offered = record(a), reviewed = record(b);
    return ['server', 'name', 'schemaDigest', 'descriptionDigest'].every(key => typeof reviewed[key] === 'string' && !!reviewed[key] && offered[key] === reviewed[key]);
  }),
  sgToolDecision: tool('Expose only the reviewed tool', 'A known server with changed metadata still needs review. Availability is followed by per-call authorisation.', ['Server matches?', 'Manifest matches?'], ([server, manifest]) => boolean(server) && boolean(manifest) ? 'available for authorised calls' : 'hold discovery'),
  sgTokenBoundary: tool('Check verified token claims', 'These fixtures stand in for claims returned by a trusted validator. This operation does not verify a JWT signature.', ['Verified claims or null', 'Server policy', 'Current time'], ([raw, rules, now]) => {
    if (raw === null) return false;
    const claims = record(raw), policy = record(rules);
    return claims.issuer === text(policy.issuer) && strings(claims.audiences).includes(text(policy.audience)) && typeof claims.subject === 'string' && !!claims.subject && number(claims.expires) > number(now);
  }),
  sgScopeBoundary: tool('Check this operation scope', 'A token for this server still needs the requested scope. Object and tenant checks follow separately.', ['Verified claims or null', 'Server policy'], ([raw, rules]) => raw !== null && strings(record(raw).scopes).includes(text(record(rules).requiredScope))),
  sgAuthRoute: tool('Continue to object permissions', 'Both token and scope checks are required. This route never means that every record is accessible.', ['Token accepted?', 'Scope present?'], ([token, scope]) => boolean(token) && boolean(scope) ? 'continue to object checks' : 'deny request'),
  sgApprovalBinding: tool('Compare the reviewed action', 'Approval covers these exact arguments and must remain unexpired. A changed argument requires a new review.', ['Proposed action', 'Server approval record', 'Current time'], ([a, b, now]) => {
    const proposal = record(a), approval = record(b);
    return approval.approved === true && number(approval.expires) > number(now) && boundFields.every(key => own(proposal, key) && proposal[key] === approval[key]);
  }),
  sgVersionMatches: tool('Compare the stored version', 'The object must still match the state used to prepare the proposal.', ['Proposed action', 'Stored object'], ([a, b]) => {
    const proposal = record(a), stored = record(b); return text(proposal.record) === stored.id && number(proposal.version) === number(stored.version);
  }),
  sgActionRoute: tool('Reconcile before another write', 'Look for this action ID in the receiver ledger. A repeated ID with different arguments is a conflict.', ['Approval valid?', 'Version current?', 'Proposed action', 'Receiver ledger'], ([approved, current, raw, ledger]) => {
    const proposal = record(raw), previous = rows(ledger).find(item => item.id === text(proposal.id));
    if (!boolean(approved)) return 'hold for approval';
    if (previous) return boundFields.every(key => own(proposal, key) && previous[key] === proposal[key]) ? 'already applied' : 'idempotency conflict';
    return boolean(current) ? 'apply once atomically' : 'refresh and review';
  }),
  sgMemoryFilter: tool('Select reviewed memory for this tenant', 'Exclude expired, unreviewed and foreign-tenant records before placing memory in context.', ['Memory records', 'Authenticated tenant', 'Current time'], ([items, tenant, now]) => rows(items).filter(row => row.tenant === text(tenant) && row.reviewed === true && typeof row.expires === 'number' && row.expires > number(now)).map(row => text(row.id))),
  sgGrantedIntersection: tool('Narrow the delegated tools', 'A child receives only requested tools that the parent currently holds. No request can create a new grant.', ['Parent grants', 'Requested child tools'], ([parent, requested]) => { const grants = strings(parent); return [...new Set(strings(requested).filter(name => grants.includes(name)))]; }),
  sgBundleContext: tool('Prepare the child context', 'Keep filtered memory IDs and attenuated grants separate. Memory text cannot add tools.', ['Reviewed memory IDs', 'Child grants'], ([memory, tools]) => ({ memory: strings(memory), tools: strings(tools) })),
  sgTraceVerdicts: tool('Inspect recorded effects', 'Compare independently recorded effects with the scenario oracle. An unknown trace cannot establish that no forbidden action happened.', ['Evaluation runs'], ([items]) => rows(items).map(row => {
    const known = row.traceComplete === true, allowed = strings(row.allowedEffects), effects = strings(row.effects);
    return { id: text(row.id), violation: effects.some(effect => !allowed.includes(effect)), blocked: row.legitimate === true && row.completed !== true, unknown: !known };
  })),
  sgSafetyReport: tool('Count safety and usefulness separately', 'A safe-looking refusal must not erase legitimate work that the system failed to complete.', ['Per-run verdicts'], ([items]) => {
    const verdicts = rows(items); if (!verdicts.length) throw Error('An empty evaluation cannot support a release.');
    return { violations: verdicts.filter(row => boolean(row.violation)).length, blockedLegitimate: verdicts.filter(row => boolean(row.blocked)).length, unknown: verdicts.filter(row => boolean(row.unknown)).length };
  }),
  sgPromotion: tool('Apply the declared release limits', 'This fixture allows no known violations or incomplete traces. Its tolerated blocked-job count was chosen before evaluation.', ['Safety report', 'Maximum blocked legitimate jobs'], ([raw, maximum]) => {
    const report = record(raw), limit = number(maximum);
    if (!Number.isInteger(limit) || limit < 0) throw Error('Use a nonnegative whole-job limit.');
    return number(report.violations) === 0 && number(report.unknown) === 0 && number(report.blockedLegitimate) <= limit ? 'eligible for canary' : 'hold release';
  }),
};
