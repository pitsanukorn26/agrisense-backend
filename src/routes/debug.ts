import express from "express";
import { getLogs } from "../utils/request-log.js";

const router = express.Router();

const htmlEscape = (s: string) =>
  s.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return ch;
    }
  });

function checkToken(req: express.Request, res: express.Response) {
  const token = process.env.DEBUG_LOG_TOKEN;
  if (token && req.header("x-debug-token") !== token) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

router.get("/logs", (req, res) => {
  if (!checkToken(req, res)) return;

  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const data = getLogs(limit);
  res.json({ data });
});

router.get("/logs/view", (req, res) => {
  if (!checkToken(req, res)) return;

  const limit = req.query.limit ? Number(req.query.limit) : 100;
  const data = getLogs(limit);
  const rows = data
    .map(
      (l) =>
        `<tr><td>${htmlEscape(l.ts)}</td><td>${htmlEscape(
          l.method
        )}</td><td>${htmlEscape(l.url)}</td><td>${l.status}</td><td>${l.ms} ms</td></tr>`
    )
    .join("");
  res.send(
    `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Request Logs</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 16px; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
      th { background: #f4f4f4; text-align: left; }
      tr:nth-child(even) { background: #fafafa; }
      code { background: #f6f8fa; padding: 2px 4px; border-radius: 4px; }
    </style>
  </head>
  <body>
    <h3>Request Logs (latest first)</h3>
    <p>Limit: ${limit} &nbsp; <code>/api/debug/logs/view?limit=50</code> &nbsp; or JSON: <code>/api/debug/logs?limit=50</code></p>
    <table>
      <thead>
        <tr><th>Timestamp</th><th>Method</th><th>URL</th><th>Status</th><th>Time</th></tr>
      </thead>
      <tbody>
        ${rows || "<tr><td colspan='5'>No logs yet</td></tr>"}
      </tbody>
    </table>
  </body>
</html>`
  );
});

export default router;
