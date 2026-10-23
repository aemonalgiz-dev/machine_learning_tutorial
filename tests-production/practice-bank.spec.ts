import "../tests/practice-bank-browser.spec";
import {test,expect} from "@playwright/test";
import {readdir,readFile} from "node:fs/promises";
import path from "node:path";

test("production guest responses and public bundles omit account exercise definitions",async({request})=>{
  const page=await request.get("/practice/sensor-mean--01--code");
  expect(page.status()).toBe(200);
  const html=await page.text();
  expect(html).not.toContain("def _bank_close");
  expect(html).not.toContain("The denominator comes from the list");
  const denied=await request.get("/practice-api/activity/sensor-mean--01--code",{headers:{"X-FitLab-Account":"forged",Cookie:"fitlab_session=forged"}});
  expect([401,503]).toContain(denied.status());
  expect(denied.headers()["cache-control"]).toBe("private, no-store");
  expect(await denied.text()).not.toContain("def solve");
  let bundles=0;
  async function inspect(directory:string){
    for(const entry of await readdir(directory,{withFileTypes:true})){
      const file=path.join(directory,entry.name);
      if(entry.isDirectory())await inspect(file);
      else if(entry.name.endsWith(".js")){
        bundles++;
        const body=await readFile(file,"utf8");
        expect(body,file).not.toContain("def _bank_close");
        expect(body,file).not.toContain("The denominator comes from the list");
      }
    }
  }
  await inspect(path.join(process.cwd(),".next/static"));
  expect(bundles).toBeGreaterThan(0);
});
