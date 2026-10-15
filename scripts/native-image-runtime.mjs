import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

/** Select packages for the actual build host, never npm's cross-install overrides. */
export function imageRuntimePolicy(platform, arch, libc, packageNames) {
  if (platform === "linux" && !["glibc", "musl"].includes(libc)) {
    throw new Error("Cannot identify the Linux C library. Refusing to remove Sharp fallbacks.");
  }
  const runtime = `${platform === "linux" && libc === "musl" ? "linuxmusl" : platform}-${arch}`;
  const binding = `@img/sharp-${runtime}`;
  const libvips = `@img/sharp-libvips-${runtime}`;
  const candidates = [...new Set([...packageNames, "@img/sharp-wasm32"])]
    .filter(name => name.startsWith("@img/sharp-"));
  if (!candidates.includes(binding) || runtime.includes("wasm")) {
    throw new Error(`No supported native Sharp package for ${runtime}. Refusing to remove fallbacks.`);
  }
  const keptPackages = candidates.filter(name => name === binding || name === libvips);
  const excludedPackages = candidates.filter(name => !keptPackages.includes(name));
  return { runtime, binding, keptPackages, excludedPackages };
}

/**
 * Exclude unused binaries only after both the selected native module and an
 * actual PNG -> resize -> WebP operation succeed. This also rejects a silent
 * WASM fallback or a global libvips installation absent from the deployment.
 */
export async function verifiedImageRuntime() {
  const packageFile = path.resolve(path.dirname(require.resolve("sharp")), "..", "package.json");
  const sharpPackage = JSON.parse(readFileSync(packageFile, "utf8"));
  const sharpRequire = createRequire(packageFile);
  const libc = process.platform === "linux" ? sharpRequire("detect-libc").familySync() : undefined;
  const policy = imageRuntimePolicy(process.platform, process.arch, libc, Object.keys(sharpPackage.optionalDependencies ?? {}));
  const selectedBinding = sharpRequire(`${policy.binding}/sharp.node`);
  const sharp = sharpRequire("sharp");
  // This is the binding actually used by the installed Sharp 0.35 implementation.
  // An incompatible SDK upgrade fails here instead of shipping an incomplete runtime.
  const actualBinding = sharpRequire(path.join(path.dirname(sharpRequire.resolve("sharp")), "sharp.cjs"));
  const vips = actualBinding.libvipsVersion();
  if (actualBinding !== selectedBinding || vips.isWasm !== false || vips.isGlobal !== false) {
    throw new Error(`Sharp did not load the packaged native ${policy.runtime} runtime. Keep its fallbacks until this is resolved.`);
  }
  const png = await sharp({ create: { width: 3, height: 2, channels: 3, background: "#f7b718" } }).png().toBuffer();
  const webp = await sharp(png).resize(6, 4).webp().toBuffer();
  const metadata = await sharp(webp).metadata();
  if (metadata.format !== "webp" || metadata.width !== 6 || metadata.height !== 4) {
    throw new Error("Native Sharp image transformation produced an unexpected result.");
  }
  // Explicit includes keep native DLLs/shared libraries that nft can miss when
  // the operating system loads them rather than a JavaScript require().
  const includes = policy.keptPackages.map(name => `./node_modules/**/${name}/**/*`);
  const excludes = policy.excludedPackages.map(name => `./node_modules/**/${name}/**/*`);
  return { ...policy, includes, excludes, sharpVersion: sharpPackage.version, libvipsVersion: vips.semver };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  verifiedImageRuntime().then(result => {
    if (process.argv.includes("--json")) console.log(JSON.stringify(result, null, 2));
    else console.log(`Native image test passed: ${result.runtime}, Sharp ${result.sharpVersion}, libvips ${result.libvipsVersion}. Keeping ${result.keptPackages.join(", ")}.`);
  }).catch(error => { console.error(error); process.exitCode = 1; });
}
