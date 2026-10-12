"use client";
import {useState} from "react";
import {BotieSays} from "../site/Botie";
import {greenhousePrediction} from "@/lib/gp-example";
import {usePlotWidth} from './use-plot-width';

export function GaussianProcessExperiment(){
  const {ref:plotRef,width:plotWidth}=usePlotWidth();
  const [readings,setReadings]=useState<{x:number;t:number}[]>([]);
  const [length,setLength]=useState(1.5),[noise,setNoise]=useState(.25),[position,setPosition]=useState(1),[temperature,setTemperature]=useState(22);
  const query=Array.from({length:61},(_,i)=>i/10),prediction=greenhousePrediction(readings.map(r=>r.x),readings.map(r=>r.t),query,length,noise);
  const low=Math.min(17,...readings.map(r=>r.t-1),...prediction.mean.map((m,i)=>m-2.5*prediction.deviation[i])),high=Math.max(23,...readings.map(r=>r.t+1),...prediction.mean.map((m,i)=>m+2.5*prediction.deviation[i]));
  const X=(x:number)=>48+x*(plotWidth-65)/6,Y=(t:number)=>285-(t-low)/(high-low)*245;
  // Round drawing coordinates only. Transcendental math can differ by tiny
  // amounts between server and browser, which must not change hydrated SVG.
  const point=(x:number,y:number)=>`${X(x).toFixed(2)},${Y(y).toFixed(2)}`;
  const line=(ys:number[])=>ys.map((y,i)=>`${i?'L':'M'}${point(query[i],y)}`).join(' ');
  const upper=prediction.mean.map((m,i)=>point(query[i],m+1.96*prediction.deviation[i])),lower=prediction.mean.map((m,i)=>point(query[i],m-1.96*prediction.deviation[i])).reverse();
  const selected=greenhousePrediction(readings.map(r=>r.x),readings.map(r=>r.t),[position],length,noise);
  return <section aria-label="Greenhouse temperature and uncertainty" className="space-y-5">
    <BotieSays>{readings.length?`We have ${readings.length} reading${readings.length===1?'':'s'}. Compare the band near a thermometer with the band farther away. A longer length scale shares information over more of the greenhouse; more reading noise makes each thermometer less decisive.`:"We have no readings yet. The usual temperature is twenty degrees, but several patterns are possible. Place a thermometer and watch which possibilities remain."}</BotieSays>
    <div ref={plotRef}><svg viewBox={`0 0 ${plotWidth} 335`} role="img" aria-label="Temperature in degrees Celsius against position in metres. Shading is the pointwise 95 percent latent interval, with three sampled temperature curves." className="w-full rounded-xl border border-line bg-surface">
      <polygon points={[...upper,...lower].join(' ')} fill="#60a5fa" opacity=".2"/>
      {[0,1,2,3,4,5,6].map(x=><g key={x}><path d={`M${X(x)},35V285`} stroke="currentColor" opacity=".1"/><text x={X(x)} y={305} textAnchor="middle" fill="currentColor" fontSize="12">{x}</text></g>)}
      {[low,(low+high)/2,high].map(t=><text key={t} x="48" y={Y(t)+4} textAnchor="end" fontSize="12" fill="currentColor">{t.toFixed(1)}</text>)}
      {prediction.curves.map((curve,i)=><path key={i} d={line(curve)} stroke={['#c084fc','#34d399','#f472b6'][i]} fill="none" strokeWidth="1.3" opacity=".75"/>)}
      <path d={line(prediction.mean)} fill="none" stroke="#fbbf24" strokeWidth="3"/>
      {readings.map((r,i)=><circle key={i} cx={X(r.x)} cy={Y(r.t)} r="5" fill="#fbbf24" stroke="#111827"/>)}
      <path d={`M${X(position)},35V285`} stroke="currentColor" strokeDasharray="4 4" opacity=".6"/>
      <text x="48" y="20" fill="currentColor" fontSize="12">Temperature (°C)</text><text x={plotWidth/2} y="328" textAnchor="middle" fill="currentColor" fontSize="12">{plotWidth<360?'Position (metres)':'Position along the greenhouse (metres)'}</text>
    </svg></div>
    <p className="text-xs leading-6 text-muted">Gold: predicted mean and observed readings. Blue band: pointwise 95% interval for the underlying temperature. Thin curves: three reproducible samples from the current Gaussian model. A future noisy reading has additional variance.</p>
    <div className="grid gap-4 sm:grid-cols-2">{[
      ['Query / new thermometer position',position,setPosition,0,6,.1,'m'],['New reading',temperature,setTemperature,16,24,.1,'°C'],['Length scale',length,setLength,.2,4,.1,'m'],['Reading noise variance',noise,setNoise,.01,2,.01,'°C²']
    ].map(([label,value,set,min,max,step,unit])=><label key={String(label)} className="text-sm">{String(label)}: {Number(value).toFixed(2)} {String(unit)}<input aria-label={String(label)} className="mt-2 block w-full" type="range" min={Number(min)} max={Number(max)} step={Number(step)} value={Number(value)} onChange={e=>(set as (n:number)=>void)(Number(e.target.value))}/></label>)}</div>
    <div className="flex flex-wrap gap-3"><button disabled={readings.length>=8} className="rounded border border-line px-4 py-3 disabled:opacity-50" onClick={()=>setReadings(r=>[...r,{x:position,t:temperature}])}>Place this thermometer reading</button><button className="rounded border border-line px-4 py-3" onClick={()=>setReadings([])}>Remove the readings</button></div>
    <p role="status">At {position.toFixed(1)} m: mean {selected.mean[0].toFixed(2)} °C; latent standard deviation {selected.deviation[0].toFixed(2)} °C.</p>
    {readings.length>0&&<div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="text-left">Invented thermometer readings</caption><thead><tr><th>Position (m)</th><th>Temperature (°C)</th><th>Reading</th></tr></thead><tbody>{readings.map((r,i)=><tr key={i}><td>{r.x.toFixed(1)}</td><td>{r.t.toFixed(1)}</td><td><button className="min-h-11 text-accent underline" aria-label={`Remove thermometer ${i+1}`} onClick={()=>setReadings(rs=>rs.filter((_,j)=>i!==j))}>Remove</button></td></tr>)}</tbody></table></div>}
    <p className="text-xs text-muted">This exact GP uses an RBF covariance with prior variance 1 °C² and a fixed mean of 20 °C. The controls set assumptions; they do not estimate hyperparameters from data. At most eight readings keep this example small.</p>
  </section>;
}
