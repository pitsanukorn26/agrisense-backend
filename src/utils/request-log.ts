type LogEntry = {
  ts: string;
  method: string;
  url: string;
  status: number;
  ms: number;
};

const MAX_LOGS = Number(process.env.REQUEST_LOG_LIMIT || 200);
const logs: LogEntry[] = [];

export function recordLog(entry: LogEntry) {
  logs.push(entry);
  if (logs.length > MAX_LOGS) {
    logs.shift();
  }
}

export function getLogs(limit?: number) {
  const slice = typeof limit === "number" ? logs.slice(-limit) : logs;
  return slice.slice().reverse(); // newest first
}
