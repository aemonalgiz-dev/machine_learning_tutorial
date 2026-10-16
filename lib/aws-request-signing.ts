// AWS Signature Version 4 for calls from the server runtime to a Lambda function
// URL whose AuthType is AWS_IAM. sign() is the generic algorithm and is checked
// against AWS's published test suite; signedRequestHeaders() is what the account
// proxy adds to one request. Credentials come from the environment, or from the
// container credentials endpoint the AWS SDKs read, because nothing documents
// which of the two Amplify Hosting's compute role provides. No value read here
// is ever logged.
import { createHash, createHmac } from "node:crypto";
import { readFile } from "node:fs/promises";

export type AwsCredentials = { accessKeyId: string; secretAccessKey: string; sessionToken?: string };
export type SignatureInput = {
  method: string; path: string; query: Iterable<[string, string]>; headers: Iterable<[string, string]>;
  payloadHash: string; credentials: AwsCredentials; region: string; service: string; amzDate: string;
};
export type Signature = { canonicalRequest: string; stringToSign: string; authorization: string };

const sha256 = (data: string | Uint8Array) => createHash("sha256").update(data).digest("hex");
const hmac = (key: string | Buffer, data: string) => createHmac("sha256", key).update(data).digest();

// RFC 3986: only A-Z a-z 0-9 - . _ ~ stay literal; every other UTF-8 byte becomes uppercase %XX.
export function encodeRfc3986(value: string) {
  let encoded = "";
  for (const byte of Buffer.from(value, "utf8")) {
    const character = String.fromCharCode(byte);
    encoded += /[A-Za-z0-9\-._~]/.test(character) ? character : `%${byte.toString(16).toUpperCase().padStart(2, "0")}`;
  }
  return encoded;
}

export function canonicalQuery(parameters: Iterable<[string, string]>) {
  const order = (left: string, right: string) => (left < right ? -1 : left > right ? 1 : 0);
  return [...parameters].map(([key, value]) => [encodeRfc3986(key), encodeRfc3986(value)])
    .sort(([leftKey, leftValue], [rightKey, rightValue]) => order(leftKey, rightKey) || order(leftValue, rightValue))
    .map(([key, value]) => `${key}=${value}`).join("&");
}

export function sign(input: SignatureInput): Signature {
  const values = new Map<string, string[]>();
  for (const [name, value] of input.headers) {
    const key = name.toLowerCase();
    values.set(key, [...(values.get(key) ?? []), value.trim().replace(/\s+/g, " ")]);
  }
  const names = [...values.keys()].sort();
  const signedHeaders = names.join(";");
  // The path as it travels, encoded once more: every service but S3 signs it double-encoded.
  const canonicalRequest = [input.method, input.path.split("/").map(encodeRfc3986).join("/"), canonicalQuery(input.query),
    ...names.map(name => `${name}:${values.get(name)!.join(",")}`), "", signedHeaders, input.payloadHash].join("\n");
  const scope = [input.amzDate.slice(0, 8), input.region, input.service, "aws4_request"];
  const stringToSign = ["AWS4-HMAC-SHA256", input.amzDate, scope.join("/"), sha256(canonicalRequest)].join("\n");
  const key = scope.reduce<string | Buffer>((parent, part) => hmac(parent, part), `AWS4${input.credentials.secretAccessKey}`);
  const signature = hmac(key, stringToSign).toString("hex");
  return { canonicalRequest, stringToSign, authorization: `AWS4-HMAC-SHA256 Credential=${input.credentials.accessKeyId}/${scope.join("/")}, SignedHeaders=${signedHeaders}, Signature=${signature}` };
}

export function lambdaUrlRegion(url: string | URL) {
  try {
    return /^[a-z0-9]+\.lambda-url\.([a-z0-9-]+)\.on\.aws$/.exec(new URL(url).hostname)?.[1] ?? null;
  } catch {
    return null;
  }
}

// The signature covers the canonical form of the url's query, so the url should already carry that form:
// then what Lambda canonicalises from the wire is what was signed. Only host and the x-amz-* headers are
// signed; whatever else the request carries travels unsigned.
export function signedRequestHeaders(request: { method: string; url: URL; body?: Uint8Array; credentials: AwsCredentials; region: string; service: string; now: Date }): Record<string, string> {
  const amzDate = request.now.toISOString().replace(/[-:]|\.\d{3}/g, "");
  const payloadHash = sha256(request.body ?? "");
  const added: Record<string, string> = { "x-amz-date": amzDate, "x-amz-content-sha256": payloadHash };
  if (request.credentials.sessionToken) added["x-amz-security-token"] = request.credentials.sessionToken;
  const { authorization } = sign({
    method: request.method, path: request.url.pathname, query: request.url.searchParams, headers: [["host", request.url.host], ...Object.entries(added)],
    payloadHash, credentials: request.credentials, region: request.region, service: request.service, amzDate,
  });
  return { ...added, authorization };
}

// The hosts the AWS SDKs accept for the container endpoint over plain HTTP; anything over HTTPS is accepted.
const CONTAINER_HOSTS = ["169.254.170.2", "169.254.170.23", "[fd00:ec2::23]", "[::1]", "localhost"];
let cached: { endpoint: string; refreshAt: number; expiresAt: number; credentials: AwsCredentials } | undefined;

export async function runtimeCredentials(): Promise<AwsCredentials | null> {
  const environment = process.env;
  if (environment.AWS_ACCESS_KEY_ID && environment.AWS_SECRET_ACCESS_KEY) return {
    accessKeyId: environment.AWS_ACCESS_KEY_ID, secretAccessKey: environment.AWS_SECRET_ACCESS_KEY, sessionToken: environment.AWS_SESSION_TOKEN || undefined,
  };
  const full = environment.AWS_CONTAINER_CREDENTIALS_FULL_URI, relative = environment.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI;
  if (!full && !relative) return null;
  let unexpired: AwsCredentials | null = null;
  try {
    const endpoint = new URL(full || `http://169.254.170.2${relative}`);
    if (endpoint.protocol !== "https:" && !(endpoint.protocol === "http:" && (CONTAINER_HOSTS.includes(endpoint.hostname) || /^127\.\d+\.\d+\.\d+$/.test(endpoint.hostname)))) return null;
    // Refresh five minutes early, but a refresh that fails keeps credentials that have not expired.
    if (cached?.endpoint === endpoint.href && Date.now() < cached.expiresAt) unexpired = cached.credentials;
    if (unexpired && cached && Date.now() < cached.refreshAt) return unexpired;
    const tokenFile = environment.AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE;
    const token = environment.AWS_CONTAINER_AUTHORIZATION_TOKEN || (tokenFile ? (await readFile(tokenFile, "utf8")).trim() : "");
    const response = await fetch(endpoint, {
      headers: token ? { Authorization: token } : {}, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(1000),
    });
    if (!response.ok) return unexpired;
    const body = await response.json();
    if (typeof body?.AccessKeyId !== "string" || typeof body.SecretAccessKey !== "string") return unexpired;
    const credentials = { accessKeyId: body.AccessKeyId, secretAccessKey: body.SecretAccessKey, sessionToken: typeof body.Token === "string" ? body.Token : undefined };
    const expiration = Date.parse(body.Expiration);
    cached = Number.isFinite(expiration) ? { endpoint: endpoint.href, refreshAt: expiration - 300000, expiresAt: expiration, credentials } : undefined;
    return credentials;
  } catch {
    return unexpired;
  }
}
