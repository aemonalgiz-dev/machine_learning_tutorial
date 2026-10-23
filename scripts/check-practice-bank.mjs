import {loadPyodide} from "pyodide";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import path from "node:path";
import {families,getActivity,activityId} from "../lib/practice-bank/catalog.mjs";
const root=process.cwd(),report=[];
await mkdir(path.join(root,"audits"),{recursive:true});
const python=await loadPyodide({packageBaseUrl:"https://cdn.jsdelivr.net/pyodide/v314.0.7/full/",packageCacheDir:path.join(root,".practice-checks")});
await python.loadPackage("numpy");
python.runPython(await readFile(path.join(root,"public/python/runner.py"),"utf8"));
python.runPython(await readFile(path.join(root,"public/python/sql_runner.py"),"utf8"));
const run=python.globals.get("run_course_code"),runSql=python.globals.get("run_course_sql");
for(const family of families){
  let failures=0;
  for(let variant=0;variant<24;variant++){
    const id=activityId(family.id,variant,"code"),exercise=getActivity(id).exercise;
    const result=JSON.parse(exercise.language==="sql"?runSql(exercise.solution,exercise.sql.setup,exercise.output,JSON.stringify(exercise.tests)):run(exercise.solution,exercise.output,JSON.stringify(exercise.tests),"[]"));
    const passed=!result.error&&result.tests.every(t=>t.status==="passed");
    report.push({id,passed,...(!passed?{error:result.error,tests:result.tests,stdout:result.stdout,expected:exercise.output}:{})});
    if(!passed)failures++;
  }
  console.log((failures?"FAIL":"PASS")+" "+family.id+" ("+(24-failures)+"/24)");
}
await writeFile(path.join(root,"audits/practice-bank-python.json"),JSON.stringify(report,null,2));
const failed=report.filter(r=>!r.passed);
for(const fail of failed.slice(0,8))console.log(JSON.stringify(fail));
console.log((report.length-failed.length)+"/"+report.length+" reference programs passed in browser Python/SQLite.");
run.destroy();runSql.destroy();process.exitCode=failed.length?1:0;

