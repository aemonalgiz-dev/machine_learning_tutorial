import {test,expect,type Page} from "@playwright/test";
import {catalog,getActivity} from "../lib/practice-bank/catalog.mjs";
import {readFile} from "node:fs/promises";
import path from "node:path";
import {openWorkspaceControls} from "./helpers/open-workshop";
import {waitForAccountReady,waitForAccountSync} from "./helpers/account-backend";
import {FREE_MEMBERSHIP} from "../lib/membership";

const paidMembership = () => ({ practiceAccess: true, plan: "practice", status: "active", validUntil: Math.floor(Date.now()/1000)+86400 });

async function service(page:Page, initial:string|null="alice"){
  const state={user:initial,fail:false,loads:[] as string[],saved:{} as Record<string,Record<string,unknown>>,uploads:[] as {owner:string;key:string}[]};
  await page.route("**/account-api/**",async route=>{
    const url=new URL(route.request().url()),pathname=url.pathname;
    if(pathname.endsWith("/session"))return route.fulfill({json:{enabled:true,registrationEnabled:true,user:state.user?{id:state.user,name:state.user,email:null}:null,membership:state.user?paidMembership():FREE_MEMBERSHIP}});
    if(pathname.endsWith("/auth/login")||pathname.endsWith("/auth/register")){state.user="alice";return route.fulfill({status:303,headers:{location:"/account"}});}
    if(pathname.endsWith("/auth/logout")){state.user=null;return route.fulfill({json:{signedOut:true,redirect:null}});}
    const owner=route.request().headers()["x-fitlab-account"];
    if(owner!==state.user)return route.fulfill({status:409,json:{}});
    if(pathname.endsWith("/progress"))return route.fulfill({json:{done:{},required:{}}});
    if(pathname.endsWith("/learner-state")){
      if(route.request().method()==="GET")return route.fulfill({json:{records:Object.values(state.saved[owner]??{}),nextCursor:null}});
      const body=route.request().postDataJSON();
      const saved={...body,revision:body.revision+1};(state.saved[owner]??={})[body.key]=saved;state.uploads.push({owner,key:body.key});
      return route.fulfill({json:saved});
    }
    return route.fulfill({status:404});
  });
  await page.route("**/practice-api/**",async route=>{
    state.loads.push(route.request().url());
    if(state.fail)return route.fulfill({status:503,json:{error:"Practice is temporarily unavailable."}});
    if(!state.user)return route.fulfill({status:401,json:{error:"Sign in to open account practice."}});
    if(route.request().headers()["x-fitlab-account"]!==state.user)return route.fulfill({status:409,json:{error:"Account changed"}});
    const suffix=new URL(route.request().url()).pathname.slice("/practice-api/".length);
    const data=suffix==="catalog"?catalog:getActivity(decodeURIComponent(suffix.slice("activity/".length)));
    return route.fulfill({status:data?200:404,json:data?{account:state.user,data}:{error:"Practice not found."}});
  });
  await page.context().route("https://cdn.jsdelivr.net/pyodide/v314.0.7/full/*.whl",async route=>{
    try{const body=await readFile(path.join(process.cwd(),".practice-checks",path.basename(new URL(route.request().url()).pathname)));await route.fulfill({body,contentType:"application/zip",headers:{"access-control-allow-origin":"*"}});}catch{await route.continue();}
  });
  return state;
}

test("guest and forged cached identity cannot load practice; sign-in returns to the selected case",async({page})=>{
  const state=await service(page,null);
  await page.addInitScript(()=>sessionStorage.setItem("fitlab.account.last",JSON.stringify({id:"forged",name:"Forged",email:null})));
  await page.goto("/practice/sensor-mean--03--quiz");
  await expect(page.getByRole("link",{name:"Sign in or create an account",exact:true})).toBeVisible();
  expect(state.loads).toHaveLength(0);
  await page.getByRole("link",{name:"Sign in or create an account",exact:true}).click();
  await page.getByRole("button",{name:"Sign in",exact:true}).click();
  await expect(page).toHaveURL(/\/practice\/sensor-mean--03--quiz$/);
  await expect(page.getByRole("heading",{name:"Share a day’s readings equally",exact:true})).toBeVisible();
});

test("library filters cases and runs the Python challenge, retaining drafts by account",async({page},info)=>{
  test.setTimeout(180000);
  const state=await service(page);
  await page.goto("/practice");
  await expect(page.getByText(/3,456 activities across 48 problem families/)).toBeVisible();
  await page.screenshot({path:info.outputPath("account-library.png")});
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:info.outputPath("account-library-mobile.png")});
  await page.setViewportSize({width:1280,height:960});
  await page.getByLabel("Find a problem").fill("precision");
  await expect(page.getByRole("heading",{name:"How many raised alarms were right?",exact:true})).toBeVisible();
  await page.getByLabel("Find a problem").fill("SQL");
  await expect(page.getByRole("heading",{name:"Find records above this batch’s limit",exact:true})).toBeVisible();
  await page.getByLabel("Find a problem").fill("Share a day");
  await page.getByLabel("Activity",{exact:true}).selectOption("code");
  await page.getByLabel("Case",{exact:true}).selectOption({label:"7"});
  await page.getByRole("link",{name:"Open programming · case 7",exact:true}).click();
  await page.getByRole("button",{name:"Run tests",exact:true}).click();
  await expect(page.getByLabel("Test counts")).toContainText(/[1-9]\d* failed/,{timeout:120000});
  await page.getByText("Show the worked solution",{exact:true}).click();
  await page.getByRole("button",{name:"Replace editor with this solution",exact:true}).click();
  await page.getByRole("button",{name:"Run tests",exact:true}).click();
  await expect(page.getByText("All tests passed",{exact:true})).toBeVisible();
  await expect.poll(()=>state.uploads.some(x=>x.owner==="alice"&&x.key.includes("practice:bank/"))).toBe(true);
  await waitForAccountSync(page);
  await page.reload();
  await expect(page.locator(".cm-content")).toContainText("np.mean");
  state.user="bob";await page.evaluate(()=>window.dispatchEvent(new Event("focus")));
  await expect(page.locator(".cm-content")).toContainText("NotImplementedError");
  await expect(page.locator(".cm-content")).not.toContainText("np.mean");
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:info.outputPath("account-code-mobile.png"),fullPage:true});
  state.user=null;await page.evaluate(()=>window.dispatchEvent(new Event("focus")));
  await expect(page.getByRole("link",{name:"Sign in or create an account",exact:true})).toBeVisible();
  await expect(page.locator(".cm-content")).toHaveCount(0);
});

test("account workshop tests changed batches and keeps undo history out of synced work",async({page},info)=>{
  const state=await service(page);
  await page.goto("/practice/attention-summary--05--workshop");
  await openWorkspaceControls(page);
  await page.getByRole("checkbox",{name:"Animate signals",exact:true}).uncheck();
  await page.getByText("Stuck? Inspect a worked construction",{exact:true}).click();
  await page.getByRole("button",{name:"Assemble an example",exact:true}).click();
  await expect(page.getByRole("button",{name:"Undo",exact:true})).toBeEnabled();
  await page.getByRole("button",{name:"Test all examples",exact:true}).click();
  await expect(page.getByTestId("workshop-test-summary")).toContainText("4 passed");
  await expect.poll(()=>Object.entries(state.saved.alice??{}).some(([key,value])=>key.startsWith("workshop:bank/")&&JSON.stringify(value).includes('"part-'))).toBe(true);
  const record=Object.entries(state.saved.alice).find(([key])=>key.startsWith("workshop:bank/"))![1] as {value:{undo:unknown[];redo:unknown[]}};
  expect(record.value.undo).toEqual([]);expect(record.value.redo).toEqual([]);
  await page.getByRole("button",{name:"Expand floor",exact:true}).click();
  await page.screenshot({path:info.outputPath("account-workshop.png")});
});

test("quiz shows its data and Botie's explanation; unavailable service can be retried",async({page},info)=>{
  const state=await service(page);state.fail=true;
  await page.goto("/practice");
  await waitForAccountReady(page);
  await expect(page.getByRole("alert").filter({hasText:"temporarily unavailable"})).toBeVisible();
  state.fail=false;await page.getByRole("button",{name:"Try again",exact:true}).click();
  await expect(page.getByText(/3,456 activities/)).toBeVisible();
  await page.goto("/practice/scoped-tool-call--03--quiz");
  const quiz=getActivity("scoped-tool-call--03--quiz")!;if(!("quiz" in quiz))throw Error("Missing quiz");
  await page.getByText(quiz.quiz[0].options[0],{exact:true}).click();
  await expect(page.getByRole("status",{name:"Botie's feedback"})).toContainText("That is right.");
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:info.outputPath("account-quiz-mobile.png"),fullPage:true});
});

test("SQL account challenge executes a reusable query against changed tables",async({page})=>{
  test.setTimeout(180000);await service(page);
  await page.goto("/practice/sql-filter-rows--04--code");
  await expect(page.getByLabel("items rows")).toBeVisible();
  await expect(page.getByLabel("limits rows")).toBeVisible();
  await page.getByText("Show the worked solution",{exact:true}).click();
  await page.getByRole("button",{name:"Replace editor with this solution",exact:true}).click();
  await page.getByRole("button",{name:"Run tests",exact:true}).click();
  await expect(page.getByText("All tests passed",{exact:true})).toBeVisible({timeout:120000});
  await expect(page.locator(".cm-content")).toContainText("SELECT id FROM items");
  await page.getByRole("link",{name:"Workshop",exact:true}).click();
  await expect(page.getByText(/Here we build the filtering and projection operations/).filter({visible:true})).toBeVisible();
  await openWorkspaceControls(page);
  await page.getByRole("checkbox",{name:"Animate signals",exact:true}).uncheck();
  await page.getByText("Stuck? Inspect a worked construction",{exact:true}).click();
  await page.getByRole("button",{name:"Assemble an example",exact:true}).click();
  await page.getByRole("button",{name:"Test all examples",exact:true}).click();
  await expect(page.getByTestId("workshop-test-summary")).toContainText("4 passed");
});

