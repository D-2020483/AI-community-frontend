/**
 * Generates a professional HTML welcome email for newly created authorities
 * and officers. Simulates the automated email delivery flow.
 */

const SYSTEM_NAME = "Civic Link";
const LOGIN_URL = "https://civiclink.gov/login";

function generateTemporaryPassword() {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const digits = "23456789";
  const symbols = "!@#$%";
  const all = upper + lower + digits + symbols;
  let pw = "";
  pw += upper[Math.floor(Math.random() * upper.length)];
  pw += lower[Math.floor(Math.random() * lower.length)];
  pw += digits[Math.floor(Math.random() * digits.length)];
  pw += symbols[Math.floor(Math.random() * symbols.length)];
  for (let i = 0; i < 8; i++) {
    pw += all[Math.floor(Math.random() * all.length)];
  }
  return pw;
}

function wrap(content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${SYSTEM_NAME} — Account Created</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f1f5f9; color: #1e293b; padding: 32px; }
  .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(15,23,42,.08); }
  .hero { background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 28px 32px; color: #fff; }
  .hero .brand { font-size: 14px; font-weight: 800; letter-spacing: .1em; }
  .hero h1 { font-size: 22px; font-weight: 800; margin-top: 8px; }
  .body { padding: 32px; }
  .body p { font-size: 14px; line-height: 1.7; color: #475569; }
  .credentials { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; }
  .credentials .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eef2f7; }
  .credentials .row:last-child { border-bottom: none; }
  .credentials .label { font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .05em; }
  .credentials .value { font-size: 14px; font-weight: 700; color: #0f172a; }
  .credentials .password { font-family: ui-monospace, monospace; background: #eef2ff; color: #4f46e5; padding: 2px 8px; border-radius: 6px; }
  .login-btn { display: inline-block; margin-top: 8px; background: #4f46e5; color: #fff !important; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 700; font-size: 14px; }
  .footer { padding: 20px 32px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; }
</style>
</head>
<body>
  <div class="card">
    <div class="hero">
      <div class="brand">🛡️ ${SYSTEM_NAME}</div>
      <h1>Your account has been created</h1>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>This is an automated message from ${SYSTEM_NAME}. Please do not reply to this email.</p>
      <p style="margin-top:6px">© ${new Date().getFullYear()} ${SYSTEM_NAME} Community Services</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Builds the admin email preview object for an authority.
 */
export function buildAuthorityEmail({ name, email, tempPassword, inviteUrl }) {
  const content = `
    <p>Hello <strong>${name}</strong>,</p>
    <p>Your government authority account has been created on the <strong>${SYSTEM_NAME}</strong> platform. You can now log in to manage and resolve community reports assigned to your authority.</p>
    <div class="credentials">
      <div class="row"><span class="label">Login URL</span><span class="value">${LOGIN_URL}</span></div>
      <div class="row"><span class="label">Official Email</span><span class="value">${email}</span></div>
      <div class="row"><span class="label">Temporary Password</span><span class="value"><span class="password">${tempPassword}</span></span></div>
      ${inviteUrl ? `<div class="row"><span class="label">Activation Link</span><span class="value"><a href="${inviteUrl}">Activate account</a></span></div>` : ""}
    </div>
    <p><strong>Important:</strong> Activate your account using the link above, or sign in with the temporary password and set a new password on first login.</p>
    <a class="login-btn" href="${inviteUrl || LOGIN_URL}">Go to Login</a>
  `;
  return wrap(content);
}

export function buildOfficerEmail({ name, email, tempPassword, authority, inviteUrl }) {
  const content = `
    <p>Hello <strong>${name}</strong>,</p>
    <p>Your officer account has been created on the <strong>${SYSTEM_NAME}</strong> platform under <strong>${authority}</strong>. You can now log in to view and resolve reports assigned to you.</p>
    <div class="credentials">
      <div class="row"><span class="label">Login URL</span><span class="value">${LOGIN_URL}</span></div>
      <div class="row"><span class="label">Official Email</span><span class="value">${email}</span></div>
      <div class="row"><span class="label">Temporary Password</span><span class="value"><span class="password">${tempPassword}</span></span></div>
      ${inviteUrl ? `<div class="row"><span class="label">Activation Link</span><span class="value"><a href="${inviteUrl}">Activate account</a></span></div>` : ""}
    </div>
    <p><strong>Important:</strong> Activate your account using the link above, or sign in with the temporary password and set a new password on first login.</p>
    <a class="login-btn" href="${inviteUrl || LOGIN_URL}">Go to Login</a>
  `;
  return wrap(content);
}

export { generateTemporaryPassword, LOGIN_URL, SYSTEM_NAME };
