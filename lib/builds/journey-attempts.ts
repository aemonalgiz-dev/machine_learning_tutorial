export type JourneyStage = "preparation" | "construction" | "investigation";
export interface StageAttempt { id: string; supported: boolean }
export interface JourneyAssistance {
  /** Historical flag from older records, kept until that stage starts afresh. */
  supported: boolean;
  attemptSupport?: Partial<Record<JourneyStage, StageAttempt>>;
}

/** Help follows the pieces carried forward, unless this floor was explicitly reset. */
export function stageAssistance(state: JourneyAssistance, stage: JourneyStage, legacySupported = false): boolean {
  const own = state.attemptSupport?.[stage];
  if (own) return own.supported;
  const earlier = stage === "investigation" ? "construction" : stage === "construction" ? "preparation" : null;
  return earlier ? stageAssistance(state, earlier, legacySupported) : state.supported || legacySupported;
}

export function recordStageAssistance<T extends JourneyAssistance>(state: T, stage: JourneyStage, supported: boolean, attemptId?: string): T {
  const previous = state.attemptSupport?.[stage];
  return { ...state, attemptSupport: { ...state.attemptSupport,
    [stage]: { id: attemptId ?? previous?.id ?? "legacy", supported: supported || Boolean(previous?.supported) },
  } };
}

/** Only the control that starts an empty floor should call this. */
export function freshStageAttempt<T extends JourneyAssistance>(state: T, stage: JourneyStage, attemptId: string): T {
  return { ...state, attemptSupport: { ...state.attemptSupport, [stage]: { id: attemptId, supported: false } } };
}
