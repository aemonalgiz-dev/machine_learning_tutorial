import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { AMPLIFY_LIMIT_BYTES, collectBuildSizes, enforceBuildBudget, MIB } from "./report-build-size.mjs";
import { completeNativeServerTrace } from "./finalize-native-image-trace.mjs";

test("size accounting deduplicates traces, preserves package attribution and excludes caches", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "fitlab-build-size-"));
  try {
    const fixture = {
      ".next/BUILD_ID": "test",
      ".next/server/page.js": "page",
      ".next/static/client.js": "client",
      "public/python/runtime.wasm": "python",
      ".next/cache/ignored": "x".repeat(1000),
      ".next/dev/ignored": "x".repeat(1000),
      "node_modules/@img/sharp-linux-x64/lib/sharp.node": "native",
      "node_modules/unused/package.js": "x".repeat(1000),
      ".next/next-server.js.nft.json": JSON.stringify({ files: ["../node_modules/@img/sharp-linux-x64/lib/sharp.node"] }),
      ".next/server/page.js.nft.json": JSON.stringify({ files: ["../../node_modules/@img/sharp-linux-x64/lib/sharp.node", "page.js"] }),
    };
    for (const [relative, text] of Object.entries(fixture)) {
      const filename = path.join(root, relative);
      await mkdir(path.dirname(filename), { recursive: true });
      await writeFile(filename, text);
    }
    const report = await collectBuildSizes(root);
    assert.equal(report.bytes["Additional traced runtime files"], 6);
    assert.equal(report.tracedRuntimePackages[0].name, "@img/sharp-linux-x64");
    const expected = Object.entries(fixture).filter(([key]) => !key.includes("/ignored") && !key.startsWith("node_modules/unused")).reduce((sum, [, value]) => sum + Buffer.byteLength(value), 0);
    assert.equal(report.totalBytes, expected);
    enforceBuildBudget(report, MIB);
    const traceFile = path.join(root, ".next/next-server.js.nft.json");
    const nativeFile = path.join(root, "node_modules/@img/sharp-linux-x64/lib/sharp.node");
    const sharedLibrary = path.join(root, "node_modules/@img/sharp-linux-x64/lib/libvips.so");
    await writeFile(sharedLibrary, "library");
    await completeNativeServerTrace(traceFile, [nativeFile, sharedLibrary, nativeFile], ["@img/sharp-wasm32"]);
    const completed = await collectBuildSizes(root);
    assert.equal(completed.bytes["Additional traced runtime files"], 13);
    await assert.rejects(() => completeNativeServerTrace(traceFile, [], ["@img/sharp-linux-x64"]), /Unused Sharp package/);
    await writeFile(path.join(root, ".next/next-server.js.nft.json"), JSON.stringify({ files: ["../missing-runtime.node"] }));
    const incomplete = await collectBuildSizes(root);
    assert.equal(incomplete.missingTracedFiles, 1);
    assert.throws(() => enforceBuildBudget(incomplete, MIB), /incomplete/);
  } finally {
    // Delete only this test's resolved temporary directory.
    assert.equal(path.dirname(root), path.resolve(os.tmpdir()));
    assert.ok(path.basename(root).startsWith("fitlab-build-size-"));
    await rm(root, { recursive: true, force: true });
  }
});

test("the byte limit is exact and the configured headroom cannot exceed Amplify's limit", () => {
  const report = { totalBytes: 200 * MIB, missingTracedFiles: 0 };
  enforceBuildBudget(report, 200 * MIB);
  assert.throws(() => enforceBuildBudget({ ...report, totalBytes: report.totalBytes + 1 }, 200 * MIB), /exceed/);
  assert.throws(() => enforceBuildBudget(report, AMPLIFY_LIMIT_BYTES + 1), /at most 220 MiB/);
  assert.throws(() => enforceBuildBudget(report, NaN), /budget/);
  assert.equal(AMPLIFY_LIMIT_BYTES, 230686720);
});
