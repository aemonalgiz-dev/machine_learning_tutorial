import diagnosis from './model-evaluation-diagnosis.mjs';
import comparisons from './model-evaluation-comparisons.mjs';
import repairs from './model-evaluation-repairs.mjs';
const modelEvaluationLessons = [...diagnosis, ...comparisons, ...repairs];
export default modelEvaluationLessons;
