"use client";

import { useLearnerField, useLearnerRecord } from "@/lib/learner-state";
import { BotieSays } from "../site/Botie";

const button = "min-h-11 rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold disabled:opacity-50";
const value = (n: number) => Number(n.toFixed(3));

export function ForecastSequence({lesson}: {lesson:string}) {
  const observations = [8, 10, 9, 13, 12];
  const saved=useLearnerRecord(`forecast:${lesson}:v1`, {method:"persistence",step:1,level:observations[0],records:[] as {day:number;prediction:number;actual:number}[]});
  const [method,setMethod]=useLearnerField(saved, "method");
  const [step,setStep]=useLearnerField(saved, "step");
  const [level,setLevel]=useLearnerField(saved, "level");
  const [records,setRecords]=useLearnerField(saved, "records");
  const prediction = method === "persistence" ? observations[step - 1] : level;
  const complete = step === observations.length;
  const reset = () => { setStep(1); setLevel(observations[0]); setRecords([]); };
  return <section aria-label="Forecast through time" className="space-y-4 rounded-xl border border-line bg-raised p-4 sm:p-6">
    <h3 className="text-lg font-semibold">Make the forecast before revealing the next day</h3>
    <BotieSays>I have observed eight units on day one. Commit a forecast, then reveal the next observation. Only after that observation arrives can it change the following forecast. These are invented demand records.</BotieSays>
    <label className="block text-sm font-semibold">Forecast rule
      <select className="mt-2 block min-h-11 w-full rounded-lg border border-line bg-surface p-2" value={method} onChange={event => { setMethod(event.target.value); reset(); }}>
        <option value="persistence">Repeat last reading</option>
        <option value="smoothing">Smooth with alpha 0.5</option>
      </select>
    </label>
    <p className="text-sm leading-6">Smoothing starts at the first observation, then moves its level halfway toward each newly revealed value. Changing the rule restarts the comparison on the same sequence.</p>
    <div aria-live="polite" className="rounded-lg bg-surface p-4 font-mono text-sm">
      {complete ? "All five days are now observed." : `Known days: 1 to ${step}\nForecast for day ${step + 1}: ${value(prediction)}`.split("\n").map(line => <p key={line}>{line}</p>)}
    </div>
    <div className="flex flex-wrap gap-3">
      <button className={button} disabled={complete} onClick={() => {
        const actual = observations[step];
        setRecords(previous => [...previous, { day: step + 1, prediction, actual }]);
        setLevel(previous => previous + .5 * (actual - previous));
        setStep(previous => previous + 1);
      }}>Commit forecast and reveal day</button>
      <button className={button} onClick={reset}>Restart sequence</button>
    </div>
    {records.length > 0 && <div className="overflow-x-auto"><table className="w-full text-left text-sm" aria-label="Revealed forecast results"><thead><tr>{["Day", "Forecast", "Observed", "Absolute error"].map(label => <th className="p-2" key={label} scope="col">{label}</th>)}</tr></thead><tbody>{records.map(record => <tr key={record.day}><th className="p-2" scope="row">{record.day}</th><td className="p-2">{value(record.prediction)}</td><td className="p-2">{record.actual}</td><td className="p-2">{value(Math.abs(record.prediction-record.actual))}</td></tr>)}</tbody></table></div>}
  </section>;
}

export function ActionSequence({lesson}: {lesson:string}) {
  const saved=useLearnerRecord(`actions:${lesson}:v1`, {state:0,table:[[0,0],[0,0]],done:false,steps:0,last:null as string|null});
  const [state,setState]=useLearnerField(saved, "state");
  const [table,setTable]=useLearnerField(saved, "table");
  const [done,setDone]=useLearnerField(saved, "done");
  const [steps,setSteps]=useLearnerField(saved, "steps");
  const [last,setLast]=useLearnerField(saved, "last");
  const choose = (action: number) => {
    const terminal = state === 1 && action === 1;
    const next = action === 0 ? 1 : state;
    const reward = terminal ? 3 : action === 0 ? -1 : -2;
    const continuation = terminal ? 0 : Math.max(...table[next]);
    const old = table[state][action], target = reward + .9 * continuation;
    const updated = old + .5 * (target - old);
    setLast(`Observed reward: ${reward}\nTrue terminal: ${terminal ? "yes" : "no"}\nContinuation: ${value(continuation)}\nTarget = ${reward} + 0.9 × ${value(continuation)} = ${value(target)}\nQ update = ${value(old)} + 0.5 × (${value(target)} - ${value(old)}) = ${value(updated)}`);
    setTable(previous => previous.map((row,i) => row.map((entry,j) => i === state && j === action ? updated : entry)));
    setState(next); setDone(terminal); setSteps(previous => previous + 1);
  };
  return <section aria-label="Learn through actions" className="space-y-4 rounded-xl border border-line bg-raised p-4 sm:p-6">
    <h3 className="text-lg font-semibold">Choose an action and watch one Q entry change</h3>
    <BotieSays>In this toy environment, watering makes the bed moist and costs one reward unit. Waiting while dry earns minus two. Waiting while moist completes the task and earns three. Try an episode, keep the learned table, and try again.</BotieSays>
    <p className="text-sm leading-6">The learning rate is 0.5 and discount is 0.9. You choose the behaviour actions; the Q-learning target uses the largest next-state estimate. This deterministic teaching environment is not a real watering controller.</p>
    <p role="status" className="font-semibold">{done ? "Episode complete. Start another to reuse what was learned." : `Current state: ${state === 0 ? "dry" : "moist"}.`} Updates made: {steps}.</p>
    <div className="flex flex-wrap gap-3">
      <button className={button} disabled={done} onClick={() => choose(0)}>Water</button>
      <button className={button} disabled={done} onClick={() => choose(1)}>Wait</button>
      <button className={button} disabled={!done} onClick={() => { setState(0); setDone(false); setLast(null); }}>Start another episode</button>
      <button className={button} onClick={() => { setState(0); setDone(false); setTable([[0,0],[0,0]]); setSteps(0); setLast(null); }}>Reset learning</button>
    </div>
    <div className="overflow-x-auto"><table className="w-full text-left text-sm" aria-label="Learned action values"><thead><tr><th scope="col" className="p-2">State</th><th scope="col" className="p-2">Water</th><th scope="col" className="p-2">Wait</th></tr></thead><tbody>{table.map((row,i) => <tr key={i}><th scope="row" className="p-2">{i === 0 ? "Dry" : "Moist"}</th>{row.map((entry,j) => <td className="p-2 font-mono" key={j}>{value(entry)}</td>)}</tr>)}</tbody></table></div>
    {last && <pre aria-live="polite" className="overflow-x-auto rounded-lg bg-surface p-4 text-xs leading-6">{last}</pre>}
  </section>;
}
