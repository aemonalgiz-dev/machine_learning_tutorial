import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import path from "node:path";
import { imageRuntimePolicy, verifiedImageRuntime } from "./native-image-runtime.mjs";

const require = createRequire(import.meta.url);
const packageFile = path.resolve(path.dirname(require.resolve("sharp")), "..", "package.json");
const packages = Object.keys(JSON.parse(readFileSync(packageFile, "utf8")).optionalDependencies);

test("glibc and musl deployments retain different native libraries", () => {
  for (const [libc, suffix] of [["glibc", "linux-x64"], ["musl", "linuxmusl-x64"]]) {
    const policy = imageRuntimePolicy("linux", "x64", libc, packages);
    assert.deepEqual(policy.keptPackages.sort(), [`@img/sharp-${suffix}`, `@img/sharp-libvips-${suffix}`].sort());
    assert.ok(policy.excludedPackages.includes("@img/sharp-wasm32"));
    assert.ok(policy.excludedPackages.includes(`@img/sharp-libvips-${libc === "glibc" ? "linuxmusl" : "linux"}-x64`));
  }
});

test("ARM64 never keeps x64 binaries and Windows keeps its bundled native package", () => {
  const arm = imageRuntimePolicy("linux", "arm64", "glibc", packages);
  assert.ok(arm.keptPackages.every(name => name.endsWith("linux-arm64")));
  assert.ok(arm.excludedPackages.includes("@img/sharp-linux-x64"));
  assert.deepEqual(imageRuntimePolicy("win32", "x64", undefined, packages).keptPackages, ["@img/sharp-win32-x64"]);
});

test("an unknown libc or unsupported architecture cannot silently lose fallbacks", () => {
  assert.throws(() => imageRuntimePolicy("linux", "x64", null, packages), /C library/);
  assert.throws(() => imageRuntimePolicy("linux", "unknown", "glibc", packages), /No supported native/);
  assert.throws(() => imageRuntimePolicy("linux", "wasm32", "glibc", packages), /No supported native/);
});

test("the selected native binding really decodes, resizes and encodes images", async () => {
  const result = await verifiedImageRuntime();
  assert.ok(result.sharpVersion);
  const picomatch = require("next/dist/compiled/picomatch");
  const asAbsolute = filename => path.resolve(filename).replaceAll("\\", "/");
  const excludes = picomatch(result.excludes.map(asAbsolute));
  const includes = picomatch(result.includes.map(asAbsolute));
  for (const name of result.keptPackages) {
    assert.equal(excludes(asAbsolute(`./node_modules/${name}/lib/runtime.node`)), false);
    assert.equal(includes(asAbsolute(`./node_modules/${name}/lib/runtime.dll`)), true);
  }
  assert.equal(excludes(asAbsolute("./node_modules/@img/sharp-wasm32/lib/sharp.wasm")), true);
  assert.equal(excludes(asAbsolute("./node_modules/sharp/dist/index.cjs")), false);
  assert.equal(excludes(asAbsolute("./node_modules/@img/colour/index.js")), false);
});
