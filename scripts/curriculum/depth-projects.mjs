import { section, appendParts, functionTask } from './depth-helpers.mjs';

export function deepenProjects(lessons) {
  const forecast=lessons.find(l=>l.id==='project-demand-forecast');
  // Keep this prerequisite with the first definition of a one-day lag.
  forecast.parts[0].paragraphs.push('A row is not automatically a day. Keep a date beside every measurement, then check that the dates are unique, ordered and consecutive before making lag pairs. If Tuesday is missing, the row before Wednesday is Monday; treating it as yesterday changes the question without telling the model. The calendar challenge below deliberately refuses that sequence. Repairing or imputing a missing measurement requires a separate, stated rule using only information available at the forecast origin.');
  appendParts(forecast,[
    section('Try a Record That Does Not Follow Our Rule Exactly','A short, tidy record can make a fitted rule look more useful than it is. Now give Botie daily water measurements with both an upward trend and days that interrupt it. Keep the last five days for successive one-day forecasts. At each origin, train only on the prefix that would have existed then.\n\nCompare the learned lag rule with persistence on exactly the same dates. Keep every error before taking an average. If the learned model loses, report that result. The purpose of this project is to discover whether fitting helped, not to arrange a victory for the fitted model.', 'Litres by day: [8,10,9,13,12,16,14,19,13,18]\nFirst forecast: index 5, using indices 0 through 4\nNext forecast: index 6, using indices 0 through 5','These are invented measurements. A result on this sequence is an implementation check, not evidence of performance at a real greenhouse.'),
    section('Make the Information Boundary Part of the Function','Write rolling_report so the function receives the complete sequence but slices a fresh training prefix inside each iteration. That makes the boundary visible in one place. Pair each previous reading with the following reading inside that prefix; never pair the final training reading with the hidden target while fitting.\n\nReturn a dictionary of named lists: origins, actual, predicted and baseline. Their matching positions describe the same forecast. Add the two mean absolute errors in the stated order. A dictionary is useful here because an unnamed tuple makes it easy to mistake actual values for predictions.\n\nChange only the very last observation and run the function again. All predictions should stay unchanged, while the last actual value and measured error can change. This test checks the procedure rather than whether one printed answer looks plausible.'),
    section('Save Enough to Reproduce a Forecast','For the final evaluation date, save the intercept, lag coefficient, previous-day reading and final training index. Record feature order, units and a format version alongside the parameters. These values let another program reproduce that particular forecast.\n\nThe downloadable JSON report also contains all forecast origins, predictions, targets and baseline errors. JSON represents a dictionary as named fields and NumPy arrays as ordinary lists. Convert values to Python numbers before serializing. Do not include a Python object that only the original process knows how to reconstruct.', 'saved prediction = intercept + lag_coefficient × last_input','This saved model was fitted before the final evaluation target. A deployment model might later be refitted on more observations; give that model a new record rather than silently replacing the evaluated one.'),
    section('Decide What the Errors Tell Us to Try Next','Inspect the largest date-level errors. Did both rules miss a sudden change, or did the fitted rule amplify a temporary increase? A weather measurement might explain a change, but only use a weather value that would have been available when the forecast was made.\n\nKeep a later period untouched while choosing features and settings. Repeatedly choosing whichever rule wins on these five dates turns this small evaluation into training feedback. The final report should state the time boundary, the baseline comparison and a specific next experiment, including a disappointing result when that is what the measurements show.')
  ]);
  const f=functionTask('Can you produce a forecast report that another program can verify?',["A forecast report should keep each prediction beside the date position it concerns. Implement rolling_report(y, start). At each origin from start through the final index, fit an intercept and one lag coefficient on y[:origin] with np.linalg.lstsq. Predict from the newest available reading, keeping that origin's actual value outside fitting.","Return a dictionary containing origins, actual, predicted, baseline and mae as ordinary Python lists. Baseline is persistence. In mae, put persistence error first and fitted-rule error second; each is mean absolute error on the same targets.","Also return model with version=1, units=litres, feature_order=[previous_day_litres], intercept, lag_coefficient, last_input and training_end_index from the final fit. Require a finite one-dimensional sequence and an integer start from 3 through len(y)-1. Reject a training prefix whose lag inputs do not vary. Raise ValueError for these invalid inputs.","The supplied final lines create report_json. After running the program, download the report and check which method performed better."],'import json\nimport numpy as np','def rolling_report(y, start):',
`    y=np.asarray(y,dtype=float)
    if y.ndim!=1 or not np.isfinite(y).all():
        raise ValueError('Use a finite one-dimensional sequence')
    if not isinstance(start,(int,np.integer)) or isinstance(start,(bool,np.bool_)) or not 3<=start<len(y):
        raise ValueError('Invalid first forecast index')
    report={key:[] for key in ['origins','actual','predicted','baseline']}
    for origin in range(start,len(y)):
        history=y[:origin]
        if np.ptp(history[:-1])==0:
            raise ValueError('Lag inputs must vary')
        X=np.column_stack([np.ones(origin-1),history[:-1]])
        coefficients=np.linalg.lstsq(X,history[1:],rcond=None)[0]
        report['origins'].append(int(origin))
        report['actual'].append(float(y[origin]))
        report['predicted'].append(float(coefficients[0]+coefficients[1]*history[-1]))
        report['baseline'].append(float(history[-1]))
    actual=np.array(report['actual'])
    report['mae']=[float(np.mean(np.abs(actual-np.array(report[key])))) for key in ['baseline','predicted']]
    report['model']={'version':1,'units':'litres','feature_order':['previous_day_litres'],
        'intercept':float(coefficients[0]),'lag_coefficient':float(coefficients[1]),
        'last_input':float(history[-1]),'training_end_index':int(origin-1)}
    return report`,
`report=rolling_report([8,10,9,13,12,16,14,19,13,18],5)
report['dataset']='Invented greenhouse water measurements'
report['horizon_days']=1
report_json=json.dumps(report,indent=2,allow_nan=False)
print(report['origins'])
print(np.round(report['mae'],3).tolist())`, '[5, 6, 7, 8, 9]\n[4.4, 4.343]',[
    'The rows used for fitting are history[:-1] and history[1:]. The forecast input is history[-1], whose next value is still hidden.',
    'The last saved training index is the last forecast origin minus one. The model fields must come from that last fit.'
  ],[
    ['A changed final target cannot change predictions','a=np.array([3.,7.,4.,9.,8.,12.,6.]); b=a.copy(); b[-1]=1000\nx=rolling_report(a,3); y=rolling_report(b,3)\nnp.testing.assert_allclose(x[\'predicted\'],y[\'predicted\'])\nassert x[\'actual\'][-1]!=y[\'actual\'][-1]'],
    ['Every forecast uses its own training prefix','y=np.array([2.,5.,4.,8.,6.,11.]); r=rolling_report(y,3)\nassert r[\'origins\']==[3,4,5]\nfor i,origin in enumerate(r[\'origins\']):\n    h=y[:origin]; slope=np.sum((h[:-1]-h[:-1].mean())*(h[1:]-h[1:].mean()))/np.sum((h[:-1]-h[:-1].mean())**2)\n    expected=h[1:].mean()+slope*(h[-1]-h[:-1].mean())\n    np.testing.assert_allclose(r[\'predicted\'][i],expected)\nnp.testing.assert_allclose(r[\'mae\'],[np.mean(np.abs(y[3:]-r[k])) for k in [\'baseline\',\'predicted\']])'],
    ['The saved model reproduces the last reported forecast','r=json.loads(json.dumps(rolling_report([4,7,5,10,8,12],3)))\nm=r[\'model\']; assert m[\'training_end_index\']==4\nassert m[\'feature_order\']==[\'previous_day_litres\'] and m[\'units\']==\'litres\'\nnp.testing.assert_allclose(m[\'intercept\']+m[\'lag_coefficient\']*m[\'last_input\'],r[\'predicted\'][-1])'],
    ['Invalid information boundaries are rejected','for y,start in [([1,2,3],3),([1,2,3,4],2.5),([1,2,float(\'nan\'),4],3),([1,1,1,3],3)]:\n    try: rolling_report(y,start)\n    except ValueError: pass\n    else: raise AssertionError(\'Expected ValueError\')']
  ]);
  f.exports=[{variable:'report_json',filename:'greenhouse-forecast-report.json'}];
  const calendar=functionTask('Does the record really contain one measurement per day?',[
    'Implement daily_values(dates, values). Return a copy of values as a one-dimensional float array only when both inputs are matching one-dimensional sequences with at least two entries, every value is finite, and the dates form a consecutive daily sequence in the supplied order.',
    'Use NumPy datetime64[D] for the dates. Reject missing dates, repeated dates, reversed dates, missing measurements or mismatched lengths with ValueError. Do not sort, fill or remove records silently. The later forecast procedure assumes this check has already succeeded.'
  ],'import numpy as np','def daily_values(dates, values):',
`    dates=np.asarray(dates,dtype='datetime64[D]')
    values=np.asarray(values,dtype=float)
    if dates.ndim!=1 or values.ndim!=1 or len(dates)!=len(values) or len(values)<2:
        raise ValueError('Use matching daily records')
    if np.isnat(dates).any() or not np.isfinite(values).all():
        raise ValueError('Missing or invalid record')
    if not np.all(np.diff(dates)==np.timedelta64(1,'D')):
        raise ValueError('Missing or repeated calendar day')
    return values.copy()`,
`print(daily_values(['2026-09-01','2026-09-02','2026-09-03'],[8,10,9]).tolist())
try:
    daily_values(['2026-09-01','2026-09-03'],[8,9])
except ValueError:
    print('Missing or repeated calendar day')`, '[8.0, 10.0, 9.0]\nMissing or repeated calendar day',[
    'Subtract neighbouring dates with np.diff. Every difference must be exactly one day, including across a month boundary.',
    'A NaT date and a non-finite measurement need rejection before fitting. An absent day cannot be recovered by compressing the array.'
  ],[
    ['A month boundary is still one day','values=np.array([3.,4.,5.]); result=daily_values([\'2026-09-30\',\'2026-10-01\',\'2026-10-02\'],values)\nnp.testing.assert_array_equal(result,values)\nresult[0]=100\nassert values[0]==3'],
    ['Gaps, duplicates and reversed dates are rejected','for dates in [[\'2026-09-01\',\'2026-09-03\'],[\'2026-09-01\',\'2026-09-01\'],[\'2026-09-02\',\'2026-09-01\']]:\n    try: daily_values(dates,[1,2])\n    except ValueError: pass\n    else: raise AssertionError(\'Expected ValueError\')'],
    ['Missing values and mismatched records cannot reach the model','for dates,values in [([\'NaT\',\'2026-09-02\'],[1,2]),([\'2026-09-01\',\'2026-09-02\'],[1,float(\'nan\')]),([\'2026-09-01\',\'2026-09-02\'],[1])]:\n    try: daily_values(dates,values)\n    except ValueError: pass\n    else: raise AssertionError(\'Expected ValueError\')']
  ]);
  forecast.practice.push(calendar,f);

  const sensor=lessons.find(l=>l.id==='project-sensor-investigation');
  appendParts(sensor,[
    section('Keep a Record of the Decision, Then Add the Inspection','A detector produces an alert before a person knows whether the sensor failed. Give every reading a stable identifier and store its value, score, threshold, rule version and decision. Add the inspection result later, rather than overwriting the original decision.\n\nAn uninspected reading does not mean a healthy sensor. If inspectors only examine alerts, measured precision may be available while missed failures remain unknown. Sample some non-alerts for inspection when the project needs a recall estimate. Keep these two sources of evidence separate in the report.'),
    section('Freeze the Reference While Scoring New Batches','The reference median and median absolute deviation describe the period we chose as normal. A new extreme reading must not change those numbers while it is being scored. Otherwise, the reading can move its own threshold.\n\nA changed production process may eventually justify a new reference period, but inspect the shift first. Store the new rule with a new version and compare its decisions with the previous one. A zero reference deviation needs an explicit policy; our function rejects it instead of dividing by zero or inventing a tolerance.'),
    section('Make an Inspection Report Reproducible','Save the frozen rule with the values, scores and alert flags. A second program should be able to reproduce every decision using only that report. Include the strict comparison convention: a score equal to the threshold is not an alert here.\n\nTry a fresh batch with one enormous reading. Scores for the unchanged readings should stay the same. Then try a genuinely different reference rule and explain which decisions change. The report is an inspectable record of a rule, not proof that every alert was a real fault.')
  ]);
  const s=functionTask('Can you score fresh readings without moving the reference?',[
    'Implement score_alerts(values, rule), returning NumPy arrays (scores, alerts). The dictionary rule supplies centre, mad and threshold. Scores are absolute distances from centre divided by mad; alerts use a strict greater-than comparison.',
    'Require a finite one-dimensional input, finite rule values, positive mad and nonnegative threshold. Raise ValueError otherwise. Do not refit the reference from values. Run the supplied report code and download the result.'
  ],'import json\nimport numpy as np','def score_alerts(values, rule):',
`    values=np.asarray(values,dtype=float)
    centre,mad,threshold=[float(rule[k]) for k in ['centre','mad','threshold']]
    if values.ndim!=1 or not np.isfinite(values).all() or not np.isfinite([centre,mad,threshold]).all() or mad<=0 or threshold<0:
        raise ValueError('Invalid readings or reference rule')
    scores=np.abs(values-centre)/mad
    return scores,scores>threshold`,
`values=[9,14,16,17]
rule={'version':1,'centre':10,'mad':1,'threshold':4}
scores,alerts=score_alerts(values,rule)
report_json=json.dumps({'rule':rule,'values':values,'scores':scores.tolist(),'alerts':alerts.tolist()},indent=2)
print(scores.tolist())
print(alerts.tolist())`, '[1.0, 4.0, 6.0, 7.0]\n[False, False, True, True]',[
    'Read centre and mad from the dictionary. Computing either from this batch would change the detector you are evaluating.',
    'Compare the entire score array with the threshold. NumPy returns one Boolean for each reading.'
  ],[
    ['A different reference and boundary give the stated decisions','scores,alerts=score_alerts([2,6,12],{\'centre\':6,\'mad\':2,\'threshold\':2})\nnp.testing.assert_allclose(scores,[2,0,3])\nnp.testing.assert_array_equal(alerts,[False,False,True])'],
    ['An extreme new reading cannot move earlier scores','rule={\'centre\':10,\'mad\':2,\'threshold\':3}\na=score_alerts([8,12],rule)[0]; b=score_alerts([8,12,1000000],rule)[0]\nnp.testing.assert_array_equal(a,b[:2])'],
    ['Undefined reference scales are rejected','for values,rule in [([1],{\'centre\':1,\'mad\':0,\'threshold\':4}),([float(\'nan\')],{\'centre\':1,\'mad\':2,\'threshold\':4})]:\n    try: score_alerts(values,rule)\n    except ValueError: pass\n    else: raise AssertionError(\'Expected ValueError\')']
  ]);
  s.exports=[{variable:'report_json',filename:'sensor-inspection-report.json'}];
  sensor.practice.push(s);

  const seed=lessons.find(l=>l.id==='project-seed-counting');
  appendParts(seed,[
    section('Make a Test Collection That Can Disagree with Us','Our small pixel example checks the arithmetic. A useful counting project also needs images where the assumption of separated bright seeds is wrong. Collect dim seeds, touching seeds, dust, shadows and seeds clipped by the image boundary. Record a human count for each image and describe the counting convention for partial seeds.\n\nSeparate development images, used to choose a threshold and minimum area, from untouched evaluation images. Several crops from the same photograph should stay together so almost identical regions do not appear on both sides. Report count errors by scene condition, not only one average.'),
    section('Keep the Mask and Regions Beside the Count','When a count is wrong, the final integer rarely tells us why. Save the threshold mask, connected-region labels and each region’s area. A missing dim seed disappears in the mask. Two touching seeds can survive the mask but share one region. Dust can appear as tiny separate regions.\n\nOur four-neighbour search joins pixels through shared edges. It deliberately leaves diagonal contact separate. The next challenge asks you to implement that search with a stack of pixel coordinates, a Boolean visited array and a list of region sizes. Those data structures each have a distinct job.'),
    section('Know When a Threshold Cannot Supply the Missing Information','Lowering a threshold might recover a dim seed while admitting more background. Increasing a size cutoff can remove dust while discarding a small real seed. Neither adjustment can reliably separate two objects that form one bright region.\n\nThe next experiment might change lighting, use shape information to split a region, or train a segmentation model with labelled images. Preserve the failed examples when making that decision. They explain why a more complicated method is needed and give it a fair test.')
  ]);
  const c=functionTask('Can you find the connected seeds in a new mask?',[
    'Implement component_sizes(mask). Require a two-dimensional Boolean NumPy array, use four-neighbour connectivity and return a sorted Python list of foreground region sizes. An empty or entirely background image returns []. Reject other dimensions or non-Boolean data with ValueError, and do not modify the input.',
    'The supplied example converts intensities into a mask, filters regions by area and writes a report. The extra tests include diagonal contact, a ring, and empty images so memorising this example cannot pass.'
  ],'import json\nimport numpy as np','def component_sizes(mask):',
`    mask=np.asarray(mask)
    if mask.ndim!=2 or mask.dtype!=np.bool_:
        raise ValueError('Use a two-dimensional Boolean mask')
    seen=np.zeros_like(mask)
    rows,cols=mask.shape
    sizes=[]
    for r in range(rows):
        for c in range(cols):
            if not mask[r,c] or seen[r,c]: continue
            stack=[(r,c)]; seen[r,c]=True; size=0
            while stack:
                y,x=stack.pop(); size+=1
                for ny,nx in [(y-1,x),(y+1,x),(y,x-1),(y,x+1)]:
                    if 0<=ny<rows and 0<=nx<cols and mask[ny,nx] and not seen[ny,nx]:
                        seen[ny,nx]=True
                        stack.append((ny,nx))
            sizes.append(size)
    return sorted(sizes)`,
`image=np.array([[0,8,8,0],[0,8,0,9],[0,0,0,0],[7,7,0,6]])
mask=image>5
areas=component_sizes(mask)
count=sum(area>=2 for area in areas)
report_json=json.dumps({'threshold':5,'minimum_area':2,'connectivity':4,'image':image.tolist(),'mask':mask.tolist(),'areas':areas,'count':count},indent=2)
print(areas)
print(count)`, '[1, 1, 2, 3]\n2',[
    'Mark a pixel visited when placing it on the stack, so two neighbours cannot add it twice.',
    'Finish one stack before searching for the next unvisited foreground pixel. Each completed stack gives one region size.'
  ],[
    ['Diagonal contact does not join four-neighbour regions','assert component_sizes(np.eye(4,dtype=bool))==[1,1,1,1]'],
    ['A ring is one region and input data stays unchanged','mask=np.ones((3,3),dtype=bool); mask[1,1]=False; before=mask.copy()\nassert component_sizes(mask)==[8]\nnp.testing.assert_array_equal(mask,before)'],
    ['Empty and background masks have no regions','assert component_sizes(np.zeros((0,4),dtype=bool))==[]\nassert component_sizes(np.zeros((3,4),dtype=bool))==[]'],
    ['Invalid masks are rejected','for mask in [np.array([True,False]),np.array([[0,1]])]:\n    try: component_sizes(mask)\n    except ValueError: pass\n    else: raise AssertionError(\'Expected ValueError\')']
  ]);
  c.exports=[{variable:'report_json',filename:'seed-counting-report.json'}];
  seed.practice.push(c);
}
