import { test, expect } from "@playwright/test";
import { challengeQuestion, displayExerciseTitle, type Exercise } from "../lib/exercises";
import { mockAccountBackend, waitForAccountReady, waitForAccountSync } from "./helpers/account-backend";

test("display labels preserve authored questions and canonical exercise identity", () => {
  const problem: Exercise = Object.freeze({
    title: "The honest score, and the score that wears its name",
    question: "How does the search winner perform on untouched data?",
    task: [], starter: "print('start')", solution: "print('done')", output: "done",
  });
  const original = JSON.stringify(problem);
  expect(displayExerciseTitle(problem)).toBe("Search scores and holdout performance");
  expect(challengeQuestion(problem)).toBe(problem.question);
  expect(JSON.stringify(problem)).toBe(original);
  expect(displayExerciseTitle({ title: "Build the transition table" })).toBe("Build the transition table");
});

test("challenge labels name the operation and account drafts survive a reload", async ({ page }) => {
  const backend = await mockAccountBackend(page);
  await page.goto("/concepts/feature-scaling");
  await waitForAccountReady(page);
  const navigation = page.getByRole("navigation", { name: "Lesson navigation", exact: true });
  await navigation.getByText("Lesson contents", { exact: true }).click();
  await navigation.getByRole("button", { name: "Coding challenges", exact: true }).click();

  const challenge = page.getByRole("button", { name: "Challenge 2: Outliers and feature scaling", exact: true });
  await expect(challenge).toHaveAttribute("title", "Outliers and feature scaling");
  await challenge.click();
  const editor = page.getByRole("textbox", { name: "Python solution for Outliers and feature scaling", exact: true });
  await expect(editor).toBeVisible();
  await editor.fill("print('my scaling draft')");
  await backend.waitForRecord(key => key.startsWith("practice:/concepts/feature-scaling:"), value => {
    const work = value as { attempts?: { code: string }[] };
    return work.attempts?.[1]?.code === "print('my scaling draft')";
  });
  const savedKey = [...backend.records.keys()].find(key => key.startsWith("practice:/concepts/feature-scaling:"));
  await waitForAccountSync(page);
  await page.reload();
  await waitForAccountReady(page);
  await expect(editor).toContainText("my scaling draft");
  await expect(challenge).toHaveAttribute("aria-current", "step");
  expect([...backend.records.keys()].filter(key => key.startsWith("practice:/concepts/feature-scaling:"))).toEqual([savedKey]);
});
