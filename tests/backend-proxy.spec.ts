import { test, expect } from "@playwright/test";
import { createServer, type IncomingHttpHeaders, type ServerResponse } from "node:http";
import { NextRequest } from "next/server";
import { GET, POST } from "../app/backend/[...path]/route";

// What a signed-in reader's browser sends with every request to this origin.
// Each value says it must stay here, so a leak in any header is found by name.
const READER = {
  Cookie: "__Host-fitlab_session=session-must-stay-here; __Host-fitlab_oauth=oauth-must-stay-here",
  Authorization: "Bearer authorization-must-stay-here",
  Origin: "https://origin-must-stay-here.example",
  Referer: "https://fitlab.example/concepts/referer-must-stay-here",
  "X-FitLab-Account": "account-must-stay-here",
  "X-Forwarded-For": "203.0.113.7, forwarded-must-stay-here",
};
type Received = { method: string; url: string; headers: IncomingHttpHeaders; body: string };

function at(...path: string[]) {
  return { params: Promise.resolve({ path }) };
}

async function withComputeApi(answer: (response: ServerResponse, received: Received) => void | Promise<void>, run: (received: Received[]) => Promise<void>) {
  const previous = process.env.OOP_ML_API_URL;
  const received: Received[] = [];
  const server = createServer((request, response) => {
    const chunks: Buffer[] = [];
    request.on("data", chunk => chunks.push(chunk));
    request.on("end", () => {
      const entry = { method: request.method ?? "", url: request.url ?? "", headers: request.headers, body: Buffer.concat(chunks).toString() };
      received.push(entry);
      void answer(response, entry);
    });
  });
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing address");
  process.env.OOP_ML_API_URL = `http://127.0.0.1:${address.port}/`;
  try {
    await run(received);
  } finally {
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
    if (previous === undefined) delete process.env.OOP_ML_API_URL;
    else process.env.OOP_ML_API_URL = previous;
  }
}

test("a reader's cookies and credentials never reach the compute API", async () => {
  const answer = (response: ServerResponse) => { response.writeHead(200, { "Content-Type": "application/json" }).end("{}"); };
  await withComputeApi(answer, async received => {
    const points = JSON.stringify({ points: [{ x: 1, y: 2 }, { x: 2, y: 4 }] });
    const fit = await POST(new NextRequest("http://localhost:3000/backend/concepts/simple-linear-regression/fit", {
      method: "POST", body: points, headers: { ...READER, "Content-Type": "application/json", Accept: "application/json" },
    }), at("concepts", "simple-linear-regression", "fit"));
    expect(fit.status).toBe(200);
    const readings = await GET(new NextRequest("http://localhost:3000/backend/concepts/bytes-and-characters/readings?word=caf%C3%A9%20%26%20co", {
      headers: READER,
    }), at("concepts", "bytes-and-characters", "readings"));
    expect(readings.status).toBe(200);

    expect(received.map(entry => `${entry.method} ${entry.url}`)).toEqual([
      "POST /concepts/simple-linear-regression/fit",
      "GET /concepts/bytes-and-characters/readings?word=caf%C3%A9%20%26%20co",
    ]);
    expect(received[0].body).toBe(points);
    expect(received[0].headers["content-type"]).toBe("application/json");
    expect(received[0].headers.accept).toBe("application/json");
    expect(received[0].headers["content-length"]).toBe(String(Buffer.byteLength(points)));
    for (const entry of received) {
      expect(entry.headers.cookie).toBeUndefined();
      expect(entry.headers.authorization).toBeUndefined();
      expect(entry.headers["x-fitlab-account"]).toBeUndefined();
      expect(JSON.stringify(entry.headers)).not.toContain("must-stay-here");
    }
  });
});

test("the compute API's Set-Cookie and other headers never come back to the reader", async () => {
  const answer = (response: ServerResponse, received: Received) => {
    const refusal = received.url.startsWith("/concepts/k-means");
    response.writeHead(refusal ? 422 : 200, {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=60",
      "Set-Cookie": ["__Host-fitlab_session=overwritten; Path=/; Secure; HttpOnly", "tracker=1; Domain=fitlab.dev; Path=/"],
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": "true",
      "X-Amzn-RequestId": "request-id",
      Location: "https://compute.example.test/elsewhere",
      Server: "uvicorn",
    }).end(JSON.stringify(refusal ? { error: "ValidationError", detail: "k must be at least 1" } : { slope: 2 }));
  };
  await withComputeApi(answer, async () => {
    const fit = await POST(new NextRequest("http://localhost:3000/backend/concepts/simple-linear-regression/fit", {
      method: "POST", body: "{}", headers: { ...READER, "Content-Type": "application/json" },
    }), at("concepts", "simple-linear-regression", "fit"));
    const refused = await POST(new NextRequest("http://localhost:3000/backend/concepts/k-means/cluster", {
      method: "POST", body: "{}", headers: { ...READER, "Content-Type": "application/json" },
    }), at("concepts", "k-means", "cluster"));
    expect(fit.status).toBe(200);
    expect(await fit.json()).toEqual({ slope: 2 });
    expect(refused.status).toBe(422);
    expect(await refused.json()).toEqual({ error: "ValidationError", detail: "k must be at least 1" });
    for (const response of [fit, refused]) {
      expect(response.headers.getSetCookie()).toEqual([]);
      expect(response.headers.get("set-cookie")).toBeNull();
      expect(response.headers.get("content-type")).toBe("application/json");
      expect(response.headers.get("cache-control")).toBe("public, max-age=60");
      expect(response.headers.get("x-content-type-options")).toBe("nosniff");
      expect(response.headers.get("content-security-policy")).toBe("default-src 'none'; sandbox");
      for (const name of ["access-control-allow-origin", "access-control-allow-credentials", "x-amzn-requestid", "location", "server"]) {
        expect(response.headers.get(name)).toBeNull();
      }
    }
  });
});

test("a large answer is passed on as it arrives, not held until it ends", async () => {
  let release = () => {};
  const released = new Promise<void>(resolve => { release = resolve; });
  const first = `{"values":[${"0,".repeat(200_000)}`;
  const answer = async (response: ServerResponse) => {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.write(first);
    await released;
    response.end("1]}");
  };
  await withComputeApi(answer, async () => {
    const pending = GET(new NextRequest("http://localhost:3000/backend/concepts/a-vector-for-a-picture/sphere"), at("concepts", "a-vector-for-a-picture", "sphere"));
    const held = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("The answer was held until it ended")), 10_000));
    const response = await Promise.race([pending, held]);
    expect(response.status).toBe(200);
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let text = "";
    while (text.length < first.length) {
      const chunk = await reader.read();
      if (chunk.done) throw new Error("The answer ended early");
      text += decoder.decode(chunk.value, { stream: true });
    }
    expect(text).toBe(first);
    release();
    for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) text += decoder.decode(chunk.value, { stream: true });
    expect(JSON.parse(text).values).toHaveLength(200_001);
  });
});

test("requests the compute API could not take are answered here without contacting it", async () => {
  await withComputeApi(response => { response.writeHead(200).end(); }, async received => {
    const climbing = await GET(new NextRequest("http://localhost:3000/backend/%2e%2e/health"), at("..", "health"));
    expect(climbing.status).toBe(404);
    const oversized = await POST(new NextRequest("http://localhost:3000/backend/concepts/pca/analyze", {
      method: "POST", body: "x".repeat(6 * 1024 * 1024 + 1), headers: { "Content-Type": "application/json" },
    }), at("concepts", "pca", "analyze"));
    expect(oversized.status).toBe(413);
    expect(received).toHaveLength(0);
  });
});

test("an unreachable compute API is a 502 with nothing of its own", async () => {
  const previous = process.env.OOP_ML_API_URL;
  const originalError = console.error;
  const logged: string[] = [];
  const closed = createServer();
  await new Promise<void>(resolve => closed.listen(0, "127.0.0.1", resolve));
  const address = closed.address();
  if (!address || typeof address === "string") throw new Error("Missing address");
  await new Promise<void>(resolve => closed.close(() => resolve()));
  process.env.OOP_ML_API_URL = `http://127.0.0.1:${address.port}`;
  console.error = (...values: unknown[]) => { logged.push(values.join(" ")); };
  try {
    const response = await GET(new NextRequest("http://localhost:3000/backend/health", { headers: READER }), at("health"));
    expect(response.status).toBe(502);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.getSetCookie()).toEqual([]);
    expect(await response.text()).toBe("");
    expect(logged).toEqual(["fitlab-backend-proxy: the compute API could not be reached for GET /health"]);
  } finally {
    console.error = originalError;
    if (previous === undefined) delete process.env.OOP_ML_API_URL;
    else process.env.OOP_ML_API_URL = previous;
  }
});
