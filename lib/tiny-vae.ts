export const vaeObservations=[-2,-1,1,2];
export const initialVae=[.2,0,.3,0,0]; // encoder slope/bias, decoder slope/bias, log variance
export function tinyVaeObjective(p:number[],xs=vaeObservations){
  const [a,b,w,d,c]=p,v=Math.exp(c),gradient=[0,0,0,0,0];let loss=0;
  for(const x of xs){const mu=a*x+b,e=x-w*mu-d,dm=-w*e+mu;
    loss+=.5*(e*e+w*w*v)+.5*(mu*mu+v-1-c);
    const g=[dm*x,dm,-e*mu+w*v,-e,.5*(w*w*v+v-1)];g.forEach((value,i)=>gradient[i]+=value/xs.length);
  }
  return {loss:loss/xs.length,gradient};
}
