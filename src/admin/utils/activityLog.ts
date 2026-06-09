const ACTIVITY_LOG_KEY = "sbp_activity_log";

export function logActivity(action: string, detail: string = "") {
  try {
    const logs = JSON.parse(localStorage.getItem(ACTIVITY_LOG_KEY) || "[]");
    logs.unshift({ action, detail, timestamp: new Date().toISOString() });
    if (logs.length > 100) logs.splice(100);
    localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(logs));
  } catch {
    // silently fail
  }
}

export function getActivityLog(): { action: string; detail: string; timestamp: string }[] {
  try {
    return JSON.parse(localStorage.getItem(ACTIVITY_LOG_KEY) || "[]");
  } catch {
    return [];
  }
}
