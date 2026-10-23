"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { refreshAccount, useAccount } from "@/lib/accounts";
import { useLearnerState } from "@/lib/learner-state";
import { BotieSays } from "@/components/site/Botie";
import type { PracticeActivity, PracticeCatalog, PracticeFamily, PracticeMode } from "@/lib/practice-bank/types";
const QuizDeck = dynamic(() => import("@/components/concept/QuizDeck").then(m => m.QuizDeck));
const PracticeDeck = dynamic(() => import("@/components/concept/PracticeDeck").then(m => m.PracticeDeck), { ssr: false });
const BuildWorkshop = dynamic(() => import("@/components/lab/BuildWorkshop").then(m => m.BuildWorkshop), { ssr: false });
const control = "min-h-11 rounded-lg border border-line bg-surface px-3 py-2 text-sm";
const names: Record<PracticeMode, string> = { quiz: "Quiz", code: "Programming", workshop: "Workshop" };
const makeId = (id: string, variant: number, mode: PracticeMode) => id + "--" + String(variant + 1).padStart(2, "0") + "--" + mode;
function usePractice<T>(path: string) {
    const account = useAccount(), id = account.user?.id;
    const [result, setResult] = useState<{
        owner: string;
        path: string;
        data: T;
    } | null>(null);
    const [failure, setFailure] = useState<{
        owner: string;
        path: string;
        message: string;
    } | null>(null);
    const [attempt, retry] = useState(0);
    useEffect(() => {
        if (account.status !== "ready" || !id)
            return;
        const abort = new AbortController();
        const timer = setTimeout(() => { setFailure({ owner: id, path, message: "Loading practice timed out. Please try again." }); abort.abort(); }, 20000);
        void fetch("/practice-api/" + path, { headers: { "X-FitLab-Account": id }, credentials: "same-origin", cache: "no-store", signal: abort.signal })
            .then(async (response) => {
            const body = await response.json();
            if (!response.ok) {
                if (response.status === 401 || response.status === 409)
                    void refreshAccount();
                throw Error(body.error ?? "Practice could not be loaded.");
            }
            if (body.account !== id)
                throw Error("The signed-in account changed. Try again.");
            if (!abort.signal.aborted) {
                setResult({ owner: id, path, data: body.data });
                setFailure(null);
            }
        }).catch(error => { if (!abort.signal.aborted)
            setFailure({ owner: id, path, message: error instanceof Error ? error.message : "Practice could not be loaded." }); })
            .finally(() => clearTimeout(timer));
        return () => { clearTimeout(timer); abort.abort(); };
    }, [path, id, account.status, attempt]);
    return { account, data: account.status === "ready" && result && result.owner === id && result.path === path ? result.data : null,
        error: failure && failure.owner === id && failure.path === path ? failure.message : null,
        retry: () => { setFailure(null); setResult(null); retry(x => x + 1); } };
}
function Gate({ destination }: {
    destination: string;
}) {
    const account = useAccount();
    if (account.status === "checking")
        return <p role="status" className="py-8 text-muted">Checking your account…</p>;
    if (account.status === "unavailable")
        return <div role="alert" className="space-y-4 rounded-xl border border-line p-6"><p>Your account could not be checked. Your saved work stays in this browser.</p><button className={control} onClick={() => void refreshAccount()}>Check account again</button></div>;
    return <div className="space-y-5 rounded-xl border border-line bg-surface p-6">
    <BotieSays mood="curious"><p>Want another problem to work through? Sign in to open the practice library and keep your code and constructions with your account.</p></BotieSays>
    <Link className="inline-flex min-h-11 items-center rounded-lg bg-accent-fill px-4 py-2 font-semibold text-accent-ink" href={"/account?returnTo=" + encodeURIComponent(destination)}>Sign in or create an account</Link>
    <p className="text-sm text-muted">The lessons and their existing quizzes, coding challenges and workshops remain open to everyone. These are additional practice cases.</p>
  </div>;
}
function Failure({ message, retry }: {
    message: string;
    retry: () => void;
}) { return <div role="alert" className="rounded-xl border border-line p-6"><p>{message}</p><button className={control + " mt-4"} onClick={retry}>Try again</button></div>; }
function PracticeMemory({ id }: {
    id?: string;
}) {
    const [saved, setSaved] = useLearnerState("bank:last:v1", { id: "", title: "" });
    useEffect(() => { if (id && saved.id !== id)
        setSaved({ id, title: "Your most recent practice case" }); }, [id, saved.id, setSaved]);
    if (id || !saved.id || !/^[a-z][a-z0-9-]*--\d{2}--(quiz|code|workshop)$/.test(saved.id))
        return null;
    return <Link href={"/practice/" + saved.id} className="inline-flex min-h-11 items-center text-accent underline underline-offset-4">Continue your last practice case →</Link>;
}
function FamilyRow({ family, mode, variant }: {
    family: PracticeFamily;
    mode: PracticeMode;
    variant: number;
}) {
    return <article className="border-b border-line py-6 last:border-0">
    <div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-xl font-semibold"><Link href={"/practice/" + makeId(family.id, variant, mode)} className="hover:text-accent">{family.title}</Link></h2><span className="text-xs text-muted">{family.variants} cases · {family.language === "sql" ? "SQLite" : "Python"}</span></div>
    <p className="mt-2 max-w-3xl leading-7 text-muted">{family.intro}</p>
    <div className="mt-4 flex flex-wrap gap-4 text-sm">
      <Link href={"/practice/" + makeId(family.id, variant, mode)} className="inline-flex min-h-11 items-center rounded-lg bg-accent-fill px-4 font-semibold text-accent-ink">Open {names[mode].toLowerCase()} · case {variant + 1}</Link>
      <Link href={family.lesson} className="inline-flex min-h-11 items-center text-accent underline underline-offset-4">Read the related lesson</Link>
    </div>
  </article>;
}
export function PracticeLibrary() {
    const { account, data, error, retry } = usePractice<PracticeCatalog>("catalog");
    const [group, setGroup] = useState("All topics"), [search, setSearch] = useState(""), [mode, setMode] = useState<PracticeMode>("quiz"), [variant, setVariant] = useState(0);
    if (account.status !== "ready" || !account.user)
        return <Gate destination="/practice"/>;
    if (error)
        return <Failure message={error} retry={retry}/>;
    if (!data || !account.learnerStateReady)
        return <p role="status">Loading your practice library…</p>;
    const families = data.families.filter(f => (group === "All topics" || f.group === group) && [f.id, f.title, f.intro, f.group, f.language, f.lesson].join(" ").toLowerCase().includes(search.toLowerCase().trim()));
    return <div className="space-y-5">
    <p className="text-muted">{data.total.toLocaleString("en-US")} activities across {data.families.length} problem families. Each family has {data.variants} reproducible cases in quiz, programming and workshop form. Cases vary the inputs and boundary conditions of the same problem; they are not separate lessons.</p>
    <PracticeMemory />
    <div className="flex flex-wrap gap-4 rounded-xl border border-line bg-surface p-4">
      <label className="flex min-w-0 flex-1 basis-56 flex-col gap-2 text-sm">Find a problem<input className={control + " w-full"} type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Try precision, SQL, or attention"/></label>
      <label className="flex min-w-0 flex-col gap-2 text-sm">Topic<select className={control + " max-w-full"} value={group} onChange={e => setGroup(e.target.value)}>{["All topics", ...new Set(data.families.map(f => f.group))].map(g => <option key={g}>{g}</option>)}</select></label>
      <label className="flex flex-col gap-2 text-sm">Activity<select aria-label="Activity" className={control} value={mode} onChange={e => setMode(e.target.value as PracticeMode)}>{Object.entries(names).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></label>
      <label className="flex flex-col gap-2 text-sm">Case<select aria-label="Case" className={control} value={variant} onChange={e => setVariant(Number(e.target.value))}>{Array.from({ length: data.variants }, (_, i) => <option key={i} value={i}>{i + 1}</option>)}</select></label>
    </div>
    <p aria-live="polite" className="text-sm text-muted">{families.length === 1 ? "1 problem family matches." : families.length + " problem families match."}</p>
    {families.length ? <div>{families.map(f => <FamilyRow key={f.id} family={f} mode={mode} variant={variant}/>)}</div> : <p>No matching problems. Try another topic or search term.</p>}
  </div>;
}
export function AccountActivity({ id }: {
    id: string;
}) {
    const { account, data, error, retry } = usePractice<PracticeActivity>("activity/" + encodeURIComponent(id));
    if (account.status !== "ready" || !account.user)
        return <Gate destination={"/practice/" + id}/>;
    if (error)
        return <Failure message={error} retry={retry}/>;
    if (!data || !account.learnerStateReady)
        return <p role="status">Loading this case and your saved work…</p>;
    return <div key={account.user.id + ":" + id} className="space-y-6">
    <PracticeMemory id={id}/>
    <header className="space-y-3">
      <p className="font-mono text-xs text-muted">{data.family.group} · Case {data.variant + 1} of {data.family.variants}</p>
      <h1 className="text-3xl font-semibold">{data.family.title}</h1>
      <div className="flex flex-wrap gap-3">{Object.entries(names).map(([key, label]) => <Link aria-current={data.mode === key ? "page" : undefined} className={control + (data.mode === key ? " border-accent-fill text-accent" : " text-muted")} key={key} href={"/practice/" + makeId(data.family.id, data.variant, key as PracticeMode)}>{label}{key === "code" && data.family.language === "sql" ? " (SQL)" : ""}</Link>)}</div>
      <Link href={data.family.lesson} className="inline-block min-h-9 text-sm text-accent underline underline-offset-4">Review the idea in the lesson</Link>
    </header>
    {data.mode === "quiz" && data.quiz && <><p className="leading-7 text-muted">{data.family.intro}</p><QuizDeck questions={data.quiz} lesson={"bank/" + id} section="prediction"/></>}
    {data.mode === "code" && data.exercise && <PracticeDeck exercises={[data.exercise]} lesson={"bank/" + id} active/>}
    {data.mode === "workshop" && data.build && <BuildWorkshop build={data.build} recordId={"bank/" + id} openingCoach={data.family.intro} sessionHistory/>}
    <nav aria-label="Practice cases" className="flex flex-wrap justify-between gap-4 border-t border-line pt-5 text-sm">
      {data.variant > 0 ? <Link className="text-accent underline" href={"/practice/" + makeId(data.family.id, data.variant - 1, data.mode)}>← Previous case</Link> : <span />}
      <Link className="text-accent underline" href="/practice">Choose another problem</Link>
      {data.variant + 1 < data.family.variants && <Link className="text-accent underline" href={"/practice/" + makeId(data.family.id, data.variant + 1, data.mode)}>Next case →</Link>}
    </nav>
  </div>;
}
