"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { BotieSays } from "@/components/site/Botie";
import { TOOLS } from "@/lib/builds/tools";
import { assemble, evaluate, expressionTools, plug, same, type Build, type Construction, type Trace, type Piece, type Connection } from "@/lib/builds/engine";
import { wirePath, looseWire, outputPoint, inputPoint, NODE_WIDTH, type NodeGeometry, type Point } from "@/lib/builds/wires";
import { arrangeConstruction, estimatedHeight } from "@/lib/builds/layout";
import styles from "./BuildWorkshop.module.css";
import { WorkshopValue } from "./WorkshopValue";
import { MatrixVectorCalculation } from "./MatrixVectorCalculation";
import { WorkshopPiece } from "./WorkshopPiece";

const button="min-h-11 rounded-lg border border-line bg-raised px-3 py-2 text-sm font-semibold hover:border-accent-fill disabled:opacity-40";
const primary="min-h-11 rounded-lg bg-accent-fill px-4 py-2 text-sm font-semibold text-accent-ink disabled:opacity-40";
type Socket={id:string;port:number;output:boolean};
type Run={traces:Trace[];cases:number[];index:number;step:number;playing:boolean;done:boolean};
const empty=():Construction=>({pieces:[{id:"output",tool:"output",x:1080,y:330,settings:{}}],connections:[]});
const clone=(g:Construction):Construction=>structuredClone(g);
const title=(p:Piece,build:Build)=>p.tool==="output"?"Result":p.tool.startsWith("source:")?build.sources[p.tool.slice(7)]:TOOLS[p.tool].title;
const inputs=(p:Piece)=>p.tool==="output"?["Your result"]:p.tool.startsWith("source:")?[]:TOOLS[p.tool].inputs;
const sameWire=(a:Connection|null,b:Connection)=>a?.from===b.from&&a.to===b.to&&a.port===b.port;

export function BuildWorkshop({ build, guide=false }: {build:Build;guide?:boolean}) {
  const storageKey=`fitlab-construction-v1:${build.id}${build.draftVersion?`:revision-${build.draftVersion}`:""}`;
  const [graph,setGraph]=useState<Construction>(empty);
  const [undo,setUndo]=useState<Construction[]>([]);
  const [socket,setSocket]=useState<Socket|null>(null);
  const [wireEnd,setWireEnd]=useState<Point|null>(null);
  const [hoveredInput,setHoveredInput]=useState<Socket|null>(null);
  const [selected,setSelected]=useState<string|null>(null);
  const [selectedWire,setSelectedWire]=useState<Connection|null>(null);
  const [caseIndex,setCaseIndex]=useState(0);
  const [run,setRun]=useState<Run|null>(null);
  const [results,setResults]=useState<Record<number,boolean>>({});
  const [notice,setNotice]=useState("");
  const [example,setExample]=useState(false);
  const [animate,setAnimate]=useState(true);
  const [zoom,setZoom]=useState(1);
  const [expanded,setExpanded]=useState(false);
  const [placing,setPlacing]=useState<string|null>(null);
  const [dragged,setDragged]=useState<{id:string;x:number;y:number}|null>(null);
  const [geometry,setGeometry]=useState<Record<string,NodeGeometry>>({});
  const [invalidSettings,setInvalidSettings]=useState<Record<string,boolean>>({});
  const [fieldRevision,setFieldRevision]=useState(0);
  const floor=useRef<HTMLDivElement>(null),viewport=useRef<HTMLDivElement>(null),nextId=useRef(0);
  const loaded=useRef(false);
  const moving=useRef<{id:string;dx:number;dy:number;startX:number;startY:number}|null>(null);
  const wiring=useRef<{id:string;startX:number;startY:number;moved:boolean}|null>(null);
  const busy=Boolean(run?.playing);
  const invalid=graph.pieces.some(piece=>(TOOLS[piece.tool]?.settings??[]).some(setting=>invalidSettings[`${piece.id}:${setting.key}`]));
  const trace=run?.traces[run.index];
  const step=trace?.steps[run?.step??-1];
  const sample=build.cases[run?.cases[run.index]??caseIndex];
  const visible=new Map(trace?.steps.slice(0,(run?.step??-1)+1).map(s=>[s.id,s])??[]);
  const selectedPiece=selectedWire?undefined:graph.pieces.find(p=>p.id===(selected??step?.id));
  const inspectedSignal=selectedPiece?visible.get(selectedPiece.id):step;
  const passed=Object.values(results).filter(Boolean).length;
  const failed=Object.keys(results).length-passed;
  const complete=passed===build.cases.length;
  const choices=[...new Set([...Object.keys(build.sources).map(s=>`source:${s}`),...expressionTools(build.recipe).filter(s=>!s.startsWith("source:")),...(build.extras??[])])];
  const nodes=useMemo(()=>graph.pieces.map(p=>({...p,...(dragged?.id===p.id?dragged:{}),...(geometry[p.id]??{width:NODE_WIDTH,height:estimatedHeight(p,TOOLS),inputs:[]})})),[graph.pieces,dragged,geometry]);
  const width=Math.max(1340,...nodes.map(p=>p.x+p.width+80));
  const height=Math.max(740,...nodes.map(p=>p.y+p.height+80));
  const paths=useMemo(()=>graph.connections.map(w=>wirePath(nodes.find(p=>p.id===w.from)!,nodes.find(p=>p.id===w.to)!,w.port,nodes)),[graph.connections,nodes]);
  const wireSource=socket?nodes.find(p=>p.id===socket.id):undefined;

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

  useEffect(()=>{
    const timer=setTimeout(()=>{
      try {
        const stored=localStorage.getItem(storageKey);
        if(stored){const saved=JSON.parse(stored) as Construction;
          const valid=Array.isArray(saved.pieces)&&saved.pieces.length<=36&&new Set(saved.pieces.map(p=>p.id)).size===saved.pieces.length&&saved.pieces.some(p=>p.id==="output"&&p.tool==="output")&&Array.isArray(saved.connections)&&saved.connections.length<=120&&saved.pieces.every(p=>typeof p.id==="string"&&Number.isFinite(p.x)&&p.x>=0&&p.x<=5000&&Number.isFinite(p.y)&&p.y>=0&&p.y<=5000&&p.settings&&typeof p.tool==="string"&&(p.tool==="output"||p.tool.startsWith("source:")&&Object.hasOwn(build.sources,p.tool.slice(7))||Object.hasOwn(TOOLS,p.tool)))&&saved.connections.every(w=>saved.pieces.some(p=>p.id===w.from&&p.tool!=="output")&&saved.pieces.some(p=>p.id===w.to&&Number.isInteger(w.port)&&w.port>=0&&w.port<inputs(p).length));
          if(valid){setGraph(saved);nextId.current=Math.max(0,...saved.pieces.map(p=>Number(p.id.replace("piece-",""))||0));setNotice("Your construction is back. Run the examples to test it again.");}
        }
      }catch{/* Browser storage is optional. */}
      loaded.current=true;
    },0);
    return()=>clearTimeout(timer);
  },[storageKey,build.sources]);
  useEffect(()=>{if(loaded.current)try{localStorage.setItem(storageKey,JSON.stringify(graph));}catch{/* Continue without saving if storage is unavailable. */}},[graph,storageKey]);

  function edit(next:Construction,message="") {if(busy)return;setUndo(u=>[...u.slice(-39),clone(graph)]);setGraph(next);setRun(null);setResults({});setNotice(message);}
  function resetFields(){setInvalidSettings({});setFieldRevision(value=>value+1);}
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
  function occupied(id:string|undefined,x:number,y:number,height:number) {
    return nodes.some(p=>p.id!==id&&x<p.x+p.width+40&&x+NODE_WIDTH+40>p.x&&y<p.y+p.height+40&&y+height+40>p.y);
  }
  function add(tool:string,x?:number,y?:number) {
    if(busy)return;
    if(graph.pieces.length>=36){setNotice("There are 35 tool spaces on this floor. Remove an unused piece before adding another.");return;}
    let spot={x:x??32,y:y??70};
    const reservedHeight=estimatedHeight({tool},TOOLS);
    if(x===undefined) {let free=false;for(let row=0;row<60&&!free;row++)for(let col=0;col<3&&!free;col++){const candidate={x:32+col*(NODE_WIDTH+96),y:70+row*96};if(!occupied(undefined,candidate.x,candidate.y,reservedHeight)){spot=candidate;free=true;}}}
    if(occupied(undefined,spot.x,spot.y,reservedHeight)){setNotice("That position is occupied. Choose an empty part of the floor.");return;}
    const piece={id:`piece-${++nextId.current}`,tool,...spot,settings:Object.fromEntries((TOOLS[tool]?.settings??[]).map(s=>[s.key,s.initial]))};
    edit({...graph,pieces:[...graph.pieces,piece]},`${title(piece,build)} is on the floor. Select its name to inspect what it needs.`);selectPiece(piece.id);cancelWire();setPlacing(null);
  }
  function armOutput(id:string){setSocket({id,port:0,output:true});setWireEnd(null);setHoveredInput(null);setPlacing(null);selectPiece(id);setNotice("Click an input, or drag the output arrow onto it. Escape cancels the connection.");}
  function connectInput(from:string,to:Socket){
    if(from===to.id){setNotice("A machine cannot supply its own input. Choose an input on another piece.");return;}
    edit(plug(graph,{from,to:to.id,port:to.port}),"Connected. You can run this example to inspect what happens.");cancelWire();selectPiece(to.id);
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
    if(moving.current){const p=coordinates(e);setDragged({id:moving.current.id,x:p.x-moving.current.dx,y:p.y-moving.current.dy});return;}
    const from=wiring.current?.id??socket?.id;if(!from)return;
    if(wiring.current&&Math.hypot(e.clientX-wiring.current.startX,e.clientY-wiring.current.startY)>5)wiring.current.moved=true;
    const target=inputUnderPointer(e,from);setHoveredInput(target);
    setWireEnd(target?inputPoint(nodes.find(p=>p.id===target.id)!,target.port):coordinates(e));
  }
  function finishPointer(e:PointerEvent){
    const gesture=wiring.current;
    if(!gesture){finishDrag(e);return;}
    wiring.current=null;
    if(gesture.moved){const target=inputUnderPointer(e,gesture.id);if(target)connectInput(gesture.id,target);else{cancelWire();setNotice("No connection was added. Start at an output arrow and release over an input.");}}
  }
  function advance() {
    if(!run||run.done)return;
    const current=run.traces[run.index];
    if(run.step+1<current.steps.length){setRun({...run,step:run.step+1});return;}
    if(current.error){setNotice(current.error.message);setSelected(current.error.id);setRun({...run,playing:false,done:true});return;}
    const index=run.cases[run.index];setCaseIndex(index);setResults(r=>({...r,[index]:same(current.output,build.cases[index].expected)}));
    if(run.index+1<run.traces.length)setRun({...run,index:run.index+1,step:-1});
    else setRun({...run,done:true,playing:false});
  }
  useEffect(()=>{if(!run?.playing||run.done)return;const timer=setTimeout(advance,animate&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches?500:20);return()=>clearTimeout(timer);
    // Each tick uses this run and the graph from which it was calculated.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[run,animate]);
  function start(all:boolean,playing:boolean) {const cases=all?build.cases.map((_,i)=>i):[caseIndex];setNotice("");cancelWire();setSelected(null);setSelectedWire(null);setPlacing(null);if(all)setResults({});setRun({cases,traces:cases.map(i=>evaluate(graph,build.cases[i].data,TOOLS)),index:0,step:playing?-1:0,playing,done:false});}
  function startDrag(e:PointerEvent<HTMLButtonElement>,p:Piece){if(busy||e.button!==0)return;e.preventDefault();e.currentTarget.focus({preventScroll:true});cancelWire();const point=coordinates(e);moving.current={id:p.id,dx:point.x-p.x,dy:point.y-p.y,startX:e.clientX,startY:e.clientY};e.currentTarget.setPointerCapture(e.pointerId);selectPiece(p.id);}
  function movePiece(id:string,x:number,y:number) {
    x=Math.max(32,Math.min(5000,x));y=Math.max(50,Math.min(5000,y));
    if(occupied(id,x,y,nodes.find(p=>p.id===id)!.height)){setNotice("Those machines would overlap. Choose a clear space.");return;}
    edit({...graph,pieces:graph.pieces.map(p=>p.id===id?{...p,x,y}:p)});
  }
  function finishDrag(e:PointerEvent){if(!moving.current)return;const m=moving.current;if(Math.hypot(e.clientX-m.startX,e.clientY-m.startY)>5){const q=coordinates(e);movePiece(m.id,Math.round((q.x-m.dx)/24)*24,Math.round((q.y-m.dy)/24)*24);}moving.current=null;setDragged(null);}
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
  const coach=trace?.error?.message||(complete?"Your construction works for every example. Now look at the path the values took and explain why each piece was needed.":guide?tutorialTip():notice||(socket?"Which operation needs this value next? Choose its input socket.":"The floor is yours. Start by deciding which information the answer depends on, then choose the operations needed to turn it into that answer."));

  return <div data-testid="construction-workshop" className={styles.workshop} onKeyDown={e=>{
    if(e.key.startsWith("Arrow"))e.stopPropagation();
    const editing=(e.target as Element).closest("input,textarea,select,[contenteditable]:not([contenteditable=false])");
    if(!editing&&!e.defaultPrevented&&["Delete","Backspace"].includes(e.key)&&(selected||selectedWire)){e.preventDefault();e.stopPropagation();removeSelection();}
    if(e.key==="Escape"){e.preventDefault();e.stopPropagation();if(socket)cancelWire();else if(placing)setPlacing(null);else setExpanded(false);moving.current=null;setDragged(null);}
  }}>
    <div className="mb-5 grid gap-5 lg:grid-cols-2"><div><h3 className="text-xl font-semibold">Your construction challenge</h3><p className="mt-3 text-sm leading-7 text-muted" data-testid="construction-context">{build.problem}</p><p className="mt-3 text-sm leading-7 font-medium">{build.challenge}</p><p className="mt-3 text-xs leading-6 text-muted">Choose and place the tools yourself. There is more than one way to build a working machine.</p></div><BotieSays mood={busy?"thinking":complete?"happy":trace?.error||failed?"curious":"ready"}>{coach}</BotieSays></div>
    <div className={`${styles.editor} ${expanded?styles.expanded:""}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface p-3"><div className="flex flex-wrap gap-2">
        <button className={primary} disabled={busy||invalid} onClick={()=>start(false,true)}>Run this example</button>
        <button className={button} disabled={invalid&&!busy} onClick={()=>{if(busy)setRun(r=>r&&({...r,playing:false}));else if(run&&!run.done)advance();else start(false,false);}}>{busy?"Pause":"Step through"}</button>
        <button className={button} disabled={busy||invalid} onClick={()=>start(true,true)}>Test all examples</button>
        {run&&<button className={button} onClick={()=>setRun(null)}>Stop</button>}
      </div><p role="status" data-testid="construction-counter" className="font-mono text-xs">{passed} passed · {failed} failed · {build.cases.length-Object.keys(results).length} not run</p></div>
      {invalid&&<p role="status" className="border-b border-line px-4 py-2 text-sm text-accent">Finish entering the highlighted number before running the construction.</p>}
      <div className="flex flex-wrap items-center gap-3 border-b border-line bg-raised px-3 py-2 text-xs"><label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={animate} onChange={e=>setAnimate(e.target.checked)}/>Animate signals</label><button className={button} disabled={busy||!undo.length} onClick={()=>{resetFields();setGraph(undo.at(-1)!);setUndo(u=>u.slice(0,-1));setRun(null);setResults({});cancelWire();setSelected(null);setSelectedWire(null);}}>Undo</button><button className={button} disabled={busy} onClick={()=>{resetFields();edit(empty(),"The floor is clear. Undo can restore your construction.");setSelected(null);setSelectedWire(null);cancelWire();}}>Clear floor</button><button className={button} disabled={busy} onClick={()=>{edit(arrangeConstruction(graph,TOOLS,Object.fromEntries(nodes.map(p=>[p.id,p.height]))),"The pieces now have room between them. Undo restores your arrangement.");cancelWire();viewport.current?.scrollTo({left:0,top:0});}}>Arrange pieces</button><button className={button} onClick={()=>{setZoom(Math.min(1,(viewport.current?.clientWidth??width)/width,(viewport.current?.clientHeight??height)/height));viewport.current?.scrollTo({left:0,top:0});}}>Fit construction</button><label>Zoom <select aria-label="Construction zoom" value={zoom} onChange={e=>setZoom(Number(e.target.value))} className="min-h-11 rounded border border-line bg-surface px-2">{![.25,.5,.75,1].includes(zoom)&&<option value={zoom}>{Math.round(zoom*100)}%</option>}{[.25,.5,.75,1].map(z=><option key={z} value={z}>{z*100}%</option>)}</select></label><button className={button} onClick={()=>{setExpanded(!expanded);viewport.current?.scrollTo({left:0,top:0});}}>{expanded?"Return to lesson":"Expand floor"}</button><span>Start at an output arrow, then click or drag to an input. Select a piece or wire and press Delete to remove it.</span></div>
      <div className={styles.workspace}>
        <aside className={styles.shelf} aria-label="Construction toolbox"><h4 className="mb-2 text-sm font-semibold">Choose a tool</h4><p className="mb-3 text-xs leading-5 text-muted">Click to place. Drag onto the floor to choose a position.</p>{choices.map(key=><button key={key} draggable={!busy} disabled={busy} onDragStart={()=>setPlacing(key)} onDragEnd={()=>setPlacing(null)} onClick={()=>add(key)} className={`${styles.tool} ${key.startsWith("source:")?styles.sourceTool:""}`}><span aria-hidden="true">{key.startsWith("source:")?"▣":"+"}</span>{key.startsWith("source:")?build.sources[key.slice(7)]:TOOLS[key].title}</button>)}</aside>
        <div ref={viewport} className={styles.viewport} aria-label="Construction floor" tabIndex={0}>
          <div style={{width:width*zoom,height:height*zoom,overflow:"hidden"}}><div ref={floor} data-testid="construction-floor" className={styles.floor} style={{width,height,transform:`scale(${zoom})`,transformOrigin:"top left"}} onPointerMove={movePointer} onPointerUp={finishPointer} onPointerCancel={()=>{moving.current=null;setDragged(null);cancelWire();}} onClick={e=>{if(e.target===e.currentTarget||(e.target as Element).tagName==="svg"){cancelWire();setSelected(null);setSelectedWire(null);viewport.current?.focus({preventScroll:true});}}} onDragOver={e=>{if(placing)e.preventDefault();}} onDrop={e=>{e.preventDefault();if(placing){const p=coordinates(e);add(placing,Math.max(32,p.x-NODE_WIDTH/2),Math.max(50,p.y-50));}}}>
            <p className={styles.floorHint}>{graph.pieces.length===1?"An empty floor. Start with the information your machine needs.":`${sample.name} · select a machine to inspect its operation`}</p>
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
                settings={TOOLS[piece.tool]?.settings??[]} value={signal?signal.output:source?sample.data[piece.tool.slice(7)]:piece.tool==="constant"?piece.settings.value:undefined} hasSignal={Boolean(signal)}
                busy={busy} selected={selected===piece.id} active={step?.id===piece.id} error={trace?.error?.id===piece.id} missingPort={trace?.error?.id===piece.id?trace.error.port:undefined}
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
      <div className="border-t border-line bg-surface p-4" aria-label="Construction inspector"><div className="flex flex-wrap justify-between gap-3"><h4 className="text-sm font-semibold">{selectedWire?"Selected connection":selectedPiece?title(selectedPiece,build):"Look inside a machine"}</h4>{selectedWire&&<button disabled={busy} className="text-sm text-accent underline" onClick={removeSelection}>Remove this connection</button>}{selectedPiece&&selectedPiece.id!=="output"&&<button disabled={busy} className="text-sm text-accent underline" onClick={()=>removePiece(selectedPiece.id)}>Remove this piece</button>}</div><p className="mt-2 text-xs leading-6 text-muted">{selectedWire?"This wire carries one piece's output into another piece's input. Press Delete or use Remove this connection. Undo restores it.":selectedPiece?selectedPiece.tool==="output"?"The tests compare the arriving value with the requested result for this example.":selectedPiece.tool.startsWith("source:")?"This source reads the selected example. The same connection will carry a different value when you select another example.":TOOLS[selectedPiece.tool].why:"Select a machine's name to see its purpose. During a run, its inputs and output appear here in their own block."}</p>{inspectedSignal&&<dl className="mt-3 grid max-h-60 gap-3 overflow-auto sm:grid-cols-2">{inspectedSignal.inputs.map((value,i)=><div key={i} className="min-w-0"><dt className="mb-2 text-xs text-muted">{selectedPiece?inputs(selectedPiece)[i]:`Input ${i+1}`}</dt><dd><WorkshopValue value={value}/></dd></div>)}<div className="min-w-0"><dt className="mb-2 text-xs text-accent">Output</dt><dd><WorkshopValue value={inspectedSignal.output}/></dd></div></dl>}{trace?.error&&<p role="status" className="mt-2 text-sm text-accent">{trace.error.message}</p>}</div>
      {selectedPiece?.tool==="matvec"&&inspectedSignal&&<div className="min-w-0 border-t border-line p-4"><MatrixVectorCalculation key={selectedPiece.id} matrix={inspectedSignal.inputs[0] as number[][]} vector={inspectedSignal.inputs[1] as number[]} purchases={build.id==="linear-algebra"}/></div>}
    </div>
    <section className="mt-5 rounded-xl border border-line bg-surface p-4"><h4 className="mb-3 font-semibold">The examples your construction must handle</h4><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{build.cases.map((sample,i)=><button disabled={busy} key={sample.name} aria-pressed={(run?.cases[run.index]??caseIndex)===i} className={`min-w-0 rounded-xl border p-3 text-left ${(run?.cases[run.index]??caseIndex)===i?"border-accent-fill bg-accent-soft":"border-line bg-raised"}`} onClick={()=>{setCaseIndex(i);setRun(null);}}><span className="flex justify-between gap-3 text-sm font-semibold">{sample.name}<span>{results[i]===undefined?"Not tested":results[i]?"✓ Passed":"× Failed"}</span></span><dl className="mt-3 space-y-2 text-xs">{Object.entries(sample.data).map(([key,value])=><div key={key}><dt className="text-muted">{build.sources[key]}</dt><dd className="mt-1"><WorkshopValue value={value}/></dd></div>)}<div><dt className="text-accent">Required result</dt><dd className="mt-1"><WorkshopValue value={sample.expected}/></dd></div></dl></button>)}</div></section>
    {complete&&<div className="mt-5 rounded-xl border border-accent-fill/50 bg-accent-soft p-5"><h4 className="font-semibold">Why did that construction work?</h4><p className="mt-2 text-sm leading-7">{build.why}</p></div>}
    <details className="mt-5 rounded-xl border border-line p-4"><summary className="cursor-pointer text-sm font-semibold">Stuck? Inspect a worked construction</summary><p className="mt-3 text-sm leading-7 text-muted">The tools below form one possible solution. You can assemble it, follow its signals, and undo that change to return to your own construction.</p><button className={`${button} mt-3`} disabled={busy} onClick={()=>{edit(assemble(build.recipe,TOOLS),"The example is assembled. It still needs to be tested.");cancelWire();setSelected(null);setSelectedWire(null);setExample(true);resetFields();setZoom(.75);viewport.current?.scrollTo({left:0,top:0});}}>Assemble an example</button>{example&&<p className="mt-2 text-xs text-muted">Showing the example has not passed any tests.</p>}</details>
    <p className="mt-4 text-xs leading-6 text-muted">{build.limitation} Numerical tests allow a difference of 0.001. Lists and structures must also have the right shape.</p>
  </div>;
}
