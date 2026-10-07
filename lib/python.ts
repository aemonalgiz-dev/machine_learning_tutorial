export interface PythonResult {
  stdout: string;
  stderr: string;
  error: string | null;
  elapsed: number;
  tests: PythonTestResult[];
}

export interface PythonTestResult {
  name: string;
  status: "passed" | "failed" | "skipped";
  expected?: string;
  actual?: string;
  detail: string;
}

export type PythonMessage =
  | { type: "status"; id: number; message: string }
  | { type: "running"; id: number }
  | { type: "result"; id: number; result: PythonResult }
  | { type: "error"; id: number; message: string };

export const EXECUTION_LIMIT_MS = 60_000;
export const LOADING_LIMIT_MS = 180_000;
