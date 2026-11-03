import { databricksPlatformIntroduction, databricksWorkspaceCompute } from './databricks-intro-platform.mjs';
import { databricksDataLakes, databricksTableNames } from './databricks-intro-storage.mjs';
import { databricksBasics } from './databricks-basics.mjs';
import { databricksNotebooksJobs, databricksMlflowBasics } from './databricks-intro-workflows.mjs';

// The platform is introduced before the specialized pipeline tutorials.
// One topic keeps the reading order intact in the section's learning map.
export const databricksIntroductionRecords = [
  databricksPlatformIntroduction,
  databricksDataLakes,
  databricksWorkspaceCompute,
  databricksTableNames,
  databricksBasics,
  databricksNotebooksJobs,
  databricksMlflowBasics,
];
for (const record of databricksIntroductionRecords) {
  record.section = 'Introduction to Databricks';
  record.topic = 'Databricks Fundamentals';
  record.openingBeforeHistory = true;
}
