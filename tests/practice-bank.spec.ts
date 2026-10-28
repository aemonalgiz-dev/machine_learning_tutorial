import { test,expect } from "@playwright/test";
import { families,catalog,getActivity,activityId,fixtures } from "../lib/practice-bank/catalog.mjs";
import { TOOLS } from "../lib/builds/tools";
import { assemble,evaluate,same,type Expression,type Data } from "../lib/builds/engine";
import { lessonLocations } from "../lib/course-navigation";
import { NextRequest } from "next/server";
import { GET } from "../app/practice-api/[...path]/route";

test("practice bank has thousands of valid activities and existing lesson prerequisites",()=>{
  expect(families).toHaveLength(48);expect(catalog.total).toBe(3456);
  const ids=new Set<string>();
  for(const f of families){
    expect(lessonLocations[f.lesson],f.id+": "+f.lesson).toBeDefined();
    const inputs=new Set<string>();
    for(let v=0;v<24;v++){
      inputs.add(JSON.stringify(f.data(v)));
      expect(new Set(fixtures(f,v).map(entry=>JSON.stringify(entry.expected))).size,f.id+" must reject a constant answer").toBeGreaterThan(1);
      for(const mode of ["quiz","code","workshop"]){
        const id=activityId(f.id,v,mode);expect(ids.has(id)).toBe(false);ids.add(id);
        const activity=getActivity(id)!;expect(activity).not.toBeNull();
        expect(JSON.stringify(activity)).not.toContain("—");
        if("quiz" in activity){const q=activity.quiz[0];expect(new Set(q.options).size).toBe(q.options.length);expect(q.options.length).toBeGreaterThanOrEqual(2);expect(q.given.data.length).toBeGreaterThan(0);}
        if("exercise" in activity){
          expect(activity.exercise.tests.length).toBe(4);expect(activity.exercise.solution).not.toBe(activity.exercise.starter);
          if(activity.exercise.language==="sql")expect(activity.exercise.sql?.tables?.[0].rows.length).toBeGreaterThan(0);
          else expect(activity.exercise.starter).not.toContain("data = json.loads(");
        }
      }
    }
    expect(inputs.size,f.id+" must have distinct datasets").toBe(24);
  }
  for(const id of ["constructor","__proto__","sensor-mean--00--quiz","sensor-mean--25--quiz","sensor-mean--01--unknown","sensor-mean--01--quiz/extra"])expect(getActivity(id)).toBeNull();
});

test("every practice construction matches the independent oracle on all changed batches",()=>{
  for(const f of families){
    const graph=assemble(f.recipe as Expression,TOOLS);expect(graph.pieces.length,f.id).toBeLessThanOrEqual(36);
    for(let v=0;v<24;v++)for(const fixture of fixtures(f,v)){
      const snapshot=JSON.stringify(fixture.data);
      const result=evaluate(graph,fixture.data as Record<string,Data>,TOOLS);
      expect(result.error,f.id+" "+v+" "+fixture.name).toBeUndefined();
      expect(same(result.output,fixture.expected as Data),f.id+" "+v+" "+fixture.name+" "+JSON.stringify(result.output)).toBe(true);
      expect(JSON.stringify(fixture.data)).toBe(snapshot);
    }
  }
});

test("practice API requires the backend's paid membership before serving definitions",async()=>{
  const previous=process.env.OOP_ML_ACCOUNTS_URL,fetch=globalThis.fetch;
  process.env.OOP_ML_ACCOUNTS_URL="https://accounts.example.test";
  let status=200,body:unknown={enabled:true,user:null},cookie="";
  globalThis.fetch=async(_url,init)=>{cookie=new Headers(init?.headers).get("cookie")??"";return Response.json(body,{status});};
  const request=(id?:string)=>new NextRequest("https://perceptronlab.example/practice-api/activity/sensor-mean--01--code",{headers:{cookie:"fitlab_session=opaque",...(id?{"X-FitLab-Account":id}:{})}});
  const context={params:Promise.resolve({path:["activity","sensor-mean--01--code"]})};
  try{
    let response=await GET(request("forged"),context);expect(response.status).toBe(401);expect(await response.text()).not.toContain("def solve");
    body={enabled:true,user:{id:"alice",name:"Alice"}};
    response=await GET(request("bob"),context);expect(response.status).toBe(409);
    response=await GET(request("alice"),context);expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({code:"practice_subscription_required"});
    const active={practiceAccess:true,plan:"practice",status:"active",validUntil:Math.floor(Date.now()/1000)+86400};
    for(const membership of [null,{},true,{...active,practiceAccess:"true"},{...active,plan:"free"},{...active,status:"inactive"},{...active,validUntil:Math.floor(Date.now()/1000)-1},{...active,validUntil:null}]){
      body={enabled:true,user:{id:"alice",name:"Alice"},membership};
      response=await GET(request("alice"),context);expect(response.status).toBe(403);
      expect(await response.text()).not.toContain("def solve");
    }
    body={enabled:true,user:{id:"alice",name:"Alice"},membership:active};
    response=await GET(request("alice"),context);expect(response.status).toBe(200);expect(cookie).toContain("opaque");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    const result=await response.json();expect(result.account).toBe("alice");expect(result.data.exercise.solution).toContain("def solve");
    expect(result.data.quiz).toBeUndefined();expect(result.data.build).toBeUndefined();
    status=503;response=await GET(request("alice"),context);expect(response.status).toBe(503);
    status=200;body={enabled:false,user:null};response=await GET(request("alice"),context);expect(response.status).toBe(503);
    body={enabled:true,user:null};response=await GET(request("alice"),context);expect(response.status).toBe(401);
    for(const malformed of [null,[],"paid"]){body=malformed;response=await GET(request("alice"),context);expect(response.status).toBe(503);}
  }finally{globalThis.fetch=fetch;if(previous===undefined)delete process.env.OOP_ML_ACCOUNTS_URL;else process.env.OOP_ML_ACCOUNTS_URL=previous;}
});

test("free accounts cannot request any additional practice format or catalog",async()=>{
  const previous=process.env.OOP_ML_ACCOUNTS_URL, originalFetch=globalThis.fetch;
  process.env.OOP_ML_ACCOUNTS_URL="https://accounts.example.test";
  globalThis.fetch=async()=>Response.json({enabled:true,user:{id:"alice",name:"Alice"},membership:{practiceAccess:false,plan:"free",status:"inactive",validUntil:null}});
  try{
    for(const parts of [["catalog"],...["quiz","code","workshop"].map(mode=>["activity",activityId("sensor-mean",0,mode)])]){
      const request=new NextRequest("https://perceptronlab.example/practice-api/"+parts.join("/")+"?paid=true",{headers:{cookie:"fitlab_session=opaque","X-FitLab-Account":"alice","X-Practice-Paid":"true"}});
      const response=await GET(request,{params:Promise.resolve({path:parts})});
      expect(response.status).toBe(403);
      expect(response.headers.get("cache-control")).toBe("private, no-store");
      const result=await response.json();expect(result.code).toBe("practice_subscription_required");
      expect(result.data).toBeUndefined();expect(result.families).toBeUndefined();expect(result.build).toBeUndefined();
    }
  }finally{globalThis.fetch=originalFetch;if(previous===undefined)delete process.env.OOP_ML_ACCOUNTS_URL;else process.env.OOP_ML_ACCOUNTS_URL=previous;}
});

