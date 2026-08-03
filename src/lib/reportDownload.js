/**
 * Generates a polished, printable HTML report for a given report object and
 * triggers a browser download as a standalone .html file.
 */
export function downloadReport(report) {
  if (!report) return;

  const statusColor = {
    Pending: "#d97706",
    Assigned: "#4f46e5",
    "In Progress": "#2563eb",
    Resolved: "#059669",
    Rejected: "#e11d48",
  };

  const statusClass = statusColor[report.status] || "#64748b";

  const safeText = (val) => (val ? String(val) : "—");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${safeText(report.title)} — Civic Link Report</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f1f5f9; color: #1e293b; padding: 32px; }
  .page { max-width: 820px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(15,23,42,.08); }
  .hero { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; padding: 32px; }
  .hero .brand { font-size: 12px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; opacity: .85; }
  .hero h1 { font-size: 26px; font-weight: 800; margin-top: 8px; line-height: 1.25; }
  .hero .id { display: inline-block; margin-top: 12px; background: rgba(255,255,255,.16); border: 1px solid rgba(255,255,255,.25); padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }
  .hero .status { display: inline-block; margin-left: 8px; background: ${statusClass}; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }
  .body { padding: 32px; }
  .section-title { font-size: 11px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: #64748b; margin: 24px 0 10px; }
  .section-title:first-child { margin-top: 0; }
  .desc { font-size: 14px; line-height: 1.7; color: #334155; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .field { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; }
  .field .label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #94a3b8; }
  .field .value { font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 4px; }
  .timeline { display: flex; align-items: center; gap: 0; margin-top: 14px; }
  .step { flex: 1; text-align: center; position: relative; }
  .step .dot { width: 26px; height: 26px; border-radius: 50%; margin: 0 auto; background: #e2e8f0; border: 2px solid #cbd5e1; position: relative; z-index: 1; }
  .step.active .dot { background: #4f46e5; border-color: #4f46e5; }
  .step .name { font-size: 11px; font-weight: 700; color: #64748b; margin-top: 8px; }
  .step.active .name { color: #0f172a; }
  .step:not(:first-child)::before { content: ""; position: absolute; top: 13px; left: -50%; width: 100%; height: 3px; background: #e2e8f0; }
  .step.active:not(:first-child)::before { background: #4f46e5; }
  .footer { padding: 20px 32px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; }
  @media print { body { background: #fff; padding: 0; } .page { box-shadow: none; border-radius: 0; } }
</style>
</head>
<body>
  <div class="page">
    <div class="hero">
      <div class="brand">Civic Link — Community Report</div>
      <h1>${safeText(report.title)}</h1>
      <div>
        <span class="id">${safeText(report.id)}</span>
        <span class="status">${safeText(report.status)}</span>
      </div>
    </div>
    <div class="body">
      <div class="section-title">Issue description</div>
      <p class="desc">${safeText(report.description || "No description provided.")}</p>

      <div class="section-title">Report details</div>
      <div class="grid">
        <div class="field"><div class="label">Category</div><div class="value">${safeText(report.category)}</div></div>
        <div class="field"><div class="label">Priority</div><div class="value">${safeText(report.priority)}</div></div>
        <div class="field"><div class="label">Location</div><div class="value">${safeText(report.location)}</div></div>
        <div class="field"><div class="label">Date reported</div><div class="value">${safeText(report.date)}</div></div>
        <div class="field"><div class="label">Assigned authority</div><div class="value">${safeText(report.authority)}</div></div>
        <div class="field"><div class="label">AI confidence</div><div class="value">${safeText(report.confidence)}</div></div>
      </div>

      <div class="section-title">Progress</div>
      <div class="timeline">
        ${(
          report.progressSteps || [
            "Submitted",
            "Assigned",
            "In Progress",
            "Resolved",
          ]
        )
          .map((step, i, arr) => {
            const statusIdx = report.progressSteps
              ? arr.findIndex(
                  (s) =>
                    s.toLowerCase() === String(report.status).toLowerCase(),
                )
              : -1;
            const isActive = statusIdx === -1 ? i === 0 : i <= statusIdx;
            return `<div class="step ${isActive ? "active" : ""}"><div class="dot"></div><div class="name">${step}</div></div>`;
          })
          .join("")}
      </div>
    </div>
    <div class="footer">
      <span>Generated by Civic Link · ${new Date().toLocaleString()}</span>
      <span>${safeText(report.id)}</span>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${report.id || "report"}-civic-link-report.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
