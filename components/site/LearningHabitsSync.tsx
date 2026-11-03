"use client";

import { useEffect } from "react";
import { startLearningHabits } from "@/lib/learning-habits";

export function LearningHabitsSync() {
  useEffect(startLearningHabits, []);
  return null;
}
