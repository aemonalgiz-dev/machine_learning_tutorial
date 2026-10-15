import nextEnv from "@next/env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { accountRuntimeUrl } from "./prepare-account-runtime.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const production = process.argv.includes("--production");
nextEnv.loadEnvConfig(root, !production, { info() {}, error() {} });
const siteFlag = process.argv.indexOf("--site");

async function jsonAt(url, description) {
  let response;
  try {
    response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(10_000), headers: { Accept: "application/json" } });
  } catch {
    throw new Error(`${description} could not be reached. Check the service is running and accessible from the website server.`);
  }
  if (!response.ok) throw new Error(`${description} returned HTTP ${response.status}.`);
  try { return await response.json(); }
  catch { throw new Error(`${description} did not return JSON. Check that the URL points to the account service.`); }
}

try {
  const backend = accountRuntimeUrl(process.env.OOP_ML_ACCOUNTS_URL, production ? "production" : "development");
  if (!backend) throw new Error("OOP_ML_ACCOUNTS_URL is unset. Configure the private account service URL in .env.development.local, or in Amplify's environment for production. Guest work remains local until an account service is connected.");
  const health = await jsonAt(`${backend}/health`, "Backend health check");
  if (health.status !== "ok") throw new Error("The backend did not report a healthy database connection.");
  console.log("PASS: account backend and database connection.");
  const session = await jsonAt(`${backend}/session`, "Backend session check");
  if (session.enabled !== true || session.user !== null) throw new Error("The backend did not return the expected anonymous session contract.");
  console.log("PASS: backend session endpoint.");
  if (siteFlag !== -1) {
    const supplied = process.argv[siteFlag + 1];
    if (!supplied || supplied.startsWith("--")) throw new Error("Supply the website origin after --site.");
    const site = accountRuntimeUrl(supplied, production ? "production" : "development");
    if (new URL(site).pathname !== "/") throw new Error("--site must be the website origin, without a path.");
    const proxied = await jsonAt(`${site}/account-api/session`, "Website account proxy");
    if (proxied.enabled !== true || proxied.user !== null) throw new Error("The website is not connected to an enabled account backend. Restart Next.js after changing .env.development.local, or redeploy after changing the Amplify environment.");
    console.log("PASS: website account proxy.");
  }
  console.log("Connection checks passed. Complete sign-in through /account to verify the identity provider and saved work for a real account.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
