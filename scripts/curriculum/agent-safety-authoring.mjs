import { additionalQuestions } from './agent-safety-questions.mjs';
export { part as p, example, history, source, before, sample, s, op } from './authoring.mjs';
export { table, flow, challenge, q, tf } from './design-authoring.mjs';
export const section = 'Agent Guardrails and Secure Development';
export const simulation = 'These are invented records and deterministic policy checks. The browser runs no agent, shell command, MCP server or network request. Passing these fixtures establishes only the stated policy behaviour.';
export function lesson(record) {
  const { technicalIndex, checkpointAfter, checkpoint, ...rest } = record;
  const parts = record.parts.map((entry, i) => ({ ...entry, title: `${i + 1}. ${entry.title}` }));
  const questions = additionalQuestions[record.id];
  return { ...rest, section, parts, technicalStart: parts[technicalIndex].title,
    quiz: [...record.quiz, ...questions.quiz],
    checkpoints: [{ after: parts[checkpointAfter - 1].title, title: `Questions on Parts 1 to ${checkpointAfter}`, questions: [...checkpoint, ...questions.checkpoint] }] };
}
export function build(title, problem, question, sources, cases, recipe, why, hints) {
  return { title, problem, challenge: question, sources, cases, recipe, why, hints, limitation: simulation, extras: [], draftVersion: 1 };
}
export const docs = {
  agent: 'https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html',
  coding: 'https://cheatsheetseries.owasp.org/cheatsheets/Secure_Coding_with_AI_Cheat_Sheet.html',
  mcp: 'https://modelcontextprotocol.io/specification/2025-11-25/server/tools',
  mcpSecurity: 'https://modelcontextprotocol.io/docs/2025-11-25/tutorials/security/security_best_practices',
  oauth: 'https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization',
  jwt: 'https://www.rfc-editor.org/rfc/rfc8725.html',
  docker: 'https://docs.docker.com/engine/security/',
  ci: 'https://docs.github.com/en/actions/reference/security/secure-use',
  slsa: 'https://slsa.dev/spec/v1.2/provenance',
  approval: 'https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html',
  pydantic: 'https://pydantic.dev/docs/ai/tools-toolsets/deferred-tools/',
  langchain: 'https://docs.langchain.com/oss/python/langchain/human-in-the-loop',
};
