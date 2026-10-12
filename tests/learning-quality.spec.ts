import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { buildById } from '../lib/builds/catalog';
import { assemble, evaluate, same, constant, op, source } from '../lib/builds/engine';
import { TOOLS } from '../lib/builds/tools';
import { resultFeedback } from '../lib/builds/coaching';
import { greenhousePrediction } from '../lib/gp-example';
import { initialVae, tinyVaeObjective } from '../lib/tiny-vae';
import { expandedLessonById } from '../lib/lessons';

test('workshop cases reject constants, the wrong gradient direction and omitted activation',()=>{
  const gradient=buildById['gradient-descent-regression'];
  expect(gradient.cases.map(c=>c.expected)).toEqual([3,4,4,-3]);
  const cnn=buildById['convolutional-networks'];
  expect(cnn.cases.map(c=>c.expected)).toEqual([2,1,0,3]);
  for(const [build,value] of [[gradient,3],[cnn,2]] as const){
    const wrong=assemble(constant(value),TOOLS),correct=assemble(build.recipe,TOOLS);
    expect(build.cases.some(c=>!same(evaluate(wrong,c.data,TOOLS).output,c.expected))).toBe(true);
    expect(build.cases.every(c=>same(evaluate(correct,c.data,TOOLS).output,c.expected))).toBe(true);
  }
  const ascent=assemble(op('add',[source('parameter'),op('multiply',[constant(.5),source('gradient')])]),TOOLS);
  expect(evaluate(ascent,gradient.cases[0].data,TOOLS).output).toBe(-3);
  const noActivation=assemble(op('maximum',[op('matvec',[op('windows',[source('image')],{size:2,stride:1}),source('kernel')])]),TOOLS);
  expect(evaluate(noActivation,cnn.cases[2].data,TOOLS).output).toBe(-2);
});

test('Botie recognises a total and reversed division without prescribing one graph',()=>{
  const build=buildById.statistics;
  const total=assemble(op('total',[source('weeklyCounts')]),TOOLS);
  expect(resultFeedback(build,total,evaluate(total,build.cases[0].data,TOOLS),0)).toContain('total across');
  const reverse=assemble(op('divide',[op('count',[source('weeklyCounts')]),op('total',[source('weeklyCounts')])]),TOOLS);
  expect(resultFeedback(build,reverse,evaluate(reverse,build.cases[0].data,TOOLS),0)).toContain('other way round');
});

test('GP mean and uncertainty agree with independent one- and two-reading calculations',()=>{
  const prior=greenhousePrediction([],[],[0,1],1,.25);
  expect(prior.mean).toEqual([20,20]);expect(prior.deviation).toEqual([1,1]);
  const single=greenhousePrediction([0],[22],[0,1,30],1,.25);
  expect(single.mean[0]).toBeCloseTo(21.6,10);
  expect(single.deviation[0]**2).toBeCloseTo(.2,10);
  expect(single.mean[1]).toBeCloseTo(20+1.6*Math.exp(-.5),10);
  expect(single.deviation[1]**2).toBeCloseTo(1-Math.exp(-1)/1.25,10);
  expect(single.mean[2]).toBeCloseTo(20,10);
  const two=greenhousePrediction([0,2],[22,18],[1],1,.25);
  expect(two.mean[0]).toBeCloseTo(20,10);
  expect(two.deviation[0]**2).toBeCloseTo(1-2*Math.exp(-1)/(1.25+Math.exp(-2)),10);
  expect(greenhousePrediction([0,0],[22,22],[0],1,.25).deviation[0]).toBeLessThan(single.deviation[0]);
  expect(()=>greenhousePrediction([0],[],[0],1,.25)).toThrow();
});

test('VAE derivatives match finite differences and the complete loop improves the objective',()=>{
  for(const p of [initialVae,[.4,-.2,.7,.3,-.5]]){
    const result=tinyVaeObjective(p);
    for(let j=0;j<p.length;j++){
      const plus=[...p],minus=[...p];plus[j]+=1e-5;minus[j]-=1e-5;
      expect(result.gradient[j]).toBeCloseTo((tinyVaeObjective(plus).loss-tinyVaeObjective(minus).loss)/2e-5,7);
    }
  }
  let p=[...initialVae];
  for(let step=0;step<1200;step++){const {gradient}=tinyVaeObjective(p);p=p.map((v,j)=>v-.03*gradient[j]);}
  expect(tinyVaeObjective(p).loss).toBeCloseTo(.9581,4);
  expect(tinyVaeObjective(p).loss).toBeLessThan(tinyVaeObjective(initialVae).loss);
});

test('execution errors count as failed and a wrong statistic receives staged coaching',async({page})=>{
  await page.goto('/lab/statistics');
  await page.getByRole('navigation',{name:'Journey stages'}).getByRole('button',{name:/Build your solution/}).click();
  await page.getByRole('checkbox',{name:'Animate signals',exact:true}).uncheck();
  await page.getByRole('button',{name:'Test all examples',exact:true}).click();
  await expect(page.getByTestId('construction-counter')).toHaveText('0 passed · 1 failed · 2 not run');
  for(const name of ['Deaths recorded each week','Add a list'])await page.getByRole('button',{name,exact:true}).click();
  for(const name of ['Deaths recorded each week output','Add a list input 1: Numbers','Add a list output','Result input 1: Your result'])await page.getByRole('button',{name,exact:true}).click();
  await page.getByRole('button',{name:'Test all examples',exact:true}).click();
  await expect(page.getByTestId('construction-counter')).toHaveText('0 passed · 3 failed · 0 not run');
  await expect(page.getByText(/You have the total across/)).toBeVisible();
  await page.getByRole('button',{name:'Ask Botie for a hint',exact:true}).click();
  await expect(page.getByLabel('Workshop hints from Botie').getByRole('listitem')).toHaveCount(1);
  await page.getByRole('button',{name:'Ask Botie for another hint',exact:true}).click();
  await expect(page.getByLabel('Workshop hints from Botie').getByRole('listitem')).toHaveCount(2);
});

test('quiz feedback stays until the reader continues and attention supplies its numerical setup',async({page})=>{
  await page.clock.install();
  await page.goto('/concepts/attention#questions-on-parts-1-and-2');
  await page.getByRole('button',{name:/False/}).click();
  const feedback=page.getByRole('status',{name:"Botie's feedback"});
  await expect(feedback).toBeVisible();
  await page.clock.fastForward(15000);
  await expect(feedback).toBeVisible();
  await expect(page.getByRole('group',{name:'Data for this question'})).toHaveCount(0);
  await page.getByRole('button',{name:'Next question',exact:true}).click();
  await expect(page.getByRole('group',{name:'Data for this question'})).toContainText('Head width = 4');
  await expect(page.getByRole('group',{name:'Data for this question'})).toContainText('red = [1, 0, 0, 0]');
});

test('GP readings change uncertainty and new model widgets fit a narrow screen',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error'&&/hydration|hydrated|server rendered/i.test(message.text()))errors.push(message.text());});
  await page.goto('/concepts/gaussian-process-regression#full-example');
  const gp=page.getByRole('region',{name:'Greenhouse temperature and uncertainty'});
  await expect(gp.getByRole('status')).toContainText('standard deviation 1.00');
  await gp.getByRole('button',{name:'Place this thermometer reading'}).click();
  await expect(gp.getByRole('status')).toContainText('mean 21.60');
  await expect(gp.getByRole('status')).toContainText('standard deviation 0.45');
  await expect(gp.getByRole('table').locator('tbody tr')).toHaveCount(1);
  await page.setViewportSize({width:320,height:900});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await gp.screenshot({path:'.practice-checks/gp-quality-mobile.png'});
  await gp.getByRole('button',{name:'Remove the readings',exact:true}).click();
  await expect(gp.getByRole('status')).toContainText('standard deviation 1.00');
  await page.goto('/concepts/variational-autoencoders#part-5-give-all-five-parameters-a-training-signal');
  const vae=page.getByRole('region',{name:'Train a tiny variational autoencoder'});
  await expect(vae.getByRole('status')).toContainText('1.1995');
  await vae.getByRole('button',{name:'Train 100 updates'}).click();
  await expect(vae.getByRole('status')).toContainText('Updates: 100');
  await vae.getByRole('button',{name:'Generate a new observation'}).click();
  await expect(vae.getByRole('group',{name:'Generated observation'})).toContainText('Prior code:');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await vae.screenshot({path:'.practice-checks/vae-quality-mobile.png'});
  await vae.getByRole('button',{name:'Reset the model'}).click();
  await expect(vae.getByRole('status')).toContainText('Updates: 0');
  await expect(vae.getByRole('group',{name:'Generated observation'})).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('function checks reject copied output and a project exports the actual run as JSON',async({page,context})=>{
  await context.route('https://cdn.jsdelivr.net/pyodide/v314.0.7/full/*.whl',async route=>{
    try{const body=await readFile(path.join(process.cwd(),'.practice-checks',path.basename(new URL(route.request().url()).pathname)));await route.fulfill({body,contentType:'application/zip',headers:{'access-control-allow-origin':'*'}});}catch{await route.continue();}
  });
  await page.goto('/concepts/project-demand-forecast#practice-work-through-the-problem-with-numpy');
  const exercise=expandedLessonById['project-demand-forecast'].practice.find(item=>item.exports?.[0]?.filename==='greenhouse-forecast-report.json')!;
  await page.getByRole('button',{name:`Challenge 4: ${exercise.title}`,exact:true}).click();
  await page.locator('.cm-content').fill(`print(${JSON.stringify(exercise.output)})`);
  await page.getByRole('button',{name:'Run tests',exact:true}).click();
  await expect(page.getByText('Some tests need another look',{exact:true})).toBeVisible({timeout:120000});
  await expect(page.getByLabel('Test counts')).toContainText('4 failed');
  await page.locator('.cm-content').fill(exercise.solution);
  await page.getByRole('button',{name:'Run tests',exact:true}).click();
  await expect(page.getByText('All tests passed',{exact:true})).toBeVisible();
  const downloadPromise=page.waitForEvent('download');
  await page.getByRole('button',{name:'Download greenhouse-forecast-report.json'}).click();
  const download=await downloadPromise;
  const report=JSON.parse(await readFile((await download.path())!,'utf8'));
  expect(report.origins).toEqual([5,6,7,8,9]);
  expect(report.model.intercept+report.model.lag_coefficient*report.model.last_input).toBeCloseTo(report.predicted.at(-1),10);
  expect(report.model.training_end_index).toBe(8);
  await page.getByRole('button',{name:'Run code',exact:true}).click();
  await expect(page.getByRole('button',{name:'Download greenhouse-forecast-report.json'})).toBeVisible();
  await expect(page.getByText('All tests passed',{exact:true})).toHaveCount(0);
});
