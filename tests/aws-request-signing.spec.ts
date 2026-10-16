import { test, expect } from "@playwright/test";
import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { canonicalQuery, lambdaUrlRegion, runtimeCredentials, sign, signedRequestHeaders } from "../lib/aws-request-signing";

// From AWS's Signature Version 4 test suite: each request as the suite writes it, with the canonical
// request, string to sign and Authorization header it expects.
const SUITE: Record<string, { req: string; creq: string; sts: string; authz: string }> = {
  "get-vanilla": {
    req: "GET / HTTP/1.1\nHost:example.amazonaws.com\nX-Amz-Date:20150830T123600Z",
    creq: "GET\n/\n\nhost:example.amazonaws.com\nx-amz-date:20150830T123600Z\n\nhost;x-amz-date\ne3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    sts: "AWS4-HMAC-SHA256\n20150830T123600Z\n20150830/us-east-1/service/aws4_request\nbb579772317eb040ac9ed261061d46c1f17a8133879d6129b6e1c25292927e63",
    authz: "AWS4-HMAC-SHA256 Credential=AKIDEXAMPLE/20150830/us-east-1/service/aws4_request, SignedHeaders=host;x-amz-date, Signature=5fa00fa31553b73ebf1942676e86291e8372ff2a2260956d9b8aae1d763fbf31",
  },
  "post-x-www-form-urlencoded": {
    req: "POST / HTTP/1.1\nContent-Type:application/x-www-form-urlencoded\nHost:example.amazonaws.com\nX-Amz-Date:20150830T123600Z\n\nParam1=value1",
    creq: "POST\n/\n\ncontent-type:application/x-www-form-urlencoded\nhost:example.amazonaws.com\nx-amz-date:20150830T123600Z\n\ncontent-type;host;x-amz-date\n9095672bbd1f56dfc5b65f3e153adc8731a4a654192329106275f4c7b24d0b6e",
    sts: "AWS4-HMAC-SHA256\n20150830T123600Z\n20150830/us-east-1/service/aws4_request\n42a5e5bb34198acb3e84da4f085bb7927f2bc277ca766e6d19c73c2154021281",
    authz: "AWS4-HMAC-SHA256 Credential=AKIDEXAMPLE/20150830/us-east-1/service/aws4_request, SignedHeaders=content-type;host;x-amz-date, Signature=ff11897932ad3f4e8b18135d722051e5ac45fc38421b1da7b9d196a0fe09473a",
  },
  "post-vanilla-query": {
    req: "POST /?Param1=value1 HTTP/1.1\nHost:example.amazonaws.com\nX-Amz-Date:20150830T123600Z",
    creq: "POST\n/\nParam1=value1\nhost:example.amazonaws.com\nx-amz-date:20150830T123600Z\n\nhost;x-amz-date\ne3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    sts: "AWS4-HMAC-SHA256\n20150830T123600Z\n20150830/us-east-1/service/aws4_request\n9d659678c1756bb3113e2ce898845a0a79dbbc57b740555917687f1b3340fbbd",
    authz: "AWS4-HMAC-SHA256 Credential=AKIDEXAMPLE/20150830/us-east-1/service/aws4_request, SignedHeaders=host;x-amz-date, Signature=28038455d6de14eafc1f9222cf5aa6f1a96197d7deb8263271d420d138af7f11",
  },
  "post-sts-header-before": {
    req: "POST / HTTP/1.1\nHost:example.amazonaws.com\nX-Amz-Date:20150830T123600Z\nX-Amz-Security-Token:AQoDYXdzEPT//////////wEXAMPLEtc764bNrC9SAPBSM22wDOk4x4HIZ8j4FZTwdQWLWsKWHGBuFqwAeMicRXmxfpSPfIeoIYRqTflfKD8YUuwthAx7mSEI/qkPpKPi/kMcGdQrmGdeehM4IC1NtBmUpp2wUE8phUZampKsburEDy0KPkyQDYwT7WZ0wq5VSXDvp75YU9HFvlRd8Tx6q6fE8YQcHNVXAkiY9q6d+xo0rKwT38xVqr7ZD0u0iPPkUL64lIZbqBAz+scqKmlzm8FDrypNC9Yjc8fPOLn9FX9KSYvKTr4rvx3iSIlTJabIQwj2ICCR/oLxBA==",
    creq: "POST\n/\n\nhost:example.amazonaws.com\nx-amz-date:20150830T123600Z\nx-amz-security-token:AQoDYXdzEPT//////////wEXAMPLEtc764bNrC9SAPBSM22wDOk4x4HIZ8j4FZTwdQWLWsKWHGBuFqwAeMicRXmxfpSPfIeoIYRqTflfKD8YUuwthAx7mSEI/qkPpKPi/kMcGdQrmGdeehM4IC1NtBmUpp2wUE8phUZampKsburEDy0KPkyQDYwT7WZ0wq5VSXDvp75YU9HFvlRd8Tx6q6fE8YQcHNVXAkiY9q6d+xo0rKwT38xVqr7ZD0u0iPPkUL64lIZbqBAz+scqKmlzm8FDrypNC9Yjc8fPOLn9FX9KSYvKTr4rvx3iSIlTJabIQwj2ICCR/oLxBA==\n\nhost;x-amz-date;x-amz-security-token\ne3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    sts: "AWS4-HMAC-SHA256\n20150830T123600Z\n20150830/us-east-1/service/aws4_request\nc237e1b440d4c63c32ca95b5b99481081cb7b13c7e40434868e71567c1a882f6",
    authz: "AWS4-HMAC-SHA256 Credential=AKIDEXAMPLE/20150830/us-east-1/service/aws4_request, SignedHeaders=host;x-amz-date;x-amz-security-token, Signature=85d96828115b5dc0cfc3bd16ad9e210dd772bbebba041836c64533a82be05ead",
  },
  "post-sts-header-after": {
    req: "POST / HTTP/1.1\nHost:example.amazonaws.com\nX-Amz-Date:20150830T123600Z",
    creq: "POST\n/\n\nhost:example.amazonaws.com\nx-amz-date:20150830T123600Z\n\nhost;x-amz-date\ne3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    sts: "AWS4-HMAC-SHA256\n20150830T123600Z\n20150830/us-east-1/service/aws4_request\n553f88c9e4d10fc9e109e2aeb65f030801b70c2f6468faca261d401ae622fc87",
    authz: "AWS4-HMAC-SHA256 Credential=AKIDEXAMPLE/20150830/us-east-1/service/aws4_request, SignedHeaders=host;x-amz-date, Signature=5da7c1a2acd57cee7505fc6676e4e544621c30862966e37dddb68e92efbe5d6b",
  },
  "get-vanilla-with-session-token": {
    req: "GET / HTTP/1.1\nHost:example.amazonaws.com\nX-Amz-Date:20150830T123600Z",
    creq: "GET\n/\n\nhost:example.amazonaws.com\nx-amz-date:20150830T123600Z\nx-amz-security-token:6e86291e8372ff2a2260956d9b8aae1d763fbf315fa00fa31553b73ebf194267\n\nhost;x-amz-date;x-amz-security-token\ne3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    sts: "AWS4-HMAC-SHA256\n20150830T123600Z\n20150830/us-east-1/service/aws4_request\n067b36aa60031588cea4a4cde1f21215227a047690c72247f1d70b32fbbfad2b",
    authz: "AWS4-HMAC-SHA256 Credential=AKIDEXAMPLE/20150830/us-east-1/service/aws4_request, SignedHeaders=host;x-amz-date;x-amz-security-token, Signature=07ec1639c89043aa0e3e2de82b96708f198cceab042d4a97044c66dd9f74e7f8",
  },
  "get-vanilla-query-order-key-case": {
    req: "GET /?Param2=value2&Param1=value1 HTTP/1.1\nHost:example.amazonaws.com\nX-Amz-Date:20150830T123600Z",
    creq: "GET\n/\nParam1=value1&Param2=value2\nhost:example.amazonaws.com\nx-amz-date:20150830T123600Z\n\nhost;x-amz-date\ne3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    sts: "AWS4-HMAC-SHA256\n20150830T123600Z\n20150830/us-east-1/service/aws4_request\n816cd5b414d056048ba4f7c5386d6e0533120fb1fcfa93762cf0fc39e2cf19e0",
    authz: "AWS4-HMAC-SHA256 Credential=AKIDEXAMPLE/20150830/us-east-1/service/aws4_request, SignedHeaders=host;x-amz-date, Signature=b97d918cfa904a5beff61c982a1b6f458b799221646efd99d3219ec94cdf2500",
  },
  "get-header-value-trim": {
    req: "GET / HTTP/1.1\nHost:example.amazonaws.com\nMy-Header1: value1\nMy-Header2: \"a   b   c\"\nX-Amz-Date:20150830T123600Z",
    creq: "GET\n/\n\nhost:example.amazonaws.com\nmy-header1:value1\nmy-header2:\"a b c\"\nx-amz-date:20150830T123600Z\n\nhost;my-header1;my-header2;x-amz-date\ne3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    sts: "AWS4-HMAC-SHA256\n20150830T123600Z\n20150830/us-east-1/service/aws4_request\na726db9b0df21c14f559d0a978e563112acb1b9e05476f0a6a1c7d68f28605c7",
    authz: "AWS4-HMAC-SHA256 Credential=AKIDEXAMPLE/20150830/us-east-1/service/aws4_request, SignedHeaders=host;my-header1;my-header2;x-amz-date, Signature=acc3ed3afb60bb290fc8d2dd0098b9911fcaa05412b367055dee359757a9c736",
  },
};
const SUITE_CREDENTIALS = { accessKeyId: "AKIDEXAMPLE", secretAccessKey: "wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY" };
// The suite's .req for this case leaves the token out and its .creq signs it, so it is added here.
const ADDED_HEADERS: Record<string, [string, string][]> = {
  "get-vanilla-with-session-token": [["X-Amz-Security-Token", "6e86291e8372ff2a2260956d9b8aae1d763fbf315fa00fa31553b73ebf194267"]],
};
const EMPTY_HASH = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
const sha256 = (data: string | Uint8Array) => createHash("sha256").update(data).digest("hex");

function parsed(request: string) {
  const [head, body = ""] = request.split("\n\n");
  const [requestLine, ...lines] = head.split("\n");
  const [method, target] = requestLine.split(" ");
  const [path, query = ""] = target.split("?");
  const headers = lines.map(line => [line.slice(0, line.indexOf(":")), line.slice(line.indexOf(":") + 1)] as [string, string]);
  return { method, path, query: new URLSearchParams(query), headers, body };
}

// post-sts-header-after adds the token only after signing, so its .req carries no token and signing it
// as written is that vector's mode. signedRequestHeaders always signs the token, as post-sts-header-before does.
for (const [name, vector] of Object.entries(SUITE)) {
  test(`signs the suite's ${name} vector`, () => {
    const request = parsed(vector.req);
    const signature = sign({
      method: request.method, path: request.path, query: request.query, headers: [...request.headers, ...(ADDED_HEADERS[name] ?? [])],
      payloadHash: sha256(request.body), credentials: SUITE_CREDENTIALS, region: "us-east-1", service: "service", amzDate: "20150830T123600Z",
    });
    expect(signature.canonicalRequest).toBe(vector.creq);
    expect(signature.stringToSign).toBe(vector.sts);
    expect(signature.authorization).toBe(vector.authz);
  });
}

test("the canonical query encodes by RFC 3986 and sorts by encoded key, then value", () => {
  expect(canonicalQuery([])).toBe("");
  const unreserved = "-._~0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  expect(canonicalQuery([[unreserved, unreserved]])).toBe(`${unreserved}=${unreserved}`);
  expect(canonicalQuery([["ሴ", "bar"]])).toBe("%E1%88%B4=bar");
  expect(canonicalQuery([["k", " !\"#$%&'()*+,/:;<=>?@[]"]])).toBe("k=%20%21%22%23%24%25%26%27%28%29%2A%2B%2C%2F%3A%3B%3C%3D%3E%3F%40%5B%5D");
  expect(canonicalQuery([["b", "1"], ["a", "2"], ["a b", "0"], ["a", "1"], ["a-b", "0"], ["A", "3"]])).toBe("A=3&a=1&a=2&a%20b=0&a-b=0&b=1");
  // Raw order puts "a~" first; encoded order puts "a%C3%A9" first, and the encoded order is the one signed.
  expect(canonicalQuery([["a~", "1"], ["aé", "2"]])).toBe("a%C3%A9=2&a~=1");
  expect(canonicalQuery(new URLSearchParams("scope=openid+profile&state=a%2Fb"))).toBe("scope=openid%20profile&state=a%2Fb");
});

test("repeated header names join in order, and the path is encoded once more", () => {
  const { canonicalRequest } = sign({
    method: "GET", path: "/a%20b/", query: [], headers: [["Host", "example.amazonaws.com"], ["My-Header1", "value2"], ["my-header1", "\tvalue1 "]],
    payloadHash: EMPTY_HASH, credentials: SUITE_CREDENTIALS, region: "us-east-1", service: "service", amzDate: "20150830T123600Z",
  });
  expect(canonicalRequest).toBe(`GET\n/a%2520b/\n\nhost:example.amazonaws.com\nmy-header1:value2,value1\n\nhost;my-header1\n${EMPTY_HASH}`);
});

test("request headers sign the host fetch sends, the body hash and the token, and nothing else", () => {
  const now = new Date("2015-08-30T12:36:00.123Z");
  const credentials = { ...SUITE_CREDENTIALS, sessionToken: "session-token" };
  const recomputed = (method: string, url: URL, host: string, added: Record<string, string>) => sign({
    method, path: url.pathname, query: url.searchParams, headers: [["host", host], ...Object.entries(added).filter(([name]) => name !== "authorization")],
    payloadHash: added["x-amz-content-sha256"], credentials: SUITE_CREDENTIALS, region: "us-east-2", service: "lambda", amzDate: "20150830T123600Z",
  }).authorization;
  const url = new URL("https://abc123.lambda-url.us-east-2.on.aws:443/auth/callback?code=a&state=b");
  const got = signedRequestHeaders({ method: "GET", url, credentials, region: "us-east-2", service: "lambda", now });
  expect(Object.keys(got).sort()).toEqual(["authorization", "x-amz-content-sha256", "x-amz-date", "x-amz-security-token"]);
  expect(got["x-amz-date"]).toBe("20150830T123600Z");
  expect(got["x-amz-content-sha256"]).toBe(EMPTY_HASH);
  expect(got["x-amz-security-token"]).toBe("session-token");
  expect(got.authorization).toMatch(/^AWS4-HMAC-SHA256 Credential=AKIDEXAMPLE\/20150830\/us-east-2\/lambda\/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date;x-amz-security-token, Signature=[0-9a-f]{64}$/);
  expect(got.authorization).toBe(recomputed("GET", url, "abc123.lambda-url.us-east-2.on.aws", got));
  const body = new TextEncoder().encode('{"completed":["linear-regression"]}');
  const local = new URL("http://127.0.0.1:8001/progress");
  const put = signedRequestHeaders({ method: "PUT", url: local, body, credentials: SUITE_CREDENTIALS, region: "us-east-2", service: "lambda", now });
  expect(put["x-amz-content-sha256"]).toBe(sha256(body));
  expect("x-amz-security-token" in put).toBe(false);
  expect(put.authorization).toContain("SignedHeaders=host;x-amz-content-sha256;x-amz-date,");
  expect(put.authorization).toBe(recomputed("PUT", local, "127.0.0.1:8001", put));
});

test("a server re-deriving the signature from what fetch actually sent agrees with it", async () => {
  const verdicts: boolean[] = [];
  const server = createServer((request, response) => {
    const chunks: Buffer[] = [];
    request.on("data", chunk => chunks.push(chunk));
    request.on("end", () => {
      const body = Buffer.concat(chunks), [path, query = ""] = (request.url ?? "").split("?");
      const header = (name: string) => String(request.headers[name] ?? "");
      const { authorization } = sign({
        method: request.method ?? "", path, query: new URLSearchParams(query), headers: ["host", "x-amz-content-sha256", "x-amz-date", "x-amz-security-token"].map(name => [name, header(name)]),
        payloadHash: sha256(body), credentials: SUITE_CREDENTIALS, region: "us-east-2", service: "lambda", amzDate: header("x-amz-date"),
      });
      verdicts.push(authorization === header("authorization") && header("x-amz-content-sha256") === sha256(body));
      response.writeHead(204).end();
    });
  });
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing address");
  try {
    for (const [method, query, body] of [["GET", "", undefined], ["PUT", "?Code=Z&code=abc&state=s%20t", new TextEncoder().encode('{"seen":true}')]] as const) {
      const url = new URL(`http://127.0.0.1:${address.port}/auth/callback${query}`);
      const credentials = { ...SUITE_CREDENTIALS, sessionToken: "session-token" };
      const added = signedRequestHeaders({ method, url, body, credentials, region: "us-east-2", service: "lambda", now: new Date() });
      await fetch(url, { method, headers: { ...added, cookie: "unsigned=1", origin: "http://localhost:3000" }, body });
    }
  } finally {
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
  expect(verdicts).toEqual([true, true]);
});

test("only a Lambda function URL host names a region", () => {
  expect(lambdaUrlRegion("https://abc123.lambda-url.us-east-2.on.aws")).toBe("us-east-2");
  expect(lambdaUrlRegion(new URL("https://abc123def456.lambda-url.ap-southeast-1.on.aws/"))).toBe("ap-southeast-1");
  expect(lambdaUrlRegion("https://ABC123.Lambda-Url.US-EAST-2.on.aws")).toBe("us-east-2");
  for (const url of [
    "http://127.0.0.1:8001", "https://accounts.example.test", "https://abc123.lambda-url.us-east-2.on.aws.example.test",
    "https://example.test/abc123.lambda-url.us-east-2.on.aws", "https://lambda-url.us-east-2.on.aws", "https://a.b.lambda-url.us-east-2.on.aws", "not a url",
  ]) expect(lambdaUrlRegion(url), url).toBeNull();
});

const AWS_NAMES = [
  "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_SESSION_TOKEN", "AWS_CONTAINER_CREDENTIALS_FULL_URI",
  "AWS_CONTAINER_CREDENTIALS_RELATIVE_URI", "AWS_CONTAINER_AUTHORIZATION_TOKEN", "AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE",
];

async function withEnvironment(values: Record<string, string>, run: () => Promise<void>) {
  const previous = AWS_NAMES.map(name => [name, process.env[name]] as const);
  const originalFetch = globalThis.fetch;
  for (const name of AWS_NAMES) delete process.env[name];
  Object.assign(process.env, values);
  try {
    await run();
  } finally {
    globalThis.fetch = originalFetch;
    for (const [name, value] of previous) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
}

const CONTAINER_ANSWER = { AccessKeyId: "ASIACONTAINER", SecretAccessKey: "container-secret", Token: "container-session" };
const CONTAINER_CREDENTIALS = { accessKeyId: "ASIACONTAINER", secretAccessKey: "container-secret", sessionToken: "container-session" };

test("environment credentials are read at call time and win over the container endpoint", async () => {
  let contacted = false;
  await withEnvironment({
    AWS_ACCESS_KEY_ID: "AKIDENVIRONMENT", AWS_SECRET_ACCESS_KEY: "environment-secret", AWS_SESSION_TOKEN: "environment-token",
    AWS_CONTAINER_CREDENTIALS_FULL_URI: "http://127.0.0.1:9/credentials",
  }, async () => {
    globalThis.fetch = async () => { contacted = true; return Response.json(CONTAINER_ANSWER); };
    expect(await runtimeCredentials()).toEqual({ accessKeyId: "AKIDENVIRONMENT", secretAccessKey: "environment-secret", sessionToken: "environment-token" });
    delete process.env.AWS_SESSION_TOKEN;
    process.env.AWS_ACCESS_KEY_ID = "AKIDROTATED";
    const rotated = await runtimeCredentials();
    expect(rotated?.accessKeyId).toBe("AKIDROTATED");
    expect(rotated?.sessionToken).toBeUndefined();
    expect(contacted).toBe(false);
  });
  await withEnvironment({ AWS_ACCESS_KEY_ID: "AKIDWITHOUTSECRET" }, async () => {
    globalThis.fetch = async () => { contacted = true; return Response.json(CONTAINER_ANSWER); };
    expect(await runtimeCredentials()).toBeNull();
    expect(contacted).toBe(false);
  });
});

test("the container endpoint is read with its token, cached until five minutes before expiry", async () => {
  const seen: { path?: string; authorization?: string }[] = [];
  const server = createServer((request, response) => {
    seen.push({ path: request.url, authorization: request.headers.authorization });
    const minutes = request.url === "/expiring" ? 2 : 60;
    if (request.url === "/failing") return response.writeHead(500).end("{}");
    const answer = request.url === "/incomplete" ? { AccessKeyId: "ASIACONTAINER" } : { ...CONTAINER_ANSWER, Expiration: new Date(Date.now() + minutes * 60000).toISOString() };
    response.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(answer));
  });
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing address");
  const origin = `http://127.0.0.1:${address.port}`;
  const directory = await mkdtemp(join(tmpdir(), "fitlab-signing-"));
  try {
    await withEnvironment({ AWS_CONTAINER_CREDENTIALS_FULL_URI: `${origin}/credentials`, AWS_CONTAINER_AUTHORIZATION_TOKEN: "container-token" }, async () => {
      expect(await runtimeCredentials()).toEqual(CONTAINER_CREDENTIALS);
      expect(await runtimeCredentials()).toEqual(CONTAINER_CREDENTIALS);
      expect(seen).toEqual([{ path: "/credentials", authorization: "container-token" }]);
      process.env.AWS_CONTAINER_CREDENTIALS_FULL_URI = `${origin}/expiring`;
      await runtimeCredentials();
      await runtimeCredentials();
      expect(seen.slice(1).map(entry => entry.path)).toEqual(["/expiring", "/expiring"]);
      const tokenFile = join(directory, "token");
      await writeFile(tokenFile, "file-token\n");
      delete process.env.AWS_CONTAINER_AUTHORIZATION_TOKEN;
      process.env.AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE = tokenFile;
      process.env.AWS_CONTAINER_CREDENTIALS_FULL_URI = `${origin}/from-file`;
      expect(await runtimeCredentials()).toEqual(CONTAINER_CREDENTIALS);
      expect(seen.at(-1)).toEqual({ path: "/from-file", authorization: "file-token" });
      for (const path of ["/failing", "/incomplete"]) {
        process.env.AWS_CONTAINER_CREDENTIALS_FULL_URI = `${origin}${path}`;
        expect(await runtimeCredentials(), path).toBeNull();
      }
    });
  } finally {
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
    await rm(directory, { recursive: true, force: true });
  }
});

test("a relative container URI is read from the ECS host, and a full URI takes precedence", async () => {
  const requested: string[] = [];
  await withEnvironment({ AWS_CONTAINER_CREDENTIALS_RELATIVE_URI: "/v2/credentials/example-id" }, async () => {
    globalThis.fetch = async (input: RequestInfo | URL) => { requested.push(String(input)); return Response.json(CONTAINER_ANSWER); };
    expect(await runtimeCredentials()).toEqual(CONTAINER_CREDENTIALS);
    process.env.AWS_CONTAINER_CREDENTIALS_FULL_URI = "http://169.254.170.23/v1/credentials";
    expect(await runtimeCredentials()).toEqual(CONTAINER_CREDENTIALS);
  });
  expect(requested).toEqual(["http://169.254.170.2/v2/credentials/example-id", "http://169.254.170.23/v1/credentials"]);
});

test("a container endpoint outside the hosts the SDKs accept is never contacted", async () => {
  const requested: string[] = [];
  await withEnvironment({}, async () => {
    globalThis.fetch = async (input: RequestInfo | URL) => { requested.push(String(input)); return Response.json(CONTAINER_ANSWER); };
    const accepted = [
      "http://127.0.0.1:8080/c", "http://127.12.0.1/c", "http://localhost/c", "http://169.254.170.2/c", "http://169.254.170.23/c",
      "http://[fd00:ec2::23]/c", "http://[::1]/c", "https://credentials.example.test/c",
    ];
    for (const endpoint of accepted) {
      process.env.AWS_CONTAINER_CREDENTIALS_FULL_URI = endpoint;
      expect(await runtimeCredentials(), endpoint).toEqual(CONTAINER_CREDENTIALS);
    }
    expect(requested).toEqual(accepted);
    for (const endpoint of [
      "http://169.254.169.254/latest/meta-data/iam/security-credentials/role", "http://credentials.example.test/c", "http://10.0.0.1/c",
      "http://128.0.0.1/c", "http://localhost.example.test/c", "ftp://127.0.0.1/c", "file:///credentials", "not a url",
    ]) {
      process.env.AWS_CONTAINER_CREDENTIALS_FULL_URI = endpoint;
      expect(await runtimeCredentials(), endpoint).toBeNull();
    }
    expect(requested).toEqual(accepted);
  });
});
