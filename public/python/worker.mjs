import { loadPyodide } from "./runtime/pyodide.mjs";

let runtime;
let sdkLoaded = false;
let occupied = false;
const packageBaseUrl = "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/";

async function resource(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load ${url} (${response.status}). Try Run again.`);
  return response;
}

async function prepare(id, source) {
  const status = (message) => self.postMessage({ type: "status", id, message });
  if (!runtime) {
    status("Loading Python. The first run takes a little longer.");
    runtime = await loadPyodide({ indexURL: new URL("./runtime/", import.meta.url).href, packageBaseUrl });
    runtime.setStdin({ stdin: () => null });
    status("Loading NumPy. You can keep editing while it downloads.");
    await runtime.loadPackage("numpy");
    runtime.runPython("import numpy");
    runtime.runPython(await (await resource("/python/runner.py")).text());
  }
  if (!sdkLoaded && /(?:from|import)\s+oop_ml\b/.test(source)) {
    status("Loading oop_ml and its dependencies for this challenge.");
    await runtime.loadPackage(["scipy", "pydantic"]);
    const manifest = await (await resource("/python/sdk-manifest.json")).json();
    const bytes = await (await resource(`/python/oop-ml.zip?v=${manifest.sha256}`)).arrayBuffer();
    const digest = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))].map((value) => value.toString(16).padStart(2, "0")).join("");
    if (digest !== manifest.sha256) throw new Error("The course library download was incomplete. Try Run again.");
    runtime.unpackArchive(bytes, "zip", { extractDir: "/home/pyodide/course-sdk" });
    runtime.runPython('import sys\nsys.path.insert(0, "/home/pyodide/course-sdk")\nimport oop_ml');
    sdkLoaded = true;
  }
  return runtime;
}

self.onmessage = async (event) => {
  const { id, source, expected } = event.data;
  if (occupied || typeof id !== "number" || typeof source !== "string") return;
  occupied = true;
  try {
    const python = await prepare(id, source);
    self.postMessage({ type: "running", id });
    const run = python.globals.get("run_course_code");
    try {
      const result = JSON.parse(typeof expected === "string" ? run(source, expected) : run(source));
      self.postMessage({ type: "result", id, result });
    } finally { run.destroy(); }
  } catch (error) {
    self.postMessage({ type: "error", id, message: `Python could not run this time. ${error.message ?? String(error)}` });
  } finally { occupied = false; }
};
