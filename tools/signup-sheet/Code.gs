/**
 * ArabTides — email sign-ups → this Google Sheet.
 * Paste into Extensions → Apps Script of your Sheet, then Deploy → Web app (see README.md).
 * The website POSTs: email, source, page, port (+ a hidden "website" honeypot field).
 */
const SHEET_NAME = 'Signups';
const HEADERS = ['date', 'email', 'source', 'page', 'port'];

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p.website) return json_({ ok: true });                       // honeypot filled → bot, ignore silently
  const email = String(p.email || '').trim().toLowerCase();
  if (email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json_({ ok: false, error: 'invalid email' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet_();
    const last = sheet.getLastRow();
    const existing = last > 1 ? sheet.getRange(2, 2, last - 1, 1).getValues().map(r => String(r[0]).toLowerCase()) : [];
    if (existing.indexOf(email) === -1) {
      sheet.appendRow([new Date(), safe_(email), safe_(p.source, 40), safe_(p.page, 200), safe_(p.port, 40)]);
    }
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

// Opening the /exec URL in a browser shows this — handy to check the deployment works.
function doGet() {
  return json_({ ok: true, service: 'ArabTides signups', rows: Math.max(0, getSheet_().getLastRow() - 1) });
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  return sheet;
}

// Stop values like "=HYPERLINK(...)" from being treated as formulas; cap length.
function safe_(v, max) {
  let s = String(v || '').slice(0, max || 200);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
