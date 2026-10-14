// Shared by instrumentation-client.ts, which counts reading activity, and the
// privacy page, which describes it and lets a reader switch it off.

// Set to "1" only when a reader switches counting off on the privacy page.
export const ACTIVITY_OPT_OUT_KEY = "fitlab.activity.off";

// How long the activity records are kept in CloudWatch Logs. The log group's
// retention setting in AWS has to match this number.
export const ACTIVITY_RETENTION_DAYS = 400;
