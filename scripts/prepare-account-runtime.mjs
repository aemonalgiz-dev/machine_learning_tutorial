import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const variable = "OOP_ML_ACCOUNTS_URL";

export function accountRuntimeUrl(value, environment = "production") {
  const supplied = value?.trim() ?? "";
  if (!supplied) return "";
  const invalid = () => new Error(`${variable} must be an HTTPS service URL without credentials, a query or a fragment.`);
  // Avoid URL parser normalization hiding invalid input or dotenv line injection.
  if (/[\u0000-\u0020\u007f\\]/.test(supplied)) throw invalid();
  let url;
  try { url = new URL(supplied); } catch { throw invalid(); }
  const local = environment === "development" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.username || url.password || url.search || url.hash ||
    (url.protocol !== "https:" && !(local && url.protocol === "http:"))) throw invalid();
  return `${url.origin}${url.pathname.replace(/\/+$/, "")}`;
}

function closesQuote(value, quote, start = 0) {
  for (let index = start; index < value.length; index++) {
    if (value[index] === "\\") { index++; continue; }
    if (value[index] === quote) return true;
  }
  return false;
}

export function accountRuntimeEnvironment(previous, value) {
  const url = accountRuntimeUrl(value);
  const lines = previous.match(/[^\n]*\n|[^\n]+$/g) ?? [];
  const kept = [];
  let quote = null;
  let removing = false;
  for (const line of lines) {
    if (quote) {
      if (!removing) kept.push(line);
      if (closesQuote(line, quote)) { quote = null; removing = false; }
      continue;
    }
    const assignment = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([^\r\n]*)/);
    removing = assignment?.[1] === variable;
    if (!removing) kept.push(line);
    const first = assignment?.[2][0];
    if (first && "\"'`".includes(first) && !closesQuote(assignment[2], first, 1)) quote = first;
  }
  if (quote) throw new Error("Cannot update .env.production because a quoted value is unfinished.");
  const contents = kept.join("");
  const newline = previous.includes("\r\n") ? "\r\n" : "\n";
  // Next expands dollar references even in quoted dotenv values. A service path
  // containing a literal dollar must survive that expansion unchanged.
  const encoded = url.replace(/\$/g, "\\$");
  return `${contents}${contents && !contents.endsWith("\n") ? newline : ""}${variable}="${encoded}"${newline}`;
}

/** @param {string} filename @param {Record<string, string | undefined>} environment */
export async function prepareAccountRuntime(filename, environment = process.env) {
  let previous = "";
  try { previous = await readFile(filename, "utf8"); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  const next = accountRuntimeEnvironment(previous, environment[variable]);
  if (next !== previous) await writeFile(filename, next, "utf8");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  await prepareAccountRuntime(path.join(root, ".env.production"));
  console.log(process.env[variable]?.trim()
    ? "Account service URL prepared for the Next.js server runtime."
    : "Account service unset. The Next.js server will offer guest learning.");
}
