import { test,expect,type Page } from "@playwright/test";
import { BUILDS,buildById } from "../lib/builds/catalog";
import { TOOLS } from "../lib/builds/tools";
import { assemble,evaluate,same,plug,type Construction } from "../lib/builds/engine";
import { labLessons } from "../lib/labs";
import { journeyFor } from "../lib/builds/journey";

test("every lesson has an executable construction, coherent tools and an empty starting task",()=>{
  expect(BUILDS).toHaveLength(labLessons.length + 1);
  expect(new Set(BUILDS.map(b=>b.id)).size).toBe(BUILDS.length);
  for(const lesson of labLessons){
    const b=buildById[lesson.id],journey=journeyFor(lesson.id);expect(b,lesson.id).toBeDefined();
    expect(journey.history.blocks.length,lesson.id).toBeGreaterThan(1);
    const graph=assemble(b.recipe,TOOLS);expect(graph.pieces.length,lesson.id).toBeLessThanOrEqual(36);
    expect(graph.pieces.length,lesson.id).toBeGreaterThan(2);
    for(const sample of b.cases){const result=evaluate(graph,sample.data,TOOLS);expect(result.error,lesson.id).toBeUndefined();expect(same(result.output,sample.expected),lesson.id).toBe(true);}
    expect(JSON.stringify(b),lesson.id).not.toContain("\u2014");
    const broken={...graph,connections:graph.connections.filter(c=>c.to!=="output")};
    expect(evaluate(broken,b.cases[0].data,TOOLS).error?.id).toBe("output");
    for(const tool of journey.tools)if(tool.earlier)expect(tool.earlier.href).not.toBe(lesson.href);
  }
});

test("numeric operations agree with independent examples and reject invalid dimensions",()=>{
  expect(TOOLS.matvec.run([[[1,2],[3,4]],[5,6]],{})).toEqual([17,39]);
  expect(TOOLS.matmul.run([[[1,2],[3,4]],[[5,6],[7,8]]],{})).toEqual([[19,22],[43,50]]);
  expect(TOOLS.windows.run([[[1,2,3],[4,5,6],[7,8,9]]],{size:2,stride:1})).toEqual([[1,2,4,5],[2,3,5,6],[4,5,7,8],[5,6,8,9]]);
  expect(TOOLS.vocabulary.run([["cat","cat"],{cat:103}],{})).toEqual([103,103]);
  expect(TOOLS.utf8.run(["é"],{})).toEqual([195,169]);
  expect(TOOLS.bestPath.run(["abcd",{ab:1,cd:2,a:1,bcd:4}],{})).toEqual(["ab","cd"]);
  expect(TOOLS.bestPath.run(["abcd",{ab:4,cd:3,a:1,bcd:2}],{})).toEqual(["a","bcd"]);
  expect(()=>TOOLS.matvec.run([[[1,2]],[1]],{})).toThrow(/same length/);
  expect(()=>TOOLS.distances.run([[1,2,3],[[1,2]]],{})).toThrow(/same number of coordinates/);
  expect(()=>TOOLS.upsample.run([[[1]]],{factor:0})).toThrow(/scale from 1 to 20/);
  expect(()=>TOOLS.upsample.run([[[1]]],{factor:1000000})).toThrow(/scale from 1 to 20/);
  expect(()=>TOOLS.gather.run([[10,20],[2]],{})).toThrow(/does not exist/);
  expect(buildById.statistics.cases.map(c=>c.expected)).toEqual([40,32,36]);
  expect(buildById["linear-algebra"].cases.map(c=>c.expected)).toEqual([[8,9,4],[9,7],[6,13,8]]);
  [5,4.5,4.1].forEach((speed,i)=>expect(buildById.calculus.cases[i].expected).toBeCloseTo(speed));
  [10,12.2,6].forEach((position,i)=>expect(buildById["simple-linear-regression"].cases[i].expected).toBeCloseTo(position));
  expect(buildById["multiple-polynomial-regression"].cases.map(c=>c.expected)).toEqual([8,6,8,16]);
  expect(buildById["image-alignment"].cases.map(c=>c.expected)).toEqual([[8,5],[3,2]]);
  expect(TOOLS.columnmedian.run([[[3,-1],[26,15],[3,-1]]],{})).toEqual([3,-1]);
  expect(TOOLS.columnmedian.run([[[3,8],[1,4],[9,2],[5,6]]],{})).toEqual([4,5]);
  expect(()=>TOOLS.columnmedian.run([[[1,2],[3]]],{})).toThrow(/same number/);
  expect(buildById["neurons-and-activations"].cases.map(c=>c.expected)).toEqual([0,1,0,1,0,1,0,0]);
  expect(buildById["reinforcement-learning"].cases[0].expected).toBeCloseTo(3.3);
  expect(buildById["convolution"].cases[0].expected).toEqual([-4,-4,-4,-4]);
  expect(buildById["kernel-pca"].cases[0].expected).toEqual([[.25,-.25],[-.25,.25]]);
});

test("alternate constructions work, rewiring changes the math, and loops and zero division explain the failure",()=>{
  const b=buildById.statistics,graph=assemble(b.recipe,TOOLS);
  const alternate:Construction={pieces:[{id:"source",tool:"source:weeklyCounts",x:0,y:0,settings:{}},{id:"mean",tool:"mean",x:0,y:0,settings:{}},{id:"output",tool:"output",x:0,y:0,settings:{}}],connections:[{from:"source",to:"mean",port:0},{from:"mean",to:"output",port:0}]};
  for(const sample of b.cases)expect(same(evaluate(alternate,sample.data,TOOLS).output,sample.expected)).toBe(true);
  const divider=graph.pieces.find(p=>p.tool==="divide")!,counter=graph.pieces.find(p=>p.tool==="count")!;
  expect(evaluate(plug(graph,{from:divider.id,to:counter.id,port:0}),b.cases[0].data,TOOLS).error?.message).toContain("loops back");
  const incorrect={...graph,pieces:graph.pieces.map(p=>p.id===divider.id?{...p,tool:"multiply"}:p)};
  expect(evaluate(incorrect,b.cases[0].data,TOOLS).output).toBe(1000);
  expect(evaluate(graph,{weeklyCounts:[]},TOOLS).error?.message).toContain("finite number");
});

async function openBuild(page:Page,slug:string){await page.goto(`/lab/${slug}`);await page.getByRole("navigation",{name:"Journey stages"}).getByRole("button",{name:/Build your solution/}).click();await page.getByRole("checkbox",{name:"Animate signals",exact:true}).uncheck();}
async function wire(page:Page,a:string,b:string){await page.getByRole("button",{name:a,exact:true}).click();await page.getByRole("button",{name:b,exact:true}).click();}
async function run(page:Page,counts:string){await page.getByRole("button",{name:"Test all examples",exact:true}).click();await expect(page.getByTestId("construction-counter")).toHaveText(counts);}

test("Botie carries the city's records from the history into the tools and construction",async({page})=>{
  await page.goto("/primers/statistics#workshop");
  const journey=page.getByTestId("workshop-journey");
  await expect(journey.getByRole("heading",{name:"What Could a City Learn from Its Records?",exact:true})).toBeVisible();
  const stages=journey.getByRole("navigation",{name:"Journey stages"});
  await stages.getByRole("button",{name:/Get to know the tools/}).click();
  await expect(journey.getByText(/Let's return to the city's records/)).toBeVisible();
  await expect(journey.getByText(/How many deaths were recorded in an average week/)).toBeVisible();
  await stages.getByRole("button",{name:/Build your solution/}).click();
  await expect(journey.getByTestId("construction-context")).toContainText("not Graunt's records");
  await expect(journey.getByRole("button",{name:"Deaths recorded each week",exact:true})).toBeVisible();
  await expect(journey.getByRole("button",{name:/Five weekly records/})).toBeVisible();
  await expect(journey).not.toContainText(/box masses|sorting gate|delivery/i);
  await page.setViewportSize({width:320,height:900});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test("a learner builds a real mean from an empty floor, inspects a mistake, and keeps their work",async({page})=>{
  const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
  await openBuild(page,"statistics");
  await expect(page.locator("[data-piece]")).toHaveCount(1);
  await page.getByRole("button",{name:"Test all examples",exact:true}).click();
  await expect(page.getByRole("status").filter({hasText:/needs a number/})).toBeVisible();
  for(const name of ["Deaths recorded each week","Add a list","Count items","Divide"])await page.getByRole("button",{name,exact:true}).click();
  await wire(page,"Deaths recorded each week output","Add a list input 1: Numbers");
  await wire(page,"Deaths recorded each week output","Count items input 1: Items");
  await wire(page,"Count items output","Divide input 1: Amount");
  await wire(page,"Add a list output","Divide input 2: Divisor");
  await wire(page,"Divide output","Result input 1: Your result");
  await run(page,"0 passed · 3 failed · 0 not run");
  await wire(page,"Add a list output","Divide input 1: Amount");
  await wire(page,"Count items output","Divide input 2: Divisor");
  await expect(page.getByTestId("construction-counter")).toHaveText("0 passed · 0 failed · 3 not run");
  await run(page,"3 passed · 0 failed · 0 not run");
  await page.getByRole("button",{name:"Fit construction",exact:true}).click();
  await page.getByRole("button",{name:"Inspect or move Divide",exact:true}).click();
  await expect(page.getByLabel("Construction inspector")).toContainText("Amount144");
  await page.reload();
  await page.getByRole("navigation",{name:"Journey stages"}).getByRole("button",{name:/Build your solution/}).click();
  await expect(page.locator("[data-piece]")).toHaveCount(5);
  await expect(page.getByTestId("construction-counter")).toHaveText("0 passed · 0 failed · 3 not run");
  expect(errors).toEqual([]);
});

test("Botie introduces the tools, carries earlier tools forward and keeps later lessons open",async({page})=>{
  await page.goto("/lab/workshop-guide");
  await expect(page.getByRole("heading",{name:"How Do We Give a Machine a Job?",exact:true})).toBeVisible();
  await page.getByRole("button",{name:"Continue with Botie",exact:false}).click();
  await expect(page.getByText(/A source supplies data/)).toBeVisible();
  await page.getByRole("navigation",{name:"Journey stages"}).getByRole("button",{name:/Get to know/}).click();
  await page.getByLabel("Multiply example: Value",{exact:true}).fill("4");
  await expect(page.getByText("8",{exact:true})).toBeVisible();
  await page.getByRole("button",{name:"Open the empty workshop",exact:false}).click();
  await expect(page.locator("[data-piece]")).toHaveCount(1);
  await page.getByRole("navigation",{name:"Journey stages"}).getByRole("button",{name:/Explain it/}).click();
  await page.getByRole("link",{name:/Statistics & Probability Primer/}).click();
  await expect(page.getByTestId("workshop-journey")).toBeVisible();
  await page.goto("/lab/attention");
  await page.getByRole("navigation",{name:"Journey stages"}).getByRole("button",{name:/Get to know/}).click();
  await expect(page.getByText("A tool you have used before").first()).toBeVisible();
});

test("learners configure, move and remove their pieces, and undo restores the construction",async({page})=>{
  await openBuild(page,"workshop-guide");
  for(const name of ["Sensor reading","Multiply","Set a constant"])await page.getByRole("button",{name,exact:true}).click();
  await page.getByLabel("Set a constant Number",{exact:true}).fill("2");
  await wire(page,"Sensor reading output","Multiply input 1: Value");
  await wire(page,"Set a constant output","Multiply input 2: Multiplier");
  await wire(page,"Multiply output","Result input 1: Your result");
  await run(page,"3 passed · 0 failed · 0 not run");
  await page.getByRole("button",{name:"Fit construction",exact:true}).click();
  const handle=page.getByRole("button",{name:"Inspect or move Set a constant",exact:true});
  await handle.focus();await page.keyboard.press("ArrowDown");
  await expect(page.getByTestId("construction-counter")).toHaveText("0 passed · 0 failed · 3 not run");
  await page.getByRole("button",{name:"Undo",exact:true}).click();
  await handle.click();
  await page.getByRole("button",{name:"Remove this piece",exact:true}).click();
  await expect(handle).toHaveCount(0);
  await page.getByRole("button",{name:"Undo",exact:true}).click();
  await expect(handle).toHaveCount(1);
  await run(page,"3 passed · 0 failed · 0 not run");
  const wireToRemove=page.getByRole("button",{name:/Select connection 2:/});
  await wireToRemove.focus();await page.keyboard.press("Delete");
  await expect(page.getByRole("button",{name:/Select connection/})).toHaveCount(2);
  await page.getByRole("button",{name:"Undo",exact:true}).click();
  await expect(page.getByRole("button",{name:/Select connection/})).toHaveCount(3);
  await page.getByRole("button",{name:"Expand floor",exact:true}).click();
  await expect(page.getByRole("button",{name:"Return to lesson",exact:true})).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button",{name:"Expand floor",exact:true})).toBeVisible();
});

test("every workshop's worked construction executes in the browser and still requires testing",async({page})=>{
  test.setTimeout(420_000);
  await page.emulateMedia({reducedMotion:"reduce"});
  const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
  for(const b of BUILDS){
    await openBuild(page,b.id==="neurons-and-activations"?"neuron":b.id);
    await page.getByText("Stuck? Inspect a worked construction",{exact:true}).click();
    await page.getByRole("button",{name:"Assemble an example",exact:true}).click();
    await expect(page.getByTestId("construction-counter"),b.id).toHaveText(`0 passed · 0 failed · ${b.cases.length} not run`);
    await run(page,`${b.cases.length} passed · 0 failed · 0 not run`);
  }
  expect(errors).toEqual([]);
});

test("construction stays usable on narrow screens and inside lessons",async({page})=>{
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.goto("/concepts/neurons-and-activations#workshop");
  await page.getByRole("navigation",{name:"Journey stages"}).getByRole("button",{name:/Build your solution/}).click();
  await page.getByText("Stuck? Inspect a worked construction",{exact:true}).click();
  await page.getByRole("button",{name:"Assemble an example",exact:true}).click();
  await run(page,"8 passed · 0 failed · 0 not run");
  for(const width of [1440,1024,768,390,320]){
    await page.setViewportSize({width,height:900});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`width ${width}`).toBe(true);
    await page.getByRole("button",{name:"Fit construction",exact:true}).click();
  }
  await page.getByRole("navigation",{name:"Journey stages"}).getByRole("button",{name:/Explain it/}).click();
  await page.getByRole("link",{name:"Write the calculation in Python",exact:false}).click();
  await expect(page.getByText("Write and run Python",{exact:true})).toBeVisible();
});
