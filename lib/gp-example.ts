// A small exact GP for the greenhouse teaching experiment. Unit prior variance.
export function rbf(a:number,b:number,length:number) { return Math.exp(-.5*((a-b)/length)**2); }
function cholesky(matrix:number[][]) {
  const L=matrix.map(row=>row.map(()=>0));
  for(let i=0;i<L.length;i++)for(let j=0;j<=i;j++){
    let value=matrix[i][j];for(let k=0;k<j;k++)value-=L[i][k]*L[j][k];
    L[i][j]=i===j?Math.sqrt(Math.max(value,1e-12)):value/L[j][j];
  }
  return L;
}
function solve(L:number[][],b:number[]) {
  const y=[...b],x=[...b];
  for(let i=0;i<b.length;i++){for(let j=0;j<i;j++)y[i]-=L[i][j]*y[j];y[i]/=L[i][i];}
  for(let i=b.length-1;i>=0;i--){x[i]=y[i];for(let j=i+1;j<b.length;j++)x[i]-=L[j][i]*x[j];x[i]/=L[i][i];}
  return x;
}
export function greenhousePrediction(positions:number[],readings:number[],query:number[],length:number,noise:number) {
  if(positions.length!==readings.length||length<=0||noise<=0||![...positions,...readings,...query,length,noise].every(Number.isFinite))throw Error("Use matching finite readings and positive length and noise.");
  const K=positions.map((a,i)=>positions.map((b,j)=>rbf(a,b,length)+(i===j?noise:0)));
  const L=cholesky(K),alpha=solve(L,readings.map(t=>t-20));
  const cross=query.map(q=>positions.map(x=>rbf(q,x,length)));
  const solved=cross.map(row=>solve(L,row));
  const mean=cross.map(row=>20+row.reduce((sum,v,i)=>sum+v*alpha[i],0));
  const covariance=query.map((a,i)=>query.map((b,j)=>rbf(a,b,length)-cross[i].reduce((sum,v,k)=>sum+v*solved[j][k],0)));
  const deviation=covariance.map((row,i)=>Math.sqrt(Math.max(0,row[i])));
  // Fixed normal draws keep comparisons reproducible as assumptions change.
  let seed=37;
  const uniform=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return (seed+.5)/4294967296;};
  const normal=()=>Math.sqrt(-2*Math.log(uniform()))*Math.cos(2*Math.PI*uniform());
  const sampleL=cholesky(covariance.map((row,i)=>row.map((v,j)=>v+(i===j?1e-8:0))));
  const curves=Array.from({length:3},()=>{const z=query.map(normal);return mean.map((m,i)=>m+sampleL[i].reduce((s,v,j)=>s+v*z[j],0));});
  return {mean,deviation,curves};
}
