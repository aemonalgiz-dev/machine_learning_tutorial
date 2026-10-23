"use client";

import { useEffect, useId, useMemo, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { useLearnerField, useLearnerRecord, migrateLearnerRecord } from "@/lib/learner-state";
import { useProgressAccount } from "@/lib/progress";
import { BotieSays } from "@/components/site/Botie";
import { TOOLS } from "@/lib/builds/tools";
import { assemble, evaluate, previewConstruction, expressionTools, plug, same, type Build, type Construction, type Trace, type Piece, type Connection, type Data } from "@/lib/builds/engine";
import { wirePath, looseWire, outputPoint, inputPoint, NODE_WIDTH, type NodeGeometry, type Point } from "@/lib/builds/wires";
import { arrangeConstruction, estimatedHeight } from "@/lib/builds/layout";
import styles from "./BuildWorkshop.module.css";
import { WorkshopValue } from "./WorkshopValue";
import { MatrixVectorCalculation } from "./MatrixVectorCalculation";
import { WorkshopPiece } from "./WorkshopPiece";
import { WorkshopInputs } from "./WorkshopInputs";
import { WorkshopTestBadge } from "./WorkshopTestBadge";
import { constructionHints, experimentPrompt, resultFeedback } from "@/lib/builds/coaching";
import { testConstruction, validConstructionForBuild, workshopRecordKey, type WorkshopOutcome } from "@/lib/builds/workshop-session";

export type { WorkshopOutcome } from "@/lib/builds/workshop-session";

const button="min-h-11 rounded-lg border border-line bg-raised px-3 py-2 text-sm font-semibold hover:border-accent-fill disabled:opacity-40";
const primary="min-h-11 rounded-lg bg-accent-fill px-4 py-2 text-sm font-semibold text-accent-ink disabled:opacity-40";
type Socket={id:string;port:number;output:boolean};
type Run={traces:Trace[];cases:number[];index:number;step:number;playing:boolean;done:boolean;experiment?:boolean};
const empty=(compact=false):Construction=>({pieces:[{id:"output",tool:"output",x:compact?720:1080,y:compact?170:330,settings:{}}],connections:[]});
const clone=(g:Construction):Construction=>structuredClone(g);
const title=(p:Piece,build:Build)=>p.tool==="output"?"Result":p.tool.startsWith("source:")?build.sources[p.tool.slice(7)]:TOOLS[p.tool].title;
const inputs=(p:Piece)=>p.tool==="output"?["Your result"]:p.tool.startsWith("source:")?[]:TOOLS[p.tool].inputs;
const sameWire=(a:Connection|null,b:Connection)=>a?.from===b.from&&a.to===b.to&&a.port===b.port;

export interface BuildWorkshopProps {
  build: Build;
  guide?: boolean;
  compact?: boolean;
  /** The surrounding journey already presents this challenge. Keep live feedback here. */
  embeddedBrief?: boolean;
  /** Seeds a new draft only. Returning learners keep their own construction. */
  initialGraph?: Construction;
  /** Guidance belongs to the copied graph, even if its source later starts afresh. */
  initialSupported?: boolean;
  initialCaseIndex?: number;
  /** Separate drafts for a component trial, full build or fresh variation. */
  recordId?: string;
  allowSolution?: boolean;
  /** Keep undo snapshots in this visit rather than syncing every old graph. */
  sessionHistory?: boolean;
  /** Context beside the objective, such as a named intermediate calculation. */
  briefing?: ReactNode;
  openingCoach?: string;
  continuation?: boolean;
  /** The learner's own checked calculations, with inputs mapped to this problem. */
  reusable?: { title: string; graph: Construction; supported: boolean }[];
  onReuse?: (supported: boolean) => void;
  /** Report guidance as soon as it is used, including a restored draft. */
  onAssistance?: () => void;
  /** Runs only after the learner explicitly tests every example. */
  onOutcome?: (outcome: WorkshopOutcome) => void;
  /** A changed calculation needs testing again. Moving pieces does not. */
  onActivity?: () => void;
  /** A new empty attempt has its own assistance history. Clearing alone does not. */
  onFreshAttempt?: (attemptId: string) => void;
  /** Preserve an investigation's prediction before revealing its target. */
  withholdExpectedUntilTest?: boolean;
}

export function BuildWorkshop(props: BuildWorkshopProps) {
  const account = useProgressAccount();
  // A seed loaded after hydration can initialise a missing draft. Saved drafts
  // still take precedence inside Workshop's account-scoped record.
  return <Workshop key={`${props.recordId ?? props.build.id}:v${props.build.draftVersion ?? 1}:${account ?? "guest"}:seed-${Boolean(props.initialGraph)}`} {...props}/>;
}

function Workshop({build, guide=false, compact=false, embeddedBrief=false, initialGraph, initialSupported=false, initialCaseIndex=0, recordId, allowSolution=true, sessionHistory=false, briefing, openingCoach, continuation=false, reusable, onReuse, onAssistance, onOutcome, onActivity, onFreshAttempt, withholdExpectedUntilTest=false}: BuildWorkshopProps) {
  const account = useProgressAccount();
  const storageKey=`fitlab-construction-v1:${build.id}${build.draftVersion?`:revision-${build.draftVersion}`:""}`;
  const key = workshopRecordKey(build, recordId);
  const initial = () => ({graph:validGraph(initialGraph)?clone(initialGraph):empty(compact), attemptId: `${key}:legacy`, undo:[] as Construction[], redo:[] as Construction[], caseIndex:Math.max(0, Math.min(build.cases.length - 1, initialCaseIndex)),
    results:{} as Record<number,boolean>, tested:{} as Record<number,Trace>, customData:null as Record<string,Data>|null,
    prediction:"", hintsShown:0, example:false, animate:true, zoom:compact?.75:1});
  function validGraph(raw: unknown): raw is Construction {
    return validConstructionForBuild(raw, build, TOOLS);
  }
  // Freeze the graph and its provenance together. The wrapper remounts when a
  // delayed seed first arrives; later source edits must not change this copy.
  const [seed] = useState(() => {
    const value = initial();
    const { attemptId: _attemptId, ...legacyCompatible } = value;
    void _attemptId;
    return { draft: legacyCompatible, hasGraph: validGraph(initialGraph), supported: initialSupported };
  });
  // Optional provenance stays outside the default schema so older saves remain valid.
  const saved = useLearnerRecord<Omit<ReturnType<typeof initial>, "attemptId"> & { attemptId?: string; carriedSupport?: boolean }>(key, () => seed.draft, raw => {
    const value = raw as ReturnType<typeof initial>;
    return !!value && validGraph(value.graph) && Array.isArray(value.undo) && value.undo.every(validGraph) && Array.isArray(value.redo) && value.redo.every(validGraph) && Number.isInteger(value.caseIndex) && value.caseIndex>=0 && value.caseIndex<build.cases.length;
  });
  const usesSeed = saved.value === seed.draft && seed.hasGraph;
  const carriedSupport = Boolean(saved.value.carriedSupport || (usesSeed && seed.supported));
  const saveDraft = saved.set;
  useEffect(() => {
    if (usesSeed) saveDraft(previous => previous === seed.draft ? { ...previous, carriedSupport: seed.supported } : previous);
  }, [usesSeed, seed, saveDraft]);
  const [graph,setGraph]=useLearnerField(saved, "graph");
  const savedUndo=useLearnerField(saved, "undo");
  const savedRedo=useLearnerField(saved, "redo");
  const localUndo=useState<Construction[]>([]);
  const localRedo=useState<Construction[]>([]);
  const [undo,setUndo]=sessionHistory?localUndo:savedUndo;
  const [redo,setRedo]=sessionHistory?localRedo:savedRedo;
  const [socket,setSocket]=useState<Socket|null>(null);
  const [wireEnd,setWireEnd]=useState<Point|null>(null);
  const [hoveredInput,setHoveredInput]=useState<Socket|null>(null);
  const [selected,setSelected]=useState<string|null>(null);
  const [selectedWire,setSelectedWire]=useState<Connection|null>(null);
  const [caseIndex,setCaseIndex]=useLearnerField(saved, "caseIndex");
  const [run,setRun]=useState<Run|null>(null);
  const [results,setResults]=useLearnerField(saved, "results");
  const [tested,setTested]=useLearnerField(saved, "tested");
  const [customData,setCustomData]=useLearnerField(saved, "customData");
  const [customValid,setCustomValid]=useState(true);
  const [inputRevision,setInputRevision]=useState(0);
  const [toolQuery,setToolQuery]=useState("");
  const [prediction,setPrediction]=useLearnerField(saved, "prediction");
  const [notice,setNotice]=useState("");
  const [hintsShown,setHintsShown]=useLearnerField(saved, "hintsShown");
  const [example,setExample]=useLearnerField(saved, "example");
  // During hydration the fallback can briefly precede an existing independent
  // draft. Announce seed guidance only after the guarded save accepts that seed.
  useEffect(() => { if (hintsShown > 0 || example || saved.value.carriedSupport) onAssistance?.(); }, [hintsShown, example, saved.value.carriedSupport, onAssistance]);
  const [animate,setAnimate]=useLearnerField(saved, "animate");
  const [zoom,setZoom]=useLearnerField(saved, "zoom");
  const [expanded,setExpanded]=useState(false);
  const [detailsOpen,setDetailsOpen]=useState(false);
  const detailsId=useId();
  const [toolsOpen,setToolsOpen]=useState(true);
  const [showTask,setShowTask]=useState(false);
  const [placing,setPlacing]=useState<string|null>(null);
  const [dragged,setDragged]=useState<{id:string;x:number;y:number}|null>(null);
  const [geometry,setGeometry]=useState<Record<string,NodeGeometry>>({});
  const [invalidSettings,setInvalidSettings]=useState<Record<string,boolean>>({});
  const [fieldRevision,setFieldRevision]=useState(0);
  const floor=useRef<HTMLDivElement>(null),viewport=useRef<HTMLDivElement>(null),nextId=useRef(0);
  const feedbackPanel=useRef<HTMLDivElement>(null);
  const editor=useRef<HTMLDivElement>(null);
  const expandButton=useRef<HTMLButtonElement>(null);
  const detailsButton=useRef<HTMLButtonElement>(null);
  const detailsPanel=useRef<HTMLDivElement>(null);
  const resultsPanel=useRef<HTMLDetailsElement>(null);
  const expandedHints=useRef<HTMLDetailsElement>(null);
  const inlineScroll=useRef({left:0,top:0});
  const pageScroll=useRef({left:0,top:0});
  const [viewportSize,setViewportSize]=useState({width:0,height:0});

  useEffect(()=>{
    const element=viewport.current;
    if(!element)return;
    const observer=new ResizeObserver(()=>setViewportSize({width:element.clientWidth,height:element.clientHeight}));
    observer.observe(element);
    return()=>observer.disconnect();
  },[]);

  useEffect(()=>{
    if(!expanded)return;
    const surface=editor.current,returnTo=expandButton.current,frame=viewport.current;
    const bodyOverflow=document.body.style.overflow;
    const pageOverflow=document.documentElement.style.overflow;
    document.body.style.overflow="hidden";
    document.documentElement.style.overflow="hidden";
    // Keep the floor mounted, including any number the learner is still typing.
    // Only the surrounding page becomes inert while this editor fills the view.
    const background:{element:HTMLElement;inert:boolean}[]=[];
    let branch:HTMLElement|null=surface;
    while(branch&&branch!==document.body){
      for(const sibling of Array.from(branch.parentElement?.children??[])){
        if(sibling!==branch&&sibling instanceof HTMLElement){background.push({element:sibling,inert:sibling.inert});sibling.inert=true;}
      }
      branch=branch.parentElement;
    }
    surface?.focus({preventScroll:true});
    return()=>{
      document.body.style.overflow=bodyOverflow;
      document.documentElement.style.overflow=pageOverflow;
      background.forEach(({element,inert})=>{element.inert=inert;});
      requestAnimationFrame(()=>{
        if(frame?.isConnected)frame.scrollTo(inlineScroll.current);
        if(returnTo?.isConnected){window.scrollTo(pageScroll.current);returnTo.focus({preventScroll:true});}
      });
    };
  },[expanded]);

  function toggleExpanded(){
    if(!expanded){
      inlineScroll.current={left:viewport.current?.scrollLeft??0,top:viewport.current?.scrollTop??0};
      pageScroll.current={left:window.scrollX,top:window.scrollY};
    }
    setDetailsOpen(false);
    setExpanded(!expanded);
  }
  function closeDetails(){setDetailsOpen(false);detailsButton.current?.focus({preventScroll:true});}
  function revealDetails(target:"feedback"|"hint"|"results"){
    setDetailsOpen(true);
    requestAnimationFrame(()=>{
      const panel=detailsPanel.current;
      if(panel){
        panel.focus({preventScroll:true});
        panel.scrollTo({top:target==="hint"?Math.max(0,(expandedHints.current?.offsetTop??0)-64):0});
        if(target==="results") focusResults();
      }
    });
  }
  function focusResults(){
    const panel=resultsPanel.current;
    if(!panel)return;
    panel.open=true;
    panel.querySelector("summary")?.focus({preventScroll:true});
    panel.scrollIntoView({block:"nearest"});
  }
  function showResults(){if(expanded)revealDetails("results");else focusResults();}

  const moving=useRef<{id:string;dx:number;dy:number;startX:number;startY:number}|null>(null);
  const wiring=useRef<{id:string;startX:number;startY:number;moved:boolean}|null>(null);
  const panning=useRef<{x:number;y:number;left:number;top:number}|null>(null);
  const busy=Boolean(run?.playing);
  const invalid=graph.pieces.some(piece=>(TOOLS[piece.tool]?.settings??[]).some(setting=>invalidSettings[`${piece.id}:${setting.key}`]));
  const trace=run?.traces[run.index];
  const step=trace?.steps[run?.step??-1];
  const sample=build.cases[run?.cases[run.index]??caseIndex];
  const data=customData??sample.data;
  const preview=useMemo(()=>invalid||!customValid?{signals:new Map<string,Trace["steps"][number]>(),issues:new Map<string,NonNullable<Trace["error"]>>()} : previewConstruction(graph,data,TOOLS),[graph,data,invalid,customValid]);
  const visible=invalid||!customValid?new Map<string,Trace["steps"][number]>():run?new Map(trace?.steps.slice(0,run.step+1).map(s=>[s.id,s])??[]):preview.signals;
  const selectedPiece=selectedWire?undefined:graph.pieces.find(p=>p.id===(selected??step?.id));
  const inspectedSignal=selectedPiece?visible.get(selectedPiece.id):step;
  const checkedResults=invalid?{}:results;
  const passed=Object.values(checkedResults).filter(Boolean).length;
  const failed=Object.keys(checkedResults).length-passed;
  const notRun=build.cases.length-passed-failed;
  const complete=passed===build.cases.length;
  const activeResult=customData||invalid||run&&!run.done?undefined:results[run?.cases[run.index]??caseIndex];
  const resultHeading=invalid?"Finish the input to test again":customData?"Your experiment is ungraded":run&&!run.done?"Following this example":complete?"All examples passed":failed?`${failed} ${failed===1?"example failed":"examples failed"}`:passed?"Test the remaining examples":"Ready to test";
  const choices=[...new Set([...Object.keys(build.sources).map(s=>`source:${s}`),...expressionTools(build.recipe).filter(s=>!s.startsWith("source:")),...(build.extras??[])])];
  const filteredChoices=choices.filter(key=>(key.startsWith("source:")?build.sources[key.slice(7)]:`${TOOLS[key].title} ${TOOLS[key].why}`).toLowerCase().includes(toolQuery.toLowerCase().trim()));
  const nodes=useMemo(()=>graph.pieces.map(p=>({...p,...(dragged?.id===p.id?dragged:{}),...(geometry[p.id]??{width:NODE_WIDTH,height:estimatedHeight(p,TOOLS),inputs:[]})})),[graph.pieces,dragged,geometry]);
  const width=Math.max(compact?1080:1340,expanded?Math.ceil(viewportSize.width/zoom):0,...nodes.map(p=>p.x+p.width+80));
  const height=Math.max(compact?580:740,expanded?Math.ceil(viewportSize.height/zoom):0,...nodes.map(p=>p.y+p.height+80));
  const paths=useMemo(()=>graph.connections.map(w=>wirePath(nodes.find(p=>p.id===w.from)!,nodes.find(p=>p.id===w.to)!,w.port,nodes)),[graph.connections,nodes]);
  const wireSource=socket?nodes.find(p=>p.id===socket.id):undefined;

  function fitConstruction(){
    const frame=viewport.current;
    if(!frame||!nodes.length)return;
    const left=Math.max(0,Math.min(...nodes.map(node=>node.x))-40);
    const top=Math.max(0,Math.min(...nodes.map(node=>node.y))-40);
    const right=Math.max(...nodes.map(node=>node.x+node.width))+48;
    const bottom=Math.max(...nodes.map(node=>node.y+node.height))+40;
    const scale=Math.min(1,(frame.clientWidth-16)/(right-left),(frame.clientHeight-16)/(bottom-top));
    setZoom(scale);
    requestAnimationFrame(()=>{
      if(!expanded)frame.scrollIntoView({block:"center",behavior:"instant"});
      frame.scrollTo({left:left*scale,top:top*scale});
    });
  }

  useEffect(()=>{
    const measure=()=>setGeometry(previous=>{
      const next={...previous};let changed=false;
      floor.current?.querySelectorAll<HTMLElement>("[data-piece]").forEach(element=>{
        const rect=element.getBoundingClientRect(),scale=rect.width/element.offsetWidth;
        if(!scale)return;
        const point=(port:Element):Point=>{const r=port.getBoundingClientRect();return {x:Math.round((r.left+r.width/2-rect.left)/scale*100)/100,y:Math.round((r.top+r.height/2-rect.top)/scale*100)/100};};
        const output=element.querySelector('[data-socket="output"]');
        const measured:NodeGeometry={width:element.offsetWidth,height:element.offsetHeight,inputs:[...element.querySelectorAll('[data-socket="input"]')].map(point),...(output?{output:point(output)}:{})};
        if(JSON.stringify(previous[element.dataset.piece!])!==JSON.stringify(measured)){next[element.dataset.piece!]=measured;changed=true;}
      });
      return changed?next:previous;
    });
    const observer=new ResizeObserver(measure);
    // Observe the rows too: two labels can change height without changing the
    // overall card height. Wires must follow the actual sockets in either case.
    floor.current?.querySelectorAll("[data-piece], [data-piece] button, [data-piece] input").forEach(node=>observer.observe(node));
    measure();
    return()=>observer.disconnect();
  },[graph.pieces,zoom]);

  useEffect(() => {
    if (account || recordId) return;
    try {
      const graph = JSON.parse(localStorage.getItem(storageKey) ?? "null");
      if (validGraph(graph)) migrateLearnerRecord(key, {...initial(), graph}, null);
    } catch { /* Legacy browser drafts are optional. */ }
    // This migration only seeds a missing guest record. Account data is separate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, key, account, recordId]);
  useEffect(() => {
    nextId.current = Math.max(nextId.current, 0, ...graph.pieces.map(piece => Number(piece.id.replace("piece-", "")) || 0));
  }, [graph]);

  function edit(next:Construction,message="",layoutOnly=false) {if(busy)return;setUndo(u=>[...u.slice(-39),clone(graph)]);setRedo([]);setGraph(next);setRun(null);if(!layoutOnly){setResults({});setTested({});onActivity?.();}setNotice(message);}
  function bringCalculation(item: NonNullable<BuildWorkshopProps["reusable"]>[number]) {
    if (busy || !validGraph(item.graph)) return;
    const incoming = item.graph.pieces.filter(piece => piece.tool !== "output");
    if (graph.pieces.length + incoming.length > 36) { setNotice("This calculation needs more space. Remove unused pieces before bringing it onto this floor."); return; }
    const ids = new Map(incoming.map(piece => [piece.id, `piece-${++nextId.current}`]));
    const next = {
      pieces: [...graph.pieces, ...incoming.map(piece => ({ ...piece, id: ids.get(piece.id)!, settings: { ...piece.settings } }))],
      connections: [...graph.connections, ...item.graph.connections.filter(wire => ids.has(wire.from) && ids.has(wire.to)).map(wire => ({ ...wire, from: ids.get(wire.from)!, to: ids.get(wire.to)! }))],
    };
    edit(arrangeConstruction(next, TOOLS), "Your earlier calculation is here with this problem's input labels. Its final output is unconnected so you can decide where it belongs. Undo removes the added pieces.");
    if (item.supported) saved.set(previous => ({ ...previous, carriedSupport: true }));
    onReuse?.(item.supported);
  }
  function restore(direction:"undo"|"redo") {
    const history=direction==="undo"?undo:redo;if(busy||!history.length)return;
    const next=history.at(-1)!;
    if(direction==="undo"){setUndo(u=>u.slice(0,-1));setRedo(r=>[...r.slice(-39),clone(graph)]);}
    else{setRedo(r=>r.slice(0,-1));setUndo(u=>[...u.slice(-39),clone(graph)]);}
    resetFields();setGraph(next);setRun(null);setResults({});setTested({});cancelWire();setSelected(null);setSelectedWire(null);
    onActivity?.();
    setNotice(direction==="undo"?"Undid that change. Redo brings it back.":"Restored that change.");
  }
  function resetExperiment() {setCustomData(null);setCustomValid(true);setRun(null);setInputRevision(n=>n+1);}
  function focusPiece(id:string) {
    requestAnimationFrame(()=>{
      const element=Array.from(floor.current?.querySelectorAll<HTMLElement>("[data-piece]")??[]).find(node=>node.dataset.piece===id);
      if(!element||!viewport.current)return;
      const box=element.getBoundingClientRect(),frame=viewport.current.getBoundingClientRect();
      if(box.left<frame.left+24||box.right>frame.right-24||box.top<frame.top+24||box.bottom>frame.bottom-24)
        viewport.current.scrollBy({left:box.left-frame.left-(frame.width-box.width)/2,top:box.top-frame.top-(frame.height-box.height)/2});
    });
  }
  function resetFields(){setInvalidSettings({});setFieldRevision(value=>value+1);}
  function freshAttempt() {
    if (busy) return;
    const attemptId = crypto.randomUUID();
    saved.set({ ...initial(), graph: empty(compact), attemptId, carriedSupport: false });
    resetFields(); cancelWire(); setRun(null); setSelected(null); setSelectedWire(null); setPlacing(null);
    setNotice("A fresh floor is ready. Your earlier successful attempts stay in your journey history. This attempt records its own hints.");
    onActivity?.(); onFreshAttempt?.(attemptId);
  }
  function cancelWire(){wiring.current=null;setSocket(null);setWireEnd(null);setHoveredInput(null);}
  function selectPiece(id:string){setSelected(id);setSelectedWire(null);}
  function removePiece(id:string){
    if(busy)return;
    if(id==="output"){setNotice("Result is the endpoint used by the tests. You can remove its incoming wire or move it to another position.");return;}
    edit({pieces:graph.pieces.filter(p=>p.id!==id),connections:graph.connections.filter(w=>w.from!==id&&w.to!==id)},"Removed the piece and its connections. Undo brings them back.");
    setSelected(null);setSelectedWire(null);cancelWire();viewport.current?.focus({preventScroll:true});
  }
  function removeSelection(){
    if(busy)return;
    if(selectedWire){edit({...graph,connections:graph.connections.filter(w=>!sameWire(selectedWire,w))},"Connection removed. Undo brings it back.");setSelectedWire(null);cancelWire();viewport.current?.focus({preventScroll:true});}
    else if(selected)removePiece(selected);
  }
  function coordinates(e:{clientX:number;clientY:number}) {const rect=floor.current!.getBoundingClientRect();return {x:(e.clientX-rect.left)/zoom,y:(e.clientY-rect.top)/zoom};}
  function floorPosition(x:number,y:number) {return {x:Math.max(32,Math.min(5000,x)),y:Math.max(50,Math.min(5000,y))};}
  function occupied(id:string|undefined,x:number,y:number,height:number) {
    return nodes.some(p=>p.id!==id&&x<p.x+p.width+40&&x+NODE_WIDTH+40>p.x&&y<p.y+p.height+40&&y+height+40>p.y);
  }
  function add(tool:string,x?:number,y?:number,settings?:Piece["settings"]) {
    if(busy)return;
    if(graph.pieces.length>=36){setNotice("There are 35 tool spaces on this floor. Remove an unused piece before adding another.");return;}
    let spot={x:x??32,y:y??70};
    const reservedHeight=estimatedHeight({tool},TOOLS);
    if(x===undefined) {let free=false;for(let row=0;row<60&&!free;row++)for(let col=0;col<3&&!free;col++){const candidate={x:32+col*(NODE_WIDTH+96),y:70+row*96};if(!occupied(undefined,candidate.x,candidate.y,reservedHeight)){spot=candidate;free=true;}}}
    spot=floorPosition(spot.x,spot.y);
    const piece={id:`piece-${++nextId.current}`,tool,...spot,settings:settings?{...settings}:Object.fromEntries((TOOLS[tool]?.settings??[]).map(s=>[s.key,s.initial]))};
    edit({...graph,pieces:[...graph.pieces,piece]},`${title(piece,build)} is on the floor. Select its name to inspect what it needs.`);selectPiece(piece.id);cancelWire();setPlacing(null);focusPiece(piece.id);
  }
  function armOutput(id:string){setSocket({id,port:0,output:true});setWireEnd(null);setHoveredInput(null);setPlacing(null);selectPiece(id);setNotice("Click an input, or drag the output arrow onto it. Escape cancels the connection.");}
  function connectInput(from:string,to:Socket){
    if(from===to.id){setNotice("A machine cannot supply its own input. Choose an input on another piece.");return;}
    edit(plug(graph,{from,to:to.id,port:to.port}),"Connected. The values update as you build. Select a piece to look at its inputs.");cancelWire();selectPiece(to.id);
  }
  function choosePort(next:Socket) {
    if(busy)return;setPlacing(null);
    if(next.output){armOutput(next.id);return;}
    if(!socket){setNotice("Start at the round output arrow, then click or drag to the input that needs its value.");return;}
    connectInput(socket.id,next);
  }
  function inputUnderPointer(e:{clientX:number;clientY:number},from:string):Socket|null {
    const button=document.elementFromPoint(e.clientX,e.clientY)?.closest<HTMLButtonElement>("button[data-input-piece]");
    return button&&floor.current?.contains(button)&&!button.disabled&&button.dataset.inputPiece!==from?{id:button.dataset.inputPiece!,port:Number(button.dataset.inputPort),output:false}:null;
  }
  function startWire(e:PointerEvent<HTMLButtonElement>,id:string){
    if(busy||e.button!==0)return;
    e.preventDefault();e.stopPropagation();e.currentTarget.focus({preventScroll:true});e.currentTarget.setPointerCapture(e.pointerId);
    armOutput(id);wiring.current={id,startX:e.clientX,startY:e.clientY,moved:false};
  }
  function movePointer(e:PointerEvent){
    if(panning.current&&viewport.current){const p=panning.current;viewport.current.scrollTo({left:p.left+p.x-e.clientX,top:p.top+p.y-e.clientY});return;}
    if(moving.current){const p=coordinates(e);setDragged({id:moving.current.id,...floorPosition(p.x-moving.current.dx,p.y-moving.current.dy)});return;}
    const from=wiring.current?.id??socket?.id;if(!from)return;
    if(wiring.current&&Math.hypot(e.clientX-wiring.current.startX,e.clientY-wiring.current.startY)>5)wiring.current.moved=true;
    const target=inputUnderPointer(e,from);setHoveredInput(target);
    setWireEnd(target?inputPoint(nodes.find(p=>p.id===target.id)!,target.port):coordinates(e));
  }
  function finishPointer(e:PointerEvent){
    if(panning.current){panning.current=null;return;}
    const gesture=wiring.current;
    if(!gesture){finishDrag(e);return;}
    wiring.current=null;
    if(gesture.moved){const target=inputUnderPointer(e,gesture.id);if(target)connectInput(gesture.id,target);else{cancelWire();setNotice("No connection was added. Start at an output arrow and release over an input.");}}
  }
  function advance() {
    if(!run||run.done)return;
    const current=run.traces[run.index];
    if(run.step+1<current.steps.length){setRun({...run,step:run.step+1});return;}
    const index=run.cases[run.index];setCaseIndex(index);
    if(!run.experiment){setResults(r=>({...r,[index]:!current.error&&same(current.output,build.cases[index].expected)}));setTested(t=>({...t,[index]:current}));}
    if(current.error){setNotice(current.error.message);setSelected(current.error.id);focusPiece(current.error.id);setRun({...run,playing:false,done:true});return;}
    if(run.index+1<run.traces.length)setRun({...run,index:run.index+1,step:-1});
    else setRun({...run,done:true,playing:false});
  }
  useEffect(()=>{if(!run?.playing||run.done)return;const timer=setTimeout(advance,animate&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches?500:20);return()=>clearTimeout(timer);
    // Each tick uses this run and the graph from which it was calculated.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[run,animate]);
  function start(all:boolean,playing:boolean) {
    setShowTask(false);setNotice("");cancelWire();setSelected(null);setSelectedWire(null);setPlacing(null);
    if(all){
      resetExperiment();
      const {traces,outcomes,outcome}=testConstruction(build,graph,TOOLS,{usedSolution:example,usedHints:guide||hintsShown>0||carriedSupport});
      setResults(Object.fromEntries(outcomes.map((result,i)=>[i,result])));setTested(Object.fromEntries(traces.map((result,i)=>[i,result])));
      // Keep the case being discussed on a journey stage after successful checks.
      // A failure still takes the learner to the first example needing attention.
      const firstFailure=outcomes.indexOf(false),index=firstFailure<0?(compact?caseIndex:traces.length-1):firstFailure;
      setCaseIndex(index);setRun({traces:[traces[index]],cases:[index],index:0,step:traces[index].steps.length-1,playing:false,done:true});
      if(traces[index].error){setSelected(traces[index].error.id);focusPiece(traces[index].error.id);}
      onOutcome?.({ ...outcome, attemptId: saved.value.attemptId ?? `${key}:legacy` });
    }else{
      setRun({cases:[caseIndex],traces:[evaluate(graph,data,TOOLS)],index:0,step:playing?-1:0,playing,done:false,experiment:Boolean(customData)});
    }
  }
  function startDrag(e:PointerEvent<HTMLButtonElement>,p:Piece){if(busy||e.button!==0)return;e.preventDefault();e.currentTarget.focus({preventScroll:true});cancelWire();const point=coordinates(e);moving.current={id:p.id,dx:point.x-p.x,dy:point.y-p.y,startX:e.clientX,startY:e.clientY};e.currentTarget.setPointerCapture(e.pointerId);selectPiece(p.id);}
  function movePiece(id:string,x:number,y:number) {
    const position=floorPosition(x,y),piece=graph.pieces.find(p=>p.id===id);
    if(!piece||piece.x===position.x&&piece.y===position.y)return;
    edit({...graph,pieces:graph.pieces.map(p=>p.id===id?{...p,...position}:p)},"",true);
  }
  function finishDrag(e:PointerEvent){if(!moving.current)return;const m=moving.current;if(Math.hypot(e.clientX-m.startX,e.clientY-m.startY)>5){const q=coordinates(e);movePiece(m.id,q.x-m.dx,q.y-m.dy);}moving.current=null;setDragged(null);}
  function tutorialTip() {
    const sensor=graph.pieces.find(p=>p.tool==="source:reading"),multiply=graph.pieces.find(p=>p.tool==="multiply"),constant=graph.pieces.find(p=>p.tool==="constant");
    if(!sensor)return "First, choose Sensor reading from the shelf. It brings the example's number onto the floor. Click to place it, or drag it to a particular spot.";
    if(!multiply)return "The source gives us a reading, but does not change it. Now choose Multiply from the shelf. This piece can make the reading twice as large.";
    if(!constant)return "Multiply needs two inputs: the reading and the amount to multiply it by. Choose Set a constant from the shelf to supply that second number.";
    if(constant.settings.value!==2)return "Find the Number setting on Set a constant and enter 2. This value stays the same even when the sensor reading changes.";
    const connected=(from:string,to:string,port:number)=>graph.connections.some(w=>w.from===from&&w.to===to&&w.port===port);
    if(!connected(sensor.id,multiply.id,0))return "Click the round output on Sensor reading, then the square Value input on Multiply. That wire will carry each new reading into the calculation.";
    if(!connected(constant.id,multiply.id,1))return "Now connect Set a constant's round output to Multiply's square Multiplier input. The two inputs have different jobs, so their labels help us keep track.";
    if(!connected(multiply.id,"output",0))return "Where should the answer go? Connect Multiply's output to the Result input. You can move a piece by dragging its name if you need more room.";
    return "Run this example and watch the values move. Step through lets you follow one operation at a time. Select a piece's name to inspect its inputs, then test all examples to check that the rule still works when the reading changes.";
  }
  const hints=constructionHints(build);
  const failedRunIndex=run?.done&&!run.experiment?run.traces.findIndex((candidate,i)=>i<=run.index&&!candidate.error&&!same(candidate.output,build.cases[run.cases[i]].expected)):-1;
  const feedback=run?.done&&failedRunIndex!==undefined&&failedRunIndex>=0?resultFeedback(build,graph,run.traces[failedRunIndex],run.cases[failedRunIndex]):undefined;
  const mismatch=feedback&&run&&failedRunIndex!==undefined?`Example: ${build.cases[run.cases[failedRunIndex]].name}. ${feedback}`:undefined;
  const inspectedIssue=selectedPiece?preview.issues.get(selectedPiece.id):undefined;
  const coach=trace?.error?.message||(customData?"What do you expect to happen when this input changes? Try it, then follow the values through the pieces. These are your own inputs; Test all examples still checks the lesson's original data.":complete?build.why:mismatch|| (guide?tutorialTip():notice||(socket?"Which operation needs this value next? Choose its input socket.":openingCoach??"The floor is yours. Start by deciding which information the answer depends on, then choose the operations needed to turn it into that answer.")));
  const hasFeedback=Boolean(guide||trace?.error||customData||complete||mismatch||notice||socket);
  const zoomControl=<label className={styles.zoomControl}>Zoom <select aria-label="Construction zoom" value={zoom} onChange={e=>setZoom(Number(e.target.value))} className="min-h-10 rounded border border-line bg-surface px-2">{![.25,.5,.75,1].includes(zoom)&&<option value={zoom}>{Math.round(zoom*100)}%</option>}{[.25,.5,.75,1].map(z=><option key={z} value={z}>{z*100}%</option>)}</select></label>;

  return <div data-testid="construction-workshop" className={`${styles.workshop} ${compact?styles.compact:""}`} onKeyDown={e=>{
    if(e.key.startsWith("Arrow"))e.stopPropagation();
    const editing=(e.target as Element).closest("input,textarea,select,[contenteditable]:not([contenteditable=false])");
    if(!editing&&(e.ctrlKey||e.metaKey)&&["z","y"].includes(e.key.toLowerCase())){e.preventDefault();restore(e.key.toLowerCase()==="y"||e.shiftKey?"redo":"undo");}
    if(!editing&&!e.defaultPrevented&&["Delete","Backspace"].includes(e.key)&&(selected||selectedWire)){e.preventDefault();e.stopPropagation();removeSelection();}
    if(e.key==="Escape"){e.preventDefault();e.stopPropagation();if(socket)cancelWire();else if(placing)setPlacing(null);else if(expanded&&detailsOpen)closeDetails();else setExpanded(false);moving.current=null;setDragged(null);}
    if(expanded&&e.key==="Tab"){
      const focusable=Array.from(editor.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], summary, [tabindex="0"]')??[]).filter(element=>element.getClientRects().length&&!element.closest("[hidden], [inert]"));
      const first=focusable[0],last=focusable.at(-1);
      if(e.shiftKey&&(document.activeElement===first||document.activeElement===editor.current)){e.preventDefault();last?.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
    }
  }}>
    {!embeddedBrief&&<div className={`${styles.brief} ${expanded?styles.coveredBrief:""}`} aria-hidden={expanded||undefined}>
      {!compact&&!continuation&&<h3 className="mb-3 text-xl font-semibold">Your construction challenge</h3>}
      <div aria-live="polite"><BotieSays className={styles.compactCoach} mood={busy?"thinking":complete?"happy":trace?.error||failed?"curious":"ready"}>{hasFeedback&&!showTask?coach:build.challenge}</BotieSays></div>
      {hasFeedback&&<button className="ml-[60px] min-h-8 text-xs text-accent underline underline-offset-4" onClick={()=>setShowTask(!showTask)}>{showTask?"Back to Botie's feedback":"Read the challenge"}</button>}
    </div>}
    <div ref={editor} className={`${styles.editor} ${expanded?styles.expanded:""}`} role={expanded?"dialog":undefined} aria-modal={expanded||undefined} aria-label={expanded?"Expanded workshop":undefined} tabIndex={expanded?-1:undefined}>
      <div className={`${styles.toolbar} flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface p-3`}><div className="flex flex-wrap gap-2">
        {compact&&<button className={primary} disabled={busy||invalid} onClick={()=>start(true,true)}>Test all examples</button>}
        <button className={compact?button:primary} disabled={busy||invalid||!customValid} onClick={()=>run&&!run.done?setRun({...run,playing:true}):start(false,true)}>{run&&!run.done&&!busy?"Resume trace":customData?"Trace these inputs":"Run this example"}</button>
        <button className={button} disabled={(invalid||!customValid)&&!busy} onClick={()=>{if(busy)setRun(r=>r&&({...r,playing:false}));else if(run&&!run.done)advance();else start(false,false);}}>{busy?"Pause":"Step through"}</button>
        {!compact&&<button className={button} disabled={busy||invalid} onClick={()=>start(true,true)}>Test all examples</button>}
        <button className={button} disabled={busy||!undo.length} onClick={()=>restore("undo")}>Undo</button>
        {run&&<button className={button} onClick={()=>setRun(null)}>{busy?"Stop":"Back to live values"}</button>}
      </div><button ref={expandButton} className={button} onClick={toggleExpanded}>{expanded?"Return to lesson":"Expand floor"}</button></div>
      <div className={styles.testSummary} data-result={customData||invalid||run&&!run.done?"pending":failed?"fail":complete?"pass":"pending"} data-testid="workshop-test-summary">
        <div role="status" aria-atomic="true" className={styles.testStatus}>
          <strong className={styles.testHeading}>{resultHeading}</strong>
          <div>{customData&&<span className="mr-2 text-xs text-muted">Lesson examples:</span>}<span data-testid="construction-counter" className={styles.testCounts}><WorkshopTestBadge result={true} muted={!passed}>{passed} passed</WorkshopTestBadge>{" · "}<WorkshopTestBadge result={false} muted={!failed}>{failed} failed</WorkshopTestBadge>{" · "}<WorkshopTestBadge>{notRun} not run</WorkshopTestBadge></span></div>
        </div>
        <div className={styles.resultActions}>
          {passed+failed>0&&<button className={button} onClick={showResults}>{failed?"See failed examples":"See results"}</button>}
          {hasFeedback&&(expanded||embeddedBrief)&&<button className="min-h-10 text-left text-xs text-accent underline underline-offset-4" onClick={()=>{if(expanded){setShowTask(false);revealDetails("feedback");}else feedbackPanel.current?.scrollIntoView({block:"nearest"});}}>Read Botie&apos;s feedback</button>}
        </div>
      </div>
      {!expanded&&!guide&&hintsShown>0&&<details className={styles.hints} open><summary>Hints from Botie</summary><BotieSays className={styles.compactCoach} mood="thinking"><ol aria-label="Workshop hints from Botie" className="list-decimal space-y-3 pl-5">{hints.slice(0,hintsShown).map(hint=><li key={hint}>{hint}</li>)}</ol></BotieSays></details>}
      <div className={styles.floorActions}><button type="button" aria-expanded={toolsOpen} className="min-h-10 text-sm text-accent" onClick={()=>setToolsOpen(!toolsOpen)}>{toolsOpen?"Hide tools":"Show tools"}</button>{expanded&&<><button className="min-h-10 text-sm text-accent" onClick={fitConstruction}>Fit construction</button>{zoomControl}</>}{!guide&&hintsShown<hints.length&&<button className="min-h-10 text-sm text-accent" onClick={()=>{setHintsShown(n=>n+1);if(expanded)revealDetails("hint");}}>{hintsShown?"Ask Botie for another hint":"Ask Botie for a hint"}</button>}{expanded&&<button ref={detailsButton} aria-expanded={detailsOpen} aria-controls={detailsId} className="min-h-10 text-sm font-semibold text-accent" onClick={()=>detailsOpen?closeDetails():revealDetails("feedback")}>Workshop details</button>}</div>
      {invalid&&<p role="status" className="border-b border-line px-4 py-2 text-sm text-accent">Finish entering the highlighted number before running the construction.</p>}
      <div className={styles.floorRegion}>
      <div className={`${styles.workspace} ${!toolsOpen?styles.floorOnly:""}`}>
        {toolsOpen&&<aside className={styles.shelf} aria-label="Construction toolbox"><h4 className="mb-2 text-sm font-semibold">Choose a tool</h4><p className="mb-3 text-xs leading-5 text-muted">Click to add, or drag to any spot.</p><input className={styles.toolSearch} type="search" aria-label="Find a workshop tool" placeholder="Find a tool…" value={toolQuery} onChange={e=>setToolQuery(e.target.value)}/>{[true,false].map(source=><div key={String(source)}><h5 className={styles.shelfHeading}>{source?"Data for this problem":"Operations"}</h5>{filteredChoices.filter(key=>key.startsWith("source:")===source).map(key=><button key={key} draggable={!busy} disabled={busy} title={source?"Brings this example's data onto the floor.":TOOLS[key].why} onDragStart={()=>setPlacing(key)} onDragEnd={()=>setPlacing(null)} onClick={()=>add(key)} className={`${styles.tool} ${source?styles.sourceTool:""}`}><span aria-hidden="true">{source?"▣":"+"}</span>{source?build.sources[key.slice(7)]:TOOLS[key].title}</button>)}</div>)}{!filteredChoices.length&&<p className="text-xs text-muted">No matching tools. Try another word.</p>}</aside>}
        <div ref={viewport} className={styles.viewport} aria-label="Construction floor" tabIndex={0}>
          <div style={{width:width*zoom,height:height*zoom,overflow:"hidden"}}><div ref={floor} data-testid="construction-floor" className={styles.floor} style={{width,height,transform:`scale(${zoom})`,transformOrigin:"top left"}} onPointerDown={e=>{if(e.button===0&&e.target===e.currentTarget&&!socket&&viewport.current){panning.current={x:e.clientX,y:e.clientY,left:viewport.current.scrollLeft,top:viewport.current.scrollTop};e.currentTarget.setPointerCapture(e.pointerId);}}} onPointerMove={movePointer} onPointerUp={finishPointer} onPointerCancel={()=>{panning.current=null;moving.current=null;setDragged(null);cancelWire();}} onClick={e=>{if(e.target===e.currentTarget||(e.target as Element).tagName==="svg"){cancelWire();setSelected(null);setSelectedWire(null);viewport.current?.focus({preventScroll:true});}}} onDragOver={e=>{if(placing)e.preventDefault();}} onDrop={e=>{e.preventDefault();if(placing){const p=coordinates(e);add(placing,Math.max(32,p.x-NODE_WIDTH/2),Math.max(50,p.y-50));}}}>
            <p className={styles.floorHint}>{graph.pieces.length===1?"An empty floor. Start with the information your machine needs.":`${customData?"Your experiment":sample.name} · drag empty space to move around`}</p>
            <svg className={styles.wires} width={width} height={height} aria-label="Your connections">
              {graph.connections.map((w,i)=>{
                const a=graph.pieces.find(p=>p.id===w.from)!,b=graph.pieces.find(p=>p.id===w.to)!,d=paths[i];
                const chosen=sameWire(selectedWire,w);
                const select=()=>{if(!busy){cancelWire();setSelected(null);setSelectedWire(w);setNotice("Connection selected. Press Delete to remove it, or select a piece to inspect that instead.");}};
                return <g key={`${w.to}-${w.port}`}>
                  <path d={d} data-testid="connection-path" data-from={w.from} data-to={w.to} data-port={w.port} className={`${styles.wire} ${visible.has(w.from)?styles.live:""} ${chosen?styles.selectedWire:""}`}/>
                  <path d={d} className={styles.wireHit} role="button" tabIndex={busy?-1:0} aria-pressed={chosen} aria-label={`Select connection ${i+1}: ${title(a,build)} to ${title(b,build)}`} onFocus={select} onClick={e=>{e.stopPropagation();select();}} onKeyDown={e=>{if(["Enter"," "].includes(e.key)){e.preventDefault();select();}}}/>
                  {step?.id===w.to&&animate&&<circle r="5" className={styles.pulse}><animateMotion dur="500ms" path={d}/></circle>}
                </g>;
              })}
              {wireSource&&wireEnd&&<path data-testid="connection-preview" d={looseWire(outputPoint(wireSource),wireEnd)} className={styles.wirePreview}/>}
            </svg>
            {graph.pieces.map(piece=>{
              const signal=visible.get(piece.id),source=piece.tool.startsWith("source:");
              const labels=inputs(piece),connections=labels.map((_,port)=>{
                const wire=graph.connections.find(w=>w.to===piece.id&&w.port===port);
                const from=wire&&graph.pieces.find(p=>p.id===wire.from);
                return from?title(from,build):undefined;
              });
              return <WorkshopPiece key={`${piece.id}:${fieldRevision}`} piece={{...piece,...(dragged?.id===piece.id?dragged:{})}} name={title(piece,build)} labels={labels} connections={connections}
                testResult={piece.tool==="output"?activeResult:undefined}
                settings={TOOLS[piece.tool]?.settings??[]} value={!customValid||invalid?undefined:signal?signal.output:source?data[piece.tool.slice(7)]:piece.tool==="constant"?piece.settings.value:undefined} hasSignal={Boolean(signal)}
                busy={busy} selected={selected===piece.id} active={step?.id===piece.id} error={trace?.error?.id===piece.id||!run&&preview.issues.get(piece.id)?.id===piece.id&&preview.issues.get(piece.id)?.port===undefined} missingPort={trace?.error?.id===piece.id?trace.error.port:undefined}
                armed={socket?.id===piece.id&&socket.output===true} connecting={Boolean(socket&&socket.id!==piece.id)} targetPort={hoveredInput?.id===piece.id?hoveredInput.port:undefined}
                onSelect={()=>selectPiece(piece.id)} onBodySelect={()=>{cancelWire();selectPiece(piece.id);viewport.current?.focus({preventScroll:true});}} onMove={e=>startDrag(e,piece)} onMoveKey={e=>{
                  const delta=({ArrowLeft:[-24,0],ArrowRight:[24,0],ArrowUp:[0,-24],ArrowDown:[0,24]} as Record<string,number[]>)[e.key];
                  if(delta&&!busy){e.preventDefault();movePiece(piece.id,piece.x+delta[0],piece.y+delta[1]);}
                }} onOutput={e=>startWire(e,piece.id)} onOutputKey={()=>choosePort({id:piece.id,port:0,output:true})}
                onInput={port=>choosePort({id:piece.id,port,output:false})}
                onSetting={(key,value)=>edit({...graph,pieces:graph.pieces.map(p=>p.id===piece.id?{...p,settings:{...p.settings,[key]:value}}:p)})}
                onValidity={(key,valid)=>setInvalidSettings(current=>({...current,[`${piece.id}:${key}`]:!valid}))}/>;
            })}
          </div></div>
        </div>
      </div>
      {hasFeedback&&embeddedBrief&&!expanded&&<div ref={feedbackPanel} aria-live="polite" className={styles.feedback}><BotieSays className={styles.compactCoach} mood={busy?"thinking":complete?"happy":trace?.error||failed?"curious":"ready"}>{coach}</BotieSays></div>}
      <div ref={detailsPanel} id={detailsId} tabIndex={expanded?-1:undefined} className={expanded?styles.detailsDrawer:undefined} role={expanded?"complementary":undefined} aria-label={expanded?"Workshop details":undefined} hidden={expanded&&!detailsOpen}>
      {expanded&&<><div className={styles.drawerHeader}><h3>Workshop details</h3><button className="min-h-11 text-sm text-accent" onClick={closeDetails}>Close details</button></div><div className={styles.expandedBrief} aria-live="polite"><BotieSays className={styles.compactCoach} mood={busy?"thinking":complete?"happy":"ready"}>{hasFeedback&&!showTask?coach:build.challenge}</BotieSays>{hasFeedback&&<button className="ml-[60px] min-h-8 text-xs text-accent underline underline-offset-4" onClick={()=>setShowTask(!showTask)}>{showTask?"Back to Botie's feedback":"Read the challenge"}</button>}</div></>}
      {expanded&&!guide&&hintsShown>0&&<details ref={expandedHints} className={styles.hints} open><summary>Hints from Botie</summary><BotieSays className={styles.compactCoach} mood="thinking"><ol aria-label="Workshop hints from Botie" className="list-decimal space-y-3 pl-5">{hints.slice(0,hintsShown).map(hint=><li key={hint}>{hint}</li>)}</ol></BotieSays></details>}
      <details className={styles.controls}>
      <summary>{compact?"Examples, experiments and workspace controls":"Workspace controls"}</summary>
      <div className={styles.liveBar}>
        <span className={styles.modeLabel}>{customData?"Your experiment":run&&!run.done?"Following a signal":run?"Test result":"Live values"}</span>
        <label>Example <select aria-label="Active workshop example" disabled={busy} value={caseIndex} onChange={e=>{resetExperiment();setCaseIndex(Number(e.target.value));}}>{build.cases.map((item,i)=><option key={i} value={i}>{item.name}</option>)}</select></label>
        <p>{run?"Return to live values to see changes as you build.":"Connect a tool's inputs to see what it produces. You can try a branch before connecting it to Result."}</p>
      </div>
      <details className={styles.experiment}>
        <summary>Try your own inputs</summary>
        <p className="my-3 text-sm leading-6 text-muted">{experimentPrompt(build)}</p>
        {customData?<>
          <label className="my-3 block text-sm">What do you think will happen? <span className="text-muted">(Optional)</span><textarea aria-label="My prediction" className={styles.prediction} rows={2} value={prediction} onChange={e=>setPrediction(e.target.value)} placeholder="Write a prediction to compare with the result."/></label>
          <WorkshopInputs key={inputRevision} sources={build.sources} data={customData} disabled={busy} onChange={next=>{setCustomData(next);setRun(null);}} onValidity={setCustomValid}/>
          {customValid&&!invalid&&<div className={styles.experimentResult} aria-label="Experiment result"><p className="mb-2 text-sm font-semibold">Your construction produces</p>{preview.signals.has("output")?<WorkshopValue value={preview.signals.get("output")!.output}/>:<p className="text-sm text-muted">{preview.issues.get("output")?.message??"Connect your construction to Result to see the answer."}</p>}<p className="mt-2 text-xs text-muted">Compare this with your prediction. These inputs are not graded. Test all examples checks the original lesson data.</p></div>}
          {!customValid&&<p role="status" className="my-3 text-sm text-accent">Finish the highlighted input to update the live values. This experiment has not been graded.</p>}
          <div className="mt-3 flex flex-wrap gap-2"><button className={button} disabled={busy} onClick={()=>{setCustomData(structuredClone(sample.data));setCustomValid(true);setInputRevision(n=>n+1);setRun(null);}}>Reset experiment</button><button className={button} disabled={busy} onClick={resetExperiment}>Back to lesson examples</button></div>
        </>:<button className={button} disabled={busy} onClick={()=>{setCustomData(structuredClone(sample.data));setCustomValid(true);setRun(null);setInputRevision(n=>n+1);}}>Experiment with these inputs</button>}
      </details>
      <div className="flex flex-wrap items-center gap-3 border-b border-line bg-raised px-3 py-2 text-xs"><label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={animate} onChange={e=>setAnimate(e.target.checked)}/>Animate signals</label><button className={button} disabled={busy||!redo.length} onClick={()=>restore("redo")}>Redo</button><button className={button} disabled={busy} onClick={()=>{resetFields();edit(empty(compact),"The floor is clear. Undo can restore your construction.");setSelected(null);setSelectedWire(null);cancelWire();}}>Clear floor</button><button className={button} disabled={busy} onClick={()=>{edit(arrangeConstruction(graph,TOOLS,Object.fromEntries(nodes.map(p=>[p.id,p.height]))),"The pieces now have room between them. Undo restores your arrangement.",true);cancelWire();viewport.current?.scrollTo({left:0,top:0});}}>Arrange pieces</button>{!expanded&&<><button className={button} onClick={fitConstruction}>Fit construction</button>{zoomControl}</>}<span>Start at an output arrow, then click or drag to an input. Drag empty space to pan. Delete removes a selection. Ctrl/Cmd+Z undoes a change.</span></div>
      </details>
      {(selectedPiece||selectedWire||inspectedSignal)&&<div className="border-t border-line bg-surface p-4" aria-label="Construction inspector"><div className="flex flex-wrap justify-between gap-3"><h4 className="text-sm font-semibold">{selectedWire?"Selected connection":selectedPiece?title(selectedPiece,build):"Look inside a machine"}</h4>{selectedWire&&<button disabled={busy} className="text-sm text-accent underline" onClick={removeSelection}>Remove this connection</button>}{selectedPiece&&selectedPiece.id!=="output"&&<div className="flex flex-wrap gap-4"><button disabled={busy||invalid} className="text-sm text-accent underline" onClick={()=>add(selectedPiece.tool,undefined,undefined,selectedPiece.settings)}>Duplicate this piece</button><button disabled={busy} className="text-sm text-accent underline" onClick={()=>removePiece(selectedPiece.id)}>Remove this piece</button></div>}</div><p className="mt-2 text-xs leading-6 text-muted">{selectedWire?"This wire carries one piece's output into another piece's input. Press Delete or use Remove this connection. Undo restores it.":selectedPiece?selectedPiece.tool==="output"?"The tests compare the arriving value with the requested result for this example.":selectedPiece.tool.startsWith("source:")?"This source reads the selected example. The same connection will carry a different value when you select another example.":TOOLS[selectedPiece.tool].why:"Select a machine's name to see its purpose. As soon as its inputs are ready, you can inspect the calculation here."}</p>{inspectedSignal&&<dl className="mt-3 grid max-h-60 gap-3 overflow-auto sm:grid-cols-2">{inspectedSignal.inputs.map((value,i)=><div key={i} className="min-w-0"><dt className="mb-2 text-xs text-muted">{selectedPiece?inputs(selectedPiece)[i]:`Input ${i+1}`}</dt><dd><WorkshopValue value={value}/></dd></div>)}<div className="min-w-0"><dt className="mb-2 text-xs text-accent">Output</dt><dd><WorkshopValue value={inspectedSignal.output}/></dd></div></dl>}{(trace?.error||!run&&inspectedIssue)&&<p role="status" className="mt-2 text-sm text-accent">{(trace?.error??inspectedIssue)?.message}</p>}</div>}
      {selectedPiece?.tool==="matvec"&&inspectedSignal&&<div className="min-w-0 border-t border-line p-4"><MatrixVectorCalculation key={selectedPiece.id} matrix={inspectedSignal.inputs[0] as number[][]} vector={inspectedSignal.inputs[1] as number[]} purchases={build.id==="linear-algebra"}/></div>}
    {(!embeddedBrief||expanded)&&<details className="m-4 rounded-xl border border-line p-4"><summary className="cursor-pointer text-sm font-semibold">Context for this challenge</summary><p className="my-3 text-sm leading-7">{build.challenge}</p><p className="my-3 text-sm leading-7 text-muted" data-testid="construction-context">{build.problem}</p>{openingCoach&&openingCoach!==build.challenge&&<p className="mb-3 text-sm leading-7">{openingCoach}</p>}{briefing}</details>}
    <details ref={resultsPanel} className="m-4 rounded-xl border border-line bg-surface p-4" open={failed>0}>
      <summary className="cursor-pointer text-sm font-semibold">Examples and results</summary>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{build.cases.map((sample,i)=><div key={sample.name}
        className={styles.exampleResult} data-testid="workshop-example-result"
        data-result={checkedResults[i]===undefined?"pending":checkedResults[i]?"pass":"fail"}>
        <button disabled={busy} aria-pressed={(run?.cases[run.index]??caseIndex)===i} aria-label={sample.name} className={styles.exampleResultButton}
          onClick={()=>{
            resetExperiment();setCaseIndex(i);
            const result=tested[i];
            if(result){
              setRun({traces:[result],cases:[i],index:0,step:result.steps.length-1,playing:false,done:true});
              if(result.error){setSelected(result.error.id);focusPiece(result.error.id);}
            }
          }}>
          <span>{sample.name}</span><WorkshopTestBadge result={checkedResults[i]}/>
          {(run?.cases[run.index]??caseIndex)===i&&<span className="text-xs font-normal text-muted">Shown on the floor</span>}
        </button>
        <dl className="mt-3 space-y-2 text-xs">
          {Object.entries(sample.data).map(([key,value])=><div key={key}><dt className="text-muted">{build.sources[key]}</dt><dd className="mt-1"><WorkshopValue value={value}/></dd></div>)}
          {(!withholdExpectedUntilTest||tested[i])&&<div><dt className="font-semibold">Required result</dt><dd className="mt-1"><WorkshopValue value={sample.expected}/></dd></div>}
          {tested[i]&&<div><dt className="font-semibold">Your construction produced</dt><dd className="mt-1">{tested[i].error?<p className="leading-5">{tested[i].error?.message}</p>:<WorkshopValue value={tested[i].output!}/>}</dd></div>}
        </dl>
      </div>)}</div>
    </details>
    </div>
    </div>
    </div>
    {!!reusable?.length&&<details className="mt-4 rounded-xl border border-line p-4"><summary className="cursor-pointer text-sm font-semibold">Use an earlier construction</summary><p className="my-3 text-sm text-muted">Bring a calculation you built earlier onto this floor. Its inputs change to match this problem. Your current pieces stay in place.</p><div className="flex flex-wrap gap-3">{reusable.map(item=><button key={item.title} disabled={busy} className={button} onClick={()=>bringCalculation(item)}>Bring my {item.title}</button>)}</div></details>}
    {onFreshAttempt&&<details className="mt-4 rounded-xl border border-line p-4"><summary className="cursor-pointer text-sm font-semibold">Try a fresh construction</summary><p className="my-3 text-sm leading-6 text-muted">This clears this draft, including its undo history. Earlier successful attempts stay recorded. Build again without opening hints to record an independent attempt.</p><button className={button} disabled={busy} onClick={freshAttempt}>Start a fresh attempt</button></details>}
    {allowSolution&&<details className="mt-5 rounded-xl border border-line p-4"><summary className="cursor-pointer text-sm font-semibold">Stuck? Inspect a worked construction</summary><p className="mt-3 text-sm leading-7 text-muted">The tools below form one possible solution. You can assemble it, follow its signals, and undo that change to return to your own construction.</p><button className={`${button} mt-3`} disabled={busy} onClick={()=>{edit(assemble(build.recipe,TOOLS),"The example is assembled. It still needs to be tested.");cancelWire();setSelected(null);setSelectedWire(null);setExample(true);resetFields();setZoom(.75);viewport.current?.scrollTo({left:0,top:0});}}>Assemble an example</button>{example&&<p className="mt-2 text-xs text-muted">Showing the example has not passed any tests.</p>}</details>}
    <details className="mt-4 text-xs leading-6 text-muted"><summary className="min-h-10 cursor-pointer content-center">Assumptions and test precision</summary><p className="mt-2">{build.limitation} Numerical tests allow a difference of 0.001. Lists and structures must also have the right shape.</p></details>
  </div>;
}
