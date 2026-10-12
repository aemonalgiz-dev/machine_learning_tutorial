"use client";
import {useState} from 'react';
import {initialVae,tinyVaeObjective,vaeObservations} from '@/lib/tiny-vae';
import {BotieSays} from '../site/Botie';
import {usePlotWidth} from './use-plot-width';

export function TinyVaeExperiment(){
 const {ref:plotRef,width:plotWidth}=usePlotWidth(620);
 const [p,setP]=useState(initialVae),[losses,setLosses]=useState([tinyVaeObjective(initialVae).loss]),[z,setZ]=useState(0);
 const [generated,setGenerated]=useState<{code:number;mean:number;noise:number;value:number}|null>(null);
 const train=()=>{let next=[...p];const history:number[]=[];for(let i=0;i<100;i++){const {gradient}=tinyVaeObjective(next);next=next.map((v,j)=>v-.03*gradient[j]);history.push(tinyVaeObjective(next).loss);}setP(next);setLosses(values=>[...values,...history]);setGenerated(null);};
 const reset=()=>{setP([...initialVae]);setLosses([tinyVaeObjective(initialVae).loss]);setGenerated(null);};
 const generate=()=>{const normal=()=>Math.sqrt(-2*Math.log(1-Math.random()))*Math.cos(2*Math.PI*Math.random());const code=normal(),mean=p[2]*code+p[3],noise=normal();setGenerated({code,mean,noise,value:mean+noise});};
 return <section aria-label="Train a tiny variational autoencoder" className="space-y-4 rounded-xl border border-line bg-surface p-5">
  <BotieSays>These four measurements are our training data. At first the encoder and decoder know very little about them. Take some training steps, then compare each reconstruction with its input. After training, a prior code can enter the decoder without an input measurement.</BotieSays>
  <p>Training observations: {vaeObservations.join(', ')}. One latent coordinate; standard-normal prior; observation variance one. This linear Gaussian teaching model calculates its expected reconstruction loss exactly.</p>
  <div className="flex flex-wrap gap-3"><button className="rounded border border-line px-4 py-3 disabled:opacity-50" onClick={train} disabled={losses.length>3000}>Train 100 updates</button><button className="rounded border border-line px-4 py-3" onClick={reset}>Reset the model</button></div>
  <p role="status">Updates: {losses.length-1}. Average objective: {tinyVaeObjective(p).loss.toFixed(4)}.</p>
  <div ref={plotRef}><svg viewBox={`0 0 ${plotWidth} 200`} role="img" aria-label="Training objective against update number" className="w-full border border-line"><path d={losses.map((loss,i)=>`${i?'L':'M'}${45+(plotWidth-60)*i/Math.max(1,losses.length-1)},${170-120*(loss-.8)/.5}`).join(' ')} fill="none" stroke="#fbbf24" strokeWidth="2"/><text x="10" y="20" fill="currentColor" fontSize="12">Average objective</text><text x="10" y="57" fill="currentColor" fontSize="12">1.3</text><text x="10" y="173" fill="currentColor" fontSize="12">0.8</text><text x={plotWidth/2} y="194" textAnchor="middle" fill="currentColor" fontSize="12">Updates: 0 to {losses.length-1}</text></svg></div>
  <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th>Input x</th><th>Encoder mean</th><th>Decoder mean at that code</th></tr></thead><tbody>{vaeObservations.map(x=><tr key={x}><td>{x}</td><td>{(p[0]*x+p[1]).toFixed(3)}</td><td>{(p[2]*(p[0]*x+p[1])+p[3]).toFixed(3)}</td></tr>)}</tbody></table></div>
  <p>Posterior variance: {Math.exp(p[4]).toFixed(3)}. Reconstructions need not copy every input: the objective also charges for departing from the prior.</p>
  <label className="block">Choose a prior code z: {z.toFixed(1)}<input className="mt-2 w-full" aria-label="Prior code" type="range" min="-3" max="3" step=".1" value={z} onChange={e=>setZ(Number(e.target.value))}/></label>
  <p>Decoder mean for this code: {(p[2]*z+p[3]).toFixed(3)}. A random generated observation would also include a noise draw with variance one. The slider chooses a code manually; it is not a random sampler.</p>
  <button className="rounded border border-line px-4 py-3" onClick={generate}>Generate a new observation</button>
  {generated&&<div role="group" aria-label="Generated observation"><p>No training observation was encoded for this draw. The prior supplied a code, the decoder supplied a mean, and the observation model supplied the final variation.</p><pre className="mt-3 overflow-x-auto text-sm">{`Prior code: ${generated.code.toFixed(4)}\nDecoder mean: ${generated.mean.toFixed(4)}\nObservation noise: ${generated.noise.toFixed(4)}\nGenerated value = mean + noise\n                = ${generated.value.toFixed(4)}`}</pre></div>}
 </section>;
}
